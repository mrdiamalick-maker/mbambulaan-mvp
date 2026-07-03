import Link from "next/link";
import { PageIntro, PublicNav, RoleSelector, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#f6fbfb]">
      <PublicNav />
      <PageIntro
        eyebrow="Qualification d'essai"
        title="Choisir le scénario qui montre la bonne décision."
        description="La démo qualifie votre profil, votre territoire et la valeur à montrer. Elle ne donne pas accès à tout le produit publiquement : elle révèle le parcours utile pour comprendre Mbàmbulaan."
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="blue">Données terrain</StatusBadge>
          <StatusBadge tone="green">Coordination</StatusBadge>
          <StatusBadge tone="amber">Preuves et reporting</StatusBadge>
        </div>
      </PageIntro>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
        <SectionCard title="1. Choisir le profil" description="Chaque profil voit un scénario adapté, pas une interface complète.">
          <RoleSelector />
        </SectionCard>
        <SectionCard title="2. Voir le parcours utile" description="Le parcours montre uniquement le problème métier prioritaire.">
          <div className="grid gap-3">
            {["Signal terrain", "Analyse territoriale", "Coordination", "Action prioritaire", "Trace et rapport"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-cyan-100">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-700 text-xs font-black text-white">{index + 1}</span>
                <p className="font-black text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="3. Cadrer l'essai" description="Après qualification, le prospect peut demander un essai ou cadrer un pilote.">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            L'espace privé simulé reste un support de présentation. Dans le produit réel, chaque utilisateur ne voit que son espace selon ses droits.
          </p>
          <Link href="/demande-demo" className="mt-5 inline-flex rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white">
            Demander un essai
          </Link>
        </SectionCard>
      </section>
    </main>
  );
}
