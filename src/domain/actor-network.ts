// Actor & Trust Network — LOT 7 (mandat "rendre l'écosystème mobilisable").
// Mbàmbulaan sait déjà QUI compose l'écosystème (Actor, Organization),
// OÙ (territoires), et QUELLES CAPACITÉS existent (Infrastructure,
// PartnerService) — ce fichier ne recrée aucun de ces objets. Il fournit :
//
// 1. Deux projections PURES (buildActorNetworkProfile /
//    buildOrganizationNetworkProfile) — aucun stockage, calculées à
//    chaque appel à partir de ProductState, même discipline que
//    territory-intelligence.ts (LOT 5). La confiance y est EXPLICABLE
//    (identité déclarée/documentée/vérifiée, capacités déclarées/
//    documentées, engagements ouverts/terminés) — jamais un score unique
//    (mandat §5/§40 TEST B).
//
// 2. La commande qualify_signal_as_network_capacity — le seul geste qui
//    fait entrer une PublicContribution qualifiée dans le Network :
//    jamais automatique (mandat §12), toujours une décision humaine
//    explicite qui rattache à une Organization existante OU crée une
//    "organisation candidate" (verificationStatus "declaree"), puis crée
//    un PartnerService qui conserve sa provenance (sourceRef → Signal).
import type { Actor, Command, Commitment, FieldMission, Infrastructure, Initiative, Organization, PartnerService, ProductState, Signal } from "./types";
import { id, timestamp, withAudit } from "./rules";

// --- Projections pures --------------------------------------------------

// Niveau d'identité explicable (mandat §5) — dérivé du seul champ
// aujourd'hui disponible (Actor.verified), jamais une note calculée.
// "déclarée" reste le niveau par défaut honnête tant qu'aucune
// vérification n'a eu lieu — jamais présenté comme un manque.
export type IdentityLevel = "declaree" | "verifiee";

export interface ActorNetworkProfile {
  actor: Actor;
  identityLevel: IdentityLevel;
  organization?: Organization;
  territories: { id: string; name: string }[];
  openCommitments: Commitment[];
  closedCommitments: Commitment[];
  missions: FieldMission[];
  initiatives: Initiative[];
}

export function buildActorNetworkProfile(state: ProductState, actorId: string): ActorNetworkProfile | undefined {
  const actor = state.actors.find((item) => item.id === actorId);
  if (!actor) return undefined;

  const organization = state.organizations.find((item) => item.id === actor.organizationId);
  const territories = actor.territoryIds
    .map((tid) => state.territories.find((item) => item.id === tid))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ id: item.id, name: item.name }));

  const allCommitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((item) => item.actorId === actorId);
  const openCommitments = allCommitments.filter((item) => item.status !== "terminee");
  const closedCommitments = allCommitments.filter((item) => item.status === "terminee");

  const missions = state.fieldMissions.filter((item) => item.responsibleActorId === actorId);
  const initiatives = state.initiatives.filter((item) => item.ownerId === actorId);

  return {
    actor,
    identityLevel: actor.verified ? "verifiee" : "declaree",
    organization,
    territories,
    openCommitments,
    closedCommitments,
    missions,
    initiatives
  };
}

export interface OrganizationNetworkProfile {
  organization: Organization;
  members: Actor[];
  verifiedMembers: Actor[];
  territories: { id: string; name: string }[];
  infrastructures: Infrastructure[];
  services: PartnerService[];
  openCommitments: Commitment[];
  closedCommitments: Commitment[];
  initiatives: Initiative[];
}

export function buildOrganizationNetworkProfile(state: ProductState, organizationId: string): OrganizationNetworkProfile | undefined {
  const organization = state.organizations.find((item) => item.id === organizationId);
  if (!organization) return undefined;

  const members = state.actors.filter((item) => item.organizationId === organizationId);
  const memberIds = new Set(members.map((item) => item.id));
  const verifiedMembers = members.filter((item) => item.verified);
  const territoryIds = new Set(members.flatMap((item) => item.territoryIds));
  const territories = [...territoryIds]
    .map((tid) => state.territories.find((item) => item.id === tid))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ id: item.id, name: item.name }));

  const infrastructures = state.infrastructures.filter((item) => item.organizationId === organizationId);
  const services = state.partnerServices.filter((item) => item.organizationId === organizationId);

  const allCommitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((item) => memberIds.has(item.actorId));
  const openCommitments = allCommitments.filter((item) => item.status !== "terminee");
  const closedCommitments = allCommitments.filter((item) => item.status === "terminee");

  const initiatives = state.initiatives.filter((item) => memberIds.has(item.ownerId));

  return {
    organization,
    members,
    verifiedMembers,
    territories,
    infrastructures,
    services,
    openCommitments,
    closedCommitments,
    initiatives
  };
}

