"use client";

import { useEffect } from "react";
import { trackPublicEvent } from "@/lib/public-analytics";
import type { PublicAnalyticsEvent } from "@/domain/public/analytics";

export function EventOnMount({ event, properties }: { event: PublicAnalyticsEvent; properties?: Record<string, string | undefined> }) {
  useEffect(() => {
    trackPublicEvent(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
