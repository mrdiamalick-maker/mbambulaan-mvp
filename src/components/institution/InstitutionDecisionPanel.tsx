"use client";

// Restylé en D9 (Lot 7, étape 2/4), reformaté au passage (mise en page
// éclatée d'origine, sans changement de logique) — même raison que
// NationalControlCenter.tsx (co-rendu sur /app/pilotage).
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { generateInstitutionInsights } from "@/domain/institution/decision-engine";
import { Card, CardContent } from "@/components/ui/card";

export function InstitutionDecisionPanel({ state }: { state: ProductState }) {
  const insights = generateInstitutionInsights(state);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-[#1d4468]"><AlertTriangle size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priorités décisionnelles</p></div>
        <h2 className="mt-3 text-xl font-semibold">Où agir maintenant ?</h2>
        <div className="mt-5 space-y-4">
          {insights.slice(0, 5).map((item) => (
            <article key={item.territoryId + item.title} className="rounded-md border p-5">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase text-[#1d4468]">{item.territoryName}</p><h3 className="mt-2 font-semibold">{item.title}</h3></div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.explanation}</p>
              <p className="mt-3 text-sm font-semibold">Action : {item.action}</p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