// --- Commande : qualification humaine d'un Signal en capacité réseau ---

// applyQualifySignalAsNetworkCapacity (mandat §11/§12/§13/§20) — le seul
// chemin par lequel une contribution/signal entrant devient une capacité
// visible du Network. Jamais déclenché automatiquement par la simple
// existence d'un Signal ou d'une PublicContribution (mandat §12, TEST C) :
// toujours une commande explicite d'un coordinateur/gestionnaire.
//
// Exactement une des deux options de rattachement : organizationId
// (organisation déjà connue du Core) OU newOrganization (organisation
// candidate créée à la volée, verificationStatus "declaree" — jamais
// "verifiee" à la création, mandat §13). Pas de dédoublonnage
// automatique (mandat §14) : l'humain choisit, cette fonction ne fait
// que le geste choisi.
function applyQualifySignalAsNetworkCapacity(
  state: ProductState,
  command: Extract<Command, { type: "qualify_signal_as_network_capacity" }>
): ProductState {
  const signal = state.signals.find((item) => item.id === command.signalId);
  if (!signal) throw new Error("Signal introuvable.");

  if (!command.organizationId === !command.newOrganization) {
    throw new Error("Choisissez soit une organisation existante, soit la création d'une organisation candidate — jamais les deux, jamais aucune.");
  }
  if (!command.service.name.trim()) throw new Error("Le nom de la capacité/service est obligatoire.");
  if (!command.service.activationConditions.trim()) throw new Error("Les conditions d'activation sont obligatoires — une capacité déclarée n'est pas une disponibilité immédiate.");
  requireTerritoriesForNetwork(state, command.service.territoryIds);

  let next = state;
  let organizationId: string;

  if (command.organizationId) {
    const existing = state.organizations.find((item) => item.id === command.organizationId);
    if (!existing) throw new Error("Organisation introuvable.");
    organizationId = existing.id;
  } else if (command.newOrganization) {
    if (!command.newOrganization.name.trim()) throw new Error("Le nom de la nouvelle organisation est obligatoire.");
    const organization: Organization = {
      id: id("org"),
      name: command.newOrganization.name.trim(),
      type: command.newOrganization.type,
      // Organisation candidate (mandat §13) : jamais créée "vérifiée" —
      // une contribution publique déclare son existence, elle ne la
      // prouve pas. La vérification reste un geste ultérieur distinct,
      // hors périmètre de cette commande.
      verificationStatus: "declaree"
    };
    next = { ...next, organizations: [...next.organizations, organization] };
    organizationId = organization.id;
  } else {
    throw new Error("Choisissez une organisation.");
  }

  const service: PartnerService = {
    id: id("service"),
    organizationId,
    name: command.service.name.trim(),
    category: command.service.category,
    territoryIds: command.service.territoryIds,
    // "reference" (pas "qualifie" ni "a_activer") — mandat §20 point 4,
    // "aucun service actif automatiquement" : une capacité issue d'une
    // qualification humaine reste au niveau le plus prudent, jamais
    // présentée comme déjà activable.
    status: "reference",
    // "declaree" (pas "verifiee"/"documentee") — auto-déclarée via le
    // Public, jamais présentée comme vérifiée par ce seul geste.
    trust: "declaree",
    activationConditions: command.service.activationConditions.trim(),
    sourceRef: { objectType: "signal", objectId: signal.id },
    updatedAt: timestamp()
  };

  const qualifiedSignal: Signal = {
    ...signal,
    disposition: "qualifie",
    dispositionNote: `Qualifié comme capacité réseau : ${service.name}.`
  };

  next = {
    ...next,
    partnerServices: [...next.partnerServices, service],
    signals: next.signals.map((item) => (item.id === signal.id ? qualifiedSignal : item))
  };

  return withAudit(next, command.actorId, "partner_service", service.id, command.type, service.name);
}

function requireTerritoriesForNetwork(state: ProductState, territoryIds: string[]) {
  if (territoryIds.length === 0) throw new Error("Une capacité réseau doit couvrir au moins un territoire.");
  for (const territoryId of territoryIds) {
    if (!state.territories.some((item) => item.id === territoryId)) throw new Error(`Territoire inconnu : ${territoryId}.`);
  }
}

export function applyActorNetworkCommand(
  state: ProductState,
  command: Extract<Command, { type: "qualify_signal_as_network_capacity" }>
): ProductState {
  switch (command.type) {
    case "qualify_signal_as_network_capacity":
      return applyQualifySignalAsNetworkCapacity(state, command);
  }
}

