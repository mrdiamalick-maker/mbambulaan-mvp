import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getRoleLandingScreen, ROLES } from "../src/v3-template/data/roles";
import { isScreenKey } from "../src/v3-template/types";

const nextConfig = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const middleware = readFileSync(new URL("../src/middleware.ts", import.meta.url), "utf8");
const appEntry = readFileSync(new URL("../src/app/app/page.tsx", import.meta.url), "utf8");
const etatLayout = readFileSync(new URL("../src/app/etat/layout.tsx", import.meta.url), "utf8");
const privateV3Page = readFileSync(new URL("../src/app/private-v3/page.tsx", import.meta.url), "utf8");

test("/etat est la route privée canonique et /private-v3 devient un alias de migration", () => {
  assert.match(middleware, /"\/etat\/:path\*"/);
  assert.match(etatLayout, /currentSession\(\)/);
  assert.match(etatLayout, /session\.role !== "institution"/);
  assert.match(nextConfig, /source: "\/private-v3", destination: "\/etat"/);
  assert.match(privateV3Page, /redirect\("\/etat"\)/);
});

test("la connexion institutionnelle via /app aboutit au nouvel /etat", () => {
  assert.match(appEntry, /session\?\.role === "institution"\) redirect\("\/etat"\)/);
  assert.doesNotMatch(appEntry, /institution"\) redirect\("\/app\/etat"\)/);
});

test("les anciens deep links État sont redirigés vers leur écran V3 équivalent", () => {
  const expected = [
    ["/app/etat", "/etat"],
    ["/app/etat/territoires", "/etat?ecran=atlas"],
    ["/app/etat/situations", "/etat?ecran=situations"],
    ["/app/etat/arbitrages", "/etat?ecran=arbitrages"],
    ["/app/etat/programmes", "/etat?ecran=programmes"],
    ["/app/etat/rapport", "/etat?ecran=resultats"],
    ["/app/etat/redevabilite", "/etat?ecran=arbitrages"]
  ];

  for (const [source, destination] of expected) {
    assert.ok(nextConfig.includes(`source: "${source}", destination: "${destination}"`), `${source} doit rediriger vers ${destination}`);
  }
});

test("les deep links V3 n'acceptent que les huit écrans connus", () => {
  for (const screen of ["brief", "atlas", "situations", "arbitrages", "programmes", "resultats", "flux", "sources"]) {
    assert.equal(isScreenKey(screen), true, `${screen} doit être reconnu`);
  }
  assert.equal(isScreenKey("inconnu"), false);
  assert.equal(isScreenKey(undefined), false);
});

test("les trois perspectives institutionnelles et leurs priorités de navigation restent présentes", () => {
  assert.equal(getRoleLandingScreen("ministre"), "brief");
  assert.equal(getRoleLandingScreen("programme"), "programmes");
  assert.equal(getRoleLandingScreen("coordination"), "flux");
  assert.equal(ROLES.ministre.main[0], "brief");
});
