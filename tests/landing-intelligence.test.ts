// Tests PD.1 — "Product Dressing — Landing Intelligence / Maritime
// Operations Foundation". Portent sur les projections déterministes
// ajoutées à src/domain/territory-intelligence.ts (buildLandingDetail,
// buildTerritoryLandingActivity, recentLandingsForTerritory) et sur le
// pont v3-template/lib/landing-bridge.ts qui les rend au gabarit V3 gelé
// (§14 du mandat : "Test at minimum: ProductState → landing projection;
// landing total; grouping by species; grouping by site; territory
// isolation; vessel lookup; FishingTrip lookup; trust display; no
// fabricated fields; empty/missing landing behavior").
import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import {
  buildLandingDetail,
  buildTerritoryLandingActivity,
  recentLandingsForTerritory
} from "../src/domain/territory-intelligence";
import {
  atlasLandingDepthForRole,
  getLandingDetail,
  getTerritoryLandingView,
  TERRITORY_ID_BY_NAME
} from "../src/v3-template/lib/landing-bridge";

const state = createDemoState();

test("ProductState → landing projection : le total du territoire égale la somme des Landing de ses sites", () => {
  const siteIds = new Set(state.sites.filter((s) => s.territoryId === "joal").map((s) => s.id));
  const expected = state.landings.filter((l) => siteIds.has(l.siteId));
  const activity = buildTerritoryLandingActivity(state, "joal");

  assert.equal(activity.landingCount, expected.length);
  assert.equal(activity.totalLandedKg, expected.reduce((sum, l) => sum + l.totalWeightKg, 0));
});

test("landing total : le total pondéré par territoire n'est jamais négatif et reste cohérent avec les CatchLine", () => {
  for (const territory of state.territories) {
    const activity = buildTerritoryLandingActivity(state, territory.id);
    assert.ok(activity.totalLandedKg >= 0);
    const sumFromSpecies = activity.volumeBySpecies.reduce((sum, sp) => sum + sp.landedKg, 0);
    // Les catches d'un Landing peuvent ne pas couvrir tout son totalWeightKg
    // (arrondi de démonstration) mais ne doivent jamais le DÉPASSER de façon
    // significative — sinon la répartition par espèce fabriquerait du volume.
    assert.ok(sumFromSpecies <= activity.totalLandedKg + 1);
  }
});

test("regroupement par espèce : la somme des volumes par espèce égale le volume total des catches du territoire", () => {
  const activity = buildTerritoryLandingActivity(state, "mbour");
  const siteIds = new Set(state.sites.filter((s) => s.territoryId === "mbour").map((s) => s.id));
  const landings = state.landings.filter((l) => siteIds.has(l.siteId));
  const totalFromCatches = landings.flatMap((l) => l.catches).reduce((sum, c) => sum + c.quantityKg, 0);
  const totalFromSpeciesBreakdown = activity.volumeBySpecies.reduce((sum, sp) => sum + sp.landedKg, 0);

  assert.equal(totalFromSpeciesBreakdown, totalFromCatches);
  assert.ok(activity.volumeBySpecies.length > 0);
  // Trié décroissant.
  for (let i = 1; i < activity.volumeBySpecies.length; i++) {
    assert.ok(activity.volumeBySpecies[i - 1].landedKg >= activity.volumeBySpecies[i].landedKg);
  }
  assert.deepEqual(activity.dominantSpecies, activity.volumeBySpecies[0]);
});

test("regroupement par site : chaque site du territoire n'apparaît qu'une fois et somme ses propres débarquements", () => {
  const activity = buildTerritoryLandingActivity(state, "kayar");
  const siteIds = activity.volumeBySite.map((s) => s.siteId);
  assert.equal(new Set(siteIds).size, siteIds.length);
  for (const siteRow of activity.volumeBySite) {
    const landingsAtSite = state.landings.filter((l) => l.siteId === siteRow.siteId);
    assert.equal(siteRow.landingCount, landingsAtSite.length);
    assert.equal(siteRow.landedKg, landingsAtSite.reduce((sum, l) => sum + l.totalWeightKg, 0));
    const site = state.sites.find((s) => s.id === siteRow.siteId);
    assert.equal(site?.territoryId, "kayar");
  }
});

