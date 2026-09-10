// AtlasMap — P2.DESIGN-1B (mandat CEO "Claude Design V2 → Real Product
// Implementation", §2/§8) : remplace TerritoryAtlasCanvas.tsx (P2.DESIGN-
// 1A, silhouette diagrammatique calibrée à la main) par un rendu adossé à
// la géométrie RÉELLE du Sénégal (Natural Earth 1:50M, domaine public,
// bakée hors-ligne par scripts/generate-senegal-atlas.mjs) — "the CEO
// explicitly rejects the legacy diagrammatic country silhouette as the
// target visual experience."
//
// Décision d'architecture (mandat §8, "no fragile runtime CDN dependency ;
// no unnecessary external network dependency ; real app build must remain
// deterministic") : le prototype Claude Design V2 recharge d3+topojson
// depuis unpkg/jsDelivr À CHAQUE VISITE DE PAGE. Reproduire ça en
// production aurait ajouté une dépendance réseau externe (donc un mode
// dégradé "carte absente si hors-ligne", explicitement rejeté par le
// prototype lui-même : hasGeo reste false tant que le fetch échoue) et
// ~2 dépendances client (d3, topojson) pour un simple calcul de
// projection. Choix retenu : bake la géométrie UNE FOIS (script Node,
// jamais exécuté par l'app), zéro dépendance cartographique côté client —
// seuls les MARQUEURS (Territory.latitude/longitude, réels, jamais
// fabriqués) se projettent au runtime, via la même formule Mercator que
// le bake (domain/geo/mercator.ts, vérifié bit-à-bit contre d3-geo par
// tests/xxl-cartography-v2.test.ts) — donc toujours synchronisés avec la
// géométrie bakée, sans jamais dépendre de d3 pour ça.
"use client";

import { useId, useState } from "react";
import {
  ATLAS_VIEWBOX,
  senegalPath,
  neighbouringCountriesPath,
  graticulePath,
  rivers,
  cityLabels,
  neighbourLabels,
  zoneLabels
} from "@/domain/geo/senegal-atlas-geometry";
import { projectLonLat } from "@/domain/geo/mercator";

export type MapActivity = "stable" | "vigilance" | "critique";

export interface AtlasMapTerritory {
  id: string;
  name: string;
  activity: MapActivity;
  latitude: number;
  longitude: number;
}

const colorByActivity: Record<MapActivity, string> = {
  stable: "#9FB9CE",
  vigilance: "#E0A455",
  critique: "#E05A3C"
};
const dotByActivity: Record<MapActivity, string> = {
  stable: "#8FA9C0",
  vigilance: "#D89A4A",
  critique: "#C8452B"
};
const haloByActivity: Record<MapActivity, string> = {
  stable: "rgba(159,185,206,.16)",
  vigilance: "rgba(224,164,85,.22)",
  critique: "rgba(224,90,60,.30)"
};

// Fond CSS du conteneur appelant — même dégradé océan que les <defs>
// SVG ci-dessous (une seule source de vérité), à poser sur le <div> qui
// enveloppe ce composant pour que d'éventuelles bandes de lettrage
// (preserveAspectRatio="meet") continuent le même océan plutôt qu'un vide.
export const atlasMapBackground = "linear-gradient(165deg, #14304A 0%, #061019 100%)";

const activityLabel: Record<MapActivity, string> = { stable: "Stable", vigilance: "Vigilance", critique: "Critique" };

/** Habillage cartographique commun à /app/etat (Brief national) et
 *  /app/etat/territoires (Atlas territorial) — mandat §1, "une signature
 *  cartographique par périmètre" (P2.DESIGN-1A) reste vraie : Public/Pro/
 *  Pilotage continuent d'utiliser CoastlineTerritoryMap + la silhouette
 *  diagrammatique, non touchés par ce lot. */
