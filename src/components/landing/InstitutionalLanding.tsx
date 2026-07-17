import Link from "next/link";

const cycle = [
  ["Préparation", "La sortie est préparée au quai."],
  ["Départ", "Les sorties deviennent visibles."],
  ["En mer", "L’activité est suivie par zone."],
  ["Retour", "Les retours attendus sont signalés."],
  ["Débarquement", "Volumes et espèces sont consolidés."],
  ["Déclaration", "Le signal terrain est qualifié."],
  ["Preuve", "La vérification devient exploitable."],
  ["Décision", "Une action documentée peut être engagée."],
];

const modules = [
  {
    code: "01",
    title: "Atlas maritime",
    promise: "Observer l’activité littorale et maritime",
    description: "Départs, retours, débarquements, alertes et vérifications terrain dans une lecture cartographique claire.",
    user: "Cellules territoriales et directions techniques",
    decision: "Où faut-il vérifier ou intervenir ?",
    output: "Rapport de zone horodaté",
    visual: "atlas",
  },
  {
    code: "02",
    title: "Filière & Financement",
    promise: "Transformer les besoins en dossiers finançables",
    description: "Les besoins sont qualifiés, chiffrés, rapprochés de partenaires et préparés pour transmission.",
    user: "Organisations, programmes et partenaires",
    decision: "Quel besoin est prêt à être financé ?",
    output: "Dossier de financement",
    visual: "funding",
  },
  {
    code: "03",
    title: "Pilotage institutionnel",
    promise: "Aider le ministère à décider",
    description: "Situation nationale, arbitrages, blocages, financements en cours et documents prêts à transmettre.",
    user: "Ministère et partenaires institutionnels",
    decision: "Quelle action prioriser et documenter ?",
    output: "Note institutionnelle",
    visual: "steering",
  },
];

const outputs = [
  ["Rapport de zone", "Littoral de Joal-Fadiouth", "15 juillet 2026", "Cellule territoriale", "Situation, événements et alertes du périmètre sélectionné."],
  ["Preuve de vérification", "Débarquement · JOAL-042", "15 juillet 2026", "Agent habilité", "Constat terrain horodaté, source et validation humaine."],
  ["Dossier de financement", "Chaîne du froid communautaire", "T3 2026", "Programme Petite-Côte", "Besoin qualifié, montant, bénéficiaires et pièces disponibles."],
  ["Note au Ministre", "Situation maritime nationale", "15 juillet 2026", "Direction de la pêche", "Synthèse, blocages, arbitrages et décisions proposées."],
];

const ministryValues = [
  ["Vision nationale", "Une lecture consolidée des territoires, quais et signaux prioritaires."],
  ["Décisions documentées", "Chaque arbitrage conserve sa source, son responsable et sa prochaine étape."],
  ["Traçabilité exploitable", "Les vérifications et pièces restent reliées aux situations suivies."],
  ["Financements structurés", "Les besoins qualifiés deviennent des dossiers transmissibles."],
  ["Filière valorisée", "Les acteurs et besoins terrain deviennent visibles sans être remplacés."],
  ["Preuves transmissibles", "Les partenaires reçoivent des documents lisibles et vérifiables."],
];

const actors = ["Pêcheurs", "Quais", "Mareyeurs", "Transformatrices", "Organisations professionnelles", "Programmes", "Partenaires", "Bailleurs"];

export function InstitutionalLanding() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicHeader />
      <Hero />
      <SystemObserves />
      <DataMaturity />
      <FishingCycle />
      <ModuleValue />
      <InstitutionalOutputs />
      <MinistryValue />
      <ValueChain />
      <FundingRationale />
      <DemoNarrative />
      <FinalCallToAction />
    </main>
  );
}

