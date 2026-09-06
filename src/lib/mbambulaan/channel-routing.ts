export type NextChannel = "termine" | "telephone" | "espace";

const telephoneAnswers = new Set([
  "Appelez-moi"
]);

const workspaceAnswers = new Set([
  "Non, il faut vérifier",
  "Corriger le poids",
  "Montrez-moi une autre proposition",
  "Organiser l’enlèvement",
  "Comparer avant de décider",
  "Je dois vérifier",
  "Organiser le transport",
  "Comparer les options",
  "Il manque le froid",
  "Il manque du matériel"
]);

export function getNextChannel(answer: string): NextChannel {
  if (telephoneAnswers.has(answer)) return "telephone";
  if (workspaceAnswers.has(answer)) return "espace";
  return "termine";
}

export function getChannelMessage(channel: NextChannel) {
  if (channel === "telephone") {
    return "Un appel est demandé pour clarifier la situation avec la bonne personne.";
  }

  if (channel === "espace") {
    return "La situation demande plusieurs informations ou une comparaison. Elle continue dans votre espace Mbàmbulaan.";
  }

  return "C’est terminé. Vous n’avez rien d’autre à ouvrir pour cette action.";
}
