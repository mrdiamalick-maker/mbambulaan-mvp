"use client";

// UnifiedWorkView (capitaine/opérateur/mareyeur/transformateur/prestataire)
// retiré ici — passe de cohérence pré-Lot 6 (voir src/app/app/layout.tsx).
// Le capitaine a désormais sa propre entrée technique (/app/terrain, D9) ;
// opérateur/mareyeur/transformateur/prestataire n'ont pas d'expérience
// dédiée dans ce lot (hors périmètre — cf. plan d'exécution Lot 6, un seul
// rôle terrain) et retombent sur CoordinatorHub plutôt que sur une vue
// décorative retirée : un CoordinatorHub générique reste un vrai outil
// branché sur le state, pas une régression vers un écran cassé.
import { useProduct } from "@/components/providers/ProductProvider";
import { CoordinatorHub } from "@/components/work/CoordinatorHub";

export default function WorkPage() {
  const { state, role, actorId } = useProduct();

  if (!state) return null;

  return (
    <CoordinatorHub
      state={state}
      actorId={actorId}
      role={role}
    />
  );
}
