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
  ["01", "Atlas maritime", "Observer l’activité littorale et maritime", "Départs, retours, débarquements, alertes et vérifications terrain dans une lecture cartographique claire.", "Cellules territoriales et directions techniques", "Où faut-il vérifier ou intervenir ?", "Rapport de zone horodaté"],
  ["02", "Filière & Financement", "Transformer les besoins en dossiers finançables", "Les besoins sont qualifiés, chiffrés, rapprochés de partenaires et préparés pour transmission.", "Organisations, programmes et partenaires", "Quel besoin est prêt à être financé ?", "Dossier de financement"],
  ["03", "Pilotage institutionnel", "Aider le ministère à décider", "Situation nationale, arbitrages, blocages, financements en cours et documents prêts à transmettre.", "Ministère et partenaires institutionnels", "Quelle action prioriser et documenter ?", "Note institutionnelle"],
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
  ["Traçabilité exploitable", "Les vérifications et pièces restent reliées aux objets métier."],
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
      <FishingCycle />
      <ModuleValue />
      <InstitutionalOutputs />
      <MinistryValue />
      <ValueChain />
      <DemoNarrative />
      <FinalCallToAction />
    </main>
  );
}

function PublicHeader() {
  return (
    <header className="relative z-50 border-b border-[var(--mb-ocean-600)]/15 bg-white/95 text-[var(--mb-navy-900)] backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[88rem] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Accueil Mbàmbulaan">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[4px] bg-[var(--mb-sand-300)] text-[12px] font-black text-[var(--mb-navy-900)]">Mb</span>
          <span className="min-w-0"><strong className="block text-[17px]">Mbàmbulaan</strong><span className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)] sm:block">Coordination maritime nationale</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[var(--mb-neutral-600)] md:flex" aria-label="Navigation publique">
          <a href="#cycle" className="hover:text-[var(--mb-navy-900)]">Le cycle</a>
          <a href="#espaces" className="hover:text-[var(--mb-navy-900)]">Les espaces</a>
          <a href="#preuves" className="hover:text-[var(--mb-navy-900)]">Les preuves</a>
          <a href="#valeur" className="hover:text-[var(--mb-navy-900)]">Valeur institutionnelle</a>
        </nav>
        <Link href="/espace-prive" className="inline-flex h-10 shrink-0 items-center rounded-[3px] border border-[var(--mb-ocean-600)]/25 bg-[var(--mb-foam)] px-4 text-[13px] font-bold text-[var(--mb-navy-900)] transition-colors hover:bg-white">Accès privé</Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative bg-[linear-gradient(135deg,#f7faf9_0%,#e8f5f7_44%,#d4edf2_100%)] text-[var(--mb-navy-900)]">
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(42,128,153,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(42,128,153,.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative mx-auto grid max-w-[88rem] gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[minmax(0,.82fr)_minmax(34rem,1.18fr)] lg:items-center lg:px-12 lg:pb-20 lg:pt-20">
        <div className="max-w-3xl">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--mb-ocean-600)]">Infrastructure nationale de coordination</p>
          <h1 className="mt-5 text-[clamp(3rem,5.2vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--mb-navy-900)]">La salle de contrôle numérique de la pêche artisanale sénégalaise</h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-8 text-[var(--mb-neutral-700)] sm:text-[20px]">Mbàmbulaan rend visible tout le cycle de la pêche : départs, activité en mer, retours, débarquements, besoins de la filière, financements et décisions institutionnelles.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/espace-prive/etat" className="inline-flex h-13 items-center justify-center gap-3 rounded-[3px] bg-[var(--mb-navy-700)] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[var(--mb-ocean-600)]">Découvrir la console <span aria-hidden="true">→</span></Link>
            <a href="#valeur" className="inline-flex h-13 items-center justify-center rounded-[3px] border border-[var(--mb-ocean-600)]/30 bg-white px-6 text-[14px] font-bold text-[var(--mb-navy-900)] transition-colors hover:bg-[var(--mb-foam)]">Voir la promesse ministère</a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--mb-ocean-600)]/18 pt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]"><span>Cycle suivi de bout en bout</span><span>Validation humaine</span><span>Documents transmissibles</span></div>
        </div>
        <MaritimeConsolePreview />
      </div>
    </section>
  );
}

