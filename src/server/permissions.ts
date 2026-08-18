import type { Command, Role } from "@/domain/types";

const all: Command["type"][] = [
  "create_signal",
  "convert_message_to_signal",
  "qualify",
  "prioritize",
  "coordinate",
  "start_intervention",
  "wait",
  "resume",
  "record_result",
  "close",
  "create_decision",
  "record_evidence",
  "log_communication",
  "create_service_request",
  "plan_field_commitment",
  "announce_return",
  "confirm_arrival",
  "record_landing",
  "confirm_weighing",
  "create_lots",
  "accept_opportunity",
  "complete_logistics",
  "create_community_post",
  "convert_post",
  "flag_price",
  "create_initiative",
  "reset_demo"
];

const allowed: Record<Role, Command["type"][]> = {
  administrateur: all,
  operateur: [
    "create_signal",
    "convert_message_to_signal",
    "qualify",
    "confirm_arrival",
    "record_landing",
    "confirm_weighing",
    "create_lots",
    "record_evidence",
    "log_communication",
    "create_service_request",
    "create_community_post",
    "convert_post",
    "flag_price",
    // Relais généralisé, tranche 1/N (arbitrage CEO 2026-08-15) : l'opérateur
    // n'est pas un acteur de la demande (ni mareyeur ni transformateur) et
    // n'a jamais eu de raison légitime d'accepter une opportunité "en son
    // nom propre" — ces deux commandes ne lui sont ouvertes que pour
    // relayer, via onBehalfOfActorId (cf. RELAY_ROLES ci-dessous).
    "accept_opportunity",
    "complete_logistics"
  ],
  // log_communication ajouté au Lot 6 : le capitaine simule désormais
  // lui-même un appel/WhatsApp depuis /app/terrain (§11.1 du spec
  // maître), plutôt que ce geste ne soit réservé qu'aux rôles de
  // coordination.
  capitaine: ["announce_return", "create_signal", "log_communication", "create_community_post"],
  mareyeur: ["accept_opportunity", "complete_logistics", "create_service_request", "create_community_post", "convert_post"],
  transformateur: ["accept_opportunity", "complete_logistics", "create_service_request", "create_community_post", "convert_post"],
  prestataire: ["start_intervention", "wait", "resume", "record_result", "record_evidence", "create_community_post"],
  gestionnaire_organisation: ["prioritize", "coordinate", "create_decision", "create_initiative", "accept_opportunity", "create_community_post", "convert_post"],
  coordinateur: all,
  institution: ["create_signal", "prioritize", "coordinate", "create_decision", "create_initiative", "log_communication", "plan_field_commitment", "close", "flag_price", "reset_demo"],
  partenaire: ["create_community_post"]
};

// Relais généralisé, tranche 1/N (gap analysis + arbitrage CEO 2026-08-15) :
// qui a le droit d'agir "pour le compte de" un autre acteur. Volontairement
// distinct de `allowed` — ce n'est pas "qui peut soumettre cette commande"
// mais "qui peut la soumettre en désignant quelqu'un d'autre comme
// bénéficiaire". Limité aux rôles qui ont un rôle de relais légitime
// (poste de quai, coordination, supervision), jamais aux rôles de demande
// eux-mêmes (mareyeur/transformateur agissent toujours en leur nom propre).
const RELAY_ROLES: Role[] = ["operateur", "coordinateur", "administrateur"];

export function assertCan(role: Role, command: Command) {
  if (!allowed[role].includes(command.type)) {
    throw new Error("Votre mandat ne permet pas cette action.");
  }
  if ("onBehalfOfActorId" in command && command.onBehalfOfActorId && !RELAY_ROLES.includes(role)) {
    throw new Error("Votre mandat ne permet pas d’agir pour le compte d’un autre acteur.");
  }
}
