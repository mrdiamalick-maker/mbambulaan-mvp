import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Scale, ShipWheel } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkFocus } from "@/components/work/WorkFocus";
import { getArrivalSummary, sharedArrivalDemo } from "@/lib/mbambulaan/arrival-demo";
import { landingWorkDemo } from "@/lib/mbambulaan/work-demo";

const arrivalSummary = getArrivalSummary(sharedArrivalDemo);

const quayQueue = [
  {
    id: sharedArrivalDemo.arrivalId,
    vessel: sharedArrivalDemo.vessel,
    captain: sharedArrivalDemo.captain,
    eta: sharedArrivalDemo.eta,
    issue: "Place et glace encore à confirmer",
    action: "Préparer l’arrivée",
    tone: "attention" as const
  },
  {
    id: "RET-2026-0815",
    vessel: "Sunu Gaal",
    captain: "Ousmane Fall",
    eta: "dans 35 minutes",
    issue: "Aucun conflit signalé",
    action: "Surveiller l’arrivée",
    tone: "normal" as const
  },
  {
    id: "RET-2026-0812",
    vessel: "Mame Diarra",
    captain: "Cheikh Ba",
    eta: "arrivée terminée",
    issue: "Pesée contestée : 390 kg",
    action: "Reprendre la pesée",
    tone: "bloque" as const
  }
];

const toneClasses = {
  normal: "bg-[var(--lagoon-100)] text-[var(--lagoon-600)]",
  attention: "bg-[var(--sand-100)] text-[var(--sand-500)]",
  bloque: "bg-[var(--coral-100)] text-[var(--coral-600)]"
};

export function OperateurWorkView() {
  const attentionCount = quayQueue.filter((item) => item.tone !== "normal").length;

  return (
    <>
      <PageHeader
        eyebrow="Quai de Hann"
        title="Gérer plusieurs arrivées sans perdre le fil"
        description="Les réponses simples restent dans le canal messaging. Cet espace sert uniquement à arbitrer plusieurs arrivées, traiter les conflits et corriger les pesées."
        actions={<Link href="/app/operations" className="btn-primary">Voir toutes les arrivées <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-7 p-5 lg:p-8">
        <WorkFocus work={landingWorkDemo} role="operateur" />

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><ShipWheel size={18} /><p className="label">À faire maintenant</p></div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--ink)]">{attentionCount} arrivée{attentionCount > 1 ? "s" : ""} demande{attentionCount > 1 ? "nt" : ""} votre attention</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Confirmer « le quai est prêt » ou « la glace est disponible » se fait dans le messaging. Ici, vous voyez seulement ce qui nécessite une vue d’ensemble ou une correction.</p>
          </div>

          <aside className="surface p-6 lg:p-7">
            <p className="label">Arrivée prioritaire</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">{sharedArrivalDemo.vessel} · {sharedArrivalDemo.eta}</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Capitaine :</strong> {sharedArrivalDemo.captain}</p>
              <p><strong className="text-[var(--ink)]">À préparer :</strong> {sharedArrivalDemo.needs.join(", ")}</p>
              <p><strong className="text-[var(--ink)]">Manquants :</strong> {arrivalSummary.missingItems.length}</p>
            </div>
          </aside>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-[var(--line)] px-6 py-5">
            <p className="label">Vue d’ensemble du quai</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Arrivées, conflits et corrections</h2>
          </div>
          <div className="space-y-3 p-5 lg:p-6">
            {quayQueue.map((item) => (
              <div key={item.id} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{item.vessel} · {item.captain}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.id} · {item.eta}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{item.issue}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[var(--muted)]">{item.action}</p>
                  <Link href="/app/operations" className="btn-secondary">Ouvrir</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="surface p-5"><Clock3 className="text-[var(--lagoon-600)]" size={20} /><p className="mt-3 text-sm font-semibold text-[var(--ink)]">Messaging</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Réponses rapides : prêt, non prêt, arrivée confirmée.</p></div>
          <div className="surface p-5"><AlertTriangle className="text-[var(--coral-600)]" size={20} /><p className="mt-3 text-sm font-semibold text-[var(--ink)]">Espace professionnel</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Conflits de quai, plusieurs arrivées, retards et arbitrages.</p></div>
          <div className="surface p-5"><Scale className="text-[var(--sand-500)]" size={20} /><p className="mt-3 text-sm font-semibold text-[var(--ink)]">Correction</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Pesée contestée, historique et reprise avec les acteurs concernés.</p></div>
        </section>

        <section className="surface p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={20} />
            <div>
              <p className="font-semibold text-[var(--ink)]">Un seul quai, un seul état partagé</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le messaging met à jour l’arrivée. Cet espace ne la recrée pas : il regroupe seulement les cas que l’agent doit comparer, arbitrer ou corriger.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
