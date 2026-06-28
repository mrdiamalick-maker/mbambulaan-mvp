import { ActorNode } from "@/components/ui/ActorNode";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const actors = [
  { role: "Pêcheur", action: "Déclare le lot", tone: "success" as const },
  { role: "Mareyeur", action: "Réserve le volume", tone: "info" as const },
  { role: "Transformateur", action: "Capte le surplus", tone: "warning" as const },
  { role: "Collectivité", action: "Suit les tensions", tone: "impact" as const },
  { role: "Administration", action: "Lit l’impact", tone: "dark" as const }
];

const outputs = ["Opportunité détectée", "Transaction suivie", "Impact mesuré", "Décision recommandée"];

const benefits = [
  { title: "Voir les arrivages", text: "Les lots débarqués deviennent lisibles et suivis." },
  { title: "Coordonner les acteurs", text: "Les besoins et les offres sont rapprochés." },
  { title: "Décider avec l’impact", text: "Les tensions et priorités guident l’action." }
];

export function Hero() {
  return (
    <section id="accueil" className="bg-[#f6f8f7]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <StatusBadge tone="impact">Centre de contrôle de la filière</StatusBadge>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.1] text-[#14312d] sm:text-5xl">
              Mbàmbulaan coordonne la pêche artisanale, du quai à la décision.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#14312d]/68">
              Une plateforme pour rendre visibles les arrivages, connecter les besoins, suivre les lots et mesurer l’impact territorial.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/demo">Entrer dans la démonstration</Button>
              <Button href="/executive" variant="secondary">
                Voir la vue exécutive
              </Button>
            </div>
          </div>

          <ProductCard className="bg-white">
            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.05fr_0.85fr] xl:items-center">
              <div className="grid gap-3">
                {actors.slice(0, 3).map((actor) => (
                  <ActorNode key={actor.role} role={actor.role} action={actor.action} tone={actor.tone} />
                ))}
              </div>

              <div className="rounded-2xl border border-[#14312d]/12 bg-[#eef8f1] p-5 text-center shadow-sm">
                <StatusBadge tone="success">Lot suivi</StatusBadge>
                <p className="mt-4 text-2xl font-black text-[#14312d]">Sardinelle ronde</p>
                <p className="mt-2 text-sm font-bold text-[#14312d]/62">Kayar · 700 kg · qualité contrôlée</p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-left">
                  {["Besoin connecté", "Réservation possible", "Traçabilité active", "Impact calculé"].map((item) => (
                    <div key={item} className="rounded-xl bg-white p-3 text-xs font-black text-[#14312d]/72 ring-1 ring-[#14312d]/8">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {actors.slice(3).map((actor) => (
                  <ActorNode key={actor.role} role={actor.role} action={actor.action} tone={actor.tone} />
                ))}
                {outputs.map((output) => (
                  <div key={output} className="rounded-2xl border border-[#93c5fd]/70 bg-[#eef6ff] p-4 text-sm font-black text-[#14312d]">
                    {output}
                  </div>
                ))}
              </div>
            </div>
          </ProductCard>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <ProductCard key={benefit.title}>
              <h2 className="text-base font-black">{benefit.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/62">{benefit.text}</p>
            </ProductCard>
          ))}
        </div>
      </div>
    </section>
  );
}
