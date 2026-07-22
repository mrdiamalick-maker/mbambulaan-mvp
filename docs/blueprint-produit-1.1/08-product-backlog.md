# 08 — Product Backlog

## 1. Finalité

Ce document transforme le MVP détaillé de Mbàmbulaan en backlog produit structuré et directement exploitable.

Il organise le travail en :

- Epics ;
- Features ;
- User Stories ;
- critères d'acceptation ;
- dépendances ;
- priorités ;
- risques ;
- incréments de livraison.

Le backlog doit rester piloté par la valeur métier et non par la seule logique technique.

## 2. Principes de priorisation

Chaque item doit être évalué selon :

- valeur pour la coordination ;
- fréquence d'usage ;
- criticité métier ;
- dépendances ;
- complexité ;
- risque ;
- nécessité pour le pilote ;
- capacité de monétisation ou de preuve de valeur.

## 3. Convention de priorité

- **P0 — indispensable** : sans cet item, le flux principal ne fonctionne pas ;
- **P1 — critique** : nécessaire pour un pilote crédible ;
- **P2 — important** : améliore fortement l'utilité ou l'adoption ;
- **P3 — opportunité** : utile mais reportable.

## 4. Epic 1 — Identité, organisations et mandats

### Objectif

Permettre à chaque action d'être reliée à un acteur légitime, une organisation et un mandat clair.

### Feature 1.1 — Authentification par téléphone

#### US-1.1.1 — Demander un code de connexion

En tant qu'utilisateur,
je veux recevoir un code de connexion sur mon téléphone,
afin d'accéder à Mbàmbulaan sans mot de passe complexe.

**Priorité** : P0

**Critères d'acceptation** :

- le numéro est validé ;
- un code temporaire est envoyé ;
- le code expire ;
- le nombre de tentatives est limité ;
- les erreurs sont compréhensibles.

#### US-1.1.2 — Se connecter avec un code valide

**Priorité** : P0

**Critères d'acceptation** :

- l'utilisateur est authentifié ;
- une session sécurisée est créée ;
- l'utilisateur est redirigé vers son espace ;
- l'action est auditée.

### Feature 1.2 — Profil acteur

#### US-1.2.1 — Créer un profil minimal

En tant qu'administrateur,
je veux créer un profil acteur minimal,
afin de permettre son onboarding rapide.

**Priorité** : P0

**Critères d'acceptation** :

- nom d'usage ;
- téléphone ;
- type d'acteur ;
- territoire principal ;
- organisation éventuelle ;
- statut de vérification.

#### US-1.2.2 — Consulter son profil

**Priorité** : P1

### Feature 1.3 — Organisation

#### US-1.3.1 — Créer une organisation

**Priorité** : P0

#### US-1.3.2 — Rattacher un acteur à une organisation

**Priorité** : P0

### Feature 1.4 — Mandats

#### US-1.4.1 — Accorder un mandat

En tant qu'administrateur,
je veux accorder un mandat à un acteur,
afin qu'il puisse agir dans un périmètre défini.

**Priorité** : P0

**Critères d'acceptation** :

- rôle défini ;
- territoire défini ;
- dates de validité ;
- autorité d'attribution ;
- trace d'audit.

#### US-1.4.2 — Révoquer un mandat

**Priorité** : P1

## 5. Epic 2 — Territoires

### Objectif

Rattacher les situations, acteurs et actions à un contexte territorial intelligible.

### Feature 2.1 — Référentiel territorial

#### US-2.1.1 — Créer un territoire

**Priorité** : P0

#### US-2.1.2 — Consulter la liste des territoires

**Priorité** : P0

#### US-2.1.3 — Filtrer les objets par territoire

**Priorité** : P1

### Feature 2.2 — Vue synthèse territoire

#### US-2.2.1 — Voir les situations critiques du territoire

**Priorité** : P2

#### US-2.2.2 — Voir les engagements en retard du territoire

**Priorité** : P2

## 6. Epic 3 — Signalements

### Objectif

Permettre une remontée terrain simple, traçable et exploitable.

### Feature 3.1 — Création d'un signalement

