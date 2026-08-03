"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, PhoneCall, UserRound } from "lucide-react";

export default function TelephonePage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6 lg:px-10">
      <section className="mx-auto max-w-3xl">
        <Link href="/terrain" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ocean-800)]">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--white)] shadow-[var(--shadow-md)]">
          <div className="bg-[var(--ocean-1000)] px-6 py-8 text-white sm:px-8">
            <span className="grid size-12 place-items-center rounded-full bg-[var(--lagoon-500)] text-[var(--ocean-1000)]"><PhoneCall size={22} /></span>
            <p className="label-inverse mt-5">Canal téléphonique</p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">Demandez à être rappelé.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Une personne vous rappelle, écoute votre besoin et l'enregistre dans Mbàmbulaan. Vous n'avez pas besoin de compte.</p>
          </div>

          {!sent ? (
            <form className="space-y-5 p-6 sm:p-8" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--ink)]">Votre numéro de téléphone</span>
                <input required inputMode="tel" placeholder="Ex. 77 000 00 00" className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--white)] px-4 py-3 text-sm outline-none transition focus:border-[var(--lagoon-500)]" />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[var(--ink)]">Vous êtes…</span>
                <select className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--white)] px-4 py-3 text-sm outline-none transition focus:border-[var(--lagoon-500)]">
                  <option>Capitaine ou pêcheur</option>
                  <option>Agent de quai</option>
                  <option>Mareyeur ou acheteur</option>
                  <option>Transformateur</option>
                  <option>Prestataire glace, froid ou transport</option>
                  <option>Organisation ou coopérative</option>
                  <option>Autre</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[var(--ink)]">Pourquoi faut-il vous rappeler ?</span>
                <textarea rows={4} placeholder="Ex. Je rentre à Hann dans une heure et j'ai besoin de glace." className="mt-2 w-full resize-none rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--white)] px-4 py-3 text-sm outline-none transition focus:border-[var(--lagoon-500)]" />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold text-[var(--ink)]">Quand pouvons-nous appeler ?</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {["Dès que possible", "Dans 1 heure", "Plus tard aujourd'hui"].map((item, index) => (
                    <label key={item} className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--canvas)] p-3 text-sm text-[var(--ink)]">
                      <input type="radio" name="time" defaultChecked={index === 0} /> {item}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="btn-accent w-full justify-center"><PhoneCall size={17} /> Demander un appel</button>
            </form>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="rounded-[var(--radius-md)] border border-[var(--lagoon-200)] bg-[var(--lagoon-100)] p-5">
                <CheckCircle2 className="text-[var(--lagoon-600)]" size={28} />
                <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Votre demande a été reçue.</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Une personne vous rappellera et vérifiera avec vous les informations utiles avant de créer la demande dans Mbàmbulaan.</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="surface-quiet p-4"><Clock3 size={18} className="text-[var(--ocean-800)]" /><p className="mt-2 text-sm font-semibold text-[var(--ink)]">Étape suivante</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Un opérateur reprend votre besoin avec des questions simples.</p></div>
                <div className="surface-quiet p-4"><UserRound size={18} className="text-[var(--ocean-800)]" /><p className="mt-2 text-sm font-semibold text-[var(--ink)]">Validation humaine</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Les informations importantes sont vérifiées avant d'être utilisées.</p></div>
              </div>
              <Link href="/terrain" className="btn-primary mt-6">Retour à l'accueil terrain</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
