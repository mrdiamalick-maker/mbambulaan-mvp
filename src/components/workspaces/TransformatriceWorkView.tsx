import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Factory, PackageCheck, Snowflake, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { MbambulaanSignature } from "@/components/ui/MbambulaanSignature";
import { WorkFocus } from "@/components/work/WorkFocus";
import { getTransformationSummary, sharedTransformationDemo } from "@/lib/mbambulaan/transformation-demo";
import { landingWorkDemo } from "@/lib/mbambulaan/work-demo";

const plan = sharedTransformationDemo;
const summary = getTransformationSummary(plan);

export function TransformatriceWorkView() {
  return (
    <>
      <PageHeader
        eyebrow="Transformation"
        title="Sécuriser l’approvisionnement et préparer la production"
        description="Votre espace reprend le besoin exprimé dans le canal messaging et vous aide à sécuriser la matière, vérifier les moyens disponibles et lancer la production."
        actions={<Link href="/app/marches" className="btn-primary">Voir les options <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <WorkFocus work={landingWorkDemo} role="transformateur" />

        <MbambulaanSignature
          title={`${plan.planId} · ${summary.nextAction}`}
          detail={`${plan.product} · objectif ${plan.targetKg} kg · ${plan.unit}. Le canal messaging et l’espace professionnel utilisent le même plan de production.`}
          points={[
            { label: plan.requiredBy, position: 18, hot: summary.remainingKg > 0 },
            { label: `${summary.completionRate}% sécurisé`, position: 52 },
            { label: summary.remainingKg > 0 ? `${summary.remainingKg} kg manquants` : "Approvisionnement prêt", position: 82, hot: summary.remainingKg > 0 }
          ]}
        />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><Factory size={18} /><p className="label">Votre prochaine décision</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[var(--ink)]">{summary.nextAction}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Comparez seulement les options utiles selon le volume, l’heure, l’état du produit et le niveau de confiance, puis vérifiez que le froid et l’équipe sont prêts.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/marches" className="btn-accent">Comparer les options <ArrowRight size={16} /></Link>
              <Link href="/app/operations" className="btn-secondary">Préparer la production</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Votre production active</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{plan.product}</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Objectif :</strong> {plan.targetKg} kg</p>
              <p><strong className="text-[var(--ink)]">Déjà sécurisé :</strong> {plan.securedKg} kg</p>
              <p><strong className="text-[var(--ink)]">Échéance :</strong> {plan.requiredBy}</p>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Plans actifs" value="1" detail="À préparer" icon={Factory} />
          <Metric label="Volume sécurisé" value={`${plan.securedKg} kg`} detail={`${summary.completionRate}% de l’objectif`} icon={PackageCheck} tone="lagoon" />
          <Metric label="Volume manquant" value={`${summary.remainingKg} kg`} detail="À sécuriser avant l’échéance" icon={Clock3} tone="coral" />
          <Metric label="Moyens à vérifier" value={String(plan.constraints.length - 1)} detail="Froid et équipe" icon={Snowflake} tone="sand" />
        </section>

        <section className="surface overflow-hidden">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
            <div><p className="label">Options d’approvisionnement</p><h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Sécuriser la matière avant de lancer</h2></div>
            <Link href="/app/marches" className="link-action">Voir les disponibilités <ArrowRight size={15} /></Link>
          </div>
          <div className="space-y-3 p-5 lg:p-6">
            {plan.supplyOptions.map((option) => (
              <div key={option.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{option.species} · {option.quantityKg} kg</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{option.id} · {option.source} · disponible {option.availableAt}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${option.trust === "verifie" ? "bg-[var(--lagoon-100)] text-[var(--lagoon-600)]" : "bg-[var(--sand-100)] text-[var(--sand-500)]"}`}>
                    {option.trust === "verifie" ? "Information vérifiée" : "Information déclarée"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">État : {option.condition === "frais" ? "frais" : "réfrigéré"}</p>
                  <Link href="/app/marches" className="btn-secondary">Voir et décider</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface p-6">
            <div className="flex items-start gap-3">
              <Snowflake className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
              <div>
                <p className="font-semibold text-[var(--ink)]">Conditions de production</p>
                <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                  {plan.constraints.map((constraint) => <p key={constraint}>• {constraint}</p>)}
                </div>
              </div>
            </div>
          </div>
          <div className="surface p-6">
            <div className="flex items-start gap-3">
              <UsersRound className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
              <div>
                <p className="font-semibold text-[var(--ink)]">Même plan, quel que soit le canal</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le messaging sert à signaler un manque ou confirmer rapidement. Cet espace existant prend le relais pour comparer les options, vérifier les moyens, décider et suivre la production.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
            <div>
              <p className="font-semibold text-[var(--ink)]">Ce que cet espace évite</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Lancer une production sans matière suffisante, découvrir trop tard un manque de froid ou mobiliser l’équipe sans approvisionnement confirmé.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
