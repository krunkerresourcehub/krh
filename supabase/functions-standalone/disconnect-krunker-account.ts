// POST /disconnect-krunker-account
// Body: {} — always disconnects the caller's own connection.
// Auth: required
//
// STANDALONE BUILD — see the header comment in
// create-krunker-verification.ts. Source of truth is
// supabase/functions/disconnect-krunker-account/index.ts.
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

  const { error: updateErr } = await supabase
    .from("krunker_connections")
    .update({ verification_status: "disconnected" })
    .eq("id", connection.id);
  if (updateErr) {
    console.error("disconnect update failed", updateErr);
    return errorResponse(req, 500, "internal_error", "Could not disconnect. Please try again.");
  }

  await supabase
    .from("krunker_verification_challenges")
    .update({ status: "superseded" })
    .eq("connection_id", connection.id)
    .eq("status", "pending");

  await supabase.from("krunker_profile_cache").delete().eq("connection_id", connection.id);

  return jsonResponse(req, { status: "disconnected" });
});
