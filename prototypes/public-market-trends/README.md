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

## Trajectoire de légitimité des données

Les données susceptibles de légitimer progressivement cette capacité doivent d'abord venir de `Mbàmbulaan Terrain`, comme source réelle, locale et continue. La couverture pourra ensuite s'élargir, à mesure que la crédibilité est démontrée, à toute voie pertinente et licite : partenaires, déclaratif structuré, acteurs de marché, sources ouvertes, recherche et institutions.

Cette trajectoire multi-source n'exige pas un partenariat national unique comme prérequis. Elle exige en revanche que chaque observation conserve sa provenance, sa fraîcheur, sa couverture et son niveau de preuve. Une donnée Terrain ne devient pas une statistique officielle par simple accumulation ; sa légitimité augmente par continuité, qualité, validation et recoupement.

L'ambition de fond est de contribuer progressivement à une infrastructure de confiance — un digital twin de l'économie maritime, en commençant par la filière halieutique — sans jamais présenter la promesse avant la preuve.

## Arbitrage institutionnel

Aucune version « Pro » de ce simulateur n'est prévue pour l'Espace État. Déplacer des chiffres insuffisamment alimentés vers un contexte institutionnel augmenterait leurs conséquences sans améliorer leur fiabilité.

Si une institution doit un jour suivre un programme anti-inflation, anti-spéculation ou éco-responsable, la brique pertinente sera une extension de **Programmes & financements**, alimentée par les objectifs, actions, indicateurs et preuves réels du programme — pas une déclinaison institutionnelle de ce simulateur.

## Pour visualiser

Ouvrir localement `index.html` dans un navigateur. Aucun serveur applicatif n'est requis.

## Non-objectifs

Ce prototype ne valide ni collecte, ni seuil statistique, ni gouvernance, ni modèle économique. Toute éventuelle industrialisation doit repartir de la spécification, avec validation métier, statistique, institutionnelle et juridique.
