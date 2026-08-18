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
import { SectionWave } from "@/components/public/SectionWave";
import { ValueChainDiagram } from "@/components/public/ValueChainDiagram";
import { publicAnnouncements, publicNews } from "@/data/public-content";
import { filiereStats, statsNote } from "@/data/public-stats";
import { publicTerritories } from "@/data/public-atlas";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DottedMap } from "@/components/magicui/dotted-map";
import { Marquee } from "@/components/magicui/marquee";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { TerrainMotif, ReseauMotif, TechnologieMotif } from "@/components/public/PillarMotifs";

const territories = publicTerritories.slice(0, 8).map((item) => item.name);

const territoryMarkers = [
  { lat: 14.77, lng: -17.43, size: 1.3, pulse: true },
  { lat: 14.16, lng: -16.83, size: 1.15, pulse: true },
  { lat: 14.48, lng: -17.07, size: 1.05 },
  { lat: 13.94, lng: -16.72, size: 1.05 },
  { lat: 12.58, lng: -16.27, size: 1.05 },
  { lat: 12.88, lng: -14.95, size: 1.0 }
];

// PUB-A1 (audit Premium XXL Public, CEO 2026-08-16) : chaque pilier porte
// désormais sa propre matière graphique (Motif) plutôt que le même radial
// terracotta à 9% partagé par les trois cartes.
const pillars = [
  {
    title: "Terrain",
    text: "Observer les réalités, qualifier les situations et documenter les territoires au contact des acteurs.",
    icon: Route,
    href: "/mbambulaan",
    cta: "Comprendre l’approche",
    className: "md:col-span-2 lg:col-span-1",
    Motif: TerrainMotif
  },
  {
    title: "Réseau",
    text: "Mobiliser les bonnes capacités — organisations, entreprises, experts et partenaires — quand une action doit être organisée.",
    icon: Network,
    href: "/contact?intent=contribution",
    cta: "Contribuer au réseau",
    className: "md:col-span-1",
    Motif: ReseauMotif
  },
  {
    title: "Technologie",
    text: "Structurer l’information, relier les contextes et rendre la coordination plus simple, plus lisible et plus fiable.",
    icon: Compass,
    href: "/mbambulaan#valeur-immediate",
    cta: "Voir la valeur apportée",
    className: "md:col-span-1",
    Motif: TechnologieMotif
  }
] as const;

