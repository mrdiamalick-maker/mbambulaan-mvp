// Tests PD.3 — "Product Dressing — Site & Infrastructure Intelligence".
// Portent sur src/domain/territory-intelligence.ts (buildSiteIntelligence,
// buildSiteLandingActivity, recentLandingsForSite) et sur le pont
// v3-template/lib/landing-bridge.ts (getSiteIntelligenceView) — §19 du
// mandat : "site isolation; territory relationship; recent landing
// aggregation by site; infrastructure resolution; Capacity resolution;
// stale Capacity behavior; available vs theoretical capacity;
// infrastructure status; no false saturation inference; Finding/
// Situation context when real; empty/incomplete site data".
import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import {
  buildSiteIntelligence,
  buildSiteLandingActivity,
  buildTerritoryLandingActivity,
  recentLandingsForSite
} from "../src/domain/territory-intelligence";
import { describeCapacityAvailability } from "../src/domain/actor-network";
import { formatSiteInfrastructureRow, getSiteIntelligenceView, TERRITORY_ID_BY_NAME } from "../src/v3-template/lib/landing-bridge";

const state = createDemoState();

test("isolation de site : les débarquements d'un site ne fuient jamais vers un autre site du même territoire", () => {
  const quai = buildSiteLandingActivity(state, "quai-joal");
  const marche = buildSiteLandingActivity(state, "marche-joal");
  const zone = buildSiteLandingActivity(state, "zone-joal");

  // Tous les Landing du Demo World sont enregistrés au quai (audit PD.0/
  // PD.1) — marché et zone de pêche restent honnêtement vides plutôt que
  // de se voir attribuer une part fabriquée de l'activité du quai.
  assert.ok(quai.landingCount > 0);
  assert.equal(marche.landingCount, 0);
  assert.equal(zone.landingCount, 0);
  assert.equal(marche.totalLandedKg, 0);
  assert.equal(zone.totalLandedKg, 0);
  assert.deepEqual(marche.volumeBySpecies, []);
  assert.deepEqual(marche.vesselActivity, []);
  assert.deepEqual(marche.trend, []);
});

test("isolation de site : la somme des sites d'un territoire égale l'activité du territoire", () => {
  const territoryActivity = buildTerritoryLandingActivity(state, "kayar");
  const sumFromSites = territoryActivity.volumeBySite.reduce((sum, site) => sum + site.landedKg, 0);
  assert.equal(sumFromSites, territoryActivity.totalLandedKg);

  const quaiActivity = buildSiteLandingActivity(state, "quai-kayar");
  const quaiRow = territoryActivity.volumeBySite.find((s) => s.siteId === "quai-kayar");
  assert.equal(quaiActivity.totalLandedKg, quaiRow?.landedKg);
  assert.equal(quaiActivity.landingCount, quaiRow?.landingCount);
});

test("relation au territoire : SiteIntelligence résout le bon territoire, jamais un autre", () => {
  const joalSite = buildSiteIntelligence(state, "quai-joal");
  assert.ok(joalSite);
  assert.equal(joalSite!.territory?.id, "joal");
  assert.equal(joalSite!.site.territoryId, "joal");

  const kayarSite = buildSiteIntelligence(state, "quai-kayar");
  assert.ok(kayarSite);
  assert.equal(kayarSite!.territory?.id, "kayar");
  assert.notEqual(kayarSite!.territory?.id, joalSite!.territory?.id);
});

test("agrégation des débarquements récents par site : mêmes objets, même tri que recentLandingsForTerritory filtré", () => {
  const recent = recentLandingsForSite(state, "quai-kayar", 50);
  assert.ok(recent.length > 0);
  for (const view of recent) {
    assert.equal(view.landing.siteId, "quai-kayar");
  }
  // Ordre décroissant par date connue (weighedAt ?? arrivedAt), non datés
  // en dernier — même discipline que recentLandingsForTerritory (PD.1).
  const dated = recent.filter((v) => v.landing.weighedAt || v.landing.arrivedAt);
  for (let i = 1; i < dated.length; i++) {
    const prevAt = dated[i - 1].landing.weighedAt ?? dated[i - 1].landing.arrivedAt!;
    const curAt = dated[i].landing.weighedAt ?? dated[i].landing.arrivedAt!;
    assert.ok(prevAt >= curAt);
  }
});

