import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export interface NavigationNode {
  id: EntityId;
  code: string;
  actorKinds: MvpActorKind[];
  screenCode: string;
  title: string;
  purpose: string;
  entryActionCodes: string[];
  visibleWhen: string[];
  primaryActionCode?: string;
  fallbackNodeCode?: string;
}

export interface NavigationTransition {
  id: EntityId;
  fromNodeCode: string;
  toNodeCode: string;
  trigger:
    | "user_action"
    | "workflow_event"
    | "notification"
    | "error_recovery"
    | "decision_drilldown";
  triggerCode: string;
  guardConditions: string[];
  preservesContextKeys: string[];
  successMessage?: string;
}

export interface NotificationDefinition {
  id: EntityId;
  code: string;
  eventType: string;
  recipientActorKinds: MvpActorKind[];
  severity: "info" | "action_required" | "warning" | "critical";
  titleTemplate: string;
  bodyTemplate: string;
  deepLinkNodeCode: string;
  actionCode?: string;
  channels: Array<"in_app" | "sms" | "email" | "assisted_queue">;
  deduplicationWindowMinutes: number;
  escalationAfterMinutes?: number;
  expiresAfterMinutes?: number;
  auditable: boolean;
}

export interface DataResourcePolicy {
  id: EntityId;
  resourceCode:
    | "actor_profile"
    | "vessel"
    | "expected_return"
    | "landing"
    | "weighing"
    | "lot"
    | "service_need"
    | "service_capacity"
    | "service_execution"
    | "commitment"
    | "incident"
    | "program"
    | "financing_case"
    | "insurance_case"
    | "operational_metric"
    | "atlas_insight";
  ownerActorKinds: MvpActorKind[];
  readActorKinds: MvpActorKind[];
  writeActorKinds: MvpActorKind[];
  aggregateReadActorKinds: MvpActorKind[];
  fieldRestrictions: Record<string, MvpActorKind[]>;
  consentRequiredFor: MvpActorKind[];
  purposeLimitations: string[];
  retentionPolicy: string;
  auditRequired: boolean;
}

export interface ProductBehaviorBundle {
  navigationNodes: NavigationNode[];
  navigationTransitions: NavigationTransition[];
  notifications: NotificationDefinition[];
  dataPolicies: DataResourcePolicy[];
}

