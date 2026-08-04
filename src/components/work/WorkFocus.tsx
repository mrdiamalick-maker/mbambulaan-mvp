"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle, MessageCircleMore, UsersRound } from "lucide-react";
import { useCoordinationLoop } from "@/components/providers/CoordinationLoopProvider";
import type { MbambulaanWork } from "@/lib/mbambulaan/work-demo";

type SupportedRole = "capitaine" | "operateur" | "mareyeur" | "transformateur";

const healthLabels = {
  normal: "Normal",
  attention: "À surveiller",
  bloque: "Bloqué"
} as const;

export function WorkFocus({ work, role }: { work: MbambulaanWork; role: SupportedRole }) {
  const view = work.roleViews[role];
  const { updates } = useCoordinationLoop();
  const latestUpdate = [...updates].reverse().find((update) => update.workId === work.id);

  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-[var(--line)] bg-[var(--ocean-1000)] px-5 py-5 text-white lg:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-white/55">Travail en cours</p>
            <h2 className="mt-2 text-2xl font-black">{work.title}</h2>
            <p className="mt-1 text-sm text-white/60">{work.id} · {work.currentStep}</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">{healthLabels[work.health]}</span>
        </div>
      </div>

      {latestUpdate && (
        <div className="border-b border-[var(--line)] bg-[var(--lagoon-100)] px-5 py-4 lg:px-7">
          <div className="flex items-start gap-3">
            <MessageCircleMore className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={18} />
            <div>
              <p className="text-xs font-semibold text-[var(--muted)]">Dernière information reçue dans le canal messaging</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{latestUpdate.action}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{latestUpdate.detail}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-0 lg:grid-cols-[1fr_.85fr]">
        <div className="p-5 lg:p-7">
          <p className="label">La question utile maintenant</p>
          <h3 className="mt-2 text-2xl font-black text-[var(--ink)]">{view.question}</h3>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{view.nextAction}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] bg-[var(--sand-100)] p-4">
              <p className="text-xs font-semibold text-[var(--muted)]">Qui travaille maintenant</p>
              <p className="mt-1 font-semibold text-[var(--ink)]">{view.currentOwner}</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--sand-100)] p-4">
              <p className="text-xs font-semibold text-[var(--muted)]">Qui intervient ensuite</p>
              <p className="mt-1 font-semibold text-[var(--ink)]">{view.nextOwner}</p>
            </div>
          </div>

          <Link href={view.actionHref} className="btn-accent mt-5">{view.actionLabel} <ArrowRight size={16} /></Link>
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--sand-100)] p-5 lg:border-l lg:border-t-0 lg:p-7">
          <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><UsersRound size={17} /><p className="label">Ce qui vient de changer</p></div>
          <div className="mt-4 space-y-3">
            {work.events.slice(-4).map((event) => (
              <div key={event.id} className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--white)] p-4">
                {event.done ? <Check className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={17} /> : <Circle className="mt-0.5 shrink-0 text-[var(--sand-500)]" size={17} />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{event.label}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{event.at} · {event.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
