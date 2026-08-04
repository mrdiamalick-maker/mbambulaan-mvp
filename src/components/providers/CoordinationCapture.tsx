"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCoordinationLoop, type LoopActor } from "@/components/providers/CoordinationLoopProvider";

const actorLabels: Record<string, LoopActor> = {
  Capitaine: "capitaine",
  "Agent de quai": "operateur",
  Mareyeur: "mareyeur",
  Transformatrice: "transformateur",
  Prestataire: "prestataire"
};

const ignoredLabels = new Set([
  ...Object.keys(actorLabels),
  "Rejouer",
  "Ouvrir mon espace",
  "Demander l’appel",
  "Retour au démonstrateur",
  "Voir le canal téléphonique"
]);

function currentActor(): LoopActor {
  const selected = Array.from(document.querySelectorAll("aside button")).find((button) =>
    button.className.includes("bg-white/12") && actorLabels[button.textContent?.trim() ?? ""]
  );
  return actorLabels[selected?.textContent?.trim() ?? ""] ?? "capitaine";
}

function updateFor(actor: LoopActor, answer: string) {
  if (actor === "capitaine") {
    const isWeightAnswer = answer === "Oui" || answer === "Non, il faut vérifier";
    return {
      workId: "RET-2026-0814",
      visibleTo: ["capitaine", "operateur"] as LoopActor[],
      detail: isWeightAnswer ? `Le capitaine répond sur la pesée : ${answer}.` : `Le capitaine donne une nouvelle sur son retour : ${answer}.`,
      nextAction: {
        capitaine: isWeightAnswer ? "Attendre le retour du quai si une vérification est demandée." : "Aucune autre action pour le moment.",
        operateur: isWeightAnswer && answer !== "Oui" ? "Reprendre la pesée avec le capitaine." : "Tenir compte de cette information pour préparer l’arrivée."
      }
    };
  }

  if (actor === "operateur") {
    const isWeight = answer.includes("kg") || answer === "Corriger le poids";
    return {
      workId: "RET-2026-0814",
      visibleTo: (isWeight ? ["operateur", "capitaine", "mareyeur", "transformateur"] : ["operateur", "capitaine"]) as LoopActor[],
      detail: isWeight ? `Le quai met à jour la pesée : ${answer}.` : `Le quai confirme la préparation : ${answer}.`,
      nextAction: {
        operateur: isWeight && answer === "Corriger le poids" ? "Corriger la pesée avant de la partager." : "Poursuivre l’arrivée en cours.",
        capitaine: isWeight ? "Vérifier la pesée reçue." : "Prendre connaissance de ce qui sera prêt au quai.",
        mareyeur: isWeight ? "Le lot pourra être comparé lorsqu’il sera disponible." : "",
        transformateur: isWeight ? "Le volume pourra être comparé à la production lorsqu’il sera disponible." : ""
      }
    };
  }

  if (actor === "mareyeur") {
    const commits = answer === "Réserver ce lot" || answer === "Oui, je suis intéressée";
    return {
      workId: "ACH-2026-0042",
      visibleTo: (commits ? ["mareyeur", "operateur"] : ["mareyeur"]) as LoopActor[],
      detail: `La mareyeuse répond à une proposition : ${answer}.`,
      nextAction: {
        mareyeur: answer.includes("Comparer") || answer.includes("autre") ? "Comparer les lots dans votre espace." : "Suivre la réponse ou l’enlèvement.",
        operateur: commits ? "Tenir compte de l’intérêt exprimé pour ce lot." : ""
      }
    };
  }

  if (actor === "transformateur") {
    const accepts = answer === "Oui";
    return {
      workId: "PROD-2026-0018",
      visibleTo: (accepts ? ["transformateur", "operateur"] : ["transformateur"]) as LoopActor[],
      detail: `La transformatrice met à jour sa production : ${answer}.`,
      nextAction: {
        transformateur: "Vérifier l’approvisionnement, le froid et l’équipe avant de lancer.",
        operateur: accepts ? "Tenir compte de cet intérêt pour le volume disponible." : ""
      }
    };
  }

  return {
    workId: "CAP-2026-0031",
    visibleTo: ["prestataire", "operateur"] as LoopActor[],
    detail: `Le prestataire donne une nouvelle sur sa capacité : ${answer}.`,
    nextAction: {
      prestataire: answer === "Je serai en retard" ? "Mettre à jour l’heure prévue ou demander un appel." : "Suivre la demande concernée.",
      operateur: "Tenir compte de cette disponibilité dans la préparation du quai."
    }
  };
}

export function CoordinationCapture() {
  const pathname = usePathname();
  const { recordUpdate } = useCoordinationLoop();

  useEffect(() => {
    if (pathname !== "/terrain/whatsapp") return;

    function capture(event: MouseEvent) {
      const button = (event.target as HTMLElement | null)?.closest("button");
      if (!button) return;
      const answer = button.textContent?.trim() ?? "";
      if (!answer || ignoredLabels.has(answer)) return;

      const actor = currentActor();
      const update = updateFor(actor, answer);
      recordUpdate({
        ...update,
        actor,
        action: answer
      });
    }

    document.addEventListener("click", capture);
    return () => document.removeEventListener("click", capture);
  }, [pathname, recordUpdate]);

  return null;
}
