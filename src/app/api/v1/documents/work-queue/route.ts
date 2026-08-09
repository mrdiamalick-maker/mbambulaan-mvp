import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { getOperationalDocumentRegistry } from "@/platform/documents/operational-document-registry";
import { getPersistentOperationalDocumentRegistry } from "@/platform/documents/persistent-operational-document-registry";
import { DocumentWorkQueueProjector, type RequiredDocumentRule } from "@/platform/documents/document-work-queue-projector";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as { requiredDocumentRules?: RequiredDocumentRule[]; at?: string } | undefined;
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentOperationalDocumentRegistry().snapshot(body?.at)
    : getOperationalDocumentRegistry().snapshot(body?.at);
  const allItems = new DocumentWorkQueueProjector().project({
    documents: snapshot.documents,
    decisions: snapshot.decisions,
    requiredDocumentRules: body?.requiredDocumentRules ?? [],
    at: body?.at ?? new Date().toISOString(),
  });
  const territoryId = authorization.session.activeTerritoryId;
  const organizationId = authorization.identity.organizationId;
  const privileged = authorization.identity.permissions.includes("government.write") || authorization.identity.permissions.includes("admin.manage");
  const workItems = allItems.filter((item) =>
    (territoryId === "territory-national" || item.territoryId === territoryId)
    && (privileged || item.organizationId === organizationId),
  );
  return NextResponse.json({ workItems, total: workItems.length, persistence: persistent ? "postgres" : "memory" });
}
