// Judge-readiness QA capture: screenshots + contact sheet via system Chrome.
// Run with the production/dev server up on BASE. No ImageMagick needed — the
// contact sheet is composited by rendering an HTML grid in Chrome.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "screenshots");
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function autoScroll(page) {
  // Trigger framer-motion whileInView reveals, then return to top.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.85);
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
  });
  await sleep(500);
}

const desktopPages = [
  { name: "landing", path: "/", action: "scroll" },
  { name: "intake", path: "/intake", action: "loadDemo" },
  { name: "questions", path: "/questions", action: "useAnswers" },
  { name: "future-map", path: "/map", action: "settle" },
  { name: "research", path: "/research", action: "scroll" },
  { name: "branch-detail", path: "/branch/quant-signal", action: "scroll" },
  { name: "future-self-chat", path: "/chat/quant-signal", action: "chat" },
  { name: "decision-brief", path: "/brief", action: "scroll" },
  { name: "architecture", path: "/architecture", action: "scroll" },
];

const mobilePages = [
  { name: "mobile-landing", path: "/" },
  { name: "mobile-future-map", path: "/map" },
  { name: "mobile-decision-brief", path: "/brief" },
];

async function clickByText(page, re) {
  // Prefer an actual <button>/role=button so we don't click descriptive copy.
  try {
    await page.getByRole("button", { name: re }).first().click({ timeout: 4000 });
    return true;
  } catch {}
  try {
    await page.getByText(re).first().click({ timeout: 3000 });
    return true;
  } catch {}
  return false;
}

async function run() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];

  // ---- Desktop ----
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  for (const pg of desktopPages) {
    const page = await desktop.newPage();
    try {
      await page.goto(BASE + pg.path, { waitUntil: "networkidle", timeout: 30000 });
      await sleep(1100); // mount + entrance animations

      if (pg.action === "loadDemo") {
        await clickByText(page, /Load the Alex demo/i);
        await sleep(700);
      } else if (pg.action === "useAnswers") {
        await clickByText(page, /Use Alex'?s answers/i);
        await sleep(600);
      } else if (pg.action === "chat") {
        const resp = page
          .waitForResponse((r) => r.url().includes("/api/future-self-chat"), { timeout: 9000 })
          .catch(() => null);
        await clickByText(page, /What did you underestimate/i);
        await resp;
        await sleep(1200);
        await page.evaluate(() => window.scrollTo(0, 0));
      } else if (pg.action === "scroll") {
        await autoScroll(page);
      }

      await page.screenshot({ path: join(OUT, pg.name + ".png"), fullPage: true });
      results.push({ name: pg.name, ok: true });
      console.log("✓ " + pg.name);
    } catch (e) {
      results.push({ name: pg.name, ok: false, err: e.message.split("\n")[0] });
      console.log("✗ " + pg.name + " — " + e.message.split("\n")[0]);
    } finally {
      await page.close();
    }
  }
  await desktop.close();

  // ---- Mobile (iPhone 12-ish) ----
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  for (const pg of mobilePages) {
    const page = await mobile.newPage();
    try {
      await page.goto(BASE + pg.path, { waitUntil: "networkidle", timeout: 30000 });
      await sleep(1200);
      await autoScroll(page);
      await page.screenshot({ path: join(OUT, pg.name + ".png"), fullPage: true });
      results.push({ name: pg.name, ok: true });
      console.log("✓ " + pg.name);
    } catch (e) {
      results.push({ name: pg.name, ok: false, err: e.message.split("\n")[0] });
      console.log("✗ " + pg.name + " — " + e.message.split("\n")[0]);
    } finally {
      await page.close();
    }
  }
  await mobile.close();

  // ---- Contact sheet ----
  try {
    const desktopNames = desktopPages.map((p) => p.name);
    const mobileNames = mobilePages.map((p) => p.name);
    const card = (n, label) =>
      `<figure><div class="ph"><img src="screenshots/${n}.png"/></div><figcaption>${label}</figcaption></figure>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#05060c;color:#aeb6d6;font-family:ui-sans-serif,system-ui,sans-serif;padding:48px 40px}
      h1{color:#fff;font-size:30px;letter-spacing:-0.02em}
      .sub{color:#7b85a8;margin:8px 0 4px;font-size:15px}
      h2{color:#9aa6ff;font-size:13px;text-transform:uppercase;letter-spacing:.18em;margin:40px 0 18px}
      .grid{display:grid;gap:22px}
      .d{grid-template-columns:repeat(4,1fr)}
      .m{grid-template-columns:repeat(3,260px);justify-content:start}
      figure{border:1px solid #222845;border-radius:14px;overflow:hidden;background:#0e1120}
      .ph{height:230px;overflow:hidden;display:flex;align-items:flex-start;justify-content:center;background:#0a0c16}
      .m .ph{height:420px}
      img{width:100%;display:block;object-fit:cover;object-position:top}
      figcaption{padding:10px 12px;font-size:12px;color:#aeb6d6;border-top:1px solid #222845}
      .brand{color:#7c8cff;font-weight:600}
    </style></head><body>
      <h1>Forked&nbsp;<span class="brand">Futures</span> — Judge-Readiness Contact Sheet</h1>
      <div class="sub">USAII Global AI Hackathon 2026 · Challenge Brief 3 · full Alex demo (mock path, no API key)</div>
      <h2>Desktop flow</h2>
      <div class="grid d">${desktopNames.map((n, i) => card(n, `${i + 1}. ${n}`)).join("")}</div>
      <h2>Mobile flow</h2>
      <div class="grid m">${mobileNames.map((n) => card(n, n)).join("")}</div>
    </body></html>`;

    // Write to a real file so the document has a file:// origin and can load
    // the local screenshot images (headless Chrome blocks file:// from about:blank).
    const htmlPath = join(HERE, "_contact-sheet.html");
    writeFileSync(htmlPath, html);
    const ctx = await browser.newContext({ viewport: { width: 1680, height: 1000 }, deviceScaleFactor: 1.5 });
    const page = await ctx.newPage();
    await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
    await sleep(1000);
    await page.screenshot({ path: join(HERE, "contact-sheet.png"), fullPage: true });
    await ctx.close();
    console.log("✓ contact-sheet");
  } catch (e) {
    console.log("✗ contact-sheet — " + e.message.split("\n")[0]);
  }

  await browser.close();
  console.log("\nRESULT " + JSON.stringify(results));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
