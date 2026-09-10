"use client";

// LOT V3.5 ("Programme Portfolio & Cockpit") — surface d'ensemble du
// portefeuille, même architecture maître-détail que SituationsExplorer
// (V3.2) : vue d'ensemble (stats + scatter/bubble) + registre compact +
// détail progressif (ProgrammeCockpit), avec la même discipline de
// drill-down mobile (masquer la vue d'ensemble ET le registre quand un
// détail est ouvert sous lg — bug trouvé et corrigé sur ce même schéma en
// V3.1/V3.2/V3.3, jamais réintroduit ici).
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { CommandInput, Initiative, ProductState, Role } from "@/domain/types";
import { portfolioRows, portfolioStats, programmeHealthLabel, type ProgrammeHealthState } from "@/domain/programme-intelligence";
import { StatusChip } from "@/components/private/primitives";
import { ProgrammePortfolioScatter } from "@/components/programmes/ProgrammePortfolioScatter";
import { ProgrammeCockpit } from "@/components/programmes/ProgrammeCockpit";

const money = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "XOF", maximumFractionDigits: 0 });

const initiativeStatusLabel: Record<Initiative["status"], string> = { cadrage: "Cadrage", financee: "Financée", execution: "Exécution", terminee: "Terminée" };
const healthTone: Record<ProgrammeHealthState, "success" | "warning" | "critical"> = { aligne: "success", attention: "warning", critique: "critical" };

