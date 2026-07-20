import Link from "next/link";
import { publicPrograms } from "@/data/publicEditorialContent";
import { PublicSiteHeader } from "./PublicSiteHeader";

const contributionProfiles = [
  {
    title: "Acteurs de terrain et communautés",
    text: "Faire connaître un besoin, une solution locale, une expérience ou une initiative qui mérite d’être mieux visible.",
  },
  {
    title: "ONG, associations et experts",
    text: "Apporter une méthode, une compétence, une ressource, un accompagnement ou un retour d’expérience utile.",
  },
  {
    title: "Partenaires et philanthropes",
    text: "Soutenir une action, contribuer à un besoin concret, ouvrir un réseau ou étudier une possibilité de partenariat.",
  },
  {
    title: "Institutions et collectivités",
    text: "Relayer une priorité, connecter une initiative à un dispositif existant ou faciliter la coordination locale.",
  },
];

export function PublicProjectsExperience() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicSiteHeader />

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,.9fr)_minmax(24rem,1.1fr)] lg:items-end lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Projets & contributions</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-0.03em] text-[var(--mb-navy-900)]">
              Des besoins concrets, des initiatives visibles et plusieurs façons de contribuer
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">
              Cette page ne présente pas les dossiers internes du Ministère. Elle rend lisibles des initiatives ouvertes, les contributions recherchées et la valeur que chaque projet peut créer pour les acteurs concernés.
            </p>
          </div>
          <div className="border-l-2 border-[var(--mb-sand-300)] bg-[var(--mb-offwhite)] p-5 sm:p-6">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Comment utiliser cette page</p>
            <h2 className="mt-3 text-[20px] font-semibold text-[var(--mb-navy-900)]">Voir, comprendre, rejoindre ou proposer</h2>
            <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Chaque fiche précise le besoin, la contribution attendue et le bénéfice recherché. Aucun engagement ni financement n’est automatique.</p>
            <Link href="/contact" className="mt-5 inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[11px] font-bold text-white">Proposer une contribution</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-[84rem] px-5 py-10 sm:px-8 lg:px-10">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">À chacun sa manière de participer</p>
          <div className="mt-6 grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {contributionProfiles.map((profile) => (
              <article key={profile.title} className="bg-[var(--mb-navy-900)] p-5">
                <h2 className="text-[15px] font-semibold">{profile.title}</h2>
                <p className="mt-3 text-[10px] leading-5 text-white/60">{profile.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Initiatives ouvertes</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight text-[var(--mb-navy-900)]">Comprendre immédiatement ce qui est recherché</h2>
            <p className="mt-4 text-[12px] leading-6 text-[var(--mb-neutral-600)]">Les projets présentés ici sont des exemples publics de mobilisation. Ils ne révèlent ni statuts internes, ni arbitrages, ni mécanismes de décision de la console Ministère.</p>
          </div>

          <div className="mt-9 grid gap-5">
            {publicPrograms.map((project) => (
              <article key={project.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-400)]"><span>{project.territory}</span><span>·</span><span>{project.theme}</span></div>
                <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div>
                    <h3 className="text-[21px] font-semibold text-[var(--mb-navy-900)]">{project.title}</h3>
                    <p className="mt-3 max-w-3xl text-[11px] leading-5 text-[var(--mb-neutral-600)]">{project.summary}</p>
                  </div>
                  <span className="w-fit border border-[var(--mb-neutral-300)] bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-600)]">{project.status}</span>
                </div>
                <div className="mt-6 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-3">
                  <div className="bg-white p-4"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Le besoin</p><p className="mt-2 text-[10px] leading-5">{project.sought}</p></div>
                  <div className="bg-white p-4"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Comment contribuer</p><p className="mt-2 text-[10px] leading-5">{project.contribution}</p></div>
                  <div className="bg-white p-4"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Ce que le projet peut apporter</p><p className="mt-2 text-[10px] leading-5">{project.benefit}</p></div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[9px] leading-4 text-[var(--mb-neutral-500)]">Un premier échange permet de vérifier l’adéquation, les conditions et les prochaines étapes.</p>
                  <Link href="/contact" className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Je souhaite contribuer →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--mb-offwhite)]">
        <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Faire émerger d’autres initiatives</p>
            <h2 className="mt-3 max-w-4xl text-[32px] font-semibold leading-tight text-[var(--mb-navy-900)]">Votre projet n’est pas encore présenté ?</h2>
            <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">Partagez son contexte, les acteurs concernés, ce qui existe déjà et l’aide recherchée. Mbàmbulaan pourra préparer un premier échange sans promettre automatiquement une publication, un partenaire ou un financement.</p>
          </div>
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">Présenter une initiative</Link>
        </div>
      </section>
    </main>
  );
}
