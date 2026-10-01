// Géométrie du littoral sénégalais pour l'Atlas et le Brief. Contrairement
// au standalone (qui va chercher world-atlas + d3 + topojson au CDN à
// l'ouverture de la page), la géométrie est ici bakée au build par
// scripts/generate-private-v3-geo.mjs avec exactement les mêmes paramètres
// de projection (fitExtent [[40,40],[860,560]] sur un viewBox 900×600) :
// aucune requête réseau, aucun état de chargement, un rendu identique dès
// le premier paint.
import { v3GraticulePath, v3OthersPath, v3Project, v3RiverPaths, v3SenegalPath, V3_VIEWBOX } from "../data/geo-generated";

export const ATLAS_VIEWBOX = V3_VIEWBOX;

export const geo = {
  sen: v3SenegalPath,
  others: v3OthersPath,
  grat: v3GraticulePath,
  rivers: v3RiverPaths
};

export function project(lon: number, lat: number): [number, number] {
  return v3Project(lon, lat);
}

// Fenêtre resserrée sur la Petite-Côte / Cap-Vert, utilisée par la carte
// compacte du Brief (mêmes bornes géographiques que le standalone :
// [-17.9, 16.9] → [-15.6, 12.2]).
export function briefViewBox(): string {
  const a = project(-17.9, 16.9);
  const b = project(-15.6, 12.2);
  return `${a[0].toFixed(0)} ${a[1].toFixed(0)} ${(b[0] - a[0]).toFixed(0)} ${(b[1] - a[1]).toFixed(0)}`;
}
