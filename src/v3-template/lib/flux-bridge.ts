// Pont Flux ↔ domaine réel — PD.4, mandat "Product Dressing — Situations
// & Flux Real Domain Integration". Même discipline que landing-bridge.ts
// (PD.1) : le SEUL endroit où l'écran Flux (gabarit gelé) touche le
// domaine réel Mbàmbulaan ; Flux.tsx ne connaît que les vues déjà
// formatées exportées ci-dessous.
//
// FluxRowView.id est un entier séquentiel (0..N-1, ordre d'ancienneté),
// PAS l'identifiant réel du message (IncomingMessage.id est une chaîne).
// Choix délibéré : AppState.dossOpen/dossChoice (state.ts, gabarit gelé)
// sont typés `number` — un entier séquentiel les laisse inchangés
// (aucune modification de state.ts nécessaire pour ce lot) tout en
// gardant idRéel disponible sur chaque vue pour les appels au domaine.
import { DEMO_STATE } from "./demo-state";
import type { CommandInput, IncomingMessage, IncomingMessageDismissReason, ProductState, Signal } from "@/domain/types";
import { incomingMessageDismissReasonLabels, signalCategoryLabels } from "@/domain/types";
import {
  CONVERT_TO_SIGNAL_EFFECT,
  DISMISS_EFFECT,
  fluxAgeHours,
  fluxMatchedFacts,
  fluxMissingFacts,
  fluxStage,
  fluxStageCounts,
  resolveTerritoryHint,
  type FluxStage
} from "@/domain/flux-intelligence";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";
import { channelMeta } from "@/lib/status-tokens";
import { formatCalendarDate } from "./landing-bridge";

// Couleurs de canal — reprises verbatim de la palette déjà utilisée par
// le gabarit Flux fixture (rust/ardoise/brun déjà présents dans
// data/flux.ts), jamais une nouvelle teinte introduite pour ce lot.
const CHANNEL_COLOR: Record<IncomingMessage["channel"], string> = {
  terrain: "#B6522F",
  telephone: "#8E6420",
  whatsapp_structure: "#4A6478",
  poste_quai: "#B6522F",
  espace_public: "#4A6478"
};

function referenceAt(state: ProductState): string {
  return deriveDatasetReferenceAt(state) ?? new Date().toISOString();
}

function shortTitle(body: string): string {
  const trimmed = body.replace(/^«\s*/, "").replace(/\s*»$/, "").trim();
  if (trimmed.length <= 72) return trimmed;
  const cut = trimmed.slice(0, 72);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : 72)}…`;
}

function formatDateTime(iso: string): string {
  const time = new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${formatCalendarDate(iso.slice(0, 10))} ${time}`;
}

function ageLabel(hours: number | undefined): string {
  if (hours === undefined) return "âge inconnu";
  if (hours < 1) return "< 1 h";
  if (hours < 48) return `${hours} h`;
  return `${Math.floor(hours / 24)} j`;
}

export interface FluxRowView {
  id: number;
  realId: string;
  channelLabel: string;
  channelColor: string;
  title: string;
  territoryLabel: string;
  from: string;
  ageLabel: string;
  receivedLabel: string;
  status: IncomingMessage["status"];
  stage: FluxStage;
}

export interface FluxDetailView extends FluxRowView {
  body: string;
  matched: Array<{ label: string; value: string }>;
  missing: string[];
  actions: Array<{ label: string; effect: string; kind: "convert" | "dismiss" }>;
}

function toRowView(state: ProductState, message: IncomingMessage, index: number): FluxRowView {
  const territory = resolveTerritoryHint(state, message);
  return {
    id: index,
    realId: message.id,
    channelLabel: channelMeta[message.channel].label,
    channelColor: CHANNEL_COLOR[message.channel],
    title: shortTitle(message.body),
    territoryLabel: territory ? territory.name : message.territoryHint ? `${message.territoryHint} · non résolu` : "Territoire non précisé",
    from: message.reportedBy,
    ageLabel: ageLabel(fluxAgeHours(referenceAt(state), message)),
    receivedLabel: formatDateTime(message.receivedAt),
    status: message.status,
    stage: fluxStage(message)
  };
}

// sortedMessagesOf — triés du plus ancien au plus récent, même convention
// que le gabarit fixture ("Plus ancien en premier"). Les 4 IncomingMessage
// réels du Demo World initial sont tous au statut "nouveau" (audit PD.4) —
// une liste plus courte que le gabarit fixture (6 éléments variés), mais
// entièrement réelle plutôt que complétée artificiellement (mandat §19).
function sortedMessagesOf(state: ProductState): IncomingMessage[] {
  return [...state.incomingMessages].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
}

// buildFluxRows/getFluxDetail/buildFluxStages (PD.5, mandat "Operational
// Knowledge Bridge", §3/§4) — désormais paramétrées par un ProductState
// explicite (repli DEMO_STATE, le singleton statique de PD.1/PD.4, pour
// ne rien changer aux appelants existants) plutôt que de lire uniquement
// le singleton figé au chargement du module : le runtime V3
// (lib/domain-runtime.ts) leur passe l'état réel, live, lu depuis
// GET /api/state — même calcul, jamais une seconde logique dupliquée.
export function buildFluxRows(state: ProductState = DEMO_STATE): FluxRowView[] {
  return sortedMessagesOf(state).map((message, index) => toRowView(state, message, index));
}

