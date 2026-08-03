import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Scale, ShipWheel, Snowflake } from "lucide-react";
import { sharedArrivalDemo, getArrivalSummary } from "@/lib/mbambulaan/arrival-demo";

const arrival = sharedArrivalDemo;
const summary = getArrivalSummary(arrival);

const readiness = arrival.needs.map((need) => ({
  label: need,
  status: arrival.ready[need] === true ? "Prêt" : arrival.ready[need] === false ? "Manque" : "À confirmer"
}));

export function QuayOperatorWorkspace() {
  return (
    <div className="space-y-6 p-5 lg:p-8">
      <section className="surface-dark overflow-hidden p-6 lg:p-8">
        <p className="label-inverse">Agent de quai · Hann</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              {summary.nextAction}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              Une seule priorité : préparer et traiter l’arrivée {arrival.arrivalId} sans perdre l’information reçue par WhatsApp ou téléphone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/operations" className="btn-accent">Ouvrir l’arrivée <ArrowRight size={16} /></Link>
              <Link href="/terrain/quai-whatsapp" className="btn-on-dark">Voir la simulation WhatsApp</Link>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-white/12 bg-white/6 p-5">
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-white/50">Arrivée attendue</p>
            <p className="mt-2 text-2xl font-semibold">{arrival.vessel}</p>
            <p className="mt-2 text-sm text-white/65">{arrival.captain} · {arrival.eta}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="surface p-5 lg:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="label">Ce qui doit être prêt</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Préparation de l’arrivée</h2>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--sand-100)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">{arrival.arrivalId}</span>
          </div>

          <div className="mt-5 space-y-3">
            {readiness.map((item) => {
              const ready = item.status === "Prêt";
              const missing = item.status === "Manque";
              return (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-4 transition duration-200 hover:shadow-[var(--shadow-sm)]">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-10 place-items-center rounded-[var(--radius-sm)] ${ready ? "bg-[var(--lagoon-100)] text-[var(--lagoon-600)]" : missing ? "bg-[var(--coral-100)] text-[var(--coral-600)]" : "bg-[var(--sand-100)] text-[var(--sand-500)]"}`}>
                      {item.label === "Glace" ? <Snowflake size={18} /> : <ShipWheel size={18} />}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--ink)]">{item.label}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">Besoin demandé par le capitaine</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ready ? "bg-[var(--lagoon-100)] text-[var(--lagoon-600)]" : missing ? "bg-[var(--coral-100)] text-[var(--coral-600)]" : "bg-[var(--sand-100)] text-[var(--sand-500)]"}`}>{item.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="surface p-5 lg:p-6">
          <p className="label">Cas à reprendre</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Ce qui bloque</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--sand-100)] p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-[var(--sand-500)]" size={18} />
                <div>
                  <p className="font-semibold text-[var(--ink)]">Glace à confirmer</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Le capitaine attend une réponse avant son arrivée.</p>
                </div>
              </div>
            </div>
            {arrival.captainDecision === "contesté" && (
              <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--coral-100)] p-4">
                <div className="flex items-start gap-3">
                  <Scale className="mt-0.5 shrink-0 text-[var(--coral-600)]" size={18} />
                  <div>
                    <p className="font-semibold text-[var(--ink)]">Pesée contestée</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">La pesée doit être reprise avec le capitaine.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="surface p-5 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-md)] bg-[var(--lagoon-100)] p-4">
            <CheckCircle2 className="text-[var(--lagoon-600)]" size={19} />
            <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{summary.readyItems.length} besoin prêt</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Confirmé pour cette arrivée</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--sand-100)] p-4">
            <Clock3 className="text-[var(--sand-500)]" size={19} />
            <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{summary.missingItems.length} besoin manquant</p>
            <p className="mt-1 text-xs text-[var(--muted)]">À résoudre avant l’arrivée</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--canvas)] p-4">
            <Scale className="text-[var(--ocean-800)]" size={19} />
            <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{arrival.weightKg ? `${arrival.weightKg} kg` : "Pesée à venir"}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Partagée avec le capitaine</p>
          </div>
        </div>
      </section>
    </div>
  );
}
