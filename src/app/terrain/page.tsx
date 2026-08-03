import Link from "next/link";
import { ArrowRight, MessageCircleMore, PhoneCall, ShipWheel, ShoppingBasket, Snowflake, TriangleAlert } from "lucide-react";

const actions = [
  {
    title: "Je rentre au quai",
    description: "Prévenir de votre arrivée et dire ce dont vous avez besoin.",
    href: "/terrain/whatsapp?parcours=retour",
    icon: ShipWheel
  },
  {
    title: "Je cherche du poisson",
    description: "Dire l'espèce, la quantité et le lieu souhaité.",
    href: "/terrain/whatsapp?parcours=achat",
    icon: ShoppingBasket
  },
  {
    title: "J'ai de la glace ou du froid disponible",
    description: "Informer les acteurs qu'une capacité peut être utilisée.",
    href: "/terrain/whatsapp?parcours=capacite",
    icon: Snowflake
  },
  {
    title: "Quelque chose ne va pas",
    description: "Dire simplement ce qui se passe sur le terrain.",
    href: "/terrain/whatsapp?parcours=probleme",
    icon: TriangleAlert
  }
];

export default function TerrainPage() {
  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[var(--radius-lg)] bg-[var(--ocean-1000)] px-6 py-8 text-white shadow-[var(--shadow-map)] lg:px-10 lg:py-12">
          <p className="label-inverse">Accès terrain Mbàmbulaan</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Faites votre demande sans créer de compte.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
            Choisissez ce que vous voulez faire. Mbàmbulaan vous guide avec des mots simples, comme dans une conversation WhatsApp ou par téléphone.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/terrain/whatsapp" className="btn-accent">
              <MessageCircleMore size={18} /> Ouvrir la simulation WhatsApp
            </Link>
            <Link href="/terrain/telephone" className="btn-on-dark">
              <PhoneCall size={18} /> Demander un appel
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
          <p className="text-sm font-semibold text-[var(--ink)]">Vous préférez parler ?</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Demandez un appel. Une personne reprend avec vous ce que vous voulez faire et l'enregistre dans Mbàmbulaan.
          </p>
          <Link href="/terrain/telephone" className="link-action mt-4 inline-flex items-center gap-2">
            Demander à être rappelé <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
