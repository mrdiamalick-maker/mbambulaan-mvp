# Mbàmbulaan Actor Journeys v2.0

## 1. Statut du document

Ce document fige les parcours acteurs de Mbàmbulaan avant la reprise UX, le Design System et les prochains développements. Il remplace la version précédente de `docs/04_ACTOR_JOURNEYS.md` comme référence officielle des usages, des canaux, des décisions et des preuves attendues par acteur.

Il ne décrit aucune implémentation React, aucune API et aucune base de données. Il traduit la vision du Product Blueprint, de l'Architecture fonctionnelle, du Business Model, du Product Book et des packs métier en parcours exploitables par CEO, CPO, UX Designer, Product Manager, Sales, Customer Success et développeur.

Mbàmbulaan reste défini comme un Operating System de coordination pour la pêche artisanale sénégalaise. Il ne doit pas être réduit à une marketplace, un ERP, un dashboard, une application mobile ou un site vitrine.

## 2. Principe général

Mbàmbulaan n'a pas un seul utilisateur. La plateforme relie des utilisateurs directs, des bénéficiaires, des financeurs, des décideurs, des prescripteurs, des partenaires techniques et des équipes internes.

Certains acteurs terrain ne seront pas des utilisateurs numériques directs. Leur entrée peut passer par WhatsApp, SMS, appel, agent terrain, référent, import manuel, portail organisationnel ou futur espace mobile. L'important n'est pas que tout le monde clique dans une interface, mais que chaque signal utile entre dans l'Operating System avec une source, un statut, un territoire, un niveau de preuve et une prochaine action.

Chaque acteur doit renforcer le système global :

- le terrain apporte des signaux, volumes, confirmations et preuves ;
- le marché apporte des besoins, réservations, transactions et retours de qualité ;
- le territoire apporte priorités, tensions et décisions collectives ;
- les institutions apportent cadres, programmes et légitimité ;
- les financeurs apportent ressources, risques et exigences de preuve ;
- Mbàmbulaan apporte coordination, qualification, traçabilité, données et synthèse.

La règle produit est simple : chaque parcours doit montrer ce que l'acteur gagne, ce qu'il apporte au système, quelle décision devient plus facile et quelle valeur Mbàmbulaan peut capter sans trahir la confiance terrain.

## 3. Typologie des acteurs

| Catégorie | Acteurs | Rôle dans la filière | Rôle dans Mbàmbulaan | Niveau digital probable | Valeur apportée au système | Valeur reçue du système | Capacité à payer ou financer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Terrain | Pêcheur référent, pêcheur occasionnel, capitaine, président de GIE, agent terrain, animateur territorial, responsable de quai | Produire, déclarer, confirmer et qualifier l'activité réelle | Source de signaux, validation humaine, relais d'adoption | Faible à moyen, souvent assisté | Arrivages, contexte, preuves, anomalies, retours | Visibilité, opportunités, historique, réputation, appui | Faible individuellement, moyenne via GIE/programmes |
| Demande / marché | Mareyeur référent, mareyeur occasionnel, transformateur, marché local, entreprise agroalimentaire, exportateur | Acheter, transformer, écouler, sécuriser volumes | Expression de besoins, activation opportunités, transactions | Moyen à élevé selon structure | Besoins, réservations, confirmations, qualité attendue | Lots visibles, matching, priorité, traçabilité, supply intelligence | Moyenne à élevée selon organisation |
| Territoire | Collectivité locale, coopérative, organisation professionnelle, responsable de quai | Coordonner localement, prioriser, représenter | Gouvernance locale, lecture de tension, adoption | Moyen, souvent assisté | Référentiels, décisions, priorités, relais terrain | Carte, tensions, actions, impact, rapports | Moyenne via pilotes, programmes, subventions |
| Institutionnel | Institution, ministère, direction nationale, ONG, programme | Cadrer, financer, évaluer, agir à grande échelle | Décision, mandat, reporting, légitimité | Moyen à élevé | Objectifs, programmes, données agrégées, cadres | Executive, observatoire, impact, risques, preuves | Élevée mais cycles longs |
| Financement / risque | Bailleur, banque, assurance, investisseur | Financer, assurer, réduire incertitude, évaluer scalabilité | Exigence de preuve, capital, modèles de risque | Élevé | Critères, contraintes, financements, signaux de risque | Données agrégées, preuves, traction, impact, risque | Élevée, mais preuves nécessaires |
| Plateforme Mbàmbulaan | Admin, support, data manager, customer success | Gouverner, assister, fiabiliser, convertir | Opérations, qualité, adoption, revenus | Élevé | Qualité, support, configuration, suivi client | Pilotage interne, rétention, ventes, apprentissage | Interne, capture indirecte |
| Public / partenaires | Visiteur public, prospect partenaire, partenaire technique | Comprendre, prescrire, intégrer | Entrée commerciale, preuve de vision, intégration future | Moyen à élevé | Leads, besoins, API future, crédibilité | Démo, proposition de valeur, documentation | Variable à élevée selon partenariat |

## 4. Matrice utilisateurs / bénéficiaires / payeurs

| Acteur | Utilise directement ? | Bénéficie ? | Décide ? | Paie ? | Prescrit ? | Données fournies | Services reçus | Risque d'adoption |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Visiteur public | Non | Oui | Non | Non | Oui | Intérêt, secteur, demande de contact | Landing, démo, cas d'usage | Vision confuse ou trop large |
| Prospect partenaire | Oui, en démo | Oui | Oui parfois | Oui possible | Oui | Objectifs, territoire, contraintes | Démo adaptée, note de valeur | Attente de produit complet trop tôt |
| Pêcheur référent | Parfois | Oui | Non | Non direct | Oui | Arrivages, confirmations, contexte | Visibilité, réputation, opportunités | Charge trop forte sur référents |
| Pêcheur occasionnel | Rarement | Oui | Non | Non | Non | Signal ponctuel, contact | Inclusion, valorisation | Canal trop complexe |
| Capitaine de pirogue | Parfois | Oui | Oui opérationnel | Non | Oui | Retour de pirogue, lot, heure | Déclaration rapide, suivi | Urgence, faible temps disponible |
| Président de GIE | Oui | Oui | Oui | Oui possible | Oui | Membres, volumes, règles locales | Vue collective, preuves, coordination | Confusion individuel / collectif |
| Agent terrain Mbàmbulaan | Oui | Oui | Non | Non | Oui | Validations, observations, corrections | Outils de saisie, priorités | Surcharge opérationnelle |
| Animateur territorial | Oui | Oui | Oui opérationnel | Non | Oui | Tensions, actions, statuts | Cockpit coordination | Trop de tâches non priorisées |
| Responsable de quai | Parfois | Oui | Oui local | Non direct | Oui | Activité quai, incidents, capacité | Lecture quai, alertes, priorités | Données sensibles ou politiques |
| Mareyeur référent | Oui | Oui | Oui | Oui possible | Oui | Besoins, réservations, confirmations | Lots, opportunités, historique | Peur de perdre son réseau privé |
| Mareyeur occasionnel | Parfois | Oui | Oui ponctuel | Faible | Non | Besoin ponctuel, contact | Accès simplifié aux lots | Friction de saisie |
| Transformateur | Oui | Oui | Oui | Oui | Oui | Besoins, capacités, qualité attendue | Surplus, planification, suivi | Besoins mal qualifiés |
| Coopérative | Oui | Oui | Oui | Oui possible | Oui | Membres, volumes, décisions | Coordination collective, reporting | Gouvernance interne |
| Organisation professionnelle | Oui | Oui | Oui | Oui possible | Oui | Mandats, membres, règles | Observatoire métier, coordination | Attentes politiques |
| Marché local | Parfois | Oui | Oui local | Faible | Oui | Demande locale, volumes | Anticipation, lots, alertes | Données collectives floues |
| Entreprise agroalimentaire | Oui | Oui | Oui | Oui | Oui | Besoins, qualité, volumes | Supply intelligence, traçabilité | Attente de garantie volume |
| Exportateur | Oui | Oui | Oui | Oui | Oui | Exigences, besoins, conformité | Lots qualifiés, dossier trace | Certification prématurée |
| Collectivité locale | Oui | Oui | Oui | Oui possible | Oui | Priorités, territoires, actions | Carte, tensions, impact, rapport | Budget et adoption terrain |
| Institution / ministère | Oui | Oui | Oui | Oui | Oui | Cadres, programmes, référentiels | Executive, observatoire, risques | Cycle long, gouvernance data |
| ONG / programme | Oui | Oui | Oui | Oui | Oui | Objectifs, bénéficiaires, actions | Impact, reporting, ciblage | Preuve d'impact fragile |
| Bailleur | Oui, agrégé | Oui | Oui | Oui | Oui | Exigences, indicateurs, fonds | Reporting, impact, risques | Compliance, audit |
| Banque | Plus tard | Oui | Oui | Oui future | Oui | Critères de risque | Historique agrégé, confiance | Données insuffisantes |
| Assurance | Plus tard | Oui | Oui | Oui future | Oui | Critères de risque, sinistres | Prévention, incidents, qualité | Régulation, responsabilité |
| Partenaire technique | Oui future | Oui | Oui technique | Oui possible | Oui | Connecteurs, contraintes, données | Exports, intégration, API future | Sécurité et périmètre |
| Admin Mbàmbulaan | Oui | Oui | Oui interne | Non | Non | Référentiels, droits, corrections | Gouvernance système | Complexité admin trop lourde |
| Support Mbàmbulaan | Oui | Oui | Non | Non | Oui | Tickets, appels, retours | Assistance, résolution | Trop de support manuel |
| Data Manager Mbàmbulaan | Oui | Oui | Oui data | Non | Oui | Qualité, mapping, anomalies | Données fiables, exports | Dette qualité |
| Customer Success Mbàmbulaan | Oui | Oui | Oui relation | Non | Oui | Activation, satisfaction, objections | Adoption, expansion, rétention | Promesse commerciale trop large |
| Investisseur | Oui, démo | Oui | Oui | Oui capital | Oui | Questions, critères, feedback | Traction, impact, modèle | Produit perçu comme trop dispersé |

