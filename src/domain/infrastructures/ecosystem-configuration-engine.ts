import type { EntityId, ISODateTime } from "./types";

export type EcosystemDomain =
  | "artisanal_fishing"
  | "maritime_transport"
  | "agriculture"
  | "livestock"
  | "horticulture"
  | "health"
  | "custom";

export type ConfigurationStatus = "draft" | "validated" | "active" | "deprecated" | "archived";

export interface ActorTypeDefinition {
  code: string;
  name: string;
  description: string;
  roles: string[];
  responsibilities: string[];
  canPay: boolean;
  canBenefit: boolean;
  canRegulate: boolean;
  canProvideServices: boolean;
  metadata: Record<string, unknown>;
}

export interface AssetTypeDefinition {
  code: string;
  name: string;
  description: string;
  ownershipModes: string[];
  lifecycleStates: string[];
  requiredAttributes: string[];
  optionalAttributes: string[];
}

export interface FlowTypeDefinition {
  code: string;
  name: string;
  description: string;
  sourceActorTypes: string[];
  targetActorTypes: string[];
  assetTypes: string[];
  states: string[];
  measurableOutcomes: string[];
}

export interface ServiceTypeDefinition {
  code: string;
  name: string;
  description: string;
  providerActorTypes: string[];
  beneficiaryActorTypes: string[];
  capacityUnits: string[];
  qualityIndicators: string[];
  billableUnits: string[];
}

export interface EventTypeDefinition {
  code: string;
  name: string;
  description: string;
  emittedByActorTypes: string[];
  requiredPayloadFields: string[];
  optionalPayloadFields: string[];
  visibilityScopes: string[];
}

export interface RegulationDefinition {
  code: string;
  name: string;
  description: string;
  authorityActorTypes: string[];
  applicableTerritoryLevels: string[];
  blocking: boolean;
  ruleExpression: string;
  remediationActions: string[];
}

export interface EcosystemConfiguration {
  id: EntityId;
  code: string;
  name: string;
  domain: EcosystemDomain;
  version: number;
  status: ConfigurationStatus;
  description: string;
  actorTypes: ActorTypeDefinition[];
  assetTypes: AssetTypeDefinition[];
  flowTypes: FlowTypeDefinition[];
  serviceTypes: ServiceTypeDefinition[];
  eventTypes: EventTypeDefinition[];
  regulations: RegulationDefinition[];
  capabilityCodes: string[];
  revenueModelCodes: string[];
  territoryModelCodes: string[];
  integrationProfileCodes: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  activatedAt?: ISODateTime;
}

export interface ConfigurationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    actorTypeCount: number;
    assetTypeCount: number;
    flowTypeCount: number;
    serviceTypeCount: number;
    eventTypeCount: number;
    regulationCount: number;
  };
}

