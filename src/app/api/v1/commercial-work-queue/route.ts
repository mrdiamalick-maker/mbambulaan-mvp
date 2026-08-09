import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getCommercialWorkQueue } from "@/platform/commercial/commercial-work-queue";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    return NextResponse.json(await getCommercialWorkQueue().forIdentity(authorization.identity));
  } catch (error) {
    return NextResponse.json({
      error: { code: "COMMERCIAL_WORK_QUEUE_FAILED", message: error instanceof Error ? error.message : String(error) },
    }, { status: 503 });
  }
}
