"use client";

// Restylé en D9 (Lot 7, étape 2/4), reformaté au passage (mise en page
// éclatée d'origine, sans changement de logique) — co-rendu avec
// ProfessionalAtlasWorkspace sur /app/atlas, migré avec elle.
import { AlertTriangle, Anchor, Factory, Network } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { Card, CardContent } from "@/components/ui/card";

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[#1d4468]">{icon}<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p></div>
        <p className="mt-3 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function AtlasExecutiveSummary({ state }: { state: ProductState }) {
  const openSituations = state.situations.filter((item) => item.status !== "reglee");
  const criticalCapacity = state.infrastructures.filter((item) => item.status !== "operationnelle");
  const actors = state.actors.filter((item) => item.verified);

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Metric icon={<Anchor size={18} />} label="Territoires" value={String(state.territories.length)} />
      <Metric icon={<AlertTriangle size={18} />} label="Situations ouvertes" value={String(openSituations.length)} />
      <Metric icon={<Network size={18} />} label="Acteurs fiables" value={String(actors.length)} />
      <Metric icon={<Factory size={18} />} label="Capacités fragiles" value={String(criticalCapacity.length)} />
    </section>
  );
}
