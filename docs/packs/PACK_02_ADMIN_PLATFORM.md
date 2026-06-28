# PACK 02 - Admin Platform

## Statut du document

Ce pack décrit la capability `ADMIN PLATFORM` de Mbàmbulaan.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

L'Admin Platform est le back-office utilisé exclusivement par l'équipe Mbàmbulaan. Ce n'est pas un espace client, pas un module public et pas un workspace partenaire. C'est le cockpit interne de l'entreprise pour gouverner les droits, les données, les référentiels, les opérations, les alertes, les contenus, les intégrations, les logs et la qualité du système.

Ce document ne crée aucune nouvelle fonctionnalité et ne modifie pas la vision. Il transforme les principes du Product Book en spécification officielle pour la capability d'administration.

## 1. Vision

### Pourquoi ce workspace existe

Mbàmbulaan est une plateforme adaptative de coordination territoriale. Pour rester fiable, gouvernable et scalable, elle doit disposer d'un espace interne capable de maintenir les référentiels, contrôler la qualité des données, administrer les droits, superviser les opérations, historiser les actions, accompagner les utilisateurs et piloter les intégrations.

L'Admin Platform existe pour protéger la cohérence du système. Elle assure que les signaux terrain, les objets métier, les acteurs, les territoires, les décisions, les alertes et les données sensibles restent exploitables, traçables et sous gouvernance.

### Problèmes résolus

| Problème interne | Risque sans Admin Platform | Réponse Admin Platform |
| --- | --- | --- |
| Données dispersées | Décisions fondées sur des informations incohérentes | Source de vérité, validation, fusion, historique |
| Droits mal gouvernés | Exposition de données sensibles | RBAC, ABAC, contextual access, audit |
| Référentiels non maintenus | Quais, acteurs, marchés et prix deviennent obsolètes | Espaces de configuration et de validation |
| Support non structuré | Incidents et demandes se perdent | CRM, support, assignation, suivi |
| Qualité data insuffisante | Recommandations et alertes moins fiables | Data Quality, contrôles, anomalies |
| Opérations terrain peu lisibles | Déploiement difficile à piloter | Dashboard opérations, territoires, communautés |
| IA non gouvernée | Scores ou suggestions non explicables | Catalogue IA, versioning, validation humaine |
| Absence de traçabilité | Impossible d'expliquer une décision | Logs, audit, historique, rollback |

### Objectifs

| Objectif | Description |
| --- | --- |
| Gouverner | Administrer utilisateurs, organisations, permissions et référentiels |
| Qualifier | Valider, enrichir, fusionner et archiver les données |
| Superviser | Suivre opérations, alertes, opportunités, projets et programmes |
| Sécuriser | Protéger les données sensibles par rôles, attributs et contexte |
| Assister | Aider les équipes internes avec suggestions, classification et résumés |
| Historiser | Garder une preuve des changements, validations et décisions |
| Piloter | Donner à l'équipe Mbàmbulaan une lecture complète du fonctionnement |

### KPIs

| KPI | Définition | Décision associée |
| --- | --- | --- |
| Taux de données validées | Données validées / données en attente | Renforcer opérations ou automatisation assistée |
| Délai moyen de validation | Temps entre création et validation | Améliorer file de validation |
| Taux d'anomalies traitées | Anomalies closes / anomalies détectées | Prioriser data quality |
| Temps de résolution support | Délai entre ticket ouvert et résolu | Ajuster support et Customer Success |
| Taux d'actions auditées | Actions sensibles avec trace complète | Renforcer conformité |
| Taux de permissions revues | Droits vérifiés / droits actifs | Réduire risque sécurité |
| Taux de doublons fusionnés | Doublons traités / doublons détectés | Améliorer référentiels |
| Taux de rollback | Rollbacks / changements administratifs | Identifier erreurs de configuration |
| Qualité des référentiels | Champs complets, actifs, non dupliqués | Prioriser nettoyage |
| Santé des intégrations | APIs internes stables, logs sans incident critique | Prévenir ruptures opérationnelles |

## 2. Utilisateurs

L'Admin Platform est réservée aux équipes Mbàmbulaan. Les clients, partenaires, collectivités, institutions et acteurs terrain n'y accèdent pas.

| Utilisateur interne | Mission | Accès dominant |
| --- | --- | --- |
| Super Admin | Gouverner toute la plateforme et les droits critiques | Tous espaces, permissions, audit, configuration |
| Admin Produit | Maintenir modules, contenus, parcours et configuration produit | Contenus, configuration, notifications, analytics |
| Admin Données | Contrôler qualité, référentiels, imports, exports et fusions | Données, validation, territoires, marchés, prix |
| Admin IA | Gouverner moteurs, scores, suggestions et classification | Catalogue IA, logs IA, validation humaine |
| Support | Traiter demandes, incidents et corrections simples | Support, utilisateurs, CRM, logs limités |
| Customer Success | Suivre activation, adoption et satisfaction | Organisations, CRM, analytics, support |
| Opérations Terrain | Piloter référents, communautés, déclarations et validation terrain | Territoires, communautés, pêcheurs, mareyeurs, déclarations |
| Data Manager | Superviser cycle de vie, qualité, historique et exports | Données, analytics, audit, imports, exports |

