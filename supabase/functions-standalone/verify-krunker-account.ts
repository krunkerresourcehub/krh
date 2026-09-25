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
// CHANGE FROM THE ORIGINAL VERSION: this used to always return an
// honest "automatic verification isn't available" pending message,
// because no safe way existed to read a Krunker account's Social
// Feed (see README_KRUNKER_INTEGRATION.md). This version adds one:
// it asks a GitHub Actions workflow (running a real headless
// browser against the *public* profile page — not Krunker's
// private WebSocket protocol, no Origin-spoofing, no captcha
// bypass) to look for the code and report back to
// krunker-verification-callback. If that isn't configured yet
// (secrets missing), it falls back to the old honest "pending"
// message instead of erroring.
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

// ---------- new: trigger the GitHub Actions check ----------
// Requires these Edge Function secrets:
//   KRUNKER_GH_TOKEN     — GitHub PAT (fine-grained, this repo only,
//                          "Contents: Read" + "Actions: Read and write")
//   KRUNKER_GH_REPO      — "owner/repo", e.g. "krunkerresourcehub/krh-main"
//   KRUNKER_CALLBACK_SECRET — random shared secret, ALSO set as a
//                          GitHub repo secret with the same value
// If any are missing, dispatch() returns { ok: false } and the
// handler below falls back to the honest "not available" message.
async function triggerGithubCheck(
  payload: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const token = Deno.env.get("KRUNKER_GH_TOKEN");
  const repo = Deno.env.get("KRUNKER_GH_REPO");
  if (!token || !repo) return { ok: false, reason: "not_configured" };

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ event_type: "krunker-verify", client_payload: payload }),
    });
    if (res.status === 204) return { ok: true };
    console.error("GitHub dispatch failed", res.status, await res.text());
    return { ok: false, reason: "dispatch_failed" };
  } catch (e) {
    console.error("GitHub dispatch error", e);
    return { ok: false, reason: "dispatch_error" };
  }
}

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
    .select(
      "id, connection_id, requested_username, requested_username_normalized, token_hash, status, expires_at, attempt_count, last_check_requested_at",
    )
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

  await supabase
    .from("krunker_verification_challenges")
    .update({ attempt_count: challenge.attempt_count + 1 })
    .eq("id", challenge.id);
  if (challenge.attempt_count >= 20) {
    return errorResponse(req, 429, "rate_limited", "Too many verification attempts. Please generate a new code.");
  }

  // Cooldown: don't fire off a new GitHub Actions run more than once
  // every 20 seconds for the same challenge (separate from the
  // attempt_count limit above, which is about total clicks over 15
  // minutes — this one is specifically about not queuing duplicate
  // runs while one is still in flight).
  const lastRequested = challenge.last_check_requested_at
    ? new Date(challenge.last_check_requested_at).getTime()
    : 0;
  if (Date.now() - lastRequested < 20_000) {
    return jsonResponse(req, {
      status: "checking",
      automatic: true,
      message: "Still checking your Social Feed from the last click — this can take up to a minute. Try again shortly.",
    });
  }

  const dispatch = await triggerGithubCheck({
    challenge_id: challenge.id,
    connection_id: challenge.connection_id,
    krunker_username: challenge.requested_username_normalized,
    token_hash: challenge.token_hash,
  });

  if (dispatch.ok) {
    await supabase
      .from("krunker_verification_challenges")
      .update({ last_check_requested_at: new Date().toISOString() })
      .eq("id", challenge.id);
    return jsonResponse(req, {
      status: "checking",
      automatic: true,
      message:
        "Checking your Krunker Social Feed now — this can take up to a minute. Refresh this page or click Verify Account again shortly.",
    });
  }

  // Fallback: automated checking isn't configured (or GitHub's API
  // call failed) — stay honest about that instead of pretending
  // nothing happened.
  return jsonResponse(req, {
    status: "pending",
    automatic: false,
    message:
      "Automatic Social Feed verification isn't available right now. Your connection stays pending — please try again in a bit.",
  });
});
