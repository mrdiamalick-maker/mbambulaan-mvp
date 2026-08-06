import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircleMore, PhoneCall, Snowflake } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServiceCapacitySummary, sharedServiceCapacityDemo } from "@/lib/mbambulaan/service-capacity-demo";

const capacity = sharedServiceCapacityDemo;
const summary = getServiceCapacitySummary(capacity);
const accepted = capacity.requests.filter((request) => request.status === "acceptee");
const hasConflictRisk = summary.pendingRequests.length > 1;

export function PrestataireWorkView() {
  return (
    <>
      <PageHeader
        eyebrow="Mes services"
        title="Décider sans promettre deux fois la même capacité"
        description="Une disponibilité simple ou une réponse oui/non reste dans le canal messaging. Cet espace sert à comparer plusieurs demandes, organiser le planning et retrouver ce qui a été accepté."
        actions={<Link href="/terrain/whatsapp?acteur=prestataire" className="btn-primary"><MessageCircleMore size={16} /> Répondre rapidement</Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><Snowflake size={18} /><p className="label">À faire maintenant</p></div>
            <h2 className="mt-3 text-3xl font-black text-[var(--ink)]">{hasConflictRisk ? "Comparer les demandes avant de répondre" : summary.nextAction}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {hasConflictRisk
                ? `${summary.pendingRequests.length} demandes utilisent la même capacité de ${capacity.service.toLowerCase()}. Vérifiez les horaires et les quantités avant d’accepter.`
                : "Une réponse simple peut rester dans le canal messaging. Ouvrez cet espace seulement si plusieurs demandes se chevauchent ou si vous devez organiser l’exécution."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/services" className="btn-accent">Comparer les demandes <ArrowRight size={16} /></Link>
              <Link href="/terrain/telephone" className="btn-secondary"><PhoneCall size={16} /> Demander un appel</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Capacité concernée</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{capacity.service} · {capacity.availableQuantity}</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Lieu :</strong> {capacity.site}</p>
              <p><strong className="text-[var(--ink)]">Disponible :</strong> {capacity.availableFrom}</p>
              <p><strong className="text-[var(--ink)]">Jusqu’à :</strong> {capacity.availableUntil}</p>
            </div>
          </aside>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-[var(--line)] px-6 py-5">
            <p className="label">Demandes à comparer</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Même capacité, plusieurs demandes</h2>
          </div>
          <div className="space-y-3 p-5 lg:p-6">
            {summary.pendingRequests.map((request) => (
              <div key={request.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{request.need}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{request.requester} · {request.site} · {request.requestedFor}</p>
                  </div>
                  <span className="rounded-full bg-[var(--sand-100)] px-3 py-1 text-xs font-semibold text-[var(--sand-500)]">À décider</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="surface p-6">
            <p className="label">Déjà accepté</p>
            <p className="mt-3 text-3xl font-black text-[var(--ink)]">{accepted.length}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">À organiser et suivre dans cet espace.</p>
          </div>
          <div className="surface p-6">
            <p className="label">Ce qui reste dans le messaging</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Déclarer une disponibilité, répondre oui/non, signaler un retard, envoyer une photo ou demander un appel.</p>
          </div>
        </section>

        <section className="surface p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
            <div>
              <p className="font-semibold text-[var(--ink)]">Une seule capacité, quel que soit le canal</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le canal messaging et cet espace reprennent la même capacité {capacity.capacityId}. L’espace professionnel n’est utile que lorsque plusieurs demandes doivent être comparées ou planifiées.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
