import { ActorNode } from "@/components/ui/ActorNode";
import { Button } from "@/components/ui/Button";
import { FlowStep } from "@/components/ui/FlowStep";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const flow = [
  { title: "Pêcheur", detail: "Déclare le lot" },
  { title: "Lot", detail: "Sardinelle · Kayar" },
  { title: "Besoin", detail: "Volume recherché" },
  { title: "Opportunité", detail: "Matching détecté" },
  { title: "Transaction", detail: "Retrait suivi" },
  { title: "Impact", detail: "Volume valorisé" },
  { title: "Décision", detail: "Action priorisée" }
];

const actors = [
  { role: "Pêcheur", action: "déclarer un lot", tone: "success" as const },
  { role: "Mareyeur", action: "réserver rapidement", tone: "info" as const },
  { role: "Transformateur", action: "capter un surplus", tone: "warning" as const },
  { role: "Collectivité", action: "suivre les tensions", tone: "impact" as const },
  { role: "Administration", action: "décider avec l’impact", tone: "dark" as const }
];

const proofs = [
  { title: "Visibilité des arrivages", text: "Les lots débarqués deviennent visibles et exploitables." },
  { title: "Traçabilité des lots", text: "Chaque lot garde un fil depuis le quai jusqu’à la transaction." },
  { title: "Lecture territoriale", text: "Les tensions et impacts éclairent les décisions publiques." }
];

export function Hero() {
  return (
    <section id="accueil" className="bg-[#F7F2E8]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-2xl border border-[#0F2D4A]/10 bg-white bg-contain bg-center bg-no-repeat shadow-sm"
                style={{ backgroundImage: "url('/images/mbambulaan/mbambulaan-logo.webp')" }}
                aria-hidden="true"
              />
              <div>
                <p className="text-lg font-black text-[#0F2D4A]">Mbàmbulaan</p>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1F6F8B]">Coordination maritime</p>
              </div>
            </div>

            <h1 className="mt-6 max-w-3xl text-3xl font-black leading-[1.1] text-[#0F2D4A] sm:text-5xl">
              Coordonner la pêche artisanale, du quai à la décision.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#0F2D4A]/68">
              Mbàmbulaan rend visibles les arrivages, connecte les besoins, suit les lots et mesure l’impact territorial.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/demo">Voir la démonstration</Button>
              <Button href="/executive" variant="secondary">
                Vue exécutive
              </Button>
            </div>
          </div>

          <ProductCard className="overflow-hidden bg-white p-0">
            <div
              className="min-h-[19rem] bg-[#0F2D4A] bg-cover bg-center p-4 sm:p-5"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(15,45,74,0.72), rgba(15,45,74,0.16)), url('/images/mbambulaan/hero-pirogue.webp')"
              }}
            >
              <div className="grid h-full gap-4 xl:grid-cols-[1fr_0.82fr] xl:items-end">
                <div className="rounded-2xl bg-white/92 p-5 shadow-sm backdrop-blur">
                  <StatusBadge tone="success">Lot suivi</StatusBadge>
                  <p className="mt-4 text-2xl font-black text-[#0F2D4A]">Sardinelle ronde</p>
                  <p className="mt-2 text-sm font-bold text-[#0F2D4A]/62">Kayar · 700 kg · qualité contrôlée</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {["Arrivage déclaré", "Opportunité détectée", "Impact mesuré"].map((item) => (
                      <div key={item} className="rounded-xl bg-[#F7F2E8] p-3 text-xs font-black text-[#0F2D4A]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  {["Transaction suivie", "Décision recommandée", "Tension territoriale lue"].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/25 bg-white/88 p-4 text-sm font-black text-[#0F2D4A] backdrop-blur">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ProductCard>
        </div>

        <ProductCard className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D85A34]">Ce que Mbàmbulaan coordonne</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {flow.map((step, index) => (
              <FlowStep key={step.title} active detail={step.detail} index={index + 1} status="lié" title={step.title} tone={index === 0 ? "success" : index > 4 ? "impact" : "info"} />
            ))}
          </div>
        </ProductCard>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.78fr]">
          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D85A34]">Acteurs</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {actors.map((actor) => (
                <ActorNode key={actor.role} action={actor.action} role={actor.role} tone={actor.tone} />
              ))}
            </div>
          </ProductCard>

          <ProductCard>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D85A34]">Preuves</p>
            <div className="mt-4 grid gap-3">
              {proofs.map((proof) => (
                <div key={proof.title} className="rounded-2xl bg-[#F7F2E8] p-4">
                  <p className="text-sm font-black text-[#0F2D4A]">{proof.title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#0F2D4A]/62">{proof.text}</p>
                </div>
              ))}
            </div>
          </ProductCard>
        </div>
      </div>
    </section>
  );
}
