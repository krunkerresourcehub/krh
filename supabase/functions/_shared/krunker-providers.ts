// =========================================================
// Krunker provider architecture
// =========================================================
// KRH normalizes everything from third-party Krunker sources into
// these KRH-owned shapes before it ever reaches the frontend, so the
// UI never depends on a specific upstream response format and a
// provider can be swapped later without touching account-settings.html
// or profile.html.
//
// See README_KRUNKER_INTEGRATION.md at the repo root for the actual
// research notes (what was checked, what each source in the task
// brief does/doesn't support, and why). Summary relevant to the code
// below:
//
//  - There is no official Krunker OAuth / account-linking API.
//  - Krunker Social (https://krunker.io/social.html) is driven by a
//    WebSocket protocol (wss://social.krunker.io/ws, msgpack-encoded),
//    reverse-engineered by the community — not an official/stable
//    HTTP API. It requires spoofing an `Origin: https://krunker.io`
//    handshake header (impossible from a browser; possible from a
//    trusted backend) and gates many actions behind hCaptcha/reCaptcha.
//  - The only documented request shape for that socket is
//    `["r","profile",<username>,null]`, which the gist says returns
//    profile + map + mod data for that username — it is NOT a way to
//    search or fetch a specific Social Feed *post*, or to look up
//    posts by author/content. No source found exposes stable
//    per-post ids/URLs, a public feed-read API, or a way to confirm
//    a specific post's true author independent of what the client
//    claims.
//  - Every "krunker-api"-style npm/Go package found is an unofficial,
//    community-maintained wrapper with no changelog confirming it is
//    current, and none could be executed from this environment (no
//    network egress to krunker.io is available where this code was
//    written — see the implementation report).
//
// Net effect: automatic Social Feed ownership verification cannot be
// implemented honestly right now (see KrunkerSocialFeedProvider
// below), and the profile/maps/mods provider is shipped disabled by
// default and clearly marked EXPERIMENTAL/UNVERIFIED — per the brief,
// an honest "unsupported" beats a fabricated integration.

export type DataStatus = "available" | "unavailable" | "unsupported" | "temporarily_failed" | "stale";

export interface KrunkerProfileLookup {
  found: boolean;
  krunkerUserId: string | null; // stable id, if the provider ever exposes one
  displayUsername: string | null;
}

export interface KrunkerProfileProvider {
  readonly name: string;
  /** Cheap existence/format check used before issuing a verification challenge. */
  lookupProfile(username: string): Promise<KrunkerProfileLookup>;
}

export interface NormalizedStats {
  level?: number;
  experience?: number;
  score?: number;
  kills?: number;
  deaths?: number;
  kd?: number; // only ever computed when kills AND deaths are both present; deaths === 0 => kd = kills (documented, not divide-by-zero)
  wins?: number;
  losses?: number;
  winRate?: number; // wins / (wins + losses), only when both present and > 0 total
  playtimeSeconds?: number;
}

export interface KrunkerStatsProvider {
  readonly name: string;
  getStats(username: string, krunkerUserId: string | null): Promise<{ status: DataStatus; stats: NormalizedStats | null }>;
}

export interface NormalizedMap {
  id: string;
  name: string;
  author: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sourceUrl: string | null;
}

export interface KrunkerMapsProvider {
  readonly name: string;
  getMapsCreatedBy(username: string, krunkerUserId: string | null): Promise<{ status: DataStatus; maps: NormalizedMap[] }>;
}

export interface NormalizedMod {
  id: string;
  name: string;
  author: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sourceUrl: string | null;
}

export interface KrunkerModsProvider {
  readonly name: string;
  getModsCreatedBy(username: string, krunkerUserId: string | null): Promise<{ status: DataStatus; mods: NormalizedMod[] }>;
}

// Candidate post found on `authorUsername`'s Social Feed whose text
// matches the `KRH-VERIFY-XXXXXXXX` pattern. Note this returns the
// RAW candidate token text (read back off the public post itself,
// not something the client supplied) — the caller hashes it and
// compares against the stored token_hash with a constant-time
// comparison. This is deliberate: it lets KRH avoid ever storing the
// raw verification token after issuance (see the DB migration note),
// while still allowing an automatic provider to do content matching,
// since the provider only ever reads candidates back from Krunker's
// own public post content, never from anything the client asserts.
export interface SocialFeedPostCandidate {
  authorUsername: string;
  candidateToken: string;
  postId: string | null;
}

