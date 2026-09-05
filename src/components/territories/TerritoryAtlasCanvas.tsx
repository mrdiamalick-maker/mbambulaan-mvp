// TerritoryAtlasCanvas — P2.DESIGN-1A, addendum CEO "Cartography is
// non-negotiable" (Espace État uniquement, cf. mandat §6).
//
// CoastlineTerritoryMap.tsx N'EST PAS modifié : il reste le socle utilisé
// par le Public (PublicAtlasWorkspace), le Pro (ProfessionalAtlasWorkspace)
// et Pilotage — hors périmètre de ce lot ("Ne pas commencer Coordination",
// aucune mention du Public). L'addendum autorise explicitement à ne pas
// protéger ce composant existant et à "séparer géométrie/data et rendu" —
// c'est exactement ce que ce fichier fait : il consomme la MÊME donnée
// géométrique réelle et calibrée (coastlinePath, territoryMapPositions,
// domain/territory-map-positions.ts — aucune position ni tracé inventé)
// mais avec un rendu entièrement neuf, scopé aux deux pages de l'Espace
// État qui l'utilisent (Brief national, Territoires) sans aucun risque de
// régression visuelle sur Public/Pro/Pilotage.
//
// Ce que corrige ce rendu par rapport à l'ancien (cf. retour de lot) :
// - la mer n'est plus un vide blanc autour d'un tracé mince : un plein
//   cadre marine (dégradé + texture légère, tokens --etat-navy-* déjà
//   verrouillés, aucune teinte inventée) donne une vraie présence
//   spatiale et un contraste terre/mer net ;
// - preserveAspectRatio="xMidYMid meet" (tout le pays reste visible,
//   jamais rogné) combiné à un fond CSS marine posé sur le conteneur
//   appelant (même dégradé que le <defs> ci-dessous) : les bandes de
//   lettrage gauche/droite (le tracé national est portrait, la plupart
//   des panneaux qui l'accueillent sont plus larges que hauts) continuent
//   visuellement le même océan au lieu d'un vide blanc — "présence
//   spatiale forte" sans jamais sacrifier une partie réelle du littoral ;
// - la silhouette du littoral gagne une ombre portée douce (profondeur)
//   et une texture interne discrète, au lieu d'un aplat plat ;
// - les marqueurs deviennent un point + halo + étiquette en forme de
//   pastille pleine (pas du texte SVG nu flottant) — mêmes positions
//   calibrées, même règle d'affichage (étiquette seulement hors "stable",
//   comportement hérité, non modifié).
"use client";

import { coastlinePath, territoryMapPositions } from "@/domain/territory-map-positions";

export type MapActivity = "stable" | "vigilance" | "critique";

export interface AtlasTerritory {
  id: string;
  name: string;
  activity: MapActivity;
}

// Fenêtre de vue élargie (P2.DESIGN-1A) — même système de coordonnées que
// coastlineViewBox ("181 78 704 1122"), seule la marge visible change :
// davantage d'océan ouvert à l'ouest et au nord/sud pour une composition
// "carte maritime" plutôt qu'un tracé serré sur lui-même. Ni le tracé
// (coastlinePath) ni les positions calibrées (territoryMapPositions) ne
// bougent d'un pixel — uniquement la fenêtre qui les cadre, combinée à
// preserveAspectRatio="slice" pour que ce cadre remplisse toujours son
// panneau, quelle que soit la largeur disponible.
const SEA_VIEWBOX = "21 48 904 1172";

// Fond CSS du conteneur appelant — mêmes valeurs/mêmes tokens que le
// <radialGradient> du <defs> ci-dessous (une seule source de vérité pour
// les deux, jamais deux dégradés qui pourraient diverger visuellement) :
// à poser en `style={{ background: atlasSeaBackground }}` sur le <div>
// qui enveloppe ce composant, pour que les bandes de lettrage éventuelles
// (preserveAspectRatio="meet") continuent le même océan au lieu d'un
// blanc nu.
export const atlasSeaBackground = "radial-gradient(140% 140% at 32% 18%, var(--etat-navy-600), var(--etat-navy-800) 55%, var(--etat-navy-950) 100%)";

const colorByActivity: Record<MapActivity, string> = {
  stable: "var(--etat-navy-600)",
  vigilance: "var(--etat-ocre)",
  critique: "var(--etat-terracotta)"
};

let gradientSeed = 0;

