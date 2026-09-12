// Script UNIQUE, exécuté une fois par un développeur (jamais au runtime de
// l'application, jamais dans un navigateur) pour produire
// src/v3-template/data/geo-generated.ts.
//
// Contexte : lot "Private V3 — clean template" (rebuild fidèle du standalone
// Claude Design V3). Ce script est une copie volontairement isolée de
// scripts/generate-senegal-atlas.mjs (qui alimente l'Espace État existant,
// hors-scope pour ce lot) — même technique (bake au build, aucune requête
// réseau au runtime), mais reproduisant EXACTEMENT les paramètres de
// projection du standalone V3 (viewBox "0 0 900 600",
// fitExtent [[40,40],[860,560]], graticule pas [2,2]) pour que le tracé
// baké soit pixel-identique à la source de vérité de ce lot.
//
// Source : world-atlas@2.0.2 countries-50m.json (Natural Earth 1:50M,
// domaine public), déjà présent hors-ligne dans node_modules/world-atlas.
// d3-geo / topojson-client restent des devDependencies : ils ne tournent
// que dans ce script Node, jamais expédiés au bundle client.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as topojsonClient from "topojson-client";
import { geoMercator, geoPath, geoGraticule } from "d3-geo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Sénégal en 50m (détail fin : c'est le tracé que l'œil étudie).
const topo50 = JSON.parse(readFileSync(join(root, "node_modules/world-atlas/countries-50m.json"), "utf-8"));
const fc50 = topojsonClient.feature(topo50, topo50.objects.countries);
const sen = fc50.features.find((f) => f.properties && f.properties.name === "Senegal");
if (!sen) throw new Error("Senegal feature not found in countries-50m.json");

// Bornes identiques au standalone V3 : d3.geoMercator().fitExtent([[40, 40], [860, 560]], sen)
// sur un viewBox "0 0 900 600".
const proj = geoMercator().fitExtent([[40, 40], [860, 560]], sen);
// digits(2) : précision suffisante à cette échelle, réduit fortement la
// taille du fichier généré par rapport à la précision flottante par défaut.
const path = geoPath(proj).digits(2);

// Reste du monde en 110m (silhouette d'arrière-plan, faible opacité dans le
// design — la finesse à 50m y est imperceptible et coûterait ~1,8 Mo de
// texte de tracé pour rien). Même topologie Natural Earth, résolution
// moindre.
const topo110 = JSON.parse(readFileSync(join(root, "node_modules/world-atlas/countries-110m.json"), "utf-8"));
const fc110 = topojsonClient.feature(topo110, topo110.objects.countries);
const others = { type: "FeatureCollection", features: fc110.features.filter((f) => !(f.properties && f.properties.name === "Senegal")) };

// Rivières/estuaires illustratifs — coordonnées identiques à la constante
// RIVERS du standalone V3 (mêmes 4 tracés).
const RIVERS = [
  [[-16.50, 16.03], [-16.20, 16.22], [-15.60, 16.40], [-15.00, 16.50], [-14.40, 16.35], [-13.80, 16.15], [-13.30, 15.80], [-12.90, 15.30], [-12.45, 14.90], [-12.05, 14.70]],
  [[-16.57, 13.48], [-16.20, 13.50], [-15.80, 13.45], [-15.40, 13.55], [-15.00, 13.60], [-14.60, 13.50], [-14.20, 13.40], [-13.80, 13.30], [-13.35, 13.22], [-13.00, 13.20]],
  [[-16.75, 12.57], [-16.40, 12.55], [-16.00, 12.60], [-15.60, 12.70], [-15.20, 12.80], [-14.85, 12.86]],
  [[-16.78, 13.92], [-16.45, 13.96], [-16.12, 14.05], [-15.80, 14.12]]
];

