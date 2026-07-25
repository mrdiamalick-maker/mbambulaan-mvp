import Link from "next/link";

const steps = [
  ["01", "Une difficulté remonte", "Le terrain décrit simplement ce qui bloque."],
  ["02", "La réponse s’organise", "Un coordinateur désigne qui agit et pour quand."],
  ["03", "Le résultat devient visible", "Chacun suit l’avancement jusqu’au constat final."]
];

export function CoordinationLanding() {
  return (
    <main className="min-h-screen bg-[#eef4f2] text-[#112e2a]">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-white/25 bg-white/10 text-sm font-black backdrop-blur">MB</span>
            <span>
              <span className="block text-base font-black">Mbàmbulaan</span>
              <span className="block text-[10px] font-bold text-white/65">Coordination territoriale</span>
            </span>
          </Link>
          <Link href="/demo-coordination" className="rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-black text-white backdrop-blur transition hover:bg-white/20">
            Voir la démonstration
          </Link>
        </div>
      </header>

      <section className="relative min-h-[82vh] overflow-hidden bg-[#073b42] px-5 pb-12 pt-32 text-white sm:px-8">
        <div className="absolute inset-y-0 right-0 w-[55%] bg-[radial-gradient(circle_at_50%_45%,rgba(60,177,165,0.34),transparent_58%)]" />
        <div className="relative mx-auto grid max-w-[88rem] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ed4ca]">Infrastructure de coordination</p>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Du problème terrain au résultat constaté.
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-white/72 sm:text-lg">
              Mbàmbulaan aide les acteurs d’un territoire à remonter une difficulté, organiser sa prise en charge, suivre l’intervention et voir ce qui a réellement été résolu.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/terrain/remonter" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#d8ebe6] px-6 text-sm font-black text-[#073b42] transition hover:bg-white">
                Remonter une difficulté
              </Link>
              <Link href="/demo-coordination" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-6 text-sm font-black text-white transition hover:bg-white/10">
                Jouer le scénario complet
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl" aria-label="Aperçu du parcours machine à glace">
            <div className="rounded-lg border border-white/15 bg-[#0b4a51]/80 p-5 backdrop-blur sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-white/12 pb-5">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#8ed4ca]">MBA-2026-001</p>
                  <h2 className="mt-2 text-xl font-black">Machine à glace en panne</h2>
                  <p className="mt-1 text-xs font-semibold text-white/58">Quai de débarquement de Mbao</p>
                </div>
                <span className="rounded-full border border-[#f2c27d]/40 bg-[#d9963b]/14 px-3 py-1 text-[10px] font-black text-[#ffd397]">Urgence élevée</span>
              </div>
              <div className="mt-6 space-y-5">
                {steps.map(([number, title, detail], index) => (
                  <div key={number} className="grid grid-cols-[2.5rem_1fr] gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-full border text-[10px] font-black ${index === 0 ? "border-[#8ed4ca] bg-[#8ed4ca] text-[#073b42]" : "border-white/18 text-white/50"}`}>{number}</span>
                    <div>
                      <p className="text-sm font-black">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/55">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-md bg-white/8 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8ed4ca]">Prochaine étape</p>
                <p className="mt-2 text-sm font-bold">Comprendre la situation et vérifier les informations remontées</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[88rem]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087c78]">Une responsabilité claire à chaque étape</p>
          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-[#1b4e48]/12 bg-[#1b4e48]/12 md:grid-cols-4">
            {[
              ["Acteur terrain", "Remonte et suit la difficulté", "/terrain"],
              ["Coordinateur", "Comprend et organise la réponse", "/coordinateur"],
              ["Responsable", "Réalise et documente l’intervention", "/responsable"],
              ["Décideur", "Voit les délais et les résultats", "/pilotage"]
            ].map(([role, value, href]) => (
              <Link key={role} href={href} className="bg-white p-6 transition hover:bg-[#f4fbf9]">
                <p className="text-sm font-black text-[#163d38]">{role}</p>
                <p className="mt-2 text-xs leading-5 text-[#637873]">{value}</p>
                <p className="mt-5 text-xs font-black text-[#087c78]">Ouvrir l’espace →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