function PublicHeader() {
  return (
    <header className="relative z-50 border-b border-[var(--mb-neutral-200)] bg-white text-[var(--mb-navy-900)]">
      <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Accueil Mbàmbulaan">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[3px] bg-[var(--mb-navy-900)] text-[11px] font-black text-white">Mb</span>
          <span className="min-w-0"><strong className="block text-[15px]">Mbàmbulaan</strong><span className="hidden text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)] sm:block">Coordination maritime nationale</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[var(--mb-neutral-600)] md:flex" aria-label="Navigation publique">
          <a href="#cycle" className="hover:text-[var(--mb-navy-900)]">Le cycle</a>
          <a href="#espaces" className="hover:text-[var(--mb-navy-900)]">Les espaces</a>
          <a href="#preuves" className="hover:text-[var(--mb-navy-900)]">Les preuves</a>
          <a href="#valeur" className="hover:text-[var(--mb-navy-900)]">Valeur institutionnelle</a>
        </nav>
        <Link href="/espace-prive" className="inline-flex h-9 shrink-0 items-center rounded-[3px] border border-[var(--mb-neutral-200)] px-3 text-[12px] font-bold transition-colors hover:bg-[var(--mb-offwhite)]">Accès privé</Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(42,111,142,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(42,111,142,.05)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative mx-auto grid max-w-[88rem] gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[minmax(0,.84fr)_minmax(36rem,1.16fr)] lg:items-center lg:px-12 lg:pb-20 lg:pt-20">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mb-ocean-400)]">Infrastructure nationale de coordination</p>
          <h1 className="mt-5 text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--mb-navy-900)]">La salle de contrôle numérique de la pêche artisanale sénégalaise</h1>
          <p className="mt-7 max-w-xl text-[15px] leading-7 text-[var(--mb-neutral-600)] sm:text-[17px]">Mbàmbulaan transforme progressivement les signaux terrain en informations déclarées, vérifiées puis consolidées pour la décision, le financement et la preuve.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/espace-prive/etat" className="inline-flex h-12 items-center justify-center gap-3 rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[12px] font-bold text-white transition-colors hover:bg-[var(--mb-navy-900)]">Découvrir la console <span aria-hidden="true">→</span></Link>
            <a href="#valeur" className="inline-flex h-12 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-5 text-[12px] font-bold text-[var(--mb-navy-900)] transition-colors hover:bg-[var(--mb-foam)]">Voir la promesse ministère</a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--mb-neutral-200)] pt-5 font-mono text-[10px] uppercase tracking-[0.07em] text-[var(--mb-neutral-400)]"><span>Cycle suivi de bout en bout</span><span>Validation humaine</span><span>Documents transmissibles</span></div>
        </div>
        <MaritimeConsolePreview />
      </div>
    </section>
  );
}

