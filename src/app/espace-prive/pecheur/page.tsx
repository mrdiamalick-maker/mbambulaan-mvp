import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function PecheurPrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("pecheur")} />;
}
