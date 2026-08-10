"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, MapPinned, Send } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { MinistryHero } from "@/components/ministry/MinistryHero";
import {
  vigilanceCategoryLabels,
  vigilanceSeverityLabels,
  vigilanceStatusLabels,
  type VigilanceCase,
  type VigilanceCategory,
  type VigilanceSeverity,
  type VigilanceStatus
} from "@/domain/ministry/vigilance";

const categoryOptions = Object.entries(vigilanceCategoryLabels) as [VigilanceCategory, string][];
const severityOptions = Object.entries(vigilanceSeverityLabels) as [VigilanceSeverity, string][];
const statusOptions = Object.entries(vigilanceStatusLabels) as [VigilanceStatus, string][];

const severityStyle: Record<VigilanceSeverity, string> = {
  faible: "op-badge--neutral",
  moyenne: "op-badge--warning",
  haute: "op-badge--danger",
  critique: "op-badge--critical"
};

export default function MinistryVigilancePage() {
  const { state } = useProduct();
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<VigilanceCategory>("immigration_clandestine");
  const [territoryId, setTerritoryId] = useState("");
  const [severity, setSeverity] = useState<VigilanceSeverity>("moyenne");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const response = await fetch("/api/ministry/vigilance");
    if (response.ok) setCases((await response.json()).cases ?? []);
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
      const response = await fetch("/api/ministry/vigilance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, territoryId, severity, description })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Impossible d'enregistrer ce signalement.");
        return;
      }
      setTerritoryId("");
      setDescription("");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: VigilanceStatus) => {
    await fetch("/api/ministry/vigilance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    await load();
  };

  if (!state) return null;
  const openCount = cases.filter((item) => item.status !== "clos").length;
  const criticalCount = cases.filter((item) => item.severity === "critique" && item.status !== "clos").length;

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <MinistryHero
        eyebrow="Vigilance & fléaux"
        title="Suivre l'immigration clandestine et les situations à risque."
        description="Un signalement n'est pas une qualification judiciaire : c'est une entrée tracée dans un dispositif de suivi, jusqu'à transmission aux autorités compétentes."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="op-card p-5"><p className="op-stat-value text-3xl">{openCount}</p><p className="op-stat-label mt-1">Signalements ouverts</p></div>
        <div className="op-card p-5"><p className="op-stat-value text-3xl text-[var(--op-critical-600)]">{criticalCount}</p><p className="op-stat-label mt-1">Dont gravité critique</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="op-card p-5">
          <p className="op-stat-label">Signalements</p>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--op-ink-400)]">Chargement…</p>
          ) : cases.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--op-ink-400)]">Aucun signalement enregistré pour le moment.</p>
          ) : (
            <div className="mt-4 divide-y divide-[var(--op-surface-line-soft)]">
              {cases.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`op-badge ${severityStyle[item.severity]}`}><AlertTriangle size={11} className="mr-0.5" />{vigilanceSeverityLabels[item.severity]}</span>
                        <span className="text-xs font-bold text-[var(--op-ink-700)]">{vigilanceCategoryLabels[item.category]}</span>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--op-ink-500)]"><MapPinned size={13} /> {item.territoryLabel}</p>
                      <p className="mt-1.5 text-sm text-[var(--op-ink-700)]">{item.description}</p>
                    </div>
                    <select
                      value={item.status}
                      onChange={(event) => void updateStatus(item.id, event.target.value as VigilanceStatus)}
                      className="op-badge op-badge--neutral shrink-0 border-0 outline-none"
                    >
                      {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="op-card p-5">
          <p className="op-stat-label">Signaler une situation</p>
          <label className="mt-4 block text-xs font-bold text-[var(--op-ink-700)]">
            Catégorie
            <select value={category} onChange={(event) => setCategory(event.target.value as VigilanceCategory)} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]">
              {categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold text-[var(--op-ink-700)]">
            Territoire
            <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]">
              <option value="">Sélectionner…</option>
              {state.territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold text-[var(--op-ink-700)]">
            Gravité
            <select value={severity} onChange={(event) => setSeverity(event.target.value as VigilanceSeverity)} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]">
              {severityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold text-[var(--op-ink-700)]">
            Description
            <textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1.5 w-full rounded-[var(--op-radius-sm)] border border-[var(--op-surface-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--op-signal-500)]" placeholder="Ce qui a été observé, où et par qui." />
          </label>
          {error && <p className="mt-3 text-xs font-semibold text-[var(--op-danger-600)]">{error}</p>}
          <button disabled={submitting} className="op-btn op-btn-primary mt-4 w-full justify-center disabled:opacity-60">
            Signaler <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