## 5. Parcours détaillés par acteur

### 5.1 Visiteur public

#### Rôle dans la filière
Observateur, futur prospect ou relais d'opinion qui découvre la mission.

#### Problème principal
Il ne comprend pas immédiatement si Mbàmbulaan est une marketplace, un dashboard ou une infrastructure de coordination.

#### Ce que Mbàmbulaan change pour lui
La landing et la démo montrent une vision simple : transformer des signaux dispersés en décisions utiles.

#### Canal d'entrée probable
Landing publique, recommandation, LinkedIn, événement, presse, lien envoyé par un partenaire.

#### Données qu'il fournit
Intérêt, secteur, contact, type de demande, consentement.

#### Données qu'il consomme
Promesse, cas d'usage, démo scénarisée, impacts publics, informations non sensibles.

#### Actions principales
Comprendre, choisir une démo, demander un rendez-vous, partager.

#### Moments de vérité
La première minute : comprendre que ce n'est pas une marketplace simple.

#### Peurs / objections / freins
Produit trop ambitieux, jargon sectoriel, manque de preuve terrain.

#### Services Mbàmbulaan associés
Public Experience, Demo Experience, Contact, Newsletter future.

#### Valeur créée pour l'acteur
Clarté sur l'opportunité de partenariat ou d'usage.

#### Valeur créée pour l'écosystème
Nouveaux prescripteurs et partenaires potentiels.

#### Valeur capturable par Mbàmbulaan
Lead qualifié, demande de démo, crédibilité publique.

#### Parcours MVP
Landing -> Démo -> Territoire pilote -> Contact ou rendez-vous.

#### Parcours V1
Démo segmentée par profil, cas d'usage, prise de rendez-vous qualifiée.

#### Parcours V2
Portail public avec observatoire agrégé et demandes partenaires.

#### Critères de réussite
Taux de clic vers démo, temps de compréhension, demandes qualifiées.

#### Risques produit
Trop de modules affichés avant la promesse.

#### À ne pas faire
Montrer des données réelles sensibles ou demander une inscription trop tôt.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Arrive | Comprendre le positionnement | Landing | Source trafic | Taux de rebond |
| Explore | Choisir un scénario | Démo | Scénario consulté | Clic démo |
| Convertit | Demander contact | Contact futur | Lead | Demande qualifiée |

### 5.2 Prospect partenaire

#### Rôle dans la filière
Organisation pouvant devenir client, financeur, pilote ou prescripteur.

#### Problème principal
Il doit évaluer rapidement si Mbàmbulaan répond à son problème sans accéder à tout le produit.

#### Ce que Mbàmbulaan change pour lui
La plateforme transforme sa problématique en scénario démontrable : territoire, impact, supply, coordination ou reporting.

#### Canal d'entrée probable
Rendez-vous commercial, démo privée, événement, recommandation institutionnelle.

#### Données qu'il fournit
Objectif, territoire, type d'acteurs, contraintes, budget approximatif, critères de succès.

#### Données qu'il consomme
Démo adaptée, executive summary, pages pilotes, preuves mockées, limites explicites.

#### Actions principales
Choisir un scénario, valider intérêt, demander pilote, partager en interne.

#### Moments de vérité
Le moment où il voit que Mbàmbulaan coordonne plusieurs acteurs et ne vend pas seulement une interface.

#### Peurs / objections / freins
Trop tôt, trop large, manque de données réelles, incertitude terrain.

#### Services Mbàmbulaan associés
Démo contrôlée, diagnostic territorial, offre pilote, executive view.

#### Valeur créée pour l'acteur
Cadrage rapide d'une opportunité de partenariat.

#### Valeur créée pour l'écosystème
Ouverture de pilotes, financements ou programmes.

#### Valeur capturable par Mbàmbulaan
Discovery payante, pilote, contrat B2B/B2G, partenariat.

#### Parcours MVP
Accueil -> Démo -> Territoire pilote -> Executive -> rendez-vous.

#### Parcours V1
Espace prospect avec scénario et note de cadrage.

#### Parcours V2
Portail partenaire avec suivi de pilote.

#### Critères de réussite
Nombre de démos qualifiées, taux de conversion pilote, objections levées.

#### Risques produit
Faire croire que toutes les intégrations sont déjà disponibles.

#### À ne pas faire
Promettre API, certification ou données réelles avant cadre de gouvernance.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Découvre | Se reconnaître dans un cas | Landing / Démo | Segment prospect | Démo lancée |
| Évalue | Vérifier valeur | Territoire pilote / Executive | Questions, intérêt | Temps de démo |
| Engage | Demander pilote | Contact / Sales futur | Opportunité commerciale | Conversion |

### 5.3 Pêcheur référent

#### Rôle dans la filière
Source locale fiable, relais de confiance et déclarant régulier.

#### Problème principal
Ses lots et informations circulent souvent par réseau oral sans preuve exploitable.

#### Ce que Mbàmbulaan change pour lui
Ses signaux deviennent visibles, qualifiés et rattachés à des opportunités ou décisions.

#### Canal d'entrée probable
WhatsApp, appel, agent terrain, invitation GIE, application future.

#### Données qu'il fournit
Arrivage, espèce, quantité, quai, heure, statut, photo ou confirmation, contact.

#### Données qu'il consomme
Confirmation de déclaration, opportunité, statut de lot, historique, notification.

#### Actions principales
Déclarer, confirmer, répondre à une demande, suivre son lot.

#### Moments de vérité
La première déclaration doit être rapide et utile.

#### Peurs / objections / freins
Perte de contrôle, exposition des informations, effort de saisie.

#### Services Mbàmbulaan associés
Fisher Network, arrivages, qualité, confiance, notifications, traçabilité.

#### Valeur créée pour l'acteur
Visibilité, meilleure valorisation, réputation, preuve d'activité.

#### Valeur créée pour l'écosystème
Signal fiable pour matching, tension, impact et décisions.

#### Valeur capturable par Mbàmbulaan
Activation terrain, data quality, base de services aux organisations.

#### Parcours MVP
Agent/WhatsApp -> signal -> qualification -> opportunité -> preuve.

#### Parcours V1
Espace pêcheur, historique, notifications, transactions.

#### Parcours V2
Réputation avancée, services finance/assurance si preuves suffisantes.

#### Critères de réussite
Déclarations validées, délai déclaration-validation, récurrence.

#### Risques produit
Faire porter trop de saisie au pêcheur.

#### À ne pas faire
Le forcer à utiliser une application complète dès le début.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Signale | Rendre lot visible | Arrivages / Agent | Signal terrain | Déclarations |
| Confirme | Qualifier | Qualité / Trust | Preuve validée | Taux validation |
| Suit | Savoir si action existe | Opportunités / Notifications | Historique lot | Lots liés |

### 5.4 Pêcheur occasionnel

#### Rôle dans la filière
Contributeur ponctuel, parfois non équipé ou non habitué aux outils numériques.

#### Problème principal
Il peut rester invisible si le produit exige une adoption directe.

#### Ce que Mbàmbulaan change pour lui
Il peut participer via relais humain, appel ou SMS sans devenir utilisateur complet.

#### Canal d'entrée probable
Agent terrain, référent, appel, SMS, WhatsApp simple.

#### Données qu'il fournit
Signal ponctuel, contact, quai, espèce, quantité estimée.

#### Données qu'il consomme
Confirmation simple, opportunité éventuelle, retour par relais.

#### Actions principales
Signaler, confirmer, recevoir un retour.

#### Moments de vérité
La plateforme doit accepter une donnée incomplète mais la marquer comme déclarative.

#### Peurs / objections / freins
Complexité, méfiance, absence de smartphone.

#### Services Mbàmbulaan associés
Agent terrain, support, arrivages assistés, proof level.

#### Valeur créée pour l'acteur
Inclusion et possibilité de valorisation.

#### Valeur créée pour l'écosystème
Couverture terrain plus large.

#### Valeur capturable par Mbàmbulaan
Réseau terrain plus dense, preuve d'inclusion pour programmes.

#### Parcours MVP
Relais -> signal déclaratif -> validation humaine -> suivi basique.

#### Parcours V1
Profil minimal, historique assisté.

#### Parcours V2
Canaux offline et SMS plus robustes.

#### Critères de réussite
Nombre de signaux assistés et taux de conversion en signaux validés.

#### Risques produit
Confondre donnée ponctuelle avec donnée validée.

#### À ne pas faire
Afficher son signal comme preuve forte sans validation.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Appelle | Capturer le signal | Support / Agent | Donnée déclarative | Signaux assistés |
| Valide | Fiabiliser | Agent / Admin | Statut validé ou rejeté | Taux validation |
| Informe | Donner retour | Notification relais | Message retour | Satisfaction |

### 5.5 Capitaine de pirogue

#### Rôle dans la filière
Responsable opérationnel du retour de pirogue et de l'information immédiate.

#### Problème principal
Le temps est limité au débarquement et l'information se perd vite.

#### Ce que Mbàmbulaan change pour lui
La déclaration devient courte, horodatée et exploitable.

#### Canal d'entrée probable
WhatsApp vocal, appel, agent quai, application future.

#### Données qu'il fournit
Heure de retour, quai, lot, espèce, volume, état général.

#### Données qu'il consomme
Priorité de traitement, besoin compatible, confirmation.

#### Actions principales
Déclarer le retour, confirmer volume, orienter lot.

#### Moments de vérité
Le signal doit être saisi avant que le lot perde sa valeur.

#### Peurs / objections / freins
Perdre du temps, être contrôlé, information utilisée contre lui.

#### Services Mbàmbulaan associés
Arrivages, qualité, tension, notifications.

#### Valeur créée pour l'acteur
Rapidité, visibilité, preuve de débarquement.

#### Valeur créée pour l'écosystème
Signal précoce pour matching et tension.

