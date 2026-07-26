import type { EntityId, ISODateTime } from "./types";

export type IntegrationType =
  | "mobile_money"
  | "electronic_scale"
  | "gps"
  | "ais"
  | "weather"
  | "bank"
  | "insurance"
  | "public_registry"
  | "customs_system"
  | "tos"
  | "port_community_system"
  | "erp"
  | "api"
  | "file_exchange"
  | "webhook";

export type IntegrationDirection = "inbound" | "outbound" | "bidirectional";
export type IntegrationStatus = "draft" | "configured" | "active" | "degraded" | "suspended" | "retired";
export type MessageStatus = "received" | "validated" | "processed" | "failed" | "dead_letter" | "replayed";

export interface IntegrationEndpoint {
  id: EntityId;
  code: string;
  name: string;
  type: IntegrationType;
  direction: IntegrationDirection;
  status: IntegrationStatus;
  providerName: string;
  baseUrl?: string;
  authenticationMode: "none" | "api_key" | "oauth2" | "basic" | "certificate" | "signed_payload";
  secretReference?: string;
  supportedOperations: string[];
  territoryIds: EntityId[];
  ecosystemConfigurationCodes: string[];
  timeoutMs: number;
  retryPolicyCode: string;
  metadata: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface IntegrationContract {
  id: EntityId;
  endpointId: EntityId;
  operationCode: string;
  version: string;
  requestSchema: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  eventTypeCode?: string;
  idempotencyKeyPath?: string;
  requiredHeaders: string[];
  fieldMappings: FieldMapping[];
  validationRules: IntegrationValidationRule[];
  active: boolean;
}

export interface FieldMapping {
  sourcePath: string;
  targetPath: string;
  transformation?: "identity" | "string" | "number" | "boolean" | "date" | "uppercase" | "lowercase" | "lookup";
  lookupValues?: Record<string, string>;
  required: boolean;
}

export interface IntegrationValidationRule {
  code: string;
  description: string;
  expression: string;
  blocking: boolean;
}

export interface RetryPolicy {
  code: string;
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  retryableErrorCodes: string[];
  deadLetterAfterFailure: boolean;
}

export interface IntegrationMessage {
  id: EntityId;
  endpointId: EntityId;
  contractId: EntityId;
  direction: Exclude<IntegrationDirection, "bidirectional">;
  externalMessageId?: string;
  idempotencyKey?: string;
  correlationId?: string;
  status: MessageStatus;
  payload: Record<string, unknown>;
  normalizedPayload?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
  attempts: number;
  receivedAt: ISODateTime;
  processedAt?: ISODateTime;
  nextRetryAt?: ISODateTime;
}

export interface IntegrationExecutionResult {
  message: IntegrationMessage;
  emittedEvent?: {
    type: string;
    payload: Record<string, unknown>;
  };
  duplicate: boolean;
}

const retryPolicies: RetryPolicy[] = [
  {
    code: "realtime_standard",
    maxAttempts: 5,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    retryableErrorCodes: ["TIMEOUT", "NETWORK_ERROR", "RATE_LIMIT", "SERVICE_UNAVAILABLE"],
    deadLetterAfterFailure: true,
  },
  {
    code: "device_telemetry",
    maxAttempts: 10,
    initialDelayMs: 5000,
    backoffMultiplier: 1.5,
    retryableErrorCodes: ["NETWORK_ERROR", "OFFLINE_DEVICE", "INVALID_SEQUENCE"],
    deadLetterAfterFailure: true,
  },
  {
    code: "financial_transaction",
    maxAttempts: 3,
    initialDelayMs: 3000,
    backoffMultiplier: 2,
    retryableErrorCodes: ["TIMEOUT", "PENDING_PROVIDER_CONFIRMATION"],
    deadLetterAfterFailure: true,
  },
];

const defaultEndpointProfiles: Omit<IntegrationEndpoint, "id" | "createdAt" | "updatedAt">[] = [
  {
    code: "mobile_money_gateway",
    name: "Passerelle Mobile Money",
    type: "mobile_money",
    direction: "bidirectional",
    status: "draft",
    providerName: "À configurer",
    authenticationMode: "oauth2",
    supportedOperations: ["initiate_payment", "payment_status", "refund", "webhook_payment_confirmation"],
    territoryIds: [],
    ecosystemConfigurationCodes: ["artisanal_fishing_sn", "maritime_transport_port"],
    timeoutMs: 15000,
    retryPolicyCode: "financial_transaction",
    metadata: {},
  },
  {
    code: "electronic_scale_gateway",
    name: "Passerelle balances électroniques",
    type: "electronic_scale",
    direction: "inbound",
    status: "draft",
    providerName: "À configurer",
    authenticationMode: "signed_payload",
    supportedOperations: ["receive_weighing", "device_heartbeat", "device_configuration"],
    territoryIds: [],
    ecosystemConfigurationCodes: ["artisanal_fishing_sn"],
    timeoutMs: 10000,
    retryPolicyCode: "device_telemetry",
    metadata: {},
  },
  {
    code: "gps_ais_gateway",
    name: "Passerelle GPS / AIS",
    type: "gps",
    direction: "inbound",
    status: "draft",
    providerName: "À configurer",
    authenticationMode: "api_key",
    supportedOperations: ["receive_position", "receive_geofence_event", "receive_vessel_status"],
    territoryIds: [],
    ecosystemConfigurationCodes: ["artisanal_fishing_sn", "maritime_transport_port"],
    timeoutMs: 10000,
    retryPolicyCode: "device_telemetry",
    metadata: {},
  },
  {
    code: "public_registry_gateway",
    name: "Passerelle registres publics",
    type: "public_registry",
    direction: "bidirectional",
    status: "draft",
    providerName: "À configurer",
    authenticationMode: "certificate",
    supportedOperations: ["verify_actor", "verify_vessel", "verify_organization", "synchronize_reference_data"],
    territoryIds: [],
    ecosystemConfigurationCodes: ["artisanal_fishing_sn", "maritime_transport_port"],
    timeoutMs: 20000,
    retryPolicyCode: "realtime_standard",
    metadata: {},
  },
  {
    code: "tos_gateway",
    name: "Passerelle Terminal Operating System",
    type: "tos",
    direction: "bidirectional",
    status: "draft",
    providerName: "À configurer",
    authenticationMode: "oauth2",
    supportedOperations: ["vessel_call", "berth_plan", "container_event", "yard_capacity", "gate_event"],
    territoryIds: [],
    ecosystemConfigurationCodes: ["maritime_transport_port"],
    timeoutMs: 15000,
    retryPolicyCode: "realtime_standard",
    metadata: {},
  },
];

export class IntegrationAndEcosystemEngine {
  private readonly endpoints = new Map<EntityId, IntegrationEndpoint>();
  private readonly contracts = new Map<EntityId, IntegrationContract>();
  private readonly messages = new Map<EntityId, IntegrationMessage>();
  private readonly idempotencyIndex = new Map<string, EntityId>();
  private readonly deadLetters = new Map<EntityId, IntegrationMessage>();
  private readonly policies = new Map<string, RetryPolicy>(retryPolicies.map((policy) => [policy.code, policy]));

