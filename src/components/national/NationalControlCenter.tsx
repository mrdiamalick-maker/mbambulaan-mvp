"use client";

// Restylé en D9 (Lot 7, étape 2/4), reformaté au passage (mise en page
// éclatée d'origine, sans changement de logique) — co-rendu avec
// PilotageWorkspace sur /app/pilotage pour institution/administrateur,
// migré avec elle pour ne pas laisser la même page à moitié en D9.
import { Anchor, AlertTriangle, Fish, Handshake, Map, TrendingUp, UsersRound } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { generateNationalSnapshot } from "@/domain/national/national-engine";
import { Card, CardContent } from "@/components/ui/card";

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[#1d4468]">{icon}<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p></div>
        <p className="mt-3 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function NationalControlCenter({ state }: { state: ProductState }) {
  const snapshot = generateNationalSnapshot(state);

  return (
    <section className="space-y-5">
      <Card className="overflow-hidden border-none bg-sidebar text-sidebar-foreground shadow-lg">
        <CardContent className="p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Mbàmbulaan Sénégal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Intelligence territoriale nationale</h1>
          <p className="mt-3 max-w-3xl text-sidebar-foreground/65">Vision consolidée des territoires côtiers, des acteurs et des dynamiques de filière.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Map size={18} />} label="Territoires" value={snapshot.territories} />
        <Metric icon={<UsersRound size={18} />} label="Acteurs" value={snapshot.actors} />
        <Metric icon={<Fish size={18} />} label="Débarquements" value={snapshot.landings} />
        <Metric icon={<Handshake size={18} />} label="Coordinations" value={snapshot.coordinations} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<AlertTriangle size={18} />} label="Situations critiques" value={snapshot.criticalSituations} />
        <Metric icon={<Anchor size={18} />} label="Situations actives" value={snapshot.activeSituations} />
        <Metric icon={<TrendingUp size={18} />} label="Opportunités" value={snapshot.opportunities} />
      </div>
    </section>
  );
}