#### Valeur capturable par Mbàmbulaan
Données d'activité à forte valeur temporelle.

#### Parcours MVP
Retour pirogue -> signal court -> qualification -> opportunité.

#### Parcours V1
Mode mobile/offline, brouillons, historiques par pirogue.

#### Parcours V2
Prévision et intégrations météo/AIS si pertinent.

#### Critères de réussite
Délai retour-signal, signaux complets, opportunités détectées.

#### Risques produit
Saisie trop longue au mauvais moment.

#### À ne pas faire
Transformer le capitaine en opérateur administratif.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Retour | Signaler vite | Arrivages | Horodatage | Délai signal |
| Qualifie | Prioriser qualité | Quality / Agent | Statut qualité | Lots sensibles |
| Oriente | Chercher besoin | Opportunités | Matching | Lots valorisés |

### 5.6 Président de GIE

#### Rôle dans la filière
Coordinateur d'un groupe, détenteur d'une légitimité locale.

#### Problème principal
Difficile de suivre les volumes, membres, preuves et opportunités collectives.

#### Ce que Mbàmbulaan change pour lui
Le GIE dispose d'une lecture collective et d'un historique exploitable.

#### Canal d'entrée probable
Espace organisation, WhatsApp, agent terrain, import.

#### Données qu'il fournit
Liste membres, quais, règles, volumes groupés, validations.

#### Données qu'il consomme
Activité du groupe, opportunités, preuves, rapports.

#### Actions principales
Référencer membres, valider signaux, suivre activité, partager synthèse.

#### Moments de vérité
La distinction entre donnée individuelle et donnée collective doit être claire.

#### Peurs / objections / freins
Perte de contrôle, conflits internes, exposition des volumes.

#### Services Mbàmbulaan associés
Identity, organisations, Fisher Network, reporting collectif.

#### Valeur créée pour l'acteur
Coordination membres, crédibilité, dossiers d'appui.

#### Valeur créée pour l'écosystème
Données collectives fiables et adoption structurée.

#### Valeur capturable par Mbàmbulaan
Offres coopératives, déploiement, reporting programme.

#### Parcours MVP
GIE -> membres -> signaux -> synthèse collective.

#### Parcours V1
Espace GIE, droits, tableau collectif.

#### Parcours V2
Dossiers financement et services risque.

#### Critères de réussite
Membres actifs, volumes suivis, rapports produits.

#### Risques produit
Créer un espace organisation trop complexe.

#### À ne pas faire
Afficher toutes les données individuelles sans règles de droits.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Référence | Structurer groupe | Admin / Organisation | Liste membres | Membres validés |
| Valide | Fiabiliser signaux | Agent / GIE | Validation | Taux validation |
| Pilote | Lire collectif | Dashboard / Executive | Synthèse GIE | Usage récurrent |

### 5.7 Agent terrain Mbàmbulaan

#### Rôle dans la filière
Collecteur, validateur et accompagnateur des acteurs peu digitalisés.

#### Problème principal
Sans agent terrain, les données locales peuvent rester incomplètes ou peu fiables.

#### Ce que Mbàmbulaan change pour lui
Il dispose d'une file claire de signaux à qualifier et d'actions à suivre.

#### Canal d'entrée probable
Espace interne mobile, WhatsApp, interface d'administration légère.

#### Données qu'il fournit
Validations, corrections, photos, observations, statuts, retours terrain.

#### Données qu'il consomme
Priorités, alertes, acteurs à contacter, anomalies.

#### Actions principales
Saisir, vérifier, corriger, relancer, former.

#### Moments de vérité
La file d'action doit éviter la surcharge.

#### Peurs / objections / freins
Trop d'administration, absence de réseau, pression locale.

#### Services Mbàmbulaan associés
Coordination, support, data quality, notifications, offline future.

#### Valeur créée pour l'acteur
Clarté des priorités et reconnaissance du travail terrain.

#### Valeur créée pour l'écosystème
Données fiables, adoption, confiance.

#### Valeur capturable par Mbàmbulaan
Qualité produit, succès pilote, services de déploiement.

#### Parcours MVP
File action -> signal -> validation -> preuve -> rapport.

#### Parcours V1
Mode offline, scripts de formation, tâches assignées.

#### Parcours V2
Automatisation d'anomalies et supervision régionale.

#### Critères de réussite
Signaux qualifiés par jour, taux d'erreur, temps validation.

#### Risques produit
Transformer l'agent en centre de saisie infini.

#### À ne pas faire
Lui donner toutes les tâches sans priorité.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Reçoit | Prioriser terrain | Coordination | File d'action | Tâches traitées |
| Vérifie | Qualifier | Arrivages / Besoins | Preuve validée | Taux qualité |
| Remonte | Informer décideur | Executive | Synthèse terrain | Délai reporting |

### 5.8 Animateur territorial

#### Rôle dans la filière
Coordinateur opérationnel d'un territoire ou d'un quai pilote.

#### Problème principal
Les tensions, acteurs, besoins et actions sont dispersés.

#### Ce que Mbàmbulaan change pour lui
Il voit les priorités du territoire et peut mobiliser les bons acteurs.

#### Canal d'entrée probable
Coordination center, carte des quais, dashboard territorial.

#### Données qu'il fournit
Décisions, statuts d'action, priorités, retours d'acteurs.

#### Données qu'il consomme
Tensions, alertes, besoins, opportunités, preuves.

#### Actions principales
Prioriser, assigner, suivre, expliquer.

#### Moments de vérité
Voir clairement la prochaine action utile.

#### Peurs / objections / freins
Trop d'alertes, responsabilité floue, conflits d'acteurs.

#### Services Mbàmbulaan associés
Territorial Coordination, alerts, prioritization, executive.

#### Valeur créée pour l'acteur
Pilotage local et réduction du bruit opérationnel.

#### Valeur créée pour l'écosystème
Actions plus rapides, preuves de coordination.

#### Valeur capturable par Mbàmbulaan
Offre pilote territorial, accompagnement, licence collectivité.

#### Parcours MVP
Carte/coordination -> tension -> action -> preuve -> synthèse.

#### Parcours V1
Tableau territorial, assignation, reporting périodique.

#### Parcours V2
Prévision de tension et programmes territoriaux.

#### Critères de réussite
Actions traitées, tensions réduites, rapports validés.

#### Risques produit
Faire un cockpit trop large.

#### À ne pas faire
Multiplier les widgets sans décision associée.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Observe | Où agir ? | Quais / Coordination | Niveau tension | Tensions suivies |
| Mobilise | Qui contacter ? | Coordination | Action assignée | Délai action |
| Rend compte | Que prouver ? | Executive | Rapport territoire | Décisions prises |

### 5.9 Responsable de quai

#### Rôle dans la filière
Référent local de l'activité du quai, des flux et des incidents.

#### Problème principal
L'activité du quai est visible localement mais difficile à partager de façon exploitable.

#### Ce que Mbàmbulaan change pour lui
Le quai devient un objet de coordination avec volumes, tensions et actions.

#### Canal d'entrée probable
Agent terrain, carte des quais, espace collectivité.

#### Données qu'il fournit
Activité, capacité, contraintes, incidents, horaires, observations.

#### Données qu'il consomme
Volumes, besoins, alertes, opportunités, synthèse quai.

#### Actions principales
Confirmer activité, signaler tension, orienter acteur.

#### Moments de vérité
La donnée de quai doit aider sans créer de conflit politique.

#### Peurs / objections / freins
Surveillance, exposition des problèmes, données sensibles.

#### Services Mbàmbulaan associés
Map, tension, coordination, alerts.

#### Valeur créée pour l'acteur
Visibilité du besoin d'appui et meilleure coordination locale.

#### Valeur créée pour l'écosystème
Lecture territoriale fiable.

#### Valeur capturable par Mbàmbulaan
Diagnostic territorial, collectivité, programme.

#### Parcours MVP
Quai -> tension -> panneau -> action -> synthèse.

#### Parcours V1
Profil quai, historique, incidents, capacité.

#### Parcours V2
Intégrations capteurs ou données externes si pertinent.

#### Critères de réussite
Quais actifs, tensions confirmées, actions locales suivies.

#### Risques produit
Politiser les statuts sans contexte.

#### À ne pas faire
Classer publiquement les quais sans explication.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Observe | Quel niveau d'activité ? | Quais | Statut quai | Activité suivie |
| Alerte | Quelle tension ? | Coordination | Alerte quai | Alertes traitées |
| Suit | Quelle action ? | Dashboard | Action quai | Délai traitement |

### 5.10 Mareyeur référent

#### Rôle dans la filière
Acheteur régulier, connecteur entre lots, marchés et écoulement.

#### Problème principal
Il cherche vite des lots fiables et veut conserver son avantage relationnel.

#### Ce que Mbàmbulaan change pour lui
Il publie des besoins structurés et reçoit des opportunités explicables.

#### Canal d'entrée probable
WhatsApp, mobile, espace besoins, agent côté demande.

#### Données qu'il fournit
Besoin, espèce, quantité, quai, urgence, réservation, confirmation.

#### Données qu'il consomme
Arrivages, score opportunité, qualité, confiance, statut transaction.

#### Actions principales
Publier besoin, réserver, confirmer, suivre.

#### Moments de vérité
L'opportunité proposée doit être utile et non opaque.

#### Peurs / objections / freins
Perdre son réseau privé, concurrence, fausses disponibilités.

#### Services Mbàmbulaan associés
Market & Buyers Network, besoins, opportunités, transactions.

#### Valeur créée pour l'acteur
Gain de temps, accès lots, historique, fiabilité.

#### Valeur créée pour l'écosystème
Demande structurée pour matching et couverture.

#### Valeur capturable par Mbàmbulaan
Supply intelligence, offres acheteurs, activation économique.

#### Parcours MVP
Besoin -> matching -> opportunité -> action -> preuve.

#### Parcours V1
Réservation et transaction suivie.

