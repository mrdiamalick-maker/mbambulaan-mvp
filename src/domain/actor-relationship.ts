// Actor & Relationship Foundation — P2.2-A (mandat "Actor & Relationship
// Foundation"). L'audit P2.2 a confirmé que Mbàmbulaan sait déjà QUI
// compose l'écosystème (Actor, Organization) et OÙ (territoires), mais ne
// peut répondre structurellement à aucune de ces questions : un Actor
// appartient-il vraiment à son Organization ? Peut-il la représenter ?
// Agit-il comme relais de collecte pour son compte ? Ce fichier ferme ce
// vide avec un seul objet métier léger (ActorRelationship, types.ts) et
// deux légalités de vérification partagées — jamais un moteur ABAC/graphe,
// jamais une inférence d'une relation à partir d'une autre (mandat §4).
//
// TERRAIN SIMULÉ / PROJETÉ (rappel du mandat) : ce modèle est une première
// hypothèse démontrable, pas une ontologie définitive de la filière.
import type { Command, Organization, ProductState, VerificationStatus } from "./types";
import { id, timestamp, withAudit } from "./rules";

// Légalité de vérification (mandat §9) — partagée par ActorRelationship ET
// Organization : même grammaire à 3 paliers (VerificationStatus,
// types.ts), même règle "aucun saut, aucun retour arrière". Un seul
// helper plutôt que deux implémentations qui pourraient diverger avec le
// temps (même discipline que INITIATIVE_LEGAL_TRANSITIONS, P2.5-A).
const VERIFICATION_LEGAL_TRANSITIONS: Record<VerificationStatus, VerificationStatus[]> = {
  declaree: ["documentee"],
  documentee: ["verifiee"],
  verifiee: []
};

function assertLegalVerificationTransition(current: VerificationStatus, next: VerificationStatus) {
  if (!VERIFICATION_LEGAL_TRANSITIONS[current].includes(next)) {
    throw new Error(`Transition illégale : un statut de vérification « ${current} » ne peut pas passer directement à « ${next} ».`);
  }
}

// --- create_actor_relationship -------------------------------------------
//
// Validation référentielle (mandat §8) : subjectActorId et organizationId
// doivent tous deux résoudre vers un objet réel — aucune relation
// orpheline. Doublon exact (même actorId + organizationId + kind) refusé :
// aucun statut "inactif" n'existe dans ce lot (mandat §7, dette documentée
// ci-dessous), donc toute relation déjà créée avec ce triplet compte comme
// active, quel que soit son niveau de vérification.
function applyCreateActorRelationship(state: ProductState, command: Extract<Command, { type: "create_actor_relationship" }>): ProductState {
  const subject = state.actors.find((item) => item.id === command.subjectActorId);
  if (!subject) throw new Error("Acteur introuvable.");
  const organization = state.organizations.find((item) => item.id === command.organizationId);
  if (!organization) throw new Error("Organisation introuvable.");

  const duplicate = state.actorRelationships.some(
    (item) => item.actorId === command.subjectActorId && item.organizationId === command.organizationId && item.kind === command.kind
  );
  if (duplicate) throw new Error("Cette relation existe déjà — même acteur, même organisation, même nature.");

  const relationship = {
    id: id("relation"),
    actorId: command.subjectActorId,
    organizationId: command.organizationId,
    kind: command.kind,
    // Toujours "declaree" à la création (mandat §5/§6) — jamais choisi par
    // le créateur : même discipline que PartnerService.trust
    // (qualify_signal_as_network_capacity, actor-network.ts), une relation
    // fraîchement enregistrée ne prouve rien de plus qu'une déclaration.
    verificationStatus: "declaree" as const,
    createdAt: timestamp(),
    createdByActorId: command.actorId,
    note: command.note?.trim() || undefined
  };

  const next: ProductState = { ...state, actorRelationships: [relationship, ...state.actorRelationships] };
  return withAudit(next, command.actorId, "actor_relationship", relationship.id, command.type, `${subject.name} · ${organization.name}`);
}

