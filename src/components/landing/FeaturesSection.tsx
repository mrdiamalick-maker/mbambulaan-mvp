import { features } from "@/data/landing";
import { SectionHeading } from "./SectionHeading";

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-[#14312d] px-5 py-20 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Fonctionnalites"
          title="Un socle clair pour les premiers usages terrain."
          description="La premiere version organise les donnees mockees autour des ecrans qui porteront les prochains flux operationnels."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-white/15 bg-white/8 p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f5c85d]">{feature.scope}</p>
              <h3 className="mt-4 text-2xl font-black">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/75">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
