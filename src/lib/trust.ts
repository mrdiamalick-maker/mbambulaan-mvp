import type { Opportunite } from "@/lib/coordination";

export type ActorTrustType = "Pêcheur" | "Mareyeur" | "Transformateur" | "Coopérative" | "Collectivité";
export type TrustLevel = "Confiance élevée" | "Confiance moyenne" | "Confiance à vérifier";
export type TrustTone = "green" | "orange" | "red";

export type ActorTrustInput = {
  id: string;
  nom: string;
  type: ActorTrustType;
  zone: string;
  transactionsTerminees: number;
  reservationsHonorees: number;
  annulations: number;
  delaiMoyen: number;
  profilComplet: boolean;
  regulariteActivite: number;
};

export type ActorTrust = ActorTrustInput & {
  scoreConfiance: number;
};

const actorTrustInputs: ActorTrustInput[] = [
  { id: "act-001", nom: "Groupement Soumbedioune Nord", type: "Coopérative", zone: "Soumbédioune", transactionsTerminees: 18, reservationsHonorees: 16, annulations: 0, delaiMoyen: 28, profilComplet: true, regulariteActivite: 92 },
  { id: "act-002", nom: "Pirogue Kayar Horizon", type: "Pêcheur", zone: "Kayar", transactionsTerminees: 12, reservationsHonorees: 11, annulations: 1, delaiMoyen: 38, profilComplet: true, regulariteActivite: 84 },
  { id: "act-003", nom: "Cooperative Mbour Littoral", type: "Coopérative", zone: "Mbour", transactionsTerminees: 15, reservationsHonorees: 13, annulations: 1, delaiMoyen: 42, profilComplet: true, regulariteActivite: 81 },
  { id: "act-004", nom: "Union Joal Peche", type: "Coopérative", zone: "Joal", transactionsTerminees: 10, reservationsHonorees: 9, annulations: 0, delaiMoyen: 34, profilComplet: true, regulariteActivite: 78 },
  { id: "act-005", nom: "Equipe Langue de Barbarie", type: "Pêcheur", zone: "Saint-Louis", transactionsTerminees: 8, reservationsHonorees: 7, annulations: 2, delaiMoyen: 55, profilComplet: false, regulariteActivite: 63 },
  { id: "act-006", nom: "Pirogue Mbour Teranga", type: "Pêcheur", zone: "Mbour", transactionsTerminees: 14, reservationsHonorees: 13, annulations: 0, delaiMoyen: 31, profilComplet: true, regulariteActivite: 88 },
  { id: "act-007", nom: "Collectif Yoff Littoral", type: "Coopérative", zone: "Yoff", transactionsTerminees: 9, reservationsHonorees: 8, annulations: 1, delaiMoyen: 47, profilComplet: true, regulariteActivite: 72 },
  { id: "act-008", nom: "Coopérative Kafountine Sud", type: "Coopérative", zone: "Kafountine", transactionsTerminees: 11, reservationsHonorees: 10, annulations: 0, delaiMoyen: 36, profilComplet: true, regulariteActivite: 79 },
  { id: "act-009", nom: "Pêcheur A", type: "Pêcheur", zone: "Joal", transactionsTerminees: 6, reservationsHonorees: 5, annulations: 0, delaiMoyen: 33, profilComplet: true, regulariteActivite: 70 },
  { id: "act-010", nom: "Mareyeur Dakar Frais", type: "Mareyeur", zone: "Dakar", transactionsTerminees: 20, reservationsHonorees: 18, annulations: 0, delaiMoyen: 24, profilComplet: true, regulariteActivite: 94 },
  { id: "act-011", nom: "Comptoir Kayar Distribution", type: "Mareyeur", zone: "Kayar", transactionsTerminees: 13, reservationsHonorees: 12, annulations: 1, delaiMoyen: 39, profilComplet: true, regulariteActivite: 82 },
  { id: "act-012", nom: "Atelier Mbour Transformation", type: "Transformateur", zone: "Mbour", transactionsTerminees: 16, reservationsHonorees: 14, annulations: 1, delaiMoyen: 44, profilComplet: true, regulariteActivite: 86 },
  { id: "act-013", nom: "Export Joal Selection", type: "Mareyeur", zone: "Joal", transactionsTerminees: 17, reservationsHonorees: 15, annulations: 0, delaiMoyen: 27, profilComplet: true, regulariteActivite: 89 },
  { id: "act-014", nom: "Mareyage Nord Services", type: "Mareyeur", zone: "Saint-Louis", transactionsTerminees: 7, reservationsHonorees: 6, annulations: 2, delaiMoyen: 58, profilComplet: false, regulariteActivite: 61 },
  { id: "act-015", nom: "Cuisine Collective Mbour", type: "Collectivité", zone: "Mbour", transactionsTerminees: 9, reservationsHonorees: 8, annulations: 1, delaiMoyen: 49, profilComplet: true, regulariteActivite: 74 },
  { id: "act-016", nom: "Exporter Casamance Frais", type: "Mareyeur", zone: "Kafountine", transactionsTerminees: 12, reservationsHonorees: 11, annulations: 0, delaiMoyen: 32, profilComplet: true, regulariteActivite: 83 },
  { id: "act-017", nom: "Atelier Hann Transformation", type: "Transformateur", zone: "Hann", transactionsTerminees: 10, reservationsHonorees: 8, annulations: 1, delaiMoyen: 52, profilComplet: true, regulariteActivite: 69 },
  { id: "act-018", nom: "Mareyeur Démo", type: "Mareyeur", zone: "Joal", transactionsTerminees: 5, reservationsHonorees: 5, annulations: 0, delaiMoyen: 30, profilComplet: true, regulariteActivite: 73 }
];

