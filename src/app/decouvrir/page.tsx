import Link from "next/link";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";

const editorialStories = [
  {
    index: "01",
    theme: "Sécurité et prévention en mer",
    title: "Relier les départs, les retours attendus et les relais locaux.",
    text: "Une information contextualisée aide les acteurs territoriaux à vérifier une situation et à conserver la trace de la réponse apportée.",
  },
  {
    index: "02",
    theme: "Chaîne de froid et réduction des pertes",
    title: "Transformer un besoin de conservation en programme structuré.",
    text: "Le besoin, ses bénéficiaires, les preuves disponibles et le financement restant sont réunis pour préparer une collaboration utile.",
  },
  {
    index: "03",
    theme: "Femmes transformatrices et valeur locale",
    title: "Mieux rendre visibles les métiers qui valorisent les produits de la mer.",
    text: "Les initiatives de qualité, de transformation et de formation deviennent lisibles pour les territoires et les partenaires potentiels.",
  },
];

const resources = [
  { duration: "03 min", type: "Portrait métier", title: "Le rôle d’un poste local reconnu", tone: "navy" },
  { duration: "02 min", type: "Séquence terrain", title: "Du débarquement à la déclaration", tone: "ocean" },
  { duration: "04 min", type: "Ressource pédagogique", title: "Transformation, hygiène et valeur locale", tone: "sand" },
];

const initiatives = [
  ["Sécurité en mer", "Saint-Louis", "180 capitaines et jeunes pêcheurs", "Retours mieux documentés", "ONG maritime"],
  ["Chaîne de froid", "Joal–Mbour", "680 acteurs de la filière", "Pertes évitées et qualité préservée", "Programme public froid"],
  ["Femmes transformatrices", "Joal-Fadiouth", "Groupements locaux", "Capacités de transformation renforcées", "Partenaire technique"],
  ["Métiers bleus et pêche durable", "Fass Boye", "320 jeunes et familles", "Insertion et pratiques responsables", "Coopération internationale"],
];

const assistantAnswers = [
  ["Pourquoi la chaîne de froid est-elle importante ?", "Elle préserve la qualité, réduit les pertes après débarquement et améliore la capacité des communautés à valoriser leurs produits.", "Source locale : scénario Joal–Mbour et ressources de démonstration."],
  ["Comment un besoin communautaire devient-il un programme ?", "Le besoin est d’abord remonté, vérifié et qualifié. Il peut ensuite être relié à des bénéficiaires, des résultats attendus, un budget, des preuves et un partenaire potentiel.", "Source locale : parcours Communautés & Programmes."],
  ["Quel rôle jouent les femmes transformatrices ?", "Elles prolongent la valeur du débarquement par la transformation, la conservation et la commercialisation locale, tout en structurant des emplois et savoir-faire essentiels.", "Source locale : contenus éditoriaux de démonstration."],
];

