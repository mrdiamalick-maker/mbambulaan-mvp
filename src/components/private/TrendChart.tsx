"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// LOT V3.1 (Scope E — décision technique de visualisation de données) :
// recharts est déjà une dépendance du dépôt (package.json) et
// src/components/ui/chart.tsx (habillage shadcn/ui) existait déjà,
// entièrement écrit mais jamais consommé nulle part avant ce lot — les
// graphiques réels du Produit (src/components/etat/EtatDataVisualizations.tsx :
// SignalTrendChart/ResultTrendChart) sont des <div>/SVG faits main, sans
// survol, sans focus, sans info-bulle. Décision retenue : adopter
// recharts + ChartContainer comme fondation pour tout NOUVEAU graphique
// interactif (survol/info-bulle/focus/période — les besoins listés par le
// mandat), plutôt que ré-implémenter ces interactions à la main pour
// chaque graphique futur. AUCUNE nouvelle dépendance ajoutée (recharts
// était déjà installé, npm audit inchangé).
//
// Les graphiques existants (SignalTrendChart/ResultTrendChart) restent
// INCHANGÉS par ce lot — mandat explicite : "ne pas reconstruire
// Résultats". TrendChart n'est validée nulle part dans une page produit
// réelle cette session (mandat : "valider la primitive", pas
// "généraliser" — cf. src/components/etat/Drawer.tsx → DetailSurface,
// même discipline) ; sa validation ici est un rendu réel avec une forme de
// donnée représentative (tests/xxl-v3-1-private-shell.test.ts).
export type TrendPoint = { label: string; value: number };

const chartConfig: ChartConfig = {
  value: { label: "Valeur", color: "var(--chart-1)" }
};

export function TrendChart({ data, valueLabel }: { data: TrendPoint[]; valueLabel: string }) {
  return (
    <ChartContainer config={chartConfig} className="h-[180px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent labelKey="label" nameKey="value" formatter={(value) => [`${value} ${valueLabel}`, undefined]} />} />
        <Area dataKey="value" type="monotone" fill="var(--color-value)" fillOpacity={0.18} stroke="var(--color-value)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}
