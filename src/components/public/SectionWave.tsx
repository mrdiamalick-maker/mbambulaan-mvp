// Séparateur organique entre sections — remplace la simple ligne droite par
// une véritable ligne de côte stylisée, pour casser l'empilement de
// rectangles plats qui donne un rendu "gabarit".

export function SectionWave({
  fill = "var(--pub-ivory-100)",
  flip = false,
  className = ""
}: {
  fill?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none relative h-[46px] w-full overflow-hidden md:h-[68px] ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${flip ? "rotate-180" : ""}`}
      >
        <path
          d="M0,32 C180,70 320,4 500,28 C700,55 820,6 1020,26 C1200,44 1300,10 1440,30 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
