"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { DataSourcesRegistry } from "@/components/etat/DataSourcesRegistry";

// LOT V3.7 ("Arbitrages / Sources") — nouvelle destination de l'Espace
// État, dernier des 8 écrans du plan V3 à ne pas avoir eu de lot dédié.
// Aucune route équivalente n'existait avant ce lot (vérifié par recherche
// explicite : aucun fichier "*source*" sous src/app/app avant ce lot).
export default function SourcesPage() {
  const { state, loading } = useProduct();
  if (!state || loading) return null;
  return <DataSourcesRegistry state={state} />;
}