### Principes d'accès

| Principe | Application |
| --- | --- |
| Moindre privilège | Chaque rôle reçoit uniquement les droits nécessaires |
| Séparation des responsabilités | Validation, configuration et audit peuvent être séparés |
| Contextual access | Certaines données s'ouvrent selon territoire, organisation ou mission |
| Actions sensibles confirmées | Fusion, archivage, rollback, export et permissions exigent confirmation |
| Audit obligatoire | Toute action sensible est tracée |

## 3. Espaces

### Inventaire complet

| Espace | Objectif | Utilisateurs principaux | Action dominante |
| --- | --- | --- | --- |
| Dashboard | Vue de santé interne | Super Admin, Admin Produit, Data Manager | Prioriser une action |
| Organisation | Gérer organisations et structures | Super Admin, Customer Success | Créer ou modifier |
| Utilisateurs | Administrer comptes internes et externes | Super Admin, Support | Gérer un compte |
| Permissions | Gérer rôles, règles, matrices | Super Admin | Attribuer un droit |
| Territoires | Maintenir zones, quais, régions | Admin Données, Opérations Terrain | Valider un territoire |
| Communautés | Suivre groupes et référents | Opérations Terrain, Customer Success | Assigner un référent |
| Pêcheurs | Administrer profils pêcheurs | Opérations Terrain, Support | Valider ou corriger |
| Marayeurs | Administrer profils marayeurs | Opérations Terrain, Support | Valider ou corriger |
| Déclarations | Contrôler arrivages et besoins | Admin Données, Opérations Terrain | Valider |
| Validation | File de contrôle humain | Admin Données, Admin IA | Traiter une entrée |
| Alertes | Superviser alertes métier | Admin Produit, Support | Assigner ou clore |
| Opportunités | Lire et corriger mises en relation | Admin Produit, Data Manager | Vérifier |
| Marchés | Maintenir marchés et zones économiques | Admin Données | Modifier |
| Prix | Maintenir prix indicatifs | Admin Données, Data Manager | Importer ou valider |
| Projets | Suivre initiatives internes ou partenaires | Customer Success, Super Admin | Mettre à jour |
| Programmes | Suivre programmes institutionnels | Super Admin, Customer Success | Piloter |
| Contenus | Gérer contenus publics ou applicatifs | Admin Produit | Publier |
| Notifications | Superviser modèles et envois | Admin Produit, Support | Notifier |
| Catalogue IA | Gouverner moteurs et suggestions | Admin IA | Valider une version |
| API | Superviser intégrations internes | Super Admin, Data Manager | Contrôler |
| Logs | Lire événements techniques et métier | Super Admin, Support | Diagnostiquer |
| Analytics | Mesurer usage, qualité, activation | Admin Produit, Customer Success | Analyser |
| Configuration | Paramètres globaux | Super Admin, Admin Produit | Configurer |
| Facturation | Suivi offres, comptes et statut commercial | Super Admin, Customer Success | Mettre à jour |
| CRM | Suivi prospects, clients et partenaires | Customer Success, Support | Qualifier |
| Support | Tickets, incidents, demandes | Support, Customer Success | Résoudre |
| Audit | Historique des actions sensibles | Super Admin, Data Manager | Examiner |

### Dashboard

| Bloc | Contenu |
| --- | --- |
| Santé plateforme | Données en attente, alertes critiques, tickets ouverts, incidents |
| Qualité data | Doublons, champs incomplets, validations en retard |
| Activité interne | Actions administratives, imports, exports, rollbacks |
| Risques | Permissions sensibles, anomalies IA, exports récents |
| Priorités | Files de validation, support, territoires et référentiels |

### Organisation

Gère les organisations connues : coopératives, entreprises, institutions, collectivités, ONG, partenaires, financeurs et structures internes.

### Utilisateurs

Gère les comptes, statuts, rôles, organisations rattachées, territoires, historique d'activité et demandes de support.

### Permissions

Gère les rôles, attributs, règles contextuelles, exceptions temporaires, revues de droits et audits.

### Données métier

Les espaces Territoires, Communautés, Pêcheurs, Marayeurs, Déclarations, Marchés et Prix maintiennent les référentiels nécessaires à la cohérence de Mbàmbulaan.

### Supervision métier

