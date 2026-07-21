import { publicContributionSeeds } from "@/data/publicMobilizations";
import { findQuayIdForTerritory } from "@/lib/ministrySelectors";
import type { DossierOperationnel } from "@/lib/ministryOperationalDossiers";

export function buildPublicContributionDossiers(): DossierOperationnel[] {
  return publicContributionSeeds.map((contribution) => {
    const quayId = findQuayIdForTerritory(contribution.territory);
    const isCritical = contribution.urgency === "Critique";
    const isVerifying = contribution.status === "En vérification";

    return {
      id: contribution.id,
      type: contribution.category === "Mobilisation" ? "Besoin filière" : "Situation terrain",
      linkedObject: contribution.title,
      linkedObjectType: quayId ? "Quai" : "Zone",
      sourceId: contribution.id,
      quayId,
      territory: contribution.territory,
      workStatus: isCritical ? "À traiter" : isVerifying ? "En attente" : "Nouveau",
      businessStatus: `${contribution.category} · ${contribution.status}`,
      originChannel: "Formulaire",
      transitChannel: "Agent territorial",
      currentOwner: quayId ? "Cellule technique territoriale" : "Cellule nationale d’orientation",
      nextAction: isVerifying ? "Suivre la vérification terrain" : "Qualifier et orienter la contribution",
      action: quayId ? "open-atlas" : "open-pilotage",
      notes: [{
        id: `note-${contribution.id}`,
        time: contribution.receivedAt,
        author: contribution.sender,
        text: `Contribution publique reçue avec un niveau d’urgence ${contribution.urgency.toLowerCase()}.`,
      }],
      pieces: [{
        id: `piece-${contribution.id}`,
        type: "Message",
        label: "Contribution publique et coordonnées protégées",
        status: "Disponible",
      }],
      history: [{
        time: contribution.receivedAt,
        label: "Contribution reçue dans l’espace public",
        channel: "Formulaire",
        author: contribution.sender,
      }],
      finalOutput: "Contribution qualifiée, orientée vers l’autorité compétente et suivie jusqu’à une réponse traçable.",
      ageDays: contribution.receivedAt.startsWith("Aujourd") ? 0 : contribution.receivedAt.startsWith("Hier") ? 1 : 2,
    };
  });
}

export function mergeOperationalDossiers(
  ministryDossiers: DossierOperationnel[],
): DossierOperationnel[] {
  const dossiersById = new Map<string, DossierOperationnel>();
  [...buildPublicContributionDossiers(), ...ministryDossiers].forEach((dossier) => dossiersById.set(dossier.id, dossier));
  return [...dossiersById.values()];
}
