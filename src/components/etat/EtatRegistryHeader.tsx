import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TerritorySignature } from "@/components/foundations";

export type EtatRegistryMetric = {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "neutral" | "attention" | "critical" | "positive";
};

// XXL-R2 (§25 du mandat) — grammaire commune (§6) : ce composant reste le
// seul en-tête des 4 registres État (Territoires/Arbitrages/Programmes/
// Rapport), donc l'endroit le plus efficace pour propager une seule fois
// la signature territoriale plutôt que de la répéter par page. `signature`
// reste un prop optionnel, jamais activé par défaut ("pas partout", §25) —
// seules les pages effectivement ancrées territorialement l'activent.
export function EtatRegistryHeader({
  eyebrow,
  title,
  description,
  metrics,
  children,
  signature = false
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  metrics: EtatRegistryMetric[];
  children?: ReactNode;
  signature?: boolean;
}) {
  return (
    <section className="etat-registry-header relative">
      <Link href="/app/etat" className="etat-back-link">
        <ArrowLeft size={15} /> Retour au Brief national
      </Link>

      {signature && (
        <div className="pointer-events-none absolute right-0 top-0 opacity-60">
          <TerritorySignature size={48} tone="navy" />
        </div>
      )}

      <div className="etat-registry-heading">
        <div className="min-w-0">
          <p className="etat-eyebrow">{eyebrow}</p>
          <h1 className="etat-display etat-registry-title">{title}</h1>
          <div className="etat-registry-description">{description}</div>
        </div>
        {children && <div className="etat-registry-tools">{children}</div>}
      </div>

      <div className="etat-metric-strip" aria-label="Synthèse du registre">
        {metrics.map((metric) => (
          <div key={metric.label} className={`etat-metric etat-metric--${metric.tone ?? "neutral"}`}>
            <p className="etat-metric-value">{metric.value}</p>
            <p className="etat-metric-label">{metric.label}</p>
            {metric.detail && <p className="etat-metric-detail">{metric.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