#### US-3.1.1 — Créer un brouillon

En tant qu'acteur terrain,
je veux enregistrer un brouillon de signalement,
afin de ne pas perdre ma saisie.

**Priorité** : P1

#### US-3.1.2 — Soumettre un signalement

En tant qu'acteur terrain,
je veux signaler une situation,
afin qu'elle soit prise en charge.

**Priorité** : P0

**Critères d'acceptation** :

- type ;
- description ;
- territoire ;
- pièce jointe facultative ;
- accusé de réception ;
- identifiant de suivi ;
- statut initial.

#### US-3.1.3 — Ajouter une photo ou un document

**Priorité** : P1

### Feature 3.2 — Suivi d'un signalement

#### US-3.2.1 — Consulter le statut

**Priorité** : P0

#### US-3.2.2 — Recevoir une notification de prise en charge

**Priorité** : P1

#### US-3.2.3 — Comprendre le motif de clôture

**Priorité** : P1

## 7. Epic 4 — Qualification des situations

### Objectif

Transformer des remontées brutes en situations qualifiées et actionnables.

### Feature 4.1 — File de qualification

#### US-4.1.1 — Voir les signalements à qualifier

**Priorité** : P0

#### US-4.1.2 — Trier par urgence ou territoire

**Priorité** : P1

### Feature 4.2 — Qualification

#### US-4.2.1 — Qualifier une situation

En tant que coordinateur,
je veux qualifier un signalement,
afin d'en déterminer la criticité et l'orientation.

**Priorité** : P0

**Critères d'acceptation** :

- criticité ;
- urgence ;
- périmètre ;
- justification ;
- statut ;
- historique.

#### US-4.2.2 — Regrouper plusieurs signalements

**Priorité** : P2

#### US-4.2.3 — Demander un complément

**Priorité** : P1

## 8. Epic 5 — Décisions et priorisation

### Objectif

Rendre visibles les arbitrages, mandats et justifications.

### Feature 5.1 — Priorisation

#### US-5.1.1 — Prioriser une situation

**Priorité** : P0

**Critères d'acceptation** :

- niveau de priorité ;
- critères examinés ;
- décisionnaire ;
- mandat ;
- justification ;
- événement émis.

### Feature 5.2 — Décision

#### US-5.2.1 — Enregistrer une décision

**Priorité** : P0

#### US-5.2.2 — Réviser une décision sans écraser l'historique

**Priorité** : P1

#### US-5.2.3 — Notifier les acteurs concernés

**Priorité** : P1

## 9. Epic 6 — Coordination

### Objectif

Organiser les acteurs autour d'une situation partagée.

### Feature 6.1 — Espace de coordination

#### US-6.1.1 — Créer un espace de coordination

**Priorité** : P0

#### US-6.1.2 — Ajouter des participants

**Priorité** : P0

#### US-6.1.3 — Consulter la chronologie

**Priorité** : P0

### Feature 6.2 — Commentaires structurés

#### US-6.2.1 — Ajouter une mise à jour opérationnelle

**Priorité** : P2

#### US-6.2.2 — Mentionner un acteur

**Priorité** : P3

## 10. Epic 7 — Engagements

### Objectif

Formaliser qui promet quoi, pour quand et avec quelle preuve.

### Feature 7.1 — Création d'engagement

#### US-7.1.1 — Proposer un engagement

**Priorité** : P0

**Critères d'acceptation** :

- responsable ;
- bénéficiaire ;
- contenu ;
- échéance ;
- preuve attendue ;
- statut proposé.

#### US-7.1.2 — Accepter ou refuser un engagement

**Priorité** : P0

### Feature 7.2 — Suivi de l'engagement

#### US-7.2.1 — Déclarer un engagement en cours

**Priorité** : P1

#### US-7.2.2 — Déclarer un engagement tenu

**Priorité** : P0

#### US-7.2.3 — Déclarer un engagement partiellement tenu ou non tenu

**Priorité** : P1

#### US-7.2.4 — Relancer avant échéance

**Priorité** : P2

## 11. Epic 8 — Actions et exécution

### Objectif

