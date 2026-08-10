"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarClock, MapPinned, Send } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { MinistryHero } from "@/components/ministry/MinistryHero";
import {
  fieldVisitObjectiveLabels,
  fieldVisitStatusLabels,
  type FieldVisit,
  type FieldVisitObjective
} from "@/domain/ministry/field-visit";

const objectiveOptions = Object.entries(fieldVisitObjectiveLabels) as [FieldVisitObjective, string][];

export default function MinistryFieldVisitsPage() {
  const { state } = useProduct();
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [territoryId, setTerritoryId] = useState("");
  const [objective, setObjective] = useState<FieldVisitObjective>("rencontre_pecheurs");
  const [plannedAt, setPlannedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const response = await fetch("/api/ministry/field-visits");
    if (response.ok) setVisits((await response.json()).visits ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/ministry/field-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, territoryId, objective, plannedAt, notes: notes || undefined })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Impossible de planifier cette rencontre.");
        return;
      }
      setTitle("");
      setTerritoryId("");
      setPlannedAt("");
      setNotes("");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (!state) return null;

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <MinistryHero
        eyebrow="Terrain & rencontres"
        title="Aller sur le terrain, rencontrer les pêcheurs, garder la trace."
        description="Chaque mission planifiée donne au ministère une raison concrète de se déplacer — et un historique vérifiable des rencontres menées, territoire par territoire."
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="op-card p-5">
          <p className="op-stat-label">Missions</p>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--op-ink-400)]">Chargement…</p>
          ) : visits.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--op-ink-400)]">Aucune rencontre planifiée pour le moment — utilisez le formulaire pour en programmer une.</p>
          ) : (
            <div className="mt-4 divide-y divide-[var(--op-surface-line-soft)]">
              {visits.map((visit) => (
                <div key={visit.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-[var(--op-ink-900)]">{visit.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--op-ink-500)]"><MapPinned size={13} /> {visit.territoryLabel} · {fieldVisitObjectiveLabels[visit.objective]}</p>
                    {visit.notes && <p className="mt-1.5 text-xs text-[var(--op-ink-400)]">{visit.notes}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="flex items-center justify-end gap-1.5 text-xs font-semibold text-[var(--op-ink-700)]"><CalendarClock size={13} /> {new Date(visit.plannedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    <span className="op-badge op-badge--signal mt-2">{fieldVisitStatusLabels[visit.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="op-card p-5">
          <p className="op-stat-label">Planifier une rencontre</p>
          <label className="mt-4 block text-xs font-bold text-[var(--op-ink-700)]">
            Titre
            <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]" placeholder="Rencontre avec les capitaines de Joal" />
          </label>
          <label className="mt-3 block text-xs font-bold text-[var(--op-ink-700)]">
            Territoire
            <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]">
              <option value="">Sélectionner…</option>
              {state.territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold text-[var(--op-ink-700)]">
            Objectif
            <select value={objective} onChange={(event) => setObjective(event.target.value as FieldVisitObjective)} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]">
              {objectiveOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold text-[var(--op-ink-700)]">
            Date prévue
            <input required type="date" value={plannedAt} onChange={(event) => setPlannedAt(event.target.value)} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]" />
          </label>
          <label className="mt-3 block text-xs font-bold text-[var(--op-ink-700)]">
            Notes (facultatif)
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]" />
          </label>
          {error && <p className="mt-3 text-xs font-semibold text-[var(--op-danger-600)]">{error}</p>}
          <button disabled={submitting} className="op-btn op-btn-primary mt-4 w-full justify-center disabled:opacity-60">
            Planifier <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
