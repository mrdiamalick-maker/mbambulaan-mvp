"use client";

import { useState } from "react";
import { Cell, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ProgrammeHealthState, ProgrammePortfolioRow } from "@/domain/programme-intelligence";
import { programmeHealthLabel } from "@/domain/programme-intelligence";
import type { ProductState } from "@/domain/types";

// LOT V3.5 (mandat §3, "Portfolio scatter / visual prioritization") —
// première utilisation réelle d'un scatter/bubble recharts dans le
// Produit, même fondation que TrendChart/BarMetricChart (V3.1/V3.2) :
// ChartContainer/ChartTooltip déjà présents, aucune nouvelle dépendance.
//
// Axes retenus (mandat §3, "every visual encoding must be explainable") —
// chacun documenté dans domain/programme-intelligence.ts (portfolioRows) :
//  - X = progression moyenne des indicateurs réels du programme (%) ;
//  - Y = SELON LE MODE (LOT V3.30, "copie conforme littérale" — la
//    maquette porte un bascule "Avancement × signaux"/"Avancement ×
//    budget" jamais implémenté jusqu'ici) :
//     · "signaux" (mode par défaut de la maquette) : nombre RÉEL de
//       situations ouvertes sur les territoires du programme
//       (row.ecosystem.openSituations.length, déjà réel — programme-
//       intelligence.ts) — jamais un "signal" inventé ;
//     · "budget" : part du budget chiffré effectivement confirmée (%) —
//       Catégorie C assumée (Funding[] est Demo World, jamais un
//       décaissement réel), mode par défaut historique de ce composant ;
//  - couleur = santé déterministe (programmeHealth) ;
//  - taille de bulle = nombre de territoires réels couverts (jamais le
//    "montant identifié" que porte la légende de la maquette — la
//    maquette dérive donc la taille d'un champ que nous choisissons de ne
//    PAS reprendre pour cet encodage ; le libellé de légende reste fidèle
//    à ce que ce composant affiche RÉELLEMENT plutôt que de recopier un
//    texte qui décrirait un encodage que nous ne portons pas — même
//    discipline que le panneau budgétaire de la page Programmes) ;
//  - anneau pointillé = "écart entre trajectoire déclarée et signaux
//    reçus" (texte littéral de la maquette) : porté par les programmes en
//    état "attention" (programmeHealth), jamais par "critique" (déjà
//    visuellement distingué par sa couleur rouge) ni "aligné".
// Un programme sans indicateur (ou, en mode "budget", sans budget
// chiffré) est EXCLU de ce graphe plutôt que placé arbitrairement à 0
// (mandat §3, "no opaque score" — 0% affirmerait une mesure qui n'existe
// pas) ; sa présence reste visible dans le portefeuille en liste, avec la
// mention "non mesuré"/"budget à estimer" honnête.
const healthColor: Record<ProgrammeHealthState, string> = {
  aligne: "var(--mb-success, #4e7b5a)",
  attention: "var(--etat-ocre, #d89a4a)",
  critique: "var(--etat-critique, #c8452b)"
};

const chartConfig: ChartConfig = {
  progress: { label: "Progression des indicateurs", color: "var(--chart-1)" }
};

type AxisMode = "signaux" | "budget";

