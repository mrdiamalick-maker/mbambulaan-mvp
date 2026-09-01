import type { FindingSourceKind, FindingType, KnowledgeSourceRef, ProductState, TrustLevel } from "@/domain/types";

export const SIGNAL_CROSSING_DISCLAIMER =
  "Détection automatique — règle de croisement, mode démonstration." as const;

export const SIGNAL_CROSSING_DECISION_BOUNDARY =
  "Signal à qualifier ; ne constitue ni une décision ni une certitude." as const;

export const SIGNAL_CROSSING_RULE_IDS = {
  lateVessel: "late-vessel",
  impairedInfrastructureOnActiveSite: "impaired-infrastructure-on-active-site",
  priorityCorroborationGap: "priority-corroboration-gap"
} as const;

export type SignalCrossingRuleId =
  (typeof SIGNAL_CROSSING_RULE_IDS)[keyof typeof SIGNAL_CROSSING_RULE_IDS];

export type SignalCrossingAttentionLevel = "vigilance" | "critique";

export type SignalCrossingSourceType =
  | "territory"
  | "site"
  | "infrastructure"
  | "capacity"
  | "landing"
  | "fishing_trip"
  | "vessel"
  | "situation"
  | "evidence";

export interface SignalCrossingSourceRef {
  objectType: SignalCrossingSourceType;
  objectId: string;
}

export interface SignalCrossingFact {
  code: string;
  label: string;
  value: string | number;
  unit?: string;
}