Les espaces Validation, Alertes, Opportunités, Projets et Programmes permettent de relier qualité de donnée, décisions, opérations et impact.

### Plateforme

Les espaces Contenus, Notifications, Catalogue IA, API, Logs, Analytics, Configuration, Facturation, CRM, Support et Audit assurent la gouvernance quotidienne de l'entreprise.

## 4. Tous les parcours

Les parcours ci-dessous sont les actions administratives transversales. Chaque parcours doit être audit-able.

| Parcours | Déclencheur | Étapes | Sortie |
| --- | --- | --- | --- |
| Créer | Besoin d'ajouter un objet | Saisir -> contrôler -> confirmer -> historiser | Objet créé |
| Modifier | Correction ou mise à jour | Ouvrir -> éditer -> comparer -> confirmer -> historiser | Objet mis à jour |
| Archiver | Objet obsolète ou invalide | Vérifier dépendances -> confirmer -> archiver -> historiser | Objet retiré des vues actives |
| Valider | Donnée en attente | Examiner -> comparer -> approuver ou rejeter -> historiser | Donnée validée ou refusée |
| Fusionner | Doublon détecté | Comparer -> choisir source de vérité -> confirmer -> historiser | Objet unique consolidé |
| Importer | Données externes ou fichiers | Charger -> prévisualiser -> contrôler -> valider -> historiser | Données intégrées |
| Exporter | Besoin autorisé | Filtrer -> justifier -> confirmer -> générer -> historiser | Export tracé |
| Assigner | Action à confier | Sélectionner responsable -> fixer priorité -> notifier -> historiser | Responsable défini |
| Notifier | Message à diffuser | Choisir audience -> valider contenu -> envoyer -> historiser | Notification envoyée |
| Historiser | Action sensible | Capturer auteur, date, objet, avant/après, raison | Trace disponible |
| Rollback | Correction d'erreur | Identifier version -> vérifier impacts -> confirmer -> restaurer -> historiser | Version précédente restaurée |

### Règles communes de parcours

| Règle | Application |
| --- | --- |
| Avant / après visible | Toute modification sensible affiche l'état précédent et l'état cible |
| Raison obligatoire | Export, rollback, archivage, fusion et permission exigent une justification |
| Confirmation renforcée | Actions irréversibles ou sensibles demandent une confirmation explicite |
| Historique consultable | L'historique reste accessible depuis l'objet concerné |
| Pas de suppression directe | Les objets métier sont archivés plutôt que supprimés |

## 5. Toutes les permissions

### Modèle RBAC

| Rôle | Niveau | Description |
| --- | --- | --- |
| Super Admin | 5 | Contrôle global, permissions, audit, configuration critique |
| Admin Produit | 4 | Configuration produit, contenus, notifications, analytics produit |
| Admin Données | 4 | Référentiels, validation, imports, exports contrôlés |
| Admin IA | 4 | Catalogue IA, suggestions, classification, anomalies IA |
| Data Manager | 4 | Qualité, historique, analytics, exports et gouvernance data |
| Customer Success | 3 | Organisations, CRM, activation, support client |
| Opérations Terrain | 3 | Territoires, communautés, déclarations terrain |
| Support | 2 | Tickets, comptes, incidents simples |
| Lecture interne | 1 | Consultation limitée selon mission |

### Actions

| Action | Sensibilité | Contrôle |
| --- | --- | --- |
| Lire | Faible à élevée selon donnée | RBAC + contexte |
| Créer | Moyenne | RBAC |
| Modifier | Moyenne à élevée | RBAC + historique |
| Archiver | Élevée | RBAC + justification |
| Valider | Élevée | RBAC + audit |
| Fusionner | Élevée | RBAC + comparaison + audit |
| Importer | Élevée | RBAC + prévalidation |
| Exporter | Critique | RBAC + justification + audit |
| Assigner | Moyenne | RBAC |
| Notifier | Élevée | RBAC + prévisualisation |
| Configurer | Critique | Super Admin ou rôle délégué |
| Rollback | Critique | Super Admin + audit |

### Matrice de permissions

