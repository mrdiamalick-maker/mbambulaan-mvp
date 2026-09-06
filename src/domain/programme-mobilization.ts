// Programme Mobilization — P2.5-B (mandat "Ecosystem Mobilization
// Foundation"). Premier maillon du moteur CONNECTER : PROGRAMME →
// CAPABILITY NEEDED → RELEVANT ORGANIZATIONS → EXPLAINABLE CANDIDATES →
// HUMAN SELECTION → CONTACT → ENGAGEMENT/DECLINE.
//
// Principe fondateur (mandat §1), rappelé ici car il gouverne tout ce
// fichier : CAPABLE ≠ CONSIDÉRÉ ≠ CONTACTÉ ≠ ENGAGÉ. La projection de
// candidats ci-dessous ne mute JAMAIS ProductState — elle ne fait que
// répondre "ces organisations pourraient être pertinentes". Le premier
// écrit n'arrive qu'au geste humain explicite "Considérer"
// (create_programme_organization_engagement).
import type {
  Actor,
  ActorRelationship,
  Command,
  Initiative,
  Organization,
  PartnerService,
  ProductState,
  ProgrammeOrganizationEngagement,
  ProgrammeOrganizationEngagementStatus
} from "./types";
import { id, timestamp, withAudit } from "./rules";
import { isAuthorizedRepresentative, relationshipsForOrganization } from "./actor-relationship";

// --- Projection pure : candidats ------------------------------------------

export interface ProgrammeCapabilityCandidate {
  organization: Organization;
  partnerService: PartnerService;
  // matchingTerritoryIds — intersection réelle entre les territoires du
  // Programme et ceux du PartnerService (mandat §4 : "intersects", jamais
  // "includes" — un service couvrant 8 territoires dont 1 seul concerne
  // ce programme reste un candidat honnête, pas un rejet).
  matchingTerritoryIds: string[];
  // representatives — TOUTES les relations "representant" connues pour
  // cette organisation, jamais une seule "choisie à sa place" (mandat §4 :
  // "ne pas exiger de représentant pour montrer l'organisation comme
  // candidate" — ce tableau peut être vide).
  representatives: Array<{ relationship: ActorRelationship; actor?: Actor }>;
}

// findProgrammeCapabilityCandidates — pure, ne mute jamais state (mandat
// §5, Test G). Aucun score caché : le tri est déterministe par nom
// d'organisation (mandat §20, "pas de meilleur candidat inventé") ;
// trust/status restent des FAITS affichables, jamais transformés en
// classement.
export function findProgrammeCapabilityCandidates(
  state: ProductState,
  initiative: Initiative,
  capabilityCategory: PartnerService["category"]
): ProgrammeCapabilityCandidate[] {
  const candidates: ProgrammeCapabilityCandidate[] = [];
  for (const service of state.partnerServices) {
    if (service.category !== capabilityCategory) continue;
    const matchingTerritoryIds = service.territoryIds.filter((tid) => initiative.territoryIds.includes(tid));
    if (matchingTerritoryIds.length === 0) continue;
    const organization = state.organizations.find((item) => item.id === service.organizationId);
    if (!organization) continue;
    const representatives = relationshipsForOrganization(state, organization.id)
      .filter((item) => item.kind === "representant")
      .map((relationship) => ({ relationship, actor: state.actors.find((item) => item.id === relationship.actorId) }));
    candidates.push({ organization, partnerService: service, matchingTerritoryIds, representatives });
  }
  return candidates.sort((a, b) => a.organization.name.localeCompare(b.organization.name, "fr"));
}

// --- Légalité du cycle de vie (mandat §6) ---------------------------------

const ENGAGEMENT_LEGAL_TRANSITIONS: Record<ProgrammeOrganizationEngagementStatus, ProgrammeOrganizationEngagementStatus[]> = {
  considered: ["contacted"],
  contacted: ["engaged", "declined"],
  engaged: [],
  declined: []
};

