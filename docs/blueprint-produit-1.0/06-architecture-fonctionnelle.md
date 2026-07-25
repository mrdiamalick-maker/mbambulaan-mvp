# 06 — Architecture fonctionnelle

## 1. Finalité

L'architecture fonctionnelle décrit comment Mbàmbulaan transforme des contributions dispersées en coordination, décisions et résultats.

Elle ne décrit pas encore une architecture technique détaillée. Elle établit les frontières fonctionnelles, les responsabilités des différentes couches et les principes d'interaction entre les moteurs métier.

L'objectif est d'éviter trois dérives :

- construire des écrans sans logique métier durable ;
- dupliquer des règles dans plusieurs parcours ;
- créer un système centralisateur qui remplace les outils existants au lieu de les orchestrer.

## 2. Principe général

Mbàmbulaan doit être conçu comme une architecture en couches.

```text
Expériences acteurs
        ↓
Orchestration des parcours
        ↓
Moteurs métier
        ↓
Socle de confiance, données et services communs
        ↓
Intégrations avec l'écosystème externe
```

Chaque couche possède une responsabilité distincte.

## 3. Couche 1 — Expériences acteurs

### Finalité

Proposer à chaque catégorie d'acteurs une interaction simple, contextualisée et adaptée à ses responsabilités.

### Exemples d'expériences

- expérience pêcheur ou acteur terrain ;
- expérience relais local ;
- expérience CLPA ou collectivité ;
- expérience ministère ;
- expérience bailleur ou ONG ;
- expérience banque ou investisseur ;
- expérience expert ou chercheur ;
- expérience administrateur Mbàmbulaan.

### Principes

- une même capacité métier peut être présentée différemment selon l'acteur ;
- les droits et informations visibles dépendent du rôle et du contexte ;
- les expériences ne doivent pas posséder les règles métier ;
- le mobile doit être prioritaire pour les usages terrain ;
- certaines contributions doivent pouvoir être assistées par des relais ;
- la complexité doit être progressive et non imposée à tous les utilisateurs.

### Exemple

Une situation de rupture de glace peut être :

- signalée simplement par un acteur terrain ;
- qualifiée par un relais local ;
- priorisée par une collectivité ou un CLPA ;
- consolidée au niveau territorial ;
- intégrée à une décision ou initiative par le ministère.

Le parcours change, mais le même objet métier est partagé.

## 4. Couche 2 — Orchestration des parcours

### Finalité

Assembler plusieurs moteurs métier pour produire un parcours de bout en bout.

### Responsabilités

- guider l'utilisateur selon son rôle ;
- déterminer les prochaines actions possibles ;
- coordonner les étapes entre moteurs ;
- gérer les validations et transitions ;
- produire les notifications utiles ;
- afficher l'état global d'un parcours ;
- appliquer les règles de complétude ;
- gérer les exceptions et escalades.

### Exemples de parcours orchestrés

- signalement vers initiative ;
- initiative vers financement ;
- décision vers plan d'action ;
- action vers mesure de résultat ;
- projet terminé vers apprentissage réutilisable ;
- situation territoriale vers portefeuille de transformation.

### Principe

L'orchestration ne doit pas absorber les règles propres aux moteurs métier. Elle coordonne, mais ne devient pas un moteur monolithique.

## 5. Couche 3 — Moteurs métier

Cette couche porte les responsabilités fonctionnelles durables de Mbàmbulaan.

Les moteurs sont :

1. identités et organisations ;
2. territoires ;
3. observation ;
4. qualification ;
5. coordination ;
6. initiatives ;
7. investissements ;
8. décision ;
9. exécution et risques ;
10. mesure et impact ;
11. connaissance et réplication ;
12. confiance et gouvernance.

### Règle de propriété

Chaque objet métier structurant doit avoir un moteur propriétaire.

Exemples :

- une initiative appartient au moteur des initiatives ;
- un risque appartient au moteur d'exécution et des risques ;
- un mandat appartient au moteur des identités et organisations ;
- une règle d'accès appartient au moteur de confiance et de gouvernance.

Les autres moteurs peuvent référencer ces objets, mais ne doivent pas en dupliquer la logique.

