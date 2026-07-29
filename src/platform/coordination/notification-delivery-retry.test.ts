import test from "node:test";
import assert from "node:assert/strict";
import { NotificationDeliveryGateway, type NotificationChannelAdapter } from "./notification-delivery-gateway";
import type { WorkNotification } from "./unified-work-orchestration-runtime";

const notification: WorkNotification = {
  id: "notification-work-1-sms",
  workItemId: "work-1",
  recipientOrganizationId: "org-logistics",
  recipientActorId: "actor-logistics",
  channel: "sms",
  notificationType: "assignment",
  message: "Confirmer la livraison",
  escalationLevel: 0,
  scheduledAt: "2026-08-01T09:00:00.000Z",
  status: "scheduled",
};

test("planifie un retry exponentiel après un échec fournisseur", async () => {
  const gateway = new NotificationDeliveryGateway();
  const first = gateway.prepare({ notification, recipientReference: "+221770000000", at: "2026-08-01T09:00:00.000Z" });
  const failingAdapter: NotificationChannelAdapter = {
    channel: "sms",
    async submit() { throw new Error("fournisseur indisponible"); },
  };
  const failed = await gateway.submit({ attemptId: first.id, notification, adapter: failingAdapter, at: "2026-08-01T09:01:00.000Z", retryDelayMinutes: 15 });
  assert.equal(failed.status, "failed");
  assert.equal(failed.attemptNumber, 1);
  assert.equal(failed.nextRetryAt, "2026-08-01T09:16:00.000Z");
  assert.throws(() => gateway.prepare({ notification, recipientReference: "+221770000000", at: "2026-08-01T09:10:00.000Z" }));
  const retry = gateway.prepare({ notification, recipientReference: "+221770000000", at: "2026-08-01T09:16:00.000Z" });
  assert.equal(retry.attemptNumber, 2);
});

test("restaure les tentatives sans perdre leur état", () => {
  const gateway = new NotificationDeliveryGateway();
  gateway.restore([{
    id: "delivery-restored",
    notificationId: notification.id,
    channel: "sms",
    recipientReference: "+221770000000",
    providerReference: "provider-1",
    status: "submitted",
    attemptNumber: 1,
    preparedAt: "2026-08-01T09:00:00.000Z",
    submittedAt: "2026-08-01T09:01:00.000Z",
  }]);
  const snapshot = gateway.snapshot();
  assert.equal(snapshot.attempts.length, 1);
  assert.equal(snapshot.attempts[0]?.providerReference, "provider-1");
  assert.equal(snapshot.metrics.submittedCount, 1);
});