#### Parcours V2
Besoins récurrents et services premium.

#### Critères de réussite
Besoins publiés, taux couverture, réservations honorées.

#### Risques produit
Être perçu comme une marketplace concurrente du réseau existant.

#### À ne pas faire
Publier trop largement les informations sensibles.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Publie | Que cherche-t-il ? | Besoins | Besoin structuré | Besoins actifs |
| Compare | Quel lot choisir ? | Opportunités | Score expliqué | Taux clic |
| Active | Réserver ou contacter | Coordination / Transaction | Statut action | Conversion |

### 5.11 Mareyeur occasionnel

#### Rôle dans la filière
Acheteur ponctuel ou irrégulier.

#### Problème principal
Il n'a pas toujours accès aux bons lots ou ne veut pas créer un compte complexe.

#### Ce que Mbàmbulaan change pour lui
Il peut exprimer un besoin simple et recevoir une réponse assistée.

#### Canal d'entrée probable
WhatsApp, agent, appel, lien simple.

#### Données qu'il fournit
Besoin ponctuel, contact, espèce, volume, urgence.

#### Données qu'il consomme
Lots disponibles, contact ou opportunité, confirmation.

#### Actions principales
Demander, confirmer, retirer.

#### Moments de vérité
Le premier besoin doit être plus simple qu'un appel informel.

#### Peurs / objections / freins
Inscription, temps, fiabilité.

#### Services Mbàmbulaan associés
Besoins assistés, notifications, support.

#### Valeur créée pour l'acteur
Accès plus large et réponse plus structurée.

#### Valeur créée pour l'écosystème
Plus de demande visible.

#### Valeur capturable par Mbàmbulaan
Activation marché, données demande, futurs comptes payants.

#### Parcours MVP
Besoin assisté -> opportunité -> confirmation.

#### Parcours V1
Compte léger, historique, rappels.

#### Parcours V2
Segmentation et réputation acheteur.

#### Critères de réussite
Besoins ponctuels couverts et retours positifs.

#### Risques produit
Trop de friction pour un usage ponctuel.

#### À ne pas faire
Exiger un profil complet avant un premier besoin.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Demande | Capturer besoin | Besoins / Agent | Besoin déclaratif | Besoins créés |
| Reçoit | Voir option | Opportunités | Matching | Taux couverture |
| Confirme | Activer action | Coordination | Confirmation | Action initiée |

### 5.12 Transformateur

#### Rôle dans la filière
Acteur qui valorise les volumes, surplus ou espèces selon capacité de transformation.

#### Problème principal
Approvisionnement irrégulier et manque de visibilité sur les surplus.

#### Ce que Mbàmbulaan change pour lui
Il identifie les lots à risque ou disponibles et planifie un retrait.

#### Canal d'entrée probable
Espace besoins, notifications, dashboard supply.

#### Données qu'il fournit
Besoins industriels, capacité, espèces, délais, qualité attendue.

#### Données qu'il consomme
Arrivages, qualité, risque de perte, opportunités, transactions.

#### Actions principales
Publier besoin, réserver, planifier, suivre.

#### Moments de vérité
Voir rapidement les lots sensibles à traiter.

#### Peurs / objections / freins
Qualité incertaine, logistique, volume non garanti.

#### Services Mbàmbulaan associés
Besoins, quality, opportunities, transactions, impact.

#### Valeur créée pour l'acteur
Approvisionnement mieux sécurisé et capacité mieux utilisée.

#### Valeur créée pour l'écosystème
Réduction des pertes, valorisation économique.

#### Valeur capturable par Mbàmbulaan
Offre supply intelligence, reporting impact, contrats entreprises.

#### Parcours MVP
Besoin -> lot sensible -> opportunité -> action.

#### Parcours V1
Transactions, planification, suivi qualité.

#### Parcours V2
Prévisions, intégrations supply.

#### Critères de réussite
Lots valorisés, volumes transformés, pertes évitées.

#### Risques produit
Promettre une garantie d'approvisionnement.

#### À ne pas faire
Présenter un matching comme contrat ferme sans confirmation.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Planifie | Quel besoin ? | Besoins | Besoin récurrent | Besoins actifs |
| Priorise | Quel lot sensible ? | Arrivages / Quality | Score qualité | Lots sensibles |
| Suit | Le lot avance ? | Transactions | Statut suivi | Transactions |

### 5.13 Coopérative

#### Rôle dans la filière
Organisation collective de pêcheurs, mareyeurs ou acteurs locaux.

#### Problème principal
Coordonner membres, volumes, opportunités et preuves collectives.

#### Ce que Mbàmbulaan change pour elle
Elle obtient une vue collective et des éléments de reporting pour agir ou négocier.

#### Canal d'entrée probable
Espace organisation, admin assisté, agent terrain.

#### Données qu'elle fournit
Membres, zones, volumes, règles, mandats, validations.

#### Données qu'elle consomme
Activité collective, tensions, opportunités, impact.

#### Actions principales
Référencer, suivre, coordonner, reporter.

#### Moments de vérité
La coopérative doit voir une valeur collective, pas juste des fiches membres.

#### Peurs / objections / freins
Gouvernance interne, confidentialité, effort d'administration.

#### Services Mbàmbulaan associés
Identity, Fisher Network, coordination, reporting.

#### Valeur créée pour l'acteur
Visibilité collective, crédibilité, dossiers d'appui.

#### Valeur créée pour l'écosystème
Adoption structurée et qualité des données.

#### Valeur capturable par Mbàmbulaan
Frais de déploiement, accompagnement, offres coopératives.

#### Parcours MVP
Organisation -> membres -> signaux -> rapport pilote.

#### Parcours V1
Espace coopérative et droits.

#### Parcours V2
Financement, programmes, exports.

#### Critères de réussite
Membres actifs, signaux validés, rapports partagés.

#### Risques produit
Bâtir un ERP coopératif complet trop tôt.

#### À ne pas faire
Transformer l'espace coopérative en back-office lourd.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Structure | Qui appartient au réseau ? | Espaces / Admin | Membres | Activation |
| Coordonne | Quelles actions ? | Coordination | Actions collectives | Actions suivies |
| Valorise | Que montrer ? | Executive | Rapport | Partages |

### 5.14 Organisation professionnelle

#### Rôle dans la filière
Représentation structurée d'une profession ou d'un segment.

#### Problème principal
Difficile de transformer les besoins de membres en lecture opérationnelle.

#### Ce que Mbàmbulaan change pour elle
Elle obtient une vision consolidée et peut prescrire l'adoption.

#### Canal d'entrée probable
Partenariat, espace institutionnel, atelier terrain.

#### Données qu'elle fournit
Membres, zones, règles métier, priorités, mandats.

#### Données qu'elle consomme
Activité, tensions, impact, recommandations.

#### Actions principales
Prescrire, valider, coordonner, rendre compte.

#### Moments de vérité
Voir que Mbàmbulaan sert l'organisation sans la remplacer.

#### Peurs / objections / freins
Perte de légitimité, gouvernance données, politique interne.

#### Services Mbàmbulaan associés
Territorial coordination, observatoire, reporting.

#### Valeur créée pour l'acteur
Meilleure représentation des besoins et preuves d'action.

#### Valeur créée pour l'écosystème
Adoption collective et normalisation des données.

#### Valeur capturable par Mbàmbulaan
Partenariat, licences, déploiement.

#### Parcours MVP
Démo -> pilote -> synthèse membres.

#### Parcours V1
Espace organisation professionnelle.

#### Parcours V2
Observatoire métier et API contrôlée.

#### Critères de réussite
Organisations signées, membres activés, données validées.

#### Risques produit
Promettre une gouvernance nationale trop tôt.

#### À ne pas faire
Court-circuiter les représentants locaux.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Évalue | Le produit sert-il les membres ? | Démo / Executive | Questions | Accord pilote |
| Active | Où commencer ? | Territoire pilote | Zone choisie | Acteurs recrutés |
| Suit | Quel impact ? | Dashboard | Rapport | Rétention |

### 5.15 Marché local

#### Rôle dans la filière
Point de demande et d'écoulement local.

#### Problème principal
Les besoins et flux du marché sont peu structurés.

#### Ce que Mbàmbulaan change pour lui
Le marché devient une source de demande et d'alerte territoriale.

#### Canal d'entrée probable
Agent terrain, responsable marché, WhatsApp, collectivité.

#### Données qu'il fournit
Demande locale, volumes, espèces, tensions, disponibilité.

#### Données qu'il consomme
Lots proches, alertes, opportunités locales.

#### Actions principales
Signaler besoin, confirmer demande, orienter lots.

#### Moments de vérité
La donnée collective doit rester simple et utile.

#### Peurs / objections / freins
Pas de personne clairement responsable, saisie irrégulière.

#### Services Mbàmbulaan associés
Market network, territorial coordination, alerts.

#### Valeur créée pour l'acteur
Meilleure anticipation locale.

#### Valeur créée pour l'écosystème
Demande territoriale plus visible.

#### Valeur capturable par Mbàmbulaan
Services collectivités et programmes alimentaires.

#### Parcours MVP
Demande locale -> besoin -> tension -> action.

#### Parcours V1
Profil marché et besoins récurrents.

#### Parcours V2
Observatoire prix et flux.

#### Critères de réussite
Besoins locaux publiés, lots orientés.

#### Risques produit
Confondre marché local et client unique.

#### À ne pas faire
Exiger une saisie individuelle pour chaque vendeur.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Signale | Quelle demande ? | Besoins | Besoin marché | Besoins locaux |
| Relie | Quel lot proche ? | Opportunités | Matching | Couverture |
| Informe | Quelle tension ? | Coordination | Alerte | Actions |

### 5.16 Entreprise agroalimentaire

#### Rôle dans la filière
Acheteur structuré cherchant volumes, qualité et régularité.

#### Problème principal
Approvisionnement irrégulier et faible visibilité sur lots disponibles.

