"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage, ArrivageStatus } from "@/lib/arrivages";
import { arrivageStatuses } from "@/lib/arrivages";

type ArrivagesClientProps = {
  arrivages: Arrivage[];
};

const statusStyles: Record<ArrivageStatus, string> = {
  Disponible: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
  Reserve: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
  "En controle": "bg-[#dbeafe] text-[#174ea6] ring-[#93c5fd]",
  Ecoule: "bg-[#f1f3f5] text-[#495057] ring-[#ced4da]"
};

export function ArrivagesClient({ arrivages }: ArrivagesClientProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof arrivageStatuses)[number]>("Tous");

  const filteredArrivages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return arrivages.filter((arrivage) => {
      const matchesStatus = status === "Tous" || arrivage.statut === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [arrivage.espece, arrivage.quai, arrivage.quantite, arrivage.heureDebarquement, arrivage.statut]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [arrivages, query, status]);

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold text-[#14312d] transition hover:border-[#14312d]">
          Retour a l'accueil
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Arrivages</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Arrivages du jour</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Suivi mocke des lots debarques sur les quais pilotes, pret a etre connecte a une API metier.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[34rem]">
              <label className="grid gap-2 text-sm font-bold text-[#14312d]/70">
                Recherche
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Espece, quai, statut..."
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 text-base font-semibold text-[#14312d] outline-none transition placeholder:text-[#14312d]/40 focus:border-[#14312d]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#14312d]/70">
                Statut
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as (typeof arrivageStatuses)[number])}
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 text-base font-semibold text-[#14312d] outline-none transition focus:border-[#14312d]"
                >
                  {arrivageStatuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric value={String(filteredArrivages.length)} label="Arrivages affiches" />
            <Metric value={String(arrivages.length)} label="Lots mockes" />
            <Metric value={String(new Set(arrivages.map((arrivage) => arrivage.quai)).size)} label="Quais actifs" />
          </div>

          <div className="mt-8 hidden overflow-hidden rounded-3xl border border-[#14312d]/10 lg:block">
            <table className="w-full border-collapse bg-white text-left">
              <thead className="bg-[#14312d] text-white">
                <tr>
                  <ColumnHeader>Espece</ColumnHeader>
                  <ColumnHeader>Quai</ColumnHeader>
                  <ColumnHeader>Quantite</ColumnHeader>
                  <ColumnHeader>Heure</ColumnHeader>
                  <ColumnHeader>Statut</ColumnHeader>
                </tr>
              </thead>
              <tbody>
                {filteredArrivages.map((arrivage) => (
                  <tr key={arrivage.id} className="border-t border-[#14312d]/10">
                    <Cell strong>{arrivage.espece}</Cell>
                    <Cell>{arrivage.quai}</Cell>
                    <Cell>{arrivage.quantite}</Cell>
                    <Cell>{arrivage.heureDebarquement}</Cell>
                    <Cell>
                      <StatusBadge status={arrivage.statut} />
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 lg:hidden">
            {filteredArrivages.map((arrivage) => (
              <article key={arrivage.id} className="rounded-3xl border border-[#14312d]/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{arrivage.espece}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{arrivage.quai}</p>
                  </div>
                  <StatusBadge status={arrivage.statut} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MobileDetail label="Quantite" value={arrivage.quantite} />
                  <MobileDetail label="Heure" value={arrivage.heureDebarquement} />
                </div>
              </article>
            ))}
          </div>

          {filteredArrivages.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#14312d]/20 p-8 text-center">
              <p className="text-lg font-black">Aucun arrivage ne correspond aux criteres.</p>
              <p className="mt-2 text-sm text-[#14312d]/65">Modifiez la recherche ou le statut selectionne.</p>
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

function StatusBadge({ status }: { status: ArrivageStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyles[status]}`}>{status}</span>;
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
