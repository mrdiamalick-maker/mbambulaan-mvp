import Link from "next/link";

const capabilities = [
  ["Pilotage", "Lire la situation nationale, concentrer l’action et préparer une décision reliée à ses preuves."],
  ["Atlas", "Superviser les quais, l’activité, les pirogues et les situations territoriales depuis une fiche métier unique."],
  ["Communautés & Programmes", "Transformer les besoins remontés en programmes mesurables et en dossiers finançables."],
];

const kayarJourney = [
  ["01", "Un écart est signalé", "Le poste de quai rattache l’information à Kayar et au débarquement concerné."],
  ["02", "Une vérification est demandée", "La Direction régionale prépare une demande structurée et identifie le responsable terrain."],
  ["03", "Le constat est validé", "La pièce reçue, sa source et le niveau de confiance restent visibles dans le dossier."],
  ["04", "Une décision est prise", "Le Ministère dispose de la situation, des éléments connus et de la prochaine action."],
  ["05", "Le document est conservé", "Le rapport de zone rejoint le registre pour archivage ou transmission manuelle."],
];

const benefits = [
  ["Contrôle territorial", "Une situation nationale lisible, reliée aux quais et aux acteurs responsables."],
  ["Temps de coordination", "Un dossier unique pour savoir qui agit, ce qui manque et ce qui vient ensuite."],
  ["Financements structurés", "Des besoins qualifiés, des programmes mesurables et des partenaires compatibles."],
  ["Impact et confiance", "Des sources, constats et niveaux de confiance attachés aux décisions et documents."],
];

export function InstitutionalLanding() {
  return <main className="min-h-screen overflow-hidden bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <Header />
    <Hero />
    <Problem />
    <Capabilities />
    <Demonstrations />
    <Benefits />
    <FinalCta />
  </main>;
}

function Header() {
  return <header className="border-b border-[var(--mb-neutral-200)] bg-white">
    <div className="mx-auto flex h-16 max-w-[84rem] items-center justify-between px-5 sm:px-8 lg:px-10">
      <Link href="/" className="flex items-center gap-3" aria-label="Accueil Mbàmbulaan">
        <span className="grid h-9 w-9 place-items-center rounded-[3px] bg-[var(--mb-navy-900)] text-[11px] font-black text-white">Mb</span>
        <span><strong className="block text-[15px] text-[var(--mb-navy-900)]">Mbàmbulaan</strong><span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">Coordination maritime</span></span>
      </Link>
      <Link href="/demande-demo" className="inline-flex h-9 items-center rounded-[3px] border border-[var(--mb-neutral-200)] px-4 text-[11px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">Demander un atelier</Link>
    </div>
  </header>;
}

function Hero() {
  return <section className="relative border-b border-[var(--mb-neutral-200)] bg-white">
    <div className="absolute inset-y-0 right-0 hidden w-[43%] bg-[linear-gradient(145deg,var(--mb-foam),#d8edf0)] lg:block" />
    <div className="relative mx-auto grid max-w-[84rem] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(25rem,.75fr)] lg:items-center lg:px-10 lg:py-28">
      <div className="max-w-3xl">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-600)]">Infrastructure de coordination pour la pêche artisanale</p>
        <h1 className="mt-6 text-[clamp(2.6rem,5.6vw,5.2rem)] font-semibold leading-[.98] tracking-[-0.02em] text-[var(--mb-navy-900)]">Voir la filière. Écouter le terrain. Décider avec des preuves.</h1>
        <p className="mt-7 max-w-2xl text-[16px] leading-7 text-[var(--mb-neutral-600)]">Mbàmbulaan transforme les signaux des quais et les besoins des communautés en programmes finançables, dossiers traçables et décisions documentées.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/demande-demo" className="inline-flex h-12 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[12px] font-bold text-white hover:bg-[var(--mb-navy-900)]">Demander un atelier de cadrage</Link>
          <Link href="/espace-prive/etat" className="inline-flex h-12 items-center justify-center rounded-[3px] border border-[var(--mb-ocean-600)]/30 bg-white px-5 text-[12px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">Voir la démonstration</Link>
        </div>
      </div>
      <div className="border border-[var(--mb-ocean-600)]/20 bg-[var(--mb-navy-900)] p-6 text-white lg:p-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">Deux capacités démontrées</p>
        <p className="mt-5 text-[24px] font-semibold leading-tight">Kayar pour l’action opérationnelle. Joal–Mbour pour la valeur communautaire et financière.</p>
        <dl className="mt-8 grid grid-cols-3 gap-px bg-white/10"><HeroFact value="8" label="Quais" /><HeroFact value="6" label="Besoins" /><HeroFact value="2" label="Parcours" /></dl>
        <p className="mt-5 text-[11px] leading-5 text-white/60">Données locales de démonstration. Toute validation reste humaine et toute transmission externe reste manuelle.</p>
      </div>
    </div>
  </section>;
}

