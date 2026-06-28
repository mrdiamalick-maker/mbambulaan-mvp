import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const demoReasons = [
  { label: "Avant", text: "Informations dispersées" },
  { label: "Pendant", text: "Mbàmbulaan connecte les acteurs" },
  { label: "Après", text: "La filière devient lisible et pilotable" }
];

const actors = ["Pêcheur", "Mareyeur", "Transformateur", "Collectivité", "Administration"];

const outputs = ["Opportunité détectée", "Transaction suivie", "Impact mesuré", "Décision recommandée"];

const steps = ["Arrivage", "Besoin", "Opportunité", "Transaction", "Impact", "Décision"];

const modules = [
  { name: "Arrivages", role: "Rendre les lots visibles", href: "/arrivages" },
  { name: "Besoins", role: "Qualifier la demande", href: "/besoins" },
  { name: "Opportunités", role: "Détecter les correspondances", href: "/opportunites" },
  { name: "Transactions", role: "Suivre les retraits", href: "/transactions" },
  { name: "Traçabilité", role: "Suivre chaque lot", href: "/opportunites" },
  { name: "Dashboard", role: "Piloter l’activité", href: "/dashboard" },
  { name: "Coordination", role: "Prioriser les actions", href: "/coordination" },
  { name: "Executive", role: "Lire la décision", href: "/executive" }
];

export function Hero() {
  return (
    <section id="accueil" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="h-14 w-14 rounded-2xl bg-white bg-contain bg-center bg-no-repeat ring-1 ring-[#0F2D4A]/10"
                style={{ backgroundImage: "url('/images/mbambulaan/mbambulaan-logo.webp')" }}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Coordination maritime</p>
                <p className="text-lg font-black text-[#0F2D4A]">Mbàmbulaan</p>
              </div>
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.06] text-[#0F2D4A] sm:text-5xl">
              Coordonner la pêche artisanale, du quai à la décision.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#334155]">
              Mbàmbulaan rend visibles les arrivages, connecte les besoins, suit les lots et mesure l’impact territorial.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/demo">Voir la démonstration</Button>
              <Button href="/executive" variant="secondary">
                Vue exécutive
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-[#F8FAFC] p-4 ring-1 ring-[#0F2D4A]/8">
            <div
              className="min-h-[22rem] rounded-[1.5rem] bg-[#EAF6F8] bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.94), rgba(255,255,255,0.62)), url('/images/mbambulaan/sea-slider.webp')"
              }}
            >
              <div className="flex min-h-[22rem] flex-col justify-between p-5 sm:p-7">
                <div className="max-w-sm">
                  <StatusBadge tone="info">Lot suivi</StatusBadge>
                  <p className="mt-4 text-3xl font-black text-[#0F2D4A]">Sardinelle ronde</p>
                  <p className="mt-2 text-sm font-bold text-[#334155]">Kayar · 700 kg · qualité contrôlée</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Arrivage déclaré", "Besoin compatible", "Impact mesuré"].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/92 p-4 text-sm font-black text-[#0F2D4A] shadow-sm ring-1 ring-[#0F2D4A]/8 backdrop-blur">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductCard className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Comment ça marche</p>
              <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Un parcours court, du signal terrain à la décision.</h2>
            </div>
            <StatusBadge tone="info">Flux complet</StatusBadge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-6">
            {steps.map((step, index) => (
              <div key={step} className="relative rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-black text-[#0F2D4A] ring-1 ring-[#1F6F8B]/20">{index + 1}</span>
                <p className="mt-4 text-sm font-black text-[#0F2D4A]">{step}</p>
                {index < steps.length - 1 ? <span className="absolute -right-2 top-1/2 hidden h-px w-4 bg-[#1F6F8B]/30 md:block" /> : null}
              </div>
            ))}
          </div>
        </ProductCard>

        <ProductCard className="mt-10 bg-[#F8FAFC]">
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Pourquoi lancer la démo ?</p>
              <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Voir le changement complet, pas seulement les écrans.</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#334155]">
                La démo montre le changement complet : un lot isolé devient une opportunité, une transaction suivie, un impact mesuré et une décision recommandée.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {demoReasons.map((reason) => (
                <div key={reason.label} className="rounded-2xl bg-white p-4 ring-1 ring-[#0F2D4A]/8">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#D85A34]">{reason.label}</p>
                  <p className="mt-2 text-sm font-black leading-5 text-[#0F2D4A]">{reason.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ProductCard>

        <ProductCard className="mt-6 bg-[#F8FAFC]">
          <div className="grid gap-4 sm:grid-cols-[1fr_16rem] sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Présentation terrain</p>
              <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Bientôt : vidéos terrain et démonstrations guidées</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#334155]">
                Un emplacement est préparé pour intégrer plus tard des séquences de quai, d’acteurs et de démonstration sans alourdir le MVP.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center ring-1 ring-[#E2E8F0]">
              <p className="text-3xl font-black text-[#1F6F8B]">01:30</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#334155]">Vidéo future</p>
            </div>
          </div>
        </ProductCard>

        <ProductCard className="mt-6">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Ce que Mbàmbulaan coordonne</p>
              <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Une carte de coordination autour du lot.</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#334155]">
                Le lot devient le point commun entre acteurs, besoins, transaction, impact et décision publique.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[1.75rem] bg-[#F8FAFC] p-5 ring-1 ring-[#0F2D4A]/8">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white text-center text-sm font-black leading-5 text-[#0F2D4A] shadow-sm ring-1 ring-[#1F6F8B]/18">
                  Lot suivi
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {actors.map((actor) => (
                    <div key={actor} className="rounded-2xl bg-white px-3 py-2 text-center text-xs font-black text-[#334155] ring-1 ring-[#0F2D4A]/7">
                      {actor}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                {outputs.map((output) => (
                  <div key={output} className="rounded-2xl bg-white p-4 text-sm font-black text-[#0F2D4A] ring-1 ring-[#1F6F8B]/16">
                    {output}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ProductCard>

        <ProductCard className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Modules connectés</p>
              <h2 className="mt-2 text-2xl font-black text-[#0F2D4A]">Explorer après avoir vu le scénario.</h2>
            </div>
            <Button href="/demo" variant="ghost">Commencer par la démo</Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <a key={module.name} href={module.href} className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#0F2D4A]/8 transition hover:bg-white hover:shadow-sm">
                <StatusBadge tone="neutral">Disponible</StatusBadge>
                <p className="mt-3 text-base font-black text-[#0F2D4A]">{module.name}</p>
                <p className="mt-1 text-sm font-semibold text-[#334155]">{module.role}</p>
              </a>
            ))}
          </div>
        </ProductCard>
      </div>
    </section>
  );
}
