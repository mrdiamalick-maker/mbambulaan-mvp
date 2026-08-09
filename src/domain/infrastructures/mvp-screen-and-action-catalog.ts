import type { EntityId } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";
import type { MbambulaanProductCode } from "./mbambulaan-product-system";

export interface MvpScreenCatalogItem {
  id: EntityId;
  code: string;
  name: string;
  actorKind: MvpActorKind;
  productCode: MbambulaanProductCode;
  purpose: string;
  sections: string[];
  actionCodes: string[];
  emptyState: string;
  errorState: string;
  demoNarrative: string;
  ministryValue?: string[];
  atlasPremiumValue?: string[];
}

export interface MvpActionCatalogItem {
  id: EntityId;
  code: string;
  name: string;
  actorKinds: MvpActorKind[];
  capabilityCodes: string[];
  workflowCode?: string;
  requiredInputs: string[];
  validations: string[];
  successOutputs: string[];
  emittedEvents: string[];
  failureRecovery: string[];
  auditable: boolean;
}

export interface MvpDashboardCatalogItem {
  id: EntityId;
  code: string;
  name: string;
  actorKind: MvpActorKind;
  productCode: MbambulaanProductCode;
  kpiCodes: string[];
  alertCodes: string[];
  decisionQuestions: string[];
  drillDownTargets: string[];
  demonstrationOrder: number;
}

export interface MvpScreenAndActionCatalogData {
  screens: MvpScreenCatalogItem[];
  actions: MvpActionCatalogItem[];
  dashboards: MvpDashboardCatalogItem[];
}