test("résolution d'infrastructure : SiteIntelligence ne retourne que les infrastructures réellement rattachées à ce site", () => {
  const joalSite = buildSiteIntelligence(state, "quai-joal");
  assert.ok(joalSite);
  assert.ok(joalSite!.infrastructures.length > 0);
  for (const view of joalSite!.infrastructures) {
    assert.equal(view.infrastructure.siteId, "quai-joal");
  }
  // Le site marché de Joal n'a aucune infrastructure recensée (seul le
  // quai en porte dans le Demo World, cf. demo-state.ts) — état vide
  // honnête, jamais une infrastructure inventée pour combler l'écran.
  const marcheSite = buildSiteIntelligence(state, "marche-joal");
  assert.ok(marcheSite);
  assert.deepEqual(marcheSite!.infrastructures, []);
});

test("résolution de Capacity : une infrastructure sans Capacity liée reste honnêtement 'inconnue', jamais une capacité inventée", () => {
  const joalSite = buildSiteIntelligence(state, "quai-joal");
  assert.ok(joalSite);
  const balance = joalSite!.infrastructures.find((i) => i.infrastructure.id === "balance-joal");
  // "balance" ne génère jamais de Capacity dans demo-state.ts (seuls
  // fabrique_glace/chambre_froide/transport/transformation en portent).
  assert.ok(balance);
  assert.equal(balance!.capacity, undefined);
  assert.equal(balance!.availability.kind, "inconnue");

  const froid = joalSite!.infrastructures.find((i) => i.infrastructure.id === "froid-joal");
  assert.ok(froid);
  assert.ok(froid!.capacity, "froid-joal doit porter une Capacity réelle dans le Demo World");
  assert.equal(froid!.capacity!.infrastructureId, "froid-joal");
});

// Note (mandat PD.3 §15, "trust/freshness") : le Demo World fixe ses
// dates dans une fenêtre de simulation close (fin juillet/début août
// 2026) — `validUntil: tomorrow` dans demo-state.ts est "demain" par
// rapport à CETTE fenêtre, pas par rapport à l'horloge réelle. Le temps
// réel ayant depuis dépassé cette fenêtre, describeCapacityAvailability
// (dont le paramètre `now` par défaut est `new Date().toISOString()`)
// classe honnêtement TOUTES les Capacity du jeu de démonstration comme
// "à revérifier" dès aujourd'hui — un comportement correct (mandat §15 :
// "Stale capacity information should look stale, not operationally
// confirmed"), pas une régression. Les deux cas ("valide"/"aRevoir")
// sont donc testés ici avec un `now` explicite plutôt qu'avec l'horloge
// réelle, pour rester déterministe indépendamment de la date du jour.
test("comportement d'une Capacity périmée : reste 'à revérifier', jamais requalifiée indisponible par la seule péremption", () => {
  const reference = "2026-07-29T12:00:00.000Z";
  const capacity = state.capacities.find((c) => c.infrastructureId === "froid-kayar")!;

  const staleCapacity = { ...capacity, validUntil: "2026-07-28T00:00:00.000Z", status: "disponible" as const };
  const staleAvailability = describeCapacityAvailability(staleCapacity, reference);
  assert.equal(staleAvailability.kind, "aRevoir");
  const staleRowView = formatSiteInfrastructureRow({
    infrastructure: state.infrastructures.find((i) => i.id === "froid-kayar")!,
    capacity: staleCapacity,
    availability: staleAvailability
  });
  assert.match(staleRowView.availabilityLabel, /À revérifier/);
  assert.equal(staleRowView.availabilityFresh, false);
  // Jamais requalifiée "indisponible" : le statut d'Infrastructure
  // lui-même reste "fragile" tel qu'il est dans le Demo World, la
  // péremption de la Capacity ne le réécrit pas.
  assert.equal(staleRowView.statusLabel, "fragile");

  const freshCapacity = { ...capacity, validUntil: "2026-07-30T00:00:00.000Z", status: "disponible" as const };
  const freshAvailability = describeCapacityAvailability(freshCapacity, reference);
  assert.equal(freshAvailability.kind, "valide");
  const freshRowView = formatSiteInfrastructureRow({
    infrastructure: state.infrastructures.find((i) => i.id === "froid-kayar")!,
    capacity: freshCapacity,
    availability: freshAvailability
  });
  assert.match(freshRowView.availabilityLabel, /Disponibilité vérifiée/);
  assert.equal(freshRowView.availabilityFresh, true);
});

