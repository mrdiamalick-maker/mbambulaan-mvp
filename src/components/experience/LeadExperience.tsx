"use client";

import Link from "next/link";
import { useState } from "react";

export function LeadExperience({ kind }: { kind: "demo" | "devis" }) {
  const [submitted, setSubmitted] = useState(false);
  const isDemo = kind === "demo";
  const fields = isDemo
    ? ["Nom", "Organisation", "Rôle", "Email", "Téléphone", "Type d'organisation", "Objectif", "Territoire"]
    : ["Organisation", "Type d'acteur", "Territoire", "Besoin principal", "Échéance", "Niveau d'accompagnement", "Contact", "Email"];

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-black text-[#0d3b4c]">Mbàmbulaan</Link>
        <Link href="/demo" className="text-sm font-black text-[#0d6f8d]">Voir les démos</Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">{isDemo ? "Demande de démo complète" : "Demande de devis"}</p>
          <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">
            {isDemo ? "Cadrer une démo adaptée à votre rôle." : "Cadrer une proposition adaptée à votre territoire."}
          </h1>
          <p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">
            Ce formulaire arrive après la démonstration de valeur. Il sert à préparer un échange, un pilote, une convention ou une offre. Aucun accès automatique n'est promis.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              "Démo qualifiée",
              "Pilote cadré",
              "Offre adaptée"
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 text-sm font-black text-[#0d3b4c] shadow-sm">{item}</div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl">
          {submitted ? (
            <div className="grid min-h-[26rem] place-items-center text-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Demande préparée</p>
                <h2 className="mt-4 text-3xl font-black text-[#0d3b4c]">Votre demande est prête à être traitée.</h2>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#52656f]">
                  Version sans backend : aucune donnée n'est envoyée. Cette confirmation simule l'état attendu après soumission.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/demo" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-sm font-black text-white">Revenir aux démos</Link>
                  <Link href="/" className="rounded-full border border-[#d8e1e5] px-6 py-4 text-sm font-black text-[#0d3b4c]">Accueil</Link>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((label) => (
                  <label key={label} className="grid gap-2 text-sm font-black text-[#0d3b4c]">
                    {label}
                    <input className="min-h-12 rounded-2xl border border-[#dce5e8] bg-[#f8fbfb] px-4" placeholder={label} required />
                  </label>
                ))}
              </div>
              <label className="mt-4 grid gap-2 text-sm font-black text-[#0d3b4c]">
                Message
                <textarea className="min-h-28 rounded-2xl border border-[#dce5e8] bg-[#f8fbfb] p-4" placeholder="Expliquez le contexte, le territoire ou l'objectif recherché." />
              </label>
              <button className="mt-5 rounded-full bg-[#0d6f8d] px-6 py-4 text-sm font-black text-white" type="submit">
                {isDemo ? "Préparer la demande de démo" : "Préparer la demande de devis"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
