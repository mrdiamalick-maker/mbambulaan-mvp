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
import type { AuditEntry, Command, Signal, Territory } from "@/domain/types";

// isMetierPublicRequest (LOT 6, mandat "Public — Comprendre, trouver,
// contribuer", §13/TEST F) — "Toutes les soumissions n'ont pas forcément
// vocation à devenir un Signal. Exemple : demande presse n'est pas un
// Signal métier maritime." Une demande "presse", "partenariat"
// institutionnel, "callback" générique ou "autre" sans contexte métier ne
// doit jamais polluer le pipeline de Signaux terrain. Exception explicite
// : une correction/signalement Atlas (category === "Correction Atlas",
// cf. /contact?intent=correction) reste métier même si son intent
// générique est "autre" — §13 la cite nommément comme devant entrer dans
// le Core de manière traçable. Toutes les intentions liées à un besoin
// réel de la filière (transport, froid, transformation, équipement,
// maintenance, formation, débouchés, programme, sourcing, connaissance
// d'un territoire, financement, organisation portant une intervention)
// restent métier.
const NON_METIER_INTENTS = new Set<PublicRequestInput["intent"]>(["presse", "partenariat", "callback", "autre"]);

export function isMetierPublicRequest(intent: PublicRequestInput["intent"], category?: string): boolean {
  if (category === "Correction Atlas") return true;
  return !NON_METIER_INTENTS.has(intent);
}

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

// attemptPublicRequestSignalSync (Correction Product Review, LOT 0,
// 2026-09-01, "PublicRequest → Core Signal doit être garanti") : le coeur
// de la tentative de convergence — dérivation du canal/territoire,
// construction de la commande create_signal, clé d'idempotence, lecture
// du signal résultant — injecté avec deps.getState/deps.dispatch plutôt
// que d'importer @/server/repository directement (qui porte
// "server-only" et n'est donc exécutable qu'en contexte Next.js réel).
// Dépendance injectée, pas une sur-architecture : cette seule fonction
// est ce que src/server/public-repository.ts appelle avec les vraies
// getState/dispatch, ET ce que les tests appellent avec des doubles —
// une seule implémentation de la logique de convergence, jamais
// dupliquée entre "réel" et "testé". Ne lève jamais : un échec (Core
// indisponible, etc.) renvoie simplement { signalId: undefined },
// l'appelant décide quoi en faire (rester "pending", jamais perdre la
// PublicRequest elle-même).
export interface PublicRequestSignalSyncRequest {
  id: string;
  territory?: string;
  source: PublicRequestInput["source"];
  intent: PublicRequestInput["intent"];
  // LOT 6 (§13) — nécessaire pour l'exception "Correction Atlas" de
  // isMetierPublicRequest ci-dessus.
  category?: string;
  description: string;
  createdAt: string;
}

export interface PublicRequestSignalSyncDeps {
  getState: () => Promise<{ territories: Territory[] }>;
  dispatch: (command: Command, idempotencyKey: string) => Promise<{ signals: Signal[]; audit: AuditEntry[] }>;
}

// LOT 6 (§13/TEST F) — résultat désormais discriminé : `notApplicable`
// distingue "cette demande n'a jamais eu vocation à devenir un Signal"
// (presse/partenariat/callback/autre générique) d'un échec temporaire de
// convergence (`signalId` absent, `notApplicable` faux) qui doit rester
// "pending" et rejouable. L'appelant (public-repository.ts) décide du
// coreSignalStatus à partir de cette seule distinction.
export interface PublicRequestSignalSyncResult {
  signalId?: string;
  notApplicable?: boolean;
}

export async function attemptPublicRequestSignalSync(
  request: PublicRequestSignalSyncRequest,
  deps: PublicRequestSignalSyncDeps
): Promise<PublicRequestSignalSyncResult> {
  if (!isMetierPublicRequest(request.intent, request.category)) {
    return { notApplicable: true };
  }
  try {
    const state = await deps.getState();
    const territoryId = resolvePublicRequestTerritoryId(state.territories, request.territory);

    const next = await deps.dispatch(
      {
        type: "create_signal",
        actorId: "act-espace-public",
        territoryId,
        title: `${request.intent} — demande de l'espace public`,
        description: request.description,
        channel: publicRequestSourceToSignalChannel(request.source)
      },
      `public-request:${request.id}`
    );

    // Cas normal (premier appel réussi, dispatch exécute réellement la
    // commande) : l'entrée d'audit la plus récente pour ce signal porte
    // directement son id (withAudit, applySignalOnlyCreation dans
    // rules.ts) — lecture fiable, pas une supposition sur l'ordre de
    // next.signals.
    const auditSignalId = next.audit[0]?.objectType === "signal" ? next.audit[0].objectId : undefined;
    // Cas rejeu après un échec partiel très étroit (Signal créé mais le
    // statut "synced" jamais persisté, ex. crash entre les deux
    // écritures) : dispatch() court-circuite alors sur l'idempotence,
    // l'audit ne pointe plus vers CE signal précis — recherche de
    // secours par contenu. Jamais garantie à 100 % en cas de doublon de
    // description exact, mais sans risque de duplication du Signal
    // lui-même : dispatch() reste la seule source de vérité sur ce
    // point, cette recherche ne fait que retrouver une référence pour
    // l'affichage.
    const fallbackSignalId = next.signals.find(
      (item) => item.actorId === "act-espace-public" && item.description === request.description && item.createdAt >= request.createdAt
    )?.id;
    return { signalId: auditSignalId ?? fallbackSignalId };
  } catch {
    return {};
  }
}
