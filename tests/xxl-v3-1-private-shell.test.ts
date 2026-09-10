import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolveActiveHref, resolvePrivateNavGroups, roleLabel, spaceIdentityLabel } from "../src/domain/platform/private-nav";

// LOT V3.1 — "Private Operating Environment Foundation". Les composants
// visés ici (PrivateShell/PrivateSidebar/PrivateHeader/DetailSurface/
// TrendChart/primitives.tsx) sont tous "use client" avec hooks Radix/
// recharts (Portal, ResizeObserver) qui exigent un vrai DOM navigateur —
// non montables via renderToStaticMarkup dans ce jeu de tests Node pur
// (même contrainte déjà documentée pour CoordinationWorkspace.tsx/
// EtatSidebar.tsx avant ce lot). Vérifiés par lecture de source, comme le
// reste du chrome partagé (cf. tests/p21b1-session-state-isolation.test.ts)
// — la QA visuelle réelle (rendu navigateur, 1440/1024/768/390) est
// couverte séparément par capture d'écran, pas par ce fichier.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

// TEST 1 — resolvePrivateNavGroups reste l'unique source de navigation,
// permission-driven (Scope B) : aucune route/rôle/module ne change de
// comportement par rapport aux deux anciennes listes (AppSidebar.
// operationalGroups/toolsGroup, EtatSidebar.navItems) qu'elle remplace.
test("TEST 1 — resolvePrivateNavGroups reprend exactement les routes/rôles/modules réels existants", () => {
  // Espace État : 6 destinations réelles, ouvertes à institution ET administrateur (seuls rôles qui atteignent /app/etat).
  for (const role of ["institution", "administrateur"] as const) {
    const groups = resolvePrivateNavGroups("etat", role, []);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].items.length, 6);
  }
  // Coordination : un opérateur sans aucun module d'entitlement ne voit que
  // "Aujourd'hui" et "Flux entrant" (LOT V3.3 — role-gated, jamais un
  // module d'entitlement commercial, même discipline que "Aujourd'hui") —
  // jamais Coordination/Opérations (module-gated).
  const operateurSansModule = resolvePrivateNavGroups("coordination", "operateur", []);
  assert.deepEqual(operateurSansModule.flatMap((g) => g.items.map((i) => i.href)), ["/app/travail", "/app/flux"]);
  // Un partenaire garde bien accès à "Réseau" (rôle explicitement listé), jamais à "Opérations" (rôle absent de la liste de cet item).
  const partenaire = resolvePrivateNavGroups("coordination", "partenaire", []);
  const hrefs = partenaire.flatMap((g) => g.items.map((i) => i.href));
  assert.ok(hrefs.includes("/app/organisation"));
  assert.ok(!hrefs.includes("/app/operations"));
});

// TEST 2 — resolveActiveHref : une seule destination active à la fois,
// même quand une route est le préfixe d'une autre (bug trouvé en QA
// visuelle réelle sur /app/etat/territoires — cf. tests/
// xxl-rc1-release-polish.test.ts TEST A2 pour la couverture détaillée).
test("TEST 2 — resolveActiveHref élit toujours la destination la plus spécifique", () => {
  const groups = resolvePrivateNavGroups("etat", "institution", []);
  const activeHrefs = ["/app/etat", "/app/etat/rapport", "/app/inexistant"].map((path) => resolveActiveHref(path, groups));
  assert.deepEqual(activeHrefs, ["/app/etat", "/app/etat/rapport", null]);
});

// TEST 3 — roleLabel/spaceIdentityLabel restent les seules sources de ces
// libellés (déplacés depuis AppSidebar.tsx, repris à l'identique — aucun
// libellé de rôle ne doit changer de texte par ce lot).
test("TEST 3 — roleLabel/spaceIdentityLabel gardent les libellés existants", () => {
  assert.equal(roleLabel("institution"), "Ministère");
  assert.equal(roleLabel("coordinateur"), "Coordinateur territorial");
  assert.equal(spaceIdentityLabel("etat"), "Espace État");
});

