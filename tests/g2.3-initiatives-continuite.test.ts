import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { applyDemoProgramOpportunities } from "../src/data/demo-program-opportunities";
import { getOpportunityDetail } from "../src/v3-template/lib/opportunity-bridge";
import { getInitiativeResults } from "../src/v3-template/lib/resultats-bridge";
import { ROLES, MODULES } from "../src/v3-template/data/roles";
import { isScreenKey } from "../src/v3-template/types";

// G2.3 — mandat "Initiatives & continuité du cycle". Doctrine vérifiée
// ici : retenue ≠ exécutée (une ProgramOpportunity designing/retenue
// n'implique jamais une Initiative tant qu'aucun create_initiative réel
// n'a été dispatché) ; aucune Initiative/Decision fabriquée pour Joal/
// Kayar tant qu'elles restent en instruction ; le lien "Décision suivante"
// ne repose plus sur une simple proximité territoriale.

function arbitrateAndRetain(state: ReturnType<typeof createDemoState>, opportunityId: string) {
  const qualifying = applyCommand(state, { type: "update_program_opportunity_status", programOpportunityId: opportunityId, actorId: "act-coordinateur", status: "qualifying" });
  const qualified = applyCommand(qualifying, { type: "update_program_opportunity_status", programOpportunityId: opportunityId, actorId: "act-coordinateur", status: "qualified" });
  const pending = applyCommand(qualified, { type: "update_program_opportunity_status", programOpportunityId: opportunityId, actorId: "act-coordinateur", status: "pending_arbitration" });
  return applyCommand(pending, { type: "arbitrate_program_opportunity", programOpportunityId: opportunityId, actorId: "act-ministre", outcome: "retenir", rationale: "Retenue après instruction complète." });
}

test("Opportunité retenue SANS Initiative créée : « retenue ≠ exécutée », jamais un programme fabriqué", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const joalOpp = withDemo.programOpportunities.find((o) => o.problem.includes("écailles"))!;
  const retained = arbitrateAndRetain(withDemo, joalOpp.id);

  const detail = getOpportunityDetail(joalOpp.id, retained)!;
  assert.equal(detail.status, "designing");
  assert.equal(detail.outcome, "retenue");
  // Aucune Initiative n'existe tant que create_initiative n'a pas été
  // dispatché explicitement — le domaine ne la crée jamais automatiquement.
  assert.equal(detail.initiativeId, undefined, "retenue ne doit jamais impliquer une Initiative fabriquée");

  const initiatives = getInitiativeResults(retained);
  assert.equal(initiatives.some((i) => i.originOpportunity?.id === joalOpp.id), false);
});

test("Opportunité → décision → Initiative réellement créée : le lien apparaît des deux côtés", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const joalOpp = withDemo.programOpportunities.find((o) => o.problem.includes("écailles"))!;
  const retained = arbitrateAndRetain(withDemo, joalOpp.id);

  const withInitiative = applyCommand(retained, {
    type: "create_initiative",
    actorId: "act-ministre",
    title: "Valorisation des écailles et coproduits · Joal-Fadiouth",
    objective: "Structurer une filière de collecte et valorisation des coproduits de poisson à Joal.",
    programOpportunityId: joalOpp.id
  });

  // Côté Opportunité : initiativeId réel résolu, jamais déduit du statut.
  const detail = getOpportunityDetail(joalOpp.id, withInitiative)!;
  assert.equal(detail.status, "converted_to_program");
  assert.ok(detail.initiativeId, "l'Initiative réelle doit être résolue via programOpportunityId");

  // Côté Initiative : origine opportunité + décision d'origine résolues.
  const initiatives = getInitiativeResults(withInitiative);
  const created = initiatives.find((i) => i.id === detail.initiativeId)!;
  assert.ok(created, "la nouvelle Initiative doit apparaître dans getInitiativeResults");
  assert.equal(created.originOpportunity?.id, joalOpp.id);
  assert.ok(created.decidedLabel, "la décision d'arbitrage d'origine doit être résolue");
  assert.equal(created.observedResults.length, 0, "aucun résultat fabriqué pour une Initiative tout juste créée");
  assert.equal(created.nextStepLabel.length > 0, true);
});

test("Initiative réelle du Demo World : origine, responsable, prochaine étape et résultats cohabitent honnêtement", () => {
  const state = createDemoState();
  const initiatives = getInitiativeResults(state);
  const immatriculation = initiatives.find((i) => i.id === "init-immatriculation")!;
  assert.ok(immatriculation.responsibleLabel, "ownerId réel doit résoudre un responsable");
  assert.equal(immatriculation.originOpportunity, undefined, "init-immatriculation n'a pas de programOpportunityId réel — jamais inventé");
  assert.ok(immatriculation.nextStepLabel.length > 0);
  assert.equal(immatriculation.observedResults.length, 1);

  // init-lompoul-balises n'a aucun indicateur réel (budgetStatus a_estimer,
  // indicators: []) — avancementPct doit rester honnêtement absent.
  const lompoul = initiatives.find((i) => i.id === "init-lompoul-balises")!;
  assert.equal(lompoul.avancementPct, undefined);
});

test("Décision suivante : plus de faux lien de proximité territoriale (correctif G2.3 §7)", () => {
  const state = createDemoState();
  const initiatives = getInitiativeResults(state);

  // init-froid référence sit-mbour dans ses situationIds, exactement comme
  // ARB[1] (situationId: sit-mbour, non décidée) : relation canonique
  // réelle, le lien doit apparaître.
  const froid = initiatives.find((i) => i.id === "init-froid")!;
  assert.ok(froid.nextDecision, "init-froid partage réellement sit-mbour avec un arbitrage non décidé");

  // init-securite (situationIds: ["sit-saint-louis"]) ne partage AUCUN
  // situationId avec un arbitrage réel, même si elle partage des
  // territoires (saint-louis/kayar) avec des dossiers d'arbitrage : sous
  // l'ancienne règle de proximité territoriale, un faux lien aurait pu
  // apparaître. Sous la règle stricte, aucun lien n'est montré.
  const securite = initiatives.find((i) => i.id === "init-securite")!;
  assert.equal(securite.nextDecision, undefined, "aucune relation canonique réelle — jamais un lien de proximité");
});

test("Navigation : clé d'écran 'programmes' inchangée, libellé V5 restauré (ARCHITECTURE RECOVERY R1)", () => {
  // Le renommage UX "Initiatives" (G2.3) et la navigation unifiée
  // n'étaient pas des évolutions validées de l'architecture V5 par rôle ;
  // Recovery R1 restaure le libellé "Programmes" et la structure par rôle.
  // Initiatives.tsx reste intact sur disque (capability expérimentale non
  // exposée), cf. App.tsx.
  assert.equal(isScreenKey("programmes"), true);
  assert.equal(MODULES.programmes.label, "Programmes");
  assert.ok(ROLES.ministre.main.includes("programmes"));
  assert.ok(ROLES.programme.main.includes("programmes"));
  assert.ok(ROLES.coordination.main.includes("programmes"));
});
