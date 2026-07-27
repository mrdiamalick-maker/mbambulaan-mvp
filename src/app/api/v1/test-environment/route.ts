import { NextResponse } from "next/server";
import { getIntegratedTestEnvironment } from "@/platform/test-environment/test-environment-registry";

export async function GET() {
  return NextResponse.json(getIntegratedTestEnvironment().snapshot());
}