  registerEndpoint(input: IntegrationEndpoint) {
    if (this.endpoints.has(input.id)) throw new Error(`Le connecteur ${input.id} existe déjà.`);
    if (!this.policies.has(input.retryPolicyCode)) throw new Error(`Politique de reprise inconnue : ${input.retryPolicyCode}.`);
    if (input.timeoutMs <= 0) throw new Error("Le délai d'attente doit être positif.");
    this.endpoints.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  registerContract(input: IntegrationContract) {
    if (this.contracts.has(input.id)) throw new Error(`Le contrat ${input.id} existe déjà.`);
    const endpoint = this.requireEndpoint(input.endpointId);
    if (!endpoint.supportedOperations.includes(input.operationCode)) {
      throw new Error(`L'opération ${input.operationCode} n'est pas supportée par ${endpoint.code}.`);
    }
    this.contracts.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  activateEndpoint(input: { endpointId: EntityId; activatedAt: ISODateTime }) {
    const endpoint = this.requireEndpoint(input.endpointId);
    const activeContracts = [...this.contracts.values()].filter((contract) => contract.endpointId === endpoint.id && contract.active);
    if (activeContracts.length === 0) throw new Error("Un connecteur ne peut pas être activé sans contrat actif.");
    endpoint.status = "active";
    endpoint.updatedAt = input.activatedAt;
    this.endpoints.set(endpoint.id, endpoint);
    return structuredClone(endpoint);
  }

  receive(input: {
    id: EntityId;
    endpointId: EntityId;
    contractId: EntityId;
    externalMessageId?: string;
    idempotencyKey?: string;
    correlationId?: string;
    payload: Record<string, unknown>;
    receivedAt: ISODateTime;
  }): IntegrationExecutionResult {
    const endpoint = this.requireEndpoint(input.endpointId);
    const contract = this.requireContract(input.contractId);
    if (contract.endpointId !== endpoint.id) throw new Error("Le contrat ne correspond pas au connecteur.");
    if (endpoint.status !== "active") throw new Error(`Le connecteur ${endpoint.code} n'est pas actif.`);
    if (!contract.active) throw new Error(`Le contrat ${contract.id} n'est pas actif.`);

    if (input.idempotencyKey) {
      const existingId = this.idempotencyIndex.get(input.idempotencyKey);
      if (existingId) {
        return { message: structuredClone(this.requireMessage(existingId)), duplicate: true };
      }
    }

    const message: IntegrationMessage = {
      id: input.id,
      endpointId: input.endpointId,
      contractId: input.contractId,
      direction: "inbound",
      externalMessageId: input.externalMessageId,
      idempotencyKey: input.idempotencyKey,
      correlationId: input.correlationId,
      status: "received",
      payload: structuredClone(input.payload),
      attempts: 0,
      receivedAt: input.receivedAt,
    };
    this.messages.set(message.id, message);
    if (message.idempotencyKey) this.idempotencyIndex.set(message.idempotencyKey, message.id);

    try {
      this.validatePayload(contract, message.payload);
      message.status = "validated";
      const normalizedPayload = this.mapPayload(contract.fieldMappings, message.payload);
      message.normalizedPayload = normalizedPayload;
      message.status = "processed";
      message.processedAt = input.receivedAt;
      message.attempts = 1;
      this.messages.set(message.id, message);
      return {
        message: structuredClone(message),
        emittedEvent: contract.eventTypeCode
          ? { type: contract.eventTypeCode, payload: structuredClone(normalizedPayload) }
          : undefined,
        duplicate: false,
      };
    } catch (error) {
      message.status = "failed";
      message.attempts = 1;
      message.errorCode = "VALIDATION_OR_MAPPING_ERROR";
      message.errorMessage = error instanceof Error ? error.message : String(error);
      this.messages.set(message.id, message);
      return { message: structuredClone(message), duplicate: false };
    }
  }

  createOutboundMessage(input: {
    id: EntityId;
    endpointId: EntityId;
    contractId: EntityId;
    idempotencyKey?: string;
    correlationId?: string;
    payload: Record<string, unknown>;
    createdAt: ISODateTime;
  }) {
    const endpoint = this.requireEndpoint(input.endpointId);
    const contract = this.requireContract(input.contractId);
    if (contract.endpointId !== endpoint.id) throw new Error("Le contrat ne correspond pas au connecteur.");
    const message: IntegrationMessage = {
      id: input.id,
      endpointId: input.endpointId,
      contractId: input.contractId,
      direction: "outbound",
      idempotencyKey: input.idempotencyKey,
      correlationId: input.correlationId,
      status: "validated",
      payload: structuredClone(input.payload),
      normalizedPayload: this.mapPayload(contract.fieldMappings, input.payload),
      attempts: 0,
      receivedAt: input.createdAt,
    };
    this.messages.set(message.id, message);
    if (message.idempotencyKey) this.idempotencyIndex.set(message.idempotencyKey, message.id);
    return structuredClone(message);
  }

  recordDeliverySuccess(input: { messageId: EntityId; processedAt: ISODateTime }) {
    const message = this.requireMessage(input.messageId);
    message.status = "processed";
    message.processedAt = input.processedAt;
    message.attempts += 1;
    message.errorCode = undefined;
    message.errorMessage = undefined;
    this.messages.set(message.id, message);
    return structuredClone(message);
  }

  recordDeliveryFailure(input: {
    messageId: EntityId;
    errorCode: string;
    errorMessage: string;
    failedAt: ISODateTime;
    nextRetryAt?: ISODateTime;
  }) {
    const message = this.requireMessage(input.messageId);
    const endpoint = this.requireEndpoint(message.endpointId);
    const policy = this.requirePolicy(endpoint.retryPolicyCode);
    message.attempts += 1;
    message.errorCode = input.errorCode;
    message.errorMessage = input.errorMessage;

    const retryable = policy.retryableErrorCodes.includes(input.errorCode) && message.attempts < policy.maxAttempts;
    if (retryable) {
      message.status = "failed";
      message.nextRetryAt = input.nextRetryAt;
    } else if (policy.deadLetterAfterFailure) {
      message.status = "dead_letter";
      this.deadLetters.set(message.id, structuredClone(message));
    } else {
      message.status = "failed";
    }
    this.messages.set(message.id, message);
    return structuredClone(message);
  }

  replayDeadLetter(input: { messageId: EntityId; replayedAt: ISODateTime }) {
    const deadLetter = this.deadLetters.get(input.messageId);
    if (!deadLetter) throw new Error(`Message en quarantaine introuvable : ${input.messageId}.`);
    deadLetter.status = "replayed";
    deadLetter.nextRetryAt = input.replayedAt;
    this.messages.set(deadLetter.id, deadLetter);
    this.deadLetters.delete(deadLetter.id);
    return structuredClone(deadLetter);
  }

  setEndpointStatus(input: { endpointId: EntityId; status: IntegrationStatus; updatedAt: ISODateTime }) {
    const endpoint = this.requireEndpoint(input.endpointId);
    endpoint.status = input.status;
    endpoint.updatedAt = input.updatedAt;
    this.endpoints.set(endpoint.id, endpoint);
    return structuredClone(endpoint);
  }

  getEndpointHealth(endpointId: EntityId) {
    const endpoint = this.requireEndpoint(endpointId);
    const messages = [...this.messages.values()].filter((message) => message.endpointId === endpointId);
    const processed = messages.filter((message) => message.status === "processed").length;
    const failed = messages.filter((message) => message.status === "failed").length;
    const deadLetter = messages.filter((message) => message.status === "dead_letter").length;
    const total = messages.length;
    return {
      endpoint: structuredClone(endpoint),
      totalMessages: total,
      processed,
      failed,
      deadLetter,
      successRate: total ? Math.round((processed / total) * 100) : 100,
      healthy: endpoint.status === "active" && deadLetter === 0 && (total === 0 || processed / total >= 0.95),
    };
  }

  getIntegrationReadiness(configurationCode: string) {
    const endpoints = [...this.endpoints.values()].filter((endpoint) =>
      endpoint.ecosystemConfigurationCodes.includes(configurationCode),
    );
    return {
      configurationCode,
      endpointCount: endpoints.length,
      activeEndpointCount: endpoints.filter((endpoint) => endpoint.status === "active").length,
      degradedEndpointCount: endpoints.filter((endpoint) => endpoint.status === "degraded").length,
      missingContractEndpointCodes: endpoints
        .filter((endpoint) => ![...this.contracts.values()].some((contract) => contract.endpointId === endpoint.id && contract.active))
        .map((endpoint) => endpoint.code),
      ready:
        endpoints.length > 0 &&
        endpoints.every((endpoint) =>
          endpoint.status === "active" &&
          [...this.contracts.values()].some((contract) => contract.endpointId === endpoint.id && contract.active),
        ),
    };
  }

  snapshot() {
    return {
      endpointProfiles: structuredClone(defaultEndpointProfiles),
      retryPolicies: [...this.policies.values()].map((item) => structuredClone(item)),
      endpoints: [...this.endpoints.values()].map((item) => structuredClone(item)),
      contracts: [...this.contracts.values()].map((item) => structuredClone(item)),
      messages: [...this.messages.values()].map((item) => structuredClone(item)),
      deadLetters: [...this.deadLetters.values()].map((item) => structuredClone(item)),
    };
  }

  private validatePayload(contract: IntegrationContract, payload: Record<string, unknown>) {
    const missing = contract.fieldMappings
      .filter((mapping) => mapping.required)
      .filter((mapping) => this.readPath(payload, mapping.sourcePath) === undefined)
      .map((mapping) => mapping.sourcePath);
    if (missing.length > 0) throw new Error(`Champs obligatoires manquants : ${missing.join(", ")}.`);

    const blockingRules = contract.validationRules.filter((rule) => rule.blocking);
    for (const rule of blockingRules) {
      if (!rule.expression.trim()) throw new Error(`Règle de validation invalide : ${rule.code}.`);
    }
  }

  private mapPayload(mappings: FieldMapping[], payload: Record<string, unknown>) {
    const result: Record<string, unknown> = {};
    for (const mapping of mappings) {
      const value = this.readPath(payload, mapping.sourcePath);
      if (value === undefined && !mapping.required) continue;
      this.writePath(result, mapping.targetPath, this.transformValue(value, mapping));
    }
    return result;
  }

  private transformValue(value: unknown, mapping: FieldMapping) {
    switch (mapping.transformation ?? "identity") {
      case "string":
        return value === undefined || value === null ? value : String(value);
      case "number":
        return value === undefined || value === null ? value : Number(value);
      case "boolean":
        return Boolean(value);
      case "date":
        return value === undefined || value === null ? value : new Date(String(value)).toISOString();
      case "uppercase":
        return value === undefined || value === null ? value : String(value).toUpperCase();
      case "lowercase":
        return value === undefined || value === null ? value : String(value).toLowerCase();
      case "lookup":
        return mapping.lookupValues?.[String(value)] ?? value;
      default:
        return value;
    }
  }

  private readPath(source: Record<string, unknown>, path: string) {
    return path.split(".").reduce<unknown>((current, key) => {
      if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, source);
  }

  private writePath(target: Record<string, unknown>, path: string, value: unknown) {
    const parts = path.split(".");
    let current = target;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) current[part] = value;
      else {
        const existing = current[part];
        if (!existing || typeof existing !== "object") current[part] = {};
        current = current[part] as Record<string, unknown>;
      }
    });
  }