#### Ce que Mbàmbulaan change pour elle
Elle voit une supply intelligence contextualisée par territoire, qualité et disponibilité.

#### Canal d'entrée probable
Démo commerciale, espace entreprise, dashboard, rendez-vous.

#### Données qu'elle fournit
Besoins, volumes, spécifications qualité, calendrier, zones.

#### Données qu'elle consomme
Lots, qualité, opportunités, traçabilité, synthèse supply.

#### Actions principales
Publier besoin, sélectionner opportunité, planifier retrait, suivre preuve.

#### Moments de vérité
Comprendre que Mbàmbulaan ne garantit pas le stock mais qualifie les flux.

#### Peurs / objections / freins
Fiabilité, conformité, disponibilité, support.

#### Services Mbàmbulaan associés
Supply intelligence, besoins, opportunities, quality, traceability.

#### Valeur créée pour l'acteur
Approvisionnement mieux piloté et moins opaque.

#### Valeur créée pour l'écosystème
Demande structurée et volumes mieux valorisés.

#### Valeur capturable par Mbàmbulaan
Contrat entreprise, abonnement supply, reporting premium.

#### Parcours MVP
Démo entreprise -> besoin -> opportunité -> synthèse.

#### Parcours V1
Transactions, qualité, historique, reporting.

#### Parcours V2
Intégrations et API contrôlée.

#### Critères de réussite
Besoins couverts, lots qualifiés, récurrence entreprise.

#### Risques produit
Être vendu comme garantie logistique.

#### À ne pas faire
Promettre SLA supply sans réseau terrain stable.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Spécifie | Quel besoin ? | Besoins | Besoin entreprise | Besoins récurrents |
| Évalue | Quel lot fiable ? | Opportunités / Quality | Score | Conversion |
| Rend compte | Quelle valeur ? | Executive | Rapport supply | Renouvellement |

### 5.17 Exportateur

#### Rôle dans la filière
Acheteur de volumes avec exigences qualité, traçabilité et conformité.

#### Problème principal
Les lots sont difficiles à qualifier et tracer assez tôt.

#### Ce que Mbàmbulaan change pour lui
Il repère les lots compatibles et obtient une traçabilité démonstrative progressive.

#### Canal d'entrée probable
Démo ciblée, espace entreprise, contact commercial.

#### Données qu'il fournit
Espèces, volumes, qualité, délais, exigences documentaires.

#### Données qu'il consomme
Lots, qualité, historique, acteurs, preuves.

#### Actions principales
Filtrer, réserver, vérifier, demander preuve.

#### Moments de vérité
La différence entre preuve démonstrative et certification officielle doit être claire.

#### Peurs / objections / freins
Conformité, qualité, fiabilité des preuves.

#### Services Mbàmbulaan associés
Quality, traceability, trust, opportunities.

#### Valeur créée pour l'acteur
Préqualification et planification export.

#### Valeur créée pour l'écosystème
Valorisation de lots qualifiés.

#### Valeur capturable par Mbàmbulaan
Offre premium traceability, supply intelligence.

#### Parcours MVP
Démo -> lot qualifié -> opportunité -> preuve limitée.

#### Parcours V1
Dossier lot et suivi transaction.

#### Parcours V2
Conformité avancée et intégrations.

#### Critères de réussite
Lots suivis, preuves complètes, intérêt exportateur.

#### Risques produit
Surpromettre certification.

#### À ne pas faire
Utiliser le mot certifié sans audit officiel.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Filtre | Lot compatible ? | Opportunités | Matching | Lots qualifiés |
| Vérifie | Preuve suffisante ? | Traceability | Historique lot | Dossiers |
| Active | Réserver ? | Transaction | Statut | Conversion |

### 5.18 Collectivité locale

#### Rôle dans la filière
Décideur territorial chargé d'appui local, priorisation et développement économique.

#### Problème principal
Elle manque d'une lecture claire des quais, tensions, lots sensibles et actions.

#### Ce que Mbàmbulaan change pour elle
Elle voit où agir, pourquoi agir et quelle preuve conserver.

#### Canal d'entrée probable
Démo territoire pilote, carte des quais, executive summary.

#### Données qu'elle fournit
Priorités locales, zones, partenaires, décisions, actions publiques.

#### Données qu'elle consomme
Tensions, alertes, volumes, impact, preuves, synthèse.

#### Actions principales
Prioriser, mobiliser, financer, suivre, rendre compte.

#### Moments de vérité
Le territoire pilote doit être lisible en quelques minutes.

#### Peurs / objections / freins
Budget, données politiques, responsabilité, adoption terrain.

#### Services Mbàmbulaan associés
Territory pilot, map, coordination, executive, reporting.

#### Valeur créée pour l'acteur
Décisions locales plus ciblées et justifiables.

#### Valeur créée pour l'écosystème
Action publique reliée aux signaux terrain.

#### Valeur capturable par Mbàmbulaan
Pilote territorial, licence collectivité, diagnostic.

#### Parcours MVP
Territoire pilote -> tension -> action -> preuve -> rapport.

#### Parcours V1
Espace collectivité, reporting périodique.

#### Parcours V2
Observatoire territorial multi-quais.

#### Critères de réussite
Décisions prises, actions suivies, rapports utilisés.

#### Risques produit
Trop d'indicateurs sans action.

#### À ne pas faire
Faire un dashboard décoratif.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Observe | Où agir ? | Quais / Territoire pilote | Tension | Tensions traitées |
| Priorise | Quelle action ? | Coordination | Action coordonnée | Actions suivies |
| Rend compte | Qu'a-t-on changé ? | Executive | Rapport | Décisions |

### 5.19 Institution / ministère / direction nationale

#### Rôle dans la filière
Pilotage sectoriel, politique publique, cadres et programmes.

#### Problème principal
La donnée opérationnelle est fragmentée et difficile à transformer en décision nationale.

#### Ce que Mbàmbulaan change pour elle
La plateforme peut devenir observatoire progressif à partir de pilotes prouvés.

#### Canal d'entrée probable
Démo institutionnelle, executive view, note stratégique, pilote territorial.

#### Données qu'elle fournit
Référentiels, programmes, objectifs, cadres, zones prioritaires.

#### Données qu'elle consomme
KPI agrégés, tensions, impact, risques, couverture.

#### Actions principales
Arbitrer, financer, prioriser, cadrer, évaluer.

#### Moments de vérité
Voir que la donnée est sourcée, prudente et actionnable.

#### Peurs / objections / freins
Gouvernance, sensibilité politique, qualité, conformité.

#### Services Mbàmbulaan associés
Executive, observatory, territorial coordination, impact reporting.

#### Valeur créée pour l'acteur
Pilotage sectoriel mieux informé.

#### Valeur créée pour l'écosystème
Ressources mieux orientées.

#### Valeur capturable par Mbàmbulaan
Licence institutionnelle, observatoire, programmes.

#### Parcours MVP
Démo -> executive -> pilote territorial.

#### Parcours V1
Rapports institutionnels et observatoire pilote.

#### Parcours V2
Multi-territoires, intégrations et exports.

#### Critères de réussite
Pilotes validés, décisions institutionnelles, financement.

#### Risques produit
Cycle de vente long et attentes de couverture nationale.

#### À ne pas faire
Promettre une vision nationale sans données pilotes.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Comprend | Quelle valeur publique ? | Démo / Executive | Synthèse | Réunion suivante |
| Cible | Où piloter ? | Quais / Territory | Zone pilote | Accord pilote |
| Évalue | Quel impact ? | Executive | Rapport | Décision |

### 5.20 ONG / programme

#### Rôle dans la filière
Appui terrain, inclusion, réduction pertes, développement économique.

#### Problème principal
Difficile de cibler l'action et de prouver l'impact.

#### Ce que Mbàmbulaan change pour lui
Les actions sont reliées à des signaux, bénéficiaires, territoires et indicateurs.

#### Canal d'entrée probable
Démo programme, diagnostic territorial, partenariat.

#### Données qu'il fournit
Objectifs, bénéficiaires, territoires, activités, indicateurs.

#### Données qu'il consomme
Impact, tensions, lots sensibles, actions suivies, rapports.

#### Actions principales
Cibler, suivre, reporter, ajuster.

#### Moments de vérité
Le rapport doit distinguer estimé, validé et déclaratif.

#### Peurs / objections / freins
Méthode impact, redevabilité, données personnelles.

#### Services Mbàmbulaan associés
Impact, reporting, coordination, notifications.

#### Valeur créée pour l'acteur
Meilleur ciblage et reporting crédible.

#### Valeur créée pour l'écosystème
Programmes mieux alignés sur le terrain.

#### Valeur capturable par Mbàmbulaan
Reporting impact, frais programme, déploiement.

#### Parcours MVP
Démo impact -> territoire pilote -> rapport.

#### Parcours V1
Espace programme, KPI, bénéficiaires agrégés.

#### Parcours V2
Exports et audits renforcés.

#### Critères de réussite
Indicateurs utilisés, actions suivies, renouvellement programme.

#### Risques produit
Surpromettre impact avant preuve terrain.

#### À ne pas faire
Afficher des chiffres sans niveau de preuve.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Cible | Où agir ? | Quais / Executive | Zone prioritaire | Actions ciblées |
| Suit | Qu'est-ce qui avance ? | Coordination | Statut action | Taux traitement |
| Reporte | Que prouver ? | Executive | Rapport impact | Rapport accepté |

### 5.21 Bailleur

#### Rôle dans la filière
Financeur exigeant preuves, redevabilité et potentiel de passage à l'échelle.

#### Problème principal
Il manque de données opérationnelles fiables pour suivre les financements.

#### Ce que Mbàmbulaan change pour lui
Il peut voir une chaîne signal -> action -> preuve -> impact.

#### Canal d'entrée probable
Démo investisseur/bailleur, executive summary, rapport programme.

#### Données qu'il fournit
Cadre logique, indicateurs, exigences, fonds, territoires.

#### Données qu'il consomme
Impact agrégé, preuves, risques, limites, adoption.