const navigationNodes: NavigationNode[] = [
  {
    id: "node-fisher-home",
    code: "fisher_home",
    actorKinds: ["fisher"],
    screenCode: "fisher_home",
    title: "Accueil",
    purpose: "Orienter le pêcheur vers sa prochaine action utile.",
    entryActionCodes: ["announce_expected_return", "request_service", "review_activity_history"],
    visibleWhen: ["actor.active", "role.fisher"],
    primaryActionCode: "announce_expected_return",
  },
  {
    id: "node-fisher-return",
    code: "fisher_expected_return",
    actorKinds: ["fisher"],
    screenCode: "fisher_expected_return",
    title: "Retour attendu",
    purpose: "Déclarer ou modifier un retour avant l'arrivée.",
    entryActionCodes: ["announce_expected_return"],
    visibleWhen: ["vessel.active"],
    fallbackNodeCode: "fisher_home",
  },
  {
    id: "node-fisher-history",
    code: "fisher_history",
    actorKinds: ["fisher"],
    screenCode: "fisher_history",
    title: "Mon activité",
    purpose: "Consulter et partager les preuves d'activité.",
    entryActionCodes: ["review_activity_history", "share_activity_evidence"],
    visibleWhen: ["actor.active"],
    fallbackNodeCode: "fisher_home",
  },
  {
    id: "node-cooperative-command",
    code: "cooperative_command_center",
    actorKinds: ["cooperative"],
    screenCode: "cooperative_command_center",
    title: "Coordination",
    purpose: "Piloter membres, retours, lots, services et incidents.",
    entryActionCodes: ["validate_lot", "assign_incident", "coordinate_service_need", "approve_member"],
    visibleWhen: ["organization.active", "role.cooperative_manager"],
  },
  {
    id: "node-landing-arrivals",
    code: "landing_site_arrivals",
    actorKinds: ["landing_site"],
    screenCode: "landing_site_arrivals",
    title: "Arrivées",
    purpose: "Préparer les retours et traiter les tensions du site.",
    entryActionCodes: ["confirm_landing", "register_weighing", "coordinate_service_need", "report_tension"],
    visibleWhen: ["landing_site.active"],
    primaryActionCode: "confirm_landing",
  },
  {
    id: "node-landing-weighing",
    code: "landing_site_weighing",
    actorKinds: ["landing_site", "cooperative"],
    screenCode: "landing_site_weighing",
    title: "Pesée et lot",
    purpose: "Transformer un débarquement en volume de référence puis en lot.",
    entryActionCodes: ["register_weighing", "create_lot"],
    visibleWhen: ["landing.confirmed"],
    primaryActionCode: "register_weighing",
    fallbackNodeCode: "landing_site_arrivals",
  },
  {
    id: "node-buyer-market",
    code: "buyer_market_view",
    actorKinds: ["buyer", "processor"],
    screenCode: "buyer_market_view",
    title: "Lots disponibles",
    purpose: "Identifier une offre fiable et créer un engagement.",
    entryActionCodes: ["create_buyer_commitment", "request_information"],
    visibleWhen: ["actor.active", "organization.verified"],
    primaryActionCode: "create_buyer_commitment",
  },
  {
    id: "node-buyer-commitments",
    code: "buyer_commitments",
    actorKinds: ["buyer", "processor"],
    screenCode: "buyer_commitments",
    title: "Engagements",
    purpose: "Suivre les engagements jusqu'à leur clôture.",
    entryActionCodes: ["confirm_lot_reception", "report_delivery_issue", "cancel_commitment"],
    visibleWhen: ["actor.active"],
    fallbackNodeCode: "buyer_market_view",
  },
  {
    id: "node-logistics-capacity",
    code: "logistics_capacity",
    actorKinds: ["logistics"],
    screenCode: "logistics_capacity",
    title: "Capacités et missions",
    purpose: "Déclarer une capacité et exécuter les missions affectées.",
    entryActionCodes: ["declare_service_capacity", "accept_service_allocation", "confirm_service_execution"],
    visibleWhen: ["organization.active"],
    primaryActionCode: "declare_service_capacity",
  },
  {
    id: "node-government-command",
    code: "government_command_center",
    actorKinds: ["ministry"],
    screenCode: "government_command_center",
    title: "Pilotage opérationnel",
    purpose: "Voir les opérations, tensions, incidents et résultats du territoire.",
    entryActionCodes: ["open_operational_drilldown", "generate_ministry_briefing", "record_public_decision"],
    visibleWhen: ["role.government_viewer_or_decider", "territory.authorized"],
    primaryActionCode: "generate_ministry_briefing",
  },
  {
    id: "node-agency-supervision",
    code: "agency_field_supervision",
    actorKinds: ["public_agency"],
    screenCode: "agency_field_supervision",
    title: "Supervision terrain",
    purpose: "Prioriser, assigner et résoudre les interventions.",
    entryActionCodes: ["assign_field_action", "validate_resolution", "escalate_to_ministry"],
    visibleWhen: ["role.field_supervisor", "territory.authorized"],
  },
  {
    id: "node-development-program",
    code: "development_program_workspace",
    actorKinds: ["development_partner"],
    screenCode: "development_program_workspace",
    title: "Programmes",
    purpose: "Suivre engagements, bénéficiaires et résultats.",
    entryActionCodes: ["publish_program", "approve_beneficiary", "record_program_commitment", "record_program_outcome"],
    visibleWhen: ["organization.verified", "program.authorized"],
  },
  {
    id: "node-finance-case",
    code: "finance_case_assessment",
    actorKinds: ["financial_institution"],
    screenCode: "finance_case_assessment",
    title: "Dossier financement",
    purpose: "Évaluer un dossier avec des preuves consenties.",
    entryActionCodes: ["request_activity_evidence", "record_financing_decision"],
    visibleWhen: ["case.assigned", "consent.valid"],
  },
  {
    id: "node-insurance-risk",
    code: "insurance_risk_assessment",
    actorKinds: ["insurer"],
    screenCode: "insurance_risk_assessment",
    title: "Dossier assurance",
    purpose: "Évaluer un risque ou sinistre avec des preuves autorisées.",
    entryActionCodes: ["request_risk_evidence", "record_insurance_decision"],
    visibleWhen: ["case.assigned", "consent.valid"],
  },
  {
    id: "node-atlas-workspace",
    code: "atlas_decision_workspace",
    actorKinds: ["ministry", "public_agency", "development_partner", "financial_institution", "insurer"],
    screenCode: "atlas_decision_workspace",
    title: "Atlas Premium",
    purpose: "Comprendre les causes, comparer les scénarios et produire une recommandation.",
    entryActionCodes: ["ask_atlas", "create_scenario", "evaluate_scenario", "generate_ministry_briefing"],
    visibleWhen: ["subscription.atlas_active", "workspace.authorized"],
    fallbackNodeCode: "government_command_center",
  },
];

