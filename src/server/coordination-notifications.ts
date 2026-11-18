// attemptCoordinationNotifications — Sprint T03 (mandat §9, "use the
// existing channel abstraction... provider failure must not lose the
// coordination object"). Orchestration d'E/S réelle (envoi effectif),
// séparée du domaine pur (applyCommand reste synchrone — voir
// initiate_terrain_coordination, terrain-matching.ts, qui ne fait que
// PRÉPARER les notifications avec status "a_envoyer").
//
// Pourquoi ce fichier existe plutôt que d'ajouter l'E/S dans
// applyCommand : le domaine doit rester pur/synchrone (mandat implicite
// dès T01, respecté par repository.ts). Pourquoi il est appelé depuis
// /api/actions plutôt qu'un second pont webhook-like : en persistance
// memoire_locale_demo (voir /api/actions), un geste humain mute
// uniquement le `demoState` reçu du CLIENT, jamais l'état global serveur
// — un second endpoint qui lirait dispatch()/getState() ne verrait donc
// jamais la coordination que l'opérateur vient de créer. applyAndPersist
// est injecté par l'appelant pour fonctionner identiquement dans les
// deux modes de persistance (applyCommand pur en mode démo, dispatch()
// en mode PostgreSQL) sans que ce fichier ait besoin de connaître lequel.
import { getChannelAdapter } from "@/channels/registry";
import type { Command, ProductState } from "@/domain/types";

export type ApplyAndPersist = (state: ProductState, command: Command) => Promise<ProductState> | ProductState;

// attemptCoordinationNotifications — tente l'envoi réel de chaque
// notification encore "a_envoyer" pour une coordination donnée. Un échec
// (pas de canal connu, fournisseur WhatsApp non configuré, HTTP refusé...)
// ne retire jamais la Coordination ni la notification : seul son statut
// devient "echec" avec une raison explicite (mandat §9/§11). Un envoi
// réussi est aussi consigné dans l'historique de conversation
// (send_channel_message, mécanisme T01 déjà existant — mandat §9,
// "preserve outbound conversation history").
export async function attemptCoordinationNotifications(
  state: ProductState,
  coordinationId: string,
  applyAndPersist: ApplyAndPersist
): Promise<ProductState> {
  const coordination = state.terrainCoordinations.find((item) => item.id === coordinationId);
  if (!coordination) return state;

  let next = state;
  for (const notification of coordination.notifications) {
    if (notification.status !== "a_envoyer") continue;
    const targetActorId = notification.target === "demandeur" ? coordination.requesterActorId : coordination.providerActorId;
    const conversation = next.conversations.find((item) => item.actorId === targetActorId);

    try {
      if (!conversation) throw new Error("Aucun canal connu pour cet acteur.");
      const adapter = getChannelAdapter(conversation.channel);
      await adapter.sendText(conversation.channelAddress, notification.body);
      next = await applyAndPersist(next, {
        type: "record_coordination_notification_result",
        coordinationId,
        target: notification.target,
        status: "envoyee"
      });
      next = await applyAndPersist(next, {
        type: "send_channel_message",
        channel: conversation.channel,
        channelAddress: conversation.channelAddress,
        body: notification.body,
        sentAt: new Date().toISOString()
      });
    } catch (error) {
      next = await applyAndPersist(next, {
        type: "record_coordination_notification_result",
        coordinationId,
        target: notification.target,
        status: "echec",
        failureReason: (error as Error).message
      });
    }
  }
  return next;
}
