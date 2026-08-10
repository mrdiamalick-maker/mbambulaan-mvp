"use client";

import { useState } from "react";
import Image from "next/image";

// Photo éditoriale pleine largeur avec légende — se masque proprement tant
// que le fichier n'a pas été fourni, plutôt que d'afficher une icône cassée.
export function EditorialPhoto({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure className="overflow-hidden rounded-[28px] border border-[var(--pub-stone-150)]">
      <div className="relative aspect-[16/9] w-full">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 1200px, 100vw" className="object-cover" onError={() => setFailed(true)} />
      </div>
      {caption && <figcaption className="bg-white px-5 py-3 text-xs font-semibold text-[var(--pub-stone-500)]">{caption}</figcaption>}
    </figure>
  );
}
