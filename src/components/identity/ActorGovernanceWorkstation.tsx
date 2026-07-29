"use client";

import { useEffect, useState } from "react";

type GovernanceView = {
  generatedAt: string;
  metrics: Record<string, number>;
  attentionQueue: {
    applicationsToReview: Array<{ id: string; personOrOrganizationName: string; actorKind: string; status: string }>;
    expiringMandates: Array<{ id: string; actorId: string; validUntil?: string; roleCodes: string[] }>;
    restrictedMandates: Array<{ id: string; actorId: string; restrictions: string[] }>;
    suspendedMandates: Array<{ id: string; actorId: string }>;
    expiredMandates: Array<{ id: string; actorId: string }>;
    roleConflicts: Array<{ mandateId: string; actorId: string; conflictingRoles: string[] }>;
  };
  persistence: string;
};

export function ActorGovernanceWorkstation() {
  const [view, setView] = useState<GovernanceView>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch("/api/v1/actor-governance/atlas", { headers: { "x-demo-identity-id": "demo-government-supervisor" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("La vue de gouvernance des acteurs est indisponible.");
        return response.json() as Promise<GovernanceView>;
      })
      .then(setView)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  if (error) return <main className="mx-auto max-w-6xl p-8"><h1 className="text-3xl font-semibold">Gouvernance des acteurs</h1><p className="mt-6">{error}</p></main>;
  if (!view) return <main className="mx-auto max-w-6xl p-8"><h1 className="text-3xl font-semibold">Gouvernance des acteurs</h1><p className="mt-6">Chargement des mandats et décisions…</p></main>;

  const cards = [
    ["Demandes à traiter", view.metrics.pendingApplicationCount ?? 0],
    ["Mandats actifs", view.metrics.activeMandateCount ?? 0],
    ["À renouveler sous 30 jours", view.metrics.expiringWithin30DaysCount ?? 0],
    ["Mandats restreints", view.metrics.restrictedMandateCount ?? 0],
    ["Mandats suspendus", view.metrics.suspendedMandateCount ?? 0],
    ["Conflits de rôles", view.metrics.roleConflictCount ?? 0],
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <header>
        <p className="text-sm uppercase tracking-widest">Government · Identité et confiance</p>
        <h1 className="mt-2 text-4xl font-semibold">Gouvernance des acteurs</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Qui peut agir, pour quelle organisation, sur quel territoire, avec quel mandat et jusqu’à quelle date.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => <article key={String(label)} className="rounded-2xl border p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></article>)}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Queue title="Demandes à examiner" items={view.attentionQueue.applicationsToReview.map((item) => `${item.personOrOrganizationName} · ${item.actorKind} · ${item.status}`)} />
        <Queue title="Renouvellements à anticiper" items={view.attentionQueue.expiringMandates.map((item) => `${item.actorId} · ${item.roleCodes.join(", ")} · échéance ${item.validUntil ?? "non renseignée"}`)} />
        <Queue title="Restrictions et suspensions" items={[...view.attentionQueue.restrictedMandates.map((item) => `${item.actorId} · ${item.restrictions.join(" ; ")}`), ...view.attentionQueue.suspendedMandates.map((item) => `${item.actorId} · mandat suspendu`)]} />
        <Queue title="Conflits de rôles" items={view.attentionQueue.roleConflicts.map((item) => `${item.actorId} · ${item.conflictingRoles.join(" / ")}`)} />
      </section>

      <p className="text-sm text-slate-500">Source : {view.persistence === "postgres" ? "journal PostgreSQL" : "mémoire de démonstration"}.</p>
    </main>
  );
}

function Queue({ title, items }: { title: string; items: string[] }) {
  return <article className="rounded-2xl border p-6"><h2 className="text-xl font-semibold">{title}</h2>{items.length ? <ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="rounded-xl bg-slate-50 p-3 text-sm">{item}</li>)}</ul> : <p className="mt-4 text-sm text-slate-500">Aucun élément nécessitant une action.</p>}</article>;
}
