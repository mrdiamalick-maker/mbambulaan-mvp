"use client";

import Link from "next/link";
import { useState } from "react";
import { roleProfiles } from "@/components/experience/RoleWorkspaceV2";

export function LeadExperience({ kind }: { kind: "demo" | "devis" }) {
  const [submitted, setSubmitted] = useState(false);
  const isDemo = kind === "demo";
  const fields = isDemo
    ? ["Nom", "Organisation", "Rôle", "Email", "Téléphone", "Type d'organisation", "Objectif", "Territoire"]
    : ["Organisation", "Type d'acteur", "Territoire", "Besoin principal", "Échéance", "Niveau d'accompagnement", "Contact", "Email"];

  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#112f36]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black text-[#102f3a]">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#102f3a] text-sm text-white">Mb</span>
          <span>Mbàmbulaan</span>
        </Link>
        <Link href="/demo" className="text-sm font-black text-[#0d6f8d]">Revoir les espaces</Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0d6f8d]">
            {isDemo ? "Demande de démo qualifiée" : "Cadrage commercial"}
          </p>
          <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.055em] text-[#102f3a]">
            {isDemo ? "Préparer une démo adaptée à votre rôle." : "Cadrer un pilote ou une offre adaptée."}
          </h1>
          <p className="mt-5 text-lg font-bold leading-8 text-[#52656f]">
            Le formulaire n’est pas la finalité du produit. Il intervient après la démonstration pour préparer un échange, une convention, un pilote ou une offre.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {roleProfiles.slice(0, 6).map((profile) => (
              <Link key={profile.slug} href={`/demo/${profile.slug}`} className="rounded-2xl border border-[#d9e4e6] bg-white p-4 text-sm font-black text-[#102f3a] shadow-sm">
                {profile.shortLabel} · {profile.scenario}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-2xl">
          {submitted ? (
            <div className="grid min-h-[32rem] place-items-center rounded-[1.6rem] bg-[#f8fbf8] p-8 text-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Demande préparée</p>
                <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#102f3a]">
                  Votre demande est prête à être reprise par l’équipe Mbàmbulaan.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-6 text-[#52656f]">
                  Version sans backend : aucune donnée n’est envoyée. Cette confirmation simule l’état attendu après soumission dans un futur parcours privé.
                </p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/demo" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-sm font-black text-white">Revenir aux démos</Link>
                  <Link href="/" className="rounded-full border border-[#cbd9dc] bg-white px-6 py-4 text-sm font-black text-[#102f3a]">Accueil</Link>
                </div>
              </div>
            </div>
          ) : (
            <form
              className="rounded-[1.6rem] bg-[#f8fbf8] p-5"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((label) => (
                  <label key={label} className="grid gap-2 text-sm font-black text-[#102f3a]">
                    {label}
                    <input className="min-h-12 rounded-2xl border border-[#dce5e8] bg-white px-4" placeholder={label} required />
                  </label>
                ))}
              </div>
              <label className="mt-4 grid gap-2 text-sm font-black text-[#102f3a]">
                Contexte
                <textarea className="min-h-32 rounded-2xl border border-[#dce5e8] bg-white p-4" placeholder="Décrivez le territoire, le rôle, le programme, le besoin ou le pilote à cadrer." />
              </label>
              <button className="mt-5 rounded-full bg-[#0d6f8d] px-6 py-4 text-sm font-black text-white" type="submit">
                {isDemo ? "Préparer la demande de démo" : "Préparer la demande de devis"}
              </button>
              <p className="mt-4 text-xs font-bold leading-5 text-[#65767c]">
                Aucun backend, aucune base de données : ce formulaire confirme localement l’intention seulement.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
