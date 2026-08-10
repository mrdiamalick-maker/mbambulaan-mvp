// Événements analytics du Public, conformes à la section 21 du MASTER_SPEC.
// Volontairement internes (pas de dépendance à un fournisseur tiers non
// configuré) : persistés côté serveur, exploitables pour mesurer le funnel
// "visiteurs -> engagement -> intentions -> demandes -> actions -> revenus".

export const publicAnalyticsEvents = [
  "page_view",
  "content_view",
  "atlas_open",
  "atlas_search",
  "atlas_location_view",
  "solution_started",
  "solution_step_completed",
  "solution_submitted",
  "whatsapp_clicked",
  "callback_requested",
  "opportunity_view",
  "opportunity_interest",
  "network_submission",
  "partnership_submission",
  "atlas_correction",
  "contact_started"
] as const;

export type PublicAnalyticsEvent = (typeof publicAnalyticsEvents)[number];

export interface PublicAnalyticsInput {
  event: PublicAnalyticsEvent;
  path?: string;
  properties?: Record<string, string | undefined>;
}
