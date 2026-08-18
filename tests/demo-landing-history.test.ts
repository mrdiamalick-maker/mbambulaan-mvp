import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";

const calendarDate = (value: string) => value.slice(0, 10);

test("les 18 quais disposent de quatre à cinq jours de pesée sans falsifier les opérations en cours", () => {
  const state = createDemoState();
  const quayIds = state.sites.filter((site) => site.type === "quai").map((site) => site.id);
  const globalDates = [
    ...new Set(state.landings.flatMap((landing) => landing.weighedAt ? [calendarDate(landing.weighedAt)] : []))
  ].sort();
  const pointCounts = quayIds.map((siteId) => {
    const dates = state.landings
      .filter((landing) => landing.siteId === siteId && landing.weighedAt)
      .map((landing) => calendarDate(landing.weighedAt!));
    return new Set(dates).size;
  });

  assert.equal(state.landings.length, 100);
  assert.deepEqual(globalDates, ["2026-07-29", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08"]);
  assert.equal(pointCounts.filter((count) => count === 5).length, 7);
  assert.equal(pointCounts.filter((count) => count === 4).length, 11);
  assert.ok(pointCounts.every((count) => count >= 4));

  assert.equal(state.landings.filter((landing) => !landing.weighedAt).length, 21);
  assert.equal(state.landings.filter((landing) => !landing.arrivedAt && !landing.weighedAt).length, 20);
  assert.equal(state.landings.find((landing) => landing.id === "landing-rufisque")?.arrivedAt, "2026-07-29T10:06:00.000Z");
  assert.equal(state.landings.find((landing) => landing.id === "landing-rufisque")?.weighedAt, undefined);
  assert.equal(state.landings.find((landing) => landing.id === "landing-joal")?.status, "attendu");
  assert.equal(state.landings.find((landing) => landing.id === "landing-djiffer")?.status, "attendu");
});

test("les 36 pesées historiques restent simulées, reliées et sans stock commercial actif", () => {
  const state = createDemoState();
  const historicalTrips = state.trips.filter((trip) => trip.id.includes("-history-"));
  const historicalLandings = state.landings.filter((landing) => landing.id.includes("-history-"));
  const tripIds = new Set(state.trips.map((trip) => trip.id));
  const vesselIds = new Set(state.vessels.map((vessel) => vessel.id));
  const actorIds = new Set(state.actors.map((actor) => actor.id));

  assert.equal(historicalTrips.length, 36);
  assert.equal(historicalLandings.length, 36);
  assert.equal(new Set(state.trips.map((trip) => trip.id)).size, state.trips.length);
  assert.equal(new Set(state.landings.map((landing) => landing.id)).size, state.landings.length);
  assert.equal(
    new Set(state.landings.flatMap((landing) => landing.catches.map((catchLine) => catchLine.id))).size,
    state.landings.reduce((total, landing) => total + landing.catches.length, 0)
  );

  for (const trip of historicalTrips) {
    assert.equal(trip.status, "debarquee");
    assert.match(trip.source, /Historique simulé de démonstration/);
    assert.ok(vesselIds.has(trip.vesselId));
    assert.ok(actorIds.has(trip.captainId));
    assert.ok(trip.arrivedAt);
    assert.ok(trip.departureAt < trip.arrivedAt!);
  }

  for (const landing of historicalLandings) {
    const trip = state.trips.find((candidate) => candidate.id === landing.tripId);
    const comparisonLandings = state.landings.filter((candidate) =>
      candidate.siteId === landing.siteId && candidate.id.includes("-demo-") && candidate.weighedAt
    );
    const referenceWeight = comparisonLandings.reduce((total, candidate) => total + candidate.totalWeightKg, 0) / comparisonLandings.length;
    assert.ok(tripIds.has(landing.tripId));
    assert.ok(trip);
    assert.equal(landing.status, "pese");
    assert.equal(landing.trust, "observee");
    assert.match(landing.weighingSource, /Historique simulé de démonstration/);
    assert.equal(landing.arrivedAt, trip!.arrivedAt);
    assert.ok(landing.weighedAt);
    assert.ok(landing.arrivedAt! < landing.weighedAt!);
    assert.equal(landing.catches.reduce((total, catchLine) => total + catchLine.quantityKg, 0), landing.totalWeightKg);
    assert.ok(landing.totalWeightKg >= referenceWeight * 0.88 && landing.totalWeightKg <= referenceWeight * 1.07);
    assert.equal(state.lots.some((lot) => lot.landingId === landing.id), false);
  }
});
