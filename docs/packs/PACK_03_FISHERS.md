# PACK 03 - Fisher Network

## Statut du document

Ce pack décrit la capability `FISHER NETWORK` de Mbàmbulaan.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Le Fisher Network couvre tout ce qui concerne les pêcheurs dans Mbàmbulaan : identification, référencement, confiance, déclarations, validation, historique, réputation, données et accompagnement humain.

Le pêcheur n'est pas considéré comme un utilisateur numérique par défaut. Mbàmbulaan est conçu pour construire un réseau humain de confiance. Le digital vient simplifier les interactions, réduire les pertes d'information, donner de la visibilité aux lots, faciliter les opportunités et créer une preuve d'activité.

Ce document ne crée aucune nouvelle fonctionnalité et ne modifie pas la vision produit. Il spécifie officiellement le périmètre pêcheur à partir du Product Book.

## 1. Vision

### Pourquoi ce module existe

Le pêcheur est l'un des premiers points d'entrée de la valeur dans Mbàmbulaan : il rend visible le lot débarqué, son origine, sa quantité, son espèce, son heure d'arrivée, son quai et son historique. Sans réseau pêcheur fiable, la plateforme ne peut ni coordonner les besoins, ni générer des opportunités crédibles, ni mesurer l'impact territorial.

Le module existe pour transformer une information terrain souvent orale, fragmentée ou tardive en signal de coordination exploitable, sans exiger que chaque pêcheur devienne immédiatement utilisateur d'une application.

### Valeur apportée

| Valeur | Description |
| --- | --- |
| Visibilité | Les lots débarqués deviennent visibles pour la coordination |
| Meilleure valorisation | Les lots peuvent rencontrer des besoins plus rapidement |
| Preuve d'activité | Les déclarations et historiques renforcent la crédibilité |
| Confiance | Les pêcheurs référents et validations humaines structurent le réseau |
| Réduction des pertes | Les lots sensibles peuvent être signalés et priorisés |
| Accès progressif | WhatsApp, SMS, appel, agent terrain ou application selon maturité |
| Inclusion | Le produit respecte les réalités terrain, linguistiques et numériques |

### Amélioration du revenu des pêcheurs

Mbàmbulaan améliore le revenu des pêcheurs en rendant les lots plus visibles, en accélérant la rencontre entre offre et demande, en réduisant les pertes d'information, en créant une preuve d'activité et en renforçant la confiance des acheteurs. Le revenu n'est pas amélioré par une promesse de prix automatique, mais par une meilleure coordination, une meilleure traçabilité et une meilleure capacité à valoriser les débarquements.

| Levier | Effet attendu |
| --- | --- |
| Déclaration rapide | Plus de chances de détecter une opportunité |
| Historique fiable | Meilleure réputation auprès des acheteurs et partenaires |
| Lot qualifié | Décision plus rapide côté mareyeur ou transformateur |
| Réseau référent | Moins d'asymétrie d'information |
| Notifications | Moins d'occasions manquées |
| Traçabilité | Meilleure preuve pour coopératives, banques, assurances ou programmes |

### KPIs

| KPI | Définition | Décision associée |
| --- | --- | --- |
| Pêcheurs référencés | Nombre de pêcheurs connus du réseau | Mesurer couverture terrain |
| Pêcheurs validés | Référencés ayant passé validation | Mesurer confiance du réseau |
| Pêcheurs actifs | Pêcheurs ayant déclaré ou confirmé récemment | Mesurer activation |
| Déclarations par canal | WhatsApp, appel, SMS, app, agent, import | Prioriser les canaux utiles |
| Lots valorisés | Déclarations liées à opportunité ou transaction | Mesurer valeur économique |
| Délai déclaration -> validation | Temps moyen de contrôle | Optimiser opérations terrain |
| Taux de conflits | Déclarations contestées ou doublons | Améliorer qualité et confiance |
| Score de confiance moyen | Signal consolidé par historique et validation | Identifier accompagnement nécessaire |
| Réactivation | Pêcheurs inactifs redevenus actifs | Mesurer suivi terrain |

