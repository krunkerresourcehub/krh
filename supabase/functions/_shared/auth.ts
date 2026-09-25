// Shared auth helper for the krunker-* Edge Functions.
//
// KRH's frontend authenticates with Supabase Auth (see
// community/supabase-client.js) and calls these functions with the
// user's session access token in the Authorization header. We NEVER
// trust a krh_user_id sent in the request body — the authenticated
// user id always comes from verifying that token against Supabase
// Auth first, on the server.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export interface AuthedContext {
  supabase: SupabaseClient; // service-role client, bypasses RLS — used only after we've verified the caller below
  userId: string;
}

export async function requireAuthedUser(req: Request): Promise<AuthedContext | null> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY function secrets");
  }

  // A short-lived client whose only job is to validate the caller's
  // JWT via Supabase Auth (does not use the service role for this part).
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? serviceKey;
  const authClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return null;

  // Separate client using the service role key for the actual DB
  // writes/reads that RLS deliberately does not expose to the client
  // (see sql/add_krunker_connected_accounts.sql). This key must only
  // ever live in the Edge Function's server-side environment.
  const supabase = createClient(url, serviceKey);

  return { supabase, userId: data.user.id };
}

export function sha256Hex(input: string): Promise<string> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)).then((buf) =>
    Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
  );
}

// Constant-time comparison for hash strings (equal length hex).
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function generateVerificationToken(): string {
  // 128 bits of entropy, base32-ish alphabet (uppercase + digits,
  // no ambiguous chars) so it's easy to read/type/copy.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `KRH-VERIFY-${out}`;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
export function isValidKrunkerUsername(username: string): boolean {
  return USERNAME_RE.test(username.trim());
}
