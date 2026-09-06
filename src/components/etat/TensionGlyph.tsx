// Motif visuel signature de l'Espace État : un point territorial et ses
// ondes de portée, façon balise de phare vue du large. Réutilisé partout
// où l'espace doit signaler « un point qui compte en ce moment »
// (territoire, tension, signal) — à la place d'icônes génériques,
// conformément au cahier des charges (élément visuel signature récurrent).

const statusColor: Record<"stable" | "vigilance" | "critique" | "neutral", string> = {
  stable: "#1d4468",
  vigilance: "#c68a2c",
  critique: "#b6522f",
  neutral: "#8c9aa2"
};

export function TensionGlyph({
  status = "neutral",
  size = 40,
  pulse = false
}: {
  status?: "stable" | "vigilance" | "critique" | "neutral";
  size?: number;
  pulse?: boolean;
}) {
  const color = statusColor[status];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke={color} strokeOpacity="0.16" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="12" stroke={color} strokeOpacity="0.34" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="6.5" stroke={color} strokeOpacity="0.6" strokeWidth="1.5" fill={`${color}14`} />
      <circle cx="20" cy="20" r="2.6" fill={color}>
        {pulse && (
          <animate attributeName="r" values="2.6;3.4;2.6" dur="2.2s" repeatCount="indefinite" />
        )}
      </circle>
    </svg>
  );
}
