import assert from "node:assert/strict";
import test from "node:test";
import { ARB } from "../src/v3-template/data/arbitrages";
import { getPendingBriefDecisions } from "../src/v3-template/lib/brief-bridge";
import { getLandingDetail, getSiteIntelligenceView, getTerritoryLandingView } from "../src/v3-template/lib/landing-bridge";
import { DEMO_STATE } from "../src/v3-template/lib/demo-state";

// etat-v5 checkpoint F.1 — clôture de la dette documentée en F : Brief
// ("Décisions attendues") et Atlas (activité de débarquement / détail
// site) ne doivent plus lire exclusivement une fixture figée ou
// l'instantané statique DEMO_STATE quand un état canonique explicite est
// transmis. Même doctrine, même fonction canonique
// (findLatestDecisionForSituation) déjà vérifiée par
// etat-v5-documents-presentation.test.ts et etat-v5-arbitrage-programmes.test.ts.

test("une décision déjà enregistrée disparaît des décisions attendues du Brief", () => {
  const pending = getPendingBriefDecisions(DEMO_STATE);
  // ARB[0] (sit-glace) a une décision réelle enregistrée dans DEMO_STATE
  // (dec-glace-1/dec-glace-2, src/data/demo-state.ts) : ne doit plus
  // apparaître comme attendue.
  assert.ok(!pending.some((d) => d.title === ARB[0].title), "un arbitrage déjà décidé ne doit plus être présenté comme attendu dans le Brief");
  // ARB[1] (sit-mbour, aucune décision dans DEMO_STATE) et ARB[2] (pas de
  // situationId, jamais décidable par ce mécanisme) restent attendus.
  assert.ok(pending.some((d) => d.title === ARB[1].title));
  assert.ok(pending.some((d) => d.title === ARB[2].title));
  assert.equal(pending.length, 2);
});

test("le Brief ne fabrique aucune décision attendue sans correspondance réelle", () => {
  const pending = getPendingBriefDecisions(DEMO_STATE);
  const realTitles = new Set(ARB.map((a) => a.title));
  // Chaque élément affiché correspond à un arbitrage réel — jamais une
  // fixture inventée (l'ancienne BRIEF_DEC comportait un 3e élément,
  // "Instruire le financement du volet froid Petite-Côte", sans aucune
  // correspondance ARB réelle : il ne doit plus pouvoir apparaître).
  assert.ok(pending.every((d) => realTitles.has(d.title)));
  assert.ok(!pending.some((d) => d.title === "Instruire le financement du volet froid Petite-Côte"));

  // Si tous les arbitrages rattachés à une Situation sont décidés, seul
  // l'arbitrage de portefeuille (sans situationId) reste honnêtement
  // affiché — jamais une liste vide comblée par une fixture.
  const allSituationalDecided = {
    ...DEMO_STATE,
    decisions: [
      ...DEMO_STATE.decisions,
      { id: "dec-test-mbour", situationId: "sit-mbour", type: "ouvrir_coordination" as const, rationale: "Test.", decidedByActorId: "act-coordinateur", decidedAt: new Date().toISOString() }
    ]
  };
  const pendingAfter = getPendingBriefDecisions(allSituationalDecided);
  assert.equal(pendingAfter.length, 1);
  assert.equal(pendingAfter[0].title, ARB[2].title);
});

test("getTerritoryLandingView(state) reflète l'état transmis, pas uniquement l'instantané DEMO_STATE", () => {
  const defaultView = getTerritoryLandingView("Joal-Fadiouth", DEMO_STATE);
  assert.ok(defaultView);
  assert.ok(defaultView!.activity.landingCount > 0, "le fixture DEMO_STATE doit porter au moins un débarquement réel à Joal pour que ce test soit probant");

  const withoutJoalLandings = { ...DEMO_STATE, landings: DEMO_STATE.landings.filter((l) => l.siteId !== "quai-joal") };
  const alteredView = getTerritoryLandingView("Joal-Fadiouth", withoutJoalLandings);
  assert.ok(alteredView);
  assert.equal(alteredView!.activity.landingCount, 0);
  assert.notEqual(alteredView!.activity.landingCount, defaultView!.activity.landingCount);

  // Repli DEMO_STATE inchangé quand aucun état explicite n'est transmis.
  assert.equal(getTerritoryLandingView("Joal-Fadiouth")!.activity.landingCount, defaultView!.activity.landingCount);
});

test("getLandingDetail(state) n'est plus figé sur DEMO_STATE", () => {
  assert.ok(getLandingDetail("landing-joal", DEMO_STATE), "landing-joal doit exister dans DEMO_STATE pour que ce test soit probant");

  const withoutJoalLandings = { ...DEMO_STATE, landings: DEMO_STATE.landings.filter((l) => l.id !== "landing-joal") };
  assert.equal(getLandingDetail("landing-joal", withoutJoalLandings), undefined);

  // Repli DEMO_STATE inchangé quand aucun état explicite n'est transmis.
  assert.ok(getLandingDetail("landing-joal"));
});

test("getSiteIntelligenceView(state) n'est plus figé sur DEMO_STATE", () => {
  const defaultView = getSiteIntelligenceView("quai-joal", DEMO_STATE);
  assert.ok(defaultView);
  assert.ok(defaultView!.infrastructures.length > 0, "le fixture DEMO_STATE doit porter au moins une infrastructure réelle au quai de Joal pour que ce test soit probant");

  const withoutJoalInfrastructures = { ...DEMO_STATE, infrastructures: DEMO_STATE.infrastructures.filter((i) => i.siteId !== "quai-joal") };
  const alteredView = getSiteIntelligenceView("quai-joal", withoutJoalInfrastructures);
  assert.ok(alteredView);
  assert.equal(alteredView!.infrastructures.length, 0);
  assert.notEqual(alteredView!.infrastructures.length, defaultView!.infrastructures.length);

  // Repli DEMO_STATE inchangé quand aucun état explicite n'est transmis.
  assert.equal(getSiteIntelligenceView("quai-joal")!.infrastructures.length, defaultView!.infrastructures.length);
});
