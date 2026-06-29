import Link from "next/link";
import type { EspaceProfile, ProfileMetrics } from "@/lib/espaces";
import { getRoleJourney } from "@/lib/productJourney";
import type { RoleRecommendation } from "@/lib/roleRecommendations";
import { ProfileSummary } from "@/components/espaces/ProfileSummary";
import { RoleRecommendationsByRoleSection } from "@/components/roleRecommendations/RoleRecommendationPanels";

export function RoleSpacePage({ espace, metrics, recommendations }: { espace: EspaceProfile; metrics: ProfileMetrics; recommendations: RoleRecommendation[] }) {
  const journey = getRoleJourney(espace.slug === "admin" ? "administration" : espace.slug);

  return (
    <>
      <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap gap-2">
            <Link href="/espaces" className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold transition hover:border-[#14312d]">
              Tous les espaces
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
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Espace dédié</p>
                <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{espace.role}</h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">{espace.mission}</p>
              </div>
              <ProfileSummary role={espace.role} metrics={metrics} />
            </div>
          </section>

          {journey ? (
            <section className="mt-6 rounded-3xl bg-[#14312d] p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Ce que je dois faire maintenant</p>
              <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_16rem] lg:items-center">
                <div>
                  <h2 className="text-3xl font-black">{journey.premiereAction}</h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/72">{journey.valeurAttendue}</p>
                </div>
                <Link href={journey.lienPrincipal} className="rounded-2xl bg-white px-5 py-4 text-center text-sm font-black text-[#14312d] transition hover:bg-[#f7f4ec]">
                  Démarrer l'action
                </Link>
              </div>
            </section>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
              <h2 className="text-2xl font-black">Mes prochaines étapes</h2>
              <div className="mt-6 grid gap-3">
                {(journey?.prochainesActions ?? espace.needs).map((step) => (
                  <p key={step} className="rounded-2xl bg-[#f7f4ec] p-4 text-sm font-bold leading-6 text-[#14312d]/75">
                    {step}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
              <h2 className="text-2xl font-black">Mes modules utiles</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(journey?.modulesUtiles ?? espace.features).map((feature) => (
                  <Link key={`${feature.href}-${feature.label}`} href={feature.href} className="rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 py-4 text-sm font-black transition hover:border-[#14312d] hover:bg-white">
                    {feature.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {journey ? (
            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
              <h2 className="text-2xl font-black">Signaux importants à regarder</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {journey.donneesARegarder.map((signal) => (
                  <p key={signal} className="rounded-2xl bg-[#f7f4ec] p-4 text-sm font-black text-[#14312d]">
                    {signal}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <RoleRecommendationsByRoleSection recommendations={recommendations} role={recommendations[0]?.role ?? "Pêcheur"} />
    </>
  );
}
