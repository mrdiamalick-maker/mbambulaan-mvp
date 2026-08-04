import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, MapPinned, Snowflake, UsersRound, Wrench } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { MbambulaanSignature } from "@/components/ui/MbambulaanSignature";
import { getServiceCapacitySummary, sharedServiceCapacityDemo } from "@/lib/mbambulaan/service-capacity-demo";

const capacity = sharedServiceCapacityDemo;
const summary = getServiceCapacitySummary(capacity);

export function PrestataireWorkView() {
  return (
    <>
      <PageHeader
        eyebrow="Capacités et demandes"
        title="Répondre aux besoins utiles sans surcharger votre planning"
        description="Votre espace reprend les capacités déclarées dans le canal messaging et vous aide à confirmer les demandes, éviter les conflits et suivre les services engagés."
        actions={<Link href="/app/services" className="btn-primary">Voir mes services <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <MbambulaanSignature
          title={`${capacity.capacityId} · ${summary.nextAction}`}
          detail={`${capacity.service} · ${capacity.availableQuantity} disponibles à ${capacity.site}. Le messaging et l’espace professionnel utilisent la même capacité.`}
          points={[
            { label: capacity.availableFrom, position: 18 },
            { label: `${summary.pendingRequests.length} demandes`, position: 52, hot: summary.pendingRequests.length > 0 },
            { label: capacity.status === "disponible" ? "Capacité ouverte" : "Capacité engagée", position: 82 }
          ]}
        />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><Wrench size={18} /><p className="label">Votre prochaine décision</p></div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[var(--ink)]">{summary.nextAction}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Voyez uniquement les demandes compatibles avec votre service, votre lieu et votre disponibilité. Confirmez vite dans le canal ; arbitrez ici quand plusieurs demandes se chevauchent.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/services" className="btn-accent">Gérer mes demandes <ArrowRight size={16} /></Link>
              <Link href="/app/atlas" className="btn-secondary"><MapPinned size={16} /> Voir les lieux</Link>
            </div>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Capacité disponible</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{capacity.service} · {capacity.availableQuantity}</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Lieu :</strong> {capacity.site}</p>
              <p><strong className="text-[var(--ink)]">Disponible :</strong> {capacity.availableFrom}</p>
              <p><strong className="text-[var(--ink)]">Jusqu’à :</strong> {capacity.availableUntil}</p>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Capacités actives" value="1" detail="Déclarée aujourd’hui" icon={Snowflake} />
          <Metric label="Demandes reçues" value={String(capacity.requests.length)} detail="Liées à votre service" icon={UsersRound} tone="lagoon" />
          <Metric label="Réponses attendues" value={String(summary.pendingRequests.length)} detail="Avant engagement" icon={CalendarClock} tone="coral" />
          <Metric label="Services confirmés" value={String(capacity.requests.filter((request) => request.status === "acceptee").length)} detail="À exécuter" icon={CheckCircle2} tone="sand" />
        </section>

        <section className="surface overflow-hidden">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
            <div><p className="label">Demandes compatibles</p><h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Répondre sans créer de conflit de capacité</h2></div>
            <Link href="/app/services" className="link-action">Voir tout le planning <ArrowRight size={15} /></Link>
          </div>
          <div className="space-y-3 p-5 lg:p-6">
            {capacity.requests.map((request) => (
              <div key={request.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{request.need}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{request.id} · {request.requester} · {request.site}</p>
                  </div>
                  <span className="rounded-full bg-[var(--sand-100)] px-3 py-1 text-xs font-semibold text-[var(--sand-500)]">{request.status === "a_confirmer" ? "À confirmer" : "Nouvelle demande"}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">Besoin pour {request.requestedFor}</p>
                  <Link href="/app/services" className="btn-secondary">Voir et répondre</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
            <div>
              <p className="font-semibold text-[var(--ink)]">Une seule capacité, quel que soit le canal</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le canal messaging sert à déclarer une disponibilité ou répondre rapidement. Cet espace existant prend le relais pour arbitrer plusieurs demandes, éviter les doubles engagements et suivre l’exécution.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
