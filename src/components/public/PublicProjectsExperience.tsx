import Link from "next/link";
import { publicPrograms } from "@/data/publicEditorialContent";
import { PublicSiteHeader } from "./PublicSiteHeader";

const contributionProfiles = [
  {
    title: "Acteurs de terrain",
    text: "Faire connaître un besoin, une solution locale ou une initiative qui mérite davantage de visibilité.",
  },
  {
    title: "ONG et experts",
    text: "Apporter une méthode, une compétence, une ressource ou un retour d’expérience utile.",
  },
  {
    title: "Partenaires et philanthropes",
    text: "Soutenir une action, ouvrir un réseau ou étudier une possibilité de partenariat.",
  },
  {
    title: "Institutions et collectivités",
    text: "Relayer une priorité, connecter une initiative à un dispositif ou faciliter la coordination locale.",
  },
];

export function PublicProjectsExperience() {
  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicSiteHeader />

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.48fr)] lg:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Projets & contributions</p>
              <h1 className="mt-3 text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-[var(--mb-navy-900)]">
                Des initiatives à rejoindre et à faire grandir
              </h1>
              <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">
                Découvrez les besoins exprimés, les contributions recherchées et ce que chaque projet peut apporter aux acteurs concernés.
              </p>
            </div>
            <div className="border-l-2 border-[var(--mb-sand-300)] bg-[var(--mb-offwhite)] p-5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Votre point d’entrée</p>
              <h2 className="mt-2 text-[18px] font-semibold text-[var(--mb-navy-900)]">Rejoindre, soutenir ou proposer</h2>
              <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Chaque fiche indique le besoin, la contribution attendue et le bénéfice recherché.</p>
              <Link href="/contact" className="mt-5 inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[11px] font-bold text-white">Proposer une contribution</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">À chacun sa manière de contribuer</p><h2 className="mt-2 text-[20px] font-semibold">Trouvez rapidement votre place</h2></div>
            <span className="hidden text-[9px] text-white/45 sm:block">Faites défiler sur mobile →</span>
          </div>
          <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
            {contributionProfiles.map((profile) => (
              <article key={profile.title} className="min-w-[17rem] snap-start border border-white/10 bg-white/[0.03] p-5 md:min-w-0">
                <h3 className="text-[15px] font-semibold">{profile.title}</h3>
                <p className="mt-3 text-[10px] leading-5 text-white/60">{profile.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Initiatives ouvertes</p>
            <h2 className="mt-2 text-[clamp(1.45rem,3vw,2rem)] font-semibold leading-tight text-[var(--mb-navy-900)]">Ce qui est recherché, en un coup d’œil</h2>
          </div>

          <div className="mt-7 grid gap-5">
            {publicPrograms.map((project) => (
              <article key={project.id} className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-400)]"><span>{project.territory}</span><span>·</span><span>{project.theme}</span></div>
                <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div>
                    <h3 className="text-[20px] font-semibold text-[var(--mb-navy-900)]">{project.title}</h3>
                    <p className="mt-3 max-w-3xl text-[11px] leading-5 text-[var(--mb-neutral-600)]">{project.summary}</p>
                  </div>
                  <span className="w-fit border border-[var(--mb-neutral-300)] bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-600)]">{project.status}</span>
                </div>
                <div className="mt-5 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-3">
                  <div className="bg-white p-4"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Le besoin</p><p className="mt-2 text-[10px] leading-5">{project.sought}</p></div>
                  <div className="bg-white p-4"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Comment contribuer</p><p className="mt-2 text-[10px] leading-5">{project.contribution}</p></div>
                  <div className="bg-white p-4"><p className="font-mono text-[8px] font-bold uppercase text-[var(--mb-ocean-600)]">Ce que cela peut apporter</p><p className="mt-2 text-[10px] leading-5">{project.benefit}</p></div>
                </div>
                <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-[9px] leading-4 text-[var(--mb-neutral-500)]">Un premier échange permet de vérifier les conditions et les prochaines étapes.</p>
                  <Link href="/contact" className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Je souhaite contribuer →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--mb-offwhite)]">
        <div className="mx-auto grid max-w-[84rem] gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-10 lg:py-16">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Une autre initiative ?</p>
            <h2 className="mt-2 text-[clamp(1.4rem,3vw,1.9rem)] font-semibold leading-tight text-[var(--mb-navy-900)]">Présentez-la simplement</h2>
            <p className="mt-3 max-w-2xl text-[12px] leading-6 text-[var(--mb-neutral-600)]">Partagez son contexte, les acteurs concernés, ce qui existe déjà et l’aide recherchée.</p>
          </div>
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">Présenter une initiative</Link>
        </div>
      </section>
    </main>
  );
}
