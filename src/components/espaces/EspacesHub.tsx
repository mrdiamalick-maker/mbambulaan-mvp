import Link from "next/link";
import type { EspaceProfile, ProfileMetrics } from "@/lib/espaces";
import { getRoleJourneys } from "@/lib/productJourney";
import { ProfileSummary } from "@/components/espaces/ProfileSummary";

export function EspacesHub({ espaces, metrics }: { espaces: EspaceProfile[]; metrics: ProfileMetrics }) {
  const journeys = getRoleJourneys();

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          <Link href="/" className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold transition hover:border-[#14312d]">
            Accueil
          </Link>
          <Link href="/demo" className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold transition hover:border-[#14312d]">
            Démo
          </Link>
          <Link href="/parcours" className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold transition hover:border-[#14312d]">
            Parcours
          </Link>
        </nav>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Espaces acteurs</p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Un espace pour chaque métier de la filière.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Mbàmbulaan adapte le même écosystème de coordination aux pêcheurs, mareyeurs, transformateurs, collectivités et administrateurs.
              </p>
            </div>
            <ProfileSummary role="Vue plateforme" metrics={metrics} />
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {espaces.map((espace) => (
            <article key={espace.slug} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
              {(() => {
                const journey = journeys.find((item) => item.slug === (espace.slug === "admin" ? "administration" : espace.slug));

                return (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Profil</p>
                        <h2 className="mt-3 text-3xl font-black">{espace.role}</h2>
                      </div>
                      <Link href={`/espaces/${espace.slug}`} className="rounded-full bg-[#14312d] px-4 py-2 text-center text-sm font-black text-white transition hover:bg-[#1e4a43]">
                        Entrer dans cet espace
                      </Link>
                    </div>
                    <p className="mt-5 text-sm font-bold leading-6 text-[#14312d]/70">{espace.mission}</p>
                    {journey ? (
                      <div className="mt-5 rounded-2xl bg-[#f7f4ec] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Action recommandée</p>
                        <p className="mt-2 text-lg font-black">{journey.premiereAction}</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#14312d]/70">{journey.valeurAttendue}</p>
                      </div>
                    ) : null}
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <InfoBlock title="Besoins" items={espace.needs} />
                      <InfoBlock title="Fonctionnalités disponibles" items={espace.features.map((feature) => feature.label)} />
                    </div>
                  </>
                );
              })()}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function InfoBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <p key={item} className="text-sm font-bold leading-6 text-[#14312d]/70">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
