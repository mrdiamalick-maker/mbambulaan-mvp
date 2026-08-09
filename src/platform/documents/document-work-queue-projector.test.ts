import test from "node:test";
import assert from "node:assert/strict";
import { DocumentWorkQueueProjector } from "./document-work-queue-projector";
import { DocumentAccessAndGovernance } from "./document-access-and-governance";
import type { DecisionRecord, OperationalDocument } from "./operational-document-registry";

const document: OperationalDocument = {
  id: "doc-1",
  documentType: "institutional_decision",
  title: "Décision de suspension",
  issuingOrganizationId: "org-ministry",
  issuedByActorId: "actor-ministry",
  territoryIds: ["territory-dakar"],
  relatedEntityType: "contract",
  relatedEntityId: "contract-1",
  storageReference: "storage://decision-1.pdf",
  checksumSha256: "a".repeat(64),
  issuedAt: "2026-07-01T00:00:00.000Z",
  validUntil: "2026-08-03T00:00:00.000Z",
  confidentiality: "confidential",
  status: "registered",
  registeredAt: "2026-07-28T00:00:00.000Z",
  registeredByActorId: "actor-government",
};

const decision: DecisionRecord = {
  id: "decision-1",
  decisionType: "suspend",
  subjectType: "contract",
  subjectId: "contract-1",
  decidedByActorIds: ["actor-ministry"],
  organizationId: "org-ministry",
  territoryIds: ["territory-dakar"],
  reason: "Rupture contractuelle confirmée.",
  decisionDocumentIds: ["doc-1"],
  effectiveAt: "2026-07-28T00:00:00.000Z",
  status: "effective",
  recordedAt: "2026-07-28T00:00:00.000Z",
};

test("restreint un document confidentiel a l autorite competente", () => {
  const access = new DocumentAccessAndGovernance();
  assert.equal(access.canRead(document, {
    actorId: "actor-business",
    organizationId: "org-business",
    territoryIds: ["territory-dakar"],
    permissions: ["trade.read"],
  }).allowed, false);
  assert.equal(access.canRead(document, {
    actorId: "actor-ministry",
    organizationId: "org-ministry",
    territoryIds: ["territory-dakar"],
    permissions: ["government.write"],
  }).allowed, true);
});

test("cree des taches pour document manquant verification renouvellement et decision fragilisee", () => {
  const projector = new DocumentWorkQueueProjector();
  const items = projector.project({
    documents: [{ ...document, status: "registered" }],
    decisions: [decision],
    requiredDocumentRules: [{
      id: "requirement-1",
      relatedEntityType: "commercial_order",
      relatedEntityId: "order-1",
      requiredDocumentTypes: ["delivery_note", "destination_confirmation"],
      responsibleOrganizationId: "org-logistics",
      territoryId: "territory-dakar",
      dueAt: "2026-07-27T00:00:00.000Z",
      reason: "Clôturer la livraison avant règlement.",
    }],
    at: "2026-07-28T00:00:00.000Z",
  });
  assert.equal(items.filter((item) => item.workType === "provide_document").length, 2);
  assert.ok(items.some((item) => item.workType === "verify_document"));
  assert.ok(items.some((item) => item.workType === "renew_document"));

  const integrityItems = projector.project({
    documents: [{ ...document, status: "revoked" }],
    decisions: [decision],
    requiredDocumentRules: [],
    at: "2026-07-28T00:00:00.000Z",
  });
  assert.ok(integrityItems.some((item) => item.workType === "review_decision_integrity"));
});
