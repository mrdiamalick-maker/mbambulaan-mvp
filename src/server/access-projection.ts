// projectStateForSession — P2.1-A, mandat "Intake Traceability & Data
// Access Foundation", Fondation B. Jusqu'ici GET /api/state (route.ts)
// renvoyait l'intégralité du ProductState à toute session authentifiée,
// quel que soit son rôle : Visibility (domain/types.ts) existe sur
// Situation depuis le pipeline de connaissance (LOT 0.2) mais n'était
// JAMAIS lue nulle part côté serveur — écrite à la création
// (knowledge-pipeline.ts), jamais appliquée à la lecture (audit P2.1-A,
// domaine gap "Data Access"). Cette fonction est désormais le seul point
// de filtrage serveur avant l'envoi au client (cf. app/api/state/route.ts).
//
// Volontairement PAS un moteur ABAC/RBAC générique (mandat §16, exclu
// explicitement) : une projection pure et dédiée, qui ne connaît qu'un
// seul objet — Situation, seul type de ProductState portant Visibility
// aujourd'hui (confirmé par grep exhaustif lors de l'audit P2.1-A) —
// réutilisant les concepts déjà existants (Role, Actor.organizationId,
// RELAY_ROLES de ./permissions) plutôt que d'inventer un nouveau modèle
// de permission de lecture. Étendre à d'autres objets (Signal, Finding,
// CollectiveNeed...) reste un futur lot explicite, jamais une
// extrapolation silencieuse ici — cf. "Dette laissée" dans le rapport de
// lot.
//
// Pas de "server-only" ici (contrairement à ./session, ./permissions n'en
// porte pas non plus) : fonction pure, testable directement via
// `node --test`, comme le reste du domaine — cf.
// tests/p21a-intake-traceability.test.ts.
//
// Doctrine — FAIL CLOSED (mandat §17) : "ne jamais considérer 'nous ne
// savons pas' comme 'tout le monde peut voir'". Une situation sans
// responsable résolu, ou dont l'organisation du responsable ne peut pas
// être déterminée, reste invisible aux rôles non transverses — sauf
// visibility === "publique", seul palier qui ne dépend d'aucune
// résolution d'organisation. Jamais l'inverse : une incertitude ne se
// résout jamais vers "visible".
import { RELAY_ROLES } from "./permissions";
import type { Actor, Organization, ProductState, Role, Situation } from "@/domain/types";

// Rôles transverses (coordination, État, contrôle, arbitrage) : gardent
// la lecture complète déjà en vigueur avant ce lot. Réutilise RELAY_ROLES
// (poste de quai, coordination, supervision, déjà défini pour l'écriture
// "pour le compte de" — server/permissions.ts) plutôt que d'inventer une
// seconde catégorisation de rôles pour la lecture ; ajoute "institution"
// (Espace État — jamais un rôle de relais d'action, mais toujours un
// rôle de lecture transverse légitime, cf. EtatSidebar/InstitutionShell).
// Mandat §16 : ne jamais retirer un rôle de coordination/État/contrôle/
// arbitrage légitime de cette liste sans arbitrage explicite.
export const TRANSVERSE_READ_ROLES: Role[] = [...RELAY_ROLES, "institution"];

// Sous-ensemble de Session (server/session.ts) — délibérément un type
// local plutôt qu'un import de ./session : ce fichier reste ainsi
// indépendant de "next/headers" et testable sans aucune dépendance
// serveur, un objet Session réel (superset structurel) le satisfait sans
// conversion.
export interface ProjectionSession {
  actorId: string;
  role: Role;
}

function resolveOrganizationId(actors: Actor[], actorId: string | undefined): string | undefined {
  if (!actorId) return undefined;
  return actors.find((item) => item.id === actorId)?.organizationId;
}

// isSituationVisible — une règle par palier de Visibility, chacune
// fail-closed : l'absence d'information résout toujours vers "non
// visible", jamais vers "visible".
function isSituationVisible(
  situation: Situation,
  actors: Actor[],
  viewer: { organizationId: string | undefined; organization: Organization | undefined; role: Role }
): boolean {
  if (situation.visibility === "publique") return true;

  const responsibleOrganizationId = resolveOrganizationId(actors, situation.responsibleId);
  // Situation pas encore assignée (responsibleId absent) : aucune
  // organisation propriétaire connue → fail closed pour les deux paliers
  // restreints, quel que soit le rôle du lecteur.
  if (!responsibleOrganizationId) return false;

  if (responsibleOrganizationId === viewer.organizationId) return true;

  if (situation.visibility === "partenaires") {
    // "partenaires" reste plus large qu'"organisation", mais sans lien
    // structuré Situation ↔ organisation partenaire dans le modèle
    // aujourd'hui (audit P2.1-A) : seule extension défendable en restant
    // fail-closed — le rôle "partenaire" lui-même, et les organisations
    // déjà typées "partenaire" dans le modèle (Organization.type,
    // domain/types.ts), jamais une extrapolation par nom, territoire ou
    // proximité métier.
    if (viewer.role === "partenaire") return true;
    if (viewer.organization?.type === "partenaire") return true;
  }

  return false;
}

// projectStateForSession — point d'entrée unique. Rôles transverses :
// état complet, comportement inchangé. Autres rôles : state.situations
// filtré selon les règles ci-dessus ; tous les autres tableaux de
// ProductState (signals, findings, serviceRequests, decisions...)
// restent non filtrés dans ce lot — documenté explicitement comme la
// portée de cette fondation (Situation est le seul objet portant
// Visibility aujourd'hui), pas un oubli. Cf. "Dette laissée" du rapport
// de lot pour les objets liés à une situation restreinte (Decision,
// Evidence, Communication...) qui restent, eux, visibles sans filtre
// dérivé — limite connue, pas silencieusement corrigée ni ignorée.
export function projectStateForSession(state: ProductState, session: ProjectionSession): ProductState {
  if (TRANSVERSE_READ_ROLES.includes(session.role)) return state;

  const viewerOrganizationId = resolveOrganizationId(state.actors, session.actorId);
  const viewerOrganization = state.organizations.find((item) => item.id === viewerOrganizationId);
  const viewer = { organizationId: viewerOrganizationId, organization: viewerOrganization, role: session.role };

  return {
    ...state,
    situations: state.situations.filter((situation) => isSituationVisible(situation, state.actors, viewer))
  };
}