export default function DiscoverPage() {
  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <PublicSiteHeader />
    <section className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,.65fr)] lg:items-end lg:px-10 lg:py-24">
        <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Découvrir Mbàmbulaan</p><h1 className="mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[1.02] text-[var(--mb-navy-900)]">Comprendre la pêche artisanale. Faire émerger les initiatives qui comptent.</h1><p className="mt-6 max-w-2xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">Cet espace public valorise les communautés, les métiers, les territoires et les programmes qui renforcent la pêche artisanale sénégalaise.</p></div>
        <div className="border-l-2 border-[var(--mb-ocean-600)] pl-5"><p className="text-[12px] leading-6 text-[var(--mb-neutral-600)]">Des contenus de démonstration pour comprendre la filière et préparer une collaboration. Les données opérationnelles restent réservées à la console Ministère.</p><div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col"><a href="#initiatives" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[11px] font-bold text-white">Découvrir les initiatives</a><Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-4 text-[11px] font-bold text-[var(--mb-navy-900)]">Proposer une collaboration</Link></div></div>
      </div>
    </section>

    <section className="border-b border-[var(--mb-neutral-200)]">
      <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <SectionHeading eyebrow="Comprendre la filière" title="Trois enjeux, un même besoin de coordination." text="Chaque sujet est un contenu éditorial de démonstration, conçu pour expliquer les réalités de terrain sans exposer de données sensibles." />
        <div className="mt-10 grid gap-px bg-[var(--mb-neutral-200)] lg:grid-cols-2">
          {editorialStories.map((story, index) => <article key={story.index} className={`bg-white p-6 sm:p-8 ${index === 0 ? "lg:row-span-2 lg:min-h-[30rem]" : ""}`}><div className="flex items-center justify-between gap-4"><span className="font-mono text-[10px] text-[var(--mb-ocean-600)]">{story.index}</span><span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">Contenu de démonstration</span></div><div className={index === 0 ? "lg:mt-40" : "mt-12"}><p className="text-[11px] font-bold text-[var(--mb-ocean-600)]">{story.theme}</p><h2 className="mt-3 max-w-2xl text-[24px] font-semibold leading-tight text-[var(--mb-navy-900)]">{story.title}</h2><p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">{story.text}</p></div></article>)}
        </div>
      </div>
    </section>

    <section className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <SectionHeading eyebrow="Vidéos et ressources" title="Voir les métiers et les gestes qui structurent la filière." text="Aperçus statiques de ressources prévues pour une future médiathèque publique. Aucun service vidéo externe n’est appelé." />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">{resources.map((resource, index) => <article key={resource.title} className="overflow-hidden border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]"><ResourcePreview tone={resource.tone} index={index + 1} /><div className="p-5"><div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]"><span>{resource.type}</span><span>{resource.duration}</span></div><h3 className="mt-4 text-[17px] font-semibold text-[var(--mb-navy-900)]">{resource.title}</h3><p className="mt-3 text-[11px] text-[var(--mb-neutral-600)]">Aperçu de démonstration · ressource non publiée</p></div></article>)}</div>
        <details className="mt-8 border border-[var(--mb-ocean-600)]/20 bg-[var(--mb-foam)]"><summary className="cursor-pointer list-none px-5 py-4 text-[12px] font-bold text-[var(--mb-navy-900)]">Explorer les ressources avec l’assistance Mbàmbulaan <span className="ml-2 font-normal text-[var(--mb-neutral-600)]">Préfiguration locale</span></summary><div className="grid gap-px border-t border-[var(--mb-ocean-600)]/15 bg-[var(--mb-ocean-600)]/15 lg:grid-cols-3">{assistantAnswers.map(([question, answer, source]) => <article key={question} className="bg-white p-5"><h3 className="text-[12px] font-semibold text-[var(--mb-navy-900)]">{question}</h3><p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{answer}</p><p className="mt-4 border-t border-[var(--mb-neutral-100)] pt-3 font-mono text-[9px] leading-4 text-[var(--mb-neutral-400)]">{source}</p></article>)}</div><p className="border-t border-[var(--mb-ocean-600)]/15 px-5 py-3 text-[10px] text-[var(--mb-neutral-600)]">Préfiguration locale · aucune donnée transmise · réponses prédéfinies</p></details>
      </div>
    </section>

    <section id="initiatives" className="scroll-mt-8 border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]">
      <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><SectionHeading eyebrow="Initiatives et programmes" title="Des besoins territoriaux reliés à des résultats concrets." text="Exemples simulés de programmes pouvant réunir communautés, services techniques et partenaires." /><div className="mt-10 overflow-hidden border-y border-[var(--mb-neutral-200)] bg-white">{initiatives.map(([title, territory, beneficiaries, result, partner], index) => <article key={title} className="grid gap-4 border-b border-[var(--mb-neutral-200)] p-5 last:border-b-0 md:grid-cols-[3rem_minmax(12rem,1fr)_minmax(10rem,.7fr)_minmax(12rem,1fr)] md:items-center"><span className="font-mono text-[10px] text-[var(--mb-ocean-600)]">0{index + 1}</span><div><h3 className="text-[14px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-400)]">{territory} · {beneficiaries}</p></div><p className="text-[11px] leading-5 text-[var(--mb-neutral-600)]">{result}</p><div className="md:text-right"><p className="text-[10px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">Partenaire potentiel</p><p className="mt-1 text-[11px] font-semibold text-[var(--mb-navy-900)]">{partner}</p></div></article>)}</div></div>
    </section>

    <section className="bg-white">
      <div className="mx-auto flex max-w-[84rem] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:px-10 lg:py-20"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Nous contacter</p><h2 className="mt-4 max-w-3xl text-[30px] font-semibold leading-tight text-[var(--mb-navy-900)]">Préparer un atelier, une initiative ou une collaboration autour de la filière.</h2><p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">Le formulaire prépare un récapitulatif local. Aucun envoi réseau n’est effectué dans cette démonstration.</p></div><Link href="/contact" className="inline-flex h-11 shrink-0 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">Préciser votre demande</Link></div>
    </section>
  </main>;
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="max-w-3xl"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-4 text-[30px] font-semibold leading-tight text-[var(--mb-navy-900)]">{title}</h2><p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">{text}</p></div>;
}

function ResourcePreview({ tone, index }: { tone: string; index: number }) {
  const background = tone === "navy" ? "bg-[var(--mb-navy-900)]" : tone === "ocean" ? "bg-[var(--mb-ocean-600)]" : "bg-[var(--mb-sand-300)]";
  return <div className={`relative aspect-[16/9] overflow-hidden ${background}`} aria-hidden="true"><div className="absolute inset-x-0 bottom-0 h-[34%] bg-[var(--mb-navy-900)]/25" /><div className="absolute bottom-[28%] left-[12%] h-px w-[76%] bg-white/45" /><div className="absolute left-[18%] top-[24%] h-[42%] w-px bg-white/30" /><div className="absolute left-[18%] top-[24%] h-px w-[36%] bg-white/30" /><span className="absolute right-4 top-4 font-mono text-[10px] text-white/70">RESSOURCE 0{index}</span><span className="absolute bottom-4 left-4 grid h-9 w-9 place-items-center border border-white/45 text-[12px] text-white">▶</span></div>;
}