#### Actions principales
Évaluer, financer, suivre, demander rapport.

#### Moments de vérité
Comprendre que Mbàmbulaan sait cadrer les limites de preuve.

#### Peurs / objections / freins
Compliance, audit, gouvernance données.

#### Services Mbàmbulaan associés
Impact reporting, executive, observatory.

#### Valeur créée pour l'acteur
Meilleure redevabilité et ciblage des fonds.

#### Valeur créée pour l'écosystème
Financement mieux orienté.

#### Valeur capturable par Mbàmbulaan
Reporting premium, programmes, licences.

#### Parcours MVP
Démo -> executive -> note pilote.

#### Parcours V1
Reporting programme périodique.

#### Parcours V2
Audit, exports, observatoire.

#### Critères de réussite
Financement engagé, rapports validés.

#### Risques produit
Exiger une preuve trop forte trop tôt.

#### À ne pas faire
Présenter une preuve mock comme audit.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Évalue | Financer ou non ? | Executive | Synthèse | Intérêt |
| Cadre | Quel pilote ? | Territory | Hypothèse pilote | Accord |
| Suit | Quelle preuve ? | Reporting futur | Rapport | Renouvellement |

### 5.22 Banque

#### Rôle dans la filière
Financeur potentiel des acteurs ou organisations.

#### Problème principal
Manque d'historique fiable pour qualifier risque et activité.

#### Ce que Mbàmbulaan change pour elle
À terme, la plateforme peut produire des signaux agrégés d'activité, régularité et confiance.

#### Canal d'entrée probable
Partenariat futur, démo risque, données agrégées.

#### Données qu'elle fournit
Critères de risque, exigences réglementaires, produits financiers.

#### Données qu'elle consomme
Historique agrégé, régularité, transactions, confiance.

#### Actions principales
Évaluer, segmenter, proposer service financier.

#### Moments de vérité
La donnée doit être suffisamment validée et autorisée.

#### Peurs / objections / freins
Régulation, confidentialité, responsabilité.

#### Services Mbàmbulaan associés
Trust, traceability, data products future.

#### Valeur créée pour l'acteur
Meilleure lecture du risque terrain.

#### Valeur créée pour l'écosystème
Accès futur à financement adapté.

#### Valeur capturable par Mbàmbulaan
Data product agrégé, partenariat financier.

#### Parcours MVP
Reporter hors développement, montrer potentiel uniquement.

#### Parcours V1
Préparer historiques et consentements.

#### Parcours V2
Partenariat banque avec données agrégées.

#### Critères de réussite
Données suffisantes, cadre juridique, intérêt banque.

#### Risques produit
Scoring bancaire prématuré.

#### À ne pas faire
Noter solvabilité individuelle dans le MVP.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Observe | Potentiel ? | Executive | Donnée agrégée | Intérêt |
| Cadre | Données autorisées ? | Admin futur | Consentement | Conformité |
| Active | Offre future ? | Finance future | Segment | Conversion future |

### 5.23 Assurance

#### Rôle dans la filière
Acteur de prévention et couverture des risques.

#### Problème principal
Peu de données historisées sur qualité, incidents, pertes et comportements.

#### Ce que Mbàmbulaan change pour elle
À terme, les historiques de lots et incidents peuvent aider à prévenir et tarifer.

#### Canal d'entrée probable
Partenariat futur, démo risque agrégée.

#### Données qu'elle fournit
Critères risque, sinistres, conditions produit.

#### Données qu'elle consomme
Qualité, incidents, historique, preuves, zones sensibles.

#### Actions principales
Évaluer, prévenir, concevoir produit.

#### Moments de vérité
Ne pas confondre preuve opérationnelle et preuve assurantielle.

#### Peurs / objections / freins
Responsabilité, preuve insuffisante, fraude.

#### Services Mbàmbulaan associés
Quality, traceability, trust, alerts future.

#### Valeur créée pour l'acteur
Meilleure compréhension du risque filière.

#### Valeur créée pour l'écosystème
Prévention et produits adaptés à terme.

#### Valeur capturable par Mbàmbulaan
Partenariat assurance, data products future.

#### Parcours MVP
Reporter, ne montrer que les bases qualité/trace.

#### Parcours V1
Historique lots et incidents.

#### Parcours V2
Produits assurance avec cadre juridique.

#### Critères de réussite
Historique fiable, cadre légal, intérêt assureur.

#### Risques produit
Promettre assurance sans données robustes.

#### À ne pas faire
Créer une tarification assurance dans le MVP.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Observe | Quels risques ? | Quality / Executive | Risque agrégé | Cas d'usage |
| Cadre | Quelles preuves ? | Traceability | Historique | Qualité data |
| Active | Produit futur ? | Finance future | Segment | Partenariat |

### 5.24 Partenaire technique

#### Rôle dans la filière
Fournisseur de données, outils, API, capteurs, météo, cartographie ou intégration.

#### Problème principal
Il doit comprendre où son service s'insère sans complexifier le MVP.

#### Ce que Mbàmbulaan change pour lui
La plateforme donne un cadre d'intégration progressif : exports, référentiels, événements, API future.

#### Canal d'entrée probable
Discussion technique, documentation, démonstration produit.

#### Données qu'il fournit
Flux externe, contraintes API, métadonnées, données d'enrichissement.

#### Données qu'il consomme
Spécifications, événements, données autorisées.

#### Actions principales
Évaluer intégration, cadrer sécurité, tester export.

#### Moments de vérité
Comprendre que l'API avancée n'est pas prioritaire MVP.

#### Peurs / objections / freins
Périmètre flou, sécurité, qualité.

#### Services Mbàmbulaan associés
Developer Platform future, data governance, imports/exports.

#### Valeur créée pour l'acteur
Nouveau canal d'intégration sectorielle.

#### Valeur créée pour l'écosystème
Interopérabilité future.

#### Valeur capturable par Mbàmbulaan
Partenariats techniques, API future.

#### Parcours MVP
Démo + cadrage, pas d'intégration lourde.

#### Parcours V1
Exports, imports contrôlés.

#### Parcours V2
API, webhooks, intégrations.

#### Critères de réussite
Partenaires cadrés, sécurité définie, cas utile.

#### Risques produit
Construire une API avant d'avoir validé les usages.

#### À ne pas faire
Ouvrir des données sensibles sans droits.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Découvre | Où s'intégrer ? | Product Book / Démo | Cas intégration | Intérêt |
| Cadre | Quelles données ? | Docs future | Spécification | Accord technique |
| Teste | Quelle valeur ? | Export futur | Prototype | Validation |

### 5.25 Admin Mbàmbulaan

#### Rôle dans la filière
Gouvernance interne du système, des rôles, référentiels et données.

#### Problème principal
Sans administration claire, le produit perd cohérence et confiance.

#### Ce que Mbàmbulaan change pour lui
Il dispose d'un cockpit de qualité, configuration et supervision progressive.

#### Canal d'entrée probable
Back-office interne futur.

#### Données qu'il fournit
Référentiels, droits, corrections, statuts, configuration.

#### Données qu'il consomme
Logs, anomalies, utilisateurs, référentiels, alertes.

#### Actions principales
Créer, valider, corriger, archiver, auditer.

#### Moments de vérité
L'administration doit rester légère au MVP.

#### Peurs / objections / freins
Back-office trop lourd, erreurs de droits.

#### Services Mbàmbulaan associés
Admin Platform, identity, data quality, audit.

#### Valeur créée pour l'acteur
Contrôle et cohérence du système.

#### Valeur créée pour l'écosystème
Confiance, qualité, gouvernance.

#### Valeur capturable par Mbàmbulaan
Scalabilité opérationnelle.

#### Parcours MVP
Référentiels et corrections minimales.

#### Parcours V1
Admin platform complet.

#### Parcours V2
Audit, logs, workflows avancés.

#### Critères de réussite
Données propres, droits corrects, incidents résolus.

#### Risques produit
Construire un ERP interne avant usage terrain.

#### À ne pas faire
Créer une administration exhaustive avant les parcours clés.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Configure | Quels référentiels ? | Admin | Référentiel | Erreurs réduites |
| Valide | Quelle donnée fiable ? | Data Quality | Validation | Qualité |
| Audite | Que s'est-il passé ? | Logs futur | Historique | Incidents |

### 5.26 Support Mbàmbulaan

#### Rôle dans la filière
Assistance aux utilisateurs, acteurs peu digitalisés et opérations terrain.

#### Problème principal
Les acteurs peuvent être bloqués par canal, langue, confiance ou compréhension.

#### Ce que Mbàmbulaan change pour lui
Le support devient un canal d'inclusion et de collecte structurée.

#### Canal d'entrée probable
Téléphone, WhatsApp, ticket, agent, call center futur.

#### Données qu'il fournit
Tickets, motifs, corrections, feedback, statut résolution.

#### Données qu'il consomme
Profil, historique, action en cours, scripts.

#### Actions principales
Aider, saisir, corriger, escalader, former.

#### Moments de vérité
Résoudre sans créer une dette de support infinie.

#### Peurs / objections / freins
Volume de demandes, manque de contexte.

#### Services Mbàmbulaan associés
Support, notifications, admin, data quality.

#### Valeur créée pour l'acteur
Outils d'assistance et résolution rapide.

#### Valeur créée pour l'écosystème
Adoption et inclusion.

#### Valeur capturable par Mbàmbulaan
Rétention, qualité, service déploiement.

#### Parcours MVP
Support léger, retours, corrections manuelles.

#### Parcours V1
Tickets et base d'aide.

#### Parcours V2
Call center et scripts avancés.

#### Critères de réussite
Temps résolution, satisfaction, bugs récurrents réduits.

#### Risques produit
Masquer des problèmes UX derrière du support manuel.

#### À ne pas faire
Faire du support le moteur principal du produit.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Reçoit | Quel problème ? | Support | Ticket | Volume |
| Résout | Quelle action ? | Admin / Agent | Correction | Délai |
| Apprend | Quel pattern ? | Product | Feedback | Améliorations |

