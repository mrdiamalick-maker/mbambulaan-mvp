"use client";

import { BookOpenCheck, CheckCircle2, Download, Gauge, Lightbulb, Printer } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";

export default function ResultsPage() {
  const { state } = useProduct();
  if (!state) return null;
  const resolved = state.situations.filter((item) => item.status === "reglee" || item.status === "resultat");
  const consolidated = state.situations.filter((item) => item.trust === "consolidee");
  return (
    <>
      <PageHeader
        eyebrow="Mesure et capitalisation"
        title="Résultats & connaissances"
        description="La synthèse relie les résultats constatés, leurs éléments de confirmation et les pratiques réutilisables. Aucun chiffre n’est présenté comme statistique officielle."
        actions={<button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white"><Printer size={16} /> Imprimer la synthèse</button>}
      />
      <div className="space-y-8 p-5 lg:p-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <Metric label="Situations avec résultat" value={String(resolved.length)} detail="Résultat enregistré ou situation réglée" icon={CheckCircle2} tone="lagoon" />
          <Metric label="Informations consolidées" value={String(consolidated.length)} detail="Éléments recoupés et prêts à être partagés" icon={Gauge} />
          <Metric label="Pratiques réutilisables" value={String(state.learnings.length)} detail="Apprentissages reliés à leur situation d’origine" icon={Lightbulb} tone="sand" />
        </section>
        <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="surface p-5 lg:p-6"><p className="label">Résultats documentés</p><div className="mt-5 space-y-4">{resolved.map((item) => <article key={item.id} className="border-l-4 border-[#18a394] bg-[#f1faf7] p-4"><p className="text-xs font-bold text-[#126b58]">{item.reference}</p><h3 className="mt-1 font-bold">{item.title}</h3><p className="mt-3 text-sm">{item.result}</p><p className="mt-2 text-xs text-[#60737a]">Élément de confirmation : {item.confirmation}</p></article>)}</div></div>
          <div className="surface p-5 lg:p-6"><p className="label">Connaissances partagées</p><div className="mt-5 space-y-5">{state.learnings.map((item) => <article key={item.id}><BookOpenCheck className="text-[#087287]" size={20} /><h3 className="mt-3 font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">{item.summary}</p><p className="mt-3 text-xs font-semibold text-[#075466]">Réutilisable à : {item.reusableIn.map((id) => state.territories.find((territory) => territory.id === id)?.name).join(", ")}</p></article>)}</div></div>
        </section>
        <section className="border border-[#b9dfe4] bg-[#f4fbfc] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="label">Rapport de démonstration</p><h2 className="mt-2 text-lg font-bold">Continuité de la chaîne du froid · Petite-Côte</h2><p className="mt-2 text-sm text-[#60737a]">Synthèse imprimable construite à partir des objets visibles dans ce tenant.</p></div><button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 border border-[#9ecbd2] bg-white px-4 py-2.5 text-sm font-bold text-[#075466]"><Download size={16} /> Préparer le document</button></div>
        </section>
      </div>
    </>
  );
}
