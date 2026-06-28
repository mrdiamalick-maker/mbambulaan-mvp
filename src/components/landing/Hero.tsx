import Link from "next/link";

const valueProofs = [
  { label: "Arrivages visibles", detail: "Les lots sont déclarés et lisibles par quai." },
  { label: "Matching utile", detail: "Les besoins compatibles deviennent des opportunités." },
  { label: "Impact territorial", detail: "Les volumes, tensions et priorités sont pilotables." }
];

const ecosystemNodes = ["Pêcheurs", "Quais", "Mareyeurs", "Transformateurs", "Collectivités"];

export function Hero() {
  return (
    <section id="accueil" className="border-b border-[#14312d]/10 bg-white px-5 py-14 sm:px-8 lg:py-18">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d65a31]">Plateforme de coordination halieutique</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.08] text-[#14312d] sm:text-5xl">
            Mbàmbulaan coordonne la pêche artisanale, du quai à la décision.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#14312d]/72 sm:text-lg">
            La plateforme relie arrivages, besoins, opportunités, transactions et impact territorial pour aider les acteurs à mieux vendre,
            réserver, suivre et décider.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link className="rounded-full bg-[#14312d] px-6 py-3 text-center text-sm font-black text-white transition hover:bg-[#1e4a43]" href="/demo">
              Voir la démonstration
            </Link>
            <Link className="rounded-full border border-[#14312d]/20 bg-white px-6 py-3 text-center text-sm font-black text-[#14312d] transition hover:border-[#14312d]" href="/executive">
              Voir la vue exécutive
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {valueProofs.map((proof) => (
              <article key={proof.label} className="rounded-2xl border border-[#14312d]/10 bg-[#f8faf8] p-4">
                <h2 className="text-sm font-black text-[#14312d]">{proof.label}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/65">{proof.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#14312d]/10 bg-[#f8faf8] p-5 shadow-sm">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#14312d]/8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d65a31]">Écosystème connecté</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-[#14312d] p-5 text-white">
                <p className="text-sm font-black text-[#f5c85d]">Lot déclaré</p>
                <p className="mt-2 text-2xl font-black">Besoin → Opportunité → Transaction</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/72">Un même fil relie les acteurs, les volumes et l’impact.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {ecosystemNodes.map((node) => (
                  <div key={node} className="rounded-2xl border border-[#14312d]/10 bg-white px-4 py-3 text-sm font-black text-[#14312d]/75">
                    {node}
                  </div>
                ))}
                <div className="rounded-2xl bg-[#e8f7f2] px-4 py-3 text-sm font-black text-[#0f5132] ring-1 ring-[#9ad6bf]">Impact mesuré</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