function HeroFact({ value, label }: { value: string; label: string }) {
  return <div className="bg-white/[0.04] px-3 py-4"><strong className="block font-mono text-[20px]">{value}</strong><span className="mt-1 block text-[9px] uppercase text-white/55">{label}</span></div>;
}

function Problem() {
  const channels = ["WhatsApp", "Téléphone", "Poste de quai", "Agent territorial", "Document"];
  return <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]">
    <div className="mx-auto grid max-w-[84rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(18rem,.7fr)_minmax(0,1.3fr)] lg:px-10 lg:py-20">
      <SectionIntro eyebrow="Le problème" title="Les informations existent. Les besoins restent dispersés et difficiles à financer." text="Un signal arrive par plusieurs canaux, change de main et perd son contexte. Un besoin communautaire peine à devenir programme. Mbàmbulaan conserve l’origine, le responsable, les preuves et la prochaine étape." />
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">Aujourd’hui</p><div className="mt-5 flex flex-wrap gap-2">{channels.map((item) => <span key={item} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 py-2 text-[11px] font-semibold">{item}</span>)}</div><p className="mt-5 text-[13px] leading-6 text-[var(--mb-neutral-600)]">Des informations dispersées, des relances difficiles à suivre et des preuves séparées de la décision.</p></article>
        <article className="border border-[var(--mb-ocean-600)]/25 bg-[var(--mb-foam)] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Avec Mbàmbulaan</p><p className="mt-5 text-[22px] font-semibold leading-tight text-[var(--mb-navy-900)]">Le terrain devient action, programme et preuve.</p><p className="mt-5 text-[13px] leading-6 text-[var(--mb-neutral-600)]">La chaîne relie le quai, le besoin, le dossier, le financement, la décision et le document final.</p></article>
      </div>
    </div>
  </section>;
}