export type SocialFeedScanResult =
  | { outcome: "scanned"; candidates: SocialFeedPostCandidate[] }
  | { outcome: "unsupported"; reason: string }; // provider cannot perform this check at all

export interface KrunkerSocialFeedProvider {
  readonly name: string;
  readonly supportsAutomaticVerification: boolean;
  /**
   * Scans `username`'s public Social Feed for posts that look like a
   * verification code, returning each candidate's raw text and
   * confirmed author. Must NEVER fabricate a candidate or trust
   * anything other than what the public feed itself returned.
   */
  scanForVerificationCandidates(username: string): Promise<SocialFeedScanResult>;
}

// ---------------------------------------------------------
// Honest default: no automatic Social Feed reader.
// ---------------------------------------------------------
// Per the research above, there is no reliable, safe way today for
// this backend to read a specific user's Social Feed and confirm
// post authorship. Rather than fabricate a check (or worse, trust a
// client-submitted "yes I posted it"), this provider always reports
// itself as unsupported, and verify-krunker-account/index.ts leaves
// the connection in "pending" and tells the user honestly why.
//
// A future provider could satisfy this interface without any change
// to verify-krunker-account beyond swapping which provider is
// constructed — but only if it reads Krunker Social through a
// mechanism Krunker actually intends to be read that way (an
// official API, or documented public behavior it doesn't gate behind
// origin/captcha checks). Getting past those checks isn't something
// this codebase should do to itself just to make this feature
// automatic; "verification stays pending" is the correct fallback,
// not a problem to engineer around.
export class UnavailableSocialFeedProvider implements KrunkerSocialFeedProvider {
  readonly name = "unavailable-social-feed";
  readonly supportsAutomaticVerification = false;

  async scanForVerificationCandidates(_username: string): Promise<SocialFeedScanResult> {
    return {
      outcome: "unsupported",
      reason:
        "Krunker Social Feed has no documented public read API or per-post URL. Automatic verification is not implemented; a maintainer must confirm a safe access method before enabling this.",
    };
  }
}

