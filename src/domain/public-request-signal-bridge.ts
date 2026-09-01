// Logique pure du pont PublicRequest → Signal (LOT 0.4, mandat "aligner
// le Core métier avec le Blueprint V1"). Extrait de
// src/server/public-repository.ts (qui porte `import "server-only"` et
// n'est donc testable qu'en contexte Next.js réel, pas via `node --test`)
// pour que cette logique — le vrai coeur métier du pont, pas la
// persistance — reste unitairement testable (cf. tests/finding.test.ts
// et tests/public-request-signal.test.ts pour la partie domaine ; la
// partie appel à dispatch()/getState() est vérifiée en conditions réelles
// via le serveur de développement, cf. rapport de lot).
import type { PublicRequestInput } from "@/domain/public/request";
import type { Territory } from "@/domain/types";

// Source PublicRequest → canal Signal : "web"/"partenaire"/"evenement"
// n'ont pas d'équivalent honnête parmi les 4 canaux terrain existants
// (Signal.channel) — regroupés sous "espace_public" plutôt que rattachés
// arbitrairement à un canal terrain qu'ils ne sont pas.
// "whatsapp"/"telephone"/"terrain" reprennent directement le canal Signal
// existant du même nom (même médium réel).
export function publicRequestSourceToSignalChannel(source: PublicRequestInput["source"]): "terrain" | "telephone" | "whatsapp_structure" | "espace_public" {
  if (source === "terrain") return "terrain";
  if (source === "telephone") return "telephone";
  if (source === "whatsapp") return "whatsapp_structure";
  return "espace_public";
}

// Résolution best-effort du territoire déclaré (texte libre, jamais
// garanti correspondre à un Territory réel — même principe
// qu'IncomingMessage.territoryHint) : correspondance stricte insensible à
// la casse contre les territoires réels, sinon absent plutôt que fabriqué
// (Signal.territoryId optionnel depuis LOT 0.4).
export function resolvePublicRequestTerritoryId(territories: Territory[], declaredTerritory: string | undefined): string | undefined {
  if (!declaredTerritory) return undefined;
  return territories.find((item) => item.name.localeCompare(declaredTerritory, "fr", { sensitivity: "base" }) === 0)?.id;
}
