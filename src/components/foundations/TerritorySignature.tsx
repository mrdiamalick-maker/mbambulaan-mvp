// XXL-R1 (§16 du mandat) — signature graphique territoriale : un trait de
// côte réduit à l'essentiel, des points de coordonnées, une trajectoire.
// Volontairement discret (aucune vague décorative, aucune pirogue, aucun
// motif nautique) — un repère cartographique abstrait, pas une
// illustration. Destiné à apparaître en petit, dans un coin de PageIntro,
// d'en-tête de dossier territorial, ou de section Atlas/Brief/Programmes —
// jamais comme illustration principale.
//
// SVG à la main, volontairement minimal (une poignée de segments, pas un
// tracé généré) : à cette taille et cette sobriété, un chemin dessiné à la
// main reste plus lisible et plus léger qu'une génération procédurale.
export function TerritorySignature({
  size = 64,
  tone = "navy",
  className
}: {
  size?: number;
  tone?: "navy" | "cream" | "terracotta";
  className?: string;
}) {
  const stroke = tone === "cream" ? "#f7f3e9" : tone === "terracotta" ? "#b6522f" : "#0b1a2a";
  const dot = tone === "cream" ? "#f7f3e9" : "#b6522f";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Trait de côte — un littoral réduit à sa silhouette, jamais une carte précise. */}
      <path
        d="M6 10 L14 18 L11 26 L20 32 L17 41 L27 46 L24 55 L34 58"
        stroke={stroke}
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Trajectoire — un déplacement, une relation entre deux points. */}
      <path
        d="M20 32 L44 22"
        stroke={stroke}
        strokeOpacity="0.3"
        strokeWidth="1.2"
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      {/* Points de coordonnées. */}
      <circle cx="20" cy="32" r="2.4" fill={dot} />
      <circle cx="44" cy="22" r="1.8" fill={stroke} fillOpacity="0.5" />
      <circle cx="34" cy="58" r="1.8" fill={stroke} fillOpacity="0.35" />
    </svg>
  );
}
