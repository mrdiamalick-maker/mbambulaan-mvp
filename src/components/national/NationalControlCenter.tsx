"use client";

import {
  Anchor,
  AlertTriangle,
  Fish,
  Handshake,
  Map,
  TrendingUp,
  UsersRound
} from "lucide-react";

import type {
  ProductState
} from "@/domain/types";

import {
  generateNationalSnapshot
} from "@/domain/national/national-engine";


export function NationalControlCenter({
  state
}:{
  state: ProductState;
}) {


  const snapshot =
    generateNationalSnapshot(state);



  return (

    <section className="space-y-5">


      <section className="mission-strip p-8">


        <p className="text-xs font-black uppercase tracking-[.15em] text-[#74e1d6]">
          Mbàmbulaan Sénégal
        </p>


        <h1 className="mt-3 text-4xl font-black text-white">
          Intelligence territoriale nationale
        </h1>


        <p className="mt-3 max-w-3xl text-white/60">
          Vision consolidée des territoires côtiers,
          des acteurs et des dynamiques de filière.
        </p>


      </section>



      <section className="grid gap-4 md:grid-cols-4">


        <Metric
          icon={<Map size={18}/>}
          label="Territoires"
          value={snapshot.territories}
        />


        <Metric
          icon={<UsersRound size={18}/>}
          label="Acteurs"
          value={snapshot.actors}
        />


        <Metric
          icon={<Fish size={18}/>}
          label="Débarquements"
          value={snapshot.landings}
        />


        <Metric
          icon={<Handshake size={18}/>}
          label="Coordinations"
          value={snapshot.coordinations}
        />


      </section>



      <section className="grid gap-4 md:grid-cols-3">


        <Metric
          icon={<AlertTriangle size={18}/>}
          label="Situations critiques"
          value={snapshot.criticalSituations}
        />


        <Metric
          icon={<Anchor size={18}/>}
          label="Situations actives"
          value={snapshot.activeSituations}
        />


        <Metric
          icon={<TrendingUp size={18}/>}
          label="Opportunités"
          value={snapshot.opportunities}
        />


      </section>


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
 value:number;
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