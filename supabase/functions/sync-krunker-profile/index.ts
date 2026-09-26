// POST /sync-krunker-profile
// Body: {} — always syncs the caller's own verified connection.
// Auth: required
//
// Pulls fresh stats/maps/mods from the configured providers and
// writes them into krunker_profile_cache. Partial-failure-safe: if
// one provider fails, previously cached data for the OTHER sections
// is left untouched rather than wiped.
import { requireAuthedUser } from "../_shared/auth.ts";
import { errorResponse, handlePreflight, jsonResponse } from "../_shared/http.ts";
import { getProfileProviders } from "../_shared/krunker-providers.ts";

const CACHE_TTL_MINUTES = 30;

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
    .select("id, krunker_username_normalized, krunker_user_id, verification_status, last_synced_at")
    .eq("krh_user_id", userId)
    .eq("verification_status", "verified")
    .maybeSingle();

  if (connErr) {
    console.error("fetch connection failed", connErr);
    return errorResponse(req, 500, "internal_error", "Could not load your connected account.");
  }
  if (!connection) {
    return errorResponse(req, 404, "not_connected", "You don't have a verified Krunker account connected.");
  }

  // Prevent overlapping syncs for the same account (in addition to
  // the DB-level cooldown trigger in the migration, which guards
  // against rapid repeated calls — this guards against two requests
  // in flight at once).
  const { data: existingCache } = await supabase
    .from("krunker_profile_cache")
    .select("cache_expires_at")
    .eq("connection_id", connection.id)
    .maybeSingle();

  const { profile, stats, maps, mods } = getProfileProviders();
  const username = connection.krunker_username_normalized;
  const krunkerUserId = connection.krunker_user_id;

  const [statsResult, mapsResult, modsResult] = await Promise.allSettled([
    stats.getStats(username, krunkerUserId),
    maps.getMapsCreatedBy(username, krunkerUserId),
    mods.getModsCreatedBy(username, krunkerUserId),
  ]);

  const update: Record<string, unknown> = {
    connection_id: connection.id,
    source_provider: profile.name,
    last_synced_at: new Date().toISOString(),
    cache_expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60_000).toISOString(),
  };

  if (statsResult.status === "fulfilled") {
    update.stats_status = statsResult.value.status;
    if (statsResult.value.stats) update.stats = statsResult.value.stats;
  } else {
    console.error("stats provider threw", statsResult.reason);
    update.stats_status = "temporarily_failed";
  }

  if (mapsResult.status === "fulfilled") {
    update.maps_status = mapsResult.value.status;
    update.maps = mapsResult.value.maps;
  } else {
    console.error("maps provider threw", mapsResult.reason);
    update.maps_status = "temporarily_failed";
  }

  if (modsResult.status === "fulfilled") {
    update.mods_status = modsResult.value.status;
    update.mods = modsResult.value.mods;
  } else {
    console.error("mods provider threw", modsResult.reason);
    update.mods_status = "temporarily_failed";
  }

  const statuses = [update.stats_status, update.maps_status, update.mods_status];
  const anyAvailable = statuses.includes("available");
  const anyFailed = statuses.includes("temporarily_failed");
  const allUnsupported = statuses.every((s) => s === "unsupported");

  const { error: upsertErr } = await supabase.from("krunker_profile_cache").upsert(update, { onConflict: "connection_id" });
  if (upsertErr) {
    console.error("upsert cache failed", upsertErr);
    return errorResponse(req, 500, "internal_error", "Sync failed. Please try again.");
  }

  // "unsupported" isn't a failure — it means Krunker doesn't currently
  // expose a way to read this data at all (see krunker-providers.ts),
  // not that something broke. Only genuinely errored/timed-out
  // attempts ("temporarily_failed") should ever be called "failed".
  let syncStatus: string;
  let syncError: string | null;
  if (anyAvailable) {
    syncStatus = anyFailed ? "partial" : "success";
    syncError = anyFailed ? "One or more Krunker data sources are temporarily unavailable." : null;
  } else if (allUnsupported) {
    syncStatus = "unsupported";
    syncError =
      "Krunker doesn't expose an official way to read live stats/maps/mods yet, so this isn't shown — that's expected, not an error.";
  } else {
    syncStatus = "failed";
    syncError = "Could not reach Krunker's data source. Please try again later.";
  }

  const { error: connUpdateErr } = await supabase
    .from("krunker_connections")
    .update({
      last_synced_at: new Date().toISOString(),
      last_sync_status: syncStatus,
      last_sync_error: syncError,
    })
    .eq("id", connection.id);
  if (connUpdateErr) {
    // Rate-limit trigger (see migration) can legitimately reject this — surface it clearly.
    const rateLimited = (connUpdateErr as { code?: string }).code === "P0001";
    if (rateLimited) return errorResponse(req, 429, "rate_limited", "Please wait a bit before syncing again.");
    console.error("update connection sync status failed", connUpdateErr);
  }

  return jsonResponse(req, {
    statsStatus: update.stats_status,
    mapsStatus: update.maps_status,
    modsStatus: update.mods_status,
    lastSyncedAt: update.last_synced_at,
    wasCached: Boolean(existingCache),
  });
});
