import { NextResponse } from "next/server";
import { loadCostGuardConfiguration, validateCostGuard } from "@/platform/config/cost-guard";

export async function GET() {
  try {
    const configuration = loadCostGuardConfiguration(process.env);
    const report = validateCostGuard(configuration);
    return NextResponse.json({
      ...report,
      providers: configuration.providers,
      paidIntegrationsAllowed: configuration.allowPaidIntegrations,
    });
  } catch (error) {
    return NextResponse.json({
      compliant: false,
      error: error instanceof Error ? error.message : "Configuration coût invalide.",
    }, { status: 503 });
  }
}
