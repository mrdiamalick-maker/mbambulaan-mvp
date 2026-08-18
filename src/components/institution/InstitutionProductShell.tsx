"use client";

import { useEffect, useState } from "react";
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

  // Raffinement visuel /app/etat (mandat CEO 2026-08-18, maquette validée) :
  // cloche + horodatage réels, jamais les valeurs illustratives de la
  // maquette ("3", "08:30"). unread reprend exactement le mécanisme déjà
  // utilisé par ProductShell.tsx pour AppShell (state.notifications
  // filtrées par rôle + non lues) — pas un nouveau concept, la même
  // source de vérité, appliquée au rôle institution. lastRefreshedAt capture
  // le moment réel où les données ont été chargées (premier state non nul),
  // pas une heure fixe recopiée de la maquette.
  const unread = state?.notifications.filter((item) => item.role === "institution" && !item.read).length ?? 0;
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  useEffect(() => {
    if (state && !lastRefreshedAt) setLastRefreshedAt(new Date());
  }, [state, lastRefreshedAt]);

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
      unread={unread}
      lastRefreshedAt={lastRefreshedAt}
      onLogout={logout}
      error={error}
      showLoading={loading && !state}
    >
      {children}
    </InstitutionShell>
  );
}
