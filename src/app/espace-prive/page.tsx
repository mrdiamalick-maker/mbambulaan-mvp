import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";
import { privateSpaceConfigs } from "@/data/privateSpaces";

export default function EspacePrivePortalPage() {
  return (
    <main className="min-h-screen bg-[#f6fbfb]">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <StatusBadge tone="blue">Accès partenaire</StatusBadge>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-slate-950">
          Choisir l’espace privé adapté à l’organisation.
        </h1>
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-600">
          Dans le produit réel, l'utilisateur ne voit que l'espace correspondant à son organisation, son rôle et ses droits. Les accès ci-dessous simulent ce que chaque partenaire obtient après cadrage : lecture, action, preuve et suivi.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="rounded-full border border-cyan-200 bg-white px-5 py-3 text-center text-sm font-black text-cyan-950">Retour landing</Link>
          <Link href="/demande-demo" className="rounded-full bg-cyan-700 px-5 py-3 text-center text-sm font-black text-white">Demander un essai</Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
        {privateSpaceConfigs.map((space) => (
          <SectionCard key={space.key} title={space.roleLabel} description={space.intro}>
            <Link href={`/espace-prive/${space.key}`} className="inline-flex rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white">
              Ouvrir la simulation
            </Link>
          </SectionCard>
        ))}
      </section>
    </main>
  );
}
