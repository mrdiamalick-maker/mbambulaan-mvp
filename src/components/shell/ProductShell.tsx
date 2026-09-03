"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { resolveCapabilities } from "@/domain/platform/access-resolver";
import { AppShell } from "@/components/shell/AppShell";

// Coquille partagée par tout l'espace professionnel — coordination
// opérationnelle et Espace État compris. Un seul système (shadcn/ui,
// voir src/components/ui) plutôt que deux chromes qui divergent : le
// contenu change selon le rôle et la route, pas l'ossature.
export function ProductShell({ children }: { children: React.ReactNode }) {
  const { state, role, actorId, persistence, loading, error, reset, logout } = useProduct();
  const actor = state?.actors.find((item) => item.id === actorId);
  const capabilities = state && actor ? resolveCapabilities(state, actor.organizationId) : { modules: [], levels: {} };
  const organization = state?.organizations.find((item) => item.id === actor?.organizationId);
  const subscription = state?.subscriptions.find((item) => item.organizationId === organization?.id);
  const plan = state?.plans.find((item) => item.id === subscription?.planId);
  const unread = state?.notifications.filter((item) => item.role === role && !item.read).length ?? 0;

  return (
    <AppShell
      role={role}
      modules={capabilities.modules}
      orgName={organization?.name}
      planName={plan?.name}
      actorName={actor?.name}
      unread={unread}
      persistence={persistence}
      onReset={persistence === "memoire_locale_demo" ? () => void reset() : undefined}
      onLogout={() => void logout()}
      error={error}
      showLoading={loading && !state}
    >
      {children}
    </AppShell>
  );
}
