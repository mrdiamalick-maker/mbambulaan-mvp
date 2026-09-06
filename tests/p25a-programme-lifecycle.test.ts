import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { traceInitiativeOrigin } from "../src/domain/initiative-lifecycle";
import { projectStateForSession } from "../src/server/access-projection";
import { assertCan, canRole } from "../src/server/permissions";
import type { Initiative, ProductState, ProgramOpportunity, Role } from "../src/domain/types";

// P2.5-A — "Programme Lifecycle Foundation". Le Development Engine savait
// déjà créer un Programme (create_initiative, voie ProgramOpportunity OU
// ServiceRequests regroupées) mais ne le faisait jamais progresser au-delà
// de "cadrage" (audit P2.5, confirmé par grep sur rules.ts avant ce lot).
// Ce fichier prouve que le cycle de vie complet (cadrage → financee →
// execution → terminee) fonctionne à travers le vrai domaine, avec ses
// portes non-cosmétiques et sa traçabilité — pas seulement que le type
// compile.

const CORD = "act-coordinateur";

// Chemin A du mandat (§8) — depuis le Besoin collectif réel du Demo World
// (cn-kayar-motorisation, déjà "qualified", jamais réécrit par ce lot) :
// qualifier une opportunité de programme, exactement le geste que
// ProgramOpportunityForm.tsx/QualifyOpportunityForm proposent déjà en
// production.
function qualifyKayarOpportunity(state: ProductState): { state: ProductState; opportunity: ProgramOpportunity } {
  let next = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: CORD,
    collectiveNeedId: "cn-kayar-motorisation",
    problem: "Pannes moteur récurrentes à Kayar et Fass Boye",
    justification: "Plusieurs signaux et demandes de service convergent vers un même problème de motorisation, documenté et qualifié.",
    territoryIds: ["kayar", "fass-boye"],
    potentialBeneficiaries: "Capitaines et mareyeurs de Kayar et Fass Boye",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Maintenance préventive", "Formation à l'entretien moteur"],
    desiredOutcomes: ["Réduire les immobilisations liées à la motorisation"],
    possibleIndicators: [],
    maturity: "moyenne"
  });
  const created = next.programOpportunities[0];
  next = applyCommand(next, {
    type: "update_program_opportunity_status",
    actorId: CORD,
    programOpportunityId: created.id,
    status: "qualified",
    note: "Éléments disponibles jugés suffisants pour passer en conception."
  });
  const opportunity = next.programOpportunities.find((item) => item.id === created.id)!;
  return { state: next, opportunity };
}

// Programme créé avec un budget déjà validé (mandat §5 : seul champ que le
// domaine permet réellement de fixer — cf. initiative-lifecycle.ts) — la
// seule manière, à travers le vrai domaine, de rendre un Programme
// éligible au passage en financement.
function createValidatedInitiative(state: ProductState, opportunityId: string): { state: ProductState; initiative: Initiative } {
  const next = applyCommand(state, {
    type: "create_initiative",
    actorId: CORD,
    title: "Programme de fiabilisation de la motorisation — Kayar/Fass Boye",
    objective: "Réduire les immobilisations liées à la motorisation",
    budgetFcfa: 8000000,
    budgetStatus: "valide",
    programOpportunityId: opportunityId
  });
  return { state: next, initiative: next.initiatives[0] };
}

