"use client";

import { useState } from "react";
import Image from "next/image";

// Se masque proprement si le fichier n'existe pas encore (le dégradé du
// pub-hero reste alors le seul fond) — évite une icône d'image cassée
// pendant que les visuels sont progressivement fournis.
export function HeroBackgroundImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover opacity-40"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,27,33,.96)_0%,rgba(5,27,33,.82)_42%,rgba(5,27,33,.5)_100%)]" />
    </>
  );
}
