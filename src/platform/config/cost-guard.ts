export type IntegrationProviderMode = "embedded" | "self_hosted" | "simulated" | "external_paid";

export interface CostGuardConfiguration {
  localFreeMode: boolean;
  allowPaidIntegrations: boolean;
  providers: {
    database: IntegrationProviderMode;
    objectStorage: IntegrationProviderMode;
    sms: IntegrationProviderMode;
    whatsapp: IntegrationProviderMode;
    mobileMoney: IntegrationProviderMode;
    weather: IntegrationProviderMode;
    telemetry: IntegrationProviderMode;
    antivirus: IntegrationProviderMode;
  };
}

export interface CostGuardReport {
  compliant: boolean;
  localFreeMode: boolean;
  paidProviders: string[];
  monthlyMandatoryCostXof: number;
  message: string;
}

export function loadCostGuardConfiguration(env: Record<string, string | undefined>): CostGuardConfiguration {
  const localFreeMode = booleanValue(env.MBAMBULAAN_LOCAL_FREE_MODE, true);
  const allowPaidIntegrations = booleanValue(env.ALLOW_PAID_INTEGRATIONS, false);
  return {
    localFreeMode,
    allowPaidIntegrations,
    providers: {
      database: providerMode(env.DATABASE_PROVIDER_MODE, "self_hosted"),
      objectStorage: providerMode(env.OBJECT_STORAGE_PROVIDER_MODE, "simulated"),
      sms: providerMode(env.SMS_PROVIDER_MODE, "simulated"),
      whatsapp: providerMode(env.WHATSAPP_PROVIDER_MODE, "simulated"),
      mobileMoney: providerMode(env.MOBILE_MONEY_PROVIDER_MODE, "simulated"),
      weather: providerMode(env.WEATHER_PROVIDER_MODE, "simulated"),
      telemetry: providerMode(env.TELEMETRY_PROVIDER_MODE, "embedded"),
      antivirus: providerMode(env.ANTIVIRUS_PROVIDER_MODE, "simulated"),
    },
  };
}

export function validateCostGuard(configuration: CostGuardConfiguration): CostGuardReport {
  const paidProviders = Object.entries(configuration.providers)
    .filter(([, mode]) => mode === "external_paid")
    .map(([provider]) => provider);

  if (configuration.localFreeMode && configuration.allowPaidIntegrations) {
    throw new Error("ALLOW_PAID_INTEGRATIONS doit rester false lorsque MBAMBULAAN_LOCAL_FREE_MODE=true.");
  }
  if (configuration.localFreeMode && paidProviders.length > 0) {
    throw new Error(`Le mode local gratuit interdit les fournisseurs payants : ${paidProviders.join(", ")}.`);
  }
  if (!configuration.allowPaidIntegrations && paidProviders.length > 0) {
    throw new Error(`Des fournisseurs payants sont configurés sans autorisation explicite : ${paidProviders.join(", ")}.`);
  }

  return {
    compliant: true,
    localFreeMode: configuration.localFreeMode,
    paidProviders,
    monthlyMandatoryCostXof: 0,
    message: configuration.localFreeMode
      ? "Le produit fonctionne sans carte bancaire, abonnement ni clé de fournisseur payant."
      : "Les coûts externes restent optionnels et doivent être autorisés explicitement.",
  };
}

function providerMode(value: string | undefined, fallback: IntegrationProviderMode): IntegrationProviderMode {
  const resolved = value ?? fallback;
  if (!["embedded", "self_hosted", "simulated", "external_paid"].includes(resolved)) {
    throw new Error(`Mode fournisseur invalide : ${resolved}.`);
  }
  return resolved as IntegrationProviderMode;
}

function booleanValue(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}
