"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TerritoryMap } from "@/components/territories/TerritoryMap";
import { useProduct } from "@/components/providers/ProductProvider";

export default function TerritoriesPage() {
  const { state } = useProduct();
  const [selected, setSelected] = useState("joal");
  if (!state) return null;
  return (
    <>
      <PageHeader eyebrow="Lecture territoriale" title="Territoires et points d’ancrage" description="Repérez les situations, infrastructures et prochaines actions par quai. La carte oriente vers les objets de travail, elle ne remplace pas les constats terrain." />
      <div className="p-5 lg:p-8"><TerritoryMap state={state} selectedId={selected} onSelect={setSelected} /></div>
    </>
  );
}
