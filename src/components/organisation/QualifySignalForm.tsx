"use client";

// QualifySignalForm — LOT 7 (mandat "Actor & Trust Network", §11/§12/§20).
// Le seul chemin par lequel un Signal (issu ou non d'une PublicContribution)
// devient une capacité du réseau : toujours un geste humain explicite,
// jamais un effet de bord de la simple existence du Signal. Même
// discipline que FieldMissionForm/ProgramOpportunityForm — un seul
// formulaire, un seul geste, rien d'automatique.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { Organization, PartnerService, ProductState, Signal } from "@/domain/types";

const categoryLabels: Record<PartnerService["category"], string> = {
  logistique: "Logistique / transport",
  froid: "Froid",
  maintenance: "Maintenance",
  financement: "Financement",
  assurance: "Assurance"
};

export function QualifySignalForm({
  signal,
  state,
  onDone,
  onCancel
}: {
  signal: Signal;
  state: ProductState;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { run } = useProduct();
  // Rattachement : organisation existante par défaut dès qu'au moins une
  // existe — "créer une organisation candidate" reste un choix explicite,
  // jamais le repli silencieux (mandat §14, "dédoublonnage" : chercher
  // d'abord les organisations existantes).
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [organizationId, setOrganizationId] = useState(state.organizations[0]?.id ?? "");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState<Organization["type"]>("entreprise");
  const [serviceName, setServiceName] = useState(signal.title);
  const [category, setCategory] = useState<PartnerService["category"]>("logistique");
  const [territories, setTerritories] = useState<string[]>([]);
  const [activationConditions, setActivationConditions] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const toggleTerritory = (id: string) => {
    setTerritories((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!serviceName.trim()) { setError("Le nom de la capacité est obligatoire."); return; }
    if (territories.length === 0) { setError("Sélectionnez au moins un territoire couvert."); return; }
    if (!activationConditions.trim()) { setError("Précisez les conditions d’activation — une capacité déclarée n’est pas une disponibilité immédiate."); return; }
    if (mode === "existing" && !organizationId) { setError("Sélectionnez une organisation."); return; }
    if (mode === "new" && !newOrgName.trim()) { setError("Le nom de la nouvelle organisation est obligatoire."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "qualify_signal_as_network_capacity",
        signalId: signal.id,
        organizationId: mode === "existing" ? organizationId : undefined,
        newOrganization: mode === "new" ? { name: newOrgName.trim(), type: newOrgType } : undefined,
        service: {
          name: serviceName.trim(),
          category,
          territoryIds: territories,
          activationConditions: activationConditions.trim()
        }
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qualifier comme capacité réseau</p>
      <p className="text-xs leading-5 text-muted-foreground">Cette contribution entre dans le réseau documenté de Mbàmbulaan — jamais activée automatiquement. La capacité créée reste au statut le plus prudent (« Référencée »), à vérifier avant toute mobilisation.</p>

      <div className="rounded-md border bg-muted p-3 text-xs text-muted-foreground">{signal.description}</div>

      <div className="space-y-2">
        <p className="text-xs font-semibold">Rattachement</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("existing")} className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold ${mode === "existing" ? "border-primary bg-primary/10" : "bg-background"}`}>Organisation existante</button>
          <button type="button" onClick={() => setMode("new")} className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold ${mode === "new" ? "border-primary bg-primary/10" : "bg-background"}`}>Créer une organisation candidate</button>
        </div>
      </div>

      {mode === "existing" ? (
        <label className="block text-xs font-semibold">
          Organisation
          <select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {state.organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </label>
      ) : (
        <div className="space-y-3 rounded-md border border-dashed p-3">
          <p className="text-[11px] leading-4 text-muted-foreground">Organisation déclarée — vérification à compléter. Aucune vérification n’est présumée à la création.</p>
          <label className="block text-xs font-semibold">
            Nom de l’organisation
            <input required value={newOrgName} onChange={(event) => setNewOrgName(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block text-xs font-semibold">
            Type
            <select value={newOrgType} onChange={(event) => setNewOrgType(event.target.value as Organization["type"])} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="entreprise">Entreprise</option>
              <option value="organisation_professionnelle">Organisation professionnelle</option>
              <option value="partenaire">Partenaire</option>
              <option value="collectivite">Collectivité</option>
              <option value="service_public">Service public</option>
            </select>
          </label>
        </div>
      )}

      <label className="block text-xs font-semibold">
        Nom de la capacité / du service
        <input required value={serviceName} onChange={(event) => setServiceName(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Catégorie
        <select value={category} onChange={(event) => setCategory(event.target.value as PartnerService["category"])} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div>
        <p className="text-xs font-semibold">Territoires couverts</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {state.territories.map((territory) => (
            <button key={territory.id} type="button" onClick={() => toggleTerritory(territory.id)} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${territories.includes(territory.id) ? "border-primary bg-primary/10" : "bg-background text-muted-foreground"}`}>{territory.name}</button>
          ))}
        </div>
      </div>
      <label className="block text-xs font-semibold">
        Conditions d’activation
        <textarea required rows={2} value={activationConditions} onChange={(event) => setActivationConditions(event.target.value)} placeholder="Ce qui doit être vérifié/réuni avant toute mobilisation réelle." className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Enregistrement…" : "Qualifier"}</Button>
      </div>
    </form>
  );
}
