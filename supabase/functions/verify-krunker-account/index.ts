// POST /verify-krunker-account
// Body: {} (uses the caller's own pending challenge — nothing else
//           is trusted from the client; a submitted token/username/
//           post URL would not prove anything, since the client
//           could just type whatever it wants)
// Auth: required
//
// Attempts to verify Social Feed ownership. Honest by design: if no
// provider can actually confirm authorship (see
// _shared/krunker-providers.ts), this returns a "pending" result and
// says so, rather than ever marking a connection verified on
// unverifiable grounds.
import { requireAuthedUser, sha256Hex, constantTimeEqual, normalizeUsername } from "../_shared/auth.ts";
import { errorResponse, handlePreflight, jsonResponse } from "../_shared/http.ts";
import { getSocialFeedProvider } from "../_shared/krunker-providers.ts";

// Optional automated check: asks a GitHub Actions workflow (running a
// real headless browser against the *public* profile page — no
// private-protocol access, no spoofing, no captcha bypass) to look
// for the code and report back to krunker-verification-callback.
// Requires KRUNKER_GH_TOKEN / KRUNKER_GH_REPO / KRUNKER_CALLBACK_SECRET
// function secrets; if any are missing this safely falls back to the
// honest "not available" pending message below.
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

  // We only ever compare against OUR record of the token (via its
  // hash) and the username tied to THIS user's own pending challenge
  // — never anything the client sends in this request body, which is
  // why the endpoint intentionally ignores the request body entirely.
  const provider = getSocialFeedProvider();
  if (!provider.supportsAutomaticVerification) {
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
        message: "Checking your Krunker Social Feed now — this can take up to a minute. Refresh this page or click Verify Account again shortly.",
      });
    }

    // Fallback: automated checking isn't configured (or GitHub's API
    // call failed) — stay honest about that instead of pretending
    // nothing happened.
    return jsonResponse(req, {
      status: "pending",
      automatic: false,
      message:
        "Automatic Social Feed verification isn't available yet — Krunker doesn't expose a reliable, safe way for KRH to read a specific account's Social Feed posts right now. Your connection stays pending; this will start working automatically once a safe verification method is added, with no extra steps needed from you.",
    });
  }

  // (Unreachable with the current default provider, kept for when a
  // real provider is plugged in.) The provider only ever gives us
  // back RAW candidate text it read off the public feed itself, plus
  // the confirmed author of that specific post — never anything the
  // client asserted. We do the token match here, ourselves, by
  // hashing each candidate and comparing against the stored
  // token_hash in constant time, so the raw token never has to be
  // stored anywhere after it was first issued.
  const scan = await provider.scanForVerificationCandidates(challenge.requested_username_normalized);

  if (scan.outcome === "unsupported") {
    return jsonResponse(req, { status: "pending", automatic: false, message: scan.reason });
  }

  let matchedByWrongAuthor = false;
  for (const candidate of scan.candidates) {
    const candidateHash = await sha256Hex(candidate.candidateToken);
    if (!constantTimeEqual(candidateHash, challenge.token_hash)) continue;
    if (normalizeUsername(candidate.authorUsername) !== challenge.requested_username_normalized) {
      matchedByWrongAuthor = true;
      continue;
    }

    await supabase
      .from("krunker_connections")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        connected_at: new Date().toISOString(),
      })
      .eq("id", challenge.connection_id);
    await supabase.from("krunker_verification_challenges").update({ status: "used", used_at: new Date().toISOString() }).eq("id", challenge.id);
    return jsonResponse(req, { status: "verified", automatic: true });
  }

  if (matchedByWrongAuthor) {
    return errorResponse(req, 403, "author_mismatch", "That code was posted by a different Krunker account than the one you're connecting.");
  }
  return jsonResponse(req, {
    status: "pending",
    automatic: true,
    message: "We couldn't find that code on the account's Social Feed yet. Make sure it's posted and public, then try again.",
  });
});
