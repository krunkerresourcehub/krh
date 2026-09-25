// POST /krunker-verification-callback
// Called ONLY by the "Verify Krunker Account" GitHub Actions
// workflow (scripts/verify-krunker-check.mjs), after it has loaded a
// specific Krunker account's PUBLIC Social Feed page in a real
// headless browser and searched the visible page text for the
// verification code.
//
// This function does NOT use Supabase Auth / a user JWT — the caller
// is our own CI job, not a logged-in KRH user. It's authenticated
// with a shared secret header instead (KRUNKER_CALLBACK_SECRET).
//
// IMPORTANT DEPLOY STEP: when you create this function in the
// Supabase dashboard, turn OFF "Enforce JWT Verification" for it (or
// deploy with `--no-verify-jwt` via the CLI). Otherwise Supabase's
// gateway rejects GitHub's request with 401 before this code even
// runs, because there's no Supabase session token attached to it.
//
// Body: {
//   challenge_id: string,
//   connection_id: string,
//   result: "verified" | "not_found" | "error",
//   matched_candidate_hash?: string,  // required when result === "verified"
//   error?: string,                   // optional, when result === "error"
// }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Note: the actual SHA-256 hashing of candidate strings happens in
// the GitHub Actions script — this function only ever compares
// hashes, never raw tokens.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("KRUNKER_CALLBACK_SECRET");
  if (!secret) {
    console.error("KRUNKER_CALLBACK_SECRET not configured");
    return jsonResponse({ error: "server_misconfigured" }, 500);
  }
  const provided = req.headers.get("x-krh-callback-secret") || "";
  if (!provided || !constantTimeEqual(provided, secret)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return jsonResponse({ error: "server_misconfigured" }, 500);
  }
  const supabase = createClient(url, serviceKey);

  let body: {
    challenge_id?: string;
    connection_id?: string;
    result?: "verified" | "not_found" | "error";
    matched_candidate_hash?: string;
    candidates_seen?: number;
    error?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }
  if (!body.challenge_id) return jsonResponse({ error: "missing_challenge_id" }, 400);

  const { data: challenge, error: challengeErr } = await supabase
    .from("krunker_verification_challenges")
    .select("id, connection_id, token_hash, status, expires_at")
    .eq("id", body.challenge_id)
    .maybeSingle();

  if (challengeErr || !challenge) {
    return jsonResponse({ error: "challenge_not_found" }, 404);
  }
  if (challenge.status !== "pending") {
    // Already used/expired/superseded in the meantime (e.g. the user
    // generated a new code while the Actions run was still going) —
    // not an error, just nothing left to do.
    return jsonResponse({ status: "ignored", reason: `challenge_${challenge.status}` });
  }
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    await supabase.from("krunker_verification_challenges").update({ status: "expired" }).eq("id", challenge.id);
    return jsonResponse({ status: "ignored", reason: "challenge_expired" });
  }

  if (body.result === "verified" && body.matched_candidate_hash) {
    // Re-derive trust from the DB-stored hash, not just the CI job's
    // say-so — this is the actual security boundary, same as the
    // original in-process verification logic had.
    if (!constantTimeEqual(body.matched_candidate_hash, challenge.token_hash)) {
      console.error("callback claimed verified but hash mismatch for challenge", body.challenge_id);
      return jsonResponse({ error: "hash_mismatch" }, 400);
    }
    await supabase
      .from("krunker_connections")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        connected_at: new Date().toISOString(),
      })
      .eq("id", challenge.connection_id);
    await supabase
      .from("krunker_verification_challenges")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", challenge.id);
    return jsonResponse({ status: "recorded", outcome: "verified" });
  }

  // not_found / error — leave the connection pending (user can just
  // click Verify Account again), but leave a breadcrumb for support.
  await supabase
    .from("krunker_connections")
    .update({
      last_auto_check_at: new Date().toISOString(),
      last_auto_check_result:
        body.result === "error" ? `error: ${String(body.error ?? "unknown").slice(0, 200)}` : "not_found",
    })
    .eq("id", challenge.connection_id);

  return jsonResponse({ status: "recorded", outcome: body.result || "unknown" });
});