## 2. Personas

| Persona | Description | Besoin principal | Canal probable |
| --- | --- | --- | --- |
| Pêcheur référent | Acteur reconnu localement, fiable, relais d'information | Déclarer vite et renforcer sa réputation | WhatsApp, appel, agent, app |
| Pêcheur occasionnel | Déclare ponctuellement ou via un tiers | Être visible sans complexité | Appel, SMS, agent |
| Président de GIE | Coordonne un groupe ou une organisation locale | Suivre les membres et les volumes | WhatsApp, app, agent |
| Capitaine | Responsable opérationnel d'une pirogue | Déclarer le retour et le lot | Appel, WhatsApp |
| Jeune pêcheur | Plus à l'aise avec le numérique | Déclarer et suivre depuis mobile | App, WhatsApp |
| Femme pêcheuse | Actrice de la filière, parfois impliquée transformation, vente ou collecte | Être reconnue et reliée aux opportunités | WhatsApp, agent, appel |

### Pêcheur référent

| Élément | Spécification |
| --- | --- |
| Rôle | Source de confiance locale |
| Valeur | Visibilité, réputation, accès opportunités |
| Risque | Surcharge si tout passe par lui |
| Expérience | Déclaration rapide, historique clair, notifications simples |

### Pêcheur occasionnel

| Élément | Spécification |
| --- | --- |
| Rôle | Participant non régulier |
| Valeur | Accès sans obligation numérique |
| Risque | Données incomplètes |
| Expérience | Déclaration assistée, validation humaine |

### Président de GIE

| Élément | Spécification |
| --- | --- |
| Rôle | Coordination collective |
| Valeur | Vue des membres, volumes, preuves |
| Risque | Confusion entre données individuelles et collectives |
| Expérience | Vue groupée, droits contextualisés |

### Capitaine

| Élément | Spécification |
| --- | --- |
| Rôle | Déclaration opérationnelle du retour |
| Valeur | Rapidité et reconnaissance du lot |
| Risque | Informations transmises en urgence |
| Expérience | Déclaration courte et confirmable |

### Jeune pêcheur

| Élément | Spécification |
| --- | --- |
| Rôle | Adoption numérique progressive |
| Valeur | Suivi mobile, historique personnel |
| Risque | Confondre simplicité et absence de validation |
| Expérience | Mobile first, notifications lisibles |

### Femme pêcheuse

| Élément | Spécification |
| --- | --- |
| Rôle | Actrice économique de la filière |
| Valeur | Reconnaissance, accès aux informations et opportunités |
| Risque | Invisibilisation si les parcours sont trop centrés pirogue |
| Expérience | Profil reconnu, canal accompagné, données protégées |

## 3. Acquisition

### Comment rejoindre Mbàmbulaan

| Chemin | Description | Validation |
| --- | --- | --- |
| Référent local | Un pêcheur référent ou agent terrain invite le pêcheur | Validation humaine |
| GIE ou coopérative | Le groupe propose une liste de membres | Contrôle organisation |
| Agent terrain | Collecte d'identité et contexte au quai | Vérification terrain |
| WhatsApp | Premier contact par message ou vocal | Confirmation par référent |
| Appel | Inscription assistée par opérateur | Contrôle support ou terrain |
| Import manuel | Saisie par équipe Mbàmbulaan | Validation admin |
| Import API | Source partenaire ou institutionnelle | Mapping, contrôle qualité |

### Référencement

Le référencement crée une fiche pêcheur minimale. Il ne donne pas automatiquement un statut validé.

| Donnée minimale | Usage |
| --- | --- |
| Nom ou identifiant local | Reconnaissance terrain |
| Quai principal | Contextualisation territoriale |
| Contact ou relais | Canal de communication |
| Type de rôle | Pêcheur, capitaine, référent, membre GIE |
| Source | Origine de l'information |
| Statut | Prospect ou référencé |

