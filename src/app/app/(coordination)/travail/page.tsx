"use client";

// Routage par mandat (Lot 7, étape 1/4) : depuis le retrait
// d'UnifiedWorkView (Lot 6), opérateur/mareyeur/transformateur/
// prestataire retombaient tous sur CoordinatorHub, pensé pour un
// coordinateur territorial (situation-first) — pas pour leurs mandats
// respectifs. D9 (PRODUCT_DECISION_LOG.md) nomme l'opérateur comme
// légitime dans AppShell ; mareyeur/transformateur/prestataire n'y sont
// pas explicitement statués mais suivent le même principe plutôt que de
// rouvrir une nouvelle coquille pour chacun (choix CEO). Le capitaine a
// sa propre entrée technique dédiée (/app/terrain, D9) depuis le Lot 6.
import { useProduct } from "@/components/providers/ProductProvider";
import { CoordinatorHub } from "@/components/work/CoordinatorHub";
import { OperatorTaskView } from "@/components/work/OperatorTaskView";
import { BuyerTaskView } from "@/components/work/BuyerTaskView";
import { ProviderTaskView } from "@/components/work/ProviderTaskView";

export default function WorkPage() {
  const { state, role, actorId } = useProduct();

  if (!state) return null;

  if (role === "operateur") return <OperatorTaskView state={state} actorId={actorId} />;
  if (role === "mareyeur" || role === "transformateur") return <BuyerTaskView state={state} actorId={actorId} role={role} />;
  if (role === "prestataire") return <ProviderTaskView state={state} actorId={actorId} />;

  return (
    <CoordinatorHub
      state={state}
      actorId={actorId}
      role={role}
    />
  );
}
