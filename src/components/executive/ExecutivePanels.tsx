import Link from "next/link";
import type { ReactNode } from "react";
import type { ExecutiveDecision, ExecutiveRisk, ExecutiveSummary, ExecutiveTerritoryItem } from "@/lib/executive";
import { ChartCard } from "@/components/ui/ChartCard";
import { InsightPanel } from "@/components/ui/InsightPanel";
import { KpiGrid } from "@/components/ui/KpiGrid";
import { MapPanel } from "@/components/ui/MapPanel";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ExecutiveView({ executive }: { executive: ExecutiveSummary }) {
  const coverage = extractPercent(executive.resumeExecutif.find((metric) => metric.label === "Besoins couverts")?.detail);
  const territory = executive.lectureTerritoriale.quaisLesPlusSousTension;
  const impact = executive.lectureTerritoriale.quaisAFortImpact;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F2D4A]">
      <section className="px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0] transition hover:bg-[#F8FAFC]">
              Retour dashboard
            </Link>
            <Link href="/demo" className="rounded-xl bg-[#1F6F8B] px-4 py-2 text-sm font-black text-white shadow-sm shadow-[#1F6F8B]/20 transition hover:bg-[#0F2D4A]">
              Voir la démo
            </Link>
          </div>

          <section className="mt-6 rounded-[2rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_45px_rgba(15,45,74,0.06)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-end">
              <SectionHeader
                eyebrow="Pilotage institutionnel"
                level="page"
                title="Vue exécutive institutionnelle"
                description="Synthèse décisionnelle de la filière : impact, tensions, risques et priorités d’action."
              />
              <ExecutiveGauge value={coverage} label="Couverture des besoins" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Aujourd’hui", "Quais", "Espèces", "Risques", "Impact"].map((filter, index) => (
                <span key={filter} className={`rounded-full px-4 py-2 text-xs font-black ${index === 0 ? "bg-[#0F2D4A] text-white" : "bg-[#F8FAFC] text-[#334155] ring-1 ring-[#E2E8F0]"}`}>
                  {filter}
                </span>
              ))}
            </div>
            <div className="mt-7">
              <KpiGrid items={executive.resumeExecutif} />
            </div>
          </section>
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <MapPanel title="Carte des quais prioritaires" />
        </div>
      </section>

      <ExecutiveBand title="Graphiques décisionnels" eyebrow="Lecture BI" description="Des indicateurs visuels simples pour lire les tensions, la couverture et l'impact sans changer de module.">
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem_1fr]">
          <ChartCard title="Quais sous tension" eyebrow="Tension" items={territory.map((item) => territoryBar(item))} />
          <ChartCard title="Couverture des besoins" eyebrow="Jauge">
            <ExecutiveGauge value={coverage} label={`${coverage}% couverts`} large />
          </ChartCard>
          <ChartCard title="Impact par quai" eyebrow="Impact" items={impact.map((item) => impactBar(item))} />
        </div>
      </ExecutiveBand>

      <ExecutiveBand title="Décisions, risques et territoires" eyebrow="Priorités" description="Une synthèse compacte pour arbitrer sans parcourir tous les modules.">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            {executive.decisionsRecommandees.slice(0, 3).map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
          <div className="grid gap-4">
            {executive.risquesExecutifs.slice(0, 3).map((risk) => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </div>
        </div>
      </ExecutiveBand>

      <ExecutiveBand title="Carte de lecture territoriale" eyebrow="Territoires" description="Une grille de quais pour croiser tension, volume, impact et priorité d’action.">
        <TerritoryGrid items={executive.lectureTerritoriale.quaisLesPlusActifs} />
      </ExecutiveBand>

      <section className="px-5 pb-10 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#E2E8F0] bg-white p-6 text-center shadow-[0_18px_45px_rgba(15,45,74,0.06)]">
          <p className="text-xl font-black text-[#0F2D4A]">Mbàmbulaan transforme les signaux terrain en décisions actionnables.</p>
        </div>
      </section>
    </main>
  );
}

export function DashboardExecutiveLink({ executive }: { executive: ExecutiveSummary }) {
  const criticalRisks = executive.risquesExecutifs.filter((risk) => risk.niveau === "critique").length;

  return (
    <ExecutiveBand title="Synthèse exécutive" eyebrow="Institutionnel" description="Une vue prête pour collectivité, ministère, coopérative structurée ou partenaire financier.">
      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <KpiGrid items={executive.resumeExecutif.slice(0, 4)} />
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_34px_rgba(15,45,74,0.05)]">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">À arbitrer</p>
          <p className="mt-3 text-4xl font-black text-[#0F2D4A]">{criticalRisks}</p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#334155]">risque(s) critique(s) et {executive.decisionsRecommandees.length} décision(s) recommandée(s).</p>
          <Link href="/executive" className="mt-5 inline-flex rounded-xl bg-[#1F6F8B] px-4 py-2 text-xs font-black text-white transition hover:bg-[#0F2D4A]">
            Ouvrir la synthèse
          </Link>
        </div>
      </div>
    </ExecutiveBand>
  );
}

