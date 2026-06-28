import { actors } from "@/data/landing";
import { SectionHeading } from "./SectionHeading";

export function ActorsSection() {
  return (
    <section id="acteurs" className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Acteurs"
          title="Chaque maillon garde son role, la coordination devient plus simple."
          description="Le MVP structure les interactions entre les acteurs essentiels de la chaine, depuis le debarquement jusqu'aux besoins publics et prives."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {actors.map((actor) => (
            <article key={actor.name} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d65a31] text-lg font-black text-white">
                {actor.initial}
              </div>
              <h3 className="mt-5 text-xl font-black text-[#14312d]">{actor.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[#14312d]/70">{actor.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