// --- Démonstration exécutable complète (mandat §14/§18.12) --------------
// Un programme créé à travers le vrai domaine peut génuinement passer de
// cadrage à l'achèvement, avec audit et preuve — pas seulement en théorie.
test("Démonstration complète — opportunité qualifiée → cadrage → financee → execution → Result → terminee", () => {
  let state = createDemoState();
  const { state: withOpportunity, opportunity } = qualifyKayarOpportunity(state);
  state = withOpportunity;
  assert.equal(opportunity.status, "qualified");

  const { state: withInitiative, initiative } = createValidatedInitiative(state, opportunity.id);
  state = withInitiative;
  assert.equal(initiative.status, "cadrage");
  assert.equal(initiative.programOpportunityId, opportunity.id);

  state = applyCommand(state, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "financee" });
  assert.equal(state.initiatives.find((item) => item.id === initiative.id)!.status, "financee");

  state = applyCommand(state, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "execution" });
  assert.equal(state.initiatives.find((item) => item.id === initiative.id)!.status, "execution");

  // Sans Result, l'achèvement doit rester bloqué (mandat §7) — la
  // démonstration doit prouver la porte, pas seulement la contourner.
  assert.throws(() => applyCommand(state, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "terminee" }));

  state = applyCommand(state, {
    type: "create_result",
    actorId: CORD,
    title: "Formation à l'entretien moteur organisée pour 18 capitaines",
    description: "18 capitaines de Kayar et Fass Boye formés à l'entretien préventif du moteur, en partenariat avec un mécanicien local.",
    sourceRef: { objectType: "initiative", objectId: initiative.id },
    trust: "declaree"
  });
  assert.equal(state.results.filter((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === initiative.id).length, 1);

  state = applyCommand(state, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "terminee", note: "Formation réalisée, premier résultat documenté." });
  const completed = state.initiatives.find((item) => item.id === initiative.id)!;
  assert.equal(completed.status, "terminee");

  // Traçabilité inverse (mandat §9) — la chaîne complète reste résolue
  // mécaniquement jusqu'aux sources d'origine du Besoin collectif.
  const trace = traceInitiativeOrigin(state, completed);
  assert.equal(trace.kind, "program_opportunity");
  assert.equal(trace.collectiveNeed?.id, "cn-kayar-motorisation");
  assert.ok(trace.collectiveNeedSources.length >= 3, "les sources du besoin collectif (Finding/Signal/ServiceRequest) doivent toutes se résoudre");
});

// TEST A — legal cadrage → financee.
test("TEST A — transition légale cadrage → financee", () => {
  let state = createDemoState();
  const { state: s1, opportunity } = qualifyKayarOpportunity(state);
  const { state: s2, initiative } = createValidatedInitiative(s1, opportunity.id);
  state = applyCommand(s2, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "financee" });
  assert.equal(state.initiatives.find((item) => item.id === initiative.id)!.status, "financee");
});

// TEST B — legal financee → execution (init-petite-cote-xxl, déjà
// "financee" dans le Demo World — non reconstruit).
test("TEST B — transition légale financee → execution", () => {
  const state0 = createDemoState();
  const fixture = state0.initiatives.find((item) => item.id === "init-petite-cote-xxl");
  assert.ok(fixture, "le Demo World doit fournir un programme déjà « financee »");
  assert.equal(fixture!.status, "financee");
  const state = applyCommand(state0, { type: "update_initiative_status", actorId: CORD, initiativeId: fixture!.id, status: "execution" });
  assert.equal(state.initiatives.find((item) => item.id === fixture!.id)!.status, "execution");
});

// TEST C — legal execution → terminee (init-immatriculation, déjà en
// exécution avec un Result réel documenté — non reconstruit).
test("TEST C — transition légale execution → terminee", () => {
  const state0 = createDemoState();
  const fixture = state0.initiatives.find((item) => item.id === "init-immatriculation");
  assert.ok(fixture, "le Demo World doit fournir le programme init-immatriculation");
  assert.equal(fixture!.status, "execution");
  assert.ok(state0.results.some((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === fixture!.id));
  const state = applyCommand(state0, { type: "update_initiative_status", actorId: CORD, initiativeId: fixture!.id, status: "terminee" });
  assert.equal(state.initiatives.find((item) => item.id === fixture!.id)!.status, "terminee");
});

// TEST D — illegal cadrage → terminee rejeté.
test("TEST D — transition illégale cadrage → terminee rejetée", () => {
  let state = createDemoState();
  const { state: s1, opportunity } = qualifyKayarOpportunity(state);
  const { state: s2, initiative } = createValidatedInitiative(s1, opportunity.id);
  state = s2;
  assert.equal(initiative.status, "cadrage");
  assert.throws(() => applyCommand(state, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "terminee" }), /transition illégale/i);
});

// TEST E — illegal terminee → execution rejeté.
test("TEST E — transition illégale terminee → execution rejetée", () => {
  const state0 = createDemoState();
  const fixture = state0.initiatives.find((item) => item.id === "init-immatriculation")!;
  const terminated = applyCommand(state0, { type: "update_initiative_status", actorId: CORD, initiativeId: fixture.id, status: "terminee" });
  assert.equal(terminated.initiatives.find((item) => item.id === fixture.id)!.status, "terminee");
  assert.throws(() => applyCommand(terminated, { type: "update_initiative_status", actorId: CORD, initiativeId: fixture.id, status: "execution" }), /transition illégale/i);
});

