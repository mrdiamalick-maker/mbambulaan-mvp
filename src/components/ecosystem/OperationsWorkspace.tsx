"use client";

import Link from "next/link";
import { useState } from "react";
import { Anchor, ArrowRight, ChevronDown, Fish, Radio, Scale, ShipWheel, Snowflake, TimerReset } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { CommandButton } from "@/components/ui/CommandButton";
import { TrustBadge } from "@/components/ui/Badges";
import { Metric } from "@/components/ui/Metric";

const tripAction = {
  en_mer: { label: "Annoncer le retour", command: (id: string) => ({ type: "announce_return" as const, tripId: id }), role: "Capitaine" },
  retour_annonce: { label: "Confirmer l’arrivée", command: (id: string) => ({ type: "confirm_arrival" as const, tripId: id }), role: "Opérateur de quai" },
  arrivee_confirmee: { label: "Enregistrer le débarquement", command: (id: string) => ({ type: "record_landing" as const, tripId: id }), role: "Opérateur de quai" },
  debarquee: null
};

export function OperationsWorkspace() {
  const { state } = useProduct();
  const [selectedTripId, setSelectedTripId] = useState("trip-joal");
  if (!state) return null;
  const primaryTrip = state.trips.find((item) => item.id === selectedTripId) ?? state.trips[0];
  const landing = state.landings.find((item) => item.tripId === primaryTrip.id);
  const vessel = state.vessels.find((item) => item.id === primaryTrip.vesselId);
  const action = tripAction[primaryTrip.status];
  const totalKg = state.landings.filter((item) => item.status === "lots_crees").reduce((sum, item) => sum + item.totalWeightKg, 0);

  return (
    <div className="space-y-8">
      <section className="mission-strip p-5 lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-end"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-[#70e3d5]"><Radio size={14} /> Console des opérations</div><h2 className="mt-3 text-2xl font-black tracking-[-.04em]">Suivre chaque sortie jusqu’au lot valorisable.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Sélectionnez une pirogue : le cycle, les responsabilités et la prochaine action s’adaptent sans multiplier les points sur l’Atlas.</p></div><label className="ops-filter"><ShipWheel size={16} /><select value={primaryTrip.id} onChange={(event) => setSelectedTripId(event.target.value)} aria-label="Sélectionner une sortie">{state.trips.map((trip) => { const currentVessel = state.vessels.find((item) => item.id === trip.vesselId); return <option key={trip.id} value={trip.id}>{currentVessel?.name} · {trip.status.replaceAll("_", " ")}</option>; })}</select><ChevronDown size={14} /></label></div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pirogues suivies" value={String(state.vessels.length)} detail="Périmètre de démonstration, immatriculations fictives" icon={ShipWheel} />
        <Metric label="Sorties en cours" value={String(state.trips.filter((item) => item.status !== "debarquee").length)} detail="Retours attendus ou annoncés aujourd’hui" icon={TimerReset} tone="sand" />
        <Metric label="Volume pesé" value={`${(totalKg / 1000).toFixed(2)} t`} detail="Pesées vérifiées dans le jeu de démonstration" icon={Scale} tone="lagoon" />
        <Metric label="Lots disponibles" value={String(state.lots.filter((item) => item.status === "disponible").length)} detail="Reliés à une sortie et un débarquement" icon={Fish} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <article className="surface overflow-hidden">
          <div className="border-b border-[#d8e1e2] bg-[#f4fbfc] p-5">
            <p className="label">Parcours profond obligatoire</p>
            <h2 className="mt-2 text-xl font-bold text-[#062d36]">Retour et débarquement · {vessel?.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[#60737a]">
              Chaque étape conserve l’acteur, la date, la source et la prochaine responsabilité.
            </p>
          </div>
          <div className="grid gap-px bg-[#d8e1e2] sm:grid-cols-4">
            {[
              ["Sortie", primaryTrip.status !== "en_mer"],
              ["Arrivée", ["arrivee_confirmee", "debarquee"].includes(primaryTrip.status)],
              ["Débarquement", primaryTrip.status === "debarquee"],
              ["Lots", landing?.status === "lots_crees"]
            ].map(([label, done], index) => (
              <div key={String(label)} className="bg-white p-4">
                <span className={`grid size-7 place-items-center rounded-full text-xs font-black ${done ? "bg-[#18a394] text-white" : "bg-[#eaf1f2] text-[#60737a]"}`}>{index + 1}</span>
                <p className="mt-3 text-sm font-bold">{String(label)}</p>
                <p className="mt-1 text-xs text-[#60737a]">{done ? "Traçable" : "À réaliser"}</p>
              </div>
            ))}
          </div>
          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <dl className="space-y-2 text-sm">
                <div><dt className="text-[#60737a]">Immatriculation</dt><dd className="font-bold">{vessel?.registration}</dd></div>
                <div><dt className="text-[#60737a]">Zone déclarée</dt><dd className="font-bold">{primaryTrip.zone}</dd></div>
                <div><dt className="text-[#60737a]">Retour prévu</dt><dd className="font-bold">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(primaryTrip.expectedReturnAt))}</dd></div>
              </dl>
              <div className="border-l-4 border-[#18a394] bg-[#f1faf7] p-4">
                <p className="text-xs font-bold uppercase text-[#126b58]">Ce qui est attendu maintenant</p>
                <p className="mt-2 text-sm font-bold">{action?.label ?? (landing?.status === "arrive" ? "Confirmer la pesée" : landing?.status === "pese" ? "Créer les lots" : "Consulter les lots disponibles")}</p>
                <p className="mt-2 text-xs leading-5 text-[#60737a]">{action ? `Responsabilité : ${action.role}.` : "Le résultat alimente les disponibilités, opportunités et indicateurs."}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {action && <CommandButton command={action.command(primaryTrip.id)}>{action.label}</CommandButton>}
              {!action && landing?.status === "arrive" && <CommandButton command={{ type: "confirm_weighing", landingId: landing.id }}>Confirmer la pesée</CommandButton>}
              {!action && landing?.status === "pese" && <CommandButton command={{ type: "create_lots", landingId: landing.id }}>Créer les lots et détecter les opportunités</CommandButton>}
              {landing?.status === "lots_crees" && <Link href="/app/coordination" className="inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white">Voir les opportunités <ArrowRight size={16} /></Link>}
            </div>
          </div>
        </article>

        <aside className="surface p-5">
          <div className="flex items-center gap-3"><Anchor className="text-[#087287]" /><div><p className="label">Débarquement lié</p><h2 className="mt-1 font-bold">{landing?.id}</h2></div></div>
          <div className="mt-5 flex items-center justify-between border-y border-[#d8e1e2] py-4">
            <span className="text-sm text-[#60737a]">Niveau de confiance</span>
            <TrustBadge trust={landing?.trust ?? "declaree"} source={landing?.weighingSource} />
          </div>
          <div className="mt-5 space-y-3">
            {landing?.catches.map((catchLine) => {
              const species = state.species.find((item) => item.id === catchLine.speciesId);
              return (
                <div key={catchLine.id} className="flex items-center justify-between border-b border-[#e1e8e8] pb-3 text-sm">
                  <div><p className="font-bold">{species?.name}</p><p className="text-xs text-[#60737a]">Qualité {catchLine.quality} · {catchLine.productForm.replaceAll("_", " ")}</p></div>
                  <strong>{catchLine.quantityKg.toLocaleString("fr-FR")} kg</strong>
                </div>
              );
            })}
          </div>
          <div className="mt-5 bg-[#fff8e8] p-4">
            <div className="flex items-center gap-2 text-[#76530d]"><Snowflake size={17} /><p className="text-sm font-bold">Contrainte froide</p></div>
            <p className="mt-2 text-xs leading-5 text-[#60737a]">La machine de Joal est indisponible. Le délestage doit être coordonné avant l’arrivée.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}