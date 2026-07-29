import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";
import type {
  CommandEnvelope,
  CommandHandler,
  TransactionalCommandBus,
} from "../industrialization/transactional-platform-foundation";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequest {
  method: HttpMethod;
  path: string;
  headers: Record<string, string | undefined>;
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body?: T;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  correlationId?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
}

export interface ApiPrincipal {
  identityId: EntityId;
  organizationId?: EntityId;
  territoryIds: EntityId[];
  permissions: string[];
  authenticationLevel: "anonymous" | "basic" | "verified" | "strong";
}

export interface ApiExecutionContext {
  requestId: EntityId;
  correlationId: EntityId;
  causationId?: EntityId;
  requestedAt: ISODateTime;
  apiVersion: string;
  principal: ApiPrincipal;
  idempotencyKey?: string;
  clientChannel?: string;
}

export interface ApiClock {
  now(): ISODateTime;
}

export interface ApiIdGenerator {
  next(prefix: string): EntityId;
}

export interface ApiAuthenticator {
  authenticate(request: ApiRequest): Promise<ApiPrincipal>;
}

export interface ApiRateLimiter {
  consume(input: { key: string; routeId: string; limit: number; windowSeconds: number }): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: ISODateTime;
  }>;
}

export interface SchemaIssue {
  path: string;
  message: string;
}

export interface RuntimeSchema<T> {
  parse(value: unknown): { success: true; data: T } | { success: false; issues: SchemaIssue[] };
  openApiSchema: Record<string, unknown>;
}

export interface CursorPage<T> {
  items: T[];
  page: {
    nextCursor?: string;
    previousCursor?: string;
    limit: number;
    hasMore: boolean;
  };
}

export interface CursorPaginationInput {
  cursor?: string;
  limit: number;
  direction: "forward" | "backward";
}

export interface ApiRouteDefinition<TInput = unknown, TOutput = unknown> {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  operationType: "command" | "query";
  requiredPermission?: string;
  requiredAuthenticationLevel?: ApiPrincipal["authenticationLevel"];
  idempotencyRequired?: boolean;
  requestSchema?: RuntimeSchema<TInput>;
  responseSchema?: RuntimeSchema<TOutput>;
  rateLimit?: { limit: number; windowSeconds: number };
  handler: (input: TInput, context: ApiExecutionContext, request: ApiRequest) => Promise<TOutput>;
}

