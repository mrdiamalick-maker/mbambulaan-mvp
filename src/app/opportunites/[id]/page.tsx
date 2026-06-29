import { notFound } from "next/navigation";
import { PremiumOpportunityDetailPage } from "@/components/premium/PremiumExperience";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching, findOpportuniteById } from "@/lib/coordination";
import { computeCoordinationEngine } from "@/lib/mvpSlice";

type OpportuniteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OpportuniteDetailPage({ params }: OpportuniteDetailPageProps) {
  const { id } = await params;
  const opportunite = findOpportuniteById(computeMatching(getArrivages(), getBesoins()), id);

  if (!opportunite) {
    notFound();
  }

  return <PremiumOpportunityDetailPage opportunite={opportunite} slice={computeCoordinationEngine()} />;
}
