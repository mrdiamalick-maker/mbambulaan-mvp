import assert from "node:assert/strict";
import test from "node:test";
import {
  ApiError,
  CursorCodec,
  JsonObjectSchema,
  VersionedBusinessApi,
  type ApiAuthenticator,
  type ApiRateLimiter,
} from "./versioned-business-api";

const clock = { now: () => "2027-01-01T10:00:00Z" as const };
let sequence = 0;
const ids = { next: (prefix: string) => `${prefix}:${++sequence}` };

function authenticator(overrides: Partial<Awaited<ReturnType<ApiAuthenticator["authenticate"]>>> = {}): ApiAuthenticator {
  return {
    async authenticate() {
      return {
        identityId: "actor:agent:001",
        organizationId: "organization:mbambulaan",
        territoryIds: ["territory:joal"],
        permissions: ["landing:create", "landing:read"],
        authenticationLevel: "verified",
        ...overrides,
      };
    },
  };
}

const landingSchema = new JsonObjectSchema<{ territoryId: string; vesselId: string; expectedWeightKg: number }>(
  {
    territoryId: { required: true, type: "string", minLength: 4 },
    vesselId: { required: true, type: "string", minLength: 4 },
    expectedWeightKg: { required: true, type: "number", minimum: 1 },
  },
  {
    type: "object",
    required: ["territoryId", "vesselId", "expectedWeightKg"],
    properties: {
      territoryId: { type: "string" },
      vesselId: { type: "string" },
      expectedWeightKg: { type: "number", minimum: 1 },
    },
  },
);

test("expose une commande versionnée, territorialisée et idempotente", async () => {
  sequence = 0;
  const api = new VersionedBusinessApi("v1", clock, ids, authenticator());
  api.register({
    id: "createLanding",
    method: "POST",
    path: "/api/v1/landings",
    summary: "Créer un débarquement",
    description: "Enregistre une déclaration de débarquement.",
    tags: ["Débarquements"],
    operationType: "command",
    idempotencyRequired: true,
    requiredPermission: "landing:create",
    requiredAuthenticationLevel: "verified",
    requestSchema: landingSchema,
    handler: async (input, context) => ({
      landingId: "landing:001",
      territoryId: input.territoryId,
      correlationId: context.correlationId,
    }),
  });

  const response = await api.handle({
    method: "POST",
    path: "/api/v1/landings",
    headers: {
      "idempotency-key": "landing-joal-001",
      "x-correlation-id": "correlation:001",
      "x-territory-id": "territory:joal",
    },
    query: {},
    params: {},
    body: { territoryId: "territory:joal", vesselId: "vessel:001", expectedWeightKg: 750 },
  });

  assert.equal(response.status, 202);
  assert.equal(response.headers["x-correlation-id"], "correlation:001");
  assert.equal(response.headers["idempotency-key"], "landing-joal-001");
  assert.deepEqual(response.body, {
    landingId: "landing:001",
    territoryId: "territory:joal",
    correlationId: "correlation:001",
  });
});

test("refuse une commande sans clé d'idempotence", async () => {
  const api = new VersionedBusinessApi("v1", clock, ids, authenticator());
  api.register({
    id: "createLanding",
    method: "POST",
    path: "/api/v1/landings",
    summary: "Créer",
    description: "Créer",
    tags: ["Débarquements"],
    operationType: "command",
    idempotencyRequired: true,
    requestSchema: landingSchema,
    handler: async () => ({ ok: true }),
  });

  const response = await api.handle({
    method: "POST",
    path: "/api/v1/landings",
    headers: { "x-territory-id": "territory:joal" },
    query: {},
    params: {},
    body: { territoryId: "territory:joal", vesselId: "vessel:001", expectedWeightKg: 750 },
  });

  assert.equal(response.status, 400);
  assert.equal((response.body as { code: string }).code, "idempotency_key_required");
});

