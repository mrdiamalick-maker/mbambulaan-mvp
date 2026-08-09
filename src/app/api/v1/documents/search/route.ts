import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { getOperationalDocumentRegistry } from "@/platform/documents/operational-document-registry";
import { getPersistentOperationalDocumentRegistry } from "@/platform/documents/persistent-operational-document-registry";
import { DocumentSearchIndex, type DocumentSearchQuery } from "@/platform/documents/document-search-index";
import { DocumentAccessAndGovernance } from "@/platform/documents/document-access-and-governance";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const url = new URL(request.url);
  const query: DocumentSearchQuery = {
    actorId: url.searchParams.get("actorId") ?? undefined,
    organizationId: url.searchParams.get("organizationId") ?? undefined,
    territoryId: url.searchParams.get("territoryId") ?? authorization.session.activeTerritoryId,
    relatedEntityType: (url.searchParams.get("relatedEntityType") as DocumentSearchQuery["relatedEntityType"]) ?? undefined,
    relatedEntityId: url.searchParams.get("relatedEntityId") ?? undefined,
    documentTypes: url.searchParams.getAll("documentType") as DocumentSearchQuery["documentTypes"],
    statuses: url.searchParams.getAll("status") as DocumentSearchQuery["statuses"],
    text: url.searchParams.get("text") ?? undefined,
  };
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentOperationalDocumentRegistry().snapshot()
    : getOperationalDocumentRegistry().snapshot();
  const access = new DocumentAccessAndGovernance();
  const readableDocuments = snapshot.documents.filter((document) => access.canRead(document, {
    actorId: authorization.identity.id,
    organizationId: authorization.identity.organizationId,
    territoryIds: authorization.identity.territoryIds,
    permissions: authorization.identity.permissions,
  }).allowed);
  const result = new DocumentSearchIndex().search({ documents: readableDocuments, decisions: snapshot.decisions, query });
  return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory" });
}
