import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoState } from "../src/data/demo-state";
import { CoastlineTerritoryMap } from "../src/components/territories/CoastlineTerritoryMap";

// XXL-R5.5 — Cartographic Signature (mandat CEO "une signature
// cartographique, pas trois", §4/§17). Le Core (Territory, Signal,
// Situation…) reste gelé — non modifié cette session. Ce lot remplace,
// sur /app/etat, le fond photo + caméra AtlasImageMap (jugé "trop sombre"
// et "recadré comme une image", §2) par CoastlineTerritoryMap — déjà la
// carte de /app/pilotage et (depuis XXL-R4) de l'Atlas professionnel —
// avec ses couleurs D9 par défaut (fond clair).
//
// P2.DESIGN-1B (mandat CEO "Claude Design V2 → Real Product
// Implementation", §2/§8) — les anciens TEST A/B/C/D de ce fichier, qui
// vérifiaient TerritoryAtlasCanvas.tsx (silhouette diagrammatique
// calibrée à la main, P2.DESIGN-1A) et territoryMapPositions.ts pour le
// périmètre État, sont RETIRÉS avec le composant qu'ils vérifiaient —
// TerritoryAtlasCanvas.tsx est supprimé (mandat §22, "retire obsolete
// presentation components"), remplacé par AtlasMap.tsx (géométrie réelle
// Natural Earth, cf. tests/xxl-cartography-v2.test.ts, qui reprend les
// mêmes garanties fonctionnelles — tous les territoires cliquables,
// stable ≠ invisible — pour le nouveau composant). Ce fichier ne couvre
// plus désormais QUE ce qu'il a toujours partiellement couvert :
// CoastlineTerritoryMap (Pro/Public/Pilotage), non touché par ce lot ni
// par le précédent — la preuve que le rendu État n'a jamais fui vers/
// depuis le Pro, dans un sens ou dans l'autre.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}
(globalThis as Record<string, unknown>).React = React;

const atlasProSource = readSource("../src/components/ecosystem/ProfessionalAtlasWorkspace.tsx");

// TEST C2 — CoastlineTerritoryMap (Pro/Public/Pilotage, non modifié) garde
// exactement le même comportement qu'avant ce lot : non-régression directe
// sur le composant que ce lot n'a pas touché.
test("TEST C2 — CoastlineTerritoryMap (Pro/Public/Pilotage) reste inchangé : tous les territoires restent des marqueurs cliquables", () => {
  const state = createDemoState();
  const html = renderToStaticMarkup(
    React.createElement(CoastlineTerritoryMap, {
      territories: state.territories.map((item) => ({ id: item.id, name: item.name, activity: item.activity })),
      onSelect: () => {}
    })
  );
  for (const territory of state.territories) {
    assert.ok(html.includes(`Ouvrir ${territory.name}`), `${territory.name} doit rester un marqueur cliquable sur CoastlineTerritoryMap (Pro/Pilotage)`);
  }
});

// TEST E — signature visuelle partagée (mandat §17-18) : les 3 couleurs
// réelles de niveau d'attention (stable/vigilance/critique) restent
// définies dans l'Atlas professionnel (coastlineTone) — vocabulaire
// cartographique du Pro, non affecté par la refonte État.
test("TEST E — l'Atlas professionnel garde ses couleurs de niveau d'attention verrouillées", () => {
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

// TEST H — TerritoryAtlasCanvas.tsx (P2.DESIGN-1A, remplacé par AtlasMap
// ce lot) est bien retiré, pas laissé en code mort à côté du nouveau
// composant (mandat §22, "one final Espace État visual system should
// remain").
test("TEST H — TerritoryAtlasCanvas.tsx (ancien rendu État) est retiré, remplacé par AtlasMap", () => {
  const oldComponentPath = fileURLToPath(new URL("../src/components/territories/TerritoryAtlasCanvas.tsx", import.meta.url));
  assert.ok(!existsSync(oldComponentPath), "TerritoryAtlasCanvas.tsx ne doit plus exister — remplacé par src/components/etat/AtlasMap.tsx");
});