## 6. Couche 4 — Socle commun

Le socle commun fournit les services transverses nécessaires à tous les moteurs.

### Services principaux

- gestion documentaire ;
- recherche globale ;
- notifications ;
- commentaires et mentions ;
- journal d'audit ;
- historisation ;
- gestion des référentiels ;
- import et export ;
- localisation ;
- traduction et adaptation linguistique ;
- synchronisation hors ligne ;
- règles de qualité de données ;
- gestion des consentements ;
- administration fonctionnelle.

### Principe

Un service transverse ne doit pas devenir un moteur métier autonome lorsqu'il ne porte pas une transformation spécifique de la filière.

## 7. Couche 5 — Données et patrimoines numériques

Les données de Mbàmbulaan doivent être organisées autour de trois patrimoines.

### Patrimoine informationnel

Ce que la filière connaît :

- acteurs ;
- infrastructures ;
- territoires ;
- prix ;
- débarquements ;
- ressources ;
- besoins ;
- indicateurs ;
- documents ;
- référentiels.

### Patrimoine relationnel

Comment les acteurs sont reliés :

- appartenances ;
- collaborations ;
- responsabilités ;
- engagements ;
- partenariats ;
- dépendances ;
- historiques de coordination.

### Patrimoine transformationnel

Ce qui a changé et pourquoi :

- initiatives ;
- décisions ;
- investissements ;
- actions ;
- résultats ;
- impacts ;
- apprentissages ;
- pratiques reproductibles.

### Principe de donnée

> Une donnée est saisie une seule fois, gouvernée par son moteur propriétaire et réutilisée selon les droits accordés.

## 8. Couche 6 — Intégrations externes

Mbàmbulaan doit connecter l'écosystème sans chercher à remplacer tous ses systèmes.

### Catégories d'intégration

- systèmes du ministère ;
- plateformes statistiques ;
- outils des collectivités ;
- systèmes de bailleurs et ONG ;
- services bancaires et financiers ;
- services météo et océanographiques ;
- solutions de traçabilité ;
- outils de cartographie ;
- systèmes de formation ;
- services de messagerie et notification ;
- solutions de paiement futures ;
- open data et référentiels publics.

### Modes d'intégration

- API ;
- import de fichiers ;
- export structuré ;
- synchronisation périodique ;
- webhooks lorsque disponibles ;
- saisie assistée lorsque aucun système source n'existe.

### Principe

Mbàmbulaan doit conserver la provenance de chaque donnée importée, sa date, son niveau de confiance et les conditions de réutilisation.

## 9. Objets partagés et liens structurants

L'architecture repose sur un graphe d'objets reliés.

```text
Acteur
  ↕
Organisation
  ↕
Territoire
  ↕
Situation / Besoin
  ↕
Initiative
  ↕
Financement
  ↕
Action / Risque
  ↕
Résultat / Impact
  ↕
Apprentissage
```

La puissance du système vient moins du volume d'objets que de la qualité de leurs relations.

Chaque relation doit pouvoir préciser :

- sa nature ;
- sa source ;
- sa période de validité ;
- son niveau de confiance ;
- son responsable ;
- ses droits d'accès.

## 10. Événements métier

Les moteurs doivent pouvoir communiquer par événements métier plutôt que par dépendances directes excessives.

### Exemples

- situation qualifiée ;
- initiative créée ;
- engagement accepté ;
- risque critique détecté ;
- décision prise ;
- financement confirmé ;
- jalon atteint ;
- résultat mesuré ;
- apprentissage validé ;
- donnée contestée ;
- accès révoqué.

### Valeur

- meilleure traçabilité ;
- architecture évolutive ;
- notifications contextualisées ;
- automatisations futures ;
- réduction du couplage entre moteurs.

## 11. Gouvernance des accès

L'accès ne doit pas reposer uniquement sur le profil utilisateur.

Il dépend de plusieurs dimensions :

- rôle ;
- organisation ;
- mandat ;
- territoire ;
- objet concerné ;
- finalité de l'usage ;
- niveau de confidentialité ;
- consentement éventuel ;
- période de validité.

### Niveaux indicatifs

