import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import { portfolioAvgProgressPct, portfolioRows } from "../src/domain/programme-intelligence";
import { fluxStats, projectFluxContext } from "../src/domain/incoming-message";
import { reorderEtatNavForPreview, resolvePrivateNavGroups } from "../src/domain/platform/private-nav";

// LOT V3.31 ("dynamisme du rôle connecté") — retour explicite de
// l'utilisateur : le sélecteur "Rôle connecté" ne doit pas SEULEMENT
// réordonner le menu (LOT V3.29) — il doit changer le contenu narratif
// réel affiché, exactement comme le fait la maquette (comparaison directe
// de role-Ministre.png/role-Directiondeprogramme.png/role-
// Coordinationterritoriale.png). Ce fichier couvre les 3 volets touchés :
// le H1/TLDR du Brief national, la légende du bandeau démo de l'en-tête,
// et le masquage (pas seulement la relégation) de certaines entrées de
// menu par rôle.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();
const briefSource = readSource("../src/app/app/etat/page.tsx");
const headerSource = readSource("../src/components/shell/PrivateHeader.tsx");

// TEST 1 — le Brief national calcule un H1 ET un TLDR distincts par rôle,
// à partir de lectures RÉELLES déjà utilisées ailleurs dans le Produit
// (portfolioRows/programmeHealth pour Direction de programme, fluxStats/
// projectFluxContext pour Coordination territoriale) — jamais un second
// jeu de données, jamais un pourcentage inventé.
test("TEST 1 — le H1/TLDR du Brief national dérive de lectures réelles distinctes par rôle", () => {
  assert.ok(briefSource.includes("useEtatPreview()"));
  assert.ok(briefSource.includes("portfolioRows(state)"));
  assert.ok(briefSource.includes('row.health.state === "critique"'));
  assert.ok(briefSource.includes("fluxStats(state)"));
  assert.ok(briefSource.includes("projectFluxContext(state, item).missing.length === 0"));
  // "Relais de quai mandaté" (maquette) n'a aucun champ réel équivalent
  // (déjà établi à l'Atlas territorial) — jamais fabriqué ici non plus.
  assert.ok(!briefSource.includes("relais de quai mandaté"));
  assert.ok(briefSource.includes("item.trust !== \"verifiee\""), "le TLDR Coordination doit s'appuyer sur Situation.trust (réel), jamais un champ inventé");

  const rows = portfolioRows(state);
  const dpCriticalCount = rows.filter((row) => row.health.state === "critique").length;
  const flux = fluxStats(state);
  assert.ok(dpCriticalCount >= 0 && dpCriticalCount <= state.initiatives.length);
  assert.ok(flux.nouveau >= 0);
  // portfolioAvgProgressPct reste borné (jamais forcé à 0 par une
  // division par zéro silencieuse) — même garantie que Programmes V3.30.
  const avg = portfolioAvgProgressPct(rows);
  if (avg !== null) assert.ok(avg >= 0 && avg <= 100);
});

// TEST 2 — le Ministre garde le H1 déjà réel (briefHeadline, LOT V3.16),
// jamais un second calcul qui pourrait diverger ; le TLDR ministre reste
// une extension du TLDR existant (briefTldr), jamais un texte reformulé.
test("TEST 2 — le rôle Ministre réutilise les calculs déjà réels, jamais un doublon divergent", () => {
  assert.ok(briefSource.includes("ministre: briefHeadline"));
  assert.ok(briefSource.includes("ministre: `${briefTldr}"));
});

// TEST 3 — le bandeau démo de l'en-tête porte une légende littérale par
// rôle (vérifiée par capture réelle), jamais un texte fabriqué pour
// "Direction de programme"/"Coordination territoriale" ; "6 modules" (rôle
// Ministre) est un compte réel du menu institution, pas un chiffre choisi
// au hasard.
test("TEST 3 — la légende du bandeau démo est littérale et réelle par rôle", () => {
  assert.ok(headerSource.includes("Direction de programme · portefeuille et exécution en premier"));
  assert.ok(headerSource.includes("Coordination territoriale · qualification et terrain en premier"));
  assert.ok(headerSource.includes('resolvePrivateNavGroups("etat", "institution", [])'));
  const institutionCount = resolvePrivateNavGroups("etat", "institution", []).flatMap((g) => g.items).filter((item) => item.href !== "/app/etat").length;
  assert.equal(institutionCount, 6, "le chiffre littéral de la maquette (6 modules) doit rester vrai pour le menu institution réel");
});

// TEST 4 — reorderEtatNavForPreview masque désormais Arbitrages pour
// Direction de programme et Résultats pour Coordination territoriale
// (copie conforme de la maquette), sans jamais toucher aux 2 rôles réels
// (institution/administrateur conservent toutes leurs destinations en
// dehors de tout aperçu).
test("TEST 4 — le masquage par rôle est réel (littéral) sans jamais toucher aux permissions réelles", () => {
  const items = resolvePrivateNavGroups("etat", "administrateur", []).flatMap((g) => g.items);
  assert.ok(items.some((item) => item.href === "/app/etat/arbitrages"), "hors aperçu, administrateur voit bien Arbitrages");
  assert.ok(items.some((item) => item.href === "/app/etat/rapport"), "hors aperçu, administrateur voit bien Résultats");

  const direction = reorderEtatNavForPreview(items, "direction_programme");
  assert.ok(!direction.some((item) => item.href === "/app/etat/arbitrages"));
  const coordination = reorderEtatNavForPreview(items, "coordination_territoriale");
  assert.ok(!coordination.some((item) => item.href === "/app/etat/rapport"));

  // Le masquage reste réversible et propre à l'aperçu : ré-appliquer
  // "ministre" restitue les 8 destinations réelles d'administrateur.
  const ministre = reorderEtatNavForPreview(items, "ministre");
  assert.equal(ministre.length, items.length);
});
