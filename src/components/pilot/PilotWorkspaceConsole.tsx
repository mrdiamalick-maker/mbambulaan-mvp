"use client";

import Link from "next/link";
import { useState } from "react";
import { FieldCommerceConsole } from "@/components/commercial/FieldCommerceConsole";
import { CommercialIncidentConsole } from "@/components/commercial/CommercialIncidentConsole";

type PilotTab = "operations" | "incident" | "preuves" | "decision";

const tabs: Array<{ key: PilotTab; label: string; description: string }> = [
  { key: "operations", label: "Opérations", description: "Faire avancer la transaction" },
  { key: "incident", label: "Incident", description: "Traiter un écart de livraison" },
  { key: "preuves", label: "Preuves", description: "Vérifier ce qui est traçable" },
  { key: "decision", label: "Décision sponsor", description: "Lire les résultats du pilote" },
];

export function PilotWorkspaceConsole() {
  const [activeTab, setActiveTab] = useState<PilotTab>("operations");

  return (
    <div className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <header className="bg-[var(--mb-navy-900)] px-5 py-7 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Pilote Mbàmbulaan</p>
              <h1 className="mt-2 text-3xl font-semibold">Un seul espace pour tester le MVP</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
                Exécutez une transaction, traitez un incident, vérifiez les preuves puis challengez la valeur du pilote.
              </p>
            </div>
            <Link href="/demonstration-pilote" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">
              Revenir au cadrage sponsor
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <nav className="grid gap-2 sm:grid-cols-4" aria-label="Parcours du pilote">
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
          {activeTab === "operations" && <FieldCommerceConsole />}
          {activeTab === "incident" && <CommercialIncidentConsole />}
          {activeTab === "preuves" && <EvidencePanel />}
          {activeTab === "decision" && <DecisionPanel />}
        </div>
      </div>
    </div>
  );
}

function EvidencePanel() {
  const proofs = [
    ["Commande", "Offre, réservation, quantité, prix et organisations reliées."],
    ["Livraison", "Opérateur sélectionné, preuve de livraison et horodatage."],
    ["Paiement", "Montant demandé, confirmation, référence et répartition."],
    ["Incident", "Motif, quantités acceptées, responsabilités et remboursement."],
  ];
  return (
    <section className="rounded-2xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">Traçabilité minimale du MVP</p>
      <h2 className="mt-2 text-2xl font-semibold">Ce que le pilote doit pouvoir prouver</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--mb-neutral-500)]">
        L’objectif n’est pas de produire un dossier administratif complexe, mais d’éviter les désaccords sur les faits essentiels de la transaction.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {proofs.map(([title, text]) => (
          <article key={title} className="rounded-xl bg-[var(--mb-neutral-50)] p-4">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--mb-neutral-500)]">{text}</p>
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Pour le pilote, les paiements et notifications restent simulés. Une intégration réelle ne sera engagée qu’après validation du sponsor et du partenaire opérationnel.
      </p>
    </section>
  );
}

function DecisionPanel() {
  const decisions = [
    ["Utilité", "Les acteurs terminent-ils plus facilement la transaction ?"],
    ["Adoption", "Peuvent-ils avancer avec peu d’assistance ?"],
    ["Confiance", "Les preuves réduisent-elles les contestations ?"],
    ["Économie", "Qui paie, combien et pour quelle valeur durable ?"],
  ];
  return (
    <section className="rounded-2xl border border-[var(--mb-neutral-200)] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--mb-ocean-700)]">Go / Ajuster / Stop</p>
      <h2 className="mt-2 text-2xl font-semibold">Décision attendue à la fin du pilote</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {decisions.map(([title, question]) => (
          <article key={title} className="rounded-xl border border-[var(--mb-neutral-200)] p-4">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--mb-neutral-500)]">{question}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/rentabilite" className="rounded-lg bg-[var(--mb-navy-800)] px-4 py-3 text-sm font-bold text-white">Voir la viabilité économique</Link>
        <Link href="/atlas" className="rounded-lg border border-[var(--mb-neutral-300)] px-4 py-3 text-sm font-bold">Voir la coordination globale</Link>
      </div>
    </section>
  );
}
