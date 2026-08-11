// Badges partagés — canal d'origine et niveau de confiance — utilisés
// par CoordinatorHub (Lot 3) et SituationRoom (Lot 4). Composants
// shadcn (Badge), pas la palette sarcelle des anciens Badges.tsx
// (src/components/ui/Badges.tsx, toujours utilisé par SituationRow
// pour le registre /app/situations des rôles hors périmètre).
import type { Signal, TrustLevel } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { channelMeta, trustLabels } from "@/lib/status-tokens";

// tone="dark" : le variant "outline" par défaut (text-foreground,
// bordure --border) devient illisible sur un fond marine (héros
// bg-sidebar) — bug réel constaté au Lot 4 (contraste quasi nul dans
// le héros de la Situation Room, présent depuis le Lot 3 dans
// CoordinatorHub sans avoir été remarqué). tone="dark" force un
// contraste correct sur fond sombre plutôt que d'ajouter une classe
// ad hoc à chaque appel.
type Tone = "default" | "dark";
const toneClassName: Record<Tone, string> = {
  default: "",
  dark: "border-white/20 bg-white/[0.06] text-sidebar-foreground"
};

export function ChannelBadge({ signal, tone = "default" }: { signal?: Signal; tone?: Tone }) {
  if (!signal) return null;
  const meta = channelMeta[signal.channel];
  const Icon = meta.icon;
  return <Badge variant="outline" className={toneClassName[tone]}><Icon size={12} /> {meta.label}</Badge>;
}

export function TrustBadge({ trust, tone = "default" }: { trust: TrustLevel; tone?: Tone }) {
  return <Badge variant="outline" className={toneClassName[tone]}>{trustLabels[trust]}</Badge>;
}
