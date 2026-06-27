"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching, computeTransactionMetrics, computeTransactions, reservationsStorageKey, transactionsStorageKey } from "@/lib/coordination";
import type { Opportunite, Transaction, TransactionStatus } from "@/lib/coordination";
import { computeImpactMetrics } from "@/lib/impact";
import type { NotificationMetier } from "@/lib/notifications";
import { getRecommendationTone, getTopRecommendations } from "@/lib/recommendation";
import { createCoordinationSimulation, coordinationSimulationStorageKey, parseCoordinationSimulation } from "@/lib/simulation";
import { computeTensionMetrics, getTensionTone } from "@/lib/tension";
import { getRecommendedActors, getTrustLevel, getTrustTone } from "@/lib/trust";

type CoordinationCenterProps = {
  arrivages: Arrivage[];
  besoins: Besoin[];
  opportunites: Opportunite[];
  notifications: NotificationMetier[];
};

type OpportunityState = "nouveau" | "réservé" | "confirmé" | "terminé";

const defaultActivity = [
  { id: "base-act-1", time: "08:15", label: "Le pêcheur A déclare 250 kg." },
  { id: "base-act-2", time: "08:20", label: "Le mareyeur réserve." },
  { id: "base-act-3", time: "08:24", label: "Notification envoyée." },
  { id: "base-act-4", time: "08:30", label: "Transaction terminée." }
];

