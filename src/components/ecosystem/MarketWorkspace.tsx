"use client";

// Restylé en D9 (Lot 7, étape 2/4). CommandButton/TrustBadge (anciens,
// @/components/ui/CommandButton et @/components/ui/Badges — système
// ocean/lagoon partagé avec /app/situations, non touché ici) remplacés
// par Button+run() et le TrustBadge partagé (@/components/shared/
// StatusBadges), déjà utilisés par Institution/Coordinateur/Situation
// Room.
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, CircleHelp, Minus, Search, ShieldAlert } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const flag = async (priceId: string) => {
    setPending(priceId);
    try {
      await run({ type: "flag_price", priceId });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block"><span className="text-xs font-bold text-muted-foreground">Espèce</span><select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} className="mt-2 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary"><option value="all">Toutes les espèces</option>{state.species.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="block"><span className="text-xs font-bold text-muted-foreground">Territoire</span><select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-2 w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-primary"><option value="all">Tous les territoires</option>{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <div className="inline-flex items-center gap-2 rounded-md bg-muted px-4 py-3 text-sm font-semibold"><Search size={16} /> {prices.length} observation(s)</div>
        </CardContent>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 p-4"><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Observations de prix</p><h2 className="mt-1 text-lg font-semibold">Source, date et confiance visibles</h2></div>
          <div className="divide-y">
            {prices.map((item) => {
              const species = state.species.find((speciesItem) => speciesItem.id === item.speciesId);
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              const TrendIcon = item.trend === "hausse" ? ArrowUpRight : item.trend === "baisse" ? ArrowDownRight : Minus;
              return (
                <article key={item.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{species?.name}</h3><TrustBadge trust={item.trust} />{item.flagged && <Badge variant="terracotta">À vérifier</Badge>}</div><p className="mt-2 text-xs text-muted-foreground">{territory?.name} · {item.marketName} · {item.source}</p></div>
                  <div className="min-w-36"><p className="text-xl font-bold">{item.priceFcfaKg.toLocaleString("fr-FR")} FCFA</p><p className="text-xs text-muted-foreground">par kg · simulation</p></div>
                  <div className="flex items-center gap-3"><span className={`inline-flex items-center gap-1 text-xs font-semibold ${item.trend === "hausse" ? "text-[#b6522f]" : item.trend === "baisse" ? "text-[#1d8a5f]" : "text-muted-foreground"}`}><TrendIcon size={15} /> {item.trend}</span>{!item.flagged && <Button size="sm" variant="outline" disabled={pending === item.id} onClick={() => void flag(item.id)}>{pending === item.id ? "…" : "Signaler une anomalie"}</Button>}</div>
                </article>
              );
            })}
          </div>
        </Card>

        <aside className="space-y-5">
          <div className="flex items-center gap-2 text-[#1d4468]"><ShieldAlert size={20} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rareté explicable</p></div>
          <div className="space-y-3">
            {state.scarcity.filter((item) => speciesId === "all" || item.speciesId === speciesId).map((item) => {
              const species = state.species.find((speciesItem) => speciesItem.id === item.speciesId);
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              return (
                <Card key={item.id} className="border-l-4 border-l-[#c68a2c] bg-[#c68a2c]/8">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{species?.name}</h3><p className="text-xs text-muted-foreground">{territory?.name}</p></div><strong className="text-xs uppercase text-[#8a5f1a]">{item.status.replaceAll("_", " ")}</strong></div>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.reasons.join(" · ")}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><CircleHelp size={14} /><span>{item.availableKg} kg observés / {item.requestedKg} kg demandés</span></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}
