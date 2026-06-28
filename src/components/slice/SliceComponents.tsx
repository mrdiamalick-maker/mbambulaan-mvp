import Link from "next/link";
import type { MvpAction, MvpNeed, MvpProofLevel, MvpQualityStatus, MvpSignal, MvpTrustSignal } from "@/data/mvpSlice";
import type { Opportunite } from "@/lib/coordination";
import type { MvpSliceStep, MvpSliceSummary } from "@/lib/mvpSlice";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

export function ProofBadge({ level }: { level: MvpProofLevel }) {
  const tone: Record<MvpProofLevel, StatusTone> = {
    déclaratif: "warning",
    estimé: "info",
    validé: "success",
    système: "dark",
    audité: "impact"
  };

  return <StatusBadge tone={tone[level]}>Preuve {level}</StatusBadge>;
}

export function TrustBadge({ score }: { score: number }) {
  const tone: StatusTone = score >= 85 ? "success" : score >= 70 ? "warning" : "danger";
  const label = score >= 85 ? "Confiance élevée" : score >= 70 ? "Confiance moyenne" : "Confiance à vérifier";

  return <StatusBadge tone={tone}>{label} · {score}/100</StatusBadge>;
}

export function QualityBadge({ quality }: { quality: MvpQualityStatus }) {
  const tone: Record<MvpQualityStatus["risk"], StatusTone> = {
    Faible: "success",
    Moyen: "info",
    Élevé: "warning",
    Critique: "danger"
  };

  return <StatusBadge tone={tone[quality.risk]}>{quality.label} · {quality.score}/100</StatusBadge>;
}

export function SignalCard({ signal, trust }: { signal: MvpSignal; trust?: MvpTrustSignal }) {
  return (
    <ProductCard tone="active">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Signal terrain</p>
          <h3 className="mt-2 text-2xl font-black text-[#0F2D4A]">{signal.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{signal.volume} de {signal.species} · {signal.quay} · {signal.date}</p>
        </div>
        <StatusBadge tone="info">{signal.status}</StatusBadge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ProofBadge level={signal.proofLevel} />
        {trust ? <TrustBadge score={trust.score} /> : null}
      </div>
      <p className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-sm font-bold leading-6 text-[#334155]">Source : {signal.source}</p>
    </ProductCard>
  );
}

export function NeedCard({ need }: { need: MvpNeed }) {
  return (
    <ProductCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Besoin acheteur</p>
          <h3 className="mt-2 text-2xl font-black text-[#0F2D4A]">{need.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{need.volume} de {need.species} · {need.quay}</p>
        </div>
        <StatusBadge tone="warning">{need.status}</StatusBadge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ProofBadge level={need.proofLevel} />
        <StatusBadge tone="neutral">{need.source}</StatusBadge>
      </div>
    </ProductCard>
  );
}

export function OpportunityCard({ opportunity }: { opportunity?: Opportunite }) {
  if (!opportunity) {
    return (
      <ProductCard>
        <p className="text-lg font-black text-[#0F2D4A]">Aucune opportunité exploitable.</p>
        <p className="mt-2 text-sm font-semibold text-[#334155]">Le moteur attend un signal et un besoin compatible.</p>
      </ProductCard>
    );
  }

  return (
    <ProductCard tone="active">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Opportunité</p>
          <h3 className="mt-2 text-2xl font-black text-[#0F2D4A]">{opportunity.espece} · {opportunity.lieu}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{opportunity.vendeur} → {opportunity.acheteur}</p>
        </div>
        <StatusBadge tone="success">Compatible {opportunity.scoreCompatibilite}%</StatusBadge>
      </div>
      <div className="mt-4 grid gap-2">
        {opportunity.raisons.slice(0, 3).map((reason) => (
          <p key={reason} className="rounded-xl bg-[#F8FAFC] p-3 text-sm font-bold text-[#334155]">{reason}</p>
        ))}
      </div>
      <Link href={`/opportunites/${opportunity.id}`} className="mt-4 inline-flex rounded-xl bg-[#0F2D4A] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1F6F8B]">
        Voir l'opportunité
      </Link>
    </ProductCard>
  );
}

export function TerritoryTensionCard({ tension }: { tension: MvpSliceSummary["tension"] }) {
  const tone: Record<MvpSliceSummary["tension"]["level"], StatusTone> = {
    Faible: "success",
    Moyenne: "info",
    Forte: "warning",
    Critique: "danger"
  };

  return (
    <ProductCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Tension territoriale</p>
          <h3 className="mt-2 text-2xl font-black text-[#0F2D4A]">{tension.quay}</h3>
        </div>
        <StatusBadge tone={tone[tension.level]}>{tension.level}</StatusBadge>
      </div>
      <p className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-sm font-bold leading-6 text-[#334155]">{tension.reason}</p>
    </ProductCard>
  );
}

export function ActionQueue({ actions }: { actions: MvpAction[] }) {
  return (
    <ProductCard>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">File d'action</p>
      <div className="mt-4 grid gap-3">
        {actions.map((action) => (
          <article key={action.id} className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-[#0F2D4A]">{action.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{action.description}</p>
              </div>
              <StatusBadge tone="dark">{action.status}</StatusBadge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ProofBadge level={action.proofLevel} />
              <StatusBadge tone="neutral">{action.ownerRole}</StatusBadge>
              <Link href={action.targetHref} className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0]">
                Traiter
              </Link>
            </div>
          </article>
        ))}
      </div>
    </ProductCard>
  );
}

export function Timeline({ steps }: { steps: MvpSliceStep[] }) {
  return (
    <div className="grid gap-3">
      {steps.map((step, index) => (
        <article key={step.key} className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#E2E8F0] md:grid-cols-[3rem_1fr_auto] md:items-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2D4A] text-sm font-black text-white">{index + 1}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-[#0F2D4A]">{step.title}</h3>
              <StatusBadge tone="neutral">{step.module}</StatusBadge>
              <StatusBadge tone="info">{step.status}</StatusBadge>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{step.description}</p>
            <p className="mt-2 text-sm font-black leading-6 text-[#0F2D4A]">Décision : {step.decision}</p>
          </div>
          <Link href={step.href} className="rounded-xl bg-[#F8FAFC] px-4 py-2 text-center text-xs font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0] transition hover:bg-white">
            Ouvrir
          </Link>
        </article>
      ))}
    </div>
  );
}

export function DecisionSummary({ slice }: { slice: MvpSliceSummary }) {
  return (
    <ProductCard tone="dark" className="p-6">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">Rapport / synthèse</p>
      <h2 className="mt-3 text-3xl font-black text-white">{slice.report.title}</h2>
      <p className="mt-4 text-base font-semibold leading-7 text-white/80">{slice.report.decision}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {slice.reportMetrics.map((metric) => (
          <div key={metric.id} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-white/55">{metric.label}</p>
            <p className="mt-2 text-2xl font-black text-white">{metric.value}</p>
            <div className="mt-3">
              <ProofBadge level={metric.proofLevel} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-6 text-white/75">Limite : {slice.report.limits}</p>
      <Link href="/executive" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-xs font-black text-[#0F2D4A] transition hover:bg-[#F8FAFC]">
        Ouvrir la vue executive
      </Link>
    </ProductCard>
  );
}
