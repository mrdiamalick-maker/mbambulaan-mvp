import Link from "next/link";

const loop = ["Signal", "Quai", "Dossier", "Preuve", "Décision", "Document"];

const kayarJourney = [
  ["01", "Un écart est signalé", "Le poste de quai rattache l’information à Kayar et au débarquement concerné."],
  ["02", "Une vérification est demandée", "La Direction régionale prépare une demande structurée et identifie le responsable terrain."],
  ["03", "Le constat est validé", "La pièce reçue, sa source et le niveau de confiance restent visibles dans le dossier."],
  ["04", "Une décision est prise", "Le Ministère dispose de la situation, des éléments connus et de la prochaine action."],
  ["05", "Le document est conservé", "Le rapport de zone rejoint le registre pour archivage ou transmission manuelle."],
];

const benefits = [
  ["Voir", "Une situation nationale lisible, reliée aux quais et aux acteurs responsables."],
  ["Coordonner", "Un dossier unique pour savoir qui agit, ce qui manque et ce qui vient ensuite."],
  ["Prouver", "Des sources, constats et niveaux de confiance attachés à chaque décision."],
  ["Transmettre", "Des rapports, notes et dossiers de financement prêts à relire et à partager."],
];

export function InstitutionalLanding() {
  return <main className="min-h-screen overflow-hidden bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <Header />
    <Hero />
    <Problem />
    <CoordinationLoop />
    <KayarUseCase />
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
        <h1 className="mt-6 text-[clamp(2.6rem,5.6vw,5.2rem)] font-semibold leading-[.98] tracking-[-0.02em] text-[var(--mb-navy-900)]">L’information terrain devient décision publique.</h1>
        <p className="mt-7 max-w-2xl text-[16px] leading-7 text-[var(--mb-neutral-600)]">Mbàmbulaan relie les signaux des quais, les dossiers opérationnels, les preuves et les documents attendus par le Ministère.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/demande-demo" className="inline-flex h-12 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[12px] font-bold text-white hover:bg-[var(--mb-navy-900)]">Demander un atelier de cadrage</Link>
          <Link href="/espace-prive/etat" className="inline-flex h-12 items-center justify-center rounded-[3px] border border-[var(--mb-ocean-600)]/30 bg-white px-5 text-[12px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">Voir la démonstration</Link>
        </div>
      </div>
      <div className="border border-[var(--mb-ocean-600)]/20 bg-[var(--mb-navy-900)] p-6 text-white lg:p-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">Cas pilote · Kayar</p>
        <p className="mt-5 text-[24px] font-semibold leading-tight">Un écart de pesée devient un dossier vérifié, une décision et un rapport de zone.</p>
        <dl className="mt-8 grid grid-cols-3 gap-px bg-white/10"><HeroFact value="1" label="Dossier" /><HeroFact value="3" label="Preuves" /><HeroFact value="1" label="Document" /></dl>
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
      <SectionIntro eyebrow="Le problème" title="Les informations existent. Elles ne forment pas encore une chaîne de décision." text="Un signal arrive par plusieurs canaux, change de main et perd souvent son contexte. Mbàmbulaan conserve son origine, son responsable et sa prochaine étape." />
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="border border-[var(--mb-neutral-200)] bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">Aujourd’hui</p><div className="mt-5 flex flex-wrap gap-2">{channels.map((item) => <span key={item} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 py-2 text-[11px] font-semibold">{item}</span>)}</div><p className="mt-5 text-[13px] leading-6 text-[var(--mb-neutral-600)]">Des informations dispersées, des relances difficiles à suivre et des preuves séparées de la décision.</p></article>
        <article className="border border-[var(--mb-ocean-600)]/25 bg-[var(--mb-foam)] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Avec Mbàmbulaan</p><p className="mt-5 text-[22px] font-semibold leading-tight text-[var(--mb-navy-900)]">Une situation devient un dossier opérationnel unique.</p><p className="mt-5 text-[13px] leading-6 text-[var(--mb-neutral-600)]">La chaîne rend visibles la source, le niveau de confiance, l’action attendue, les pièces et la sortie finale.</p></article>
      </div>
    </div>
  </section>;
}

function CoordinationLoop() {
  return <section className="border-b border-[var(--mb-neutral-200)] bg-white">
    <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <SectionIntro eyebrow="La boucle de coordination" title="Du signal au document, sans perdre la preuve." text="Chaque étape prépare la suivante et reste consultable dans le même dossier." />
      <ol className="mt-10 grid border-y border-[var(--mb-neutral-200)] sm:grid-cols-3 lg:grid-cols-6">{loop.map((item, index) => <li key={item} className="relative border-b border-r border-[var(--mb-neutral-200)] p-4 sm:[&:nth-last-child(-n+3)]:border-b-0 lg:border-b-0"><span className="font-mono text-[9px] text-[var(--mb-ocean-600)]">0{index + 1}</span><strong className="mt-8 block text-[14px] text-[var(--mb-navy-900)]">{item}</strong>{index < loop.length - 1 ? <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-[var(--mb-ocean-400)] lg:block">→</span> : null}</li>)}</ol>
    </div>
  </section>;
}

function KayarUseCase() {
  return <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
    <div className="mx-auto grid max-w-[84rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(18rem,.55fr)_minmax(0,1.45fr)] lg:px-10 lg:py-20">
      <SectionIntro dark eyebrow="Cas d’usage pilote" title="Kayar : vérifier, décider, documenter." text="La démonstration suit un seul dossier de bout en bout. Aucune action terminée ne redevient l’action principale." />
      <ol className="border-t border-white/15">{kayarJourney.map(([number, title, text]) => <li key={number} className="grid gap-3 border-b border-white/15 py-4 sm:grid-cols-[3rem_13rem_minmax(0,1fr)]"><span className="font-mono text-[9px] text-[var(--mb-ocean-400)]">{number}</span><strong className="text-[13px]">{title}</strong><span className="text-[12px] leading-5 text-white/60">{text}</span></li>)}</ol>
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
