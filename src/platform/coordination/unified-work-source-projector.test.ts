import test from "node:test";
import assert from "node:assert/strict";
import { UnifiedWorkSourceProjector } from "./unified-work-source-projector";

test("projette une tache documentaire vers la file unifiee", () => {
  const item = new UnifiedWorkSourceProjector().project({
    source: "documents",
    item: {
      id: "document-missing-order-1-destination_confirmation",
      workType: "provide_document",
      priority: "critical",
      organizationId: "org-logistics",
      territoryId: "territory-dakar",
      relatedEntityType: "commercial_order",
      relatedEntityId: "order-1",
      requiredDocumentType: "destination_confirmation",
      dueAt: "2026-08-01T12:00:00.000Z",
      title: "Document requis : destination_confirmation",
      instructions: "Joindre la confirmation signée du site destinataire.",
      status: "open",
    },
  }, {
    escalationPolicyId: "policy-critical",
    channels: ["in_app", "sms"],
    createdAt: "2026-08-01T09:00:00.000Z",
  });

  assert.equal(item.id, "unified-documents-document-missing-order-1-destination_confirmation");
  assert.equal(item.sourceCapability, "documents");
  assert.equal(item.organizationId, "org-logistics");
  assert.deepEqual(item.notificationChannels, ["in_app", "sms"]);
  assert.equal(item.escalationPolicyId, "policy-critical");
});
