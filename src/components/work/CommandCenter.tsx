"use client";

import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  MapPinned,
  Network,
  Target
} from "lucide-react";

import type {
  ProductState
} from "@/domain/types";

import {
  SituationDecisionCard
} from "@/components/situations/SituationDecisionCard";

import {
  TerritoryDecisionPanel
} from "@/components/territories/TerritoryDecisionPanel";

import {
  ActorNetworkPanel
} from "@/components/actors/ActorNetworkPanel";


export function CommandCenter({
  state,
  actorId
}: {
  state: ProductState;
  actorId: string;
}) {


  const actor =
    state.actors.find(
      (item) =>
        item.id === actorId
    );


  const territoryIds =
    new Set(
      actor?.territoryIds ?? []
    );


  const territory =
    state.territories.find(
      (item) =>
        territoryIds.has(item.id)
    ) ?? state.territories[0];


  const situations =
    state.situations.filter(
      (item)=>
        territoryIds.size === 0 ||
        territoryIds.has(item.territoryId)
    );


  const openSituations =
    situations.filter(
      (item)=>
        item.status !== "reglee"
    );


  const critical =
    openSituations.filter(
      (item)=>
        item.priority === "critique"
    );


  const missions =
    state.coordinationSpaces.filter(
      (item)=>
        item.commitments.some(
          (commitment)=>
            commitment.status !== "terminee"
        )
        ||
        item.commitments.length === 0
    );


  const latestSignals = state.observations
    .filter((item) => territoryIds.size === 0 || territoryIds.has(item.territoryId))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      detail: item.title,
      action: `${state.territories.find((territoryItem) => territoryItem.id === item.territoryId)?.name ?? item.territoryId} · ${item.source} · ${item.trust}`
    }));



  return (

    <div className="space-y-7 p-5 lg:p-8">


      <section className="mission-strip overflow-hidden">

        <div className="p-6 lg:p-8">

          <p className="text-xs font-black uppercase tracking-[.15em] text-[#70e3d5]">
            Command Center Mbàmbulaan
          </p>


          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-.04em] text-white lg:text-5xl">
            Piloter les situations qui comptent maintenant.
          </h1>


          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
            Une vision consolidée du territoire, des tensions,
            des acteurs capables d’agir et des décisions attendues.
          </p>


          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              href="/app/atlas"
              className="btn-on-dark"
            >
              <MapPinned size={16}/>
              Voir le territoire
            </Link>

          </div>


        </div>

      </section>



      <section className="grid gap-4 md:grid-cols-4">


        <MetricCard
          icon={<AlertTriangle size={18}/>}
          label="Tensions"
          value={String(critical.length)}
        />


        <MetricCard
          icon={<Target size={18}/>}
          label="Situations ouvertes"
          value={String(openSituations.length)}
        />


        <MetricCard
          icon={<Network size={18}/>}
          label="Missions actives"
          value={String(missions.length)}
        />


        <MetricCard
          icon={<CheckCircle2 size={18}/>}
          label="Résultats"
          value={String(
            state.situations.filter(
              (item)=>
                item.status === "reglee"
            ).length
          )}
        />

      </section>



      {territory && (

        <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">


          <TerritoryDecisionPanel
            state={state}
            territory={territory}
          />


          <ActorNetworkPanel
            state={state}
            territory={territory}
          />


        </section>

      )}



      <section className="space-y-5">


        <div className="surface p-6">

          <div className="flex items-center gap-2 text-[#08758a]">

            <Target size={18}/>

            <p className="label">
              Décisions attendues
            </p>

          </div>


          <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">
            {territory?.name ?? "Votre territoire"}
          </h2>


          <p className="mt-2 text-sm text-[var(--muted)]">
            Les situations nécessitant une action ou une coordination.
          </p>

        </div>



        <div className="space-y-4">

          {openSituations
            .slice(0,5)
            .map((item)=>(

            <SituationDecisionCard
              key={item.id}
              situation={item}
              state={state}
            />

          ))}

        </div>


      </section>



      <section className="surface p-6">


        <p className="label">
          Signaux récents
        </p>


        <div className="mt-5 grid gap-3 md:grid-cols-2">


          {latestSignals.map(
            (signal)=>(

            <div
              key={signal.id}
              className="rounded-xl bg-[var(--canvas)] p-4"
            >

              <p className="text-sm font-bold text-[var(--ink)]">
                {signal.detail}
              </p>


              <p className="mt-1 text-xs text-[var(--muted)]">
                {signal.action}
              </p>


            </div>

          ))}


        </div>


      </section>


    </div>

  );

}



function MetricCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label:string;
  value:string;
}) {

  return (

    <div className="surface p-5">

      <div className="flex items-center gap-2 text-[#08758a]">

        {icon}

        <p className="label">
          {label}
        </p>

      </div>


      <p className="mt-3 text-3xl font-black text-[var(--ink)]">
        {value}
      </p>


    </div>

  );

}
