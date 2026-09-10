// LOT V3.3 (mandat "Flux / Dossiers & Convergence") — dérivations pures
// pour la file d'entrée (IncomingMessage), même esprit que
// src/domain/situation-overview.ts (LOT V3.2) : uniquement des lectures
// depuis un ProductState déjà chargé, aucune commande, aucun texte
// fabriqué, aucune IA.
import type { Actor, IncomingMessage, ProductState, Territory } from "@/domain/types";

// resolveTerritoryFromHint — EXTRAIT de
// src/components/ecosystem/CoordinationWorkspace.tsx (IncomingMessageThread,
// pré-remplissage du territoire à la qualification), reprise à l'identique
// plutôt que dupliquée : un message ne porte qu'un territoire déclaré en
// texte libre (territoryHint), jamais garanti correspondre à un Territory
// réel — la même heuristique (correspondance textuelle réciproque,
// insensible à la casse) doit rester la SEULE source de vérité pour "le
// territoire est-il résolu ?", que ce soit pour pré-remplir un formulaire
// ou pour projeter "ce que le système a pu rattacher" (mandat §6).
// N'affirme une résolution que si l'heuristique produit EXACTEMENT un
// candidat — une correspondance ambiguë (plusieurs territoires possibles)
// n'est jamais présentée comme résolue.
export function resolveTerritoryFromHint(state: ProductState, hint: string | undefined): Territory | undefined {
  const needle = (hint ?? "").toLowerCase().trim();
  if (!needle) return undefined;
  const matches = state.territories.filter((item) => item.name.toLowerCase().includes(needle) || needle.includes(item.name.toLowerCase()));
  return matches.length === 1 ? matches[0] : undefined;
}

export function resolveReportedByActor(state: ProductState, message: IncomingMessage): Actor | undefined {
  if (!message.reportedByActorId) return undefined;
  return state.actors.find((item) => item.id === message.reportedByActorId);
}

export interface FluxStats {
  nouveau: number;
  converti: number;
  ecarte: number;
  total: number;
}

// fluxStats — 3 paliers RÉELS (IncomingMessage.status : "nouveau" |
// "converti" | "ecarte", domain/types.ts). La maquette Claude Design V3
// propose 4 paliers ("Reçu" / "À qualifier" / "Qualifié" / "Écarté"),
// dont les deux premiers supposent une distinction "arrivé mais pas encore
// examiné" vs "examiné, en attente de décision" que le modèle réel ne
// porte pas (aucun champ ne distingue ces deux étapes) — jamais fabriquée
// ici : les paliers réels restent 3, chacun un décompte direct.
export function fluxStats(state: ProductState): FluxStats {
  const nouveau = state.incomingMessages.filter((item) => item.status === "nouveau").length;
  const converti = state.incomingMessages.filter((item) => item.status === "converti").length;
  const ecarte = state.incomingMessages.filter((item) => item.status === "ecarte").length;
  return { nouveau, converti, ecarte, total: state.incomingMessages.length };
}

export interface FluxChannelCount {
  channel: IncomingMessage["channel"];
  count: number;
}

const ALL_CHANNELS: IncomingMessage["channel"][] = ["terrain", "telephone", "whatsapp_structure", "poste_quai", "espace_public"];

export function fluxChannelDistribution(state: ProductState): FluxChannelCount[] {
  return ALL_CHANNELS.map((channel) => ({ channel, count: state.incomingMessages.filter((item) => item.channel === channel).length }));
}

// messageAgeLabel — même discipline que situationAgeLabel
// (domain/situation-overview.ts) : référencée contre l'horloge MÉTIER du
// jeu de données (deriveDatasetReferenceAt, appelée par le composant),
// jamais Date.now(). Résolution à l'heure (pas seulement au jour) — les
// remontées sont un flux court terme, contrairement aux Situations.
export function messageAgeLabel(message: IncomingMessage, referenceAtMs: number): string {
  const ms = referenceAtMs - new Date(message.receivedAt).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours <= 0) return "à l’instant";
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
}

export type FluxMatchKey = "territoire" | "emetteur";

export interface FluxMatch {
  key: FluxMatchKey;
  label: string;
  value: string;
}

export interface FluxMissing {
  key: FluxMatchKey;
  label: string;
}

// projectFluxContext — "Ce que le système a pu rattacher" / "Ce qui
// manque pour qualifier" (mandat §6). Strictement déterministe, deux
// dimensions seulement — celles pour lesquelles le référentiel offre déjà
// une résolution défendable (le même territoire pré-rempli à la
// qualification, cf. resolveTerritoryFromHint ; le même déclarant
// structuré déjà affiché dans le fil, reportedByActorId). AUCUNE
// détection de doublon/situation liée n'est projetée ici : le modèle ne
// porte aujourd'hui aucun mécanisme de rapprochement textuel ou
// territorial défendable pour cela (duplicateOfSignalId n'existe qu'une
// fois le choix fait PAR le coordinateur à l'écartement — jamais déduit
// à l'avance) — "si le rapprochement n'est pas défendable, ne pas
// l'afficher" (mandat §6), donc omis plutôt qu'approximé.
export function projectFluxContext(state: ProductState, message: IncomingMessage): { matched: FluxMatch[]; missing: FluxMissing[] } {
  const matched: FluxMatch[] = [];
  const missing: FluxMissing[] = [];

  const territory = resolveTerritoryFromHint(state, message.territoryHint);
  if (territory) {
    matched.push({ key: "territoire", label: "Territoire", value: territory.name });
  } else if (message.territoryHint) {
    missing.push({ key: "territoire", label: `Territoire déclaré (« ${message.territoryHint} ») non confirmé dans le référentiel` });
  } else {
    missing.push({ key: "territoire", label: "Territoire non déclaré à la source" });
  }

  const actor = resolveReportedByActor(state, message);
  if (actor) {
    matched.push({ key: "emetteur", label: "Émetteur", value: `${actor.name} · connu du référentiel` });
  } else {
    missing.push({ key: "emetteur", label: "Émetteur non rattaché à un acteur du référentiel" });
  }

  return { matched, missing };
}
