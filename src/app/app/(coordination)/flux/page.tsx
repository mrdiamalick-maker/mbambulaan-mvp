"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { FluxExplorer } from "@/components/flux/FluxExplorer";

// LOT V3.3 (mandat "Flux / Dossiers & Convergence") — nouvelle destination
// dédiée, reprenant le pipeline réel déjà exposé par
// CoordinationWorkspace.tsx ("Messages entrants") sous la composition
// maître-détail Claude Design V3. L'ancien onglet reste inchangé (les 6
// autres onglets de cet outil — besoins/capacités/rapprochements/
// missions/demandes publiques/détections — sont hors mandat de ce lot) ;
// cette page devient la destination recommandée pour qualifier le flux
// entrant.
export default function FluxPage() {
  const { state, role, loading } = useProduct();
  if (!state || loading) return null;
  return <FluxExplorer state={state} role={role} />;
}