const screens: MvpScreenCatalogItem[] = [
  {
    id: "screen-fisher-home",
    code: "fisher_home",
    name: "Accueil pêcheur",
    actorKind: "fisher",
    productCode: "fisher",
    purpose: "Donner au pêcheur une vue immédiate sur sa prochaine action utile.",
    sections: ["prochain retour", "besoins ouverts", "derniers débarquements", "historique récent"],
    actionCodes: ["announce_expected_return", "request_service", "review_activity_history"],
    emptyState: "Aucune activité en cours. Le pêcheur peut déclarer un prochain retour.",
    errorState: "Les données ne sont pas disponibles. Une reprise assistée est proposée.",
    demoNarrative: "Le pêcheur comprend en quelques secondes ce qu'il doit faire et ce qui est déjà enregistré.",
  },
  {
    id: "screen-fisher-return",
    code: "fisher_expected_return",
    name: "Déclarer un retour attendu",
    actorKind: "fisher",
    productCode: "fisher",
    purpose: "Prévenir les acteurs du site avant l'arrivée.",
    sections: ["heure estimée", "site d'arrivée", "besoins de service", "commentaire"],
    actionCodes: ["announce_expected_return"],
    emptyState: "Aucun retour déclaré.",
    errorState: "Le retour n'a pas été enregistré. Les données restent sauvegardées localement.",
    demoNarrative: "L'annonce déclenche la coordination avant le débarquement.",
  },
  {
    id: "screen-fisher-history",
    code: "fisher_history",
    name: "Historique d'activité",
    actorKind: "fisher",
    productCode: "fisher",
    purpose: "Donner au pêcheur une preuve simple de son activité.",
    sections: ["voyages", "débarquements", "pesées", "lots", "engagements", "incidents"],
    actionCodes: ["review_activity_history", "share_activity_evidence"],
    emptyState: "L'historique apparaîtra après la première opération.",
    errorState: "L'historique est momentanément indisponible.",
    demoNarrative: "Le pêcheur dispose enfin d'un historique exploitable auprès d'un GIE, financeur ou assureur.",
  },
  {
    id: "screen-cooperative-command",
    code: "cooperative_command_center",
    name: "Centre de coordination GIE",
    actorKind: "cooperative",
    productCode: "cooperative",
    purpose: "Coordonner les membres, retours, besoins et incidents.",
    sections: ["membres actifs", "retours attendus", "besoins non couverts", "incidents", "lots à valider"],
    actionCodes: ["validate_lot", "assign_incident", "coordinate_service_need", "approve_member"],
    emptyState: "Aucune opération active.",
    errorState: "Le centre de coordination affiche les dernières données synchronisées.",
    demoNarrative: "Le GIE devient un véritable acteur de coordination et non un simple annuaire.",
  },
  {
    id: "screen-landing-arrivals",
    code: "landing_site_arrivals",
    name: "Arrivées et capacité du site",
    actorKind: "landing_site",
    productCode: "cooperative",
    purpose: "Anticiper les arrivées et organiser les ressources du site.",
    sections: ["retours attendus", "retards", "postes disponibles", "glace", "manutention", "alertes capacité"],
    actionCodes: ["confirm_landing", "register_weighing", "coordinate_service_need", "report_tension"],
    emptyState: "Aucune arrivée prévue sur la période.",
    errorState: "Les dernières prévisions connues restent affichées.",
    demoNarrative: "Le site passe d'une gestion réactive à une gestion anticipée.",
    ministryValue: ["charge du site", "tensions", "délais", "volumes"],
  },
  {
    id: "screen-landing-weighing",
    code: "landing_site_weighing",
    name: "Pesée et création de lot",
    actorKind: "landing_site",
    productCode: "cooperative",
    purpose: "Fiabiliser le volume débarqué et préparer sa valorisation.",
    sections: ["voyage", "propriétaire", "espèce", "poids brut", "poids net", "qualité déclarée"],
    actionCodes: ["register_weighing", "create_lot"],
    emptyState: "Aucune capture prête à être pesée.",
    errorState: "La pesée est conservée en brouillon jusqu'à validation.",
    demoNarrative: "La donnée de référence naît au quai et alimente tout le reste du système.",
  },
  {
    id: "screen-buyer-market",
    code: "buyer_market_view",
    name: "Lots disponibles",
    actorKind: "buyer",
    productCode: "business",
    purpose: "Trouver rapidement des lots fiables et disponibles.",
    sections: ["filtres", "lots", "origine", "quantité", "qualité", "vendeur", "disponibilité"],
    actionCodes: ["create_buyer_commitment", "request_information"],
    emptyState: "Aucun lot ne correspond aux critères actuels.",
    errorState: "Les lots affichés sont les derniers lots synchronisés.",
    demoNarrative: "L'acheteur ne voit pas une marketplace anonyme, mais une offre traçable reliée aux opérations réelles.",
  },
  {
    id: "screen-buyer-commitments",
    code: "buyer_commitments",
    name: "Mes engagements",
    actorKind: "buyer",
    productCode: "business",
    purpose: "Suivre les engagements jusqu'à réception.",
    sections: ["en attente", "confirmés", "en transport", "reçus", "litiges"],
    actionCodes: ["confirm_lot_reception", "report_delivery_issue", "cancel_commitment"],
    emptyState: "Aucun engagement actif.",
    errorState: "Le statut sera rafraîchi dès le retour de connexion.",
    demoNarrative: "Chaque promesse commerciale devient suivie et auditable.",
  },
  {
    id: "screen-processor-plan",
    code: "processor_supply_plan",
    name: "Plan d'approvisionnement",
    actorKind: "processor",
    productCode: "business",
    purpose: "Comparer besoins de production et offre attendue.",
    sections: ["besoins", "offre disponible", "offre attendue", "écarts", "risques"],
    actionCodes: ["publish_processing_need", "create_buyer_commitment", "trace_processed_input"],
    emptyState: "Aucun besoin de production planifié.",
    errorState: "Les besoins restent disponibles et peuvent être modifiés hors ligne.",
    demoNarrative: "Le transformateur sécurise son approvisionnement avant la rupture.",
    atlasPremiumValue: ["prévision", "scénarios", "risques d'approvisionnement"],
  },
  {
    id: "screen-logistics-capacity",
    code: "logistics_capacity",
    name: "Capacités et missions",
    actorKind: "logistics",
    productCode: "business",
    purpose: "Déclarer les capacités et exécuter les missions affectées.",
    sections: ["capacités disponibles", "missions proposées", "missions acceptées", "preuves d'exécution"],
    actionCodes: ["declare_service_capacity", "accept_service_allocation", "confirm_service_execution"],
    emptyState: "Aucune mission active.",
    errorState: "La confirmation sera synchronisée dès que possible.",
    demoNarrative: "La capacité logistique devient visible, mobilisable et mesurable.",
  },
  {
    id: "screen-government-command",
    code: "government_command_center",
    name: "Mbàmbulaan Government",
    actorKind: "ministry",
    productCode: "government",
    purpose: "Piloter l'activité du territoire avec des données opérationnelles fiables.",
    sections: ["activité globale", "sites", "volumes", "tensions", "incidents", "services", "engagements", "qualité des données"],
    actionCodes: ["open_operational_drilldown", "generate_ministry_briefing", "record_public_decision"],
    emptyState: "Le territoire pilote n'a pas encore généré d'activité.",
    errorState: "Les derniers indicateurs validés restent disponibles.",
    demoNarrative: "Le ministère voit ce qui se passe, où, pourquoi et avec quelles conséquences.",
    ministryValue: ["pilotage", "priorisation", "redevabilité", "coordination interservices"],
    atlasPremiumValue: ["explication causale", "scénarios", "briefing"],
  },
  {
    id: "screen-agency-supervision",
    code: "agency_field_supervision",
    name: "Supervision des sites",
    actorKind: "public_agency",
    productCode: "government",
    purpose: "Prioriser les interventions terrain et suivre leur résolution.",
    sections: ["sites prioritaires", "anomalies", "incidents", "actions assignées", "résolutions"],
    actionCodes: ["assign_field_action", "validate_resolution", "escalate_to_ministry"],
    emptyState: "Aucune intervention prioritaire.",
    errorState: "Les dernières priorités calculées restent visibles.",
    demoNarrative: "L'agence transforme la donnée en action de terrain.",
  },
  {
    id: "screen-development-program",
    code: "development_program_workspace",
    name: "Suivi de programme",
    actorKind: "development_partner",
    productCode: "development",
    purpose: "Relier financement, bénéficiaires, engagements et résultats.",
    sections: ["programmes", "bénéficiaires", "engagements", "exécution", "indicateurs", "résultats"],
    actionCodes: ["publish_program", "approve_beneficiary", "record_program_commitment", "record_program_outcome"],
    emptyState: "Aucun programme actif.",
    errorState: "Les données de programme restent disponibles en lecture seule.",
    demoNarrative: "Le partenaire voit enfin la chaîne complète entre financement et résultat observé.",
    ministryValue: ["alignement des programmes", "résultats territoriaux"],
    atlasPremiumValue: ["impact", "ciblage", "attribution"],
  },
  {
    id: "screen-finance-case",
    code: "finance_case_assessment",
    name: "Dossier de financement",
    actorKind: "financial_institution",
    productCode: "finance",
    purpose: "Évaluer un dossier à partir de preuves d'activité autorisées.",
    sections: ["identité", "activité", "engagements", "incidents", "régularité", "documents", "décision"],
    actionCodes: ["request_activity_evidence", "record_financing_decision"],
    emptyState: "Aucun dossier soumis.",
    errorState: "Les éléments validés restent visibles; les données sensibles non synchronisées sont masquées.",
    demoNarrative: "Le financeur passe d'un dossier déclaratif à un dossier documenté.",
    atlasPremiumValue: ["score explicable", "simulation de risque"],
  },
  {
    id: "screen-insurance-risk",
    code: "insurance_risk_assessment",
    name: "Évaluation du risque",
    actorKind: "insurer",
    productCode: "finance",
    purpose: "Analyser un contrat ou sinistre avec des données opérationnelles autorisées.",
    sections: ["profil", "flotte", "activité", "incidents", "exposition", "preuves", "décision"],
    actionCodes: ["request_risk_evidence", "record_insurance_decision"],
    emptyState: "Aucun dossier d'assurance actif.",
    errorState: "Les données non validées sont explicitement signalées.",
    demoNarrative: "L'assureur dispose d'un risque mieux documenté sans accéder à des données non autorisées.",
    atlasPremiumValue: ["profil dynamique", "concentration du risque"],
  },
  {
    id: "screen-atlas-workspace",
    code: "atlas_decision_workspace",
    name: "Atlas Decision Workspace",
    actorKind: "ministry",
    productCode: "atlas",
    purpose: "Expliquer les tensions, comparer les scénarios et générer un briefing.",
    sections: ["question", "preuves", "insights", "causalité", "scénarios", "recommandation", "briefing"],
    actionCodes: ["ask_atlas", "create_scenario", "evaluate_scenario", "generate_ministry_briefing"],
    emptyState: "Posez une question à partir des opérations du pilote.",
    errorState: "Atlas distingue clairement les données indisponibles des hypothèses.",
    demoNarrative: "Atlas apparaît comme une couche premium de décision, jamais comme le produit entier.",
    atlasPremiumValue: ["causalité", "scénarios", "recommandations", "briefing décisionnel"],
  },
];

