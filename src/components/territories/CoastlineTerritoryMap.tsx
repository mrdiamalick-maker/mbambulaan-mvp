// Carte territoriale — Lot B, Audit DA Premium XXL v2 (mandat CEO
// 2026-08-17). Réutilise le tracé littoral calibré et vérifié de
// PublicAtlasWorkspace.tsx (cf. domain/territory-map-positions.ts pour la
// provenance exacte) plutôt que d'inventer une nouvelle géométrie — seule
// la géométrie est reprise, pas l'habillage visuel : Public rend ce tracé
// sur fond marine sombre, ici le fond reste clair (etat-panel), cohérent
// avec la cible 65-70% crème/blanc du mandat (§2). Pas de teinte bleue pour
// l'eau (contrairement à l'illustration de référence) : la palette D9
// verrouillée n'a pas de bleu, une nouvelle teinte n'est pas introduite
// pour un simple effet décoratif.
//
// Couleurs paramétrables (Lot A, gap analysis Pilotage, arbitrage CEO
// 2026-08-17, option 2) : les tokens --etat-* ci-dessous en valeurs par
// défaut ne sont définis qu'à l'intérieur de .etat-scope
// (etat-design-system.css), pas sur :root — contrairement aux tokens
// --pub-* du Public qui sont globaux. Ce composant était donc invisible
// (couleurs non résolues) hors d'un ancêtre .etat-scope. La prop `colors`
// permet de le réutiliser tel quel sur des pages en .shadcn-scope
// (Pilotage, puis Coordination/Rapport) sans dupliquer le composant ni
// l'envelopper artificiellement dans un .etat-scope local — les valeurs
// par défaut restent strictement identiques à l'usage existant sur
// /app/etat (Lots B/C/D), aucune régression visuelle.
"use client";

import { coastlinePath, coastlineViewBox, territoryMapPositions } from "@/domain/territory-map-positions";

export type MapActivity = "stable" | "vigilance" | "critique";

export interface CoastlineTerritoryMapColors {
  stable: string;
  vigilance: string;
  critique: string;
  land: string;
  landStroke: string;
}

const defaultColors: CoastlineTerritoryMapColors = {
  stable: "var(--etat-navy-600)",
  vigilance: "var(--etat-ocre)",
  critique: "var(--etat-terracotta)",
  land: "var(--etat-offwhite-dim)",
  landStroke: "var(--etat-navy-600)"
};

export interface MapTerritory {
  id: string;
  name: string;
  activity: MapActivity;
}

export function CoastlineTerritoryMap({
  territories,
  selectedId,
  onSelect,
  colors,
  viewBox
}: {
  territories: MapTerritory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  colors?: Partial<CoastlineTerritoryMapColors>;
  // Refonte Premium XXL Espace État (Lot 1, mandat CEO 2026-08-21) : prop
  // additif, défaut inchangé (coastlineViewBox, exactement le comportement
  // précédent) — /app/pilotage, seul autre appelant, ne passe pas ce prop
  // et n'est donc affecté en rien. Le tracé (coastlinePath) et les
  // positions calibrées (territoryMapPositions) restent strictement
  // intouchés : le viewBox n'est qu'une fenêtre sur ce même espace de
  // coordonnées, jamais une nouvelle géométrie.
  viewBox?: string;
}) {
  const tone: CoastlineTerritoryMapColors = { ...defaultColors, ...colors };
  return (
    <svg viewBox={viewBox ?? coastlineViewBox} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label="Carte illustrative du littoral sénégalais et des territoires suivis par le réseau">
      <title>Littoral du Sénégal — territoires suivis par Mbàmbulaan</title>
      <path d={coastlinePath} fill={tone.land} stroke={tone.landStroke} strokeOpacity="0.3" strokeWidth="4" strokeLinejoin="round" />
      {territories.map((territory) => {
        const position = territoryMapPositions[territory.id];
        if (!position) return null;
        const [x, y] = position;
        const active = territory.id === selectedId;
        const color = tone[territory.activity];
        const clickable = Boolean(onSelect);
        const activate = () => onSelect?.(territory.id);
        return (
          <g
            key={territory.id}
            transform={`translate(${x} ${y})`}
            className={clickable ? "group cursor-pointer outline-none" : undefined}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-label={clickable ? `Ouvrir ${territory.name}` : undefined}
            aria-pressed={clickable ? active : undefined}
            onClick={clickable ? activate : undefined}
            onKeyDown={clickable ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } } : undefined}
          >
            {/* Zone de clic généreuse et invisible — même raison que
                PublicAtlasWorkspace : le marqueur visuel est trop petit
                pour rester tapable une fois la carte réduite sur mobile. */}
            <circle r="26" fill="transparent" />
            {territory.activity === "critique" && (
              <circle r="11" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="2.5">
                <animate attributeName="r" values="11;20" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            {active && <circle r="16" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="3" className="pointer-events-none" />}
            <circle r={active ? 10 : territory.activity === "stable" ? 6 : 8} fill={color} stroke="#fff" strokeWidth={active ? 3 : 2} className={clickable ? "pointer-events-none transition group-hover:opacity-90" : "pointer-events-none"} />
            {territory.activity !== "stable" && (
              <text x={14} y={5} fontSize={active ? 20 : 17} fontWeight={active ? 700 : 600} fill={color} style={{ pointerEvents: "none" }}>{territory.name}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
