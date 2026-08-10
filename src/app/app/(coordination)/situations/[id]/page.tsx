"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <div className="p-8">
        <p>Situation introuvable.</p>
        <Link href="/app/situations">
          Revenir au registre
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={situation.reference}
        title={situation.title}
        description="Salle de coordination opérationnelle : contexte, décision, acteurs et mémoire de la situation."
        actions={
          <Link
            href="/app/situations"
            className="inline-flex items-center gap-2 border border-[#9ecbd2] px-4 py-2.5 text-sm font-bold text-[#075466]"
          >
            <ArrowLeft size={16} />
            Registre
          </Link>
        }
      />

      <SituationRoom
        situation={situation}
        state={state}
      />
    </>
  );
}