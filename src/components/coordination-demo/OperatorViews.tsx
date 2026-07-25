"use client";

import { useState, type FormEvent } from "react";
import { DEMO_SITUATION_ID, type Situation } from "@/lib/coordination-demo";
import { CoordinationShell, PrimaryLink, SecondaryLink } from "./CoordinationShell";
import { makeHistory, useCoordinationDemo } from "./CoordinationDemoProvider";
import { EmptyState, NextStep, Panel, Progress, SituationCard, SituationFacts, StatusPill, Timeline, UrgencyPill } from "./CoordinationUI";

export function OperatorHome() {
  const { situations } = useCoordinationDemo();
  const assigned = situations.filter((item) => item.responsible && item.status !== "Réglé");
  const blocked = assigned.filter((item) => item.status === "En attente");

  return (
    <CoordinationShell
      eyebrow="Responsable opérationnel"
      title="Mes interventions"
      intro="Ce qui m’est affecté, ce qui est attendu et ce qui bloque."
      action={<PrimaryLink href={`/responsable/interventions/${DEMO_SITUATION_ID}`}>Intervention de Mbao</PrimaryLink>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Interventions affectées" intro={`${assigned.length} intervention(s) à suivre.`}>
          <div className="grid gap-3 lg:grid-cols-2">
            {assigned.map((situation) => (
              <SituationCard key={situation.id} situation={situation} href={`/responsable/interventions/${situation.id}`} />
            ))}
          </div>
        </Panel>
        <Panel title="Blocages déclarés" intro="Chaque attente doit conserver un motif et une prochaine étape.">
          {blocked.length ? (
            <div className="space-y-3">
              {blocked.map((situation) => (
                <SituationCard key={situation.id} situation={situation} href={`/responsable/interventions/${situation.id}`} compact />
              ))}
            </div>
          ) : (
            <EmptyState title="Aucun blocage en cours" detail="Les interventions affectées peuvent progresser normalement." />
          )}
        </Panel>
      </div>
    </CoordinationShell>
  );
}

export function OperatorInterventionDetail({ id }: { id: string }) {
  const { getSituation, updateSituation } = useCoordinationDemo();
  const [feedback, setFeedback] = useState("");
  const situation = getSituation(id);

  if (!situation) {
    return (
      <CoordinationShell eyebrow="Intervention" title="Intervention introuvable" intro="Cette situation n’existe pas dans les données locales.">
        <PrimaryLink href="/responsable">Retour aux interventions</PrimaryLink>
      </CoordinationShell>
    );
  }
  const currentSituation = situation;

  function apply(update: Parameters<typeof updateSituation>[1], success: string) {
    const result = updateSituation(id, update);
    setFeedback(result.ok ? success : result.message);
  }

  function start() {
    apply(
      {
        status: "Intervention en cours",
        nextStep: "Diagnostiquer la panne et renseigner tout blocage rencontré",
        nextActor: currentSituation.responsible ?? "Responsable opérationnel",
        nextDue: "Aujourd’hui, 12:00",
        history: makeHistory("Intervention démarrée", "Le responsable est arrivé sur le site et commence le diagnostic.", currentSituation.responsible ?? "Responsable opérationnel", "intervention", "11:15")
      },
      "L’intervention est démarrée. Le coordinateur et le terrain voient la mise à jour."
    );
  }

  function pause(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reason = String(data.get("waitingReason") ?? "").trim();
    if (!reason) return setFeedback("Indiquez pourquoi l’intervention doit attendre.");
    apply(
      {
        status: "En attente",
        waitingReason: reason,
        nextStep: "Recevoir la pièce puis reprendre l’intervention",
        nextActor: currentSituation.responsible ?? "Responsable opérationnel",
        nextDue: "Aujourd’hui, 14:30",
        history: makeHistory("Intervention mise en attente", reason, currentSituation.responsible ?? "Responsable opérationnel", "attente", "11:45")
      },
      "Le blocage et sa prochaine étape sont maintenant visibles."
    );
  }

  function resume() {
    apply(
      {
        status: "Intervention en cours",
        waitingReason: undefined,
        nextStep: "Installer la pièce reçue et tester la production de glace",
        nextActor: currentSituation.responsible ?? "Responsable opérationnel",
        nextDue: "Aujourd’hui, 15:45",
        history: makeHistory("Intervention reprise", "La pièce est reçue. La réparation reprend sur site.", currentSituation.responsible ?? "Responsable opérationnel", "intervention", "14:30")
      },
      "L’intervention reprend. Le blocage n’est plus actif."
    );
  }

  function recordResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const resultNote = String(data.get("resultNote") ?? "").trim();
    const confirmation = String(data.get("confirmation") ?? "").trim();
    if (!resultNote || !confirmation) return setFeedback("Ajoutez le résultat et un élément de confirmation.");
    apply(
      {
        resultNote,
        confirmation,
        completedAt: "2026-07-24T15:40:00+00:00",
        resultRecorded: true,
        nextStep: "Constater le résultat et clôturer la situation",
        nextActor: "Awa Diop — Coordination locale",
        nextDue: "Aujourd’hui, 16:00",
        history: makeHistory("Machine remise en service", resultNote, currentSituation.responsible ?? "Responsable opérationnel", "résultat", "15:40")
      },
      "Le résultat et l’élément de confirmation sont enregistrés. La coordination peut clôturer."
    );
  }

  return (
    <CoordinationShell
      eyebrow="Intervention affectée"
      title={situation.title}
      intro={`${situation.id} · ${situation.site}`}
      action={<SecondaryLink href="/responsable">Mes interventions</SecondaryLink>}
    >
      {feedback ? <div role="status" className="mb-5 rounded-md border border-[#78aaa1] bg-[#edf8f5] p-4 text-xs font-bold text-[#26564f]">{feedback}</div> : null}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Panel title="Ce qui est attendu">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={situation.status} />
              <UrgencyPill urgency={situation.urgency} />
            </div>
            <div className="mt-5"><SituationFacts situation={situation} /></div>
            {situation.plannedAction ? (
              <div className="mt-5 rounded-md bg-[#eef6f4] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#087c78]">Intervention attendue</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#294d47]">{situation.plannedAction}</p>
              </div>
            ) : null}
          </Panel>
          <Panel title="Progression">
            <Progress status={situation.status} />
            <div className="mt-6"><NextStep situation={situation} /></div>
          </Panel>
          <Panel title="Action attendue maintenant">
            <OperatorAction situation={situation} start={start} pause={pause} resume={resume} recordResult={recordResult} />
          </Panel>
        </div>
        <Panel title="Historique de l’intervention">
          <Timeline situation={situation} />
        </Panel>
      </div>
    </CoordinationShell>
  );
}

