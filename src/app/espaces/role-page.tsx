import { notFound } from "next/navigation";
import { RoleSpacePage } from "@/components/espaces/RoleSpacePage";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";
import { computeDaySimulation } from "@/lib/daySimulation";
import { getEspaceBySlug, getProfileMetrics } from "@/lib/espaces";
import type { EspaceSlug } from "@/lib/espaces";
import { computeRoleRecommendations, getRecommendationsForRole } from "@/lib/roleRecommendations";
import type { RoleRecommendationRole } from "@/lib/roleRecommendations";

export function renderRoleSpace(slug: EspaceSlug) {
  const espace = getEspaceBySlug(slug);

  if (!espace) {
    notFound();
  }

  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);
  const recommendations = computeRoleRecommendations({ arrivages, besoins, opportunites, transactions: daySimulation.transactions });

  return <RoleSpacePage espace={espace} metrics={getProfileMetrics()} recommendations={getRecommendationsForRole(recommendations, roleBySlug[slug])} />;
}

const roleBySlug: Record<EspaceSlug, RoleRecommendationRole> = {
  pecheur: "Pêcheur",
  mareyeur: "Mareyeur",
  transformateur: "Transformateur",
  collectivite: "Collectivité",
  admin: "Administration"
};
