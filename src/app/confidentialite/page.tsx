import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Confidentialité | Mbàmbulaan",
  description: "Comment Mbàmbulaan traite les informations transmises via le site public.",
  alternates: { canonical: "/confidentialite" }
};

const sections = [
  {
    title: "Quelles informations sont collectées",
    text: "Lorsque vous décrivez un besoin, proposez une capacité ou nous contactez, nous collectons les informations que vous transmettez volontairement : nom, organisation, territoire, téléphone, e-mail, canal préféré et description de votre demande."
  },
  {
    title: "Pourquoi ces informations",
    text: "Ces informations servent exclusivement à qualifier votre demande et à organiser la suite avec vous : reprise de contact, mise en relation qualifiée, suivi. Elles ne sont jamais publiées ni utilisées pour constituer un annuaire public."
  },
  {
    title: "Qui y a accès",
    text: "Vos coordonnées sont accessibles uniquement à l’équipe Mbàmbulaan en charge de la qualification et du suivi de votre demande. Elles ne sont ni vendues, ni partagées avec des tiers à des fins commerciales."
  },
  {
    title: "Consentement",
    text: "Chaque formulaire du site demande votre accord explicite avant l’envoi. Vous pouvez à tout moment demander la suppression de vos informations en écrivant à contact@mbambulaan.sn."
  },
  {
    title: "Durée de conservation",
    text: "Les informations sont conservées le temps nécessaire au traitement de votre demande puis archivées ou supprimées selon la nature de la relation avec Mbàmbulaan."
  },
  {
    title: "Mesure d’audience",
    text: "Le site mesure des événements de navigation agrégés (pages consultées, parcours engagés) pour améliorer l’expérience et comprendre les besoins de la filière. Cette mesure n’est pas nominative et ne constitue pas un profilage individuel."
  }
];

export default function PrivacyPage() {
  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <section className="pub-hero px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="pub-eyebrow pub-eyebrow--dark">Confidentialité</p>
          <h1 className="pub-display mt-5 text-[2.4rem] not-italic leading-[1.05] md:text-[3.2rem]">Comment Mbàmbulaan protège vos informations.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14 md:px-10 md:py-20">
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="pub-display text-xl not-italic text-[var(--pub-deep-900)]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--pub-stone-700)]">{section.text}</p>
            </div>
          ))}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
