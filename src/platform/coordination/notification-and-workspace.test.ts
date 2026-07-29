import test from "node:test";
import assert from "node:assert/strict";
import { EscalationRecipientResolver } from "./escalation-recipient-resolver";
import { NotificationDeliveryGateway } from "./notification-delivery-gateway";
import { ActorDailyWorkspace } from "./actor-daily-workspace";
import type { DemoIdentity } from "@/platform/access/demo-access-control";
import type { EscalationPolicy, UnifiedWorkItem, WorkNotification } from "./unified-work-orchestration-runtime";

const workItem: UnifiedWorkItem = {
  id: "work-1", sourceCapability: "documents", workType: "provide_document", title: "Fournir le bon de livraison",
  instructions: "Enregistrer le bon signé.", priority: "critical", organizationId: "org-logistics", actorId: "actor-logistics",
  territoryId: "territory-dakar", relatedEntityType: "commercial_order", relatedEntityId: "order-1",
  dueAt: "2026-08-01T12:00:00.000Z", escalationPolicyId: "policy-1", notificationChannels: ["in_app"],
  status: "open", createdAt: "2026-08-01T09:00:00.000Z",
};

const policy: EscalationPolicy = {
  id: "policy-1", name: "Escalade territoriale", firstReminderMinutesBeforeDue: 60, overdueEscalationMinutes: 30,
  maximumEscalationLevel: 2, active: true,
  levelTargets: [{ level: 1, roleCode: "territorial_coordinator", channels: ["in_app", "sms"] }],
};

const identities: DemoIdentity[] = [{
  id: "actor-coordinator", displayName: "Coordinateur", roleCode: "territorial_coordinator", organizationId: "org-public",
  organizationName: "Service régional", territoryIds: ["territory-dakar"], productCodes: ["government"],
  permissions: ["government.read", "government.write"], locale: "fr", status: "active",
}];

test("résout un rôle d'escalade vers un acteur autorisé sur le territoire", () => {
  const recipients = new EscalationRecipientResolver().resolve({ workItem, policy, level: 1, identities });
  assert.equal(recipients[0]?.actorId, "actor-coordinator");
  assert.equal(recipients[0]?.resolution, "role_and_territory");
});

test("trace préparation, soumission et remise sans confondre les statuts", async () => {
  const notification: WorkNotification = {
    id: "notification-1", workItemId: workItem.id, recipientOrganizationId: workItem.organizationId,
    recipientActorId: workItem.actorId, channel: "sms", notificationType: "assignment", message: workItem.title,
    escalationLevel: 0, scheduledAt: workItem.createdAt, status: "scheduled",
  };
  const gateway = new NotificationDeliveryGateway();
  const prepared = gateway.prepare({ notification, recipientReference: "+221700000000", at: "2026-08-01T09:00:00.000Z" });
  assert.equal(prepared.status, "prepared");
  const submitted = await gateway.submit({
    attemptId: prepared.id, notification, at: "2026-08-01T09:01:00.000Z",
    adapter: { channel: "sms", async submit() { return { providerReference: "sms-provider-1" }; } },
  });
  assert.equal(submitted.status, "submitted");
  const delivered = gateway.confirmDelivery({ attemptId: prepared.id, providerReference: "sms-provider-1", deliveredAt: "2026-08-01T09:02:00.000Z" });
  assert.equal(delivered.status, "delivered");
});

test("construit un poste quotidien filtré par acteur et organisation", () => {
  const notification: WorkNotification = {
    id: "notification-2", workItemId: workItem.id, recipientOrganizationId: workItem.organizationId,
    recipientActorId: workItem.actorId, channel: "in_app", notificationType: "assignment", message: workItem.title,
    escalationLevel: 0, scheduledAt: workItem.createdAt, status: "scheduled",
  };
  const workspace = new ActorDailyWorkspace().project({
    actorId: "actor-logistics", organizationId: "org-logistics", territoryId: "territory-dakar",
    workItems: [workItem], notifications: [notification], at: "2026-08-01T13:00:00.000Z",
  });
  assert.equal(workspace.metrics.actionableCount, 1);
  assert.equal(workspace.metrics.overdueCount, 1);
  assert.equal(workspace.metrics.unreadNotificationCount, 1);
});