### Validation

La validation confirme que le pêcheur existe, que son rattachement territorial est plausible et que son canal de contact est utilisable.

| Critère | Méthode |
| --- | --- |
| Identité connue | Référent, GIE, agent terrain |
| Zone cohérente | Quai, communauté, territoire |
| Contact fiable | Appel, WhatsApp, SMS, relais |
| Activité plausible | Historique, déclarations, saisonnalité |
| Absence de doublon | Recherche par nom, quai, contact, embarcation |

### Confiance

La confiance est un actif produit. Elle repose sur les preuves, l'historique, la régularité, les validations, les conflits traités et les transactions honorées.

### Notation

La notation n'est pas punitive. Elle sert à orienter les validations, détecter les risques et renforcer la fiabilité du réseau. Elle doit rester explicable et révisable.

### Réputation

| Signal | Effet |
| --- | --- |
| Déclarations confirmées | Réputation renforcée |
| Lots liés à transactions terminées | Crédibilité économique |
| Informations complètes | Qualité du profil |
| Conflits résolus positivement | Confiance maintenue |
| Inactivité longue | Réactivation nécessaire |
| Signalements répétés | Revue humaine |

## 4. Déclarations

Une déclaration pêcheur est un signal terrain pouvant concerner un arrivage, un volume prévu, un lot disponible, une information de quai ou un complément d'identité.

| Canal | Usage | Niveau d'assistance |
| --- | --- | --- |
| WhatsApp | Message texte, vocal, photo ou confirmation | Assistance humaine ou automatisée à valider |
| Appel téléphonique | Déclaration orale rapide | Opérateur ou agent saisit |
| SMS | Signal court en faible connectivité | Saisie simplifiée |
| Application | Déclaration directe par utilisateur équipé | Validation selon confiance |
| Agent terrain | Collecte sur quai | Forte validation humaine |
| Import API | Source partenaire | Mapping et contrôle qualité |
| Import manuel | Saisie back-office | Validation admin |

### Champs de déclaration

| Champ | Description |
| --- | --- |
| Pêcheur ou relais | Auteur ou source |
| Quai | Lieu de débarquement |
| Espèce | Espèce déclarée |
| Volume | Quantité estimée ou confirmée |
| Unité | Kg, tonne ou autre unité normalisée |
| Heure | Heure d'arrivée ou de déclaration |
| Statut | Prévu, déclaré, disponible, réservé, livré selon cycle |
| Qualité perçue | Signal simple si disponible |
| Photo ou document | Pièce optionnelle |
| Canal | Source de la déclaration |

### Règles par canal

| Canal | Règle |
| --- | --- |
| WhatsApp | Les vocaux et messages doivent être transcrits ou résumés avant validation |
| Appel | L'opérateur confirme les champs essentiels |
| SMS | Les déclarations incomplètes vont en statut à compléter |
| Application | Le pêcheur voit un résumé avant envoi |
| Agent terrain | L'agent peut joindre contexte, photo et commentaire |
| Import API | Chaque ligne garde la source technique |
| Import manuel | La personne qui saisit est historisée |

## 5. Validation

### Qui valide

| Validateur | Périmètre |
| --- | --- |
| Pêcheur référent | Confirmation locale simple |
| Président de GIE | Confirmation membre ou activité collective |
| Agent terrain | Validation quai, identité, déclaration |
| Opérations Terrain | Contrôle opérationnel |
| Admin Données | Données sensibles, doublons, imports |
| Support | Correction de contact ou erreur simple |
| Data Manager | Qualité, conflit, historique |

### Comment valider

