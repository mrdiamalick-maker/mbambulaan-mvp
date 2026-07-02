import { LeadForm, PageIntro, PublicNav } from "@/components/premium/PremiumComponents";

export default function DemandeDemoPage() {
  return (
    <main className="min-h-screen bg-[#f6fbfb]">
      <PublicNav />
      <PageIntro
        eyebrow="Demande d'essai"
        title="Qualifier votre essai Mbàmbulaan."
        description="Indiquez votre organisation, le territoire concerné, le problème prioritaire et les acteurs à coordonner. L'objectif est de préparer un essai utile, pas une démonstration générique."
      />
      <LeadForm kind="demo" />
    </main>
  );
}
