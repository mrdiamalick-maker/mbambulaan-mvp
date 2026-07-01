import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function EtatPrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("etat")} />;
}
