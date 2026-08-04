import Link from "next/link";
import { ArrowRight, CheckCircle2, Factory, Snowflake, Truck, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkFocus } from "@/components/work/WorkFocus";
import { getTransformationSummary, sharedTransformationDemo } from "@/lib/mbambulaan/transformation-demo";
import { landingWorkDemo } from "@/lib/mbambulaan/work-demo";

const plan = sharedTransformationDemo;
const summary = getTransformationSummary(plan);

export function TransformatriceWorkView() {
  return (
    <>
      <PageHeader
        eyebrow="Production"
        title="Décider si la production peut réellement démarrer"
        description="Le canal messaging sert aux confirmations simples. Cet espace est réservé aux arbitrages qui demandent de comparer plusieurs approvisionnements, vérifier le froid, le transport et l’équipe."
        actions={<Link href="/app/marches" className="btn-primary">Comparer les approvisionnements <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <WorkFocus work={landingWorkDemo} role="transformateur" />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><Factory size={18} /><p className="label">Décision à prendre</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[var(--ink)]">{summary.remainingKg > 0 ? `Sécuriser encore ${summary.remainingKg} kg avant de lancer` : "Confirmer le démarrage de la production"}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Ici, la transformatrice ne répète pas ce qu’elle a déjà confirmé dans le messaging. Elle compare les options, vérifie les contraintes et décide si la production peut démarrer sans risque.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/marches" className="btn-accent">Comparer les options <ArrowRight size={16} /></Link>
              <Link href="/app/operations" className="btn-secondary">Vérifier les moyens</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Production concernée</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{plan.product}</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Objectif :</strong> {plan.targetKg} kg</p>
              <p><strong className="text-[var(--ink)]">Déjà disponible :</strong> {plan.securedKg} kg</p>
              <p><strong className="text-[var(--ink)]">À obtenir :</strong> {summary.remainingKg} kg</p>
              <p><strong className="text-[var(--ink)]">Avant :</strong> {plan.requiredBy}</p>
            </div>
          </aside>
        </section>

        <section className="surface overflow-hidden">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
            <div><p className="label">À comparer ici</p><h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Les options qui changent réellement la décision</h2></div>
            <Link href="/app/marches" className="link-action">Voir toutes les options <ArrowRight size={15} /></Link>
          </div>
          <div className="space-y-3 p-5 lg:p-6">
            {plan.supplyOptions.map((option) => (
              <div key={option.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{option.species} · {option.quantityKg} kg</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{option.source} · disponible {option.availableAt}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${option.trust === "verifie" ? "bg-[var(--lagoon-100)] text-[var(--lagoon-600)]" : "bg-[var(--sand-100)] text-[var(--sand-500)]"}`}>
                    {option.trust === "verifie" ? "Vérifié" : "Déclaré"}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
                  <p><strong className="text-[var(--ink)]">État :</strong> {option.condition === "frais" ? "Frais" : "Réfrigéré"}</p>
                  <p><strong className="text-[var(--ink)]">Transport :</strong> à organiser</p>
                  <p><strong className="text-[var(--ink)]">Décision :</strong> à prendre ici</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="surface p-6">
            <Snowflake className="text-[var(--lagoon-600)]" size={20} />
            <p className="mt-3 font-semibold text-[var(--ink)]">Froid</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Vérifier que la capacité disponible couvre l’attente et la production.</p>
          </div>
          <div className="surface p-6">
            <Truck className="text-[var(--lagoon-600)]" size={20} />
            <p className="mt-3 font-semibold text-[var(--ink)]">Transport</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Arbitrer l’heure d’enlèvement, le lieu et le risque de retard.</p>
          </div>
          <div className="surface p-6">
            <UsersRound className="text-[var(--lagoon-600)]" size={20} />
            <p className="mt-3 font-semibold text-[var(--ink)]">Équipe</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Confirmer que l’équipe est mobilisable au moment où la matière arrive.</p>
          </div>
        </section>

        <section className="surface p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
            <div>
              <p className="font-semibold text-[var(--ink)]">Séparation claire des canaux</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Messaging : dire ce qui manque, répondre oui/non, demander un appel. Espace professionnel : comparer plusieurs options, vérifier les moyens et décider de lancer ou reporter la production.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
