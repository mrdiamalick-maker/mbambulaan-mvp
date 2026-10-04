"use client";

// Gallery — checkpoint E (mandat Public V1, §2) : galerie éditoriale
// réutilisable avec lightbox (précédent/suivant, fermeture, Escape,
// réinitialisation complète au changement de route). Aucun contenu
// fabriqué : si `images` est vide ou absent, l'appelant ne doit
// simplement pas rendre ce composant plutôt que de lui passer une
// liste vide (cf. decouvrir/[slug]/page.tsx).
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export function Gallery({ images }: { images: GalleryImage[] }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Réinitialisation complète au changement de route (mandat §2) — la
  // lightbox ne doit jamais rester ouverte, ni pointer vers une image
  // d'une autre page, après une navigation.
  useEffect(() => {
    setOpenIndex(null);
  }, [pathname]);

  // Focus clavier de base (mandat §12) : à l'ouverture, le focus se
  // déplace dans la boîte de dialogue (bouton Fermer) ; à la fermeture,
  // il revient sur la vignette qui a déclenché l'ouverture — jamais
  // perdu dans la page.
  useEffect(() => {
    if (openIndex !== null) closeButtonRef.current?.focus();
    else lastTriggerRef.current?.focus();
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (event.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, images.length]);

  if (images.length === 0) return null;
  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]">
        <Images size={14} /> Galerie · {images.length} photo{images.length > 1 ? "s" : ""}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={(event) => { lastTriggerRef.current = event.currentTarget; setOpenIndex(index); }}
            aria-label={`Agrandir la photo : ${image.alt}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--pub-stone-150)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--pub-turquoise-500)] focus-visible:outline-offset-2"
          >
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 320px, 50vw" className="object-cover transition group-hover:scale-105" />
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-black/90 p-5"
          onClick={() => setOpenIndex(null)}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={(event) => { event.stopPropagation(); setOpenIndex(null); }}
            aria-label="Fermer la galerie"
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setOpenIndex((openIndex! - 1 + images.length) % images.length); }}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:left-6"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div className="relative max-h-[70vh] w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
              <Image src={active.src} alt={active.alt} fill sizes="90vw" className="object-contain" />
            </div>
            {(active.caption || active.credit) && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
                {active.caption && <span>{active.caption}</span>}
                {active.credit && <span className="text-white/45">{active.credit}</span>}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setOpenIndex((openIndex! + 1) % images.length); }}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-6"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {images.length > 1 && (
            <p className="text-xs font-semibold text-white/50">{openIndex! + 1} / {images.length}</p>
          )}
        </div>
      )}
    </div>
  );
}
