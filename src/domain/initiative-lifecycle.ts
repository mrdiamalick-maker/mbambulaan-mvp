// Initiative Lifecycle — P2.5-A (mandat "Programme Lifecycle Foundation").
// Le Development Engine sait déjà créer un Programme (Initiative, voie
// ProgramOpportunity OU ServiceRequest regroupées, cf. applyInitiativeCommand,
// rules.ts) mais ne le faisait jamais progresser au-delà de "cadrage"
// (aucune commande n'assignait autre chose — audit P2.5, confirmé par
// grep). Ce fichier ferme ce vide, avec la même discipline que le reste du
// pipeline de connaissance (knowledge-pipeline.ts) : aucune progression
// automatique, toujours un geste humain explicite, toujours audité
// (withAudit — même mécanisme, pas un second système d'événements).
//
// Transitions strictement séquentielles (cadrage → financee → execution →
// terminee) — délibérément différent du graphe plus souple de
// update_collective_need_status/update_program_opportunity_status (ces
// deux-là acceptent plusieurs statuts non terminaux depuis un même point
// car leur cycle de vie n'est pas linéaire). Celui d'un Programme l'est :
// on ne peut pas instruire un financement avant d'avoir cadré, ni exécuter
// avant d'avoir financé, ni revenir en arrière une fois avancé (mandat §3,
// interdiction explicite de cadrage → terminee, terminee → execution,
// execution → cadrage). Pas de "suspendu"/"annulé" dans ce lot (mandat §3)
// — l'énumération Initiative["status"] n'est pas étendue.
import type { Command, CollectiveNeed, Initiative, ProductState, ProgramOpportunity, ServiceRequest } from "./types";
import { withAudit } from "./rules";
import { resolveSourceRefDisplay, type ResolvedSource } from "./situation-narrative";

const INITIATIVE_LEGAL_TRANSITIONS: Record<Initiative["status"], Initiative["status"][]> = {
  cadrage: ["financee"],
  financee: ["execution"],
  execution: ["terminee"],
  terminee: []
};

// --- Portes de transition (mandat §5/§7) ---------------------------------
//
// cadrage → financee — audit du mandat §5 ("Initiative.budgetStatus +
// Funding[] peuvent-ils supporter une règle minimale sûre ?"), résultat
// documenté ici plutôt que supposé : Funding[] est structurellement
// INSCRIPTIBLE PAR AUCUNE commande existante du domaine — create_initiative
// (rules.ts) initialise toujours `funding: []`, et aucune autre commande de
// tout le Core ne mute jamais Initiative.funding par la suite (vérifié par
// lecture exhaustive de rules.ts/knowledge-pipeline.ts/impact.ts/
// field-mission.ts/actor-network.ts). Un Funding "confirme" n'existe
// aujourd'hui que dans les fixtures statiques du Demo World (jamais
// produit par un geste humain réel) — s'appuyer dessus pour une porte de
// transition aurait fabriqué une preuve inatteignable en dehors de la
// démo, l'exact inverse d'une "porte non-cosmétique". Ajouter une nouvelle
// commande pour rendre Funding[] réellement inscriptible sort du périmètre
// de ce lot (aucun geste de ce type n'est demandé par le mandat, et cela
// rouvrirait la question de l'identité du financeur que le mandat exclut
// explicitement — §5, §17). Conformément au mandat ("si les données ne
// supportent pas une porte fiable, utiliser la validation la plus faible
// mais défendable, et le documenter") : la porte retenue s'appuie
// uniquement sur budgetStatus === "valide" — seul champ que le domaine
// permet réellement de fixer (create_initiative accepte budgetStatus
// directement, y compris "valide", dès lors qu'un montant est fourni).
// "Financée" se lit alors honnêtement comme "le budget a été arrêté", pas
// "un financeur identifié s'est engagé" — la nuance reste réelle mais
// jamais maquillée en vérité comptable plus forte qu'elle ne l'est.
// Funding[] reste dette technique documentée (cf. rapport de lot §15),
// pas ignorée en silence. Ne jamais déduire un financement de la seule
// présence de budgetFcfa (mandat §5, garde-fou explicite) : budgetStatus
// reste le seul signal utilisé, jamais le montant seul.
function canTransitionToFinancee(initiative: Initiative): boolean {
  return initiative.budgetStatus === "valide";
}

