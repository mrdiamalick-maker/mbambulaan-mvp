"use client";

import {
  AlertTriangle,
  ArrowRight
} from "lucide-react";


import type {
  ProductState
} from "@/domain/types";


import {
  generateInstitutionInsights
} from "@/domain/institution/decision-engine";


export function InstitutionDecisionPanel({
  state
}:{
  state: ProductState;
}) {


  const insights =
    generateInstitutionInsights(
      state
    );


  return (

    <section className="surface p-6">


      <div className="flex items-center gap-2 text-[#08758a]">

        <AlertTriangle size={18}/>

        <p className="label">
          Priorités décisionnelles
        </p>

      </div>


      <h2 className="mt-3 text-2xl font-black">
        Où agir maintenant ?
      </h2>


      <div className="mt-5 space-y-4">


        {insights.slice(0,5).map(
          (item)=>(

          <article
            key={item.territoryId + item.title}
            className="rounded-xl border border-[var(--line)] p-5"
          >


            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-black uppercase text-[#08758a]">
                  {item.territoryName}
                </p>


                <h3 className="mt-2 font-black">
                  {item.title}
                </h3>


              </div>


              <ArrowRight size={16}/>


            </div>


            <p className="mt-3 text-sm text-[var(--muted)]">
              {item.explanation}
            </p>


            <p className="mt-3 text-sm font-bold">
              Action :
              {" "}
              {item.action}
            </p>


          </article>

        ))}


      </div>


    </section>

  );

}