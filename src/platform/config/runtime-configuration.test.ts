import assert from "node:assert/strict";
import test from "node:test";
import { ConfigurationError, loadRuntimeConfiguration } from "./runtime-configuration";

const base = {
  DATABASE_URL: "postgresql://user:pass@postgres:5432/mbambulaan",
  OBJECT_STORAGE_ENDPOINT: "https://storage.internal",
  OBJECT_STORAGE_BUCKET: "mbambulaan-evidence",
  OBJECT_STORAGE_REGION: "sn-dakar-1",
  ENCRYPTION_KEY_ID: "kms://mbambulaan/platform",
};

test("charge une configuration locale avec migrations automatiques", () => {
  const config = loadRuntimeConfiguration({ ...base, MBAMBULAAN_ENV: "local", ALLOWED_TERRITORY_IDS: "joal,kayar,joal" });
  assert.equal(config.environment, "local");
  assert.equal(config.migrationMode, "apply");
  assert.deepEqual(config.allowedTerritoryIds, ["joal", "kayar"]);
});

test("refuse une production sans gestionnaire de secrets et HTTPS", () => {
  assert.throws(
    () => loadRuntimeConfiguration({ ...base, MBAMBULAAN_ENV: "production", PUBLIC_BASE_URL: "http://mbambulaan.sn" }),
    (error: unknown) => error instanceof ConfigurationError && error.problems.some((problem) => problem.includes("gestionnaire de secrets")) && error.problems.some((problem) => problem.includes("HTTPS")),
  );
});

test("refuse l'application automatique des migrations au démarrage en production", () => {
  assert.throws(
    () => loadRuntimeConfiguration({ ...base, MBAMBULAAN_ENV: "production", PUBLIC_BASE_URL: "https://mbambulaan.sn", SECRETS_PROVIDER: "vault", MIGRATION_MODE: "apply" }),
    (error: unknown) => error instanceof ConfigurationError && error.problems.some((problem) => problem.includes("MIGRATION_MODE=apply")),
  );
});

test("exige un périmètre territorial lorsque le mode national est désactivé", () => {
  assert.throws(
    () => loadRuntimeConfiguration({ ...base, MBAMBULAAN_ENV: "staging", NATIONAL_MODE: "false", PUBLIC_BASE_URL: "https://staging.mbambulaan.sn" }),
    (error: unknown) => error instanceof ConfigurationError && error.problems.some((problem) => problem.includes("ALLOWED_TERRITORY_IDS")),
  );
});

test("valide les feature flags booléens", () => {
  const config = loadRuntimeConfiguration({ ...base, FEATURE_FLAGS_JSON: '{"offline_sync":true,"mobile_money":false}', ALLOWED_TERRITORY_IDS: "joal" });
  assert.deepEqual(config.featureFlags, { offline_sync: true, mobile_money: false });
});
