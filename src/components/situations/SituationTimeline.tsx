"use client";

import {
  CheckCircle2,
  Circle
} from "lucide-react";

import type {
  SituationStatus
} from "@/domain/types";


// Les 8 statuts de SituationStatus, dans l'ordre du cycle de vie
// (domain/types.ts). "attente" manquait ici : une situation bloquée
// affichait alors currentIndex = -1, donc aucune étape active visible
// (Lot 4, gap analysis).
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
    id:"attente",
    label:"En attente"
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
                  : "text-sm text-[var(--legacy-muted)]"
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