export interface SignalCrossingAlert {
  id: string;
  ruleId: SignalCrossingRuleId;
  ruleVersion: 1;
  territoryId: string;
  referenceAt: string;
  attentionLevel: SignalCrossingAttentionLevel;
  title: string;
  description: string;
  facts: SignalCrossingFact[];
  sourceRefs: SignalCrossingSourceRef[];
  mode: "demonstration";
  disclaimer: typeof SIGNAL_CROSSING_DISCLAIMER;
  decisionBoundary: typeof SIGNAL_CROSSING_DECISION_BOUNDARY;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_LANDING_WINDOW_DAYS = 7;

const corroboratedTrustLevels = new Set<TrustLevel>([
  "verifiee",
  "consolidee",
  "rapprochee",
  "documentee",
  "officielle"
]);

function timestamp(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : undefined;
}

function addTimestamp(target: number[], value?: string) {
  const parsed = timestamp(value);
  if (parsed !== undefined) target.push(parsed);
}

/**
 * Horloge métier du jeu de données. Les dates attendues, échéances et
 * validités sont volontairement exclues : elles décrivent un futur prévu,
 * pas une activité effectivement observée.
 */
export function deriveDatasetReferenceAt(state: ProductState): string | null {
  const observed: number[] = [];

  for (const infrastructure of state.infrastructures) addTimestamp(observed, infrastructure.updatedAt);
  for (const trip of state.trips) {
    addTimestamp(observed, trip.departureAt);
    addTimestamp(observed, trip.announcedReturnAt);
    addTimestamp(observed, trip.arrivedAt);
  }
  for (const landing of state.landings) {
    addTimestamp(observed, landing.arrivedAt);
    addTimestamp(observed, landing.weighedAt);
  }
  for (const request of state.serviceRequests) addTimestamp(observed, request.createdAt);
  for (const signal of state.signals) addTimestamp(observed, signal.createdAt);
  for (const message of state.incomingMessages) addTimestamp(observed, message.receivedAt);
  for (const situation of state.situations) {
    for (const entry of situation.history) addTimestamp(observed, entry.at);
  }
  for (const decision of state.decisions) addTimestamp(observed, decision.decidedAt);
  for (const evidence of state.evidences) addTimestamp(observed, evidence.recordedAt);
  for (const communication of state.communications) {
    addTimestamp(observed, communication.createdAt);
    addTimestamp(observed, communication.updatedAt);
  }
  for (const observation of state.priceObservations) addTimestamp(observed, observation.observedAt);
  for (const post of state.communityPosts) addTimestamp(observed, post.createdAt);
  for (const report of state.reports) addTimestamp(observed, report.generatedAt);
  for (const entry of state.audit) addTimestamp(observed, entry.at);

  if (observed.length === 0) return null;
  return new Date(Math.max(...observed)).toISOString();
}

function sourceRefs(refs: SignalCrossingSourceRef[]): SignalCrossingSourceRef[] {
  const distinct = new Map(refs.map((ref) => [`${ref.objectType}:${ref.objectId}`, ref]));
  return [...distinct.values()].sort((left, right) =>
    left.objectType.localeCompare(right.objectType) || left.objectId.localeCompare(right.objectId)
  );
}

function baseAlert(
  alert: Omit<
    SignalCrossingAlert,
    "ruleVersion" | "mode" | "disclaimer" | "decisionBoundary"
  >
): SignalCrossingAlert {
  return {
    ...alert,
    ruleVersion: 1,
    mode: "demonstration",
    disclaimer: SIGNAL_CROSSING_DISCLAIMER,
    decisionBoundary: SIGNAL_CROSSING_DECISION_BOUNDARY
  };
}

function detectLateVesselAlertsAt(
  state: ProductState,
  referenceAt: string
): SignalCrossingAlert[] {
  const referenceTime = timestamp(referenceAt);
  if (referenceTime === undefined) return [];

  const vesselById = new Map(state.vessels.map((vessel) => [vessel.id, vessel]));
  const siteById = new Map(state.sites.map((site) => [site.id, site]));
  const landingsByTrip = new Map<string, ProductState["landings"]>();

  for (const landing of state.landings) {
    const related = landingsByTrip.get(landing.tripId) ?? [];
    related.push(landing);
    landingsByTrip.set(landing.tripId, related);
  }

  return state.trips
    .filter((trip) => {
      const expectedReturn = timestamp(trip.expectedReturnAt);
      if (trip.status !== "en_mer" || expectedReturn === undefined || expectedReturn >= referenceTime) return false;
      if (trip.arrivedAt) return false;
      return !(landingsByTrip.get(trip.id) ?? []).some(
        (landing) => landing.arrivedAt || landing.weighedAt || landing.status !== "attendu"
      );
    })
    .flatMap((trip) => {
      const vessel = vesselById.get(trip.vesselId);
      const site = vessel ? siteById.get(vessel.homeSiteId) : undefined;
      if (!vessel || !site) return [];

      const territory = state.territories.find((item) => item.id === site.territoryId);
      const relatedLandings = landingsByTrip.get(trip.id) ?? [];
      const delayedMinutes = Math.max(
        0,
        Math.floor((referenceTime - new Date(trip.expectedReturnAt).getTime()) / 60_000)
      );

      return [
        baseAlert({
          id: `signal-crossing:late-vessel:v1:${trip.id}`,
          ruleId: SIGNAL_CROSSING_RULE_IDS.lateVessel,
          territoryId: site.territoryId,
          referenceAt,
          attentionLevel: "critique",
          title: "Retour attendu dépassé — vérification requise",
          description: `Le retour de ${vessel.name} était attendu avant la dernière activité connue du jeu de données ; aucune arrivée n’est enregistrée.`,
          facts: [
            { code: "expected_return_at", label: "Retour attendu", value: trip.expectedReturnAt },
            { code: "delay_minutes", label: "Dépassement à la date de référence", value: delayedMinutes, unit: "min" },
            { code: "crew_count", label: "Membres d’équipage déclarés", value: trip.crewCount, unit: "personnes" },
            { code: "territory", label: "Territoire de rattachement", value: territory?.name ?? site.territoryId }
          ],
          sourceRefs: sourceRefs([
            { objectType: "territory", objectId: site.territoryId },
            { objectType: "site", objectId: site.id },
            { objectType: "vessel", objectId: vessel.id },
            { objectType: "fishing_trip", objectId: trip.id },
            ...relatedLandings.map((landing) => ({ objectType: "landing" as const, objectId: landing.id }))
          ])
        })
      ];
    });
}

function detectImpairedInfrastructureAlertsAt(
  state: ProductState,
  referenceAt: string
): SignalCrossingAlert[] {
  const referenceTime = timestamp(referenceAt);
  if (referenceTime === undefined) return [];
  const windowStart = referenceTime - RECENT_LANDING_WINDOW_DAYS * DAY_MS;

  const impairedBySite = new Map<string, ProductState["infrastructures"]>();
  for (const infrastructure of state.infrastructures) {
    if (infrastructure.status === "operationnelle") continue;
    const grouped = impairedBySite.get(infrastructure.siteId) ?? [];
    grouped.push(infrastructure);
    impairedBySite.set(infrastructure.siteId, grouped);
  }

  const alerts: SignalCrossingAlert[] = [];
  for (const [siteId, infrastructures] of impairedBySite) {
    const recentLandingById = new Map(
      state.landings
        .filter((landing) => {
          if (landing.siteId !== siteId || landing.status === "attendu") return false;
          const recordedAt = timestamp(landing.weighedAt ?? landing.arrivedAt);
          return recordedAt !== undefined && recordedAt >= windowStart && recordedAt <= referenceTime;
        })
        .map((landing) => [landing.id, landing])
    );
    const recentLandings = [...recentLandingById.values()].sort((left, right) => left.id.localeCompare(right.id));
    if (recentLandings.length === 0) continue;

    const site = state.sites.find((item) => item.id === siteId);
    const territoryId = site?.territoryId ?? infrastructures[0]?.territoryId;
    if (!territoryId) continue;
    const territory = state.territories.find((item) => item.id === territoryId);
    const infrastructureIds = new Set(infrastructures.map((item) => item.id));
    const expiredCapacities = state.capacities
      .filter((capacity) => {
        const validUntil = timestamp(capacity.validUntil);
        return infrastructureIds.has(capacity.infrastructureId) && validUntil !== undefined && validUntil < referenceTime;
      })
      .sort((left, right) => left.id.localeCompare(right.id));
    const unavailableCount = infrastructures.filter((item) => item.status === "indisponible").length;
    const recordedWeightKg = recentLandings.reduce((total, landing) => total + landing.totalWeightKg, 0);

    alerts.push(
      baseAlert({
        id: `signal-crossing:impaired-infrastructure-on-active-site:v1:${territoryId}:${siteId}`,
        ruleId: SIGNAL_CROSSING_RULE_IDS.impairedInfrastructureOnActiveSite,
        territoryId,
        referenceAt,
        attentionLevel: unavailableCount > 0 ? "critique" : "vigilance",
        title: "Infrastructure fragilisée sur un site ayant enregistré une activité récente",
        description: `${infrastructures.length} infrastructure${infrastructures.length > 1 ? "s" : ""} fragile${infrastructures.length > 1 ? "s" : ""} ou indisponible${infrastructures.length > 1 ? "s" : ""} partage${infrastructures.length > 1 ? "nt" : ""} le site de ${site?.name ?? territory?.name ?? territoryId} avec des débarquements récents ; la capacité doit être vérifiée avant toute conclusion opérationnelle.`,
        facts: [
          { code: "impaired_infrastructure_count", label: "Infrastructures fragiles ou indisponibles", value: infrastructures.length },
          { code: "unavailable_infrastructure_count", label: "Infrastructures indisponibles", value: unavailableCount },
          { code: "recent_landing_count", label: `Débarquements enregistrés sur ${RECENT_LANDING_WINDOW_DAYS} jours`, value: recentLandings.length },
          { code: "recorded_weight_kg", label: "Volume enregistré sur la fenêtre", value: recordedWeightKg, unit: "kg" },
          { code: "expired_capacity_record_count", label: "Relevés de capacité expirés à la date de référence", value: expiredCapacities.length }
        ],
        sourceRefs: sourceRefs([
          { objectType: "territory", objectId: territoryId },
          { objectType: "site", objectId: siteId },
          ...infrastructures.map((item) => ({ objectType: "infrastructure" as const, objectId: item.id })),
          ...recentLandings.map((landing) => ({ objectType: "landing" as const, objectId: landing.id })),
          ...expiredCapacities.map((capacity) => ({ objectType: "capacity" as const, objectId: capacity.id }))
        ])
      })
    );
  }

  return alerts;
}

function detectPriorityCorroborationAlertsAt(
  state: ProductState,
  referenceAt: string
): SignalCrossingAlert[] {
  return state.situations
    .filter((situation) => {
      if (situation.status === "reglee" || !["haute", "critique"].includes(situation.priority)) return false;
      if (corroboratedTrustLevels.has(situation.trust)) return false;
      return !state.evidences.some(
        (evidence) => evidence.situationId === situation.id && corroboratedTrustLevels.has(evidence.trust)
      );
    })
    .map((situation) => {
      const territory = state.territories.find((item) => item.id === situation.territoryId);
      const relatedEvidences = state.evidences
        .filter((evidence) => evidence.situationId === situation.id)
        .sort((left, right) => left.id.localeCompare(right.id));

      return baseAlert({
        id: `signal-crossing:priority-corroboration-gap:v1:${situation.id}`,
        ruleId: SIGNAL_CROSSING_RULE_IDS.priorityCorroborationGap,
        territoryId: situation.territoryId,
        referenceAt,
        attentionLevel: situation.priority === "critique" ? "critique" : "vigilance",
        title: "Situation prioritaire — corroboration à renforcer avant décision",
        description: `${situation.title} à ${territory?.name ?? situation.territoryId} reste prioritaire sans niveau de confiance consolidé ni preuve qualifiée associée.`,
        facts: [
          { code: "priority", label: "Priorité enregistrée", value: situation.priority },
          { code: "situation_status", label: "Étape de traitement", value: situation.status },
          { code: "situation_trust", label: "Confiance de la situation", value: situation.trust },
          { code: "related_evidence_count", label: "Preuves actuellement reliées", value: relatedEvidences.length },
          { code: "corroborated_evidence_count", label: "Preuves qualifiées pour cette règle", value: 0 }
        ],
        sourceRefs: sourceRefs([
          { objectType: "territory", objectId: situation.territoryId },
          { objectType: "situation", objectId: situation.id },
          ...relatedEvidences.map((evidence) => ({ objectType: "evidence" as const, objectId: evidence.id }))
        ])
      });
    });
}

export function detectLateVesselAlerts(state: ProductState): SignalCrossingAlert[] {
  const referenceAt = deriveDatasetReferenceAt(state);
  return state.tenant.mode === "demonstration" && referenceAt
    ? detectLateVesselAlertsAt(state, referenceAt)
    : [];
}

export function detectImpairedInfrastructureAlerts(state: ProductState): SignalCrossingAlert[] {
  const referenceAt = deriveDatasetReferenceAt(state);
  return state.tenant.mode === "demonstration" && referenceAt
    ? detectImpairedInfrastructureAlertsAt(state, referenceAt)
    : [];
}

export function detectPriorityCorroborationAlerts(state: ProductState): SignalCrossingAlert[] {
  const referenceAt = deriveDatasetReferenceAt(state);
  return state.tenant.mode === "demonstration" && referenceAt
    ? detectPriorityCorroborationAlertsAt(state, referenceAt)
    : [];
}

// Convergence Signal Crossing → Finding (LOT 0.2, mandat "aligner le Core
// métier avec le Blueprint V1", §7) : "faire converger progressivement le
// résultat de Signal Crossing vers Finding, directement ou via une couche
// d'adaptation propre" — couche d'adaptation, pas une fusion des deux
// types. SignalCrossingAlert reste le format natif du moteur déterministe
// (règles, ruleId/version, facts inchangés) ; cette fonction ne fait que
// façonner un brouillon compatible avec la commande record_finding
// (knowledge-pipeline.ts), jamais persisté automatiquement — "un Finding
// ne doit PAS automatiquement ouvrir une Situation dans LOT 0" s'applique
// a fortiori à sa simple proposition : aucun appel ici ne modifie l'état,
// c'est un humain (ou un futur lot) qui décide d'appeler record_finding
// avec ce brouillon.
const RULE_TO_FINDING_TYPE: Record<SignalCrossingRuleId, FindingType> = {
  [SIGNAL_CROSSING_RULE_IDS.lateVessel]: "retour_attendu_depasse",
  [SIGNAL_CROSSING_RULE_IDS.impairedInfrastructureOnActiveSite]: "infrastructure_fragile_active_site",
  [SIGNAL_CROSSING_RULE_IDS.priorityCorroborationGap]: "corroboration_gap"
};

export interface FindingDraftFromAlert {
  findingType: FindingType;
  title: string;
  statement: string;
  territoryIds: string[];
  sourceRefs: KnowledgeSourceRef[];
  explanation: string;
  trust: TrustLevel;
  provenance: FindingSourceKind;
  nextStep: string;
  ruleId: string;
  ruleVersion: number;
}

export function signalCrossingAlertToFindingDraft(alert: SignalCrossingAlert): FindingDraftFromAlert {
  // SignalCrossingSourceType est un sous-ensemble exact des objectType de
  // KnowledgeSourceRef (vérifié à la définition des deux types) — aucune
  // conversion de valeur nécessaire, seulement d'assembler la liste.
  const sourceRefs = alert.sourceRefs.map((ref) => ref as KnowledgeSourceRef);
  const factsSummary = alert.facts.map((fact) => `${fact.label} : ${fact.value}${fact.unit ? ` ${fact.unit}` : ""}`).join(" · ");
  return {
    findingType: RULE_TO_FINDING_TYPE[alert.ruleId],
    title: alert.title,
    statement: alert.description,
    territoryIds: [alert.territoryId],
    sourceRefs,
    explanation: factsSummary ? `${SIGNAL_CROSSING_DISCLAIMER} ${factsSummary}` : SIGNAL_CROSSING_DISCLAIMER,
    // "observee" : ni déclaré (c'est une règle déterministe sur des
    // données déjà présentes, pas une simple déclaration), ni vérifié
    // (aucune corroboration humaine n'a encore eu lieu) — cf.
    // SIGNAL_CROSSING_DECISION_BOUNDARY, jamais présenté comme une
    // certitude.
    trust: "observee",
    provenance: "rule",
    nextStep: SIGNAL_CROSSING_DECISION_BOUNDARY,
    ruleId: alert.ruleId,
    ruleVersion: alert.ruleVersion
  };
}

export function computeSignalCrossingAlerts(state: ProductState): SignalCrossingAlert[] {
  if (state.tenant.mode !== "demonstration") return [];
  const referenceAt = deriveDatasetReferenceAt(state);
  if (!referenceAt) return [];

  const ruleOrder: Record<SignalCrossingRuleId, number> = {
    [SIGNAL_CROSSING_RULE_IDS.lateVessel]: 0,
    [SIGNAL_CROSSING_RULE_IDS.impairedInfrastructureOnActiveSite]: 1,
    [SIGNAL_CROSSING_RULE_IDS.priorityCorroborationGap]: 2
  };
  const attentionOrder: Record<SignalCrossingAttentionLevel, number> = {
    critique: 0,
    vigilance: 1
  };

  return [
    ...detectLateVesselAlertsAt(state, referenceAt),
    ...detectImpairedInfrastructureAlertsAt(state, referenceAt),
    ...detectPriorityCorroborationAlertsAt(state, referenceAt)
  ].sort(
    (left, right) =>
      attentionOrder[left.attentionLevel] - attentionOrder[right.attentionLevel] ||
      ruleOrder[left.ruleId] - ruleOrder[right.ruleId] ||
      left.territoryId.localeCompare(right.territoryId) ||
      left.id.localeCompare(right.id)
  );
}