export function CoordinationCenter({ arrivages, besoins, opportunites, notifications }: CoordinationCenterProps) {
  const [simulation, setSimulation] = useState(() => parseCoordinationSimulation(null));
  const [ignoredArrivageIds, setIgnoredArrivageIds] = useState<string[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [transactionStatusByOpportunityId, setTransactionStatusByOpportunityId] = useState<Record<string, TransactionStatus>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSimulation(parseCoordinationSimulation(window.localStorage.getItem(coordinationSimulationStorageKey)));

    const storedReservations = window.localStorage.getItem(reservationsStorageKey);
    const storedTransactions = window.localStorage.getItem(transactionsStorageKey);

    setReservedIds(storedReservations ? safeParseStringList(storedReservations) : []);
    setTransactionStatusByOpportunityId(storedTransactions ? safeParseTransactions(storedTransactions) : {});
  }, []);

  const allArrivages = useMemo(() => [...(simulation?.arrivages ?? []), ...arrivages], [arrivages, simulation]);
  const allBesoins = useMemo(() => [...(simulation?.besoins ?? []), ...besoins], [besoins, simulation]);
  const generatedOpportunites = useMemo(() => computeMatching(allArrivages, allBesoins), [allArrivages, allBesoins]);
  const allOpportunites = useMemo(() => mergeOpportunites([...(simulation?.opportunites ?? []), ...generatedOpportunites, ...opportunites]), [generatedOpportunites, opportunites, simulation]);
  const storedTransactions = useMemo(() => computeTransactions(allOpportunites, transactionStatusByOpportunityId), [allOpportunites, transactionStatusByOpportunityId]);
  const transactions = useMemo(() => mergeTransactions([...(simulation?.transactions ?? []), ...storedTransactions]), [simulation, storedTransactions]);
  const dashboardData = useMemo(() => computeDashboardMetrics(allArrivages, allBesoins, allOpportunites, reservedIds.length), [allArrivages, allBesoins, allOpportunites, reservedIds.length]);
  const transactionMetrics = useMemo(() => computeTransactionMetrics(transactions), [transactions]);
  const allNotifications = useMemo(() => [...(simulation?.notifications ?? []), ...notifications], [notifications, simulation]);
  const topRecommendations = useMemo(() => getTopRecommendations(allOpportunites, 5), [allOpportunites]);
  const recommendedActors = useMemo(() => getRecommendedActors(5), []);
  const impact = useMemo(() => computeImpactMetrics(allArrivages, allBesoins, allOpportunites, transactions), [allArrivages, allBesoins, allOpportunites, transactions]);
  const tensions = useMemo(() => computeTensionMetrics(allArrivages, allBesoins, allOpportunites, transactions), [allArrivages, allBesoins, allOpportunites, transactions]);

  const waitingArrivages = allArrivages.filter((arrivage) => arrivage.statut === "Disponible" && !ignoredArrivageIds.includes(arrivage.id));
  const coveredBesoinIds = new Set(allOpportunites.map((opportunite) => opportunite.besoinId));
  const urgentBesoins = allBesoins.filter((besoin) => besoin.urgence === "Haute" && !coveredBesoinIds.has(besoin.id));
  const activity = simulation?.activity ?? defaultActivity;
  const tauxCouverture = `${dashboardData.stats.tauxCouvertureBesoins}%`;

  function runSimulation() {
    const nextSimulation = createCoordinationSimulation(arrivages, besoins);
    window.localStorage.setItem(coordinationSimulationStorageKey, JSON.stringify(nextSimulation));
    setSimulation(nextSimulation);
    setMessage("Simulation lancée : les modules métier reflètent la journée de coordination.");
  }

  function resetDay() {
    window.localStorage.removeItem(coordinationSimulationStorageKey);
    setSimulation(null);
    setIgnoredArrivageIds([]);
    setMessage("Journée réinitialisée avec les données mock d'origine.");
  }

  function reserveOpportunity(opportunite: Opportunite) {
    setReservedIds((current) => {
      const next = current.includes(opportunite.id) ? current : [...current, opportunite.id];
      window.localStorage.setItem(reservationsStorageKey, JSON.stringify(next));
      return next;
    });
    setTransactionStatusByOpportunityId((current) => {
      const next = { ...current, [opportunite.id]: current[opportunite.id] ?? "Réservée" };
      window.localStorage.setItem(transactionsStorageKey, JSON.stringify(next));
      return next;
    });
    setMessage(`${opportunite.espece} réservé : une transaction locale est créée.`);
  }

  function reserveFirstMatching(arrivage: Arrivage) {
    const opportunite = allOpportunites.find((item) => item.arrivageId === arrivage.id);
    if (!opportunite) {
      setMessage("Aucune opportunité compatible trouvée pour ce lot.");
      return;
    }

    reserveOpportunity(opportunite);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                item.href === "/coordination" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/15 text-[#14312d] hover:border-[#14312d]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Coordination</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Centre névralgique Mbàmbulaan</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Une vue opérateur pour suivre les lots, besoins, opportunités, alertes, transactions et indicateurs d'une même journée.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={runSimulation} className="h-12 rounded-full bg-[#14312d] px-5 text-sm font-black text-white transition hover:bg-[#1e4a43]">
                Lancer une simulation
              </button>
              <button type="button" onClick={resetDay} className="h-12 rounded-full border border-[#14312d]/20 px-5 text-sm font-black text-[#14312d] transition hover:border-[#14312d]">
                Réinitialiser la journée
              </button>
            </div>
          </div>
          {message ? <p className="mt-6 rounded-2xl bg-[#d8f3dc] p-4 text-sm font-black text-[#1b5e20]">{message}</p> : null}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard label="Arrivages" value={String(allArrivages.length)} />
          <KpiCard label="Besoins" value={String(allBesoins.length)} />
          <KpiCard label="Opportunités" value={String(allOpportunites.length)} />
          <KpiCard label="Transactions" value={String(transactions.length)} />
          <KpiCard label="Notifications" value={String(allNotifications.length)} />
          <KpiCard label="Couverture" value={tauxCouverture} />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Panel title="Actions prioritaires">
            <div className="grid gap-3">
              {tensions.recommandations.map((recommandation) => (
                <p key={recommandation} className="rounded-2xl bg-[#f7f4ec] p-5 text-sm font-black leading-6 text-[#14312d]/75">
                  {recommandation}
                </p>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {tensions.zonesPrioritaires.map((zone) => (
                <article key={zone.quai} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black">{zone.quai}</p>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{zone.raison}</p>
                    </div>
                    <TensionBadge level={zone.niveau} />
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Impact opérationnel">
            <div className="grid gap-3 sm:grid-cols-2">
              <CompactMetric label="Volume valorisé" value={impact.volumeValorise} />
              <CompactMetric label="Valeur estimée" value={impact.valeurEconomique} />
              <CompactMetric label="Besoins couverts" value={`${impact.tauxBesoinsCouverts}%`} />
              <CompactMetric label="Poisson sauvé" value={impact.poissonSauve} />
            </div>
            <div className="mt-5 grid gap-3">
              {impact.quaisImpactes.slice(0, 3).map((quai) => (
                <article key={quai.quai} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black">{quai.quai}</p>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{quai.region}</p>
                    </div>
                    <StatusBadge label={`Impact ${quai.scoreImpact}`} tone="info" />
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Acteurs recommandés">
            <div className="grid gap-3">
              {recommendedActors.map((actor) => (
                <article key={actor.id} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black">{actor.nom}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">
                        {actor.type} · {actor.zone}
                      </p>
                    </div>
                    <TrustBadge score={actor.scoreConfiance} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-[#14312d]/65">
                    {actor.transactionsTerminees} transactions terminées · {actor.annulations} annulation(s)
                  </p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Top recommandations">
            <div className="grid gap-3">
              {topRecommendations.map((opportunite) => (
                <Link key={opportunite.id} href={`/opportunites/${opportunite.id}`} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black">{opportunite.espece}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">
                        {opportunite.quantiteDemandee} · {opportunite.lieu}
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#14312d]/65">{opportunite.acheteur} → {opportunite.vendeur}</p>
                    </div>
                    <RecommendationBadge score={opportunite.scoreCompatibilite} />
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Arrivages en attente">
            <div className="grid gap-3">
              {waitingArrivages.slice(0, 6).map((arrivage) => (
                <article key={arrivage.id} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black">{arrivage.espece}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">
                        {arrivage.quantite} · {arrivage.quai} · {arrivage.heureDebarquement}
                      </p>
                    </div>
                    <StatusBadge label={arrivage.statut} tone="success" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionLink href="/arrivages">voir</ActionLink>
                    <ActionButton onClick={() => reserveFirstMatching(arrivage)}>réserver</ActionButton>
                    <ActionButton onClick={() => setIgnoredArrivageIds((current) => [...current, arrivage.id])}>ignorer</ActionButton>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Besoins urgents">
            <div className="grid gap-3">
              {(urgentBesoins.length > 0 ? urgentBesoins : allBesoins.filter((besoin) => besoin.urgence === "Haute")).slice(0, 6).map((besoin) => (
                <article key={besoin.id} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black">{besoin.espece}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">
                        {besoin.quantite} · {besoin.quai} · {besoin.acheteur ?? "Acheteur pilote"}
                      </p>
                    </div>
                    <StatusBadge label={besoin.urgence} tone="warning" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionLink href="/opportunites">proposer un lot</ActionLink>
                    <ActionLink href="/besoins">voir détail</ActionLink>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Opportunités générées">
            <div className="grid gap-3">
              {allOpportunites.slice(0, 6).map((opportunite) => (
                <article key={opportunite.id} className="rounded-2xl bg-[#f7f4ec] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black">{opportunite.espece}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#14312d]/65">
                        {opportunite.quantiteDemandee} · {opportunite.lieu} · {opportunite.scoreCompatibilite}%
                      </p>
                    </div>
                    <StatusBadge label={getOpportunityState(opportunite.id, reservedIds, transactions)} tone={reservedIds.includes(opportunite.id) ? "warning" : "success"} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionLink href={`/opportunites/${opportunite.id}`}>voir</ActionLink>
                    <ActionButton onClick={() => reserveOpportunity(opportunite)}>réserver</ActionButton>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Alertes">
            <div className="grid gap-3">
              {allNotifications.slice(0, 6).map((notification) => (
                <Link key={notification.id} href={notification.lien} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={notification.niveau} tone={notification.niveau === "attention" ? "warning" : "info"} />
                    {!notification.lu ? <StatusBadge label="Non lue" tone="dark" /> : null}
                  </div>
                  <p className="mt-3 text-lg font-black">{notification.titre}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#14312d]/65">{notification.description}</p>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Activité récente">
            <ol className="grid gap-3">
              {activity.map((event) => (
                <li key={event.id} className="grid grid-cols-[4rem_1fr] gap-4 rounded-2xl bg-[#f7f4ec] p-5">
                  <time className="text-sm font-black text-[#d65a31]">{event.time}</time>
                  <p className="text-sm font-bold leading-6 text-[#14312d]/75">{event.label}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="KPIs">
            <div className="grid gap-3 sm:grid-cols-2">
              <CompactMetric label="Couverture besoins" value={tauxCouverture} />
              <CompactMetric label="Transactions actives" value={String(transactionMetrics.transactionsActives)} />
              <CompactMetric label="Transactions terminées" value={String(transactionMetrics.transactionsTerminees)} />
              <CompactMetric label="Opportunités détectées" value={String(dashboardData.stats.opportunitesDetectees)} />
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}

const navigationItems = [
  { href: "/", label: "Accueil" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/transactions", label: "Transactions" },
  { href: "/notifications", label: "Notifications" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quais", label: "Quais" }
];

function mergeOpportunites(opportunites: Opportunite[]) {
  return Array.from(new Map(opportunites.map((opportunite) => [opportunite.id, opportunite])).values());
}

function mergeTransactions(transactions: Transaction[]) {
  return Array.from(new Map(transactions.map((transaction) => [transaction.id, transaction])).values());
}

function getOpportunityState(id: string, reservedIds: string[], transactions: Transaction[]): OpportunityState {
  const transaction = transactions.find((item) => item.opportuniteId === id);
  if (transaction?.statut === "Terminée") return "terminé";
  if (transaction?.statut === "En préparation" || transaction?.statut === "En cours de retrait") return "confirmé";
  if (reservedIds.includes(id) || transaction?.statut === "Réservée") return "réservé";
  return "nouveau";
}

function safeParseStringList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function safeParseTransactions(value: string): Record<string, TransactionStatus> {
  try {
    const transactions = JSON.parse(value);
    if (!transactions || typeof transactions !== "object" || Array.isArray(transactions)) return {};

    return Object.fromEntries(
      Object.entries(transactions).filter((entry): entry is [string, TransactionStatus] => {
        const [, status] = entry;
        return status === "Réservée" || status === "En préparation" || status === "En cours de retrait" || status === "Terminée" || status === "Annulée";
      })
    );
  } catch {
    return {};
  }
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#14312d]/10">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{label}</p>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "success" | "warning" | "info" | "dark" }) {
  const styles = {
    success: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    warning: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    info: "bg-[#dbeafe] text-[#174ea6] ring-[#93c5fd]",
    dark: "bg-[#14312d] text-white ring-[#14312d]"
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>{label}</span>;
}

function ActionLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black text-[#14312d] transition hover:border-[#14312d]">
      {children}
    </Link>
  );
}

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full bg-[#14312d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1e4a43]">
      {children}
    </button>
  );
}

function RecommendationBadge({ score }: { score: number }) {
  const tone = getRecommendationTone(score);
  const styles = {
    green: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    orange: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    red: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>{score}%</span>;
}

function TrustBadge({ score }: { score: number }) {
  const tone = getTrustTone(score);
  const styles = {
    green: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    orange: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    red: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>{getTrustLevel(score)}</span>;
}

function TensionBadge({ level }: { level: "Faible" | "Moyenne" | "Forte" | "Critique" }) {
  const tone = getTensionTone(level);
  const styles = {
    low: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    medium: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    high: "bg-[#ffe8cc] text-[#9a3412] ring-[#fdba74]",
    critical: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>{level}</span>;
}