function MaritimeConsolePreview() {
  const markers = [["Joal", "42%", "73%", "bg-[var(--mb-amber-500)]"], ["Mbour", "46%", "48%", "bg-[var(--mb-green-600)]"], ["Kayar", "43%", "27%", "bg-[var(--mb-red-600)]"]];
  return (
    <div className="relative min-w-0 border border-[var(--mb-ocean-600)]/18 bg-white p-2 shadow-[0_30px_70px_rgba(16,47,75,.16)]">
      <div className="flex h-12 items-center justify-between border-b border-[var(--mb-neutral-200)] px-3"><span className="text-[13px] font-semibold text-[var(--mb-navy-900)]">Situation maritime nationale</span><span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--mb-neutral-500)]"><span className="h-2 w-2 rounded-full bg-[var(--mb-green-600)]" /> SYNCHRONISÉE · 10:45</span></div>
      <div className="grid min-h-[410px] min-w-0 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="relative min-h-[330px] overflow-hidden border-b border-[var(--mb-neutral-200)] bg-[linear-gradient(90deg,#f6f3ea_0%,#f6f3ea_36%,#e8d7b8_36%,#e8d7b8_44%,#89c6d1_44%,#3f93aa_68%,#1f5874_100%)] md:border-b-0 md:border-r">
          <div className="absolute inset-y-0 right-0 w-[56%] opacity-25 [background-image:linear-gradient(rgba(255,255,255,.32)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute left-3 top-3 flex gap-2 rounded-[2px] bg-white/92 px-2.5 py-2 font-mono text-[9px] font-bold text-[var(--mb-neutral-700)] shadow-sm"><span>TERRE</span><span className="text-[#9a712f]">PLAGE</span><span className="text-[var(--mb-ocean-600)]">MER</span></div>
          {markers.map(([label, left, top, tone]) => <div key={label} className="absolute flex items-center gap-2" style={{ left, top }}><span className={`h-3.5 w-3.5 rotate-45 border-2 border-white ${tone}`} /><span className="bg-white/95 px-2 py-1 font-mono text-[9px] font-bold text-[var(--mb-navy-900)] shadow-sm">{label}</span></div>)}
          <div className="absolute left-[69%] top-[38%] border border-white bg-[var(--mb-ocean-600)] px-2 py-1.5 font-mono text-[9px] font-bold text-white">◢ DK-2147</div>
          <div className="absolute left-[58%] top-[59%] border border-white/80 bg-white/95 px-2 py-1.5 font-mono text-[9px] font-bold text-[var(--mb-navy-700)]">◢ TH-0892</div>
          <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 divide-x divide-[var(--mb-neutral-200)] border border-white/70 bg-white/92 text-center shadow-sm"><PreviewMetric value="323" label="Pirogues" /><PreviewMetric value="8" label="Quais" /><PreviewMetric value="47,8 t" label="Débarqué" /><PreviewMetric value="3" label="Alertes" /></div>
        </div>
        <div className="grid content-start bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
          <PreviewSide title="Décision prioritaire" text="Vérifier le retour attendu à Kayar avant 14h30." tag="VALIDATION TERRAIN REQUISE" />
          <PreviewSide title="Signal de financement" text="Chaîne du froid · Joal" helper="Maturité du dossier · 72 %" />
          <div className="p-4"><p className="font-mono text-[10px] uppercase text-[var(--mb-neutral-500)]">Document prêt</p><div className="mt-2 border-l-2 border-[var(--mb-green-600)] bg-white p-3"><p className="text-[13px] font-semibold">Note au Ministre</p><p className="mt-1 text-[11px] leading-4 text-[var(--mb-neutral-600)]">Situation nationale · sources et preuves consolidées.</p></div></div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden w-56 border border-[var(--mb-neutral-200)] bg-white p-4 text-[var(--mb-neutral-900)] shadow-[0_18px_45px_rgba(16,47,75,.18)] xl:block"><p className="font-mono text-[10px] uppercase text-[var(--mb-green-600)]">Preuve générée</p><p className="mt-1 text-[13px] font-semibold">Vérification terrain · JOAL-042</p><p className="mt-1 text-[11px] text-[var(--mb-neutral-600)]">Validée par un agent · 10:42</p></div>
    </div>
  );
}

