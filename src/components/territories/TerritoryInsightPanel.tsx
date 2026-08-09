"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Factory,
  Fish,
  Lightbulb
} from "lucide-react";
import type { ProductState, Territory } from "@/domain/types";

export function TerritoryInsightPanel({
  state,
  territory
}: {
  state: ProductState;
  territory: Territory;
}) {
  const situations = state.situations.filter(
    (item) =>
      item.territoryId === territory.id &&
      item.status !== "reglee"
  );

  const critical = situations.filter(
    (item) => item.priority === "critique"
  );

  const fragileInfrastructure = state.infrastructures.filter(
    (item) =>
      item.territoryId === territory.id &&
      (item.status === "fragile" ||
        item.status === "indisponible")
  );

  const opportunities = state.opportunities.filter(
    (item) => item.territoryId === territory.id
  );

  return (
    <section className="surface overflow-hidden">

      <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-5">

        <div className="flex items-center gap-2 text-[#08758a]">
          <Lightbulb size={18}/>
          <p className="label">
            Intelligence territoriale
          </p>
        </div>

        <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">
          Ce que le territoire nous dit
        </h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Lecture croisée des tensions, capacités et opportunités.
        </p>

      </div>


      <div className="grid gap-4 p-5 lg:grid-cols-3">

        <InsightCard
          icon={<AlertTriangle size={18}/>}
          title="Tensions prioritaires"
          count={critical.length}
          items={
            critical.map(
              (item) => item.title
            )
          }
          href="/app/situations"
        />


        <InsightCard
          icon={<Factory size={18}/>}
          title="Capacités fragiles"
          count={fragileInfrastructure.length}
          items={
            fragileInfrastructure.map(
              (item) => item.name
            )
          }
          href="/app/coordination"
        />


        <InsightCard
          icon={<Fish size={18}/>}
          title="Opportunités"
          count={opportunities.length}
          items={
            opportunities.map(
              (item) => item.id
            )
          }
          href="/app/marches"
        />

      </div>

    </section>
  );
}


function InsightCard({
  icon,
  title,
  count,
  items,
  href
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  items: string[];
  href: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5">

      <div className="flex items-center gap-2 text-[#08758a]">
        {icon}
        <p className="label">
          {title}
        </p>
      </div>

      <p className="mt-3 text-3xl font-black text-[var(--ink)]">
        {count}
      </p>


      <div className="mt-4 space-y-2">

        {items.slice(0,3).map((item)=>(
          <p
            key={item}
            className="text-sm font-semibold text-[var(--muted)]"
          >
            {item}
          </p>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-[var(--muted)]">
            Aucun signal détecté.
          </p>
        )}

      </div>


      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]"
      >
        Explorer
        <ArrowRight size={14}/>
      </Link>

    </div>
  );
}