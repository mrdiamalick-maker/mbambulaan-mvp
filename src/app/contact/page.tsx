import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Handshake,
  Mail,
  MessageCircle,
  Newspaper,
  PhoneCall,
  Search,
  UsersRound
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";

const intents = [
  {
    title: "J’ai un besoin",
    text: "Transport, froid, équipement, formation, sourcing, financement ou autre besoin à qualifier.",
    icon: Search,
    href: "/solutions"
  },
  {
    title: "Je propose mes services",
    text: "Faites connaître vos capacités, vos territoires d’intervention et vos conditions à Mbàmbulaan.",
    icon: UsersRound,
    href: "/contact?intent=capacity"
  },
  {
    title: "Je représente une organisation",
    text: "Entreprise, ONG, programme ou institution : étudions une intervention, un partenariat ou un déploiement.",
    icon: Building2,
    href: "/contact?intent=organization"
  },
  {
    title: "Je souhaite devenir partenaire",
    text: "Proposer une collaboration structurée avec Mbàmbulaan, sur un territoire, un programme ou une capability.",
    icon: Handshake,
    href: "/contact?intent=partnership"
  },
  {
    title: "Presse, recherche ou information",
    text: "Demande d’information, échange éditorial, recherche, données publiques ou prise de contact institutionnelle.",
    icon: Newspaper,
    href: "/contact?intent=information"
  },
  {
    title: "Autre demande",
    text: "Vous ne savez pas quelle entrée choisir ? Décrivez simplement votre besoin à Mbàmbulaan.",
    icon: MessageCircle,
    href: "/contact?intent=other"
  }
] as const;

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Contact"
        title={<>Comment pouvons-nous <span className="text-[#74e1d6]">vous aider ?</span></>}
        description="Choisissez l’intention qui correspond le mieux à votre situation. Mbàmbulaan oriente ensuite la demande vers le bon parcours, sans vous imposer un formulaire générique."
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {intents.map(({ title, text, icon: Icon, href }) => (
            <Link key={title} href={href} className="surface group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={20} /></span>
              <h2 className="mt-5 text-xl font-bold tracking-[-.025em] text-[#102e37]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#667b81]">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Continuer <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <section className="mt-12 overflow-hidden rounded-[28px] bg-[#031a22] text-white shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-6 md:p-10">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#74e1d6]">Parler à Mbàmbulaan</p>
              <h2 className="mt-4 text-3xl font-[740] tracking-[-.04em] md:text-4xl">Le bon canal dépend du contexte.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64">WhatsApp, téléphone et email sont des canaux d’entrée vers Mbàmbulaan. Ils ne remplacent pas la qualification : ils facilitent la relation lorsque le web n’est pas le canal le plus naturel.</p>
            </div>
            <div className="grid border-t border-white/10 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:grid-cols-1">
              <a href="#" className="flex items-center gap-3 border-b border-white/10 p-5 text-sm font-bold text-white/82 transition hover:bg-white/[.04]"><MessageCircle size={18} className="text-[#74e1d6]" /> WhatsApp</a>
              <a href="#" className="flex items-center gap-3 border-b border-white/10 p-5 text-sm font-bold text-white/82 transition hover:bg-white/[.04]"><PhoneCall size={18} className="text-[#74e1d6]" /> Être rappelé</a>
              <a href="mailto:contact@mbambulaan.sn" className="flex items-center gap-3 p-5 text-sm font-bold text-white/82 transition hover:bg-white/[.04]"><Mail size={18} className="text-[#74e1d6]" /> Email</a>
            </div>
          </div>
        </section>
      </section>

      <PublicFooter />
    </main>
  );
}
