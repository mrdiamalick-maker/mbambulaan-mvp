import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MapPinned, PackageCheck, ShoppingBasket, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { MbambulaanSignature } from "@/components/ui/MbambulaanSignature";
import { getPurchaseSummary, sharedPurchaseDemo } from "@/lib/mbambulaan/purchase-demo";

const need = sharedPurchaseDemo;
const summary = getPurchaseSummary(need);

export function MareyeurWorkView() {
  return (
    <>
      <PageHeader
        eyebrow="Approvisionnement"
        title="Trouver les bons lots et organiser l’enlèvement"
        description="Votre espace reprend les besoins exprimés dans le canal messaging et vous aide à comparer, décider et suivre l’enlèvement."
        actions={<Link href="/app/marches" className="btn-primary">Voir les lots <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <MbambulaanSignature
          title={`${need.needId} · ${summary.nextAction}`}
          detail={`${need.species} · ${need.quantityRange} · retrait à ${need.pickupSite}. Le canal messaging et l’espace professionnel utilisent le même besoin.`}
          points={[
            { label: need.deadline, position: 18, hot: true },
            { label: `${summary.proposalCount} propositions`, position: 52 },
            { label: summary.selected ? "Lot retenu" : "Décision attendue", position: 82, hot: !summary.selected }
          ]}
        />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><ShoppingBasket size={18} /><p className="label">Votre prochaine décision</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[var(--ink)]">{summary.nextAction}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Comparez seulement les propositions utiles selon la quantité, le lieu, l’heure, le prix et le niveau de confiance.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/marches" className="btn-accent">Comparer les propositions <ArrowRight size={16} /></Link>
              <Link href="/app/atlas" className="btn-secondary"><MapPinned size={16} /> Voir les lieux</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Votre besoin actif</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{need.species} · {need.quantityRange}</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Retrait :</strong> {need.pickupSite}</p>
              <p><strong className="text-[var(--ink)]">Échéance :</strong> {need.deadline}</p>
              <p><strong className="text-[var(--ink)]">État :</strong> {need.status}</p>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Besoins actifs" value="1" detail="À approvisionner" icon={ShoppingBasket} />
          <Metric label="Propositions reçues" value={String(summary.proposalCount)} detail="À comparer" icon={PackageCheck} tone="lagoon" />
          <Metric label="Décisions attendues" value={summary.selected ? "0" : "1"} detail="Avant l’échéance" icon={Clock3} tone="coral" />
          <Metric label="Enlèvements" value={summary.selected ? "1" : "0"} detail="À organiser" icon={Truck} tone="sand" />
        </section>

        <section className="surface overflow-hidden">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
            <div><p className="label">Propositions pour votre besoin</p><h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Comparer avant de s’engager</h2></div>
            <Link href="/app/marches" className="link-action">Voir tous les lots <ArrowRight size={15} /></Link>
          </div>
          <div className="space-y-3 p-5 lg:p-6">
            {need.proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{proposal.species} · {proposal.quantityKg} kg</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{proposal.id} · {proposal.site} · disponible à {proposal.availableAt}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${proposal.trust === "verifie" ? "bg-[var(--lagoon-100)] text-[var(--lagoon-600)]" : "bg-[var(--sand-100)] text-[var(--sand-500)]"}`}>
                    {proposal.trust === "verifie" ? "Information vérifiée" : "Information déclarée"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{proposal.pricePerKg.toLocaleString("fr-FR")} FCFA / kg</p>
                  <Link href="/app/marches" className="btn-secondary">Voir et décider</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
            <div>
              <p className="font-semibold text-[var(--ink)]">Même besoin, quel que soit le canal</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le messaging sert à exprimer le besoin ou répondre rapidement. Cet espace existant prend le relais pour comparer plusieurs propositions, décider, corriger et organiser l’enlèvement.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