| Étape | Description |
| --- | --- |
| Contrôle complétude | Vérifier champs nécessaires |
| Contrôle cohérence | Quai, espèce, volume, heure, saisonnalité |
| Contrôle source | Identifier canal et auteur |
| Contrôle doublon | Comparer avec profils ou déclarations proches |
| Décision | Valider, demander complément, rejeter, fusionner |
| Historisation | Enregistrer auteur, date, justification et résultat |

### Historique

Chaque validation conserve : objet, validateur, date, canal, statut précédent, statut nouveau, justification, commentaire, conflit éventuel et pièces associées.

### Score de confiance

| Critère | Effet |
| --- | --- |
| Profil complet | Augmente |
| Déclarations validées | Augmente |
| Transactions finalisées | Augmente |
| Conflits non résolus | Diminue |
| Doublons fréquents | Diminue |
| Inactivité longue | Déclenche revue |
| Référent confirmé | Augmente |

### Conflits

Un conflit peut venir d'une déclaration contradictoire, d'un doublon, d'un volume contesté, d'une identité incertaine ou d'un rattachement territorial ambigu.

| Type | Traitement |
| --- | --- |
| Identité | Vérification référent ou agent |
| Volume | Comparaison historique et confirmation |
| Quai | Contrôle territoire |
| Doublon | Fusion ou séparation |
| Canal | Confirmation par autre canal |
| Réputation | Revue humaine |

### Fusion

La fusion est réservée aux cas où deux fiches ou déclarations représentent clairement le même acteur ou le même objet. Elle doit conserver les anciennes références, l'historique et la justification.

## 6. Cycle de vie

| Statut | Définition | Entrée | Sortie possible |
| --- | --- | --- | --- |
| Prospect | Pêcheur identifié mais non référencé | Contact initial | Référencé ou rejeté |
| Référencé | Fiche minimale créée | Référencement | Validé, à compléter, archivé |
| Validé | Identité et rattachement confirmés | Validation humaine | Actif ou suspendu |
| Actif | Déclare ou participe récemment | Déclaration, transaction, confirmation | Inactif ou suspendu |
| Inactif | Aucune activité récente | Absence prolongée | Actif après réactivation |
| Suspendu | Accès ou confiance bloquée temporairement | Conflit, signalement, risque | Réactivé ou archivé |

### Règles de transition

| Transition | Condition |
| --- | --- |
| Prospect -> Référencé | Données minimales disponibles |
| Référencé -> Validé | Identité, zone et source confirmées |
| Validé -> Actif | Déclaration ou action récente |
| Actif -> Inactif | Période sans signal |
| Actif -> Suspendu | Conflit critique ou risque |
| Suspendu -> Actif | Revue humaine positive |
| Inactif -> Actif | Nouvelle déclaration validée |

## 7. Données

### Données d'identité

| Donnée | Usage |
| --- | --- |
| Identifiant interne | Source de vérité |
| Nom local | Reconnaissance terrain |
| Contact | Communication |
| Rôle | Pêcheur, capitaine, référent, président GIE |
| Organisation | GIE, coopérative, communauté |
| Langue ou préférence | Accompagnement |
| Canal préféré | WhatsApp, appel, SMS, application, agent |

### Zone de pêche

| Donnée | Usage |
| --- | --- |
| Quai principal | Territoire de rattachement |
| Quais secondaires | Mobilité |
| Zone habituelle | Contexte métier |
| Communauté | Réseau humain |
| Référent local | Validation |

### Embarcation

| Donnée | Usage |
| --- | --- |
| Nom ou identifiant | Reconnaissance |
| Type | Contexte capacité |
| Capitaine | Responsable |
| Équipage lié | Réseau |
| Quai principal | Territoire |

### Espèces

| Donnée | Usage |
| --- | --- |
| Espèces habituelles | Profil métier |
| Espèces déclarées | Historique |
| Saisonnalité | Cohérence |
| Sensibilité qualité | Priorisation |

### Volumes

| Donnée | Usage |
| --- | --- |
| Volume déclaré | Opportunités |
| Volume validé | Coordination |
| Unité | Normalisation |
| Écart historique | Détection anomalie |

