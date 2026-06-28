# PACK 05 - Territorial Coordination

## Statut du document

Ce pack décrit la capability `TERRITORIAL COORDINATION` de Mbàmbulaan.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Ce document couvre la capacité de Mbàmbulaan à coordonner les territoires, quais, zones de pêche, collectivités, agents terrain, tensions locales, priorités, alertes, programmes territoriaux et décisions opérationnelles.

Mbàmbulaan n'est pas une simple marketplace offre/demande. La coordination territoriale est l'un des éléments qui fait de Mbàmbulaan une infrastructure sectorielle : elle relie les signaux terrain, les flux économiques, les besoins locaux, les acteurs publics, les décisions collectives et l'impact mesurable.

Ce document ne crée aucune nouvelle vision produit, ne modifie pas le Product Book, n'ajoute aucun module hors vision stabilisée et ne contient aucune implémentation.

## 1. Vision

La coordination territoriale existe pour transformer des signaux locaux dispersés en décisions opérationnelles. Un quai actif, une tension sur une espèce, un surplus non écoulé, une capacité de transformation disponible ou un programme territorial ne prennent de valeur que s'ils sont reliés à des acteurs, des priorités, des alertes et des actions.

Mbàmbulaan différencie son approche d'une marketplace en considérant le territoire comme un système vivant : les arrivages, besoins, opportunités, réservations, transactions, alertes et programmes sont rattachés à des quais, zones, collectivités et institutions.

| Problème territorial | Effet actuel | Réponse Mbàmbulaan | Valeur créée |
| --- | --- | --- | --- |
| Signaux dispersés | Décision lente ou locale | Consolidation par quai et zone | Lecture territoriale |
| Tensions invisibles | Demande ou offre mal orientée | Tension par espèce, quai et période | Priorisation |
| Carte décorative | Peu d'action concrète | Carte reliée aux données métier | Décision actionnable |
| Manque de coordination publique | Programmes et acteurs peu synchronisés | Dashboard collectivité et institution | Gouvernance |
| Surplus ou pénurie | Pertes ou besoins non couverts | Réorientation, alertes, matching | Impact économique |
| Faible preuve | Difficulté à justifier une action | Historique décisionnel et reporting | Redevabilité |

### Valeur économique capturable

| Levier | Capture possible |
| --- | --- |
| Licences institutionnelles | Collectivités, programmes publics, agences nationales |
| Observatoire territorial | Données agrégées, cartes, tensions, reporting |
| Services premium | Diagnostics, accompagnement, déploiement territorial |
| Programmes sponsorisés | Suivi d'impact pour ONG, bailleurs, institutions |
| Analytics avancés | Tensions, volumes, priorités, impact |

### KPIs principaux

| KPI | Définition |
| --- | --- |
| Quais actifs | Quais avec arrivages, besoins, transactions ou alertes récentes |
| Zones suivies | Zones territoriales rattachées à des signaux |
| Tensions détectées | Nombre de tensions faible, surveillée, élevée, critique |
| Alertes territoriales | Alertes liées à quai, zone, espèce ou programme |
| Décisions prises | Actions validées ou clôturées |
| Besoins critiques traités | Besoins urgents ayant reçu action |
| Lots réorientés | Lots redirigés vers besoin ou acheteur |
| Pertes évitées | Volume estimé sauvé ou valorisé |
| Programmes suivis | Programmes actifs avec indicateurs |
| Acteurs territoriaux actifs | Agents, collectivités, référents, coopératives |
| Délai signal -> action | Temps entre détection et décision |

## 2. Acteurs territoriaux

