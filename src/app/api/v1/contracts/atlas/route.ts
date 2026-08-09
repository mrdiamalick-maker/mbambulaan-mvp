import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { projectContractGovernance } from "@/platform/contracts/contract-governance-projection";
import { getOperationalContractRuntime } from "@/platform/contracts/operational-contract-runtime";
import { getPersistentOperationalContractRuntime } from "@/platform/contracts/persistent-operational-contract-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentOperationalContractRuntime().snapshot()
    : getOperationalContractRuntime().snapshot();
  return NextResponse.json({
    ...projectContractGovernance(snapshot),
    persistence: persistent ? "postgres" : "memory",
  });
}