### Fréquence

| Donnée | Usage |
| --- | --- |
| Nombre de déclarations | Activité |
| Régularité | Confiance |
| Dernière activité | Réactivation |
| Canal dominant | Accompagnement |

### Saisonnalité

| Donnée | Usage |
| --- | --- |
| Mois actifs | Prévision prudente |
| Espèces saisonnières | Cohérence |
| Volumes habituels | Anomalies |

### Historique

| Donnée | Usage |
| --- | --- |
| Déclarations | Preuve d'activité |
| Validations | Confiance |
| Opportunités liées | Valeur |
| Transactions | Réputation |
| Notifications | Suivi |
| Conflits | Revue humaine |

### Documents

| Document | Usage |
| --- | --- |
| Pièce d'identité si disponible | Validation sensible |
| Photo embarcation | Reconnaissance |
| Document GIE | Rattachement |
| Preuve activité | Confiance |
| Consentement | Gouvernance data |

## 8. IA

L'IA dans Fisher Network est assistive et soumise à validation humaine. Elle ne décide pas seule du statut d'un pêcheur, d'une suspension, d'une fusion ou d'une réputation.

| Assistance IA | Usage | Validation |
| --- | --- | --- |
| Suggestions | Compléter profil, quai, espèce ou volume probable | Agent ou Admin Données |
| Détection anomalies | Volume atypique, doublon, canal suspect, incohérence saisonnière | Data Manager |
| Prévision | Estimer activité ou saisonnalité à titre indicatif | Lecture prudente |
| Qualification automatique | Classer déclaration complète, incomplète ou à risque | Validation humaine |
| Résumé | Synthétiser historique, conflits, activité ou profil | Support ou opérations |

### Règles IA

| Règle | Application |
| --- | --- |
| Explicable | Toute suggestion affiche ses raisons |
| Prudente | Les prévisions restent indicatives |
| Contextuelle | Le quai, la saison, l'historique et le canal cadrent l'analyse |
| Révisable | Un humain peut corriger toute suggestion |
| Non punitive | Un score faible déclenche une revue, pas une exclusion automatique |

## 9. UX

### Toutes les vues

| Vue | Objectif | Utilisateur |
| --- | --- | --- |
| Liste pêcheurs | Rechercher, filtrer, suivre statuts | Opérations, Support, Admin Données |
| Fiche pêcheur | Voir identité, activité, confiance, historique | Opérations, Support |
| Déclaration rapide | Saisir ou confirmer un lot | Agent, Support, pêcheur équipé |
| File de validation | Contrôler profils et déclarations | Admin Données, Opérations |
| Conflits | Résoudre doublons ou contradictions | Data Manager |
| Historique pêcheur | Lire déclarations, validations, transactions | Opérations, Support |
| Réseau local | Voir référents, GIE, communautés | Opérations Terrain |
| Réactivation | Identifier pêcheurs inactifs | Customer Success, Opérations |
| Documents | Gérer preuves et consentements | Admin Données |
| Vue mobile terrain | Déclaration ou consultation simplifiée | Agent, pêcheur équipé |

### Toutes les cartes

| Carte | Contenu |
| --- | --- |
| Profil pêcheur | Nom, statut, quai, rôle, canal |
| Confiance | Score, raisons, dernier contrôle |
| Activité | Déclarations, volumes, dernière activité |
| Lot récent | Espèce, volume, heure, statut |
| Canal | WhatsApp, appel, SMS, application, agent |
| Validation | Statut, responsable, prochain contrôle |
| Conflit | Type, gravité, action attendue |
| Réputation | signaux positifs et points à vérifier |
| Réseau | GIE, référents, embarcation, communauté |
| Documents | pièces disponibles et manquantes |

### Tous les composants

