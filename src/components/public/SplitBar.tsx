// Comparaison horizontale simple (deux catégories, une seule teinte
// d'accent) — conforme au principe "un seul graphique signature plutôt
// qu'un tableau de bord". Pas de légende séparée : les valeurs sont
// directement étiquetées.

export function SplitBar({ segments }: { segments: { label: string; share: number; note?: string }[] }) {
  return (
    <div>
      <div className="pub-split-bar" role="img" aria-label={segments.map((segment) => `${segment.label} : ${segment.share}%`).join(", ")}>
        {segments.map((segment, index) => (
          <div
            key={segment.label}
            className="pub-split-bar-segment"
            style={{
              width: `${segment.share}%`,
              background: index === 0 ? "var(--pub-turquoise-500)" : "var(--pub-sand-500)"
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((segment, index) => (
          <div key={segment.label} className="flex items-start gap-2">
            <span className="mt-1 inline-block size-2.5 shrink-0 rounded-full" style={{ background: index === 0 ? "var(--pub-turquoise-500)" : "var(--pub-sand-500)" }} />
            <span className="text-xs leading-5 text-[var(--pub-stone-700)]">
              <strong className="font-bold text-[var(--pub-deep-900)]">{segment.share}% · {segment.label}</strong>
              {segment.note ? <span className="block text-[var(--pub-stone-500)]">{segment.note}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