Suivre l'exécution concrète des engagements et décisions.

### Feature 8.1 — Création et assignation

#### US-8.1.1 — Créer une action

**Priorité** : P0

#### US-8.1.2 — Assigner une action

**Priorité** : P0

#### US-8.1.3 — Définir une échéance

**Priorité** : P0

### Feature 8.2 — Cycle de vie

#### US-8.2.1 — Démarrer une action

**Priorité** : P1

#### US-8.2.2 — Déclarer un blocage

**Priorité** : P0

#### US-8.2.3 — Terminer une action

**Priorité** : P0

#### US-8.2.4 — Vérifier une action terminée

**Priorité** : P0

## 12. Epic 9 — Documents et preuves

### Objectif

Renforcer la confiance et la vérifiabilité.

### Feature 9.1 — Ajout de preuve

#### US-9.1.1 — Ajouter une photo

**Priorité** : P0

#### US-9.1.2 — Ajouter un document

**Priorité** : P1

#### US-9.1.3 — Rattacher une preuve à une action ou décision

**Priorité** : P0

### Feature 9.2 — Vérification

#### US-9.2.1 — Valider ou rejeter une preuve

**Priorité** : P1

#### US-9.2.2 — Voir l'auteur et la date

**Priorité** : P0

## 13. Epic 10 — Notifications

### Objectif

Réduire les oublis et accélérer les transitions.

### Feature 10.1 — Notifications applicatives

#### US-10.1.1 — Recevoir une notification pour une action assignée

**Priorité** : P0

#### US-10.1.2 — Recevoir une demande de validation

**Priorité** : P0

#### US-10.1.3 — Recevoir une alerte de blocage

**Priorité** : P1

### Feature 10.2 — SMS

#### US-10.2.1 — Recevoir un SMS pour un événement critique

**Priorité** : P2

#### US-10.2.2 — Gérer les échecs et retries

**Priorité** : P2

## 14. Epic 11 — Mon travail

### Objectif

Donner à chaque acteur une vue claire de ce qu'il doit faire maintenant.

### Feature 11.1 — Liste personnelle

#### US-11.1.1 — Voir mes actions

**Priorité** : P0

#### US-11.1.2 — Voir mes engagements

**Priorité** : P0

#### US-11.1.3 — Voir mes validations

**Priorité** : P0

#### US-11.1.4 — Voir les échéances proches

**Priorité** : P1

## 15. Epic 12 — Chronologie et audit

### Objectif

Assurer la traçabilité des faits et décisions.

### Feature 12.1 — Chronologie métier

#### US-12.1.1 — Voir l'historique d'une situation

**Priorité** : P0

#### US-12.1.2 — Distinguer décisions, actions et preuves

**Priorité** : P1

### Feature 12.2 — Audit

#### US-12.2.1 — Enregistrer les opérations sensibles

**Priorité** : P0

#### US-12.2.2 — Consulter un journal d'audit simple

**Priorité** : P1

## 16. Epic 13 — Fonctionnement hors ligne

### Objectif

Permettre l'usage sur le terrain malgré une connectivité instable.

### Feature 13.1 — Brouillons locaux

#### US-13.1.1 — Enregistrer un brouillon hors ligne

**Priorité** : P1

### Feature 13.2 — Synchronisation

#### US-13.2.1 — Mettre en file une opération

**Priorité** : P1

#### US-13.2.2 — Voir l'état de synchronisation

**Priorité** : P1

#### US-13.2.3 — Rejouer une synchronisation échouée

**Priorité** : P2

#### US-13.2.4 — Éviter les doublons

**Priorité** : P0

## 17. Epic 14 — Administration

### Objectif

Configurer et opérer le pilote sans dépendre de développements permanents.

### Feature 14.1 — Référentiels

#### US-14.1.1 — Gérer les types de signalement

**Priorité** : P1

#### US-14.1.2 — Gérer les niveaux de criticité

**Priorité** : P1

### Feature 14.2 — Support opérationnel

#### US-14.2.1 — Rechercher un utilisateur

**Priorité** : P1

#### US-14.2.2 — Corriger une donnée avec trace