| Espace | Super Admin | Admin Produit | Admin Données | Admin IA | Support | Customer Success | Opérations Terrain | Data Manager |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Admin | Lecture | Lecture | Lecture | Lecture limitée | Lecture | Lecture | Lecture |
| Organisation | Admin | Lecture | Lecture | Aucun | Lecture limitée | Admin partiel | Lecture | Lecture |
| Utilisateurs | Admin | Lecture | Lecture | Aucun | Support | Lecture | Lecture terrain | Lecture |
| Permissions | Admin | Aucun | Aucun | Aucun | Aucun | Aucun | Aucun | Lecture audit |
| Territoires | Admin | Lecture | Admin | Aucun | Lecture | Lecture | Admin partiel | Admin partiel |
| Communautés | Admin | Lecture | Lecture | Aucun | Lecture | Lecture | Admin partiel | Lecture |
| Pêcheurs | Admin | Lecture | Validation | Aucun | Support | Lecture | Admin partiel | Lecture |
| Marayeurs | Admin | Lecture | Validation | Aucun | Support | Lecture | Admin partiel | Lecture |
| Déclarations | Admin | Lecture | Validation | Lecture IA | Support limité | Lecture | Validation terrain | Analyse |
| Validation | Admin | Lecture | Admin | Validation IA | Lecture | Lecture | Validation terrain | Admin |
| Alertes | Admin | Admin partiel | Lecture | Lecture IA | Assigner | Lecture | Lecture terrain | Lecture |
| Opportunités | Admin | Lecture | Lecture | Lecture IA | Lecture limitée | Lecture | Lecture | Analyse |
| Marchés | Admin | Lecture | Admin | Aucun | Aucun | Lecture | Lecture | Admin partiel |
| Prix | Admin | Lecture | Admin | Aucun | Aucun | Lecture | Lecture | Admin partiel |
| Projets | Admin | Lecture | Lecture | Aucun | Lecture | Admin partiel | Lecture | Lecture |
| Programmes | Admin | Lecture | Lecture | Aucun | Lecture | Admin partiel | Lecture | Lecture |
| Contenus | Admin | Admin | Lecture | Aucun | Lecture | Lecture | Aucun | Aucun |
| Notifications | Admin | Admin | Lecture | Lecture IA | Support | Lecture | Lecture | Lecture |
| Catalogue IA | Admin | Lecture | Lecture | Admin | Aucun | Aucun | Aucun | Lecture |
| API | Admin | Lecture | Lecture | Lecture | Aucun | Aucun | Aucun | Lecture |
| Logs | Admin | Lecture limitée | Lecture data | Lecture IA | Lecture support | Lecture limitée | Aucun | Lecture |
| Analytics | Admin | Admin partiel | Lecture data | Lecture IA | Lecture support | Admin partiel | Lecture terrain | Admin |
| Configuration | Admin | Admin partiel | Aucun | Aucun | Aucun | Aucun | Aucun | Aucun |
| Facturation | Admin | Lecture | Aucun | Aucun | Aucun | Lecture | Aucun | Aucun |
| CRM | Admin | Lecture | Aucun | Aucun | Support | Admin | Lecture limitée | Lecture |
| Support | Admin | Lecture | Aucun | Aucun | Admin | Admin partiel | Lecture terrain | Lecture |
| Audit | Admin | Lecture limitée | Lecture data | Lecture IA | Aucun | Aucun | Aucun | Lecture |

### Règles hiérarchiques

| Règle | Description |
| --- | --- |
| Super Admin > tous rôles | Peut déléguer, retirer, restaurer et auditer |
| Admin spécialisé | Peut agir dans son domaine sans accès global |
| Support limité | Ne peut pas consulter données sensibles hors besoin de résolution |
| Opérations Terrain contextualisé | Accès limité aux territoires ou communautés assignés |
| Data Manager non commercial | Accès data et qualité, pas facturation ni CRM sensible |
| Revue périodique | Les droits élevés doivent être revus régulièrement |

## 6. Données

### Sources

| Source | Exemples | Contrôle |
| --- | --- | --- |
| Terrain | Déclarations, référents, collecteurs | Validation humaine |
| Utilisateurs | Profils, organisations, rôles | Vérification et complétude |
| Institutions | Référentiels, territoires, programmes | Source identifiée |
| Partenaires | Marchés, prix, projets | Contrôle contractuel |
| Administrateurs | Corrections, enrichissements, contenus | Audit |
| APIs futures | Import, export, synchronisation | Logs et mapping |
| IA assistive | Suggestions, classifications, résumés | Validation humaine |

### Cycle de vie

| Statut | Signification |
| --- | --- |
| Brouillon | Saisi mais non soumis |
| En attente | À contrôler |
| À compléter | Donnée insuffisante |
| Validé | Utilisable par la plateforme |
| Corrigé | Modifié après contrôle |
| Fusionné | Rattaché à une source de vérité |
| Archivé | Retiré des vues actives |
| Restauré | Revenu à une version antérieure |

### Validation

| Contrôle | Objectif |
| --- | --- |
| Complétude | Champs obligatoires présents |
| Cohérence | Format, zone, acteur, statut compatibles |
| Doublon | Détection d'entités similaires |
| Source | Origine connue et autorisée |
| Sensibilité | Donnée personnelle ou stratégique protégée |
| Impact | Effet sur opportunités, alertes, analytics ou décisions |

### Qualité

