"use client";

// /app/initiatives — LOT 2 (mandat "Vertical Slice Kayar") a établi la
// composition amont-aval de cette page ; LOT V3.5 ("Programme Portfolio &
// Cockpit") extrait tout le contenu réel dans InitiativesWorkspace
// (components/programmes/), partagée avec /app/initiatives/[id] — même
// discipline que /app/situations et /app/situations/[id] (V3.2,
// SituationsExplorer). Cette page ne fait plus que lire ?need=/
// ?opportunity= (Lot 5, deep-link depuis le dossier territorial) —
// useSearchParams exige un Suspense (Next.js), même repli que /connexion.
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InitiativesWorkspace } from "@/components/programmes/InitiativesWorkspace";

export default function InitiativesPage() {
  return (
    <Suspense fallback={null}>
      <InitiativesPageContent />
    </Suspense>
  );
}

function InitiativesPageContent() {
  const searchParams = useSearchParams();
  return <InitiativesWorkspace initialNeedId={searchParams.get("need")} initialOpportunityId={searchParams.get("opportunity")} />;
}
