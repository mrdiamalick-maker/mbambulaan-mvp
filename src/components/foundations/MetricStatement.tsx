import type { ReactNode } from "react";

// XXL-R1, primitive 3/9 (§18.3) — pas une KPI card générique : un chiffre
// porteur de sens et de contexte, avec évolution éventuelle. Remplace les
// rangées de tuiles plates qui ne pilotent aucune décision (audit : Atlas
// index, bande de performance du Brief) au profit d'un nombre annoté,
// comme le fait déjà "Le pouls de la filière".
export function MetricStatement({
  value,
  label,
  context,
  trend,
  tone = "neutral",
  size = "md"
}: {
  value: ReactNode;
  label: string;
  /** Une phrase de sens, jamais un simple sous-titre répétitif. */
  context?: ReactNode;
  /** Évolution courte, ex. "+3 vs 7 jours" — texte libre, jamais fabriquée si absente. */
  trend?: ReactNode;
  tone?: "neutral" | "attention" | "critical" | "positive";
  size?: "sm" | "md";
}) {
  const toneColor = { neutral: "var(--mb-navy-950)", attention: "var(--mb-warning)", critical: "var(--mb-danger)", positive: "var(--mb-success)" }[tone];
  return (
    <div className="min-w-0">
      <p
        className="mb-metric-value"
        style={{ color: toneColor, fontSize: size === "sm" ? "1.25rem" : undefined }}
      >
        {value}
      </p>
      <p className="mb-operational mt-1 font-normal" style={{ color: "var(--mb-stone-600)", fontWeight: 500 }}>{label}</p>
      {context && <p className="mb-body mt-0.5 text-[13px]">{context}</p>}
      {trend && <p className="mb-evidence mt-1">{trend}</p>}
    </div>
  );
}
