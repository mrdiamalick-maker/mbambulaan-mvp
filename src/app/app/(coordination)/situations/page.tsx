"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { SituationsExplorer } from "@/components/situations/SituationsExplorer";

// LOT V3.2 (mandat "Situations & Progressive Detail") — remplace l'ancien
// registre CRM-style (recherche + <select> de statut + liste de
// SituationRow, retirés) par SituationsExplorer, la surface d'ensemble
// Claude Design V3 (funnel, ancienneté, filtres, registre + détail
// progressif). Composant partagé avec /app/situations/[id] — cette page
// le monte sans situation présélectionnée.
export default function SituationsPage() {
  const { state, role, actorId, loading } = useProduct();
  if (!state || loading) return null;
  return <SituationsExplorer state={state} role={role} actorId={actorId} />;
}
