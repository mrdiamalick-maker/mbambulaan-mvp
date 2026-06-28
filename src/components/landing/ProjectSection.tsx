import { SectionHeading } from "./SectionHeading";

export function ProjectSection() {
  return (
    <section id="projet" className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Projet"
          title="Une infrastructure de confiance pour mieux vendre, transformer et decider."
          description="Mbàmbulaan centralise les informations utiles aux acteurs de terrain afin de fluidifier les echanges, reduire les pertes et renforcer la lecture locale des volumes disponibles."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            "Visibilite des arrivages et des capacites disponibles sur les quais.",
            "Mise en relation plus rapide entre offres, besoins et opportunites.",
            "Donnees consolidees pour aider les collectivites a piloter la filiere."
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-[#14312d]/10 bg-[#f7f4ec] p-6">
              <p className="text-lg font-bold leading-8 text-[#14312d]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