export function ProgrammePortfolioScatter({
  rows,
  state,
  onSelect,
  selectedId
}: {
  rows: ProgrammePortfolioRow[];
  state: ProductState;
  onSelect?: (id: string) => void;
  selectedId?: string;
}) {
  const [axisMode, setAxisMode] = useState<AxisMode>("signaux");
  const plottable = rows.filter((row) => row.progressPct !== null && (axisMode === "signaux" || row.budgetConfirmedPct !== null));
  const excludedCount = rows.length - plottable.length;

  const data = plottable.map((row) => ({
    id: row.initiative.id,
    title: row.initiative.title,
    ownerName: state.actors.find((actor) => actor.id === row.initiative.ownerId)?.name,
    x: row.progressPct!,
    y: axisMode === "signaux" ? row.ecosystem.openSituations.length : row.budgetConfirmedPct!,
    z: Math.max(1, row.territoryCount),
    territoryCount: row.territoryCount,
    health: row.health.state,
    flagged: row.health.state === "attention"
  }));
  const yMax = axisMode === "signaux" ? Math.max(1, ...data.map((point) => point.y)) : 100;

  if (plottable.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {axisMode === "signaux"
          ? "Aucun programme ne porte d’indicateurs pour le moment — le scatter portefeuille apparaîtra dès qu’une progression sera documentée."
          : "Aucun programme ne porte à la fois des indicateurs et un budget chiffré pour le moment — le scatter portefeuille apparaîtra dès que ces deux dimensions seront documentées."}
      </div>
    );
  }

  return (
    <div>
      {/* Bascule "Avancement × signaux" / "Avancement × budget" — littérale
          de la maquette (2 boutons, fond marine sur le mode actif). */}
      <div className="mb-3 inline-flex overflow-hidden rounded border" style={{ borderColor: "rgba(11,26,42,.16)" }}>
        {([
          { key: "signaux", label: "Avancement × signaux" },
          { key: "budget", label: "Avancement × budget" }
        ] as const).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setAxisMode(option.key)}
            className="px-3 py-1.5 text-[11px] transition-colors"
            style={{ background: axisMode === option.key ? "var(--etat-navy)" : "transparent", color: axisMode === option.key ? "#F7F3E9" : "rgba(11,26,42,.65)" }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Progression" unit="%" domain={[0, 100]} tickLine={false} axisLine={false} label={{ value: "Avancement déclaré (%)", position: "insideBottom", offset: -4, fontSize: 10 }} />
          {axisMode === "signaux" ? (
            <YAxis type="number" dataKey="y" name="Signaux terrain" domain={[0, yMax]} allowDecimals={false} tickLine={false} axisLine={false} label={{ value: "Signaux terrain ouverts", angle: -90, position: "insideLeft", fontSize: 10 }} />
          ) : (
            <YAxis type="number" dataKey="y" name="Budget confirmé" unit="%" domain={[0, 100]} tickLine={false} axisLine={false} label={{ value: "Budget confirmé (%)", angle: -90, position: "insideLeft", fontSize: 10 }} />
          )}
          <ZAxis type="number" dataKey="z" range={[80, 500]} name="Territoires" />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-lg border bg-background p-2.5 text-xs shadow-md">
                  <p className="font-semibold">{point.title}</p>
                  <p className="mt-1 text-muted-foreground">
                    {point.x}% d’avancement · {axisMode === "signaux" ? `${point.y} signal(aux) terrain ouvert(s)` : `${point.y}% du budget confirmé`}
                  </p>
                  <p className="text-muted-foreground">{point.ownerName ?? "Responsable non désigné"} · {point.territoryCount} territoire(s) · {programmeHealthLabel[point.health]}</p>
                </div>
              );
            }}
          />
          <Scatter
            data={data}
            onClick={(point) => onSelect?.((point as unknown as { id: string }).id)}
            style={{ cursor: onSelect ? "pointer" : undefined }}
          >
            {data.map((point) => (
              <Cell
                key={point.id}
                fill={healthColor[point.health]}
                fillOpacity={selectedId && point.id !== selectedId ? 0.35 : 0.82}
                stroke={point.id === selectedId ? "var(--foreground)" : point.flagged ? healthColor.attention : "transparent"}
                strokeWidth={point.id === selectedId ? 2 : point.flagged ? 1.5 : 0}
                strokeDasharray={!selectedId || point.id !== selectedId ? (point.flagged ? "3 2" : undefined) : undefined}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ChartContainer>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: healthColor.aligne }} /> Aligné</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: healthColor.attention }} /> Attention à prévoir</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: healthColor.critique }} /> Attention requise</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full border border-dashed" style={{ borderColor: healthColor.attention }} /> Écart entre trajectoire déclarée et signaux reçus</span>
        <span className="flex-1" />
        <span>Taille de bulle = territoires couverts</span>
      </div>
      {excludedCount > 0 && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{excludedCount} programme(s) non représenté(s) ici ({axisMode === "signaux" ? "indicateurs pas encore chiffrés" : "indicateurs ou budget pas encore chiffrés"}) — visibles dans la liste ci-dessous.</p>
      )}
    </div>
  );
}
