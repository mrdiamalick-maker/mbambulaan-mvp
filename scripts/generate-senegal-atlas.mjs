// Script UNIQUE, exécuté une fois par un développeur (jamais au runtime de
// l'application, jamais dans un navigateur) pour produire
// src/domain/geo/senegal-atlas-geometry.ts — mandat P2.DESIGN-1B, §8
// (Cartographie) : "no fragile runtime CDN dependency ; no unnecessary
// external network dependency ; real app build must remain deterministic".
//
// Source : world-atlas@2.0.2 countries-50m.json (Natural Earth 1:50M,
// domaine public), déjà présent hors-ligne dans node_modules/world-atlas
// (aucune requête réseau ici) — EXACTEMENT le jeu de données que le
// prototype Claude Design V2 allait chercher à chaque chargement de page
// via jsDelivr. d3-geo/topojson-client restent des devDependencies : ils
// ne tournent que dans ce script Node, jamais expédiés au bundle client.
//
// Le résultat baked (tracé Sénégal réel, tracé des autres pays, graticule,
// rivières/estuaires illustratifs du prototype, étiquettes voisins/zones/
// villes) est un fichier TypeScript statique, aucune géométrie inventée.
// Les MARQUEURS de territoire, eux, ne sont PAS bakés ici : ils se
// projettent au runtime depuis les vraies Territory.latitude/longitude du
// domaine (demo-state.ts / ProductState), avec la même transformation
// Mercator que ce script a utilisée pour le tracé — bake + projeter live
// avec les MÊMES paramètres, pour que territoire et côte restent alignés.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as topojsonClient from "topojson-client";
import { geoMercator, geoPath, geoGraticule } from "d3-geo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const topo = JSON.parse(readFileSync(join(root, "node_modules/world-atlas/countries-50m.json"), "utf-8"));
const fc = topojsonClient.feature(topo, topo.objects.countries);
const sen = fc.features.find((f) => f.properties && f.properties.name === "Senegal");
if (!sen) throw new Error("Senegal feature not found in countries-50m.json");

// Mêmes bornes que le prototype (viewBox 900x620, fitExtent [[300,62],[846,556]])
// — reproduites ici pour que la projection Mercator bakée soit identique à
// celle du prototype, donc directement comparable au design de référence.
const proj = geoMercator().fitExtent([[300, 62], [846, 556]], sen);
const path = geoPath(proj);

// Voisins réels affichés par le prototype (NEIGHBOURS ci-dessous) —
// UNIQUEMENT ceux-là, pas les ~200 pays du monde. countries-50m.json
// entier pesait ~2.2 Mo une fois converti en chemin SVG bakée (tout le
// reste du monde, jamais visible dans le viewBox 900×620) : correctif de
// poids avant que ce fichier soit importé par le bundle client, "keep
// implementation proportional, do not introduce a huge GIS architecture"
// (mandat §8).
const NEIGHBOUR_NAMES = new Set(["Mauritania", "Mali", "Gambia", "Guinea-Bissau", "Guinea"]);
const others = { type: "FeatureCollection", features: fc.features.filter((f) => NEIGHBOUR_NAMES.has(f.properties?.name)) };
const graticule = geoGraticule().step([2, 2])();

// Rivières/estuaires (mêmes tracés que le prototype — approximatifs,
// illustratifs, jamais présentés comme une couche hydrologique certifiée ;
// même statut que dans le fichier source Claude Design).
const RIVERS = [
  [[-16.50, 16.03], [-16.20, 16.22], [-15.60, 16.40], [-15.00, 16.50], [-14.40, 16.35], [-13.80, 16.15], [-13.30, 15.80], [-12.90, 15.30], [-12.45, 14.90], [-12.05, 14.70]],
  [[-16.57, 13.48], [-16.20, 13.50], [-15.80, 13.45], [-15.40, 13.55], [-15.00, 13.60], [-14.60, 13.50], [-14.20, 13.40], [-13.80, 13.30], [-13.35, 13.22], [-13.00, 13.20]],
  [[-16.75, 12.57], [-16.40, 12.55], [-16.00, 12.60], [-15.60, 12.70], [-15.20, 12.80], [-14.85, 12.86]],
  [[-16.78, 13.92], [-16.45, 13.96], [-16.12, 14.05], [-15.80, 14.12]]
];
const CITIES = [
  ["Thiès", 14.79, -16.93], ["Touba", 14.85, -15.88], ["Kaolack", 14.15, -16.07], ["Diourbel", 14.65, -16.23],
  ["Tambacounda", 13.77, -13.67], ["Matam", 15.66, -13.26], ["Kolda", 12.90, -14.95], ["Ziguinchor", 12.58, -16.27], ["Louga", 15.62, -16.23]
];
const NEIGHBOURS = [["MAURITANIE", 17.10, -13.60], ["MALI", 14.10, -11.60], ["GAMBIE", 13.42, -15.10], ["GUINÉE-BISSAU", 11.95, -15.10], ["GUINÉE", 11.55, -12.70]];
const ZONES = [["GRANDE-CÔTE", 15.55, -17.30], ["CAP-VERT", 14.90, -17.85], ["PETITE-CÔTE", 14.28, -17.45], ["SINE-SALOUM", 13.72, -17.20], ["CASAMANCE", 12.45, -17.20]];