function Capabilities() {
  return <section className="border-b border-[var(--mb-neutral-200)] bg-white">
    <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <SectionIntro eyebrow="Trois capacités" title="Une infrastructure de coordination, pas une collection d’écrans." text="Le Pilotage donne la maîtrise nationale, l’Atlas donne le contexte territorial et les Communautés donnent le sens et la valeur finançable." />
      <div className="mt-10 grid gap-px bg-[var(--mb-neutral-200)] lg:grid-cols-3">{capabilities.map(([title, text], index) => <article key={title} className="min-h-56 bg-white p-6"><span className="font-mono text-[10px] text-[var(--mb-ocean-600)]">0{index + 1}</span><h3 className="mt-12 text-[22px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-4 text-[13px] leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}</div>
    </div>
  </section>;
}

function Demonstrations() {
  return <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
    <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <SectionIntro dark eyebrow="Deux démonstrations" title="La capacité d’agir et la capacité de créer de la valeur." text="Deux scénarios courts montrent la continuité entre terrain, coordination, financement et décision." />
      <div className="mt-10 grid gap-px bg-white/15 lg:grid-cols-2"><article className="bg-[var(--mb-navy-900)] p-6"><p className="font-mono text-[9px] uppercase text-[var(--mb-ocean-400)]">Kayar · opérationnel</p><h3 className="mt-3 text-[20px] font-semibold">Vérifier, décider, documenter.</h3><ol className="mt-6 border-t border-white/15">{kayarJourney.map(([number, title]) => <li key={number} className="flex gap-3 border-b border-white/15 py-3"><span className="font-mono text-[9px] text-[var(--mb-ocean-400)]">{number}</span><strong className="text-[12px]">{title}</strong></li>)}</ol></article><article className="bg-[var(--mb-navy-900)] p-6"><p className="font-mono text-[9px] uppercase text-[var(--mb-ocean-400)]">Joal–Mbour · communautaire & financier</p><h3 className="mt-3 text-[20px] font-semibold">Du besoin de froid au dossier finançable.</h3><ol className="mt-6 border-t border-white/15">{["Besoin remonté par les communautés", "Qualification et preuves", "Programme Joal–Mbour", "680 bénéficiaires et impact", "Budget et partenaire compatible", "Dossier prêt à relire"].map((item, index) => <li key={item} className="flex gap-3 border-b border-white/15 py-3"><span className="font-mono text-[9px] text-[var(--mb-ocean-400)]">0{index + 1}</span><strong className="text-[12px]">{item}</strong></li>)}</ol></article></div>
    </div>
  </section>;
}

function Benefits() {
  return <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]">
    <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <SectionIntro eyebrow="Ce que le Ministère gagne" title="Une coordination lisible, traçable et transmissible." text="Mbàmbulaan n’automatise pas la décision publique : il prépare les éléments nécessaires à une validation humaine." />
      <div className="mt-10 grid gap-px bg-[var(--mb-neutral-200)] md:grid-cols-2 lg:grid-cols-4">{benefits.map(([title, text], index) => <article key={title} className="min-h-48 bg-white p-5"><span className="font-mono text-[9px] text-[var(--mb-ocean-600)]">0{index + 1}</span><h3 className="mt-8 text-[18px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-3 text-[13px] leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}</div>
    </div>
  </section>;
}

function FinalCta() {
  return <section className="bg-white">
    <div className="mx-auto flex max-w-[84rem] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:px-10 lg:py-20">
      <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Prochaine étape</p><h2 className="mt-4 max-w-3xl text-[32px] font-semibold leading-tight text-[var(--mb-navy-900)]">Cadrer un pilote autour d’un territoire, de ses relais et de ses décisions prioritaires.</h2></div>
      <div className="flex flex-col gap-3 sm:flex-row"><Link href="/demande-demo" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">Demander un atelier de cadrage</Link><Link href="/espace-prive/etat" className="inline-flex h-11 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-200)] px-5 text-[11px] font-bold text-[var(--mb-navy-900)]">Voir la démonstration</Link></div>
    </div>
    <footer className="border-t border-[var(--mb-neutral-200)] px-5 py-5 text-center text-[10px] text-[var(--mb-neutral-400)]">© 2026 Mbàmbulaan · Démonstration sur données locales simulées</footer>
  </section>;
}

function SectionIntro({ eyebrow, title, text, dark = false }: { eyebrow: string; title: string; text: string; dark?: boolean }) {
  return <div className="max-w-2xl"><p className={`font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${dark ? "text-[var(--mb-ocean-400)]" : "text-[var(--mb-ocean-600)]"}`}>{eyebrow}</p><h2 className={`mt-4 text-[30px] font-semibold leading-tight ${dark ? "text-white" : "text-[var(--mb-navy-900)]"}`}>{title}</h2><p className={`mt-4 text-[13px] leading-6 ${dark ? "text-white/60" : "text-[var(--mb-neutral-600)]"}`}>{text}</p></div>;
}