function MaritimeConsolePreview() {
  const markers = [
    ["Joal", "42%", "73%", "bg-[var(--mb-amber-500)]"],
    ["Mbour", "46%", "48%", "bg-[var(--mb-green-600)]"],
    ["Kayar", "43%", "27%", "bg-[var(--mb-red-600)]"],
  ];
  return (
    <div className="relative min-w-0 border border-white/15 bg-[#0d263d] p-2 shadow-[0_30px_70px_rgba(0,0,0,.28)]">
      <div className="flex h-10 items-center justify-between border-b border-white/10 px-3"><span className="text-[10px] font-semibold">Situation maritime nationale</span><span className="inline-flex items-center gap-1.5 font-mono text-[8px] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-[var(--mb-green-600)]" /> SYNCHRONISÉE · 10:45</span></div>
      <div className="grid min-h-[390px] min-w-0 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="relative min-h-[320px] overflow-hidden border-b border-white/10 bg-[linear-gradient(90deg,#f1eee5_0%,#f1eee5_36%,#e4d9c2_36%,#e4d9c2_43%,#6fa9b8_43%,#2a6f8e_66%,#12314f_100%)] md:border-b-0 md:border-r">
          <div className="absolute inset-y-0 right-0 w-[57%] opacity-25 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="absolute left-3 top-3 flex gap-2 bg-[var(--mb-navy-900)]/90 px-2 py-1.5 font-mono text-[7px] text-white"><span>TERRE</span><span className="text-[var(--mb-sand-300)]">PLAGE</span><span className="text-[var(--mb-ocean-400)]">MER</span></div>
          {markers.map(([label, left, top, tone]) => <div key={label} className="absolute flex items-center gap-2" style={{ left, top }}><span className={`h-3 w-3 rotate-45 border-2 border-white ${tone}`} /><span className="bg-white/95 px-1.5 py-0.5 font-mono text-[7px] font-bold text-[var(--mb-navy-900)]">{label}</span></div>)}
          <div className="absolute left-[69%] top-[38%] border border-white bg-[var(--mb-navy-900)] px-1.5 py-1 font-mono text-[7px] font-bold">◢ DK-2147</div>
          <div className="absolute left-[58%] top-[59%] border border-white/70 bg-white/90 px-1.5 py-1 font-mono text-[7px] font-bold text-[var(--mb-navy-700)]">◢ TH-0892</div>
          <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 divide-x divide-white/10 border border-white/10 bg-[var(--mb-navy-900)]/92 text-center"><PreviewMetric value="323" label="Pirogues" /><PreviewMetric value="8" label="Quais" /><PreviewMetric value="47,8 t" label="Débarqué" /><PreviewMetric value="3" label="Alertes" /></div>
        </div>
        <div className="grid content-start bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
          <div className="border-b border-[var(--mb-neutral-200)] p-3"><p className="font-mono text-[8px] uppercase text-[var(--mb-ocean-600)]">Décision prioritaire</p><p className="mt-1 text-[11px] font-semibold leading-4 text-[var(--mb-navy-900)]">Vérifier le retour attendu à Kayar avant 14h30.</p><span className="mt-2 inline-flex rounded-[2px] bg-[var(--mb-amber-500)]/10 px-2 py-1 text-[8px] font-bold text-[#805817]">VALIDATION TERRAIN REQUISE</span></div>
          <div className="border-b border-[var(--mb-neutral-200)] p-3"><p className="font-mono text-[8px] uppercase text-[var(--mb-neutral-400)]">Signal de financement</p><p className="mt-1 text-[11px] font-semibold">Chaîne du froid · Joal</p><div className="mt-2 h-1.5 bg-[var(--mb-neutral-200)]"><div className="h-full w-[72%] bg-[var(--mb-ocean-600)]" /></div><p className="mt-1 text-[8px] text-[var(--mb-neutral-600)]">Maturité du dossier · 72 %</p></div>
          <div className="p-3"><p className="font-mono text-[8px] uppercase text-[var(--mb-neutral-400)]">Document prêt</p><div className="mt-2 border-l-2 border-[var(--mb-green-600)] bg-white p-2"><p className="text-[10px] font-semibold">Note au Ministre</p><p className="mt-1 text-[8px] leading-3 text-[var(--mb-neutral-600)]">Situation nationale · sources et preuves consolidées.</p></div></div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden w-48 border border-[var(--mb-neutral-200)] bg-white p-3 text-[var(--mb-neutral-900)] shadow-[0_18px_45px_rgba(0,0,0,.18)] xl:block"><p className="font-mono text-[8px] uppercase text-[var(--mb-green-600)]">Preuve générée</p><p className="mt-1 text-[10px] font-semibold">Vérification terrain · JOAL-042</p><p className="mt-1 text-[8px] text-[var(--mb-neutral-600)]">Validée par un agent · 10:42</p></div>
    </div>
  );
}

function PreviewMetric({ value, label }: { value: string; label: string }) {
  return <div className="px-1 py-2"><strong className="block font-mono text-[10px] text-white">{value}</strong><span className="mt-0.5 block text-[7px] text-white/45">{label}</span></div>;
}

function SystemObserves() {
  const observations = [["Quais", "Activité, capacités et signaux locaux"], ["Pirogues", "Cycle de sortie et retours attendus"], ["Débarquements", "Volumes, espèces et statut de déclaration"], ["Situations", "Signalements, incidents qualifiés et alertes"]];
  return <section className="bg-white"><div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(18rem,.6fr)_minmax(0,1.4fr)] lg:px-12"><SectionIntroduction eyebrow="Ce que le système observe" title="Une lecture reliée au terrain" text="Mbàmbulaan ne suppose pas que les données sont automatiquement à jour. Il rend lisibles les informations disponibles, leur origine et leur niveau de confiance." /><div className="grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2">{observations.map(([title, text], index) => <article key={title} className="bg-[var(--mb-offwhite)] p-5"><span className="font-mono text-[10px] text-[var(--mb-ocean-600)]">0{index + 1}</span><h3 className="mt-5 text-[16px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-[14px] leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}</div></div></section>;
}

function DataMaturity() {
  const levels = [["Brute", "Information non vérifiée", "bg-[var(--mb-neutral-400)]"], ["Déclarée", "Acteur identifié, validation en attente", "bg-[var(--mb-amber-500)]"], ["Vérifiée", "Confirmée par un agent ou référent mandaté", "bg-[var(--mb-green-600)]"], ["Consolidée", "Agrégée pour la synthèse officielle", "bg-[var(--mb-ocean-600)]"]];
  const path = [["MVP", "Données de démonstration cohérentes"], ["Pilote", "3 à 5 quais · formulaires et relais WhatsApp"], ["Ministère", "Cellules régionales et application agent"], ["Extensible", "APIs fiables et sources tierces gouvernées"]];
  return <section className="border-y border-[var(--mb-neutral-200)] bg-[var(--mb-foam)]"><div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12"><SectionIntroduction eyebrow="D’où viennent les données" title="Une confiance construite par étapes" text="Aucun signal communautaire n’alimente une décision nationale avant qualification locale ou régionale." /><div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2">{levels.map(([label, helper, tone]) => <div key={label} className="bg-white p-4"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${tone}`} /><strong className="text-[14px] text-[var(--mb-navy-900)]">{label}</strong></div><p className="mt-2 text-[14px] leading-6 text-[var(--mb-neutral-600)]">{helper}</p></div>)}</div><div><ol className="grid border-t border-[var(--mb-neutral-200)]">{path.map(([stage, text], index) => <li key={stage} className="grid grid-cols-[3rem_6rem_minmax(0,1fr)] items-center border-b border-[var(--mb-neutral-200)] py-3"><span className="font-mono text-[10px] text-[var(--mb-ocean-600)]">0{index + 1}</span><strong className="text-[13px] text-[var(--mb-navy-900)]">{stage}</strong><span className="text-[14px] text-[var(--mb-neutral-600)]">{text}</span></li>)}</ol><p className="mt-4 border-l-2 border-[var(--mb-ocean-400)] pl-3 text-[12px] leading-5 text-[var(--mb-neutral-600)]">Le pont WhatsApp du pilote prépare des messages structurés pour les relais terrain. Il ne simule ni réception en direct ni envoi automatique.</p></div></div></div></section>;
}

function FishingCycle() {
  return (
    <section id="cycle" className="scroll-mt-16 border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <SectionIntroduction eyebrow="Le fonctionnement" title="Un cycle complet, enfin visible" text="Du premier signal au document transmis, chaque étape reste reliée à son territoire, son acteur et sa preuve." />
        <ol className="mt-10 grid border border-[var(--mb-neutral-200)] sm:grid-cols-2 lg:grid-cols-4">
          {cycle.map(([label, description], index) => <li key={label} className="relative min-h-36 border-b border-r border-[var(--mb-neutral-200)] p-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(n+5)]:border-b-0"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-[var(--mb-ocean-600)]">0{index + 1}</span><span className={`h-2 w-2 rounded-full ${index < 5 ? "bg-[var(--mb-ocean-400)]" : index < 7 ? "bg-[var(--mb-green-600)]" : "bg-[var(--mb-sand-300)]"}`} /></div><h3 className="mt-7 text-[13px] font-semibold text-[var(--mb-navy-900)]">{label}</h3><p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{description}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

function ModuleValue() {
  return (
    <section id="espaces" className="scroll-mt-16 bg-[var(--mb-offwhite)]">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <SectionIntroduction eyebrow="La console" title="Trois espaces pour coordonner la filière" text="Chaque espace répond à une question institutionnelle et produit un résultat directement exploitable." />
        <div className="mt-10 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)]">
          {modules.map((module) => <article key={module.code} className="grid gap-7 py-9 lg:grid-cols-[4rem_minmax(0,.8fr)_minmax(25rem,1.2fr)] lg:items-center"><span className="font-mono text-[10px] text-[var(--mb-ocean-600)]">{module.code}</span><div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[var(--mb-neutral-600)]">{module.title}</p><h3 className="mt-2 text-[22px] font-semibold text-[var(--mb-navy-900)]">{module.promise}</h3><p className="mt-3 max-w-xl text-[12px] leading-6 text-[var(--mb-neutral-600)]">{module.description}</p></div><div className="grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-3"><ModuleFact label="Utilisé par" value={module.user} /><ModuleFact label="Décision" value={module.decision} /><ModuleFact label="Produit" value={module.output} accent /></div></article>)}
        </div>
      </div>
    </section>
  );
}

function ModuleFact({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={`min-h-28 p-4 ${accent ? "bg-[var(--mb-foam)]" : "bg-white"}`}><p className="font-mono text-[8px] uppercase text-[var(--mb-neutral-400)]">{label}</p><p className="mt-3 text-[11px] font-semibold leading-5 text-[var(--mb-navy-900)]">{value}</p></div>;
}

function InstitutionalOutputs() {
  return (
    <section id="preuves" className="scroll-mt-16 bg-[var(--mb-navy-900)] text-white">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <SectionIntroduction dark eyebrow="Des résultats tangibles" title="Ce que Mbàmbulaan produit" text="Des documents reliés aux informations terrain, aux validations humaines et aux décisions prises. Chaque document généré alimente un registre de suivi et reste distinct de sa transmission externe." />
        <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{outputs.map(([type, perimeter, date, source, description]) => <article key={type} className="flex min-h-72 flex-col border border-white/12 bg-white/[0.045] p-5"><div className="flex items-start justify-between gap-3"><span className="font-mono text-[8px] uppercase text-[var(--mb-ocean-400)]">Document institutionnel</span><span className="h-2 w-2 bg-[var(--mb-green-600)]" /></div><h3 className="mt-8 text-[17px] font-semibold text-white">{type}</h3><p className="mt-2 text-[11px] font-semibold text-[var(--mb-sand-300)]">{perimeter}</p><p className="mt-4 text-[11px] leading-5 text-white/55">{description}</p><dl className="mt-auto border-t border-white/10 pt-4 text-[9px]"><div className="flex justify-between gap-3"><dt className="text-white/35">Date</dt><dd className="font-mono text-white/70">{date}</dd></div><div className="mt-2 flex justify-between gap-3"><dt className="text-white/35">Source</dt><dd className="text-right text-white/70">{source}</dd></div></dl></article>)}</div>
        <div className="mt-8"><Link href="/espace-prive/etat" className="inline-flex h-11 items-center gap-3 rounded-[3px] border border-white/20 px-4 text-[11px] font-bold hover:bg-white/10">Voir un parcours avec preuve <span aria-hidden="true">→</span></Link></div>
      </div>
    </section>
  );
}

function MinistryValue() {
  return (
    <section id="valeur" className="scroll-mt-16 bg-white">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(20rem,.72fr)_minmax(0,1.28fr)] lg:px-12 lg:py-24">
        <div><SectionIntroduction eyebrow="Valeur pour le ministère" title="Décider à partir d’une situation documentée" text="Mbàmbulaan relie la lecture nationale, les besoins territoriaux et les pièces nécessaires à l’action publique." /><blockquote className="mt-8 border-l-2 border-[var(--mb-ocean-600)] pl-5 text-[15px] font-semibold leading-7 text-[var(--mb-navy-900)]">Mbàmbulaan ne remplace pas les acteurs de la filière. Il les coordonne, fiabilise l’information et transforme les signaux en décisions exploitables.</blockquote></div>
        <div className="grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2">{ministryValues.map(([title, text], index) => <article key={title} className="min-h-36 bg-[var(--mb-offwhite)] p-5"><span className="font-mono text-[9px] text-[var(--mb-ocean-600)]">0{index + 1}</span><h3 className="mt-4 text-[13px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{text}</p></article>)}</div>
      </div>
    </section>
  );
}

function ValueChain() {
  const actorValue = [["Ministère", "Arbitrer à partir de synthèses consolidées."], ["Direction régionale", "Qualifier, assigner et produire les rapports de zone."], ["Référent / communauté", "Faire remonter un besoin et suivre sa prise en charge."], ["Partenaire / bailleur", "Recevoir un dossier documenté et suivre son impact."]];
  return (
    <section className="border-y border-[var(--mb-neutral-200)] bg-[var(--mb-foam)]">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12"><div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,.7fr)] lg:items-center"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Ce que chaque acteur gagne</p><h2 className="mt-4 max-w-3xl text-[30px] font-semibold leading-tight text-[var(--mb-navy-900)]">Rendre visibles les besoins, les preuves d’impact et les opportunités de financement.</h2><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">La coordination commence avec les acteurs et leurs réalités. Les informations qualifiées servent ensuite les programmes, les partenaires et les décisions publiques.</p></div><div className="flex flex-wrap gap-2">{actors.map((actor) => <span key={actor} className="rounded-[2px] border border-[var(--mb-ocean-600)]/20 bg-white px-3 py-2 text-[12px] font-semibold text-[var(--mb-navy-700)]">{actor}</span>)}</div></div><div className="mt-10 grid gap-px bg-[var(--mb-neutral-200)] md:grid-cols-2 xl:grid-cols-4">{actorValue.map(([actor, value]) => <article key={actor} className="bg-white p-4"><h3 className="text-[14px] font-semibold text-[var(--mb-navy-900)]">{actor}</h3><p className="mt-2 text-[14px] leading-6 text-[var(--mb-neutral-600)]">{value}</p></article>)}</div></div>
    </section>
  );
}

function FundingRationale() {
  const reasons = [["Gouvernance", "Une chaîne claire entre signal terrain, qualification régionale et décision nationale."], ["Preuve", "Des constats, sources et validations rattachés aux décisions et aux dossiers."], ["Impact", "Des bénéficiaires, montants et résultats suivis au même endroit."], ["Biodiversité", "Les espèces sensibles, saisons et zones éclairent les choix réglementaires."], ["Financement", "Les besoins qualifiés deviennent un portefeuille de dossiers transmissibles."]];
  return <section className="bg-white"><div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(18rem,.55fr)_minmax(0,1.45fr)] lg:px-12 lg:py-24"><SectionIntroduction eyebrow="Pourquoi financer Mbàmbulaan" title="Financer une infrastructure de coordination" text="L’investissement ne finance pas un écran de plus. Il structure la remontée terrain, la confiance des données et la capacité à transformer un besoin en action documentée." /><div className="divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)]">{reasons.map(([title, text], index) => <article key={title} className="grid gap-3 py-4 sm:grid-cols-[3rem_8rem_minmax(0,1fr)]"><span className="font-mono text-[10px] text-[var(--mb-ocean-600)]">0{index + 1}</span><h3 className="text-[14px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="text-[14px] leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}</div></div></section>;
}

function DemoNarrative() {
  const steps = ["Observer une situation sur l’Atlas", "Demander une vérification terrain", "Qualifier un besoin", "Constituer un dossier de financement", "Générer une note institutionnelle"];
  return (
    <section className="bg-[var(--mb-offwhite)]">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,.55fr)_minmax(0,1.45fr)]"><SectionIntroduction eyebrow="Parcours guidé" title="Démonstration en 3 minutes" text="Un scénario court montre comment une information devient une preuve puis une décision institutionnelle." /><ol className="border-t border-[var(--mb-neutral-200)]">{steps.map((step, index) => <li key={step} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--mb-neutral-200)] py-4"><span className="font-mono text-[9px] text-[var(--mb-ocean-600)]">0{index + 1}</span><span className="text-[12px] font-semibold text-[var(--mb-navy-900)]">{step}</span><span className="hidden font-mono text-[8px] uppercase text-[var(--mb-neutral-400)] sm:block">Action → preuve</span></li>)}</ol></div>
        <Link href="/espace-prive/etat" className="mt-10 inline-flex h-12 items-center gap-3 rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[12px] font-bold text-white hover:bg-[var(--mb-navy-900)]">Entrer dans la console <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="border-t border-white/10 bg-[var(--mb-navy-900)] text-white"><div className="mx-auto flex max-w-[88rem] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:px-12 lg:py-20"><div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--mb-ocean-400)]">Mbàmbulaan · Sénégal</p><h2 className="mt-4 max-w-3xl text-[30px] font-semibold leading-tight">Prêt à voir comment Mbàmbulaan peut structurer la coordination de la pêche artisanale ?</h2></div><div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Link href="/espace-prive/etat" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-sand-300)] px-5 text-[11px] font-bold text-[var(--mb-navy-900)] hover:bg-white">Ouvrir la console</Link><Link href="/espace-prive" className="inline-flex h-11 items-center justify-center rounded-[3px] border border-white/20 px-5 text-[11px] font-bold hover:bg-white/10">Accéder à l’espace privé</Link></div></div></section>
  );
}

function SectionIntroduction({ eyebrow, title, text, dark = false }: { eyebrow: string; title: string; text: string; dark?: boolean }) {
  return <div className="max-w-2xl"><p className={`font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${dark ? "text-[var(--mb-ocean-400)]" : "text-[var(--mb-ocean-600)]"}`}>{eyebrow}</p><h2 className={`mt-4 text-[30px] font-semibold leading-tight ${dark ? "text-white" : "text-[var(--mb-navy-900)]"}`}>{title}</h2><p className={`mt-4 text-[12px] leading-6 ${dark ? "text-white/55" : "text-[var(--mb-neutral-600)]"}`}>{text}</p></div>;
}
