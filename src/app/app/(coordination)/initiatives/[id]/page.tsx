"use client";

// /app/initiatives/[id] — LOT V3.5 ("Programme Portfolio & Cockpit",
// mandat §16, "must still be able to find a programme, open detail") :
// même composant que /app/initiatives (InitiativesWorkspace), avec l'id
// d'URL comme programme présélectionné dans ProgrammesExplorer — même
// architecture que /app/situations/[id] (V3.2, SituationsExplorer).
// Permet un lien profond direct et partageable vers un programme précis.
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { InitiativesWorkspace } from "@/components/programmes/InitiativesWorkspace";

export default function InitiativeDetailPage() {
  return (
    <Suspense fallback={null}>
      <InitiativeDetailPageContent />
    </Suspense>
  );
}

function InitiativeDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  return <InitiativesWorkspace programmeId={id} initialNeedId={searchParams.get("need")} initialOpportunityId={searchParams.get("opportunity")} />;
}
