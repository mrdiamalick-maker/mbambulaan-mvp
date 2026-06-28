"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeIntelligentAlerts, getAlertTone } from "@/lib/alerts";
import type { DashboardData } from "@/lib/coordination";
import { computeReservationMetrics, computeTransactionMetrics, computeTransactions, misesEnRelationStorageKey, reservationsStorageKey, transactionsStorageKey } from "@/lib/coordination";
import type { Opportunite, Transaction, TransactionStatus } from "@/lib/coordination";
import { computeImpactMetrics } from "@/lib/impact";
import type { NotificationMetier } from "@/lib/notifications";
import { computePrioritizationMetrics, getPriorityTone } from "@/lib/prioritization";
import { computeLotsQuality, computeSensitiveLots, getQualityTone, getWasteRiskTone } from "@/lib/quality";
import type { LotQuality } from "@/lib/quality";
import { computeAverageRecommendationScore, getRecommendationTone } from "@/lib/recommendation";
import { coordinationSimulationStorageKey, parseCoordinationSimulation } from "@/lib/simulation";
import { computeTensionMetrics, getTensionTone } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";
import { computeAverageTrustScore, getTrustTone } from "@/lib/trust";
import { InsightPanel } from "@/components/ui/InsightPanel";
import { MetricCard } from "@/components/ui/MetricCard";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { StatusBadge as UiStatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

export function DashboardView({ arrivages, besoins, data, notifications, opportunites }: { arrivages: Arrivage[]; besoins: Besoin[]; data: DashboardData; notifications: NotificationMetier[]; opportunites: Opportunite[] }) {
  const [misesEnRelation, setMisesEnRelation] = useState(data.stats.misesEnRelationInitiees);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [transactionStatusByOpportunityId, setTransactionStatusByOpportunityId] = useState<Record<string, TransactionStatus>>({});
  const [simulatedStats, setSimulatedStats] = useState({ arrivages: 0, besoins: 0 });
  const [simulatedArrivages, setSimulatedArrivages] = useState<Arrivage[]>([]);
  const [simulatedBesoins, setSimulatedBesoins] = useState<Besoin[]>([]);
  const [simulatedOpportunites, setSimulatedOpportunites] = useState<Opportunite[]>([]);
  const [simulatedTransactions, setSimulatedTransactions] = useState<Transaction[]>([]);
  const [simulatedNotifications, setSimulatedNotifications] = useState<NotificationMetier[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(misesEnRelationStorageKey);
    if (!stored) return;

    try {
      const ids = JSON.parse(stored);
      if (Array.isArray(ids)) {
        setMisesEnRelation(ids.length);
      }
    } catch {
      setMisesEnRelation(data.stats.misesEnRelationInitiees);
    }
  }, [data.stats.misesEnRelationInitiees]);

  useEffect(() => {
    const stored = window.localStorage.getItem(reservationsStorageKey);
    if (!stored) return;

    try {
      const ids = JSON.parse(stored);
      if (Array.isArray(ids)) {
        setReservedIds(ids.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      setReservedIds([]);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(transactionsStorageKey);
    setTransactionStatusByOpportunityId(stored ? safeParseTransactions(stored) : {});
  }, []);

  useEffect(() => {
    const simulation = parseCoordinationSimulation(window.localStorage.getItem(coordinationSimulationStorageKey));
    setSimulatedStats({ arrivages: simulation?.arrivages.length ?? 0, besoins: simulation?.besoins.length ?? 0 });
    setSimulatedArrivages(simulation?.arrivages ?? []);
    setSimulatedBesoins(simulation?.besoins ?? []);
    setSimulatedOpportunites(simulation?.opportunites ?? []);
    setSimulatedTransactions(simulation?.transactions ?? []);
    setSimulatedNotifications(simulation?.notifications ?? []);
  }, []);

  const insights = useMemo(() => {
    const [, quaisInsight] = data.insights;
    const relationInsight = misesEnRelation > 0 ? `${misesEnRelation} mise(s) en relation sont deja activees.` : "Aucune mise en relation n'est encore activee dans cette session.";
    return [data.insights[0], quaisInsight, relationInsight];
  }, [data.insights, misesEnRelation]);

  const allArrivages = useMemo(() => [...simulatedArrivages, ...arrivages], [arrivages, simulatedArrivages]);
  const allBesoins = useMemo(() => [...simulatedBesoins, ...besoins], [besoins, simulatedBesoins]);
  const allOpportunites = useMemo(() => [...simulatedOpportunites, ...opportunites], [opportunites, simulatedOpportunites]);
  const reservationMetrics = useMemo(() => computeReservationMetrics(allOpportunites, reservedIds), [allOpportunites, reservedIds]);
  const storedTransactions = useMemo(() => computeTransactions(opportunites, transactionStatusByOpportunityId), [opportunites, transactionStatusByOpportunityId]);
  const transactions = useMemo(() => [...simulatedTransactions, ...storedTransactions], [simulatedTransactions, storedTransactions]);
  const transactionMetrics = useMemo(() => computeTransactionMetrics(transactions), [transactions]);
  const latestNotifications = useMemo(() => [...simulatedNotifications, ...notifications].slice(0, 6), [notifications, simulatedNotifications]);
  const averageRecommendationScore = useMemo(() => computeAverageRecommendationScore(allOpportunites), [allOpportunites]);
  const averageTrustScore = useMemo(() => computeAverageTrustScore(), []);
  const impact = useMemo(() => computeImpactMetrics(allArrivages, allBesoins, allOpportunites, transactions), [allArrivages, allBesoins, allOpportunites, transactions]);
  const tensions = useMemo(() => computeTensionMetrics(allArrivages, allBesoins, allOpportunites, transactions), [allArrivages, allBesoins, allOpportunites, transactions]);
  const priorities = useMemo(() => computePrioritizationMetrics(allArrivages, allBesoins, allOpportunites, transactions), [allArrivages, allBesoins, allOpportunites, transactions]);
  const alertes = useMemo(() => computeIntelligentAlerts(allArrivages, allBesoins, allOpportunites, transactions, latestNotifications), [allArrivages, allBesoins, allOpportunites, latestNotifications, transactions]);
  const lotsSuivis = useMemo(() => computeTraceability(allArrivages, allOpportunites, transactions, latestNotifications), [allArrivages, allOpportunites, latestNotifications, transactions]);
  const lotQualities = useMemo(() => computeLotsQuality(allArrivages, { besoins: allBesoins, opportunites: allOpportunites, transactions }), [allArrivages, allBesoins, allOpportunites, transactions]);
  const sensitiveLots = useMemo(() => computeSensitiveLots(allArrivages, { besoins: allBesoins, opportunites: allOpportunites, transactions }), [allArrivages, allBesoins, allOpportunites, transactions]);

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">{navigationItems.map((item) => <Link key={item.href} href={item.href} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${item.href === "/dashboard" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/15 text-[#14312d] hover:border-[#14312d]"}`}>{item.label}</Link>)}</nav>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Dashboard</p><h1 className="mt-4 text-4xl font-black sm:text-5xl">Valeur creee par Mbàmbulaan</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">Vue de coordination pour comprendre les volumes, les besoins, les opportunites et les mises en relation generees par l'ecosysteme.</p></div></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Arrivages publies" value={String(data.stats.arrivagesPublies + simulatedStats.arrivages)} /><StatCard label="Volume total debarque" value={data.stats.volumeTotalDebarque} /><StatCard label="Besoins ouverts" value={String(data.stats.besoinsOuverts + simulatedStats.besoins)} /><StatCard label="Opportunites ouvertes" value={String(reservationMetrics.opportunitesOuvertes)} /><StatCard label="Opportunites reservees" value={String(reservationMetrics.opportunitesReservees)} /><StatCard label="Taux de reservation" value={`${reservationMetrics.tauxReservation}%`} /><StatCard label="Transactions actives" value={String(transactionMetrics.transactionsActives)} /><StatCard label="Transactions terminees" value={String(transactionMetrics.transactionsTerminees)} /><StatCard label="Taux de finalisation" value={`${transactionMetrics.tauxFinalisation}%`} /><StatCard label="Lots suivis" value={String(lotsSuivis.length)} /><StatCard label="Qualité moyenne des recommandations" value={`${averageRecommendationScore}%`} badge={<RecommendationBadge score={averageRecommendationScore} />} /><StatCard label="Score de confiance moyen" value={`${averageTrustScore}%`} badge={<TrustBadge score={averageTrustScore} />} />
          </div>
        </section>
        <DashboardSection title="Impact de la journée"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><ImpactCard label="Volume valorisé" value={impact.volumeValorise} /><ImpactCard label="Valeur estimée" value={impact.valeurEconomique} /><ImpactCard label="Besoins couverts" value={`${impact.besoinsCouverts}/${impact.besoinsTotal} · ${impact.tauxBesoinsCouverts}%`} /><ImpactCard label="Poisson sauvé" value={impact.poissonSauve} /><ImpactCard label="Transactions finalisées" value={String(impact.transactionsFinalisees)} /><ImpactCard label="Acteurs impactés" value={String(impact.acteursImpactes)} /><ImpactCard label="Familles estimées" value={String(impact.famillesImpactees)} /><ImpactCard label="Quai principal" value={impact.quaisImpactes[0]?.quai ?? "Aucun"} /></div></DashboardSection>
        <DashboardSection title="Tensions territoriales"><div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><div className="grid gap-3">{tensions.zonesPrioritaires.map((zone) => <article key={zone.quai} className="rounded-2xl bg-[#f7f4ec] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-lg font-black">{zone.quai}</p><p className="mt-1 text-sm font-semibold text-[#14312d]/65">{zone.raison}</p></div><TensionBadge level={zone.niveau} /></div></article>)}</div><div className="grid gap-3">{tensions.tensionsParEspece.slice(0, 3).map((espece) => <article key={espece.espece} className="rounded-2xl bg-[#f7f4ec] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-lg font-black">{espece.espece}</p><p className="mt-1 text-sm font-semibold text-[#14312d]/65">{espece.volumeDemande} demandés · {espece.besoinsNonCouverts} besoin(s) non couvert(s)</p></div><TensionBadge level={espece.niveau} /></div></article>)}</div></div></DashboardSection>
        <DashboardSection title="Priorités du jour"><div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"><div className="grid gap-3">{priorities.besoinsPriorises.slice(0, 3).map((item) => <article key={item.id} className="rounded-2xl bg-[#f7f4ec] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-lg font-black">{item.besoin.espece}</p><p className="mt-1 text-sm font-semibold text-[#14312d]/65">{item.besoin.quantite} · {item.besoin.quai}</p></div><PriorityBadge priority={item.priorite} /></div></article>)}</div><div className="grid gap-3">{priorities.actionsPrioritaires.slice(0, 4).map((action) => <Link key={action.id} href={action.href} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-lg font-black">{action.titre}</p><p className="mt-1 text-sm font-semibold text-[#14312d]/65">{action.description}</p></div><PriorityBadge priority={action.priorite} /></div></Link>)}</div></div></DashboardSection>
        <DashboardSection title="Alertes à traiter"><div className="grid gap-3">{alertes.slice(0, 5).map((alerte) => <Link key={alerte.id} href={alerte.lienAction} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><AlertBadge level={alerte.niveau} /><PriorityBadge priority={alerte.priorite} /></div><p className="mt-3 text-lg font-black">{alerte.titre}</p><p className="mt-1 text-sm font-semibold leading-6 text-[#14312d]/65">{alerte.description}</p><p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{alerte.acteurConcerne} · {alerte.zoneOuQuai}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#14312d]/65">{alerte.statut}</span></div></Link>)}</div></DashboardSection>
        <DashboardSection title="Lots sensibles à traiter"><div className="grid gap-3">{(sensitiveLots.length > 0 ? sensitiveLots : lotQualities.slice(0, 3)).slice(0, 5).map((lot) => <article key={lot.lotId} className="rounded-2xl bg-[#f7f4ec] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-lg font-black">{lot.espece}</p><p className="mt-1 text-sm font-semibold text-[#14312d]/65">{lot.lotId} · {lot.quai} · {lot.actionRecommandee}</p></div><QualityBadge lot={lot} /></div></article>)}</div></DashboardSection>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><DashboardSection title="Activite des quais"><div className="grid gap-3">{data.quaisActifs.map((quai) => <RowCard key={quai.quai}><div><p className="text-lg font-black">{quai.quai}</p><p className="mt-1 text-sm font-semibold text-[#14312d]/65">{quai.arrivages} arrivage(s)</p></div><CompactMetric label="Volume" value={quai.volumeTotal} /><CompactMetric label="Besoins lies" value={String(quai.besoinsLies)} /></RowCard>)}</div></DashboardSection><DashboardSection title="Lecture institutionnelle"><div className="grid gap-3">{insights.map((insight) => <p key={insight} className="rounded-2xl bg-[#f7f4ec] p-5 text-sm font-bold leading-6 text-[#14312d]/75">{insight}</p>)}</div></DashboardSection></div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2"><DashboardSection title="Especes les plus demandees"><div className="grid gap-3">{data.especesDemandees.map((espece) => <RowCard key={espece.espece}><div><p className="text-lg font-black">{espece.espece}</p><p className={`mt-1 text-sm font-black ${espece.ecartKg >= 0 ? "text-[#1b5e20]" : "text-[#9b1c1c]"}`}>Ecart {espece.ecart}</p></div><CompactMetric label="Disponible" value={espece.volumeDisponible} /><CompactMetric label="Demande" value={espece.volumeDemande} /></RowCard>)}</div></DashboardSection><DashboardSection title="Dernieres notifications"><div className="grid gap-3">{latestNotifications.map((notification) => <Link key={notification.id} href={notification.lien} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#d65a31]">{notification.niveau}</span>{!notification.lu ? <span className="rounded-full bg-[#14312d] px-3 py-1 text-xs font-black text-white">Non lue</span> : null}</div><p className="mt-3 text-lg font-black">{notification.titre}</p><p className="mt-1 text-sm font-semibold leading-6 text-[#14312d]/65">{notification.description}</p></Link>)}</div></DashboardSection><DashboardSection title="Opportunites recentes"><div className="grid gap-3">{data.opportunitesRecentes.map((opportunite) => <RowCard key={opportunite.id}><div><p className="text-lg font-black">{opportunite.espece}</p><p className="mt-1 text-sm font-semibold text-[#14312d]/65">{opportunite.quai}</p></div><CompactMetric label="Demandeur" value={opportunite.acteurDemandeur} /><Link href={`/opportunites/${opportunite.id}`} className="rounded-full bg-[#14312d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1e4a43]">Detail</Link></RowCard>)}</div></DashboardSection></div>
      </div>
    </main>
  );
}

const navigationItems = [{ href: "/", label: "Accueil" }, { href: "/arrivages", label: "Arrivages" }, { href: "/besoins", label: "Besoins" }, { href: "/opportunites", label: "Opportunites" }, { href: "/transactions", label: "Transactions" }, { href: "/quais", label: "Quais" }, { href: "/notifications", label: "Notifications" }, { href: "/dashboard", label: "Dashboard" }];
function safeParseTransactions(value: string): Record<string, TransactionStatus> { try { const transactions = JSON.parse(value); if (!transactions || typeof transactions !== "object" || Array.isArray(transactions)) return {}; return Object.fromEntries(Object.entries(transactions).filter((entry): entry is [string, TransactionStatus] => { const [, status] = entry; return status === "Réservée" || status === "En préparation" || status === "En cours de retrait" || status === "Terminée" || status === "Annulée"; })); } catch { return {}; } }
function StatCard({ badge, label, value }: { badge?: React.ReactNode; label: string; value: string }) { return <MetricCard label={label} value={value} badge={badge} />; }
function ImpactCard({ label, value }: { label: string; value: string }) { return <MetricCard label={label} value={value} />; }
function RecommendationBadge({ score }: { score: number }) { return <UiStatusBadge tone={toneFromTraffic(getRecommendationTone(score))}>Score {score}%</UiStatusBadge>; }
function TrustBadge({ score }: { score: number }) { return <UiStatusBadge tone={toneFromTraffic(getTrustTone(score))}>Confiance {score}%</UiStatusBadge>; }
function TensionBadge({ level }: { level: "Faible" | "Moyenne" | "Forte" | "Critique" }) { return <UiStatusBadge tone={toneFromLevel(getTensionTone(level))}>{level}</UiStatusBadge>; }
function PriorityBadge({ priority }: { priority: "Critique" | "Haute" | "Moyenne" | "Faible" }) { return <UiStatusBadge tone={toneFromLevel(getPriorityTone(priority))}>{priority}</UiStatusBadge>; }
function AlertBadge({ level }: { level: "info" | "attention" | "critique" }) { const tone = getAlertTone(level); return <UiStatusBadge tone={tone === "critical" ? "danger" : tone === "high" ? "warning" : "info"}>{level}</UiStatusBadge>; }
function QualityBadge({ lot }: { lot: LotQuality }) { return <div className="flex flex-wrap gap-2"><UiStatusBadge tone={toneFromTraffic(getQualityTone(lot.score))}>{lot.score}/100</UiStatusBadge><UiStatusBadge tone={toneFromLevel(getWasteRiskTone(lot.risqueGaspillage))}>{lot.risqueGaspillage}</UiStatusBadge></div>; }
function DashboardSection({ children, title }: { children: React.ReactNode; title: string }) { return <InsightPanel title={title}>{children}</InsightPanel>; }
function RowCard({ children }: { children: React.ReactNode }) { return <ModuleCard className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr] sm:items-center">{children}</ModuleCard>; }
function CompactMetric({ label, value }: { label: string; value: string }) { return <MetricCard label={label} value={value} />; }
function toneFromTraffic(tone: "green" | "orange" | "red"): StatusTone { if (tone === "green") return "success"; if (tone === "orange") return "warning"; return "danger"; }
function toneFromLevel(tone: "low" | "medium" | "high" | "critical"): StatusTone { if (tone === "low") return "success"; if (tone === "medium") return "warning"; if (tone === "high") return "warning"; return "danger"; }