function OperatorAction({
  situation,
  start,
  pause,
  resume,
  recordResult
}: {
  situation: Situation;
  start: () => void;
  pause: (event: FormEvent<HTMLFormElement>) => void;
  resume: () => void;
  recordResult: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const input = "mt-2 min-h-11 w-full rounded-md border border-[#a9bdb9] px-3 text-sm font-semibold outline-none focus:border-[#087c78] focus:ring-2 focus:ring-[#087c78]/15";
  const primary = "min-h-11 rounded-md bg-[#087c78] px-5 text-sm font-black text-white transition hover:bg-[#065e5b]";

  if (["Reçu", "En cours d’examen", "Pris en charge"].includes(situation.status)) {
    return (
      <div>
        <p className="text-sm font-bold leading-6 text-[#435f5a]">La coordination doit d’abord définir l’intervention et son échéance.</p>
        <div className="mt-4"><SecondaryLink href={`/coordinateur/situations/${situation.id}`}>Voir la préparation</SecondaryLink></div>
      </div>
    );
  }
  if (situation.status === "Intervention prévue") {
    return <button type="button" onClick={start} className={primary}>Démarrer l’intervention</button>;
  }
  if (situation.status === "En attente") {
    return (
      <div>
        <div className="rounded-md border border-[#d4a65d] bg-[#fff7e9] p-4">
          <p className="text-xs font-black text-[#79551e]">Motif : {situation.waitingReason}</p>
        </div>
        <button type="button" onClick={resume} className={`${primary} mt-4`}>Reprendre l’intervention</button>
      </div>
    );
  }
  if (situation.status === "Intervention en cours" && !situation.resultRecorded) {
    return (
      <div className="space-y-6">
        <form onSubmit={pause} className="rounded-md border border-[#d9c08b] bg-[#fffbf2] p-4">
          <label className="text-xs font-black text-[#624e27]">
            Si l’intervention est bloquée
            <input name="waitingReason" defaultValue="La pièce de remplacement n’est pas disponible sur le site." className={input} />
          </label>
          <button type="submit" className="mt-3 min-h-10 rounded-md border border-[#b89045] bg-white px-4 text-xs font-black text-[#765718]">Signaler un blocage</button>
        </form>
        <form onSubmit={recordResult} className="rounded-md border border-[#8db5ae] bg-[#f4faf8] p-4">
          <p className="text-xs font-black text-[#28564f]">Lorsque la machine fonctionne à nouveau</p>
          <label className="mt-4 block text-xs font-black text-[#345c55]">
            Note de résultat
            <textarea name="resultNote" rows={3} defaultValue="Le contacteur a été remplacé. La machine produit à nouveau de la glace après deux cycles de test." className={`${input} py-3`} />
          </label>
          <label className="mt-4 block text-xs font-black text-[#345c55]">
            Élément de confirmation
            <input name="confirmation" defaultValue="Photo de la glace produite et compte rendu signé par le gestionnaire du site." className={input} />
          </label>
          <button type="submit" className={`${primary} mt-4`}>Déclarer la fin de l’intervention</button>
        </form>
      </div>
    );
  }
  if (situation.status === "Intervention en cours" && situation.resultRecorded) {
    return (
      <div>
        <p className="text-sm font-bold leading-6 text-[#3b5e57]">Le résultat a été transmis. La coordination doit maintenant le constater et clôturer la situation.</p>
        <div className="mt-4"><PrimaryLink href={`/coordinateur/situations/${situation.id}`}>Faire constater le résultat</PrimaryLink></div>
      </div>
    );
  }
  return <EmptyState title="Intervention terminée" detail="La coordination a constaté le résultat et clôturé la situation." />;
}
