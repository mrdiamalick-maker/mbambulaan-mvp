import { chromium } from "playwright-core";

const base = "http://127.0.0.1:3477";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();

await page.goto(`${base}/connexion`);
await page.fill('input[type="email"]', "demo@mbambulaan.sn");
await page.fill('input[type="password"]', "demo-mbambulaan-2026");
await page.click('button:has-text("Ouvrir mon espace")');
await page.waitForURL(`${base}/app/travail`, { timeout: 15000 });
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/claude-0/-home-user-mbambulaan-mvp/ef4389ee-14d5-5d56-afbf-534add3d21ca/scratchpad/shell-desktop-travail.png" });

await page.goto(`${base}/app/administration`);
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/claude-0/-home-user-mbambulaan-mvp/ef4389ee-14d5-5d56-afbf-534add3d21ca/scratchpad/shell-desktop-admin.png" });

const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileCtx.newPage();
await mobilePage.goto(`${base}/connexion`);
await mobilePage.fill('input[type="email"]', "demo@mbambulaan.sn");
await mobilePage.fill('input[type="password"]', "demo-mbambulaan-2026");
await mobilePage.click('button:has-text("Ouvrir mon espace")');
await mobilePage.waitForURL(`${base}/app/travail`, { timeout: 15000 });
await mobilePage.waitForTimeout(500);
await mobilePage.screenshot({ path: "/tmp/claude-0/-home-user-mbambulaan-mvp/ef4389ee-14d5-5d56-afbf-534add3d21ca/scratchpad/shell-mobile-travail.png" });
await mobilePage.click('button[aria-label="Ouvrir la navigation"]');
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({ path: "/tmp/claude-0/-home-user-mbambulaan-mvp/ef4389ee-14d5-5d56-afbf-534add3d21ca/scratchpad/shell-mobile-nav.png" });

await browser.close();
console.log("done");
