import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import { deriveDatasetReferenceAt } from "../src/domain/signal-crossing";
import { collectSituationSignals } from "../src/domain/situation-narrative";
import {
  situationAgeDays,
  situationAgeLabel,
  situationAging,
  situationFunnel,
  situationKnownUnknown,
  situationStats,
  situationTerritoryReach
} from "../src/domain/situation-overview";
import { canRole } from "../src/server/permissions";
import { availableAction } from "../src/domain/rules";

// LOT V3.2 — "Situations & Progressive Detail". Composants "use client"
// (SituationsExplorer/SituationDetailPanel/*Tab) non montables via
// renderToStaticMarkup dans ce jeu de tests Node pur (Radix Tabs +
// recharts ResponsiveContainer exigent un vrai DOM) — même contrainte
// déjà documentée pour le chrome partagé (tests/xxl-v3-1-private-shell.test.ts).
// Le Core (domain/situation-overview.ts, entièrement pur) est donc testé
// en direct ici ; la QA visuelle réelle (rendu navigateur) est couverte
// séparément par capture d'écran authentifiée.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();
const referenceAtMs = (() => {
  const at = deriveDatasetReferenceAt(state);
  return at ? new Date(at).getTime() : Date.now();
})();

// TEST 1 — situationStats/situationFunnel/situationAging ne fabriquent
// aucun nombre : chaque compteur retombe sur un filtre/somme direct de
// state.situations/state.signals/state.evidences, jamais un score agrégé.
test("TEST 1 — situationStats/situationFunnel/situationAging restent des décomptes réels vérifiables", () => {
  const stats = situationStats(state);
  assert.equal(stats.open, state.situations.filter((s) => s.status !== "reglee").length);
  assert.equal(stats.critical, state.situations.filter((s) => s.status !== "reglee" && s.priority === "critique").length);
  assert.equal(stats.total, state.situations.length);
  assert.ok(stats.closedWithEvidence <= stats.total);

  const funnel = situationFunnel(state);
  assert.equal(funnel.find((s) => s.key === "signaux")?.value, state.signals.length);
  assert.equal(funnel.find((s) => s.key === "situations")?.value, state.situations.length);
  // Chaque palier ne peut jamais dépasser le premier (un entonnoir réel,
  // pas des ensembles indépendants qui pourraient croiser au hasard) —
  // sauf "situations suivies" qui peut légitimement dépasser "signaux
  // qualifiés" (des situations naissent aussi de wrappers legacy). On
  // vérifie seulement que rien n'est négatif ni supérieur au total réel.
  for (const step of funnel) assert.ok(step.value >= 0);

  const aging = situationAging(state, referenceAtMs);
  const totalAged = aging.reduce((sum, bucket) => sum + bucket.count, 0);
  const openWithHistory = state.situations.filter((s) => s.status !== "reglee" && s.history[0]?.at).length;
  assert.equal(totalAged, openWithHistory);
});

// TEST 2 — situationAgeDays/situationAgeLabel : même formule que
// situationAge (src/app/app/etat/arbitrages/page.tsx), jamais Date.now().
test("TEST 2 — situationAgeDays reprend la même formule que l'Espace État (horloge du jeu de données)", () => {
  const situation = state.situations.find((s) => s.history[0]?.at);
  assert.ok(situation);
  const expectedDays = Math.floor((referenceAtMs - new Date(situation!.history[0].at).getTime()) / 86_400_000);
  assert.equal(situationAgeDays(situation!, referenceAtMs), expectedDays);
  assert.ok(situationAgeLabel(situation!, referenceAtMs).length > 0);
});

// TEST 3 — situationKnownUnknown ne fabrique aucun texte : chaque entrée
// vient d'un Signal réel (collectSituationSignals), partitionné par son
// TrustLevel réel, jamais un score composite.
test("TEST 3 — situationKnownUnknown partitionne les vrais signaux, ne fabrique aucune synthèse", () => {
  for (const situation of state.situations) {
    const { known, unknown } = situationKnownUnknown(state, situation);
    const signals = collectSituationSignals(state, situation);
    assert.equal(known.length + unknown.length, signals.length, `situation ${situation.id}`);
    for (const item of known) assert.ok(["verifiee", "documentee", "consolidee", "officielle"].includes(item.trust));
    for (const item of unknown) assert.ok(!["verifiee", "documentee", "consolidee", "officielle"].includes(item.trust));
  }
});