// execution → terminee (mandat §7) : jamais un flip cosmétique — un
// programme ne peut être déclaré achevé sans avoir produit au moins un
// Result, le seul fait vérifiable que le modèle porte aujourd'hui pour
// répondre à « ce programme a-t-il produit quelque chose ? ». Volontairement
// PAS d'exigence d'Outcome (l'effet peut rester non confirmé) ni
// d'ImpactEvidence (l'impact peut légitimement rester non prouvé, mandat
// §7 explicite) — Result seul est un fait ; Outcome et Impact restent des
// affirmations à un niveau de preuve que ce lot ne rend pas obligatoire
// pour clore un programme.
function canTransitionToTerminee(state: ProductState, initiative: Initiative): boolean {
  return state.results.some((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === initiative.id);
}

function applyUpdateInitiativeStatus(state: ProductState, command: Extract<Command, { type: "update_initiative_status" }>): ProductState {
  const initiative = state.initiatives.find((item) => item.id === command.initiativeId);
  if (!initiative) throw new Error("Programme introuvable.");

  const legalNextStatuses = INITIATIVE_LEGAL_TRANSITIONS[initiative.status];
  if (!legalNextStatuses.includes(command.status)) {
    throw new Error(`Transition illégale : un programme en « ${initiative.status} » ne peut pas passer directement à « ${command.status} ».`);
  }
  if (command.status === "financee" && !canTransitionToFinancee(initiative)) {
    throw new Error("Le passage en financement exige un budget validé (pas seulement estimé).");
  }
  if (command.status === "terminee" && !canTransitionToTerminee(state, initiative)) {
    throw new Error("Un programme ne peut être déclaré achevé sans au moins un résultat enregistré.");
  }

  const previousStatus = initiative.status;
  const updated: Initiative = { ...initiative, status: command.status };
  const next: ProductState = { ...state, initiatives: state.initiatives.map((item) => (item.id === initiative.id ? updated : item)) };
  // Détail d'audit (mandat §4 : "préserver acteur/horodatage/statut
  // précédent+nouveau") — la transition elle-même porte déjà actorId/at
  // via withAudit ; ce texte ajoute le seul élément qu'AuditEntry ne
  // structure pas nativement (action/detail restent des chaînes) : le
  // couple statut précédent → statut nouveau, plus la note optionnelle si
  // l'humain en a saisi une (mandat §4 : "note concise si cohérent avec
  // les patterns existants").
  const detail = command.note?.trim() ? `${previousStatus} → ${command.status} — ${command.note.trim()}` : `${previousStatus} → ${command.status}`;
  return withAudit(next, command.actorId, "initiative", initiative.id, command.type, detail);
}

export function applyInitiativeLifecycleCommand(state: ProductState, command: Extract<Command, { type: "update_initiative_status" }>): ProductState {
  switch (command.type) {
    case "update_initiative_status":
      return applyUpdateInitiativeStatus(state, command);
  }
}

// --- Traçabilité inverse de l'origine (mandat §8/§9) ---------------------
//
// Un Programme se crée par exactement deux voies légitimes, préservées
// telles quelles par ce lot (mandat §8) : (A) une ProgramOpportunity
// qualifiée, elle-même née d'un CollectiveNeed qualifié, lui-même
// documenté par des sourceRefs réels (Finding/Signal/ServiceRequest/…) ;
// (B) des ServiceRequest regroupées directement (voie legacy, sans
// CollectiveNeed ni ProgramOpportunity). traceInitiativeOrigin résout
// mécaniquement la chaîne réellement présente dans ProductState — jamais
// de reconstruction texte libre, jamais d'invention d'un maillon manquant
// (mandat §9 : un programme historique/démo sans programOpportunityId,
// ex. init-immatriculation, reste honnêtement "unattributed", jamais
// fabriqué). Projection pure, aucun stockage — même discipline que
// buildActorNetworkProfile (actor-network.ts) et le reste du domaine.
export interface InitiativeOriginTrace {
  kind: "program_opportunity" | "grouped_service_requests" | "unattributed";
  programOpportunity?: ProgramOpportunity;
  collectiveNeed?: CollectiveNeed;
  collectiveNeedSources: ResolvedSource[];
  serviceRequests: ServiceRequest[];
}

export function traceInitiativeOrigin(state: ProductState, initiative: Initiative): InitiativeOriginTrace {
  if (initiative.programOpportunityId) {
    const programOpportunity = state.programOpportunities.find((item) => item.id === initiative.programOpportunityId);
    const collectiveNeed = programOpportunity ? state.collectiveNeeds.find((item) => item.id === programOpportunity.collectiveNeedId) : undefined;
    const collectiveNeedSources = collectiveNeed
      ? collectiveNeed.sourceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is ResolvedSource => Boolean(item))
      : [];
    return { kind: "program_opportunity", programOpportunity, collectiveNeed, collectiveNeedSources, serviceRequests: [] };
  }
  if (initiative.serviceRequestIds) {
    const serviceRequests = initiative.serviceRequestIds
      .map((requestId) => state.serviceRequests.find((item) => item.id === requestId))
      .filter((item): item is ServiceRequest => Boolean(item));
    return { kind: "grouped_service_requests", collectiveNeedSources: [], serviceRequests };
  }
  return { kind: "unattributed", collectiveNeedSources: [], serviceRequests: [] };
}
