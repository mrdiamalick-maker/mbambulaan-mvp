import type { ProductState, Territory } from "./types";


export interface MarketInsight {
  title: string;
  description: string;
  value: string;
  priority: "faible" | "moyenne" | "forte";
  evidence: string[];
}


export function generateMarketInsights(
  state: ProductState,
  territory: Territory
): MarketInsight[] {

  const insights: MarketInsight[] = [];


  const prices =
    state.priceObservations.filter(
      (item) =>
        item.territoryId === territory.id
    );


  const flaggedPrices =
    prices.filter(
      (item) =>
        item.flagged
    );


  if (flaggedPrices.length > 0) {

    insights.push({
      title:
        "Tension marché détectée",

      description:
        "Certaines observations de prix nécessitent une vérification.",

      value:
        `${flaggedPrices.length} observation(s)`,

      priority:
        "moyenne",

      evidence:
        flaggedPrices.map(
          (item) =>
            item.marketName
        )
    });

  }


  const landings =
    state.landings.filter(
      (item) =>
        item.siteId === `quai-${territory.id}`
    );


  const volume =
    landings.reduce(
      (total, item) =>
        total + item.totalWeightKg,
      0
    );


  if (volume > 0) {

    insights.push({
      title:
        "Volume disponible",

      description:
        "Des volumes sont documentés sur le territoire.",

      value:
        `${(volume / 1000).toFixed(1)} tonnes`,

      priority:
        "forte",

      evidence:
        [
          `${landings.length} débarquement(s)`
        ]
    });

  }


  return insights;
}