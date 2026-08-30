import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export type EtatRegistryMetric = {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "neutral" | "attention" | "critical" | "positive";
};

export function EtatRegistryHeader({
  eyebrow,
  title,
  description,
  metrics,
  children
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  metrics: EtatRegistryMetric[];
  children?: ReactNode;
}) {
  return (
    <section className="etat-registry-header">
      <Link href="/app/etat" className="etat-back-link">
        <ArrowLeft size={15} /> Retour au Brief national
      </Link>

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
