import type { ReactNode } from "react";
import { HeroBackgroundImage } from "./HeroBackgroundImage";

export function PublicSectionHero({
  eyebrow,
  title,
  description,
  actions,
  backgroundImage,
  backgroundAlt
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  /** Chemin public d'une photo de fond (ex. /images/atlas-cover.jpg). Dégradé de secours si absente. */
  backgroundImage?: string;
  backgroundAlt?: string;
}) {
  return (
    <section className="pub-hero relative overflow-hidden px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16">
      {backgroundImage && <HeroBackgroundImage src={backgroundImage} alt={backgroundAlt ?? ""} />}
      <div className="relative mx-auto max-w-[1500px]">
        <p className="pub-eyebrow pub-eyebrow--dark">{eyebrow}</p>
        <h1 className="pub-display mt-5 max-w-4xl text-[2.6rem] not-italic leading-[1.02] tracking-[-.01em] md:text-[4.2rem]">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/64 md:text-lg md:leading-8">{description}</p>
        {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <div className="pub-tideline relative mt-12 md:mt-16" />
    </section>
  );
}
