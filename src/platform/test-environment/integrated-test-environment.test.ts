import assert from "node:assert/strict";
import test from "node:test";
import { IntegratedTestEnvironment } from "./integrated-test-environment";

test("l'environnement expose toutes les infrastructures nécessaires au produit testable", () => {
  const environment = new IntegratedTestEnvironment("test-environment");
  const snapshot = environment.snapshot();

  assert.equal(snapshot.status, "ready");
  assert.equal(snapshot.infrastructures.length, 12);
  assert.ok(snapshot.infrastructures.every((item) => item.status === "operational"));
  assert.ok(snapshot.infrastructures.some((item) => item.code === "postgresql"));
  assert.ok(snapshot.infrastructures.some((item) => item.code === "mobile_money"));
  assert.ok(snapshot.infrastructures.some((item) => item.code === "atlas"));
});

test("les connecteurs simulés et le paiement sont traçables", () => {
  const environment = new IntegratedTestEnvironment("test-connectors");

  const sms = environment.sendSms({ recipient: "+221770000000", message: "Retour attendu à 16h." });
  const whatsapp = environment.sendWhatsApp({ recipient: "+221780000000", message: "Capacité froide demandée." });
  const weather = environment.getWeather("territory-dakar", "2026-07-27T21:00:00.000Z");
  const scan = environment.scanDocument({ documentId: "document-1", fileName: "preuve.pdf" });
  const payment = environment.requestPayment({
    id: "payment-1",
    payerActorId: "buyer-1",
    beneficiaryActorId: "cooperative-1",
    amountXof: 850_000,
    provider: "wave_simulator",
    at: "2026-07-27T21:01:00.000Z",
  });
  const confirmed = environment.confirmPayment(payment.id, "2026-07-27T21:02:00.000Z");

  assert.equal(sms.status, "delivered");
  assert.equal(whatsapp.status, "delivered");
  assert.equal(weather.riskLevel, "watch");
  assert.equal(scan.status, "clean");
  assert.equal(confirmed.status, "confirmed");
  assert.equal(confirmed.amountXof, 850_000);
  assert.ok(environment.snapshot().operations.length >= 6);
});

test("le reset efface les simulations et recrée un runtime propre", async () => {
  const environment = new IntegratedTestEnvironment("test-reset");
  await environment.seedAndRunColdChainScenario(new Date("2026-07-27T22:00:00.000Z"));
  environment.requestPayment({
    id: "payment-reset",
    payerActorId: "buyer-reset",
    beneficiaryActorId: "cooperative-reset",
    amountXof: 100_000,
    provider: "orange_money_simulator",
  });

  const reset = environment.reset("2026-07-27T22:30:00.000Z");
  assert.equal(reset.resetCount, 1);
  assert.equal(reset.payments.length, 0);
  assert.equal(reset.latestScenario, undefined);
  assert.equal(reset.runtime.processedEvents, 0);
  assert.equal(reset.operations.length, 1);
  assert.equal(reset.operations[0]?.type, "environment_reset");
});