### 5.27 Data Manager Mbàmbulaan

#### Rôle dans la filière
Garant de la qualité, cohérence et exploitation de la donnée.

#### Problème principal
La donnée terrain peut être incomplète, doublonnée ou mal qualifiée.

#### Ce que Mbàmbulaan change pour lui
Il dispose de règles, niveaux de preuve, anomalies et référentiels communs.

#### Canal d'entrée probable
Admin data, exports, tableaux qualité.

#### Données qu'il fournit
Corrections, mapping, règles, niveaux de confiance, annotations.

#### Données qu'il consomme
Données brutes, anomalies, logs, référentiels.

#### Actions principales
Contrôler, nettoyer, fusionner, qualifier, exporter.

#### Moments de vérité
Savoir ce qui est déclaratif, estimé, validé, système ou audité.

#### Peurs / objections / freins
Dette data, doublons, sources floues.

#### Services Mbàmbulaan associés
Data quality, reference, traceability, impact.

#### Valeur créée pour l'acteur
Donnée exploitable et gouvernable.

#### Valeur créée pour l'écosystème
Confiance dans les décisions et rapports.

#### Valeur capturable par Mbàmbulaan
Data products, reporting premium, observatoire.

#### Parcours MVP
Contrôle manuel des sources et niveaux de preuve.

#### Parcours V1
File anomalies et référentiels.

#### Parcours V2
Automatisation qualité et exports avancés.

#### Critères de réussite
Taux d'erreur, doublons, couverture source.

#### Risques produit
Faire croire que la donnée est plus fiable qu'elle ne l'est.

#### À ne pas faire
Supprimer l'incertitude au lieu de l'afficher.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Contrôle | Quelle qualité ? | Admin data | Anomalie | Erreurs |
| Qualifie | Quel niveau preuve ? | Data Quality | Proof level | Données qualifiées |
| Exporte | Quel usage ? | Reporting | Dataset | Exports |

### 5.28 Customer Success Mbàmbulaan

#### Rôle dans la filière
Responsable adoption, satisfaction, conversion et expansion des clients ou partenaires.

#### Problème principal
Les clients peuvent ne pas comprendre quoi activer en premier.

#### Ce que Mbàmbulaan change pour lui
Il peut s'appuyer sur parcours, preuves et métriques de valeur par segment.

#### Canal d'entrée probable
CRM futur, dashboard adoption, démos, support.

#### Données qu'il fournit
Notes client, objectifs, objections, statut d'adoption.

#### Données qu'il consomme
Usage, parcours, KPI, tickets, opportunités commerciales.

#### Actions principales
Onboarder, relancer, former, convertir, renouveler.

#### Moments de vérité
Un client doit voir sa première valeur rapidement.

#### Peurs / objections / freins
Produit trop large, promesse mal cadrée.

#### Services Mbàmbulaan associés
Demo, support, analytics, commercial offers.

#### Valeur créée pour l'acteur
Méthode d'accompagnement et conversion plus claire.

#### Valeur créée pour l'écosystème
Adoption durable.

#### Valeur capturable par Mbàmbulaan
Rétention, upsell, pilotes payants.

#### Parcours MVP
Démo -> pilote -> rapport -> next step.

#### Parcours V1
Customer workspace interne.

#### Parcours V2
Health score et playbooks.

#### Critères de réussite
Activation, rétention, conversion pilote.

#### Risques produit
Vendre tous les modules à tous.

#### À ne pas faire
Promettre des capacités reportées.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Cadre | Quel objectif client ? | Démo / CRM futur | Objectif | Qualification |
| Active | Quelle première valeur ? | Territory / Executive | Rapport | Activation |
| Étend | Quelle offre ? | Business model | Opportunité | Conversion |

### 5.29 Investisseur

#### Rôle dans la filière
Financeur de la startup, évaluateur de traction, modèle et scalabilité.

#### Problème principal
Il doit comprendre rapidement pourquoi Mbàmbulaan est défendable et monétisable.

#### Ce que Mbàmbulaan change pour lui
La démo et les documents montrent un système de coordination, pas une collection de pages.

#### Canal d'entrée probable
Pitch, deck, Product Book, démo CEO, executive view.

#### Données qu'il fournit
Questions, thèse, critères, feedback, capital potentiel.

#### Données qu'il consomme
Vision, modèle économique, parcours, preuves, roadmap, risques.

#### Actions principales
Évaluer, challenger, demander traction, décider follow-up.

#### Moments de vérité
Voir le lien entre problème terrain, produit, revenus et expansion.

#### Peurs / objections / freins
Trop complexe, marché difficile, dépendance terrain, ventes longues.

#### Services Mbàmbulaan associés
Public demo, executive, Product Book, business model.

#### Valeur créée pour l'acteur
Clarté d'investissement et lecture de potentiel.

#### Valeur créée pour l'écosystème
Capital, crédibilité, réseau.

#### Valeur capturable par Mbàmbulaan
Financement, expertise, réseau de partenaires.

#### Parcours MVP
Accueil -> démo CEO -> territoire pilote -> executive -> business model.

#### Parcours V1
Data room, KPIs réels, pipeline clients.

#### Parcours V2
Traction multi-territoires et revenus récurrents.

#### Critères de réussite
Compréhension en 5 minutes, follow-up, introduction, term sheet future.

#### Risques produit
Produit perçu comme mission sociale non scalable.

#### À ne pas faire
Cacher les risques ou surpromettre l'IA.

| Étape | Décision métier associée | Écrans ou espaces concernés | Preuve ou donnée générée | Métrique de succès |
| --- | --- | --- | --- | --- |
| Comprend | Pourquoi maintenant ? | Landing / Démo | Signal intérêt | Temps compréhension |
| Évalue | Où est la valeur ? | Territory / Executive | Synthèse | Questions qualifiées |
| Décide | Continuer ou non ? | Business docs | Follow-up | Conversion investisseur |

## 6. Parcours transversaux

### 6.1 Signal terrain vers décision

Pêcheur ou agent -> signal -> qualification -> tension -> action -> preuve -> rapport.

| Étape | Acteur principal | Décision | Écran / espace | Preuve | KPI |
| --- | --- | --- | --- | --- | --- |
| Signal | Pêcheur, capitaine, agent | Le signal est-il utile ? | Arrivages | Source, heure, quai | Signaux créés |
| Qualification | Agent, data manager | Peut-on l'utiliser ? | Quality / Trust | Statut et niveau preuve | Taux validé |
| Tension | Animateur | Faut-il agir ? | Coordination / Quais | Niveau tension | Tensions traitées |
| Action | Animateur, mareyeur | Qui mobiliser ? | Coordination | Action suivie | Délai action |
| Preuve | Agent, système | Que conserver ? | Traceability | Historique | Preuves liées |
| Rapport | Collectivité, institution | Quelle décision ? | Executive | Synthèse | Décisions prises |

### 6.2 Lot vers opportunité

Arrivage -> qualité -> besoin compatible -> opportunité -> action -> transaction potentielle.

| Étape | Décision | Écran | Preuve | KPI |
| --- | --- | --- | --- | --- |
| Arrivage | Le lot est-il visible ? | Arrivages | Signal | Lots publiés |
| Qualité | Est-il urgent ? | Quality | Score | Lots sensibles |
| Besoin | Existe-t-il une demande ? | Besoins | Besoin | Besoins actifs |
| Opportunité | Est-ce compatible ? | Opportunités | Score matching | Opportunités |
| Action | Qui active ? | Coordination | Statut | Actions |
| Transaction | Est-ce confirmé ? | Transactions future | Historique | Transactions |

### 6.3 Besoin vers couverture

Acheteur -> besoin -> matching -> opportunité -> réservation -> suivi.

| Étape | Décision | Écran | Preuve | KPI |
| --- | --- | --- | --- | --- |
| Besoin | Qu'est-ce qui est demandé ? | Besoins | Besoin structuré | Besoins publiés |
| Matching | Quels lots répondent ? | Opportunités | Raisons | Taux couverture |
| Opportunité | Quelle option choisir ? | Opportunité détail | Score | Clics |
| Réservation | Activer ? | Transaction future | Statut | Réservations |
| Suivi | Terminé ? | Transactions | Timeline | Finalisation |

### 6.4 Territoire vers pilotage

Quai -> tensions -> alertes -> coordination -> synthèse collectivité.

| Étape | Décision | Écran | Preuve | KPI |
| --- | --- | --- | --- | --- |
| Quai | Où regarder ? | Quais | Activité | Quais actifs |
| Tension | Quel niveau ? | Tension / Coordination | Calcul | Tensions fortes |
| Alerte | Qui prévenir ? | Notifications | Alerte | Alertes traitées |
| Coordination | Quelle action ? | Coordination | Action | Délai action |
| Synthèse | Que montrer ? | Executive | Rapport | Décisions |

### 6.5 Programme vers impact

Programme -> objectifs -> actions suivies -> indicateurs -> reporting.

| Étape | Décision | Écran | Preuve | KPI |
| --- | --- | --- | --- | --- |
| Objectif | Que finance-t-on ? | Programme future | Cadre | Objectifs |
| Action | Qu'est-ce qui est fait ? | Coordination | Action | Actions suivies |
| Indicateur | Quel effet ? | Dashboard | KPI | Impact |
| Reporting | Que rendre ? | Executive | Rapport | Rapport accepté |

### 6.6 Donnée vers service

Signal -> donnée qualifiée -> agrégation -> insight -> service commercial.

| Étape | Décision | Écran | Preuve | KPI |
| --- | --- | --- | --- | --- |
| Signal | Source fiable ? | Arrivages | Source | Couverture |
| Qualification | Niveau preuve ? | Data Quality | Proof level | Qualité |
| Agrégation | Agréger sans risque ? | Analytics | Dataset | Volumes |
| Insight | Quelle décision ? | Executive | Insight | Usage |
| Service | Qui paie ? | Sales futur | Offre | Conversion |

