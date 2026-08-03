import Link from "next/link";
import { ArrowRight, MessageCircleMore, PhoneCall, Route, Workflow } from "lucide-react";
import { ConnectedJourneyCard } from "@/components/omnichannel/ConnectedJourneyCard";
import { OmnichannelSimulationNotice } from "@/components/omnichannel/OmnichannelSimulationNotice";

const journeys = [
  {
    title: "Capitaine",
    description: "Préparer une sortie, annoncer un retour, suivre le quai et confirmer une pesée.",
    href: "/terrain/whatsapp?acteur=capitaine&parcours=retour"
  },
  {
    title: "Agent de quai",
    description: "Recevoir une arrivée, préparer les besoins, confirmer le débarquement et enregistrer la pesée.",
    href: "/terrain/whatsapp?acteur=operateur&parcours=arrivee"
  },
  {
    title: "Mareyeur",
    description: "Exprimer un besoin, recevoir une proposition ciblée et escalader vers l’espace pro pour comparer ou organiser l’enlèvement.",
    href: "/terrain/whatsapp?acteur=mareyeur&parcours=achat"
  },
  {
    title: "Prestataire",
    description: "Déclarer une capacité disponible et répondre rapidement à une demande qualifiée.",
    href: "/terrain/whatsapp?acteur=prestataire&parcours=capacite"
  }
];

export default function TerrainPage() {
  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[var(--radius-lg)] bg-[var(--ocean-1000)] px-6 py-8 text-white shadow-[var(--shadow-map)] lg:px-10 lg:py-12">
          <p className="label-inverse">Démonstrateur omnicanal Mbàmbulaan</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Un seul canal messaging, plusieurs parcours métier.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/72">
            Les acteurs sont déjà reconnus par Mbàmbulaan. Le canal reste le même pour tous ; seules les étapes, les décisions et l’escalade changent selon le rôle et la situation.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/terrain/whatsapp" className="btn-accent">
              <MessageCircleMore size={18} /> Ouvrir le canal messaging
            </Link>
            <Link href="/terrain/telephone" className="btn-on-dark">
              <PhoneCall size={18} /> Voir l’escalade téléphonique
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <OmnichannelSimulationNotice />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <ConnectedJourneyCard />
          <div className="surface p-6">
            <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><Workflow size={18} /><p className="label">Règle d’escalade</p></div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">Le canal agit vite. L’espace professionnel prend le relais quand il faut décider.</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-[var(--muted)]">
              <p><strong className="text-[var(--ink)]">Messaging :</strong> répondre, confirmer, signaler, accepter ou demander un rappel.</p>
              <p><strong className="text-[var(--ink)]">Espace professionnel existant :</strong> comparer plusieurs sujets, arbitrer, corriger, suivre et historiser.</p>
              <p><strong className="text-[var(--ink)]">Téléphone :</strong> gérer une urgence, une ambiguïté ou une situation humaine sensible.</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 text-[var(--lagoon-600)]"><Route size={18} /><p className="label">Parcours simulés dans le même canal</p></div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {journeys.map((journey) => (
              <Link key={journey.title} href={journey.href} className="surface group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--ink)]">{journey.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{journey.description}</p>
                  </div>
                  <ArrowRight className="mt-1 shrink-0 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--ocean-800)]" size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--sand-100)] p-5">
          <p className="text-sm font-semibold text-[var(--ink)]">Principe produit</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Nous ne construisons pas un mini-WhatsApp par acteur. Nous construisons un canal léger branché sur le moteur Mbàmbulaan, avec une logique métier différente selon le rôle et une redirection vers l’espace professionnel existant dès que la situation devient plus complexe.
          </p>
        </div>
      </section>
    </main>
  );
}
