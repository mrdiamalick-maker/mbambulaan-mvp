import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function CollectivitePrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("collectivite")} />;
}
