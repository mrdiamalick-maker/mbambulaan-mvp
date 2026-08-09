import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Factory,
  Fish,
  Landmark,
  MessageSquareText,
  Scale,
  ShipWheel,
  Store
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const scenarios = [
  {
    id: "retour",
    title: "Retour, débarquement et coordination",
    promise: "Suivre une pirogue jusqu’au lot valorisé et au rapport.",
    steps: "Retour → arrivée → pesée → lots → opportunité → engagement → résultat",
    href: "/app/operations",
    role: "Capitaine puis opérateur, mareyeur et coordinateur",
    icon: ShipWheel
  },
  {
    id: "rarete",
    title: "Rareté du thiof à Kayar",
    promise: "Comprendre une tension sans transformer un calcul en certitude.",
    steps: "Volumes → prix → raisons → substitution → décision → durabilité",
    href: "/app/marches",
    role: "Mareyeur, coordinateur et institution",
    icon: Fish
  },
  {
    id: "surabondance",
    title: "Surabondance de sardinelle à Mbour",
    promise: "Préserver la valeur avant saturation de la chaîne froide.",
    steps: "Volume → risque de perte → transformation → engagement → valeur préservée",
    href: "/app/coordination",
    role: "Transformateur, mareyeur et coordinateur",
    icon: Scale
  },
  {
    id: "infrastructure",
    title: "Machine à glace indisponible à Joal",
    promise: "Coordonner une capacité alternative puis capitaliser l’apprentissage.",
    steps: "Signal → qualification → priorité → intervention → résultat → initiative",
    href: "/app/situations/sit-glace",
    role: "Opérateur, coordinateur, prestataire et institution",
    icon: Factory
  },
  {
    id: "community",
    title: "Community vers coordination",
    promise: "Transformer un échange professionnel en objet opérationnel suivi.",
    steps: "Publication → qualification → situation → action → retour d’expérience",
    href: "/app/community",
    role: "Tous acteurs professionnels",
    icon: MessageSquareText
  },
  {
    id: "institution",
    title: "Lecture institutionnelle",
    promise: "Relier Atlas, opérations, tensions, résultats et besoins d’investissement.",
    steps: "Territoire → Atlas → situation → résultats → rapport → décision",
    href: "/app/pilotage",
    role: "Institution et partenaire",
    icon: Landmark
  }
] as const;

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 py-14 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <p className="label-inverse">Démonstration guidée · données déterministes</p>
          <h1 className="title-balance mt-4 max-w-5xl text-4xl font-[760] leading-[1.02] tracking-[-.05em] md:text-6xl">Explorez le même écosystème par six ruptures de coordination.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/66">La démo n’est pas un second produit. Chaque scénario ouvre les vraies vues, les mêmes objets et les mêmes règles que l’application professionnelle.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/app/travail" className="inline-flex items-center gap-2 bg-[#36c6b1] px-6 py-3.5 font-bold text-[#062d36]">Commencer par le briefing <ArrowRight size={18} /></Link><Link href="/connexion" className="border border-white/45 px-6 py-3.5 font-bold">Tester la connexion</Link></div>
        </div>
      </section>
      <section className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map(({ id, title, promise, steps, href, role, icon: Icon }, index) => (
            <article key={id} className="surface flex flex-col p-5">
              <div className="flex items-center justify-between"><span className="grid size-10 place-items-center bg-[#eaf8fa] text-[#075466]"><Icon size={20} /></span><span className="text-sm font-black text-[#18a394]">0{index + 1}</span></div>
              <h2 className="mt-5 text-xl font-bold text-[#062d36]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#60737a]">{promise}</p>
              <div className="mt-5 bg-[#f8fbfb] p-3 text-xs leading-5 text-[#52666d]">{steps}</div>
              <p className="mt-4 text-xs font-semibold text-[#76530d]">Rôles : {role}</p>
              <Link href={href} className="mt-5 inline-flex items-center gap-2 font-bold text-[#075466]">Lancer ce scénario <ArrowRight size={16} /></Link>
            </article>
          ))}
        </div>
        <div className="mt-8 grid gap-5 border border-[#c8d7da] bg-white p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div><div className="flex items-center gap-2"><CircleDollarSign className="text-[#087287]" /><h2 className="font-bold">Comprendre la valeur et les droits</h2></div><p className="mt-2 text-sm text-[#60737a]">Passez d’un rôle à l’autre dans l’application, puis comparez les plans Public, Professionnel, Organisation, Territoire, Institution, Partenaire et Atlas Premium.</p></div>
          <Link href="/offres" className="inline-flex items-center gap-2 border border-[#075466] px-4 py-2.5 text-sm font-bold text-[#075466]"><Store size={16} /> Voir les offres</Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
