// Shared HTTP helpers for the krunker-* Edge Functions.
// Keep this dependency-free (no npm/esm imports) so it works the
// same way in every function without extra cold-start cost.

// KRH is a static site hosted on GitHub Pages (see README.md) —
// restrict CORS to the known KRH origins rather than "*", since
// these functions perform authenticated, security-sensitive writes.
const ALLOWED_ORIGINS = [
  "https://krunkerresourcehub.github.io",
  "https://krh.pages.dev", // adjust/remove to match the actual deployed domain(s)
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

export function errorResponse(req: Request, status: number, code: string, message: string): Response {
  // Sanitized on purpose — never forward raw upstream errors, stack
  // traces, or internal details to the client (see sql migration note
  // on last_sync_error, and the KRH-wide rule against logging secrets).
  return jsonResponse(req, { error: { code, message } }, status);
}

export function handlePreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  return null;
}