| Indicateur | Usage |
| --- | --- |
| Taux de complétude | Prioriser enrichissement |
| Taux de doublons | Déclencher fusion |
| Taux d'anomalies | Lancer contrôle data |
| Âge de validation | Traiter retard |
| Conflits de source | Choisir source de vérité |
| Historique incomplet | Renforcer audit |

### Historique

Chaque objet administré conserve au minimum : identifiant, type, statut, auteur, date, action, valeur avant, valeur après, justification, source et lien vers audit.

## 7. IA

L'IA dans l'Admin Platform est assistive, explicable, prudente, contextualisée et gouvernée. Elle ne remplace pas l'administrateur.

| Moteur IA assistif | Assistance attendue | Validation |
| --- | --- | --- |
| Suggestion de complétion | Proposer champs manquants ou incohérents | Admin Données |
| Classification | Classer tickets, alertes, déclarations ou contenus | Support ou Admin Données |
| Détection d'anomalies | Repérer doublons, volumes atypiques, prix suspects | Data Manager |
| Résumés | Synthétiser tickets, logs, historiques ou programmes | Rôle responsable |
| Priorisation | Proposer ordre de traitement | Humain confirme |
| Recommandation de fusion | Suggérer doublons probables | Admin Données confirme |
| Aide au support | Résumer contexte utilisateur et actions précédentes | Support valide |
| Contrôle de cohérence | Signaler conflit territoire, acteur ou statut | Admin responsable |

### Règles IA

| Règle | Application |
| --- | --- |
| Explication visible | Toute suggestion indique ses critères |
| Pas de décision autonome critique | Fusion, export, permission, rollback et suppression restent humains |
| Versioning | Les modèles et règles sont identifiés |
| Feedback humain | Acceptation, rejet ou correction nourrissent la qualité |
| Audit | Suggestions et décisions associées sont tracées |

## 8. APIs

L'Admin Platform utilise uniquement des APIs internes. Aucune API publique n'est définie dans ce pack.

| API interne | Rôle |
| --- | --- |
| Internal Identity API | Comptes, rôles, organisations, droits |
| Internal Territory API | Zones, quais, territoires, communautés |
| Internal Data Quality API | Contrôles, doublons, complétude, anomalies |
| Internal Validation API | Files de validation, décisions, statuts |
| Internal Notification API | Modèles, audiences, envois, historique |
| Internal Audit API | Logs métier, actions sensibles, avant/après |
| Internal Analytics API | Usage, activation, qualité, opérations |
| Internal Support API | Tickets, incidents, assignations |
| Internal CRM API | Leads, organisations, suivi relationnel |
| Internal Billing API | Offres, statuts, comptes commerciaux |
| Internal AI Governance API | Catalogue, versions, suggestions, feedback |
| Internal Import Export API | Imports, exports, mapping et traçabilité |
| Internal Configuration API | Paramètres globaux et flags de configuration |

### Règles API internes

| Règle | Description |
| --- | --- |
| Authentification obligatoire | Aucun accès anonyme |
| Permissions serveur | Les droits sont contrôlés côté serveur |
| Audit sur actions sensibles | Export, rollback, droits, fusion, archivage |
| Pagination et filtres | Obligatoires pour listes longues |
| Idempotence | Imports, notifications et actions critiques doivent éviter doublons |
| Journalisation | Erreurs, accès et changements sont loggés |

## 9. UX

### Navigation complète

L'Admin Platform utilise une navigation de cockpit : sidebar structurée, header de contexte, recherche globale, filtres persistants et actions rapides selon permissions.

| Zone | Rôle |
| --- | --- |
| Header | Recherche, compte interne, alertes critiques, environnement |
| Sidebar | Accès aux espaces administratifs |
| Context bar | Objet courant, statut, propriétaire, dernière modification |
| Quick actions | Créer, importer, exporter, assigner, notifier selon droits |
| Breadcrumb | Localisation dans espace > liste > objet > historique |
| Filter rail | Filtres par territoire, statut, type, source, date, responsable |
| Audit drawer | Historique latéral d'un objet |

### Pages

| Type de page | Structure |
| --- | --- |
| Liste | Titre, KPI de file, filtres, table, actions rapides |
| Détail | Résumé, statut, données, historique, actions sensibles |
| Formulaire | Sections, validation, source, justification, prévisualisation |
| Validation | Comparaison, anomalies, décision, commentaire |
| Import | Upload, mapping, prévisualisation, erreurs, confirmation |
| Export | Périmètre, justification, format, validation, trace |
| Audit | Filtres, timeline, auteur, action, objet, avant/après |
| Configuration | Paramètres groupés, impacts, sauvegarde, rollback |

### Wireframes

#### Dashboard admin

