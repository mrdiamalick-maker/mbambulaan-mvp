"use client";

import { Cell, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ProgrammeHealthState, ProgrammePortfolioRow } from "@/domain/programme-intelligence";
import { programmeHealthLabel } from "@/domain/programme-intelligence";

// LOT V3.5 (mandat §3, "Portfolio scatter / visual prioritization") —
// première utilisation réelle d'un scatter/bubble recharts dans le
// Produit, même fondation que TrendChart/BarMetricChart (V3.1/V3.2) :
// ChartContainer/ChartTooltip déjà présents, aucune nouvelle dépendance.
//
// Axes retenus (mandat §3, "every visual encoding must be explainable") —
// chacun documenté dans domain/programme-intelligence.ts (portfolioRows) :
//  - X = progression moyenne des indicateurs réels du programme (%) ;
//  - Y = part du budget chiffré effectivement confirmée (%) — Catégorie C
//    assumée (Funding[] est Demo World, jamais un décaissement réel) ;
//  - couleur = santé déterministe (programmeHealth) ;
//  - taille de bulle = nombre de territoires réels couverts.
// Un programme sans indicateur ou sans budget chiffré est EXCLU de ce
// graphe plutôt que placé arbitrairement à 0 (mandat §3, "no opaque
// score" — 0% affirmerait une mesure qui n'existe pas) ; sa présence
// reste visible dans le portefeuille en liste, avec la mention "non
// mesuré"/"budget à estimer" honnête.
const healthColor: Record<ProgrammeHealthState, string> = {
  aligne: "var(--mb-success, #4e7b5a)",
  attention: "var(--etat-ocre, #d89a4a)",
  critique: "var(--etat-critique, #c8452b)"
};

const chartConfig: ChartConfig = {
  progress: { label: "Progression des indicateurs", color: "var(--chart-1)" }
};

export function ProgrammePortfolioScatter({ rows, onSelect, selectedId }: { rows: ProgrammePortfolioRow[]; onSelect?: (id: string) => void; selectedId?: string }) {
  const plottable = rows.filter((row) => row.progressPct !== null && row.budgetConfirmedPct !== null);
  const excludedCount = rows.length - plottable.length;

  if (plottable.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Aucun programme ne porte à la fois des indicateurs et un budget chiffré pour le moment — le scatter portefeuille apparaîtra dès que ces deux dimensions seront documentées.
      </div>
    );
  }

  const data = plottable.map((row) => ({
    id: row.initiative.id,
    title: row.initiative.title,
    x: row.progressPct!,
    y: row.budgetConfirmedPct!,
    z: Math.max(1, row.territoryCount),
    health: row.health.state
  }));

  return (
    <div>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Progression" unit="%" domain={[0, 100]} tickLine={false} axisLine={false} label={{ value: "Progression des indicateurs (%)", position: "insideBottom", offset: -4, fontSize: 10 }} />
          <YAxis type="number" dataKey="y" name="Budget confirmé" unit="%" domain={[0, 100]} tickLine={false} axisLine={false} label={{ value: "Budget confirmé (%)", angle: -90, position: "insideLeft", fontSize: 10 }} />
          <ZAxis type="number" dataKey="z" range={[80, 500]} name="Territoires" />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-lg border bg-background p-2.5 text-xs shadow-md">
                  <p className="font-semibold">{point.title}</p>
                  <p className="mt-1 text-muted-foreground">{point.x}% des indicateurs · {point.y}% du budget confirmé</p>
                  <p className="text-muted-foreground">{point.z} territoire(s) · {programmeHealthLabel[point.health]}</p>
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
                stroke={point.id === selectedId ? "var(--foreground)" : "transparent"}
                strokeWidth={point.id === selectedId ? 2 : 0}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ChartContainer>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: healthColor.aligne }} /> Aligné</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: healthColor.attention }} /> Attention à prévoir</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: healthColor.critique }} /> Attention requise</span>
        <span className="flex-1" />
        <span>Taille de bulle = territoires couverts</span>
      </div>
      {excludedCount > 0 && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{excludedCount} programme(s) non représenté(s) ici (indicateurs ou budget pas encore chiffrés) — visibles dans la liste ci-dessous.</p>
      )}
    </div>
  );
}
