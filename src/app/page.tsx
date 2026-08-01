import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  CircleDollarSign,
  DatabaseZap,
  Globe2,
  Handshake,
  Leaf,
  MapPinned,
  Radio,
  ShipWheel,
  Sparkles,
  UsersRound
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { createDemoState } from "@/data/demo-state";

const coast = [
  { name: "Saint-Louis", y: "13%", x: "44%", tone: "lagoon" },
  { name: "Kayar", y: "31%", x: "38%", tone: "amber" },
  { name: "Hann", y: "43%", x: "48%", tone: "lagoon" },
  { name: "Mbour", y: "57%", x: "42%", tone: "amber" },
  { name: "Joal", y: "68%", x: "49%", tone: "coral" },
  { name: "Kafountine", y: "87%", x: "34%", tone: "lagoon" }
] as const;

const valueLoops = [
  {
    number: "01",
    title: "Voir la filière",
    text: "Territoires, quais, acteurs, pirogues, débarquements, espèces et capacités dans une même vue opérationnelle.",
    icon: Globe2
  },
  {
    number: "02",
    title: "Coordonner l’action",
    text: "Un signal devient une responsabilité, une échéance, une action suivie et un résultat observable.",
    icon: Handshake
  },
  {
    number: "03",
    title: "Préserver la valeur",
    text: "Les besoins, capacités, lots, débouchés et initiatives sont reliés avant que la valeur ne se perde.",
    icon: CircleDollarSign
  },
  {
    number: "04",
    title: "Apprendre collectivement",
    text: "Chaque trace utile enrichit la mémoire des territoires, la durabilité et les décisions futures.",
    icon: BookOpenText
  }
] as const;

