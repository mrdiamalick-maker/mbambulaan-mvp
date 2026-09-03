// Logique pure du pont PublicContribution → Signal (LOT 6, mandat "Public
// — Comprendre, trouver, contribuer", §13/§14 : "Pour les contributions
// réellement métier : PublicContribution → Signal entrant / connaissance
// à qualifier sans Situation automatique." Point volontairement laissé en
// follow-up par LOT 0 (public-repository.ts), fermé ici — même
// architecture que public-request-signal-bridge.ts : logique pure,
// injectée avec getState/dispatch, testable sans "server-only".
//
// Toute PublicContribution soumise via ContributionForm est une
// proposition de capacité réelle (transport, froid, transformation,
// formation, financement…) — jamais une demande presse ni un contact
// générique (ceux-là passent par PublicRequest et sont déjà exclus du
// pipeline Signal par isMetierPublicRequest). Il n'y a donc pas
// d'équivalent "notApplicable" ici : toute contribution soumise via ce
// formulaire est métier par construction.
import type { PublicContributionActorType } from "@/domain/public/contribution";
import type { AuditEntry, Command, Signal } from "@/domain/types";

// resolveContributionSignalCategory (LOT 6, micro-correctif final "ne plus
// fabriquer infrastructure") — une catégorie n'est renseignée que
// lorsqu'elle est réellement déterminable à partir d'un champ structuré
// (actorType, pas un mot-clé libre de `services`) : "transformateur" est
// la seule valeur d'actorType qui corresponde sans ambiguïté à une des 6
// catégories Signal existantes ("production"). Toutes les autres restent
// undefined — create_signal applique alors son repli neutre "autre" (cf.
// rules.ts), jamais une classification inventée pour cette fonction.
export function resolveContributionSignalCategory(actorType: PublicContributionActorType): Signal["category"] | undefined {
  if (actorType === "transformateur") return "production";
  return undefined;
}

export interface PublicContributionSignalSyncRequest {
  id: string;
  actorType: PublicContributionActorType;
  services: string;
  territories: string;
  createdAt: string;
}

export interface PublicContributionSignalSyncDeps {
  dispatch: (command: Command, idempotencyKey: string) => Promise<{ signals: Signal[]; audit: AuditEntry[] }>;
}

// attemptPublicContributionSignalSync — même discipline que le pont
// PublicRequest : ne lève jamais, idempotent (clé dérivée de l'id de la
// contribution), aucune Situation créée (create_signal seul). Le
// territoire déclaré ("territories") reste du texte libre potentiellement
// multi-valeurs (ex. "Petite-Côte, national") — jamais résolu à un
// Territory réel ici (contrairement à PublicRequest.territory qui vise
// souvent un lieu précis) : absent plutôt que fabriqué, cf. doctrine
// anti-surinterprétation.
export async function attemptPublicContributionSignalSync(
  contribution: PublicContributionSignalSyncRequest,
  deps: PublicContributionSignalSyncDeps
): Promise<{ signalId?: string }> {
  try {
    const next = await deps.dispatch(
      {
        type: "create_signal",
        actorId: "act-espace-public",
        title: `Capacité proposée — ${contribution.actorType} (espace public)`,
        description: `${contribution.services} — territoires déclarés : ${contribution.territories}`,
        channel: "espace_public",
        category: resolveContributionSignalCategory(contribution.actorType),
        // sourceRef (P2.1-A) — même discipline que le pont PublicRequest
        // (public-request-signal-bridge.ts) : symétrique à
        // PublicContribution.coreSignalId, sans nouveau champ sur
        // PublicContribution elle-même.
        sourceRef: { objectType: "public_contribution", objectId: contribution.id }
      },
      `public-contribution:${contribution.id}`
    );

    const auditSignalId = next.audit[0]?.objectType === "signal" ? next.audit[0].objectId : undefined;
    const fallbackSignalId = next.signals.find(
      (item) => item.actorId === "act-espace-public" && item.createdAt >= contribution.createdAt && item.title.includes(contribution.actorType)
    )?.id;
    return { signalId: auditSignalId ?? fallbackSignalId };
  } catch {
    return {};
  }
}
