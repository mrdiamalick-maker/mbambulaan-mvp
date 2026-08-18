"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { TerrainShell } from "@/components/terrain/TerrainShell";

// Connecteur données ↔ coquille Terrain — symétrique à
// InstitutionProductShell.tsx (Espace État) et ProductShell.tsx
// (Coordinateur/Opérateur) : un composant séparé plutôt qu'un branchement
// conditionnel dans l'un des deux, l'entrée technique du Terrain mobile ne
// partage pas leur code de composition (D9).
export function TerrainProductShell({ children }: { children: React.ReactNode }) {
  const { state, actorId, loading, error } = useProduct();
  const actor = state?.actors.find((item) => item.id === actorId);

  const logout = () => {
    void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/";
    });
  };

  return (
    <TerrainShell actorName={actor?.name} onLogout={logout} error={error} showLoading={loading && !state}>
      {children}
    </TerrainShell>
  );
}
