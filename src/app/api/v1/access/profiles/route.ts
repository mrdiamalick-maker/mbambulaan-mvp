import { NextResponse } from "next/server";
import { getDemoAccessControl } from "@/platform/access/demo-access-registry";

export async function GET() {
  return NextResponse.json({ profiles: getDemoAccessControl().listIdentities() });
}
