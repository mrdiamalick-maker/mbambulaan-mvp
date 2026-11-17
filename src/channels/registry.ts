import type { InteractionChannel } from "@/domain/types";
import type { ChannelAdapter } from "./types";
import { whatsappAdapter } from "./whatsapp";

// Registre d'adaptateurs (mandat §3) : ajouter SMS/téléphone plus tard se
// limite à un nouveau fichier + une entrée ici, sans toucher au domaine ni
// à la route webhook.
const adapters: Partial<Record<InteractionChannel, ChannelAdapter>> = {
  whatsapp: whatsappAdapter
};

export function getChannelAdapter(channel: InteractionChannel): ChannelAdapter {
  const adapter = adapters[channel];
  if (!adapter) throw new Error(`Aucun adaptateur de canal configuré pour "${channel}".`);
  return adapter;
}
