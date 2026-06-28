"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin, UrgenceLevel } from "@/lib/besoins";
import { urgenceLevels } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";
import { computePrioritizationMetrics, getPriorityTone } from "@/lib/prioritization";
import type { BusinessPriority } from "@/lib/prioritization";
import { coordinationSimulationStorageKey, parseCoordinationSimulation } from "@/lib/simulation";

type BesoinsClientProps = {
  arrivages: Arrivage[];
  besoins: Besoin[];
  alertes?: string[];
};

const urgenceStyles: Record<UrgenceLevel, string> = {
  Haute: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]",
  Moyenne: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
  Basse: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]"
};

const priorityStyles = {
  low: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
  medium: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
  high: "bg-[#ffe8cc] text-[#9a3412] ring-[#fdba74]",
  critical: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
};

const publicationUrgences = urgenceLevels.filter((item) => item !== "Toutes") as UrgenceLevel[];

const initialForm = {
  espece: "",
  quantite: "",
  unite: "kg",
  quai: "",
  urgence: "Moyenne" as UrgenceLevel,
  commentaire: ""
};

export function BesoinsClient({ alertes = [], arrivages, besoins }: BesoinsClientProps) {
  const [localBesoins, setLocalBesoins] = useState(besoins);
  const [query, setQuery] = useState("");
  const [urgence, setUrgence] = useState<(typeof urgenceLevels)[number]>("Toutes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialForm, string>>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const simulation = parseCoordinationSimulation(window.localStorage.getItem(coordinationSimulationStorageKey));
    if (!simulation) return;

    setLocalBesoins([...simulation.besoins, ...besoins]);
  }, [besoins]);

  const filteredBesoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return localBesoins.filter((besoin) => {
      const matchesUrgence = urgence === "Toutes" || besoin.urgence === urgence;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [besoin.espece, besoin.quai, besoin.quantite, besoin.urgence, besoin.commentaire]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesUrgence && matchesQuery;
    });
  }, [localBesoins, query, urgence]);
  const prioritiesByNeedId = useMemo(() => {
    const opportunites = computeMatching(arrivages, localBesoins);
    return new Map(computePrioritizationMetrics(arrivages, localBesoins, opportunites).besoinsPriorises.map((item) => [item.id, item]));
  }, [arrivages, localBesoins]);

  function updateForm<Value extends keyof typeof initialForm>(field: Value, value: (typeof initialForm)[Value]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof typeof initialForm, string>> = {};
    if (!form.espece.trim()) nextErrors.espece = "Indiquez l'espece.";
    if (!form.quantite.trim()) nextErrors.quantite = "Indiquez la quantite.";
    if (!form.quai.trim()) nextErrors.quai = "Indiquez le quai.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const uniteLabel = form.unite === "tonne" ? "t" : "kg";
    const nextBesoin: Besoin = {
      id: `bes-local-${Date.now()}`,
      espece: form.espece.trim(),
      quai: form.quai.trim(),
      quantite: `${form.quantite.trim()} ${uniteLabel}`,
      urgence: form.urgence,
      acheteur: `Mareyeur ${form.quai.trim()}`,
      commentaire: form.commentaire.trim() || "Aucun commentaire ajoute."
    };

    setLocalBesoins((current) => [nextBesoin, ...current]);
    setForm(initialForm);
    setQuery("");
    setUrgence("Toutes");
    setSuccessMessage(`${nextBesoin.espece} publie pour ${nextBesoin.quai}.`);
    setIsModalOpen(false);
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
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Besoins</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Besoins d'achat</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Suivi mocke des demandes publiees par les mareyeurs, pret a etre connecte a une API metier.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[34rem]">
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setSuccessMessage("");
                  setIsModalOpen(true);
                }}
                className="h-12 rounded-2xl bg-[#14312d] px-5 text-base font-black text-white transition hover:bg-[#1e4a43] sm:col-span-2"
              >
                Publier un besoin
              </button>
              <label className="grid gap-2 text-sm font-bold text-[#14312d]/70">
                Recherche
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Espece, quai, urgence..."
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 text-base font-semibold text-[#14312d] outline-none transition placeholder:text-[#14312d]/40 focus:border-[#14312d]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#14312d]/70">
                Urgence
                <select
                  value={urgence}
                  onChange={(event) => setUrgence(event.target.value as (typeof urgenceLevels)[number])}
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 text-base font-semibold text-[#14312d] outline-none transition focus:border-[#14312d]"
                >
                  {urgenceLevels.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {successMessage ? (
            <div className="mt-8 rounded-2xl bg-[#d8f3dc] px-5 py-4 text-sm font-black text-[#1b5e20] ring-1 ring-[#95d5b2]">
              {successMessage}
            </div>
          ) : null}

          {alertes.length > 0 ? (
            <div className="mt-8 rounded-2xl bg-[#fff3bf] px-5 py-4 text-sm font-black text-[#7a4f00] ring-1 ring-[#ffd43b]">
              {alertes[0]}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric value={String(filteredBesoins.length)} label="Besoins affiches" />
            <Metric value={String(localBesoins.length)} label="Demandes en memoire" />
            <Metric value={String(new Set(localBesoins.map((besoin) => besoin.quai)).size)} label="Quais cibles" />
          </div>

          <div className="mt-8 hidden overflow-hidden rounded-3xl border border-[#14312d]/10 lg:block">
            <table className="w-full border-collapse bg-white text-left">
              <thead className="bg-[#14312d] text-white">
                <tr>
                  <ColumnHeader>Espece</ColumnHeader>
                  <ColumnHeader>Quai</ColumnHeader>
                  <ColumnHeader>Quantite</ColumnHeader>
                  <ColumnHeader>Priorite</ColumnHeader>
                  <ColumnHeader>Urgence</ColumnHeader>
                  <ColumnHeader>Commentaire</ColumnHeader>
                </tr>
              </thead>
              <tbody>
                {filteredBesoins.map((besoin) => (
                  <tr key={besoin.id} className="border-t border-[#14312d]/10">
                    <Cell strong>{besoin.espece}</Cell>
                    <Cell>{besoin.quai}</Cell>
                    <Cell>{besoin.quantite}</Cell>
                    <Cell>
                      <PriorityBadge priority={prioritiesByNeedId.get(besoin.id)?.priorite ?? "Faible"} />
                    </Cell>
                    <Cell>
                      <UrgenceBadge urgence={besoin.urgence} />
                    </Cell>
                    <Cell>{besoin.commentaire}</Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 lg:hidden">
            {filteredBesoins.map((besoin) => (
              <article key={besoin.id} className="rounded-3xl border border-[#14312d]/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{besoin.espece}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{besoin.quai}</p>
                  </div>
                  <UrgenceBadge urgence={besoin.urgence} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MobileDetail label="Quantite" value={besoin.quantite} />
                  <MobileDetail label="Priorite" value={prioritiesByNeedId.get(besoin.id)?.priorite ?? "Faible"} />
                  <MobileDetail label="Urgence" value={besoin.urgence} />
                </div>
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-[#14312d]/70">{besoin.commentaire}</p>
              </article>
            ))}
          </div>

          {filteredBesoins.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#14312d]/20 p-8 text-center">
              <p className="text-lg font-black">Aucun besoin ne correspond aux criteres.</p>
              <p className="mt-2 text-sm text-[#14312d]/65">Modifiez la recherche ou le niveau d'urgence selectionne.</p>
            </div>
          ) : null}
        </section>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-[#14312d]/45 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <section className="w-full rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-[#14312d]/10 sm:max-w-2xl sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Publication</p>
                <h2 className="mt-3 text-3xl font-black">Nouveau besoin</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black transition hover:border-[#14312d]"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <FormField label="Espece" error={errors.espece}>
                <input
                  value={form.espece}
                  onChange={(event) => updateForm("espece", event.target.value)}
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 font-semibold outline-none focus:border-[#14312d]"
                />
              </FormField>
              <FormField label="Quantite" error={errors.quantite}>
                <input
                  value={form.quantite}
                  onChange={(event) => updateForm("quantite", event.target.value)}
                  inputMode="decimal"
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 font-semibold outline-none focus:border-[#14312d]"
                />
              </FormField>
              <FormField label="Unite">
                <select
                  value={form.unite}
                  onChange={(event) => updateForm("unite", event.target.value)}
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 font-semibold outline-none focus:border-[#14312d]"
                >
                  <option value="kg">kg</option>
                  <option value="tonne">tonne</option>
                </select>
              </FormField>
              <FormField label="Quai" error={errors.quai}>
                <input
                  value={form.quai}
                  onChange={(event) => updateForm("quai", event.target.value)}
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 font-semibold outline-none focus:border-[#14312d]"
                />
              </FormField>
              <FormField label="Niveau d'urgence">
                <select
                  value={form.urgence}
                  onChange={(event) => updateForm("urgence", event.target.value as UrgenceLevel)}
                  className="h-12 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 font-semibold outline-none focus:border-[#14312d]"
                >
                  {publicationUrgences.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Commentaire optionnel" wide>
                <textarea
                  value={form.commentaire}
                  onChange={(event) => updateForm("commentaire", event.target.value)}
                  className="min-h-24 rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 py-3 font-semibold outline-none focus:border-[#14312d]"
                />
              </FormField>
              <button type="submit" className="h-12 rounded-2xl bg-[#14312d] px-5 font-black text-white transition hover:bg-[#1e4a43] sm:col-span-2">
                Publier
              </button>
            </form>
          </section>
        </div>
      ) : null}
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

function UrgenceBadge({ urgence }: { urgence: UrgenceLevel }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${urgenceStyles[urgence]}`}>{urgence}</span>;
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

function FormField({ children, error, label, wide = false }: { children: React.ReactNode; error?: string; label: string; wide?: boolean }) {
  return (
    <label className={`grid gap-2 text-sm font-bold text-[#14312d]/70 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
      {error ? <span className="text-xs font-black text-[#d65a31]">{error}</span> : null}
    </label>
  );
}
