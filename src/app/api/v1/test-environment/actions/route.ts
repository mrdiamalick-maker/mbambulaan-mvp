import { NextResponse } from "next/server";
import { getIntegratedTestEnvironment, resetIntegratedTestEnvironment } from "@/platform/test-environment/test-environment-registry";

type TestActionBody =
  | { action: "reset" }
  | { action: "run_cold_chain_scenario" }
  | { action: "send_sms"; recipient: string; message: string }
  | { action: "send_whatsapp"; recipient: string; message: string }
  | { action: "request_payment"; paymentId: string; payerActorId: string; beneficiaryActorId: string; amountXof: number; provider: "wave_simulator" | "orange_money_simulator" }
  | { action: "confirm_payment"; paymentId: string }
  | { action: "get_weather"; territoryId: string }
  | { action: "scan_document"; documentId: string; fileName: string; infected?: boolean };

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as TestActionBody | undefined;
  if (!body?.action) {
    return NextResponse.json({ error: { code: "INVALID_TEST_ACTION", message: "L'action de test est invalide." } }, { status: 400 });
  }

  try {
    if (body.action === "reset") return NextResponse.json(resetIntegratedTestEnvironment());

    const environment = getIntegratedTestEnvironment();
    if (body.action === "run_cold_chain_scenario") {
      const result = await environment.seedAndRunColdChainScenario();
      return NextResponse.json({ result, environment: environment.snapshot() }, { status: 201 });
    }
    if (body.action === "send_sms") {
      return NextResponse.json({ result: environment.sendSms(body), environment: environment.snapshot() }, { status: 201 });
    }
    if (body.action === "send_whatsapp") {
      return NextResponse.json({ result: environment.sendWhatsApp(body), environment: environment.snapshot() }, { status: 201 });
    }
    if (body.action === "request_payment") {
      return NextResponse.json({ result: environment.requestPayment({
        id: body.paymentId,
        payerActorId: body.payerActorId,
        beneficiaryActorId: body.beneficiaryActorId,
        amountXof: body.amountXof,
        provider: body.provider,
      }), environment: environment.snapshot() }, { status: 201 });
    }
    if (body.action === "confirm_payment") {
      return NextResponse.json({ result: environment.confirmPayment(body.paymentId), environment: environment.snapshot() });
    }
    if (body.action === "get_weather") {
      return NextResponse.json({ result: environment.getWeather(body.territoryId), environment: environment.snapshot() });
    }
    if (body.action === "scan_document") {
      return NextResponse.json({ result: environment.scanDocument(body), environment: environment.snapshot() });
    }

    return NextResponse.json({ error: { code: "UNSUPPORTED_TEST_ACTION", message: "L'action de test n'est pas prise en charge." } }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "TEST_ACTION_FAILED",
        message: error instanceof Error ? error.message : "L'action de test a échoué.",
      },
    }, { status: 400 });
  }
}
