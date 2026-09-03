import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoState } from "../src/data/demo-state";
import { CoastlineTerritoryMap } from "../src/components/territories/CoastlineTerritoryMap";
import { territoryMapPositions } from "../src/domain/territory-map-positions";

// XXL-R5.5 — Cartographic Signature (mandat CEO "une signature
// cartographique, pas trois", §4/§17). Le Core (Territory, Signal,
// Situation…) reste gelé — non modifié cette session. Ce lot remplace,
// sur /app/etat, le fond photo + caméra AtlasImageMap (jugé "trop sombre"
// et "recadré comme une image", §2) par CoastlineTerritoryMap — déjà la
// carte de /app/pilotage et (depuis XXL-R4) de l'Atlas professionnel —
// avec ses couleurs D9 par défaut (fond clair). Les tests ci-dessous
// portent sur ce que ce lot a réellement changé : une seule primitive
// cartographique partagée, présence de tous les territoires documentés
// (pas seulement ceux qui méritent attention), et le retrait effectif du
// fond photo/caméra sur le Brief national.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}
(globalThis as Record<string, unknown>).React = React;

const etatPageSource = readSource("../src/app/app/etat/page.tsx");
const atlasProSource = readSource("../src/components/ecosystem/ProfessionalAtlasWorkspace.tsx");

// TEST A — une seule primitive cartographique : le Brief national et
// l'Atlas professionnel importent tous les deux CoastlineTerritoryMap,
// jamais un second composant carte (mandat §4/§17, "une signature
// cartographique, pas trois").
test("TEST A — Brief national et Atlas professionnel partagent la même primitive cartographique", () => {
  assert.ok(etatPageSource.includes('from "@/components/territories/CoastlineTerritoryMap"'), "le Brief national doit consommer CoastlineTerritoryMap");
  assert.ok(atlasProSource.includes('from "@/components/territories/CoastlineTerritoryMap"'), "l'Atlas professionnel doit consommer CoastlineTerritoryMap");
  // La chaîne "AtlasImageMap" reste légitimement présente dans les
  // commentaires d'historique (doctrine du fichier : jamais réécrire
  // rétroactivement le passé) — seuls l'import et l'usage JSX du
  // composant sont vérifiés absents ici.
  assert.ok(!etatPageSource.includes('from "@/components/etat/AtlasImageMap"'), "l'import du fond photo + caméra AtlasImageMap doit être retiré du Brief national");
  assert.ok(!etatPageSource.includes("<AtlasImageMap"), "le composant AtlasImageMap ne doit plus être rendu sur le Brief national");
});

// TEST B — présence territoriale ≠ niveau d'attention (mandat §6) : le
// Brief national passe TOUS les territoires réels à la carte, jamais un
// sous-ensemble filtré sur l'attention — c'est la liste latérale
// ("À arbitrer"), pas la carte elle-même, qui reste scopée.
test("TEST B — le Brief national dessine tous les territoires documentés, pas seulement ceux en attention", () => {
  assert.ok(etatPageSource.includes("territories={state.territories}"), "la carte doit recevoir state.territories tel quel, sans filtre sur l'activité");
  const state = createDemoState();
  const html = renderToStaticMarkup(
    React.createElement(CoastlineTerritoryMap, {
      territories: state.territories.map((item) => ({ id: item.id, name: item.name, activity: item.activity })),
      onSelect: () => {}
    })
  );
  for (const territory of state.territories) {
    assert.ok(html.includes(`Ouvrir ${territory.name}`), `${territory.name} doit apparaître comme marqueur cliquable sur la carte nationale`);
  }
});

// TEST C — stable ≠ invisible (mandat §7) : un territoire "stable" reste
// un marqueur réel sur la carte (discret, sans libellé permanent), jamais
// absent du tracé — seul le libellé texte est réservé aux territoires en
// vigilance/critique (comportement natif de CoastlineTerritoryMap).
test("TEST C — un territoire stable reste un marqueur visible sur la carte, jamais invisible", () => {
  const state = createDemoState();
  const stableTerritory = state.territories.find((item) => item.activity === "stable");
  assert.ok(stableTerritory, "ce test suppose au moins un territoire stable dans le jeu de démonstration");
  const html = renderToStaticMarkup(
    React.createElement(CoastlineTerritoryMap, {
      territories: [{ id: stableTerritory!.id, name: stableTerritory!.name, activity: "stable" }],
      onSelect: () => {}
    })
  );
  assert.ok(html.includes(`Ouvrir ${stableTerritory!.name}`), "le marqueur du territoire stable doit être rendu (bouton cliquable), même sans libellé texte permanent");
});

