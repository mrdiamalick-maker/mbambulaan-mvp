import type { ReplyIntent } from "@/domain/channel-interaction";
import { roleChoicesList, territoryChoicesList } from "@/domain/channel-interaction";
import type { Territory } from "@/domain/types";

// Gabarits de message — mandat T01 §8 / T02 §7, "keep message
// templates/configuration outside core domain logic". Le domaine
// (channel-interaction.ts) décide seulement QUEL type de réponse envoyer
// (ReplyIntent) ; le texte littéral vit ici, volontairement hors de
// src/domain. Lecture conservative de T02 §7 ("the system MAY
// generate/suggest a concise reply") : même confirm_interpretation reste
// un gabarit déterministe rempli de champs déjà validés, jamais un texte
// généré par un modèle — "do not build an open-ended autonomous agent"
// (§7/§14) s'applique aussi au texte renvoyé à l'acteur, pas seulement à
// la décision métier.
export function renderReplyText(intent: ReplyIntent, territories: Territory[]): string {
  if (intent.kind === "ask_prenom") {
    return "Bienvenue sur Mbàmbulaan. Quel est votre prénom ?";
  }
  if (intent.kind === "ask_role") {
    const choices = roleChoicesList().map((choice) => `${choice.index}. ${choice.label}`).join("\n");
    return `Merci. Quel est votre rôle ?\n${choices}\nRépondez avec le numéro.`;
  }
  if (intent.kind === "ask_site") {
    const choices = territoryChoicesList(territories).map((choice) => `${choice.index}. ${choice.name}`).join("\n");
    return `Sur quel quai ou localité travaillez-vous principalement ?\n${choices}\nRépondez avec le numéro ou le nom exact.`;
  }
  if (intent.kind === "confirm_interpretation") {
    const parts = [`J'ai compris : ${intent.intentLabel.toLowerCase()}`];
    if (intent.subject) parts.push(`concernant ${intent.subject}`);
    if (intent.territoryLabel) parts.push(`à ${intent.territoryLabel}`);
    return `${parts.join(" ")}. C'est bien cela ? Un opérateur va vérifier votre message.`;
  }
  return "Message bien reçu. Merci.";
}

// Gabarits de coordination — mandat T03 §8, mêmes exemples que le mandat,
// remplis par des champs déjà structurés (jamais une génération libre).
// Appelés par la couche UI/orchestration AVANT de dispatcher
// initiate_terrain_coordination (requesterMessage/providerMessage,
// types.ts) — le domaine ne construit jamais ce texte lui-même.
export function renderCoordinationRequesterMessage(subjectLabel: string, territoryLabel: string): string {
  return `Mbàmbulaan a identifié une possibilité pour votre besoin (${subjectLabel}) à ${territoryLabel}. Souhaitez-vous être mis en relation ?`;
}

export function renderCoordinationProviderMessage(subjectLabel: string, territoryLabel: string): string {
  return `Un acteur à ${territoryLabel} recherche : ${subjectLabel}. Souhaitez-vous recevoir la demande ?`;
}