const actions: MvpActionCatalogItem[] = [
  {
    id: "action-announce-return",
    code: "announce_expected_return",
    name: "Annoncer un retour attendu",
    actorKinds: ["fisher"],
    capabilityCodes: ["expected_return", "coordination"],
    workflowCode: "expected_return_to_landing",
    requiredInputs: ["vessel_id", "landing_site_id", "estimated_arrival_at"],
    validations: ["acteur autorisé", "pirogue active", "site actif", "date future cohérente"],
    successOutputs: ["retour attendu créé", "acteurs du site notifiés"],
    emittedEvents: ["expected_return.announced"],
    failureRecovery: ["sauvegarde brouillon", "correction assistée", "synchronisation différée"],
    auditable: true,
  },
  {
    id: "action-confirm-landing",
    code: "confirm_landing",
    name: "Confirmer un débarquement",
    actorKinds: ["landing_site", "cooperative"],
    capabilityCodes: ["landing", "traceability"],
    workflowCode: "expected_return_to_landing",
    requiredInputs: ["expected_return_id", "actual_arrival_at"],
    validations: ["retour existant", "site cohérent", "agent autorisé"],
    successOutputs: ["débarquement confirmé", "écart de temps calculé"],
    emittedEvents: ["landing.confirmed"],
    failureRecovery: ["création manuelle contrôlée", "signalement d'écart"],
    auditable: true,
  },
  {
    id: "action-register-weighing",
    code: "register_weighing",
    name: "Enregistrer une pesée",
    actorKinds: ["landing_site"],
    capabilityCodes: ["weighing", "traceability", "data_quality"],
    workflowCode: "landing_to_weighing",
    requiredInputs: ["landing_id", "species", "gross_weight", "net_weight"],
    validations: ["poids positif", "poids net inférieur ou égal au brut", "espèce renseignée"],
    successOutputs: ["pesée de référence", "volume consolidé"],
    emittedEvents: ["weighing.registered"],
    failureRecovery: ["brouillon", "double validation", "annulation tracée"],
    auditable: true,
  },
  {
    id: "action-create-lot",
    code: "create_lot",
    name: "Créer un lot",
    actorKinds: ["landing_site", "cooperative"],
    capabilityCodes: ["lot_creation", "traceability"],
    workflowCode: "weighing_to_lot",
    requiredInputs: ["weighing_ids", "owner_id", "available_quantity"],
    validations: ["pesées disponibles", "quantité cohérente", "propriétaire identifié"],
    successOutputs: ["lot traçable", "offre disponible"],
    emittedEvents: ["lot.created"],
    failureRecovery: ["lot en brouillon", "correction de quantité", "fusion contrôlée"],
    auditable: true,
  },
  {
    id: "action-request-service",
    code: "request_service",
    name: "Créer un besoin de service",
    actorKinds: ["fisher", "landing_site", "cooperative", "buyer"],
    capabilityCodes: ["service_need", "coordination"],
    workflowCode: "service_need_to_execution",
    requiredInputs: ["service_type", "location_id", "required_at", "quantity"],
    validations: ["besoin cohérent", "lieu valide", "délai réaliste"],
    successOutputs: ["besoin publié", "capacités compatibles recherchées"],
    emittedEvents: ["service_need.created"],
    failureRecovery: ["mise en attente", "modification", "annulation"],
    auditable: true,
  },
  {
    id: "action-declare-capacity",
    code: "declare_service_capacity",
    name: "Déclarer une capacité de service",
    actorKinds: ["logistics"],
    capabilityCodes: ["capacity", "allocation"],
    requiredInputs: ["service_type", "territory_id", "available_from", "available_to", "quantity"],
    validations: ["prestataire actif", "capacité positive", "période valide"],
    successOutputs: ["capacité disponible", "besoins compatibles identifiés"],
    emittedEvents: ["capacity.declared"],
    failureRecovery: ["correction", "suspension", "expiration automatique"],
    auditable: true,
  },
  {
    id: "action-accept-allocation",
    code: "accept_service_allocation",
    name: "Accepter une allocation",
    actorKinds: ["logistics"],
    capabilityCodes: ["allocation", "coordination"],
    workflowCode: "service_need_to_execution",
    requiredInputs: ["allocation_id"],
    validations: ["allocation active", "capacité toujours disponible"],
    successOutputs: ["mission acceptée", "demandeur informé"],
    emittedEvents: ["service_allocation.accepted"],
    failureRecovery: ["refus motivé", "réallocation automatique"],
    auditable: true,
  },
  {
    id: "action-confirm-service",
    code: "confirm_service_execution",
    name: "Confirmer l'exécution d'un service",
    actorKinds: ["logistics", "landing_site", "cooperative"],
    capabilityCodes: ["service_execution", "proof"],
    workflowCode: "service_need_to_execution",
    requiredInputs: ["allocation_id", "completed_at"],
    validations: ["mission acceptée", "acteur autorisé"],
    successOutputs: ["preuve d'exécution", "besoin clôturé"],
    emittedEvents: ["service_execution.confirmed"],
    failureRecovery: ["signalement partiel", "incident", "correction validée"],
    auditable: true,
  },
  {
    id: "action-create-commitment",
    code: "create_buyer_commitment",
    name: "Créer un engagement acheteur",
    actorKinds: ["buyer", "processor"],
    capabilityCodes: ["commitment", "transaction"],
    workflowCode: "lot_to_buyer_commitment",
    requiredInputs: ["lot_id", "quantity", "terms"],
    validations: ["lot disponible", "quantité suffisante", "acheteur actif"],
    successOutputs: ["engagement créé", "quantité réservée"],
    emittedEvents: ["commitment.created"],
    failureRecovery: ["contre-proposition", "annulation", "remise en disponibilité"],
    auditable: true,
  },
  {
    id: "action-confirm-reception",
    code: "confirm_lot_reception",
    name: "Confirmer la réception d'un lot",
    actorKinds: ["buyer", "processor"],
    capabilityCodes: ["transaction", "outcome", "traceability"],
    requiredInputs: ["commitment_id", "received_quantity", "received_at"],
    validations: ["engagement actif", "quantité cohérente"],
    successOutputs: ["engagement exécuté", "transaction clôturée"],
    emittedEvents: ["lot.reception_confirmed"],
    failureRecovery: ["écart déclaré", "litige", "réception partielle"],
    auditable: true,
  },
  {
    id: "action-report-issue",
    code: "report_delivery_issue",
    name: "Signaler un incident de livraison",
    actorKinds: ["buyer", "processor", "logistics"],
    capabilityCodes: ["tension_reporting", "incident_management"],
    workflowCode: "incident_to_resolution",
    requiredInputs: ["reference_id", "issue_type", "description"],
    validations: ["référence existante", "catégorie valide"],
    successOutputs: ["incident ouvert", "responsable assigné"],
    emittedEvents: ["incident.reported"],
    failureRecovery: ["complément demandé", "reclassement", "fermeture motivée"],
    auditable: true,
  },
  {
    id: "action-generate-briefing",
    code: "generate_ministry_briefing",
    name: "Générer un briefing ministère",
    actorKinds: ["ministry", "public_agency", "development_partner"],
    capabilityCodes: ["briefing", "decision_intelligence", "operational_metrics"],
    requiredInputs: ["territory_id", "period", "decision_question"],
    validations: ["périmètre autorisé", "données suffisantes ou limites explicites"],
    successOutputs: ["faits", "risques", "causes", "scénarios", "actions possibles"],
    emittedEvents: ["briefing.generated"],
    failureRecovery: ["briefing partiel", "sources manquantes signalées", "réexécution"],
    auditable: true,
  },
  {
    id: "action-publish-program",
    code: "publish_program",
    name: "Publier un programme",
    actorKinds: ["development_partner", "ministry", "public_agency"],
    capabilityCodes: ["program_management", "ecosystem_coordination"],
    requiredInputs: ["program_name", "objectives", "territories", "eligibility"],
    validations: ["organisation vérifiée", "objectifs définis", "territoire valide"],
    successOutputs: ["programme actif", "bénéficiaires éligibles"],
    emittedEvents: ["program.published"],
    failureRecovery: ["programme en brouillon", "correction", "suspension"],
    auditable: true,
  },
  {
    id: "action-financing-decision",
    code: "record_financing_decision",
    name: "Enregistrer une décision de financement",
    actorKinds: ["financial_institution"],
    capabilityCodes: ["financing", "decision", "audit"],
    requiredInputs: ["case_id", "decision", "reason"],
    validations: ["dossier autorisé", "décision motivée"],
    successOutputs: ["décision tracée", "demandeur informé selon consentement"],
    emittedEvents: ["financing.decision_recorded"],
    failureRecovery: ["demande de complément", "révision", "annulation motivée"],
    auditable: true,
  },
  {
    id: "action-insurance-decision",
    code: "record_insurance_decision",
    name: "Enregistrer une décision d'assurance",
    actorKinds: ["insurer"],
    capabilityCodes: ["insurance", "decision", "audit"],
    requiredInputs: ["case_id", "decision", "reason"],
    validations: ["dossier autorisé", "décision motivée"],
    successOutputs: ["décision tracée", "profil mis à jour"],
    emittedEvents: ["insurance.decision_recorded"],
    failureRecovery: ["demande de complément", "révision", "annulation motivée"],
    auditable: true,
  },
];

