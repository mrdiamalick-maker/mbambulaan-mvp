import Link from "next/link";
import type { EspaceProfile, ProfileMetrics } from "@/lib/espaces";
import { ProfileSummary } from "@/components/espaces/ProfileSummary";

export function RoleSpacePage({ espace, metrics }: { espace: EspaceProfile; metrics: ProfileMetrics }) {
  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          <Link href="/espaces" className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold transition hover:border-[#14312d]">
            Tous les espaces
          </Link>
          <Link href="/demo" className="rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold transition hover:border-[#14312d]">
            Démo
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
            <h2 className="text-2xl font-black">Ce que cet espace résout</h2>
            <div className="mt-6 grid gap-3">
              {espace.needs.map((need) => (
                <p key={need} className="rounded-2xl bg-[#f7f4ec] p-4 text-sm font-bold leading-6 text-[#14312d]/75">
                  {need}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
            <h2 className="text-2xl font-black">Modules disponibles</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {espace.features.map((feature) => (
                <Link key={`${feature.href}-${feature.label}`} href={feature.href} className="rounded-2xl border border-[#14312d]/15 bg-[#f7f4ec] px-4 py-4 text-sm font-black transition hover:border-[#14312d] hover:bg-white">
                  {feature.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
