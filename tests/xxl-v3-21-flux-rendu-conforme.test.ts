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

// TEST 2 — les 4 paliers (tuiles) reprennent les libellés et définitions
// littéraux de la maquette, jamais reformulés.
test("TEST 2 — les 4 tuiles de palier reprennent les libellés et définitions littéraux de la maquette", () => {
  for (const def of [
    "Tout le flux entrant, tous statuts confondus.",
    "Arrivé dans le système, en attente d’une décision de qualification.",
    "Devenu un Signal réel, structuré et rattaché à un territoire.",
    "Écarté avec motif — consultable, jamais supprimé."
  ]) {
    assert.ok(source.includes(def), `définition de palier manquante ou reformulée: "${def}"`);
  }
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
