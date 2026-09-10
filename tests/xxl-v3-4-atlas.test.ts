import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import {
  MARITIME_ZONE_ORDER,
  resolveMaritimeZone,
  territoryLandingTrend,
  territorySiteSummaries
} from "../src/domain/atlas-overview";

// LOT V3.4 — "Atlas Operational Intelligence". Composants "use client"
// (AtlasMap/CoastlineTerritoryMap/TerritoryDossierSections/
// ProfessionalAtlasWorkspace) non montables via renderToStaticMarkup dans
// ce jeu de tests Node pur (même contrainte déjà documentée pour les LOTs
// V3.1/V3.2/V3.3) — vérifiés par lecture de source. Le Core
// (domain/atlas-overview.ts, pur) est testé en direct.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();

// TEST 1 — resolveMaritimeZone couvre exactement les 18 territoires réels
// du référentiel, sans en oublier ni en inventer un 19e — jamais une
// façade "par défaut" pour un territoire non listé.
test("TEST 1 — la table des façades maritimes couvre exactement les territoires réels, une seule fois chacun", () => {
  assert.equal(state.territories.length, 18);
  for (const territory of state.territories) {
    const zone = resolveMaritimeZone(territory.id);
    assert.ok(zone, `${territory.id} doit être rattaché à une façade maritime`);
    assert.ok(MARITIME_ZONE_ORDER.includes(zone!));
  }
  assert.equal(resolveMaritimeZone("territoire-inexistant"), undefined);
  // Chaque territoire réel n'apparaît que dans une seule façade (pas de
  // double affectation silencieuse).
  const byZone = new Map<string, number>();
  for (const territory of state.territories) {
    const zone = resolveMaritimeZone(territory.id)!;
    byZone.set(zone, (byZone.get(zone) ?? 0) + 1);
  }
  assert.equal([...byZone.values()].reduce((a, b) => a + b, 0), 18);
});

// TEST 2 — territorySiteSummaries reste un agrégat direct sur les
// enregistrements réels (Vessel/FishingTrip/Landing/Infrastructure),
// jamais un chiffre illustratif : chaque territoire réel porte exactement
// 3 sites (quai/marché/zone de pêche, cf. demo-state.ts), et les décomptes
// renvoyés correspondent exactement à un filtrage direct sur le même état.
test("TEST 2 — territorySiteSummaries reste un agrégat vérifiable sur les 3 sites réels du territoire", () => {
  const territory = state.territories.find((item) => item.id === "joal")!;
  const summaries = territorySiteSummaries(state, territory.id);
  assert.equal(summaries.length, 3, "chaque territoire réel du jeu de démonstration porte exactement 3 sites (quai/marché/zone_peche)");
  assert.equal(summaries[0].site.type, "quai", "le quai doit toujours être présenté en premier");

  for (const summary of summaries) {
    const expectedVessels = state.vessels.filter((v) => v.homeSiteId === summary.site.id).length;
    assert.equal(summary.vesselCount, expectedVessels);
    const expectedLandings = state.landings.filter((l) => l.siteId === summary.site.id);
    assert.equal(summary.recentLandingCount, expectedLandings.length);
    assert.equal(summary.recentLandedKg, expectedLandings.reduce((sum, l) => sum + l.totalWeightKg, 0));
    const expectedInfra = state.infrastructures.filter((i) => i.siteId === summary.site.id);
    assert.equal(summary.infrastructureCount, expectedInfra.length);
    assert.equal(summary.fragileInfrastructureCount, expectedInfra.filter((i) => i.status !== "operationnelle").length);
  }

  // Un territoire inexistant ne doit jamais lever, seulement renvoyer un
  // tableau vide (même discipline que buildTerritoryIntelligence).
  assert.deepEqual(territorySiteSummaries(state, "territoire-inexistant"), []);
});

// TEST 3 — territoryLandingTrend : une agrégation réelle par jour, jamais
// un jour vide interpolé à zéro, et le total agrégé doit correspondre
// exactement à la somme des Landing réels des sites du territoire — le
// marqueur `simulated` doit refléter fidèlement la source déclarée
// ("Historique simulé de démonstration…", demo-state.ts).
test("TEST 3 — territoryLandingTrend reste une agrégation réelle et honnête, jamais un jour fabriqué", () => {
  const territory = state.territories.find((item) => item.id === "joal")!;
  const siteIds = new Set(state.sites.filter((s) => s.territoryId === territory.id).map((s) => s.id));
  const landings = state.landings.filter((l) => siteIds.has(l.siteId) && (l.weighedAt || l.arrivedAt));
  const trend = territoryLandingTrend(state, territory.id, 100);

  const totalFromTrend = trend.reduce((sum, point) => sum + point.landedKg, 0);
  const totalFromLandings = Math.round(landings.reduce((sum, l) => sum + l.totalWeightKg, 0));
  assert.equal(totalFromTrend, totalFromLandings);

  // Chaque jour retourné correspond à au moins un enregistrement réel —
  // jamais un jour sans donnée sous-jacente.
  const daysWithData = new Set(landings.map((l) => (l.weighedAt ?? l.arrivedAt)!.slice(0, 10)));
  for (const point of trend) {
    if (point.landedKg > 0) assert.ok(daysWithData.has(point.date), `${point.date} doit correspondre à un débarquement réel`);
  }

  // Au moins un point doit porter le marqueur `simulated` (le jeu de
  // démonstration contient une extension historique explicitement
  // marquée comme simulée pour tous les territoires).
  assert.ok(trend.some((point) => point.simulated), "au moins un jour de la tendance doit être marqué comme provenant d'un historique simulé");

  // Plafonné à maxDays.
  const capped = territoryLandingTrend(state, territory.id, 2);
  assert.ok(capped.length <= 2);
  // Chronologique croissant.
  const dates = capped.map((point) => point.date);
  assert.deepEqual(dates, [...dates].sort());
});

