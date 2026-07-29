import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

test("le parcours pirogue produit des lots, une opportunité, un engagement et un résultat", () => {
  let state = createDemoState();

  state = applyCommand(state, { type: "announce_return", tripId: "trip-joal", actorId: "act-capitaine" });
  assert.equal(state.trips.find((item) => item.id === "trip-joal")?.status, "retour_annonce");

  state = applyCommand(state, { type: "confirm_arrival", tripId: "trip-joal", actorId: "act-operateur" });
  assert.equal(state.landings.find((item) => item.id === "landing-joal")?.status, "arrive");

  state = applyCommand(state, { type: "record_landing", tripId: "trip-joal", actorId: "act-operateur" });
  assert.equal(state.trips.find((item) => item.id === "trip-joal")?.status, "debarquee");

  state = applyCommand(state, { type: "confirm_weighing", landingId: "landing-joal", actorId: "act-operateur" });
  assert.equal(state.landings.find((item) => item.id === "landing-joal")?.trust, "verifiee");

  state = applyCommand(state, { type: "create_lots", landingId: "landing-joal", actorId: "act-operateur" });
  const joalLots = state.lots.filter((item) => item.landingId === "landing-joal");
  assert.equal(joalLots.length, 2);
  assert.ok(state.audit.some((item) => item.action === "create_lots"));

  const opportunity = state.opportunities.find((item) => item.lotId === joalLots[0].id);
  assert.ok(opportunity);
  state = applyCommand(state, { type: "accept_opportunity", opportunityId: opportunity.id, actorId: "act-mareyeur" });
  assert.equal(state.opportunities.find((item) => item.id === opportunity.id)?.status, "engagee");
  assert.ok(state.coordinationSpaces.some((item) => item.opportunityId === opportunity.id));

  state = applyCommand(state, { type: "complete_logistics", opportunityId: opportunity.id, actorId: "act-mareyeur" });
  assert.equal(state.opportunities.find((item) => item.id === opportunity.id)?.status, "executee");
  assert.equal(state.lots.find((item) => item.id === opportunity.lotId)?.status, "valorise");
  assert.ok(state.audit.some((item) => item.action === "complete_logistics"));
});

test("Community devient une situation sans dupliquer le domaine", () => {
  let state = createDemoState();
  state = applyCommand(state, {
    type: "create_community_post",
    actorId: "act-mareyeur",
    territoryId: "joal",
    category: "besoin",
    title: "Besoin de transport froid",
    body: "Une capacité est recherchée avant 16 h."
  });
  const post = state.communityPosts[0];
  state = applyCommand(state, { type: "convert_post", postId: post.id, actorId: "act-coordinateur" });
  const converted = state.communityPosts.find((item) => item.id === post.id);
  assert.equal(converted?.status, "transforme");
  assert.ok(state.situations.some((item) => item.id === converted?.convertedObjectId));
});
