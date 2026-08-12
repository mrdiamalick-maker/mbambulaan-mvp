# Prototype — Tour de contrôle institutionnelle

Prototype R&D statique et jetable.

## Garde-fous

- Branche exclusive : `codex/rd-exploration`.
- Aucun import depuis `src/domain`.
- Aucun accès aux repositories, services, permissions ou données du Produit.
- Aucun remplacement/modification d'une route existante.
- Aucun déploiement.
- La maquette est un fichier HTML autonome pour rendre explicite son isolement.

## Hypothèses de design

1. **Decision-first** : l'entrée est une file de situations nécessitant arbitrage, et non une grille de KPI.
2. **Territoire comme unité de lecture** : la fiche santé explique une situation sans devenir un observatoire exhaustif.
3. **Provenance visible** : terrain, officiel et calcul dérivé doivent être distingués.
4. **Pas de faux niveau de certitude** : « pêche illégale », « sur-exploitation », « inflation » et « part de l'informel » ne sont pas présentés comme des indicateurs établis.
5. **Palette verrouillée** : marine `#0b1a2a`, terre-cuite `#b6522f`, crème `#f7f3e9`.

## Pour visualiser

Ouvrir localement `index.html` dans un navigateur. Aucun serveur applicatif n'est nécessaire.

## Non-objectifs

Ce prototype ne valide ni schéma de base de données, ni API, ni workflow de permission, ni formule d'indicateur. Toute éventuelle industrialisation doit repartir de la spécification avec validation métier, data et juridique.