// TEST 4 — le rail partagé (PrivateSidebar) et l'en-tête partagé
// (PrivateHeader) sont bien montés par les DEUX layouts serveur, plus
// aucune trace des coquilles superseded (AppShell/AppSidebar/SiteHeader/
// InstitutionShell/InstitutionProductShell/EtatSidebar) dans le code
// vivant.
test("TEST 4 — les deux layouts serveur montent la même coquille partagée", () => {
  const etatLayout = readSource("../src/app/app/etat/layout.tsx");
  const coordLayout = readSource("../src/app/app/(coordination)/layout.tsx");
  assert.ok(etatLayout.includes('ProductShell space="etat"'));
  assert.ok(coordLayout.includes('ProductShell space="coordination"'));
  const shellSource = readSource("../src/components/shell/ProductShell.tsx");
  assert.ok(shellSource.includes("PrivateShell"));
});

// TEST 5 — DetailSurface (Scope F) : bâtie sur Sheet/Radix Dialog (focus-trap,
// portail, ARIA réels), jamais une réimplémentation de la gestion clavier/
// scroll déjà présente dans Drawer.tsx. Migration validée sur EXACTEMENT un
// point d'usage (dossier territorial) — les deux autres Drawer de la même
// page restent inchangés, comme demandé par le mandat.
test("TEST 5 — DetailSurface s'appuie sur Sheet (Radix), pas sur une réimplémentation de Drawer", () => {
  const source = readSource("../src/components/private/DetailSurface.tsx");
  assert.ok(source.includes('from "@/components/ui/sheet"'));
  assert.ok(!source.includes("addEventListener(\"keydown\""), "DetailSurface ne doit pas réimplémenter la gestion Échap déjà fournie par Radix Dialog");

  const territoiresSource = readSource("../src/app/app/etat/territoires/page.tsx");
  const detailSurfaceUsages = territoiresSource.match(/<DetailSurface\b/g) ?? [];
  const drawerUsages = territoiresSource.match(/<Drawer\b/g) ?? [];
  assert.equal(detailSurfaceUsages.length, 1, "un seul point d'usage migré vers DetailSurface, comme demandé (valider, pas migrer chaque écran)");
  assert.equal(drawerUsages.length, 2, "les deux autres Drawer (Situation, Planifier la mission) doivent rester inchangés sur cette même page");
});

// TEST 6 — TrendChart (Scope E) : la décision technique retenue (recharts +
// ChartContainer, déjà présents dans le dépôt) est bien celle réellement
// consommée, pas une nouvelle dépendance ni un SVG fait main de plus.
test("TEST 6 — TrendChart adopte recharts/ChartContainer (déjà présents), aucune nouvelle dépendance", () => {
  const source = readSource("../src/components/private/TrendChart.tsx");
  assert.ok(source.includes('from "recharts"'));
  assert.ok(source.includes('from "@/components/ui/chart"'));
  const packageJson = readSource("../package.json");
  assert.ok(packageJson.includes('"recharts"'), "recharts doit déjà être une dépendance déclarée (aucune nouvelle dépendance ajoutée par ce lot)");
  // Les graphiques existants (mandat : "ne pas reconstruire Résultats")
  // restent des <div>/SVG faits main, non touchés par ce lot.
  const existingCharts = readSource("../src/components/etat/EtatDataVisualizations.tsx");
  assert.ok(!existingCharts.includes('from "recharts"'), "EtatDataVisualizations.tsx (Signal/ResultTrendChart) ne doit pas être migré ce lot");
});

// TEST 7 — primitives.tsx (Scope D) : chaque primitive enveloppe une brique
// shadcn/ui déjà présente (tooltip.tsx, badge.tsx), jamais une
// réimplémentation parallèle ; StatusChip mappe vers des jetons de couleur
// déjà verrouillés ailleurs dans le Produit, jamais une teinte inventée.
test("TEST 7 — les primitives Scope D enveloppent des briques shadcn/ui existantes, sans nouvelle teinte", () => {
  const source = readSource("../src/components/private/primitives.tsx");
  assert.ok(source.includes('from "@/components/ui/tooltip"'));
  assert.ok(source.includes('from "@/components/ui/badge"'));
  assert.ok(source.includes('role="tablist"') && source.includes('role="tab"'), "SegmentedControl doit exposer une sémantique tablist/tab réelle");
  for (const token of ["var(--mb-success", "var(--etat-ocre", "var(--etat-critique"]) {
    assert.ok(source.includes(token), `StatusChip doit réutiliser le jeton verrouillé ${token} plutôt qu'une couleur choisie au hasard`);
  }
});
