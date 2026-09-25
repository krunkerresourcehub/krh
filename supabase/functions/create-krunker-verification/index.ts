// POST /create-krunker-verification
// Body: { username: string }
// Auth: required (Supabase session JWT)
//
// Starts (or restarts) the Connect Krunker Account flow: validates
// the requested username, generates a fresh verification token, and
// stores its hash + a pending krunker_connections row. Returns the
// raw token to the client ONCE — it is never stored or logged
// anywhere in plaintext after this response.
import {
  requireAuthedUser,
  sha256Hex,
  generateVerificationToken,
  normalizeUsername,
  isValidKrunkerUsername,
} from "../_shared/auth.ts";
import { errorResponse, handlePreflight, jsonResponse } from "../_shared/http.ts";
import { getProfileProviders } from "../_shared/krunker-providers.ts";

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
      "Enter a valid Krunker username (3-20 characters: letters, numbers, - or _)."
    );
  }
  const usernameNormalized = normalizeUsername(usernameRaw);

  // Cheap existence check where possible. This provider is disabled
  // by default (see _shared/krunker-providers.ts), in which case we
  // skip the check rather than block the whole flow on it — the
  // check is a UX nicety, not the security boundary (that's the
  // Social Feed verification step later).
  try {
    const { profile } = getProfileProviders();
    const lookup = await profile.lookupProfile(usernameNormalized);
    if (lookup.found === false && Deno.env.get("KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL") === "1") {
      return errorResponse(req, 404, "profile_not_found", "That Krunker username could not be found.");
    }
  } catch (e) {
    console.error("profile lookup failed (non-fatal)", e);
  }

  // Bail out early with a clear error if this user already has an
  // active (pending/verified) connection — the DB unique index would
  // catch this too, but this gives a much better error message.
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
      `You already have a verified Krunker account connected (${existing.krunker_username}). Disconnect it first.`
    );
  }

  // Is this Krunker account already verified to a DIFFERENT KRH user?
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
      "This Krunker account is already connected to another KRH account."
    );
  }

  const token = generateVerificationToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60_000).toISOString();

  // Supersede any previous pending challenges for this user so only
  // the newest one is usable ("Generate New Code" behavior).
  await supabase
    .from("krunker_verification_challenges")
    .update({ status: "superseded" })
    .eq("krh_user_id", userId)
    .eq("status", "pending");

  // Upsert the pending connection row (id stable across "Generate New
  // Code" clicks for the same connect attempt).
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
    // The DB-level rate limit trigger (see sql migration) surfaces here as P0001.
    const rateLimited = (challengeErr as { code?: string }).code === "P0001";
    console.error("insert challenge failed", challengeErr);
    return errorResponse(
      req,
      rateLimited ? 429 : 500,
      rateLimited ? "rate_limited" : "internal_error",
      rateLimited ? "Too many verification code requests. Please wait a few minutes and try again." : "Could not create a verification code."
    );
  }

  return jsonResponse(req, {
    token, // shown once — the UI must display/copy it now
    expiresAt,
    socialFeedUrl: "https://krunker.io/social.html",
    instructions:
      "Log in to the Krunker account you want to connect, then post this exact code on your Krunker Social Feed. Come back here and click Verify Account.",
  });
});
