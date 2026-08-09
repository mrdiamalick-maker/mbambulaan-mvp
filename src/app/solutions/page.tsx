import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Compass,
  GraduationCap,
  Handshake,
  PackageSearch,
  PhoneCall,
  Snowflake,
  Truck,
  Wrench
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const intents = [
  { title: "Transporter / livrer", description: "Organiser un transport, une collecte ou une livraison adaptée à votre contexte.", icon: Truck },
  { title: "Conserver / refroidir", description: "Glace, froid, stockage ou besoin de conservation à qualifier.", icon: Snowflake },
  { title: "Acheter / s’équiper", description: "Équipements, consommables ou solution technique pour votre activité.", icon: PackageSearch },
  { title: "Entretenir / réparer", description: "Maintenance, diagnostic ou intervention sur un équipement ou une infrastructure.", icon: Wrench },
  { title: "Former / développer des compétences", description: "Préparer une formation, un atelier ou un accompagnement métier.", icon: GraduationCap },
  { title: "Déployer un projet ou programme", description: "Identifier un territoire, des acteurs, des besoins et une organisation de terrain.", icon: Building2 },
  { title: "Identifier des acteurs ou capacités", description: "Sourcing, partenaires locaux, capacités techniques ou expertise sectorielle.", icon: Handshake }
] as const;

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-[#f6f1e7] text-[#10373a]">
      <PublicHeader />
      <section className="border-b border-[#ded2bd] bg-[#fffaf0] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#0a6d68]"><Compass size={16} /> Trouver une solution</div>
            <h1 className="mt-5 font-serif text-5xl leading-[.98] tracking-[-.045em] md:text-7xl">Décrivez le besoin.<br /><em>Mbàmbulaan organise la suite.</em></h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#60716f]">Pas de catalogue de prestataires ni de prix automatiques. Nous qualifions votre besoin, son territoire et son contexte avant d’identifier la réponse la plus pertinente.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {intents.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-[22px] border border-[#ded5c5] bg-white p-5 shadow-[0_18px_45px_rgba(16,55,58,.06)]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={20} /></span>
              <h2 className="mt-5 text-xl font-black tracking-[-.025em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#667b81]">{description}</p>
            </article>
          ))}
          <article className="rounded-[22px] border border-dashed border-[#aebfbd] bg-[#eef6f4] p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-white text-[#075568]"><Compass size={20} /></span>
            <h2 className="mt-5 text-xl font-black tracking-[-.025em]">Autre besoin</h2>
            <p className="mt-3 text-sm leading-6 text-[#667b81]">Vous n’avez pas besoin de connaître la catégorie exacte. Décrivez simplement ce que vous cherchez à accomplir.</p>
          </article>
        </div>

        <section className="mt-12 overflow-hidden rounded-[28px] bg-[#031a22] text-white shadow-2xl">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-6 md:p-10">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#74e1d6]">Demande Mbàmbulaan</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-.04em] md:text-4xl">Commencez par nous décrire le contexte.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64">Pour cette première version, la prise en charge se fait directement par Mbàmbulaan. Le futur moteur guidera la demande par intention, territoire, temporalité et canal préféré sans exposer les prestataires.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/contact?intent=solution" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#5fe0d3] px-5 py-3 font-black text-[#031a22]">Décrire mon besoin <ArrowRight size={17} /></Link>
                <Link href="/contact?intent=callback" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/18 px-5 py-3 font-bold text-white">Être rappelé <PhoneCall size={16} /></Link>
              </div>
            </div>
            <aside className="border-t border-white/10 bg-white/[.035] p-6 md:p-10 lg:border-l lg:border-t-0">
              <p className="text-xs font-black uppercase tracking-[.14em] text-white/38">Ce que Mbàmbulaan protège</p>
              <div className="mt-5 space-y-4 text-sm leading-6 text-white/66">
                <p>La demande est qualifiée avant toute mise en relation.</p>
                <p>Les coordonnées de tiers ne sont pas exposées comme un annuaire.</p>
                <p>La valeur vient de la compréhension, du réseau, de la coordination et du suivi.</p>
              </div>
            </aside>
          </div>
        </section>
      </section>
      <PublicFooter />
    </main>
  );
}
