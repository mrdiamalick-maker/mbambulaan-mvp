import type { EntityId } from "../../domain/infrastructures/types";
import {
  CursorCodec,
  JsonObjectSchema,
  VersionedBusinessApi,
  type ApiExecutionContext,
  type ApiRequest,
  type CursorPage,
} from "./versioned-business-api";

export interface NationalApiServices {
  registry: {
    listActors(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    registerActor(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  campaigns: {
    list(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    create(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  landings: {
    list(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    declare(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  lots: {
    list(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    create(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  orders: {
    list(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    create(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  deliveries: {
    list(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    confirm(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  settlements: {
    list(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    record(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  incidents: {
    list(input: { territoryId: EntityId; cursor?: string; limit: number }): Promise<CursorPage<Record<string, unknown>>>;
    report(input: Record<string, unknown>, context: ApiExecutionContext): Promise<Record<string, unknown>>;
  };
  steering: {
    territory(input: { territoryId: EntityId }): Promise<Record<string, unknown>>;
    national(): Promise<Record<string, unknown>>;
  };
}

const actorSchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    actorType: { required: true, type: "string", minLength: 2 },
    displayName: { required: true, type: "string", minLength: 2 },
    territoryId: { required: true, type: "string", minLength: 4 },
  },
  {
    type: "object",
    required: ["actorType", "displayName", "territoryId"],
    properties: {
      actorType: { type: "string" },
      displayName: { type: "string" },
      territoryId: { type: "string" },
      phoneE164: { type: "string" },
      organizationId: { type: "string" },
    },
  },
);

const campaignSchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    vesselId: { required: true, type: "string", minLength: 4 },
    plannedDepartureAt: { required: true, type: "string", minLength: 10 },
    plannedReturnAt: { required: true, type: "string", minLength: 10 },
  },
  {
    type: "object",
    required: ["territoryId", "vesselId", "plannedDepartureAt", "plannedReturnAt"],
    properties: {
      territoryId: { type: "string" },
      vesselId: { type: "string" },
      plannedDepartureAt: { type: "string", format: "date-time" },
      plannedReturnAt: { type: "string", format: "date-time" },
      targetSpeciesCodes: { type: "array", items: { type: "string" } },
    },
  },
);

const landingSchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    campaignId: { required: true, type: "string", minLength: 4 },
    landedAt: { required: true, type: "string", minLength: 10 },
    grossWeightKg: { required: true, type: "number", minimum: 0.01 },
  },
  {
    type: "object",
    required: ["territoryId", "campaignId", "landedAt", "grossWeightKg"],
    properties: {
      territoryId: { type: "string" },
      campaignId: { type: "string" },
      landedAt: { type: "string", format: "date-time" },
      grossWeightKg: { type: "number", minimum: 0.01 },
      weighingEvidenceIds: { type: "array", items: { type: "string" } },
    },
  },
);

const lotSchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    landingId: { required: true, type: "string", minLength: 4 },
    speciesCode: { required: true, type: "string", minLength: 2 },
    quantityKg: { required: true, type: "number", minimum: 0.01 },
  },
  {
    type: "object",
    required: ["territoryId", "landingId", "speciesCode", "quantityKg"],
    properties: {
      territoryId: { type: "string" },
      landingId: { type: "string" },
      speciesCode: { type: "string" },
      quantityKg: { type: "number", minimum: 0.01 },
      qualityGrade: { type: "string" },
    },
  },
);

const orderSchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    buyerActorId: { required: true, type: "string", minLength: 4 },
    speciesCode: { required: true, type: "string", minLength: 2 },
    requestedQuantityKg: { required: true, type: "number", minimum: 0.01 },
  },
  {
    type: "object",
    required: ["territoryId", "buyerActorId", "speciesCode", "requestedQuantityKg"],
    properties: {
      territoryId: { type: "string" },
      buyerActorId: { type: "string" },
      speciesCode: { type: "string" },
      requestedQuantityKg: { type: "number", minimum: 0.01 },
      maximumUnitPriceXof: { type: "number", minimum: 0 },
      requiredAt: { type: "string", format: "date-time" },
    },
  },
);

const deliverySchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    deliveryId: { required: true, type: "string", minLength: 4 },
    deliveredQuantityKg: { required: true, type: "number", minimum: 0.01 },
    deliveredAt: { required: true, type: "string", minLength: 10 },
  },
  {
    type: "object",
    required: ["territoryId", "deliveryId", "deliveredQuantityKg", "deliveredAt"],
    properties: {
      territoryId: { type: "string" },
      deliveryId: { type: "string" },
      deliveredQuantityKg: { type: "number", minimum: 0.01 },
      deliveredAt: { type: "string", format: "date-time" },
      proofIds: { type: "array", items: { type: "string" } },
    },
  },
);

const settlementSchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    orderId: { required: true, type: "string", minLength: 4 },
    amountXof: { required: true, type: "number", minimum: 0.01 },
    paidAt: { required: true, type: "string", minLength: 10 },
  },
  {
    type: "object",
    required: ["territoryId", "orderId", "amountXof", "paidAt"],
    properties: {
      territoryId: { type: "string" },
      orderId: { type: "string" },
      amountXof: { type: "number", minimum: 0.01 },
      paidAt: { type: "string", format: "date-time" },
      paymentReference: { type: "string" },
      evidenceIds: { type: "array", items: { type: "string" } },
    },
  },
);

const incidentSchema = new JsonObjectSchema<Record<string, unknown>>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    incidentType: { required: true, type: "string", minLength: 2 },
    severity: { required: true, type: "string", minLength: 2 },
    description: { required: true, type: "string", minLength: 5 },
  },
  {
    type: "object",
    required: ["territoryId", "incidentType", "severity", "description"],
    properties: {
      territoryId: { type: "string" },
      incidentType: { type: "string" },
      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
      description: { type: "string" },
      relatedAggregateType: { type: "string" },
      relatedAggregateId: { type: "string" },
      evidenceIds: { type: "array", items: { type: "string" } },
    },
  },
);

function territory(request: ApiRequest, context: ApiExecutionContext) {
  return (request.headers["x-territory-id"] || request.query.territoryId || request.params.territoryId || context.principal.territoryIds[0]) as EntityId;
}

function registerListRoute(
  api: VersionedBusinessApi,
  codec: CursorCodec,
  input: {
    id: string;
    path: string;
    tag: string;
    permission: string;
    handler: (input: { territoryId: EntityId; cursor?: string; limit: number }) => Promise<CursorPage<Record<string, unknown>>>;
  },
) {
  api.register({
    id: input.id,
    method: "GET",
    path: input.path,
    summary: `Lister ${input.tag.toLowerCase()}`,
    description: `Retourne une page de ${input.tag.toLowerCase()} visible dans le périmètre territorial autorisé.`,
    tags: [input.tag],
    operationType: "query",
    requiredPermission: input.permission,
    requiredAuthenticationLevel: "verified",
    rateLimit: { limit: 300, windowSeconds: 60 },
    handler: async (_, context, request) => {
      const pagination = codec.parsePagination(request.query);
      return input.handler({ territoryId: territory(request, context), cursor: pagination.cursor, limit: pagination.limit });
    },
  });
}

export function registerNationalApiCatalog(api: VersionedBusinessApi, services: NationalApiServices) {
  const codec = new CursorCodec();

  registerListRoute(api, codec, { id: "listActors", path: "/api/v1/registry/actors", tag: "Registre", permission: "registry.actor.read", handler: services.registry.listActors });
  registerListRoute(api, codec, { id: "listCampaigns", path: "/api/v1/campaigns", tag: "Campagnes", permission: "campaign.read", handler: services.campaigns.list });
  registerListRoute(api, codec, { id: "listLandings", path: "/api/v1/landings", tag: "Débarquements", permission: "landing.read", handler: services.landings.list });
  registerListRoute(api, codec, { id: "listLots", path: "/api/v1/lots", tag: "Lots", permission: "lot.read", handler: services.lots.list });
  registerListRoute(api, codec, { id: "listOrders", path: "/api/v1/orders", tag: "Commandes", permission: "order.read", handler: services.orders.list });
  registerListRoute(api, codec, { id: "listDeliveries", path: "/api/v1/deliveries", tag: "Livraisons", permission: "delivery.read", handler: services.deliveries.list });
  registerListRoute(api, codec, { id: "listSettlements", path: "/api/v1/settlements", tag: "Règlements", permission: "settlement.read", handler: services.settlements.list });
  registerListRoute(api, codec, { id: "listIncidents", path: "/api/v1/incidents", tag: "Incidents", permission: "incident.read", handler: services.incidents.list });

  const commands = [
    { id: "registerActor", path: "/api/v1/registry/actors", tag: "Registre", permission: "registry.actor.create", schema: actorSchema, handler: services.registry.registerActor },
    { id: "createCampaign", path: "/api/v1/campaigns", tag: "Campagnes", permission: "campaign.create", schema: campaignSchema, handler: services.campaigns.create },
    { id: "declareLanding", path: "/api/v1/landings", tag: "Débarquements", permission: "landing.create", schema: landingSchema, handler: services.landings.declare },
    { id: "createLot", path: "/api/v1/lots", tag: "Lots", permission: "lot.create", schema: lotSchema, handler: services.lots.create },
    { id: "createOrder", path: "/api/v1/orders", tag: "Commandes", permission: "order.create", schema: orderSchema, handler: services.orders.create },
    { id: "confirmDelivery", path: "/api/v1/deliveries/confirmations", tag: "Livraisons", permission: "delivery.confirm", schema: deliverySchema, handler: services.deliveries.confirm },
    { id: "recordSettlement", path: "/api/v1/settlements", tag: "Règlements", permission: "settlement.create", schema: settlementSchema, handler: services.settlements.record },
    { id: "reportIncident", path: "/api/v1/incidents", tag: "Incidents", permission: "incident.create", schema: incidentSchema, handler: services.incidents.report },
  ] as const;

  for (const command of commands) {
    api.register({
      id: command.id,
      method: "POST",
      path: command.path,
      summary: command.id,
      description: `Exécute la commande métier ${command.id} avec idempotence, audit et corrélation.`,
      tags: [command.tag],
      operationType: "command",
      idempotencyRequired: true,
      requiredPermission: command.permission,
      requiredAuthenticationLevel: "verified",
      requestSchema: command.schema,
      rateLimit: { limit: 120, windowSeconds: 60 },
      handler: command.handler,
    });
  }

  api.register({
    id: "getTerritorialCommandCenter",
    method: "GET",
    path: "/api/v1/steering/territories",
    summary: "Consulter le pilotage territorial",
    description: "Expose les tensions, volumes, incidents, engagements et résultats d'un territoire.",
    tags: ["Pilotage"],
    operationType: "query",
    requiredPermission: "steering.territory.read",
    requiredAuthenticationLevel: "verified",
    rateLimit: { limit: 300, windowSeconds: 60 },
    handler: async (_, context, request) => services.steering.territory({ territoryId: territory(request, context) }),
  });

  api.register({
    id: "getNationalCommandCenter",
    method: "GET",
    path: "/api/v1/steering/national",
    summary: "Consulter le pilotage national",
    description: "Expose la consolidation nationale de la filière halieutique.",
    tags: ["Pilotage"],
    operationType: "query",
    requiredPermission: "steering.national.read",
    requiredAuthenticationLevel: "strong",
    rateLimit: { limit: 120, windowSeconds: 60 },
    handler: async () => services.steering.national(),
  });

  return api;
}