```text
[Header: Recherche globale | Alertes critiques | Profil interne]
[Sidebar: Dashboard | Données | Opérations | Plateforme | Audit]
[KPI: validations en attente | anomalies | tickets | exports récents]
[Panneau priorités]
[Panneau qualité data]
[Panneau support]
[Panneau audit récent]
```

#### Liste administrative

```text
[Header + Sidebar]
[Titre espace + action principale]
[Filtres: territoire | statut | source | date | responsable]
[Table: sélection | objet | statut | qualité | responsable | dernière action]
[Actions groupées selon permissions]
[Pagination]
```

#### Détail objet

```text
[Breadcrumb]
[Résumé: nom | type | statut | source | qualité]
[Actions: modifier | valider | assigner | archiver selon droits]
[Onglets: Informations | Relations | Historique | Audit]
[Drawer: justification action sensible]
```

#### Validation

```text
[File de validation]
[Objet à examiner]
[Signalements: champs manquants | doublon | incohérence]
[Comparaison source / valeur proposée]
[Actions: valider | demander complément | rejeter | fusionner]
```

#### Permissions

```text
[Rôles]
[Matrice espaces x actions]
[Exceptions temporaires]
[Revue des droits]
[Historique des changements]
```

### Composants

| Composant | Usage |
| --- | --- |
| AdminShell | Structure header + sidebar + contexte |
| DataTable | Listes filtrables et paginées |
| PermissionMatrix | Gestion RBAC et règles |
| StatusBadge | Statuts validation, qualité, support |
| AuditTimeline | Historique d'actions |
| DiffViewer | Avant / après |
| ValidationPanel | Décision humaine |
| ImportWizard | Import contrôlé |
| ExportDialog | Export justifié |
| AssignmentPanel | Responsable et priorité |
| NotificationComposer | Audience, message, prévisualisation |
| AIInsightPanel | Suggestion IA explicable |
| QualityScoreCard | Complétude, anomalies, doublons |
| LogViewer | Logs techniques et métier |
| ConfigSection | Paramètres groupés et rollback |

### Tables

| Table | Colonnes minimales |
| --- | --- |
| Utilisateurs | Nom, rôle, organisation, statut, territoire, dernière activité |
| Organisations | Nom, type, statut, contacts, offre, propriétaire interne |
| Déclarations | Type, acteur, territoire, statut, qualité, date |
| Validation | Objet, source, anomalie, priorité, responsable, délai |
| Alertes | Niveau, type, territoire, statut, assigné, date |
| Support | Ticket, organisation, priorité, statut, responsable, SLA |
| Audit | Date, auteur, action, objet, justification, résultat |
| Logs | Niveau, service, événement, trace, date |

### Formulaires

| Formulaire | Exigences |
| --- | --- |
| Création objet | Champs obligatoires, source, contexte |
| Modification | Avant/après, justification si sensible |
| Archivage | Impact, dépendances, confirmation |
| Fusion | Objets comparés, source de vérité, confirmation |
| Import | Mapping, erreurs, prévisualisation |
| Export | Périmètre, justification, autorisation |
| Notification | Audience, contenu, canal, prévisualisation |
| Permission | Rôle, périmètre, durée, justification |

### Filtres

| Filtre | Usage |
| --- | --- |
| Statut | Brouillon, en attente, validé, archivé |
| Territoire | Région, quai, communauté |
| Type d'objet | Utilisateur, organisation, déclaration, alerte |
| Source | Terrain, admin, institution, import, IA |
| Qualité | Complet, incomplet, anomalie, doublon |
| Responsable | Assigné à une personne ou équipe |
| Période | Création, modification, validation |
| Sensibilité | Donnée standard, sensible, critique |

### Actions rapides

| Action | Condition |
| --- | --- |
| Créer | Droit de création dans l'espace |
| Importer | Droit data ou admin |
| Exporter | Droit critique et justification |
| Assigner | Droit d'opération ou support |
| Valider | Droit de validation |
| Notifier | Droit notification |
| Archiver | Droit élevé |
| Rollback | Super Admin |

## 10. User Stories

### Story 1 - Voir la santé de la plateforme

En tant que Super Admin, je veux voir les priorités internes afin de protéger la fiabilité de la plateforme.

| Given | When | Then |
| --- | --- | --- |
| Je suis connecté à l'Admin Platform | J'ouvre le dashboard | Je vois validations, anomalies, tickets, exports et alertes critiques |

Definition of Done : le dashboard admin affiche les files critiques et propose une action prioritaire.

### Story 2 - Gérer une organisation

En tant que Customer Success, je veux consulter et mettre à jour une organisation afin de suivre son activation.

| Given | When | Then |
| --- | --- | --- |
| Une organisation existe | Je modifie son statut ou son responsable interne | Le changement est enregistré et historisé |

