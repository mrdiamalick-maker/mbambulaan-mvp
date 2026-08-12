import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { OpportunitiesExplorer } from "@/components/public/OpportunitiesExplorer";
import { publicAnnouncements, type PublicOpportunityType } from "@/data/public-content";

export const metadata: Metadata = {
  title: "Opportunités | Mbàmbulaan",
  description: "Formations, programmes, financements, rencontres et appels utiles à l’économie maritime, sélectionnés et contextualisés par Mbàmbulaan.",
  alternates: { canonical: "/opportunites" }
};

const types: PublicOpportunityType[] = ["Formation", "Programme", "Financement", "Rencontre", "Appel"];

export default function OpportunitiesPage() {
  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Opportunités"
        title={<>Programmes, formations, financements et rencontres <span className="text-[var(--pub-turquoise-300)]">qui peuvent devenir des actions.</span></>}
        description="Mbàmbulaan sélectionne, contextualise et relaie les opportunités utiles à l’économie maritime. Lorsqu’une coordination est nécessaire, Mbàmbulaan reste dans la boucle."
        actions={<><Link href="/solutions" className="pub-btn pub-btn-primary">Être accompagné <ArrowRight size={16}/></Link><Link href="/contact?intent=organisation" className="pub-btn pub-btn-on-dark">Proposer une opportunité</Link></>}
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <OpportunitiesExplorer types={types} announcements={publicAnnouncements} />
      </section>
      <PublicFooter />
    </main>
  );
}