### 6.7 Public vers démo

Landing -> compréhension -> scénario -> demande de démo -> qualification commerciale.

| Étape | Décision | Écran | Preuve | KPI |
| --- | --- | --- | --- | --- |
| Landing | Comprendre ? | Accueil | Source trafic | Taux clic |
| Scénario | Quel profil ? | Démo | Choix | Démo lancée |
| Valeur | Est-ce utile ? | Territory / Executive | Pages vues | Temps parcours |
| Contact | Continuer ? | Contact futur | Lead | Conversion |
| Qualification | Quel segment ? | CRM futur | Segment | Pipeline |

## 7. Parcours de démonstration

| Démo | Objectif | Message principal | Pages à montrer | Ordre de navigation | Preuves à montrer | Pièges à éviter | Résultat attendu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CEO / fondateur | Montrer le produit en 5 minutes | Operating System de coordination | Accueil, Démo, Territoire pilote, Executive | `/` -> `/demo` -> `/territoire-pilote` -> `/executive` | Signal, action, preuve, impact | Trop détailler les modules | Compréhension immédiate |
| Investisseur | Montrer scalabilité et revenus | Coordination + données + offres | Accueil, Démo, Territory, Executive | `/` -> `/demo` -> `/territoire-pilote` -> `/executive` | Impact, acteurs, valeur capturable | Parler seulement social impact | Follow-up investisseur |
| Collectivité | Montrer décision locale | Joal devient pilotable | Territoire pilote, Quais, Coordination, Executive | `/territoire-pilote` -> `/coordination` -> `/executive` | Tension, action, rapport | Faire dashboard décoratif | Accord pilote |
| ONG / programme | Montrer ciblage et reporting | Action suivie et impact prudent | Démo, Coordination, Executive | `/demo` -> `/coordination` -> `/executive` | Actions, KPI, limites | Surpromettre impact | Discussion programme |
| Entreprise | Montrer supply intelligence | Besoin relié à lot qualifié | Besoins, Opportunités, Arrivages | `/besoins` -> `/opportunites` -> `/arrivages` | Matching, qualité, lot | Promettre garantie volume | Intérêt pilote supply |
| Institution | Montrer lecture agrégée | Décider avec signaux territoriaux | Executive, Territoire, Coordination | `/executive` -> `/territoire-pilote` -> `/coordination` | Risques, tensions, preuve | Couverture nationale fictive | Cadre pilote |
| Acteur terrain | Montrer simplicité | Un signal suffit à déclencher action | Arrivages, Démo, Notifications future | `/arrivages` -> `/demo` | Signal, validation, retour | Montrer trop d'écrans | Acceptation terrain |
| Partenaire technique | Montrer cadre futur | Donnée qualifiée et intégrable plus tard | Démo, Executive, docs | `/demo` -> `/executive` | Sources, proof levels | Promettre API MVP | Cadrage technique |

## 8. Parcours prioritaires MVP

| Parcours | Priorité | Raison | Acteur principal | Valeur métier | Valeur business | Pages nécessaires | Composants nécessaires | Métriques |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Signal terrain vers décision | Must | Prouve l'Operating System | Pêcheur, agent, collectivité | Transformer signal en action | Pilote territorial vendable | `/demo`, `/arrivages`, `/coordination`, `/executive` | SignalCard, Timeline, DecisionSummary | Signaux, actions, preuves |
| Territoire pilote Joal | Must | Rend la valeur démontrable | Collectivité, partenaire | Lire tension et action locale | Offre Pilot Territory | `/territoire-pilote`, `/coordination`, `/executive` | TerritoryPilot, Value cards | Actions, tension, rapport |
| Besoin vers opportunité | Must | Montre le moteur économique | Mareyeur, transformateur | Couvrir besoin | Supply intelligence | `/besoins`, `/opportunites` | NeedCard, OpportunityCard | Taux couverture |
| Lot sensible vers valorisation | Should | Montre impact anti-perte | Pêcheur, transformateur | Prioriser qualité | ONG / programme impact | `/arrivages`, `/opportunites`, `/executive` | QualityBadge, ImpactPanel | Volume valorisé |
| Parcours CEO demo | Must | Permet vente et alignement | CEO, investisseur, prospect | Compréhension en 5 min | Conversion démo | `/`, `/demo`, `/territoire-pilote`, `/executive` | DemoPathNav, CTA | Clics et leads |
| Collectivité vers pilotage | Should | Prépare vente territoriale | Collectivité | Décider action locale | Licence collectivité | `/quais`, `/coordination`, `/executive` | MapPanel, Alert cards | Décisions |
| Reporting impact prudent | Should | Utile ONG/bailleurs | ONG, bailleur | Rendre compte | Reporting premium | `/executive`, dashboard futur | MetricCard, InsightPanel | Rapports utilisés |

## 9. Parcours à reporter

| Parcours reporté | Pourquoi reporter | Condition de reprise |
| --- | --- | --- |
| Paiement | La confiance, les flux et les preuves doivent précéder la monétisation transactionnelle | Transactions réelles et cadre commercial validé |
| API avancée | Les usages et droits doivent être stabilisés avant ouverture | Données propres, sécurité, clients intégration |
| Assurance | Risque réglementaire et preuve insuffisante | Historique qualité/incidents fiable |
| Banque | Scoring prématuré et données sensibles | Consentement, régulation, historique suffisant |
| Certification officielle | Nécessite audit et cadre externe | Partenaires certificateurs et processus audité |
| Export conformité complet | Exigences élevées et responsabilité | Dossier traçabilité réel et validations qualité |
| App mobile dédiée | Les canaux terrain doivent être validés d'abord | Usage récurrent et besoins offline clairs |
| Back-office complet | Risque de construire un ERP interne trop tôt | Volume opérationnel justifiant workflows avancés |
| Messagerie libre | Risque de bruit, modération et perte de contexte | Relations contextualisées et règles claires |
| IA avancée | La coordination explicable doit précéder l'automatisation | Données historiques et métriques de qualité |

## 10. Implications UX

| Besoin UX | Implication |
| --- | --- |
| Espaces | Les espaces doivent être par rôle et non par organigramme abstrait |
| Navigation | Maximum de clarté : public, démo, territoire, modules, executive |
| CTA | Une page doit avoir une mission et une prochaine action évidente |
| Tableaux | Réservés aux listes opérationnelles filtrables |
| Cartes | Utiles pour signal, besoin, opportunité, preuve, acteur, action |
| Timeline | Essentielle pour lot, transaction, démo et preuve |
| Fiches | Nécessaires pour opportunité, acteur, lot, quai, organisation |
| Badges | Statut, preuve, qualité, tension, confiance, priorité, risque |
| Mobile | Terrain et démo doivent rester lisibles sur mobile |
| Accessibilité | Textes courts, contrastes, états, boutons explicites |
| États vides | Jamais vides : expliquer quoi faire ou quel signal manque |
| Public / privé / démo / admin | Ne jamais confondre données scénarisées, données réelles et données internes |

## 11. Implications Design System

| Besoin design | Implication |
| --- | --- |
| Hiérarchie visuelle | Montrer d'abord décision, statut et action, puis détails |
| Ton institutionnel | Sobre, crédible, prudent sur impact et preuve |
| Ton terrain | Direct, simple, orienté action |
| Badges | Palette stable pour preuve, tension, risque, qualité, confiance |
| Cartes | Structure homogène : titre, contexte, statut, action |
| Vues executive | Denses mais lisibles, orientées arbitrage |
| Vues terrain | Peu de texte, prochaine action claire |
| Composants premium | MetricCard, StatusBadge, ModuleCard, InsightPanel, Timeline, DemoPathNav |
| Mobile | Espacements généreux, grilles qui se replient, CTA visibles |

## 12. Implications développement

Aucune ligne de code n'est demandée par ce document, mais il fixe les priorités futures.

| Domaine | Priorité future |
| --- | --- |
| Pages prioritaires | `/`, `/demo`, `/territoire-pilote`, `/arrivages`, `/besoins`, `/opportunites`, `/coordination`, `/executive` |
| Composants prioritaires | DemoPathNav, SignalCard, NeedCard, OpportunityCard, TerritoryPilot, ActionQueue, ProofBadge, DecisionSummary |
| Moteurs nécessaires | Coordination, matching, tension, priorisation, qualité, confiance, traçabilité, impact, executive |
| Données mockées nécessaires | Acteurs, organisations, quais, arrivages, besoins, opportunités, actions, preuves, statuts, programmes, métriques |
| Entités métier centrales | Actor, Organization, Territory, Quay, Arrival, Need, Opportunity, Action, Proof, Transaction, Alert, ReportMetric |
| Règles | Toute logique métier doit rester centralisée dans `src/lib`; les composants affichent et orientent l'action |
| Navigation démo | Le parcours CEO doit rester accessible et visible depuis l'accueil et les pages clés |

## 13. Definition of Done

Ce document est terminé si :

- les 29 acteurs obligatoires sont couverts ;
- chaque acteur montre entrée dans l'Operating System, valeur reçue, valeur apportée et valeur capturable ;
- les utilisateurs, bénéficiaires, décideurs, payeurs et prescripteurs sont distingués ;
- les parcours transversaux sont décrits de bout en bout ;
- les parcours de démo sont actionnables ;
- les parcours MVP prioritaires sont clairs ;
- les parcours reportés sont explicitement cadrés ;
- les implications UX, Design System et développement sont déduites ;
- aucune nouvelle vision n'est introduite ;
- aucune fonctionnalité hors périmètre n'est exigée pour le MVP ;
- le document peut guider la reprise UX, design et développement.

## Synthèse de couverture

| Élément | Couverture |
| --- | --- |
| Acteurs détaillés | 29 |
| Catégories d'acteurs | 7 |
| Parcours transversaux | 7 |
| Parcours de démonstration | 8 |
| Parcours MVP prioritaires | 7 |
| Parcours reportés | 10 |
