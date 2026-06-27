"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { misesEnRelationStorageKey, reservationsStorageKey } from "@/lib/coordination";
import type { MatchingSummary, Opportunite } from "@/lib/coordination";
import { computePrioritizationMetrics, getPriorityTone } from "@/lib/prioritization";
import type { BusinessPriority } from "@/lib/prioritization";
import { coordinationSimulationStorageKey, parseCoordinationSimulation } from "@/lib/simulation";
import { getOpportunityTrust, getTrustLevel, getTrustTone } from "@/lib/trust";

type OpportunitesViewProps = {
  arrivages: Arrivage[];
  besoins: Besoin[];
  opportunites: Opportunite[];
  summary: MatchingSummary;
};

const priorityStyles = {
  low: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
  medium: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
  high: "bg-[#ffe8cc] text-[#9a3412] ring-[#fdba74]",
  critical: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
};

export function OpportunitesView({ arrivages, besoins, opportunites, summary }: OpportunitesViewProps) {
  const [contactsInities, setContactsInities] = useState<string[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [simulatedArrivages, setSimulatedArrivages] = useState<Arrivage[]>([]);
  const [simulatedBesoins, setSimulatedBesoins] = useState<Besoin[]>([]);
  const [simulatedOpportunites, setSimulatedOpportunites] = useState<Opportunite[]>([]);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(reservationsStorageKey);
    if (!stored) return;

    try {
      const ids = JSON.parse(stored);
      if (Array.isArray(ids)) {
        setReservedIds(ids.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      setReservedIds([]);
    }
  }, []);

  useEffect(() => {
    const simulation = parseCoordinationSimulation(window.localStorage.getItem(coordinationSimulationStorageKey));
    setSimulatedArrivages(simulation?.arrivages ?? []);
    setSimulatedBesoins(simulation?.besoins ?? []);
    setSimulatedOpportunites(simulation?.opportunites ?? []);
  }, []);

  const allArrivages = useMemo(() => [...simulatedArrivages, ...arrivages], [arrivages, simulatedArrivages]);
  const allBesoins = useMemo(() => [...simulatedBesoins, ...besoins], [besoins, simulatedBesoins]);
  const allOpportunites = useMemo(() => [...simulatedOpportunites, ...opportunites], [opportunites, simulatedOpportunites]);
  const prioritiesByOpportunityId = useMemo(
    () => new Map(computePrioritizationMetrics(allArrivages, allBesoins, allOpportunites).opportunitesPriorisees.map((item) => [item.id, item])),
    [allArrivages, allBesoins, allOpportunites]
  );

  const displayedOpportunites = useMemo(
    () =>
      allOpportunites
        .filter((opportunite) => !reservedIds.includes(opportunite.id))
        .map((opportunite) => ({
          ...opportunite,
          statut: contactsInities.includes(opportunite.id) ? "Contact initié" : opportunite.statut
        })),
    [allOpportunites, contactsInities, reservedIds]
  );

  function initiateContact(opportunite: Opportunite) {
    setContactsInities((current) => {
      const next = current.includes(opportunite.id) ? current : [...current, opportunite.id];
      window.localStorage.setItem(misesEnRelationStorageKey, JSON.stringify(next));
      return next;
    });
    setConfirmation(`Contact initie entre ${opportunite.acheteur} et ${opportunite.vendeur}.`);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold text-[#14312d] transition hover:border-[#14312d]">
          Retour a l'accueil
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Opportunites</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Mises en relation proposees</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Chaque opportunite rapproche un besoin d'achat et un arrivage compatible pour accelerer la coordination entre acteurs.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[34rem]">
              <Metric value={String(displayedOpportunites.length)} label="Opportunites ouvertes" />
              <Metric value={`${summary.tauxCouvertureBesoins}%`} label="Couverture besoins" />
              <Metric value={String(contactsInities.length || summary.misesEnRelationCreees)} label="Mises en relation" />
            </div>
          </div>

          {confirmation ? (
            <div className="mt-8 rounded-2xl bg-[#d8f3dc] px-5 py-4 text-sm font-black text-[#1b5e20] ring-1 ring-[#95d5b2]">
              {confirmation}
            </div>
          ) : null}

          <div className="mt-8 hidden overflow-hidden rounded-3xl border border-[#14312d]/10 lg:block">
            <table className="w-full border-collapse bg-white text-left">
              <thead className="bg-[#14312d] text-white">
                <tr>
                  <ColumnHeader>Espece</ColumnHeader>
                  <ColumnHeader>Quantite</ColumnHeader>
                  <ColumnHeader>Lieu</ColumnHeader>
                  <ColumnHeader>Demandeur</ColumnHeader>
                  <ColumnHeader>Acteur concerne</ColumnHeader>
                  <ColumnHeader>Score</ColumnHeader>
                  <ColumnHeader>Priorite</ColumnHeader>
                  <ColumnHeader>Confiance</ColumnHeader>
                  <ColumnHeader>Statut</ColumnHeader>
                  <ColumnHeader>Actions</ColumnHeader>
                </tr>
              </thead>
              <tbody>
                {displayedOpportunites.map((opportunite) => (
                  <tr key={opportunite.id} className="border-t border-[#14312d]/10">
                    <Cell strong>{opportunite.espece}</Cell>
                    <Cell>{opportunite.quantite}</Cell>
                    <Cell>{opportunite.lieu}</Cell>
                    <Cell>{opportunite.acheteur}</Cell>
                    <Cell>{opportunite.vendeur}</Cell>
                    <Cell>Compatible à {opportunite.scoreCompatibilite}%</Cell>
                    <Cell>
                      <PriorityBadge priority={prioritiesByOpportunityId.get(opportunite.id)?.priorite ?? "Faible"} />
                    </Cell>
                    <Cell>
                      <TrustBadge score={getOpportunityTrust(opportunite).scoreMoyen} />
                    </Cell>
                    <Cell>
                      <StatusBadge>{opportunite.statut}</StatusBadge>
                    </Cell>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/opportunites/${opportunite.id}`} className="rounded-full border border-[#14312d]/15 px-3 py-2 text-xs font-black text-[#14312d] transition hover:border-[#14312d]">
                          Consulter
                        </Link>
                        <button
                          type="button"
                          onClick={() => initiateContact(opportunite)}
                          className="rounded-full bg-[#14312d] px-3 py-2 text-xs font-black text-white transition hover:bg-[#1e4a43]"
                        >
                          Je suis intéressé
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 lg:hidden">
            {displayedOpportunites.map((opportunite) => (
              <article key={opportunite.id} className="rounded-3xl border border-[#14312d]/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{opportunite.espece}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{opportunite.lieu}</p>
                  </div>
                  <StatusBadge>{opportunite.statut}</StatusBadge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MobileDetail label="Quantite" value={opportunite.quantite} />
                  <MobileDetail label="Score" value={`Compatible à ${opportunite.scoreCompatibilite}%`} />
                  <MobileDetail label="Priorite" value={prioritiesByOpportunityId.get(opportunite.id)?.priorite ?? "Faible"} />
                  <MobileDetail label="Confiance" value={getTrustLevel(getOpportunityTrust(opportunite).scoreMoyen)} />
                </div>
                <div className="mt-4 grid gap-3">
                  <MobileDetail label="Demandeur" value={opportunite.acheteur} />
                  <MobileDetail label="Acteur concerne" value={opportunite.vendeur} />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link href={`/opportunites/${opportunite.id}`} className="h-12 rounded-2xl border border-[#14312d]/15 px-5 py-3 text-center text-sm font-black text-[#14312d] transition hover:border-[#14312d]">
                    Consulter
                  </Link>
                  <button
                    type="button"
                    onClick={() => initiateContact(opportunite)}
                    className="h-12 rounded-2xl bg-[#14312d] px-5 text-sm font-black text-white transition hover:bg-[#1e4a43]"
                  >
                    Je suis intéressé
                  </button>
                </div>
              </article>
            ))}
          </div>

          {displayedOpportunites.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#14312d]/20 p-8 text-center">
              <p className="text-lg font-black">Aucune correspondance detectee.</p>
              <p className="mt-2 text-sm text-[#14312d]/65">Publiez de nouveaux besoins ou arrivages pour generer des opportunites.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{label}</p>
    </div>
  );
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 text-sm font-black uppercase tracking-[0.12em]">{children}</th>;
}

function Cell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`px-5 py-5 text-sm ${strong ? "font-black" : "font-semibold text-[#14312d]/70"}`}>{children}</td>;
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-[#d8f3dc] px-3 py-1 text-xs font-black text-[#1b5e20] ring-1 ring-[#95d5b2]">{children}</span>;
}

function TrustBadge({ score }: { score: number }) {
  const tone = getTrustTone(score);
  const styles = {
    green: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    orange: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    red: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>{getTrustLevel(score)}</span>;
}

function PriorityBadge({ priority }: { priority: BusinessPriority }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${priorityStyles[getPriorityTone(priority)]}`}>{priority}</span>;
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
