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
    "create_community_post",
    "convert_post",
    "flag_price"
  ],
  capitaine: ["announce_return", "create_signal", "create_community_post"],
  mareyeur: ["accept_opportunity", "complete_logistics", "create_community_post", "convert_post"],
  transformateur: ["accept_opportunity", "complete_logistics", "create_community_post", "convert_post"],
  prestataire: ["start_intervention", "wait", "resume", "record_result", "create_community_post"],
  gestionnaire_organisation: ["prioritize", "coordinate", "create_decision", "accept_opportunity", "create_community_post", "convert_post"],
  coordinateur: all,
  institution: ["prioritize", "coordinate", "create_decision", "close", "flag_price", "reset_demo"],
  partenaire: ["create_community_post"]
};

export function assertCan(role: Role, command: Command) {
  if (!allowed[role].includes(command.type)) {
    throw new Error("Votre mandat ne permet pas cette action.");
  }
}
