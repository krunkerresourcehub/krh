// POST /disconnect-krunker-account
// Body: {} — always disconnects the caller's own connection.
// Auth: required
import { requireAuthedUser } from "../_shared/auth.ts";
import { errorResponse, handlePreflight, jsonResponse } from "../_shared/http.ts";

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

  const { data: connection, error: connErr } = await supabase
    .from("krunker_connections")
    .select("id")
    .eq("krh_user_id", userId)
    .in("verification_status", ["pending", "verified"])
    .maybeSingle();

  if (connErr) {
    console.error("fetch connection failed", connErr);
    return errorResponse(req, 500, "internal_error", "Could not load your connected account.");
  }
  if (!connection) {
    return errorResponse(req, 404, "not_connected", "You don't have a Krunker account connected.");
  }

  // Ownership is enforced by the query above (krh_user_id = the
  // authenticated caller) — there is no id-based lookup path here,
  // so there's nothing for a client to forge to disconnect someone
  // else's connection.
  const { error: updateErr } = await supabase
    .from("krunker_connections")
    .update({ verification_status: "disconnected" })
    .eq("id", connection.id);
  if (updateErr) {
    console.error("disconnect update failed", updateErr);
    return errorResponse(req, 500, "internal_error", "Could not disconnect. Please try again.");
  }

  // Invalidate any pending verification challenges for this connection.
  await supabase
    .from("krunker_verification_challenges")
    .update({ status: "superseded" })
    .eq("connection_id", connection.id)
    .eq("status", "pending");

  // Cached profile data is removed on disconnect (KRH does not keep
  // synced third-party stats around for an account the user chose to
  // unlink) — the row cascades on delete of the connection's FK, but
  // we keep the connection row itself (status = disconnected) for
  // history/audit, so delete the cache explicitly instead.
  await supabase.from("krunker_profile_cache").delete().eq("connection_id", connection.id);

  return jsonResponse(req, { status: "disconnected" });
});