export const FLUX_ROWS: FluxRowView[] = buildFluxRows();

export function getFluxDetail(rowId: number, state: ProductState = DEMO_STATE): FluxDetailView | undefined {
  const message = sortedMessagesOf(state)[rowId];
  if (!message) return undefined;
  const row = toRowView(state, message, rowId);
  return {
    ...row,
    body: message.body,
    matched: fluxMatchedFacts(state, message),
    missing: fluxMissingFacts(state, message),
    // Actions réelles uniquement (mandat §4) : convert_message_to_signal
    // et dismiss_incoming_message sont les deux seules commandes qui
    // qualifient réellement un IncomingMessage — jamais les actions
    // bespoke du gabarit fixture ("Rattacher à la situation existante",
    // "Transférer hors périmètre"…), qu'aucune commande ne supporte.
    // Non proposées si le message n'est plus "nouveau" (les deux
    // commandes réelles refusent déjà cette transition, cf. rules.ts).
    actions:
      message.status === "nouveau"
        ? [
            { label: "Convertir en signal", effect: CONVERT_TO_SIGNAL_EFFECT, kind: "convert" as const },
            { label: "Écarter", effect: DISMISS_EFFECT, kind: "dismiss" as const }
          ]
        : []
  };
}

export interface FluxStageTile {
  key: FluxStage;
  label: string;
  count: number;
  def: string;
  color: string;
}

// FLUX_STAGES — remplace STAGE_DEFS (mandat §1 : "do not invent new
// workflow stages"). Le gabarit fixture distinguait "Reçu" et "À
// qualifier" ; IncomingMessage.status ne porte pas cette nuance
// (fluxStage la fait déjà correspondre au même palier réel côté
// domaine) — un seul palier "à_qualifier" est donc montré ici plutôt que
// deux tuiles pointant artificiellement vers des comptages différents.
export function buildFluxStages(state: ProductState = DEMO_STATE): FluxStageTile[] {
  const counts = fluxStageCounts(state);
  return [
    { key: "a_qualifier", label: "À qualifier", count: counts.a_qualifier, def: "Reçu, en attente d'une décision de qualification (converti ou écarté).", color: "#B6522F" },
    { key: "qualifie", label: "Qualifié", count: counts.qualifie, def: "Converti en Signal réel.", color: "#4E7B5A" },
    { key: "ecarte", label: "Écarté", count: counts.ecarte, def: "Écarté avec motif — consultable, jamais supprimé.", color: "rgba(11,26,42,.4)" }
  ];
}

// --- PD.5 — exécution réelle (mandat "Operational Knowledge Bridge", §4) --
//
// buildConvertCommand/buildDismissCommand construisent la commande
// CANONIQUE (convert_message_to_signal / dismiss_incoming_message,
// rules.ts) prête à être envoyée à POST /api/actions par le runtime V3
// (lib/domain-runtime.ts) — toute la logique de résolution/validation
// reste ici, jamais recréée dans Flux.tsx (mandat §3 : "Do not recreate
// business logic in React"). category et reason restent un choix humain
// explicite, jamais déduit (même discipline que le domaine :
// IncomingMessageDismissReason, types.ts, "le coordinateur choisit, rien
// n'est déduit") — title/description reprennent le contenu réel du
// message tel quel, jamais un texte fabriqué.
export const DISMISS_REASONS: IncomingMessageDismissReason[] = ["hors_perimetre", "doublon", "information_insuffisante", "autre"];
export const CONVERT_CATEGORIES: Signal["category"][] = ["infrastructure", "production", "marche", "qualite", "securite", "conformite", "autre"];
export { incomingMessageDismissReasonLabels, signalCategoryLabels };

export type FluxCommandResult = { command: CommandInput } | { error: string };

export function buildConvertCommand(state: ProductState, rowId: number, category: Signal["category"]): FluxCommandResult {
  const message = sortedMessagesOf(state)[rowId];
  if (!message) return { error: "Message introuvable." };
  if (message.status !== "nouveau") return { error: "Ce message n'est plus à qualifier." };
  const territory = resolveTerritoryHint(state, message);
  if (!territory) return { error: "Aucun territoire résolu pour ce message — la conversion exige un territoire réel." };
  return {
    command: {
      type: "convert_message_to_signal",
      messageId: message.id,
      territoryId: territory.id,
      category,
      title: shortTitle(message.body),
      description: message.body,
      reportedByActorId: message.reportedByActorId
    }
  };
}

export function buildDismissCommand(state: ProductState, rowId: number, reason: IncomingMessageDismissReason): FluxCommandResult {
  const message = sortedMessagesOf(state)[rowId];
  if (!message) return { error: "Message introuvable." };
  if (message.status !== "nouveau") return { error: "Ce message n'est plus à qualifier." };
  return { command: { type: "dismiss_incoming_message", messageId: message.id, reason } };
}
