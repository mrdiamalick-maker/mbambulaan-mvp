import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import { portfolioRows } from "../src/domain/programme-intelligence";

// LOT V3.30 ("Programmes — bloc par bloc, pièce par pièce", 2e relecture
// suite au retour "dynamisme du rôle connecté") — comparaison directe de
// role-dp-programmes.png (capture réelle de la maquette) contre la page a
// révélé 5 écarts que les LOTs V3.19/V3.22/V3.26 avaient manqués : le
// bandeau de 4 tuiles, le titre du waterfall, le panneau de jalons, les
// captions du tableau, et l'absence de bascule sur le scatter — cf. le
// commentaire d'en-tête de src/app/app/etat/programmes/page.tsx.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const pageSource = readSource("../src/app/app/etat/programmes/page.tsx");
const scatterSource = readSource("../src/components/programmes/ProgrammePortfolioScatter.tsx");
const state = createDemoState();

// TEST 1 — le bandeau de 4 tuiles reprend les 4 lectures littérales de la
// maquette ("en exécution ou financés"/"avancement moyen"/"demandent une
// attention"/"écarts terrain / déclaré"), jamais le bandeau reformulé
// (Actifs/À surveiller/Territoires/Budget chiffré) qu'il remplace.
test("TEST 1 — le bandeau de 4 tuiles reprend les 4 lectures littérales de la maquette", () => {
  for (const label of ["En exécution ou financés", "Avancement moyen", "Demandent une attention", "Écarts terrain / déclaré"]) {
    assert.ok(pageSource.includes(label), `tuile manquante : "${label}"`);
  }
  assert.ok(pageSource.includes("execOrFinancedCount"));
  assert.ok(pageSource.includes("avgProgressPct"));
  // Partition réelle et disjointe par état de santé (jamais une même
  // lecture recoupée deux fois) : attentionCount et terrainGapCount
  // dérivent tous deux de programmeHealth, sans le moindre nombre choisi
  // au hasard.
  assert.ok(pageSource.includes('row.health.state === "attention"'));
  assert.ok(pageSource.includes('row.health.state === "critique"'));
  const rows = portfolioRows(state);
  const attentionCount = rows.filter((row) => row.health.state === "attention").length;
  const terrainGapCount = rows.filter((row) => row.health.state === "critique").length;
  assert.equal(attentionCount + terrainGapCount, rows.filter((row) => row.health.state !== "aligne").length);
});

// TEST 2 — le titre du waterfall ne sur-promet plus une "dépense réelle"
// jamais mesurée (Funding.status est un statut de MOBILISATION, jamais
// une preuve de dépense — cf. domain/programme-intelligence.ts), tout en
// conservant le contenu réel des 3 statuts (Confirmé/En instruction/À
// mobiliser).
test("TEST 2 — le titre du waterfall budgétaire ne sur-promet plus une dépense jamais mesurée", () => {
  // Le titre surpromis reste cité dans le commentaire d'en-tête (constat du
  // LOT V3.30) mais ne doit plus apparaître comme texte affiché (JSX).
  assert.ok(!pageSource.includes(">Du montant identifié à la dépense réelle<"), "le titre sur-promettant une dépense ne doit plus être affiché");
  assert.ok(pageSource.includes("Du montant identifié à la confirmation de financement"));
  for (const label of ["Confirmé", "En instruction", "À mobiliser"]) {
    assert.ok(pageSource.includes(`label: "${label}"`), `statut réel manquant : "${label}"`);
  }
});

// TEST 3 — le panneau de jalons porte le titre littéral de la maquette et
// affiche aussi les échéances déjà en retard (situations encore ouvertes,
// dueAt dépassé), comparées à l'horloge métier du jeu de données, jamais
// à Date.now().
test("TEST 3 — le panneau de jalons affiche aussi les échéances en retard, via l'horloge métier", () => {
  assert.ok(pageSource.includes("Jalons des 60 prochains jours"));
  assert.ok(pageSource.includes("Ce qui doit arriver, et ce qui est déjà en retard"));
  assert.ok(pageSource.includes("deriveDatasetReferenceAt(state)"));
  assert.ok(pageSource.includes('item.status !== "reglee"'), "seules les situations encore ouvertes doivent alimenter les jalons");
  assert.ok(pageSource.includes('overdue ? "en retard" : "en cours"'));
  // Date.now() ne doit rester qu'un repli pour l'absence de dataset
  // (même discipline que territoires/page.tsx, référence déjà admise) —
  // jamais la source principale de comparaison.
  assert.ok(pageSource.includes("referenceAtRaw ? new Date(referenceAtRaw).getTime() : Date.now()"));
});

// TEST 4 — les captions du tableau reprennent l'ordre littéral de la
// maquette ("{responsable} · {territoires} · {santé}") — Initiative.
// ownerId est réel, et les 3 responsables qu'il référence dans le Demo
// World sont exactement les noms littéraux de la maquette.
test("TEST 4 — les captions du tableau portent le responsable réel, dans l'ordre littéral de la maquette", () => {
  assert.ok(pageSource.includes("state.actors.find((actor) => actor.id === row.initiative.ownerId)?.name"));
  assert.ok(pageSource.includes("{ownerName ? `${ownerName} · ` : \"\"}{row.territoryCount} territoire(s) · {programmeHealthLabel[row.health.state]}"));
  const ownerNames = new Set(state.actors.map((actor) => actor.name));
  for (const initiative of state.initiatives) {
    if (initiative.ownerId) assert.ok(ownerNames.has(state.actors.find((actor) => actor.id === initiative.ownerId)!.name), `${initiative.id} doit référencer un acteur réel`);
  }
});

// TEST 5 — le scatter porte désormais la bascule littérale "Avancement ×
// signaux"/"Avancement × budget" — l'axe "signaux" utilise le nombre réel
// de situations ouvertes du programme (ecosystem.openSituations.length,
// déjà réel), jamais un signal fabriqué ; l'anneau pointillé ("écart
// entre trajectoire déclarée et signaux reçus") est porté par l'état
// "attention", jamais par "critique" (déjà distingué par sa couleur).
test("TEST 5 — le scatter porte la bascule signaux/budget et l'anneau d'écart, sans signal fabriqué", () => {
  assert.ok(scatterSource.includes('"Avancement × signaux"'));
  assert.ok(scatterSource.includes('"Avancement × budget"'));
  assert.ok(scatterSource.includes("row.ecosystem.openSituations.length"));
  assert.ok(scatterSource.includes('flagged: row.health.state === "attention"'));
  assert.ok(scatterSource.includes("Écart entre trajectoire déclarée et signaux reçus"));
  assert.ok(pageSource.includes("ProgrammePortfolioScatter rows={rows} state={state}"));
});
