import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function ExportateurPrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("exportateur")} />;
}
