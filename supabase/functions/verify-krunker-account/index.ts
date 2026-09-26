// POST /verify-krunker-account
// Body: {} (uses the caller's own pending challenge — nothing else
//           is trusted from the client; a submitted token/username/
//           post URL would not prove anything, since the client
//           could just type whatever it wants)
// Auth: required
//
// There used to be an automatic check here (a GitHub Actions job
// running a headless browser against the public profile page). That
// approach doesn't work: Krunker's Social Feed page serves a
// "SECURITY CHALLENGE / Protected by ALTCHA" anti-bot wall to any
// automated browser, so the check could never see real content —
// and trying to defeat that wall isn't something KRH should be doing
// to a third-party site. So this endpoint no longer tries to check
// anything itself. Instead it just flags the challenge as
// "review requested" so it shows up in the admin panel
// (community/admin.html) for a human admin/developer to check the
// user's public Social Feed themselves and approve or reject via
// supabase/functions/admin-review-krunker-verification.
import { requireAuthedUser } from "../_shared/auth.ts";
import { errorResponse, handlePreflight, jsonResponse } from "../_shared/http.ts";

// Every time review is (re-)requested, push expires_at out by this
// much from *now* — so a code realistically never expires while
// sitting in the admin review queue, no matter how long that takes,
// as long as the user has asked for review at least once recently.
// (The code still gets a generous base TTL on creation too — see
// CHALLENGE_TTL_MINUTES in create-krunker-verification — this just
// covers the case where review takes longer than that.)
const REVIEW_EXTENSION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

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

  // attempt_count here really means "times the user asked for review"
  // — kept as a loose anti-spam cap, separate from the 15-minute
  // code-generation rate limit enforced in the database (see
  // sql/add_krunker_connected_accounts.sql).
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
      // Only ever extend forward, never shorten (this update always
      // moves expires_at further out since REVIEW_EXTENSION_MS is
      // large relative to how often someone would realistically click
      // this, but the update is idempotent-safe either way).
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
