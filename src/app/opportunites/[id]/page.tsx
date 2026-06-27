import { notFound } from "next/navigation";
import { OpportuniteDetail } from "@/components/opportunites/OpportuniteDetail";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { createOpportunites, findOpportuniteById } from "@/lib/matching";

type OpportuniteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OpportuniteDetailPage({ params }: OpportuniteDetailPageProps) {
  const { id } = await params;
  const opportunite = findOpportuniteById(createOpportunites(getArrivages(), getBesoins()), id);

  if (!opportunite) {
    notFound();
  }

  return <OpportuniteDetail opportunite={opportunite} />;
}
