import Link from "next/link";
import { getPriorityActions, getRoleJourneys, transversalFlows } from "@/lib/productJourney";
import { PageShell } from "@/components/ui/PageShell";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function ParcoursPage() {
  const journeys = getRoleJourneys();
  const actions = getPriorityActions();

  return (
    <PageShell className="bg-[#F8FAFC]">
      <main className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {[
            { href: "/", label: "Accueil" },
            { href: "/demo", label: "Démo" },
            { href: "/executive", label: "Executive" }
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0] transition hover:bg-[#F8FAFC]">
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-6 rounded-[2rem] bg-[#0F2D4A] p-6 text-white shadow-[0_18px_45px_rgba(15,45,74,0.16)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/65">Entrée produit</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Choisissez votre parcours</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/76">
            Qui êtes-vous ? Que voulez-vous faire maintenant ? Mbàmbulaan oriente chaque acteur vers l'action utile, puis vers le module suivant.
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {journeys.map((journey) => (
            <ProductCard key={journey.slug}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Profil</p>
                  <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">{journey.label}</h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#334155]">{journey.objectifPrincipal}</p>
                </div>
                <Link href={journey.lienPrincipal} className="rounded-xl bg-[#0F2D4A] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#1F6F8B]">
                  Commencer comme {journey.label.toLowerCase()}
                </Link>
              </div>

              <div className="mt-5 rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Action recommandée</p>
                <p className="mt-2 text-lg font-black text-[#0F2D4A]">{journey.premiereAction}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#334155]">{journey.valeurAttendue}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoList title="Puis" items={journey.prochainesActions} />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Modules utiles</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {journey.modulesUtiles.map((module) => (
                      <Link key={module.href} href={module.href} className="rounded-full bg-[#F8FAFC] px-3 py-2 text-xs font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0] transition hover:bg-white">
                        {module.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </ProductCard>
          ))}
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Actions prioritaires</p>
            <div className="mt-4 grid gap-3">
              {actions.slice(0, 5).map((action) => (
                <Link key={action.titre} href={action.lien} className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0] transition hover:bg-white">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-[#0F2D4A]">{action.titre}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-[#334155]">{action.description}</p>
                    </div>
                    <StatusBadge tone={action.statutRecommande === "Maintenant" ? "info" : action.statutRecommande === "Ensuite" ? "warning" : "neutral"}>
                      {action.statutRecommande}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </ProductCard>

          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Parcours transverses</p>
            <div className="mt-4 grid gap-3">
              {transversalFlows.map((flow) => (
                <article key={flow.id} className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-[#0F2D4A]">{flow.titre}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-[#334155]">{flow.description}</p>
                    </div>
                    <Link href={flow.moduleFinal.href} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#0F2D4A] ring-1 ring-[#E2E8F0]">
                      {flow.moduleFinal.label}
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {flow.etapes.map((step) => (
                      <span key={step} className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#334155] ring-1 ring-[#E2E8F0]">
                        {step}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </ProductCard>
        </section>
      </main>
    </PageShell>
  );
}

function InfoList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <p key={item} className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-sm font-bold text-[#334155] ring-1 ring-[#E2E8F0]">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
