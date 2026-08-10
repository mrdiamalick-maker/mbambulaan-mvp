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

const territories = ["Saint-Louis", "Kayar", "Hann", "Mbour", "Joal-Fadiouth", "Kafountine"];

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
    <main className="pub-scope min-h-screen overflow-hidden">
      <section className="relative min-h-[760px] bg-[var(--pub-deep-900)] text-white md:min-h-[840px]">
        <Image
          src="/mbambulaan-hero-premium.jpg"
          alt="Activité maritime et halieutique sur le littoral sénégalais."
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,27,33,.97)_0%,rgba(5,27,33,.86)_38%,rgba(5,27,33,.4)_72%,rgba(5,27,33,.14)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,27,33,.1),rgba(5,27,33,.06)_55%,rgba(5,27,33,.9)_100%)]" />
        <div className="relative">
          <PublicHeader dark />
          <div className="mx-auto flex min-h-[660px] max-w-[1500px] items-center px-5 py-20 md:px-10">
            <div className="max-w-[840px]">
              <div className="pub-eyebrow pub-eyebrow--dark">
                <Waves size={13} /> Économie maritime · premier ancrage : filière halieutique sénégalaise
              </div>
              <h1 className="pub-display mt-7 max-w-[820px] text-[clamp(2.9rem,7.4vw,6.4rem)] not-italic leading-[.98]">
                Connecter les acteurs. <em className="not-italic text-[var(--pub-turquoise-300)]">Coordonner les territoires.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
                Mbàmbulaan construit une infrastructure de connaissance et de coordination pour l’économie maritime, en combinant terrain, réseau, services et technologie.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/solutions" className="pub-btn pub-btn-primary min-h-12 px-5 text-[.95rem]">
                  Trouver une solution <ArrowRight size={18} />
                </Link>
                <Link href="/atlas" className="pub-btn pub-btn-on-dark min-h-12 px-5 text-[.95rem]">
                  Ouvrir l’Atlas <MapPinned size={17} />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-white/56">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--pub-turquoise-300)]" /> Terrain et réseau</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--pub-turquoise-300)]" /> Information sourcée</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--pub-turquoise-300)]" /> Coordination humaine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[.6fr_1.4fr] lg:items-end">
            <div>
              <span className="pub-index">01</span>
              <p className="pub-eyebrow mt-3">Trouver une solution</p>
              <h2 className="pub-display mt-3 text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[2.9rem]">Vous avez un besoin dans l’économie maritime ?</h2>
            </div>
            <div>
              <p className="max-w-3xl text-base leading-7 text-[var(--pub-stone-700)]">Transport, froid, équipement, maintenance, formation, débouchés, financement ou déploiement de programme : décrivez votre besoin. Mbàmbulaan le qualifie et organise la suite — sans afficher de prix ni d’annuaire de prestataires.</p>
              <Link href="/solutions" className="pub-btn pub-btn-dark mt-6">Décrire mon besoin <ArrowRight size={16}/></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 md:px-10"><div className="pub-tideline" /></div>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-3xl">
            <span className="pub-index">02</span>
            <p className="pub-eyebrow mt-3">Mbàmbulaan</p>
            <h2 className="pub-display mt-3 text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[2.9rem]">Le numérique ne suffit pas.</h2>
            <p className="mt-5 text-base leading-7 text-[var(--pub-stone-700)]">La valeur vient de la combinaison entre présence terrain, réseau mobilisable et technologie. Mbàmbulaan observe, qualifie, connecte, coordonne et suit l’action.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pillars.map(({ title, text, icon: Icon }) => (
              <article key={title} className="pub-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Icon size={20}/></span>
                <h3 className="pub-display mt-5 text-2xl not-italic text-[var(--pub-deep-900)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{text}</p>
              </article>
            ))}
          </div>
          <Link href="/mbambulaan" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Comprendre l’approche Mbàmbulaan <ArrowRight size={16}/></Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 md:px-10"><div className="pub-tideline" /></div>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="pub-index">03</span>
              <p className="pub-eyebrow mt-3">Découvrir</p>
              <h2 className="pub-display mt-3 text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[2.9rem]">Comprendre l’économie maritime par les usages et les chaînes de valeur.</h2>
              <p className="mt-5 text-sm leading-6 text-[var(--pub-stone-700)]">Pêche, débarquement, froid, transformation, logistique, équipements, formation, financement et durabilité : les contenus sont reliés aux territoires et aux besoins réels.</p>
            </div>
            <Link href="/decouvrir" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Explorer les contenus <ArrowRight size={16}/></Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicNews.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/decouvrir/${item.id}`} className="pub-card group flex min-h-60 flex-col p-5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14}/>{item.category}</div>
                <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-xs font-semibold text-[var(--pub-stone-500)]">{item.territory} · {item.readingTime}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--pub-deep-800)] opacity-0 transition group-hover:opacity-100">Lire <ArrowRight size={14}/></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-hero px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <span className="pub-index text-[var(--pub-turquoise-300)]">04</span>
            <p className="pub-eyebrow pub-eyebrow--dark mt-3">Atlas Mbàmbulaan</p>
            <h2 className="pub-display mt-3 text-[2.4rem] not-italic leading-[1.05] md:text-[3rem]">Explorer l’économie maritime par les territoires.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62">L’Atlas relie quais, territoires, activités, informations publiques documentées, contenus et opportunités — sans exposer les données opérationnelles privées.</p>
            <Link href="/atlas" className="pub-btn pub-btn-primary mt-7">Ouvrir l’Atlas <MapPinned size={16}/></Link>
          </div>
          <div className="pub-card--dark p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-turquoise-300)]">Territoires représentés</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {territories.map((territory) => <Link key={territory} href={`/atlas`} className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-white/84 transition hover:border-white/25 hover:bg-white/[.08]">{territory}</Link>)}
            </div>
            <p className="mt-5 text-xs leading-5 text-white/40">Couverture en cours d’enrichissement. Le niveau de profondeur varie selon les informations disponibles et vérifiées.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="pub-index">05</span>
              <p className="pub-eyebrow mt-3">Opportunités</p>
              <h2 className="pub-display mt-3 text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[2.9rem]">Des programmes, formations, rencontres et financements reliés au terrain.</h2>
            </div>
            <Link href="/opportunites" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Voir les opportunités <ArrowRight size={16}/></Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {publicAnnouncements.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/opportunites/${item.id}`} className="pub-card group flex min-h-64 flex-col p-5">
                <div className="text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]">{item.type}</div>
                <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-xs font-semibold text-[var(--pub-stone-500)]">{item.territory}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--pub-deep-800)] opacity-0 transition group-hover:opacity-100">Voir <ArrowRight size={14}/></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-4 md:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-3">
          <div className="pub-card p-6">
            <Handshake className="text-[var(--pub-deep-800)]" />
            <p className="pub-eyebrow mt-5">Vous avez un besoin</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Trouver une solution</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Décrivez votre besoin et laissez Mbàmbulaan qualifier la réponse.</p>
            <Link href="/solutions" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Commencer <ArrowRight size={15}/></Link>
          </div>
          <div className="pub-card p-6">
            <Network className="text-[var(--pub-deep-800)]" />
            <p className="pub-eyebrow mt-5">Vous pouvez contribuer</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Proposer une capacité</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Entreprise, expert, ONG ou organisation : présentez ce que vous pouvez apporter au réseau Mbàmbulaan.</p>
            <Link href="/contact?intent=contribution" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Proposer mes services <ArrowRight size={15}/></Link>
          </div>
          <div className="pub-card p-6">
            <MapPinned className="text-[var(--pub-deep-800)]" />
            <p className="pub-eyebrow mt-5">Vous portez un programme</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Étudier une intervention</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Territoire, bénéficiaires, partenaires, déploiement terrain, données et suivi : Mbàmbulaan peut organiser le cadrage.</p>
            <Link href="/contact?intent=programme" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Parler à Mbàmbulaan <ArrowRight size={15}/></Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
