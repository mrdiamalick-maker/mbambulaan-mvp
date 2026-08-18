// Positions calibrées sur le tracé littoral signature de Mbàmbulaan — Lot B,
// Audit DA Premium XXL v2 (mandat CEO 2026-08-17), option 2 tranchée pour le
// point d'attention "carte" de /app/etat : réutilise la géométrie déjà
// validée de PublicAtlasWorkspace.tsx / docs/design-reference/
// senegal-coast-atlas.svg (polygone corrigé, isPointInFill vérifié) plutôt
// que d'en inventer une nouvelle.
//
// Fichier neuf, volontairement séparé de data/public-atlas.ts : le mandat
// exige que le fichier Public source ne soit ni modifié ni affecté par
// cette extraction. Les 16 valeurs communes sont recopiées depuis
// PublicTerritory.mapPosition — pas importées — pour ne créer aucune
// dépendance du Produit vers un fichier de données 100% éditorial Public.
// Si le tracé ou l'un des deux jeux de positions est retouché un jour,
// l'autre doit être vérifié manuellement ; la source de vérité DA reste
// senegal-coast-atlas.svg.
//
// ProductState (demo-state.ts, territoryRows) porte 18 territoires ; seuls
// 16 ont une position calibrée côté Public — Lompoul-sur-Mer et Ouakam en
// sont absents (cf. le commentaire de PublicTerritory.mapPosition, qui
// documente leur exclusion d'origine). Plutôt que de les faire disparaître
// de la carte du Produit (incohérent avec un compteur "18 territoires
// suivis") ou d'improviser une position non vérifiée, les 2 manquantes ont
// été calibrées ici avec la même exigence que les 20 autres : interpolées
// depuis leur latitude réelle entre leurs voisins calibrés les plus proches
// (lompoul entre saint-louis et fass-boye ; ouakam entre yoff et
// soumbédioune), puis vérifiées par un test point-dans-polygone (ray
// casting, mathématiquement équivalent à isPointInFill pour ce tracé —
// entièrement composé de segments droits) avec une marge de robustesse de
// ±10 unités testée dans les 6 directions autour de chaque candidat.
export const coastlinePath =
  "M 315 145 L 610 118 L 790 205 L 845 365 L 804 510 L 738 610 L 760 705 L 690 772 L 735 812 L 700 860 L 730 1015 L 680 1095 L 605 1140 L 520 1160 L 376 1135 L 341 1090 L 401 1055 L 311 1040 L 306 965 L 316 900 L 386 868 L 341 855 L 354 792 L 338 758 L 332 739 L 326 720 L 336 696 L 318 684 L 292 642 L 271 610 L 262 575 L 254 528 L 241 450 L 228 372 L 221 292 L 234 205 Z";

// Recadrage 2026-08-17 (audit CTA + carte, arbitrage CEO) : le viewBox
// d'origine (0 0 1000 1400, hérité de senegal-coast-atlas.svg) laisse une
// marge bien plus large que la silhouette elle-même — mesuré et confirmé
// indépendamment par le CEO : bbox réelle du tracé x=[221,845]
// (largeur 624, 62,4% du viewBox d'origine), y=[118,1160] (hauteur 1042,
// 74,4%). Recadré ici sur cette bbox + 40 unités de marge de chaque côté
// ("181 78 704 1122") — seule la fenêtre de vue change, ni le tracé
// (coastlinePath) ni les positions calibrées (territoryMapPositions)
// ci-dessous ne sont touchés, donc la vérification isPointInFill déjà
// faite sur les 18 marqueurs reste valable sans nouveau calcul.
export const coastlineViewBox = "181 78 704 1122";

export const territoryMapPositions: Record<string, [number, number]> = {
  "saint-louis": [258, 205],
  "fass-boye": [252, 372],
  kayar: [265, 450],
  yoff: [278, 528],
  // Calibré ici (voir commentaire de tête) — absent de public-atlas.ts.
  ouakam: [287, 569],
  soumbedioune: [295, 610],
  hann: [316, 642],
  rufisque: [342, 684],
  popenguine: [350, 720],
  mbour: [362, 758],
  joal: [378, 792],
  // Calibré ici (voir commentaire de tête) — absent de public-atlas.ts.
  lompoul: [254, 320],
  djiffer: [340, 900],
  foundiougne: [365, 855],
  missirah: [330, 965],
  kafountine: [335, 1040],
  elinkine: [365, 1090],
  "cap-skirring": [400, 1135]
};
