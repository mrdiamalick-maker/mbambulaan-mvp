import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircleMore, PhoneCall, ShipWheel } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkFocus } from "@/components/work/WorkFocus";
import { sharedArrivalDemo } from "@/lib/mbambulaan/arrival-demo";
import { landingWorkDemo } from "@/lib/mbambulaan/work-demo";

const arrival = sharedArrivalDemo;

export function CapitaineWorkView() {
  const pendingChecks = arrival.needs.filter((need) => arrival.ready[need] === null);
  const hasException = arrival.captainDecision === "contesté" || pendingChecks.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Ma sortie"
        title="Voir où en est mon retour"
        description="Les réponses simples restent dans le canal messaging. Cet espace sert seulement à vérifier un désaccord, retrouver ce qui s’est passé ou suivre plusieurs sujets."
        actions={<Link href="/terrain/whatsapp?acteur=capitaine" className="btn-primary"><MessageCircleMore size={16} /> Répondre rapidement</Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <WorkFocus work={landingWorkDemo} role="capitaine" />

        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="surface p-6">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><ShipWheel size={18} /><p className="label">À vérifier ici</p></div>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{hasException ? "Un point demande votre attention" : "Aucun problème à traiter dans l’espace professionnel"}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {arrival.captainDecision === "contesté"
                ? "La pesée doit être revue avec le quai. Ce cas nécessite l’historique et les informations du débarquement."
                : pendingChecks.length > 0
                  ? `${pendingChecks.join(", ")} : le quai n’a pas encore confirmé ces éléments.`
                  : "L’heure d’arrivée, les besoins simples et la confirmation de pesée peuvent rester dans le canal messaging."}
            </p>
            {hasException && <Link href="/app/operations" className="btn-accent mt-5">Ouvrir le détail <ArrowRight size={16} /></Link>}
          </div>

          <aside className="surface p-6">
            <p className="label">Canal recommandé</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[var(--radius-md)] bg-[var(--sand-100)] p-4">
                <p className="font-semibold text-[var(--ink)]">Messaging</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Annoncer le retour, confirmer l’arrivée, répondre oui/non, envoyer une photo.</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--sand-100)] p-4">
                <p className="font-semibold text-[var(--ink)]">Espace professionnel</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Désaccord de pesée, plusieurs sorties, documents ou suivi détaillé.</p>
              </div>
              <Link href="/terrain/telephone" className="btn-secondary w-full justify-center"><PhoneCall size={16} /> Demander un appel</Link>
            </div>
          </aside>
        </section>

        <section className="surface p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
            <div>
              <p className="font-semibold text-[var(--ink)]">Une seule arrivée, quel que soit le canal</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le canal messaging et cet espace reprennent la même arrivée {arrival.arrivalId}. Aucune information n’est ressaisie.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
