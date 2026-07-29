"use client";

import Link from "next/link";
import { useState } from "react";
import { FieldCommerceConsole } from "@/components/commercial/FieldCommerceConsole";
import { CommercialIncidentConsole } from "@/components/commercial/CommercialIncidentConsole";

type PilotTab = "resource" | "campaign" | "operations" | "value" | "incident" | "results";

const tabs: Array<{ key: PilotTab; label: string; description: string }> = [
  { key: "resource", label: "Ressource", description: "Adapter la campagne à l'état des espèces" },
  { key: "campaign", label: "Retour de campagne", description: "Préparer le débarquement et les services" },
  { key: "operations", label: "Lots et débouchés", description: "Qualifier, réserver, livrer et régler" },
  { key: "value", label: "Partage de valeur", description: "Répartir les revenus et contributions" },
  { key: "incident", label: "Tension", description: "Traiter un écart ou une rupture" },
  { key: "results", label: "Résultats", description: "Mesurer la valeur créée et préservée" },
];

export function PilotWorkspaceConsole() {
  const [activeTab, setActiveTab] = useState<PilotTab>("resource");

  return (
    <div className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-7 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Pilote transversal Mbàmbulaan</p>
              <h1 className="mt-2 text-3xl font-semibold">Une boucle complète de coordination de la filière</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">
                De l'état de la ressource au partage de valeur : décision de pêche, retour de campagne, débarquement, services, lots, débouchés, livraison, règlement, solidarité et résultats.
              </p>
            </div>
            <Link href="/ressource-et-valeur" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">
              Ressource et création de valeur
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6" aria-label="Parcours du pilote">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl border p-4 text-left ${activeTab === tab.key ? "border-[var(--mb-ocean-600)] bg-white shadow-sm" : "border-[var(--mb-neutral-200)] bg-white/60"}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">Étape {index + 1}</span>
              <span className="mt-1 block font-semibold">{tab.label}</span>
              <span className="mt-1 block text-xs text-[var(--mb-neutral-500)]">{tab.description}</span>
            </button>
          ))}
        </nav>

        <div className="mt-5">
          {activeTab === "resource" && <ResourcePanel />}
          {activeTab === "campaign" && <CampaignPanel />}
          {activeTab === "operations" && <FieldCommerceConsole />}
          {activeTab === "value" && <ValueSharingPanel />}
          {activeTab === "incident" && <CommercialIncidentConsole />}
          {activeTab === "results" && <ResultsPanel />}
        </div>
      </div>
    </div>
  );
}

