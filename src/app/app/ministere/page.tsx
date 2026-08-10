"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Banknote, CalendarClock, HandCoins, MapPinned, ShieldAlert, Users } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { MinistryHero } from "@/components/ministry/MinistryHero";
import type { FieldVisit } from "@/domain/ministry/field-visit";
import type { VigilanceCase } from "@/domain/ministry/vigilance";

const entries = [
  {
    href: "/app/ministere/revenus",
    icon: HandCoins,
    title: "Revenus alternatifs",
    pitch: "Un catalogue de leviers de diversification à qualifier avec les communautés de pêcheurs."
  },
  {
    href: "/app/ministere/terrain",
    icon: MapPinned,
    title: "Terrain & rencontres",
    pitch: "Planifier des missions et garder la trace des rencontres avec les pêcheurs et capitaines."
  },
  {
    href: "/app/ministere/vigilance",
    icon: ShieldAlert,
    title: "Vigilance & fléaux",
    pitch: "Signaler et suivre immigration clandestine, pêche illicite et autres situations sensibles."
  },
  {
    href: "/app/ministere/programmes",
    icon: Banknote,
    title: "Programmes & bailleurs",
    pitch: "Les initiatives en cours, présentées pour susciter l'intérêt des partenaires financiers."
  }
] as const;

export default function MinistryOverviewPage() {
  const { state, actorId } = useProduct();
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [cases, setCases] = useState<VigilanceCase[]>([]);

  useEffect(() => {
    void fetch("/api/ministry/field-visits").then((response) => response.ok && response.json()).then((payload) => payload && setVisits(payload.visits ?? []));
    void fetch("/api/ministry/vigilance").then((response) => response.ok && response.json()).then((payload) => payload && setCases(payload.cases ?? []));
  }, []);

  if (!state) return null;
  const actor = state.actors.find((item) => item.id === actorId);
  const verifiedActors = state.actors.filter((item) => item.verified).length;
  const openCases = cases.filter((item) => item.status !== "clos").length;
  const upcomingVisits = visits.filter((item) => item.status === "planifiee").length;
  const activeInitiatives = state.initiatives.filter((item) => item.status !== "terminee").length;

  const stats = [
    { label: "Territoires couverts", value: state.territories.length, icon: MapPinned },
    { label: "Acteurs vérifiés", value: verifiedActors, icon: Users },
    { label: "Alertes de vigilance ouvertes", value: openCases, icon: ShieldAlert },
    { label: "Rencontres terrain planifiées", value: upcomingVisits, icon: CalendarClock },
    { label: "Programmes en cours", value: activeInitiatives, icon: Banknote }
  ];

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <MinistryHero
        eyebrow="Espace Ministère"
        title={`Bienvenue, ${actor?.name ?? "Ministère"}.`}
        description="Une vue resserrée sur ce qui compte pour l'action publique dans la filière : revenus alternatifs, présence terrain, vigilance et programmes à faire connaître aux bailleurs."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="op-card p-5">
            <Icon size={18} className="text-[var(--op-signal-500)]" />
            <p className="op-stat-value mt-4 text-3xl">{value}</p>
            <p className="op-stat-label mt-1">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs leading-5 text-[var(--op-ink-400)]">
        Chiffres calculés à partir de l’environnement de démonstration Mbàmbulaan — territoires, mandats et initiatives réels de la maquette, pas des statistiques nationales officielles.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map(({ href, icon: Icon, title, pitch }) => (
          <Link key={href} href={href} className="op-card group flex flex-col gap-3 p-6">
            <span className="grid size-10 place-items-center rounded-lg bg-[var(--op-signal-100)] text-[var(--op-signal-600)]"><Icon size={19} /></span>
            <h2 className="text-lg font-bold tracking-[-.02em] text-[var(--op-ink-900)]">{title}</h2>
            <p className="text-sm leading-6 text-[var(--op-ink-500)]">{pitch}</p>
            <span className="mt-auto text-sm font-bold text-[var(--op-signal-600)] transition group-hover:translate-x-0.5">Ouvrir →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
