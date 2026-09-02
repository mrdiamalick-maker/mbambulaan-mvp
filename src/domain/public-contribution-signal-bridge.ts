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
    // create_signal (rules.ts) fixe toujours category="infrastructure" —
    // aucune catégorie n'est acceptée en entrée de la commande (pas de
    // classification par type d'acteur possible à ce stade, même
    // discipline que le pont PublicRequest qui ne la choisit pas non
    // plus).
    const next = await deps.dispatch(
      {
        type: "create_signal",
        actorId: "act-espace-public",
        title: `Capacité proposée — ${contribution.actorType} (espace public)`,
        description: `${contribution.services} — territoires déclarés : ${contribution.territories}`,
        channel: "espace_public"
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