export default function HomePage() {
  return (
    <main className="pub-scope min-h-screen overflow-hidden">
      {/* 01 — Hero */}
      <section className="relative min-h-[720px] bg-[var(--pub-deep-900)] text-white md:min-h-[800px]">
        <Image
          src="/mbambulaan-hero-premium.jpg"
          alt="Activité maritime et halieutique sur le littoral sénégalais."
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,.97)_0%,rgba(11,26,42,.87)_38%,rgba(11,26,42,.44)_72%,rgba(11,26,42,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,26,42,.08),rgba(11,26,42,.04)_55%,rgba(11,26,42,.92)_100%)]" />
        <div className="relative">
          <PublicHeader dark />
          <div className="mx-auto flex min-h-[620px] max-w-[1500px] items-center px-5 py-20 md:px-10">
            <BlurFade inView className="max-w-[860px]">
              <div className="pub-eyebrow pub-eyebrow--dark">
                <Waves size={13} /> Économie maritime · premier ancrage : filière halieutique sénégalaise
              </div>
              <h1 className="pub-display mt-7 max-w-[840px] text-[clamp(2.9rem,7.4vw,6.3rem)] not-italic leading-[.98]">
                Connecter les acteurs. <em className="not-italic text-[var(--pub-turquoise-300)]">Coordonner les territoires.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
                Mbàmbulaan relie information de terrain, acteurs et capacités pour transformer des situations dispersées en besoins qualifiés, puis en actions mieux coordonnées.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/solutions" className="pub-btn pub-btn-primary min-h-12 px-5 text-[.95rem]">
                  Décrire une situation <ArrowRight size={18} />
                </Link>
                <Link href="/atlas" className="pub-btn pub-btn-on-dark min-h-12 px-5 text-[.95rem]">
                  Explorer les territoires <MapPinned size={17} />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-white/56">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--pub-turquoise-300)]" /> Terrain et réseau</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--pub-turquoise-300)]" /> Information sourcée</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--pub-turquoise-300)]" /> Coordination humaine</span>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>
      <SectionWave />

      {/* 02 — Filière : chaîne de valeur + repères chiffrés */}
      <section className="px-5 pb-14 md:px-10 md:pb-20">
        <div className="mx-auto max-w-[1500px]">
          <BlurFade inView>
            <span className="pub-index">01</span>
            <p className="pub-eyebrow mt-3">Une filière à coordonner</p>
            <h2 className="pub-display mt-3 max-w-4xl text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3rem]">
              De la mer au marché, la valeur dépend de maillons qui doivent fonctionner ensemble.
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-[var(--pub-stone-700)]">
              Débarquement, froid, transformation, transport, débouchés et services : chaque situation locale s’inscrit dans une chaîne plus large. Mbàmbulaan aide à relier ces dépendances au lieu de les traiter isolément.
            </p>
          </BlurFade>

          <div className="mt-9">
            <ValueChainDiagram />
          </div>

          {/* PUB-A2 (audit Premium XXL Public, CEO 2026-08-16) : blanc
              assumé pour les deux tuiles de données, troisième déjà marine
              — hiérarchie page = crème / objet = blanc / signal = marine. */}
          <div className="mt-10 grid overflow-hidden rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-stone-150)] md:grid-cols-3">
            <div className="bg-[var(--pub-surface)] p-6 md:p-7">
              <p className="pub-index">Repère national</p>
              <div className="mt-3 flex items-baseline gap-1 text-[2.2rem] font-semibold tracking-[-.04em] text-[var(--pub-deep-900)]">
                <NumberTicker value={3.2} decimalPlaces={1} /> <span>%</span>
              </div>
              <p className="mt-1 text-sm font-bold text-[var(--pub-stone-900)]">du PIB national</p>
              <p className="mt-3 text-xs leading-5 text-[var(--pub-stone-500)]">Contribution directe de la pêche à l’économie sénégalaise.</p>
            </div>
            <div className="bg-[var(--pub-surface)] p-6 md:p-7">
              <p className="pub-index">Emploi</p>
              <div className="mt-3 flex items-baseline gap-1 text-[2.2rem] font-semibold tracking-[-.04em] text-[var(--pub-deep-900)]">
                <NumberTicker value={600000} /> <span className="text-xl">+</span>
              </div>
              <p className="mt-1 text-sm font-bold text-[var(--pub-stone-900)]">emplois directs et indirects</p>
              <p className="mt-3 text-xs leading-5 text-[var(--pub-stone-500)]">Une économie profondément ancrée dans l’artisanat et les territoires.</p>
            </div>
            <div className="bg-[var(--pub-deep-800)] p-6 text-[var(--pub-ivory-100)] md:p-7">
              <p className="pub-index text-[var(--pub-turquoise-300)]">Pêche artisanale</p>
              <div className="mt-3 flex items-baseline gap-1 text-[2.2rem] font-semibold tracking-[-.04em]">
                ≈ <NumberTicker value={20000} />
              </div>
              <p className="mt-1 text-sm font-bold">pirogues artisanales</p>
              <p className="mt-3 text-xs leading-5 text-white/56">Un réseau dispersé qui rend la coordination territoriale essentielle.</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--pub-stone-500)]">{statsNote}</p>
        </div>
      </section>

      {/* 03 — Ce que Mbàmbulaan organise : Bento Grid. Pas de SectionWave
          avant celle-ci (fond continu avec la section 01) : pt-4 au lieu de
          pt-16/24, même correctif que la frontière 04→05 plus bas
          (pb-20 pt-4), pour ne pas cumuler le pb-14/20 de la section 01 et
          un plein py — le vide de ~150-180px signalé par le CEO venait de
          cette double marge (lot de finitions, 2026-08-16). */}
      <section className="px-5 pb-16 pt-4 md:px-10 md:pb-24">
        <div className="mx-auto max-w-[1500px]">
          <BlurFade inView>
            <span className="pub-index">02</span>
            <p className="pub-eyebrow mt-3">Une infrastructure de coordination</p>
            <h2 className="pub-display mt-3 max-w-4xl text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3rem]">
              Le numérique n’est qu’un moyen. La valeur vient de ce qu’il permet d’organiser.
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-[var(--pub-stone-700)]">
              Mbàmbulaan combine présence terrain, réseau mobilisable et technologie pour qualifier une situation, relier les bons acteurs et suivre ce qui se passe réellement après la décision.
            </p>
          </BlurFade>

          <BentoGrid className="mt-10 auto-rows-[20rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map(({ title, text, icon: Icon, href, cta, className, Motif }) => (
              <BentoCard
                key={title}
                name={title}
                description={text}
                Icon={Icon}
                href={href}
                cta={cta}
                // Doctrine surfaces crème/blanc (P1, section 8) : surface
                // fonctionnelle/éditoriale → --pub-surface, cohérent avec
                // .pub-card et .pub-chain-stage — ces trois cartes portent
                // une vraie information (les trois piliers), pas un fond
                // décoratif à part.
                className={`${className} border border-[var(--pub-stone-150)] bg-[var(--pub-surface)]`}
                background={<Motif className="absolute inset-0 h-full w-full" />}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* 04 — Atlas : Dotted Map + Marquee */}
      <SectionWave flip />
      <section className="pub-hero px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
            <BlurFade inView>
              <span className="pub-index text-[var(--pub-turquoise-300)]">03</span>
              <p className="pub-eyebrow pub-eyebrow--dark mt-3">Atlas Mbàmbulaan</p>
              <h2 className="pub-display mt-3 text-[2.4rem] not-italic leading-[1.05] md:text-[3.2rem]">Voir les territoires pour mieux comprendre où agir.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62">L’Atlas relie territoires, quais, activités et informations publiques documentées. Il donne un contexte commun avant d’aller vers les données opérationnelles privées du Produit.</p>
              <Link href="/atlas" className="pub-btn pub-btn-primary mt-7">Ouvrir l’Atlas <MapPinned size={16}/></Link>
            </BlurFade>

            <div className="pub-card--dark min-h-[360px] overflow-hidden p-5 md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4"><p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-turquoise-300)]">Territoires représentés</p><span className="text-xs font-semibold text-white/42">Couverture en enrichissement</span></div>
              <div className="h-[285px] overflow-hidden rounded-2xl border border-white/10 bg-white/[.025] p-3"><DottedMap width={180} height={110} countries={["SEN"]} region={{ lat: { min: 12.1, max: 16.8 }, lng: { min: -17.7, max: -11.2 } }} markers={territoryMarkers} dotColor="rgba(247,243,233,.28)" markerColor="#b6522f" dotRadius={0.28} pulse /></div>
            </div>
          </div>

          <div className="mt-8 border-y border-white/10 py-2"><Marquee pauseOnHover className="[--duration:36s] [--gap:1.5rem]">{territories.map((territory) => <span key={territory} className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white/68"><span className="size-1.5 rounded-full bg-[var(--pub-turquoise-500)]" /> {territory}</span>)}</Marquee></div>
        </div>
      </section>
      <SectionWave className="rotate-180" />

      {/* 05 — Agir : situation + opportunités */}
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <BlurFade inView>
              <span className="pub-index">04</span>
              <p className="pub-eyebrow mt-3">Passer à l’action</p>
              <h2 className="pub-display mt-3 text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3rem]">Une situation, une capacité ou un programme : commencez par le bon point d’entrée.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--pub-stone-700)]">Mbàmbulaan part de la situation réelle, qualifie le besoin, le relie au contexte territorial et mobilise les capacités pertinentes.</p>
              <div className="mt-7 flex flex-wrap gap-3"><Link href="/solutions" className="pub-btn pub-btn-dark">Décrire une situation <ArrowRight size={16}/></Link><Link href="/contact?intent=contribution" className="pub-btn pub-btn-outline">Proposer une capacité</Link></div>
            </BlurFade>

            <div className="grid gap-4 md:grid-cols-2">
              {publicAnnouncements.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/opportunites/${item.id}`} className="pub-card group flex min-h-56 flex-col p-5">
                  <div className="text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]">{item.type}</div>
                  <h3 className="mt-4 text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-5"><span className="text-xs font-semibold text-[var(--pub-stone-500)]">{item.territory}</span><span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--pub-deep-800)]">Voir <ArrowRight size={14}/></span></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Comprendre + CTA final */}
      <section className="px-5 pb-20 pt-4 md:px-10 md:pb-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="pub-tideline" />
          <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <BlurFade inView className="max-w-3xl"><span className="pub-index">05</span><p className="pub-eyebrow mt-3">Découvrir</p><h2 className="pub-display mt-3 text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3rem]">Comprendre la filière par les territoires, les usages et les situations concrètes.</h2></BlurFade>
            <Link href="/decouvrir" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Explorer les contenus <ArrowRight size={16}/></Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {publicNews.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/decouvrir/${item.id}`} className="pub-card group flex min-h-60 flex-col p-5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14}/>{item.category}</div>
                <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-5"><span className="text-xs font-semibold text-[var(--pub-stone-500)]">{item.territory} · {item.readingTime}</span><span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--pub-deep-800)]">Lire <ArrowRight size={14}/></span></div>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="pub-card p-6"><Handshake className="text-[var(--pub-deep-800)]" /><p className="pub-eyebrow mt-5">Vous avez une situation</p><h3 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Décrire une situation</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Décrivez ce qui se passe. Mbàmbulaan qualifie le besoin et organise la suite.</p><Link href="/solutions" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Commencer <ArrowRight size={15}/></Link></div>
            <div className="pub-card p-6"><Network className="text-[var(--pub-deep-800)]" /><p className="pub-eyebrow mt-5">Vous pouvez contribuer</p><h3 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Proposer une capacité</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Entreprise, expert, ONG ou organisation : présentez ce que vous pouvez réellement apporter au réseau.</p><Link href="/contact?intent=contribution" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Contribuer <ArrowRight size={15}/></Link></div>
            <div className="pub-card p-6"><MapPinned className="text-[var(--pub-deep-800)]" /><p className="pub-eyebrow mt-5">Vous portez un programme</p><h3 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Étudier une intervention</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Territoire, acteurs, partenaires et suivi : Mbàmbulaan peut structurer le cadrage avant déploiement.</p><Link href="/contact?intent=programme" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Parler à Mbàmbulaan <ArrowRight size={15}/></Link></div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
