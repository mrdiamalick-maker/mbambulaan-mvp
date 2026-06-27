import { heroStats } from "@/data/landing";

export function Hero() {
  return (
    <section id="accueil" className="overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">MVP filiere halieutique</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[1.02] text-[#14312d] sm:text-6xl lg:text-7xl">
            Mbàmbulaan connecte la mer, les quais et les marches.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#14312d]/75 sm:text-xl">
            Une plateforme de coordination pour rendre les arrivages visibles, organiser les besoins et ouvrir des opportunites fiables entre les acteurs du poisson.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-full bg-[#14312d] px-6 py-3 text-center font-bold text-white transition hover:bg-[#1e4a43]" href="/demo">
              Démonstration
            </a>
            <a className="rounded-full border border-[#14312d]/20 px-6 py-3 text-center font-bold text-[#14312d] transition hover:border-[#14312d]" href="#fonctionnalites">
              Voir les fonctionnalites
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-4 top-8 h-24 w-24 rounded-full bg-[#f5c85d] opacity-80" />
          <div className="relative rounded-[2rem] bg-[#14312d] p-5 text-white shadow-2xl shadow-[#14312d]/20">
            <div className="rounded-[1.5rem] border border-white/15 bg-white/8 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f5c85d]">Tableau pilote</p>
              <div className="mt-6 grid gap-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white p-5 text-[#14312d]">
                    <div className="flex items-end justify-between gap-4">
                      <p className="text-sm font-bold text-[#14312d]/60">{stat.label}</p>
                      <p className="text-3xl font-black">{stat.value}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#14312d]/65">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
