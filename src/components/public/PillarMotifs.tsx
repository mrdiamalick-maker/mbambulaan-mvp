// Matière des 3 BentoCards Terrain/Réseau/Technologie — Accueil (audit
// Premium XXL Public, PUB-A1, CEO 2026-08-16). Remplace le radial terracotta
// à 9% quasi invisible par une illustration vectorielle abstraite propre à
// chaque pilier, ton-sur-ton marine/terracotta/crème — jamais une photo ni
// un rendu photoréaliste (leçon retenue de la texture Atlas : ne jamais
// prétendre qu'une image générée est une vraie photographie ; ici on ne
// prétend même pas à la photographie, ce sont des traits assumés comme
// illustration). Même famille graphique que MaritimeGlyphs.tsx (monoligne,
// strokeLinecap/Linejoin round) mais en plein cadre plutôt qu'en pictogramme
// 32×32 : chaque motif est un fond absolu, faible opacité, positionné pour
// ne jamais passer sous le bloc icône/titre/texte (ancré en haut-gauche des
// cartes).

type MotifProps = { className?: string };

// Terrain → micro-cartographie : ligne de côte sinueuse + points
// territoriaux, même vocabulaire que le tracé Atlas (senegal-coast-atlas.svg)
// réduit à l'essentiel plutôt qu'inventé de toutes pièces.
export function TerrainMotif({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 600 320" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true">
      <path
        d="M40 300 Q90 250 80 200 Q68 150 110 120 Q152 90 160 60 Q168 30 220 20"
        fill="none"
        stroke="var(--pub-deep-900)"
        strokeOpacity=".16"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M40 300 Q90 250 80 200 Q68 150 110 120 Q152 90 160 60 Q168 30 220 20"
        fill="none"
        stroke="var(--pub-deep-900)"
        strokeOpacity=".08"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <circle cx="80" cy="200" r="4" fill="var(--pub-deep-900)" fillOpacity=".2" />
      <circle cx="110" cy="120" r="4" fill="var(--pub-deep-900)" fillOpacity=".2" />
      <circle cx="160" cy="60" r="5.5" fill="var(--pub-turquoise-500)" fillOpacity=".55" />
      <circle cx="40" cy="300" r="4" fill="var(--pub-deep-900)" fillOpacity=".2" />
      <circle cx="220" cy="20" r="4" fill="var(--pub-deep-900)" fillOpacity=".2" />
    </svg>
  );
}

// Réseau → constellation d'acteurs/nœuds reliés, densité volontairement
// irrégulière (jamais une grille régulière, qui lirait comme un diagramme
// technique plutôt qu'un réseau d'acteurs).
export function ReseauMotif({ className }: MotifProps) {
  const nodes = [
    [64, 56], [150, 40], [96, 128], [190, 110], [140, 200], [230, 190], [70, 220], [200, 260]
  ] as const;
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 6], [4, 5], [5, 7], [4, 7]];
  return (
    <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true">
      <g stroke="var(--pub-deep-900)" strokeOpacity=".14" strokeWidth="1.3">
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      {nodes.map(([x, y], index) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={index === 4 ? 5.5 : 3.4}
          fill={index === 4 ? "var(--pub-turquoise-500)" : "var(--pub-deep-900)"}
          fillOpacity={index === 4 ? ".55" : ".2"}
        />
      ))}
    </svg>
  );
}

// Technologie → flux structuré signal → qualification → coordination :
// trois étapes fixes reliées par des segments fléchés, plutôt qu'une route
// organique (déjà le vocabulaire de RouteGlyph/Transport ailleurs sur le
// site — celui-ci doit se lire comme un pipeline, pas un trajet).
export function TechnologieMotif({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true">
      {/* Trois segments fléchés (signal → qualification → coordination) —
          délibérément plus rectiligne et directionnel que ReseauMotif, pour
          se lire comme un pipeline structuré plutôt qu'une même toile. */}
      <g fill="none" stroke="var(--pub-deep-900)" strokeOpacity=".18" strokeWidth="1.6" strokeLinecap="round">
        <path d="M40 70 L140 100" />
        <path d="M140 100 L240 70" />
        <path d="M240 70 L240 190" />
      </g>
      <g fill="var(--pub-deep-900)" fillOpacity=".18">
        <path d="M132 92 L146 98 L134 106 Z" />
        <path d="M232 78 L246 72 L236 62 Z" />
        <path d="M232 182 L240 196 L248 182 Z" />
      </g>
      <circle cx="40" cy="70" r="4" fill="var(--pub-deep-900)" fillOpacity=".22" />
      <circle cx="140" cy="100" r="4" fill="var(--pub-deep-900)" fillOpacity=".22" />
      <circle cx="240" cy="70" r="4" fill="var(--pub-deep-900)" fillOpacity=".22" />
      <circle cx="240" cy="190" r="5.5" fill="var(--pub-turquoise-500)" fillOpacity=".55" />
    </svg>
  );
}
