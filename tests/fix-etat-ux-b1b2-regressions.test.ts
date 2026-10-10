import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { applyDemoProgramOpportunities } from "../src/data/demo-program-opportunities";
import { getOpportunityDetail } from "../src/v3-template/lib/opportunity-bridge";
import { getProgrammeFixtureIdForInitiative, PROGRAMME_ID_BY_TITLE } from "../src/v3-template/lib/programme-bridge";
import { PROGS } from "../src/v3-template/data/programmes";
import { ROLES } from "../src/v3-template/data/roles";

// fix/etat-ux-b1b2-regressions — tests ciblés pour empêcher le retour des
// deux régressions identifiées dans la revue de PR #88
// (codex/ux-r1-claude-design-integration, dadbf9f) :
//   A. navigation sidebar devenue identique pour les 3 rôles (annule
//      Architecture Recovery R1 sans le dire) ;
//   B. "Programme lié →" pose initiativeFocusId, lu uniquement par
//      Initiatives.tsx qui n'est plus routé — le clic n'ouvre jamais le
//      programme réel visé.

const sidebarSource = readFileSync(new URL("../src/v3-template/components/Sidebar.tsx", import.meta.url), "utf8");
const opportunitesSource = readFileSync(new URL("../src/v3-template/components/screens/Opportunites.tsx", import.meta.url), "utf8");
const opportunityPanelSource = readFileSync(new URL("../src/v3-template/components/OpportunityPanel.tsx", import.meta.url), "utf8");

function arbitrateAndRetain(state: ReturnType<typeof createDemoState>, opportunityId: string) {
  const qualifying = applyCommand(state, { type: "update_program_opportunity_status", programOpportunityId: opportunityId, actorId: "act-coordinateur", status: "qualifying" });
  const qualified = applyCommand(qualifying, { type: "update_program_opportunity_status", programOpportunityId: opportunityId, actorId: "act-coordinateur", status: "qualified" });
  const pending = applyCommand(qualified, { type: "update_program_opportunity_status", programOpportunityId: opportunityId, actorId: "act-coordinateur", status: "pending_arbitration" });
  return applyCommand(pending, { type: "arbitrate_program_opportunity", programOpportunityId: opportunityId, actorId: "act-ministre", outcome: "retenir", rationale: "Retenue après instruction complète." });
}

test("Correction A — Sidebar ne code plus en dur une navigation unique pour les 3 rôles", () => {
  assert.doesNotMatch(
    sidebarSource,
    /const PRIMARY_SCREENS/,
    "Sidebar.tsx ne doit plus définir une liste d'écrans primaires fixe, identique pour tous les rôles"
  );
  assert.doesNotMatch(
    sidebarSource,
    /const WORK_SCREENS/,
    "Sidebar.tsx ne doit plus définir une liste d'écrans secondaires fixe, identique pour tous les rôles"
  );
  assert.match(
    sidebarSource,
    /nav\(roleDef\.main\)/,
    "la navigation principale doit dériver de roleDef.main (ROLES, data/roles.ts)"
  );
  assert.match(
    sidebarSource,
    /nav\(roleDef\.sec\)/,
    "la navigation secondaire doit dériver de roleDef.sec (ROLES, data/roles.ts)"
  );
});

test("Correction A — chaque rôle garde une navigation différenciée (Architecture Recovery R1)", () => {
  // Non-régression sur la source de vérité elle-même : ROLES n'a pas été
  // touché par la PR, seul son usage dans Sidebar l'était. On vérifie que
  // les 3 rôles restent bien distincts, pour que le test précédent (qui ne
  // vérifie que le câblage) ait un sens.
  assert.notDeepEqual(ROLES.ministre.main, ROLES.programme.main);
  assert.notDeepEqual(ROLES.ministre.main, ROLES.coordination.main);
  assert.notDeepEqual(ROLES.programme.main, ROLES.coordination.main);
  // Chaque rôle doit garder au moins un écran en navigation principale
  // (condition nécessaire pour que Sidebar.tsx, qui rend désormais
  // roleDef.main directement, n'affiche jamais une nav vide).
  for (const role of ["ministre", "programme", "coordination"] as const) {
    assert.ok(ROLES[role].main.length > 0, `${role} doit avoir au moins un écran en navigation principale`);
  }
});

