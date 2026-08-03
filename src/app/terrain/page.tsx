import Link from "next/link";
import { ArrowRight, MessageCircleMore, PhoneCall, ShipWheel, ShoppingBasket, Snowflake, TriangleAlert } from "lucide-react";

const actions = [
  {
    title: "Préparer un retour au quai",
    description: "Visualiser le parcours WhatsApp prévu pour un capitaine déjà connu de Mbàmbulaan.",
    href: "/terrain/whatsapp?parcours=retour",
    icon: ShipWheel
  },
  {
    title: "Exprimer un besoin d'achat",
    description: "Visualiser le parcours WhatsApp d'un mareyeur ou acheteur référencé.",
    href: "/terrain/whatsapp?parcours=achat",
    icon: ShoppingBasket
  },
  {
    title: "Déclarer une capacité disponible",
    description: "Visualiser le parcours WhatsApp d'un prestataire glace, froid ou transport.",
    href: "/terrain/whatsapp?parcours=capacite",
    icon: Snowflake
  },
  {
    title: "Prévenir d'un problème",
    description: "Visualiser comment un client peut alerter Mbàmbulaan depuis WhatsApp.",
    href: "/terrain/whatsapp?parcours=probleme",
    icon: TriangleAlert
  }
];

export default function TerrainPage() {
  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[var(--radius-lg)] bg-[var(--ocean-1000)] px-6 py-8 text-white shadow-[var(--shadow-map)] lg:px-10 lg:py-12">
          <p className="label-inverse">Démonstrateur omnicanal Mbàmbulaan</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Visualiser ce que nos clients feront demain depuis WhatsApp ou par téléphone.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/72">
            Cette page n'est pas une entrée publique sans compte. Elle simule les parcours réservés à des acteurs déjà référencés chez Mbàmbulaan, afin de concevoir l'expérience avant l'intégration réelle de WhatsApp Business et du canal téléphonique.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/terrain/whatsapp" className="btn-accent">
              <MessageCircleMore size={18} /> Voir l'expérience WhatsApp client
            </Link>
            <Link href="/terrain/telephone" className="btn-on-dark">
              <PhoneCall size={18} /> Voir le parcours téléphonique
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <Link key={action.title} href={action.href} className="surface group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--lagoon-100)] text-[var(--lagoon-600)]">
                  <action.icon size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-[var(--ink)]">{action.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{action.description}</p>
                </div>
                <ArrowRight className="mt-1 shrink-0 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--ocean-800)]" size={18} />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--sand-100)] p-5">
          <p className="text-sm font-semibold text-[var(--ink)]">Principe produit</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Le client est déjà connu de Mbàmbulaan. Son numéro, son rôle, son organisation et son périmètre sont reconnus. WhatsApp et le téléphone deviennent alors des portes d'action simples ; l'espace professionnel reste réservé au suivi, à l'historique et aux décisions plus complexes.
          </p>
        </div>
      </section>
    </main>
  );
}
