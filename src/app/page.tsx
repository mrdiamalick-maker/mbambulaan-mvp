import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Compass,
  Handshake,
  MapPinned,
  Network,
  Route,
  Waves
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { publicAnnouncements, publicNews } from "@/data/public-content";

const territories = ["Saint-Louis", "Kayar", "Hann", "Mbour", "Joal", "Kafountine"];

const pillars = [
  {
    title: "Terrain",
    text: "Observer les réalités, qualifier les besoins et documenter les territoires au contact des acteurs.",
    icon: Route
  },
  {
    title: "Réseau",
    text: "Mobiliser des capacités, organisations, entreprises, experts et partenaires quand une action doit être organisée.",
    icon: Network
  },
  {
    title: "Technologie",
    text: "Structurer l’information, relier les contextes et rendre la coordination plus simple et plus fiable.",
    icon: Compass
  }
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f7f6]">
      <section className="relative min-h-[800px] bg-[#031a22] text-white">
        <Image
          src="/mbambulaan-hero-premium.jpg"
          alt="Activité maritime et halieutique sur le littoral sénégalais."
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,26,34,.98)_0%,rgba(3,26,34,.88)_35%,rgba(3,26,34,.42)_70%,rgba(3,26,34,.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,26,34,.12),rgba(3,26,34,.08)_55%,rgba(3,26,34,.88)_100%)]" />
        <div className="relative">
          <PublicHeader dark />
          <div className="mx-auto flex min-h-[690px] max-w-[1500px] items-center px-5 py-20 md:px-10">
            <div className="max-w-[820px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-bold text-[#bcece5] backdrop-blur">
                <Waves size={14} /> Économie maritime · premier ancrage : filière halieutique sénégalaise
              </div>
              <h1 className="mt-7 max-w-[800px] text-[clamp(3.1rem,6.7vw,7rem)] font-[760] leading-[.94] tracking-[-.06em]">
                Connecter les acteurs. <span className="text-[#74e1d6]">Coordonner les territoires.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/76 md:text-xl">
                Mbàmbulaan construit une infrastructure de connaissance et de coordination pour l’économie maritime, en combinant terrain, réseau, services et technologie.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/solutions" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#5fe0d3] px-5 py-3 font-bold text-[#031a22] shadow-[0_14px_34px_rgba(31,182,164,.24)] transition hover:-translate-y-0.5 hover:bg-[#76e8dd]">
                  Trouver une solution <ArrowRight size={18} />
                </Link>
                <Link href="/atlas" className="btn-light min-h-12 px-5">
                  Ouvrir l’Atlas <MapPinned size={17} />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-white/62">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#74e1d6]" /> Terrain et réseau</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#74e1d6]" /> Information sourcée</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#74e1d6]" /> Coordination humaine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e3e3] bg-white px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <p className="label">Trouver une solution</p>
              <h2 className="section-title mt-4">Vous avez un besoin dans l’économie maritime ?</h2>
            </div>
            <div>
              <p className="max-w-3xl text-base leading-7 text-[#667b81]">Transport, froid, équipement, maintenance, formation, débouchés, financement ou déploiement de programme : décrivez votre besoin. Mbàmbulaan le qualifie et organise la suite sans afficher de prix ni d’annuaire de prestataires.</p>
              <Link href="/solutions" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Décrire mon besoin <ArrowRight size={16}/></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e3e3] bg-[#f3f7f6] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-3xl">
            <p className="label">Mbàmbulaan</p>
            <h2 className="section-title mt-4">Le numérique ne suffit pas.</h2>
            <p className="mt-5 text-base leading-7 text-[#667b81]">La valeur vient de la combinaison entre présence terrain, réseau mobilisable et technologie. Mbàmbulaan observe, qualifie, connecte, coordonne et suit l’action.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pillars.map(({ title, text, icon: Icon }) => (
              <article key={title} className="surface p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={20}/></span>
                <h3 className="mt-5 text-2xl font-bold tracking-[-.03em] text-[#102e37]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667b81]">{text}</p>
              </article>
            ))}
          </div>
          <Link href="/mbambulaan" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Comprendre l’approche Mbàmbulaan <ArrowRight size={16}/></Link>
        </div>
      </section>

      <section className="border-b border-[#d9e3e3] bg-white px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="label">Découvrir</p>
              <h2 className="section-title mt-4">Comprendre l’économie maritime par les usages et les chaînes de valeur.</h2>
              <p className="mt-5 text-sm leading-6 text-[#667b81]">Pêche, débarquement, froid, transformation, logistique, équipements, formation, financement et durabilité : les contenus sont reliés aux territoires et aux besoins réels.</p>
            </div>
            <Link href="/decouvrir" className="inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Explorer les contenus <ArrowRight size={16}/></Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicNews.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/decouvrir/${item.id}`} className="surface group flex min-h-60 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[#118f83]"><BookOpenText size={14}/>{item.category}</div>
                <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[#102e37]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667b81]">{item.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-xs font-semibold text-[#718489]">{item.territory} · {item.readingTime}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#075568] opacity-0 transition group-hover:opacity-100">Lire <ArrowRight size={14}/></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e3e3] bg-[#031a22] px-5 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="label-inverse">Atlas Mbàmbulaan</p>
            <h2 className="mt-4 text-4xl font-[760] leading-[1.02] tracking-[-.05em] md:text-5xl">Explorer l’économie maritime par les territoires.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/66">L’Atlas relie quais, territoires, activités, informations publiques documentées, contenus et opportunités sans exposer les données opérationnelles privées.</p>
            <Link href="/atlas" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Ouvrir l’Atlas <MapPinned size={16}/></Link>
          </div>
          <div className="surface-dark p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#74e1d6]">Territoires représentés</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {territories.map((territory) => <div key={territory} className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-white/84">{territory}</div>)}
            </div>
            <p className="mt-5 text-xs leading-5 text-white/45">Couverture illustrative de démonstration. Le niveau de profondeur varie selon les informations disponibles et vérifiées.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e3e3] bg-white px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="label">Opportunités</p>
              <h2 className="section-title mt-4">Des programmes, formations, rencontres et financements reliés au terrain.</h2>
            </div>
            <Link href="/opportunites" className="inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Voir les opportunités <ArrowRight size={16}/></Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {publicAnnouncements.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/opportunites/${item.id}`} className="surface group flex min-h-64 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
                <div className="text-[10px] font-black uppercase tracking-[.11em] text-[#118f83]">{item.type}</div>
                <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[#102e37]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667b81]">{item.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-xs font-semibold text-[#718489]">{item.territory}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#075568] opacity-0 transition group-hover:opacity-100">Voir <ArrowRight size={14}/></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f7f6] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-3">
          <div className="surface p-6">
            <Handshake className="text-[#075568]" />
            <p className="label mt-5">Vous avez un besoin</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[#102e37]">Trouver une solution</h2>
            <p className="mt-3 text-sm leading-6 text-[#667b81]">Décrivez votre besoin et laissez Mbàmbulaan qualifier la réponse.</p>
            <Link href="/solutions" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Commencer <ArrowRight size={15}/></Link>
          </div>
          <div className="surface p-6">
            <Network className="text-[#075568]" />
            <p className="label mt-5">Vous pouvez contribuer</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[#102e37]">Proposer une capacité</h2>
            <p className="mt-3 text-sm leading-6 text-[#667b81]">Entreprise, expert, ONG ou organisation : présentez ce que vous pouvez apporter au réseau Mbàmbulaan.</p>
            <Link href="/contact?intent=contribution" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Proposer mes services <ArrowRight size={15}/></Link>
          </div>
          <div className="surface p-6">
            <MapPinned className="text-[#075568]" />
            <p className="label mt-5">Vous portez un programme</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[#102e37]">Étudier une intervention</h2>
            <p className="mt-3 text-sm leading-6 text-[#667b81]">Territoire, bénéficiaires, partenaires, déploiement terrain, données et suivi : Mbàmbulaan peut organiser le cadrage.</p>
            <Link href="/contact?intent=programme" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Parler à Mbàmbulaan <ArrowRight size={15}/></Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