| Composant | Usage |
| --- | --- |
| FisherProfileHeader | Identité, statut, quai, canal préféré |
| TrustScoreBadge | Score de confiance explicable |
| FisherStatusBadge | Prospect, référencé, validé, actif, inactif, suspendu |
| DeclarationChannelBadge | Canal de déclaration |
| FisherActivityTimeline | Historique déclarations, validations, transactions |
| DeclarationQuickForm | Saisie courte multi-canal |
| ValidationChecklist | Contrôles obligatoires |
| ConflictResolutionPanel | Doublon, incohérence, contestation |
| FisherNetworkMap | Vue territoriale du réseau |
| DocumentPanel | Pièces et consentements |
| ReputationPanel | Raisons de réputation |
| OfflineDraftBanner | Brouillon terrain non synchronisé |
| SyncStatusIndicator | Statut de synchronisation |
| AgentAssignmentPanel | Responsable terrain |
| ContactPreferenceCard | Canal préféré et relais |

### Tous les états

| État | Signification | UX attendue |
| --- | --- | --- |
| Prospect | Premier signal | Inviter à compléter |
| Référencé | Fiche minimale | Proposer validation |
| À compléter | Donnée insuffisante | Montrer champs manquants |
| Validé | Profil confirmé | Autoriser déclarations fiables |
| Actif | Activité récente | Mettre en avant lots et historique |
| Inactif | Pas d'activité récente | Proposer réactivation |
| Suspendu | Risque ou conflit | Expliquer revue humaine |
| Conflit ouvert | Contradiction | Afficher résolution |
| Hors ligne | Pas de réseau | Garder brouillon |
| Synchronisé | Données envoyées | Confirmer réception |

## 10. User Stories

### Story 1 - Référencer un pêcheur

En tant qu'agent terrain, je veux référencer un pêcheur afin de créer une fiche minimale sans exiger d'usage numérique.

| Given | When | Then |
| --- | --- | --- |
| Je rencontre un pêcheur non connu | Je saisis les informations minimales | Le pêcheur passe au statut référencé |

Definition of Done : la fiche indique source, canal et statut.

### Story 2 - Valider un pêcheur référencé

En tant qu'Opérations Terrain, je veux valider un pêcheur afin de renforcer la confiance du réseau.

| Given | When | Then |
| --- | --- | --- |
| Un pêcheur est référencé | Je confirme identité, quai et source | Le statut devient validé |

Definition of Done : la validation est historisée.

### Story 3 - Déclarer par WhatsApp

En tant que pêcheur référent, je veux déclarer un lot par WhatsApp afin de rendre le débarquement visible rapidement.

| Given | When | Then |
| --- | --- | --- |
| J'envoie une information de lot | Le message est transformé en déclaration | La déclaration attend validation ou confirmation |

Definition of Done : le canal WhatsApp et le contenu résumé sont conservés.

### Story 4 - Déclarer par appel

En tant que capitaine, je veux déclarer par téléphone afin de transmettre une information sans utiliser d'application.

| Given | When | Then |
| --- | --- | --- |
| J'appelle un relais ou opérateur | Il saisit espèce, volume, quai et heure | Le lot apparaît comme déclaration assistée |

Definition of Done : l'opérateur et l'heure de saisie sont historisés.

### Story 5 - Déclarer par SMS

En tant que pêcheur occasionnel, je veux envoyer un SMS afin de signaler un lot en connectivité faible.

| Given | When | Then |
| --- | --- | --- |
| J'envoie un SMS incomplet | Le système crée une déclaration à compléter | Un agent peut compléter ou confirmer |

Definition of Done : les champs manquants sont visibles.

### Story 6 - Déclarer via application

En tant que jeune pêcheur, je veux déclarer depuis mobile afin de suivre directement mes lots.

| Given | When | Then |
| --- | --- | --- |
| Je remplis le formulaire court | Je confirme la déclaration | Le lot est enregistré avec mon profil |

Definition of Done : la déclaration reste validable selon le niveau de confiance.

### Story 7 - Saisir pour un pêcheur