const navigationTransitions: NavigationTransition[] = [
  {
    id: "transition-fisher-home-return",
    fromNodeCode: "fisher_home",
    toNodeCode: "fisher_expected_return",
    trigger: "user_action",
    triggerCode: "announce_expected_return",
    guardConditions: ["vessel.active"],
    preservesContextKeys: ["actor_id", "vessel_id", "territory_id"],
  },
  {
    id: "transition-return-home",
    fromNodeCode: "fisher_expected_return",
    toNodeCode: "fisher_home",
    trigger: "workflow_event",
    triggerCode: "expected_return.announced",
    guardConditions: [],
    preservesContextKeys: ["expected_return_id"],
    successMessage: "Retour annoncé et acteurs du site informés.",
  },
  {
    id: "transition-arrival-weighing",
    fromNodeCode: "landing_site_arrivals",
    toNodeCode: "landing_site_weighing",
    trigger: "workflow_event",
    triggerCode: "landing.confirmed",
    guardConditions: ["landing.actor_authorized"],
    preservesContextKeys: ["landing_id", "expected_return_id", "vessel_id", "owner_id"],
  },
  {
    id: "transition-market-commitments",
    fromNodeCode: "buyer_market_view",
    toNodeCode: "buyer_commitments",
    trigger: "workflow_event",
    triggerCode: "commitment.created",
    guardConditions: [],
    preservesContextKeys: ["lot_id", "commitment_id", "seller_id"],
    successMessage: "Engagement enregistré et quantité réservée.",
  },
  {
    id: "transition-notification-arrivals",
    fromNodeCode: "cooperative_command_center",
    toNodeCode: "landing_site_arrivals",
    trigger: "notification",
    triggerCode: "expected_return_near_arrival",
    guardConditions: ["actor.has_landing_site_access"],
    preservesContextKeys: ["expected_return_id", "landing_site_id"],
  },
  {
    id: "transition-government-atlas",
    fromNodeCode: "government_command_center",
    toNodeCode: "atlas_decision_workspace",
    trigger: "decision_drilldown",
    triggerCode: "explain_operational_tension",
    guardConditions: ["subscription.atlas_active"],
    preservesContextKeys: ["territory_id", "period", "signal_id", "decision_question"],
  },
  {
    id: "transition-agency-government",
    fromNodeCode: "agency_field_supervision",
    toNodeCode: "government_command_center",
    trigger: "workflow_event",
    triggerCode: "incident.escalated",
    guardConditions: ["actor.has_ministry_escalation_right"],
    preservesContextKeys: ["incident_id", "territory_id", "site_id"],
  },
  {
    id: "transition-error-recovery-home",
    fromNodeCode: "fisher_expected_return",
    toNodeCode: "fisher_home",
    trigger: "error_recovery",
    triggerCode: "return_draft_saved",
    guardConditions: [],
    preservesContextKeys: ["draft_id"],
    successMessage: "Brouillon sauvegardé; vous pourrez reprendre plus tard.",
  },
];

