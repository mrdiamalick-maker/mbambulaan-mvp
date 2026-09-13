// Flux Intelligence — PD.4 (mandat "Product Dressing — Situations & Flux
// Real Domain Integration"). Moteurs de lecture PURS pour l'écran Flux
// entrant : projections sur IncomingMessage, résolution honnête de ce que
// le système peut réellement rattacher, et description fidèle des deux
// commandes réelles qui qualifient un message (convert_message_to_signal,
// dismiss_incoming_message). Aucune mutation, aucune détection de doublon
// inventée (mandat §3 : "Do not fabricate enrichment" ; §14 : "Raw
// IncomingMessage must never directly count as convergence").
import type { Actor, IncomingMessage, ProductState, Territory } from "./types";

export type FluxStage = "a_qualifier" | "qualifie" | "ecarte";

// Regroupement honnête (mandat §1 : "Do not invent new workflow
// stages") : IncomingMessage.status ne porte que 3 valeurs réelles
// (nouveau/converti/ecarte) — le gabarit gelé distingue visuellement
// "Reçu" et "À qualifier" (4 paliers), une nuance que le domaine actuel
// ne supporte pas. Les deux tuiles du gabarit qui correspondraient à
// "Reçu"/"À qualifier" pointent donc, honnêtement, vers le MÊME palier
// réel ("a_qualifier" = nouveau) plutôt que vers une distinction
// fabriquée — cf. rapport de lot PD.4.
export function fluxStage(message: IncomingMessage): FluxStage {
  if (message.status === "nouveau") return "a_qualifier";
  if (message.status === "converti") return "qualifie";
  return "ecarte";
}

export function fluxStageCounts(state: ProductState): Record<FluxStage, number> {
  const counts: Record<FluxStage, number> = { a_qualifier: 0, qualifie: 0, ecarte: 0 };
  for (const message of state.incomingMessages) counts[fluxStage(message)] += 1;
  return counts;
}

// resolveTerritoryHint — territoryHint est un texte libre saisi par
// l'émetteur (mandat "no fabricated enrichment"), jamais garanti
// correspondre à un Territory réel. Comparaison exacte insensible à la
// casse contre Territory.name — jamais une correspondance approximative
// (même discipline "pas d'IA floue" que Species Referential, PD.2).
export function resolveTerritoryHint(state: ProductState, message: IncomingMessage): Territory | undefined {
  if (!message.territoryHint) return undefined;
  const normalized = message.territoryHint.trim().toLowerCase();
  return state.territories.find((item) => item.name.trim().toLowerCase() === normalized);
}

export function resolveReporterActor(state: ProductState, message: IncomingMessage): Actor | undefined {
  if (!message.reportedByActorId) return undefined;
  return state.actors.find((item) => item.id === message.reportedByActorId);
}

// --- "Ce que le système a pu rattacher" / "Ce qui manque" --------------
//
// Mandat §3 : "Use deterministic projections only. Do not fabricate
// enrichment." Chaque entrée ci-dessous vient d'une résolution réelle
// (Territory, Actor) ou de son absence honnête — jamais d'une extraction
// de texte libre par mots-clés.

export interface FluxMatchedFact {
  label: string;
  value: string;
}

export function fluxMatchedFacts(state: ProductState, message: IncomingMessage): FluxMatchedFact[] {
  const facts: FluxMatchedFact[] = [];
  const territory = resolveTerritoryHint(state, message);
  if (territory) facts.push({ label: "Territoire", value: territory.name });
  const reporter = resolveReporterActor(state, message);
  if (reporter) facts.push({ label: "Déclarant", value: `${reporter.name} · acteur connu et rattaché` });
  return facts;
}

export function fluxMissingFacts(state: ProductState, message: IncomingMessage): string[] {
  const missing: string[] = [];
  if (!resolveTerritoryHint(state, message)) {
    missing.push(message.territoryHint ? `Territoire "${message.territoryHint}" non reconnu dans le référentiel` : "Aucun territoire mentionné");
  }
  if (!resolveReporterActor(state, message)) {
    missing.push("Déclarant non rattaché à un acteur connu du système");
  }
  return missing;
}

// --- Effets réels des deux commandes de qualification (mandat §4) -----
//
// Description fidèle de convert_message_to_signal / dismiss_incoming_message
// (src/domain/rules.ts) — jamais la narration bespoke du gabarit fixture,
// jamais une exécution simulée en direct (mandat : "do not fake
// execution"). /private-v3 ne dispose d'aucune mutation d'état ; ce texte
// documente ce que ferait réellement la commande dans le Produit.
export const CONVERT_TO_SIGNAL_EFFECT =
  "Ce message deviendrait un Signal réel (convert_message_to_signal) : canal et déclarant repris du message, disposition initiale « nouveau », traçabilité conservée vers ce message. Non exécuté dans cet environnement de démonstration.";

export const DISMISS_EFFECT =
  "Ce message serait marqué écarté (dismiss_incoming_message), avec motif obligatoire — il resterait consultable, jamais supprimé, et ne pourrait plus être converti. Non exécuté dans cet environnement de démonstration.";

export function fluxAgeHours(referenceAt: string, message: IncomingMessage): number | undefined {
  const ref = Date.parse(referenceAt);
  const at = Date.parse(message.receivedAt);
  if (Number.isNaN(ref) || Number.isNaN(at)) return undefined;
  return Math.max(0, Math.round((ref - at) / (60 * 60 * 1000)));
}
