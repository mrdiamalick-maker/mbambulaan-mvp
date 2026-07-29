export type RuntimeEnvironment = "local" | "integration" | "staging" | "production";

export interface RuntimeConfiguration {
  environment: RuntimeEnvironment;
  serviceName: string;
  serviceVersion: string;
  port: number;
  publicBaseUrl: string;
  databaseUrl: string;
  databasePoolMin: number;
  databasePoolMax: number;
  objectStorageEndpoint: string;
  objectStorageBucket: string;
  objectStorageRegion: string;
  redisUrl?: string;
  logLevel: "debug" | "info" | "warn" | "error";
  telemetryEnabled: boolean;
  telemetryEndpoint?: string;
  encryptionKeyId: string;
  secretsProvider: "environment" | "vault" | "cloud_secret_manager";
  migrationMode: "disabled" | "validate" | "apply";
  featureFlags: Record<string, boolean>;
  nationalMode: boolean;
  allowedTerritoryIds: string[];
}

export class ConfigurationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Configuration invalide : ${problems.join(" ")}`);
    this.name = "ConfigurationError";
  }
}

export function loadRuntimeConfiguration(env: Record<string, string | undefined>): RuntimeConfiguration {
  const problems: string[] = [];
  const environment = enumValue(env.MBAMBULAAN_ENV, ["local", "integration", "staging", "production"] as const, "MBAMBULAAN_ENV", problems, "local");
  const port = integer(env.PORT, "PORT", problems, 3000, 1, 65535);
  const databasePoolMin = integer(env.DATABASE_POOL_MIN, "DATABASE_POOL_MIN", problems, 2, 0, 100);
  const databasePoolMax = integer(env.DATABASE_POOL_MAX, "DATABASE_POOL_MAX", problems, 20, 1, 500);
  if (databasePoolMax < databasePoolMin) problems.push("DATABASE_POOL_MAX doit être supérieur ou égal à DATABASE_POOL_MIN.");

  const publicBaseUrl = requiredUrl(env.PUBLIC_BASE_URL, "PUBLIC_BASE_URL", problems, environment === "local" ? "http://localhost:3000" : undefined);
  const databaseUrl = requiredUrl(env.DATABASE_URL, "DATABASE_URL", problems);
  const objectStorageEndpoint = requiredUrl(env.OBJECT_STORAGE_ENDPOINT, "OBJECT_STORAGE_ENDPOINT", problems);
  const objectStorageBucket = required(env.OBJECT_STORAGE_BUCKET, "OBJECT_STORAGE_BUCKET", problems);
  const objectStorageRegion = required(env.OBJECT_STORAGE_REGION, "OBJECT_STORAGE_REGION", problems);
  const encryptionKeyId = required(env.ENCRYPTION_KEY_ID, "ENCRYPTION_KEY_ID", problems);
  const telemetryEnabled = booleanValue(env.TELEMETRY_ENABLED, false);
  const telemetryEndpoint = optionalUrl(env.TELEMETRY_ENDPOINT, "TELEMETRY_ENDPOINT", problems);
  if (telemetryEnabled && !telemetryEndpoint) problems.push("TELEMETRY_ENDPOINT est obligatoire lorsque TELEMETRY_ENABLED=true.");

  const nationalMode = booleanValue(env.NATIONAL_MODE, environment === "production");
  const allowedTerritoryIds = csv(env.ALLOWED_TERRITORY_IDS);
  if (!nationalMode && !allowedTerritoryIds.length) problems.push("ALLOWED_TERRITORY_IDS est obligatoire hors mode national.");
  if (environment === "production") {
    if (env.MIGRATION_MODE === "apply") problems.push("MIGRATION_MODE=apply est interdit au démarrage de l'application en production.");
    if ((env.SECRETS_PROVIDER ?? "environment") === "environment") problems.push("Un gestionnaire de secrets externe est obligatoire en production.");
    if (!publicBaseUrl.startsWith("https://")) problems.push("PUBLIC_BASE_URL doit utiliser HTTPS en production.");
  }

  if (problems.length) throw new ConfigurationError(problems);

  return {
    environment,
    serviceName: env.SERVICE_NAME?.trim() || "mbambulaan-platform",
    serviceVersion: env.SERVICE_VERSION?.trim() || "development",
    port,
    publicBaseUrl,
    databaseUrl,
    databasePoolMin,
    databasePoolMax,
    objectStorageEndpoint,
    objectStorageBucket,
    objectStorageRegion,
    redisUrl: optionalUrl(env.REDIS_URL, "REDIS_URL", problems),
    logLevel: enumValue(env.LOG_LEVEL, ["debug", "info", "warn", "error"] as const, "LOG_LEVEL", problems, environment === "production" ? "info" : "debug"),
    telemetryEnabled,
    telemetryEndpoint,
    encryptionKeyId,
    secretsProvider: enumValue(env.SECRETS_PROVIDER, ["environment", "vault", "cloud_secret_manager"] as const, "SECRETS_PROVIDER", problems, "environment"),
    migrationMode: enumValue(env.MIGRATION_MODE, ["disabled", "validate", "apply"] as const, "MIGRATION_MODE", problems, environment === "local" ? "apply" : "validate"),
    featureFlags: parseFeatureFlags(env.FEATURE_FLAGS_JSON, problems),
    nationalMode,
    allowedTerritoryIds,
  };
}

function required(value: string | undefined, name: string, problems: string[], fallback?: string) {
  const resolved = value?.trim() || fallback;
  if (!resolved) {
    problems.push(`${name} est obligatoire.`);
    return "";
  }
  return resolved;
}

function requiredUrl(value: string | undefined, name: string, problems: string[], fallback?: string) {
  const resolved = required(value, name, problems, fallback);
  if (!resolved) return resolved;
  try {
    new URL(resolved);
  } catch {
    problems.push(`${name} doit être une URL valide.`);
  }
  return resolved;
}

function optionalUrl(value: string | undefined, name: string, problems: string[]) {
  if (!value?.trim()) return undefined;
  try {
    new URL(value);
    return value;
  } catch {
    problems.push(`${name} doit être une URL valide.`);
    return undefined;
  }
}

function integer(value: string | undefined, name: string, problems: string[], fallback: number, min: number, max: number) {
  const resolved = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(resolved) || resolved < min || resolved > max) {
    problems.push(`${name} doit être un entier compris entre ${min} et ${max}.`);
    return fallback;
  }
  return resolved;
}

function booleanValue(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function enumValue<const T extends readonly string[]>(value: string | undefined, values: T, name: string, problems: string[], fallback: T[number]): T[number] {
  const resolved = value ?? fallback;
  if (!values.includes(resolved)) {
    problems.push(`${name} doit valoir ${values.join(", ")}.`);
    return fallback;
  }
  return resolved as T[number];
}

function csv(value: string | undefined) {
  return [...new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean))];
}

function parseFeatureFlags(value: string | undefined, problems: string[]) {
  if (!value?.trim()) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const result: Record<string, boolean> = {};
    for (const [key, flag] of Object.entries(parsed)) {
      if (typeof flag !== "boolean") problems.push(`Le feature flag ${key} doit être booléen.`);
      else result[key] = flag;
    }
    return result;
  } catch {
    problems.push("FEATURE_FLAGS_JSON doit contenir un objet JSON valide.");
    return {};
  }
}
