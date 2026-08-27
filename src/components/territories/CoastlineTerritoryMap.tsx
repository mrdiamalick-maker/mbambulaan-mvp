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
  viewBox,
  landFillOpacity,
  backgroundImageSrc
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
  // Correctif CEO ("l'Atlas se superpose avec la terre pleine de
  // l'arrière-plan", mandat "Brief national") : le remplissage "terre" en
  // aplat opaque masquait la texture de l'asset d'illustration réel posé
  // en fond sur /app/etat (fond Atlas, lot précédent) — couture visible à
  // la frontière terre/eau. Prop additive, défaut 1 (opaque, comportement
  // EXACT d'avant) : /app/pilotage, seul autre appelant, ne passe pas ce
  // prop et n'est donc affecté en rien — même discipline que `colors`/
  // `viewBox` ci-dessus, un changement scopé à /app/etat via une prop
  // plutôt qu'un changement du défaut partagé.
  landFillOpacity?: number;
  // Correctif "l'image de fond ne suit pas la caméra" (mandat CEO
  // 2026-08-27, diagnostic confirmé : le fond était un <img> next/image
  // posé au-dessus du SVG, totalement déconnecté du viewBox animé — les
  // deux couches se désynchronisaient dès qu'on zoomait/paniquait sur un
  // territoire). Prop additive, défaut undefined (aucune image rendue,
  // comportement EXACT d'avant) : /app/pilotage, seul autre appelant, ne
  // passe pas ce prop et n'est donc affecté en rien — même discipline que
  // `colors`/`viewBox`/`landFillOpacity` ci-dessus. Rendue comme <image>
  // DANS ce même <svg viewBox=...>, pas comme calque DOM séparé : un seul
  // système de coordonnées (le viewBox partagé avec coastlinePath et
  // territoryMapPositions) pilote l'image ET le tracé — pas de transform
  // CSS équivalente à recalculer séparément par breakpoint, pas de
  // seconde interpolation à garder synchronisée avec useAnimatedViewBox.
  // Coût assumé (signalé au CEO, approuvé) : perte de l'optimisation
  // next/image (négociation de format, srcset responsive) pour cette
  // image précise — impact limité, l'asset est déjà un WebP pré-compressé
  // et purement décoratif (priority={false} côté appelant).
  backgroundImageSrc?: string;
}) {
  const tone: CoastlineTerritoryMapColors = { ...defaultColors, ...colors };
  const resolvedLandFillOpacity = landFillOpacity ?? 1;
  const effectiveViewBox = viewBox ?? coastlineViewBox;
  // Compensation de zoom (correctif CEO 2026-08-22, caméra Atlas) : les
  // marqueurs/labels sont dessinés en unités SVG absolues, calibrées pour
  // le viewBox national. Une fenêtre resserrée (caméra régionale) réduit
  // mécaniquement la largeur du viewBox — sans compensation, les mêmes
  // valeurs absolues occupent une part bien plus grande de l'écran
  // (labels géants qui se chevauchent, confirmé par capture). `scale`
  // ramène chaque taille à son équivalent visuel constant, quel que soit
  // le cadrage. Vaut exactement 1 pour /app/pilotage (qui ne passe jamais
  // `viewBox`) et pour la vue nationale d'État — aucune régression sur
  // les deux usages déjà validés.
  const [, , effectiveWidth] = effectiveViewBox.split(" ").map(Number);
  const [nationalX, nationalY, nationalWidth, nationalHeight] = coastlineViewBox.split(" ").map(Number);
  const zoomRatio = nationalWidth / effectiveWidth;
  const scale = (value: number) => value / zoomRatio;
  return (
    <svg viewBox={effectiveViewBox} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label="Carte illustrative du littoral sénégalais et des territoires suivis par le réseau">
      <title>Littoral du Sénégal — territoires suivis par Mbàmbulaan</title>
      {backgroundImageSrc && (
        // Ancrée sur la boîte NATIONALE (coastlineViewBox), pas sur
        // effectiveViewBox : l'image reste fixe dans l'espace de
        // coordonnées partagé, c'est le viewBox du <svg> lui-même (animé
        // par useAnimatedViewBox côté appelant) qui la pan/zoome — exactement
        // le même mécanisme que pour coastlinePath et territoryMapPositions,
        // jamais un second calcul de position. preserveAspectRatio="slice"
        // (recadre, ne bande pas) pour reproduire le comportement
        // object-cover du <Image> next/image qu'elle remplace.
        <image href={backgroundImageSrc} x={nationalX} y={nationalY} width={nationalWidth} height={nationalHeight} preserveAspectRatio="xMidYMid slice" />
      )}
      <path d={coastlinePath} fill={tone.land} fillOpacity={resolvedLandFillOpacity} stroke={tone.landStroke} strokeOpacity="0.3" strokeWidth={scale(4)} strokeLinejoin="round" />
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
            <circle r={scale(26)} fill="transparent" />
            {territory.activity === "critique" && (
              <circle r={scale(11)} fill="none" stroke={color} strokeOpacity="0.4" strokeWidth={scale(2.5)}>
                <animate attributeName="r" values={`${scale(11)};${scale(20)}`} dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            {active && <circle r={scale(16)} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth={scale(3)} className="pointer-events-none" />}
            <circle r={scale(active ? 10 : territory.activity === "stable" ? 6 : 8)} fill={color} stroke="#fff" strokeWidth={scale(active ? 3 : 2)} className={clickable ? "pointer-events-none transition group-hover:opacity-90" : "pointer-events-none"} />
            {territory.activity !== "stable" && (
              <text x={scale(14)} y={scale(5)} fontSize={scale(active ? 20 : 17)} fontWeight={active ? 700 : 600} fill={color} style={{ pointerEvents: "none" }}>{territory.name}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