function ResourcePanel() {
  const decisions = [
    ["Sardinelle ronde", "Sous pression", "Sortie autorisée avec limitation d'effort", "Préparer glace et acheteurs pour préserver la valeur de chaque kilogramme."],
    ["Thiof", "Critique", "Sortie ciblée reportée", "Orienter l'équipage vers une espèce autorisée et activer un soutien de continuité si nécessaire."],
    ["Ethmalose", "Stable", "Sortie autorisée", "Développer les débouchés de transformation pour diversifier le revenu."],
  ];

  return (
    <section className="rounded-2xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">Décision avant sortie</p>
      <h2 className="mt-2 text-2xl font-semibold">Pêcher selon l'état de la ressource, pas contre elle</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--mb-neutral-500)]">La rareté ne bloque pas Mbàmbulaan. Elle déclenche une meilleure décision : réduire l'effort quand nécessaire, protéger le revenu et augmenter la valeur créée par les volumes réellement disponibles.</p>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {decisions.map(([species, status, decision, action]) => (
          <article key={species} className="rounded-xl border border-[var(--mb-neutral-200)] p-4">
            <p className="text-xs font-bold uppercase text-[var(--mb-ocean-700)]">{status}</p>
            <h3 className="mt-2 text-lg font-semibold">{species}</h3>
            <p className="mt-3 text-sm font-semibold">{decision}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-500)]">{action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CampaignPanel() {
  const steps = [
    ["Retour annoncé", "Pirogue Ndiambour 12", "Arrivée prévue à 16 h 40 · 820 kg estimés"],
    ["Site préparé", "Quai de Fass Boye", "Créneau de débarquement confirmé · peseur mobilisé"],
    ["Services réservés", "Glace, manutention et transport", "900 kg de glace · 4 manutentionnaires · 1 véhicule frigorifique"],
    ["Débarquement organisé", "Lotissement prévu", "Vente fraîche prioritaire · surplus orienté vers transformation"],
  ];

  return (
    <section className="rounded-2xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">Coordination avant débarquement</p>
      <h2 className="mt-2 text-2xl font-semibold">Transformer le retour de campagne en opération préparée</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {steps.map(([title, owner, detail], index) => (
          <article key={title} className="rounded-xl bg-[var(--mb-neutral-50)] p-4">
            <span className="font-mono text-xs font-bold text-[var(--mb-ocean-700)]">0{index + 1}</span>
            <h3 className="mt-2 font-semibold">{title}</h3>
            <p className="mt-2 text-sm font-semibold">{owner}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--mb-neutral-500)]">{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ValueSharingPanel() {
  const allocations = [
    ["Valeur du lot réglé", "1 845 000 FCFA", "Premier acheteur"],
    ["Part nette pêcheur et équipage", "1 420 000 FCFA", "Répartition selon les règles de campagne"],
    ["Services opérationnels", "265 000 FCFA", "Glace, manutention, transport et froid"],
    ["Contribution coopérative", "90 000 FCFA", "Services mutualisés et accompagnement"],
    ["Fonds commun local", "35 000 FCFA", "Continuité, soutien et équipement collectif"],
    ["Rémunération Mbàmbulaan", "35 000 FCFA", "Coordination, suivi et information de pilotage"],
  ];

  return (
    <section className="rounded-2xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">Flux financiers et communautaires</p>
      <h2 className="mt-2 text-2xl font-semibold">Rendre visible la destination de chaque franc créé</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allocations.map(([label, amount, beneficiary]) => (
          <article key={label} className="rounded-xl border border-[var(--mb-neutral-200)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--mb-neutral-400)]">{label}</p>
            <p className="mt-2 text-xl font-semibold">{amount}</p>
            <p className="mt-2 text-sm text-[var(--mb-neutral-500)]">{beneficiary}</p>
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-xl border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-50)] p-4 text-sm leading-6">Mbàmbulaan est rémunéré pour un service réel de coordination. La plateforme ne gagne pas davantage lorsque la ressource est surexploitée ou lorsqu'un acteur s'endette plus longtemps.</p>
    </section>
  );
}

function ResultsPanel() {
  const results = [
    ["Pertes évitées", "126 kg", "Orientation rapide vers froid et transformation"],
    ["Valeur nette additionnelle", "218 000 FCFA", "Meilleure qualité et réduction de l'urgence de vente"],
    ["Effort de pêche évité", "1 sortie ciblée", "Report d'une sortie sur une espèce critique"],
    ["Revenu protégé", "84 000 FCFA", "Diversification et mécanisme de continuité"],
    ["Contribution locale", "35 000 FCFA", "Fonds commun de la communauté"],
    ["Temps de coordination", "-42 %", "Informations et engagements partagés entre acteurs"],
  ];

  return (
    <section className="rounded-2xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">Résultats du parcours</p>
      <h2 className="mt-2 text-2xl font-semibold">Mesurer ce qui change réellement dans la filière</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map(([label, value, explanation]) => (
          <article key={label} className="rounded-xl bg-[var(--mb-neutral-50)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--mb-neutral-400)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--mb-navy-900)]">{value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--mb-neutral-500)]">{explanation}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/government" className="rounded-lg bg-[var(--mb-navy-800)] px-4 py-3 text-sm font-bold text-white">Voir la lecture institutionnelle</Link>
        <Link href="/development" className="rounded-lg border border-[var(--mb-neutral-300)] px-4 py-3 text-sm font-bold">Voir les programmes de développement</Link>
        <Link href="/finance" className="rounded-lg border border-[var(--mb-neutral-300)] px-4 py-3 text-sm font-bold">Voir le financement éthique</Link>
      </div>
    </section>
  );
}
