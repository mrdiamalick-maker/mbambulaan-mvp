// LOT 1 (mandat "Vertical Slice Joal — de la réalité terrain à la décision
// institutionnelle") — logique pure de lecture d'un dossier Situation pour
// l'Espace État : quelle Situation mérite l'attention, quel Finding
// l'explique, quels Signals la composent, quelles sources se résolvent en
// éléments affichables, quel niveau de confiance et quelle chaîne de valeur
// réelle peut être racontée. Aucune commande, aucune écriture — uniquement
// des dérivations à partir d'un ProductState déjà chargé, testables sans
// "server-only" (même discipline que public-request-signal-bridge.ts,
// LOT 0). Ne dépend pas de src/lib (domain reste indépendant de la couche
// présentation, aucun fichier domain/ n'importe @/lib aujourd'hui).
import {
  decisionTypeLabels,
  type Decision,
  type Finding,
  type KnowledgeSourceRef,
  type ProductState,
  type Signal,
  type Situation,
  type TrustLevel
} from "@/domain/types";

// Copie locale volontaire (10 entrées) plutôt qu'un import de
// @/lib/status-tokens : évite une dépendance domain → lib qui n'existe
// nulle part ailleurs dans le code. La copie affichée à l'utilisateur
// (trustLabels, lib/status-tokens.ts) reste la référence visuelle ; celle-ci
// ne sert qu'à composer describeFindingTrust ci-dessous.
const trustLevelLabel: Record<TrustLevel, string> = {
  declaree: "Déclaré",
  observee: "Observé",
  verifiee: "Vérifié",
  consolidee: "Consolidé",
  rapprochee: "Rapproché",
  documentee: "Documenté",
  officielle: "Officiel",
  estimee: "Estimé",
  contestee: "Contesté",
  expiree: "Expiré"
};

// Statuts considérés comme "ouverts" pour la sélection d'une situation à
// mettre en avant — mêmes valeurs que le reste de l'Espace État
// (preQualificationStatuses/situationsAArbitrer dans page.tsx), pas un
// nouveau seuil inventé pour ce lot.
function isOpenSituation(situation: Situation) {
  return situation.status !== "reglee";
}

const priorityRank: Record<Situation["priority"], number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };

// findFocusSituation — sélection générique (aucun `if joal`) de la situation
// à présenter en priorité.
//
// Correction Product Review (LOT 1, 2026-09-01, "priorité institutionnelle
// avant explicabilité") : la priorité métier de la Situation est désormais
// TOUJOURS le premier critère — une Situation critique sans Finding reste
// prioritaire sur une Situation moyenne explicable. L'explicabilité
// (présence d'un Finding) n'intervient plus qu'en départage, à priorité
// strictement égale. Un dossier critique sans Finding n'est donc jamais
// masqué par ce choix : son absence de constat reste visible ailleurs
// (SituationDetail n'affiche simplement pas la signature "pourquoi
// Mbàmbulaan vous le signale", et situation.nextStep porte alors
// naturellement le besoin de qualification — ex. "Qualifier le signal
// avec le poste de quai" — jamais un texte fabriqué pour combler l'absence).
// Départage final déterministe (id croissant) pour ne jamais dépendre de
// l'ordre d'insertion du tableau.
export function findFocusSituation(state: ProductState, territoryId?: string): Situation | undefined {
  const scoped = state.situations.filter((item) => isOpenSituation(item) && (!territoryId || item.territoryId === territoryId));
  if (scoped.length === 0) return undefined;
  const maxPriority = Math.max(...scoped.map((item) => priorityRank[item.priority]));
  const topPriority = scoped.filter((item) => priorityRank[item.priority] === maxPriority);
  return [...topPriority].sort((a, b) => {
    const explainabilityDiff = Number(Boolean(b.findingId)) - Number(Boolean(a.findingId));
    if (explainabilityDiff !== 0) return explainabilityDiff;
    return a.id.localeCompare(b.id);
  })[0];
}

export function resolveFindingForSituation(state: ProductState, situation: Situation): Finding | undefined {
  if (!situation.findingId) return undefined;
  return state.findings.find((item) => item.id === situation.findingId);
}

