import { LandingLotLifecycle, type ConservationStatus, type LotQualityGrade, type WeighingMethod } from "./landing-lot-lifecycle";

export type LandingLotCommand =
  | { type: "seed_demo"; at: string }
  | { type: "confirm_landing"; landingId: string; expectedReturnId?: string; vesselId: string; landingSiteId: string; territoryId: string; landedAt: string }
  | { type: "register_weighing"; weighingId: string; landingId: string; totalWeightKg: number; method: WeighingMethod; recordedAt: string }
  | { type: "verify_weighing"; weighingId: string }
  | { type: "dispute_weighing"; weighingId: string; reason: string }
  | { type: "create_lot"; lotId: string; landingId: string; speciesCode: string; weightKg: number; qualityGrade: LotQualityGrade; conservationStatus: ConservationStatus; createdAt: string }
  | { type: "make_lot_available"; lotId: string }
  | { type: "block_lot"; lotId: string; reason: string }
  | { type: "decide_destination"; lotId: string; coldStorageAvailable: boolean; processingAvailable: boolean; communityProgramAvailable: boolean }
  | { type: "reconcile_landing"; landingId: string; weightVariancePercent: number; arrivalDelayMinutes: number };

export interface LandingLotExecutionInput {
  commandId: string;
  actorId: string;
  territoryId: string;
  command: LandingLotCommand;
}

export class LandingLotRuntime {
  private readonly lifecycle = new LandingLotLifecycle();
  private readonly processedCommands = new Map<string, unknown>();

  execute(input: LandingLotExecutionInput) {
    const previous = this.processedCommands.get(input.commandId);
    if (previous) return structuredClone(previous);

    const command = input.command;
    let result: unknown;
    switch (command.type) {
      case "seed_demo":
        result = this.seedDemo(command.at, input.actorId, input.territoryId);
        break;
      case "confirm_landing":
        this.assertTerritory(command.territoryId, input.territoryId);
        result = this.lifecycle.confirmLanding({
          id: command.landingId,
          expectedReturnId: command.expectedReturnId,
          vesselId: command.vesselId,
          landingSiteId: command.landingSiteId,
          territoryId: command.territoryId,
          landedAt: command.landedAt,
          confirmedByActorId: input.actorId,
        });
        break;
      case "register_weighing":
        result = this.lifecycle.registerWeighing({
          id: command.weighingId,
          landingId: command.landingId,
          totalWeightKg: command.totalWeightKg,
          method: command.method,
          recordedByActorId: input.actorId,
          recordedAt: command.recordedAt,
        });
        break;
      case "verify_weighing":
        result = this.lifecycle.verifyWeighing(command.weighingId, input.actorId);
        break;
      case "dispute_weighing":
        result = this.lifecycle.disputeWeighing(command.weighingId, input.actorId, command.reason);
        break;
      case "create_lot":
        result = this.lifecycle.createLot({
          id: command.lotId,
          landingId: command.landingId,
          speciesCode: command.speciesCode,
          weightKg: command.weightKg,
          qualityGrade: command.qualityGrade,
          conservationStatus: command.conservationStatus,
          createdByActorId: input.actorId,
          createdAt: command.createdAt,
        });
        break;
      case "make_lot_available":
        result = this.lifecycle.makeLotAvailable(command.lotId);
        break;
      case "block_lot":
        result = this.lifecycle.blockLot(command.lotId, command.reason);
        break;
      case "decide_destination":
        result = this.lifecycle.decideDestination(command.lotId, command);
        break;
      case "reconcile_landing":
        result = this.lifecycle.reconcileLanding(command.landingId, command);
        break;
      default:
        throw new Error("Commande de débarquement inconnue.");
    }

    const response = { result, snapshot: this.lifecycle.snapshot() };
    this.processedCommands.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot() {
    return this.lifecycle.snapshot();
  }

  private seedDemo(at: string, actorId: string, territoryId: string) {
    if (this.lifecycle.snapshot().expectedReturns.length > 0) return { seeded: false };
    const expectedAt = new Date(Date.parse(at) - 30 * 60_000).toISOString();
    this.lifecycle.registerExpectedReturn({
      id: "expected-return-pilot-01",
      vesselId: "vessel-pilot-01",
      expectedLandingSiteId: "landing-site-pilot-01",
      territoryId,
      expectedAt,
      expectedWeightKg: 1_000,
      status: "announced",
    });
    this.lifecycle.confirmLanding({
      id: "landing-pilot-01",
      expectedReturnId: "expected-return-pilot-01",
      vesselId: "vessel-pilot-01",
      landingSiteId: "landing-site-pilot-01",
      territoryId,
      landedAt: at,
      confirmedByActorId: actorId,
    });
    return { seeded: true, landingId: "landing-pilot-01" };
  }

  private assertTerritory(commandTerritoryId: string, activeTerritoryId: string) {
    if (commandTerritoryId !== activeTerritoryId) throw new Error("Le territoire actif ne permet pas cette opération.");
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbLandingLotRuntime?: LandingLotRuntime };

export function getLandingLotRuntime() {
  globalRuntime.__mbLandingLotRuntime ??= new LandingLotRuntime();
  return globalRuntime.__mbLandingLotRuntime;
}
