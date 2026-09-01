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
  // LOT 0 — pipeline de connaissance (mandat "aligner le Core métier avec
  // le Blueprint V1"). report_signal_and_open_situation/
  // convert_message_to_signal_and_situation reprennent respectivement les
  // mêmes mandats que create_signal/convert_message_to_signal (wrappers
  // legacy du même geste) ; les commandes du pipeline lui-même
  // (disposition, Finding, CollectiveNeed, ProgramOpportunity) suivent le
  // même mandat que create_decision/create_initiative — la qualification
  // et la promotion restent des gestes de coordination.
  "report_signal_and_open_situation",
  "convert_message_to_signal_and_situation",
  "update_signal_disposition",
  "promote_signal_to_situation",
  "record_finding",
  "update_finding_status",
  "promote_finding_to_situation",
  "create_collective_need",
  "update_collective_need_status",
  "create_program_opportunity",
  "update_program_opportunity_status",
  "reset_demo"
];

const allowed: Record<Role, Command["type"][]> = {
  administrateur: all,
  operateur: [
    "create_signal",
    "convert_message_to_signal",
    "report_signal_and_open_situation",
    "convert_message_to_signal_and_situation",
    "update_signal_disposition",
    "promote_signal_to_situation",
    "record_finding",
    "update_finding_status",
    "promote_finding_to_situation",
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
  capitaine: ["announce_return", "create_signal", "report_signal_and_open_situation", "log_communication", "create_community_post"],
  mareyeur: ["accept_opportunity", "complete_logistics", "create_service_request", "create_community_post", "convert_post"],
  transformateur: ["accept_opportunity", "complete_logistics", "create_service_request", "create_community_post", "convert_post"],
  prestataire: ["start_intervention", "wait", "resume", "record_result", "record_evidence", "create_community_post"],
  // complete_logistics ajouté (gap analysis Coordination, arbitrage CEO
  // 2026-08-18) : accept_opportunity seul laissait le mandat de
  // gestionnaire_organisation bloqué à mi-parcours du cycle
  // (Besoin → Capacité → Engagement → Résultat, cf. bande C13 de
  // CoordinationWorkspace.tsx) — il pouvait valider l'engagement mais
  // jamais confirmer le résultat de la même opportunité.
  gestionnaire_organisation: [
    "prioritize",
    "coordinate",
    "create_decision",
    "create_initiative",
    "update_signal_disposition",
    "promote_signal_to_situation",
    "record_finding",
    "update_finding_status",
    "promote_finding_to_situation",
    "create_collective_need",
    "update_collective_need_status",
    "create_program_opportunity",
    "update_program_opportunity_status",
    "accept_opportunity",
    "complete_logistics",
    "create_community_post",
    "convert_post"
  ],
  coordinateur: all,
  institution: [
    "create_signal",
    "report_signal_and_open_situation",
    "prioritize",
    "coordinate",
    "create_decision",
    "create_initiative",
    "update_signal_disposition",
    "promote_signal_to_situation",
    "record_finding",
    "update_finding_status",
    "promote_finding_to_situation",
    "create_collective_need",
    "update_collective_need_status",
    "create_program_opportunity",
    "update_program_opportunity_status",
    "log_communication",
    "plan_field_commitment",
    "close",
    "flag_price",
    "reset_demo"
  ],
  partenaire: ["create_community_post"]
};

// Relais généralisé, tranche 1/N (gap analysis + arbitrage CEO 2026-08-15) :
// qui a le droit d'agir "pour le compte de" un autre acteur. Volontairement
// distinct de `allowed` — ce n'est pas "qui peut soumettre cette commande"
// mais "qui peut la soumettre en désignant quelqu'un d'autre comme
// bénéficiaire". Limité aux rôles qui ont un rôle de relais légitime
// (poste de quai, coordination, supervision), jamais aux rôles de demande
// eux-mêmes (mareyeur/transformateur agissent toujours en leur nom propre).
//
// gestionnaire_organisation ajouté (gap analysis Coordination, arbitrage
// CEO 2026-08-18) : la permission accept_opportunity existe pour lui
// "pour une bonne raison — coordonner au nom d'un membre" (arbitrage),
// mais son absence de ce tableau faisait que CoordinationWorkspace.tsx
// ne lui calculait jamais onBehalfOfActorId (son canRelay était toujours
// faux) — l'opportunité validée pour le compte d'un mareyeur/
// transformateur s'attribuait alors silencieusement à lui-même
// (beneficiaryId = command.onBehalfOfActorId ?? command.actorId,
// rules.ts), sans aucune mention "pour le compte de" affichée nulle
// part. Un vrai bug de mauvaise attribution, pas un lien mort — trouvé
// en lisant la logique de permission jusqu'au bout, pas seulement le
// rendu visuel des boutons.
export const RELAY_ROLES: Role[] = ["operateur", "coordinateur", "administrateur", "gestionnaire_organisation"];

export function assertCan(role: Role, command: Command) {
  if (!allowed[role].includes(command.type)) {
    throw new Error("Votre mandat ne permet pas cette action.");
  }
  if ("onBehalfOfActorId" in command && command.onBehalfOfActorId && !RELAY_ROLES.includes(role)) {
    throw new Error("Votre mandat ne permet pas d’agir pour le compte d’un autre acteur.");
  }
}

// Vérification client de permission (gap analysis Coordination, arbitrage
// CEO 2026-08-18, point 2) : partenaire n'a jamais eu accept_opportunity/
// complete_logistics dans `allowed`, mais CoordinationWorkspace.tsx
// affichait ces deux boutons sans condition de rôle — une affordance qui
// ne mène jamais nulle part pour ce rôle (même principe que le Lot 2 :
// jamais un contrôle visible sans destination réelle). canRole permet aux
// composants client de conditionner l'affichage sur la même source de
// vérité que le serveur (`allowed`), plutôt que de dupliquer une liste de
// rôles en dur dans le composant qui dériverait de celle-ci avec le temps.
export function canRole(role: Role, commandType: Command["type"]) {
  return allowed[role].includes(commandType);
}