test("fraîcheur en conditions réelles : le Demo World étant figé dans le passé simulé, describeCapacityAvailability le restitue honnêtement comme à revérifier aujourd'hui", () => {
  // Documente le constat ci-dessus plutôt que de le contourner : à la
  // date réelle d'exécution de ce test (bien après juillet 2026), chaque
  // Capacity du Demo World est authentiquement périmée — ni une capacité
  // "opérationnelle confirmée" fabriquée, ni un bug.
  for (const capacity of state.capacities) {
    const availability = describeCapacityAvailability(capacity);
    assert.equal(availability.kind, "aRevoir", `Capacity ${capacity.id} inattendument fraîche à la date réelle du jour`);
  }
});

test("capacité disponible vs théorique : les deux valeurs restent distinctes, jamais aplaties en une seule", () => {
  const joalSite = buildSiteIntelligence(state, "quai-joal");
  const froid = joalSite!.infrastructures.find((i) => i.infrastructure.id === "froid-joal")!;
  // froid-joal (index 0, fabrique_glace) est déclaré indisponible avec
  // 0 capacité disponible sur 12 théoriques dans demo-state.ts.
  assert.equal(froid.infrastructure.theoreticalCapacity, 12);
  assert.equal(froid.infrastructure.availableCapacity, 0);
  assert.notEqual(froid.infrastructure.theoreticalCapacity, froid.infrastructure.availableCapacity);

  const hannSite = buildSiteIntelligence(state, "quai-hann");
  const froidHann = hannSite!.infrastructures.find((i) => i.infrastructure.type === "chambre_froide" || i.infrastructure.type === "fabrique_glace");
  assert.ok(froidHann);
  assert.notEqual(froidHann!.infrastructure.theoreticalCapacity, froidHann!.infrastructure.availableCapacity);
});

test("statut d'infrastructure : les trois statuts réels du domaine sont restitués tels quels", () => {
  const joalSite = buildSiteIntelligence(state, "quai-joal")!;
  const froidJoal = joalSite.infrastructures.find((i) => i.infrastructure.id === "froid-joal")!;
  assert.equal(froidJoal.infrastructure.status, "indisponible");

  const kayarTransport = buildSiteIntelligence(state, "quai-kayar")!.infrastructures.find((i) => i.infrastructure.id === "transport-kayar")!;
  assert.equal(kayarTransport.infrastructure.status, "fragile");

  const balanceJoal = joalSite.infrastructures.find((i) => i.infrastructure.id === "balance-joal")!;
  assert.equal(balanceJoal.infrastructure.status, "operationnelle");
});

test("aucune inférence de saturation fabriquée : un volume débarqué très supérieur à la capacité théorique ne produit aucune conclusion dérivée", () => {
  // Site synthétique : volume débarqué très supérieur à la capacité
  // froide théorique déclarée — cf. mandat §7, "landing kg > cold-room
  // capacity is NOT automatically enough to claim saturation".
  const overloadedState = {
    ...state,
    infrastructures: state.infrastructures.map((item) => (item.id === "froid-joal" ? { ...item, theoreticalCapacity: 1, availableCapacity: 0 } : item))
  };
  const siteIntel = buildSiteIntelligence(overloadedState, "quai-joal")!;
  assert.ok(siteIntel.activity.totalLandedKg > siteIntel.infrastructures.find((i) => i.infrastructure.id === "froid-joal")!.infrastructure.theoreticalCapacity);

  // La structure retournée ne porte aucun champ de conclusion dérivée
  // ("saturated"/"overload"/"insufficient"/un ratio) — seulement les
  // nombres bruts, indépendants l'un de l'autre.
  const keys = Object.keys(siteIntel);
  for (const forbidden of ["saturated", "saturation", "overload", "overflow", "insufficient", "deficit", "ratio"]) {
    assert.ok(!keys.some((k) => k.toLowerCase().includes(forbidden)), `champ de conclusion fabriquée détecté : ${forbidden}`);
  }
  const infraKeys = Object.keys(siteIntel.infrastructures[0]);
  for (const forbidden of ["saturated", "saturation", "overload", "overflow", "insufficient", "deficit", "ratio", "confidence", "score"]) {
    assert.ok(!infraKeys.some((k) => k.toLowerCase().includes(forbidden)), `champ de conclusion fabriquée détecté sur l'infrastructure : ${forbidden}`);
  }
});

