import type { GlyphTag } from "@/lib/status-tokens";
import { TensionGlyph } from "@/components/etat/TensionGlyph";

// XXL-R1, primitive 5/9 (§18.5) — expression cohérente d'un territoire :
// nom, localisation, statut de connaissance, signal éventuel. Réutilise
// TensionGlyph (déjà le langage "signal" du produit, cf. SignalMark) — un
// seul glyphe territorial/signal dans tout le produit, pas un second.
export function TerritoryIdentity({
  name,
  region,
  status,
  knowledgeSufficient = true,
  size = "md",
  tone = "light"
}: {
  name: string;
  region?: string;
  status: GlyphTag;
  /** Mandat §30 (audit) : l'absence de signal ne doit jamais se lire comme une stabilité. */
  knowledgeSufficient?: boolean;
  size?: "sm" | "md";
  /** "dark" — panneaux marine (Atlas, hero Situation…) : mêmes tokens, texte clair. */
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div className="flex items-center gap-3">
      <TensionGlyph status={status} size={size === "sm" ? 28 : 36} pulse={status === "critique"} />
      <div className="min-w-0">
        <p className={size === "sm" ? "mb-dossier-title text-[15px]" : "mb-dossier-title"} style={isDark ? { color: "#fdfbf5" } : undefined}>{name}</p>
        <p className="mb-evidence mt-0.5" style={isDark ? { color: "rgba(247,243,233,.5)" } : undefined}>
          {region ?? "Territoire"}
          {!knowledgeSufficient && <span style={{ color: isDark ? "#e2b56c" : "var(--mb-warning)" }}> · connaissance insuffisante</span>}
        </p>
      </div>
    </div>
  );
}