- public ;
- partagé avec l'écosystème ;
- partagé avec un cercle autorisé ;
- institutionnel ;
- confidentiel ;
- sensible ou restreint.

### Principe

Le partage doit être suffisant pour créer de la coordination, mais jamais supérieur à ce qui est légitime et nécessaire.

## 12. Architecture des jumeaux territoriaux

Chaque territoire doit être représenté par une vue vivante composée de :

- profil du territoire ;
- acteurs et organisations ;
- infrastructures ;
- indicateurs ;
- situations actives ;
- besoins prioritaires ;
- initiatives ;
- financements ;
- risques ;
- résultats ;
- connaissances locales ;
- historique des transformations.

Le jumeau territorial n'est pas un tableau de bord statique. Il constitue un point d'entrée vers les objets, flux et décisions concernant le territoire.

## 13. Architecture des portefeuilles de transformation

Une transformation stratégique peut regrouper plusieurs initiatives, territoires et financeurs.

### Exemple

Transformation : réduire les pertes post-capture.

Peuvent y contribuer :

- amélioration de la glace ;
- formation ;
- maintenance des équipements ;
- meilleure coordination logistique ;
- financement d'infrastructures ;
- actions sanitaires ;
- amélioration de l'information de marché.

Le portefeuille doit relier :

- objectifs de transformation ;
- territoires ;
- initiatives ;
- financements ;
- indicateurs ;
- résultats ;
- apprentissages.

## 14. Frontières fonctionnelles

### Ce que Mbàmbulaan fait

- relier ;
- qualifier ;
- coordonner ;
- tracer ;
- consolider ;
- préparer la décision ;
- suivre ;
- mesurer ;
- capitaliser.

### Ce que Mbàmbulaan ne fait pas nécessairement

- tenir la comptabilité complète d'une organisation ;
- exécuter les paiements bancaires en propre ;
- gérer toute la logistique opérationnelle ;
- remplacer les systèmes réglementaires existants ;
- devenir le réseau social généraliste de la filière ;
- gérer techniquement la construction d'une infrastructure ;
- se substituer à l'autorité de décision des institutions.

### Règle d'arbitrage

Lorsqu'une fonction relève déjà d'un système spécialisé, Mbàmbulaan doit privilégier l'intégration et l'orchestration plutôt que la reconstruction.

## 15. Architecture de déploiement fonctionnel

Le déploiement doit être progressif.

### Niveau 1 — Territoire pilote

- acteurs essentiels ;
- référentiel territorial ;
- signalement et qualification ;
- coordination ;
- initiatives ;
- suivi d'actions ;
- capitalisation simple.

### Niveau 2 — Réseau de territoires

- comparaison ;
- consolidation ;
- portefeuilles ;
- partage de pratiques ;
- vues régionales et nationales.

### Niveau 3 — Infrastructure nationale

- intégrations institutionnelles ;
- gouvernance avancée ;
- financement coordonné ;
- mesure d'impact consolidée ;
- recommandations et réplication assistée.

## 16. Exigences non fonctionnelles structurantes

Même si ce chapitre reste fonctionnel, certaines exigences doivent orienter la conception dès le départ.

- simplicité ;
- mobile-first ;
- fonctionnement avec connectivité limitée ;
- traçabilité ;
- sécurité ;
- explicabilité ;
- interopérabilité ;
- modularité ;
- faible dépendance à un fournisseur ;
- administration locale possible ;
- capacité de montée en charge ;
- sobriété technique et économique.

## 17. Tests de cohérence architecturale

Toute nouvelle capacité doit répondre à ces questions :

- quelle couche la porte ?
- quel moteur possède les objets concernés ?
- quelles autres couches l'utilisent ?
- quels événements métier sont produits ?
- quelles données sont créées ou modifiées ?
- quelles règles d'accès s'appliquent ?
- existe-t-il déjà un système externe à intégrer ?
- cette capacité améliore-t-elle réellement la coordination ou la décision ?

## 18. Principe directeur

> Les expériences montrent la valeur, l'orchestration organise le parcours, les moteurs portent les règles, le socle garantit la confiance et les intégrations connectent l'écosystème.
