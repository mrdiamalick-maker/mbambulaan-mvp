import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.8 ("Shell pixel-fidelity") — PrivateSidebar/PrivateHeader/
// GlobalSearch sont "use client" avec hooks (usePathname, useRouter,
// useSidebar) non montables via renderToStaticMarkup dans ce jeu de tests
// Node pur (même contrainte déjà documentée pour tout le chrome partagé,
// cf. tests/xxl-v3-1-private-shell.test.ts). Vérifiés par lecture de
// source ; la QA visuelle réelle (1440/1024/768/390, sans débordement) a
// été effectuée séparément par capture d'écran authentifiée.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

// TEST 1 — la largeur du rail (246px, valeur exacte de la maquette) est
// posée sur CE SidebarProvider précis, jamais sur la constante partagée
// SIDEBAR_WIDTH (qui sert aussi TerrainShell.tsx, hors mandat).
test("TEST 1 — PrivateShell fixe --sidebar-width à 246px sans toucher la constante partagée", () => {
  const shellSource = readSource("../src/components/shell/PrivateShell.tsx");
  assert.ok(shellSource.includes('"--sidebar-width": "246px"'));
  const primitiveSource = readSource("../src/components/ui/sidebar.tsx");
  assert.ok(primitiveSource.includes('SIDEBAR_WIDTH = "16rem"'), "la constante partagée (TerrainShell compris) ne doit pas être modifiée par ce lot");
});

// TEST 2 — GlobalSearch reste une VRAIE recherche (jamais un champ
// décoratif) : indexe les entités réelles de ProductState et navigue vers
// une vraie route existante, jamais une route fabriquée.
test("TEST 2 — GlobalSearch indexe des entités réelles et navigue vers des routes réelles existantes", () => {
  const source = readSource("../src/components/shell/GlobalSearch.tsx");
  assert.ok(source.includes("state.situations.map"));
  assert.ok(source.includes("state.initiatives.map"));
  assert.ok(source.includes("state.territories.map"));
  assert.ok(source.includes("router.push(hit.href)"));
  // Les 3 routes utilisées existent réellement dans le produit (mêmes
  // hrefs que private-nav.ts / les pages déjà réelles).
  for (const href of ["/app/etat/situations", "/app/situations", "/app/etat/programmes", "/app/initiatives", "/app/etat/territoires", "/app/atlas"]) {
    assert.ok(source.includes(href), `route ${href} absente de l'index de recherche`);
  }
});

// TEST 3 — le bandeau "mode démo" affiche le VRAI décompte de sources
// connectées (LOT V3.7, dataSourceSummary) plutôt qu'un texte fixe de la
// maquette ("2 sources connectées sur 6 envisagées" y était une valeur
// figée à sa fixture).
test("TEST 3 — le bandeau démo de PrivateHeader utilise dataSourceSummary réel, jamais un texte figé", () => {
  const source = readSource("../src/components/shell/PrivateHeader.tsx");
  assert.ok(source.includes('from "@/domain/data-sources"'));
  assert.ok(source.includes("dataSourceSummary(state)"));
  assert.ok(!source.includes("2 sources connectées sur 6 envisagées"), "le chiffre doit être calculé, jamais écrit en dur");
});

// TEST 4 (renversé au LOT V3.29, "Header — copie conforme littérale,
// Décision CEO") — le sélecteur "Rôle connecté" (Ministre/Direction de
// programme/Coordination territoriale) EST réintroduit, littéralement,
// mais reste un APERÇU de mise en avant du menu, jamais un changement de
// rôle réel : il ne fait que réordonner (et, depuis le LOT V3.31, masquer
// certaines entrées — comme la maquette elle-même le fait pour Arbitrages/
// Résultats selon le rôle, cf. le commentaire de private-nav.ts) les
// vraies destinations, sans jamais retirer une capacité réellement
// accessible (la destination masquée reste atteignable par son URL et
// sous les 2 autres aperçus). L'arbitrage V3.1 ("pas de bascule de RÔLE
// RÉEL/permission libre") reste vrai : aucune permission, aucune donnée,
// aucun rôle de session n'est modifié par ce sélecteur.
test("TEST 4 — le sélecteur de rôle est réintroduit comme aperçu de menu, jamais comme un changement de rôle réel", () => {
  const headerSource = readSource("../src/components/shell/PrivateHeader.tsx");
  assert.ok(headerSource.includes("Rôle connecté"));
  for (const label of ["Ministre", "Direction de programme", "Coordination territoriale"]) {
    assert.ok(headerSource.includes(`label: "${label}"`), `bouton de rôle manquant : "${label}"`);
  }
  const navSource = readSource("../src/domain/platform/private-nav.ts");
  assert.ok(navSource.includes("export function reorderEtatNavForPreview"));
  assert.ok(!navSource.includes("session.role ="), "le sélecteur ne doit jamais réassigner le rôle réel de la session");
});

// TEST 5 — SidebarTrigger (bascule mobile/desktop réelle du rail, LOT
// V3.1) reste présent : la maquette est un gabarit desktop fixe sans
// équivalent, sa disparition supprimerait le seul moyen d'ouvrir la
// navigation sous 768px.
test("TEST 5 — SidebarTrigger reste présent (aucune régression de la bascule mobile)", () => {
  const source = readSource("../src/components/shell/PrivateHeader.tsx");
  assert.ok(source.includes("<SidebarTrigger"));
});
