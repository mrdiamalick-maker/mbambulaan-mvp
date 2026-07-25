"use client";

import { computeDecisionMetrics, DEMO_SITUATION_ID } from "@/lib/coordination-demo";
import { CoordinationShell, PrimaryLink, SecondaryLink } from "./CoordinationShell";
import { useCoordinationDemo } from "./CoordinationDemoProvider";
import { Metric, NextStep, Panel, Progress, SituationCard, SituationFacts, StatusPill, Timeline, UrgencyPill } from "./CoordinationUI";

export function DecisionHome() {
  const { situations } = useCoordinationDemo();
  const metrics = computeDecisionMetrics(situations);
  const solvedRate = Math.round((metrics.solved / Math.max(metrics.total, 1)) * 100);
  const critical = situations.filter((item) => item.urgency === "Élevée" && item.status !== "Réglé");
  const solved = situations.filter((item) => item.status === "Réglé");

  return (
    <CoordinationShell
      eyebrow="Décideur / Ministère"
      title="Voir ce qui est bloqué, en retard ou réellement résolu"
      intro="Une lecture principalement consultative des délais, responsabilités et résultats constatés."
      action={<PrimaryLink href={`/pilotage/situations/${DEMO_SITUATION_ID}`}>Suivre la panne de Mbao</PrimaryLink>}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Situations suivies" value={metrics.total} detail="Périmètre de démonstration" />
        <Metric label="En cours" value={metrics.active} detail="Réponse à poursuivre" />
        <Metric label="Critiques" value={metrics.critical} detail="Urgence élevée" tone="coral" />
        <Metric label="En attente" value={metrics.waiting} detail="Blocage documenté" tone="amber" />
        <Metric label="Réglées" value={metrics.solved} detail="Résultat constaté" tone="green" />
        <Metric label="Taux de résolution" value={`${solvedRate}%`} detail="Sur le jeu local" tone="green" />
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Situations critiques" intro="Urgences élevées qui nécessitent encore une réponse.">
          <div className="grid gap-3 lg:grid-cols-2">
            {critical.map((situation) => (
              <SituationCard key={situation.id} situation={situation} href={`/pilotage/situations/${situation.id}`} />
            ))}
          </div>
        </Panel>
        <Panel title="Lecture des résultats" intro="Répartition simple des situations du périmètre.">
          <div className="space-y-4">
            <DistributionBar label="Réglées" value={metrics.solved} total={metrics.total} color="bg-[#4d8d68]" />
            <DistributionBar label="En cours de réponse" value={metrics.active - metrics.waiting} total={metrics.total} color="bg-[#258d82]" />
            <DistributionBar label="En attente" value={metrics.waiting} total={metrics.total} color="bg-[#c79437]" />
          </div>
          <p className="mt-5 text-[10px] font-semibold leading-4 text-[#778884]">Indicateurs calculés uniquement à partir des données déterministes de la démonstration.</p>
        </Panel>
      </div>

      <Panel title="Résultats récemment constatés" intro="Chaque clôture comporte une note, une date et un élément de confirmation." className="mt-5">
        <div className="grid gap-3 lg:grid-cols-3">
          {solved.map((situation) => (
            <SituationCard key={situation.id} situation={situation} href={`/pilotage/situations/${situation.id}`} />
          ))}
        </div>
      </Panel>
    </CoordinationShell>
  );
}

function DistributionBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = Math.round((value / Math.max(total, 1)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#3b5b55]">
        <span>{label}</span>
        <span>{value} · {percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ecea]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function DecisionSituationDetail({ id }: { id: string }) {
  const { getSituation } = useCoordinationDemo();
  const situation = getSituation(id);

  if (!situation) {
    return (
      <CoordinationShell eyebrow="Pilotage" title="Situation introuvable" intro="Cette situation n’existe pas dans les données locales.">
        <PrimaryLink href="/pilotage">Retour aux indicateurs</PrimaryLink>
      </CoordinationShell>
    );
  }

  return (
    <CoordinationShell
      eyebrow="Lecture décideur"
      title={situation.title}
      intro={`${situation.id} · ${situation.site}`}
      action={<SecondaryLink href="/pilotage">Retour au pilotage</SecondaryLink>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Panel title="Situation et responsabilité">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={situation.status} />
              <UrgencyPill urgency={situation.urgency} />
            </div>
            <p className="mt-5 text-sm font-medium leading-6 text-[#48635e]">{situation.description}</p>
            <div className="mt-5"><SituationFacts situation={situation} /></div>
          </Panel>
          <Panel title="Progression et délai">
            <Progress status={situation.status} />
            <div className="mt-6"><NextStep situation={situation} /></div>
          </Panel>
          {situation.waitingReason ? (
            <Panel title="Motif de l’attente">
              <p className="rounded-md border border-[#d3a862] bg-[#fff7e8] p-4 text-sm font-bold text-[#78551f]">{situation.waitingReason}</p>
            </Panel>
          ) : null}
          {situation.resultNote ? (
            <Panel title="Résultat constaté">
              <div className="rounded-md border border-[#80ae8e] bg-[#eff8f1] p-5">
                <p className="text-sm font-black leading-6 text-[#295c39]">{situation.resultNote}</p>
                <p className="mt-3 text-xs font-semibold leading-5 text-[#57745f]">Élément de confirmation : {situation.confirmation}</p>
              </div>
            </Panel>
          ) : null}
        </div>
        <Panel title="Chronologie de la réponse" intro="Responsabilités et étapes visibles sans modifier le parcours opérationnel.">
          <Timeline situation={situation} />
        </Panel>
      </div>
    </CoordinationShell>
  );
}
