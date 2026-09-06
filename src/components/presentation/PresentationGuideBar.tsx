"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { usePresentationGuide } from "@/components/providers/PresentationGuideProvider";
import { presentationSteps } from "@/lib/presentation-guide";
import { Button } from "@/components/ui/button";

// Bandeau de présentation guidée (Lot 6, étape 3/4) : ne navigue jamais
// tout seul — « Suivant »/« Précédent » ne font que déplacer le repère
// dans le fil rouge, jamais une navigation automatique qui couperait une
// action en cours (ex. un formulaire de décision à moitié rempli). Le
// présentateur choisit quand suivre le lien proposé. Rendu une seule fois
// au niveau racine de /app (src/app/app/layout.tsx) pour rester visible
// en traversant Institution/Coordination/Terrain, trois coquilles
// techniquement distinctes (D9).
export function PresentationGuideBar() {
  const { active, stepIndex, exit, next, previous } = usePresentationGuide();
  const router = useRouter();
  const pathname = usePathname();

  // Le bandeau est fixe (position: fixed) — il flotterait au-dessus du
  // dernier contenu de chaque page sans cette marge, quelle que soit la
  // coquille traversée.
  useEffect(() => {
    document.body.style.paddingBottom = active ? "64px" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [active]);

  if (!active) return null;
  const step = presentationSteps[stepIndex];
  const onStep = pathname === step.href;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-sidebar text-sidebar-foreground shadow-[0_-8px_24px_rgba(0,0,0,.25)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">{stepIndex + 1}/{presentationSteps.length}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{step.title}</p>
          <p className="truncate text-xs text-sidebar-foreground/65">{step.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground" disabled={stepIndex === 0} onClick={previous} aria-label="Étape précédente"><ChevronLeft /></Button>
          {!onStep && (
            <Button size="sm" variant="secondary" onClick={() => router.push(step.href)}><MapPin size={14} /> Aller à cette étape</Button>
          )}
          <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground" disabled={stepIndex === presentationSteps.length - 1} onClick={next} aria-label="Étape suivante"><ChevronRight /></Button>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground" onClick={exit} aria-label="Quitter la présentation guidée"><X /></Button>
        </div>
      </div>
    </div>
  );
}
