"use client";

import {
  AlertTriangle
} from "lucide-react";
import type { ProductState, Situation } from "@/domain/types";
import { StatusBadge, PriorityBadge, TrustBadge } from "@/components/ui/Badges";
import { SituationAction } from "@/components/situations/SituationAction";
import { CoordinationProposal } from "@/components/coordination/CoordinationProposal";
import { ValueImpactPanel } from "@/components/impact/ValueImpactPanel";
import { SituationTimeline } from "@/components/situations/SituationTimeline";

export function SituationRoom({
  situation,
  state
}: {
  situation: Situation;
  state: ProductState;
}) {
  const territory = state.territories.find(
    (item) => item.id === situation.territoryId
  );

  const observation = state.observations.find(
    (item) => situation.observationIds.includes(item.id)
  );

  const coordination = state.coordinationSpaces.find(
    (item) => item.id === situation.coordinationId
  );

  const responsible = state.actors.find(
    (item) => item.id === situation.responsibleId
  );

  return (
    <div className="space-y-6">

      <section className="mission-strip p-6 lg:p-8">

        <div className="flex flex-wrap items-start justify-between gap-5">

          <div>
            <div className="flex items-center gap-2 text-[#70e3d5]">
              <AlertTriangle size={18}/>
              <p className="text-xs font-black uppercase tracking-[.15em]">
                Situation opérationnelle
              </p>
            </div>

            <h1 className="mt-4 text-3xl font-black text-white lg:text-5xl">
              {situation.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
              {situation.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={situation.status}/>
            <PriorityBadge priority={situation.priority}/>
            <TrustBadge trust={situation.trust}/>
          </div>

        </div>

      </section>


      <section className="grid gap-5 lg:grid-cols-3">

        <InfoCard
          label="Territoire"
          value={territory?.name ?? "Non défini"}
        />

        <InfoCard
          label="Responsable"
          value={responsible?.name ?? "À désigner"}
        />

        <InfoCard
          label="Prochaine décision"
          value={situation.nextStep}
        />

      </section>


      <SituationAction situation={situation} />


      <SituationTimeline
        status={situation.status}
      />


      <section className="grid gap-5 lg:grid-cols-[1fr_.8fr]">

        <div className="surface p-6">

          <p className="label">
            Origine du signal
          </p>

          <h2 className="mt-3 text-xl font-black">
            {observation?.source ?? "Source inconnue"}
          </h2>

          <p className="mt-3 text-sm text-[var(--muted)]">
            {observation?.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold">

            <span className="rounded-full bg-[var(--canvas)] px-3 py-2">
              Canal : {observation?.channel.replaceAll("_", " ")}
            </span>

            <span className="rounded-full bg-[var(--canvas)] px-3 py-2">
              Confiance : {situation.trust}
            </span>

          </div>

        </div>


        <CoordinationProposal
          coordination={coordination}
          state={state}
        />

      </section>


      <ValueImpactPanel
        state={state}
        situation={situation}
      />


      <section className="surface p-6">

        <p className="label">
          Historique
        </p>

        <div className="mt-5 space-y-4">

          {situation.history.map((item)=>(
            <div
              key={item.id}
              className="border-l-2 border-[#70e1d6] pl-4"
            >

              <p className="font-bold">
                {item.label}
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {item.detail}
              </p>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
}


function InfoCard({
  label,
  value
}: {
  label:string;
  value:string;
}) {
  return (
    <div className="surface p-5">
      <p className="label">{label}</p>
      <p className="mt-3 text-lg font-black">
        {value}
      </p>
    </div>
  );
}