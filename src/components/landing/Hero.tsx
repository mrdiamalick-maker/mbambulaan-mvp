import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

const valueProofs = [
  { title: "Coordination des acteurs", text: "Un même fil relie pêcheurs, mareyeurs, transformateurs et collectivités." },
  { title: "Traçabilité des lots", text: "Chaque lot peut être suivi depuis le quai jusqu’à la transaction." },
  { title: "Lecture territoriale", text: "Les tensions, volumes et priorités deviennent lisibles pour décider." }
];

const personas = [
  { role: "Pêcheur", action: "Je déclare mon lot." },
  { role: "Mareyeur", action: "Je réserve le bon volume." },
  { role: "Transformateur", action: "Je capte un surplus." },
  { role: "Collectivité", action: "Je vois les tensions." },
  { role: "Administration", action: "Je lis l’impact." }
];

const ecosystemSteps = ["Arrivage", "Besoin", "Opportunité", "Transaction", "Impact"];

export function Hero() {
  return (
    <section id="accueil" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div>
            <StatusBadge tone="impact">Plateforme de coordination</StatusBadge>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.08] text-[#14312d] sm:text-5xl">
              Mbàmbulaan rend la pêche artisanale visible, coordonnée et pilotable.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#14312d]/70 sm:text-lg">
              La plateforme connecte les arrivages, les besoins, les opportunités, les transactions et l’impact territorial pour transformer
              des informations dispersées en décisions actionnables.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/demo">Voir la démonstration</Button>
              <Button href="/executive" variant="secondary">
                Vue exécutive
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#14312d]/10 bg-[#f8faf8] p-4 shadow-sm">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#14312d]/8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d65a31]">Écosystème Mbàmbulaan</p>
                  <h2 className="mt-2 text-xl font-black">Du quai à la décision</h2>
                </div>
                <StatusBadge tone="success">connecté</StatusBadge>
              </div>
              <div className="mt-5 grid gap-2">
                {ecosystemSteps.map((step, index) => (
                  <div key={step} className="grid grid-cols-[2rem_1fr] items-center gap-3 rounded-2xl border border-[#14312d]/8 bg-[#fbfcfb] p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14312d] text-xs font-black text-white">{index + 1}</span>
                    <div>
                      <p className="text-sm font-black">{step}</p>
                      <p className="text-xs font-semibold text-[#14312d]/55">{ecosystemDescriptions[index]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {valueProofs.map((proof) => (
            <article key={proof.title} className="rounded-3xl border border-[#14312d]/10 bg-[#fbfcfb] p-5">
              <h2 className="text-base font-black">{proof.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/65">{proof.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-[#14312d]/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d65a31]">Acteurs</p>
              <h2 className="mt-2 text-2xl font-black">Chacun sait quoi faire</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-6 text-[#14312d]/62">Mbàmbulaan donne une entrée simple à chaque rôle de la filière.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {personas.map((persona) => (
              <article key={persona.role} className="rounded-2xl bg-[#f8faf8] p-4 ring-1 ring-[#14312d]/8">
                <p className="text-sm font-black">{persona.role}</p>
                <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{persona.action}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-[#14312d] p-6 text-white">
          <p className="max-w-3xl text-xl font-black leading-8">
            Mbàmbulaan transforme les informations dispersées en actions coordonnées, traçables et utiles au territoire.
          </p>
        </div>
      </div>
    </section>
  );
}

const ecosystemDescriptions = ["Lot visible", "Demande structurée", "Mise en relation", "Suivi opérationnel", "Décision territoriale"];
