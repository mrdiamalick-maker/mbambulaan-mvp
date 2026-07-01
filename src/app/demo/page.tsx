import Link from "next/link";
import { PageIntro, PublicNav, RoleSelector, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNav />
      <PageIntro
        eyebrow="Démo personnalisée"
        title="Choisissez le scénario adapté à votre rôle."
        description="La démo n'ouvre pas tout le produit publiquement. Elle montre uniquement la valeur utile pour chaque type de prospect, puis oriente vers le cadrage ou l'espace premium simulé."
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="blue">Avant achat : preuve de valeur</StatusBadge>
          <StatusBadge tone="green">Après cadrage : espace premium simulé</StatusBadge>
        </div>
      </PageIntro>
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <RoleSelector />
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
        <SectionCard title="Parcours de démonstration" description="Le fil directeur reste le même, mais la lecture change selon le rôle.">
          <div className="grid gap-3">
            {["Signal terrain", "Qualification", "Décision prioritaire", "Preuve", "Rapport", "Espace premium"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                <p className="font-black text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Accès contrôlé" description="Les modules opérationnels ne sont pas des pages publiques autonomes.">
          <p className="text-sm font-semibold leading-6 text-slate-600">Les arrivages, besoins, opportunités, financements, rapports et preuves apparaissent dans les démos par rôle et dans l'espace premium simulé.</p>
          <Link href="/espace-prive" className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Voir l'après souscription</Link>
        </SectionCard>
      </section>
    </main>
  );
}
