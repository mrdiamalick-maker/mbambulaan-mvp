import Link from "next/link";
import type { MvpProofLevel, MvpTensionLevel } from "@/data/mvpSlice";
import type { TerritoryPilotSummary } from "@/lib/territoryPilot";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

const proofTone: Record<MvpProofLevel, StatusTone> = {
  déclaratif: "warning",
  estimé: "info",
  validé: "success",
  système: "dark",
  audité: "impact"
};

const tensionTone: Record<MvpTensionLevel, StatusTone> = {
  Faible: "success",
  Moyenne: "info",
  Forte: "warning",
  Critique: "danger"
};

export function TerritoryPilotScenario({ pilot }: { pilot: TerritoryPilotSummary }) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-5 py-8 text-[#0F2D4A] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className={`rounded-full px-4 py-2 text-sm font-black ring-1 transition ${item.href === "/territoire-pilote" ? "bg-[#0F2D4A] text-white ring-[#0F2D4A]" : "bg-white text-[#0F2D4A] ring-[#E2E8F0] hover:bg-[#F8FAFC]"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-[2rem] bg-[#0F2D4A] p-6 text-white shadow-[0_18px_45px_rgba(15,45,74,0.16)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <StatusBadge tone="impact">Sprint 002 · Territoire pilote</StatusBadge>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{pilot.headline}</h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-white/78">{pilot.narrative}</p>
            </div>
            <ProductCard tone="dark" className="border-white/15 bg-white/10">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">Lecture immédiate</p>
              <p className="mt-3 text-2xl font-black text-white">Tension {pilot.tensionLevel.toLowerCase()}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
                Quai {pilot.quay}, région {pilot.region}. Le territoire pilote devient un espace de coordination lisible.
              </p>
            </ProductCard>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pilot.metrics.map((metric) => (
            <ProductCard key={metric.id}>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">{metric.label}</p>
              <p className="mt-3 text-4xl font-black text-[#0F2D4A]">{metric.value}</p>
              <div className="mt-4">
                <StatusBadge tone={proofTone[metric.proofLevel]}>Preuve {metric.proofLevel}</StatusBadge>
              </div>
            </ProductCard>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <ProductCard tone="active">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Territoire</p>
                <h2 className="mt-2 text-3xl font-black text-[#0F2D4A]">{pilot.quay} coordonné</h2>
              </div>
              <StatusBadge tone={tensionTone[pilot.tensionLevel]}>{pilot.tensionLevel}</StatusBadge>
            </div>
            <div className="mt-5 grid gap-3">
              <TerritoryLine label="Signal" value={`${pilot.signal.volume} de ${pilot.signal.species}`} proofLevel={pilot.signal.proofLevel} />
              <TerritoryLine label="Besoin" value={`${pilot.need.volume} demandés`} proofLevel={pilot.need.proofLevel} />
              <TerritoryLine label="Action" value={pilot.action.status} proofLevel={pilot.action.proofLevel} />
            </div>
          </ProductCard>

          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Flux démontrable</p>
            <div className="mt-4 grid gap-3">
              {pilot.flow.map((step, index) => (
                <article key={step.id} className="grid gap-3 rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0] md:grid-cols-[3rem_1fr_auto] md:items-start">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2D4A] text-sm font-black text-white">{index + 1}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-[#0F2D4A]">{step.title}</h3>
                      <StatusBadge tone="neutral">{step.module}</StatusBadge>
                      <StatusBadge tone={proofTone[step.proofLevel]}>Preuve {step.proofLevel}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{step.description}</p>
                    <p className="mt-2 text-sm font-black leading-6 text-[#0F2D4A]">Décision : {step.decision}</p>
                  </div>
                  <Link href={step.href} className="rounded-xl bg-white px-4 py-2 text-center text-xs font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0] transition hover:bg-[#F8FAFC]">
                    Ouvrir
                  </Link>
                </article>
              ))}
            </div>
          </ProductCard>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Acteurs mobilisés</p>
            <div className="mt-4 grid gap-3">
              {pilot.actors.map((actor) => (
                <article key={actor.id} className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                  <h3 className="text-lg font-black text-[#0F2D4A]">{actor.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#334155]">{actor.role}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge tone="neutral">{actor.status}</StatusBadge>
                    <StatusBadge tone={proofTone[actor.proofLevel]}>Preuve {actor.proofLevel}</StatusBadge>
                  </div>
                </article>
              ))}
            </div>
          </ProductCard>

          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Preuves conservées</p>
            <div className="mt-4 grid gap-3">
              {pilot.proofs.map((proof) => (
                <article key={proof.id} className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                  <h3 className="text-lg font-black text-[#0F2D4A]">{proof.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{proof.description}</p>
                  <div className="mt-3">
                    <StatusBadge tone={proofTone[proof.proofLevel]}>Preuve {proof.proofLevel}</StatusBadge>
                  </div>
                </article>
              ))}
            </div>
          </ProductCard>

          <ProductCard tone="dark" className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">{pilot.synthesis.title}</p>
            <h2 className="mt-3 text-3xl font-black text-white">{pilot.synthesis.impact}</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/75">{pilot.synthesis.decision}</p>
            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-6 text-white/70">Limite : {pilot.synthesis.limits}</p>
          </ProductCard>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-5 ring-1 ring-[#E2E8F0] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Actions suivantes</p>
              <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Passer du signal local à la décision coordonnée.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {pilot.nextActions.map((action) => (
                <Link key={action.href} href={action.href} className="rounded-xl bg-[#0F2D4A] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1F6F8B]">
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TerritoryLine({ label, proofLevel, value }: { label: string; proofLevel: MvpProofLevel; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-[#E2E8F0] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">{label}</p>
        <p className="mt-1 text-lg font-black text-[#0F2D4A]">{value}</p>
      </div>
      <StatusBadge tone={proofTone[proofLevel]}>Preuve {proofLevel}</StatusBadge>
    </div>
  );
}

const navigationItems = [
  { href: "/", label: "Accueil" },
  { href: "/demo", label: "Démo" },
  { href: "/territoire-pilote", label: "Territoire pilote" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/coordination", label: "Coordination" },
  { href: "/executive", label: "Vue exécutive" }
];
