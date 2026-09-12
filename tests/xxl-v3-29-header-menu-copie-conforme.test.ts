import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { reorderEtatNavForPreview, resolvePrivateNavGroups } from "../src/domain/platform/private-nav";

// LOT V3.29 ("Header + menu — copie conforme littérale, Décision CEO") —
// 2 contrôles de la maquette jamais reproduits jusqu'ici, malgré 7 lots
// de fidélité littérale sur les 8 écrans de l'Espace État : le bandeau
// période (30 jours/90 jours/12 mois + la plage de dates réelle qui en
// découle) et le sélecteur "Rôle connecté" (Ministre/Direction de
// programme/Coordination territoriale), qui réordonne réellement le
// menu dans le bundle standalone.html (vérifié par clic réel : 3 ordres
// différents, certaines entrées absentes selon le rôle).
//
// Ce produit n'a que 2 rôles réels atteignant l'Espace État (institution,
// administrateur — etat/layout.tsx) : le sélecteur reste donc un APERÇU
// de mise en avant du menu (EtatPreviewProvider), jamais un changement de
// rôle réel — il réordonne les vraies destinations, jamais n'en masque
// aucune (contrairement à la maquette elle-même).
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

// TEST 1 — reorderEtatNavForPreview reprend les 3 ordres littéraux
// vérifiés par clic réel dans le bundle standalone.html, sans jamais
// supprimer une destination réelle (contrairement à la maquette qui fait
// disparaître Arbitrages/Résultats selon le rôle).
test("TEST 1 — reorderEtatNavForPreview reprend les 3 ordres littéraux sans jamais supprimer de destination", () => {
  const groups = resolvePrivateNavGroups("etat", "institution", []);
  const items = groups[0].items;
  assert.equal(items.length, 7);

  const ministre = reorderEtatNavForPreview(items, "ministre").map((i) => i.href);
  assert.deepEqual(ministre, ["/app/etat", "/app/etat/territoires", "/app/etat/situations", "/app/etat/arbitrages", "/app/etat/programmes", "/app/etat/rapport", "/app/etat/sources"]);

  const direction = reorderEtatNavForPreview(items, "direction_programme").map((i) => i.href);
  assert.equal(direction[0], "/app/etat/programmes");
  assert.equal(direction[1], "/app/etat/rapport");
  assert.equal(direction[direction.length - 1], "/app/etat/arbitrages", "Arbitrages est absent de la maquette pour ce rôle — relégué en fin de liste, jamais supprimé");
  assert.equal(direction.length, 7, "aucune destination réelle n'est supprimée, contrairement à la maquette");

  const coordination = reorderEtatNavForPreview(items, "coordination_territoriale").map((i) => i.href);
  assert.equal(coordination[0], "/app/etat/situations");
  assert.equal(coordination[coordination.length - 1], "/app/etat/rapport", "Résultats est absent de la maquette pour ce rôle — relégué en fin de liste, jamais supprimé");
  assert.equal(coordination.length, 7);
});

// TEST 2 — "Flux entrant" est ajouté au menu État pour administrateur
// (qui porte déjà réellement les 2 permissions de qualification), jamais
// pour institution (qui ne les porte pas — un lien affiché mais mort
// serait pire que son absence).
test("TEST 2 — Flux entrant est ajouté au menu État seulement pour le rôle qui porte réellement la permission", () => {
  const institutionGroups = resolvePrivateNavGroups("etat", "institution", []);
  assert.ok(!institutionGroups[0].items.some((item) => item.href === "/app/flux"));

  const administrateurGroups = resolvePrivateNavGroups("etat", "administrateur", []);
  assert.ok(administrateurGroups[0].items.some((item) => item.href === "/app/flux"));
});

// TEST 3 — le bandeau période de l'en-tête (30 jours/90 jours/12 mois +
// plage de dates réelle) est bien présent et réellement câblé sur
// l'Atlas territorial (LOT V3.28), jamais un habillage sans effet.
test("TEST 3 — le bandeau période est réel et alimente le filtrage de l'Atlas territorial", () => {
  const headerSource = readSource("../src/components/shell/PrivateHeader.tsx");
  for (const label of ["30 jours", "90 jours", "12 mois"]) {
    assert.ok(headerSource.includes(`label: "${label}"`), `option de période manquante : "${label}"`);
  }
  assert.ok(headerSource.includes("deriveDatasetReferenceAt(state)"));

  const atlasSource = readSource("../src/app/app/etat/territoires/page.tsx");
  assert.ok(atlasSource.includes("useEtatPreview()"));
  assert.ok(atlasSource.includes("periodDays"));
  assert.ok(!atlasSource.includes("const PERIOD_MS ="), "l'ancienne fenêtre de 30 jours figée ne doit plus exister");
});

// TEST 4 — EtatPreviewProvider ne modifie jamais le rôle réel de la
// session — seulement un état client d'aperçu (période/rôle affiché),
// jamais une nouvelle permission ni une nouvelle donnée.
test("TEST 4 — EtatPreviewProvider reste un aperçu client, jamais un changement de rôle ou de permission réel", () => {
  const providerSource = readSource("../src/components/providers/EtatPreviewProvider.tsx");
  assert.ok(!providerSource.includes("fetch("), "le provider ne doit faire aucun appel réseau — état client pur");
  assert.ok(providerSource.includes("previewRole"));
  const navSource = readSource("../src/domain/platform/private-nav.ts");
  assert.ok(!navSource.includes('from "@/server/session"'), "private-nav.ts (le vrai modèle d'autorisation) ne doit jamais importer la session réelle pour la faire dépendre de l'aperçu client");
  assert.ok(navSource.includes("changement de rôle réel"), "la fonction de réordonnancement doit documenter explicitement qu'elle ne touche jamais au rôle réel");
});
