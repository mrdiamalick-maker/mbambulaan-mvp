import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";
import { privateSpaceConfigs } from "@/data/privateSpaces";

export default function EspacePrivePortalPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <StatusBadge tone="slate">Espaces premium privés</StatusBadge>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-slate-950">Chaque partenaire achète son propre espace opérationnel.</h1>
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-600">Choisissez un espace privé simulé. Chaque profil possède sa sidebar, ses KPIs, ses workflows, ses tableaux et son vocabulaire métier.</p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
        {privateSpaceConfigs.map((space) => (
          <SectionCard key={space.key} title={space.roleLabel} description={space.intro}>
            <Link href={`/espace-prive/${space.key}`} className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Entrer dans l'espace</Link>
          </SectionCard>
        ))}
      </section>
    </main>
  );
}
