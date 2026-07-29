import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export type TerritoryLevel = "landing_site" | "commune" | "department" | "region" | "country";
export type TerritoryStatus = "planned" | "onboarding" | "active" | "degraded" | "suspended" | "archived";
export type DeploymentStatus = "not_started" | "preparing" | "pilot" | "scaling" | "stable" | "paused" | "closed";
export type ReadinessDimension =
  | "governance"
  | "actors"
  | "operations"
  | "data"
  | "infrastructure"
  | "support"
  | "commercial"
  | "institutional";

export interface TerritoryNode {
  id: EntityId;
  code: string;
  name: string;
  level: TerritoryLevel;
  parentTerritoryId?: EntityId;
  status: TerritoryStatus;
  timezone: string;
  coordinates?: { latitude: number; longitude: number };
  populationEstimate?: number;
  fishingActorEstimate?: number;
  landingSiteCount?: number;
  metadata: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface TerritoryCapability {
  territoryId: EntityId;
  capabilityCode: string;
  status: "unavailable" | "planned" | "configured" | "operational" | "degraded";
  providerActorId?: EntityId;
  providerActorKind?: MvpActorKind;
  capacityValue?: number;
  capacityUnit?: string;
  serviceLevelTarget?: number;
  notes?: string;
  updatedAt: ISODateTime;
}

export interface TerritoryReadinessAssessment {
  id: EntityId;
  territoryId: EntityId;
  dimension: ReadinessDimension;
  score: number;
  blockers: string[];
  evidenceDocumentIds: EntityId[];
  assessedByActorId: EntityId;
  assessedByActorKind: MvpActorKind;
  assessedAt: ISODateTime;
}

export interface TerritoryDeploymentWave {
  id: EntityId;
  code: string;
  name: string;
  territoryIds: EntityId[];
  status: DeploymentStatus;
  objectives: string[];
  mandatoryCapabilities: string[];
  targetActorCounts: Partial<Record<MvpActorKind, number>>;
  successCriteria: string[];
  startsAt?: ISODateTime;
  targetGoLiveAt?: ISODateTime;
  completedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FieldTeamAssignment {
  id: EntityId;
  territoryId: EntityId;
  actorId: EntityId;
  actorKind: MvpActorKind;
  role: "territory_lead" | "field_coordinator" | "trainer" | "support" | "data_steward" | "institutional_relay";
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  active: boolean;
}

export interface TerritoryOperatingMetric {
  id: EntityId;
  territoryId: EntityId;
  metricCode: string;
  value: number;
  unit: string;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  source: "operations" | "survey" | "integration" | "manual";
  recordedAt: ISODateTime;
}

export interface TerritoryIncident {
  id: EntityId;
  territoryId: EntityId;
  type: "adoption" | "data_quality" | "infrastructure" | "governance" | "commercial" | "security" | "operations";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "mitigating" | "resolved" | "closed";
  title: string;
  description: string;
  ownerActorId?: EntityId;
  openedAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface TerritoryRolloutTemplate {
  code: string;
  name: string;
  applicableLevels: TerritoryLevel[];
  mandatoryReadinessDimensions: ReadinessDimension[];
  mandatoryCapabilities: string[];
  defaultSuccessCriteria: string[];
}

const rolloutTemplates: TerritoryRolloutTemplate[] = [
  {
    code: "landing_site_activation",
    name: "Activation d'un site de débarquement",
    applicableLevels: ["landing_site"],
    mandatoryReadinessDimensions: ["governance", "actors", "operations", "data", "infrastructure", "support"],
    mandatoryCapabilities: [
      "arrival_coordination",
      "weighing_operations",
      "lot_creation",
      "service_coordination",
      "incident_management",
      "field_support",
    ],
    defaultSuccessCriteria: [
      "au moins 70 % des acteurs prioritaires enrôlés",
      "au moins 80 % des retours attendus enregistrés",
      "au moins 80 % des pesées tracées",
      "au moins un coordinateur terrain actif",
      "aucun blocage critique non traité",
    ],
  },
  {
    code: "department_scale_up",
    name: "Extension départementale",
    applicableLevels: ["department"],
    mandatoryReadinessDimensions: ["governance", "actors", "operations", "data", "support", "commercial", "institutional"],
    mandatoryCapabilities: [
      "multi_site_supervision",
      "territorial_reporting",
      "cross_site_service_coordination",
      "institutional_escalation",
      "regional_support_model",
    ],
    defaultSuccessCriteria: [
      "majorité des sites prioritaires actifs",
      "support de niveau territorial opérationnel",
      "reporting consolidé disponible",
      "modèle économique local activé",
      "gouvernance institutionnelle validée",
    ],
  },
  {
    code: "national_platform_rollout",
    name: "Déploiement national",
    applicableLevels: ["country"],
    mandatoryReadinessDimensions: [
      "governance",
      "actors",
      "operations",
      "data",
      "infrastructure",
      "support",
      "commercial",
      "institutional",
    ],
    mandatoryCapabilities: [
      "national_command_center",
      "multi_region_supervision",
      "national_data_governance",
      "institutional_reporting",
      "ecosystem_integrations",
      "national_support_network",
      "revenue_operations",
    ],
    defaultSuccessCriteria: [
      "couverture de plusieurs régions",
      "gouvernance nationale active",
      "capacité d'intégration avec les partenaires publics et privés",
      "modèle de support industrialisé",
      "modèle économique soutenable",
    ],
  },
];

export class TerritorialOperatingEngine {
  private readonly territories = new Map<EntityId, TerritoryNode>();
  private readonly capabilities: TerritoryCapability[] = [];
  private readonly assessments: TerritoryReadinessAssessment[] = [];
  private readonly waves = new Map<EntityId, TerritoryDeploymentWave>();
  private readonly fieldAssignments = new Map<EntityId, FieldTeamAssignment>();
  private readonly metrics: TerritoryOperatingMetric[] = [];
  private readonly incidents = new Map<EntityId, TerritoryIncident>();