export function AtlasMap({
  territories,
  selectedId,
  onSelect,
  showLegend = true,
  showScale = true,
  showAttribution = true,
  zoomTo,
  tooltipLines
}: {
  territories: AtlasMapTerritory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Légende "Niveau d'attention" (compteurs réels par activité) — omise
   *  quand un panneau appelant affiche déjà sa propre légende (mandat
   *  Atlas territorial, rail dédié). */
  showLegend?: boolean;
  /** Échelle 100 km — approximative (dérivée de la même projection
   *  Mercator que le tracé, pas mesurée indépendamment), cohérente avec
   *  le prototype qui l'affiche au même titre. */
  showScale?: boolean;
  showAttribution?: boolean;
  /** Recadrage serré autour d'un territoire (dossier territorial, mandat
   *  §10 "zoom" du prototype) — la géométrie bakée ne change pas, seul le
   *  viewBox affiché change. */
  zoomTo?: { latitude: number; longitude: number; radius?: number };
  /** LOT V3.4 (mandat §8, "marker hover... contextual tooltip") — le
   *  composant reste volontairement "bête" : le contenu de l'info-bulle
   *  vient de l'appelant (texte déjà réel, jamais recalculé ici), AtlasMap
   *  ne fait que le positionner près du marqueur survolé/focus. Par
   *  défaut (aucun prop fourni) : nom + niveau d'activité, déjà réels. */
  tooltipLines?: (territory: AtlasMapTerritory) => string[];
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const resolveTooltipLines = tooltipLines ?? ((t: AtlasMapTerritory) => [t.name, activityLabel[t.activity]]);
  const critiqueCount = territories.filter((t) => t.activity === "critique").length;
  const vigilanceCount = territories.filter((t) => t.activity === "vigilance").length;
  const stableCount = territories.filter((t) => t.activity === "stable").length;

  let viewBox: string = ATLAS_VIEWBOX;
  if (zoomTo) {
    const [cx, cy] = projectLonLat(zoomTo.longitude, zoomTo.latitude);
    const r = zoomTo.radius ?? 90;
    viewBox = `${(cx - r).toFixed(0)} ${(cy - r * 0.68).toFixed(0)} ${(r * 2).toFixed(0)} ${(r * 1.36).toFixed(0)}`;
  }

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block", position: zoomTo ? "absolute" : undefined, inset: zoomTo ? 0 : undefined }}>
      <defs>
        <linearGradient id={`mbOcean-${uid}`} x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor="#14304A" /><stop offset="1" stopColor="#061019" /></linearGradient>
        <linearGradient id={`mbLand-${uid}`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#F3EDDD" /><stop offset="1" stopColor="#DFD4BA" /></linearGradient>
        <pattern id={`mbTerr-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="6" height="6" fill="none" /><rect width="0.8" height="6" fill="rgba(11,26,42,.07)" /></pattern>
        <pattern id={`mbSwell-${uid}`} width="26" height="26" patternUnits="userSpaceOnUse"><path d="M0 13 Q6.5 7.5 13 13 T26 13" fill="none" stroke="rgba(247,243,233,.075)" strokeWidth="1" /></pattern>
      </defs>
      <rect width="900" height="620" fill={`url(#mbOcean-${uid})`} />
      <rect width="900" height="620" fill={`url(#mbSwell-${uid})`} />
      <path d={graticulePath} fill="none" stroke="rgba(247,243,233,.08)" strokeWidth="0.6" />
      <g>
        <path d={senegalPath} fill="none" stroke="rgba(143,169,192,.10)" strokeWidth="30" />
        <path d={senegalPath} fill="none" stroke="rgba(143,169,192,.13)" strokeWidth="18" />
        <path d={senegalPath} fill="none" stroke="rgba(143,169,192,.18)" strokeWidth="8" />
      </g>
      <path d={neighbouringCountriesPath} fill="#1B3047" stroke="rgba(247,243,233,.20)" strokeWidth="0.7" strokeDasharray="4 3" />
      <path d={senegalPath} fill={`url(#mbLand-${uid})`} />
      <path d={senegalPath} fill={`url(#mbTerr-${uid})`} />
      <path d={senegalPath} fill="none" stroke="#B6522F" strokeWidth="1.5" />
      {rivers.map((r, i) => (
        <path key={i} d={r.d} fill="none" stroke="rgba(20,48,74,.42)" strokeWidth="1.6" strokeLinecap="round" />
      ))}
      {!zoomTo && neighbourLabels.map((n) => (
        <text key={n.name} x={n.x} y={n.y} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={10.5} letterSpacing={1.6} fill="rgba(247,243,233,.50)">{n.name}</text>
      ))}
      {!zoomTo && zoneLabels.map((z) => (
        <text key={z.name} x={z.x} y={z.y} textAnchor="end" fontFamily="IBM Plex Mono" fontSize={9.5} letterSpacing={2} fill="rgba(230,162,122,.72)">{z.name}</text>
      ))}
      {!zoomTo && cityLabels.map((c) => (
        <g key={c.name} transform={`translate(${c.x.toFixed(1)},${c.y.toFixed(1)})`}>
          <circle r={2} fill="rgba(11,26,42,.55)" />
          <text x={5} y={3.4} fontFamily="IBM Plex Sans" fontSize={9.5} fill="rgba(11,26,42,.62)">{c.name}</text>
        </g>
      ))}
      {territories.map((t) => {
        const [x, y] = projectLonLat(t.longitude, t.latitude);
        const isSelected = t.id === selectedId;
        const isHovered = t.id === hoveredId;
        const showLabel = zoomTo ? true : t.activity !== "stable" || isSelected;
        const scale = zoomTo ? 0.36 : 1;
        const lines = isHovered ? resolveTooltipLines(t) : [];
        return (
          <g
            key={t.id}
            transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}
            onClick={onSelect ? () => onSelect(t.id) : undefined}
            onMouseEnter={() => setHoveredId(t.id)}
            onMouseLeave={() => setHoveredId((current) => (current === t.id ? null : current))}
            onFocus={() => setHoveredId(t.id)}
            onBlur={() => setHoveredId((current) => (current === t.id ? null : current))}
            onKeyDown={onSelect ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(t.id); } } : undefined}
            style={{ cursor: onSelect ? "pointer" : undefined, outline: "none" }}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `Ouvrir ${t.name}` : undefined}
          >
            {isSelected && !zoomTo && <circle r={13} fill="none" stroke={colorByActivity[t.activity]} strokeWidth="1.2" />}
            {isHovered && !isSelected && <circle r={11} fill="none" stroke={colorByActivity[t.activity]} strokeWidth="1" strokeOpacity="0.6" />}
            <circle r={8 * scale} fill={haloByActivity[t.activity]} className={t.activity === "critique" ? "etat-map-pulse" : undefined} />
            <circle r={4.8 * scale} fill={dotByActivity[t.activity]} stroke="#08131F" strokeWidth={1.2 * scale} />
            {showLabel && (
              <text x={10 * scale} y={3.8 * scale} fontFamily="IBM Plex Sans" fontSize={12 * scale} fontWeight={600} fill="#FFFDF7" stroke="#08131F" strokeWidth={3.6 * scale} paintOrder="stroke">{t.name}</text>
            )}
            {lines.length > 0 && (() => {
              const boxWidth = Math.max(...lines.map((line) => line.length)) * 5.6 + 20;
              const boxHeight = lines.length * 14 + 14;
              const flip = x > 700;
              const boxX = flip ? -boxWidth - 14 : 14;
              return (
                <g transform={`translate(${boxX},-${boxHeight + 6})`} className="pointer-events-none">
                  <rect width={boxWidth} height={boxHeight} rx={4} fill="rgba(8,19,31,.92)" stroke="rgba(247,243,233,.28)" strokeWidth="0.7" />
                  {lines.map((line, index) => (
                    <text key={index} x={10} y={17 + index * 14} fontFamily="IBM Plex Sans" fontSize={index === 0 ? 11.5 : 10} fontWeight={index === 0 ? 700 : 500} fill={index === 0 ? "#FFFDF7" : "rgba(247,243,233,.78)"}>{line}</text>
                  ))}
                </g>
              );
            })()}
          </g>
        );
      })}
      {showLegend && (
        <g transform="translate(24,24)">
          <rect width="212" height="106" fill="rgba(8,19,31,.86)" stroke="rgba(247,243,233,.20)" />
          <text x="18" y="26" fontFamily="IBM Plex Sans" fontSize="9.5" letterSpacing="1.5" fill="rgba(247,243,233,.62)">NIVEAU D’ATTENTION</text>
          <g transform="translate(18,44)"><circle r="3.5" fill="#E05A3C" /><text x="12" y="4" fontFamily="IBM Plex Sans" fontSize="11.5" fill="rgba(255,253,247,.92)">Critique · {critiqueCount}</text></g>
          <g transform="translate(18,66)"><circle r="3.5" fill="#E0A455" /><text x="12" y="4" fontFamily="IBM Plex Sans" fontSize="11.5" fill="rgba(255,253,247,.92)">Vigilance · {vigilanceCount}</text></g>
          <g transform="translate(18,88)"><circle r="3.5" fill="#9FB9CE" /><text x="12" y="4" fontFamily="IBM Plex Sans" fontSize="11.5" fill="rgba(255,253,247,.92)">Stable · {stableCount}</text></g>
        </g>
      )}
      {showScale && (
        <g transform="translate(796,586)">
          <line x1="-64" y1="0" x2="0" y2="0" stroke="rgba(255,253,247,.75)" strokeWidth="3" />
          <line x1="-64" y1="-5.5" x2="-64" y2="5.5" stroke="rgba(255,253,247,.75)" />
          <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="rgba(255,253,247,.75)" />
          <text x="-32" y="-9" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="9.5" fill="rgba(255,253,247,.75)">100 km</text>
        </g>
      )}
      {showAttribution && (
        <text x="24" y="600" fontFamily="IBM Plex Mono" fontSize="9.5" letterSpacing="0.08em" fill="rgba(255,253,247,.62)">Projection Mercator · géométrie Natural Earth 1:50 M (domaine public)</text>
      )}
    </svg>
  );
}
