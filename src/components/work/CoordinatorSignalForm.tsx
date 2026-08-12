"use client";

// Formulaire de signalement pour l'expérience Coordinateur fusionnée
// (Lot 3). Distinct de src/components/situations/NewSignalForm.tsx :
// celui-ci reste en palette sarcelle et sert /app/situations pour les
// rôles hors périmètre de ce lot (opérateur, capitaine, mareyeur,
// transformateur, prestataire — task-first, non touchés). Dupliquer
// plutôt que retoucher NewSignalForm évite de changer ce que ces
// rôles voient, hors mandat CEO pour ce lot ("même sévérité que
// l'Institution" s'applique à l'expérience Coordinateur, pas à
// l'ensemble de l'application).
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { Signal, Territory } from "@/domain/types";

export function CoordinatorSignalForm({ territories, onDone }: { territories: Territory[]; onDone: () => void }) {
  const { run } = useProduct();
  const [territoryId, setTerritoryId] = useState(territories[0]?.id ?? "");
  const [channel, setChannel] = useState<Signal["channel"]>("terrain");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const ok = await run({ type: "create_signal", territoryId, title, description, channel });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <label className="block text-xs font-semibold">
        Territoire
        <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Canal d’origine
        <select value={channel} onChange={(event) => setChannel(event.target.value as Signal["channel"])} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="poste_quai">Poste de quai</option>
          <option value="terrain">Agent terrain</option>
          <option value="telephone">Téléphone</option>
          <option value="whatsapp_structure">WhatsApp saisi manuellement</option>
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Ce qui est signalé
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex. Machine à glace indisponible" />
      </label>
      <label className="block text-xs font-semibold">
        Ce qui est observé
        <textarea required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Décrivez les faits, les personnes concernées et l’urgence apparente." />
      </label>
      <p className="text-xs text-muted-foreground">Le signal reste déclaratif jusqu’à sa qualification. Mbàmbulaan attribuera une référence et préparera la prochaine étape après enregistrement.</p>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Enregistrement…" : "Enregistrer le signal"}</Button>
    </form>
  );
}
