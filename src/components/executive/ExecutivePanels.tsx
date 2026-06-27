import Link from "next/link";
import type { ReactNode } from "react";
import type { ExecutiveDecision, ExecutiveMetric, ExecutiveRisk, ExecutiveSummary, ExecutiveTerritoryItem } from "@/lib/executive";

export function ExecutiveView({ executive }: { executive: ExecutiveSummary }) {
  return (
    <main className="bg-[#f7f4ec] text-[#14312d]">
      <section className="px-5 py-12 sm:px-8"><div className="mx-auto max-w-7xl"><Link href="/dashboard" className="inline-flex rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black transition hover:border-[#14312d]">Retour dashboard</Link><div className="mt-8 max-w-4xl"><p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Lecture décideur</p><h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Vue exécutive institutionnelle</h1><p className="mt-5 text-base font-semibold leading-7 text-[#14312d]/70">Une synthèse compacte pour lire en quelques minutes l'impact, les tensions, les priorités, les risques et les décisions utiles à la filière.</p></div><MetricGrid metrics={executive.resumeExecutif} /></div></section>
      <ExecutiveBand title="Décisions recommandées" eyebrow="Priorités" description="Les décisions proposées croisent tension territoriale, qualité des lots, besoins critiques, alertes et confiance des acteurs."><div className="grid gap-4 lg:grid-cols-2">{executive.decisionsRecommandees.map((decision) => <DecisionCard key={decision.id} decision={decision} />)}</div></ExecutiveBand>
      <ExecutiveBand title="Lecture territoriale" eyebrow="Territoires" description="Les quais sont classés selon leur activité, leur tension, leur risque et l'impact observé dans le MVP."><div className="grid gap-4 xl:grid-cols-2"><TerritoryList title="Quais les plus actifs" items={executive.lectureTerritoriale.quaisLesPlusActifs} /><TerritoryList title="Quais sous tension" items={executive.lectureTerritoriale.quaisLesPlusSousTension} /><TerritoryList title="Quais à risque" items={executive.lectureTerritoriale.quaisARisque} /><TerritoryList title="Quais à fort impact" items={executive.lectureTerritoriale.quaisAFortImpact} /></div></ExecutiveBand>
      <ExecutiveBand title="Lecture impact" eyebrow="Valeur créée" description="La plateforme relie les volumes, la valeur économique, le gaspillage évité et les acteurs touchés."><MetricGrid metrics={executive.lectureImpact} compact /></ExecutiveBand>
      <ExecutiveBand title="Risques exécutifs" eyebrow="Points de vigilance" description="Les risques principaux sont prêts à être transformés en action de coordination."><div className="grid gap-4 lg:grid-cols-2">{executive.risquesExecutifs.map((risk) => <RiskCard key={risk.id} risk={risk} />)}</div></ExecutiveBand>
    </main>
  );
}

