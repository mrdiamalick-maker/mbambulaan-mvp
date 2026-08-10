"use client";

import {
  Fish,
  Handshake,
  ShieldCheck,
  Target,
  TrendingUp
} from "lucide-react";
import type {
  ProductState,
  Situation
} from "@/domain/types";
import { evaluateTerritorialValue } from "@/domain/value-engine";


export function ValueImpactPanel({
  state,
  situation
}: {
  state: ProductState;
  situation?: Situation;
}) {

  const impact = evaluateTerritorialValue(
    state,
    situation
  );


  return (
    <section className="surface overflow-hidden">

      <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-5">

        <div className="flex items-center gap-2 text-[#08758a]">
          <TrendingUp size={18}/>
          <p className="label">
            Valeur créée
          </p>
        </div>


        <h2 className="mt-2 text-2xl font-black">
          Impact territorial Mbàmbulaan
        </h2>


        <p className="mt-2 text-sm text-[var(--legacy-muted)]">
          Résultats observés grâce à la coordination des acteurs.
        </p>

      </div>


      <div className="grid gap-4 p-5 md:grid-cols-4">


        <Metric
          icon={<Fish size={18}/>}
          label="Volume suivi"
          value={`${(
            impact.volumeProtected / 1000
          ).toFixed(1)} t`}
        />


        <Metric
          icon={<Handshake size={18}/>}
          label="Acteurs mobilisés"
          value={String(
            impact.actorsMobilized
          )}
        />


        <Metric
          icon={<Target size={18}/>}
          label="Situations réglées"
          value={String(
            impact.situationsResolved
          )}
        />


        <Metric
          icon={<ShieldCheck size={18}/>}
          label="Risques réduits"
          value={String(
            impact.risksReduced.length
          )}
        />


      </div>


      {impact.risksReduced.length > 0 && (
        <div className="border-t border-[var(--line)] p-5">

          <p className="label">
            Apprentissages opérationnels
          </p>

          <div className="mt-3 space-y-2">

            {impact.risksReduced.map(
              (risk) => (
                <p
                  key={risk}
                  className="rounded-lg bg-[var(--canvas)] p-3 text-sm"
                >
                  {risk}
                </p>
              )
            )}

          </div>

        </div>
      )}

    </section>
  );
}


function Metric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">

      <div className="flex items-center gap-2 text-[#08758a]">
        {icon}
        <p className="text-xs font-black uppercase tracking-[.08em]">
          {label}
        </p>
      </div>

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

    </div>
  );
}