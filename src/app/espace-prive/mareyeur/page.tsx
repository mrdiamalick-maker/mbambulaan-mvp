import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function MareyeurPrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("mareyeur")} />;
}
