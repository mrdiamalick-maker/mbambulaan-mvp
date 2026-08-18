"use client";

// Restylé en D9 (Lot 4, étape 2/4). Les 8 statuts de SituationStatus,
// dans l'ordre du cycle de vie (domain/types.ts) — corrigé au Lot 4
// étape 1 : "attente" manquait, une situation bloquée n'affichait
// alors aucune étape active (currentIndex = -1).
import { CheckCircle2, Circle } from "lucide-react";
import type { SituationStatus } from "@/domain/types";
import { Card, CardContent } from "@/components/ui/card";

const steps: Array<{ id: SituationStatus; label: string }> = [
  { id: "recue", label: "Signal reçu" },
  { id: "qualification", label: "Qualification" },
  { id: "priorisee", label: "Priorisation" },
  { id: "coordination", label: "Coordination" },
  { id: "intervention", label: "Intervention" },
  { id: "attente", label: "En attente" },
  { id: "resultat", label: "Résultat" },
  { id: "reglee", label: "Réglée" }
];

export function SituationTimeline({ status }: { status: SituationStatus }) {
  const currentIndex = steps.findIndex((step) => step.id === status);

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trajectoire opérationnelle</p>
        <div className="mt-4 flex flex-wrap items-center gap-1">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${index === currentIndex ? "border-primary/30 bg-primary/[0.06]" : "border-transparent"}`}>
                {index <= currentIndex ? <CheckCircle2 size={15} className="text-[#1d8a5f]" /> : <Circle size={15} className="text-muted-foreground/40" />}
                <p className={`text-xs ${index === currentIndex ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
