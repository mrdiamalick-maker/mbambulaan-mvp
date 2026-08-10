"use client";

import {
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

import type { ProductState } from "@/domain/types";
import { resolveCapabilities } from "@/domain/platform/access-resolver";

const moduleLabels = {
  territory_intelligence: "Atlas territorial Premium",
  coordination: "Coordination et engagements",
  trust_network: "Réseau de confiance",
  market_intelligence: "Flux, besoins et débouchés",
  operations: "Opérations et actifs",
  reporting: "Rapports et exports",
  copilot: "Copilote gouverné"
} as const;


export function AccessSummary({
  state,
  organizationId
}: {
  state: ProductState;
  organizationId: string;
}) {

  const capabilities =
    resolveCapabilities(
      state,
      organizationId
    );


  const organization =
    state.organizations.find(
      (item) =>
        item.id === organizationId
    );


  const subscription =
    state.subscriptions.find(
      (item) =>
        item.organizationId === organizationId
    );


  const plan =
    state.plans.find(
      (item) =>
        item.id === subscription?.planId
    );


  return (

    <section className="surface p-6">

      <div className="flex items-center gap-2 text-[#08758a]">

        <ShieldCheck size={18}/>

        <p className="label">
          Accès Mbàmbulaan
        </p>

      </div>


      <h2 className="mt-3 text-2xl font-black">
        {plan?.name ?? "Plan non défini"}
      </h2>


      <p className="mt-2 text-sm text-[var(--legacy-muted)]">
        {organization?.name}
      </p>


      <div className="mt-5 grid gap-3 md:grid-cols-2">

        {capabilities.modules.map(
          (module)=>(

            <div
              key={module}
              className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-3"
            >

              <CheckCircle2
                size={16}
                className="text-[#118f83]"
              />

              <span className="text-sm font-bold">
                {moduleLabels[module]}
              </span>

            </div>

          )

        )}

      </div>


    </section>

  );

}
