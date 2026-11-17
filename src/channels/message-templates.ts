import type { ReplyIntent } from "@/domain/channel-interaction";
import { roleChoicesList, territoryChoicesList } from "@/domain/channel-interaction";
import type { Territory } from "@/domain/types";

// Gabarits de message — mandat §8, "keep message templates/configuration
// outside core domain logic". Le domaine (channel-interaction.ts) décide
// seulement QUEL type de réponse envoyer (ReplyIntent) ; le texte littéral
// vit ici, volontairement hors de src/domain, pour rester modifiable sans
// toucher à la logique métier. Aucune réponse générée par IA en T01
// (mandat §8, "do not implement AI-generated replies in T01") : trois
// gabarits fixes + un accusé de réception générique.
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
  return "Message bien reçu. Merci.";
}