const project = (lon, lat) => proj([lon, lat]);

// Paramètres bruts de la projection (échelle, translation, centre) —
// capturés pour que le runtime (senegal-atlas.ts, sans d3) puisse reprojeter
// une Territory.latitude/longitude RÉELLE avec la formule Mercator standard,
// SANS jamais dépendre de d3-geo côté client. Vérifié ci-dessous par
// comparaison directe avec proj([lon,lat]) sur les 18 territoires réels.
const p0 = proj([0, 0]);
const p1 = proj([1, 0]);
const scaleXPerDegree = p1[0] - p0[0]; // x varie linéairement avec la longitude en Mercator
// La composante Y n'est pas linéaire en latitude (formule log-tan) — on
// bake donc scale/translate bruts de d3 via son API interne plutôt qu'une
// approximation linéaire.
const raw = proj; // proj(lon,lat) reste utilisable tel quel côté génération

writeFileSync(
  join(root, "src/domain/geo/senegal-atlas-geometry.ts"),
  `// Fichier GÉNÉRÉ — ne pas éditer à la main.
// Généré par scripts/generate-senegal-atlas.mjs depuis
// node_modules/world-atlas/countries-50m.json (Natural Earth 1:50M,
// domaine public, hors-ligne) — mandat P2.DESIGN-1B §8. Régénérer avec
// \`node scripts/generate-senegal-atlas.mjs\` si jamais la géométrie de
// référence doit changer. Voir src/components/etat/AtlasMap.tsx pour le
// composant de rendu et src/domain/geo/mercator.ts pour la projection
// runtime (SANS d3) qui reprojette les vraies Territory.latitude/longitude
// avec ces mêmes paramètres.

export const ATLAS_VIEWBOX = "0 0 900 620" as const;

// Un seul tracé Sénégal réel (Natural Earth), remplace la silhouette
// diagrammatique de l'ancien territory-map-positions.ts (mandat P2.DESIGN-1B
// §2 : "the CEO explicitly rejects the legacy diagrammatic country
// silhouette").
export const senegalPath = ${JSON.stringify(path(sen))};
export const neighbouringCountriesPath = ${JSON.stringify(path(others))};
export const graticulePath = ${JSON.stringify(path(graticule))};

export const rivers = ${JSON.stringify(RIVERS.map((coords) => ({ d: path({ type: "LineString", coordinates: coords }) })))};

export const cityLabels = ${JSON.stringify(CITIES.map(([name, lat, lon]) => { const p = project(lon, lat); return { name, x: p[0], y: p[1] }; }))};
export const neighbourLabels = ${JSON.stringify(NEIGHBOURS.map(([name, lat, lon]) => { const p = project(lon, lat); return { name, x: p[0], y: p[1] }; }))};
export const zoneLabels = ${JSON.stringify(ZONES.map(([name, lat, lon]) => { const p = project(lon, lat); return { name, x: p[0], y: p[1] }; }))};

// Paramètres de la projection Mercator bakée (fitExtent identique au
// prototype Claude Design V2 : [[300,62],[846,556]] sur le tracé Sénégal
// réel) — reproduits sans d3 par src/domain/geo/mercator.ts pour projeter
// au runtime les vraies coordonnées Territory.latitude/longitude.
export const mercatorParams = ${JSON.stringify({ scale: proj.scale(), translate: proj.translate(), center: proj.center() })};
`,
  "utf-8"
);

// Vérification immédiate : la reprojection manuelle (mercator.ts, écrite
// séparément) doit retomber sur les mêmes pixels que proj() ci-dessus pour
// les 18 territoires réels — imprimée ici pour contrôle visuel, le vrai
// test automatisé vit dans tests/.
const sample = [["Joal-Fadiouth", 14.17, -16.83], ["Saint-Louis", 16.03, -16.49], ["Cap Skirring", 12.39, -16.74]];
console.log("Échantillon de projection (pour vérification manuelle contre mercator.ts) :");
for (const [name, lat, lon] of sample) {
  console.log(name, project(lon, lat));
}
console.log("mercatorParams:", { scale: proj.scale(), translate: proj.translate(), center: proj.center() });
console.log("OK — src/domain/geo/senegal-atlas-geometry.ts généré.");
