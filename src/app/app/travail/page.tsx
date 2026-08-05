"use client";

import Link from "next/link";
import { ArrowRight, MapPinned, Target } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { MbambulaanSignature } from "@/components/ui/MbambulaanSignature";
import { SituationRow } from "@/components/situations/SituationRow";
import { UnifiedWorkView } from "@/components/work/UnifiedWorkView";
import { PrestataireWorkView } from "@/components/workspaces/PrestataireWorkView";
import { professionalSpaces } from "@/config/professional-spaces";
import type { ProductState, Role, Situation } from "@/domain/types";

function visibleSituations(state: ProductState, role: Role, actorId: string) {
  const actor = state.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);
  const inTerritory = (item: Situation) => territoryIds.size === 0 || territoryIds.has(item.territoryId);

  if (role === "administrateur" || role === "institution") return state.situations;
  if (role === "partenaire") {
    return state.situations.filter((item) => (item.visibility === "partenaires" || item.visibility === "publique") && Boolean(item.initiativeId));
  }
  return state.situations.filter(inTerritory);
}

export default function WorkPage() {
  const { state, role, actorId } = useProduct();
  if (!state) return null;

  if (role === "capitaine" || role === "operateur" || role === "mareyeur" || role === "transformateur") {
    return <UnifiedWorkView role={role} />;
  }
  if (role === "prestataire") return <PrestataireWorkView />;

  const space = professionalSpaces[role];
  const scopedSituations = visibleSituations(state, role, actorId);
  const open = scopedSituations.filter((item) => item.status !== "reglee");
  const critical = open.filter((item) => item.priority === "critique");
  const next = role === "partenaire"
    ? open.filter((item) => item.initiativeId)
    : [...critical, ...open.filter((item) => item.priority !== "critique")];
  const mainDecision = next[0]?.title ?? "Rien ne demande votre attention maintenant.";

  return (
    <>
      <PageHeader
        eyebrow={space.eyebrow}
        title={space.title}
        description={space.valuePromise}
        actions={<Link href={space.primaryAction.href} className="btn-primary">{space.primaryAction.label} <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <MbambulaanSignature
          title={critical.length > 0 ? `${critical.length} sujet${critical.length > 1 ? "s" : ""} prioritaire${critical.length > 1 ? "s" : ""}` : "Votre périmètre est stable"}
          detail="Cette vue montre uniquement ce qui demande une vue d’ensemble, une décision ou un suivi dans votre rôle."
          points={[
            { label: `${open.length} sujets en cours`, position: 18 },
            { label: `${next.length} à regarder`, position: 52 },
            { label: `${critical.length} prioritaire${critical.length > 1 ? "s" : ""}`, position: 82, hot: critical.length > 0 }
          ]}
        />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><Target size={18} /><p className="label">À faire maintenant</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[var(--ink)]">{mainDecision}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Vous ne voyez que les informations nécessaires à votre rôle, votre organisation et votre territoire.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={next[0] ? `/app/situations/${next[0].id}` : space.primaryAction.href} className="btn-accent">Ouvrir <ArrowRight size={16} /></Link>
              <Link href="/app/atlas" className="btn-secondary"><MapPinned size={16} /> Voir mon territoire</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Ce que cette vue vous apporte</p>
            <div className="mt-5 space-y-4">
              {space.outcomes.map((outcome, index) => (
                <div key={outcome} className="flex items-start gap-4 border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0">
                  <span className="text-2xl text-[var(--coral-600)]" style={{ fontFamily: "var(--mb-font-display)" }}>0{index + 1}</span>
                  <p className="pt-1 text-sm font-bold text-[var(--ink)]">{outcome}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-[var(--line)] px-6 py-5">
            <p className="label">À regarder</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Les sujets de votre périmètre</h2>
          </div>
          {next.length > 0
            ? next.slice(0, 5).map((item) => <SituationRow key={item.id} situation={item} state={state} />)
            : <p className="p-6 text-sm text-[var(--muted)]">Rien à faire maintenant.</p>}
        </section>
      </div>
    </>
  );
}
