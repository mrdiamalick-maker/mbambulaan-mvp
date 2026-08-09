import { runColdChainCoordinationScenario, type DemoScenarioResult } from "@/platform/product-suite/integrated-demo-scenario";
import { getIntegratedPlatformRuntime, resetIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

export type TestInfrastructureCode =
  | "application"
  | "postgresql"
  | "object_storage"
  | "runtime_worker"
  | "scheduler"
  | "sms"
  | "whatsapp"
  | "mobile_money"
  | "weather"
  | "antivirus"
  | "telemetry"
  | "atlas";

export type TestInfrastructureMode = "embedded" | "simulated" | "external";
export type TestInfrastructureStatus = "operational" | "degraded" | "unavailable";

export interface TestInfrastructureState {
  code: TestInfrastructureCode;
  name: string;
  mode: TestInfrastructureMode;
  status: TestInfrastructureStatus;
  lastCheckedAt: string;
  detail: string;
  operations: number;
}

export interface TestEnvironmentOperation {
  id: string;
  type:
    | "environment_reset"
    | "demo_seeded"
    | "sms_sent"
    | "whatsapp_sent"
    | "payment_requested"
    | "payment_confirmed"
    | "weather_received"
    | "document_scanned"
    | "scenario_executed";
  occurredAt: string;
  status: "completed" | "failed";
  reference?: string;
  payload: Record<string, string | number | boolean | null>;
}

export interface TestPayment {
  id: string;
  payerActorId: string;
  beneficiaryActorId: string;
  amountXof: number;
  provider: "wave_simulator" | "orange_money_simulator";
  status: "requested" | "confirmed" | "failed";
  providerReference?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface IntegratedTestEnvironmentSnapshot {
  environmentId: string;
  status: "ready" | "degraded" | "unavailable";
  initializedAt: string;
  resetCount: number;
  infrastructures: TestInfrastructureState[];
  operations: TestEnvironmentOperation[];
  payments: TestPayment[];
  latestScenario?: DemoScenarioResult;
  runtime: {
    running: boolean;
    pendingEvents: number;
    failedEvents: number;
    processedEvents: number;
    openSignals: number;
    atlasInsights: number;
    atlasScenarios: number;
    atlasBriefings: number;
  };
}

const infrastructureDefinitions: Array<Omit<TestInfrastructureState, "lastCheckedAt" | "operations">> = [
  { code: "application", name: "Application web et API", mode: "embedded", status: "operational", detail: "Next.js et API versionnée actifs." },
  { code: "postgresql", name: "PostgreSQL", mode: "external", status: "operational", detail: "Schéma et migrations validés dans le cluster éphémère." },
  { code: "object_storage", name: "Stockage documentaire", mode: "simulated", status: "operational", detail: "Stockage objet simulé avec références et preuves." },
  { code: "runtime_worker", name: "Workers runtime", mode: "embedded", status: "operational", detail: "Outbox et projections traitées à la demande." },
  { code: "scheduler", name: "Planificateur", mode: "simulated", status: "operational", detail: "Déclenchements planifiés simulés et auditables." },
  { code: "sms", name: "SMS", mode: "simulated", status: "operational", detail: "Envoi simulé avec identifiant fournisseur." },
  { code: "whatsapp", name: "WhatsApp", mode: "simulated", status: "operational", detail: "Messages de coordination simulés." },
  { code: "mobile_money", name: "Mobile Money", mode: "simulated", status: "operational", detail: "Paiements Wave et Orange Money simulés en FCFA." },
  { code: "weather", name: "Météo maritime", mode: "simulated", status: "operational", detail: "Bulletins météo déterministes pour les scénarios." },
  { code: "antivirus", name: "Analyse antivirus", mode: "simulated", status: "operational", detail: "Résultats propres ou infectés simulables." },
  { code: "telemetry", name: "Télémétrie", mode: "embedded", status: "operational", detail: "État runtime, événements, signaux et erreurs exposés." },
  { code: "atlas", name: "Atlas", mode: "embedded", status: "operational", detail: "Questions, preuves, scénarios, évaluations et briefings actifs." },
];

export class IntegratedTestEnvironment {
  private initializedAt: string;
  private resetCount = 0;
  private operations: TestEnvironmentOperation[] = [];
  private payments: TestPayment[] = [];
  private latestScenario?: DemoScenarioResult;
  private infrastructures: TestInfrastructureState[];

  constructor(private readonly environmentId = "mbambulaan-complete-test") {
    this.initializedAt = new Date().toISOString();
    this.infrastructures = this.buildInfrastructures(this.initializedAt);
  }

  reset(at = new Date().toISOString()) {
    resetIntegratedPlatformRuntime(at);
    this.initializedAt = at;
    this.resetCount += 1;
    this.operations = [];
    this.payments = [];
    this.latestScenario = undefined;
    this.infrastructures = this.buildInfrastructures(at);
    this.record("environment_reset", at, { resetCount: this.resetCount });
    return this.snapshot();
  }

  async seedAndRunColdChainScenario(at = new Date()) {
    this.record("demo_seeded", at.toISOString(), {
      territory: "Dakar",
      cooperative: "Coopérative Dakar",
      blockedVolumeKg: 2400,
    });
    this.latestScenario = await runColdChainCoordinationScenario(at);
    this.record("scenario_executed", this.latestScenario.completedAt, {
      scenarioId: this.latestScenario.scenarioId,
      processedEvents: this.latestScenario.outcome.processedEvents,
      atlasInsights: this.latestScenario.outcome.atlasInsights,
    }, this.latestScenario.scenarioId);
    this.bump("runtime_worker");
    this.bump("atlas");
    this.bump("telemetry");
    return this.latestScenario;
  }

  sendSms(input: { recipient: string; message: string; at?: string }) {
    const at = input.at ?? new Date().toISOString();
    const reference = `sms-sim-${this.operations.length + 1}`;
    this.record("sms_sent", at, { recipient: input.recipient, message: input.message }, reference);
    this.bump("sms");
    return { reference, status: "delivered" as const, deliveredAt: at };
  }

  sendWhatsApp(input: { recipient: string; message: string; at?: string }) {
    const at = input.at ?? new Date().toISOString();
    const reference = `wa-sim-${this.operations.length + 1}`;
    this.record("whatsapp_sent", at, { recipient: input.recipient, message: input.message }, reference);
    this.bump("whatsapp");
    return { reference, status: "delivered" as const, deliveredAt: at };
  }

  requestPayment(input: {
    id: string;
    payerActorId: string;
    beneficiaryActorId: string;
    amountXof: number;
    provider: TestPayment["provider"];
    at?: string;
  }) {
    if (input.amountXof <= 0) throw new Error("Le montant du paiement doit être strictement positif.");
    if (this.payments.some((payment) => payment.id === input.id)) throw new Error(`Le paiement ${input.id} existe déjà.`);
    const createdAt = input.at ?? new Date().toISOString();
    const payment: TestPayment = { ...input, status: "requested", createdAt };
    this.payments.push(payment);
    this.record("payment_requested", createdAt, {
      paymentId: payment.id,
      amountXof: payment.amountXof,
      provider: payment.provider,
    }, payment.id);
    this.bump("mobile_money");
    return structuredClone(payment);
  }

  confirmPayment(paymentId: string, at = new Date().toISOString()) {
    const payment = this.payments.find((item) => item.id === paymentId);
    if (!payment) throw new Error(`Le paiement ${paymentId} est introuvable.`);
    if (payment.status === "confirmed") return structuredClone(payment);
    payment.status = "confirmed";
    payment.confirmedAt = at;
    payment.providerReference = `mm-sim-${payment.id}`;
    this.record("payment_confirmed", at, {
      paymentId: payment.id,
      amountXof: payment.amountXof,
      providerReference: payment.providerReference,
    }, payment.providerReference);
    this.bump("mobile_money");
    return structuredClone(payment);
  }

  getWeather(territoryId: string, at = new Date().toISOString()) {
    const forecast = {
      territoryId,
      observedAt: at,
      seaState: "moderate" as const,
      windKph: 22,
      waveHeightMeters: 1.4,
      riskLevel: "watch" as const,
      recommendation: "Maintenir la vigilance et confirmer les départs avec le coordinateur local.",
    };
    this.record("weather_received", at, { territoryId, riskLevel: forecast.riskLevel });
    this.bump("weather");
    return forecast;
  }

  scanDocument(input: { documentId: string; fileName: string; infected?: boolean; at?: string }) {
    const at = input.at ?? new Date().toISOString();
    const result = {
      documentId: input.documentId,
      fileName: input.fileName,
      status: input.infected ? "infected" as const : "clean" as const,
      scannedAt: at,
      engine: "mbambulaan-av-simulator",
    };
    this.record("document_scanned", at, {
      documentId: result.documentId,
      fileName: result.fileName,
      clean: result.status === "clean",
    }, result.documentId);
    this.bump("antivirus");
    this.bump("object_storage");
    return result;
  }

  snapshot(): IntegratedTestEnvironmentSnapshot {
    const runtime = getIntegratedPlatformRuntime().snapshot();
    const unavailable = this.infrastructures.filter((item) => item.status === "unavailable").length;
    const degraded = this.infrastructures.filter((item) => item.status === "degraded").length;
    return {
      environmentId: this.environmentId,
      status: unavailable > 0 ? "unavailable" : degraded > 0 || runtime.failedEvents > 0 ? "degraded" : "ready",
      initializedAt: this.initializedAt,
      resetCount: this.resetCount,
      infrastructures: structuredClone(this.infrastructures),
      operations: structuredClone(this.operations),
      payments: structuredClone(this.payments),
      latestScenario: this.latestScenario ? structuredClone(this.latestScenario) : undefined,
      runtime: {
        running: runtime.running,
        pendingEvents: runtime.pendingEvents,
        failedEvents: runtime.failedEvents,
        processedEvents: runtime.processedEventIds.length,
        openSignals: runtime.digitalTwin.signals.filter((signal) => signal.status === "open").length,
        atlasInsights: runtime.atlas.insights.length,
        atlasScenarios: runtime.atlas.scenarios.length,
        atlasBriefings: runtime.atlas.briefings.length,
      },
    };
  }

  private buildInfrastructures(at: string): TestInfrastructureState[] {
    return infrastructureDefinitions.map((item) => ({ ...item, lastCheckedAt: at, operations: 0 }));
  }

  private bump(code: TestInfrastructureCode) {
    const infrastructure = this.infrastructures.find((item) => item.code === code);
    if (!infrastructure) return;
    infrastructure.operations += 1;
    infrastructure.lastCheckedAt = new Date().toISOString();
  }

  private record(
    type: TestEnvironmentOperation["type"],
    occurredAt: string,
    payload: TestEnvironmentOperation["payload"],
    reference?: string,
  ) {
    this.operations.push({
      id: `test-operation-${this.operations.length + 1}`,
      type,
      occurredAt,
      status: "completed",
      reference,
      payload: structuredClone(payload),
    });
  }
}
