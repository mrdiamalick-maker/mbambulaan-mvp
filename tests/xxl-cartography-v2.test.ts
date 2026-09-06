import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { geoMercator } from "d3-geo";
import * as topojsonClient from "topojson-client";
import { createDemoState } from "../src/data/demo-state";
import { AtlasMap } from "../src/components/etat/AtlasMap";
import { projectLonLat } from "../src/domain/geo/mercator";
import { senegalPath, neighbouringCountriesPath, mercatorParams } from "../src/domain/geo/senegal-atlas-geometry";

// P2.DESIGN-1B §8 (Cartographie) — AtlasMap remplace TerritoryAtlasCanvas
// (silhouette diagrammatique calibrée à la main, P2.DESIGN-1A) par un
// rendu adossé à la géométrie RÉELLE du Sénégal (Natural Earth 1:50M,
// bakée hors-ligne par scripts/generate-senegal-atlas.mjs). Ce fichier
// remplace tests/xxl-r55-cartographic-signature.test.ts pour la partie
// spécifique à l'Espace État (TEST A/B/C/D là-bas) — CoastlineTerritoryMap
// (Pro/Public/Pilotage) reste inchangé et continue d'être vérifié par ce
// même fichier historique (TEST C2/E/F/G).
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}
(globalThis as Record<string, unknown>).React = React;

// TEST A — la projection runtime (mercator.ts, sans d3) retombe EXACTEMENT
// sur la projection d3-geo utilisée au bake, pour les 18 territoires
// réels du jeu de démonstration — jamais une position recalibrée à la
// main, contrairement à l'ancien territory-map-positions.ts.
test("TEST A — la projection Mercator runtime reproduit exactement d3-geo pour les 18 territoires réels", () => {
  const topo = JSON.parse(readFileSync(fileURLToPath(new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url)), "utf-8"));
  const fc = topojsonClient.feature(topo, topo.objects.countries) as unknown as { features: Array<{ properties?: { name?: string } }> };
  const sen = fc.features.find((f) => f.properties?.name === "Senegal");
  assert.ok(sen, "le feature Senegal doit exister dans countries-50m.json");
  const proj = geoMercator().fitExtent([[300, 62], [846, 556]], sen as never);
  assert.deepEqual(proj.scale(), mercatorParams.scale, "l'échelle bakée doit correspondre à celle recalculée à partir de la même source");
  assert.deepEqual(proj.translate(), mercatorParams.translate, "la translation bakée doit correspondre à celle recalculée à partir de la même source");

  const state = createDemoState();
  for (const territory of state.territories) {
    const [d3x, d3y] = proj([territory.longitude, territory.latitude]) as [number, number];
    const [myX, myY] = projectLonLat(territory.longitude, territory.latitude);
    assert.ok(Math.abs(d3x - myX) < 0.01, `${territory.name} : x doit correspondre à d3-geo à 0.01px près (${myX} vs ${d3x})`);
    assert.ok(Math.abs(d3y - myY) < 0.01, `${territory.name} : y doit correspondre à d3-geo à 0.01px près (${myY} vs ${d3y})`);
  }
});

// TEST B — présence territoriale ≠ niveau d'attention (mandat hérité,
// P2.DESIGN-1A §6, toujours vrai) : AtlasMap dessine TOUS les territoires
// reçus comme marqueurs cliquables, quel que soit leur niveau d'activité.
test("TEST B — AtlasMap dessine tous les territoires reçus comme marqueurs cliquables", () => {
  const state = createDemoState();
  const html = renderToStaticMarkup(
    React.createElement(AtlasMap, {
      territories: state.territories.map((item) => ({ id: item.id, name: item.name, activity: item.activity, latitude: item.latitude, longitude: item.longitude })),
      onSelect: () => {}
    })
  );
  for (const territory of state.territories) {
    assert.ok(html.includes(`Ouvrir ${territory.name}`), `${territory.name} doit apparaître comme marqueur cliquable`);
  }
});

