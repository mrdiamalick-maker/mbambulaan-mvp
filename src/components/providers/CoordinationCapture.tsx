"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCoordinationLoop } from "@/components/providers/CoordinationLoopProvider";

type Actor = "capitaine" | "operateur" | "mareyeur" | "transformateur" | "prestataire";

const actors = new Set<Actor>(["capitaine", "operateur", "mareyeur", "transformateur", "prestataire"]);
const ignoredLabels = new Set(["Rejouer", "Ouvrir mon espace", "Demander l’appel", "Retour au démonstrateur", "Voir le canal téléphonique"]);

function isActor(value: string | null): value is Actor {
  return value !== null && actors.has(value as Actor);
}

function workIdFor(actor: Actor) {
  if (actor === "mareyeur") return "ACH-2026-0042";
  if (actor === "transformateur") return "PROD-2026-0018";
  if (actor === "prestataire") return "CAP-2026-0031";
  return "RET-2026-0814";
}

export function CoordinationCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { recordUpdate } = useCoordinationLoop();

  useEffect(() => {
    if (pathname !== "/terrain/whatsapp") return;

    function capture(event: MouseEvent) {
      const button = (event.target as HTMLElement | null)?.closest("button");
      if (!button) return;
      const label = button.textContent?.trim() ?? "";
      if (!label || ignoredLabels.has(label)) return;

      const requestedActor = searchParams.get("acteur");
      const actor: Actor = isActor(requestedActor) ? requestedActor : "capitaine";

      recordUpdate({
        workId: workIdFor(actor),
        actor,
        action: label,
        detail: `Réponse envoyée depuis le canal messaging : ${label}`
      });
    }

    document.addEventListener("click", capture);
    return () => document.removeEventListener("click", capture);
  }, [pathname, recordUpdate, searchParams]);

  return null;
}
