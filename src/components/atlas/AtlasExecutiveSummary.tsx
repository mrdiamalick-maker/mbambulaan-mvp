"use client";

import {
  AlertTriangle,
  Anchor,
  Factory,
  Network,
} from "lucide-react";

import type {
  ProductState
} from "@/domain/types";


export function AtlasExecutiveSummary({
  state
}:{
  state: ProductState;
}) {


  const openSituations =
    state.situations.filter(
      (item)=>
        item.status !== "reglee"
    );


  const criticalCapacity =
    state.infrastructures.filter(
      (item)=>
        item.status !== "operationnelle"
    );


  const actors =
    state.actors.filter(
      (item)=>
        item.verified
    );


  return (

    <section className="grid gap-4 md:grid-cols-4">


      <Metric
        icon={<Anchor size={18}/>}
        label="Territoires"
        value={String(state.territories.length)}
      />


      <Metric
        icon={<AlertTriangle size={18}/>}
        label="Situations ouvertes"
        value={String(openSituations.length)}
      />


      <Metric
        icon={<Network size={18}/>}
        label="Acteurs fiables"
        value={String(actors.length)}
      />


      <Metric
        icon={<Factory size={18}/>}
        label="Capacités fragiles"
        value={String(criticalCapacity.length)}
      />


    </section>

  );

}



function Metric({
  icon,
  label,
  value
}:{
  icon:React.ReactNode;
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


      <p className="mt-3 text-3xl font-black">
        {value}
      </p>

    </div>

  );

}