| Acteur | Rôle | Besoin principal | Digitalisation probable | Donnée utile | Décision à prendre | Valeur attendue | Risque produit | Expérience cible |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Collectivité locale | Piloter un territoire | Voir tensions et priorités | Moyenne | Quais, besoins, alertes | Où agir | Décision locale | Trop de détails | Dashboard clair |
| Responsable de quai | Suivre activité quai | Voir arrivages et incidents | Faible à moyenne | Lots, volumes, qualité | Signaler ou arbitrer | Coordination quai | Saisie complexe | Vue quai simple |
| Agent territorial Mbàmbulaan | Relais terrain | Qualifier signaux | Moyenne | Déclarations, alertes | Valider, assigner | Donnée fiable | Surcharge | Mobile terrain |
| Animateur terrain | Accompagnement local | Mobiliser acteurs | Moyenne | Acteurs, besoins, programmes | Relancer | Adoption | Confusion rôles | Liste actions |
| Coopérative locale | Coordonner membres | Lire volumes et besoins | Moyenne | Membres, arrivages, transactions | Mutualiser | Organisation | Données individuelles exposées | Vue collective |
| GIE | Structure locale | Suivre activité collective | Faible à moyenne | Membres, quai, volumes | Déclarer, confirmer | Preuve collective | Doublons | Fiche groupe |
| Service public local | Appui opérationnel | Comprendre risques | Moyenne | Tensions, incidents | Intervenir | Action publique | Gouvernance floue | Vue agrégée |
| ONG territoriale | Cibler appuis | Zones vulnérables | Moyenne | Impact, pertes, alertes | Financer action | Impact mesurable | Données sensibles | Vue impact |
| Programme alimentaire ou social | Couvrir besoins | Approvisionnement local | Moyenne | Besoins, volumes, qualité | Orienter achats | Couverture sociale | Confusion avec achat privé | Fiche programme |
| Partenaire technique | Appuyer déploiement | Voir besoins d'intégration | Élevée | APIs futures, logs agrégés | Connecter | Scalabilité | Accès trop large | Vue limitée |
| Référent données territoire | Qualité data locale | Corriger référentiels | Moyenne | Quais, acteurs, doublons | Valider | Fiabilité | Erreurs de correction | File qualité |
| Administrateur Mbàmbulaan | Gouvernance | Superviser tout | Élevée | Audit, droits, alertes | Arbitrer | Cohérence plateforme | Pouvoir excessif | Back-office contrôlé |

## 3. Territoires et quais

Un territoire est une unité de lecture et de décision : il peut correspondre à une zone, une collectivité, un ensemble de quais, un marché ou un programme. Un quai est un point opérationnel où les arrivages, acteurs, besoins, tensions et décisions peuvent être rattachés.

| Objet | Définition | Usage |
| --- | --- | --- |
| Zone | Espace géographique ou économique | Agréger signaux et tensions |
| Quai | Point de débarquement ou activité | Suivre lots, volumes, alertes |
| Collectivité | Autorité locale ou territoire administratif | Décider et suivre impact |
| Marché | Point de demande ou écoulement | Lire demande locale |
| Programme | Initiative publique, ONG ou partenaire | Suivre objectifs et résultats |

### Rattachements métier

| Objet rattaché | Rattachement territorial |
| --- | --- |
| Arrivage | Quai, zone, pêcheur, heure |
| Besoin | Zone, quai souhaité, acheteur, urgence |
| Acteur | Quai principal, zone, organisation |
| Transaction | Lot, besoin, quai, acteurs |
| Alerte | Quai, zone, espèce, programme éventuel |
| Décision | Acteur responsable, territoire, preuve |

### Éviter la carte décorative

La carte doit toujours permettre une décision : filtrer, identifier une tension, ouvrir un quai, lire une alerte, assigner une action ou comprendre un impact.

### Types de vues

| Vue | Mission |
| --- | --- |
| Vue quai | Lire activité et signaux d'un quai |
| Vue zone | Comparer quais et tensions |
| Vue collectivité | Suivre priorités locales |
| Vue programme | Mesurer une action territoriale |
| Vue institutionnelle agrégée | Lire tendances sans données sensibles |
| Vue opération terrain | Agir vite depuis mobile |

## 4. Signaux territoriaux

| Signal | Source | Fréquence | Fiabilité | Usage produit | Décision associée |
| --- | --- | --- | --- | --- | --- |
| Arrivages | Pêcheurs, agents, imports | Quotidienne | Moyenne à élevée | Volume disponible | Orienter ou valoriser |
| Besoins | Acheteurs, agents | Quotidienne | Moyenne | Demande locale | Matching |
| Surplus | Arrivages non couverts | Temps réel | Moyenne | Risque perte | Réorienter |
| Pénurie | Besoins non couverts | Quotidienne | Moyenne | Tension demande | Mobiliser offre |
| Lots sensibles | Qualité, temps, volume | Temps réel | Moyenne | Priorisation | Accélérer action |
| Retards | Transactions, agents | Événement | Moyenne | Risque conflit | Notifier |
| Annulations | Acheteurs, support | Événement | Élevée | Libérer lot | Recommander |
| Qualité | Agent, pêcheur, transaction | Variable | Moyenne | Risque perte | Prioriser |
| Incidents | Support, terrain | Événement | Élevée | Risque opération | Escalader |
| Conflits | Acteurs, support | Événement | Moyenne | Arbitrage | Revue humaine |
| Tensions offre/demande | Moteur tension | Régulière | Calculée | Lecture territoire | Prioriser |
| Capacité transformation | Transformateurs, programmes | Périodique | Moyenne | Absorption surplus | Orienter |
| Capacité conservation | Quais, collectivités | Périodique | Moyenne | Risque qualité | Renforcer |
| Capacité logistique | Acteurs, agents | Périodique | Moyenne | Retrait/livraison | Planifier |
| Activité des acteurs | Usage plateforme | Continue | Élevée | Activation | Relancer |
| Programmes actifs | Collectivité, ONG | Périodique | Élevée | Suivi impact | Reporter |
| Alertes terrain | Agents, moteurs | Temps réel | Variable | Action immédiate | Assigner |