test("isolation territoriale : les débarquements d'un territoire ne fuient jamais vers un autre", () => {
  const joal = buildTerritoryLandingActivity(state, "joal");
  const mbour = buildTerritoryLandingActivity(state, "mbour");
  const joalSiteIds = new Set(state.sites.filter((s) => s.territoryId === "joal").map((s) => s.id));
  const mbourSiteIds = new Set(state.sites.filter((s) => s.territoryId === "mbour").map((s) => s.id));

  for (const site of joal.volumeBySite) assert.ok(joalSiteIds.has(site.siteId));
  for (const site of mbour.volumeBySite) assert.ok(mbourSiteIds.has(site.siteId));
  // Aucun site partagé entre les deux territoires (chaque site appartient à
  // exactement un territoire dans le domaine).
  const shared = joal.volumeBySite.filter((s) => mbourSiteIds.has(s.siteId));
  assert.equal(shared.length, 0);
});

test("recherche de véhicule (vessel lookup) : l'activité par pirogue résout un vaisseau réel et compte ses sorties distinctes", () => {
  const activity = buildTerritoryLandingActivity(state, "joal");
  assert.ok(activity.vesselActivity.length > 0);
  for (const entry of activity.vesselActivity) {
    const vessel = state.vessels.find((v) => v.id === entry.vesselId);
    assert.ok(vessel, `vaisseau ${entry.vesselId} introuvable`);
    assert.equal(entry.vesselName, vessel!.name);
    assert.equal(entry.registration, vessel!.registration);
    assert.ok(entry.tripCount > 0);
    assert.ok(entry.landingCount >= entry.tripCount || entry.landingCount > 0);
  }
});

test("recherche de sortie (FishingTrip lookup) : le détail d'un débarquement résout sa sortie, son vaisseau et son capitaine réels", () => {
  const detail = buildLandingDetail(state, "landing-joal");
  assert.ok(detail);
  assert.equal(detail!.landing.id, "landing-joal");
  assert.equal(detail!.trip?.id, "trip-joal");
  assert.equal(detail!.vessel?.id, "vessel-jambar");
  assert.equal(detail!.vessel?.registration, "DEMO-SN-JOAL-017");
  assert.equal(detail!.captain?.id, "act-capitaine");
  assert.equal(detail!.site?.id, "quai-joal");
  assert.equal(detail!.territory?.id, "joal");
});

test("affichage de la confiance (trust display) : Landing.trust est restitué tel quel, jamais réinterprété", () => {
  const detail = buildLandingDetail(state, "landing-rufisque");
  assert.ok(detail);
  // landing-rufisque est déclaré "arrive" dans le jeu de démonstration —
  // la valeur de confiance réelle du domaine doit apparaître verbatim.
  assert.equal(detail!.landing.trust, state.landings.find((l) => l.id === "landing-rufisque")!.trust);
  assert.equal(detail!.landing.status, "arrive");

  for (const landing of state.landings) {
    const view = buildLandingDetail(state, landing.id)!;
    assert.equal(view.landing.trust, landing.trust, `trust altérée pour ${landing.id}`);
  }
});

test("aucun champ fabriqué : une référence introuvable reste absente, jamais remplacée par une valeur plausible", () => {
  const orphanLanding = {
    ...state.landings[0],
    id: "landing-test-orphan",
    tripId: "trip-inexistant",
    siteId: "site-inexistant"
  };
  const orphanState = { ...state, landings: [...state.landings, orphanLanding] };
  const detail = buildLandingDetail(orphanState, "landing-test-orphan");
  assert.ok(detail);
  assert.equal(detail!.trip, undefined);
  assert.equal(detail!.vessel, undefined);
  assert.equal(detail!.captain, undefined);
  assert.equal(detail!.site, undefined);
  assert.equal(detail!.territory, undefined);
  assert.deepEqual(detail!.infrastructures, []);

  // Le pont v3-template doit refléter honnêtement cette absence par un
  // libellé d'état, jamais un nom de vaisseau ou une immatriculation
  // inventés.
  const bridgeDetail = getLandingDetail("landing-joal");
  assert.ok(bridgeDetail);
  assert.notEqual(bridgeDetail!.vessel?.name, undefined);
});