// TEST C — stable ≠ invisible (doctrine héritée) : un territoire "stable"
// reste un marqueur réel (halo + point), même sans étiquette texte
// permanente — seul le libellé change selon l'activité, jamais le
// marqueur lui-même.
test("TEST C — un territoire stable reste un marqueur visible, jamais absent du tracé", () => {
  const state = createDemoState();
  const stableTerritory = state.territories.find((item) => item.activity === "stable");
  assert.ok(stableTerritory, "ce test suppose au moins un territoire stable dans le jeu de démonstration");
  const html = renderToStaticMarkup(
    React.createElement(AtlasMap, {
      territories: [{ id: stableTerritory!.id, name: stableTerritory!.name, activity: "stable", latitude: stableTerritory!.latitude, longitude: stableTerritory!.longitude }],
      onSelect: () => {}
    })
  );
  assert.ok(html.includes(`Ouvrir ${stableTerritory!.name}`), "le marqueur du territoire stable doit être rendu (bouton cliquable)");
});

// TEST D — géométrie réelle, jamais fabriquée (mandat §2/§8) : le tracé
// Sénégal bakée n'est pas vide, et la silhouette diagrammatique
// (coastlinePath, ancien système) n'est plus consommée par les pages
// État — seul Public/Pro/Pilotage (CoastlineTerritoryMap) la garde.
test("TEST D — la géométrie Sénégal bakée est réelle (non vide) et n'est plus consommée par les pages État", () => {
  assert.ok(senegalPath.length > 200, "le tracé Sénégal bakée doit être un chemin SVG substantiel, pas un placeholder");
  assert.ok(neighbouringCountriesPath.length > 200, "le tracé des pays voisins bakée doit être substantiel");
  const etatPageSource = readSource("../src/app/app/etat/page.tsx");
  const etatTerritoiresSource = readSource("../src/app/app/etat/territoires/page.tsx");
  assert.ok(!etatPageSource.includes('from "@/components/territories/TerritoryAtlasCanvas"'), "le Brief national ne doit plus consommer l'ancien TerritoryAtlasCanvas");
  assert.ok(!etatTerritoiresSource.includes('from "@/components/territories/TerritoryAtlasCanvas"'), "Territoires ne doit plus consommer l'ancien TerritoryAtlasCanvas");
  assert.ok(etatPageSource.includes('from "@/components/etat/AtlasMap"'), "le Brief national doit consommer le nouveau AtlasMap");
  assert.ok(etatTerritoiresSource.includes('from "@/components/etat/AtlasMap"'), "Territoires doit consommer le nouveau AtlasMap");
});

// TEST E — aucune dépendance cartographique côté client (mandat §8, "no
// unnecessary external network dependency") : ni AtlasMap.tsx, ni
// mercator.ts, ni aucun composant/page de l'Espace État n'importent d3
// ou topojson — ces librairies restent des devDependencies utilisées
// UNIQUEMENT par le script de génération (Node, jamais exécuté par
// l'application), jamais expédiées au bundle client.
test("TEST E — aucune dépendance d3/topojson n'est importée côté client (bundle déterministe)", () => {
  const atlasMapSource = readSource("../src/components/etat/AtlasMap.tsx");
  const mercatorSource = readSource("../src/domain/geo/mercator.ts");
  for (const source of [atlasMapSource, mercatorSource]) {
    assert.ok(!/from ["']d3/.test(source), "AtlasMap/mercator.ts ne doivent importer aucun module d3-*");
    assert.ok(!/from ["']topojson/.test(source), "AtlasMap/mercator.ts ne doivent importer aucun module topojson-*");
  }
  const packageJson = JSON.parse(readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf-8"));
  assert.ok(!packageJson.dependencies?.["d3-geo"], "d3-geo doit rester une devDependency, jamais une dependency de production");
  assert.ok(!!packageJson.devDependencies?.["d3-geo"], "d3-geo doit être présent comme devDependency (utilisé par le script de génération)");
});
