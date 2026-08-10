"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { UnifiedWorkView } from "@/components/work/UnifiedWorkView";
import { CommandCenter } from "@/components/work/CommandCenter";

export default function WorkPage() {
  const { state, role, actorId } = useProduct();

  if (!state) return null;

  if (
    role === "capitaine" ||
    role === "operateur" ||
    role === "mareyeur" ||
    role === "transformateur" ||
    role === "prestataire"
  ) {
    return <UnifiedWorkView role={role} />;
  }

  return (
    <CommandCenter
      state={state}
      actorId={actorId}
    />
  );
}
