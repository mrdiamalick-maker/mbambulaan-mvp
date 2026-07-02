import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";
import { privateSpaceConfigs } from "@/data/privateSpaces";

export default function EspacePrivePortalPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eefbf9_0%,#f8fcfb_52%,#fff8eb_100%)]">
      <PublicNav />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
        <div>
          <StatusBadge tone="blue">Accès partenaire après cadrage</StatusBadge>
          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-slate-950">
            Chaque organisation accède à un espace privé adapté à son rôle.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-600">
            Cette page simule les espaces activés après convention, pilote ou abonnement. Le Ministère est l’espace de référence : lecture régionale, quais, actions, preuves et IA gouvernée.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/espace-prive/etat" className="rounded-full bg-cyan-700 px-5 py-3 text-center text-sm font-black text-white">Ouvrir l’espace Ministère</Link>
            <Link href="/demande-demo" className="rounded-full border border-cyan-200 bg-white px-5 py-3 text-center text-sm font-black text-cyan-950">Demander un essai</Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-cyan-100 bg-white/85 p-5 shadow-sm shadow-cyan-950/5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Principe d’accès</p>
          <div className="mt-4 grid gap-3">
            {["Rôle et droits définis", "Modules activés selon cadrage", "Données simulées pour la démonstration", "Actions et traces visibles sans backend"].map((item, index) => (
              <div key={item} className="grid grid-cols-[2rem_1fr] gap-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-emerald-50 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-700 text-xs font-black text-white">{index + 1}</span>
                <span className="self-center text-sm font-black text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
        {privateSpaceConfigs.map((space) => (
          <SectionCard key={space.key} title={space.roleLabel} description={space.key === "etat" ? "Espace de référence : pilotage régional, quais, budgets, actions, preuves et IA gouvernée." : `${space.intro} Simulation pilote après cadrage.`}>
            <Link href={`/espace-prive/${space.key}`} className={`inline-flex rounded-full px-5 py-3 text-sm font-black ${space.key === "etat" ? "bg-gradient-to-r from-cyan-700 to-teal-600 text-white" : "bg-cyan-50 text-cyan-950 ring-1 ring-cyan-200"}`}>
              Ouvrir la simulation
            </Link>
          </SectionCard>
        ))}
      </section>
    </main>
  );
}
