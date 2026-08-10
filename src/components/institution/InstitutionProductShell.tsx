"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { InstitutionShell } from "@/components/institution/InstitutionShell";

// Connecteur données ↔ coquille Institution — symétrique à
// src/components/shell/ProductShell.tsx (qui connecte AppShell), mais
// délibérément un composant séparé plutôt qu'un branchement conditionnel
// dans ProductShell : l'entrée technique de l'Espace État ne partage pas
// le code de composition du shell partagé (D9).
export function InstitutionProductShell({ children }: { children: React.ReactNode }) {
  const { state, actorId, persistence, loading, error } = useProduct();
  const actor = state?.actors.find((item) => item.id === actorId);
  const organization = state?.organizations.find((item) => item.id === actor?.organizationId);

  const logout = () => {
    void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/";
    });
  };

  return (
    <InstitutionShell
      orgName={organization?.name}
      actorName={actor?.name}
      persistence={persistence}
      onLogout={logout}
      error={error}
      showLoading={loading && !state}
    >
      {children}
    </InstitutionShell>
  );
}
