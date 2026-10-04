// DocumentBlock — checkpoint E (mandat Public V1, §2) : deux états
// honnêtes. Si `document` est fourni, un lien de téléchargement réel.
// Sinon, un bloc NON interactif « Document à venir » — jamais un faux
// bouton de téléchargement qui ne mène nulle part.
import { FileDown, FileX2 } from "lucide-react";

export interface PublicDocument {
  url: string;
  label: string;
}

export function DocumentBlock({ document }: { document?: PublicDocument }) {
  if (!document) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] p-5 text-[var(--pub-stone-500)]">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[var(--pub-stone-300)]"><FileX2 size={20} /></span>
        <div>
          <p className="text-sm font-bold text-[var(--pub-stone-700)]">Document à venir</p>
          <p className="mt-0.5 text-xs leading-5 text-[var(--pub-stone-500)]">Aucun document n’est disponible pour ce contenu pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-xl border border-[var(--pub-stone-150)] bg-white p-5 transition hover:border-[var(--pub-turquoise-500)]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><FileDown size={20} /></span>
      <div>
        <p className="text-sm font-bold text-[var(--pub-deep-900)]">{document.label}</p>
        <p className="mt-0.5 text-xs leading-5 text-[var(--pub-stone-500)]">Ouvrir le document</p>
      </div>
    </a>
  );
}