export default function HomePage() {
  const state = createDemoState();
  const openSituations = state.situations.filter((item) => item.status !== "reglee");
  const landedKg = state.landings.reduce((sum, landing) => sum + landing.totalWeightKg, 0);
  const activeInfrastructure = state.infrastructures.filter((item) => item.status === "operationnelle").length;

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <section className="relative min-h-[820px] bg-[#031a22] text-white">
        <Image
              src="/mbambulaan-hero-premium.jpg"
          alt="Débarquement artisanal coordonné sur le littoral sénégalais."
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,26,34,.98)_0%,rgba(3,26,34,.88)_33%,rgba(3,26,34,.38)_68%,rgba(3,26,34,.14)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,26,34,.12),rgba(3,26,34,.06)_58%,rgba(3,26,34,.84)_100%)]" />
        <div className="relative">
          <PublicHeader dark />
          <div className="mx-auto flex min-h-[660px] max-w-[1500px] items-center px-5 py-20 md:px-10">
            <div className="max-w-[760px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-bold text-[#bcece5] backdrop-blur">
                <Radio size={14} /> Pêche artisanale sénégalaise · infrastructure de coordination
              </div>
              <h1 className="mt-7 max-w-[720px] text-[clamp(3.2rem,7.2vw,7.4rem)] font-[760] leading-[.92] tracking-[-.065em]">
                La filière devient <span className="text-[#74e1d6]">visible.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/76 md:text-xl">
                Mbàmbulaan relie le littoral, les acteurs, les opérations, les capacités et les décisions dans un jumeau numérique vivant de la filière halieutique.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/demo" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#5fe0d3] px-5 py-3 font-bold text-[#031a22] shadow-[0_14px_34px_rgba(31,182,164,.24)] transition hover:-translate-y-0.5 hover:bg-[#76e8dd]">
                  Explorer le produit <ArrowRight size={18} />
                </Link>
                <Link href="/atlas" className="btn-light min-h-12 px-5">
                  Ouvrir l’Atlas public <MapPinned size={17} />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-white/62">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#74e1d6]" /> Données sourcées</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#74e1d6]" /> Décision humaine</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#74e1d6]" /> Produit configurable</span>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-[1500px] px-5 pb-8 md:px-10">
            <div className="grid overflow-hidden rounded-2xl border border-white/14 bg-[#052630]/82 shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Quais représentés", state.territories.length, "Vue littorale commune"],
                ["Volume documenté", `${(landedKg / 1000).toFixed(1)} t`, "Débarquements reliés"],
                ["Situations actives", openSituations.length, "Responsabilités visibles"],
                ["Capacités disponibles", activeInfrastructure, "Froid, pesée, transport"]
              ].map(([label, value, detail]) => (
                <div key={label} className="border-b border-white/10 p-5 last:border-0 sm:border-r lg:border-b-0">
                  <p className="text-[11px] font-bold uppercase tracking-[.09em] text-white/50">{label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-[-.04em] text-white">{value}</p>
                  <p className="mt-1 text-xs text-[#9ec8ca]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e3e3] bg-[#f3f7f6]">
        <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[.78fr_1.22fr]">
          <div className="flex flex-col justify-between border-b border-[#d9e3e3] px-5 py-14 md:px-10 md:py-20 lg:border-b-0 lg:border-r">
            <div>
              <p className="label">Une vue opérationnelle commune</p>
              <h2 className="section-title mt-4">Le littoral n’est plus une succession d’informations isolées.</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#667b81]">
                Chaque quai devient un nœud vivant : activité, pirogues, débarquements, espèces, capacités, tensions, initiatives et résultats restent reliés.
              </p>
            </div>
            <Link href="/atlas" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">
              Explorer le jumeau territorial <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="p-5 md:p-10">
            <div className="surface-dark relative min-h-[570px] overflow-hidden p-4 sm:p-6">
              <div className="relative z-20 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="label-inverse">Jumeau territorial · aperçu</p>
                  <h3 className="mt-2 text-xl font-bold">Situation littorale</h3>
                </div>
                <div className="data-chip border-white/15 bg-white/8 text-white/72">
                  <span className="size-2 rounded-full bg-[#5fe0d3]" /> Mis à jour il y a 8 min
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-4 top-24 overflow-hidden rounded-2xl border border-white/10 ocean-grid">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" aria-hidden="true">
                  <path d="M630 0 L800 0 L800 500 L585 500 C610 445 560 412 602 366 C632 332 573 289 616 247 C655 208 596 165 632 126 C662 93 624 60 630 0Z" fill="#e9eadf" opacity=".96" />
                  <path d="M628 0 C620 61 660 94 632 126 C596 165 655 208 616 247 C573 289 632 332 602 366 C560 412 610 445 585 500" fill="none" stroke="#83d9d0" strokeWidth="2" opacity=".45" />
                  <path className="flow-line" d="M330 110 C380 150 400 205 355 250 S300 355 365 415" fill="none" stroke="#5fe0d3" strokeWidth="2" strokeDasharray="8 12" opacity=".5" />
                  <path className="flow-line" d="M250 280 C330 260 395 290 444 330" fill="none" stroke="#d7aa58" strokeWidth="2" strokeDasharray="5 11" opacity=".5" />
                </svg>
                {coast.map((item) => (
                  <div key={item.name} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: item.x, top: item.y }}>
                    <span className={`absolute inset-[-5px] rounded-full map-pulse ${item.tone === "coral" ? "bg-[#e76a58]" : item.tone === "amber" ? "bg-[#d7aa58]" : "bg-[#5fe0d3]"}`} />
                    <span className={`relative block size-3.5 rounded-full border-2 border-white ${item.tone === "coral" ? "bg-[#c65242]" : item.tone === "amber" ? "bg-[#d8951a]" : "bg-[#1fb6a4]"}`} />
                    <span className="mt-1.5 block whitespace-nowrap rounded-md bg-[#031a22]/88 px-2 py-1 text-[10px] font-bold text-white shadow-lg">{item.name}</span>
                  </div>
                ))}
                <div className="absolute bottom-4 left-4 right-4 z-20 grid gap-2 rounded-xl border border-white/12 bg-[#031a22]/86 p-3 backdrop-blur sm:grid-cols-3">
                  <div><p className="text-[10px] uppercase tracking-wider text-white/45">À coordonner</p><p className="mt-1 text-sm font-bold">Chaîne du froid · Joal</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-white/45">Flux du jour</p><p className="mt-1 text-sm font-bold">2,34 t débarquées</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-white/45">Décision attendue</p><p className="mt-1 text-sm font-bold text-[#74e1d6]">Capacité alternative</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
        <div className="max-w-3xl">
          <p className="label">Du signal au résultat</p>
          <h2 className="section-title mt-4">Une infrastructure qui met l’écosystème en mouvement.</h2>
        </div>
        <div className="mt-12 grid border-y border-[#d9e3e3] md:grid-cols-2 xl:grid-cols-4">
          {valueLoops.map(({ number, title, text, icon: Icon }) => (
            <article key={title} className="group border-b border-[#d9e3e3] px-1 py-8 md:border-r md:px-6 xl:border-b-0 first:md:pl-0 last:md:border-r-0 last:xl:pr-0">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568] transition group-hover:bg-[#075568] group-hover:text-white"><Icon size={20} /></span>
                <span className="text-xs font-black text-[#a7b9bc]">{number}</span>
              </div>
              <h3 className="mt-7 text-xl font-bold tracking-[-.025em] text-[#102e37]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#667b81]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#052630] px-5 py-20 text-white md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-12 xl:grid-cols-[.85fr_1.15fr] xl:items-center">
          <div>
            <p className="label-inverse">Une technologie utile, pas une boîte noire</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.6vw,4.8rem)] font-[740] leading-[1.02] tracking-[-.05em]">
              L’intelligence collective avant l’intelligence artificielle.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/66">
              Mbàmbulaan capitalise l’expérience des pêcheurs, opérateurs, organisations et territoires. L’IA peut ensuite résumer, rapprocher ou signaler une incohérence — toujours avec ses raisons et une validation humaine.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Terrain", "Un signal sourcé et contextualisé", Radio],
              ["Coordination", "Une responsabilité et une échéance", Handshake],
              ["Confiance", "Une trace et un résultat vérifiables", DatabaseZap],
              ["IA gouvernée", "Une synthèse explicable, activable", Sparkles]
            ].map(([title, text, Icon]) => {
              const VisualIcon = Icon as typeof Radio;
              return (
                <div key={String(title)} className="rounded-2xl border border-white/12 bg-white/6 p-5">
                  <VisualIcon className="text-[#74e1d6]" size={21} />
                  <h3 className="mt-5 font-bold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{String(text)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="label">Valeur pour l’écosystème</p>
            <h2 className="section-title mt-4">Chacun agit depuis le même réel.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#667b81] lg:justify-self-end">
            Les droits, priorités et actions changent selon le rôle. Les territoires, acteurs, lots, besoins, traces et résultats ne se dupliquent jamais.
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            { title: "Acteurs de terrain", text: "Déclarer un retour, une capacité ou une rupture, puis voir ce qu’elle devient.", icon: UsersRound, accent: "bg-[#e5f7f3]" },
            { title: "Organisations & institutions", text: "Partager une situation fiable, coordonner les réponses et suivre les résultats.", icon: BarChart3, accent: "bg-[#e7f2f5]" },
            { title: "Partenaires & programmes", text: "Cibler un appui, vérifier les engagements et mesurer une valeur créée.", icon: Leaf, accent: "bg-[#f8f2e7]" }
          ].map(({ title, text, icon: Icon, accent }) => (
            <article key={title} className="surface overflow-hidden p-1">
              <div className={`${accent} rounded-[13px] p-6`}>
                <Icon size={24} className="text-[#075568]" />
                <h3 className="mt-12 text-2xl font-bold tracking-[-.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667b81]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9e3e3] bg-[#f3f7f6] px-5 py-16 md:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="label">Pilote et partenariat</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] text-[#102e37] md:text-4xl">Construisons le premier territoire relié.</h2>
            <p className="mt-4 text-base leading-7 text-[#667b81]">
              Le périmètre, les rôles, les sources et les indicateurs seront cadrés avec les acteurs concernés. La plateforme est conçue pour s’adapter sans fragmenter le produit.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">Parler d’un pilote <ArrowRight size={16} /></Link>
            <Link href="/offres" className="btn-secondary">Découvrir les solutions</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#031a22] px-5 py-10 text-sm text-white/60 md:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-[#075568]"><ShipWheel size={18} /></span>
            <div><p className="font-bold text-white">Mbàmbulaan</p><p className="text-xs">La filière reliée.</p></div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
            <Link href="/atlas">Atlas</Link>
            <Link href="/community">Communauté</Link>
            <Link href="/durabilite">Durabilité</Link>
            <Link href="/offres">Solutions</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <p className="text-xs">© 2026 · Données de démonstration non officielles</p>
        </div>
      </footer>
    </main>
  );
}