export function ProgrammesExplorer({
  state,
  role,
  run,
  selectedId,
  onSelect,
  onOpenOpportunity
}: {
  state: ProductState;
  role: Role;
  run: (command: CommandInput) => Promise<unknown>;
  /** Programme présélectionné (deep-link /app/initiatives/<id>, mandat §16
   *  "must still be able to find a programme... open detail"). */
  selectedId?: string;
  /** Navigue réellement (jamais un état local qui déconnecterait la vue de
   *  son adresse — même discipline que SituationsExplorer, mandat §17
   *  "deep links must continue to function"). */
  onSelect: (id: string) => void;
  onOpenOpportunity?: (id: string) => void;
}) {
  const [territoryFilter, setTerritoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Initiative["status"] | "all">("all");
  const [healthFilter, setHealthFilter] = useState<ProgrammeHealthState | "all">("all");

  const rows = useMemo(() => portfolioRows(state), [state]);
  const stats = useMemo(() => portfolioStats(state, rows), [state, rows]);

  const filteredRows = rows.filter((row) =>
    (!territoryFilter || row.initiative.territoryIds.includes(territoryFilter)) &&
    (statusFilter === "all" || row.initiative.status === statusFilter) &&
    (healthFilter === "all" || row.health.state === healthFilter)
  );

  const requestedRow = selectedId ? rows.find((row) => row.initiative.id === selectedId) : undefined;
  const programmeNotFound = Boolean(selectedId) && !requestedRow;
  const activeRow = selectedId ? requestedRow : filteredRows[0];

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble — masquée sous lg quand un programme est ouvert
          (même correctif que Situations/Flux, jamais réintroduit ici). */}
      <div className={selectedId ? "hidden lg:block" : undefined}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
            <Stat value={stats.active} label="programme(s) actif(s)" />
            <Stat value={stats.attentionOrCritical} label="nécessitent une attention" tone="var(--etat-ocre, #d89a4a)" />
            <Stat value={stats.territoriesCovered} label="territoire(s) couvert(s)" />
            <div className="p-4"><p className="font-mono text-2xl leading-none">{money.format(stats.totalBudgetFcfa)}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">budget chiffré{stats.toEstimateCount > 0 ? ` (hors ${stats.toEstimateCount} à estimer)` : ""}</p></div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portefeuille — progression × financement confirmé</p>
            <ProgrammePortfolioScatter rows={rows} selectedId={activeRow?.initiative.id} onSelect={onSelect} />
          </div>

          <div className="flex flex-wrap items-end gap-4 border-y py-4">
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Territoire</p>
              <select value={territoryFilter} onChange={(event) => setTerritoryFilter(event.target.value)} className="mt-1 rounded-md border bg-background py-1 pl-0 pr-6 text-sm font-semibold outline-none focus:border-primary">
                <option value="">Sénégal entier</option>
                {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
              </select>
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statut</p>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Initiative["status"] | "all")} className="mt-1 rounded-md border bg-background py-1 pl-0 pr-6 text-sm font-semibold outline-none focus:border-primary">
                <option value="all">Tous les statuts</option>
                {(["cadrage", "financee", "execution", "terminee"] as const).map((status) => <option key={status} value={status}>{initiativeStatusLabel[status]}</option>)}
              </select>
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attention</p>
              <select value={healthFilter} onChange={(event) => setHealthFilter(event.target.value as ProgrammeHealthState | "all")} className="mt-1 rounded-md border bg-background py-1 pl-0 pr-6 text-sm font-semibold outline-none focus:border-primary">
                <option value="all">Tous les niveaux</option>
                <option value="aligne">{programmeHealthLabel.aligne}</option>
                <option value="attention">{programmeHealthLabel.attention}</option>
                <option value="critique">{programmeHealthLabel.critique}</option>
              </select>
            </label>
            <span className="ml-auto text-sm text-muted-foreground">{filteredRows.length} programme(s) sur {rows.length} au total.</span>
          </div>
        </div>
      </div>

      <div className="grid gap-0 overflow-hidden rounded-lg border lg:grid-cols-[360px_1fr]">
        <div className={`min-w-0 divide-y border-b lg:border-b-0 lg:border-r ${selectedId ? "hidden lg:block" : ""}`}>
          {filteredRows.length === 0 ? (
            <p className="p-6 text-sm leading-6 text-muted-foreground">Aucun programme ne correspond à ces filtres.</p>
          ) : (
            filteredRows.map((row) => <ProgrammeListRow key={row.initiative.id} row={row} active={activeRow?.initiative.id === row.initiative.id} onOpen={() => onSelect(row.initiative.id)} />)
          )}
        </div>

        <div className={`min-w-0 p-5 lg:p-6 ${selectedId ? "" : "hidden lg:block"}`}>
          {selectedId && <button onClick={() => onSelect("")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground lg:hidden"><ArrowLeft size={15} /> Portefeuille</button>}
          {programmeNotFound ? (
            <p className="text-sm text-muted-foreground">Programme introuvable.</p>
          ) : activeRow ? (
            <ProgrammeCockpit initiative={activeRow.initiative} state={state} role={role} run={run} canAct onOpenOpportunity={onOpenOpportunity} />
          ) : (
            <p className="text-sm text-muted-foreground">Sélectionnez un programme pour en voir le détail.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <div className="p-4">
      <p className="font-mono text-2xl leading-none" style={tone ? { color: tone } : undefined}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function ProgrammeListRow({ row, active, onOpen }: { row: ReturnType<typeof portfolioRows>[number]; active: boolean; onOpen: () => void }) {
  const { initiative, health, progressPct } = row;
  return (
    <button type="button" onClick={onOpen} className="block w-full px-4 py-3.5 text-left transition" style={active ? { background: "rgba(29,68,104,.06)", boxShadow: "inset 3px 0 0 #1d4468" } : undefined}>
      <div className="flex items-center gap-2">
        <StatusChip tone={healthTone[health.state]}>{programmeHealthLabel[health.state]}</StatusChip>
        <span className="flex-1" />
        <span className="text-[10.5px] text-muted-foreground">{initiativeStatusLabel[initiative.status]}</span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-5">{initiative.title}</p>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{initiative.territoryIds.length} territoire(s)</span>
        <span aria-hidden="true">·</span>
        <span>{progressPct !== null ? `${progressPct}% des indicateurs` : "indicateurs non mesurés"}</span>
        <span className="flex-1" />
        <ChevronRight size={13} className="shrink-0" />
      </div>
    </button>
  );
}