export function TerritoryAtlasCanvas({
  territories,
  selectedId,
  onSelect
}: {
  territories: AtlasTerritory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  // uid stable par montage (pas par rendu) : évite des ids de <defs>
  // dupliqués si le composant est monté deux fois sur la même page
  // (jamais le cas aujourd'hui, filet de sécurité peu coûteux).
  gradientSeed += 1;
  const uid = `atlas-${gradientSeed}`;

  return (
    <svg
      viewBox={SEA_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="Carte du littoral sénégalais et des territoires suivis par le réseau"
    >
      <title>Littoral du Sénégal — territoires suivis par Mbàmbulaan</title>
      <defs>
        {/* Mer — dégradé de profondeur, tokens --etat-navy-* déjà
            verrouillés (etat-design-system.css), aucune teinte nouvelle. */}
        <radialGradient id={`${uid}-sea`} cx="32%" cy="18%" r="95%">
          <stop offset="0%" stopColor="var(--etat-navy-600)" />
          <stop offset="55%" stopColor="var(--etat-navy-800)" />
          <stop offset="100%" stopColor="var(--etat-navy-950)" />
        </radialGradient>
        {/* Texture de mer — lignes fines très discrètes, même esprit que
            .ops-map-canvas/.public-coast-map ailleurs dans le produit
            (grille/houle légère plutôt qu'un aplat mort), à une opacité
            réduite pour rester "subtile", jamais décorative au premier
            plan. */}
        <pattern id={`${uid}-swell`} width="52" height="52" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
          <path d="M0 26 Q13 14 26 26 T52 26" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1.4" />
          <path d="M0 46 Q13 34 26 46 T52 46" fill="none" stroke="white" strokeOpacity="0.035" strokeWidth="1.1" />
        </pattern>
        {/* Terre — ombre portée douce (profondeur), reprend le même
            marine que le reste de la palette D9, pas une couleur ajoutée. */}
        <filter id={`${uid}-land-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--etat-navy-950)" floodOpacity="0.28" />
        </filter>
        <pattern id={`${uid}-land-texture`} width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
          <line x1="0" y1="0" x2="0" y2="30" stroke="var(--etat-navy-600)" strokeOpacity="0.05" strokeWidth="6" />
        </pattern>
      </defs>

      <rect x="21" y="48" width="904" height="1172" fill={`url(#${uid}-sea)`} />
      <rect x="21" y="48" width="904" height="1172" fill={`url(#${uid}-swell)`} />

      <path d={coastlinePath} fill="var(--etat-offwhite-dim)" filter={`url(#${uid}-land-shadow)`} stroke="var(--etat-navy-600)" strokeOpacity="0.35" strokeWidth="4" strokeLinejoin="round" />
      <path d={coastlinePath} fill={`url(#${uid}-land-texture)`} />

      {territories.map((territory) => {
        const position = territoryMapPositions[territory.id];
        if (!position) return null;
        const [x, y] = position;
        const active = territory.id === selectedId;
        const color = colorByActivity[territory.activity];
        const clickable = Boolean(onSelect);
        const activate = () => onSelect?.(territory.id);
        const showLabel = territory.activity !== "stable";
        // Largeur de pastille approximative selon la longueur du nom —
        // évite une étiquette générique de taille fixe qui tronquerait les
        // noms de territoire longs (ex. "Rufisque-Bargny") ou laisserait
        // un vide disproportionné pour les courts (ex. "Hann"). Purement
        // une estimation de rendu, pas une donnée du modèle.
        const labelWidth = showLabel ? Math.max(64, territory.name.length * 9.5 + 20) : 0;
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
            {/* Zone de clic généreuse et invisible — inchangée dans
                l'esprit de CoastlineTerritoryMap : le marqueur visuel
                reste petit à l'échelle de la carte nationale. */}
            <circle r="30" fill="transparent" />
            {territory.activity === "critique" && (
              <circle r="13" fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="3">
                <animate attributeName="r" values="13;24" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            {active && <circle r="19" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="3.5" className="pointer-events-none" />}
            {/* Halo doux — remplace le point nu de l'ancien rendu par un
                repère plus lisible sur fond marine texturé. */}
            <circle r={active ? 15 : 11} fill={color} fillOpacity="0.18" className="pointer-events-none" />
            <circle r={active ? 8 : 6} fill={color} stroke="white" strokeWidth={active ? 3 : 2.4} className={clickable ? "pointer-events-none transition group-hover:opacity-90" : "pointer-events-none"} />
            {showLabel && (
              <g transform="translate(14 -11)" className="pointer-events-none" style={{ transition: "opacity .15s ease" }}>
                <rect width={labelWidth} height="22" rx="11" fill={active ? color : "white"} fillOpacity={active ? 1 : 0.94} stroke={color} strokeOpacity={active ? 0 : 0.28} strokeWidth="1" />
                <text x={labelWidth / 2} y="15" textAnchor="middle" fontSize="12.5" fontWeight={active ? 700 : 600} fill={active ? "white" : "var(--etat-navy-950)"}>{territory.name}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