export function DashboardExecutiveLink({ executive }: { executive: ExecutiveSummary }) {
  const criticalRisks = executive.risquesExecutifs.filter((risk) => risk.niveau === "critique").length;
  return <ExecutiveBand title="Synthèse exécutive" eyebrow="Institutionnel" description="Une vue prête pour collectivité, ministère, coopérative structurée ou partenaire financier."><div className="grid gap-4 lg:grid-cols-[1fr_18rem]"><MetricGrid metrics={executive.resumeExecutif.slice(0, 4)} compact /><div className="rounded-2xl bg-[#f7f4ec] p-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">À arbitrer</p><p className="mt-3 text-4xl font-black">{criticalRisks}</p><p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">risque(s) critique(s) et {executive.decisionsRecommandees.length} décision(s) recommandée(s).</p><Link href="/executive" className="mt-5 inline-flex rounded-full bg-[#14312d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1e4a43]">Ouvrir la synthèse</Link></div></div></ExecutiveBand>;
}

export function CoordinationInstitutionalPanel({ executive }: { executive: ExecutiveSummary }) {
  return <ExecutiveBand title="Lecture institutionnelle" eyebrow="Coordination" description="La coordination peut traduire les signaux métier en décisions publiques ou partenariales."><div className="grid gap-4 lg:grid-cols-3">{executive.decisionsRecommandees.slice(0, 3).map((decision) => <DecisionCard key={decision.id} decision={decision} compact />)}</div></ExecutiveBand>;
}

export function DemoExecutiveDecisionCard({ executive }: { executive: ExecutiveSummary }) {
  return <ExecutiveBand title="Lecture décideur : impact, tensions et priorités" eyebrow="Démonstration exécutive" description="La démo se termine par une lecture institutionnelle de la valeur créée et des actions à décider."><div className="grid gap-4 lg:grid-cols-[1fr_1fr]"><MetricGrid metrics={executive.lectureImpact.slice(0, 4)} compact /><div className="grid gap-4">{executive.decisionsRecommandees.slice(0, 2).map((decision) => <DecisionCard key={decision.id} decision={decision} compact />)}</div></div></ExecutiveBand>;
}

function ExecutiveBand({ children, description, eyebrow, title }: { children: ReactNode; description: string; eyebrow: string; title: string }) {
  return <section className="bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8"><div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8"><p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{eyebrow}</p><div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-3xl font-black">{title}</h2><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#14312d]/65">{description}</p></div><Link href="/executive" className="w-fit rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black transition hover:border-[#14312d]">Voir exécutif</Link></div><div className="mt-6">{children}</div></div></section>;
}

function MetricGrid({ compact = false, metrics }: { compact?: boolean; metrics: ExecutiveMetric[] }) {
  return <div className={`mt-6 grid gap-4 ${compact ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>{metrics.map((metric) => <article key={metric.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#14312d]/10"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{metric.label}</p><p className="mt-3 text-3xl font-black">{metric.value}</p><p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">{metric.detail}</p></article>)}</div>;
}

function DecisionCard({ compact = false, decision }: { compact?: boolean; decision: ExecutiveDecision }) {
  return <article className="rounded-2xl bg-[#f7f4ec] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{decision.moduleCible} · {decision.quai}</p><h3 className="mt-2 text-xl font-black">{decision.titre}</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/70">{decision.description}</p></div><LevelBadge level={decision.niveau} /></div>{!compact ? <div className="mt-4 grid gap-3 md:grid-cols-2"><Detail label="Action" value={decision.actionRecommandee} /><Detail label="Impact attendu" value={decision.impactAttendu} /></div> : null}<Link href={decision.lienMetier} className="mt-4 inline-flex rounded-full bg-[#14312d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1e4a43]">Voir</Link></article>;
}

function TerritoryList({ items, title }: { items: ExecutiveTerritoryItem[]; title: string }) {
  return <div className="rounded-2xl bg-[#f7f4ec] p-5"><h3 className="text-xl font-black">{title}</h3><div className="mt-4 grid gap-3">{items.map((item) => <div key={`${title}-${item.quai}`} className="rounded-xl bg-white px-4 py-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-black">{item.quai}</p><p className="mt-1 text-sm font-bold text-[#14312d]/60">{item.region} · {item.volume}</p></div><LevelBadge level={item.risque} label={item.tension} /></div><p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/65">{item.impact}</p></div>)}</div></div>;
}

function RiskCard({ risk }: { risk: ExecutiveRisk }) {
  return <article className="rounded-2xl bg-[#f7f4ec] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{risk.quai}</p><h3 className="mt-2 text-xl font-black">{risk.titre}</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/70">{risk.description}</p></div><LevelBadge level={risk.niveau} /></div><Link href={risk.lienMetier} className="mt-4 inline-flex rounded-full bg-[#14312d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1e4a43]">Traiter</Link></article>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white px-4 py-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p><p className="mt-1 text-sm font-bold leading-6 text-[#14312d]/70">{value}</p></div>; }
function LevelBadge({ label, level }: { label?: string; level: ExecutiveDecision["niveau"] }) { const styles: Record<ExecutiveDecision["niveau"], string> = { info: "bg-[#dbeafe] text-[#174ea6] ring-[#93c5fd]", attention: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]", critique: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]" }; return <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[level]}`}>{label ?? level}</span>; }
