"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Clock3, MessageCircleMore, PhoneCall, Scale, ShipWheel, Snowflake, Users } from "lucide-react";

type Step = "arrivee" | "preparation" | "confirmation" | "pesage" | "retour-capitaine";

type ArrivalState = {
  arrivalId: string;
  captain: string;
  vessel: string;
  quay: string;
  eta: string;
  needs: string[];
  ready: Record<string, boolean | null>;
  arrived: boolean;
  weightKg?: number;
  captainDecision?: "confirmé" | "contesté" | "en attente";
};

const initialArrival: ArrivalState = {
  arrivalId: "RET-2026-0814",
  captain: "Mamadou Diop",
  vessel: "Ndeye Fatou",
  quay: "Hann",
  eta: "dans 1 à 2 heures",
  needs: ["Place au quai", "Manutention", "Glace"],
  ready: {
    "Place au quai": null,
    Manutention: null,
    Glace: null
  },
  arrived: false,
  captainDecision: "en attente"
};

const steps: Array<{ id: Step; label: string; icon: typeof ShipWheel }> = [
  { id: "arrivee", label: "Voir l'arrivée annoncée", icon: ShipWheel },
  { id: "preparation", label: "Dire ce qui est prêt", icon: Snowflake },
  { id: "confirmation", label: "Confirmer l'arrivée", icon: Clock3 },
  { id: "pesage", label: "Enregistrer la pesée", icon: Scale },
  { id: "retour-capitaine", label: "Voir la réponse du capitaine", icon: Users }
];

