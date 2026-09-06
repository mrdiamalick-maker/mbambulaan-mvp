// Pipeline de connaissance — Signal → Finding → Situation / CollectiveNeed
// → ProgramOpportunity → Initiative (LOT 0, mandat "aligner le Core métier
// avec le Blueprint V1"). Fichier dédié plutôt qu'ajouté à rules.ts : ce
// pipeline est un domaine fonctionnel distinct de la machine à états de
// Situation et des objets de première classe déjà là (Decision, Evidence,
// CoordinationSpace) — même esprit de séparation que signal-crossing.ts
// (moteur de règles) et coordination-engine.ts (recommandation), tous deux
// distincts de rules.ts.
//
// Discipline commune à toutes les commandes de ce fichier, rappelée une
// fois ici plutôt que répétée à chaque fonction : aucune ne promeut
// automatiquement vers l'étape suivante. Un Finding proposé ne devient pas
// confirmé tout seul ; un Finding confirmé ne devient pas une Situation
// tant que promote_finding_to_situation n'est pas explicitement appelée ;
// un CollectiveNeed qualifié ne devient pas une ProgramOpportunity tant
// que create_program_opportunity n'est pas explicitement appelée ; une
// ProgramOpportunity qualifiée ne devient pas un Programme tant que
// create_initiative n'est pas explicitement appelée. C'est le coeur du
// mandat : comprendre avant de promouvoir.
import type {
  Command,
  CollectiveNeed,
  Finding,
  FindingStatus,
  KnowledgeSourceRef,
  ProductState,
  ProgramOpportunity,
  ProgramOpportunityStatus,
  Signal,
  Situation
} from "./types";
import { findingStatusLabels, findingRejectionReasonLabels, programOpportunityStatusLabels, collectiveNeedStatusLabels, signalDispositionLabels } from "./types";
import { history, id, timestamp, validateSituation, withAudit } from "./rules";

function requireTerritories(state: ProductState, territoryIds: string[], label: string) {
  if (territoryIds.length === 0) throw new Error(`${label} doit couvrir au moins un territoire.`);
  for (const territoryId of territoryIds) {
    if (!state.territories.some((item) => item.id === territoryId)) throw new Error(`Territoire inconnu : ${territoryId}.`);
  }
}

function requireSourceRefs(sourceRefs: KnowledgeSourceRef[], label: string) {
  if (sourceRefs.length === 0) throw new Error(`${label} doit citer au moins une source réelle — aucune compréhension ne se construit sans base.`);
}

// Correction Product Review (LOT 0, "referential integrity des
// KnowledgeSourceRef") : la présence d'au moins une source ne suffit pas
// — chaque référence doit résoudre vers un objet réellement présent dans
// ProductState. Validateur centralisé plutôt que dupliqué à chaque appel
// (record_finding, create_collective_need, create_program_opportunity) :
// "Every claim must be traceable" s'applique identiquement partout où un
// KnowledgeSourceRef apparaît.
// Exportée (LOT 4) : réutilisée telle quelle par impact.ts pour valider
// Learning.sourceRefs — même discipline "une source doit exister
// réellement pour être citée" que Finding/CollectiveNeed/ProgramOpportunity,
// pas une seconde implémentation.
export function resolveKnowledgeSourceRef(state: ProductState, ref: KnowledgeSourceRef): boolean {
  switch (ref.objectType) {
    case "signal":
      return state.signals.some((item) => item.id === ref.objectId);
    case "situation":
      return state.situations.some((item) => item.id === ref.objectId);
    case "finding":
      return state.findings.some((item) => item.id === ref.objectId);
    case "service_request":
      return state.serviceRequests.some((item) => item.id === ref.objectId);
    case "evidence":
      return state.evidences.some((item) => item.id === ref.objectId);
    case "infrastructure":
      return state.infrastructures.some((item) => item.id === ref.objectId);
    case "vessel":
      return state.vessels.some((item) => item.id === ref.objectId);
    case "fishing_trip":
      return state.trips.some((item) => item.id === ref.objectId);
    case "landing":
      return state.landings.some((item) => item.id === ref.objectId);
    case "capacity":
      return state.capacities.some((item) => item.id === ref.objectId);
    case "territory":
      return state.territories.some((item) => item.id === ref.objectId);
    case "site":
      return state.sites.some((item) => item.id === ref.objectId);
  }
}

