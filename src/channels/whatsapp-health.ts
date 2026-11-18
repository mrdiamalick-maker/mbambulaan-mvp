// checkWhatsappConfiguration — Sprint T04, mandat §3 : "Add a startup/
// configuration health check that can tell an administrator whether
// inbound webhook is configured; outbound messaging credentials are
// present; media retrieval is configured." Vérifie UNIQUEMENT la
// PRÉSENCE des variables d'environnement déjà lues par src/channels/
// whatsapp.ts et src/intelligence/*-adapter.ts — jamais leur valeur
// (mandat "never expose secret values in UI/logs"). Fonction pure, sans
// effet de bord, appelable depuis une vue admin.
export interface WhatsappConfigurationStatus {
  inboundConfigured: boolean;
  outboundConfigured: boolean;
  mediaConfigured: boolean;
  anthropicConfigured: boolean;
  whisperConfigured: boolean;
}

function present(name: string): boolean {
  return !!process.env[name]?.trim();
}

export function checkWhatsappConfiguration(): WhatsappConfigurationStatus {
  return {
    // inboundConfigured — vérification du webhook (GET hub.verify_token)
    // ET validation de signature des événements entrants (POST).
    inboundConfigured: present("WHATSAPP_VERIFY_TOKEN") && present("WHATSAPP_APP_SECRET"),
    // outboundConfigured — envoi de texte (whatsappAdapter.sendText).
    outboundConfigured: present("WHATSAPP_ACCESS_TOKEN") && present("WHATSAPP_PHONE_NUMBER_ID"),
    // mediaConfigured — téléchargement de média (downloadWhatsappMedia),
    // même jeton que l'envoi sortant côté Graph API.
    mediaConfigured: present("WHATSAPP_ACCESS_TOKEN"),
    anthropicConfigured: present("ANTHROPIC_API_KEY") && present("ANTHROPIC_MODEL"),
    whisperConfigured: present("OPENAI_API_KEY")
  };
}