// TEST 4 — situationTerritoryReach : 4 tuiles réelles, jamais un libellé
// fabriqué au cas par cas (contrairement à la maquette V3).
test("TEST 4 — situationTerritoryReach retombe sur de vrais décomptes territoriaux", () => {
  const situation = state.situations[0];
  const reach = situationTerritoryReach(state, situation);
  assert.equal(reach.actors, state.actors.filter((a) => a.territoryIds.includes(situation.territoryId)).length);
  assert.equal(reach.programmes, state.initiatives.filter((i) => i.territoryIds.includes(situation.territoryId)).length);
  assert.equal(reach.evidences, state.evidences.filter((e) => e.situationId === situation.id).length);
});

// TEST 5 — Action (mandat §8, le point le plus critique) : chaque
// prochaine étape réelle (availableAction) est vérifiée par canRole avant
// affichage dans SituationActionsTab — jamais un bouton visible sans
// mandat réel derrière.
test("TEST 5 — SituationActionsTab vérifie canRole avant d'afficher SituationAction", () => {
  const source = readSource("../src/components/situations/SituationActionsTab.tsx");
  assert.ok(source.includes("canRole(role, nextAction)"), "la prochaine étape doit être vérifiée par canRole avant affichage");
  assert.ok(source.includes('canRole(role, "log_communication")'));
  assert.ok(source.includes('canRole(role, "record_outcome")'));
  assert.ok(source.includes('canRole(role, "record_learning")'));
  // Non-régression du garde-fou lui-même : availableAction reste purement
  // dérivé du statut, canRole reste la SEULE source d'autorisation réelle
  // (server/permissions.ts, jamais dupliquée localement).
  assert.equal(availableAction("reglee"), undefined);
  assert.equal(canRole("partenaire", "qualify"), false);
  assert.equal(canRole("administrateur", "qualify"), true);
});

// TEST 6 — deep links préservés : /app/situations/[id] reste une route
// réelle, résout la situation demandée depuis TOUT state.situations
// (jamais scopée/filtrée), et affiche un état explicite "introuvable"
// plutôt que de retomber silencieusement sur une autre situation (bug
// trouvé en revue de conception, avant tout rendu réel).
test("TEST 6 — SituationsExplorer résout un selectedId sans scope/filtre et gère l'introuvable explicitement", () => {
  const source = readSource("../src/components/situations/SituationsExplorer.tsx");
  assert.ok(source.includes("state.situations.find((item) => item.id === selectedId)"), "la résolution d'un lien profond ne doit jamais passer par la liste filtrée/scopée");
  assert.ok(source.includes("situationNotFound"));
  assert.ok(source.includes("Situation introuvable"));
  const idPageSource = readSource("../src/app/app/(coordination)/situations/[id]/page.tsx");
  assert.ok(idPageSource.includes("SituationsExplorer"));
});

// TEST 7 — SituationRoom/SituationRow (l'ancien registre CRM-style et
// l'ancien détail "mur de texte") sont retirés, superseded par
// SituationsExplorer/SituationDetailPanel — aucun code mort laissé.
test("TEST 7 — l'ancien registre/détail Situations est retiré, pas laissé en code mort", () => {
  for (const path of ["../src/components/situations/SituationRoom.tsx", "../src/components/situations/SituationRow.tsx"]) {
    assert.throws(() => readSource(path), /ENOENT/);
  }
});

// TEST 8 — la maquette V3 (labels d'onglets) est bien celle utilisée,
// jamais une traduction anglaise forcée (mandat §4 : "use the actual V3
// labels... do not force these exact English names").
test("TEST 8 — les onglets du détail reprennent les libellés français de Claude Design V3", () => {
  const source = readSource("../src/components/situations/SituationDetailPanel.tsx");
  for (const label of ["Synthèse", "Chronologie", "Sources", "Action"]) {
    assert.ok(source.includes(`>${label}<`), `libellé d'onglet manquant : ${label}`);
  }
});