## 5. Tensions et priorités

Une tension territoriale est un déséquilibre ou un risque local qui exige une attention : trop d'offre non couverte, demande non satisfaite, qualité à risque, manque logistique, conservation insuffisante ou capacité de transformation limitée.

| Type de tension | Description |
| --- | --- |
| Par espèce | Une espèce manque ou reste non écoulée |
| Par quai | Un quai concentre surplus, pénurie ou incidents |
| Par période | Une tension apparaît à certaines heures ou saisons |
| Qualité | Lots sensibles à traiter rapidement |
| Manque de demande | Offre disponible sans acheteur |
| Manque d'offre | Besoins critiques non couverts |
| Logistique ou conservation | Capacité insuffisante pour préserver ou déplacer |

### Niveaux de tension

| Niveau | Définition | Indicateur | Action recommandée | Acteur responsable |
| --- | --- | --- | --- | --- |
| Faible | Situation normale | Offre et demande équilibrées | Surveiller | Agent ou système |
| Surveillée | Signal à suivre | Écart ou risque modéré | Préparer action | Agent territorial |
| Élevée | Action nécessaire | Besoin critique ou surplus significatif | Mobiliser acteurs | Collectivité, opérations |
| Critique | Risque fort ou immédiat | Lots à risque, besoin non couvert, incident | Escalader et décider | Administration, collectivité, programme |

## 6. Coordination opérationnelle

| Workflow | Déclencheur | Acteurs impliqués | Moteur métier utilisé | Sortie attendue | Preuve |
| --- | --- | --- | --- | --- | --- |
| Détecter une tension | Écart offre/demande | Agent, collectivité | tension | Niveau tension | Calcul horodaté |
| Qualifier un signal | Alerte terrain | Agent, référent data | quality, trust | Signal validé | Commentaire |
| Assigner une priorité | Plusieurs actions ouvertes | Opérations, admin | prioritization | File priorisée | Priorité |
| Notifier un acteur | Action requise | Acheteur, pêcheur, agent | alerts, notifications | Notification envoyée | Historique |
| Réorienter un lot | Surplus ou lot sensible | Agent, acheteur | matching, recommendation | Nouvelle opportunité | Trace lot |
| Mobiliser un acheteur | Besoin ou surplus | Mareyeur, transformateur | role recommendations | Réservation possible | Contact ou action |
| Escalader vers collectivité | Tension élevée | Collectivité, admin | executive intelligence | Décision locale | Décision |
| Suivre une action | Alerte assignée | Responsable action | workflow, traceability | Statut mis à jour | Timeline |
| Clôturer une alerte | Action terminée | Agent, admin | alerts | Alerte close | Justification |
| Mesurer l'impact | Transaction ou action close | Data, institution | impact | Volume, valeur, pertes évitées | Reporting |

## 7. Programmes territoriaux

Mbàmbulaan peut servir les programmes territoriaux en donnant une lecture des besoins, des lots, des tensions, des décisions et de l'impact.

