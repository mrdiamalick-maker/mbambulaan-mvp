import { ArrowRight, CheckCircle2, Clock3, ShipWheel, UserRoundCheck } from "lucide-react";
import { sharedArrivalDemo } from "@/lib/mbambulaan/arrival-demo";

const steps = [
  { label: "Le capitaine annonce son retour", actor: "Capitaine", icon: ShipWheel },
  { label: "Le quai prépare l'arrivée", actor: "Agent de quai", icon: Clock3 },
  { label: "Le poids est partagé", actor: "Agent de quai", icon: CheckCircle2 },
  { label: "Le capitaine confirme ou conteste", actor: "Capitaine", icon: UserRoundCheck }
];

export function ConnectedJourneyCard() {
  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-[var(--line)] p-5">
        <p className="label">Un seul parcours Mbàmbulaan</p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">Capitaine et agent de quai travaillent sur la même arrivée</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--legacy-muted)]">
          Référence {sharedArrivalDemo.arrivalId} · {sharedArrivalDemo.vessel} · quai de {sharedArrivalDemo.quay}
        </p>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--lagoon-100)] text-[var(--lagoon-600)]">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[var(--legacy-muted)]">{step.actor}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{step.label}</p>
                </div>
              </div>
              {index < steps.length - 1 && <ArrowRight className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-[var(--line-strong)] md:block" size={18} aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
