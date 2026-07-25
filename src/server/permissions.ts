import type { Command, Role } from "@/domain/types";

const allowed: Record<Role, Command["type"][]> = {
  agent_terrain: ["create_signal", "qualify"],
  coordinateur: ["create_signal", "qualify", "prioritize", "coordinate", "start_intervention", "wait", "resume", "record_result", "close", "reset_demo"],
  responsable_initiative: ["coordinate", "start_intervention", "wait", "resume", "record_result"],
  decideur: ["prioritize", "coordinate", "close", "reset_demo"],
  partenaire: [],
  expert: ["qualify"],
  administrateur: ["create_signal", "qualify", "prioritize", "coordinate", "start_intervention", "wait", "resume", "record_result", "close", "reset_demo"]
};

export function assertCan(role: Role, command: Command) {
  if (!allowed[role].includes(command.type)) {
    throw new Error("Votre mandat ne permet pas cette action.");
  }
}
