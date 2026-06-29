"use client";

import Link from "next/link";
import { useState } from "react";
import { getWorkspace, roleProfiles, type RoleSlug } from "@/components/experience/RoleWorkspaceV2";

export function ProfileSelector() {
  const [selectedSlug, setSelectedSlug] = useState<RoleSlug>("etat");
  const selectedProfile = roleProfiles.find((profile) => profile.slug === selectedSlug) ?? roleProfiles[0];
  const workspace = getWorkspace(selectedProfile.slug);

  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#112f36]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black text-[#102f3a]">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#102f3a] text-sm text-white">Mb</span>
          <span>Mbàmbulaan</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-black text-[#50636a]">
          <Link href="/">Accueil</Link>
          <Link href="/devis" className="hidden rounded-full border border-[#cbd9dc] bg-white px-4 py-2 text-[#102f3a] sm:inline">Cadrer un pilote</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.68fr_1.32fr]">
        <aside>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0d6f8d]">Démo personnalisée</p>
          <h1 className="mt-4 text-4xl font-black leading-none tracking-[-0.055em] text-[#102f3a] sm:text-6xl">
            Quel espace voulez-vous explorer ?
          </h1>
          <p className="mt-5 text-base font-bold leading-7 text-[#52656f]">
            Choisissez un rôle. Mbàmbulaan ouvre ensuite un espace métier avec indicateurs, données simulées, décisions et actions adaptées.
          </p>

          <div className="mt-8 grid gap-2">
            {roleProfiles.map((profile) => {
              const isSelected = profile.slug === selectedSlug;
              return (
                <button
                  key={profile.slug}
                  type="button"
                  onClick={() => setSelectedSlug(profile.slug)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[#0d6f8d] bg-[#0d6f8d] text-white shadow-lg"
                      : "border-[#d9e4e6] bg-white text-[#102f3a] hover:border-[#0d6f8d]"
                  }`}
                >
                  <span className="block text-xs font-black uppercase tracking-[0.16em] opacity-70">{profile.shortLabel}</span>
                  <strong className="mt-1 block text-sm font-black">{profile.scenario}</strong>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-[2.2rem] border border-[#d8e4e6] bg-white p-4 shadow-2xl">
          <div className="grid min-h-full gap-5 rounded-[1.8rem] bg-[#f9fbf8] p-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col">
              <span className="w-fit rounded-full bg-[#e4f4f7] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">
                {selectedProfile.label}
              </span>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#102f3a]">
                {selectedProfile.scenario}
              </h2>
              <p className="mt-4 text-sm font-bold leading-6 text-[#52656f]">{selectedProfile.problem}</p>
              <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Ce que l’espace doit résoudre</p>
                <p className="mt-3 text-base font-black leading-7 text-[#102f3a]">{selectedProfile.promise}</p>
              </div>
              <div className="mt-auto pt-6">
                <Link
                  href={`/demo/${selectedProfile.slug}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0d6f8d] px-6 text-sm font-black text-white shadow-sm"
                >
                  Entrer dans cet espace
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {selectedProfile.previewKpis.map((kpi) => (
                  <div key={kpi} className="rounded-2xl border border-[#dce8ea] bg-white p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a8a90]">Indicateur</p>
                    <p className="mt-2 text-lg font-black leading-tight text-[#102f3a]">{kpi}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.6rem] bg-[#102f3a] p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Aperçu de l’espace</p>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">{workspace.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/70">{workspace.subhead}</p>
                <div className="mt-5 grid gap-3">
                  {[workspace.context, workspace.problem, selectedProfile.value].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-bold leading-6 text-white/82">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#dce8ea] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Ce qui sera montré</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {["KPIs", "Données", "Carte / flux", "Diagnostic", "Actions", "Preuve / limites"].map((item) => (
                    <span key={item} className="rounded-2xl bg-[#eef5f5] px-3 py-2 text-xs font-black text-[#102f3a]">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