test("retourne des erreurs de validation compatibles RFC 7807", async () => {
  const api = new VersionedBusinessApi("v1", clock, ids, authenticator());
  api.register({
    id: "createLanding",
    method: "POST",
    path: "/api/v1/landings",
    summary: "Créer",
    description: "Créer",
    tags: ["Débarquements"],
    operationType: "command",
    idempotencyRequired: true,
    requestSchema: landingSchema,
    handler: async () => ({ ok: true }),
  });

  const response = await api.handle({
    method: "POST",
    path: "/api/v1/landings",
    headers: { "idempotency-key": "landing-invalid-001", "x-territory-id": "territory:joal" },
    query: {},
    params: {},
    body: { territoryId: "", vesselId: "v", expectedWeightKg: 0 },
  });

  assert.equal(response.status, 422);
  const problem = response.body as { type: string; code: string; invalidParams: unknown[] };
  assert.equal(problem.type, "https://mbambulaan.sn/problems/validation_failed");
  assert.equal(problem.code, "validation_failed");
  assert.equal(problem.invalidParams.length, 4);
});

test("bloque une requête hors périmètre territorial", async () => {
  const api = new VersionedBusinessApi("v1", clock, ids, authenticator());
  api.register({
    id: "listLandings",
    method: "GET",
    path: "/api/v1/landings",
    summary: "Lister",
    description: "Lister",
    tags: ["Débarquements"],
    operationType: "query",
    requiredPermission: "landing:read",
    handler: async () => ({ items: [] }),
  });

  const response = await api.handle({
    method: "GET",
    path: "/api/v1/landings",
    headers: { "x-territory-id": "territory:saint-louis" },
    query: {},
    params: {},
  });

  assert.equal(response.status, 403);
  assert.equal((response.body as { code: string }).code, "territory_scope_denied");
});

test("applique la limitation de débit avec Retry-After", async () => {
  const limiter: ApiRateLimiter = {
    async consume() {
      return { allowed: false, remaining: 0, resetAt: "2027-01-01T10:00:30Z" };
    },
  };
  const api = new VersionedBusinessApi("v1", clock, ids, authenticator(), limiter);
  api.register({
    id: "listLandings",
    method: "GET",
    path: "/api/v1/landings",
    summary: "Lister",
    description: "Lister",
    tags: ["Débarquements"],
    operationType: "query",
    rateLimit: { limit: 100, windowSeconds: 60 },
    handler: async () => ({ items: [] }),
  });

  const response = await api.handle({ method: "GET", path: "/api/v1/landings", headers: {}, query: {}, params: {} });
  assert.equal(response.status, 429);
  assert.equal(response.headers["retry-after"], "30");
});

test("encode, décode et valide la pagination par curseur", () => {
  const codec = new CursorCodec();
  const cursor = codec.encode({ createdAt: "2027-01-01T00:00:00Z", id: "landing:001" });
  assert.deepEqual(codec.decode(cursor), { createdAt: "2027-01-01T00:00:00Z", id: "landing:001" });
  assert.deepEqual(codec.parsePagination({ cursor, limit: "75", direction: "backward" }), {
    cursor,
    limit: 75,
    direction: "backward",
  });
  assert.throws(() => codec.parsePagination({ limit: "500" }), ApiError);
  assert.throws(() => codec.decode("not-json"), ApiError);
});

test("génère un contrat OpenAPI 3.1 versionné", () => {
  const api = new VersionedBusinessApi("v1", clock, ids, authenticator());
  api.register({
    id: "listLandings",
    method: "GET",
    path: "/api/v1/landings",
    summary: "Lister les débarquements",
    description: "Retourne les débarquements visibles dans le périmètre territorial.",
    tags: ["Débarquements"],
    operationType: "query",
    requiredPermission: "landing:read",
    handler: async () => ({ items: [] }),
  });
  const document = api.generateOpenApi({
    title: "Mbàmbulaan National API",
    description: "API nationale de coordination de la filière halieutique.",
    serverUrl: "https://api.mbambulaan.sn",
  });

  assert.equal(document.openapi, "3.1.0");
  assert.equal(document.info.version, "v1");
  assert.ok(document.paths["/api/v1/landings"].get);
  assert.ok(document.components.securitySchemes.bearerAuth);
});
