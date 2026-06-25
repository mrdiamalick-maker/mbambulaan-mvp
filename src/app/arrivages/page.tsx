import { ArrivagesClient } from "@/components/arrivages/ArrivagesClient";
import { getArrivages } from "@/lib/arrivages";

export default function ArrivagesPage() {
  return <ArrivagesClient arrivages={getArrivages()} />;
}
