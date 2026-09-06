"use client";

import Link from "next/link";
import { useState } from "react";
import { Anchor, ArrowRight, ChevronDown, Fish, Radio, Scale, ShipWheel, Snowflake, TimerReset } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Button } from "@/components/ui/button";
import { ExportActions } from "@/components/reporting/ExportActions";
import type { CommandInput } from "@/domain/types";

const tripAction = {
  en_mer: { label: "Annoncer le retour", command: (id: string): CommandInput => ({ type: "announce_return", tripId: id }), role: "Capitaine" },
  retour_annonce: { label: "Confirmer l’arrivée", command: (id: string): CommandInput => ({ type: "confirm_arrival", tripId: id }), role: "Opérateur de quai" },
  arrivee_confirmee: { label: "Enregistrer le débarquement", command: (id: string): CommandInput => ({ type: "record_landing", tripId: id }), role: "Opérateur de quai" },
  debarquee: null
};

export function OperationsWorkspace() {
  const { state, run } = useProduct();
  const [selectedTripId, setSelectedTripId] = useState("trip-joal");
  const [pending, setPending] = useState(false);
  if (!state) return null;
  const primaryTrip = state.trips.find((item) => item.id === selectedTripId) ?? state.trips[0];
  const landing = state.landings.find((item) => item.tripId === primaryTrip.id);
  const vessel = state.vessels.find((item) => item.id === primaryTrip.vesselId);
  const action = tripAction[primaryTrip.status];
  const totalKg = state.landings.filter((item) => item.status === "lots_crees").reduce((sum, item) => sum + item.totalWeightKg, 0);
  const registryRows = state.vessels.map((item) => {
    const site = state.sites.find((candidate) => candidate.id === item.homeSiteId);
    const trip = state.trips.find((candidate) => candidate.vesselId === item.id);
    const captain = state.actors.find((candidate) => candidate.id === item.captainId);
    return {
      Pirogue: item.name,
      Immatriculation: item.registration,
      Quai: site?.name ?? item.homeSiteId,
      Capitaine: captain?.name ?? item.captainId,
      "Statut sortie": trip?.status.replaceAll("_", " ") ?? "aucune sortie",
      "Niveau de confiance": item.trust
    };
  });

  const runCommand = async (command: CommandInput) => {
    setPending(true);
    try {
      await run(command);
    } finally {
      setPending(false);
    }
  };

  const journey = [
    ["Sortie", primaryTrip.status !== "en_mer"],
    ["Arrivée", ["arrivee_confirmee", "debarquee"].includes(primaryTrip.status)],
    ["Débarquement", primaryTrip.status === "debarquee"],
    ["Lots", landing?.status === "lots_crees"]
  ] as const;

  const currentActionLabel = action?.label ?? (landing?.status === "arrive" ? "Confirmer la pesée" : landing?.status === "pese" ? "Créer les lots" : "Consulter les lots disponibles");
  const requiresAction = Boolean(action || landing?.status === "arrive" || landing?.status === "pese");

  return (
    <div className="space-y-9">
      <section className="overflow-hidden rounded-2xl bg-sidebar p-5 text-sidebar-foreground lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/60"><Radio size={14} /> Console des opérations</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Suivre chaque sortie jusqu’au lot valorisable.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-sidebar-foreground/60">Sélectionnez une pirogue : le cycle, les responsabilités et la prochaine action s’adaptent sans multiplier les points sur l’Atlas.</p>
          </div>
          <label className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm">
            <ShipWheel size={16} className="shrink-0 text-sidebar-foreground/60" />
            <select value={primaryTrip.id} onChange={(event) => setSelectedTripId(event.target.value)} aria-label="Sélectionner une sortie" className="w-full bg-transparent text-sidebar-foreground outline-none [&>option]:text-foreground">
              {state.trips.map((trip) => { const currentVessel = state.vessels.find((item) => item.id === trip.vesselId); return <option key={trip.id} value={trip.id}>{currentVessel?.name} · {trip.status.replaceAll("_", " ")}</option>; })}
            </select>
            <ChevronDown size={14} className="shrink-0 text-sidebar-foreground/60" />
          </label>
        </div>
      </section>

      <section className="grid gap-0 overflow-hidden rounded-xl border sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: ShipWheel, value: state.vessels.length, label: "Pirogues suivies", detail: "Périmètre de démonstration, immatriculations fictives" },
          { icon: TimerReset, value: state.trips.filter((item) => item.status !== "debarquee").length, label: "Sorties en cours", detail: "Retours attendus ou annoncés aujourd’hui" },
          { icon: Scale, value: `${(totalKg / 1000).toFixed(2)} t`, label: "Volume pesé", detail: "Pesées vérifiées dans le jeu de démonstration" },
          { icon: Fish, value: state.lots.filter((item) => item.status === "disponible").length, label: "Lots disponibles", detail: "Reliés à une sortie et un débarquement" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="border-b p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
              <Icon size={17} className="text-[#1d4468]" />
              <p className="mt-3 text-2xl font-bold">{item.value}</p>
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registre opérationnel</p><p className="mt-1 text-sm text-muted-foreground">Immatriculations fictives, quais de rattachement, capitaines et statut des sorties.</p></div>
        <ExportActions filename="mbambulaan-registre-pirogues" rows={registryRows} compact />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_.8fr]">
        <main className="min-w-0">
          <div className="border-b pb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Parcours profond obligatoire</p>
            <h2 className="mt-2 text-xl font-semibold">Retour et débarquement · {vessel?.name}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Chaque étape conserve l’acteur, la date, la source et la prochaine responsabilité.</p>
          </div>

          <div className="grid grid-cols-4 border-b py-5">
            {journey.map(([label, done], index) => (
              <div key={String(label)} className="relative pr-2 last:pr-0">
                {index < journey.length - 1 && <span className="absolute left-7 right-0 top-3.5 h-px bg-border" aria-hidden="true" />}
                <span className={`relative z-10 grid size-7 place-items-center rounded-full border text-xs font-bold ${done ? "border-[#1d4468] bg-[#1d4468] text-white" : "border-border bg-background text-muted-foreground"}`}>{index + 1}</span>
                <p className="mt-3 text-xs font-semibold sm:text-sm">{String(label)}</p>
                <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{done ? "Traçable" : "À réaliser"}</p>
              </div>
            ))}
          </div>

          <div className="space-y-5 pt-5">
            <div className="grid gap-5 sm:grid-cols-[.8fr_1.2fr]">
              <dl className="space-y-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">Immatriculation</dt><dd className="mt-0.5 font-semibold">{vessel?.registration}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Zone déclarée</dt><dd className="mt-0.5 font-semibold">{primaryTrip.zone}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Retour prévu</dt><dd className="mt-0.5 font-semibold">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(primaryTrip.expectedReturnAt))}</dd></div>
              </dl>

              <div className={`rounded-xl border-l-4 p-4 ${requiresAction ? "border-l-[#b6522f] bg-[#b6522f]/8" : "border-l-[#1d4468] bg-muted/40"}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${requiresAction ? "text-[#8f3f25]" : "text-[#1d4468]"}`}>Action attendue maintenant</p>
                <p className="mt-2 text-base font-semibold">{currentActionLabel}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{action ? `Responsabilité : ${action.role}.` : "Le résultat alimente les disponibilités, opportunités et indicateurs."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {action && <Button disabled={pending} onClick={() => void runCommand(action.command(primaryTrip.id))}>{pending ? "…" : action.label}</Button>}
                  {!action && landing?.status === "arrive" && <Button disabled={pending} onClick={() => void runCommand({ type: "confirm_weighing", landingId: landing.id })}>{pending ? "…" : "Confirmer la pesée"}</Button>}
                  {!action && landing?.status === "pese" && <Button disabled={pending} onClick={() => void runCommand({ type: "create_lots", landingId: landing.id })}>{pending ? "…" : "Créer les lots et détecter les opportunités"}</Button>}
                  {landing?.status === "lots_crees" && <Button variant="outline" asChild><Link href="/app/coordination">Voir les opportunités <ArrowRight size={16} /></Link></Button>}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="min-w-0 xl:border-l xl:pl-7">
          <div className="flex items-center gap-3"><Anchor className="text-[#1d4468]" /><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Débarquement lié</p><h2 className="mt-1 font-semibold">{landing?.id}</h2></div></div>
          <div className="mt-5 flex items-center justify-between border-y py-4">
            <span className="text-sm text-muted-foreground">Niveau de confiance</span>
            <TrustBadge trust={landing?.trust ?? "declaree"} />
          </div>
          <div className="mt-5 space-y-3">
            {landing?.catches.map((catchLine) => {
              const species = state.species.find((item) => item.id === catchLine.speciesId);
              return (
                <div key={catchLine.id} className="flex items-center justify-between gap-4 border-b pb-3 text-sm last:border-0">
                  <div><p className="font-semibold">{species?.name}</p><p className="text-xs text-muted-foreground">Qualité {catchLine.quality} · {catchLine.productForm.replaceAll("_", " ")}</p></div>
                  <strong className="shrink-0">{catchLine.quantityKg.toLocaleString("fr-FR")} kg</strong>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl border border-[#e4c68a] bg-[#c68a2c]/10 p-4">
            <div className="flex items-center gap-2 text-[#8a5f1a]"><Snowflake size={17} /><p className="text-sm font-semibold">Contrainte froide</p></div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">La machine de Joal est indisponible. Le délestage doit être coordonné avant l’arrivée.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