// --- update_actor_relationship_verification -------------------------------
function applyUpdateActorRelationshipVerification(state: ProductState, command: Extract<Command, { type: "update_actor_relationship_verification" }>): ProductState {
  const relationship = state.actorRelationships.find((item) => item.id === command.actorRelationshipId);
  if (!relationship) throw new Error("Relation introuvable.");
  assertLegalVerificationTransition(relationship.verificationStatus, command.verificationStatus);

  const updated = {
    ...relationship,
    verificationStatus: command.verificationStatus,
    reviewedAt: timestamp(),
    reviewedByActorId: command.actorId,
    note: command.note?.trim() || relationship.note
  };
  const next: ProductState = { ...state, actorRelationships: state.actorRelationships.map((item) => (item.id === relationship.id ? updated : item)) };
  return withAudit(next, command.actorId, "actor_relationship", relationship.id, command.type, `${relationship.verificationStatus} → ${command.verificationStatus}`);
}

// --- update_organization_verification -------------------------------------
//
// Organization.verificationStatus existe depuis LOT 7 mais aucune commande
// ne le mutait jamais (audit P2.2, confirmé). "Absent" est traité comme
// "declaree" pour la seule question de légalité (mandat §9) — jamais
// réécrit rétroactivement tant qu'aucune transition n'est demandée. Rôles
// habilités : les mêmes que la gouvernance réseau déjà en vigueur
// (server/permissions.ts) — mandat §9, "réutiliser les rôles de
// coordination/administration déjà les plus cohérents" ; l'autorité
// institutionnelle définitive de cette vérification reste à valider avec
// les partenaires réels (dette documentée, rapport de lot).
function applyUpdateOrganizationVerification(state: ProductState, command: Extract<Command, { type: "update_organization_verification" }>): ProductState {
  const organization = state.organizations.find((item) => item.id === command.organizationId);
  if (!organization) throw new Error("Organisation introuvable.");
  const current: VerificationStatus = organization.verificationStatus ?? "declaree";
  assertLegalVerificationTransition(current, command.verificationStatus);

  const updated: Organization = { ...organization, verificationStatus: command.verificationStatus };
  const next: ProductState = { ...state, organizations: state.organizations.map((item) => (item.id === organization.id ? updated : item)) };
  const detail = command.note?.trim() ? `${current} → ${command.verificationStatus} — ${command.note.trim()}` : `${current} → ${command.verificationStatus}`;
  return withAudit(next, command.actorId, "organization", organization.id, command.type, detail);
}

export function applyActorRelationshipCommand(
  state: ProductState,
  command: Extract<Command, { type: "create_actor_relationship" | "update_actor_relationship_verification" | "update_organization_verification" }>
): ProductState {
  switch (command.type) {
    case "create_actor_relationship":
      return applyCreateActorRelationship(state, command);
    case "update_actor_relationship_verification":
      return applyUpdateActorRelationshipVerification(state, command);
    case "update_organization_verification":
      return applyUpdateOrganizationVerification(state, command);
  }
}

// --- Projections pures -----------------------------------------------------

// relationshipsForOrganization / relationshipsForActor — lues à la demande
// depuis ProductState, jamais dupliquées dans Actor/Organization
// eux-mêmes (même discipline que buildOrganizationNetworkProfile,
// actor-network.ts). Exportées séparément de actor-network.ts : ce fichier
// porte la logique d'écriture (commandes) ET les projections de lecture
// qui en dépendent directement, actor-network.ts reste le point d'entrée
// des profils composés (mandat §14, "étendre buildActorNetworkProfile
// plutôt que dupliquer").
export function relationshipsForOrganization(state: ProductState, organizationId: string) {
  return state.actorRelationships.filter((item) => item.organizationId === organizationId);
}

export function relationshipsForActor(state: ProductState, actorId: string) {
  return state.actorRelationships.filter((item) => item.actorId === actorId);
}

// isAuthorizedRepresentative — la seule question que le mandat demande de
// pouvoir répondre structurellement (§1/§20) : "cet Actor peut-il parler
// au nom de cette Organization ?". Jamais déduite de organizationId ni de
// "membre" (mandat §20, garde-fou explicite) — uniquement une relation
// "representant" réelle, quel que soit son niveau de vérification (même
// une représentation "declaree" reste une représentation déclarée, pas
// une absence de mandat).
export function isAuthorizedRepresentative(state: ProductState, actorId: string, organizationId: string): boolean {
  return state.actorRelationships.some((item) => item.actorId === actorId && item.organizationId === organizationId && item.kind === "representant");
}
