// SourceNote — checkpoint E (mandat Public V1, §2) : affiche la
// provenance d'une donnée, d'une photo ou d'un contenu quand elle est
// connue. Ne rend rien si aucune source n'est fournie — jamais une
// source inventée pour combler l'absence.
import { BadgeCheck } from "lucide-react";

export function SourceNote({ source, updatedAt }: { source?: string; updatedAt?: string }) {
  if (!source) return null;
  return (
    <p className="flex items-center gap-2 text-xs font-semibold text-[var(--pub-stone-500)]">
      <BadgeCheck size={14} className="shrink-0 text-[var(--pub-turquoise-500)]" />
      Source : {source}{updatedAt ? ` · Mise à jour ${updatedAt}` : ""}
    </p>
  );
}