Definition of Done : la modification respecte les permissions et garde une trace.

### Story 3 - Administrer un utilisateur

En tant que Support, je veux consulter un compte utilisateur afin de résoudre une demande sans voir plus de données que nécessaire.

| Given | When | Then |
| --- | --- | --- |
| Un ticket utilisateur est ouvert | J'ouvre le profil lié | Je vois uniquement les informations autorisées pour le support |

Definition of Done : le support est limité par RBAC et contextual access.

### Story 4 - Attribuer une permission

En tant que Super Admin, je veux attribuer un rôle afin de donner un accès contrôlé à un membre interne.

| Given | When | Then |
| --- | --- | --- |
| Un membre interne doit recevoir un droit | Je sélectionne rôle, périmètre et justification | Le droit est actif et audité |

Definition of Done : tout changement de permission est historisé.

### Story 5 - Valider une déclaration

En tant qu'Admin Données, je veux valider une déclaration afin de la rendre exploitable par la plateforme.

| Given | When | Then |
| --- | --- | --- |
| Une déclaration est en attente | Je contrôle complétude, cohérence et source | Je peux valider, rejeter ou demander complément |

Definition of Done : chaque décision de validation est tracée.

### Story 6 - Fusionner deux doublons

En tant qu'Admin Données, je veux fusionner deux objets similaires afin de maintenir une source de vérité.

| Given | When | Then |
| --- | --- | --- |
| Un doublon est détecté | Je compare les deux objets | Je choisis la source de vérité et confirme la fusion |

Definition of Done : la fusion conserve historique et liens vers objets d'origine.

### Story 7 - Importer des prix

En tant que Data Manager, je veux importer des prix indicatifs afin de maintenir les référentiels.

| Given | When | Then |
| --- | --- | --- |
| Un fichier de prix est disponible | Je le charge et vérifie le mapping | Les lignes valides sont importées et les erreurs listées |

Definition of Done : aucun import n'est appliqué sans prévisualisation.

### Story 8 - Exporter des données autorisées

En tant que Data Manager, je veux exporter un périmètre de données afin de produire une analyse autorisée.

| Given | When | Then |
| --- | --- | --- |
| J'ai un droit d'export | Je choisis périmètre, format et justification | L'export est généré et audité |

Definition of Done : l'export exige justification et trace.

### Story 9 - Assigner une alerte

En tant qu'Admin Produit, je veux assigner une alerte afin qu'elle soit traitée par la bonne équipe.

| Given | When | Then |
| --- | --- | --- |
| Une alerte critique est ouverte | Je choisis un responsable et une priorité | Le responsable est notifié et l'action historisée |

Definition of Done : l'alerte affiche statut, responsable et historique.

### Story 10 - Superviser une suggestion IA

En tant qu'Admin IA, je veux valider ou rejeter une suggestion afin de garder l'IA sous contrôle humain.

| Given | When | Then |
| --- | --- | --- |
| Une suggestion IA est produite | Je consulte ses critères | Je peux accepter, corriger ou rejeter la suggestion |

Definition of Done : chaque décision humaine sur suggestion IA est historisée.

### Story 11 - Composer une notification

En tant qu'Admin Produit, je veux préparer une notification afin d'informer une audience précise.

| Given | When | Then |
| --- | --- | --- |
| Une audience est sélectionnée | Je rédige et prévisualise le message | Je peux envoyer ou sauvegarder selon permissions |

Definition of Done : aucun envoi n'est possible sans prévisualisation.

### Story 12 - Diagnostiquer un incident

En tant que Support, je veux consulter les logs autorisés afin de comprendre un incident utilisateur.

| Given | When | Then |
| --- | --- | --- |
| Un ticket mentionne une erreur | Je consulte les logs liés au contexte | Je vois les événements utiles sans accès critique |

Definition of Done : les logs sont filtrés selon rôle et contexte.

### Story 13 - Faire un rollback

En tant que Super Admin, je veux restaurer une version antérieure afin de corriger une erreur administrative.

| Given | When | Then |
| --- | --- | --- |
| Une erreur est identifiée | Je choisis une version antérieure et confirme | La restauration est appliquée et audité |

Definition of Done : le rollback indique impacts, justification et auteur.

### Story 14 - Suivre la qualité data

En tant que Data Manager, je veux voir les anomalies et doublons afin de prioriser les corrections.

| Given | When | Then |
| --- | --- | --- |
| J'ouvre la vue qualité | Je filtre par territoire ou type d'objet | Je vois les anomalies à traiter |

Definition of Done : la vue qualité propose une file actionnable.

### Story 15 - Traiter un ticket support

En tant que Support, je veux assigner et résoudre un ticket afin de répondre à une demande.

