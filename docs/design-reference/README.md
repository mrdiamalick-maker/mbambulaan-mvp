# Mbàmbulaan — Référentiel visuel D9

Ce dossier est la **source de vérité visuelle** pour les expériences produit Mbàmbulaan.

## Intention
Mbàmbulaan n'est ni un dashboard SaaS générique, ni une marketplace, ni un ERP. Le produit doit être perçu comme une **infrastructure de coordination territoriale** : détecter une tension, la qualifier, organiser une décision, engager les acteurs, exécuter, produire une preuve, mesurer le résultat et capitaliser l'apprentissage.

## Palette verrouillée
- Marine profond : `#0b1a2a` — institution, structure, navigation, autorité.
- Terre-cuite : `#b6522f` — actions, tensions, décisions et points clés uniquement.
- Blanc cassé + neutres — surfaces et contenu.

Ne pas introduire une nouvelle palette.

## Langage visuel
Le motif signature est la **tension territoriale transformée en preuve d'action** :
`Signal → Qualification → Situation → Décision → Engagement → Exécution → Preuve → Résultat → Apprentissage`.

Le vocabulaire graphique associé doit rester cohérent : point/signal, flux territorial, tension, décision, engagement collectif, mouvement/exécution, ancre/preuve, boucle résultat/apprentissage.

Éviter les sets d'icônes SaaS génériques. Les pictogrammes doivent apparaître comme une famille propre à Mbàmbulaan.

## Scénario canonique
**Joal — chaîne du froid — machine à glace.**

Exemple de chaîne de valeur :
1. Les acteurs terrain signalent des pertes liées au manque de glace.
2. Le coordinateur qualifie et consolide les signaux.
3. Une situation territoriale exploitable est constituée.
4. L'institution décide d'une réponse : installation d'une machine à glace.
5. Budget, partenaires et responsabilités sont engagés.
6. L'opérateur réalise l'installation et l'exploitation.
7. Les preuves sont collectées.
8. Les effets sont mesurés : pertes réduites, disponibilité de glace, revenus améliorés.
9. Les enseignements sont capitalisés et peuvent être répliqués.

## Quatre expériences — ne pas les homogénéiser
### Institution / État — decision-first
La première question est : **« Où dois-je décider ou arbitrer ? »**
Montrer en priorité décisions, situations critiques, preuves, résultats et indicateurs d'impact. Peu de métriques, très lisibles.

### Coordinateur — situation-first
La première question est : **« Que se passe-t-il sur mon territoire ? »**
Montrer tensions, signaux qualifiés, acteurs concernés, actions en cours, blocages et éléments à escalader.

### Opérateur — task-first
La première question est : **« Que dois-je faire aujourd'hui ? »**
Montrer tâches, priorités, équipements, échéances, preuves attendues et progression opérationnelle.

### Terrain — mobile-first minimal
La première question est : **« Que veux-tu faire maintenant ? »**
Actions principales très limitées : signaler, envoyer une preuve, suivre ses signalements. Interface compatible avec un usage peu technophile et des conditions terrain.

## Data visualisation
### Revenus additionnels
Courbe simple d'évolution dans le temps + chiffre clé mis en avant. Une série principale. Marine pour la donnée, terre-cuite uniquement pour un point ou écart nécessitant l'attention.

### Territoires actifs
Classement horizontal Top 5 ; carte seulement lorsque la dimension spatiale apporte réellement une décision. Éviter la surcharge cartographique.

### Signaux traités
Barres empilées, maximum 3 statuts utiles. Comparaison hebdomadaire ou mensuelle. Mettre en évidence une seule anomalie ou décision.

Public cible : ministre, cabinet, direction, coordinateur territorial. La compréhension doit précéder l'exhaustivité.

## Composants public déjà actés
Compléter, ne pas recréer :
- Magic UI Dotted Map
- Number Ticker
- Bento Grid
- Blur Fade
- Marquee

## Interdictions
- dashboard SaaS générique ;
- Heroicons ou autre bibliothèque générique utilisée comme langage de marque ;
- gradients flashy, néon, confettis ou effets startup ;
- multiplication de cartes KPI sans hiérarchie métier ;
- même interface déclinée artificiellement pour les quatre rôles ;
- terre-cuite utilisée comme couleur décorative partout.

## Règle d'implémentation pour Claude Code
Avant toute modification, inspecter l'application existante et produire un **gap analysis** entre l'existant et ce référentiel : composants réutilisables, composants à adapter, éléments à retirer, hiérarchie par rôle, impacts responsive/mobile. Ensuite seulement proposer un plan d'implémentation.

Le référentiel décrit une **direction produit et visuelle**, pas un écran à recopier pixel par pixel. Toute décision d'interface doit renforcer la coordination, la lisibilité métier, la preuve et la capacité à agir.