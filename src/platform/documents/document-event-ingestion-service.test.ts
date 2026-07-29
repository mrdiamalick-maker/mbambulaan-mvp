import test from "node:test";
import assert from "node:assert/strict";
import { DocumentEventIngestionService } from "./document-event-ingestion-service";
import { getOperationalDocumentRegistry } from "./operational-document-registry";

test("projette une livraison en bon de livraison et confirmation destinataire de facon idempotente", async () => {
  const service = new DocumentEventIngestionService();
  const event = {
    type: "commercial_delivery_confirmed" as const,
    entityId: "order-400kg-thiof",
    organizationId: "org-logistics-dakar",
    actorId: "actor-logistics",
    territoryIds: ["territory-dakar"],
    occurredAt: "2026-07-28T12:00:00.000Z",
    deliveryNoteReference: "storage://delivery-note/order-400kg-thiof.pdf",
    destinationConfirmationReference: "storage://destination-confirmation/order-400kg-thiof.pdf",
    checksumSha256: "delivery-order-400kg-thiof",
  };

  const first = await service.ingest(event);
  const second = await service.ingest(event);
  assert.deepEqual(first.projectedDocumentIds, second.projectedDocumentIds);

  const documents = getOperationalDocumentRegistry().snapshot("2026-07-28T13:00:00.000Z").documents
    .filter((item) => item.relatedEntityId === event.entityId);
  assert.equal(documents.length, 2);
  assert.deepEqual(documents.map((item) => item.documentType).sort(), ["delivery_note", "destination_confirmation"]);
  assert.ok(documents.every((item) => /^[a-f0-9]{64}$/i.test(item.checksumSha256)));
});
