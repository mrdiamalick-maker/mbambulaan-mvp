import { createHash } from "node:crypto";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { getOperationalDocumentRegistry } from "./operational-document-registry";
import { getPersistentOperationalDocumentRegistry } from "./persistent-operational-document-registry";
import { OperationalDocumentProjector, type DocumentSourceEvent } from "./operational-document-projector";

export class DocumentEventIngestionService {
  private readonly projector = new OperationalDocumentProjector();

  async ingest(event: DocumentSourceEvent) {
    const documents = this.projector.project(this.normalizeChecksum(event));
    const results = [];
    for (const document of documents) {
      const execution = {
        commandId: `project-document-${document.id}`,
        actorId: document.registeredByActorId,
        activeTerritoryId: document.territoryIds.includes("territory-national") ? "territory-national" : document.territoryIds[0],
        command: { type: "register_document" as const, document },
        occurredAt: document.registeredAt,
      };
      results.push(hasRuntimeDatabase()
        ? await getPersistentOperationalDocumentRegistry().execute(execution)
        : getOperationalDocumentRegistry().execute(execution));
    }
    return { projectedDocumentIds: documents.map((item) => item.id), results };
  }

  private normalizeChecksum(event: DocumentSourceEvent): DocumentSourceEvent {
    if (/^[a-f0-9]{64}$/i.test(event.checksumSha256)) return event;
    return {
      ...event,
      checksumSha256: createHash("sha256").update(event.checksumSha256).digest("hex"),
    };
  }
}

const globalService = globalThis as typeof globalThis & { __mbDocumentEventIngestionService?: DocumentEventIngestionService };
export function getDocumentEventIngestionService() {
  globalService.__mbDocumentEventIngestionService ??= new DocumentEventIngestionService();
  return globalService.__mbDocumentEventIngestionService;
}