// TEST F — execution → terminee SANS Result rejeté (mandat §7 — porte
// réellement bloquante, pas cosmétique). init-cap-vert-xxl : déjà en
// exécution dans le Demo World, sans aucun Result associé.
test("TEST F — execution → terminee sans résultat enregistré, rejeté", () => {
  const state0 = createDemoState();
  const fixture = state0.initiatives.find((item) => item.id === "init-cap-vert-xxl");
  assert.ok(fixture, "le Demo World doit fournir un programme en exécution sans résultat");
  assert.equal(fixture!.status, "execution");
  assert.equal(state0.results.filter((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === fixture!.id).length, 0);
  assert.throws(() => applyCommand(state0, { type: "update_initiative_status", actorId: CORD, initiativeId: fixture!.id, status: "terminee" }), /résultat/i);
});

// TEST G — la transition crée une AuditEntry avec acteur + statut
// précédent/nouveau (mandat §4).
test("TEST G — la transition crée une AuditEntry acteur + statut précédent/nouveau", () => {
  let state = createDemoState();
  const { state: s1, opportunity } = qualifyKayarOpportunity(state);
  const { state: s2, initiative } = createValidatedInitiative(s1, opportunity.id);
  const before = s2.audit.length;
  state = applyCommand(s2, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "financee", note: "Instruction financière arrêtée." });
  assert.equal(state.audit.length, before + 1);
  const entry = state.audit[0];
  assert.equal(entry.actorId, CORD);
  assert.equal(entry.objectType, "initiative");
  assert.equal(entry.objectId, initiative.id);
  assert.equal(entry.action, "update_initiative_status");
  assert.match(entry.detail, /cadrage/);
  assert.match(entry.detail, /financee/);
  assert.match(entry.detail, /Instruction financière arrêtée\./);
});

// TEST H — un Programme né d'une ProgramOpportunity préserve
// programOpportunityId (mandat §8).
test("TEST H — l'origine ProgramOpportunity reste structurellement préservée", () => {
  const state = createDemoState();
  const { state: s1, opportunity } = qualifyKayarOpportunity(state);
  const { initiative } = createValidatedInitiative(s1, opportunity.id);
  assert.equal(initiative.programOpportunityId, opportunity.id);
  assert.equal(initiative.serviceRequestIds, undefined);
});

// TEST I — la traçabilité inverse atteint le CollectiveNeed et ses
// sourceRefs (mandat §9) — chaîne mécanique, jamais reconstruite en texte
// libre.
test("TEST I — traceInitiativeOrigin atteint le CollectiveNeed et ses sources réelles", () => {
  const state = createDemoState();
  const { state: s1, opportunity } = qualifyKayarOpportunity(state);
  const { initiative } = createValidatedInitiative(s1, opportunity.id);
  const trace = traceInitiativeOrigin(s1, initiative);
  assert.equal(trace.kind, "program_opportunity");
  assert.equal(trace.programOpportunity?.id, opportunity.id);
  assert.equal(trace.collectiveNeed?.id, "cn-kayar-motorisation");
  const objectTypes = trace.collectiveNeedSources.map((item) => item.ref.objectType);
  assert.ok(objectTypes.includes("finding"), "la chaîne doit remonter jusqu'au Finding");
  assert.ok(objectTypes.includes("signal"), "la chaîne doit remonter jusqu'au Signal");
  assert.ok(objectTypes.includes("service_request"), "la chaîne doit remonter jusqu'à la ServiceRequest");
});

// TEST J — l'origine "ServiceRequests regroupées" (voie B, legacy) reste
// pleinement fonctionnelle, non régressée par ce lot.
test("TEST J — origine ServiceRequests regroupées reste fonctionnelle", () => {
  const state0 = createDemoState();
  const state = applyCommand(state0, {
    type: "create_initiative",
    actorId: CORD,
    title: "Regroupement maintenance motorisation — Kayar",
    objective: "Répondre conjointement à deux demandes de maintenance similaires",
    serviceRequestIds: ["need-motorisation-kayar-1", "need-motorisation-kayar-2"]
  });
  const initiative = state.initiatives[0];
  assert.equal(initiative.status, "cadrage");
  assert.equal(initiative.programOpportunityId, undefined);
  assert.deepEqual([...initiative.serviceRequestIds!].sort(), ["need-motorisation-kayar-1", "need-motorisation-kayar-2"]);

  const trace = traceInitiativeOrigin(state, initiative);
  assert.equal(trace.kind, "grouped_service_requests");
  assert.equal(trace.serviceRequests.length, 2);
});