| Type de programme | Usage Mbàmbulaan | MVP | V1 | V2 |
| --- | --- | --- | --- | --- |
| Collectivités | Lire quais et priorités | Dashboard simple | Actions suivies | Observatoire local |
| ONG | Cibler zones vulnérables | Impact agrégé | Programmes suivis | Reporting avancé |
| Bailleurs | Suivre effets financés | KPI impact | Données multi-zones | Portefeuille programmes |
| Programmes publics | Prioriser tensions | Vue institutionnelle | Décisions historisées | Intégrations |
| Programmes alimentaires | Couvrir besoins sociaux | Besoins programme | Transactions suivies | Planification |
| Inclusion | Suivre acteurs accompagnés | Liste et activité | Parcours rôle | Mesure sociale |
| Réduction pertes | Lots sensibles | Alertes qualité | Actions conservation | Prédiction |
| Traçabilité | Historique lots | Timeline lot | Preuves structurées | Export conformité |
| Financement ou assurance | Preuve activité | Historique agrégé | Score confiance | Produits dédiés |

## 8. Données

| Donnée | Usage |
| --- | --- |
| Territoire | Agrégation principale |
| Quai | Point opérationnel |
| Zone | Regroupement géographique |
| Acteurs rattachés | Responsabilités et droits |
| Arrivages | Offre disponible |
| Besoins | Demande locale |
| Opportunités | Coordination |
| Réservations | Activation économique |
| Transactions | Preuve de valeur |
| Alertes | Action nécessaire |
| Incidents | Risque opérationnel |
| Programmes | Suivi institutionnel |
| Capacités locales | Transformation, conservation, logistique |
| Indicateurs d'impact | Reporting |
| Historique de décisions | Redevabilité |

### Gouvernance des données

| Type | Règle |
| --- | --- |
| Données publiques | Seulement données scénarisées ou agrégées autorisées |
| Données internes Mbàmbulaan | Opérations, audit, qualité, support |
| Données visibles par collectivité | Agrégées, territoire autorisé, sans détails sensibles |
| Données visibles par institution | Agrégées, multi-territoires selon mandat |
| Données sensibles | Contacts, transactions, incidents, confiance, données nominatives |
| Données agrégées | Utilisables pour dashboard, executive, observatoire |
| Données interdites côté public | Nominatif, réservations, incidents, prix privés, transactions réelles |

## 9. IA et moteurs métier

| Moteur | Utilité territoriale | Donnée d'entrée | Sortie attendue | Décision associée | Explicabilité |
| --- | --- | --- | --- | --- | --- |
| coordination | Relier signaux et actions | Arrivages, besoins, alertes | Actions territoriales | Agir | Chaîne signal -> action |
| matching | Relier besoin et arrivage | Espèce, volume, quai | Opportunités | Réorienter | Critères affichés |
| recommendation | Classer options | Qualité, urgence, tension | Recommandations | Prioriser | Raisons du score |
| trust | Qualifier acteurs | Historique, validations | Niveau confiance | Mobiliser | Facteurs visibles |
| impact | Mesurer valeur | Transactions, volumes | Impact estimé | Reporter | Calcul résumé |
| tension | Lire déséquilibres | Offre, demande, capacité | Niveau tension | Escalader | Offre vs demande |
| prioritization | Ordonner actions | Alertes, impact, risque | File prioritaire | Décider | Critères de priorité |
| alerts | Transformer signaux | Tensions, retards, incidents | Alertes | Assigner | Niveau et cause |
| traceability | Suivre lots/actions | Événements | Timeline | Justifier | Historique |
| quality | Identifier risques | Heure, statut, quai | Score qualité | Accélérer | Facteurs qualité |
| role recommendations | Adapter actions | Rôle, territoire | Recommandations rôle | Orienter | Module cible |
| executive intelligence | Synthétiser | Données agrégées | Lecture décideur | Arbitrer | Sources et limites |

## 10. UX

### Vues nécessaires

| Vue | Objectif | CTA principal |
| --- | --- | --- |
| Carte territoriale | Lire zones, quais, tensions | Ouvrir une zone |
| Liste des quais | Comparer activité et priorité | Voir détail |
| Détail quai | Lire arrivages, besoins, alertes | Traiter priorité |
| Vue tensions | Identifier niveaux | Assigner action |
| Centre de coordination | Piloter actions du jour | Lancer action |
| File de priorités | Ordonner interventions | Traiter |
| Fiche alerte | Comprendre signal et responsable | Clôturer ou escalader |
| Fiche programme | Suivre objectif et impact | Mettre à jour |
| Historique décisionnel | Justifier décisions | Consulter preuve |
| Dashboard collectivité | Décider localement | Voir priorité |
| Dashboard institutionnel agrégé | Lire tendances | Exporter rapport |
| Vue mobile agent terrain | Qualifier et agir | Signaler |

### Navigation et CTA