export default function QuaiWhatsAppPage() {
  const [step, setStep] = useState<Step>("arrivee");
  const [arrival, setArrival] = useState<ArrivalState>(initialArrival);

  const allPreparationAnswered = arrival.needs.every((need) => arrival.ready[need] !== null);

  const captainMessage = useMemo(() => {
    if (arrival.captainDecision === "confirmé") return "Le capitaine a confirmé la pesée de 420 kg.";
    if (arrival.captainDecision === "contesté") return "Le capitaine conteste la pesée. Il faut reprendre la vérification avec lui.";
    return "La réponse du capitaine est encore attendue.";
  }, [arrival.captainDecision]);

  function setNeedStatus(need: string, value: boolean) {
    setArrival((current) => ({
      ...current,
      ready: { ...current.ready, [need]: value }
    }));
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-3 py-4 text-[var(--ink)] sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/terrain" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ocean-800)]">
            <ArrowLeft size={16} /> Retour au démonstrateur
          </Link>
          <Link href="/terrain/telephone" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ocean-800)]">
            <PhoneCall size={16} /> Canal téléphonique
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--white)] shadow-[var(--shadow-md)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-[var(--line)] bg-[var(--ocean-1000)] p-5 text-white lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--lagoon-500)] text-[var(--ocean-1000)]"><MessageCircleMore size={21} /></span>
              <div>
                <p className="font-semibold">Mbàmbulaan Business</p>
                <p className="text-xs text-white/60">Parcours WhatsApp de l'agent de quai</p>
              </div>
            </div>

            <div className="mt-6 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">Arrivée liée au capitaine</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{arrival.vessel} · {arrival.captain} · quai de {arrival.quay}</p>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-white/42">Étapes du quai</p>
            <div className="mt-3 space-y-2">
              {steps.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setStep(item.id)} className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm font-semibold transition ${step === item.id ? "bg-white/12 text-white" : "text-white/62 hover:bg-white/7 hover:text-white"}`}>
                    <Icon size={17} /> {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">Connexion des parcours</p>
              <p className="mt-2 text-xs leading-5 text-white/55">L'annonce du capitaine crée cette arrivée. Les réponses du quai repartent ensuite vers le capitaine dans la même entreprise Mbàmbulaan.</p>
            </div>
          </aside>

          <div className="min-w-0 bg-[var(--sand-100)]">
            <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--white)] px-4 py-3 sm:px-5">
              <span className="grid size-10 place-items-center rounded-full bg-[var(--lagoon-100)] text-[var(--lagoon-600)]"><ShipWheel size={19} /></span>
              <div>
                <p className="font-semibold text-[var(--ink)]">Mbàmbulaan · Agent de quai reconnu</p>
                <p className="text-xs text-[var(--muted)]">Arrivée {arrival.arrivalId}</p>
              </div>
            </header>

            <div className="min-h-[560px] p-4 sm:p-6">
              {step === "arrivee" && (
                <section className="space-y-4">
                  <div className="rounded-[18px] rounded-bl-md bg-[var(--white)] p-4 text-sm leading-6 shadow-sm">
                    Nouvelle arrivée annoncée par le capitaine Mamadou Diop.
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5">
                    <p className="text-sm font-semibold">Ce qu'il faut savoir</p>
                    <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                      <p><span className="font-semibold text-[var(--ink)]">Pirogue :</span> {arrival.vessel}</p>
                      <p><span className="font-semibold text-[var(--ink)]">Arrivée prévue :</span> {arrival.eta}</p>
                      <p><span className="font-semibold text-[var(--ink)]">Besoins :</span> {arrival.needs.join(", ")}</p>
                    </div>
                    <button onClick={() => setStep("preparation")} className="btn-primary mt-5">Préparer l'arrivée</button>
                  </div>
                </section>
              )}

              {step === "preparation" && (
                <section>
                  <div className="rounded-[18px] rounded-bl-md bg-[var(--white)] p-4 text-sm leading-6 shadow-sm">
                    Dites seulement ce qui est prêt pour cette arrivée.
                  </div>
                  <div className="mt-4 space-y-3">
                    {arrival.needs.map((need) => (
                      <div key={need} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-4">
                        <p className="font-semibold">{need}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => setNeedStatus(need, true)} className={`rounded-full px-4 py-2 text-sm font-semibold ${arrival.ready[need] === true ? "bg-[var(--lagoon-100)] text-[var(--ocean-800)]" : "border border-[var(--line-strong)] bg-white text-[var(--ocean-800)]"}`}>C'est prêt</button>
                          <button onClick={() => setNeedStatus(need, false)} className={`rounded-full px-4 py-2 text-sm font-semibold ${arrival.ready[need] === false ? "bg-[var(--sand-200)] text-[var(--ink)]" : "border border-[var(--line-strong)] bg-white text-[var(--ocean-800)]"}`}>Ce n'est pas prêt</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {allPreparationAnswered && (
                    <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--lagoon-100)] p-4 text-sm">
                      La réponse du quai est prête à être envoyée au capitaine.
                    </div>
                  )}
                  <button disabled={!allPreparationAnswered} onClick={() => setStep("confirmation")} className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50">Envoyer au capitaine</button>
                </section>
              )}

              {step === "confirmation" && (
                <section className="space-y-4">
                  <div className="rounded-[18px] rounded-bl-md bg-[var(--white)] p-4 text-sm leading-6 shadow-sm">
                    Le capitaine est arrivé au quai de Hann ?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setArrival((current) => ({ ...current, arrived: true }))} className="rounded-full border border-[var(--line-strong)] bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--ocean-800)]">Oui, il est arrivé</button>
                    <button className="rounded-full border border-[var(--line-strong)] bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--ocean-800)]">Pas encore</button>
                  </div>
                  {arrival.arrived && (
                    <div className="rounded-[var(--radius-md)] bg-[var(--lagoon-100)] p-4 text-sm">Arrivée confirmée. Vous pouvez passer à la pesée.</div>
                  )}
                  <button disabled={!arrival.arrived} onClick={() => setStep("pesage")} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">Passer à la pesée</button>
                </section>
              )}

              {step === "pesage" && (
                <section className="space-y-4">
                  <div className="rounded-[18px] rounded-bl-md bg-[var(--white)] p-4 text-sm leading-6 shadow-sm">Quel poids la balance affiche-t-elle ?</div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--white)] p-5">
                    <p className="text-sm font-semibold">Poids enregistré pour la démonstration</p>
                    <p className="mt-2 text-3xl font-semibold">420 kg</p>
                    <button onClick={() => setArrival((current) => ({ ...current, weightKg: 420, captainDecision: "en attente" }))} className="btn-primary mt-5">Envoyer 420 kg au capitaine</button>
                  </div>
                  {arrival.weightKg && (
                    <button onClick={() => setStep("retour-capitaine")} className="btn-secondary">Voir la réponse du capitaine</button>
                  )}
                </section>
              )}

              {step === "retour-capitaine" && (
                <section className="space-y-4">
                  <div className="rounded-[18px] rounded-bl-md bg-[var(--white)] p-4 text-sm leading-6 shadow-sm">{captainMessage}</div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setArrival((current) => ({ ...current, captainDecision: "confirmé" }))} className="rounded-full border border-[var(--line-strong)] bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--ocean-800)]">Simuler une confirmation</button>
                    <button onClick={() => setArrival((current) => ({ ...current, captainDecision: "contesté" }))} className="rounded-full border border-[var(--line-strong)] bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--ocean-800)]">Simuler un désaccord</button>
                  </div>
                  {arrival.captainDecision === "confirmé" && (
                    <div className="rounded-[var(--radius-md)] bg-[var(--lagoon-100)] p-4 text-sm"><Check className="mr-2 inline" size={16} />La pesée est confirmée pour les deux acteurs.</div>
                  )}
                  {arrival.captainDecision === "contesté" && (
                    <div className="rounded-[var(--radius-md)] bg-[var(--sand-200)] p-4 text-sm">La pesée reste ouverte. L'agent doit reprendre la vérification avec le capitaine.</div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
