"use client";

// Restylé en D9 (Lot 4, étape 2/4) : SituationRoom porte désormais son
// propre en-tête (titre, statuts, badges) — PageHeader (palette
// sarcelle) n'a plus de raison d'être ici, seul un lien de retour
// minimal reste nécessaire.
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import { SituationRoom } from "@/components/situations/SituationRoom";

export default function SituationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useProduct();

  if (!state) return null;

  const situation = state.situations.find(
    (item) => item.id === id
  );

  if (!situation) {
    return (
      <div className="shadcn-scope space-y-4 bg-background p-5 pb-16 lg:p-8">
        <p className="text-sm text-muted-foreground">Situation introuvable.</p>
        <Button variant="outline" asChild><Link href="/app/situations"><ArrowLeft /> Revenir au registre</Link></Button>
      </div>
    );
  }

  return (
    <div className="shadcn-scope space-y-4 bg-background p-5 pb-16 lg:p-8">
      <Button variant="ghost" size="sm" asChild><Link href="/app/situations"><ArrowLeft /> Registre</Link></Button>
      <SituationRoom situation={situation} state={state} />
    </div>
  );
}
