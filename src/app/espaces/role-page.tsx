import { notFound } from "next/navigation";
import { RoleSpacePage } from "@/components/espaces/RoleSpacePage";
import { getEspaceBySlug, getProfileMetrics } from "@/lib/espaces";
import type { EspaceSlug } from "@/lib/espaces";

export function renderRoleSpace(slug: EspaceSlug) {
  const espace = getEspaceBySlug(slug);

  if (!espace) {
    notFound();
  }

  return <RoleSpacePage espace={espace} metrics={getProfileMetrics()} />;
}