const senPath = path(sen);
const othersPath = path(others);
// Graticule restreinte à la fenêtre réellement visible (le standalone
// génère une grille mondiale puis ne rend que ce qui tombe dans le
// viewBox — ici on borne la géométrie en amont : même rendu visuel, sans
// les milliers de segments hors-cadre qui gonflaient le tracé à ~400 Ko).
const grat = geoGraticule().step([2, 2]).extent([[-19, 9], [-10, 19]]);
const gratPath = path(grat());
const riverPaths = RIVERS.map((c) => path({ type: "LineString", coordinates: c }));

// Grille de projection Mercator échantillonnée (lon/lat -> x/y) que le
// runtime réutilise pour positionner marqueurs de territoire, zones et
// pays voisins SANS expédier d3-geo au client (mêmes paramètres de
// fitExtent que ci-dessus, donc alignée avec le tracé baké).
const SAMPLE_STEP = 0.25;
const grid = [];
for (let lon = -18.5; lon <= -10.5; lon += SAMPLE_STEP) {
  const row = [];
  for (let lat = 10.5; lat <= 17.5; lat += SAMPLE_STEP) {
    const p = proj([lon, lat]);
    row.push([Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);
  }
  grid.push(row);
}

const out = `// Fichier GÉNÉRÉ — ne pas éditer à la main.
// Généré par scripts/generate-private-v3-geo.mjs depuis
// node_modules/world-atlas/countries-50m.json (Natural Earth 1:50M,
// domaine public, hors-ligne). Reproduit exactement la projection du
// standalone Claude Design V3 (viewBox "0 0 900 600",
// fitExtent [[40,40],[860,560]]). Régénérer avec
// \`node scripts/generate-private-v3-geo.mjs\` si la géométrie de
// référence doit changer.
//
// Isolé de src/domain/geo/senegal-atlas-geometry.ts (Espace État existant,
// hors-scope de ce lot) — même technique, paramètres propres au template V3.

export const V3_VIEWBOX = "0 0 900 600" as const;
export const V3_GEO_BOUNDS = { lonMin: -18.5, lonMax: -10.5, latMin: 10.5, latMax: 17.5, step: ${SAMPLE_STEP} } as const;

export const v3SenegalPath = ${JSON.stringify(senPath)};
export const v3OthersPath = ${JSON.stringify(othersPath)};
export const v3GraticulePath = ${JSON.stringify(gratPath)};
export const v3RiverPaths: string[] = ${JSON.stringify(riverPaths)};

// grid[i][j] = projection de (lonMin + i*step, latMin + j*step) -> [x, y]
// dans le repère du viewBox ci-dessus. project() ci-dessous interpole
// bilinéairement pour retrouver une projection quasi continue sans
// embarquer d3-geo côté client.
const v3Grid: [number, number][][] = ${JSON.stringify(grid)};

export function v3Project(lon: number, lat: number): [number, number] {
  const { lonMin, latMin, step } = V3_GEO_BOUNDS;
  const fi = (lon - lonMin) / step;
  const fj = (lat - latMin) / step;
  const i0 = Math.max(0, Math.min(v3Grid.length - 2, Math.floor(fi)));
  const j0 = Math.max(0, Math.min(v3Grid[0].length - 2, Math.floor(fj)));
  const ti = fi - i0, tj = fj - j0;
  const a = v3Grid[i0][j0], b = v3Grid[i0 + 1][j0], cc = v3Grid[i0][j0 + 1], d = v3Grid[i0 + 1][j0 + 1];
  const x = a[0] * (1 - ti) * (1 - tj) + b[0] * ti * (1 - tj) + cc[0] * (1 - ti) * tj + d[0] * ti * tj;
  const y = a[1] * (1 - ti) * (1 - tj) + b[1] * ti * (1 - tj) + cc[1] * (1 - ti) * tj + d[1] * ti * tj;
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}
`;

writeFileSync(join(root, "src/v3-template/data/geo-generated.ts"), out, "utf-8");
console.log("Written src/v3-template/data/geo-generated.ts");