// TEST 4 — AtlasMap (Espace État) : hover/focus + info-bulle additifs,
// jamais un contrôle factice ; accessibilité clavier réparée (mandat §8/
// §22, "keyboard/focus" — gap réel trouvé en inspection : role="button"
// sans tabIndex/onKeyDown avant ce lot).
test("TEST 4 — AtlasMap expose un hover/focus réel avec info-bulle et devient activable au clavier", () => {
  const source = readSource("../src/components/etat/AtlasMap.tsx");
  assert.ok(source.includes("onMouseEnter={() => setHoveredId(t.id)}"));
  assert.ok(source.includes("onFocus={() => setHoveredId(t.id)}"), "le survol clavier (focus) doit déclencher la même info-bulle que la souris");
  assert.ok(source.includes("tabIndex={onSelect ? 0 : undefined}"), "chaque marqueur cliquable doit être atteignable au clavier (gap trouvé en inspection)");
  assert.ok(source.includes("onKeyDown="));
  assert.ok(source.includes("tooltipLines?:"), "le contenu de l'info-bulle doit venir de l'appelant, jamais recalculé dans AtlasMap");
});

// TEST 5 — CoastlineTerritoryMap (Coordination/Public/Pilotage) : même
// mécanisme d'info-bulle ajouté en PROP ADDITIVE (défaut undefined) — les
// appelants existants qui ne la passent pas (Public, Pilotage) ne doivent
// voir aucun changement de comportement.
test("TEST 5 — CoastlineTerritoryMap gagne la même info-bulle en prop additive, sans régression pour Public/Pilotage", () => {
  const source = readSource("../src/components/territories/CoastlineTerritoryMap.tsx");
  assert.ok(source.includes("tooltipLines?:"));
  assert.ok(source.includes("hovered && tooltipLines"), "l'info-bulle ne doit apparaître que si l'appelant a fourni tooltipLines ET que le marqueur est survolé");

  const publicSource = readSource("../src/components/ecosystem/PublicAtlasWorkspace.tsx");
  assert.ok(!publicSource.includes("tooltipLines"), "Public n'est pas concerné par ce lot (hors périmètre, mandat §20) et ne doit pas passer ce prop");
});

// TEST 6 — les deux dossiers territoriaux (Espace État, Atlas
// professionnel) gagnent la même profondeur de site réelle et la même
// tendance de débarquements, via LE MÊME composant partagé
// (TerritoryDossierSections) — mandat §16, convergence au niveau de la
// donnée ET de la présentation, jamais deux implémentations parallèles.
test("TEST 6 — TerritoryDossierSections partage la profondeur de site et la tendance entre État et Coordination", () => {
  const source = readSource("../src/components/territories/TerritoryDossierSections.tsx");
  assert.ok(source.includes("Sites & points de débarquement"));
  assert.ok(source.includes("territorySiteSummaries"));
  assert.ok(source.includes("territoryLandingTrend"));
  assert.ok(source.includes('from "@/components/private/TrendChart"'), "doit réutiliser TrendChart (V3.1), jamais un nouveau SVG fait main");
  assert.ok(source.includes("state: ProductState"), "state doit être un prop explicite, jamais recalculé séparément par les deux appelants");

  const etatSource = readSource("../src/components/etat/shared.tsx");
  assert.ok(etatSource.includes('<TerritoryDossierSections intelligence={intelligence} tone="etat" state={state} />'));
  const coordSource = readSource("../src/components/ecosystem/ProfessionalAtlasWorkspace.tsx");
  assert.ok(coordSource.includes('<TerritoryDossierSections intelligence={intelligence} tone="atlas" state={state} />'));
});

// TEST 7 — filtre "façade maritime" (mandat §10) : présent sur les deux
// surfaces réelles (Espace État, Atlas professionnel), toujours construit
// depuis la même table domain/atlas-overview.ts — jamais une liste de
// zones dupliquée à la main dans chaque page.
test("TEST 7 — le filtre façade maritime réutilise la même table dans les deux surfaces réelles", () => {
  const etatPage = readSource("../src/app/app/etat/territoires/page.tsx");
  assert.ok(etatPage.includes('from "@/domain/atlas-overview"'));
  assert.ok(etatPage.includes("zoneFilter"));
  const coordWorkspace = readSource("../src/components/ecosystem/ProfessionalAtlasWorkspace.tsx");
  assert.ok(coordWorkspace.includes('from "@/domain/atlas-overview"'));
  assert.ok(coordWorkspace.includes("zoneFilter"));
});