// ---------------------------------------------------------
// Experimental / disabled-by-default profile lookup
// (KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL=1 to attempt it).
// ---------------------------------------------------------
// UNVERIFIED and intentionally incomplete. Based solely on the
// community documentation cited above; never executed against the
// real krunker.io backend from this environment.
//
// `encodePacket()` below is left unimplemented (throws) on purpose,
// not as a TODO. Deno's standard `WebSocket` can't set the `Origin`
// handshake header the protocol doc says Krunker's server checks, so
// making this "work" would mean deliberately getting around that
// check (e.g. proxying through something that can forge it) and
// working around whatever captcha gate sits in front of it. This
// file stops short of that. If Krunker ever ships an official,
// intentionally-public way to read this data, swap it in here — this
// class should stay disabled and unfinished until then, not be
// completed by defeating access controls that aren't meant for a
// third-party backend to get past.
export class ExperimentalWebSocketProfileProvider
  implements KrunkerProfileProvider, KrunkerStatsProvider, KrunkerMapsProvider, KrunkerModsProvider
{
  readonly name = "experimental-ws-profile";

  private async fetchRaw(username: string): Promise<Record<string, unknown> | null> {
    const enabled = Deno.env.get("KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL") === "1";
    if (!enabled) return null;

    // @ts-ignore - dynamic import kept optional so normal (non-experimental) cold starts don't pay for it
    const { decode } = await import("https://esm.sh/@msgpack/msgpack@2.8.0");

    return await new Promise((resolve) => {
      let settled = false;
      const done = (val: Record<string, unknown> | null) => {
        if (settled) return;
        settled = true;
        resolve(val);
      };

      let ws: WebSocket;
      try {
        ws = new WebSocket("wss://social.krunker.io/ws");
      } catch {
        done(null);
        return;
      }

      const timeout = setTimeout(() => {
        try { ws.close(); } catch { /* noop */ }
        done(null);
      }, 8000);

      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        try {
          ws.send(encodePacket(["r", "profile", username, null]));
        } catch {
          clearTimeout(timeout);
          done(null);
        }
      };
      ws.onmessage = (ev) => {
        try {
          const packet = decode(new Uint8Array(ev.data as ArrayBuffer)) as unknown[];
          if (Array.isArray(packet) && packet[1] === "profile") {
            clearTimeout(timeout);
            ws.close();
            done({ profile: packet[3], maps: packet[4], mods: packet[5] });
          }
        } catch {
          // ignore malformed/irrelevant packets (e.g. ["pi"] pings)
        }
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        done(null);
      };
      ws.onclose = () => {
        clearTimeout(timeout);
        done(null);
      };
    });
  }

  async lookupProfile(username: string): Promise<KrunkerProfileLookup> {
    const raw = await this.fetchRaw(username);
    if (!raw || !raw.profile) return { found: false, krunkerUserId: null, displayUsername: null };
    const p = raw.profile as Record<string, unknown>;
    return {
      found: true,
      krunkerUserId: typeof p.id === "string" ? p.id : null,
      displayUsername: typeof p.username === "string" ? p.username : username,
    };
  }

  async getStats(username: string): Promise<{ status: DataStatus; stats: NormalizedStats | null }> {
    const raw = await this.fetchRaw(username);
    if (!raw || !raw.profile) return { status: "unsupported", stats: null };
    const p = raw.profile as Record<string, unknown>;
    const kills = typeof p.kills === "number" ? p.kills : undefined;
    const deaths = typeof p.deaths === "number" ? p.deaths : undefined;
    const wins = typeof p.wins === "number" ? p.wins : undefined;
    const losses = typeof p.losses === "number" ? p.losses : undefined;
    const stats: NormalizedStats = {
      level: typeof p.level === "number" ? p.level : undefined,
      experience: typeof p.exp === "number" ? p.exp : undefined,
      score: typeof p.score === "number" ? p.score : undefined,
      kills,
      deaths,
      // Documented definition: kills / deaths, except deaths === 0 uses
      // kills as-is (avoids a divide-by-zero, matches common FPS-site convention).
      kd: kills !== undefined && deaths !== undefined ? (deaths === 0 ? kills : Math.round((kills / deaths) * 100) / 100) : undefined,
      wins,
      losses,
      winRate: wins !== undefined && losses !== undefined && wins + losses > 0 ? Math.round((wins / (wins + losses)) * 1000) / 10 : undefined,
      playtimeSeconds: typeof p.playTime === "number" ? p.playTime : undefined,
    };
    return { status: "available", stats };
  }

  async getMapsCreatedBy(): Promise<{ status: DataStatus; maps: NormalizedMap[] }> {
    // The gist documents a "map-data" field in the profile response
    // but does not describe its shape or confirm it distinguishes
    // maps the player AUTHORED from maps they merely played/favorited.
    // Per the brief ("do not label maps as user-created without
    // evidence of authorship"), this stays unsupported until that
    // shape is actually confirmed against a live response.
    return { status: "unsupported", maps: [] };
  }

  async getModsCreatedBy(): Promise<{ status: DataStatus; mods: NormalizedMod[] }> {
    // Same reasoning as getMapsCreatedBy() above, for "mod-data".
    return { status: "unsupported", mods: [] };
  }
}

function encodePacket(_value: unknown): ArrayBuffer {
  // Placeholder — wire up `@msgpack/msgpack`'s `encode()` alongside
  // the `decode()` import above once this provider is actually being
  // tested against krunker.io. Left unimplemented (throws) so this
  // experimental path fails loudly/safely instead of silently
  // sending malformed packets.
  throw new Error("encodePacket() not implemented — see ExperimentalWebSocketProfileProvider comment");
}

// ---------------------------------------------------------
// Provider selection
// ---------------------------------------------------------
export function getSocialFeedProvider(): KrunkerSocialFeedProvider {
  return new UnavailableSocialFeedProvider();
}

export function getProfileProviders(): {
  profile: KrunkerProfileProvider;
  stats: KrunkerStatsProvider;
  maps: KrunkerMapsProvider;
  mods: KrunkerModsProvider;
} {
  const p = new ExperimentalWebSocketProfileProvider();
  return { profile: p, stats: p, maps: p, mods: p };
}
