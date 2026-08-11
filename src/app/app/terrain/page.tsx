"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { TerrainCaptainView } from "@/components/terrain/TerrainCaptainView";

export default function TerrainPage() {
  const { state, actorId, role } = useProduct();
  if (!state) return null;

  // administrateur consulte cette entrée pour supervision (même garde que
  // TerrainLayout) mais n'a pas de sortie en mer à son nom — pas de vue
  // dédiée à construire pour ce mandat de supervision dans ce lot.
  if (role !== "capitaine") {
    return <p className="text-sm text-muted-foreground">Aperçu de supervision — connectez-vous avec un mandat capitaine pour voir l’expérience terrain complète.</p>;
  }

  return <TerrainCaptainView state={state} actorId={actorId} />;
}