**Priorité** : P1

#### US-14.2.3 — Voir les erreurs de synchronisation

**Priorité** : P2

## 18. Epic 15 — Mesure du pilote

### Objectif

Prouver l'utilité opérationnelle et économique.

### Feature 15.1 — Instrumentation produit

#### US-15.1.1 — Mesurer les activations

**Priorité** : P1

#### US-15.1.2 — Mesurer les délais de traitement

**Priorité** : P0

#### US-15.1.3 — Mesurer le taux d'actions terminées

**Priorité** : P0

### Feature 15.2 — Rapport pilote

#### US-15.2.1 — Exporter les KPI essentiels

**Priorité** : P2

#### US-15.2.2 — Produire une synthèse territoire

**Priorité** : P2

## 19. Dépendances principales

### Dépendances structurantes

- Epic 1 avant presque tous les autres ;
- Epic 2 avant la qualification territoriale ;
- Epic 3 avant Epic 4 ;
- Epic 4 avant Epic 5 ;
- Epic 5 avant Epic 6 ;
- Epic 6 avant Epic 7 ;
- Epic 7 avant Epic 8 ;
- Epic 9 transverse ;
- Epic 12 transverse ;
- Epic 13 doit être intégré tôt dans les parcours mobiles.

## 20. Incréments de livraison recommandés

### Incrément 0 — Socle

- authentification ;
- acteurs ;
- organisations ;
- mandats ;
- territoires ;
- audit de base.

### Incrément 1 — Signalement et qualification

- signalements ;
- pièces jointes ;
- file de qualification ;
- criticité ;
- urgence ;
- statut ;
- notifications de base.

### Incrément 2 — Décision et coordination

- priorisation ;
- décisions ;
- espaces de coordination ;
- participants ;
- chronologie.

### Incrément 3 — Engagements et actions

- engagements ;
- assignation ;
- actions ;
- blocages ;
- vérification ;
- relances.

### Incrément 4 — Terrain renforcé

- hors ligne ;
- synchronisation ;
- SMS ;
- optimisation mobile ;
- administration.

### Incrément 5 — Pilotage et mesure

- KPI ;
- synthèse territoire ;
- export ;
- rapport pilote.

## 21. Definition of Ready

Une User Story est prête lorsque :

- le problème métier est clair ;
- l'utilisateur est identifié ;
- la valeur attendue est explicite ;
- les critères d'acceptation sont rédigés ;
- les dépendances sont connues ;
- les règles métier sont documentées ;
- les droits sont définis ;
- les données nécessaires sont connues ;
- les cas d'erreur sont anticipés ;
- la maquette ou le pattern fonctionnel existe si nécessaire.

## 22. Definition of Done

Une User Story est terminée lorsque :

- les critères d'acceptation sont satisfaits ;
- les tests passent ;
- les droits sont vérifiés ;
- l'audit est présent si nécessaire ;
- les états d'erreur sont couverts ;
- le mobile est validé ;
- le hors ligne est testé si pertinent ;
- la documentation est mise à jour ;
- les événements métier sont émis ;
- la fonctionnalité est démontrée à un utilisateur représentatif.

## 23. Risques backlog

### Risque de sur-spécification

Le backlog ne doit pas figer prématurément les solutions.

### Risque de dispersion

Les Epics liées au financement, à la marketplace ou à l'IA doivent rester hors du MVP.

### Risque de dette UX

Les parcours terrain doivent être testés avant d'accumuler des fonctionnalités administratives.

### Risque de dépendance institutionnelle

Le backlog doit rester exploitable même avec un sponsor public limité.

## 24. Arbitrage permanent

À chaque revue de backlog, poser :

- cette story améliore-t-elle la coordination ?
- est-elle nécessaire au pilote ?
- qui l'utilise ?
- qui en bénéficie ?
- qui paiera indirectement ou directement pour cette valeur ?
- peut-elle être retirée sans casser la preuve du MVP ?

## 25. Principe directeur

> Le backlog de Mbàmbulaan doit livrer la preuve de coordination la plus forte avec le minimum de complexité produit et technique.
