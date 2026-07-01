import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "./PremiumComponents";

export function ModuleGateNotice({ moduleName }: { moduleName: string }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNav />
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <StatusBadge tone="slate">Module privé</StatusBadge>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">{moduleName}</h1>
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-600">
          Ce module n'est pas une page publique autonome. Il fait partie de l'espace premium Mbàmbulaan, avec données simulées, rôle actif, preuves et actions contextualisées.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <SectionCard title="Avant achat" description="Voir la valeur selon votre rôle.">
            <Link href="/demo" className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Choisir une démo</Link>
          </SectionCard>
          <SectionCard title="Après souscription" description="Voir l'espace complet simulé.">
            <Link href="/espace-prive" className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Entrer dans l'espace premium</Link>
          </SectionCard>
        </div>
      </section>
    </main>
  );
}
