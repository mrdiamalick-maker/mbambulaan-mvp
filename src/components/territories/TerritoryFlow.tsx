"use client";

import {
  Anchor,
  ArrowDown,
  Boxes,
  Factory,
  Fish,
  Handshake,
  Snowflake
} from "lucide-react";
import type { ProductState, Territory } from "@/domain/types";

export function TerritoryFlow({
  state,
  territory
}: {
  state: ProductState;
  territory: Territory;
}) {
  const trips = state.trips.filter((trip) => {
    const vessel = state.vessels.find(
      (item) => item.id === trip.vesselId
    );

    return vessel?.homeSiteId === `quai-${territory.id}`;
  });

  const landings = state.landings.filter(
    (landing) => landing.siteId === `quai-${territory.id}`
  );

  const lots = state.lots.filter(
    (lot) => lot.siteId === `quai-${territory.id}`
  );

  const coldCapacities = state.infrastructures.filter(
    (item) =>
      item.territoryId === territory.id &&
      [
        "fabrique_glace",
        "chambre_froide",
        "transport"
      ].includes(item.type)
  );

  const opportunities = state.opportunities.filter(
    (item) => item.territoryId === territory.id
  );

  const steps = [
    {
      icon: Anchor,
      title: "Production maritime",
      value: `${trips.length} sortie(s) suivie(s)`,
      detail: "Pirogues et retours suivis"
    },
    {
      icon: Fish,
      title: "Débarquement",
      value: `${landings.length} débarquement(s)`,
      detail: "Pesée et création de lots"
    },
    {
      icon: Boxes,
      title: "Lots disponibles",
      value: `${lots.length} lot(s)`,
      detail: "Volumes orientables"
    },
    {
      icon: Snowflake,
      title: "Conservation",
      value: `${coldCapacities.length} capacité(s)`,
      detail: coldCapacities.some(
        (item) => item.status === "indisponible"
      )
        ? "Tension détectée"
        : "Capacités disponibles"
    },
    {
      icon: Handshake,
      title: "Valorisation",
      value: `${opportunities.length} opportunité(s)`,
      detail: "Rapprochements métier"
    }
  ];

  return (
    <section className="surface overflow-hidden">

      <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-5">

        <div className="flex items-center gap-2 text-[#08758a]">
          <Factory size={18}/>
          <p className="label">
            Flux territorial
          </p>
        </div>

        <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">
          Comment la valeur circule dans le territoire
        </h2>

        <p className="mt-2 text-sm text-[var(--legacy-muted)]">
          De la sortie en mer jusqu&apos;à la valorisation économique.
        </p>

      </div>


      <div className="grid gap-0 md:grid-cols-5">

        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="relative border-b border-[var(--line)] p-5 last:border-b-0 md:border-b-0 md:border-r last:md:border-r-0"
            >

              <div className="flex items-center gap-2 text-[#08758a]">
                <Icon size={18}/>
                <p className="text-xs font-black uppercase tracking-[.08em]">
                  {step.title}
                </p>
              </div>

              <p className="mt-4 text-xl font-black text-[var(--ink)]">
                {step.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--legacy-muted)]">
                {step.detail}
              </p>

              {index < steps.length - 1 && (
                <ArrowDown
                  className="absolute bottom-3 left-1/2 hidden text-[#9bb4b8] md:block"
                  size={16}
                />
              )}

            </div>
          );
        })}

      </div>

    </section>
  );
}