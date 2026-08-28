// Positions territoriales en pourcentage de l'image — mandat CEO "simplifier
// l'Atlas /app/etat : image + marqueurs en pourcentage, pas de SVG calibré"
// (2026-08-27). Décision stratégique : ne pas sur-investir dans la
// précision d'un Atlas stylisé destiné, à terme, à être remplacé par une
// vraie API cartographique — abandonner le polygone SVG calibré
// (coastlinePath/territoryMapPositions, territory-map-positions.ts, resté
// intouché pour /app/pilotage) au profit du même mécanisme que
// ProfessionalAtlasWorkspace.tsx (/app/atlas Pro) : marqueurs positionnés en
// left/top pourcentage directement sur l'image de fond, une seule forme de
// référence — l'image elle-même.
//
// Portée : /app/etat uniquement (Lot A du mandat). Ne remplace ni
// territory-map-positions.ts ni CoastlineTerritoryMap.tsx, tous deux
// toujours utilisés par /app/pilotage, hors mandat.
//
// Différence avec ProfessionalAtlasWorkspace.positions : cette dernière est
// calibrée contre .ops-landmass, une silhouette CSS (dégradés + clip-path,
// AUCUNE photo) — vérifié en lisant globals.css avant de s'engager sur
// quoi que ce soit. Ses valeurs ne sont donc PAS réutilisables telles
// quelles ici, où le fond reste la vraie illustration
// (etat-atlas-ocean-background.webp, 1536×1024, ratio 3:2). Seuls son ORDRE
// nord-sud et son espacement relatif servent de filet de sécurité (les 18
// ids sont strictement identiques entre les deux fichiers).
//
// Méthode de calibration (vérification géométrique réelle, pas un
// positionnement à l'œil — même exigence que territory-map-positions.ts) :
// 1. Image décodée en pixels bruts (sharp), classification terre/eau par
//    pixel : terre si (R − B) > 8 (teintes chaudes crème/tan de
//    l'illustration vs. teintes froides bleues de l'eau) — seuil calibré en
//    échantillonnant des zones connues (coin haut-droit = terre confirmée,
//    centre = eau confirmée).
// 2. Pour chaque territoire, ligne Y dérivée par interpolation linéaire de
//    l'ordre/espacement déjà vérifié dans territory-map-positions.ts (les
//    18 valeurs Y en espace SVG, PAS recopiées comme coordonnées — utilisées
//    uniquement pour préserver l'ordre nord-sud et l'espacement relatif
//    réel), mappée sur 4%–94% de la hauteur de l'image (marge des bords).
// 3. Sur cette ligne, la BANDE de terre la plus large est retenue (ignore
//    les petits artefacts isolés — brume/reflet de soleil, îlots — repérés
//    lors d'une première passe : Saint-Louis atterrissait sur un artefact de
//    brume avant ce correctif). Le marqueur est placé à une marge de
//    6 points de pourcentage (ou 40% de la largeur de bande si plus étroite)
//    à l'intérieur des terres depuis le trait de côte.
// 4. Robustesse vérifiée par une grille de test 3×3 (±1.5 point de
//    pourcentage en X et Y autour du candidat, 9 échantillons) — tous
//    doivent classifier "terre", même exigence que le test ±10 unités/6
//    directions déjà utilisé pour la vérification ray-casting du polygone
//    SVG. 3 territoires ont échoué à la première passe (Saint-Louis :
//    artefact de brume ; Ouakam : trop proche du trait de côte réel dans une
//    anse ; Missirah : embouchure du Saloum, la ligne interpolée tombait
//    dans une baie) — corrigés en excluant les artefacts non-continentaux
//    (retenir la plus grande bande, pas la première rencontrée) et, pour
//    Missirah seul, un ajustement documenté de +2 points de pourcentage en Y
//    pour s'écarter de l'embouchure du delta, revérifié par le même test.
// 5. Vérification VISUELLE finale : les 18 positions superposées sur l'image
//    réelle (marqueur + étiquette), capture complète + gros plans sur les
//    zones denses (cluster Dakar : Yoff/Ouakam/Soumbédioune/Hann/Rufisque/
//    Popenguine) et le delta du Saloum (Missirah/Kafountine/Elinkine/
//    Cap Skirring) — chaque territoire confirmé sur la terre à l'œil, en
//    plus du test algorithmique, conformément à l'exigence explicite du
//    mandat ("un vrai travail de calibration visuelle... vérifié territoire
//    par territoire").
//
// [left%, top%] — même ordre de tuple que ProfessionalAtlasWorkspace.positions.
export const territoryMapImagePositions: Record<string, [number, number]> = {
  "saint-louis": [62.1, 4.0],
  lompoul: [69.3, 15.1],
  "fass-boye": [69.5, 20.2],
  kayar: [71.4, 27.7],
  yoff: [67.1, 35.3],
  ouakam: [70.2, 39.2],
  soumbedioune: [68.6, 43.2],
  hann: [70.7, 46.3],
  rufisque: [69.7, 50.4],
  popenguine: [69.6, 53.8],
  mbour: [71.2, 57.5],
  joal: [73.8, 60.8],
  foundiougne: [77.6, 66.9],
  djiffer: [78.0, 71.3],
  missirah: [78.3, 79.6],
  kafountine: [81.6, 84.8],
  elinkine: [80.6, 89.7],
  "cap-skirring": [79.0, 94.0]
};
