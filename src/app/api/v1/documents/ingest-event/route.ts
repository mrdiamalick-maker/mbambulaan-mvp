import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getDocumentEventIngestionService } from "@/platform/documents/document-event-ingestion-service";
import type { DocumentSourceEvent } from "@/platform/documents/operational-document-projector";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const event = await request.json().catch(() => undefined) as DocumentSourceEvent | undefined;
  if (!event?.type || !event.entityId || !event.organizationId || !event.actorId || !event.territoryIds?.length || !event.occurredAt) {
    return NextResponse.json({ error: { code: "INVALID_DOCUMENT_SOURCE_EVENT", message: "L'événement, l'objet métier, l'organisation, l'acteur, le territoire et la date sont obligatoires." } }, { status: 400 });
  }
  if (authorization.session.activeTerritoryId !== "territory-national" && !event.territoryIds.includes(authorization.session.activeTerritoryId)) {
    return NextResponse.json({ error: { code: "TERRITORY_DENIED", message: "Le territoire actif ne permet pas d'ingérer cet événement." } }, { status: 403 });
  }
  try {
    const result = await getDocumentEventIngestionService().ingest(event);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "DOCUMENT_EVENT_INGESTION_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
