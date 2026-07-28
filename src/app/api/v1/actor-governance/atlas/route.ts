import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getEcosystemActorGovernanceRuntime } from "@/platform/identity/ecosystem-actor-governance-runtime";
import { getPersistentActorGovernanceRuntime } from "@/platform/identity/persistent-actor-governance-runtime";
import { MandateAuthorizationProjection } from "@/platform/identity/mandate-authorization-projection";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

const prohibitedRolePairs: Array<[string, string]> = [
  ["finance.request", "finance.approve"],
  ["payment.prepare", "payment.execute"],
  ["quality.inspect", "quality.final_approve"],
  ["actor.review", "actor.activate"],
  ["trade.sell", "trade.settlement_approve"],
];

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const snapshot = hasRuntimeDatabase()
    ? await getPersistentActorGovernanceRuntime().snapshot()
    : getEcosystemActorGovernanceRuntime().snapshot();
  const projection = new MandateAuthorizationProjection();
  const expiringMandates = projection.expiringMandates({ mandates: snapshot.mandates, at: new Date().toISOString(), withinDays: 30 });
  const roleConflicts = snapshot.mandates.flatMap((mandate) => prohibitedRolePairs
    .filter(([left, right]) => mandate.roleCodes.includes(left) && mandate.roleCodes.includes(right))
    .map(([left, right]) => ({ mandateId: mandate.id, actorId: mandate.actorId, conflictingRoles: [left, right] })));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    metrics: {
      ...snapshot.metrics,
      expiringWithin30DaysCount: expiringMandates.length,
      revokedMandateCount: snapshot.mandates.filter((item) => item.status === "revoked").length,
      roleConflictCount: roleConflicts.length,
      reviewBacklogCount: snapshot.applications.filter((item) => item.status === "under_review").length,
    },
    attentionQueue: {
      applicationsToReview: snapshot.applications.filter((item) => ["submitted", "under_review"].includes(item.status)),
      expiringMandates,
      restrictedMandates: snapshot.mandates.filter((item) => item.status === "restricted"),
      suspendedMandates: snapshot.mandates.filter((item) => item.status === "suspended"),
      expiredMandates: snapshot.mandates.filter((item) => item.status === "expired"),
      roleConflicts,
    },
    recentDecisions: snapshot.governanceActions.slice(-20).reverse(),
    persistence: hasRuntimeDatabase() ? "postgres" : "memory",
  });
}
