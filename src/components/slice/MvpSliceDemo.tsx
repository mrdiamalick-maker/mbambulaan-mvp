import Link from "next/link";
import type { MvpSliceSummary } from "@/lib/mvpSlice";
import { ActionQueue, DecisionSummary, NeedCard, OpportunityCard, QualityBadge, SignalCard, TerritoryTensionCard, Timeline, TrustBadge } from "@/components/slice/SliceComponents";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function MvpSliceDemo({ slice }: { slice: MvpSliceSummary }) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-5 py-8 text-[#0F2D4A] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className={`rounded-full px-4 py-2 text-sm font-black ring-1 transition ${item.href === "/demo" ? "bg-[#0F2D4A] text-white ring-[#0F2D4A]" : "bg-white text-[#0F2D4A] ring-[#E2E8F0] hover:bg-[#F8FAFC]"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-[2rem] bg-[#0F2D4A] p-6 text-white shadow-[0_18px_45px_rgba(15,45,74,0.16)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <StatusBadge tone="impact">MVP slice exécutable</StatusBadge>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Signal terrain → décision prouvée</h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-white/78">
                Cette démo montre Mbàmbulaan comme Operating System de coordination : un signal local est qualifié, relié à un besoin, transformé en action, documenté par une preuve puis résumé pour la décision.
              </p>
            </div>
            <ProductCard tone="dark" className="border-white/15 bg-white/10">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">Résultat attendu</p>
              <p className="mt-3 text-2xl font-black text-white">{slice.report.impact}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/70">Une action prioritaire peut être suivie, justifiée et présentée à un décideur.</p>
            </ProductCard>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <SignalCard signal={slice.signal} trust={slice.trustSignals[0]} />
          <NeedCard need={slice.need} />
          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Qualification</p>
            <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Le signal devient exploitable</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#334155]">
              Mbàmbulaan ne pousse pas une donnée brute. Le signal reçoit un niveau de preuve, une lecture qualité et une confiance acteur.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <QualityBadge quality={slice.quality} />
              {slice.trustSignals.map((signal) => (
                <TrustBadge key={signal.id} score={signal.score} />
              ))}
            </div>
          </ProductCard>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <TerritoryTensionCard tension={slice.tension} />
          <OpportunityCard opportunity={slice.opportunity} />
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
          <ActionQueue actions={[slice.action]} />
          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Timeline du slice</p>
            <div className="mt-4">
              <Timeline steps={slice.steps} />
            </div>
          </ProductCard>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Preuves conservées</p>
            <div className="mt-4 grid gap-3">
              {slice.proofs.map((proof) => (
                <article key={proof.id} className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#0F2D4A]">{proof.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{proof.description}</p>
                    </div>
                    <StatusBadge tone="success">{proof.proofLevel}</StatusBadge>
                  </div>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#1F6F8B]">{proof.source} · {proof.date}</p>
                </article>
              ))}
            </div>
          </ProductCard>
          <DecisionSummary slice={slice} />
        </section>
      </div>
    </main>
  );
}

const navigationItems = [
  { href: "/", label: "Accueil" },
  { href: "/demo", label: "Démo" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/coordination", label: "Coordination" },
  { href: "/executive", label: "Vue exécutive" }
];