| Given | When | Then |
| --- | --- | --- |
| Un ticket est ouvert | Je l'assigne et mets à jour son statut | Le ticket garde son historique |

Definition of Done : chaque ticket a statut, responsable et timeline.

### Story 16 - Examiner l'audit

En tant que Super Admin, je veux consulter les actions sensibles afin de contrôler la gouvernance.

| Given | When | Then |
| --- | --- | --- |
| Je filtre l'audit par action sensible | Je consulte l'entrée | Je vois auteur, objet, justification, avant/après et date |

Definition of Done : l'audit est consultable et non modifiable par défaut.

## 11. Tests

### Tests unitaires

| Test | Attendu |
| --- | --- |
| Matrice RBAC | Les rôles retournent les actions autorisées |
| StatusBadge admin | Les statuts s'affichent correctement |
| DiffViewer | Avant/après rendus sans ambiguïté |
| ValidationPanel | États valider, rejeter, complément |
| ExportDialog | Justification obligatoire |
| AIInsightPanel | Critères visibles |
| AuditTimeline | Événements ordonnés |
| Filter rail | Filtres appliqués correctement |

### Tests d'intégration

| Test | Attendu |
| --- | --- |
| Création puis audit | Toute création sensible crée une entrée d'audit |
| Modification puis historique | Avant/après enregistré |
| Validation de donnée | Statut mis à jour et trace créée |
| Fusion de doublons | Source de vérité conservée |
| Import contrôlé | Prévisualisation avant application |
| Notification | Prévisualisation puis envoi tracé |
| Rollback | Version restaurée et audité |

### Tests sécurité

| Test | Attendu |
| --- | --- |
| Accès sans rôle | Refus |
| Support hors périmètre | Données masquées |
| Export sans justification | Refus |
| Permission critique | Super Admin requis |
| Audit non modifiable | Écriture interdite hors système |
| Données sensibles | Masquage selon rôle |
| Session expirée | Réauthentification requise |

### Tests performance

| Test | Attendu |
| --- | --- |
| Tables longues | Pagination et filtres restent fluides |
| Recherche globale | Résultats rapides |
| Logs volumineux | Chargement paginé |
| Import prévisualisé | Erreurs visibles sans blocage |
| Dashboard admin | Chargement des KPI critiques prioritaire |

### Tests UX

| Test | Attendu |
| --- | --- |
| Action dominante | Chaque page indique l'action principale |
| Confirmation sensible | Fusion, export, archive, rollback confirmés |
| No dead end | Chaque file propose une suite |
| Empty state | Les vues vides guident l'administrateur |
| Filtrage clair | Filtres actifs visibles |
| Audit accessible | Historique atteignable depuis objet |

## 12. Definition of Done

### Checklist complète

| Critère | Done |
| --- | --- |
| Référence Product Book respectée | Aucune contradiction avec `MBAMBULAAN_PRODUCT_BOOK_v1.md` |
| Périmètre interne respecté | Aucun accès client ou public |
| Rôles internes définis | 8 utilisateurs internes couverts |
| Espaces administratifs spécifiés | 27 espaces couverts |
| Parcours transversaux décrits | Créer, modifier, archiver, valider, fusionner, importer, exporter, assigner, notifier, historiser, rollback |
| RBAC complet | Rôles, actions, hiérarchie et matrice |
| Données gouvernées | Sources, cycle de vie, validation, qualité, historique |
| IA assistive | Suggestions, classification, anomalies, résumés sous validation humaine |
| APIs internes uniquement | Aucune API publique ajoutée |
| UX admin structurée | Navigation, wireframes, pages, composants, tables, formulaires, filtres |
| User Stories complètes | Stories avec Given / When / Then et Definition of Done |
| Tests définis | Unitaires, intégration, sécurité, performance, UX |
| Audit obligatoire | Actions sensibles historisées |
| Rollback cadré | Réservé aux droits critiques et justifié |
| Documentation exploitable | Utilisable par Product, CTO, UX, Support et Opérations |

### Conditions de validation

| Condition | Résultat attendu |
| --- | --- |
| Le workspace est clairement interne | Oui, réservé équipe Mbàmbulaan |
| Les droits protègent les données sensibles | Oui, RBAC, ABAC et contexte |
| Les données sont gouvernables | Oui, validation, qualité, historique |
| L'IA reste assistive | Oui, décision humaine obligatoire |
| Les actions sensibles sont traçables | Oui, audit et justification |
| Les équipes internes peuvent travailler | Oui, espaces et parcours couvrent opérations, support, data, produit, IA |

## Synthèse de livraison

| Indicateur | Nombre |
| --- | --- |
| Pages ou espaces administratifs spécifiés | 27 |
| Composants admin spécifiés | 15 |
| User Stories | 16 |
| Tests spécifiés | 33 |
