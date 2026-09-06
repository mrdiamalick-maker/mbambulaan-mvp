import type { TrustLevel } from "@/domain/types";
import { TrustBadge } from "@/components/shared/StatusBadges";

// XXL-R1, primitive 7/9 (§18.7) — jamais un score : exprime déclaré,
// documenté, vérifié, à confirmer, limite connue. Habille TrustBadge
// (components/shared/StatusBadges.tsx, déjà en production, déjà correct
// sur le fond) plutôt que de le dupliquer (§19, pas de component
// factory) — cette primitive n'ajoute que ce qui manquait : une légende
// de limite optionnelle, en registre Evidence.
export function TrustIndicator({
  trust,
  limitation
}: {
  trust: TrustLevel;
  /** "Limite connue" (§18.7) — jamais fabriquée, affichée seulement si fournie. */
  limitation?: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <TrustBadge trust={trust} />
      {limitation && <span className="mb-evidence">{limitation}</span>}
    </span>
  );
}