test("contexte Finding/Situation réel : les alertes de site proviennent du moteur de règles existant, jamais recalculées ici", () => {
  // Kayar porte une infrastructure "fragile" (transport-kayar) — la règle
  // de recoupement signal-crossing.ts ne lève une alerte que si une
  // activité récente existe sur ce site, ce qui est le cas (landing-kayar
  // pesé le 29/07). On vérifie que l'alerte, si présente, référence bien
  // ce site précis via ses sourceRefs (même objet que le moteur produit).
  const kayarSite = buildSiteIntelligence(state, "quai-kayar")!;
  for (const alert of kayarSite.attention) {
    assert.ok(["critique", "vigilance"].includes(alert.attentionLevel));
    const referencesThisSite = alert.sourceRefs.some(
      (ref) =>
        (ref.objectType === "site" && ref.objectId === "quai-kayar") ||
        (ref.objectType === "infrastructure" && kayarSite.infrastructures.some((i) => i.infrastructure.id === ref.objectId))
    );
    assert.ok(referencesThisSite, "une alerte de site doit référencer ce site ou l'une de ses infrastructures");
  }

  // territorySituations reste strictement scopé au territoire (Situation
  // n'a pas de siteId dans le domaine actuel, cf. rapport PD.0) — jamais
  // fabriqué comme spécifique au site.
  for (const situation of kayarSite.territorySituations) {
    assert.equal(situation.territoryId, "kayar");
    assert.notEqual(situation.status, "reglee");
  }
});

test("état vide/incomplet : un site sans identifiant réel ne produit aucun objet partiel", () => {
  assert.equal(buildSiteIntelligence(state, "site-n-existe-pas"), undefined);
  assert.equal(getSiteIntelligenceView("site-n-existe-pas"), undefined);

  const emptyActivity = buildSiteLandingActivity(state, "site-n-existe-pas");
  assert.equal(emptyActivity.landingCount, 0);
  assert.equal(emptyActivity.totalLandedKg, 0);
  assert.deepEqual(recentLandingsForSite(state, "site-n-existe-pas"), []);
});

test("pont v3-template : getSiteIntelligenceView expose une vue formatée cohérente pour un site réel", () => {
  const view = getSiteIntelligenceView("quai-joal");
  assert.ok(view);
  assert.equal(view!.siteId, "quai-joal");
  assert.equal(view!.siteTypeLabel, "Quai");
  assert.equal(view!.territoryName, "Joal-Fadiouth");
  assert.match(view!.activityHeadline, /débarquement.*kg/);
  assert.ok(view!.infrastructures.length > 0);
  for (const infra of view!.infrastructures) {
    assert.ok(infra.capacityText.length > 0);
    assert.ok(infra.availabilityLabel.length > 0);
  }
});

test("les 18 territoires de l'Atlas ont chacun au moins un site avec une intelligence de site exploitable", () => {
  for (const name of Object.keys(TERRITORY_ID_BY_NAME)) {
    const territoryId = TERRITORY_ID_BY_NAME[name];
    const quaiId = `quai-${territoryId}`;
    const view = getSiteIntelligenceView(quaiId);
    assert.ok(view, `aucune intelligence de site pour ${quaiId} (${name})`);
  }
});