const notifications: NotificationDefinition[] = [
  {
    id: "notification-expected-return-announced",
    code: "expected_return_announced",
    eventType: "expected_return.announced",
    recipientActorKinds: ["cooperative", "landing_site", "logistics"],
    severity: "info",
    titleTemplate: "Retour attendu vers {{landing_site_name}}",
    bodyTemplate: "{{fisher_name}} prévoit une arrivée à {{estimated_arrival_at}}.",
    deepLinkNodeCode: "landing_site_arrivals",
    channels: ["in_app", "assisted_queue"],
    deduplicationWindowMinutes: 15,
    expiresAfterMinutes: 720,
    auditable: true,
  },
  {
    id: "notification-return-overdue",
    code: "return_overdue",
    eventType: "expected_return.overdue",
    recipientActorKinds: ["fisher", "cooperative", "landing_site"],
    severity: "warning",
    titleTemplate: "Retour en retard",
    bodyTemplate: "Le retour de {{vessel_name}} dépasse l'heure annoncée de {{delay_minutes}} minutes.",
    deepLinkNodeCode: "landing_site_arrivals",
    channels: ["in_app", "sms", "assisted_queue"],
    deduplicationWindowMinutes: 30,
    escalationAfterMinutes: 60,
    expiresAfterMinutes: 360,
    auditable: true,
  },
  {
    id: "notification-service-allocation",
    code: "service_allocation_proposed",
    eventType: "service_allocation.proposed",
    recipientActorKinds: ["logistics"],
    severity: "action_required",
    titleTemplate: "Nouvelle mission proposée",
    bodyTemplate: "Un besoin de {{service_type}} est disponible à {{location_name}}.",
    deepLinkNodeCode: "logistics_capacity",
    actionCode: "accept_service_allocation",
    channels: ["in_app", "sms"],
    deduplicationWindowMinutes: 10,
    escalationAfterMinutes: 30,
    expiresAfterMinutes: 120,
    auditable: true,
  },
  {
    id: "notification-lot-created",
    code: "lot_created",
    eventType: "lot.created",
    recipientActorKinds: ["cooperative", "buyer", "processor"],
    severity: "info",
    titleTemplate: "Nouveau lot disponible",
    bodyTemplate: "{{quantity}} kg de {{species}} sont disponibles à {{landing_site_name}}.",
    deepLinkNodeCode: "buyer_market_view",
    actionCode: "create_buyer_commitment",
    channels: ["in_app", "email"],
    deduplicationWindowMinutes: 20,
    expiresAfterMinutes: 1440,
    auditable: true,
  },
  {
    id: "notification-commitment-created",
    code: "commitment_created",
    eventType: "commitment.created",
    recipientActorKinds: ["cooperative", "fisher", "buyer", "processor", "logistics"],
    severity: "action_required",
    titleTemplate: "Engagement enregistré",
    bodyTemplate: "{{buyer_name}} s'engage sur {{quantity}} kg du lot {{lot_reference}}.",
    deepLinkNodeCode: "buyer_commitments",
    channels: ["in_app", "sms"],
    deduplicationWindowMinutes: 15,
    expiresAfterMinutes: 2880,
    auditable: true,
  },
  {
    id: "notification-incident-critical",
    code: "critical_incident",
    eventType: "incident.critical",
    recipientActorKinds: ["cooperative", "landing_site", "public_agency", "ministry"],
    severity: "critical",
    titleTemplate: "Incident critique à {{site_name}}",
    bodyTemplate: "{{incident_type}} nécessite une intervention immédiate.",
    deepLinkNodeCode: "agency_field_supervision",
    channels: ["in_app", "sms", "email", "assisted_queue"],
    deduplicationWindowMinutes: 5,
    escalationAfterMinutes: 15,
    expiresAfterMinutes: 720,
    auditable: true,
  },
  {
    id: "notification-data-quality-drop",
    code: "data_quality_drop",
    eventType: "data_quality.threshold_breached",
    recipientActorKinds: ["cooperative", "landing_site", "public_agency", "ministry"],
    severity: "warning",
    titleTemplate: "Baisse de qualité des données",
    bodyTemplate: "Le taux de complétude est tombé à {{completeness_rate}} % sur {{scope_name}}.",
    deepLinkNodeCode: "government_command_center",
    channels: ["in_app", "email"],
    deduplicationWindowMinutes: 120,
    escalationAfterMinutes: 1440,
    expiresAfterMinutes: 4320,
    auditable: true,
  },
  {
    id: "notification-atlas-signal",
    code: "atlas_emerging_signal",
    eventType: "atlas.signal_detected",
    recipientActorKinds: ["ministry", "public_agency", "development_partner"],
    severity: "warning",
    titleTemplate: "Nouveau signal détecté par Atlas",
    bodyTemplate: "{{signal_title}} — confiance {{confidence_level}}.",
    deepLinkNodeCode: "atlas_decision_workspace",
    actionCode: "ask_atlas",
    channels: ["in_app", "email"],
    deduplicationWindowMinutes: 240,
    expiresAfterMinutes: 10080,
    auditable: true,
  },
];

