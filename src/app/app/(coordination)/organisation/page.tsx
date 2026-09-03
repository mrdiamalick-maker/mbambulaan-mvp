"use client";

// Restylé en D9 (Lot 7, étape 2/4) : PageHeader (sarcelle) abandonné pour
// un en-tête inline, comme les autres pages migrées.
import { Suspense } from "react";
import { OrganizationWorkspace } from "@/components/ecosystem/OrganizationWorkspace";

export default function OrganizationPage() {
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Réseau · habilitations · capacités</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Organisation &amp; réseau</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Identifiez les membres actifs, les responsabilités, les services mobilisables et les droits d’accès qui rendent la coordination possible.</p>
      </div>
      {/* XXL-R5 (§14, §33) — OrganizationWorkspace lit ?organisation= pour
          ouvrir un profil directement depuis un lien externe (Programmes) —
          Next.js exige un Suspense autour de tout composant client qui
          utilise useSearchParams, même discipline que /app/atlas (R4). */}
      <Suspense fallback={null}>
        <OrganizationWorkspace />
      </Suspense>
    </div>
  );
}
