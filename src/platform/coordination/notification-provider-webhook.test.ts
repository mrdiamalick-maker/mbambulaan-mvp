import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { NotificationDeliveryGateway } from "./notification-delivery-gateway";
import { NotificationProviderWebhookVerifier } from "./notification-provider-webhook";
import type { WorkNotification } from "./unified-work-orchestration-runtime";

test("verifie une signature fournisseur et applique une livraison", async () => {
  const verifier = new NotificationProviderWebhookVerifier();
  const rawBody = JSON.stringify({ providerCode: "sms-test", providerReference: "provider-1", status: "delivered", occurredAt: "2026-08-01T12:00:00.000Z" });
  const secret = "secret-test";
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
  assert.equal(verifier.verify({ rawBody, signature, secret }), true);
  assert.equal(verifier.verify({ rawBody, signature: "00", secret }), false);

  const notification: WorkNotification = {
    id: "notification-1", workItemId: "work-1", recipientOrganizationId: "org-1", channel: "sms",
    notificationType: "assignment", message: "Tâche assignée", escalationLevel: 0,
    scheduledAt: "2026-08-01T10:00:00.000Z", status: "scheduled",
  };
  const gateway = new NotificationDeliveryGateway();
  const prepared = gateway.prepare({ notification, recipientReference: "+221770000000", at: "2026-08-01T10:00:00.000Z" });
  await gateway.submit({
    attemptId: prepared.id,
    notification,
    adapter: { channel: "sms", async submit() { return { providerReference: "provider-1" }; } },
    at: "2026-08-01T10:01:00.000Z",
  });
  const delivered = gateway.applyProviderEvent(verifier.parse(rawBody));
  assert.equal(delivered.status, "delivered");
});

test("programme un retry apres un echec remonte par le fournisseur", async () => {
  const notification: WorkNotification = {
    id: "notification-2", workItemId: "work-2", recipientOrganizationId: "org-2", channel: "email",
    notificationType: "reminder", message: "Rappel", escalationLevel: 0,
    scheduledAt: "2026-08-01T10:00:00.000Z", status: "scheduled",
  };
  const gateway = new NotificationDeliveryGateway();
  const prepared = gateway.prepare({ notification, recipientReference: "actor@example.test", at: "2026-08-01T10:00:00.000Z" });
  await gateway.submit({
    attemptId: prepared.id,
    notification,
    adapter: { channel: "email", async submit() { return { providerReference: "provider-2" }; } },
    at: "2026-08-01T10:01:00.000Z",
  });
  const failed = gateway.applyProviderEvent({
    providerReference: "provider-2",
    status: "failed",
    occurredAt: "2026-08-01T10:02:00.000Z",
    failureReason: "Boîte indisponible",
  });
  assert.equal(failed.status, "failed");
  assert.equal(failed.nextRetryAt, "2026-08-01T10:17:00.000Z");
});
