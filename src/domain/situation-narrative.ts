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
// à présenter en priorité : parmi les situations ouvertes du périmètre
// demandé, celles adossées à un Finding (donc explicables — le coeur de la
// signature produit §7) passent avant les autres, puis tri par priorité
// décroissante. Sans Finding disponible dans le périmètre, retombe sur la
// simple priorité (comportement historique de `dominantPrioritySituation`,
// préservé). Retourne undefined si le périmètre ne contient aucune
// situation ouverte.
export function findFocusSituation(state: ProductState, territoryId?: string): Situation | undefined {
  const scoped = state.situations.filter((item) => isOpenSituation(item) && (!territoryId || item.territoryId === territoryId));
  if (scoped.length === 0) return undefined;
  const explainable = scoped.filter((item) => Boolean(item.findingId));
  const pool = explainable.length > 0 ? explainable : scoped;
  return [...pool].sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])[0];
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

// findKnowledgeGapForSituation — un Finding de type "knowledge_gap" est
// considéré pertinent pour une Situation s'il partage au moins un
// territoire avec elle. Règle générique et volontairement simple (mandat
// §8 : « ne fabrique pas une incertitude si aucune information ne permet
// de la justifier ») — pas de rattachement plus fort (ex. sourceRefs
// croisées) tant qu'aucun cas réel ne l'exige. Pour Joal, ne résout à rien
// aujourd'hui (aucun knowledge_gap sur ce territoire) : la section
// correspondante doit afficher le repli honnête, pas une fabrication.
export function findKnowledgeGapForSituation(state: ProductState, situation: Situation): Finding | undefined {
  return state.findings.find((item) => item.type === "knowledge_gap" && item.territoryIds.includes(situation.territoryId));
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
// dans le produit, cf. commentaire src/app/app/etat/page.tsx). Le nombre de
// sources n'apparaît que pour les niveaux qui n'impliquent pas déjà un
// recoupement (verifiee/consolidee/rapprochee/officielle) — pour ceux-là,
// le recoupement est déjà acquis par construction du niveau lui-même.
export function describeFindingTrust(finding: Finding): string {
  const label = trustLevelLabel[finding.trust];
  const crossChecked = finding.trust === "verifiee" || finding.trust === "consolidee" || finding.trust === "rapprochee" || finding.trust === "officielle";
  if (crossChecked) return `${label} — plusieurs sources et éléments opérationnels concordent.`;
  if (finding.sourceRefs.length > 1) return `${label} — ${finding.sourceRefs.length} sources indépendantes concordent, pas encore recoupées sur le terrain.`;
  if (finding.sourceRefs.length === 1) return `${label} — une seule source à ce stade, pas encore recoupée.`;
  return `${label} — aucune source directe consignée à ce stade.`;
}

export type ValueTrailStepKey = "signal" | "comprehension" | "decision" | "action" | "resultat";

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
      key: "action",
      label: "Action",
      proven: commitmentsCount > 0,
      detail: commitmentsCount > 0 ? `${commitmentsCount} engagement${commitmentsCount > 1 ? "s" : ""} en cours de coordination` : "Aucun engagement enregistré pour le moment"
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
