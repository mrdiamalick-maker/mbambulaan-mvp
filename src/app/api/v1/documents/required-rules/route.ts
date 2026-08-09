import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getRuntimeSqlExecutor, hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { PostgresRequiredDocumentRuleRepository } from "@/platform/documents/postgres-required-document-rule-repository";
import type { RequiredDocumentRule } from "@/platform/documents/document-work-queue-projector";

const memoryRules = new Map<string, RequiredDocumentRule>();

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const url = new URL(request.url);
  const query = {
    territoryId: url.searchParams.get("territoryId") ?? authorization.session.activeTerritoryId,
    relatedEntityType: url.searchParams.get("relatedEntityType") ?? undefined,
    relatedEntityId: url.searchParams.get("relatedEntityId") ?? undefined,
  };
  const rules = hasRuntimeDatabase()
    ? await new PostgresRequiredDocumentRuleRepository(getRuntimeSqlExecutor).listActive(query)
    : [...memoryRules.values()].filter((rule) =>
      (!query.territoryId || query.territoryId === "territory-national" || rule.territoryId === query.territoryId)
      && (!query.relatedEntityType || rule.relatedEntityType === query.relatedEntityType)
      && (!query.relatedEntityId || rule.relatedEntityId === query.relatedEntityId));
  return NextResponse.json({ rules, persistence: hasRuntimeDatabase() ? "postgres" : "memory" });
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const rule = await request.json().catch(() => undefined) as RequiredDocumentRule | undefined;
  if (!rule?.id || !rule.relatedEntityId || !rule.requiredDocumentTypes?.length || !rule.reason?.trim()) {
    return NextResponse.json({ error: { code: "INVALID_REQUIRED_DOCUMENT_RULE", message: "La règle, l'objet métier, les types requis et le motif sont obligatoires." } }, { status: 400 });
  }
  if (authorization.session.activeTerritoryId !== "territory-national" && rule.territoryId !== authorization.session.activeTerritoryId) {
    return NextResponse.json({ error: { code: "TERRITORY_DENIED", message: "Le territoire actif ne permet pas de gérer cette règle." } }, { status: 403 });
  }
  if (hasRuntimeDatabase()) await new PostgresRequiredDocumentRuleRepository(getRuntimeSqlExecutor).upsert(rule);
  else memoryRules.set(rule.id, structuredClone(rule));
  return NextResponse.json({ rule, persistence: hasRuntimeDatabase() ? "postgres" : "memory" }, { status: 201 });
}