const artisanalFishingTemplate: EcosystemConfiguration = {
  id: "ecosystem-artisanal-fishing-v1",
  code: "artisanal_fishing_sn",
  name: "Pêche artisanale sénégalaise",
  domain: "artisanal_fishing",
  version: 1,
  status: "validated",
  description: "Configuration de référence pour la coordination de la pêche artisanale sénégalaise.",
  actorTypes: [
    {
      code: "fisher",
      name: "Pêcheur",
      description: "Acteur de production en mer.",
      roles: ["producer", "data_subject"],
      responsibilities: ["declare_expected_return", "confirm_landing", "share_evidence"],
      canPay: false,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: false,
      metadata: {},
    },
    {
      code: "cooperative",
      name: "Coopérative / GIE",
      description: "Coordinateur collectif des acteurs et opérations.",
      roles: ["coordinator", "validator", "commercial_relay"],
      responsibilities: ["validate_membership", "coordinate_landings", "manage_lots", "resolve_incidents"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: true,
      metadata: {},
    },
    {
      code: "landing_site",
      name: "Site de débarquement",
      description: "Infrastructure d'accueil, de pesée et de coordination des flux.",
      roles: ["operational_hub", "validator"],
      responsibilities: ["receive_arrivals", "register_weighings", "coordinate_services"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: true,
      metadata: {},
    },
    {
      code: "buyer",
      name: "Acheteur",
      description: "Acteur de demande et de commercialisation.",
      roles: ["buyer", "receiver"],
      responsibilities: ["express_need", "commit_purchase", "confirm_reception"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: false,
      metadata: {},
    },
    {
      code: "logistics",
      name: "Prestataire logistique",
      description: "Acteur fournissant transport, glace, froid ou manutention.",
      roles: ["service_provider"],
      responsibilities: ["publish_capacity", "execute_service", "provide_proof"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: true,
      metadata: {},
    },
    {
      code: "ministry",
      name: "Ministère",
      description: "Autorité publique de pilotage et de décision.",
      roles: ["regulator", "decision_maker"],
      responsibilities: ["monitor_sector", "issue_decisions", "sponsor_programs"],
      canPay: true,
      canBenefit: true,
      canRegulate: true,
      canProvideServices: false,
      metadata: {},
    },
  ],
  assetTypes: [
    {
      code: "vessel",
      name: "Pirogue",
      description: "Actif principal de production.",
      ownershipModes: ["individual", "shared", "cooperative"],
      lifecycleStates: ["registered", "active", "maintenance", "inactive"],
      requiredAttributes: ["registration_reference", "owner_actor_id"],
      optionalAttributes: ["gps_identifier", "engine_type", "capacity"],
    },
    {
      code: "catch_lot",
      name: "Lot de capture",
      description: "Volume de produit issu d'une opération de pêche.",
      ownershipModes: ["fisher", "cooperative", "buyer"],
      lifecycleStates: ["landed", "weighed", "published", "committed", "delivered", "closed"],
      requiredAttributes: ["species", "net_weight", "landing_site_id"],
      optionalAttributes: ["quality_grade", "temperature", "destination"],
    },
  ],
  flowTypes: [
    {
      code: "sea_to_market",
      name: "Mer vers marché",
      description: "Flux principal depuis le retour attendu jusqu'à la réception commerciale.",
      sourceActorTypes: ["fisher"],
      targetActorTypes: ["buyer"],
      assetTypes: ["vessel", "catch_lot"],
      states: ["expected", "landed", "weighed", "published", "committed", "delivered"],
      measurableOutcomes: ["lead_time", "traceability_rate", "loss_rate", "value_captured"],
    },
  ],
  serviceTypes: [
    {
      code: "cold_chain",
      name: "Chaîne du froid",
      description: "Glace, stockage froid et transport réfrigéré.",
      providerActorTypes: ["logistics", "landing_site"],
      beneficiaryActorTypes: ["fisher", "cooperative", "buyer"],
      capacityUnits: ["kg", "tonne", "m3", "vehicle"],
      qualityIndicators: ["temperature_compliance", "delivery_time", "loss_rate"],
      billableUnits: ["service_execution", "kg", "hour"],
    },
  ],
  eventTypes: [
    {
      code: "expected_return_announced",
      name: "Retour attendu annoncé",
      description: "Annonce opérationnelle d'un retour de mer.",
      emittedByActorTypes: ["fisher", "cooperative"],
      requiredPayloadFields: ["vessel_id", "expected_at", "estimated_volume"],
      optionalPayloadFields: ["species", "service_needs"],
      visibilityScopes: ["cooperative", "landing_site", "logistics", "buyer"],
    },
    {
      code: "lot_published",
      name: "Lot publié",
      description: "Mise à disposition commerciale d'un lot.",
      emittedByActorTypes: ["cooperative", "landing_site"],
      requiredPayloadFields: ["lot_id", "species", "net_weight"],
      optionalPayloadFields: ["quality_grade", "asking_price"],
      visibilityScopes: ["buyer", "processor", "logistics"],
    },
  ],
  regulations: [
    {
      code: "verified_weighing_before_lot",
      name: "Pesée vérifiée avant publication",
      description: "Aucun lot ne peut être publié sans pesée validée.",
      authorityActorTypes: ["landing_site", "cooperative", "public_agency"],
      applicableTerritoryLevels: ["landing_site", "commune", "department"],
      blocking: true,
      ruleExpression: "lot.weighing.status == verified",
      remediationActions: ["request_weighing_validation", "attach_weighing_evidence"],
    },
  ],
  capabilityCodes: [
    "actor_onboarding",
    "expected_return",
    "landing_coordination",
    "weighing_operations",
    "lot_management",
    "service_coordination",
    "commercial_commitments",
    "incident_management",
    "territorial_supervision",
  ],
  revenueModelCodes: ["fisher_essential", "cooperative_pro", "landing_site_operations", "buyer_network"],
  territoryModelCodes: ["landing_site_activation", "department_scale_up", "national_platform_rollout"],
  integrationProfileCodes: ["mobile_money", "electronic_scale", "gps", "public_registry"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const maritimeTransportTemplate: EcosystemConfiguration = {
  id: "ecosystem-maritime-transport-v1",
  code: "maritime_transport_port",
  name: "Transport maritime et coordination portuaire",
  domain: "maritime_transport",
  version: 1,
  status: "draft",
  description: "Configuration de référence pour la coordination multi-acteurs autour d'un port moderne.",
  actorTypes: [
    {
      code: "shipping_line",
      name: "Compagnie maritime",
      description: "Exploitant de services maritimes réguliers ou spécialisés.",
      roles: ["carrier", "schedule_owner"],
      responsibilities: ["publish_schedule", "confirm_call", "share_manifest"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: true,
      metadata: {},
    },
    {
      code: "terminal_operator",
      name: "Opérateur de terminal",
      description: "Exploitant des opérations navire, parc et porte.",
      roles: ["operational_hub", "capacity_provider"],
      responsibilities: ["plan_berth", "execute_operations", "publish_capacity"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: true,
      metadata: {},
    },
    {
      code: "port_authority",
      name: "Autorité portuaire",
      description: "Autorité de coordination, de régulation et de supervision du port.",
      roles: ["regulator", "orchestrator", "decision_maker"],
      responsibilities: ["coordinate_calls", "manage_constraints", "issue_decisions"],
      canPay: true,
      canBenefit: true,
      canRegulate: true,
      canProvideServices: false,
      metadata: {},
    },
    {
      code: "customs",
      name: "Douanes",
      description: "Autorité de contrôle des marchandises et déclarations.",
      roles: ["regulator", "validator"],
      responsibilities: ["validate_declaration", "release_cargo", "report_hold"],
      canPay: false,
      canBenefit: true,
      canRegulate: true,
      canProvideServices: false,
      metadata: {},
    },
    {
      code: "freight_forwarder",
      name: "Transitaire",
      description: "Coordinateur documentaire et logistique pour le compte des chargeurs.",
      roles: ["coordinator", "document_owner"],
      responsibilities: ["prepare_documents", "coordinate_clearance", "book_services"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: true,
      metadata: {},
    },
    {
      code: "trucking_company",
      name: "Transporteur terrestre",
      description: "Prestataire d'acheminement vers et depuis le port.",
      roles: ["service_provider"],
      responsibilities: ["publish_capacity", "accept_mission", "confirm_gate_event"],
      canPay: true,
      canBenefit: true,
      canRegulate: false,
      canProvideServices: true,
      metadata: {},
    },
  ],
  assetTypes: [
    {
      code: "vessel_call",
      name: "Escale navire",
      description: "Unité principale de coordination des opérations maritimes.",
      ownershipModes: ["shipping_line", "port_authority"],
      lifecycleStates: ["announced", "scheduled", "berth_allocated", "alongside", "operating", "departed", "closed"],
      requiredAttributes: ["vessel_imo", "eta", "terminal_id"],
      optionalAttributes: ["etd", "cargo_profile", "draft", "priority"],
    },
    {
      code: "cargo_unit",
      name: "Unité de marchandise",
      description: "Conteneur, véhicule, vrac ou autre unité physique suivie.",
      ownershipModes: ["shipper", "consignee", "shipping_line"],
      lifecycleStates: ["booked", "manifested", "discharged", "customs_hold", "released", "gate_out"],
      requiredAttributes: ["reference", "cargo_type"],
      optionalAttributes: ["weight", "dangerous_goods_code", "destination"],
    },
  ],
  flowTypes: [
    {
      code: "vessel_call_to_cargo_exit",
      name: "Escale à sortie marchandise",
      description: "Coordination du navire, de la manutention, du contrôle et de la sortie terrestre.",
      sourceActorTypes: ["shipping_line"],
      targetActorTypes: ["trucking_company"],
      assetTypes: ["vessel_call", "cargo_unit"],
      states: ["announced", "planned", "operated", "cleared", "released", "exited"],
      measurableOutcomes: ["vessel_turnaround_time", "cargo_dwell_time", "gate_cycle_time", "service_reliability"],
    },
  ],
  serviceTypes: [
    {
      code: "berth_and_terminal_service",
      name: "Service d'escale et terminal",
      description: "Allocation de poste, manutention, parc, porte et services associés.",
      providerActorTypes: ["terminal_operator", "port_authority"],
      beneficiaryActorTypes: ["shipping_line", "freight_forwarder"],
      capacityUnits: ["berth_hour", "crane_hour", "yard_slot", "gate_slot"],
      qualityIndicators: ["productivity", "schedule_reliability", "congestion_rate"],
      billableUnits: ["vessel_call", "container_move", "storage_day"],
    },
  ],
  eventTypes: [
    {
      code: "vessel_call_announced",
      name: "Escale annoncée",
      description: "Annonce initiale d'une escale à venir.",
      emittedByActorTypes: ["shipping_line"],
      requiredPayloadFields: ["vessel_imo", "eta", "cargo_profile"],
      optionalPayloadFields: ["etd", "service_requests"],
      visibilityScopes: ["port_authority", "terminal_operator", "customs", "freight_forwarder"],
    },
    {
      code: "cargo_released",
      name: "Marchandise libérée",
      description: "Confirmation de mainlevée et disponibilité pour sortie.",
      emittedByActorTypes: ["customs", "terminal_operator"],
      requiredPayloadFields: ["cargo_reference", "released_at"],
      optionalPayloadFields: ["conditions", "gate_slot"],
      visibilityScopes: ["freight_forwarder", "trucking_company", "terminal_operator"],
    },
  ],
  regulations: [
    {
      code: "customs_release_before_gate_out",
      name: "Mainlevée avant sortie",
      description: "Aucune marchandise soumise à contrôle ne peut sortir sans mainlevée.",
      authorityActorTypes: ["customs", "port_authority"],
      applicableTerritoryLevels: ["landing_site", "commune", "department"],
      blocking: true,
      ruleExpression: "cargo.customs_status == released",
      remediationActions: ["request_customs_review", "complete_missing_documentation"],
    },
  ],
  capabilityCodes: [
    "actor_onboarding",
    "vessel_call_coordination",
    "berth_planning",
    "terminal_capacity_management",
    "cargo_traceability",
    "document_collaboration",
    "service_booking",
    "incident_management",
    "port_command_center",
  ],
  revenueModelCodes: ["government_platform", "atlas_premium"],
  territoryModelCodes: ["landing_site_activation", "department_scale_up", "national_platform_rollout"],
  integrationProfileCodes: ["tos", "port_community_system", "customs_system", "ais", "gps", "mobile_money"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export class EcosystemConfigurationEngine {
  private readonly configurations = new Map<EntityId, EcosystemConfiguration>();

  constructor() {
    this.configurations.set(artisanalFishingTemplate.id, structuredClone(artisanalFishingTemplate));
    this.configurations.set(maritimeTransportTemplate.id, structuredClone(maritimeTransportTemplate));
  }

  createConfiguration(input: EcosystemConfiguration) {
    if (this.configurations.has(input.id)) throw new Error(`La configuration ${input.id} existe déjà.`);
    const validation = this.validateConfiguration(input);
    if (!validation.valid) throw new Error(`Configuration invalide : ${validation.errors.join(" | ")}`);
    this.configurations.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  createNewVersion(input: {
    configurationId: EntityId;
    newConfigurationId: EntityId;
    code?: string;
    name?: string;
    updatedAt: ISODateTime;
  }) {
    const current = this.requireConfiguration(input.configurationId);
    if (this.configurations.has(input.newConfigurationId)) {
      throw new Error(`La configuration ${input.newConfigurationId} existe déjà.`);
    }
    const next: EcosystemConfiguration = {
      ...structuredClone(current),
      id: input.newConfigurationId,
      code: input.code ?? current.code,
      name: input.name ?? current.name,
      version: current.version + 1,
      status: "draft",
      updatedAt: input.updatedAt,
      activatedAt: undefined,
    };
    this.configurations.set(next.id, next);
    return structuredClone(next);
  }

  updateConfiguration(input: {
    configurationId: EntityId;
    patch: Partial<Pick<
      EcosystemConfiguration,
      | "name"
      | "description"
      | "actorTypes"
      | "assetTypes"
      | "flowTypes"
      | "serviceTypes"
      | "eventTypes"
      | "regulations"
      | "capabilityCodes"
      | "revenueModelCodes"
      | "territoryModelCodes"
      | "integrationProfileCodes"
    >>;
    updatedAt: ISODateTime;
  }) {
    const current = this.requireConfiguration(input.configurationId);
    if (current.status === "active") throw new Error("Une configuration active doit être versionnée avant modification.");
    const updated: EcosystemConfiguration = {
      ...current,
      ...structuredClone(input.patch),
      updatedAt: input.updatedAt,
    };
    this.configurations.set(updated.id, updated);
    return structuredClone(updated);
  }

  validateAndMark(input: { configurationId: EntityId; updatedAt: ISODateTime }) {
    const configuration = this.requireConfiguration(input.configurationId);
    const result = this.validateConfiguration(configuration);
    if (!result.valid) return result;
    configuration.status = "validated";
    configuration.updatedAt = input.updatedAt;
    this.configurations.set(configuration.id, configuration);
    return result;
  }

  activateConfiguration(input: { configurationId: EntityId; activatedAt: ISODateTime }) {
    const configuration = this.requireConfiguration(input.configurationId);
    const validation = this.validateConfiguration(configuration);
    if (!validation.valid) throw new Error(`Configuration invalide : ${validation.errors.join(" | ")}`);
    for (const item of this.configurations.values()) {
      if (item.domain === configuration.domain && item.status === "active") {
        item.status = "deprecated";
        item.updatedAt = input.activatedAt;
        this.configurations.set(item.id, item);
      }
    }
    configuration.status = "active";
    configuration.activatedAt = input.activatedAt;
    configuration.updatedAt = input.activatedAt;
    this.configurations.set(configuration.id, configuration);
    return structuredClone(configuration);
  }

  getConfiguration(configurationId: EntityId) {
    return structuredClone(this.requireConfiguration(configurationId));
  }

  getActiveConfiguration(domain: EcosystemDomain) {
    const configuration = [...this.configurations.values()].find(
      (item) => item.domain === domain && item.status === "active",
    );
    return configuration ? structuredClone(configuration) : undefined;
  }

  listConfigurations(filters?: { domain?: EcosystemDomain; status?: ConfigurationStatus }) {
    return [...this.configurations.values()]
      .filter((item) => !filters?.domain || item.domain === filters.domain)
      .filter((item) => !filters?.status || item.status === filters.status)
      .map((item) => structuredClone(item));
  }

  validateConfiguration(configuration: EcosystemConfiguration): ConfigurationValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const actorCodes = new Set<string>();
    for (const actor of configuration.actorTypes) {
      if (!actor.code.trim()) errors.push("Un type d'acteur n'a pas de code.");
      if (actorCodes.has(actor.code)) errors.push(`Type d'acteur dupliqué : ${actor.code}.`);
      actorCodes.add(actor.code);
      if (actor.roles.length === 0) warnings.push(`${actor.code}: aucun rôle défini.`);
      if (actor.responsibilities.length === 0) warnings.push(`${actor.code}: aucune responsabilité définie.`);
    }

    const assetCodes = new Set<string>();
    for (const asset of configuration.assetTypes) {
      if (assetCodes.has(asset.code)) errors.push(`Type d'actif dupliqué : ${asset.code}.`);
      assetCodes.add(asset.code);
      if (asset.lifecycleStates.length < 2) warnings.push(`${asset.code}: cycle de vie trop pauvre.`);
    }

    const flowCodes = new Set<string>();
    for (const flow of configuration.flowTypes) {
      if (flowCodes.has(flow.code)) errors.push(`Type de flux dupliqué : ${flow.code}.`);
      flowCodes.add(flow.code);
      for (const source of flow.sourceActorTypes) {
        if (!actorCodes.has(source)) errors.push(`${flow.code}: acteur source inconnu ${source}.`);
      }
      for (const target of flow.targetActorTypes) {
        if (!actorCodes.has(target)) errors.push(`${flow.code}: acteur cible inconnu ${target}.`);
      }
      for (const asset of flow.assetTypes) {
        if (!assetCodes.has(asset)) errors.push(`${flow.code}: actif inconnu ${asset}.`);
      }
      if (flow.states.length < 2) errors.push(`${flow.code}: le flux doit avoir au moins deux états.`);
    }

    for (const service of configuration.serviceTypes) {
      for (const provider of service.providerActorTypes) {
        if (!actorCodes.has(provider)) errors.push(`${service.code}: fournisseur inconnu ${provider}.`);
      }
      for (const beneficiary of service.beneficiaryActorTypes) {
        if (!actorCodes.has(beneficiary)) errors.push(`${service.code}: bénéficiaire inconnu ${beneficiary}.`);
      }
      if (service.capacityUnits.length === 0) warnings.push(`${service.code}: aucune unité de capacité.`);
    }

    for (const event of configuration.eventTypes) {
      for (const emitter of event.emittedByActorTypes) {
        if (!actorCodes.has(emitter)) errors.push(`${event.code}: émetteur inconnu ${emitter}.`);
      }
      if (event.requiredPayloadFields.length === 0) warnings.push(`${event.code}: aucun champ obligatoire.`);
    }

    for (const regulation of configuration.regulations) {
      for (const authority of regulation.authorityActorTypes) {
        if (!actorCodes.has(authority)) errors.push(`${regulation.code}: autorité inconnue ${authority}.`);
      }
      if (!regulation.ruleExpression.trim()) errors.push(`${regulation.code}: expression de règle manquante.`);
    }

    if (configuration.capabilityCodes.length === 0) errors.push("Aucune capability définie.");
    if (configuration.flowTypes.length === 0) errors.push("Aucun flux métier défini.");
    if (configuration.actorTypes.length < 2) errors.push("Une configuration doit coordonner au moins deux types d'acteurs.");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        actorTypeCount: configuration.actorTypes.length,
        assetTypeCount: configuration.assetTypes.length,
        flowTypeCount: configuration.flowTypes.length,
        serviceTypeCount: configuration.serviceTypes.length,
        eventTypeCount: configuration.eventTypes.length,
        regulationCount: configuration.regulations.length,
      },
    };
  }

  compareConfigurations(leftId: EntityId, rightId: EntityId) {
    const left = this.requireConfiguration(leftId);
    const right = this.requireConfiguration(rightId);
    const leftActors = new Set(left.actorTypes.map((item) => item.code));
    const rightActors = new Set(right.actorTypes.map((item) => item.code));
    const leftCapabilities = new Set(left.capabilityCodes);
    const rightCapabilities = new Set(right.capabilityCodes);

    return {
      left: { id: left.id, code: left.code, domain: left.domain, version: left.version },
      right: { id: right.id, code: right.code, domain: right.domain, version: right.version },
      commonActorTypes: [...leftActors].filter((code) => rightActors.has(code)),
      leftOnlyActorTypes: [...leftActors].filter((code) => !rightActors.has(code)),
      rightOnlyActorTypes: [...rightActors].filter((code) => !leftActors.has(code)),
      commonCapabilities: [...leftCapabilities].filter((code) => rightCapabilities.has(code)),
      leftOnlyCapabilities: [...leftCapabilities].filter((code) => !rightCapabilities.has(code)),
      rightOnlyCapabilities: [...rightCapabilities].filter((code) => !leftCapabilities.has(code)),
    };
  }

  snapshot() {
    return {
      configurations: this.listConfigurations(),
      domains: [...new Set([...this.configurations.values()].map((item) => item.domain))],
    };
  }

  private requireConfiguration(id: EntityId) {
    const configuration = this.configurations.get(id);
    if (!configuration) throw new Error(`Configuration d'écosystème introuvable : ${id}.`);
    return configuration;
  }
}

export function getDefaultEcosystemConfigurations() {
  return structuredClone([artisanalFishingTemplate, maritimeTransportTemplate]);
}

export function validateDefaultEcosystemConfigurations() {
  const engine = new EcosystemConfigurationEngine();
  const results = engine.listConfigurations().map((configuration) => ({
    configurationId: configuration.id,
    result: engine.validateConfiguration(configuration),
  }));
  return {
    valid: results.every((item) => item.result.valid),
    results,
    summary: {
      configurationCount: results.length,
      validConfigurationCount: results.filter((item) => item.result.valid).length,
      domains: engine.snapshot().domains,
    },
  };
}
