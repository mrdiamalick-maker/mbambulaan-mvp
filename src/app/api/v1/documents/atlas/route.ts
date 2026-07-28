import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { DocumentAccessAndGovernance } from "@/platform/documents/document-access-and-governance";
import { getOperationalDocumentRegistry } from "@/platform/documents/operational-document-registry";
import { getPersistentOperationalDocumentRegistry } from "@/platform/documents/persistent-operational-document-registry";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentOperationalDocumentRegistry().snapshot()
    : getOperationalDocumentRegistry().snapshot();
  const governance = new DocumentAccessAndGovernance().governanceView({
    documents: snapshot.documents,
    decisions: snapshot.decisions,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ...governance, persistence: persistent ? "postgres" : "memory" });
}
