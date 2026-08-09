import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getOperationalContractRuntime, type OperationalContractCommand } from "@/platform/contracts/operational-contract-runtime";
import { getPersistentOperationalContractRuntime } from "@/platform/contracts/persistent-operational-contract-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { publishEcosystemBusinessEvent } from "@/platform/runtime/publish-ecosystem-business-event";

const governanceCommands = new Set<OperationalContractCommand["type"]>([
  "register_contract",
  "add_obligation",
  "register_corrective_plan",
  "update_corrective_plan",
  "record_governance_decision",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentOperationalContractRuntime().snapshot()
    : getOperationalContractRuntime().snapshot();
  return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: OperationalContractCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_CONTRACT_ACTION", message: "L'action contractuelle et son identifiant sont obligatoires." } }, { status: 400 });
  }

  const commandId = body.commandId;
  const command = body.command;
  const permission = governanceCommands.has(command.type) ? "government.write" : "government.read";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const execution = {
      commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command,
    };
    const persistent = hasRuntimeDatabase();
    const result = persistent
      ? await getPersistentOperationalContractRuntime().execute(execution)
      : getOperationalContractRuntime().execute(execution);

    const businessEvents: unknown[] = [];
    if (command.type === "register_contract") {
      const reference = command.contract.signedContractDocumentIds[0];
      if (reference) {
        businessEvents.push(await publishEcosystemBusinessEvent({
          id: `event-contract-${commandId}`,
          type: "contracts.contract.registered",
          occurredAt: command.contract.effectiveAt ?? new Date().toISOString(),
          correlationId: `contract-${command.contract.id}`,
          causationId: commandId,
          actorId: authorization.identity.id,
          organizationId: authorization.identity.organizationId,
          territoryIds: command.contract.territoryIds,
          entityType: "contract",
          entityId: command.contract.id,
          payload: { signedContractReference: reference, checksumSha256: reference },
        }));
      }
    }

    if (command.type === "record_execution" && command.record.outcome === "breached") {
      const obligation = result.snapshot.obligations.find((item) => item.id === command.record.obligationId);
      if (obligation) {
        businessEvents.push(await publishEcosystemBusinessEvent({
          id: `event-obligation-breach-${commandId}`,
          type: "contracts.obligation.breached",
          occurredAt: command.record.recordedAt,
          correlationId: `contract-${obligation.contractId}`,
          causationId: commandId,
          actorId: authorization.identity.id,
          organizationId: obligation.responsibleOrganizationId,
          territoryIds: obligation.territoryIds,
          entityType: "contract_obligation",
          entityId: obligation.id,
          payload: {
            contractId: obligation.contractId,
            summary: command.record.comment,
            measuredValue: command.record.measuredValue,
            targetValue: obligation.targetValue,
            unit: obligation.unit,
            responsibleActorId: obligation.responsibleActorId,
            completionDocumentIds: command.record.completionDocumentIds,
          },
        }));
      }
    }

    if (command.type === "record_governance_decision") {
      const contract = result.snapshot.contracts.find((item) => item.id === command.decision.contractId);
      if (contract) {
        businessEvents.push(await publishEcosystemBusinessEvent({
          id: `event-governance-decision-${commandId}`,
          type: "governance.decision.recorded",
          occurredAt: command.decision.decidedAt,
          correlationId: `contract-${command.decision.contractId}`,
          causationId: commandId,
          actorId: command.decision.decidedByActorId,
          organizationId: authorization.identity.organizationId,
          territoryIds: contract.territoryIds,
          entityType: "governance_decision",
          entityId: command.decision.id,
          payload: {
            decisionType: command.decision.decisionType,
            summary: command.decision.reason,
            contractId: command.decision.contractId,
            obligationId: command.decision.obligationId,
            decisionDocumentIds: command.decision.decisionDocumentIds,
          },
        }));
      }
    }

    return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory", businessEvents }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "CONTRACT_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
