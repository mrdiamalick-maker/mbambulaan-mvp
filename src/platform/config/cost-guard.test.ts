import assert from "node:assert/strict";
import test from "node:test";
import { loadCostGuardConfiguration, validateCostGuard } from "./cost-guard";

test("le mode local gratuit utilise uniquement des fournisseurs embarqués, auto-hébergés ou simulés", () => {
  const configuration = loadCostGuardConfiguration({});
  const report = validateCostGuard(configuration);

  assert.equal(report.compliant, true);
  assert.equal(report.localFreeMode, true);
  assert.equal(report.monthlyMandatoryCostXof, 0);
  assert.deepEqual(report.paidProviders, []);
});

test("un fournisseur payant est refusé en mode local gratuit", () => {
  const configuration = loadCostGuardConfiguration({
    MBAMBULAAN_LOCAL_FREE_MODE: "true",
    ALLOW_PAID_INTEGRATIONS: "false",
    SMS_PROVIDER_MODE: "external_paid",
  });

  assert.throws(() => validateCostGuard(configuration), /interdit les fournisseurs payants/);
});

test("une intégration payante nécessite une autorisation explicite hors mode local", () => {
  const configuration = loadCostGuardConfiguration({
    MBAMBULAAN_LOCAL_FREE_MODE: "false",
    ALLOW_PAID_INTEGRATIONS: "true",
    SMS_PROVIDER_MODE: "external_paid",
  });
  const report = validateCostGuard(configuration);

  assert.deepEqual(report.paidProviders, ["sms"]);
  assert.equal(report.monthlyMandatoryCostXof, 0);
});
