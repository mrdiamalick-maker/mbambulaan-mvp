import type { ReactNode } from "react";
import { TerritorySignature } from "@/components/foundations/TerritorySignature";

// XXL-R1, primitive 1/9 (§18.1) — titre + eyebrow + contexte + action
// éventuelle. PAS systématiquement une Card : rendu nu, la page qui
// l'utilise décide de son propre fond (crème par défaut, marine sur un
// hero — cf. surfaces témoins). Remplace les en-têtes ad hoc que
// Coordination/Atlas/Territoire réinventent chacun séparément (audit
// Maritime Intelligence, Design System V2, primitive 1).
export function PageIntro({
  eyebrow,
  title,
  dek,
  stat,
  action,
  tone = "light",
  signature = false,
  className
}: {
  eyebrow?: string;
  title: ReactNode;
  dek?: ReactNode;
  /** Un chiffre unique porté par la phrase d'ouverture — jamais une rangée de tuiles (§26, MetricStatement). */
  stat?: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
  /** Affiche la signature territoriale (§16) en filigrane, discret. */
  signature?: boolean;
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <div className={`relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className ?? ""}`}>
      {signature && (
        <div className="pointer-events-none absolute -right-1 -top-2 opacity-70">
          <TerritorySignature size={56} tone={isDark ? "cream" : "navy"} />
        </div>
      )}
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="mb-eyebrow" style={isDark ? { color: "var(--mb-terracotta-500)" } : undefined}>{eyebrow}</p>}
        <h1 className="mb-page-title mt-2" style={isDark ? { color: "#fdfbf5" } : undefined}>{title}</h1>
        {dek && <p className="mb-body mt-2" style={isDark ? { color: "rgba(247,243,233,.72)" } : undefined}>{dek}</p>}
        {stat && <div className="mt-3">{stat}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
