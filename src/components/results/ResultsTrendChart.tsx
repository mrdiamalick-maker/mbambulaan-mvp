"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// LOT V3.6 ("Results / Analytics") — remplace le SVG fait main de
// ResultTrendChart (components/etat/EtatDataVisualizations.tsx : deux
// <polyline> statiques, aucun survol/info-bulle) par un vrai graphique
// interactif recharts, même fondation que TrendChart/BarMetricChart/
// ProgrammePortfolioScatter (V3.1/V3.2/V3.5) : ChartContainer/
// ChartTooltip déjà présents, aucune nouvelle dépendance. Nouveau
// composant plutôt qu'une généralisation de TrendChart (mono-série,
// mono-axe) : deux séries à échelles différentes (minutes / pourcentage)
// exigent deux axes Y — même discipline que ProgrammePortfolioScatter,
// une forme de graphique réellement nouvelle méritant son propre
// composant plutôt qu'un TrendChart forcé à porter un second axe.
//
// Les données restées Demo World (mandat §6/§20, Catégorie C — aucune
// série temporelle réelle n'existe pour ce couple d'indicateurs, cf.
// domain/results-analytics.ts en tête de fichier) : ce composant reste
// générique (deux séries nommées), la donnée illustrative et sa mention
// honnête (ETAT_DEMO_SERIES_NOTICE) restent la responsabilité de
// l'appelant, jamais codées en dur ici.
export interface DualSeriesPoint {
  label: string;
  primary: number;
  secondary: number;
}

const chartConfig: ChartConfig = {
  primary: { label: "Délai médian de qualification (min)", color: "var(--etat-terracotta, #b6522f)" },
  secondary: { label: "Situations closes avec confirmation (%)", color: "var(--etat-navy, #0b1a2a)" }
};

export function ResultsTrendChart({ data, primaryUnit, secondaryUnit }: { data: DualSeriesPoint[]; primaryUnit: string; secondaryUnit: string }) {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <LineChart data={data} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis yAxisId="primary" hide domain={["auto", "auto"]} />
        <YAxis yAxisId="secondary" hide domain={["auto", "auto"]} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey="label"
              formatter={(value, name) => [`${value} ${name === "primary" ? primaryUnit : secondaryUnit}`, chartConfig[name as string]?.label]}
            />
          }
        />
        <Line yAxisId="primary" dataKey="primary" type="monotone" stroke="var(--color-primary)" strokeWidth={2.4} dot={{ r: 3.5 }} activeDot={{ r: 5.5 }} />
        <Line yAxisId="secondary" dataKey="secondary" type="monotone" stroke="var(--color-secondary)" strokeWidth={2.4} dot={{ r: 3.5 }} activeDot={{ r: 5.5 }} />
      </LineChart>
    </ChartContainer>
  );
}