export function CoordinationInstitutionalPanel({ executive }: { executive: ExecutiveSummary }) {
  return (
    <ExecutiveBand title="Lecture institutionnelle" eyebrow="Coordination" description="La coordination peut traduire les signaux métier en décisions publiques ou partenariales.">
      <div className="grid gap-4 lg:grid-cols-3">
        {executive.decisionsRecommandees.slice(0, 3).map((decision) => (
          <DecisionCard key={decision.id} decision={decision} compact />
        ))}
      </div>
    </ExecutiveBand>
  );
}

export function DemoExecutiveDecisionCard({ executive }: { executive: ExecutiveSummary }) {
  return (
    <ExecutiveBand title="Lecture décideur : impact, tensions et priorités" eyebrow="Démonstration exécutive" description="La démo se termine par une lecture institutionnelle de la valeur créée et des actions à décider.">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <KpiGrid items={executive.lectureImpact.slice(0, 4)} />
        <div className="grid gap-4">
          {executive.decisionsRecommandees.slice(0, 2).map((decision) => (
            <DecisionCard key={decision.id} decision={decision} compact />
          ))}
        </div>
      </div>
    </ExecutiveBand>
  );
}

function ExecutiveBand({ children, description, eyebrow, title }: { children: ReactNode; description: string; eyebrow: string; title: string }) {
  return (
    <section className="bg-[#F8FAFC] px-5 py-6 text-[#0F2D4A] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <InsightPanel title={title} eyebrow={eyebrow} description={description}>
          {children}
        </InsightPanel>
      </div>
    </section>
  );
}

function DecisionCard({ compact = false, decision }: { compact?: boolean; decision: ExecutiveDecision }) {
  return (
    <ModuleCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">{decision.moduleCible} · {decision.quai}</p>
          <h3 className="mt-2 text-xl font-black text-[#0F2D4A]">{decision.titre}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{decision.description}</p>
        </div>
        <LevelBadge level={decision.niveau} />
      </div>
      {!compact ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Detail label="Action" value={decision.actionRecommandee} />
          <Detail label="Impact attendu" value={decision.impactAttendu} />
        </div>
      ) : null}
      <Link href={decision.lienMetier} className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-xs font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0] transition hover:bg-[#F8FAFC]">
        Voir
      </Link>
    </ModuleCard>
  );
}

function RiskCard({ risk }: { risk: ExecutiveRisk }) {
  return (
    <ModuleCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">{risk.quai}</p>
          <h3 className="mt-2 text-xl font-black text-[#0F2D4A]">{risk.titre}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{risk.description}</p>
        </div>
        <LevelBadge level={risk.niveau} />
      </div>
      <Link href={risk.lienMetier} className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-xs font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0] transition hover:bg-[#F8FAFC]">
        Traiter
      </Link>
    </ModuleCard>
  );
}

function TerritoryGrid({ items }: { items: ExecutiveTerritoryItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.quai} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_28px_rgba(15,45,74,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-black text-[#0F2D4A]">{item.quai}</p>
              <p className="mt-1 text-sm font-semibold text-[#334155]">{item.region}</p>
            </div>
            <LevelBadge level={item.risque} label={item.tension} />
          </div>
          <div className="mt-5 grid gap-3">
            <Detail label="Volume" value={item.volume} />
            <Detail label="Impact" value={item.impact} />
          </div>
        </article>
      ))}
    </div>
  );
}

function ExecutiveGauge({ label, large = false, value }: { label: string; large?: boolean; value: number }) {
  return (
    <div className={`mx-auto flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center shadow-[0_12px_28px_rgba(15,45,74,0.05)] ${large ? "min-h-52 w-full" : ""}`}>
      <div
        className={`${large ? "h-32 w-32" : "h-24 w-24"} rounded-full p-3`}
        style={{ background: `conic-gradient(#1F6F8B ${value * 3.6}deg, #E2E8F0 0deg)` }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
          <span className={`${large ? "text-3xl" : "text-2xl"} font-black text-[#0F2D4A]`}>{value}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-black text-[#334155]">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#E2E8F0]">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">{label}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-[#334155]">{value}</p>
    </div>
  );
}

function LevelBadge({ label, level }: { label?: string; level: ExecutiveDecision["niveau"] }) {
  return <StatusBadge tone={level === "critique" ? "danger" : level === "attention" ? "warning" : "info"}>{label ?? level}</StatusBadge>;
}

function extractPercent(text = "") {
  const match = text.match(/(\d+)%/);
  return match ? Number(match[1]) : 0;
}

function territoryBar(item: ExecutiveTerritoryItem) {
  const percent = item.tension === "Critique" ? 100 : item.tension === "Forte" ? 78 : item.tension === "Moyenne" ? 54 : 28;
  return { label: item.quai, value: item.tension, percent, meta: item.region };
}

function impactBar(item: ExecutiveTerritoryItem) {
  const value = Number(item.impact.match(/\d+/)?.[0] ?? 1);
  return { label: item.quai, value: item.impact, percent: Math.min(100, Math.max(18, value)), meta: item.volume };
}