// collectSituationSignals — union de situation.signalIds et des sourceRefs
// de type "signal" du Finding qui l'explique (les deux ensembles coïncident
// pour la chaîne Joal actuelle, mais rien ne le garantit en général — d'où
// l'union plutôt qu'un seul des deux), dédoublonnée et triée du plus récent
// au plus ancien. Répond à §9 : « ne plus afficher uniquement le premier ».
export function collectSituationSignals(state: ProductState, situation: Situation): Signal[] {
  const finding = resolveFindingForSituation(state, situation);
  const ids = new Set<string>(situation.signalIds);
  finding?.sourceRefs.forEach((ref) => { if (ref.objectType === "signal") ids.add(ref.objectId); });
  return state.signals
    .filter((item) => ids.has(item.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function sourceRefKey(ref: KnowledgeSourceRef): string {
  return `${ref.objectType}:${ref.objectId}`;
}

// findKnowledgeGapForSituation — un Finding "knowledge_gap" partageant
// simplement le territoire de la Situation n'est plus considéré pertinent
// (correction Product Review, LOT 1, 2026-09-01, "territoire seul
// insuffisant" — un angle mort moteur à Joal ne doit pas apparaître sur un
// dossier glace simplement parce que les deux concernent Joal). La
// pertinence exige désormais une relation forte au Finding qui explique la
// Situation elle-même :
//   - le knowledge_gap référence directement ce Finding
//     (sourceRefs: [{objectType: "finding", objectId: <ce Finding>}],
//     exactement le rattachement déjà utilisé par le jeu de démonstration
//     Kayar, cf. kayarKnowledgeGapFinding → fnd-kayar-motorisation) ; ou
//   - le knowledge_gap cite au moins une des mêmes sources
//     (KnowledgeSourceRef identique — même Signal, même Infrastructure...)
//     que ce Finding.
// Sans Finding sur la Situation (findingId absent), aucune base de
// comparaison n'existe — retourne honnêtement undefined plutôt que de
// retomber sur le seul territoire.
export function findKnowledgeGapForSituation(state: ProductState, situation: Situation): Finding | undefined {
  const situationFinding = resolveFindingForSituation(state, situation);
  if (!situationFinding) return undefined;
  const situationSourceKeys = new Set(situationFinding.sourceRefs.map(sourceRefKey));
  return state.findings.find((candidate) => {
    if (candidate.type !== "knowledge_gap" || candidate.id === situationFinding.id) return false;
    const referencesSituationFinding = candidate.sourceRefs.some((ref) => ref.objectType === "finding" && ref.objectId === situationFinding.id);
    const sharesSourceRef = candidate.sourceRefs.some((ref) => situationSourceKeys.has(sourceRefKey(ref)));
    return referencesSituationFinding || sharesSourceRef;
  });
}

export interface ResolvedSource {
  ref: KnowledgeSourceRef;
  label: string;
  detail?: string;
}

// resolveSourceRefDisplay — même couverture des 12 objectType que le
// validateur d'intégrité référentielle (knowledge-pipeline.ts,
// requireResolvedSourceRefs), mais orientée affichage plutôt que
// validation : un libellé humain, jamais un identifiant technique brut
// (mandat §7 : « pas besoin de montrer des IDs techniques »). Retourne
// undefined si la référence ne résout à rien (ne devrait pas arriver pour
// un Finding déjà validé par record_finding, mais reste défensif plutôt que
// de planter l'affichage sur une donnée historique).
export function resolveSourceRefDisplay(state: ProductState, ref: KnowledgeSourceRef): ResolvedSource | undefined {
  switch (ref.objectType) {
    case "signal": {
      const signal = state.signals.find((item) => item.id === ref.objectId);
      if (!signal) return undefined;
      return { ref, label: signal.title, detail: signal.description };
    }
    case "situation": {
      const situation = state.situations.find((item) => item.id === ref.objectId);
      if (!situation) return undefined;
      return { ref, label: situation.title, detail: situation.description };
    }
    case "finding": {
      const finding = state.findings.find((item) => item.id === ref.objectId);
      if (!finding) return undefined;
      return { ref, label: finding.title, detail: finding.statement };
    }
    case "service_request": {
      const request = state.serviceRequests.find((item) => item.id === ref.objectId);
      if (!request) return undefined;
      return { ref, label: `Demande de service — ${request.reference}`, detail: request.source };
    }
    case "evidence": {
      const evidence = state.evidences.find((item) => item.id === ref.objectId);
      if (!evidence) return undefined;
      return { ref, label: evidence.label, detail: evidence.detail };
    }
    case "infrastructure": {
      const infra = state.infrastructures.find((item) => item.id === ref.objectId);
      if (!infra) return undefined;
      return { ref, label: infra.name, detail: `Statut : ${infra.status}` };
    }
    case "vessel": {
      const vessel = state.vessels.find((item) => item.id === ref.objectId);
      if (!vessel) return undefined;
      return { ref, label: vessel.name };
    }
    case "fishing_trip": {
      const trip = state.trips.find((item) => item.id === ref.objectId);
      if (!trip) return undefined;
      return { ref, label: `Sortie en mer — ${trip.zone}`, detail: trip.source };
    }
    case "landing": {
      const landing = state.landings.find((item) => item.id === ref.objectId);
      if (!landing) return undefined;
      return { ref, label: `Débarquement — ${landing.totalWeightKg} kg`, detail: landing.weighingSource };
    }
    case "capacity": {
      const capacity = state.capacities.find((item) => item.id === ref.objectId);
      if (!capacity) return undefined;
      return { ref, label: `Capacité ${capacity.type} — ${capacity.availableQuantity} ${capacity.unit}` };
    }
    case "territory": {
      const territory = state.territories.find((item) => item.id === ref.objectId);
      if (!territory) return undefined;
      return { ref, label: territory.name };
    }
    case "site": {
      const site = state.sites.find((item) => item.id === ref.objectId);
      if (!site) return undefined;
      return { ref, label: site.name };
    }
  }
}

// describeFindingTrust — justification lisible du niveau de confiance,
// jamais un score composite (doctrine anti-score déjà appliquée ailleurs
// dans le produit, cf. commentaire src/app/app/etat/page.tsx).
//
// Correction Product Review (LOT 1, 2026-09-01, "ne pas surinterpréter les
// sources") : la formulation précédente affirmait "sources indépendantes"
// ou "concordent" à partir du seul décompte de sourceRefs — or
// KnowledgeSourceRef.length ne prouve ni l'indépendance des sources (un
// Signal et l'Infrastructure qu'il décrit peuvent se recouper) ni un
// accord effectif entre elles (aucun mécanisme de recoupement formel
// n'existe dans le modèle). La formulation ne dit plus jamais que ce que
// le modèle sait réellement : le niveau de confiance enregistré, et un
// décompte neutre des éléments référencés — jamais une propriété
// (indépendance, concordance) que rien ne démontre.
export function describeFindingTrust(finding: Finding): string {
  const label = trustLevelLabel[finding.trust];
  const count = finding.sourceRefs.length;
  if (count === 0) return `${label} — aucun élément référencé à ce stade.`;
  if (count === 1) return `${label} — une source directe référencée à ce stade.`;
  return `${label} — constat appuyé par ${count} éléments référencés dans Mbàmbulaan.`;
}

export type ValueTrailStepKey = "signal" | "comprehension" | "decision" | "engagement" | "resultat";

export interface ValueTrailStep {
  key: ValueTrailStepKey;
  label: string;
  proven: boolean;
  detail: string;
}

// buildValueTrail (§13, "Value Trail V1") — chaque étape s'appuie sur un
// objet réel du dossier ou l'annonce honnêtement absente (`proven: false`,
// jamais un chiffre d'impact fabriqué — garde-fou §14). Générique : ne
// suppose ni Joal, ni qu'une étape donnée sera toujours atteinte.
//
// Correction Product Review (LOT 1, 2026-09-01, "Commitment ≠ Action") :
// l'étape précédemment nommée "Action" était déclarée prouvée dès qu'un
// Commitment existait — or un Commitment est ce qu'un acteur S'ENGAGE à
// faire, jamais la preuve de ce qui a été RÉELLEMENT fait. Le modèle
// n'a pas d'objet "Action exécutée" indépendant à ce jour (Evidence existe
// mais n'est pas systématiquement liée) — l'étape est donc renommée
// "Engagement" (option recommandée par Product) : Signal → Compréhension →
// Décision → Engagement → Résultat. `proven` continue de refléter
// l'existence réelle d'au moins un Commitment (ce que l'étape affirme
// désormais, sans plus), jamais qu'il a été honoré.
export function buildValueTrail(state: ProductState, situation: Situation): ValueTrailStep[] {
  const signals = collectSituationSignals(state, situation);
  const finding = resolveFindingForSituation(state, situation);
  const decision = [...state.decisions]
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())[0];
  const coordination = situation.coordinationId ? state.coordinationSpaces.find((item) => item.id === situation.coordinationId) : undefined;
  const commitmentsCount = coordination?.commitments.length ?? 0;

  return [
    {
      key: "signal",
      label: "Signal",
      proven: signals.length > 0,
      detail: signals.length > 0 ? `${signals.length} signal${signals.length > 1 ? "aux" : ""} à l'origine du dossier` : "Aucun signal source identifié"
    },
    {
      key: "comprehension",
      label: "Compréhension",
      proven: Boolean(finding),
      detail: finding ? finding.statement : "Aucun constat formalisé pour ce dossier à ce stade"
    },
    {
      key: "decision",
      label: "Décision",
      proven: Boolean(decision),
      detail: decision ? `${decisionTypeLabels[decision.type]} — ${decision.rationale}` : "Aucune décision prise pour le moment"
    },
    {
      key: "engagement",
      label: "Engagement",
      proven: commitmentsCount > 0,
      detail: commitmentsCount > 0 ? `${commitmentsCount} engagement${commitmentsCount > 1 ? "s" : ""} pris en coordination — reste à exécuter` : "Aucun engagement enregistré pour le moment"
    },
    {
      key: "resultat",
      label: "Résultat",
      proven: Boolean(situation.result),
      detail: situation.result ?? "Effet à confirmer — aucun résultat constaté pour le moment"
    }
  ];
}

// relatedDecisionsForSituation — même tri que shared.tsx (SituationDetail),
// extrait ici pour être réutilisé par buildValueTrail sans dupliquer la
// logique de tri, et testable indépendamment (TEST D/F).
export function relatedDecisionsForSituation(state: ProductState, situation: Situation): Decision[] {
  return [...state.decisions]
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());
}
