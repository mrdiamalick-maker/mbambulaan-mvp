import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.16 ("Brief national — copie conforme du rendu maquette") —
// reconstruction complète de la page sur le plan exact de l'écran
// `isBrief` de la maquette, mandat explicite de l'utilisateur ("je veux
// exactement le rendu graphique du html avec les animations, les blocs,
// tout copie conforme [...] oublie tout l'existant"). Page "use client"
// avec hooks (useProduct, useState) — non montable via
// renderToStaticMarkup dans ce jeu de tests Node pur (même contrainte
// documentée pour tout le chrome/pages privées depuis le LOT V3.1) :
// vérifié par lecture de source. QA visuelle réelle (1440/1024/768/390,
// sans débordement, interaction de dépli testée) effectuée séparément en
// Playwright authentifié.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/app/app/etat/page.tsx");

// TEST 1 — les 6 blocs de la maquette sont bien présents (structure
// littérale, pas seulement un style aligné sur l'ancienne composition).
test("TEST 1 — le Brief national reconstruit reprend les 6 blocs de la maquette", () => {
  for (const marker of [
    "Lecture en 20 secondes",
    "Foyers d’attention",
    "Requiert votre attention",
    "Décisions attendues",
    "Programmes à surveiller",
    "Ce que le système ne sait pas encore"
  ]) {
    assert.ok(source.includes(marker), `bloc "${marker}" absent de la reconstruction`);
  }
});

// TEST 2 — le hero photo (ancienne composition, absente de la maquette)
// a bien été retiré, pas seulement habillé différemment.
test("TEST 2 — le hero photographique (absent de la maquette) a été retiré", () => {
  assert.ok(!source.includes("etat-brief-hero.webp"));
  assert.ok(!source.includes("etat-brief-decision-quai.webp"));
});

// TEST 3 — "Ce que le système ne sait pas encore" réutilise le VRAI
// registre de sources (LOT V3.7, dataSourceRegistry), jamais un second
// registre d'angles morts inventé pour cette page.
test("TEST 3 — les angles morts du Brief proviennent réellement de dataSourceRegistry", () => {
  assert.ok(source.includes('from "@/domain/data-sources"'));
  assert.ok(source.includes("dataSourceRegistry(state)"));
});

// TEST 4 — programmeProgressPct reste une dérivation vérifiable des
// VRAIS indicateurs (baseline/target/current), jamais un pourcentage
// inventé ; retourne null (jamais 0 fabriqué) quand aucun indicateur
// n'existe.
test("TEST 4 — programmeProgressPct est une dérivation honnête des indicateurs réels", () => {
  assert.ok(source.includes("function programmeProgressPct"));
  assert.ok(source.includes("if (programme.indicators.length === 0) return null;"));
});

// TEST 5 — les décisions attendues affichent l'échéance réelle
// (Situation.dueAt) quand elle existe, jamais une date fabriquée — "non
// daté" sinon.
test("TEST 5 — l'échéance des décisions attendues est réelle ou explicitement absente", () => {
  assert.ok(source.includes("situation.dueAt"));
  assert.ok(source.includes("non daté"));
});