function requireResolvedSourceRefs(state: ProductState, sourceRefs: KnowledgeSourceRef[], label: string) {
  for (const ref of sourceRefs) {
    if (!resolveKnowledgeSourceRef(state, ref)) {
      throw new Error(`${label} référence ${ref.objectType}:${ref.objectId}, introuvable — une source doit exister réellement pour être citée.`);
    }
  }
}

// Idempotence des détections (LOT 8, mandat "Maritime Intelligence
// Engine", §6) : une même occurrence détectée par une règle (ruleId +
// version + objet(s) source, cf. signalCrossingAlertToFindingDraft.
// detectionKey) ne doit jamais produire deux Finding, qu'elle soit
// enregistrée deux fois ou d'abord écartée puis reproposée. Un seul
// garde-fou, appelé par record_finding ET dismiss_detection — pas deux
// implémentations qui pourraient diverger.
function assertDetectionNotAlreadyKnown(state: ProductState, detectionKey: string | undefined) {
  if (!detectionKey) return;
  if (state.findings.some((item) => item.detectionKey === detectionKey)) {
    throw new Error("Cette détection a déjà été traitée (constat enregistré ou occurrence écartée) — pas de doublon.");
  }
}

// promoteSignalToSituation — coeur partagé par la commande
// promote_signal_to_situation ET par les wrappers legacy
// (report_signal_and_open_situation, convert_message_to_signal_and_situation
// dans rules.ts) : une seule implémentation de "comment un Signal devient
// une Situation", pas deux qui pourraient diverger.
export function promoteSignalToSituation(
  state: ProductState,
  signalId: string,
  actorId: string,
  overrides: { territoryId?: string; title?: string; description?: string; priority?: Situation["priority"]; visibility?: Situation["visibility"]; auditAction?: string } = {}
): ProductState {
  const signal = state.signals.find((item) => item.id === signalId);
  if (!signal) throw new Error("Signal introuvable.");
  if (signal.disposition === "oriente_situation") throw new Error("Ce signal a déjà été orienté vers une situation.");

  const territoryId = overrides.territoryId ?? signal.territoryId;
  if (!territoryId) throw new Error("Ce signal n'a pas de territoire résolu — précisez-en un explicitement pour créer une situation.");
  if (!state.territories.some((item) => item.id === territoryId)) throw new Error("Territoire inconnu.");

  const suffix = crypto.randomUUID().slice(0, 8);
  const situationId = `sit-${suffix}`;
  const newSituation: Situation = {
    id: situationId,
    reference: `MBA-SIT-${suffix.toUpperCase()}`,
    signalIds: [signal.id],
    territoryId,
    title: (overrides.title ?? signal.title).trim(),
    description: (overrides.description ?? signal.description).trim(),
    status: "recue",
    priority: overrides.priority ?? "moyenne",
    trust: signal.trust,
    visibility: overrides.visibility ?? "organisation",
    nextStep: "Qualifier le signal avec un relais territorial",
    history: [history(actorId, "Situation créée depuis un signal", (overrides.description ?? signal.description).trim())]
  };
  validateSituation(newSituation);

  const next: ProductState = {
    ...state,
    signals: state.signals.map((item) =>
      item.id === signal.id ? { ...item, disposition: "oriente_situation" as const, dispositionNote: `Orienté vers la situation ${situationId}` } : item
    ),
    situations: [newSituation, ...state.situations]
  };
  return withAudit(next, actorId, "situation", situationId, overrides.auditAction ?? "promote_signal_to_situation", newSituation.title);
}