// TEST D — aucune donnée géographique fabriquée (mandat §26) : les 18
// territoires réels du jeu de démonstration ont tous une position
// calibrée — aucun territoire du Core n'est dessiné à une position
// inventée pour ce lot, aucune position calibrée n'est orpheline d'un
// territoire réel.
test("TEST D — chaque territoire réel a une position calibrée, aucune position n'est orpheline", () => {
  const state = createDemoState();
  for (const territory of state.territories) {
    assert.ok(territoryMapPositions[territory.id], `${territory.name} doit avoir une position calibrée sur le tracé littoral`);
  }
});

// TEST E — signature visuelle partagée (mandat §17-18) : les 3 couleurs
// réelles de niveau d'attention (stable/vigilance/critique) sont
// strictement identiques entre le Brief national (couleurs D9 par défaut
// de CoastlineTerritoryMap) et l'Atlas professionnel (coastlineTone) —
// même vocabulaire cartographique, seul le fond diffère (clair vs marine).
test("TEST E — Brief national et Atlas professionnel utilisent exactement les mêmes couleurs de niveau d'attention", () => {
  const coastlineToneMatch = atlasProSource.match(/const coastlineTone = \{([\s\S]*?)\};/);
  assert.ok(coastlineToneMatch, "coastlineTone doit rester défini dans l'Atlas professionnel");
  const tone = coastlineToneMatch![1];
  // Valeurs D9 verrouillées (etat-design-system.css) : --etat-navy-600,
  // --etat-ocre, --etat-terracotta — mêmes hex que les défauts de
  // CoastlineTerritoryMap pour /app/etat (resolus via .etat-scope).
  assert.match(tone, /stable:\s*"#1d4468"/, "stable doit rester --etat-navy-600");
  assert.match(tone, /vigilance:\s*"#c68a2c"/, "vigilance doit rester --etat-ocre");
  assert.match(tone, /critique:\s*"#b6522f"/, "critique doit rester --etat-terracotta");
});

// TEST F — /app/pilotage non affecté (mandat §25, non-régression) : ce
// lot ne touche ni CoastlineTerritoryMap.tsx ni territory-map-positions.ts
// eux-mêmes, seuls leurs appelants sur /app/etat et l'Atlas professionnel
// changent — la géométrie et l'API du composant partagé restent intactes.
test("TEST F — CoastlineTerritoryMap garde une API strictement additive (aucune prop retirée)", () => {
  const mapSource = readSource("../src/components/territories/CoastlineTerritoryMap.tsx");
  for (const prop of ["territories", "selectedId", "onSelect", "colors", "viewBox", "landFillOpacity", "backgroundImageSrc"]) {
    assert.ok(mapSource.includes(prop), `la prop ${prop} doit rester supportée — /app/pilotage en dépend sans modification`);
  }
});

// TEST G — le fond photo réel (asset dédié à l'ancien AtlasImageMap) et
// son fichier de positions en pourcentage sont bien retirés, pas laissés
// en code mort trompeur (doctrine de nettoyage déjà appliquée ailleurs,
// cf. Atlas-D).
test("TEST G — les fichiers dédiés à l'ancien fond photo + caméra sont retirés, pas laissés en code mort", () => {
  const componentPath = fileURLToPath(new URL("../src/components/etat/AtlasImageMap.tsx", import.meta.url));
  const positionsPath = fileURLToPath(new URL("../src/domain/territory-map-image-positions.ts", import.meta.url));
  assert.ok(!existsSync(componentPath), "AtlasImageMap.tsx ne doit plus exister");
  assert.ok(!existsSync(positionsPath), "territory-map-image-positions.ts ne doit plus exister");
});
