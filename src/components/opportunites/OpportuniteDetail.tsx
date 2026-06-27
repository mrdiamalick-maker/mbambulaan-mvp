"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getNextTransactionStatus, reservationsStorageKey, transactionsStorageKey } from "@/lib/coordination";
import type { Opportunite, OpportuniteStatus, TransactionStatus } from "@/lib/coordination";
import { getRecommendationTone } from "@/lib/recommendation";

export function OpportuniteDetail({ opportunite }: { opportunite: Opportunite }) {
  const [isReserved, setIsReserved] = useState(opportunite.statut === "Réservée");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const statut: OpportuniteStatus = isReserved ? "Réservée" : opportunite.statut;
  const isFinished = transactionStatus === "Terminée";

  useEffect(() => {
    const stored = window.localStorage.getItem(reservationsStorageKey);
    const storedTransactions = window.localStorage.getItem(transactionsStorageKey);

    try {
      const ids = stored ? JSON.parse(stored) : [];
      const transactions = storedTransactions ? safeParseTransactions(storedTransactions) : {};

      if (Array.isArray(ids) && ids.includes(opportunite.id)) {
        setIsReserved(true);
        setTransactionStatus(transactions[opportunite.id] ?? "Réservée");
      }
    } catch {
      setIsReserved(false);
      setTransactionStatus(null);
    }
  }, [opportunite.id]);

  function reserveOpportunity() {
    const stored = window.localStorage.getItem(reservationsStorageKey);
    const storedTransactions = window.localStorage.getItem(transactionsStorageKey);
    const ids = stored ? safeParseIds(stored) : [];
    const nextIds = ids.includes(opportunite.id) ? ids : [...ids, opportunite.id];
    const transactions = storedTransactions ? safeParseTransactions(storedTransactions) : {};
    const nextTransactions = { ...transactions, [opportunite.id]: transactions[opportunite.id] ?? "Réservée" };

    window.localStorage.setItem(reservationsStorageKey, JSON.stringify(nextIds));
    window.localStorage.setItem(transactionsStorageKey, JSON.stringify(nextTransactions));
    setIsReserved(true);
    setTransactionStatus(nextTransactions[opportunite.id]);
    setSuccessMessage("Transaction creee au statut Reservee.");
  }

  function advanceTransaction() {
    if (!transactionStatus || isFinished) return;

    const storedTransactions = window.localStorage.getItem(transactionsStorageKey);
    const transactions = storedTransactions ? safeParseTransactions(storedTransactions) : {};
    const nextStatus = getNextTransactionStatus(transactionStatus);
    const nextTransactions = { ...transactions, [opportunite.id]: nextStatus };

    window.localStorage.setItem(transactionsStorageKey, JSON.stringify(nextTransactions));
    setTransactionStatus(nextStatus);
    setSuccessMessage(`Transaction mise a jour : ${nextStatus}.`);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/opportunites" className="inline-flex rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold text-[#14312d] transition hover:border-[#14312d]">
          Retour aux opportunites
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Detail opportunite</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">{opportunite.espece}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Proposition de mise en relation entre un besoin d'achat et un arrivage compatible.
              </p>
            </div>
            <div className="rounded-3xl bg-[#f7f4ec] p-6 lg:min-w-80">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#d65a31]">Compatibilite</p>
              <p className="mt-3 text-5xl font-black">{opportunite.scoreCompatibilite}%</p>
              <p className="mt-2 text-sm font-semibold text-[#14312d]/65">Compatible à {opportunite.scoreCompatibilite}%</p>
              <RecommendationBadge score={opportunite.scoreCompatibilite} />
              <span className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${isReserved ? "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]" : "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]"}`}>
                {statut}
              </span>
              {isReserved ? <p className="mt-4 text-sm font-black text-[#7a4f00]">Réservée par un transformateur</p> : null}
              {transactionStatus ? <p className="mt-3 text-sm font-black text-[#14312d]/70">Transaction : {transactionStatus}</p> : null}
              <button
                type="button"
                disabled={isReserved}
                onClick={reserveOpportunity}
                className="mt-5 h-12 w-full rounded-2xl bg-[#14312d] px-5 text-sm font-black text-white transition hover:bg-[#1e4a43] disabled:cursor-not-allowed disabled:bg-[#14312d]/30"
              >
                Réserver ce lot
              </button>
              {isReserved ? (
                <button
                  type="button"
                  disabled={isFinished}
                  onClick={advanceTransaction}
                  className="mt-3 h-12 w-full rounded-2xl border border-[#14312d]/15 px-5 text-sm font-black text-[#14312d] transition hover:border-[#14312d] disabled:cursor-not-allowed disabled:border-[#14312d]/10 disabled:text-[#14312d]/35"
                >
                  Faire avancer la transaction
                </button>
              ) : null}
            </div>
          </div>

          {successMessage ? (
            <div className="mt-8 rounded-2xl bg-[#d8f3dc] px-5 py-4 text-sm font-black text-[#1b5e20] ring-1 ring-[#95d5b2]">
              {successMessage}
            </div>
          ) : isReserved ? (
            <div className="mt-8 rounded-2xl bg-[#d8f3dc] px-5 py-4 text-sm font-black text-[#1b5e20] ring-1 ring-[#95d5b2]">
              Reservation confirmee. Cette opportunite n'est plus proposee comme disponible.
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <InfoPanel title="Informations de l'offre">
              <DetailLine label="Acteur concerne" value={opportunite.offre.vendeur} />
              <DetailLine label="Espece" value={opportunite.espece} />
              <DetailLine label="Quantite disponible" value={opportunite.offre.quantite} />
              <DetailLine label="Lieu" value={opportunite.offre.quai} />
              <DetailLine label="Heure de debarquement" value={opportunite.offre.heureDebarquement} />
              <DetailLine label="Statut arrivage" value={opportunite.offre.statut} />
            </InfoPanel>

            <InfoPanel title="Informations du besoin">
              <DetailLine label="Acteur demandeur" value={opportunite.besoin.acheteur} />
              <DetailLine label="Espece recherchee" value={opportunite.espece} />
              <DetailLine label="Quantite demandee" value={opportunite.besoin.quantite} />
              <DetailLine label="Quai cible" value={opportunite.besoin.quai} />
              <DetailLine label="Urgence" value={opportunite.besoin.urgence} />
              <DetailLine label="Commentaire" value={opportunite.besoin.commentaire} />
            </InfoPanel>
          </div>

          <div className="mt-8 rounded-3xl bg-[#f7f4ec] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Pourquoi cette recommandation ?</p>
                <h2 className="mt-3 text-2xl font-black">Score final : {opportunite.scoreCompatibilite}%</h2>
              </div>
              <RecommendationBadge score={opportunite.scoreCompatibilite} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {opportunite.recommendation.criteria.map((criterion) => (
                <p key={criterion.label} className={`rounded-2xl bg-white p-4 text-sm font-bold leading-6 ${criterion.matched ? "text-[#14312d]/80" : "text-[#14312d]/35"}`}>
                  <span className="mr-2">{criterion.matched ? "✓" : "•"}</span>
                  {criterion.label}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-[#14312d]/10 p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Acteurs concernes</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ActorCard label="Demandeur" value={opportunite.acheteur} />
              <ActorCard label="Acteur concerne" value={opportunite.vendeur} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function RecommendationBadge({ score }: { score: number }) {
  const tone = getRecommendationTone(score);
  const styles = {
    green: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    orange: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    red: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>Recommandation {score}%</span>;
}

function safeParseIds(value: string) {
  try {
    const ids = JSON.parse(value);
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function safeParseTransactions(value: string): Record<string, TransactionStatus> {
  try {
    const transactions = JSON.parse(value);

    if (!transactions || typeof transactions !== "object" || Array.isArray(transactions)) return {};

    return Object.fromEntries(
      Object.entries(transactions).filter((entry): entry is [string, TransactionStatus] => {
        const [, status] = entry;
        return status === "Réservée" || status === "En préparation" || status === "En cours de retrait" || status === "Terminée" || status === "Annulée";
      })
    );
  } catch {
    return {};
  }
}

function InfoPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-3xl bg-[#f7f4ec] p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-base font-black">{value}</p>
    </div>
  );
}

function ActorCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
