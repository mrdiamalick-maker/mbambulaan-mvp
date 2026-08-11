import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

test("une demande de service (ServiceRequest, ex-Need) est créée avec la forme convergée vers PublicRequest (D1)", () => {
  const state = createDemoState();
  const before = state.serviceRequests.length;

  const next = applyCommand(state, {
    type: "create_service_request",
    actorId: "act-mareyeur",
    territoryId: "joal",
    speciesId: "sp-thiof",
    quantityKg: 250,
    quality: "A",
    intent: "achat",
    channel: "whatsapp",
    contactName: "Mariama Sène",
    phone: "+221 77 000 00 00"
  });

  assert.equal(next.serviceRequests.length, before + 1);
  const request = next.serviceRequests[0];
  assert.ok(request.reference.startsWith("MBA-SR-"));
  assert.equal(request.channel, "whatsapp");
  assert.equal(request.intent, "achat");
  assert.equal(request.status, "ouvert");
  assert.equal(request.contactName, "Mariama Sène");
  assert.equal(next.audit[0].objectType, "demande");
});

test("une demande de service exige un territoire, une espèce et une quantité positive", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_service_request",
        actorId: "act-mareyeur",
        territoryId: "territoire-inconnu",
        speciesId: "sp-thiof",
        quantityKg: 100,
        quality: "A",
        intent: "achat",
        channel: "web"
      }),
    /Territoire inconnu/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_service_request",
        actorId: "act-mareyeur",
        territoryId: "joal",
        speciesId: "espece-inconnue",
        quantityKg: 100,
        quality: "A",
        intent: "achat",
        channel: "web"
      }),
    /Espèce inconnue/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_service_request",
        actorId: "act-mareyeur",
        territoryId: "joal",
        speciesId: "sp-thiof",
        quantityKg: 0,
        quality: "A",
        intent: "achat",
        channel: "web"
      }),
    /quantité doit être positive/
  );
});

test("le moteur de rapprochement Lot ↔ ServiceRequest continue de fonctionner après la convergence D1", () => {
  const state = createDemoState();
  const opportunity = state.opportunities[0];
  assert.ok(opportunity.serviceRequestId);
  const request = state.serviceRequests.find((item) => item.id === opportunity.serviceRequestId);
  assert.ok(request, "chaque opportunité de démonstration doit référencer une ServiceRequest existante");
});

test("une demande de formation n'est jamais rapprochée d'un lot débarqué (Lot 5)", () => {
  let state = createDemoState();
  const formationRequest = state.serviceRequests.find((item) => item.id === "need-formation-mbour");
  assert.ok(formationRequest, "la grappe de démonstration formation doit exister");
  assert.equal(formationRequest?.speciesId, "sp-sardinelle");

  state = applyCommand(state, { type: "announce_return", tripId: "trip-joal", actorId: "act-capitaine" });
  state = applyCommand(state, { type: "confirm_arrival", tripId: "trip-joal", actorId: "act-operateur" });
  state = applyCommand(state, { type: "record_landing", tripId: "trip-joal", actorId: "act-operateur" });
  state = applyCommand(state, { type: "confirm_weighing", landingId: "landing-joal", actorId: "act-operateur" });
  state = applyCommand(state, { type: "create_lots", landingId: "landing-joal", actorId: "act-operateur" });

  const sardinelleLot = state.lots.find((item) => item.landingId === "landing-joal" && item.speciesId === "sp-sardinelle");
  assert.ok(sardinelleLot, "le débarquement de Joal doit produire un lot de sardinelle");
  assert.ok(
    (sardinelleLot?.availableKg ?? 0) >= (formationRequest?.quantityKg ?? Infinity),
    "le lot doit dépasser la quantité demandée pour que le test soit probant (même espèce, aucune contrainte de territoire dans le moteur)"
  );

  const formationOpportunity = state.opportunities.find((item) => item.serviceRequestId === "need-formation-mbour");
  assert.equal(formationOpportunity, undefined, "une intention 'formation' ne doit jamais générer d'opportunité de rapprochement");
});
