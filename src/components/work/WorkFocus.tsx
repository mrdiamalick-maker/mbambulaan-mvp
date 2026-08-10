"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle, MessageCircleMore, UsersRound } from "lucide-react";
import { useCoordinationLoop, type LoopUpdate } from "@/components/providers/CoordinationLoopProvider";
import type { MbambulaanWork, WorkRole } from "@/lib/mbambulaan/work-demo";

const healthLabels = {
  normal: "Normal",
  attention: "À surveiller",
  bloque: "Bloqué"
} as const;

const usefulActorsByRole: Record<WorkRole, LoopUpdate["actor"][]> = {
  capitaine: ["capitaine", "operateur"],
  operateur: ["capitaine", "operateur", "prestataire"],
  mareyeur: ["operateur", "mareyeur"],
  transformateur: ["operateur", "mareyeur", "transformateur", "prestataire"],
  prestataire: ["operateur", "transformateur", "prestataire"]
};

function isUsefulForRole(update: LoopUpdate, role: WorkRole) {
  return usefulActorsByRole[role].includes(update.actor);
}

function nextActionFromUpdate(update: LoopUpdate | undefined, fallback: string, role: WorkRole) {
  if (!update) return fallback;
  const answer = update.action.toLowerCase();

  if (role === "operateur" && update.actor === "capitaine") {
    if (answer.includes("heure") || answer.includes("plus tard")) return "Ajuster l’ordre des arrivées et confirmer ce qui sera prêt au quai.";
    if (answer.includes("glace") || answer.includes("manutention") || answer.includes("place au quai")) return "Vérifier ce qui est réellement disponible avant l’arrivée du capitaine.";
    if (answer.includes("vérifier")) return "Reprendre la pesée avec le capitaine avant de poursuivre.";
  }

  if (role === "capitaine" && update.actor === "operateur") {
    if (answer.includes("420 kg")) return "Confirmer le poids reçu ou demander une vérification.";
    if (answer.includes("non") || answer.includes("confirmer")) return "Vérifier ce qui manque encore avant votre arrivée.";
  }

  if (role === "mareyeur" && update.actor === "operateur") return "Vérifier si le lot annoncé correspond à votre recherche avant de réserver.";
  if (role === "transformateur" && update.actor !== "transformateur") return "Vérifier l’effet de cette nouvelle sur la matière, le froid, le transport et l’heure de démarrage.";
  if (role === "prestataire") return "Vérifier que cette demande n’entre pas en conflit avec une autre capacité déjà promise.";

  return fallback;
}

export function WorkFocus({ work, role }: { work: MbambulaanWork; role: WorkRole }) {
  const view = work.roleViews[role];
  const { updates } = useCoordinationLoop();
  const usefulUpdates = updates.filter((update) => update.workId === work.id && isUsefulForRole(update, role));
  const latestUpdate = usefulUpdates[usefulUpdates.length - 1];
  const nextAction = nextActionFromUpdate(latestUpdate, view.nextAction, role);
  const recentEvents = [
    ...work.events.slice(-3).map((event) => ({ id: event.id, label: event.label, meta: `${event.at} · ${event.actor}`, done: event.done, fromCommunication: false })),
    ...usefulUpdates.slice(-2).map((update) => ({
      id: update.id,
      label: update.action,
      meta: `${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(update.at))} · canal rapide`,
      done: true,
      fromCommunication: true
    }))
  ].slice(-4);

  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-[var(--line)] bg-[var(--ocean-1000)] px-5 py-5 text-white lg:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-white/55">En cours</p>
            <h2 className="mt-2 text-2xl font-black">{work.title}</h2>
            <p className="mt-1 text-sm text-white/60">{latestUpdate ? latestUpdate.action : work.currentStep}</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">{healthLabels[work.health]}</span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_.85fr]">
        <div className="p-5 lg:p-7">
          <p className="label">À faire maintenant</p>
          <h3 className="mt-2 text-2xl font-black text-[var(--ink)]">{view.question}</h3>
          <p className="mt-4 text-sm leading-6 text-[var(--legacy-muted)]">{nextAction}</p>

          {latestUpdate && (
            <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--lagoon-100)] p-4">
              <MessageCircleMore className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={18} />
              <div>
                <p className="text-xs font-semibold text-[var(--legacy-muted)]">Nouvelle utile</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{latestUpdate.action}</p>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] bg-[var(--sand-100)] p-4">
              <p className="text-xs font-semibold text-[var(--legacy-muted)]">Qui agit maintenant</p>
              <p className="mt-1 font-semibold text-[var(--ink)]">{view.currentOwner}</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--sand-100)] p-4">
              <p className="text-xs font-semibold text-[var(--legacy-muted)]">Qui intervient ensuite</p>
              <p className="mt-1 font-semibold text-[var(--ink)]">{view.nextOwner}</p>
            </div>
          </div>

          <Link href={view.actionHref} className="btn-accent mt-5">{view.actionLabel} <ArrowRight size={16} /></Link>
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--sand-100)] p-5 lg:border-l lg:border-t-0 lg:p-7">
          <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><UsersRound size={17} /><p className="label">Ce qui vient de changer</p></div>
          <div className="mt-4 space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--white)] p-4">
                {event.fromCommunication ? <MessageCircleMore className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={17} /> : event.done ? <Check className="mt-0.5 shrink-0 text-[var(--lagoon-600)]" size={17} /> : <Circle className="mt-0.5 shrink-0 text-[var(--sand-500)]" size={17} />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{event.label}</p>
                  <p className="mt-1 text-xs text-[var(--legacy-muted)]">{event.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