test("Correction B — getProgrammeFixtureIdForInitiative résout une correspondance réelle, jamais devinée", () => {
  const froidFixtureId = PROGS.find((p) => p.title === "Résilience de la chaîne du froid · Petite-Côte")!.id;
  assert.equal(getProgrammeFixtureIdForInitiative("init-froid"), froidFixtureId);
  assert.equal(
    getProgrammeFixtureIdForInitiative("initiative-sans-correspondance"),
    undefined,
    "aucune correspondance PROGS -> jamais un fixtureId inventé"
  );
});

test("Correction B — opportunité retenue sans Initiative créée : aucun programmeFixtureId (pas de lien trompeur)", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const joalOpp = withDemo.programOpportunities.find((o) => o.problem.includes("écailles"))!;
  const retained = arbitrateAndRetain(withDemo, joalOpp.id);

  const detail = getOpportunityDetail(joalOpp.id, retained)!;
  assert.equal(detail.initiativeId, undefined);
  assert.equal(detail.programmeFixtureId, undefined, "sans Initiative réelle, aucun lien Programme ne doit être proposé");
});

test("Correction B — Opportunité → Initiative réelle appariée à un programme réel : programmeFixtureId résolu de bout en bout", () => {
  // PROGRAMME_ID_BY_TITLE apparie par identifiant d'Initiative réel (les 9
  // Initiative déjà présentes dans le fixture, ex. "init-froid"), jamais
  // par coïncidence de titre : create_initiative génère toujours un
  // nouvel id (id("init"), src/domain/rules.ts) qui ne peut donc jamais
  // apparaître dans cette table. Pour exercer la chaîne réelle
  // getOpportunityDetail -> getProgrammeFixtureIdForInitiative telle
  // qu'elle s'exécute en pratique, on reproduit ici la seule condition
  // qui la déclenche : une Initiative déjà appariée (par id) qui porte en
  // plus un programOpportunityId réel vers l'opportunité testée.
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const joalOpp = withDemo.programOpportunities.find((o) => o.problem.includes("écailles"))!;
  const retained = arbitrateAndRetain(withDemo, joalOpp.id);

  const withLinkedInitiative = {
    ...retained,
    initiatives: retained.initiatives.map((item) =>
      item.id === "init-froid" ? { ...item, programOpportunityId: joalOpp.id } : item
    )
  };

  const detail = getOpportunityDetail(joalOpp.id, withLinkedInitiative)!;
  assert.equal(detail.initiativeId, "init-froid", "l'Initiative réelle appariée doit être résolue");

  const expectedFixtureId = PROGS.find((p) => PROGRAMME_ID_BY_TITLE[p.title] === "init-froid")!.id;
  assert.equal(detail.programmeFixtureId, expectedFixtureId, "programmeFixtureId doit pointer vers le vrai programme ProgrammeDetail/Portfolio");
});

test("Correction B — Opportunites.tsx et OpportunityPanel.tsx n'utilisent plus initiativeFocusId pour ouvrir un programme", () => {
  for (const [name, source] of [
    ["Opportunites.tsx", opportunitesSource],
    ["OpportunityPanel.tsx", opportunityPanelSource]
  ] as const) {
    assert.doesNotMatch(
      source,
      /initiativeFocusId:\s*detail\.initiativeId/,
      `${name} ne doit plus poser initiativeFocusId depuis une opportunité (écran "programmes" ne le lit plus depuis Architecture Recovery R1)`
    );
    assert.match(
      source,
      /onOpenProgramme\(/,
      `${name} doit ouvrir le programme réel via le mécanisme déjà fonctionnel onOpenProgramme`
    );
  }
});
