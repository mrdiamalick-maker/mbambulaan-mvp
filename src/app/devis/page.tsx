import { LeadForm, PageIntro, PublicNav } from "@/components/premium/PremiumComponents";

export default function DevisPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNav />
      <PageIntro
        eyebrow="Offre pilote"
        title="Cadrer un devis ou une convention pilote."
        description="Le devis n'est pas une fin de parcours. Il aide à définir les modules, territoires, preuves, acteurs et rapports à activer."
      />
      <LeadForm kind="devis" />
    </main>
  );
}
