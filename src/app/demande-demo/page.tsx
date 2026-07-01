import { LeadForm, PageIntro, PublicNav } from "@/components/premium/PremiumComponents";

export default function DemandeDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNav />
      <PageIntro
        eyebrow="Cadrage commercial"
        title="Demander une démo qualifiée."
        description="La demande sert à comprendre votre rôle, votre territoire et la valeur à montrer. Elle prépare ensuite l'accès à l'espace premium simulé."
      />
      <LeadForm kind="demo" />
    </main>
  );
}
