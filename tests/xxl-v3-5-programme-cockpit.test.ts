import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import {
  portfolioRows,
  portfolioStats,
  programmeEcosystem,
  programmeHealth,
  programmeMilestones
} from "../src/domain/programme-intelligence";

// LOT V3.5 — "Programme Portfolio & Cockpit". Composants "use client"
// (ProgrammeCockpit/ProgrammesExplorer/ProgrammePortfolioScatter/
// InitiativesWorkspace) non montables via renderToStaticMarkup dans ce
// jeu de tests Node pur (même contrainte déjà documentée pour les LOTs
// V3.1-V3.4) — vérifiés par lecture de source. Le Core
// (domain/programme-intelligence.ts, pur) est testé en direct.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();

// TEST 1 — programmeHealth reste une projection déterministe à 3 états,
// toujours justifiée : un programme "terminee" est toujours "aligne"
// (cycle clos), et chaque état porte au moins une raison réelle.
test("TEST 1 — programmeHealth reste déterministe et toujours justifié", () => {
  for (const initiative of state.initiatives) {
    const health = programmeHealth(state, initiative);
    assert.ok(["aligne", "attention", "critique"].includes(health.state));
    assert.ok(health.reasons.length > 0, `${initiative.id} : un état de santé doit toujours porter au moins une raison`);
    if (initiative.status === "terminee") assert.equal(health.state, "aligne", "un programme clos est toujours 'aligne' — le jugement porte sur les programmes actifs");
    // Déterminisme : deux appels sur le même état renvoient le même résultat.
    const second = programmeHealth(state, initiative);
    assert.deepEqual(health, second);
  }
});

// TEST 2 — programmeEcosystem reste un agrégat direct et vérifiable sur
// les territoires réels du programme (Initiative.territoryIds, jamais
// Initiative.situationIds — Catégorie C, jamais réécrit par une commande
// réelle, cf. tête de domain/programme-intelligence.ts).
test("TEST 2 — programmeEcosystem est un agrégat direct sur les territoires réels du programme", () => {
  const initiative = state.initiatives.find((item) => item.territoryIds.length > 0)!;
  assert.ok(initiative);
  const ecosystem = programmeEcosystem(state, initiative);
  const territoryIds = new Set(initiative.territoryIds);
  const expectedOpen = state.situations.filter((item) => territoryIds.has(item.territoryId) && item.status !== "reglee");
  assert.equal(ecosystem.openSituations.length, expectedOpen.length);
  assert.equal(ecosystem.criticalOpenSituations, expectedOpen.filter((item) => item.priority === "critique").length);
});

// TEST 3 — programmeMilestones : chronologique décroissant, alimenté
// UNIQUEMENT par des événements réels déjà audités (state.audit) ou des
// Result réels — jamais par CoordinationSpace.commitments (confirmé sans
// lien réel vers Initiative, cf. constat en tête de domain/programme-
// intelligence.ts).
test("TEST 3 — programmeMilestones reste une timeline réelle, triée, jamais fondée sur Commitment", () => {
  for (const initiative of state.initiatives) {
    const milestones = programmeMilestones(state, initiative);
    const dates = milestones.map((item) => item.at);
    assert.deepEqual(dates, [...dates].sort().reverse());
    for (const milestone of milestones) assert.ok(["lifecycle", "engagement", "result"].includes(milestone.kind));
  }
  const source = readSource("../src/domain/programme-intelligence.ts");
  assert.ok(!source.includes("coordinationSpaces"), "programme-intelligence.ts ne doit jamais lire CoordinationSpace — aucun lien réel vers Initiative");
});

// TEST 4 — portfolioRows/portfolioStats restent des agrégats vérifiables :
// le compte actif+terminé = le total, et chaque ligne expose une santé.
test("TEST 4 — portfolioRows/portfolioStats sont des agrégats vérifiables sur state.initiatives", () => {
  const rows = portfolioRows(state);
  assert.equal(rows.length, state.initiatives.length);
  for (const row of rows) assert.ok(["aligne", "attention", "critique"].includes(row.health.state));
  const stats = portfolioStats(state, rows);
  assert.equal(stats.active + stats.completed, stats.total);
  assert.equal(stats.total, state.initiatives.length);
});

