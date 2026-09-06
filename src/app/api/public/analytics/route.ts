import { NextRequest, NextResponse } from "next/server";
import { publicAnalyticsEvents, type PublicAnalyticsEvent } from "@/domain/public/analytics";
import { recordPublicEvent } from "@/server/analytics-repository";

const validEvents = new Set<string>(publicAnalyticsEvents);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = Array.isArray(body?.events) ? body.events : [body];

    for (const raw of events.slice(0, 20)) {
      if (!raw || typeof raw.event !== "string" || !validEvents.has(raw.event)) continue;
      await recordPublicEvent({
        event: raw.event as PublicAnalyticsEvent,
        path: typeof raw.path === "string" ? raw.path.slice(0, 300) : undefined,
        properties: typeof raw.properties === "object" && raw.properties !== null ? raw.properties : undefined
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // Un événement analytics perdu ne doit jamais faire échouer le parcours utilisateur.
    return NextResponse.json({ ok: true });
  }
}