export interface OpenApiDocument {
  openapi: "3.1.0";
  info: { title: string; version: string; description: string };
  servers: Array<{ url: string; description: string }>;
  tags: Array<{ name: string; description?: string }>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
    headers: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly invalidParams?: ProblemDetails["invalidParams"],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class VersionedBusinessApi {
  private readonly routes = new Map<string, ApiRouteDefinition<any, any>>();

  constructor(
    private readonly apiVersion: string,
    private readonly clock: ApiClock,
    private readonly ids: ApiIdGenerator,
    private readonly authenticator: ApiAuthenticator,
    private readonly rateLimiter?: ApiRateLimiter,
  ) {}

  register<TInput, TOutput>(route: ApiRouteDefinition<TInput, TOutput>) {
    const key = this.routeKey(route.method, route.path);
    if (this.routes.has(key)) throw new Error(`La route ${route.method} ${route.path} existe déjà.`);
    if (!route.path.startsWith(`/api/${this.apiVersion}/`)) throw new Error(`La route ${route.path} n'est pas versionnée avec ${this.apiVersion}.`);
    if (route.operationType === "command" && !route.idempotencyRequired && ["POST", "PUT", "PATCH", "DELETE"].includes(route.method)) {
      throw new Error(`La commande ${route.id} doit déclarer explicitement sa stratégie d'idempotence.`);
    }
    this.routes.set(key, route);
    return this;
  }

  async handle(request: ApiRequest): Promise<ApiResponse> {
    const correlationId = request.headers["x-correlation-id"] || this.ids.next("correlation");
    try {
      const route = this.routes.get(this.routeKey(request.method, request.path));
      if (!route) throw new ApiError(404, "route_not_found", "La ressource API demandée est introuvable.");

      const principal = await this.authenticator.authenticate(request);
      this.assertAuthentication(route, principal);
      this.assertPermission(route, principal);
      this.assertTerritoryScope(principal, request);

      const idempotencyKey = request.headers["idempotency-key"];
      if (route.idempotencyRequired && !idempotencyKey) {
        throw new ApiError(400, "idempotency_key_required", "L'en-tête Idempotency-Key est obligatoire pour cette commande.");
      }

      if (this.rateLimiter && route.rateLimit) {
        const rate = await this.rateLimiter.consume({
          key: `${principal.identityId}:${request.path}`,
          routeId: route.id,
          limit: route.rateLimit.limit,
          windowSeconds: route.rateLimit.windowSeconds,
        });
        if (!rate.allowed) {
          return {
            status: 429,
            headers: {
              "content-type": "application/problem+json",
              "x-correlation-id": correlationId,
              "retry-after": String(Math.max(1, Math.ceil((Date.parse(rate.resetAt) - Date.parse(this.clock.now())) / 1000))),
              "x-ratelimit-remaining": "0",
            },
            body: this.problem(429, "rate_limit_exceeded", "Trop de requêtes ont été envoyées.", request.path, correlationId),
          };
        }
      }

      const parsed = route.requestSchema?.parse(request.body) ?? { success: true as const, data: request.body };
      if (!parsed.success) {
        throw new ApiError(
          422,
          "validation_failed",
          "La requête ne respecte pas le contrat attendu.",
          parsed.issues.map((issue) => ({ name: issue.path, reason: issue.message })),
        );
      }

      const context: ApiExecutionContext = {
        requestId: this.ids.next("request"),
        correlationId,
        causationId: request.headers["x-causation-id"],
        requestedAt: this.clock.now(),
        apiVersion: this.apiVersion,
        principal,
        idempotencyKey,
        clientChannel: request.headers["x-client-channel"],
      };
      const output = await route.handler(parsed.data as never, context, request);
      return {
        status: route.operationType === "command" ? 202 : 200,
        headers: {
          "content-type": "application/json",
          "x-correlation-id": correlationId,
          "x-api-version": this.apiVersion,
          ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
        },
        body: output,
      };
    } catch (error) {
      return this.mapError(error, request.path, correlationId);
    }
  }

  listRoutes() {
    return [...this.routes.values()].map((route) => ({
      id: route.id,
      method: route.method,
      path: route.path,
      operationType: route.operationType,
      tags: [...route.tags],
    }));
  }

  generateOpenApi(input: { title: string; description: string; serverUrl: string }): OpenApiDocument {
    const paths: OpenApiDocument["paths"] = {};
    const tags = new Map<string, { name: string; description?: string }>();
    for (const route of this.routes.values()) {
      for (const tag of route.tags) tags.set(tag, { name: tag });
      paths[route.path] ??= {};
      paths[route.path][route.method.toLowerCase()] = {
        operationId: route.id,
        summary: route.summary,
        description: route.description,
        tags: route.tags,
        security: route.requiredAuthenticationLevel === "anonymous" ? [] : [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/headers/XCorrelationId" },
          ...(route.idempotencyRequired ? [{ $ref: "#/components/headers/IdempotencyKey" }] : []),
        ],
        ...(route.requestSchema ? {
          requestBody: {
            required: true,
            content: { "application/json": { schema: route.requestSchema.openApiSchema } },
          },
        } : {}),
        responses: {
          "200": { description: "Requête traitée", content: { "application/json": { schema: route.responseSchema?.openApiSchema ?? {} } } },
          "202": { description: "Commande acceptée", content: { "application/json": { schema: route.responseSchema?.openApiSchema ?? {} } } },
          "400": { $ref: "#/components/schemas/ProblemDetails" },
          "401": { $ref: "#/components/schemas/ProblemDetails" },
          "403": { $ref: "#/components/schemas/ProblemDetails" },
          "409": { $ref: "#/components/schemas/ProblemDetails" },
          "422": { $ref: "#/components/schemas/ProblemDetails" },
          "429": { $ref: "#/components/schemas/ProblemDetails" },
        },
        "x-operation-type": route.operationType,
        "x-required-permission": route.requiredPermission,
      };
    }
    return {
      openapi: "3.1.0",
      info: { title: input.title, version: this.apiVersion, description: input.description },
      servers: [{ url: input.serverUrl, description: "API Mbàmbulaan" }],
      tags: [...tags.values()],
      paths,
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
        schemas: {
          ProblemDetails: {
            type: "object",
            required: ["type", "title", "status", "detail", "code"],
            properties: {
              type: { type: "string" },
              title: { type: "string" },
              status: { type: "integer" },
              detail: { type: "string" },
              code: { type: "string" },
              correlationId: { type: "string" },
              invalidParams: { type: "array", items: { type: "object" } },
            },
          },
          CursorPage: {
            type: "object",
            required: ["items", "page"],
            properties: {
              items: { type: "array", items: {} },
              page: {
                type: "object",
                required: ["limit", "hasMore"],
                properties: {
                  nextCursor: { type: "string" },
                  previousCursor: { type: "string" },
                  limit: { type: "integer", minimum: 1, maximum: 200 },
                  hasMore: { type: "boolean" },
                },
              },
            },
          },
        },
        headers: {
          XCorrelationId: {
            name: "X-Correlation-Id",
            in: "header",
            required: false,
            schema: { type: "string" },
          },
          IdempotencyKey: {
            name: "Idempotency-Key",
            in: "header",
            required: true,
            schema: { type: "string", minLength: 8, maxLength: 200 },
          },
        },
      },
    };
  }

