import { TransactionsView } from "@/components/transactions/TransactionsView";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";

export default function TransactionsPage() {
  const opportunites = computeMatching(getArrivages(), getBesoins());

  return <TransactionsView opportunites={opportunites} />;
}
