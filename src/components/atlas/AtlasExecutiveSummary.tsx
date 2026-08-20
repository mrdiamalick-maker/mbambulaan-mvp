"use client";

// Restylé en D9 (Lot 7, étape 2/4), reformaté au passage (mise en page
// éclatée d'origine, sans changement de logique) — co-rendu avec
// ProfessionalAtlasWorkspace sur /app/atlas, migré avec elle.
//
// Lot Atlas-A (propagation DA v2, mandat CEO 2026-08-20, arbitrage gap
// analysis /app/atlas) : les 4 grosses Card sont remplacées par la
// grammaire "chiffres inline" déjà appliquée juste en dessous, dans
// ProfessionalAtlasWorkspace lui-même (dossier territorial, "A12 —
// grille typographique... plus de mini-widgets à fond plein") — ce
// composant rattrape le fichier qu'il précède, pas l'inverse. Aucune
// donnée touchée, seul le patron visuel change. NumberTicker
// (magicui, déjà utilisé sur État/Rapport) réutilisé ici pour la même
// touche d'animation, purement visuelle.
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
// Note gap analysis (2026-08-20) : plus aucun appelant ne passe
// variant="institution" depuis son retrait de /app/etat — conservé tel
// quel ici (hors périmètre de ce lot, cf. gap analysis point 6), pas
// supprimé sans arbitrage dédié.
import { AlertTriangle, Anchor, Factory, Network } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { NumberTicker } from "@/components/magicui/number-ticker";

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-[#1d4468]">{icon}</div>
      <p className="mt-2 text-3xl font-bold tracking-tight"><NumberTicker value={value} /></p>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
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
      <section className="grid grid-cols-2 divide-x divide-y border-y sm:grid-cols-4 sm:divide-y-0">
        <Metric icon={<Anchor size={18} />} label="Territoires en vigilance/critique" value={territoiresEnTension.length} />
        <Metric icon={<AlertTriangle size={18} />} label="Situations à arbitrer" value={situationsAArbitrer.length} />
        <Metric icon={<Network size={18} />} label="Acteurs fiables" value={actors.length} />
        <Metric icon={<Factory size={18} />} label="Capacités fragiles" value={criticalCapacity.length} />
      </section>
    );
  }

  const openSituations = state.situations.filter((item) => item.status !== "reglee");
  return (
    <section className="grid grid-cols-2 divide-x divide-y border-y sm:grid-cols-4 sm:divide-y-0">
      <Metric icon={<Anchor size={18} />} label="Territoires" value={state.territories.length} />
      <Metric icon={<AlertTriangle size={18} />} label="Situations ouvertes" value={openSituations.length} />
      <Metric icon={<Network size={18} />} label="Acteurs fiables" value={actors.length} />
      <Metric icon={<Factory size={18} />} label="Capacités fragiles" value={criticalCapacity.length} />
    </section>
  );
}