  private assertAuthentication(route: ApiRouteDefinition, principal: ApiPrincipal) {
    const order: ApiPrincipal["authenticationLevel"][] = ["anonymous", "basic", "verified", "strong"];
    const required = route.requiredAuthenticationLevel ?? "basic";
    if (order.indexOf(principal.authenticationLevel) < order.indexOf(required)) {
      throw new ApiError(401, "authentication_level_insufficient", "Le niveau d'authentification est insuffisant.");
    }
  }

  private assertPermission(route: ApiRouteDefinition, principal: ApiPrincipal) {
    if (route.requiredPermission && !principal.permissions.includes(route.requiredPermission)) {
      throw new ApiError(403, "permission_denied", `La permission ${route.requiredPermission} est requise.`);
    }
  }

  private assertTerritoryScope(principal: ApiPrincipal, request: ApiRequest) {
    const requestedTerritory = request.headers["x-territory-id"] || request.query.territoryId || request.params.territoryId;
    if (requestedTerritory && !principal.territoryIds.includes(requestedTerritory)) {
      throw new ApiError(403, "territory_scope_denied", "Le territoire demandé est hors du périmètre autorisé.");
    }
  }

  private mapError(error: unknown, instance: string, correlationId: string): ApiResponse<ProblemDetails> {
    const apiError = error instanceof ApiError ? error : new ApiError(500, "internal_error", "Une erreur interne est survenue.");
    return {
      status: apiError.status,
      headers: {
        "content-type": "application/problem+json",
        "x-correlation-id": correlationId,
        "x-api-version": this.apiVersion,
      },
      body: this.problem(apiError.status, apiError.code, apiError.message, instance, correlationId, apiError.invalidParams),
    };
  }

  private problem(status: number, code: string, detail: string, instance: string, correlationId: string, invalidParams?: ProblemDetails["invalidParams"]): ProblemDetails {
    return {
      type: `https://mbambulaan.sn/problems/${code}`,
      title: this.problemTitle(status),
      status,
      detail,
      instance,
      code,
      correlationId,
      invalidParams,
    };
  }