// --- create_programme_organization_engagement -----------------------------
//
// Validation référentielle stricte (mandat §8) : initiativeId et
// organizationId doivent résoudre vers des objets réels. representativeActorId
// (facultatif) doit à la fois résoudre vers un Actor réel ET porter une
// ActorRelationship "representant" pour cette Organization — jamais
// déduit, jamais accepté sur simple présence dans Actor.organizationId
// (mandat §8, même garde-fou que P2.2-A §20 : membre ≠ représentant).
//
// Doublon (Test I, choix documenté) : REJETÉ, jamais réutilisé
// silencieusement — même discipline que create_actor_relationship
// (P2.2-A) : un doublon exact (même initiative + organisation + rôle +
// capacité) signale probablement une double soumission accidentelle,
// pas une intention réelle de considérer deux fois la même chose pour la
// même raison. L'humain qui veut vraiment reconsidérer choisit un rôle
// ou une capacité différents, ou agit sur l'engagement existant.
function applyCreateProgrammeOrganizationEngagement(
  state: ProductState,
  command: Extract<Command, { type: "create_programme_organization_engagement" }>
): ProductState {
  const initiative = state.initiatives.find((item) => item.id === command.initiativeId);
  if (!initiative) throw new Error("Programme introuvable.");
  const organization = state.organizations.find((item) => item.id === command.organizationId);
  if (!organization) throw new Error("Organisation introuvable.");

  if (command.representativeActorId) {
    const actor = state.actors.find((item) => item.id === command.representativeActorId);
    if (!actor) throw new Error("Représentant introuvable.");
    if (!isAuthorizedRepresentative(state, command.representativeActorId, command.organizationId)) {
      throw new Error("Cet acteur n'est pas enregistré comme représentant de cette organisation.");
    }
  }

  const duplicate = state.programmeOrganizationEngagements.some(
    (item) =>
      item.initiativeId === command.initiativeId &&
      item.organizationId === command.organizationId &&
      item.role === command.role &&
      item.capabilityCategory === command.capabilityCategory
  );
  if (duplicate) throw new Error("Cette organisation est déjà considérée pour ce programme, ce rôle et cette capacité.");

  const engagement: ProgrammeOrganizationEngagement = {
    id: id("engagement"),
    initiativeId: command.initiativeId,
    organizationId: command.organizationId,
    role: command.role,
    capabilityCategory: command.capabilityCategory,
    // Toujours "considered" à la création (mandat §1/§5) — jamais un
    // statut plus avancé choisi par le créateur : un rapprochement de
    // capacité, même explicite, n'est jamais lui-même un contact ou un
    // engagement.
    status: "considered",
    createdAt: timestamp(),
    createdByActorId: command.actorId,
    representativeActorId: command.representativeActorId,
    note: command.note?.trim() || undefined
  };

  const next: ProductState = { ...state, programmeOrganizationEngagements: [engagement, ...state.programmeOrganizationEngagements] };
  return withAudit(next, command.actorId, "programme_organization_engagement", engagement.id, command.type, `${organization.name} · ${command.role}`);
}

// --- update_programme_organization_engagement_status -----------------------
function applyUpdateProgrammeOrganizationEngagementStatus(
  state: ProductState,
  command: Extract<Command, { type: "update_programme_organization_engagement_status" }>
): ProductState {
  const engagement = state.programmeOrganizationEngagements.find((item) => item.id === command.engagementId);
  if (!engagement) throw new Error("Engagement introuvable.");

  const legalNextStatuses = ENGAGEMENT_LEGAL_TRANSITIONS[engagement.status];
  if (!legalNextStatuses.includes(command.status)) {
    throw new Error(`Transition illégale : un engagement en « ${engagement.status} » ne peut pas passer directement à « ${command.status} ».`);
  }

  const previousStatus = engagement.status;
  const updated: ProgrammeOrganizationEngagement = {
    ...engagement,
    status: command.status,
    updatedAt: timestamp(),
    updatedByActorId: command.actorId,
    note: command.note?.trim() || engagement.note
  };
  const next: ProductState = {
    ...state,
    programmeOrganizationEngagements: state.programmeOrganizationEngagements.map((item) => (item.id === engagement.id ? updated : item))
  };
  return withAudit(next, command.actorId, "programme_organization_engagement", engagement.id, command.type, `${previousStatus} → ${command.status}`);
}

export function applyProgrammeMobilizationCommand(
  state: ProductState,
  command: Extract<Command, { type: "create_programme_organization_engagement" | "update_programme_organization_engagement_status" }>
): ProductState {
  switch (command.type) {
    case "create_programme_organization_engagement":
      return applyCreateProgrammeOrganizationEngagement(state, command);
    case "update_programme_organization_engagement_status":
      return applyUpdateProgrammeOrganizationEngagementStatus(state, command);
  }
}

// engagementsForInitiative — lecture à la demande, jamais dupliquée sur
// Initiative lui-même (même discipline que relationshipsForOrganization,
// P2.2-A).
export function engagementsForInitiative(state: ProductState, initiativeId: string): ProgrammeOrganizationEngagement[] {
  return state.programmeOrganizationEngagements.filter((item) => item.initiativeId === initiativeId);
}

// engagementsForOrganization — réutilisée par le lien retour Réseau
// (mandat §16), lu uniquement pour status "engaged".
export function engagementsForOrganization(state: ProductState, organizationId: string): ProgrammeOrganizationEngagement[] {
  return state.programmeOrganizationEngagements.filter((item) => item.organizationId === organizationId);
}