  private requireEndpoint(id: EntityId) {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) throw new Error(`Connecteur introuvable : ${id}.`);
    return endpoint;
  }

  private requireContract(id: EntityId) {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error(`Contrat d'intégration introuvable : ${id}.`);
    return contract;
  }

  private requireMessage(id: EntityId) {
    const message = this.messages.get(id);
    if (!message) throw new Error(`Message d'intégration introuvable : ${id}.`);
    return message;
  }

  private requirePolicy(code: string) {
    const policy = this.policies.get(code);
    if (!policy) throw new Error(`Politique de reprise introuvable : ${code}.`);
    return policy;
  }
}

export function getDefaultIntegrationEndpointProfiles() {
  return structuredClone(defaultEndpointProfiles);
}

export function validateIntegrationAndEcosystemCatalog() {
  const errors: string[] = [];
  const codes = new Set<string>();
  for (const profile of defaultEndpointProfiles) {
    if (codes.has(profile.code)) errors.push(`Code de connecteur dupliqué : ${profile.code}.`);
    codes.add(profile.code);
    if (profile.supportedOperations.length === 0) errors.push(`${profile.code}: aucune opération supportée.`);
    if (!retryPolicies.some((policy) => policy.code === profile.retryPolicyCode)) {
      errors.push(`${profile.code}: politique de reprise inconnue.`);
    }
    if (profile.ecosystemConfigurationCodes.length === 0) errors.push(`${profile.code}: aucune configuration d'écosystème.`);
  }
  return {
    valid: errors.length === 0,
    errors,
    summary: {
      endpointProfileCount: defaultEndpointProfiles.length,
      integrationTypes: [...new Set(defaultEndpointProfiles.map((item) => item.type))],
      ecosystemConfigurationCodes: [
        ...new Set(defaultEndpointProfiles.flatMap((item) => item.ecosystemConfigurationCodes)),
      ],
      retryPolicyCount: retryPolicies.length,
    },
  };
}
