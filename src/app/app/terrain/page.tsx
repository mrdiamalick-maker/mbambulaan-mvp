"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { TerrainCaptainView } from "@/components/terrain/TerrainCaptainView";
import { TerrainAgentView } from "@/components/terrain/TerrainAgentView";
import { TerrainSupervisorView } from "@/components/terrain/TerrainSupervisorView";

// LOT 3 (mandat "Terrain — observer, vérifier et fiabiliser la réalité",
// §2/§3) : Terrain n'est plus synonyme de "espace capitaine". Le rôle
// détermine l'expérience — capitaine garde exactement TerrainCaptainView
// (Acteur de la filière, inchangé), operateur porte la nouvelle Fonction
// Terrain Mbàmbulaan ("vos missions terrain aujourd'hui"), administrateur
// obtient une vraie vue de supervision (plus le message "reconnectez-vous
// en capitaine").
export default function TerrainPage() {
  const { state, actorId, role } = useProduct();
  if (!state) return null;

  if (role === "capitaine") return <TerrainCaptainView state={state} actorId={actorId} />;
  if (role === "operateur") return <TerrainAgentView state={state} actorId={actorId} />;
  if (role === "administrateur") return <TerrainSupervisorView state={state} />;

  return <p className="text-sm text-muted-foreground">Aperçu de supervision — connectez-vous avec un mandat capitaine, terrain ou administrateur pour voir l’expérience complète.</p>;
}
