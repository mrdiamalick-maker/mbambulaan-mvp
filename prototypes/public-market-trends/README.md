# Prototype — Tendances publiques des marchés

Prototype R&D statique, autonome et jetable.

## Thèse représentée

La maquette ne représente pas un simulateur anti-inflation ou anti-spéculation. Elle illustre la version jugée défendable dans la spécification : un **baromètre territorial d'observations de marché avec explorateur de scénarios**.

Trois niveaux de preuve sont séparés visuellement :

- `OBSERVÉ` : prix et disponibilité commerciale issus d'un dispositif de collecte ;
- `SCÉNARIO` : hypothèses qualitatives et résultat directionnel non prédictif ;
- `SOURCE SCIENTIFIQUE` : état du stock renseigné uniquement par une autorité compétente.

Toutes les valeurs affichées sont simulées.

## Garde-fous

- Branche exclusive : `codex/rd-exploration`.
- Aucun import depuis `src/domain`.
- Aucun accès aux services, repositories, permissions ou données du Produit.
- Aucun remplacement ou modification d'une route existante.
- Aucun prix privé, transaction réelle ou incident exposé.
- Aucun déploiement.
- Palette verrouillée : marine `#0b1a2a`, terre-cuite `#b6522f`, crème `#f7f3e9`.

## Interaction simulée

Les boutons du scénario modifient un résultat qualitatif simple : pression à la hausse, à la baisse ou effet indéterminé. Il s'agit de règles pédagogiques locales, pas d'un modèle prédictif.

## Pour visualiser

Ouvrir localement `index.html` dans un navigateur. Aucun serveur applicatif n'est requis.

## Non-objectifs

Ce prototype ne valide ni collecte, ni seuil statistique, ni gouvernance, ni modèle économique. Toute éventuelle industrialisation doit repartir de la spécification, avec validation métier, statistique, institutionnelle et juridique.
