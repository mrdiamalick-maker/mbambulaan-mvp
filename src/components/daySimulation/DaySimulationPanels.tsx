import Link from "next/link";
import type { ReactNode } from "react";
import type { DaySimulationEvent } from "@/lib/daySimulation";
import { StatusBadge as UiStatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";

export function DemoDaySimulationSection({ events }: { events: DaySimulationEvent[] }) {
  return (
    <SimulationBand title="Journée simulée Mbàmbulaan" eyebrow="Système vivant" description="Une journée complète relie les arrivages, besoins, opportunités, réservations, transactions, alertes, tensions et impacts.">
      <Timeline events={events} />
    </SimulationBand>
  );
}

export function DashboardDayEventsSection({ events }: { events: DaySimulationEvent[] }) {
  return (
    <SimulationBand title="Événements de la journée" eyebrow="Pilotage" description="Le dashboard lit la journée métier comme une suite d'effets mesurables et actionnables.">
      <div className="grid gap-4 lg:grid-cols-2">
        {events.slice(0, 6).map((event) => (
          <EventCard key={event.id} event={event} compact />
        ))}
      </div>
    </SimulationBand>
  );
}

export function CoordinationTimelinePanel({ events }: { events: DaySimulationEvent[] }) {
  return (
    <SimulationBand title="Chronologie opérationnelle" eyebrow="Coordination" description="Le centre de coordination suit les actions de la journée, des premiers débarquements à la traçabilité du lot.">
      <Timeline events={events} />
    </SimulationBand>
  );
}

function SimulationBand({ children, description, eyebrow, title }: { children: ReactNode; description: string; eyebrow: string; title: string }) {
  return (
    <section className="bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{eyebrow}</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#14312d]/65">{description}</p>
          </div>
          <Link href="/coordination" className="w-fit rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black transition hover:border-[#14312d]">
            Voir coordination
          </Link>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function Timeline({ events }: { events: DaySimulationEvent[] }) {
  return (
    <ol className="grid gap-4">
      {events.map((event) => (
        <li key={event.id} className="grid gap-4 rounded-2xl bg-[#f7f4ec] p-5 md:grid-cols-[5rem_1fr]">
          <div>
            <p className="text-2xl font-black text-[#d65a31]">{event.heure}</p>
            <StatusBadge status={event.statut} />
          </div>
          <EventCard event={event} />
        </li>
      ))}
    </ol>
  );
}

function EventCard({ compact = false, event }: { compact?: boolean; event: DaySimulationEvent }) {
  return (
    <article>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{event.type}</p>
          <h3 className="mt-2 text-xl font-black">{event.titre}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/70">{event.description}</p>
        </div>
        <Link href={event.lienMetier} className="w-fit rounded-full bg-[#14312d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1e4a43]">
          Voir
        </Link>
      </div>
      {!compact ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <EventDetail label="Acteur" value={event.acteurConcerne} />
          <EventDetail label="Quai" value={event.quai} />
          <EventDetail label="Impact" value={event.impactMetier} />
        </div>
      ) : (
        <p className="mt-3 text-sm font-black text-[#14312d]/60">{event.quai} · {event.espece}</p>
      )}
    </article>
  );
}

function EventDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-[#14312d]/70">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: DaySimulationEvent["statut"] }) {
  const tones: Record<DaySimulationEvent["statut"], StatusTone> = {
    prévu: "neutral",
    actif: "info",
    traité: "success",
    critique: "danger"
  };

  return <UiStatusBadge tone={tones[status]} className="mt-2">{status}</UiStatusBadge>;
}
