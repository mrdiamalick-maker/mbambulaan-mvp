"use client";

import {
  AlertTriangle,
  Anchor,
  Factory,
  Handshake,
  Fish
} from "lucide-react";
import type { ProductState, Territory } from "@/domain/types";

export function TerritoryPulse({
  state,
  territory
}: {
  state: ProductState;
  territory: Territory;
}) {
  const situations = state.situations.filter(
    (item) => item.territoryId === territory.id && item.status !== "reglee"
  );

  const critical = situations.filter(
    (item) => item.priority === "critique"
  );

  const infrastructures = state.infrastructures.filter(
    (item) => item.territoryId === territory.id
  );

  const fragileCapacity = infrastructures.filter(
    (item) =>
      item.status === "fragile" ||
      item.status === "indisponible"
  );

  const operations = state.trips.filter(
    (item) =>
      state.vessels.find(
        (vessel) => vessel.id === item.vesselId
      )?.homeSiteId === `quai-${territory.id}`
  );

  const opportunities = state.opportunities.filter(
    (item) => item.territoryId === territory.id
  );

  return (
    <section className="surface overflow-hidden">

      <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-5">

        <p className="label">
          Atlas opérationnel territorial
        </p>

        <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">
          {territory.name}
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          État opérationnel du territoire.
        </p>

      </div>


      <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 xl:grid-cols-5">

        <PulseCard
          icon={<AlertTriangle size={18}/>}
          label="Tensions"
          value={String(critical.length)}
        />

        <PulseCard
          icon={<Anchor size={18}/>}
          label="Opérations"
          value={String(operations.length)}
        />

        <PulseCard
          icon={<Factory size={18}/>}
          label="Capacités sous vigilance"
          value={String(fragileCapacity.length)}
        />

        <PulseCard
          icon={<Fish size={18}/>}
          label="Opportunités"
          value={String(opportunities.length)}
        />

        <PulseCard
          icon={<Handshake size={18}/>}
          label="Situations ouvertes"
          value={String(situations.length)}
        />

      </div>

    </section>
  );
}


function PulseCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-5">

      <div className="flex items-center gap-2 text-[#08758a]">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#71858a]">
          {label}
        </p>
      </div>

      <p className="mt-3 text-3xl font-black text-[var(--ink)]">
        {value}
      </p>

    </div>
  );
}