En tant qu'agent terrain, je veux saisir une déclaration pour un pêcheur afin de ne pas exclure les personnes non numériques.

| Given | When | Then |
| --- | --- | --- |
| Un pêcheur me donne l'information au quai | Je saisis les champs nécessaires | La source agent est conservée |

Definition of Done : la déclaration distingue auteur, pêcheur et canal.

### Story 8 - Importer des pêcheurs

En tant qu'Admin Données, je veux importer une liste de pêcheurs afin de référencer un groupe existant.

| Given | When | Then |
| --- | --- | --- |
| Une liste GIE est disponible | Je l'importe et contrôle les doublons | Les fiches sont référencées ou signalées |

Definition of Done : l'import ne valide pas automatiquement les profils.

### Story 9 - Résoudre un doublon

En tant que Data Manager, je veux fusionner deux fiches pêcheur afin de garder une source de vérité.

| Given | When | Then |
| --- | --- | --- |
| Deux fiches semblent identiques | Je compare les données | Je fusionne avec justification |

Definition of Done : les historiques des deux fiches restent conservés.

### Story 10 - Consulter l'historique

En tant que Support, je veux consulter l'historique d'un pêcheur afin de comprendre une demande.

| Given | When | Then |
| --- | --- | --- |
| Un pêcheur contacte le support | J'ouvre sa fiche | Je vois déclarations, statuts et actions récentes autorisées |

Definition of Done : les données sensibles restent contrôlées par permissions.

### Story 11 - Gérer un conflit

En tant qu'Opérations Terrain, je veux traiter un conflit de déclaration afin de préserver la confiance.

| Given | When | Then |
| --- | --- | --- |
| Une déclaration est contestée | Je consulte sources et historique | Je valide, corrige ou rejette avec justification |

Definition of Done : le conflit garde statut et décision.

### Story 12 - Expliquer un score de confiance

En tant que pêcheur référent, je veux comprendre mon score afin de savoir ce qui renforce ma réputation.

| Given | When | Then |
| --- | --- | --- |
| Je consulte mon profil ou un agent me le montre | Le score est affiché | Les raisons principales sont expliquées |

Definition of Done : le score n'est jamais affiché sans explication.

### Story 13 - Réactiver un pêcheur inactif

En tant que Customer Success, je veux identifier les pêcheurs inactifs afin de relancer le réseau.

| Given | When | Then |
| --- | --- | --- |
| Un pêcheur n'a pas déclaré récemment | Je le filtre dans la vue réactivation | Je peux assigner un suivi terrain |

Definition of Done : l'action de suivi est assignable et historisée.

### Story 14 - Suspendre avec revue humaine

En tant que Super Admin ou Opérations Terrain autorisé, je veux suspendre temporairement un profil afin de traiter un risque.

| Given | When | Then |
| --- | --- | --- |
| Un risque critique est confirmé | Je justifie la suspension | Le statut devient suspendu avec historique |

Definition of Done : aucune suspension automatique n'est possible sans revue humaine.

### Story 15 - Synchroniser hors ligne

En tant qu'agent terrain, je veux conserver une déclaration hors ligne afin de la synchroniser plus tard.

| Given | When | Then |
| --- | --- | --- |
| Je suis sans connexion | Je saisis une déclaration | Elle reste en brouillon jusqu'à synchronisation |

Definition of Done : l'état hors ligne est visible et non confondu avec validé.

### Story 16 - Voir le réseau local

En tant qu'Opérations Terrain, je veux voir les pêcheurs par quai afin de piloter le réseau humain.

| Given | When | Then |
| --- | --- | --- |
| Je filtre un quai | La liste des pêcheurs et référents apparaît | Je vois statuts, activité et besoins de validation |

Definition of Done : la vue reste territoriale et actionnable.

## 11. Tests

### Tests validation

