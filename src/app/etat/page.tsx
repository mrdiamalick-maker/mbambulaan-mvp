import { PrivateV3App } from "../../v3-template/App";
import { isScreenKey } from "../../v3-template/types";

export default async function EtatPage({
  searchParams
}: {
  searchParams: Promise<{ ecran?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedScreen = Array.isArray(params.ecran) ? params.ecran[0] : params.ecran;

  return <PrivateV3App initialScreen={isScreenKey(requestedScreen) ? requestedScreen : undefined} />;
}
