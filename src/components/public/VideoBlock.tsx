// VideoBlock — checkpoint E (mandat Public V1, §2) : deux états honnêtes.
// Si `video` est fourni, un lecteur/lien réel. Sinon, un bloc NON
// interactif « Vidéo à venir » — jamais un faux bouton Play qui ne mène
// nulle part.
import { PlayCircle } from "lucide-react";

export interface PublicVideo {
  url: string;
  title: string;
}

export function VideoBlock({ video }: { video?: PublicVideo }) {
  if (!video) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] p-5 text-[var(--pub-stone-500)]">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[var(--pub-stone-300)]"><PlayCircle size={22} /></span>
        <div>
          <p className="text-sm font-bold text-[var(--pub-stone-700)]">Vidéo à venir</p>
          <p className="mt-0.5 text-xs leading-5 text-[var(--pub-stone-500)]">Aucune vidéo n’est disponible pour ce contenu pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-[28px] border border-[var(--pub-stone-150)]">
      <div className="relative aspect-video w-full bg-black">
        <video controls className="h-full w-full" preload="none">
          <source src={video.url} />
        </video>
      </div>
      <figcaption className="bg-white px-5 py-3 text-xs font-semibold text-[var(--pub-stone-500)]">{video.title}</figcaption>
    </figure>
  );
}
