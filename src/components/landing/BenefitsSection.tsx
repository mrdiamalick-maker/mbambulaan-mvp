import { benefits } from "@/data/landing";
import { SectionHeading } from "./SectionHeading";

export function BenefitsSection() {
  return (
    <section id="benefices" className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Benefices"
          title="Des gains immediats pour les decisions du quotidien."
          description="Le MVP vise des benefices simples a comprendre, mesurables et directement relies aux operations de terrain."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-2xl border border-[#14312d]/10 p-7">
              <p className="text-4xl font-black text-[#d65a31]">{benefit.metric}</p>
              <h3 className="mt-4 text-2xl font-black text-[#14312d]">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#14312d]/70">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
