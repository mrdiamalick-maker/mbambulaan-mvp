"use client";

import { useState, type FormEvent } from "react";
import { computeDecisionMetrics, DEMO_SITUATION_ID, type Situation } from "@/lib/coordination-demo";
import { CoordinationShell, PrimaryLink, SecondaryLink } from "./CoordinationShell";
import { makeHistory, useCoordinationDemo } from "./CoordinationDemoProvider";
import { EmptyState, Metric, NextStep, Panel, Progress, SituationCard, SituationFacts, StatusPill, Timeline, UrgencyPill } from "./CoordinationUI";

export function CoordinatorHome() {
  const { situations } = useCoordinationDemo();
  const metrics = computeDecisionMetrics(situations);
  const priorities = [...situations]
    .filter((item) => item.status !== "Réglé")
    .sort((a, b) => priorityScore(b) - priorityScore(a));

  return (
    <CoordinationShell
      eyebrow="Coordination locale"
      title="Organiser la réponse, sans perdre le fil"
      intro="Les urgences, les responsabilités et les prochaines étapes sont réunies dans une même vue de travail."
      action={<PrimaryLink href={`/coordinateur/situations/${DEMO_SITUATION_ID}`}>Traiter la panne de Mbao</PrimaryLink>}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Situations en cours" value={metrics.active} detail="À suivre aujourd’hui" />
        <Metric label="Urgences élevées" value={metrics.critical} detail="À examiner en priorité" tone="coral" />
        <Metric label="En attente" value={metrics.waiting} detail="Avec un motif visible" tone="amber" />
        <Metric label="Sans responsable" value={metrics.unassigned} detail="Prise en charge à organiser" tone="amber" />
        <Metric label="Réglées" value={metrics.solved} detail="Résultat constaté" tone="green" />
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Situations prioritaires" intro="Classées par urgence, attente et absence de responsable.">
          <div className="grid gap-3 lg:grid-cols-2">
            {priorities.map((situation) => (
              <SituationCard key={situation.id} situation={situation} href={`/coordinateur/situations/${situation.id}`} />
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="À traiter aujourd’hui">
            <ul className="space-y-3 text-xs font-semibold leading-5 text-[#506965]">
              <li className="border-l-2 border-[#c65e48] pl-3"><strong className="block text-[#324f4a]">{metrics.critical} urgence(s) élevée(s)</strong> Vérifier le risque et la prochaine étape.</li>
              <li className="border-l-2 border-[#c59638] pl-3"><strong className="block text-[#324f4a]">{metrics.waiting} situation(s) en attente</strong> Lever le blocage ou ajuster l’échéance.</li>
              <li className="border-l-2 border-[#258d82] pl-3"><strong className="block text-[#324f4a]">{metrics.dueToday} intervention(s) planifiée(s)</strong> Suivre l’exécution et le résultat.</li>
            </ul>
          </Panel>
          <Panel title="Récemment réglées">
            <div className="space-y-3">
              {situations.filter((item) => item.status === "Réglé").map((situation) => (
                <SituationCard key={situation.id} situation={situation} href={`/coordinateur/situations/${situation.id}`} compact />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </CoordinationShell>
  );
}

function priorityScore(situation: Situation) {
  return (situation.urgency === "Élevée" ? 5 : 1) + (situation.status === "En attente" ? 4 : 0) + (!situation.responsible ? 2 : 0);
}

export function CoordinatorSituationDetail({ id }: { id: string }) {
  const { getSituation, updateSituation } = useCoordinationDemo();
  const [feedback, setFeedback] = useState("");
  const situation = getSituation(id);

  if (!situation) {
    return (
      <CoordinationShell eyebrow="Coordination" title="Situation introuvable" intro="Cette situation n’existe pas dans les données locales.">
        <PrimaryLink href="/coordinateur">Retour aux priorités</PrimaryLink>
      </CoordinationShell>
    );
  }
  const currentSituation = situation;

  function apply(update: Parameters<typeof updateSituation>[1], success: string) {
    const result = updateSituation(id, update);
    setFeedback(result.ok ? success : result.message);
  }

  function examine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const note = String(data.get("qualificationNote") ?? "").trim();
    if (!note) return setFeedback("Ajoutez une note courte pour expliquer la compréhension de la situation.");
    apply(
      {
        status: "En cours d’examen",
        qualificationNote: note,
        nextStep: "Désigner un responsable opérationnel",
        nextActor: "Awa Diop — Coordination locale",
        nextDue: "Aujourd’hui, 09:15",
        history: makeHistory("Examen commencé", note, "Awa Diop — Coordination locale", "examen", "08:35")
      },
      "La situation est comprise. La prochaine étape est de désigner un responsable."
    );
  }

  function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const responsible = String(data.get("responsible"));
    apply(
      {
        status: "Pris en charge",
        responsible,
        responsibleContact: "+221 77 000 00 20",
        nextStep: "Définir l’intervention attendue et son échéance",
        nextActor: "Awa Diop — Coordination locale",
        nextDue: "Aujourd’hui, 09:30",
        history: makeHistory("Responsable désigné", `${responsible} prend en charge l’intervention.`, "Awa Diop — Coordination locale", "affectation", "09:00")
      },
      "Le responsable est désigné et visible par les acteurs concernés."
    );
  }

  function plan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const action = String(data.get("plannedAction") ?? "").trim();
    const dueAt = String(data.get("dueAt") ?? "");
    if (!action || !dueAt) return setFeedback("Décrivez l’intervention et indiquez une échéance.");
    apply(
      {
        status: "Intervention prévue",
        plannedAction: action,
        dueAt,
        nextStep: "Se rendre sur le site et démarrer le diagnostic technique",
        nextActor: currentSituation.responsible ?? "Responsable opérationnel",
        nextDue: "Aujourd’hui, 11:00",
        history: makeHistory("Intervention organisée", `${action} Intervention prévue à 11:00.`, "Awa Diop — Coordination locale", "planification", "09:20")
      },
      "L’intervention est organisée. Le responsable peut maintenant la démarrer."
    );
  }

  function closeSituation() {
    if (!currentSituation.resultRecorded) {
      setFeedback("Le responsable doit d’abord ajouter le résultat et un élément de confirmation.");
      return;
    }
    apply(
      {
        status: "Réglé",
        completedAt: "2026-07-24T16:00:00+00:00",
        nextStep: "Aucune action requise — situation réglée",
        nextActor: "Aucun",
        nextDue: "Terminé à 16:00",
        history: makeHistory("Résultat confirmé et situation réglée", "La coordination valide la remise en service de la machine.", "Awa Diop — Coordination locale", "clôture", "16:00")
      },
      "La situation est réglée. Le résultat est désormais visible dans l’espace décideur."
    );
  }

  return (
    <CoordinationShell
      eyebrow="Détail coordinateur"
      title={situation.title}
      intro={`${situation.id} · ${situation.site}`}
      action={<SecondaryLink href="/coordinateur">Retour aux priorités</SecondaryLink>}
    >
      {feedback ? <div role="status" className="mb-5 rounded-md border border-[#78aaa1] bg-[#edf8f5] p-4 text-xs font-bold text-[#26564f]">{feedback}</div> : null}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Panel title="Comprendre la situation">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={situation.status} />
              <UrgencyPill urgency={situation.urgency} />
            </div>
            <p className="mt-5 text-sm font-medium leading-6 text-[#49635e]">{situation.description}</p>
            <div className="mt-5"><SituationFacts situation={situation} /></div>
          </Panel>

          <Panel title="Progression de la réponse">
            <Progress status={situation.status} />
            <div className="mt-6"><NextStep situation={situation} /></div>
          </Panel>

          <Panel title="Action attendue maintenant" intro="Une seule action principale est proposée selon l’état de la situation.">
            <CoordinatorAction
              situation={situation}
              examine={examine}
              assign={assign}
              plan={plan}
              closeSituation={closeSituation}
            />
          </Panel>

          {situation.waitingReason ? (
            <Panel title="Blocage visible">
              <div className="rounded-md border border-[#d1a25b] bg-[#fff6e8] p-4">
                <p className="text-sm font-black text-[#77521d]">{situation.waitingReason}</p>
                <p className="mt-2 text-xs font-semibold text-[#896a3e]">Le responsable reste chargé de la prochaine étape affichée ci-dessus.</p>
              </div>
            </Panel>
          ) : null}

          {situation.resultRecorded ? (
            <Panel title="Résultat à constater">
              <p className="text-sm font-black text-[#2d5b3b]">{situation.resultNote}</p>
              <p className="mt-3 text-xs font-semibold text-[#55705d]">Élément de confirmation : {situation.confirmation}</p>
            </Panel>
          ) : null}
        </div>

        <Panel title="Historique complet" intro="Chaque changement important reste lisible.">
          <Timeline situation={situation} />
        </Panel>
      </div>
    </CoordinationShell>
  );
}

function CoordinatorAction({
  situation,
  examine,
  assign,
  plan,
  closeSituation
}: {
  situation: Situation;
  examine: (event: FormEvent<HTMLFormElement>) => void;
  assign: (event: FormEvent<HTMLFormElement>) => void;
  plan: (event: FormEvent<HTMLFormElement>) => void;
  closeSituation: () => void;
}) {
  const input = "mt-2 min-h-11 w-full rounded-md border border-[#a9bdb9] px-3 text-sm font-semibold outline-none focus:border-[#087c78] focus:ring-2 focus:ring-[#087c78]/15";
  const button = "mt-4 min-h-11 rounded-md bg-[#087c78] px-5 text-sm font-black text-white transition hover:bg-[#065e5b]";

  if (situation.status === "Reçu") {
    return (
      <form onSubmit={examine}>
        <label className="text-xs font-black text-[#274d47]">
          Note de compréhension
          <textarea name="qualificationNote" rows={3} defaultValue="Panne confirmée sur l’équipement principal. Risque de perte de conservation pour les débarquements du jour." className={`${input} py-3`} />
        </label>
        <button type="submit" className={button}>Comprendre la situation</button>
      </form>
    );
  }
  if (situation.status === "En cours d’examen") {
    return (
      <form onSubmit={assign}>
        <label className="text-xs font-black text-[#274d47]">
          Responsable opérationnel
          <select name="responsible" className={input} defaultValue="Mamadou Ndiaye — Maintenance Froid">
            <option>Mamadou Ndiaye — Maintenance Froid</option>
            <option>Service technique du quai</option>
          </select>
        </label>
        <button type="submit" className={button}>Désigner ce responsable</button>
      </form>
    );
  }
  if (situation.status === "Pris en charge") {
    return (
      <form onSubmit={plan}>
        <label className="block text-xs font-black text-[#274d47]">
          Intervention attendue
          <textarea name="plannedAction" rows={3} defaultValue="Diagnostiquer la panne, remplacer la pièce défectueuse et tester la production de glace." className={`${input} py-3`} />
        </label>
        <label className="mt-4 block text-xs font-black text-[#274d47]">
          Échéance
          <input name="dueAt" type="datetime-local" defaultValue="2026-07-24T11:00" className={input} />
        </label>
        <button type="submit" className={button}>Organiser l’intervention</button>
      </form>
    );
  }
  if (situation.status === "Intervention en cours" && situation.resultRecorded) {
    return (
      <button type="button" onClick={closeSituation} className={button}>
        Constater le résultat et clôturer
      </button>
    );
  }
  if (situation.status === "Intervention prévue" || situation.status === "Intervention en cours" || situation.status === "En attente") {
    return (
      <div>
        <p className="text-sm font-bold leading-6 text-[#405e59]">Le responsable opérationnel doit maintenant mettre à jour l’intervention.</p>
        <div className="mt-4"><PrimaryLink href={`/responsable/interventions/${situation.id}`}>Ouvrir l’espace responsable</PrimaryLink></div>
      </div>
    );
  }
  if (situation.status === "Réglé") {
    return <EmptyState title="Aucune action opérationnelle restante" detail="Le résultat, la date de fin et l’élément de confirmation sont enregistrés." />;
  }
  return <EmptyState title="Aucune action disponible" detail="La situation conserve son état actuel." />;
}
