"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPublicEvent } from "@/lib/public-analytics";

// Monté une fois au niveau racine. Ne mesure que le Public : les routes
// /app (Produit professionnel) et /api sont explicitement exclues.
export function PublicAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/app") || pathname.startsWith("/api")) return;
    trackPublicEvent("page_view");
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest("[data-analytics]");
      const name = target?.getAttribute("data-analytics");
      if (!name) return;
      trackPublicEvent(name as never);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
