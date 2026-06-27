"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { computeTransactionMetrics, computeTransactions, transactionsStorageKey } from "@/lib/coordination";
import type { Opportunite, Transaction, TransactionStatus } from "@/lib/coordination";
import { coordinationSimulationStorageKey, parseCoordinationSimulation } from "@/lib/simulation";

export function TransactionsView({ opportunites }: { opportunites: Opportunite[] }) {
  const [statusByOpportunityId, setStatusByOpportunityId] = useState<Record<string, TransactionStatus>>({});
  const [simulatedTransactions, setSimulatedTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(transactionsStorageKey);
    setStatusByOpportunityId(stored ? safeParseTransactions(stored) : {});
  }, []);

  useEffect(() => {
    const simulation = parseCoordinationSimulation(window.localStorage.getItem(coordinationSimulationStorageKey));
    setSimulatedTransactions(simulation?.transactions ?? []);
  }, []);

  const storedTransactions = useMemo(() => computeTransactions(opportunites, statusByOpportunityId), [opportunites, statusByOpportunityId]);
  const transactions = useMemo(() => [...simulatedTransactions, ...storedTransactions], [simulatedTransactions, storedTransactions]);
  const metrics = useMemo(() => computeTransactionMetrics(transactions), [transactions]);

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                item.href === "/transactions" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/15 text-[#14312d] hover:border-[#14312d]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Transactions</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Suivi des lots reserves</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Vue locale des reservations en preparation, en retrait ou deja terminees par les acteurs pilotes.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[34rem]">
              <Metric value={String(metrics.transactionsActives)} label="Transactions actives" />
              <Metric value={String(metrics.transactionsTerminees)} label="Terminees" />
              <Metric value={`${metrics.tauxFinalisation}%`} label="Finalisation" />
            </div>
          </div>

          <div className="mt-8 hidden overflow-hidden rounded-3xl border border-[#14312d]/10 lg:block">
            <table className="w-full border-collapse bg-white text-left">
              <thead className="bg-[#14312d] text-white">
                <tr>
                  <ColumnHeader>Statut</ColumnHeader>
                  <ColumnHeader>Espece</ColumnHeader>
                  <ColumnHeader>Quai</ColumnHeader>
                  <ColumnHeader>Quantite</ColumnHeader>
                  <ColumnHeader>Date</ColumnHeader>
                  <ColumnHeader>Acteur</ColumnHeader>
                  <ColumnHeader>Action</ColumnHeader>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-[#14312d]/10">
                    <Cell>
                      <StatusBadge status={transaction.statut} />
                    </Cell>
                    <Cell strong>{transaction.espece}</Cell>
                    <Cell>{transaction.quai}</Cell>
                    <Cell>{transaction.quantite}</Cell>
                    <Cell>{formatDate(transaction.date)}</Cell>
                    <Cell>{transaction.acteurReserve}</Cell>
                    <td className="px-5 py-5">
                      <Link href={`/opportunites/${transaction.opportuniteId}`} className="rounded-full border border-[#14312d]/15 px-3 py-2 text-xs font-black text-[#14312d] transition hover:border-[#14312d]">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 lg:hidden">
            {transactions.map((transaction) => (
              <article key={transaction.id} className="rounded-3xl border border-[#14312d]/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{transaction.espece}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{transaction.quai}</p>
                  </div>
                  <StatusBadge status={transaction.statut} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MobileDetail label="Quantite" value={transaction.quantite} />
                  <MobileDetail label="Date" value={formatDate(transaction.date)} />
                </div>
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-black">{transaction.acteurReserve}</p>
                <Link href={`/opportunites/${transaction.opportuniteId}`} className="mt-5 block h-12 rounded-2xl bg-[#14312d] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#1e4a43]">
                  Voir l'opportunite
                </Link>
              </article>
            ))}
          </div>

          {transactions.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#14312d]/20 p-8 text-center">
              <p className="text-lg font-black">Aucune transaction en memoire locale.</p>
              <p className="mt-2 text-sm text-[#14312d]/65">Reservez une opportunite pour demarrer le suivi d'un lot.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const navigationItems = [
  { href: "/", label: "Accueil" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunites" },
  { href: "/transactions", label: "Transactions" },
  { href: "/dashboard", label: "Dashboard" }
];

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

function StatusBadge({ status }: { status: TransactionStatus }) {
  const styles: Record<TransactionStatus, string> = {
    Réservée: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    "En préparation": "bg-[#dbeafe] text-[#174ea6] ring-[#93c5fd]",
    "En cours de retrait": "bg-[#e7f5ff] text-[#0b7285] ring-[#99e9f2]",
    Terminée: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
    Annulée: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[status]}`}>{status}</span>;
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(new Date(value));
}
