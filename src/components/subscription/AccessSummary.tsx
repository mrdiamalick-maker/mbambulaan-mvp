"use client";

// Restylé en D9 (Lot 7, étape 2/4), reformaté au passage (mise en page
// éclatée d'origine, sans changement de logique).
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { resolveCapabilities } from "@/domain/platform/access-resolver";
import { Card, CardContent } from "@/components/ui/card";

const moduleLabels = {
  territory_intelligence: "Atlas territorial Premium",
  coordination: "Coordination et engagements",
  trust_network: "Réseau de confiance",
  market_intelligence: "Flux, besoins et débouchés",
  operations: "Opérations et actifs",
  reporting: "Rapports et exports",
  copilot: "Copilote gouverné"
} as const;

export function AccessSummary({ state, organizationId }: { state: ProductState; organizationId: string }) {
  const capabilities = resolveCapabilities(state, organizationId);
  const organization = state.organizations.find((item) => item.id === organizationId);
  const subscription = state.subscriptions.find((item) => item.organizationId === organizationId);
  const plan = state.plans.find((item) => item.id === subscription?.planId);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-[#1d4468]"><ShieldCheck size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accès Mbàmbulaan</p></div>
        <h2 className="mt-3 text-xl font-semibold">{plan?.name ?? "Plan non défini"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{organization?.name}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {capabilities.modules.map((module) => (
            <div key={module} className="flex items-center gap-2 rounded-md border bg-card p-3">
              <CheckCircle2 size={16} className="text-[#1d8a5f]" />
              <span className="text-sm font-semibold">{moduleLabels[module]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
