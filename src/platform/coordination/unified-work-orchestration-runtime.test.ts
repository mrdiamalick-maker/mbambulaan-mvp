import test from "node:test";
import assert from "node:assert/strict";
import { UnifiedWorkOrchestrationRuntime } from "./unified-work-orchestration-runtime";

test("planifie affectation, rappel et escalade sans doublon", () => {
  const runtime = new UnifiedWorkOrchestrationRuntime();
  runtime.execute({ commandId: "policy-1", command: { type: "register_escalation_policy", policy: {
    id: "policy-critical", name: "Échéance critique", firstReminderMinutesBeforeDue: 60, overdueEscalationMinutes: 30,
    maximumEscalationLevel: 2, active: true,
    levelTargets: [
      { level: 1, roleCode: "territorial_coordinator", channels: ["in_app", "sms"] },
      { level: 2, roleCode: "government_supervisor", organizationId: "org-ministry", channels: ["in_app"] },
    ],
  } } });
  runtime.execute({ commandId: "work-1", command: { type: "register_work", workItem: {
    id: "work-document-order-1", sourceCapability: "documents", workType: "provide_document",
    title: "Fournir la confirmation du site destinataire", instructions: "Joindre la confirmation signée.",
    priority: "critical", organizationId: "org-logistics", territoryId: "territory-dakar",
    relatedEntityType: "commercial_order", relatedEntityId: "order-1", dueAt: "2026-08-01T12:00:00.000Z",
    escalationPolicyId: "policy-critical", notificationChannels: ["in_app"], status: "open", createdAt: "2026-08-01T09:00:00.000Z",
  } } });

  runtime.planNotifications("2026-08-01T11:30:00.000Z");
  runtime.planNotifications("2026-08-01T12:45:00.000Z");
  runtime.planNotifications("2026-08-01T12:45:00.000Z");
  const snapshot = runtime.snapshot("2026-08-01T12:45:00.000Z");

  assert.equal(snapshot.metrics.overdueCount, 1);
  assert.equal(snapshot.notifications.filter((item) => item.notificationType === "reminder").length, 1);
  assert.equal(snapshot.notifications.filter((item) => item.notificationType === "escalation").length, 1);
});

test("annule les notifications en attente quand la tâche est terminée", () => {
  const runtime = new UnifiedWorkOrchestrationRuntime();
  runtime.execute({ commandId: "work-2", command: { type: "register_work", workItem: {
    id: "work-payment", sourceCapability: "finance", workType: "confirm_transfer", title: "Confirmer le virement",
    instructions: "Renseigner la référence de virement.", priority: "high", organizationId: "org-finance",
    territoryId: "territory-dakar", relatedEntityType: "payment", relatedEntityId: "payment-1",
    dueAt: "2026-08-01T12:00:00.000Z", notificationChannels: ["in_app"], status: "open", createdAt: "2026-08-01T09:00:00.000Z",
  } } });
  runtime.execute({ commandId: "complete-2", command: { type: "complete_work", workItemId: "work-payment", at: "2026-08-01T10:00:00.000Z" } });
  const snapshot = runtime.snapshot();
  assert.equal(snapshot.workItems[0]?.status, "completed");
  assert.equal(snapshot.notifications.some((item) => item.notificationType === "completion"), true);
});
