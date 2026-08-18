"use client";

// Restylé en D9 (Lot 7, étape 2/4), reformaté au passage (mise en page
// éclatée d'origine, sans changement de logique) — co-rendu avec
// ProfessionalAtlasWorkspace sur /app/atlas, migré avec elle.
//
// variant="institution" (P2, arbitrage CEO du 2026-08-12) : même
// composant, mêmes 4 tuiles, mais 2 métriques recadrées pour l'Espace
// État plutôt que dupliquées dans un second composant — "Territoires en
// vigilance/critique" et "Situations à arbitrer" reprennent le
// vocabulaire déjà en place sur etat/page.tsx (arbitrage, priorité) au
// lieu des libellés génériques du Coordinateur ("Territoires" brut,
// "Situations ouvertes"). Respecte D9 (Institution reste decision-first,
// pas une redite du Coordinateur) sans dupliquer la logique de calcul :
// un seul fichier, un prop, pas un second composant à maintenir en
// parallèle. "Acteurs fiables"/"Capacités fragiles" ne sont pas
// itemisés dans l'arbitrage — restent identiques dans les deux variantes.
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

export function AtlasExecutiveSummary({ state, variant = "coordinateur" }: { state: ProductState; variant?: "coordinateur" | "institution" }) {
  const criticalCapacity = state.infrastructures.filter((item) => item.status !== "operationnelle");
  const actors = state.actors.filter((item) => item.verified);

  if (variant === "institution") {
    // Même filtre que situationsAArbitrer dans etat/page.tsx (priorité
    // critique ou haute, dossier non réglé), sans le .slice(0, 5) qui n'a
    // de sens que pour l'affichage d'une liste — ici c'est un total.
    const territoiresEnTension = state.territories.filter((item) => item.activity === "vigilance" || item.activity === "critique");
    const situationsAArbitrer = state.situations.filter((item) => item.status !== "reglee" && (item.priority === "critique" || item.priority === "haute"));
    return (
      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Anchor size={18} />} label="Territoires en vigilance/critique" value={String(territoiresEnTension.length)} />
        <Metric icon={<AlertTriangle size={18} />} label="Situations à arbitrer" value={String(situationsAArbitrer.length)} />
        <Metric icon={<Network size={18} />} label="Acteurs fiables" value={String(actors.length)} />
        <Metric icon={<Factory size={18} />} label="Capacités fragiles" value={String(criticalCapacity.length)} />
      </section>
    );
  }

  const openSituations = state.situations.filter((item) => item.status !== "reglee");
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Metric icon={<Anchor size={18} />} label="Territoires" value={String(state.territories.length)} />
      <Metric icon={<AlertTriangle size={18} />} label="Situations ouvertes" value={String(openSituations.length)} />
      <Metric icon={<Network size={18} />} label="Acteurs fiables" value={String(actors.length)} />
      <Metric icon={<Factory size={18} />} label="Capacités fragiles" value={String(criticalCapacity.length)} />
    </section>
  );
}
