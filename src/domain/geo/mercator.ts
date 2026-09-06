// Projection Mercator runtime — SANS d3 (mandat P2.DESIGN-1B §8 :
// "no unnecessary external network dependency", et par extension aucune
// dépendance de rendu supplémentaire côté client pour un simple calcul de
// projection). Reproduit exactement la formule sphérique de d3-geo
// (geoMercator, rotation nulle, centre [0,0]) avec les paramètres
// (scale/translate) bakés une fois par scripts/generate-senegal-atlas.mjs
// dans senegal-atlas-geometry.ts — mêmes coordonnées écran que le tracé
// Sénégal réel qui y est baké, donc territoire et côte restent alignés.
//
// Vérifié par tests/xxl-mercator-projection.test.ts : les 18 territoires
// réels (ProductState) projetés ici retombent, à 0.01px près, sur les
// coordonnées produites par d3-geo au moment du bake (mêmes formules,
// mêmes paramètres — cf. commentaire de vérification dans le script).
import { mercatorParams } from "./senegal-atlas-geometry";

const DEG2RAD = Math.PI / 180;

/** Projette une coordonnée géographique réelle (Territory.latitude/
 *  longitude) sur le plan [x, y] du viewBox 900×620 baké — jamais une
 *  position inventée ou recalibrée à la main, contrairement à l'ancien
 *  territory-map-positions.ts qu'il remplace. */
export function projectLonLat(longitude: number, latitude: number): [number, number] {
  const lambda = longitude * DEG2RAD;
  const phi = latitude * DEG2RAD;
  const rawX = lambda;
  const rawY = Math.log(Math.tan(Math.PI / 4 + phi / 2));
  const [tx, ty] = mercatorParams.translate;
  const k = mercatorParams.scale;
  return [tx + k * rawX, ty - k * rawY];
}