function applyUpdateSignalDisposition(state: ProductState, command: Extract<Command, { type: "update_signal_disposition" }>): ProductState {
  const signal = state.signals.find((item) => item.id === command.signalId);
  if (!signal) throw new Error("Signal introuvable.");
  if (signal.disposition === "oriente_situation") {
    throw new Error("Un signal déjà orienté vers une situation ne change plus de disposition par cette commande.");
  }
  const next: ProductState = {
    ...state,
    signals: state.signals.map((item) =>
      item.id === signal.id ? { ...item, disposition: command.disposition, dispositionNote: command.note?.trim() || item.dispositionNote } : item
    )
  };
  return withAudit(next, command.actorId, "signal", signal.id, command.type, signalDispositionLabels[command.disposition]);
}

function applyPromoteSignalToSituation(state: ProductState, command: Extract<Command, { type: "promote_signal_to_situation" }>): ProductState {
  return promoteSignalToSituation(state, command.signalId, command.actorId, {
    territoryId: command.territoryId,
    title: command.title,
    description: command.description,
    priority: command.priority,
    visibility: command.visibility
  });
}

// record_finding — matérialise une compréhension (humaine ou issue d'une
// règle de src/domain/signal-crossing.ts via signalCrossingAlertToFindingDraft)
// en Finding réel, statut "proposed". N'ouvre jamais de Situation ni ne
// prend aucune autre décision (mandat §6, TEST B).
function applyRecordFinding(state: ProductState, command: Extract<Command, { type: "record_finding" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre du constat est obligatoire.");
  if (!command.statement.trim()) throw new Error("L'énoncé du constat est obligatoire.");
  if (!command.explanation.trim()) throw new Error("L'explication du constat est obligatoire.");
  if (!command.nextStep.trim()) throw new Error("La prochaine étape proposée est obligatoire.");
  requireTerritories(state, command.territoryIds, "Un constat");
  requireSourceRefs(command.sourceRefs, "Un constat");
  requireResolvedSourceRefs(state, command.sourceRefs, "Un constat");
  if (command.provenance === "rule" && (!command.ruleId || command.ruleVersion === undefined)) {
    throw new Error("Un constat issu d'une règle doit citer l'identifiant et la version de cette règle.");
  }
  assertDetectionNotAlreadyKnown(state, command.detectionKey);

  const finding: Finding = {
    id: id("fnd"),
    type: command.findingType,
    title: command.title.trim(),
    statement: command.statement.trim(),
    territoryIds: command.territoryIds,
    sourceRefs: command.sourceRefs,
    explanation: command.explanation.trim(),
    trust: command.trust,
    status: "proposed",
    provenance: command.provenance,
    ruleId: command.ruleId,
    ruleVersion: command.ruleVersion,
    detectionKey: command.detectionKey,
    nextStep: command.nextStep.trim(),
    createdAt: timestamp(),
    createdByActorId: command.actorId
  };

  // Rattache chaque Signal cité en source à ce Finding (disposition), sans
  // toucher aux sources d'un autre type (situation/service_request/...).
  const relatedSignalIds = new Set(command.sourceRefs.filter((ref) => ref.objectType === "signal").map((ref) => ref.objectId));
  const next: ProductState = {
    ...state,
    findings: [finding, ...state.findings],
    signals: state.signals.map((item) =>
      relatedSignalIds.has(item.id) && item.disposition !== "oriente_situation"
        ? { ...item, disposition: "rattache_finding" as const, dispositionNote: `Rattaché au constat ${finding.id}` }
        : item
    )
  };
  return withAudit(next, command.actorId, "finding", finding.id, command.type, finding.title);
}

const FINDING_TERMINAL_STATUSES: ReadonlySet<FindingStatus> = new Set(["rejected", "superseded"]);

function applyUpdateFindingStatus(state: ProductState, command: Extract<Command, { type: "update_finding_status" }>): ProductState {
  const finding = state.findings.find((item) => item.id === command.findingId);
  if (!finding) throw new Error("Constat introuvable.");
  if (FINDING_TERMINAL_STATUSES.has(finding.status)) throw new Error(`Un constat ${findingStatusLabels[finding.status].toLowerCase()} ne change plus de statut.`);
  if (finding.status === "confirmed" && command.status !== "superseded") {
    throw new Error("Un constat confirmé ne peut plus que devenir « remplacé ».");
  }

  const next: ProductState = {
    ...state,
    findings: state.findings.map((item) =>
      item.id === finding.id
        ? {
            ...item,
            status: command.status,
            reviewedByActorId: command.actorId,
            reviewedAt: timestamp(),
            reviewNote: command.note?.trim() || item.reviewNote,
            // rejectionReason (LOT 8, mandat §31) : seulement significatif
            // pour un rejet — ignoré silencieusement sinon plutôt que
            // rejeté, pour ne pas complexifier cette commande générique
            // avec une validation propre à un seul statut parmi cinq.
            rejectionReason: command.status === "rejected" ? command.rejectionReason ?? item.rejectionReason : item.rejectionReason
          }
        : item
    )
  };
  return withAudit(next, command.actorId, "finding", finding.id, command.type, findingStatusLabels[command.status]);
}

// dismiss_detection (LOT 8, mandat §5/§31) — l'autre issue humaine d'une
// détection encore non matérialisée : le coordinateur l'a examinée et
// juge qu'elle ne mérite pas de constat. Réutilise exactement les mêmes
// validations que record_finding (même exigence de sources réelles,
// mêmes champs obligatoires) — la seule différence est le statut de
// création ("rejected" au lieu de "proposed") et l'obligation d'une
// raison de rejet et d'une detectionKey, toutes deux garanties par le
// type de la commande (types.ts). Un Finding rejeté reste un Finding
// (mandat §3, canal de sortie unique de l'intelligence) — pas un second
// objet parallèle "DetectionFeedback".
function applyDismissDetection(state: ProductState, command: Extract<Command, { type: "dismiss_detection" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre du constat est obligatoire.");
  if (!command.statement.trim()) throw new Error("L'énoncé du constat est obligatoire.");
  if (!command.explanation.trim()) throw new Error("L'explication du constat est obligatoire.");
  if (!command.nextStep.trim()) throw new Error("La prochaine étape proposée est obligatoire.");
  requireTerritories(state, command.territoryIds, "Un constat");
  requireSourceRefs(command.sourceRefs, "Un constat");
  requireResolvedSourceRefs(state, command.sourceRefs, "Un constat");
  if (command.provenance === "rule" && (!command.ruleId || command.ruleVersion === undefined)) {
    throw new Error("Un constat issu d'une règle doit citer l'identifiant et la version de cette règle.");
  }
  assertDetectionNotAlreadyKnown(state, command.detectionKey);

  const finding: Finding = {
    id: id("fnd"),
    type: command.findingType,
    title: command.title.trim(),
    statement: command.statement.trim(),
    territoryIds: command.territoryIds,
    sourceRefs: command.sourceRefs,
    explanation: command.explanation.trim(),
    trust: command.trust,
    status: "rejected",
    provenance: command.provenance,
    ruleId: command.ruleId,
    ruleVersion: command.ruleVersion,
    detectionKey: command.detectionKey,
    rejectionReason: command.rejectionReason,
    nextStep: command.nextStep.trim(),
    createdAt: timestamp(),
    createdByActorId: command.actorId,
    reviewedByActorId: command.actorId,
    reviewedAt: timestamp(),
    reviewNote: findingRejectionReasonLabels[command.rejectionReason]
  };

  const next: ProductState = { ...state, findings: [finding, ...state.findings] };
  return withAudit(next, command.actorId, "finding", finding.id, command.type, finding.title);
}

// promote_finding_to_situation — TEST C : un Finding confirmé, et
// explicitement orienté vers Situation. La Situation conserve la
// traçabilité vers le Finding (findingId) ET vers les Signals sources
// (signalIds, dérivés des sourceRefs de type "signal") — "pourquoi cette
// Situation existe-t-elle ?" doit toujours pouvoir remonter jusqu'ici.
//
// Correction Product Review (LOT 0, 2026-09-01) : une Situation est une
// conséquence opérationnelle d'un Finding confirmé, elle ne le remplace
// pas — le Finding reste "confirmed" après promotion (traçabilité cible :
// Signals → Finding confirmé → Situation). "superseded" reste réservé au
// remplacement effectif d'un Finding par un autre (update_finding_status).
// promotedToSituationId trace la relation sans dupliquer l'information
// déjà portée par Situation.findingId, et sert de garde-fou contre une
// double promotion du même Finding.
function applyPromoteFindingToSituation(state: ProductState, command: Extract<Command, { type: "promote_finding_to_situation" }>): ProductState {
  const finding = state.findings.find((item) => item.id === command.findingId);
  if (!finding) throw new Error("Constat introuvable.");
  if (finding.status !== "confirmed") throw new Error("Seul un constat confirmé peut être orienté vers une situation.");
  if (finding.promotedToSituationId) throw new Error("Ce constat a déjà donné lieu à une situation.");

  const territoryId = command.territoryId ?? finding.territoryIds[0];
  if (!territoryId) throw new Error("Ce constat n'a pas de territoire résolu — précisez-en un explicitement.");
  if (!state.territories.some((item) => item.id === territoryId)) throw new Error("Territoire inconnu.");

  const signalIds = finding.sourceRefs.filter((ref) => ref.objectType === "signal").map((ref) => ref.objectId);

  const suffix = crypto.randomUUID().slice(0, 8);
  const situationId = `sit-${suffix}`;
  const newSituation: Situation = {
    id: situationId,
    reference: `MBA-SIT-${suffix.toUpperCase()}`,
    signalIds,
    territoryId,
    title: finding.title,
    description: finding.statement,
    status: "recue",
    priority: command.priority ?? "moyenne",
    trust: finding.trust,
    visibility: command.visibility ?? "organisation",
    nextStep: finding.nextStep,
    findingId: finding.id,
    history: [history(command.actorId, "Situation créée depuis un constat confirmé", finding.statement)]
  };
  validateSituation(newSituation);

  const relatedSignalIds = new Set(signalIds);
  const next: ProductState = {
    ...state,
    // Le Finding reste "confirmed" (correction Product Review) — seul
    // promotedToSituationId change, la trace de promotion.
    findings: state.findings.map((item) => (item.id === finding.id ? { ...item, promotedToSituationId: situationId } : item)),
    signals: state.signals.map((item) =>
      relatedSignalIds.has(item.id) ? { ...item, disposition: "oriente_situation" as const, dispositionNote: `Orienté vers la situation ${situationId} via le constat ${finding.id}` } : item
    ),
    situations: [newSituation, ...state.situations]
  };
  return withAudit(next, command.actorId, "situation", situationId, command.type, newSituation.title);
}

// create_collective_need (LOT 0.3) — un problème partagé ou récurrent, pas
// encore un Programme : ni budget, ni partenaire, ni solution prédéfinie
// exigés (mandat §9).
function applyCreateCollectiveNeed(state: ProductState, command: Extract<Command, { type: "create_collective_need" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre du besoin collectif est obligatoire.");
  if (!command.affectedPopulation.trim()) throw new Error("La population ou les acteurs concernés sont obligatoires.");
  requireTerritories(state, command.territoryIds, "Un besoin collectif");
  requireSourceRefs(command.sourceRefs, "Un besoin collectif");
  requireResolvedSourceRefs(state, command.sourceRefs, "Un besoin collectif");
  if (command.knowledgeGapFindingIds?.some((findingId) => !state.findings.some((item) => item.id === findingId))) {
    throw new Error("Une connaissance manquante référencée est introuvable.");
  }

  const need: CollectiveNeed = {
    id: id("cn"),
    title: command.title.trim(),
    territoryIds: command.territoryIds,
    affectedPopulation: command.affectedPopulation.trim(),
    sourceRefs: command.sourceRefs,
    consequences: command.consequences,
    hypotheses: command.hypotheses,
    knowledgeGaps: command.knowledgeGaps,
    knowledgeGapFindingIds: command.knowledgeGapFindingIds,
    status: "emerging",
    createdAt: timestamp(),
    history: [history(command.actorId, "Besoin collectif identifié", command.title.trim())]
  };

  const next: ProductState = { ...state, collectiveNeeds: [need, ...state.collectiveNeeds] };
  return withAudit(next, command.actorId, "collective_need", need.id, command.type, need.title);
}

function applyUpdateCollectiveNeedStatus(state: ProductState, command: Extract<Command, { type: "update_collective_need_status" }>): ProductState {
  const need = state.collectiveNeeds.find((item) => item.id === command.collectiveNeedId);
  if (!need) throw new Error("Besoin collectif introuvable.");
  if (need.status === "converted") throw new Error("Un besoin collectif déjà converti en opportunité de programme ne change plus de statut par cette commande.");

  const updated: CollectiveNeed = {
    ...need,
    status: command.status,
    history: [history(command.actorId, "Statut du besoin collectif mis à jour", command.note?.trim() || collectiveNeedStatusLabels[command.status]), ...need.history]
  };
  const next: ProductState = { ...state, collectiveNeeds: state.collectiveNeeds.map((item) => (item.id === need.id ? updated : item)) };
  return withAudit(next, command.actorId, "collective_need", need.id, command.type, collectiveNeedStatusLabels[command.status]);
}

// create_program_opportunity (LOT 0.3, TEST F) — un CollectiveNeed
// qualifié devient une ProgramOpportunity, sans aucun budget obligatoire
// (mandat §11/§13). Distinct de l'Opportunity existante (matching
// économique lot ↔ demande) — ne la remplace pas, ne s'y substitue pas.
function applyCreateProgramOpportunity(state: ProductState, command: Extract<Command, { type: "create_program_opportunity" }>): ProductState {
  const need = state.collectiveNeeds.find((item) => item.id === command.collectiveNeedId);
  if (!need) throw new Error("Besoin collectif introuvable.");
  if (need.status !== "qualified") throw new Error("Seul un besoin collectif qualifié peut devenir une opportunité de programme.");
  if (!command.problem.trim()) throw new Error("Le problème est obligatoire.");
  if (!command.justification.trim()) throw new Error("La justification est obligatoire.");
  if (!command.potentialBeneficiaries.trim()) throw new Error("Les bénéficiaires potentiels sont obligatoires.");
  requireTerritories(state, command.territoryIds, "Une opportunité de programme");
  // evidenceRefs peut légitimement être vide (aucune preuve n'existe pas
  // encore), contrairement à sourceRefs d'un Finding/CollectiveNeed —
  // requireSourceRefs n'est donc pas appliqué ici, seule la résolution
  // des références réellement citées est vérifiée.
  requireResolvedSourceRefs(state, command.evidenceRefs, "Une opportunité de programme");
  // desiredOutcomes (P2.5-A, mandat "Programme Lifecycle Foundation", §11)
  // — seule validation ajoutée à la porte de création d'une opportunité de
  // programme ce lot. Contrairement à evidenceRefs (ci-dessus, vide
  // délibéré et commenté comme tel), rien ici ne documentait l'absence de
  // résultat recherché comme un choix assumé — plutôt qu'un oubli du
  // modèle. ProgramOpportunityForm.tsx impose déjà ce minimum côté client
  // (mandat §1) : un contrôle client n'est jamais une preuve d'intégrité
  // côté Core (même principe que P2.1-B.1, "les données envoyées par le
  // client ne sont jamais une preuve d'autorisation" — ici appliqué à la
  // donnée elle-même, pas seulement à l'autorisation). knowledgeGaps et
  // maturity restent volontairement intouchés (mandat §11 : une inconnue
  // documentée ne doit jamais bloquer la création, la maturité ne doit
  // jamais devenir un score d'approbation opaque).
  if (!command.desiredOutcomes.some((item) => item.trim())) {
    throw new Error("Une opportunité de programme doit énoncer au moins un résultat recherché.");
  }

  const opportunity: ProgramOpportunity = {
    id: id("popp"),
    collectiveNeedId: need.id,
    problem: command.problem.trim(),
    justification: command.justification.trim(),
    territoryIds: command.territoryIds,
    potentialBeneficiaries: command.potentialBeneficiaries.trim(),
    evidenceRefs: command.evidenceRefs,
    hypotheses: command.hypotheses,
    knowledgeGaps: command.knowledgeGaps,
    possibleInterventions: command.possibleInterventions,
    desiredOutcomes: command.desiredOutcomes,
    possibleIndicators: command.possibleIndicators,
    maturity: command.maturity,
    status: "detected",
    createdAt: timestamp(),
    history: [history(command.actorId, "Opportunité de programme détectée", command.problem.trim())]
  };

  const next: ProductState = {
    ...state,
    programOpportunities: [opportunity, ...state.programOpportunities],
    collectiveNeeds: state.collectiveNeeds.map((item) =>
      item.id === need.id ? { ...item, status: "converted" as const, history: [history(command.actorId, "Converti en opportunité de programme", opportunity.id), ...item.history] } : item
    )
  };
  return withAudit(next, command.actorId, "program_opportunity", opportunity.id, command.type, opportunity.problem);
}

const PROGRAM_OPPORTUNITY_TERMINAL_STATUSES: ReadonlySet<ProgramOpportunityStatus> = new Set(["converted_to_program"]);

function applyUpdateProgramOpportunityStatus(state: ProductState, command: Extract<Command, { type: "update_program_opportunity_status" }>): ProductState {
  const opportunity = state.programOpportunities.find((item) => item.id === command.programOpportunityId);
  if (!opportunity) throw new Error("Opportunité de programme introuvable.");
  if (PROGRAM_OPPORTUNITY_TERMINAL_STATUSES.has(opportunity.status)) {
    throw new Error("Une opportunité déjà convertie en programme ne change plus de statut par cette commande.");
  }

  const updated: ProgramOpportunity = {
    ...opportunity,
    status: command.status,
    history: [history(command.actorId, "Statut de l'opportunité de programme mis à jour", command.note?.trim() || programOpportunityStatusLabels[command.status]), ...opportunity.history]
  };
  const next: ProductState = { ...state, programOpportunities: state.programOpportunities.map((item) => (item.id === opportunity.id ? updated : item)) };
  return withAudit(next, command.actorId, "program_opportunity", opportunity.id, command.type, programOpportunityStatusLabels[command.status]);
}

export function applyKnowledgePipelineCommand(
  state: ProductState,
  command: Extract<
    Command,
    {
      type:
        | "update_signal_disposition"
        | "promote_signal_to_situation"
        | "record_finding"
        | "update_finding_status"
        | "promote_finding_to_situation"
        | "create_collective_need"
        | "update_collective_need_status"
        | "create_program_opportunity"
        | "update_program_opportunity_status"
        | "dismiss_detection";
    }
  >
): ProductState {
  switch (command.type) {
    case "update_signal_disposition":
      return applyUpdateSignalDisposition(state, command);
    case "promote_signal_to_situation":
      return applyPromoteSignalToSituation(state, command);
    case "record_finding":
      return applyRecordFinding(state, command);
    case "update_finding_status":
      return applyUpdateFindingStatus(state, command);
    case "promote_finding_to_situation":
      return applyPromoteFindingToSituation(state, command);
    case "create_collective_need":
      return applyCreateCollectiveNeed(state, command);
    case "update_collective_need_status":
      return applyUpdateCollectiveNeedStatus(state, command);
    case "create_program_opportunity":
      return applyCreateProgramOpportunity(state, command);
    case "update_program_opportunity_status":
      return applyUpdateProgramOpportunityStatus(state, command);
    case "dismiss_detection":
      return applyDismissDetection(state, command);
  }
}

// Signal non utilisé directement ici mais réexporté pour les consommateurs
// qui typent leurs propres helpers autour de ce pipeline (tests inclus).
export type { Signal };
