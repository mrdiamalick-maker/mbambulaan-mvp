"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// LOT V3.2 (Scope E validation, mandat "this lot should be the first real
// validation of the interactive chart foundation") — première utilisation
// PRODUIT de recharts/ChartContainer (posés au LOT V3.1 mais seulement
// testés hors écran réel jusqu'ici, cf. src/components/private/TrendChart.tsx).
// Un seul composant plutôt que deux graphiques à barres écrits à la main
// (funnel + ancienneté, /app/situations) : même survol/info-bulle réels
// pour les deux, jamais un SVG statique de plus.
export type BarMetricPoint = { key: string; label: string; value: number; tone?: string };

const chartConfig: ChartConfig = {
  value: { label: "Valeur", color: "var(--chart-1)" }
};

export function BarMetricChart({
  data,
  height = 140,
  valueLabel,
  onSelect,
  selectedKey
}: {
  data: BarMetricPoint[];
  height?: number;
  valueLabel: string;
  /** LOT V3.6 (mandat §17, "selection in one chart may filter/highlight
   *  another") — prop additive, défaut undefined : aucun changement pour
   *  les appelants existants (funnel/ancienneté, /app/situations) qui ne
   *  la passent pas. */
  onSelect?: (key: string) => void;
  selectedKey?: string;
}) {
  return (
    <ChartContainer config={chartConfig} style={{ height }} className="w-full">
      <BarChart data={data} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} fontSize={10.5} />
        <YAxis hide />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent labelKey="label" formatter={(value) => [`${value} ${valueLabel}`, undefined]} />}
        />
        <Bar
          dataKey="value"
          radius={[3, 3, 0, 0]}
          onClick={onSelect ? (point: BarMetricPoint) => onSelect(point.key) : undefined}
          style={{ cursor: onSelect ? "pointer" : undefined }}
        >
          {data.map((point) => (
            <Cell key={point.key} fill={point.tone ?? "var(--color-value)"} fillOpacity={!selectedKey || selectedKey === point.key ? 1 : 0.35} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
