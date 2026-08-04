import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPinned, ShoppingBasket, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkFocus } from "@/components/work/WorkFocus";
import { getPurchaseSummary, sharedPurchaseDemo } from "@/lib/mbambulaan/purchase-demo";
import { landingWorkDemo } from "@/lib/mbambulaan/work-demo";

const need = sharedPurchaseDemo;
const summary = getPurchaseSummary(need);

export function MareyeurWorkView() {
  const requiresWorkspace = summary.proposalCount > 1 || Boolean(summary.selected);

  return (
    <>
      <PageHeader
        eyebrow="Mes achats"
        title="Comparer les lots utiles et préparer le retrait"
        description="Le canal messaging suffit pour dire ce que vous cherchez et répondre à une proposition simple. Cet espace sert uniquement quand il faut comparer, choisir ou organiser le retrait."
        actions={<Link href="/app/marches" className="btn-primary">Comparer les lots <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <WorkFocus work={landingWorkDemo} role="mareyeur" />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><ShoppingBasket size={18} /><p className="label">À faire maintenant</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[var(--ink)]">{summary.nextAction}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {requiresWorkspace
                ? "Plusieurs éléments doivent être comparés avant de choisir : quantité, lieu, heure, prix et fiabilité de l’information."
                : "Une réponse simple peut rester dans le canal messaging. Revenez ici seulement si vous devez comparer ou organiser le retrait."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/marches" className="btn-accent">Comparer les lots <ArrowRight size={16} /></Link>
              <Link href="/app/atlas" className="btn-secondary"><MapPinned size={16} /> Voir les lieux</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Ce que vous cherchez</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{need.species} · {need.quantityRange}</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Retrait :</strong> {need.pickupSite}</p>
              <p><strong className="text-[var(--ink)]">Pour :</strong> {need.deadline}</p>
              <p><strong className="text-[var(--ink)]">Choix :</strong> {summary.selected ? "un lot est retenu" : "pas encore fait"}</p>
            </div>
          </aside>
        </section>

        <section className="surface overflow-hidden">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
            <div>
              <p className="label">Lots qui correspondent</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Comparer avant de choisir</h2>
            </div>
            <Link href="/app/marches" className="link-action">Voir tous les lots <ArrowRight size={15} /></Link>
          </div>

          <div className="space-y-3 p-5 lg:p-6">
            {need.proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{proposal.species} · {proposal.quantityKg} kg</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{proposal.site} · disponible à {proposal.availableAt}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${proposal.trust === "verifie" ? "bg-[var(--lagoon-100)] text-[var(--lagoon-600)]" : "bg-[var(--sand-100)] text-[var(--sand-500)]"}`}>
                    {proposal.trust === "verifie" ? "Vérifié" : "Déclaré"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-sm)] bg-[var(--sand-100)] p-3">
                    <p className="text-xs text-[var(--muted)]">Prix</p>
                    <p className="mt-1 font-semibold text-[var(--ink)]">{proposal.pricePerKg.toLocaleString("fr-FR")} FCFA / kg</p>
                  </div>
                  <div className="rounded-[var(--radius-sm)] bg-[var(--sand-100)] p-3">
                    <p className="text-xs text-[var(--muted)]">Retrait</p>
                    <p className="mt-1 font-semibold text-[var(--ink)]">{proposal.site} · {proposal.availableAt}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs leading-5 text-[var(--muted)]">Répondez dans le messaging si ce lot suffit. Ouvrez le détail seulement pour comparer ou organiser le retrait.</p>
                  <Link href="/app/marches" className="btn-secondary">Voir le détail</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
              <div>
                <p className="font-semibold text-[var(--ink)]">Dans le messaging</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Dire ce que vous cherchez, accepter ou refuser une seule proposition, demander un appel.</p>
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
              <div>
                <p className="font-semibold text-[var(--ink)]">Dans cet espace</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Comparer plusieurs lots, choisir, corriger une décision et organiser le retrait.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
