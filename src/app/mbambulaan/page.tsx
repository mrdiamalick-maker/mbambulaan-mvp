import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check, Compass, Lock, MapPinned, Network, Radar, Route } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { LoopDiagram } from "@/components/public/LoopDiagram";
import { StatBand } from "@/components/public/StatBand";
import { EditorialPhoto } from "@/components/public/EditorialPhoto";
import { filiereStats, statsNote } from "@/data/public-stats";

export const metadata: Metadata = {
  title: "Mbàmbulaan | Terrain, réseau, technologie",
  description: "Mbàmbulaan construit une infrastructure de coordination pour l’économie maritime, en commençant par la filière halieutique sénégalaise : terrain, réseau et technologie au service de l’action.",
  alternates: { canonical: "/mbambulaan" }
};

const pillars = [
  { title: "Terrain", text: "Comprendre les réalités, identifier les besoins et maintenir une relation directe avec les territoires.", icon: Route },
  { title: "Réseau", text: "Mobiliser organisations, professionnels, entreprises, partenaires, experts et programmes lorsque l’action l’exige.", icon: Network },
  { title: "Technologie", text: "Structurer l’information, relier les contextes et rendre la coordination plus simple et plus fiable.", icon: Radar }
] as const;

const today = [
  "Rendre lisible une filière aujourd’hui mal documentée publiquement, territoire par territoire.",
  "Capter et qualifier de vrais besoins via un moteur de demande, pas un formulaire de contact générique.",
  "Ouvrir un canal d’entrée direct pour entreprises, ONG, bailleurs et institutions cherchant acteurs, territoires ou opportunités.",
  "Donner une audience qualifiée aux formations, programmes et appels déjà existants dans la filière.",
  "Commencer à documenter un réseau de capacités mobilisables — sans marketplace ni annuaire public.",
  "Générer un revenu réel — intermédiation, sourcing, diagnostics — avant même le lancement de nos outils professionnels."
];

const later = [
  "Outils de pilotage et de coordination internes pour les opérations quotidiennes des équipes terrain.",
  "Workflows détaillés par métier — capitaine, agent de quai, mareyeur, transformateur, prestataire.",
  "Tableaux de bord, alertes et suivi en temps réel, réservés aux organisations sous mandat."
];

