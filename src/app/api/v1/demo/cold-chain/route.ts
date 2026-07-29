import { NextResponse } from "next/server";
import { runColdChainCoordinationScenario } from "@/platform/product-suite/integrated-demo-scenario";

export async function POST() {
  const result = await runColdChainCoordinationScenario();
  return NextResponse.json(result, { status: 201 });
}
