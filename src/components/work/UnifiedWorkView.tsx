import Link from "next/link";
import { ArrowRight, MessageCircleMore, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkFocus } from "@/components/work/WorkFocus";
import { landingWorkDemo, type WorkRole } from "@/lib/mbambulaan/work-demo";

const roleCopy: Record<WorkRole, {
  title: string;
  description: string;
  quickChannel: string;
  detailedView: string;
}> = {
  capitaine: {
    title: "Reprendre mon retour de pêche",
    description: "Les réponses courtes passent par le moyen disponible. Cette vue apparaît seulement lorsqu’un désaccord, plusieurs sorties ou des informations liées doivent être suivis ensemble.",
    quickChannel: "Annoncer l’arrivée, demander de la glace, répondre oui ou non, confirmer une pesée.",
    detailedView: "Comprendre un désaccord, retrouver les étapes et consulter plusieurs sorties ou documents."
  },
  operateur: {
    title: "Organiser le prochain débarquement",
    description: "Une confirmation simple reste dans le canal rapide. Cette vue sert à arbitrer plusieurs arrivées, corriger une pesée ou résoudre un blocage au quai.",
    quickChannel: "Confirmer une place, la glace, une heure ou partager un poids simple.",
    detailedView: "Comparer plusieurs arrivées, résoudre un conflit de quai, corriger et suivre."
  },
  mareyeur: {
    title: "Décider sur mes achats en cours",
    description: "Dire oui ou non ne nécessite pas d’ouvrir Mbàmbulaan. Cette vue sert à comparer plusieurs lots, organiser l’enlèvement et retrouver les décisions déjà prises.",
    quickChannel: "Exprimer une recherche, répondre à une proposition simple ou demander un appel.",
    detailedView: "Comparer plusieurs lots, vérifier les conditions et organiser l’enlèvement."
  },
  transformateur: {
    title: "Décider si ma production peut démarrer",
    description: "Signaler un manque ou confirmer que l’équipe est prête reste simple. Cette vue sert à réunir matière, froid, transport et équipe avant de décider.",
    quickChannel: "Déclarer ce qui manque, répondre oui ou non, confirmer que l’équipe est prête.",
    detailedView: "Comparer les options, vérifier les moyens et décider de lancer la production."
  },
  prestataire: {
    title: "Répondre sans promettre deux fois la même capacité",
    description: "Une disponibilité ou une réponse simple reste dans le canal rapide. Cette vue s’ouvre seulement lorsque plusieurs demandes se chevauchent ou qu’un planning doit être arbitré.",
    quickChannel: "Dire disponible, accepter ou refuser, prévenir d’un retard et demander un appel.",
    detailedView: "Comparer plusieurs demandes, résoudre un conflit de capacité et organiser l’exécution."
  }
};

export function UnifiedWorkView({ role }: { role: WorkRole }) {
  const copy = roleCopy[role];

  return (
    <>
      <PageHeader
        eyebrow="Aujourd’hui"
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
            <p className="label">Reste simple</p>
            <p className="mt-3 text-sm leading-6 text-[var(--legacy-muted)]">{copy.quickChannel}</p>
          </div>
          <div className="surface p-6">
            <p className="label">Nécessite cette vue</p>
            <p className="mt-3 text-sm leading-6 text-[var(--legacy-muted)]">{copy.detailedView}</p>
          </div>
        </section>

        <section className="surface flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold text-[var(--ink)]">La même activité, quel que soit le moyen de communication</p>
            <p className="mt-1 text-sm text-[var(--legacy-muted)]">Le rôle change uniquement les informations visibles, la décision attendue et l’action autorisée.</p>
          </div>
          <Link href="/terrain/telephone" className="btn-secondary">
            <PhoneCall size={16} /> Demander un appel <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </>
  );
}
