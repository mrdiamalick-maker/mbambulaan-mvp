import { PrivateSpaceClient } from "@/components/private-space/PrivateSpaceClient";
import { getPrivateSpaceConfig } from "@/data/privateSpaces";

export default function OrganisationPrivateSpacePage() {
  return <PrivateSpaceClient config={getPrivateSpaceConfig("organisation")} />;
}
