"use client";

// Formulaire de demande de service (Lot 7, étape 1/4) — create_service_request
// existait et était testé depuis le Lot 1 (D1), mais n'avait jamais de
// formulaire réel : seules les données de démonstration l'alimentaient.
// Premier point d'entrée UI, réservé aux rôles qui en ont le mandat
// (mareyeur, transformateur, opérateur — src/server/permissions.ts).
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { CatchLine, ProductState, ServiceRequestChannel, ServiceRequestIntent } from "@/domain/types";
import { serviceRequestIntentLabels } from "@/domain/types";

const channelLabels: Record<ServiceRequestChannel, string> = {
  web: "Web",
  whatsapp: "WhatsApp",
  telephone: "Téléphone",
  terrain: "Terrain",
  partenaire: "Partenaire",
  evenement: "Événement"
};

export function ServiceRequestForm({ state, onDone }: { state: ProductState; onDone: () => void }) {
  const { run } = useProduct();
  const [territoryId, setTerritoryId] = useState(state.territories[0]?.id ?? "");
  const [speciesId, setSpeciesId] = useState(state.species[0]?.id ?? "");
  const [quantityKg, setQuantityKg] = useState("");
  const [quality, setQuality] = useState<CatchLine["quality"]>("A");
  const [intent, setIntent] = useState<ServiceRequestIntent>("achat");
  const [channel, setChannel] = useState<ServiceRequestChannel>("web");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const quantity = Number(quantityKg);
    if (!territoryId || !speciesId || !Number.isFinite(quantity) || quantity <= 0) return;
    setPending(true);
    try {
      const ok = await run({ type: "create_service_request", territoryId, speciesId, quantityKg: quantity, quality, intent, channel });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <label className="block text-xs font-semibold">
        Territoire
        <select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {state.territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Espèce
        <select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {state.species.map((species) => <option key={species.id} value={species.id}>{species.name}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-semibold">
          Quantité (kg)
          <input required type="number" min={1} step={1} value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex. 300" />
        </label>
        <label className="block text-xs font-semibold">
          Qualité
          <select value={quality} onChange={(event) => setQuality(event.target.value as CatchLine["quality"])} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </label>
      </div>
      <label className="block text-xs font-semibold">
        Besoin recherché
        <select value={intent} onChange={(event) => setIntent(event.target.value as ServiceRequestIntent)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(serviceRequestIntentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Origine de la demande
        <select value={channel} onChange={(event) => setChannel(event.target.value as ServiceRequestChannel)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(channelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <p className="text-xs text-muted-foreground">La demande restera ouverte jusqu’à ce qu’une correspondance compatible soit identifiée ou qu’elle soit clôturée.</p>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Envoi…" : "Créer la demande"}</Button>
    </form>
  );
}
