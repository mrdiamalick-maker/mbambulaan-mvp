"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { TerrainShell } from "@/components/terrain/TerrainShell";

// Connecteur données ↔ coquille Terrain — symétrique à
// InstitutionProductShell.tsx (Espace État) et ProductShell.tsx
// (Coordinateur/Opérateur) : un composant séparé plutôt qu'un branchement
// conditionnel dans l'un des deux, l'entrée technique du Terrain mobile ne
// partage pas leur code de composition (D9).
export function TerrainProductShell({ children }: { children: React.ReactNode }) {
  const { state, actorId, loading, error, logout } = useProduct();
  const actor = state?.actors.find((item) => item.id === actorId);

  return (
    <TerrainShell actorName={actor?.name} onLogout={() => void logout()} error={error} showLoading={loading && !state}>
      {children}
    </TerrainShell>
  );
}