| Contexte | Navigation | CTA |
| --- | --- | --- |
| Terrain | Mobile, liste courte, filtres quai | Signaler, valider, notifier |
| Collectivité | Dashboard, carte, priorités | Décider, assigner |
| Institution | Vue agrégée, tendances, impact | Lire rapport |
| Admin Mbàmbulaan | Back-office, audit, configuration | Arbitrer, corriger |

### États vides et erreurs

| Situation | Message attendu |
| --- | --- |
| Carte sans signal | Expliquer qu'aucune donnée active n'est disponible |
| Quai sans activité | Proposer suivi ou référencement |
| Tension non calculable | Indiquer donnée manquante |
| Alerte sans responsable | Proposer assignation |
| Programme sans KPI | Demander objectifs ou périmètre |
| Droits insuffisants | Expliquer accès limité sans exposer donnée |

### Principes UX

La coordination territoriale doit être mobile first pour les agents, décisionnelle pour les collectivités, agrégée pour les institutions et contrôlée pour l'administration Mbàmbulaan. La carte ne doit jamais être décorative : chaque point doit conduire à un signal, une alerte, une priorité ou une décision.

## 11. User Stories

| ID | Acteur | Feature | User Story | Critères d'acceptation | Priorité | Horizon |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | Agent territorial | Carte | En tant qu'agent, je veux voir les quais actifs afin de savoir où agir. | Given quais actifs, When carte ouverte, Then activité visible. | Must | MVP |
| TC-02 | Collectivité locale | Carte | En tant que collectivité, je veux voir les tensions locales afin de prioriser mes actions. | Given tensions, When dashboard, Then niveaux visibles. | Must | MVP |
| TC-03 | Responsable de quai | Quai | En tant que responsable de quai, je veux voir les arrivages du jour afin de coordonner. | Given arrivages, When détail quai, Then liste affichée. | Must | MVP |
| TC-04 | Agent terrain | Quai | En tant qu'agent, je veux rattacher un arrivage à un quai afin de fiabiliser la carte. | Given arrivage, When quai choisi, Then rattachement historisé. | Must | MVP |
| TC-05 | Mareyeur local | Zone | En tant qu'acheteur, je veux rattacher mon besoin à une zone afin de recevoir des lots proches. | Given besoin, When zone choisie, Then matching filtré. | Must | MVP |
| TC-06 | Data Manager | Tension | En tant que data manager, je veux recalculer une tension afin de corriger un signal. | Given données corrigées, When recalcul, Then niveau mis à jour. | Should | V1 |
| TC-07 | Collectivité | Niveau critique | En tant que collectivité, je veux distinguer critique et élevé afin d'agir au bon niveau. | Given tension critique, When vue tensions, Then action recommandée affichée. | Must | MVP |
| TC-08 | ONG | Alerte | En tant qu'ONG, je veux recevoir une alerte territoriale afin de cibler un appui. | Given alerte autorisée, When créée, Then notification envoyée. | Should | V1 |
| TC-09 | Agent territorial | Priorité | En tant qu'agent, je veux voir la file de priorités afin de traiter le plus urgent. | Given priorités, When file ouverte, Then ordre affiché. | Must | MVP |
| TC-10 | Animateur terrain | Assignation | En tant qu'animateur, je veux être assigné à une action afin de savoir quoi faire. | Given action, When assignée, Then notification et historique. | Must | MVP |
| TC-11 | Agent terrain | Signal | En tant qu'agent, je veux qualifier un signal terrain afin d'éviter une fausse alerte. | Given signal, When je valide, Then statut qualifié. | Must | MVP |
| TC-12 | Collectivité | Décision | En tant que collectivité, je veux historiser une décision afin de justifier l'action. | Given décision, When enregistrée, Then timeline mise à jour. | Should | V1 |
| TC-13 | Institution | Vue agrégée | En tant qu'institution, je veux lire des données agrégées afin de préserver la confidentialité. | Given rôle institution, When vue ouverte, Then nominatif masqué. | Must | MVP |
| TC-14 | Service public local | Escalade | En tant que service public, je veux recevoir une escalade afin d'intervenir. | Given tension critique, When escaladée, Then responsable notifié. | Should | V1 |
| TC-15 | Coopérative locale | Volumes | En tant que coopérative, je veux voir les volumes de mon territoire afin de coordonner. | Given droits, When dashboard, Then volumes agrégés. | Should | V1 |
| TC-16 | GIE | Membres | En tant que GIE, je veux voir les signaux liés à mes membres afin de suivre l'activité. | Given membres rattachés, When vue groupe, Then activité visible selon droits. | Should | V1 |
| TC-17 | Programme alimentaire | Programme | En tant que programme, je veux suivre besoins couverts afin de mesurer la couverture. | Given besoins programme, When dashboard, Then couverture affichée. | Should | V1 |
| TC-18 | ONG territoriale | Impact | En tant qu'ONG, je veux voir les pertes évitées afin de mesurer l'action. | Given actions clôturées, When impact, Then volume estimé affiché. | Should | V1 |
| TC-19 | Partenaire technique | Données | En tant que partenaire, je veux accéder à des données limitées afin d'intégrer sans risque. | Given mandat, When accès, Then périmètre contrôlé. | Could | V2 |
| TC-20 | Référent données | Qualité | En tant que référent données, je veux corriger un quai afin d'améliorer les calculs. | Given erreur, When correction, Then audit créé. | Should | V1 |
| TC-21 | Administrateur | Droits | En tant qu'admin, je veux gérer droits territoriaux afin de protéger les données. | Given rôle, When droit attribué, Then accès limité. | Must | MVP |
| TC-22 | Agent mobile | Mobile | En tant qu'agent, je veux signaler depuis mobile afin d'agir sur le terrain. | Given mobile, When signal envoyé, Then brouillon ou envoi visible. | Must | MVP |
| TC-23 | Agent mobile | Offline | En tant qu'agent, je veux garder un signal hors ligne afin de synchroniser plus tard. | Given pas réseau, When saisie, Then brouillon conservé. | Could | V1.5 |
| TC-24 | Collectivité | État vide | En tant que collectivité, je veux comprendre une carte vide afin de savoir quoi faire. | Given pas de données, When carte, Then message actionnable. | Must | MVP |
| TC-25 | Agent | Erreur donnée | En tant qu'agent, je veux savoir quelle donnée manque afin de corriger. | Given tension incalculable, When détail, Then champ manquant affiché. | Must | MVP |
| TC-26 | Support | Incident | En tant que support, je veux rattacher un incident à un quai afin de suivre le risque. | Given incident, When quai lié, Then historique visible. | Should | V1 |
| TC-27 | Data Manager | Reporting | En tant que data manager, je veux exporter un rapport agrégé afin d'informer une institution. | Given droits, When export, Then fichier agrégé et audit. | Should | V1 |
| TC-28 | Institution | Confidentialité | En tant qu'institution, je veux éviter les données individuelles afin de respecter la gouvernance. | Given vue institution, When consultation, Then données sensibles masquées. | Must | MVP |
| TC-29 | Collectivité | Programme | En tant que collectivité, je veux associer une alerte à un programme afin de suivre l'action. | Given programme actif, When alerte liée, Then reporting mis à jour. | Should | V1 |
| TC-30 | Agent | Clôture alerte | En tant qu'agent, je veux clôturer une alerte avec preuve afin de terminer l'action. | Given alerte traitée, When clôture, Then justification requise. | Must | MVP |
| TC-31 | Admin | Audit | En tant qu'admin, je veux consulter l'historique décisionnel afin de contrôler. | Given actions, When audit, Then timeline complète. | Must | MVP |
| TC-32 | Collectivité | Lots réorientés | En tant que collectivité, je veux voir les lots réorientés afin de mesurer l'efficacité. | Given réorientation, When dashboard, Then compteur mis à jour. | Should | V1 |
| TC-33 | Responsable quai | Capacité conservation | En tant que responsable quai, je veux signaler une capacité de conservation faible afin de prioriser. | Given capacité faible, When signalée, Then tension qualité augmente. | Should | V1 |
| TC-34 | Transformateur | Capacité transformation | En tant que transformateur, je veux signaler ma capacité afin d'absorber un surplus. | Given capacité, When renseignée, Then recommandations adaptées. | Should | V1 |
| TC-35 | Opérations | Mobilisation acheteur | En tant qu'opérations, je veux mobiliser des acheteurs afin de réduire un surplus. | Given surplus, When action lancée, Then acheteurs ciblés notifiés. | Should | V1 |
| TC-36 | Collectivité | Délai signal action | En tant que collectivité, je veux suivre le délai signal-action afin d'améliorer la réactivité. | Given actions, When KPI, Then délai affiché. | Should | V1 |
| TC-37 | ONG | Zones vulnérables | En tant qu'ONG, je veux voir zones vulnérables afin de prioriser l'appui. | Given tensions répétées, When vue impact, Then zones listées. | Should | V1 |
| TC-38 | Institution | Multi-territoires | En tant qu'institution, je veux comparer territoires afin de décider. | Given plusieurs zones, When comparaison, Then KPI agrégés. | Could | V2 |
| TC-39 | Admin | Données publiques | En tant qu'admin, je veux empêcher l'exposition publique des données sensibles afin de protéger les acteurs. | Given page publique, When consultation, Then données réelles absentes. | Must | MVP |
| TC-40 | Investisseur | Démo territoriale | En tant qu'investisseur, je veux voir la coordination territoriale en démo afin de comprendre la défensibilité. | Given démo, When scénario, Then données scénarisées et impact visible. | Must | MVP |