function PreviewSide({ title, text, tag, helper }: { title: string; text: string; tag?: string; helper?: string }) {
  return <div className="border-b border-[var(--mb-neutral-200)] p-4"><p className="font-mono text-[10px] uppercase text-[var(--mb-ocean-600)]">{title}</p><p className="mt-1 text-[14px] font-semibold leading-5 text-[var(--mb-navy-900)]">{text}</p>{tag ? <span className="mt-2 inline-flex rounded-[2px] bg-[var(--mb-amber-500)]/10 px-2 py-1 text-[10px] font-bold text-[#805817]">{tag}</span> : null}{helper ? <><div className="mt-3 h-2 bg-[var(--mb-neutral-200)]"><div className="h-full w-[72%] bg-[var(--mb-ocean-600)]" /></div><p className="mt-1 text-[11px] text-[var(--mb-neutral-600)]">{helper}</p></> : null}</div>;
}

function PreviewMetric({ value, label }: { value: string; label: string }) {
  return <div className="px-1 py-2"><strong className="block font-mono text-[13px] text-[var(--mb-navy-900)]">{value}</strong><span className="mt-0.5 block text-[9px] text-[var(--mb-neutral-600)]">{label}</span></div>;
}

function FishingCycle() {
  return <section id="cycle" className="scroll-mt-16 border-b border-[var(--mb-neutral-200)] bg-white"><div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"><SectionIntroduction eyebrow="Le fonctionnement" title="Un cycle complet, enfin visible" text="Du premier signal au document transmis, chaque étape reste reliée à son territoire, son acteur et sa preuve." /><ol className="mt-10 grid border border-[var(--mb-neutral-200)] sm:grid-cols-2 lg:grid-cols-4">{cycle.map(([label, description], index) => <li key={label} className="relative min-h-40 border-b border-r border-[var(--mb-neutral-200)] p-5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(n+5)]:border-b-0"><div className="flex items-center justify-between"><span className="font-mono text-[11px] text-[var(--mb-ocean-600)]">0{index + 1}</span><span className={`h-2.5 w-2.5 rounded-full ${index < 5 ? "bg-[var(--mb-ocean-400)]" : index < 7 ? "bg-[var(--mb-green-600)]" : "bg-[var(--mb-sand-300)]"}`} /></div><h3 className="mt-7 text-[17px] font-semibold text-[var(--mb-navy-900)]">{label}</h3><p className="mt-2 text-[14px] leading-6 text-[var(--mb-neutral-600)]">{description}</p></li>)}</ol></div></section>;
}