const dashboards: MvpDashboardCatalogItem[] = [
  {
    id: "dashboard-fisher",
    code: "fisher_dashboard",
    name: "Tableau de bord pêcheur",
    actorKind: "fisher",
    productCode: "fisher",
    kpiCodes: ["returns_announced", "landings_confirmed", "lots_created", "commitments_completed"],
    alertCodes: ["return_overdue", "service_uncovered", "commitment_issue"],
    decisionQuestions: ["Que dois-je faire maintenant ?", "Mon activité est-elle correctement enregistrée ?"],
    drillDownTargets: ["retour", "débarquement", "lot", "engagement"],
    demonstrationOrder: 1,
  },
  {
    id: "dashboard-cooperative",
    code: "cooperative_dashboard",
    name: "Tableau de bord GIE",
    actorKind: "cooperative",
    productCode: "cooperative",
    kpiCodes: ["active_members", "expected_returns", "service_fulfillment_rate", "open_incidents", "lots_available"],
    alertCodes: ["member_inactive", "site_capacity_tension", "unresolved_incident"],
    decisionQuestions: ["Quels membres ont besoin d'aide ?", "Où intervenir aujourd'hui ?"],
    drillDownTargets: ["membre", "site", "service", "incident", "lot"],
    demonstrationOrder: 2,
  },
  {
    id: "dashboard-buyer",
    code: "buyer_dashboard",
    name: "Tableau de bord acheteur",
    actorKind: "buyer",
    productCode: "business",
    kpiCodes: ["matching_lots", "active_commitments", "reception_rate", "dispute_rate"],
    alertCodes: ["lot_at_risk", "delivery_delay", "quality_issue"],
    decisionQuestions: ["Quels lots sécuriser ?", "Quels engagements sont à risque ?"],
    drillDownTargets: ["lot", "engagement", "livraison", "litige"],
    demonstrationOrder: 3,
  },
  {
    id: "dashboard-government",
    code: "government_dashboard",
    name: "Tableau de bord ministère",
    actorKind: "ministry",
    productCode: "government",
    kpiCodes: [
      "active_users",
      "weekly_active_organizations",
      "landings_confirmed",
      "weighings_registered",
      "service_needs_fulfilled",
      "commitments_completed",
      "data_completeness_rate",
      "coordination_lead_time_hours",
    ],
    alertCodes: ["site_saturation", "data_quality_drop", "incident_cluster", "service_gap", "commitment_failure"],
    decisionQuestions: ["Où sont les tensions ?", "Quelles causes expliquent les écarts ?", "Quelle action publique prioriser ?"],
    drillDownTargets: ["territoire", "site", "organisation", "flux", "incident", "programme"],
    demonstrationOrder: 4,
  },
  {
    id: "dashboard-atlas",
    code: "atlas_dashboard",
    name: "Atlas Premium",
    actorKind: "ministry",
    productCode: "atlas",
    kpiCodes: ["signals_detected", "causal_paths_explained", "scenarios_evaluated", "briefings_generated"],
    alertCodes: ["emerging_risk", "causal_breakpoint", "policy_tradeoff"],
    decisionQuestions: ["Pourquoi cela se produit ?", "Que se passe-t-il si nous intervenons ?", "Quelle option est la plus robuste ?"],
    drillDownTargets: ["signal", "preuve", "cause", "scénario", "recommandation"],
    demonstrationOrder: 5,
  },
];

