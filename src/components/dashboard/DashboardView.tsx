"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DashboardData } from "@/lib/coordination";
import { misesEnRelationStorageKey } from "@/lib/coordination";
import type { NotificationMetier } from "@/lib/notifications";

export function DashboardView({ data, notifications }: { data: DashboardData; notifications: NotificationMetier[] }) {
  const [misesEnRelation, setMisesEnRelation] = useState(data.stats.misesEnRelationInitiees);

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

  const insights = useMemo(() => {
    const [, quaisInsight] = data.insights;
    const relationInsight =
      misesEnRelation > 0
        ? `${misesEnRelation} mise(s) en relation sont deja activees.`
        : "Aucune mise en relation n'est encore activee dans cette session.";

    return [data.insights[0], quaisInsight, relationInsight];
  }, [data.insights, misesEnRelation]);

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                item.href === "/dashboard" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/15 text-[#14312d] hover:border-[#14312d]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Dashboard</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Valeur creee par Mbàmbulaan</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Vue de coordination pour comprendre les volumes, les besoins, les opportunites et les mises en relation generees par l'ecosysteme.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard label="Arrivages publies" value={String(data.stats.arrivagesPublies)} />
            <StatCard label="Volume total debarque" value={data.stats.volumeTotalDebarque} />
            <StatCard label="Besoins ouverts" value={String(data.stats.besoinsOuverts)} />
            <StatCard label="Opportunites detectees" value={String(data.stats.opportunitesDetectees)} />
            <StatCard label="Mises en relation initiees" value={String(misesEnRelation)} />
            <StatCard label="Couverture besoins" value={`${data.stats.tauxCouvertureBesoins}%`} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardSection title="Activite des quais">
            <div className="grid gap-3">
              {data.quaisActifs.map((quai) => (
                <RowCard key={quai.quai}>
                  <div>
                    <p className="text-lg font-black">{quai.quai}</p>
                    <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{quai.arrivages} arrivage(s)</p>
                  </div>
                  <CompactMetric label="Volume" value={quai.volumeTotal} />
                  <CompactMetric label="Besoins lies" value={String(quai.besoinsLies)} />
                </RowCard>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Lecture institutionnelle">
            <div className="grid gap-3">
              {insights.map((insight) => (
                <p key={insight} className="rounded-2xl bg-[#f7f4ec] p-5 text-sm font-bold leading-6 text-[#14312d]/75">
                  {insight}
                </p>
              ))}
            </div>
          </DashboardSection>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <DashboardSection title="Especes les plus demandees">
            <div className="grid gap-3">
              {data.especesDemandees.map((espece) => (
                <RowCard key={espece.espece}>
                  <div>
                    <p className="text-lg font-black">{espece.espece}</p>
                    <p className={`mt-1 text-sm font-black ${espece.ecartKg >= 0 ? "text-[#1b5e20]" : "text-[#9b1c1c]"}`}>Ecart {espece.ecart}</p>
                  </div>
                  <CompactMetric label="Disponible" value={espece.volumeDisponible} />
                  <CompactMetric label="Demande" value={espece.volumeDemande} />
                </RowCard>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Dernieres notifications">
            <div className="grid gap-3">
              {notifications.map((notification) => (
                <Link key={notification.id} href={notification.lien} className="rounded-2xl bg-[#f7f4ec] p-5 transition hover:bg-[#eee7d7]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#d65a31]">{notification.niveau}</span>
                    {!notification.lu ? <span className="rounded-full bg-[#14312d] px-3 py-1 text-xs font-black text-white">Non lue</span> : null}
                  </div>
                  <p className="mt-3 text-lg font-black">{notification.titre}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#14312d]/65">{notification.description}</p>
                </Link>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Opportunites recentes">
            <div className="grid gap-3">
              {data.opportunitesRecentes.map((opportunite) => (
                <RowCard key={opportunite.id}>
                  <div>
                    <p className="text-lg font-black">{opportunite.espece}</p>
                    <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{opportunite.quai}</p>
                  </div>
                  <CompactMetric label="Demandeur" value={opportunite.acteurDemandeur} />
                  <Link href={`/opportunites/${opportunite.id}`} className="rounded-full bg-[#14312d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1e4a43]">
                    Detail
                  </Link>
                </RowCard>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>
    </main>
  );
}

const navigationItems = [
  { href: "/", label: "Accueil" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunites" },
  { href: "/notifications", label: "Notifications" },
  { href: "/dashboard", label: "Dashboard" }
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{label}</p>
    </div>
  );
}

function DashboardSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function RowCard({ children }: { children: React.ReactNode }) {
  return <article className="grid gap-4 rounded-2xl bg-[#f7f4ec] p-5 sm:grid-cols-[1.2fr_0.8fr_0.8fr] sm:items-center">{children}</article>;
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-1 text-base font-black">{value}</p>
    </div>
  );
}
