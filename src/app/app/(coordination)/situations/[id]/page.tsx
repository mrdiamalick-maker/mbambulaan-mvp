"use client";

import { useParams } from "next/navigation";
import { useProduct } from "@/components/providers/ProductProvider";
import { SituationsExplorer } from "@/components/situations/SituationsExplorer";

// LOT V3.2 — même composant que /app/situations (SituationsExplorer),
// avec l'id d'URL comme situation présélectionnée : conserve intacts les
// 8+ liens profonds existants du Produit vers cette route (Territoires,
// Terrain, Atlas professionnel, Intelligence Feed, Pilotage, Communauté,
// Programmes) tout en offrant l'expérience maître-détail Claude Design V3
// — remplace l'ancien SituationRoom (retiré, superseded).
export default function SituationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, role, actorId, loading } = useProduct();
  if (!state || loading) return null;
  return <SituationsExplorer state={state} role={role} actorId={actorId} selectedId={id} />;
}
