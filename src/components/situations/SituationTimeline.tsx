"use client";

import {
  CheckCircle2,
  Circle
} from "lucide-react";

import type {
  SituationStatus
} from "@/domain/types";


const steps = [
  {
    id:"recue",
    label:"Signal reçu"
  },
  {
    id:"qualification",
    label:"Qualification"
  },
  {
    id:"priorisee",
    label:"Priorisation"
  },
  {
    id:"coordination",
    label:"Coordination"
  },
  {
    id:"intervention",
    label:"Intervention"
  },
  {
    id:"resultat",
    label:"Résultat"
  },
  {
    id:"reglee",
    label:"Réglée"
  }
];


export function SituationTimeline({
  status
}:{
  status: SituationStatus;
}) {


  const currentIndex =
    steps.findIndex(
      (step)=>
        step.id === status
    );


  return (

    <section className="surface p-6">


      <p className="label">
        Trajectoire opérationnelle
      </p>


      <div className="mt-5 space-y-3">


        {steps.map(
          (step,index)=>(

          <div
            key={step.id}
            className="flex items-center gap-3"
          >

            {index <= currentIndex ? (

              <CheckCircle2
                size={18}
                className="text-[#118f83]"
              />

            ):(

              <Circle
                size={18}
                className="text-[#b8c8ca]"
              />

            )}


            <p
              className={
                index === currentIndex
                  ? "font-black"
                  : "text-sm text-[var(--muted)]"
              }
            >
              {step.label}
            </p>


          </div>

        ))}


      </div>


    </section>

  );

}