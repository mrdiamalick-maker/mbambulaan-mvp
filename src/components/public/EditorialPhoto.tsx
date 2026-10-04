"use client";

import { useState } from "react";
import Image from "next/image";

// Photo éditoriale pleine largeur avec légende — se masque proprement tant
// que le fichier n'a pas été fourni, plutôt que d'afficher une icône cassée.
// credit (checkpoint E, §2) : crédit/source du visuel quand connu — jamais
// affiché s'il n'est pas fourni, jamais une mention fabriquée.
export function EditorialPhoto({ src, alt, caption, credit }: { src: string; alt: string; caption?: string; credit?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure className="overflow-hidden rounded-[28px] border border-[var(--pub-stone-150)]">
      <div className="relative aspect-[16/9] w-full">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 1200px, 100vw" className="object-cover" onError={() => setFailed(true)} />
      </div>
      {(caption || credit) && (
        <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-white px-5 py-3 text-xs font-semibold text-[var(--pub-stone-500)]">
          {caption && <span>{caption}</span>}
          {credit && <span className="text-[var(--pub-stone-300)]">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
