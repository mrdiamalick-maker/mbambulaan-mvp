import type { Command, Role } from "@/domain/types";

const all: Command["type"][] = [
  "create_signal",
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
    "flag_price"
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

export function assertCan(role: Role, command: Command) {
  if (!allowed[role].includes(command.type)) {
    throw new Error("Votre mandat ne permet pas cette action.");
  }
}
