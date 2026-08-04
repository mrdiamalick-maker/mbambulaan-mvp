"use client";

import { usePathname } from "next/navigation";
import { MessageCircleMore } from "lucide-react";
import { useCoordinationLoop } from "@/components/providers/CoordinationLoopProvider";
import { useProduct } from "@/components/providers/ProductProvider";

const roleLabels = {
  capitaine: "Capitaine",
  operateur: "Agent de quai",
  mareyeur: "Mareyeur",
  transformateur: "Transformatrice",
  prestataire: "Prestataire",
  administrateur: "Administration",
  gestionnaire_organisation: "Organisation",
  coordinateur: "Coordination territoriale",
  institution: "Institution",
  partenaire: "Partenaire"
} as const;

export function CoordinationUpdateStrip() {
  const pathname = usePathname();
  const { role } = useProduct();
  const { updates } = useCoordinationLoop();

  if (pathname !== "/app/travail" || updates.length === 0) return null;

  const latest = updates[updates.length - 1];
  const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(latest.at));

  return (
    <section className="border-b border-[var(--line)] bg-[var(--lagoon-100)] px-5 py-4 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-[var(--white)] text-[var(--lagoon-600)] shadow-[var(--shadow-sm)]">
          <MessageCircleMore size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--lagoon-600)]">Dernière nouvelle du terrain</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{latest.detail}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{time} · {latest.workId} · visible dans l’espace {roleLabels[role]}</p>
        </div>
      </div>
    </section>
  );
}
