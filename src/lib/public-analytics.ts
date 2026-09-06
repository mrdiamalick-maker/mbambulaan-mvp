"use client";

import type { PublicAnalyticsEvent } from "@/domain/public/analytics";

// Aide cliente pour les événements analytics Public (section 21 du
// MASTER_SPEC). Best-effort : ne bloque jamais, n'échoue jamais visiblement.
export function trackPublicEvent(event: PublicAnalyticsEvent, properties?: Record<string, string | undefined>) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ event, path: window.location.pathname, properties });
    const endpoint = "/api/public/analytics";
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
      return;
    }
    void fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
  } catch {
    // silencieux : la mesure ne doit jamais casser le parcours.
  }
}
