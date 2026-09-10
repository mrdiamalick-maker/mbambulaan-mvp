"use client";

import { useProduct } from "@/components/providers/ProductProvider";
import { resolveCapabilities } from "@/domain/platform/access-resolver";
import type { PrivateSpace } from "@/domain/platform/private-nav";
import { PrivateShell } from "@/components/shell/PrivateShell";

// LOT V3.1 (Scope A) — connecteur données ↔ coquille unique pour tout
// l'espace privé. Avant ce lot, deux connecteurs séparés existaient :
// ce fichier (Coordinateur/Opérateur → AppShell) et
// src/components/institution/InstitutionProductShell.tsx (Espace État →
// InstitutionShell) — même rôle, deux implémentations qui divergeaient
// sans raison de fond (les deux lisent `state`/`actorId`/`persistence`/
// `error`/`loading`/`logout` depuis le même useProduct(), et calculent
// `unread` de la même façon). Fusionnés ici : `space` (fourni par le
// layout serveur qui monte ce composant, jamais un choix client — cf.
// src/app/app/etat/layout.tsx et src/app/app/(coordination)/layout.tsx)
// pilote les deux seules différences réelles qui restent : `unread` filtré
// sur le rôle EFFECTIF de la session côté Coordination (peut différer de
// "institution"), et l'affordance de réinitialisation démo, déjà proposée
// aux deux espaces désormais (PrivateHeader, Scope G).
export function ProductShell({ children, space }: { children: React.ReactNode; space: PrivateSpace }) {
  const { state, role, actorId, persistence, loading, error, reset, logout } = useProduct();
  const actor = state?.actors.find((item) => item.id === actorId);
  const capabilities = state && actor ? resolveCapabilities(state, actor.organizationId) : { modules: [], levels: {} };
  const organization = state?.organizations.find((item) => item.id === actor?.organizationId);
  const subscription = state?.subscriptions.find((item) => item.organizationId === organization?.id);
  const plan = state?.plans.find((item) => item.id === subscription?.planId);
  // unread — reprend le rôle CIBLE exact de chacun des deux anciens
  // connecteurs plutôt que le rôle de session brut : l'Espace État
  // comptait déjà, avant ce lot, les notifications adressées au rôle
  // "institution" même quand la session réelle était "administrateur" en
  // supervision (InstitutionProductShell.tsx) — comportement volontaire,
  // repris à l'identique pour ne pas faire disparaître ces notifications
  // pour un administrateur qui consulte l'Espace État.
  const unreadTargetRole = space === "etat" ? "institution" : role;
  const unread = state?.notifications.filter((item) => item.role === unreadTargetRole && !item.read).length ?? 0;

  return (
    <PrivateShell
      space={space}
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
    </PrivateShell>
  );
}
