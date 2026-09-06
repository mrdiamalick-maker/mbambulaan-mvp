// Illustrations institutionnelles — Login (PUB-L1) et Espace État (PUB-X1),
// audit Premium XXL Public, CEO 2026-08-16. Même langage graphique pour les
// deux : silhouette littorale + points territoriaux + lignes de
// coordination, jamais une photo ni un rendu photoréaliste (leçon retenue
// de la texture Atlas — ne jamais prétendre qu'une image générée est une
// vraie photographie ; ici on ne prétend même pas à la photographie, ce
// sont des traits assumés comme illustration). La silhouette réutilise le
// tracé réel de docs/design-reference/senegal-coast-atlas.svg (validé
// isPointInFill sur les 22 marqueurs, 2026-08-15) plutôt qu'une forme
// inventée — cohérence avec l'identité déjà établie de l'Atlas.
//
// Login = "entrer dans le réseau" : un réseau égal, un point d'entrée.
// Espace État = "voir et piloter le territoire" : plus décisionnel — des
// tensions (anneaux d'alerte) convergent vers un point de décision unique.

const coastlinePath =
  "M 315 145 L 610 118 L 790 205 L 845 365 L 804 510 L 738 610 L 760 705 L 690 772 L 735 812 L 700 860 L 730 1015 L 680 1095 L 605 1140 L 520 1160 L 376 1135 L 341 1090 L 401 1055 L 311 1040 L 306 965 L 316 900 L 386 868 L 341 855 L 354 792 L 338 758 L 332 739 L 326 720 L 336 696 L 318 684 L 292 642 L 271 610 L 262 575 L 254 528 L 241 450 L 228 372 L 221 292 L 234 205 Z";

function IllustrationBase({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(170deg,var(--pub-deep-700)_0%,var(--pub-deep-900)_72%)]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "linear-gradient(rgba(247,243,233,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(247,243,233,.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
        aria-hidden
      />
      <svg viewBox="0 0 1000 1400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d={coastlinePath} fill="var(--pub-ivory-100)" fillOpacity=".05" stroke="var(--pub-ivory-100)" strokeOpacity=".09" strokeWidth="4" />
      </svg>
      {children}
    </div>
  );
}

export function LoginIllustration({ compact }: { compact?: boolean }) {
  // Réseau égal — 6 nœuds, densité irrégulière (même vocabulaire que
  // ReseauMotif, PillarMotifs.tsx), un seul accent terracotta : le point
  // d'entrée.
  const nodes = [
    [220, 260], [420, 190], [620, 340], [340, 480], [560, 560], [260, 620]
  ] as const;
  const edges: [number, number][] = [[0, 1], [1, 2], [0, 3], [2, 4], [3, 5], [3, 4]];
  return (
    <IllustrationBase>
      <svg viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g stroke="var(--pub-ivory-100)" strokeOpacity=".16" strokeWidth="1.3">
          {edges.map(([a, b]) => <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />)}
        </g>
        {nodes.map(([x, y], index) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={index === 3 ? 7 : 4} fill={index === 3 ? "var(--pub-turquoise-400)" : "var(--pub-ivory-100)"} fillOpacity={index === 3 ? ".85" : ".3"} />
        ))}
      </svg>
      {!compact && (
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 20%, rgba(182,82,47,.14), transparent 45%)" }} />
      )}
    </IllustrationBase>
  );
}

export function InstitutionIllustration() {
  // Tensions (anneaux) → réseau → décision publique (nœud de convergence
  // unique, plus large, marine cerclé de terracotta) : composition plus
  // hiérarchique/décisionnelle que LoginIllustration, même vocabulaire.
  const tensionNodes = [[180, 220], [640, 260], [220, 620]] as const;
  const relayNodes = [[380, 340], [480, 460], [320, 460]] as const;
  const decisionNode = [430, 560] as const;
  return (
    <IllustrationBase>
      <svg viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g stroke="var(--pub-ivory-100)" strokeOpacity=".14" strokeWidth="1.3">
          <line x1={tensionNodes[0][0]} y1={tensionNodes[0][1]} x2={relayNodes[0][0]} y2={relayNodes[0][1]} />
          <line x1={tensionNodes[1][0]} y1={tensionNodes[1][1]} x2={relayNodes[1][0]} y2={relayNodes[1][1]} />
          <line x1={tensionNodes[2][0]} y1={tensionNodes[2][1]} x2={relayNodes[2][0]} y2={relayNodes[2][1]} />
          <line x1={relayNodes[0][0]} y1={relayNodes[0][1]} x2={decisionNode[0]} y2={decisionNode[1]} />
          <line x1={relayNodes[1][0]} y1={relayNodes[1][1]} x2={decisionNode[0]} y2={decisionNode[1]} />
          <line x1={relayNodes[2][0]} y1={relayNodes[2][1]} x2={decisionNode[0]} y2={decisionNode[1]} />
        </g>
        {tensionNodes.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={11} fill="none" stroke="var(--pub-turquoise-400)" strokeOpacity=".35" strokeWidth="1.5" />
            <circle cx={x} cy={y} r={4} fill="var(--pub-turquoise-400)" fillOpacity=".7" />
          </g>
        ))}
        {relayNodes.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} fill="var(--pub-ivory-100)" fillOpacity=".3" />)}
        <circle cx={decisionNode[0]} cy={decisionNode[1]} r={13} fill="var(--pub-deep-900)" stroke="var(--pub-turquoise-400)" strokeWidth="2" />
        <circle cx={decisionNode[0]} cy={decisionNode[1]} r={5} fill="var(--pub-ivory-100)" />
      </svg>
    </IllustrationBase>
  );
}