  private problemTitle(status: number) {
    return ({
      400: "Requête invalide",
      401: "Authentification requise",
      403: "Accès interdit",
      404: "Ressource introuvable",
      409: "Conflit",
      422: "Validation impossible",
      429: "Limite dépassée",
      500: "Erreur interne",
    } as Record<number, string>)[status] ?? "Erreur";
  }

  private routeKey(method: HttpMethod, path: string) {
    return `${method}:${path}`;
  }
}

export class JsonObjectSchema<T extends Record<string, unknown>> implements RuntimeSchema<T> {
  constructor(
    private readonly fields: Record<keyof T, { required?: boolean; type: "string" | "number" | "boolean" | "array" | "object"; minLength?: number; minimum?: number }>,
    readonly openApiSchema: Record<string, unknown>,
  ) {}

  parse(value: unknown): { success: true; data: T } | { success: false; issues: SchemaIssue[] } {
    if (!value || typeof value !== "object" || Array.isArray(value)) return { success: false, issues: [{ path: "$", message: "Un objet JSON est attendu." }] };
    const input = value as Record<string, unknown>;
    const issues: SchemaIssue[] = [];
    for (const [name, rule] of Object.entries(this.fields)) {
      const field = input[name];
      if (rule.required && (field === undefined || field === null || field === "")) {
        issues.push({ path: name, message: "Ce champ est obligatoire." });
        continue;
      }
      if (field === undefined || field === null) continue;
      const validType = rule.type === "array" ? Array.isArray(field) : rule.type === "object" ? typeof field === "object" && !Array.isArray(field) : typeof field === rule.type;
      if (!validType) issues.push({ path: name, message: `Le type attendu est ${rule.type}.` });
      if (typeof field === "string" && rule.minLength && field.length < rule.minLength) issues.push({ path: name, message: `La longueur minimale est ${rule.minLength}.` });
      if (typeof field === "number" && rule.minimum !== undefined && field < rule.minimum) issues.push({ path: name, message: `La valeur minimale est ${rule.minimum}.` });
    }
    return issues.length ? { success: false, issues } : { success: true, data: structuredClone(input) as T };
  }
}

export class CursorCodec {
  encode(value: Record<string, string | number>) {
    return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  }

  decode(cursor: string) {
    try {
      const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
      return value as Record<string, string | number>;
    } catch {
      throw new ApiError(400, "invalid_cursor", "Le curseur de pagination est invalide.");
    }
  }

  parsePagination(query: Record<string, string | undefined>): CursorPaginationInput {
    const parsedLimit = Number(query.limit ?? "50");
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 200) {
      throw new ApiError(400, "invalid_page_limit", "La limite doit être comprise entre 1 et 200.");
    }
    return {
      cursor: query.cursor,
      limit: parsedLimit,
      direction: query.direction === "backward" ? "backward" : "forward",
    };
  }
}

export function createTransactionalCommandRoute<TPayload, TValue>(input: {
  route: Omit<ApiRouteDefinition<TPayload, TValue>, "operationType" | "idempotencyRequired" | "handler">;
  commandType: string;
  commandBus: TransactionalCommandBus;
  commandHandler: CommandHandler<TPayload, TValue>;
}): ApiRouteDefinition<TPayload, TValue> {
  return {
    ...input.route,
    operationType: "command",
    idempotencyRequired: true,
    handler: async (payload, context) => {
      if (!context.idempotencyKey) throw new ApiError(400, "idempotency_key_required", "La clé d'idempotence est absente.");
      const command: CommandEnvelope<TPayload> = {
        context: {
          commandId: context.requestId,
          commandType: input.commandType,
          actorIdentityId: context.principal.identityId,
          organizationId: context.principal.organizationId,
          territoryIds: [...context.principal.territoryIds],
          correlationId: context.correlationId,
          causationId: context.causationId,
          idempotencyKey: context.idempotencyKey,
          requestedAt: context.requestedAt,
          metadata: { clientChannel: context.clientChannel ?? "api" },
        },
        payload,
      };
      return input.commandBus.execute(command, input.commandHandler);
    },
  };
}