// TEST 5 — progressPct/budgetConfirmedPct ne sont JAMAIS forcés à 0 pour
// un programme sans indicateur/budget chiffré (mandat §3, "no opaque
// score") — restent `null`, jamais une fausse mesure.
test("TEST 5 — un programme sans indicateurs/budget chiffré n'est jamais réduit à 0 dans le portefeuille", () => {
  const rows = portfolioRows(state);
  for (const row of rows) {
    if (row.initiative.indicators.length === 0) assert.equal(row.progressPct, null);
    if (row.initiative.budgetFcfa === undefined) assert.equal(row.budgetConfirmedPct, null);
  }
});

// TEST 6 — ProgrammePortfolioScatter exclut (jamais ne place à 0) les
// programmes non mesurables des deux axes. Depuis le LOT V3.30 (bascule
// "Avancement × signaux"/"Avancement × budget", copie conforme
// littérale), l'exclusion budgétaire (budgetConfirmedPct !== null) ne
// s'applique qu'en mode "budget" — le mode "signaux" (par défaut, comme
// la maquette) n'exige que progressPct, l'axe Y (situations ouvertes du
// programme) étant toujours défini (jamais null).
test("TEST 6 — le scatter portefeuille exclut les programmes non mesurables plutôt que de les placer à 0", () => {
  const source = readSource("../src/components/programmes/ProgrammePortfolioScatter.tsx");
  assert.ok(source.includes('row.progressPct !== null && (axisMode === "signaux" || row.budgetConfirmedPct !== null)'));
  assert.ok(!/progressPct\s*\?\?\s*0/.test(source), "aucun repli silencieux à 0 pour une dimension non mesurée");
});

// TEST 7 — ProgrammeCockpit : `canAct` gouverne bien tous les gestes
// d'exécution (transition, mobilisation, enregistrement) — jamais
// affichés quand canAct=false (Espace État, mandat §21).
test("TEST 7 — ProgrammeCockpit masque tous les gestes d'exécution quand canAct=false", () => {
  const source = readSource("../src/components/programmes/ProgrammeCockpit.tsx");
  assert.ok(source.includes("const canTransition = canAct && canRole"));
  assert.ok(source.includes("const canMobilize = canAct && canRole"));
  assert.ok(source.includes("const canTransitionEngagement = canAct && canRole"));
  assert.ok(source.includes("{canAct && ("), "la section de mobilisation doit être entièrement conditionnée à canAct");
  assert.ok(source.includes('{canAct && <button onClick={() => setResultFormOpen(true)}'));
});

// TEST 8 — le même ProgrammeCockpit est réellement réutilisé par les DEUX
// espaces (mandat §20, "do not create a separate PMO product") — jamais
// une seconde implémentation du dossier programme pour l'Espace État.
test("TEST 8 — le cockpit programme est partagé entre Coordination et Espace État, jamais dupliqué", () => {
  const coordSource = readSource("../src/components/programmes/ProgrammesExplorer.tsx");
  assert.ok(coordSource.includes('<ProgrammeCockpit initiative={activeRow.initiative} state={state} role={role} run={run} canAct'));
  const etatSource = readSource("../src/app/app/etat/programmes/page.tsx");
  assert.ok(etatSource.includes("canAct={false}"), "l'Espace État doit monter le cockpit en lecture seule, jamais avec les actions d'exécution");
  assert.ok(etatSource.includes('from "@/components/programmes/ProgrammeCockpit"'));
});

// TEST 9 — lien profond /app/initiatives/[id] (mandat §16, "must still be
// able to find a programme, open detail") — même architecture que
// /app/situations/[id] (V3.2).
test("TEST 9 — /app/initiatives/[id] existe et partage InitiativesWorkspace avec /app/initiatives", () => {
  const listPage = readSource("../src/app/app/(coordination)/initiatives/page.tsx");
  const detailPage = readSource("../src/app/app/(coordination)/initiatives/[id]/page.tsx");
  assert.ok(listPage.includes('from "@/components/programmes/InitiativesWorkspace"'));
  assert.ok(detailPage.includes('from "@/components/programmes/InitiativesWorkspace"'));
  assert.ok(detailPage.includes("programmeId={id}"));
});

// TEST 10 — DÉCISION PRODUIT DÉJÀ PRISE (mandat §12) : pas de
// Initiative.milestones — vérifié que ce lot ne l'a pas ajouté.
test("TEST 10 — aucun champ Initiative.milestones n'a été ajouté au domaine", () => {
  const typesSource = readSource("../src/domain/types.ts");
  const initiativeBlockMatch = typesSource.match(/export interface Initiative \{[\s\S]*?\n\}/);
  assert.ok(initiativeBlockMatch);
  assert.ok(!initiativeBlockMatch![0].includes("milestones"), "Initiative ne doit porter aucun champ milestones — mandat explicite");
});
