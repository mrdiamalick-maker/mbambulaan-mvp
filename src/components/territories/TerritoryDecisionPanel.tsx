"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Factory,
  Handshake,
  Target,
  UsersRound
} from "lucide-react";
import type { ProductState, Territory } from "@/domain/types";
import { recommendCoordination } from "@/domain/coordination-engine";

export function TerritoryDecisionPanel({
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

  const priorities = [...situations].sort((a, b) => {
    const weight = {
      critique: 4,
      haute: 3,
      moyenne: 2,
      faible: 1
    };

    return weight[b.priority] - weight[a.priority];
  });

  const criticalCapacity = state.infrastructures.filter(
    (item) =>
      item.territoryId === territory.id &&
      item.status !== "operationnelle"
  );

  const opportunities = state.opportunities.filter(
    (item) =>
      item.territoryId === territory.id
  );

  const mainSituation = priorities[0];

  const recommendation = mainSituation
    ? recommendCoordination(state, mainSituation)
    : null;


  return (
    <aside className="space-y-5 bg-[#031a22] p-5 text-white">

      <div>
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#74e1d6]">
          Centre de décision
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Que faut-il faire maintenant ?
        </h2>
      </div>


      {mainSituation ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center gap-2 text-[#ffb36b]">
            <AlertTriangle size={18}/>
            <p className="text-xs font-black uppercase tracking-[.1em]">
              Priorité
            </p>
          </div>

          <h3 className="mt-4 text-lg font-black">
            {mainSituation.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/60">
            {mainSituation.nextStep}
          </p>


          <Link
            href={`/app/situations/${mainSituation.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c96a48] px-4 py-3 text-sm font-black text-white"
          >
            Ouvrir la situation
            <ArrowRight size={15}/>
          </Link>

        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">
            Aucun sujet prioritaire détecté.
          </p>
        </section>
      )}



      {recommendation && (
        <section className="rounded-2xl border border-[#74e1d6]/30 bg-[#052630] p-5">

          <div className="flex items-center gap-2 text-[#74e1d6]">
            <UsersRound size={18}/>
            <p className="text-xs font-black uppercase tracking-[.1em]">
              Recommandation Mbàmbulaan
            </p>
          </div>


          <h3 className="mt-4 text-lg font-black">
            Organiser une coordination
          </h3>


          <p className="mt-3 text-sm leading-6 text-white/60">
            {recommendation.reason}
          </p>


          <div className="mt-4 rounded-xl bg-white/5 p-3">

            <p className="text-xs font-bold text-white/50">
              Première action
            </p>

            <p className="mt-1 text-sm font-bold">
              {recommendation.firstAction}
            </p>

          </div>


          <div className="mt-4 text-xs text-white/60">
            Acteurs potentiels :
            {" "}
            {recommendation.actorIds.length}
          </div>


          {recommendation.risks.length > 0 && (
            <div className="mt-3 text-xs text-[#ffcf9b]">
              Risques détectés :
              {" "}
              {recommendation.risks.join(", ")}
            </div>
          )}

        </section>
      )}



      <DecisionMetric
        icon={<Factory size={17}/>}
        title="Capacités sous tension"
        value={String(criticalCapacity.length)}
        detail="Infrastructures nécessitant une attention."
      />


      <DecisionMetric
        icon={<Handshake size={17}/>}
        title="Opportunités"
        value={String(opportunities.length)}
        detail="Rapprochements à valoriser."
      />


      <DecisionMetric
        icon={<Target size={17}/>}
        title="Situations ouvertes"
        value={String(situations.length)}
        detail="Boucles opérationnelles en cours."
      />

    </aside>
  );
}


function DecisionMetric({
  icon,
  title,
  value,
  detail
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">

      <div className="flex items-center gap-2 text-[#74e1d6]">
        {icon}
        <p className="text-xs font-black uppercase tracking-[.08em]">
          {title}
        </p>
      </div>

      <p className="mt-3 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-white/50">
        {detail}
      </p>

    </div>
  );
}