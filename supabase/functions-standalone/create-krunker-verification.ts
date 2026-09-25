// POST /create-krunker-verification
// Body: { username: string }
// Auth: required (Supabase session JWT)
//
// Starts (or restarts) the Connect Krunker Account flow: validates
// the requested username, generates a fresh verification token, and
// stores its hash + a pending krunker_connections row. Returns the
// raw token to the client ONCE — it is never stored or logged
// anywhere in plaintext after this response.
//
// STANDALONE BUILD: this is create-krunker-verification/index.ts with
// _shared/auth.ts, _shared/http.ts and the one function it needs from
// _shared/krunker-providers.ts inlined, for pasting directly into the
// Supabase Dashboard's "Via Editor" function editor (which doesn't
// support a shared folder across functions). If you switch to the
// Supabase CLI later, use the original supabase/functions/ tree
// instead — it's the source of truth; this file is a generated copy.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ---------- inlined from _shared/auth.ts ----------
interface AuthedContext {
  supabase: SupabaseClient;
  userId: string;
}

async function requireAuthedUser(req: Request): Promise<AuthedContext | null> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY function secrets");
  }

  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? serviceKey;
  const authClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return null;

  const supabase = createClient(url, serviceKey);
  return { supabase, userId: data.user.id };
}

function sha256Hex(input: string): Promise<string> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)).then((buf) =>
    Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
  );
}

function generateVerificationToken(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `KRH-VERIFY-${out}`;
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
function isValidKrunkerUsername(username: string): boolean {
  return USERNAME_RE.test(username.trim());
}

// ---------- inlined from _shared/http.ts ----------
const ALLOWED_ORIGINS = [
  "https://krunkerresourcehub.github.io",
  "https://krh.pages.dev", // adjust/remove to match the actual deployed domain(s)
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function errorResponse(req: Request, status: number, code: string, message: string): Response {
  return jsonResponse(req, { error: { code, message } }, status);
}

function handlePreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  return null;
}

// ---------- inlined "cheap existence check" bit from _shared/krunker-providers.ts ----------
// Disabled unless KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL=1 (unset by
// default) — see the full provider file in supabase/functions/_shared/
// for why. Kept honest here: no fabricated lookups.
async function cheapUsernameLookup(_username: string): Promise<{ found: boolean }> {
  return { found: true }; // no verified provider to check against yet; never block on this
}

// ---------------------------------------------------------

const CHALLENGE_TTL_MINUTES = 15;

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return errorResponse(req, 405, "method_not_allowed", "Use POST.");

  let ctx;
  try {
    ctx = await requireAuthedUser(req);
  } catch (e) {
    console.error("auth setup error", e);
    return errorResponse(req, 500, "server_misconfigured", "Server is not configured correctly.");
  }
  if (!ctx) return errorResponse(req, 401, "unauthorized", "You must be logged in.");
  const { supabase, userId } = ctx;

  let body: { username?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 400, "invalid_body", "Expected a JSON body.");
  }

  const usernameRaw = typeof body.username === "string" ? body.username : "";
  if (!isValidKrunkerUsername(usernameRaw)) {
    return errorResponse(
      req,
      400,
      "invalid_username",
      "Enter a valid Krunker username (3-20 characters: letters, numbers, - or _).",
    );
  }
  const usernameNormalized = normalizeUsername(usernameRaw);

  try {
    await cheapUsernameLookup(usernameNormalized);
  } catch (e) {
    console.error("profile lookup failed (non-fatal)", e);
  }

  const { data: existing } = await supabase
    .from("krunker_connections")
    .select("id, verification_status, krunker_username")
    .eq("krh_user_id", userId)
    .in("verification_status", ["pending", "verified"])
    .maybeSingle();

  if (existing && existing.verification_status === "verified") {
    return errorResponse(
      req,
      409,
      "already_connected",
      `You already have a verified Krunker account connected (${existing.krunker_username}). Disconnect it first.`,
    );
  }

  const { data: conflictingOwner } = await supabase
    .from("krunker_connections")
    .select("id")
    .eq("krunker_username_normalized", usernameNormalized)
    .eq("verification_status", "verified")
    .neq("krh_user_id", userId)
    .maybeSingle();
  if (conflictingOwner) {
    return errorResponse(
      req,
      409,
      "account_already_linked",
      "This Krunker account is already connected to another KRH account.",
    );
  }

  const token = generateVerificationToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60_000).toISOString();

  await supabase
    .from("krunker_verification_challenges")
    .update({ status: "superseded" })
    .eq("krh_user_id", userId)
    .eq("status", "pending");

  let connectionId = existing?.id as string | undefined;
  if (connectionId) {
    await supabase
      .from("krunker_connections")
      .update({
        krunker_username: usernameRaw.trim(),
        krunker_username_normalized: usernameNormalized,
        verification_status: "pending",
      })
      .eq("id", connectionId);
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("krunker_connections")
      .insert({
        krh_user_id: userId,
        krunker_username: usernameRaw.trim(),
        krunker_username_normalized: usernameNormalized,
        verification_status: "pending",
      })
      .select("id")
      .single();
    if (insertErr || !inserted) {
      console.error("insert connection failed", insertErr);
      return errorResponse(req, 500, "internal_error", "Could not start the connection. Please try again.");
    }
    connectionId = inserted.id;
  }

  const { error: challengeErr } = await supabase.from("krunker_verification_challenges").insert({
    krh_user_id: userId,
    connection_id: connectionId,
    requested_username: usernameRaw.trim(),
    requested_username_normalized: usernameNormalized,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (challengeErr) {
    const rateLimited = (challengeErr as { code?: string }).code === "P0001";
    console.error("insert challenge failed", challengeErr);
    return errorResponse(
      req,
      rateLimited ? 429 : 500,
      rateLimited ? "rate_limited" : "internal_error",
      rateLimited
        ? "Too many verification code requests. Please wait a few minutes and try again."
        : "Could not create a verification code.",
    );
  }

  return jsonResponse(req, {
    token,
    expiresAt,
    socialFeedUrl: "https://krunker.io/social.html",
    instructions:
      "Log in to the Krunker account you want to connect, then post this exact code on your Krunker Social Feed. Come back here and click Verify Account.",
  });
});
