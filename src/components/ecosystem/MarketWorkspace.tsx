"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CircleHelp, Fish, Minus, ShieldAlert, Store } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScarcityIndicator } from "@/domain/types";

// Lot Marches-B (propagation DA v2, arbitrage CEO 2026-08-20) : bande de
// synthèse chiffres inline, cohérence avec État/Atlas/Initiatives — cette
// page passait jusqu'ici directement du titre aux filtres, sans aucun
// chiffre agrégé. Totaux non filtrés (portefeuille complet), comme le
// bandeau d'Initiatives ; le compte "N observation(s)" plus bas dans le
// filtre reste, lui, réactif aux filtres Espèce/Territoire.
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-[#1d4468]">{icon}</div>
      <p className="mt-2 text-2xl font-bold tracking-tight"><NumberTicker value={value} /></p>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

// Lot Marches-A (propagation DA v2, arbitrage CEO 2026-08-20, gap analysis
// /app/marches) : jusqu'ici tous les statuts de rareté partageaient la même
// pastille ambre inline, sans distinction de sévérité — "Abondant" (bonne
// nouvelle) rendu identique à "Sous tension" (tension réelle, majorité des
// cas). Même système Badge/variant que TrustBadge (StatusBadges.tsx), pas
// un nouveau système de couleur. Couvre les 6 valeurs de l'enum même si
// "rare"/"critique" sont absents du jeu de démonstration actuel (aucun
// exemple fabriqué pour ces deux-là, cf. gap analysis point 4).
const scarcityStatusLabel: Record<ScarcityIndicator["status"], string> = {
  abondant: "Abondant",
  disponible: "Disponible",
  sous_tension: "Sous tension",
  rare: "Rare",
  critique: "Critique",
  donnee_insuffisante: "Donnée insuffisante"
};
const scarcityStatusVariant: Record<ScarcityIndicator["status"], "marine" | "terracotta" | "amber" | "success"> = {
  abondant: "success",
  disponible: "success",
  sous_tension: "amber",
  rare: "terracotta",
  critique: "terracotta",
  donnee_insuffisante: "marine"
};

export function MarketWorkspace() {
  const { state, run } = useProduct();
  const [speciesId, setSpeciesId] = useState("all");
  const [territoryId, setTerritoryId] = useState("all");
  const [pending, setPending] = useState<string | null>(null);
  if (!state) return null;

  const prices = state.priceObservations.filter((item) =>
    (speciesId === "all" || item.speciesId === speciesId) &&
    (territoryId === "all" || item.territoryId === territoryId)
  );
  const flaggedCount = state.priceObservations.filter((item) => item.flagged).length;
  const tensionStatuses: ScarcityIndicator["status"][] = ["sous_tension", "rare", "critique"];
  const tensionCount = state.scarcity.filter((item) => tensionStatuses.includes(item.status)).length;

  const flag = async (priceId: string) => {
    setPending(priceId);
    try {
      await run({ type: "flag_price", priceId });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-7">
      <section className="grid grid-cols-2 divide-x divide-y border-y sm:grid-cols-4 sm:divide-y-0">
        <Metric icon={<Store size={18} />} label="Observations documentées" value={state.priceObservations.length} />
        <Metric icon={<AlertTriangle size={18} />} label="Signalées à vérifier" value={flaggedCount} />
        <Metric icon={<ShieldAlert size={18} />} label="Tensions actives" value={tensionCount} />
        <Metric icon={<Fish size={18} />} label="Espèces suivies" value={state.species.length} />
      </section>

      <div className="grid gap-4 border-y py-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="text-xs font-bold text-muted-foreground">Espèce</span>
          <select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} className="mt-2 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary">
            <option value="all">Toutes les espèces</option>
            {state.species.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted-foreground">Territoire</span>
          <select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-2 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary">
            <option value="all">Tous les territoires</option>
            {state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <p className="pb-2 text-sm font-semibold text-muted-foreground md:text-right">{prices.length} observation(s)</p>
      </div>

      <section className="grid gap-8 xl:grid-cols-[1.35fr_.65fr]">
        <section>
          <div className="border-b pb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Observations de prix</p>
            <h2 className="mt-1 text-lg font-semibold">Source, date et confiance visibles</h2>
          </div>
          <div className="divide-y">
            {prices.map((item) => {
              const species = state.species.find((speciesItem) => speciesItem.id === item.speciesId);
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              const TrendIcon = item.trend === "hausse" ? ArrowUpRight : item.trend === "baisse" ? ArrowDownRight : Minus;
              return (
                <article key={item.id} className="grid gap-4 py-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{species?.name}</h3>
                      <TrustBadge trust={item.trust} />
                      {item.flagged && <Badge variant="terracotta">À vérifier</Badge>}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{territory?.name} · {item.marketName} · {item.source}</p>
                  </div>
                  <div className="min-w-36">
                    <p className="text-xl font-bold text-foreground">{item.priceFcfaKg.toLocaleString("fr-FR")} FCFA</p>
                    <p className="text-xs text-muted-foreground">par kg · simulation</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d4468]"><TrendIcon size={15} /> {item.trend}</span>
                    {!item.flagged && <Button size="sm" variant="outline" disabled={pending === item.id} onClick={() => void flag(item.id)}>{pending === item.id ? "…" : "Signaler une anomalie"}</Button>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside>
          <div className="flex items-center gap-2 text-[#1d4468]">
            <ShieldAlert size={20} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rareté explicable</p>
              <p className="mt-1 text-sm text-muted-foreground">Tensions observées et raisons disponibles.</p>
            </div>
          </div>
          <div className="mt-4 divide-y border-y">
            {state.scarcity.filter((item) => speciesId === "all" || item.speciesId === speciesId).map((item) => {
              const species = state.species.find((speciesItem) => speciesItem.id === item.speciesId);
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              return (
                <article key={item.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{species?.name}</h3>
                      <p className="text-xs text-muted-foreground">{territory?.name}</p>
                    </div>
                    <Badge variant={scarcityStatusVariant[item.status]} className="shrink-0">{scarcityStatusLabel[item.status]}</Badge>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.reasons.join(" · ")}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><CircleHelp size={14} /><span>{item.availableKg} kg observés / {item.requestedKg} kg demandés</span></div>
                </article>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}
