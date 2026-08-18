"use client";

import { Anchor, AlertTriangle, Fish, Handshake, Map, TrendingUp, UsersRound } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { generateNationalSnapshot } from "@/domain/national/national-engine";

// Lot A, Audit DA Premium XXL v2 (gap analysis Pilotage, CEO 2026-08-17) :
// les 7 métriques passent de cartes en grille à une ligne de chiffres
// inline — même principe que le §17 du mandat déjà appliqué sur
// /app/etat (Lot A) : un chiffre important vit directement sur la page,
// pas dans une carte complète par métrique. Les 7 valeurs restent
// toutes affichées dans ce lot (aucune retirée) — la réduction à
// "quelques mesures" se fera par chapitre au Lot B, pas ici : ce lot ne
// change que l'habillage visuel, pas le contenu.
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[#1d4468]">{icon}<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p></div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export function NationalControlCenter({ state }: { state: ProductState }) {
  const snapshot = generateNationalSnapshot(state);
  const metrics = [
    { icon: <Map size={17} />, label: "Territoires", value: snapshot.territories },
    { icon: <UsersRound size={17} />, label: "Acteurs", value: snapshot.actors },
    { icon: <Fish size={17} />, label: "Débarquements", value: snapshot.landings },
    { icon: <Handshake size={17} />, label: "Coordinations", value: snapshot.coordinations },
    { icon: <AlertTriangle size={17} />, label: "Situations critiques", value: snapshot.criticalSituations },
    { icon: <Anchor size={17} />, label: "Situations actives", value: snapshot.activeSituations },
    { icon: <TrendingUp size={17} />, label: "Opportunités", value: snapshot.opportunities }
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-sidebar p-7 text-sidebar-foreground lg:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Mbàmbulaan Sénégal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Intelligence territoriale nationale</h1>
        <p className="mt-3 max-w-3xl text-sidebar-foreground/65">Vision consolidée des territoires côtiers, des acteurs et des dynamiques de filière.</p>
      </div>

      <div className="grid gap-6 border-y py-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => <Metric key={metric.label} {...metric} />)}
      </div>
    </section>
  );
}