| Test | Attendu |
| --- | --- |
| Référencement minimal | Statut référencé avec source |
| Validation complète | Passage à validé avec historique |
| Déclaration incomplète | Statut à compléter |
| Doublon détecté | Proposition de fusion |
| Conflit résolu | Décision et justification conservées |
| Suspension | Revue humaine obligatoire |

### Tests sécurité

| Test | Attendu |
| --- | --- |
| Accès fiche pêcheur | Contrôlé par rôle et contexte |
| Données sensibles | Masquées sans droit |
| Document personnel | Accès restreint |
| Export pêcheurs | Justification et audit |
| Suspension | Rôle autorisé seulement |
| Fusion | Historique non supprimé |

### Tests performance

| Test | Attendu |
| --- | --- |
| Liste pêcheurs | Filtrage rapide par quai, statut, canal |
| Historique long | Chargement paginé |
| Recherche doublon | Réponse exploitable |
| Import | Prévisualisation sans blocage |
| Vue réseau | Chargement progressif |

### Tests UX

| Test | Attendu |
| --- | --- |
| Déclaration courte | Champs essentiels visibles |
| Canal non numérique | WhatsApp, appel, SMS et agent valorisés |
| Score expliqué | Raisons visibles |
| Empty state | Prochaine action claire |
| Conflit | Résolution guidée |
| Mobile terrain | Lisible et simple |

### Tests offline

| Test | Attendu |
| --- | --- |
| Brouillon hors ligne | Conservé localement |
| Statut hors ligne | Visible |
| Reprise connexion | Synchronisation proposée |
| Conflit de synchro | Revue humaine |
| Données non envoyées | Pas marquées validées |

### Tests synchronisation

| Test | Attendu |
| --- | --- |
| Synchronisation réussie | Statut envoyé |
| Synchronisation partielle | Erreurs listées |
| Doublon après synchro | Signalé |
| Modification concurrente | Comparaison avant validation |
| Journal de synchro | Historique disponible |

## 12. Definition of Done

### Checklist complète

| Critère | Done |
| --- | --- |
| Référence Product Book respectée | Aucune contradiction avec `MBAMBULAAN_PRODUCT_BOOK_v1.md` |
| Pêcheur non numérique par défaut | WhatsApp, appel, SMS, agent et import sont couverts |
| Réseau humain central | Référents, GIE, agents terrain et validation humaine sont structurés |
| Personas couverts | 6 personas pêcheurs spécifiés |
| Acquisition définie | Rejoindre, référencement, validation, confiance, notation, réputation |
| Déclarations multi-canal | WhatsApp, appel, SMS, application, agent, API, manuel |
| Validation cadrée | Qui valide, comment, historique, conflits, fusion |
| Cycle de vie défini | Prospect, référencé, validé, actif, inactif, suspendu |
| Données spécifiées | Identité, zone, embarcation, espèces, volumes, fréquence, saisonnalité, historique, documents |
| IA assistive | Suggestions, anomalies, prévision, qualification, résumé sous contrôle humain |
| UX complète | Vues, cartes, composants, états |
| User Stories complètes | Stories avec Given / When / Then |
| Tests définis | Validation, sécurité, performance, UX, offline, synchronisation |
| Confiance explicable | Score et réputation justifiés |
| Documentation exploitable | Utilisable par Product, UX, Data, Opérations et Engineering |

### Conditions de validation

| Condition | Résultat attendu |
| --- | --- |
| Un pêcheur peut rejoindre sans application | Oui |
| Un agent peut déclarer pour un pêcheur | Oui |
| Une déclaration reste validable | Oui |
| La réputation est explicable | Oui |
| Les conflits sont historisés | Oui |
| Le hors ligne est prévu | Oui |
| La donnée reste gouvernée | Oui |

## Synthèse de livraison

| Indicateur | Nombre |
| --- | --- |
| Pages ou vues spécifiées | 10 |
| Composants spécifiés | 15 |
| User Stories | 16 |
| Tests spécifiés | 33 |