export default function MbambulaanPage() {
  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Mbàmbulaan"
        title={<>Terrain, réseau et technologie. <span className="text-[var(--pub-turquoise-300)]">Une même capacité d’action.</span></>}
        description="Mbàmbulaan construit une infrastructure de coordination pour l’économie maritime, en commençant par la filière halieutique sénégalaise."
        actions={
          <>
            <Link href="/atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/12"><MapPinned size={16}/> Ouvrir l’Atlas</Link>
            <Link href="/solutions" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Trouver une solution <ArrowRight size={16}/></Link>
          </>
        }
        backgroundImage="/images/mbambulaan-terrain-hero.jpg"
        backgroundAlt="Équipe Mbàmbulaan sur le terrain, échange avec des acteurs de la filière sur un quai."
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article key={title} className="pub-card p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Icon size={20} /></span>
              <h2 className="mt-5 text-2xl font-bold tracking-[-.03em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <EditorialPhoto
            src="/images/mbambulaan-terrain.jpg"
            alt="Équipe Mbàmbulaan en échange avec des acteurs de la filière sur un site de débarquement."
            caption="Présence terrain : comprendre un territoire suppose d’abord de s’y rendre."
          />
        </div>

        <div className="mt-14">
          <p className="pub-eyebrow">Une filière qui pèse déjà</p>
          <h2 className="mt-3 text-2xl font-[740] tracking-[-.03em] text-[var(--pub-deep-900)]">Pourquoi l’économie maritime mérite une infrastructure dédiée.</h2>
          <div className="mt-6"><StatBand stats={filiereStats} dark={false} /></div>
          <p className="mt-4 text-xs leading-5 text-[var(--pub-stone-500)]">{statsNote}</p>
        </div>

        <section className="mt-14 rounded-[28px] border border-[var(--pub-stone-150)] bg-white p-6 md:p-10">
          <p className="pub-eyebrow">Ce que fait Mbàmbulaan</p>
          <h2 className="mt-4 text-3xl font-[740] tracking-[-.04em] md:text-4xl">Comprendre avant d’organiser l’action.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--pub-stone-700)]">Mbàmbulaan aide à transformer un besoin, une capacité ou une opportunité en action plus lisible, plus coordonnée et mieux suivie — une boucle continue plutôt qu’un projet ponctuel.</p>
          <div className="mt-8"><LoopDiagram /></div>
        </section>

        <section id="valeur-immediate" className="mt-14 scroll-mt-24">
          <p className="pub-eyebrow">Une valeur immédiate</p>
          <h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] text-[var(--pub-deep-900)] md:text-4xl">Ce que nous apportons dès aujourd’hui à la filière.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--pub-stone-700)]">Mbàmbulaan n’attend pas le lancement de ses outils professionnels pour créer de la valeur. Notre présence terrain, notre connaissance des territoires et notre réseau produisent déjà des résultats concrets, distincts de ce que nous construirons ensuite pour l’usage quotidien de nos équipes et de nos partenaires.</p>

          <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="pub-card border-[var(--pub-turquoise-500)]/40 p-6 md:p-8">
              <div className="flex items-center gap-2 text-[var(--pub-turquoise-500)]"><Check size={18} /><p className="text-xs font-black uppercase tracking-[.12em]">Dès aujourd’hui</p></div>
              <ul className="mt-5 space-y-4">
                {today.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--pub-stone-700)]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--pub-turquoise-500)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pub-card--quiet p-6 md:p-8">
              <div className="flex items-center gap-2 text-[var(--pub-stone-500)]"><Lock size={16} /><p className="text-xs font-black uppercase tracking-[.12em]">Dans une prochaine étape</p></div>
              <ul className="mt-5 space-y-4">
                {later.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--pub-stone-500)]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--pub-stone-300)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-5 text-[var(--pub-stone-500)]">Nos outils professionnels seront développés et commercialisés séparément, à mesure que la filière et nos partenaires en auront besoin.</p>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[26px] bg-[#eaf5f1] p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-deep-800)]">Vous avez un besoin ?</p>
            <h2 className="mt-3 text-2xl font-black">Décrivez ce que vous cherchez à accomplir.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Transport, froid, équipement, formation, sourcing, projet ou autre besoin : Mbàmbulaan organise la qualification.</p>
            <Link href="/solutions" className="mt-6 inline-flex items-center gap-2 font-black text-[var(--pub-deep-800)]">Trouver une solution <ArrowRight size={16} /></Link>
          </div>
          <div className="rounded-[26px] bg-[#f2eadb] p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#8b601e]">Vous pouvez apporter une capacité ?</p>
            <h2 className="mt-3 text-2xl font-black">Faites connaître votre capacité à Mbàmbulaan.</h2>
            <p className="mt-3 text-sm leading-6 text-[#6e6657]">Entreprise, ONG, expert, transporteur, formateur, financeur ou organisation : l’entrée dans le réseau reste qualifiée.</p>
            <Link href="/contact?intent=contribution" className="mt-6 inline-flex items-center gap-2 font-black text-[#8b601e]">Proposer mes services <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="mt-14 flex flex-col gap-5 rounded-[26px] bg-[#031a22] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-turquoise-300)]">Explorer le littoral</p>
            <h2 className="mt-2 text-2xl font-black">Voir les territoires avant d’agir.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-3 font-black text-[#031a22]"><MapPinned size={16} /> Ouvrir l’Atlas</Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 px-4 py-3 font-bold text-white"><Compass size={16} /> Parler à Mbàmbulaan</Link>
          </div>
        </section>
      </section>
      <PublicFooter />
    </main>
  );
}
