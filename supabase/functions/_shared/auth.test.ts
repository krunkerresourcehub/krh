// Run with: deno test --allow-env supabase/functions/_shared/
//
// Only covers the pure, network-free helpers in auth.ts
// (generateVerificationToken, sha256Hex, constantTimeEqual,
// normalizeUsername, isValidKrunkerUsername). requireAuthedUser()
// needs a live Supabase project and isn't exercised here — it's a
// thin wrapper around supabase-js's own auth.getUser(), the kind of
// thing worth covering with an integration test against a real (or
// locally emulated) Supabase instance instead of a unit test.
import {
  assert,
  assertEquals,
  assertFalse,
  assertMatch,
  assertNotEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  constantTimeEqual,
  generateVerificationToken,
  isValidKrunkerUsername,
  normalizeUsername,
  sha256Hex,
} from "./auth.ts";

Deno.test("generateVerificationToken - has the KRH-VERIFY- prefix and 16 unambiguous chars", () => {
  const token = generateVerificationToken();
  assertMatch(token, /^KRH-VERIFY-[A-Z2-9]{16}$/);
  // Alphabet excludes visually-ambiguous chars (0/O, 1/I/L) on purpose.
  assertFalse(/[01ILO]/.test(token.replace("KRH-VERIFY-", "")));
});

Deno.test("generateVerificationToken - is not reused across calls (entropy sanity check)", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 1000; i++) seen.add(generateVerificationToken());
  assertEquals(seen.size, 1000);
});

Deno.test("sha256Hex - matches a known vector and is deterministic", async () => {
  assertEquals(
    await sha256Hex(""),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
  const a = await sha256Hex("KRH-VERIFY-ABCD1234EFGH5678");
  const b = await sha256Hex("KRH-VERIFY-ABCD1234EFGH5678");
  assertEquals(a, b);
  assertEquals(a.length, 64); // hex-encoded SHA-256
});

Deno.test("sha256Hex - different input, different hash", async () => {
  const a = await sha256Hex("token-a");
  const b = await sha256Hex("token-b");
  assertNotEquals(a, b);
});

Deno.test("constantTimeEqual - equal strings", () => {
  assert(constantTimeEqual("abc123", "abc123"));
});

Deno.test("constantTimeEqual - different strings, same length", () => {
  assertFalse(constantTimeEqual("abc123", "abc124"));
});

Deno.test("constantTimeEqual - different lengths never match", () => {
  assertFalse(constantTimeEqual("abc", "abcd"));
});

Deno.test("normalizeUsername - trims and lowercases", () => {
  assertEquals(normalizeUsername("  SomePlayer  "), "someplayer");
});

Deno.test("isValidKrunkerUsername - accepts typical usernames", () => {
  assert(isValidKrunkerUsername("Player_One-99"));
  assert(isValidKrunkerUsername("abc")); // 3 chars, the floor
});

Deno.test("isValidKrunkerUsername - rejects too short, too long, and bad characters", () => {
  assertFalse(isValidKrunkerUsername("ab")); // below 3-char floor
  assertFalse(isValidKrunkerUsername("a".repeat(21))); // above 20-char ceiling
  assertFalse(isValidKrunkerUsername("has space"));
  assertFalse(isValidKrunkerUsername("<script>"));
});
