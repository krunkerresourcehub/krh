// POST /sync-krunker-profile
// Body: {} — always syncs the caller's own verified connection.
// Auth: required
//
// STANDALONE BUILD — see the header comment in
// create-krunker-verification.ts. Source of truth is
// supabase/functions/sync-krunker-profile/index.ts.
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

// ---------- inlined from _shared/krunker-providers.ts ----------
// Stats/maps/mods providers are unconditionally "unsupported" here —
// same honest default as the full provider file
// (ExperimentalWebSocketProfileProvider is disabled unless
// KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL=1, and even then maps/mods
// stay unsupported because authorship semantics aren't confirmed).
// See README_KRUNKER_INTEGRATION.md.
const providerName = "unavailable-provider";
async function getStats(_username: string, _krunkerUserId: string | null) {
  return { status: "unsupported" as const, stats: null };
}
async function getMapsCreatedBy(_username: string, _krunkerUserId: string | null) {
  return { status: "unsupported" as const, maps: [] as unknown[] };
}
async function getModsCreatedBy(_username: string, _krunkerUserId: string | null) {
  return { status: "unsupported" as const, mods: [] as unknown[] };
}

// ---------------------------------------------------------

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

  const { data: existingCache } = await supabase
    .from("krunker_profile_cache")
    .select("cache_expires_at")
    .eq("connection_id", connection.id)
    .maybeSingle();

  const username = connection.krunker_username_normalized;
  const krunkerUserId = connection.krunker_user_id;

  const [statsResult, mapsResult, modsResult] = await Promise.allSettled([
    getStats(username, krunkerUserId),
    getMapsCreatedBy(username, krunkerUserId),
    getModsCreatedBy(username, krunkerUserId),
  ]);

  const update: Record<string, unknown> = {
    connection_id: connection.id,
    source_provider: providerName,
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
