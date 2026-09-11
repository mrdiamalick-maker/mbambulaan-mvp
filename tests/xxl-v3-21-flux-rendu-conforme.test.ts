import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.21 ("Flux entrant — vérification de conformité, dernier des 8
// écrans du mandat "copie conforme"") — contrairement aux LOTs V3.16-19
// (reconstructions complètes), cet écran (`isFlux` de la maquette) a été
// inspecté et QA-vérifié SANS nécessiter de réécriture : FluxExplorer.tsx
// (LOT V3.3) reprend déjà mot pour mot l'eyebrow, le h1, le paragraphe
// d'intro et les 4 définitions de palier de la maquette, sur la même
// composition 400px/1fr liste+détail. Reconstruire ce composant aurait
// fait courir un risque de régression sans gain de fidélité — même
// discipline que pour Résultats (LOT V3.20, composant déjà substantiellement
// fidèle). QA Playwright réelle : 0 débordement horizontal à 1440/1024/
// 768/390px, aucune erreur console, sur /app/flux connecté en
// demo@mbambulaan.sn.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/components/flux/FluxExplorer.tsx");

// TEST 1 — l'eyebrow, le h1 et le paragraphe d'intro reprennent le texte
// littéral exact de la maquette (aucune paraphrase).
test("TEST 1 — l'en-tête de Flux entrant reprend le texte littéral exact de la maquette", () => {
  assert.ok(source.includes("Flux entrant"));
  assert.ok(source.includes("L’information reçue n’est pas encore de la connaissance"));
  assert.ok(source.includes("Rien n’apparaît dans un tableau de bord, une situation ou un résultat sans avoir été qualifié"));
});

// TEST 2 (corrigé au LOT V3.22, "copie conforme littérale") — la
// maquette montre 4 tuiles ("Reçu"/"À qualifier"/"Qualifié"/"Écarté"),
// mais "Reçu" et "À qualifier" recouvrent la MÊME valeur réelle
// "nouveau" du domaine (IncomingMessage ne porte pas cette
// sous-distinction, cf. tests/xxl-v3-3-flux.test.ts TEST 1) : jamais
// dupliquer une seule valeur réelle sous 2 tuiles pour atteindre 4 —
// 3 tuiles, littérales sur tout le reste (libellé "Qualifié" repris mot
// pour mot au lieu de "Converti en signal", même définition). La tuile
// "Toutes" (4e tuile du LOT V3.3) n'existe pas dans la maquette et a été
// retirée.
test("TEST 2 — les 3 tuiles de palier réelles reprennent les libellés et définitions littéraux de la maquette", () => {
  for (const def of [
    "Arrivé dans le système, en attente d’une décision de qualification.",
    "Devenu situation, capacité, acteur ou intelligence programme.",
    "Écarté avec motif — consultable, jamais supprimé."
  ]) {
    assert.ok(source.includes(def), `définition de palier manquante ou reformulée: "${def}"`);
  }
  assert.ok(source.includes('label: "Qualifié"'), "le libellé littéral \"Qualifié\" doit remplacer \"Converti en signal\"");
  assert.ok(!source.includes('label: "Toutes"'), "la tuile \"Toutes\" n'existe pas dans la maquette — jamais réintroduite");
  assert.ok(source.includes("mb-rise"), "l'animation d'entrée littérale de la maquette doit être appliquée");
});

// TEST 3 — la composition 400px/1fr (liste + détail) de la maquette reste
// en place, jamais remplacée par une autre grille.
test("TEST 3 — la grille liste/détail reste 400px/1fr comme dans la maquette", () => {
  assert.ok(source.includes("lg:grid-cols-[400px_1fr]"));
});

// TEST 4 — aucune donnée fabriquée n'a été introduite pour "coller" à la
// maquette : le pipeline reste le vrai IncomingMessage → Signal (mandat
// §8, LOT V3.3), jamais une entité "Dossier" persistée créée pour cet écran.
test("TEST 4 — le pipeline réel IncomingMessage/Signal reste inchangé, aucune entité fabriquée introduite", () => {
  assert.ok(source.includes("fluxStats(state)"));
  assert.ok(source.includes("fluxChannelDistribution(state)"));
  assert.ok(source.includes("aucune commande, aucune entité \"Dossier\" persistée n'est créée ici"), "le mandat §8 (jamais de \"Dossier\" persisté) doit rester documenté et respecté");
});
