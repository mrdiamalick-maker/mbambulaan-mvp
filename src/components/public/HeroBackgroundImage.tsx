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
        priority={false}
        className="absolute inset-0 object-cover"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,27,33,.94)_0%,rgba(5,27,33,.78)_38%,rgba(5,27,33,.5)_68%,rgba(5,27,33,.32)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,27,33,.2),transparent_35%,rgba(5,27,33,.55)_100%)]" />
    </>
  );
}
