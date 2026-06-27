import { TransactionsView } from "@/components/transactions/TransactionsView";
import { TransactionsQualitySection } from "@/components/quality/QualityPanels";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";

export default function TransactionsPage() {
  const arrivages = getArrivages();
  const opportunites = computeMatching(arrivages, getBesoins());

  return (
    <>
      <TransactionsView arrivages={arrivages} opportunites={opportunites} />
      <TransactionsQualitySection arrivages={arrivages} opportunites={opportunites} />
    </>
  );
}
