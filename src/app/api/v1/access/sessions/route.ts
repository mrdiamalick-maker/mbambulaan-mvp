import { NextResponse } from "next/server";
import { getDemoAccessControl } from "@/platform/access/demo-access-registry";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { identityId?: string; territoryId?: string };
    if (!body.identityId) return NextResponse.json({ error: { message: "identityId est obligatoire." } }, { status: 400 });
    const access = getDemoAccessControl();
    const session = access.createSession({ identityId: body.identityId, territoryId: body.territoryId });
    const identity = access.getIdentity(session.identityId);
    return NextResponse.json({ session, identity }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : "Erreur inconnue." } }, { status: 400 });
  }
}