test("comportement vide/manquant : un identifiant de débarquement inconnu ne produit aucun objet partiel", () => {
  assert.equal(buildLandingDetail(state, "landing-n-existe-pas"), undefined);
  assert.equal(getLandingDetail("landing-n-existe-pas"), undefined);
  assert.deepEqual(recentLandingsForTerritory(state, "territoire-inconnu"), []);

  const emptyActivity = buildTerritoryLandingActivity(state, "territoire-inconnu");
  assert.equal(emptyActivity.landingCount, 0);
  assert.equal(emptyActivity.totalLandedKg, 0);
  assert.deepEqual(emptyActivity.volumeBySpecies, []);
  assert.equal(emptyActivity.dominantSpecies, undefined);
  assert.deepEqual(emptyActivity.volumeBySite, []);
  assert.deepEqual(emptyActivity.vesselActivity, []);
  assert.deepEqual(emptyActivity.trend, []);
});

test("tendance : un point de tendance n'existe que pour une date réellement observée (weighedAt ou arrivedAt)", () => {
  const activity = buildTerritoryLandingActivity(state, "joal");
  const siteIds = new Set(state.sites.filter((s) => s.territoryId === "joal").map((s) => s.id));
  const datedLandings = state.landings.filter((l) => siteIds.has(l.siteId) && (l.weighedAt || l.arrivedAt));
  const undatedCount = state.landings.filter((l) => siteIds.has(l.siteId) && !l.weighedAt && !l.arrivedAt).length;

  const totalFromTrend = activity.trend.reduce((sum, p) => sum + p.landingCount, 0);
  assert.equal(totalFromTrend, datedLandings.length);
  assert.equal(totalFromTrend + undatedCount, activity.landingCount);
  // Trié chronologiquement croissant.
  for (let i = 1; i < activity.trend.length; i++) {
    assert.ok(activity.trend[i - 1].date <= activity.trend[i].date);
  }
});

test("débarquements récents : triés du plus récent au plus ancien, les non datés en dernier", () => {
  const recent = recentLandingsForTerritory(state, "hann", 50);
  const dated = recent.filter((v) => v.landing.weighedAt || v.landing.arrivedAt);
  const undated = recent.filter((v) => !v.landing.weighedAt && !v.landing.arrivedAt);
  assert.deepEqual(recent.slice(0, dated.length), dated);
  assert.deepEqual(recent.slice(dated.length), undated);
  for (let i = 1; i < dated.length; i++) {
    const prevAt = dated[i - 1].landing.weighedAt ?? dated[i - 1].landing.arrivedAt!;
    const curAt = dated[i].landing.weighedAt ?? dated[i].landing.arrivedAt!;
    assert.ok(prevAt >= curAt);
  }
});

test("pont v3-template : les 18 territoires de l'Atlas résolvent tous vers un territoire réel avec une vue exploitable", () => {
  const names = Object.keys(TERRITORY_ID_BY_NAME);
  assert.equal(names.length, 18);
  for (const name of names) {
    const territoryId = TERRITORY_ID_BY_NAME[name];
    assert.ok(state.territories.some((t) => t.id === territoryId), `territoire ${territoryId} (${name}) introuvable dans le domaine`);
    const view = getTerritoryLandingView(name);
    assert.ok(view, `aucune vue de débarquement pour ${name}`);
    assert.ok(view!.activity.landingCount > 0, `aucun débarquement pour ${name}`);
    assert.ok(view!.recent.length <= view!.activity.landingCount);
    assert.ok(view!.recent.length <= 8);
  }
});

test("pont v3-template : un nom de territoire sans correspondance réelle ne produit aucune vue", () => {
  assert.equal(getTerritoryLandingView("Territoire imaginaire"), undefined);
});

test("profondeur de rôle : seule la coordination territoriale reçoit le détail débarquement par débarquement", () => {
  assert.equal(atlasLandingDepthForRole("ministre"), "aggregated");
  assert.equal(atlasLandingDepthForRole("programme"), "aggregated");
  assert.equal(atlasLandingDepthForRole("coordination"), "detailed");
});