// TEST K — chaîne Result/Outcome/Impact non régressée par ce lot (LOT 4,
// impact.ts inchangé).
test("TEST K — chaîne Result → Outcome → Impact non régressée", () => {
  let state = createDemoState();
  const { state: s1, opportunity } = qualifyKayarOpportunity(state);
  const { state: s2, initiative } = createValidatedInitiative(s1, opportunity.id);
  state = applyCommand(s2, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "financee" });
  state = applyCommand(state, { type: "update_initiative_status", actorId: CORD, initiativeId: initiative.id, status: "execution" });
  state = applyCommand(state, {
    type: "create_result",
    actorId: CORD,
    title: "Formation à l'entretien moteur organisée pour 18 capitaines",
    description: "18 capitaines formés à l'entretien préventif.",
    sourceRef: { objectType: "initiative", objectId: initiative.id },
    trust: "declaree"
  });
  const result = state.results[0];
  state = applyCommand(state, {
    type: "record_outcome",
    actorId: CORD,
    title: "Baisse des pannes signalées après la formation",
    statement: "Moins de pannes moteur signalées par les capitaines formés depuis la session.",
    sourceResultIds: [result.id],
    trust: "declaree",
    attribution: "contributive"
  });
  const outcome = state.outcomes[0];
  state = applyCommand(state, {
    type: "record_impact",
    actorId: CORD,
    title: "Effet à confirmer sur la saison",
    statement: "Effet potentiel sur la disponibilité des embarcations, à mesurer sur une saison complète.",
    outcomeId: outcome.id,
    attribution: "non_etablie",
    status: "a_mesurer"
  });
  assert.equal(state.impactEvidences.length, 1);
});

// TEST L — institution/autres rôles suivent les règles de permission
// explicites (mandat §13) — mêmes rôles que create_initiative, jamais
// élargi.
test("TEST L — update_initiative_status suit exactement les rôles de create_initiative", () => {
  const roleExpectations: Record<Role, boolean> = {
    administrateur: true,
    operateur: false,
    capitaine: false,
    mareyeur: false,
    transformateur: false,
    prestataire: false,
    gestionnaire_organisation: true,
    coordinateur: true,
    institution: true,
    partenaire: false
  };
  for (const [role, expected] of Object.entries(roleExpectations) as [Role, boolean][]) {
    assert.equal(canRole(role, "update_initiative_status"), canRole(role, "create_initiative"), `${role} : update_initiative_status doit suivre exactement create_initiative`);
    assert.equal(canRole(role, "update_initiative_status"), expected, `${role} : permission inattendue pour update_initiative_status`);
  }

  assert.doesNotThrow(() => assertCan("coordinateur", { type: "update_initiative_status", actorId: CORD, initiativeId: "init-immatriculation", status: "terminee" }));
  assert.throws(() => assertCan("mareyeur", { type: "update_initiative_status", actorId: "act-mareyeur", initiativeId: "init-immatriculation", status: "terminee" }));
});

// TEST M — la projection d'accès P2.1 reste non régressée (ce lot ne
// modifie jamais access-projection.ts).
test("TEST M — projectStateForSession non régressée (P2.1)", () => {
  const state = createDemoState();
  const coordinateur = projectStateForSession(state, { actorId: CORD, role: "coordinateur" });
  assert.equal(coordinateur, state, "rôle transverse : toujours le même objet, comportement inchangé par ce lot");
  assert.equal(coordinateur.initiatives.length, state.initiatives.length);

  const mareyeur = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });
  assert.equal(mareyeur.initiatives.length, state.initiatives.length, "Initiative n'a jamais été un objet filtré par rôle — ce lot ne change pas cela");
});

// TEST N — le Demo World reste cohérent : les surfaces existantes restent
// présentes (source), et les programmes historiques sans provenance
// structurée (ex. init-immatriculation) restent honnêtement "unattributed"
// plutôt que reconstitués.
test("TEST N — Demo World cohérent : surfaces existantes présentes, origines historiques non fabriquées", () => {
  const state = createDemoState();

  const legacyProgram = state.initiatives.find((item) => item.id === "init-immatriculation")!;
  const trace = traceInitiativeOrigin(state, legacyProgram);
  assert.equal(trace.kind, "unattributed", "un programme historique sans programOpportunityId/serviceRequestIds ne doit jamais être fabriqué");
  assert.equal(trace.programOpportunity, undefined);
  assert.equal(trace.serviceRequests.length, 0);

  const pageSource = readFileSync(fileURLToPath(new URL("../src/app/app/(coordination)/initiatives/page.tsx", import.meta.url)), "utf8");
  assert.ok(pageSource.includes("Pourquoi ce programme existe"));
  assert.ok(pageSource.includes("update_initiative_status"));
  assert.ok(pageSource.includes("traceInitiativeOrigin"));
});
