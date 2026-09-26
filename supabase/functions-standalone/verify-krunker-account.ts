// POST /verify-krunker-account
// Body: {} (uses the caller's own pending challenge — nothing else
//           is trusted from the client)
// Auth: required
//
// STANDALONE BUILD — paste this whole file into the Supabase
// dashboard's "Deploy a new function" editor as-is (no _shared/
// folder needed). Source of truth is
// supabase/functions/verify-krunker-account/index.ts.
//
// CHANGE FROM THE PREVIOUS VERSION: this used to trigger a GitHub
// Actions job running a headless browser against the public profile
// page. That doesn't work — Krunker's Social Feed page serves a
// "SECURITY CHALLENGE / Protected by ALTCHA" anti-bot wall to any
// automated browser, so the check could never see real content, and
// trying to defeat that wall isn't something KRH should be doing to
// a third-party site. This version drops the automatic check
// entirely and just flags the challenge for a human KRH admin/
// developer to review in community/admin.html (see
// supabase/functions/admin-review-krunker-verification).
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ---------- inlined from _shared/auth.ts (only what's needed here) ----------
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

// ---------- inlined from _shared/http.ts ----------
const ALLOWED_ORIGINS = [
  "https://krunkerresourcehub.github.io",
  "https://krh.pages.dev",
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

// Every time review is (re-)requested, push expires_at out by this
// much from *now* — so a code realistically never expires while
// sitting in the admin review queue, no matter how long that takes.
const REVIEW_EXTENSION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// ---------------------------------------------------------

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

  const { data: challenge, error: challengeErr } = await supabase
    .from("krunker_verification_challenges")
    .select("id, connection_id, status, expires_at, attempt_count, review_requested_at")
    .eq("krh_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (challengeErr) {
    console.error("fetch challenge failed", challengeErr);
    return errorResponse(req, 500, "internal_error", "Could not check your verification request.");
  }
  if (!challenge) {
    return errorResponse(req, 404, "no_pending_challenge", "No pending verification found. Start a new connection first.");
  }
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    await supabase.from("krunker_verification_challenges").update({ status: "expired" }).eq("id", challenge.id);
    if (challenge.connection_id) {
      await supabase.from("krunker_connections").update({ verification_status: "expired" }).eq("id", challenge.connection_id);
    }
    return errorResponse(req, 410, "challenge_expired", "That verification code expired. Generate a new one.");
  }

  if (challenge.attempt_count >= 20) {
    return errorResponse(req, 429, "rate_limited", "Too many review requests on this code. Please generate a new code.");
  }

  const alreadyRequested = Boolean(challenge.review_requested_at);
  const newExpiresAt = new Date(Date.now() + REVIEW_EXTENSION_MS).toISOString();

  const { error: updateErr } = await supabase
    .from("krunker_verification_challenges")
    .update({
      attempt_count: challenge.attempt_count + 1,
      review_requested_at: new Date().toISOString(),
      expires_at: newExpiresAt,
    })
    .eq("id", challenge.id);
  if (updateErr) {
    console.error("flag review failed", updateErr);
    return errorResponse(req, 500, "internal_error", "Could not submit your review request. Please try again.");
  }

  return jsonResponse(req, {
    status: "pending_review",
    message: alreadyRequested
      ? "Still flagged for review — a KRH team member will check your Krunker Social Feed as soon as they can. No need to click again."
      : "Thanks! Your code is now flagged for a KRH team member to review. Make sure it's posted and public on your Krunker Social Feed — this page will show \"Verified\" once it's approved.",
  });
});