## 12. Tests

| ID | Domaine | Test | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- |
| TT-01 | Rattachement arrivage | Associer arrivage à quai | Quai visible sur détail | Must |
| TT-02 | Rattachement besoin | Associer besoin à zone | Zone utilisée par matching | Must |
| TT-03 | Calcul tension | Offre < demande | Tension calculée | Must |
| TT-04 | Niveau critique | Seuil critique atteint | Niveau critique affiché | Must |
| TT-05 | Alerte territoriale | Tension critique | Alerte créée | Must |
| TT-06 | Priorité | Plusieurs alertes | File ordonnée | Must |
| TT-07 | Notification | Alerte assignée | Responsable notifié | Must |
| TT-08 | Clôture alerte | Justification fournie | Alerte clôturée | Must |
| TT-09 | Vue collectivité | Rôle collectivité | Données territoire visibles | Must |
| TT-10 | Vue institutionnelle | Rôle institution | Données agrégées visibles | Must |
| TT-11 | Confidentialité | Vue non autorisée | Données sensibles masquées | Must |
| TT-12 | Droits | Agent hors territoire | Accès refusé | Must |
| TT-13 | Mobile | Signal terrain | Vue lisible mobile | Must |
| TT-14 | État vide carte | Aucun signal | Message actionnable | Must |
| TT-15 | Erreur données manquantes | Quai absent | Erreur claire | Must |
| TT-16 | Historique décisionnel | Décision enregistrée | Timeline disponible | Should |
| TT-17 | Programme territorial | Alerte liée programme | Reporting mis à jour | Should |
| TT-18 | Reporting | Export agrégé | Audit créé | Should |
| TT-19 | Réorientation lot | Surplus détecté | Opportunité proposée | Should |
| TT-20 | Capacité conservation | Capacité faible | Risque qualité augmenté | Should |
| TT-21 | Capacité transformation | Capacité disponible | Recommandations adaptées | Should |
| TT-22 | Délai signal action | Action clôturée | KPI calculé | Should |
| TT-23 | Incident territorial | Incident quai | Alerte ou historique visible | Should |
| TT-24 | Données publiques | Page publique | Aucune donnée réelle sensible | Must |