const dataPolicies: DataResourcePolicy[] = [
  {
    id: "policy-actor-profile",
    resourceCode: "actor_profile",
    ownerActorKinds: ["fisher", "buyer", "processor", "logistics", "cooperative"],
    readActorKinds: ["fisher", "buyer", "processor", "logistics", "cooperative", "landing_site", "public_agency"],
    writeActorKinds: ["fisher", "buyer", "processor", "logistics", "cooperative"],
    aggregateReadActorKinds: ["ministry", "public_agency", "development_partner"],
    fieldRestrictions: {
      personal_phone: ["fisher", "cooperative"],
      national_identifier: ["fisher", "cooperative", "public_agency"],
      bank_details: ["fisher", "financial_institution"],
    },
    consentRequiredFor: ["financial_institution", "insurer", "development_partner"],
    purposeLimitations: ["coordination", "verification", "authorized_financing", "authorized_insurance"],
    retentionPolicy: "Conserver tant que le compte est actif puis appliquer la politique légale d'archivage et suppression.",
    auditRequired: true,
  },
  {
    id: "policy-expected-return",
    resourceCode: "expected_return",
    ownerActorKinds: ["fisher"],
    readActorKinds: ["fisher", "cooperative", "landing_site", "logistics", "public_agency"],
    writeActorKinds: ["fisher", "cooperative"],
    aggregateReadActorKinds: ["ministry", "public_agency"],
    fieldRestrictions: {
      exact_position: ["fisher", "cooperative", "public_agency"],
    },
    consentRequiredFor: [],
    purposeLimitations: ["arrival_coordination", "safety", "capacity_planning"],
    retentionPolicy: "Historiser avec précision réduite après clôture opérationnelle.",
    auditRequired: true,
  },
  {
    id: "policy-landing",
    resourceCode: "landing",
    ownerActorKinds: ["fisher", "landing_site"],
    readActorKinds: ["fisher", "landing_site", "cooperative", "buyer", "processor", "public_agency"],
    writeActorKinds: ["landing_site", "cooperative"],
    aggregateReadActorKinds: ["ministry", "public_agency", "development_partner"],
    fieldRestrictions: {},
    consentRequiredFor: ["development_partner"],
    purposeLimitations: ["traceability", "operations", "public_monitoring", "program_evaluation"],
    retentionPolicy: "Conservation longue pour traçabilité et preuve d'activité.",
    auditRequired: true,
  },
  {
    id: "policy-weighing",
    resourceCode: "weighing",
    ownerActorKinds: ["fisher", "landing_site"],
    readActorKinds: ["fisher", "landing_site", "cooperative", "buyer", "processor", "public_agency"],
    writeActorKinds: ["landing_site"],
    aggregateReadActorKinds: ["ministry", "public_agency", "development_partner"],
    fieldRestrictions: {
      correction_reason: ["landing_site", "cooperative", "public_agency"],
    },
    consentRequiredFor: ["development_partner"],
    purposeLimitations: ["traceability", "commercial_coordination", "official_statistics"],
    retentionPolicy: "Conservation longue; toute correction reste historisée.",
    auditRequired: true,
  },
  {
    id: "policy-lot",
    resourceCode: "lot",
    ownerActorKinds: ["fisher", "cooperative"],
    readActorKinds: ["fisher", "cooperative", "landing_site", "buyer", "processor", "logistics", "public_agency"],
    writeActorKinds: ["cooperative", "landing_site"],
    aggregateReadActorKinds: ["ministry", "public_agency", "development_partner"],
    fieldRestrictions: {
      seller_contact: ["fisher", "cooperative", "buyer", "processor"],
    },
    consentRequiredFor: [],
    purposeLimitations: ["commercial_coordination", "traceability", "market_visibility"],
    retentionPolicy: "Conserver sur toute la durée de vie du lot et pour l'historique de traçabilité.",
    auditRequired: true,
  },
  {
    id: "policy-service-need",
    resourceCode: "service_need",
    ownerActorKinds: ["fisher", "cooperative", "landing_site", "buyer"],
    readActorKinds: ["fisher", "cooperative", "landing_site", "buyer", "logistics", "public_agency"],
    writeActorKinds: ["fisher", "cooperative", "landing_site", "buyer"],
    aggregateReadActorKinds: ["ministry", "public_agency"],
    fieldRestrictions: {},
    consentRequiredFor: [],
    purposeLimitations: ["service_coordination", "capacity_planning"],
    retentionPolicy: "Conserver pour mesurer la couverture et les délais de service.",
    auditRequired: true,
  },
  {
    id: "policy-service-capacity",
    resourceCode: "service_capacity",
    ownerActorKinds: ["logistics"],
    readActorKinds: ["logistics", "cooperative", "landing_site", "buyer", "public_agency"],
    writeActorKinds: ["logistics"],
    aggregateReadActorKinds: ["ministry", "public_agency"],
    fieldRestrictions: {
      commercial_terms: ["logistics", "buyer", "cooperative"],
    },
    consentRequiredFor: [],
    purposeLimitations: ["allocation", "territorial_capacity_analysis"],
    retentionPolicy: "Archiver les capacités expirées pour analyse de fiabilité.",
    auditRequired: true,
  },
  {
    id: "policy-commitment",
    resourceCode: "commitment",
    ownerActorKinds: ["buyer", "processor", "fisher", "cooperative"],
    readActorKinds: ["buyer", "processor", "fisher", "cooperative", "logistics", "public_agency"],
    writeActorKinds: ["buyer", "processor", "cooperative"],
    aggregateReadActorKinds: ["ministry", "public_agency"],
    fieldRestrictions: {
      negotiated_price: ["buyer", "processor", "fisher", "cooperative"],
      payment_terms: ["buyer", "processor", "fisher", "cooperative", "financial_institution"],
    },
    consentRequiredFor: ["financial_institution", "development_partner"],
    purposeLimitations: ["transaction_execution", "market_analysis", "authorized_financing"],
    retentionPolicy: "Conservation longue pour preuve contractuelle et analyse agrégée.",
    auditRequired: true,
  },
  {
    id: "policy-incident",
    resourceCode: "incident",
    ownerActorKinds: ["fisher", "cooperative", "landing_site", "buyer", "processor", "logistics", "public_agency"],
    readActorKinds: ["fisher", "cooperative", "landing_site", "buyer", "processor", "logistics", "public_agency", "ministry"],
    writeActorKinds: ["fisher", "cooperative", "landing_site", "buyer", "processor", "logistics", "public_agency"],
    aggregateReadActorKinds: ["ministry", "public_agency", "development_partner", "insurer"],
    fieldRestrictions: {
      personal_statement: ["fisher", "cooperative", "public_agency"],
      investigation_notes: ["public_agency", "ministry"],
    },
    consentRequiredFor: ["insurer", "development_partner"],
    purposeLimitations: ["resolution", "safety", "public_supervision", "authorized_insurance"],
    retentionPolicy: "Conserver selon criticité; anonymiser pour les analyses historiques non opérationnelles.",
    auditRequired: true,
  },
  {
    id: "policy-program",
    resourceCode: "program",
    ownerActorKinds: ["development_partner", "ministry", "public_agency"],
    readActorKinds: ["development_partner", "ministry", "public_agency", "cooperative", "fisher"],
    writeActorKinds: ["development_partner", "ministry", "public_agency"],
    aggregateReadActorKinds: ["ministry", "development_partner"],
    fieldRestrictions: {
      budget_details: ["development_partner", "ministry", "public_agency"],
    },
    consentRequiredFor: ["development_partner"],
    purposeLimitations: ["program_delivery", "beneficiary_management", "impact_evaluation"],
    retentionPolicy: "Conserver pendant le programme puis selon les obligations du bailleur et de l'institution.",
    auditRequired: true,
  },
  {
    id: "policy-financing-case",
    resourceCode: "financing_case",
    ownerActorKinds: ["fisher", "cooperative", "financial_institution"],
    readActorKinds: ["fisher", "cooperative", "financial_institution"],
    writeActorKinds: ["financial_institution"],
    aggregateReadActorKinds: ["ministry"],
    fieldRestrictions: {
      credit_decision_reason: ["financial_institution"],
      personal_financial_data: ["fisher", "financial_institution"],
    },
    consentRequiredFor: ["financial_institution"],
    purposeLimitations: ["financing_assessment_only"],
    retentionPolicy: "Conserver conformément aux obligations financières applicables puis supprimer ou anonymiser.",
    auditRequired: true,
  },
  {
    id: "policy-insurance-case",
    resourceCode: "insurance_case",
    ownerActorKinds: ["fisher", "cooperative", "insurer"],
    readActorKinds: ["fisher", "cooperative", "insurer"],
    writeActorKinds: ["insurer"],
    aggregateReadActorKinds: ["ministry"],
    fieldRestrictions: {
      underwriting_decision_reason: ["insurer"],
      claim_documents: ["fisher", "cooperative", "insurer"],
    },
    consentRequiredFor: ["insurer"],
    purposeLimitations: ["underwriting_or_claim_management_only"],
    retentionPolicy: "Conserver selon les obligations d'assurance puis supprimer ou anonymiser.",
    auditRequired: true,
  },
  {
    id: "policy-operational-metric",
    resourceCode: "operational_metric",
    ownerActorKinds: ["ministry", "public_agency"],
    readActorKinds: ["ministry", "public_agency", "development_partner", "cooperative", "landing_site"],
    writeActorKinds: ["public_agency", "ministry"],
    aggregateReadActorKinds: ["ministry", "public_agency", "development_partner"],
    fieldRestrictions: {},
    consentRequiredFor: ["development_partner"],
    purposeLimitations: ["public_monitoring", "program_evaluation", "service_improvement"],
    retentionPolicy: "Conservation historique sous forme agrégée et versionnée.",
    auditRequired: true,
  },
  {
    id: "policy-atlas-insight",
    resourceCode: "atlas_insight",
    ownerActorKinds: ["ministry", "public_agency", "development_partner", "financial_institution", "insurer"],
    readActorKinds: ["ministry", "public_agency", "development_partner", "financial_institution", "insurer"],
    writeActorKinds: ["ministry", "public_agency", "development_partner", "financial_institution", "insurer"],
    aggregateReadActorKinds: [],
    fieldRestrictions: {
      source_evidence: ["ministry", "public_agency", "development_partner", "financial_institution", "insurer"],
    },
    consentRequiredFor: ["financial_institution", "insurer", "development_partner"],
    purposeLimitations: ["authorized_decision_support", "no_automatic_adverse_decision"],
    retentionPolicy: "Versionner les insights et conserver leurs sources, hypothèses et décisions associées.",
    auditRequired: true,
  },
];

