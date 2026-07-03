import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function OngPrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("ong")} />;
}
