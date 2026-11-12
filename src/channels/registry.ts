// Registre de canaux — Sprint Terrain T01.
//
// Point d'extension unique pour "ajouter téléphone/SMS/autres plus tard"
// (mandat §1) : un nouveau canal n'ajoute qu'une entrée ici (et son
// propre fichier src/channels/<canal>.ts), jamais une branche conditionnelle
// dans le domaine ou dans les routes API.
import type { InteractionChannel } from "@/domain/types";
import type { ChannelAdapter } from "./types";
import { whatsappAdapter } from "./whatsapp";

const adapters: Partial<Record<InteractionChannel, ChannelAdapter>> = {
  whatsapp: whatsappAdapter
};

export function getChannelAdapter(channel: InteractionChannel): ChannelAdapter {
  const adapter = adapters[channel];
  if (!adapter) throw new Error(`Aucun adaptateur de canal configuré pour "${channel}".`);
  return adapter;
}
