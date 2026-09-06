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

const toneDotColor: Record<NonNullable<EtatRegistryMetric["tone"]>, string> = {
  neutral: "transparent",
  attention: "var(--etat-ocre)",
  critical: "var(--etat-critique)",
  positive: "var(--etat-vert)"
};

// XXL-R2 (§25 du mandat) — grammaire commune (§6) : ce composant reste le
// seul en-tête des 4 registres État (Territoires/Arbitrages/Programmes/
// Rapport), donc l'endroit le plus efficace pour propager une seule fois
// la signature territoriale plutôt que de la répéter par page. `signature`
// reste un prop optionnel, jamais activé par défaut ("pas partout", §25) —
// seules les pages effectivement ancrées territorialement l'activent.
//
// P2.DESIGN-1A.2 (North Star Claude Design) — bandeau de synthèse
// reconstruit en ligne à filets (etat-headline-strip), plus en grille de
// tuiles carrées : même prop `metrics` (aucun appelant à modifier), le
// `tone` se lit désormais comme un point de couleur discret devant le
// libellé plutôt qu'un liseré de tuile — cohérent avec la géométrie plate
// du prototype (jamais de carte encadrée pour un simple agrégat).
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
          <p className="etat-eyebrow"><span className="etat-eyebrow-dot" />{eyebrow}</p>
          <h1 className="etat-display etat-h1 etat-h1--registry etat-registry-title">{title}</h1>
          <div className="etat-registry-description">{description}</div>
        </div>
        {children && <div className="etat-registry-tools">{children}</div>}
      </div>

      <div className="etat-headline-strip mt-7" aria-label="Synthèse du registre">
        {metrics.map((metric) => (
          <div key={metric.label} className="etat-headline-cell">
            <p className="etat-headline-value">{metric.value}</p>
            <p className="etat-headline-label">
              {metric.tone && metric.tone !== "neutral" && (
                <span className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ backgroundColor: toneDotColor[metric.tone] }} aria-hidden="true" />
              )}
              {metric.label}
            </p>
            {metric.detail && <p className="mt-1 text-[11px] leading-4 text-[var(--etat-stone-400)]">{metric.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
