import { NextResponse } from "next/server";
import { getDemoAccessControl } from "@/platform/access/demo-access-registry";
import type { DemoPermission } from "@/platform/access/demo-access-control";

export async function POST(request: Request) {
  const body = await request.json() as {
    sessionId?: string;
    permission?: DemoPermission;
    territoryId?: string;
    productCode?: string;
  };
  if (!body.sessionId || !body.permission) {
    return NextResponse.json({ error: { message: "sessionId et permission sont obligatoires." } }, { status: 400 });
  }
  const result = getDemoAccessControl().authorize({
    sessionId: body.sessionId,
    permission: body.permission,
    territoryId: body.territoryId,
    productCode: body.productCode,
  });
  return NextResponse.json(result, { status: result.allowed ? 200 : 403 });
}
