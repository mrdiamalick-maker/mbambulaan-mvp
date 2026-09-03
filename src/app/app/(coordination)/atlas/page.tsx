"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées. Le poste de commande
// sombre de ProfessionalAtlasWorkspace.tsx reste tel quel (voir le
// commentaire de ce fichier) — seul l'habillage de cette page et
// d'AtlasExecutiveSummary change ici.
//
// XXL-R1 (§30, surface témoin D) — en-tête devenu PageIntro (§18.1) ;
// conteneur passé à mb-container-spatial (§11 — "spatial : Atlas/grandes
// visualisations", au lieu d'aucune largeur bornée). Aucune nouvelle
// géographie, aucun changement du moteur cartographique
// (ProfessionalAtlasWorkspace, inchangé sur le fond).
import { Suspense } from "react";
import { ProfessionalAtlasWorkspace } from "@/components/ecosystem/ProfessionalAtlasWorkspace";
import { AtlasExecutiveSummary } from "@/components/atlas/AtlasExecutiveSummary";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageIntro } from "@/components/foundations";

export default function AtlasPage() {
  const { state } = useProduct();
  if (!state) return null;

  return (
    <div className="shadcn-scope mb-container-spatial space-y-6 bg-background p-5 pb-16 lg:p-8">
      <PageIntro
        eyebrow="Atlas opérationnel professionnel"
        title="Observer la filière. Comprendre les dynamiques. Agir."
        dek="L’Atlas opérationnel relie territoires, acteurs, capacités, flux et situations pour transformer l’information en décision."
      />
      <AtlasExecutiveSummary state={state} />
      {/* XXL-R4 (§27-28, §38) — ProfessionalAtlasWorkspace lit désormais
          ?territoire= (useSearchParams) pour permettre un deep-link
          direct depuis l'Espace État/Aujourd'hui — Next.js exige un
          Suspense autour de tout composant client qui l'utilise, même
          discipline que /app/initiatives déjà. */}
      <Suspense fallback={null}>
        <ProfessionalAtlasWorkspace />
      </Suspense>
    </div>
  );
}
