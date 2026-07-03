import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function InvestisseurPrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("investisseur")} />;
}
