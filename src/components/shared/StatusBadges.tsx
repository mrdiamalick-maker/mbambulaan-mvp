// Badges partagés — canal d'origine et niveau de confiance — utilisés
// par CoordinatorHub (Lot 3) et SituationRoom (Lot 4). Composants
// shadcn (Badge), pas la palette sarcelle des anciens Badges.tsx
// (src/components/ui/Badges.tsx, toujours utilisé par SituationRow
// pour le registre /app/situations des rôles hors périmètre).
//
// Resserrage visuel (post-Lot 4) : variantes pleines plutôt qu'outline
// — un badge de confiance contestée/expirée doit se voir immédiatement,
// pas se fondre dans un gris pastel. Le canal, lui, reste une
// information neutre (marine plein) : ce n'est pas un signal
// d'urgence, juste l'origine du signal.
//
// Effet de bord utile : ces variantes ont toutes un fond opaque, donc
// restent lisibles aussi bien sur une carte claire que sur un héros
// marine (bg-sidebar) — l'ancien contournement tone="dark" (nécessaire
// avec le variant "outline" par défaut, texte sombre invisible sur
// fond sombre) n'est plus nécessaire et a été retiré.
import type { Signal, TrustLevel } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { channelMeta, trustLabels } from "@/lib/status-tokens";

type BadgeVariant = "marine" | "terracotta" | "amber" | "success";

const trustVariant: Record<TrustLevel, BadgeVariant> = {
  verifiee: "success",
  consolidee: "success",
  documentee: "success",
  officielle: "success",
  rapprochee: "success",
  declaree: "marine",
  observee: "marine",
  estimee: "amber",
  contestee: "terracotta",
  expiree: "terracotta"
};

export function ChannelBadge({ signal }: { signal?: Signal }) {
  if (!signal) return null;
  const meta = channelMeta[signal.channel];
  const Icon = meta.icon;
  return <Badge variant="marine"><Icon size={12} /> {meta.label}</Badge>;
}

export function TrustBadge({ trust }: { trust: TrustLevel }) {
  return <Badge variant={trustVariant[trust]}>{trustLabels[trust]}</Badge>;
}