export function getMvpProductBehaviorBundle(): ProductBehaviorBundle {
  return {
    navigationNodes: structuredClone(navigationNodes),
    navigationTransitions: structuredClone(navigationTransitions),
    notifications: structuredClone(notifications),
    dataPolicies: structuredClone(dataPolicies),
  };
}

export function resolveVisibleNavigation(actorKind: MvpActorKind, satisfiedConditions: string[]) {
  const conditions = new Set(satisfiedConditions);
  return navigationNodes
    .filter((node) => node.actorKinds.includes(actorKind))
    .filter((node) => node.visibleWhen.every((condition) => conditions.has(condition)))
    .map((node) => structuredClone(node));
}

export function resolveNotifications(eventType: string, recipientActorKind: MvpActorKind) {
  return notifications
    .filter((notification) => notification.eventType === eventType)
    .filter((notification) => notification.recipientActorKinds.includes(recipientActorKind))
    .map((notification) => structuredClone(notification));
}

export function canAccessResource(input: {
  actorKind: MvpActorKind;
  resourceCode: DataResourcePolicy["resourceCode"];
  mode: "read" | "write" | "aggregate_read";
  field?: string;
  hasConsent?: boolean;
}) {
  const policy = dataPolicies.find((item) => item.resourceCode === input.resourceCode);
  if (!policy) {
    return { allowed: false, reason: "Aucune politique de visibilité n'est définie." };
  }

  const allowedActors =
    input.mode === "read"
      ? policy.readActorKinds
      : input.mode === "write"
        ? policy.writeActorKinds
        : policy.aggregateReadActorKinds;

  if (!allowedActors.includes(input.actorKind)) {
    return { allowed: false, reason: "Ce type d'acteur n'est pas autorisé pour cette opération." };
  }

  if (policy.consentRequiredFor.includes(input.actorKind) && !input.hasConsent) {
    return { allowed: false, reason: "Un consentement valide est requis." };
  }

  if (input.field) {
    const fieldActors = policy.fieldRestrictions[input.field];
    if (fieldActors && !fieldActors.includes(input.actorKind)) {
      return { allowed: false, reason: "Ce champ est restreint pour cet acteur." };
    }
  }

  return {
    allowed: true,
    reason: "Accès autorisé selon le rôle, le but et le consentement applicables.",
    purposeLimitations: [...policy.purposeLimitations],
    auditRequired: policy.auditRequired,
  };
}