export const acteursConfiance = actorTrustInputs.map((actor) => ({
  ...actor,
  scoreConfiance: computeTrustScore(actor)
})) satisfies ActorTrust[];

export function computeTrustScore(actor: ActorTrustInput) {
  const transactionScore = Math.min(actor.transactionsTerminees, 20) * 1.5;
  const honoredScore = Math.min(actor.reservationsHonorees, 20);
  const cancellationPenalty = Math.min(actor.annulations * 8, 24);
  const speedScore = actor.delaiMoyen <= 30 ? 15 : actor.delaiMoyen <= 45 ? 11 : actor.delaiMoyen <= 60 ? 7 : 3;
  const profileScore = actor.profilComplet ? 15 : 6;
  const regularityScore = Math.round((Math.min(actor.regulariteActivite, 100) / 100) * 20);

  return Math.max(0, Math.min(100, Math.round(transactionScore + honoredScore + speedScore + profileScore + regularityScore - cancellationPenalty)));
}

export function getActorTrust(nom: string): ActorTrust {
  const actor = acteursConfiance.find((item) => normalize(item.nom) === normalize(nom));

  return (
    actor ?? {
      id: `act-local-${normalize(nom).replace(/\s+/g, "-")}`,
      nom,
      type: "Coopérative",
      zone: "Zone pilote",
      transactionsTerminees: 4,
      reservationsHonorees: 3,
      annulations: 1,
      delaiMoyen: 54,
      profilComplet: false,
      regulariteActivite: 58,
      scoreConfiance: 62
    }
  );
}

export function getOpportunityTrust(opportunite: Opportunite) {
  const vendeur = getActorTrust(opportunite.vendeur);
  const acheteur = getActorTrust(opportunite.acheteur);
  const scoreMoyen = Math.round((vendeur.scoreConfiance + acheteur.scoreConfiance) / 2);

  return {
    vendeur,
    acheteur,
    scoreMoyen,
    niveau: getTrustLevel(scoreMoyen)
  };
}

export function getTrustLevel(score: number): TrustLevel {
  if (score >= 85) return "Confiance élevée";
  if (score >= 65) return "Confiance moyenne";
  return "Confiance à vérifier";
}

export function getTrustTone(score: number): TrustTone {
  if (score >= 85) return "green";
  if (score >= 65) return "orange";
  return "red";
}

export function getTrustReasons(actor: ActorTrust) {
  const reasons = [
    `${actor.transactionsTerminees} transactions terminées`,
    `${actor.annulations} annulation${actor.annulations > 1 ? "s" : ""}`,
    actor.profilComplet ? "profil complet" : "profil à compléter",
    actor.delaiMoyen <= 40 ? "délai moyen court" : "délai moyen à surveiller",
    `${actor.reservationsHonorees} réservations honorées`,
    `activité régulière à ${actor.regulariteActivite}%`
  ];

  return reasons;
}

export function getRecommendedActors(limit = 5) {
  return [...acteursConfiance].sort((first, second) => second.scoreConfiance - first.scoreConfiance).slice(0, limit);
}

export function computeAverageTrustScore(actors: ActorTrust[] = acteursConfiance) {
  if (actors.length === 0) return 0;

  const total = actors.reduce((sum, actor) => sum + actor.scoreConfiance, 0);
  return Math.round(total / actors.length);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