export function getMvpScreenAndActionCatalog(): MvpScreenAndActionCatalogData {
  return {
    screens: structuredClone(screens),
    actions: structuredClone(actions),
    dashboards: structuredClone(dashboards),
  };
}

export function validateMvpScreenAndActionCatalog() {
  const errors: string[] = [];
  const actionCodes = new Set(actions.map((item) => item.code));

  for (const screen of screens) {
    const missing = screen.actionCodes.filter((code) => !actionCodes.has(code));
    if (missing.length > 0) {
      errors.push(`${screen.code}: actions introuvables ${missing.join(", ")}`);
    }
  }

  const duplicateScreenCodes = screens
    .map((item) => item.code)
    .filter((code, index, all) => all.indexOf(code) !== index);
  const duplicateActionCodes = actions
    .map((item) => item.code)
    .filter((code, index, all) => all.indexOf(code) !== index);

  if (duplicateScreenCodes.length > 0) errors.push(`Écrans dupliqués : ${duplicateScreenCodes.join(", ")}`);
  if (duplicateActionCodes.length > 0) errors.push(`Actions dupliquées : ${duplicateActionCodes.join(", ")}`);

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      screenCount: screens.length,
      actionCount: actions.length,
      dashboardCount: dashboards.length,
      actorKindsCovered: [...new Set(screens.map((item) => item.actorKind))],
    },
  };
}