export function validateMvpProductBehaviorBundle() {
  const errors: string[] = [];
  const nodeCodes = new Set(navigationNodes.map((item) => item.code));

  for (const transition of navigationTransitions) {
    if (!nodeCodes.has(transition.fromNodeCode)) {
      errors.push(`Transition ${transition.id}: nœud source introuvable ${transition.fromNodeCode}.`);
    }
    if (!nodeCodes.has(transition.toNodeCode)) {
      errors.push(`Transition ${transition.id}: nœud cible introuvable ${transition.toNodeCode}.`);
    }
  }

  for (const notification of notifications) {
    if (!nodeCodes.has(notification.deepLinkNodeCode)) {
      errors.push(`Notification ${notification.code}: deep link introuvable ${notification.deepLinkNodeCode}.`);
    }
    if (notification.severity === "critical" && !notification.escalationAfterMinutes) {
      errors.push(`Notification ${notification.code}: une alerte critique doit définir une escalade.`);
    }
  }

  const protectedResources: DataResourcePolicy["resourceCode"][] = [
    "actor_profile",
    "commitment",
    "incident",
    "financing_case",
    "insurance_case",
    "atlas_insight",
  ];

  for (const resourceCode of protectedResources) {
    const policy = dataPolicies.find((item) => item.resourceCode === resourceCode);
    if (!policy) errors.push(`Politique de données manquante pour ${resourceCode}.`);
    else if (!policy.auditRequired) errors.push(`La ressource ${resourceCode} doit être auditée.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      navigationNodeCount: navigationNodes.length,
      transitionCount: navigationTransitions.length,
      notificationCount: notifications.length,
      dataPolicyCount: dataPolicies.length,
      actorKindsCovered: [...new Set(navigationNodes.flatMap((item) => item.actorKinds))],
      generatedAt: new Date().toISOString() as ISODateTime,
    },
  };
}
