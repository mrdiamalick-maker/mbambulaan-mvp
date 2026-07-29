import { PublicHeader } from "@/components/public/PublicHeader";
import { ContactForm } from "@/components/public/ContactForm";

export default function ContactPage() {
  return <main className="min-h-screen bg-[#f4f7f6]"><PublicHeader /><section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:px-10 md:py-20 lg:grid-cols-[.8fr_1.2fr]"><div><p className="label">Partenariat et déploiement</p><h1 className="mt-3 text-4xl font-bold text-[#062d36] md:text-5xl">Quel résultat votre territoire ou organisation doit-il obtenir ?</h1><p className="mt-5 text-base leading-7 text-[#60737a]">Nous cadrons d’abord le problème, les acteurs, les données disponibles, le payeur, les responsabilités et les résultats observables. L’offre vient ensuite.</p><div className="mt-8 space-y-4 text-sm"><p><strong>Pilote territorial :</strong> infrastructures, coordination et rapport de valeur.</p><p><strong>Organisation :</strong> membres, actifs, opérations et services collectifs.</p><p><strong>Institution :</strong> Atlas, pilotage multi-territoires et redevabilité.</p></div></div><ContactForm /></section></main>;
}