## 13. Definition of Done

| Domaine | Condition de readiness |
| --- | --- |
| Produit | La capability explique clairement la coordination territoriale hors logique marketplace |
| Métier | Quais, zones, tensions, alertes, programmes et décisions sont reliés |
| UX | Carte, vues, CTA, états vides et erreurs sont définis |
| Données | Rattachements, visibilité, agrégation et confidentialité sont cadrés |
| Moteurs métier | Coordination, tension, priorisation, alertes, impact et traçabilité sont reliés |
| Sécurité | Droits par rôle, territoire et niveau d'agrégation prévus |
| Gouvernance | Décisions et actions sensibles sont historisées |
| Analytics | KPIs territoriaux et délai signal -> action définis |
| Support terrain | Agents, responsables quai et animateurs disposent de parcours simples |
| Partenaires | Collectivités, ONG, programmes et institutions ont une lecture adaptée |
| Documentation | Product, UX, CTO, partenaire et investisseur peuvent utiliser le document |
| Reprise future en code | Le document est assez structuré pour guider l'implémentation |

## Synthèse de livraison

| Indicateur | Nombre |
| --- | --- |
| Sections principales | 13 |
| Acteurs territoriaux | 12 |
| Workflows opérationnels | 10 |
| User Stories | 40 |
| Tests fonctionnels | 24 |