  registerTerritory(input: TerritoryNode) {
    if (this.territories.has(input.id)) throw new Error(`Le territoire ${input.id} existe déjà.`);
    if (input.parentTerritoryId) this.requireTerritory(input.parentTerritoryId);
    if (!input.code.trim() || !input.name.trim()) throw new Error("Le code et le nom du territoire sont obligatoires.");
    this.territories.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  updateTerritoryStatus(input: { territoryId: EntityId; status: TerritoryStatus; updatedAt: ISODateTime }) {
    const territory = this.requireTerritory(input.territoryId);
    territory.status = input.status;
    territory.updatedAt = input.updatedAt;
    this.territories.set(territory.id, territory);
    return structuredClone(territory);
  }

  configureCapability(input: TerritoryCapability) {
    this.requireTerritory(input.territoryId);
    const index = this.capabilities.findIndex(
      (item) => item.territoryId === input.territoryId && item.capabilityCode === input.capabilityCode,
    );
    if (index >= 0) this.capabilities[index] = structuredClone(input);
    else this.capabilities.push(structuredClone(input));
    return structuredClone(input);
  }

  assessReadiness(input: TerritoryReadinessAssessment) {
    this.requireTerritory(input.territoryId);
    if (input.score < 0 || input.score > 100) throw new Error("Le score de préparation doit être compris entre 0 et 100.");
    const index = this.assessments.findIndex(
      (item) => item.territoryId === input.territoryId && item.dimension === input.dimension,
    );
    if (index >= 0) this.assessments[index] = structuredClone(input);
    else this.assessments.push(structuredClone(input));
    return structuredClone(input);
  }

  createDeploymentWave(input: TerritoryDeploymentWave) {
    if (this.waves.has(input.id)) throw new Error(`La vague ${input.id} existe déjà.`);
    if (input.territoryIds.length === 0) throw new Error("Une vague doit contenir au moins un territoire.");
    input.territoryIds.forEach((id) => this.requireTerritory(id));
    this.waves.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  updateDeploymentStatus(input: {
    waveId: EntityId;
    status: DeploymentStatus;
    updatedAt: ISODateTime;
    completedAt?: ISODateTime;
  }) {
    const wave = this.requireWave(input.waveId);
    wave.status = input.status;
    wave.updatedAt = input.updatedAt;
    wave.completedAt = input.completedAt;
    this.waves.set(wave.id, wave);
    return structuredClone(wave);
  }

  assignFieldTeam(input: FieldTeamAssignment) {
    this.requireTerritory(input.territoryId);
    if (this.fieldAssignments.has(input.id)) throw new Error(`L'affectation ${input.id} existe déjà.`);
    this.fieldAssignments.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  recordMetric(input: TerritoryOperatingMetric) {
    this.requireTerritory(input.territoryId);
    this.metrics.push(structuredClone(input));
    return structuredClone(input);
  }

  reportIncident(input: TerritoryIncident) {
    this.requireTerritory(input.territoryId);
    if (this.incidents.has(input.id)) throw new Error(`L'incident ${input.id} existe déjà.`);
    this.incidents.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  resolveIncident(input: { incidentId: EntityId; resolvedAt: ISODateTime; close?: boolean }) {
    const incident = this.requireIncident(input.incidentId);
    incident.status = input.close ? "closed" : "resolved";
    incident.resolvedAt = input.resolvedAt;
    this.incidents.set(incident.id, incident);
    return structuredClone(incident);
  }

  getTerritoryReadiness(input: { territoryId: EntityId; templateCode?: string }) {
    const territory = this.requireTerritory(input.territoryId);
    const template = input.templateCode ? this.requireTemplate(input.templateCode) : undefined;
    const assessments = this.assessments.filter((item) => item.territoryId === input.territoryId);
    const dimensions = template?.mandatoryReadinessDimensions ?? [...new Set(assessments.map((item) => item.dimension))];
    const dimensionResults = dimensions.map((dimension) => {
      const assessment = assessments.find((item) => item.dimension === dimension);
      return {
        dimension,
        score: assessment?.score ?? 0,
        blockers: assessment?.blockers ?? ["évaluation manquante"],
      };
    });

    const configuredCapabilities = this.capabilities.filter((item) => item.territoryId === input.territoryId);
    const mandatoryCapabilities = template?.mandatoryCapabilities ?? [];
    const missingCapabilities = mandatoryCapabilities.filter(
      (code) => !configuredCapabilities.some((item) => item.capabilityCode === code && item.status === "operational"),
    );
    const criticalIncidents = [...this.incidents.values()].filter(
      (item) => item.territoryId === input.territoryId && item.severity === "critical" && !["resolved", "closed"].includes(item.status),
    );
    const fieldTeamActive = [...this.fieldAssignments.values()].some(
      (item) => item.territoryId === input.territoryId && item.active,
    );
    const averageScore = dimensionResults.length
      ? Math.round(dimensionResults.reduce((sum, item) => sum + item.score, 0) / dimensionResults.length)
      : 0;

    return {
      territory: structuredClone(territory),
      averageScore,
      dimensions: dimensionResults,
      missingCapabilities,
      criticalIncidentCount: criticalIncidents.length,
      fieldTeamActive,
      readyForActivation:
        averageScore >= 70 &&
        missingCapabilities.length === 0 &&
        criticalIncidents.length === 0 &&
        fieldTeamActive,
    };
  }

  getWaveReadiness(waveId: EntityId) {
    const wave = this.requireWave(waveId);
    const territoryReadiness = wave.territoryIds.map((territoryId) =>
      this.getTerritoryReadiness({ territoryId }),
    );
    const readyCount = territoryReadiness.filter((item) => item.readyForActivation).length;
    return {
      wave: structuredClone(wave),
      territoryReadiness,
      readyCount,
      totalCount: territoryReadiness.length,
      readinessRate: territoryReadiness.length ? Math.round((readyCount / territoryReadiness.length) * 100) : 0,
      readyToStart: readyCount === territoryReadiness.length,
    };
  }

  getTerritoryHierarchy(rootTerritoryId: EntityId) {
    this.requireTerritory(rootTerritoryId);
    const build = (territoryId: EntityId): unknown => {
      const territory = this.requireTerritory(territoryId);
      const children = [...this.territories.values()].filter((item) => item.parentTerritoryId === territoryId);
      return {
        ...structuredClone(territory),
        children: children.map((child) => build(child.id)),
      };
    };
    return build(rootTerritoryId);
  }

  getTerritoryOperatingSnapshot(territoryId: EntityId) {
    const territory = this.requireTerritory(territoryId);
    return {
      territory: structuredClone(territory),
      capabilities: this.capabilities.filter((item) => item.territoryId === territoryId).map((item) => structuredClone(item)),
      readiness: this.getTerritoryReadiness({ territoryId }),
      activeFieldTeam: [...this.fieldAssignments.values()]
        .filter((item) => item.territoryId === territoryId && item.active)
        .map((item) => structuredClone(item)),
      openIncidents: [...this.incidents.values()]
        .filter((item) => item.territoryId === territoryId && !["resolved", "closed"].includes(item.status))
        .map((item) => structuredClone(item)),
      metrics: this.metrics.filter((item) => item.territoryId === territoryId).map((item) => structuredClone(item)),
    };
  }

  snapshot() {
    return {
      templates: structuredClone(rolloutTemplates),
      territories: [...this.territories.values()].map((item) => structuredClone(item)),
      capabilities: this.capabilities.map((item) => structuredClone(item)),
      assessments: this.assessments.map((item) => structuredClone(item)),
      waves: [...this.waves.values()].map((item) => structuredClone(item)),
      fieldAssignments: [...this.fieldAssignments.values()].map((item) => structuredClone(item)),
      metrics: this.metrics.map((item) => structuredClone(item)),
      incidents: [...this.incidents.values()].map((item) => structuredClone(item)),
    };
  }

  private requireTerritory(id: EntityId) {
    const territory = this.territories.get(id);
    if (!territory) throw new Error(`Territoire introuvable : ${id}.`);
    return territory;
  }

  private requireWave(id: EntityId) {
    const wave = this.waves.get(id);
    if (!wave) throw new Error(`Vague de déploiement introuvable : ${id}.`);
    return wave;
  }

  private requireIncident(id: EntityId) {
    const incident = this.incidents.get(id);
    if (!incident) throw new Error(`Incident territorial introuvable : ${id}.`);
    return incident;
  }

  private requireTemplate(code: string) {
    const template = rolloutTemplates.find((item) => item.code === code);
    if (!template) throw new Error(`Modèle de déploiement introuvable : ${code}.`);
    return template;
  }
}

export function getTerritoryRolloutTemplates() {
  return structuredClone(rolloutTemplates);
}

export function validateTerritorialOperatingCatalog() {
  const errors: string[] = [];
  for (const template of rolloutTemplates) {
    if (template.applicableLevels.length === 0) errors.push(`${template.code}: aucun niveau territorial.`);
    if (template.mandatoryReadinessDimensions.length === 0) errors.push(`${template.code}: aucune dimension de préparation.`);
    if (template.mandatoryCapabilities.length === 0) errors.push(`${template.code}: aucune capability obligatoire.`);
    if (template.defaultSuccessCriteria.length === 0) errors.push(`${template.code}: aucun critère de succès.`);
  }
  return {
    valid: errors.length === 0,
    errors,
    summary: {
      templateCount: rolloutTemplates.length,
      levelsCovered: [...new Set(rolloutTemplates.flatMap((item) => item.applicableLevels))],
      readinessDimensions: [...new Set(rolloutTemplates.flatMap((item) => item.mandatoryReadinessDimensions))],
      mandatoryCapabilityCount: new Set(rolloutTemplates.flatMap((item) => item.mandatoryCapabilities)).size,
    },
  };
}
