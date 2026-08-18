"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées.
//
// Lot A, Audit DA Premium XXL v2 (gap analysis Pilotage, CEO 2026-08-17) :
// InstitutionDecisionPanel retiré — son contenu ("Où agir maintenant ?",
// situations critiques/attention non filtrées par le périmètre de la
// page) faisait doublon avec la section "Décisions attendues" de
// PilotageWorkspace (situations critiques, elle bien filtrée par
// territoire/période) — exactement la redondance de "bonnes briques"
// pointée par le mandat. Un seul moteur de décision maintenant, dans
// PilotageWorkspace, cohérent avec les filtres de la page plutôt que
// deux lectures parallèles légèrement différentes. Fichier
// components/institution/InstitutionDecisionPanel.tsx supprimé avec ce
// lot — plus aucun appelant après ce retrait (vérifié).
//
// role === "institution" dans nationalReading reste un garde mort (ce
// rôle est redirigé hors de tout le groupe (coordination) par
// src/app/app/(coordination)/layout.tsx, jamais atteint ici) — même
// nature que le "capitaine" retiré d'AppSidebar.tsx au Lot 2, laissé tel
// quel : hors périmètre de ce lot, aucun risque.
import { PilotageWorkspace } from "@/components/ecosystem/PilotageWorkspace";
import { NationalControlCenter } from "@/components/national/NationalControlCenter";
import { useProduct } from "@/components/providers/ProductProvider";

export default function SteeringPage() {
  const { state, role } = useProduct();
  const nationalReading = role === "institution" || role === "administrateur";

  return (
    <div className="shadcn-scope space-y-8 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Situation · programmes · résultats · décision</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Pilotage de la filière</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">La lecture nationale, les arbitrages, les indicateurs et les rapports utilisent les mêmes territoires, sources et limites que les opérations.</p>
      </div>
      {state && nationalReading ? <NationalControlCenter state={state} /> : null}
      <PilotageWorkspace />
    </div>
  );
}
