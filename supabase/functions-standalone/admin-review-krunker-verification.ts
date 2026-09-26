// POST /admin-review-krunker-verification
// Body: { connection_id: string, action: "approve" | "reject", note?: string }
// Auth: required, caller must have profiles.role in ('admin','developer')
//
// STANDALONE BUILD — paste this whole file into the Supabase
// dashboard's "Deploy a new function" editor as-is (no _shared/
// folder needed). Source of truth is
// supabase/functions/admin-review-krunker-verification/index.ts.
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

  const { data: reviewer, error: reviewerErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (reviewerErr) {
    console.error("fetch reviewer role failed", reviewerErr);
    return errorResponse(req, 500, "internal_error", "Could not check your permissions.");
  }
  if (!reviewer || !["admin", "developer"].includes(reviewer.role)) {
    return errorResponse(req, 403, "forbidden", "Admin/developer access required.");
  }

  let body: { connection_id?: string; action?: string; note?: string } = {};
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 400, "invalid_body", "Expected a JSON body.");
  }
  const connectionId = typeof body.connection_id === "string" ? body.connection_id : "";
  const action = body.action;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;
  if (!connectionId) return errorResponse(req, 400, "missing_connection_id", "connection_id is required.");
  if (action !== "approve" && action !== "reject") {
    return errorResponse(req, 400, "invalid_action", "action must be \"approve\" or \"reject\".");
  }

  const { data: connection, error: connErr } = await supabase
    .from("krunker_connections")
    .select("id, krh_user_id, krunker_username, krunker_username_normalized, verification_status")
    .eq("id", connectionId)
    .maybeSingle();
  if (connErr) {
    console.error("fetch connection failed", connErr);
    return errorResponse(req, 500, "internal_error", "Could not load that connection.");
  }
  if (!connection) return errorResponse(req, 404, "not_found", "Connection not found.");
  if (connection.verification_status !== "pending") {
    return errorResponse(req, 409, "not_pending", `This connection is already "${connection.verification_status}", not pending.`);
  }

  const { data: challenge } = await supabase
    .from("krunker_verification_challenges")
    .select("id")
    .eq("connection_id", connectionId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (action === "approve") {
    const { error: updateErr } = await supabase
      .from("krunker_connections")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        connected_at: new Date().toISOString(),
        verification_note: null,
      })
      .eq("id", connectionId);
    if (updateErr) {
      const isConflict = (updateErr as { code?: string }).code === "23505";
      console.error("approve update failed", updateErr);
      return errorResponse(
        req,
        isConflict ? 409 : 500,
        isConflict ? "username_already_verified" : "internal_error",
        isConflict
          ? "Another KRH account already has this exact Krunker username verified. Reject this one instead."
          : "Could not approve this connection.",
      );
    }
    if (challenge) {
      await supabase
        .from("krunker_verification_challenges")
        .update({ status: "used", used_at: new Date().toISOString() })
        .eq("id", challenge.id);
    }
    const { error: notifErr } = await supabase.from("notifications").insert({
      user_id: connection.krh_user_id,
      type: "krunker_verified",
      reason: `Your Krunker account "${connection.krunker_username}" has been verified!`,
    });
    if (notifErr) console.error("notify approve failed", notifErr);
    return jsonResponse(req, { status: "verified" });
  }

  const rejectReason = note || "Not approved yet — please check your posted code and try again.";
  const { error: rejectErr } = await supabase
    .from("krunker_connections")
    .update({ verification_note: rejectReason })
    .eq("id", connectionId);
  if (rejectErr) {
    console.error("reject update failed", rejectErr);
    return errorResponse(req, 500, "internal_error", "Could not reject this connection.");
  }
  if (challenge) {
    await supabase
      .from("krunker_verification_challenges")
      .update({ review_requested_at: null })
      .eq("id", challenge.id);
  }
  const { error: notifErr } = await supabase.from("notifications").insert({
    user_id: connection.krh_user_id,
    type: "krunker_rejected",
    reason: rejectReason,
  });
  if (notifErr) console.error("notify reject failed", notifErr);
  return jsonResponse(req, { status: "rejected" });
});
