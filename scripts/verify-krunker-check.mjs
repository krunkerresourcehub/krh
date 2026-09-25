// Runs inside GitHub Actions (see .github/workflows/verify-krunker.yml).
// Opens a real headless Chrome, navigates to the target Krunker
// account's PUBLIC Social Feed page, and looks for a post matching
// the KRH-VERIFY-XXXXXXXXXXXXXXXX code pattern whose SHA-256 hash
// matches the one stored for this challenge. Reports the outcome
// back to krunker-verification-callback.
//
// Profile URL confirmed against the live site:
// https://krunker.io/social.html?p=profile&q=<username>
// That page is a client-rendered SPA with tabs (About / Feed /
// Listings / Badges / Creations / Reports) — the tab that defaults
// to open is NOT confirmed to be "Feed", so this script explicitly
// clicks the "Feed" tab by its visible text before scanning the
// page. If Krunker ever renames that tab or the click stops working,
// check the uploaded `krunker-debug-*` screenshot artifact on a
// failed/negative run first — it shows exactly what was on screen —
// then adjust clickTabByText()'s label or PROFILE_URL_TEMPLATE below.

import puppeteer from "puppeteer";

const PROFILE_URL_TEMPLATE = "https://krunker.io/social.html?p=profile&q={username}";

// Best-effort: click a leaf element whose visible text is an exact
// match (e.g. the "Feed" tab). Returns true if something was clicked.
// Never throws — a missed click just means we scan whatever tab was
// already showing, which degrades gracefully instead of crashing the
// whole check.
async function clickTabByText(page, label) {
  try {
    return await page.evaluate((wantedText) => {
      const all = Array.from(document.querySelectorAll("body *"));
      const leaf = all.find(
        (el) => el.children.length === 0 && el.textContent && el.textContent.trim() === wantedText,
      );
      if (!leaf) return false;
      leaf.click();
      if (leaf.parentElement) leaf.parentElement.click();
      return true;
    }, label);
  } catch {
    return false;
  }
}

const {
  KRUNKER_USERNAME,
  TOKEN_HASH,
  CHALLENGE_ID,
  CONNECTION_ID,
  CALLBACK_URL,
  CALLBACK_SECRET,
} = process.env;

const CODE_PATTERN = /KRH-VERIFY-[A-Z2-9]{16}/g;

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function callback(payload) {
  if (!CALLBACK_URL || !CALLBACK_SECRET) {
    console.error("CALLBACK_URL / CALLBACK_SECRET secrets are not set — cannot report result.");
    process.exitCode = 1;
    return;
  }
  const res = await fetch(CALLBACK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-krh-callback-secret": CALLBACK_SECRET,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("Callback failed:", res.status, await res.text().catch(() => ""));
    process.exitCode = 1;
  } else {
    console.log("Callback delivered:", payload.result);
  }
}

async function main() {
  if (!KRUNKER_USERNAME || !TOKEN_HASH || !CHALLENGE_ID || !CONNECTION_ID) {
    throw new Error("Missing one or more required client_payload fields from the dispatch.");
  }

  const url = PROFILE_URL_TEMPLATE.replace("{username}", encodeURIComponent(KRUNKER_USERNAME));
  let browser;
  let page;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    await page.goto(url, { waitUntil: "networkidle2" });

    // The page is a client-rendered SPA (stats show a literal
    // "LOADING" placeholder until its own WebSocket connection
    // responds) — give it a few seconds beyond "networkidle2" (which
    // only tracks HTTP, not that socket) before touching anything.
    await new Promise((r) => setTimeout(r, 4000));

    const clickedFeed = await clickTabByText(page, "Feed");
    console.log(clickedFeed ? "Clicked the Feed tab." : "Could not find a 'Feed' tab to click — scanning as-is.");
    await new Promise((r) => setTimeout(r, 4000));

    const bodyText = await page.evaluate(() => document.body.innerText);
    const candidates = [...new Set(bodyText.match(CODE_PATTERN) || [])];
    console.log(`Found ${candidates.length} candidate code(s) on the page.`);

    for (const candidate of candidates) {
      const hash = await sha256Hex(candidate);
      if (hash === TOKEN_HASH) {
        await callback({
          challenge_id: CHALLENGE_ID,
          connection_id: CONNECTION_ID,
          result: "verified",
          matched_candidate_hash: hash,
        });
        return;
      }
    }

    await callback({
      challenge_id: CHALLENGE_ID,
      connection_id: CONNECTION_ID,
      result: "not_found",
      candidates_seen: candidates.length,
    });
  } catch (err) {
    console.error(err);
    try {
      if (page) await page.screenshot({ path: "debug-screenshot.png", fullPage: true });
    } catch (screenshotErr) {
      console.error("Could not capture debug screenshot:", screenshotErr);
    }
    await callback({
      challenge_id: CHALLENGE_ID,
      connection_id: CONNECTION_ID,
      result: "error",
      error: String((err && err.message) || err),
    });
  } finally {
    if (browser) await browser.close();
  }
}

main().catch(async (err) => {
  console.error("Fatal error before callback could be sent:", err);
  process.exitCode = 1;
});
