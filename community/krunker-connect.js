// =========================================================
// Connect Krunker Account — shared frontend logic
// Used by account-settings.html (manage connection) and
// profile.html (read-only public display).
//
// This file expects `sb` (the Supabase client from
// supabase-client.js) to already be loaded on the page.
// =========================================================

// ---- Edge Function base URL ----
// Supabase Edge Functions live at <project-ref>.functions.supabase.co
// (or <SUPABASE_URL>/functions/v1/<name>). Derived from SUPABASE_URL
// so this doesn't need a second hardcoded project ref.
function _krunkerFnUrl(name) {
  return `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${name}`;
}

async function _callKrunkerFunction(name, body) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("Not logged in.");
  const res = await fetch(_krunkerFnUrl(name), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body || {}),
  });
  let json = null;
  try { json = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    const message = json && json.error && json.error.message ? json.error.message : `Request failed (${res.status}).`;
    const err = new Error(message);
    err.code = json && json.error && json.error.code;
    err.status = res.status;
    throw err;
  }
  return json;
}

async function krunkerCreateVerification(username) {
  return _callKrunkerFunction("create-krunker-verification", { username });
}
async function krunkerVerifyAccount() {
  return _callKrunkerFunction("verify-krunker-account", {});
}
async function krunkerSyncProfile() {
  return _callKrunkerFunction("sync-krunker-profile", {});
}
async function krunkerDisconnect() {
  return _callKrunkerFunction("disconnect-krunker-account", {});
}
// Admin/developer only — see supabase/functions/admin-review-krunker-verification.
async function krunkerAdminReview(connectionId, action, note) {
  return _callKrunkerFunction("admin-review-krunker-verification", { connection_id: connectionId, action, note });
}

// Fetches the current user's own connection row directly (RLS lets
// the owner read it) — used for rendering the settings page state
// without needing a round trip through an Edge Function.
async function getMyKrunkerConnection(userId) {
  const { data, error } = await sb
    .from("krunker_connections")
    .select("id, krunker_username, verification_status, verification_note, verified_at, connected_at, last_synced_at, last_sync_status, last_sync_error, show_on_public_profile")
    .eq("krh_user_id", userId)
    .in("verification_status", ["pending", "verified", "expired", "failed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

async function getMyPendingKrunkerChallenge(userId) {
  const { data, error } = await sb
    .from("krunker_verification_challenges")
    .select("id, requested_username, status, expires_at, attempt_count, review_requested_at, created_at")
    .eq("krh_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

// Admin/developer only — relies on the staff read policies added in
// sql/add_krunker_connected_accounts.sql (krunker_connections) and
// sql/add_krunker_manual_review.sql (krunker_verification_challenges).
// Returns pending connections joined with their most recent pending
// challenge and the KRH owner's profile info, for community/admin.html.
async function getPendingKrunkerReviews() {
  const { data: connections, error: connErr } = await sb
    .from("krunker_connections")
    .select("id, krh_user_id, krunker_username, verification_note, created_at, profiles!krunker_connections_krh_user_id_fkey(username,display_name,avatar_url)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });
  if (connErr) { console.error(connErr); return []; }
  if (!connections.length) return [];

  const { data: challenges, error: chErr } = await sb
    .from("krunker_verification_challenges")
    .select("id, connection_id, requested_username, expires_at, review_requested_at, created_at")
    .in("connection_id", connections.map((c) => c.id))
    .eq("status", "pending");
  if (chErr) console.error(chErr);

  return connections.map((c) => ({
    ...c,
    challenge: (challenges || []).find((ch) => ch.connection_id === c.id) || null,
  }));
}

// Public read — used on profile.html. Works for logged-out visitors
// too. Reads the krunker_connections_public VIEW, not the base table:
// the view bakes the safe column list into its definition, so there's
// no risk of a wider `select` here ever pulling in owner-only columns
// (last_sync_error, verification internals, etc.) — see
// sql/add_krunker_connected_accounts.sql.
async function getPublicKrunkerConnection(krhUserId) {
  const { data, error } = await sb
    .from("krunker_connections_public")
    .select("id, krunker_username, verified_at")
    .eq("krh_user_id", krhUserId)
    .eq("verification_status", "verified")
    .eq("show_on_public_profile", true)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

async function getPublicKrunkerProfileCache(connectionId) {
  const { data, error } = await sb
    .from("krunker_profile_cache")
    .select("stats, stats_status, maps, maps_status, mods, mods_status, last_synced_at")
    .eq("connection_id", connectionId)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

function krunkerCountdownText(expiresAtIso) {
  const ms = new Date(expiresAtIso).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  const s = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(s).padStart(2, "0")}`;
}

function krunkerDataStatusLabel(status) {
  switch (status) {
    case "available": return null; // render the data itself
    case "unavailable": return "Not available for this account.";
    case "unsupported": return "Not supported by Krunker's public data yet.";
    case "temporarily_failed": return "Temporarily unavailable — try syncing again later.";
    case "stale": return "Showing the last known data — a refresh is due.";
    default: return "Unknown.";
  }
}
