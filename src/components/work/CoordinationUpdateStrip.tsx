"use client";

import { usePathname } from "next/navigation";
import { ArrowRight, MessageCircleMore } from "lucide-react";
import { useCoordinationLoop, type LoopActor } from "@/components/providers/CoordinationLoopProvider";
import { useProduct } from "@/components/providers/ProductProvider";

const supportedRoles = new Set<LoopActor>(["capitaine", "operateur", "mareyeur", "transformateur", "prestataire"]);

function isLoopActor(role: string): role is LoopActor {
  return supportedRoles.has(role as LoopActor);
}

export function CoordinationUpdateStrip() {
  const pathname = usePathname();
  const { role } = useProduct();
  const { updates } = useCoordinationLoop();

  if (pathname !== "/app/travail" || !isLoopActor(role)) return null;

  const latest = [...updates].reverse().find((update) => update.visibleTo.includes(role));
  if (!latest) return null;

  const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(latest.at));
  const nextAction = latest.nextAction[role];

  return (
    <section className="border-b border-[var(--line)] bg-[var(--lagoon-100)] px-5 py-4 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-[var(--white)] text-[var(--lagoon-600)] shadow-[var(--shadow-sm)]">
          <MessageCircleMore size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--lagoon-600)]">Nouvelle utile pour vous</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{latest.detail}</p>
          {nextAction && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--ocean-800)]">
              À faire : {nextAction} <ArrowRight size={12} />
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--muted)]">{time} · {latest.workId}</p>
        </div>
      </div>
    </section>
  );
}
