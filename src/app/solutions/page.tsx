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
import { PublicSectionHero } from "@/components/public/PublicSectionHero";

const intents = [
  { title: "Transporter / livrer", description: "Organiser un transport, une collecte ou une livraison adaptée à votre contexte.", icon: Truck },
  { title: "Conserver / refroidir", description: "Glace, froid, stockage ou besoin de conservation à qualifier.", icon: Snowflake },
  { title: "Transformer / valoriser", description: "Trouver une capacité de transformation, préparer un lot ou créer davantage de valeur localement.", icon: Building2 },
  { title: "Acheter / s’équiper", description: "Équipements, consommables ou solution technique pour votre activité.", icon: PackageSearch },
  { title: "Entretenir / réparer", description: "Maintenance, diagnostic ou intervention sur un équipement ou une infrastructure.", icon: Wrench },
  { title: "Former / développer des compétences", description: "Préparer une formation, un atelier ou un accompagnement métier.", icon: GraduationCap },
  { title: "Déployer un projet ou programme", description: "Identifier un territoire, des acteurs, des besoins et une organisation de terrain.", icon: Building2 },
  { title: "Identifier des acteurs ou capacités", description: "Sourcing, partenaires locaux, capacités techniques ou expertise sectorielle.", icon: Handshake }
] as const;

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f6] text-[#10373a]">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Trouver une solution"
        title={<>Décrivez le besoin. <span className="text-[#74e1d6]">Mbàmbulaan organise la suite.</span></>}
        description="Pas de catalogue public de prestataires ni de prix automatiques. Nous qualifions votre besoin, son territoire et son contexte avant d’organiser la réponse adaptée."
        actions={<><Link href="/contact?intent=solution" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Décrire mon besoin <ArrowRight size={16}/></Link><Link href="/contact?intent=callback" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white">Être rappelé <PhoneCall size={16}/></Link></>}
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="max-w-3xl">
          <p className="label">Que souhaitez-vous faire ?</p>
          <h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] text-[#102e37] md:text-4xl">Commencez par le résultat recherché.</h2>
          <p className="mt-4 text-sm leading-6 text-[#667b81]">Vous n’avez pas besoin de connaître le prestataire ou la solution technique. Mbàmbulaan part de votre intention et du contexte réel.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {intents.map(({ title, description, icon: Icon }) => (
            <Link key={title} href={`/contact?intent=solution&category=${encodeURIComponent(title)}`} className="surface group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={20}/></span>
              <h3 className="mt-5 text-xl font-bold tracking-[-.025em] text-[#102e37]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#667b81]">{description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Décrire ce besoin <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
            </Link>
          ))}
          <Link href="/contact?intent=solution&category=autre" className="surface-quiet group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
            <span className="grid size-11 place-items-center rounded-xl bg-white text-[#075568]"><Compass size={20}/></span>
            <h3 className="mt-5 text-xl font-bold tracking-[-.025em] text-[#102e37]">Autre besoin</h3>
            <p className="mt-3 text-sm leading-6 text-[#667b81]">Décrivez simplement ce que vous cherchez à accomplir. Mbàmbulaan vous aide à structurer la suite.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Décrire mon besoin <ArrowRight size={14}/></span>
          </Link>
        </div>
      </section>

      <section className="border-y border-[#d9e3e3] bg-white px-5 py-14 md:px-10 md:py-18">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div>
            <p className="label">Un même moteur, plusieurs canaux</p>
            <h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] text-[#102e37] md:text-4xl">Web, WhatsApp, téléphone ou terrain : le besoin reste le même objet Mbàmbulaan.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#667b81]">Le site n’impose pas un parcours numérique unique. L’équipe peut reprendre le contexte, qualifier la demande et poursuivre l’échange sur le canal le plus adapté.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact?intent=solution" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#10373a] px-5 py-3 font-bold text-white">Créer une demande <ArrowRight size={17}/></Link>
              <Link href="/contact?intent=callback" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#bfd0d2] bg-white px-5 py-3 font-bold text-[#075568]">Être rappelé <PhoneCall size={16}/></Link>
            </div>
          </div>
          <aside className="surface p-6 md:p-8">
            <p className="public-kicker">Ce que Mbàmbulaan protège</p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-[#5f7378]">
              <p>La demande est qualifiée avant toute mise en relation.</p>
              <p>Les coordonnées de tiers ne sont pas exposées comme un annuaire.</p>
              <p>La valeur vient de la compréhension, du réseau, de la coordination et du suivi.</p>
              <p>Aucune promesse de prix, de financement ou d’autorisation n’est faite automatiquement.</p>
            </div>
          </aside>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