function ModuleValue() {
  return <section id="espaces" className="scroll-mt-16 bg-[var(--mb-offwhite)]"><div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><SectionIntroduction eyebrow="La console" title="Trois espaces pour coordonner la filière" text="Chaque espace répond à une question institutionnelle et produit un résultat directement exploitable." /><div className="mt-10 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)]">{modules.map(([code, title, promise, description, user, decision, output]) => <article key={code} className="grid gap-7 py-10 lg:grid-cols-[4rem_minmax(0,.8fr)_minmax(25rem,1.2fr)] lg:items-center"><span className="font-mono text-[13px] text-[var(--mb-ocean-600)]">{code}</span><div><p className="text-[12px] font-bold uppercase tracking-[0.11em] text-[var(--mb-neutral-600)]">{title}</p><h3 className="mt-2 text-[28px] font-semibold text-[var(--mb-navy-900)]">{promise}</h3><p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">{description}</p></div><div className="grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-3"><ModuleFact label="Utilisé par" value={user} /><ModuleFact label="Décision" value={decision} /><ModuleFact label="Produit" value={output} accent /></div></article>)}</div></div></section>;
}

function ModuleFact({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={`min-h-32 p-5 ${accent ? "bg-[var(--mb-foam)]" : "bg-white"}`}><p className="font-mono text-[10px] uppercase text-[var(--mb-neutral-500)]">{label}</p><p className="mt-3 text-[14px] font-semibold leading-6 text-[var(--mb-navy-900)]">{value}</p></div>;
}

function InstitutionalOutputs() {
  return <section id="preuves" className="scroll-mt-16 bg-[linear-gradient(135deg,#eef8f8_0%,#dff0f2_100%)] text-[var(--mb-navy-900)]"><div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><SectionIntroduction eyebrow="Des résultats tangibles" title="Ce que Mbàmbulaan produit" text="Des documents reliés aux informations terrain, aux validations humaines et aux décisions prises." /><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{outputs.map(([type, perimeter, date, source, description]) => <article key={type} className="flex min-h-80 flex-col border border-[var(--mb-ocean-600)]/16 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="font-mono text-[10px] uppercase text-[var(--mb-ocean-600)]">Document institutionnel</span><span className="h-2.5 w-2.5 bg-[var(--mb-green-600)]" /></div><h3 className="mt-8 text-[22px] font-semibold text-[var(--mb-navy-900)]">{type}</h3><p className="mt-2 text-[14px] font-semibold text-[#936b2b]">{perimeter}</p><p className="mt-4 text-[14px] leading-6 text-[var(--mb-neutral-600)]">{description}</p><dl className="mt-auto border-t border-[var(--mb-neutral-200)] pt-4 text-[12px]"><div className="flex justify-between gap-3"><dt className="text-[var(--mb-neutral-500)]">Date</dt><dd className="font-mono text-[var(--mb-neutral-700)]">{date}</dd></div><div className="mt-2 flex justify-between gap-3"><dt className="text-[var(--mb-neutral-500)]">Source</dt><dd className="text-right text-[var(--mb-neutral-700)]">{source}</dd></div></dl></article>)}</div><div className="mt-8"><Link href="/espace-prive/etat" className="inline-flex h-12 items-center gap-3 rounded-[3px] border border-[var(--mb-ocean-600)]/30 bg-white px-5 text-[14px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">Voir un parcours avec preuve <span aria-hidden="true">→</span></Link></div></div></section>;
}

function MinistryValue() {
  return <section id="valeur" className="scroll-mt-16 bg-white"><div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(20rem,.72fr)_minmax(0,1.28fr)] lg:px-12 lg:py-24"><div><SectionIntroduction eyebrow="Valeur pour le ministère" title="Décider à partir d’une situation documentée" text="Mbàmbulaan relie la lecture nationale, les besoins territoriaux et les pièces nécessaires à l’action publique." /><blockquote className="mt-8 border-l-2 border-[var(--mb-ocean-600)] pl-5 text-[19px] font-semibold leading-8 text-[var(--mb-navy-900)]">Mbàmbulaan ne remplace pas les acteurs de la filière. Il les coordonne, fiabilise l’information et transforme les signaux en décisions exploitables.</blockquote></div><div className="grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2">{ministryValues.map(([title, text], index) => <article key={title} className="min-h-40 bg-[var(--mb-offwhite)] p-6"><span className="font-mono text-[11px] text-[var(--mb-ocean-600)]">0{index + 1}</span><h3 className="mt-4 text-[17px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-2 text-[14px] leading-6 text-[var(--mb-neutral-600)]">{text}</p></article>)}</div></div></section>;
}

function ValueChain() {
  return <section className="border-y border-[var(--mb-neutral-200)] bg-[var(--mb-foam)]"><div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,.7fr)] lg:items-center lg:px-12"><div><p className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Valeur pour la filière</p><h2 className="mt-4 max-w-3xl text-[38px] font-semibold leading-tight text-[var(--mb-navy-900)]">Rendre visibles les besoins, les preuves d’impact et les opportunités de financement.</h2><p className="mt-5 max-w-2xl text-[16px] leading-8 text-[var(--mb-neutral-600)]">La coordination commence avec les acteurs et leurs réalités. Les informations qualifiées servent ensuite les programmes, les partenaires et les décisions publiques.</p></div><div className="flex flex-wrap gap-2">{actors.map((actor) => <span key={actor} className="rounded-[2px] border border-[var(--mb-ocean-600)]/20 bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--mb-navy-700)]">{actor}</span>)}</div></div></section>;
}

function DemoNarrative() {
  const steps = ["Observer une situation sur l’Atlas", "Lancer une vérification terrain", "Qualifier un besoin", "Constituer un dossier de financement", "Générer une note institutionnelle"];
  return <section className="bg-[var(--mb-offwhite)]"><div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="grid gap-10 lg:grid-cols-[minmax(18rem,.55fr)_minmax(0,1.45fr)]"><SectionIntroduction eyebrow="Parcours guidé" title="Démonstration en 3 minutes" text="Un scénario court montre comment une information devient une preuve puis une décision institutionnelle." /><ol className="border-t border-[var(--mb-neutral-200)]">{steps.map((step, index) => <li key={step} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--mb-neutral-200)] py-5"><span className="font-mono text-[12px] text-[var(--mb-ocean-600)]">0{index + 1}</span><span className="text-[16px] font-semibold text-[var(--mb-navy-900)]">{step}</span><span className="hidden font-mono text-[10px] uppercase text-[var(--mb-neutral-500)] sm:block">Action → preuve</span></li>)}</ol></div><Link href="/espace-prive/etat" className="mt-10 inline-flex h-13 items-center gap-3 rounded-[3px] bg-[var(--mb-navy-700)] px-6 text-[14px] font-bold text-white hover:bg-[var(--mb-ocean-600)]">Entrer dans la console <span aria-hidden="true">→</span></Link></div></section>;
}

function FinalCallToAction() {
  return <section className="border-t border-[var(--mb-ocean-600)]/15 bg-[linear-gradient(135deg,#dff0f2_0%,#f8fbfa_100%)] text-[var(--mb-navy-900)]"><div className="mx-auto flex max-w-[88rem] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:px-12 lg:py-20"><div><p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Mbàmbulaan · Sénégal</p><h2 className="mt-4 max-w-3xl text-[38px] font-semibold leading-tight">Prêt à voir comment Mbàmbulaan peut structurer la coordination de la pêche artisanale ?</h2></div><div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Link href="/espace-prive/etat" className="inline-flex h-12 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[14px] font-bold text-white hover:bg-[var(--mb-ocean-600)]">Ouvrir la console</Link><Link href="/espace-prive" className="inline-flex h-12 items-center justify-center rounded-[3px] border border-[var(--mb-ocean-600)]/30 bg-white px-5 text-[14px] font-bold hover:bg-[var(--mb-foam)]">Accéder à l’espace privé</Link></div></div></section>;
}

function SectionIntroduction({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="max-w-2xl"><p className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">{eyebrow}</p><h2 className="mt-4 text-[38px] font-semibold leading-tight text-[var(--mb-navy-900)]">{title}</h2><p className="mt-4 text-[16px] leading-8 text-[var(--mb-neutral-600)]">{text}</p></div>;
}
