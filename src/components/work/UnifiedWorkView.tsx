import Link from "next/link";
import { ArrowRight, MessageCircleMore, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkFocus } from "@/components/work/WorkFocus";
import { landingWorkDemo } from "@/lib/mbambulaan/work-demo";

type UnifiedRole = "capitaine" | "operateur" | "mareyeur" | "transformateur";

const roleCopy: Record<UnifiedRole, {
  eyebrow: string;
  title: string;
  description: string;
  messaging: string;
  workspace: string;
}> = {
  capitaine: {
    eyebrow: "Aujourd’hui",
    title: "Reprendre mon retour de pêche",
    description: "Le canal messaging sert aux réponses rapides. Cette vue s’ouvre seulement quand le travail demande un suivi, un désaccord ou plusieurs informations.",
    messaging: "Annoncer l’arrivée, répondre oui/non, demander de la glace, confirmer une pesée.",
    workspace: "Comprendre un désaccord, retrouver les étapes, consulter plusieurs sorties ou documents."
  },
  operateur: {
    eyebrow: "Aujourd’hui",
    title: "Organiser le prochain débarquement",
    description: "Le canal messaging confirme une information simple. Cette vue sert à arbitrer plusieurs arrivées, corriger une pesée ou gérer un blocage au quai.",
    messaging: "Confirmer une place, la glace, une heure ou partager un poids simple.",
    workspace: "Comparer plusieurs arrivées, résoudre un conflit de quai, corriger et suivre."
  },
  mareyeur: {
    eyebrow: "Aujourd’hui",
    title: "Décider sur mes achats en cours",
    description: "Le canal messaging suffit pour dire oui ou non. Cette vue sert à comparer plusieurs lots, organiser l’enlèvement et retrouver ce qui a été décidé.",
    messaging: "Exprimer une recherche, répondre à une proposition simple, demander un appel.",
    workspace: "Comparer plusieurs lots, vérifier les conditions, organiser et suivre l’enlèvement."
  },
  transformateur: {
    eyebrow: "Aujourd’hui",
    title: "Décider si ma production peut démarrer",
    description: "Le canal messaging sert à signaler un manque ou confirmer rapidement. Cette vue sert à sécuriser l’ensemble matière, froid, transport et équipe.",
    messaging: "Déclarer ce qui manque, répondre oui/non, confirmer que l’équipe est prête.",
    workspace: "Comparer les options, vérifier les moyens et décider de lancer la production."
  }
};

export function UnifiedWorkView({ role }: { role: UnifiedRole }) {
  const copy = roleCopy[role];

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <Link href={`/terrain/whatsapp?acteur=${role}`} className="btn-primary">
            <MessageCircleMore size={16} /> Répondre rapidement
          </Link>
        }
      />

      <div className="space-y-7 p-5 lg:p-8">
        <WorkFocus work={landingWorkDemo} role={role} />

        <section className="grid gap-5 md:grid-cols-2">
          <div className="surface p-6">
            <p className="label">Reste dans le messaging</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy.messaging}</p>
          </div>
          <div className="surface p-6">
            <p className="label">Continue dans ce travail</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy.workspace}</p>
          </div>
        </section>

        <section className="surface flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold text-[var(--ink)]">Un seul travail, quel que soit le canal</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Le rôle change ce qui est visible et possible, jamais l’objet suivi ni son historique.</p>
          </div>
          <Link href="/terrain/telephone" className="btn-secondary">
            <PhoneCall size={16} /> Demander un appel <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </>
  );
}
