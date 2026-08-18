import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Mentions légales | Mbàmbulaan",
  description: "Mentions légales du site Mbàmbulaan.sn.",
  alternates: { canonical: "/mentions-legales" }
};

export default function LegalNoticePage() {
  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <section className="pub-hero px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="pub-eyebrow pub-eyebrow--dark">Informations légales</p>
          <h1 className="pub-display mt-5 text-[2.4rem] not-italic leading-[1.05] md:text-[3.2rem]">Mentions légales</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14 md:px-10 md:py-20">
        <div className="space-y-8 text-sm leading-7 text-[var(--pub-stone-700)]">
          <div>
            <h2 className="pub-display text-xl not-italic text-[var(--pub-deep-900)]">Éditeur du site</h2>
            <p className="mt-3">Mbàmbulaan est une entreprise sénégalaise. Les informations d’immatriculation complètes (raison sociale, forme juridique, siège social, numéro d’immatriculation) seront précisées ici lors de l’ouverture publique du site.</p>
          </div>
          <div>
            <h2 className="pub-display text-xl not-italic text-[var(--pub-deep-900)]">Contact</h2>
            <p className="mt-3">contact@mbambulaan.sn</p>
          </div>
          <div>
            <h2 className="pub-display text-xl not-italic text-[var(--pub-deep-900)]">Hébergement</h2>
            <p className="mt-3">Les informations relatives à l’hébergeur du site seront précisées ici lors de l’ouverture publique.</p>
          </div>
          <div>
            <h2 className="pub-display text-xl not-italic text-[var(--pub-deep-900)]">Propriété intellectuelle</h2>
            <p className="mt-3">Les contenus publiés sur ce site (textes, données territoriales, identité visuelle) sont la propriété de Mbàmbulaan sauf mention contraire. Toute reproduction sans autorisation est interdite.</p>
          </div>
          <div>
            <h2 className="pub-display text-xl not-italic text-[var(--pub-deep-900)]">Données de démonstration</h2>
            <p className="mt-3">Certains contenus, opportunités ou repères territoriaux affichés sur ce site sont explicitement identifiés comme des exemples ou des démonstrations éditoriales. Ils ne constituent pas des données officielles ou des engagements contractuels.</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
