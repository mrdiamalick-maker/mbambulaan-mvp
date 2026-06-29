# PACK 07 - Trust, Traceability & Quality Layer

## Statut du document

Ce pack décrit la capability `TRUST, TRACEABILITY & QUALITY LAYER` de Mbàmbulaan.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Ce document couvre la couche de confiance, traçabilité, qualité, preuve, réputation, incidents, risques et gouvernance associée. Cette capability est transversale : elle sert les pêcheurs, acheteurs, mareyeurs, transformateurs, collectivités, institutions, ONG, bailleurs, banques, assurances, exportateurs, entreprises et l'équipe Mbàmbulaan.

Mbàmbulaan ne doit pas être une plateforme qui affiche simplement des lots, besoins ou dashboards. Elle doit produire de la confiance exploitable : qui a déclaré quoi, d'où vient l'information, quel est le niveau de fiabilité, quel lot est suivi, quelle preuve existe, quelle qualité est estimée ou vérifiée, quels risques sont visibles, quelles décisions peuvent être prises prudemment.

Question centrale : pourquoi un acteur ferait-il confiance à une information, un lot, un acteur, une transaction, un programme ou un indicateur dans Mbàmbulaan ?

Ce document ne crée aucune nouvelle vision produit, ne modifie pas le Product Book, n'ajoute aucun module hors vision stabilisée et ne contient aucune implémentation.

## 1. Vision

Cette couche existe parce que la coordination économique ne fonctionne durablement que si les acteurs peuvent croire les signaux qu'ils reçoivent. Un arrivage visible mais non fiable crée de la frustration. Un besoin publié mais non honoré bloque des transactions. Une qualité non expliquée fragilise l'acheteur. Un indicateur d'impact sans preuve fragilise l'institution. Une opportunité sans historique reste une promesse fragile.

La confiance devient donc un actif économique. Elle réduit l'asymétrie d'information, accélère la réservation, sécurise les transactions, améliore le reporting, soutient les programmes publics, crée de la valeur pour les banques et assurances, et différencie Mbàmbulaan d'une simple marketplace.

| Problème de confiance | Effet actuel | Réponse Mbàmbulaan | Valeur créée | Valeur capturable |
| --- | --- | --- | --- | --- |
| Déclarations non vérifiées | Hésitation des acheteurs | Source, statut et validation visibles | Décision prudente | Premium confiance |
| Lots peu traçables | Difficile de prouver l'origine | Identifiant lot et timeline | Preuve opérationnelle | Traçabilité premium |
| Qualité incertaine | Risque de perte ou litige | Statuts qualité et alertes | Réduction risque | Services qualité |
| Acteurs inconnus | Réservations moins fiables | Score expliqué et historique | Réseau plus fiable | Réputation vérifiée |
| Incidents non historisés | Répétition des problèmes | Journal incidents et clôture | Apprentissage collectif | Support et audit |
| Données sensibles exposées | Frein à l'adoption | Droits, masquage, audit | Confiance institutionnelle | Contrats B2B/B2G |
| Preuves dispersées | Reporting fragile | Niveaux de preuve | Redevabilité | Reporting preuve |
| Scores opaques | Méfiance ou exclusion | Explication simple | Décision assistée | Intelligence métier |

### KPIs principaux

| KPI | Définition |
| --- | --- |
| Lots tracés | Lots rattachés à un identifiant et une timeline |
| Lots avec preuve | Lots disposant d'au moins une preuve déclarative, validée ou système |
| Lots qualité vérifiée | Lots avec statut qualité vérifiée |
| Acteurs validés | Acteurs contrôlés par agent, organisation ou processus |
| Acteurs actifs | Acteurs ayant produit un signal récent |
| Score de confiance moyen | Moyenne des scores acteurs ou organisations |
| Incidents déclarés | Incidents enregistrés sur une période |
| Incidents résolus | Incidents clôturés avec règle de résolution |
| Annulations répétées | Annulations récurrentes par acteur ou transaction |
| Réservations fiables | Réservations confirmées et honorées |
| Transactions clôturées | Transactions terminées avec historique |
| Taux de données validées | Données validées / données totales |
| Taux de données estimées | Données estimées / données totales |
| Alertes qualité | Alertes liées à fraîcheur, risque ou contestation |
| Preuves collectées | Preuves rattachées à lots, transactions ou programmes |
| Délais de validation | Temps moyen entre déclaration et validation |

## 2. Objets de confiance

| Objet | Pourquoi il doit être fiable | Données nécessaires | Niveau de preuve | Risque associé | Utilisateur concerné | Décision supportée |
| --- | --- | --- | --- | --- | --- | --- |
| Acteur | Conditionne la relation économique | Identité, rôle, zone, historique | Validée ou déclarative | Faux profil | Tous | Travailler avec lui |
| Organisation | Porte responsabilité et droits | Nom, type, mandat, membres | Validée | Usurpation | Institutions, entreprises | Contracter ou autoriser |
| Pêcheur | Source primaire des lots | Identité, quai, embarcation, déclarations | Déclarative puis validée | Déclaration imprécise | Acheteurs, agents | Réserver un lot |
| Acheteur | Crée la demande et la réservation | Profil, besoins, historique | Validée | Réservation non honorée | Pêcheurs, support | Accepter une demande |
| Agent terrain | Qualifie les signaux | Identité, zone, actions | Validée | Erreur de validation | Admin, institutions | Faire confiance au contrôle |
| Quai | Ancre territoriale | Nom, zone, activité, tensions | Référentiel + signaux | Mauvaise localisation | Collectivités | Prioriser un quai |
| Lot | Objet économique principal | Espèce, quantité, quai, heure, statut | Déclarative, estimée ou vérifiée | Lot inexistant ou indisponible | Acheteurs, exportateurs | Réserver ou traiter |
| Besoin | Structure la demande | Espèce, quantité, urgence, acteur | Déclarative ou validée | Besoin non honoré | Pêcheurs, mareyeurs | Proposer un lot |
| Opportunité | Relie offre et demande | Lot, besoin, score, raisons | Système explicable | Matching faible | Acheteurs, coordination | Engager la relation |
| Réservation | Engage une intention | Acteur, lot, date, statut | Système + confirmation | Abus ou annulation | Support, vendeur | Bloquer un lot |
| Transaction | Suit l'exécution | Réservation, statuts, preuves | Système + humain | Non clôture | Acheteurs, institutions | Mesurer la valeur |
| Programme | Donne un cadre d'action | Objectifs, périmètre, KPI | Documentaire | Impact non prouvé | ONG, bailleurs | Financer ou ajuster |
| Rapport | Supporte une décision | Période, sources, limites | Auditée | Surpromesse | Institutions | Communiquer ou arbitrer |
| Indicateur | Résume une réalité | Méthode, source, date | Estimée ou vérifiée | Mauvaise interprétation | Décideurs | Prioriser |
| Export | Sort les données du système | Périmètre, droit, justification | Auditée | Fuite de données | Admin, partenaires | Partager prudemment |
| Décision | Historise l'action | Auteur, contexte, motif | Auditée | Décision non traçable | Institutions, admin | Rendre compte |

## 3. Traçabilité

La traçabilité Mbàmbulaan suit l'histoire d'un lot et des décisions associées. Elle ne doit pas prétendre produire une certification complète dès le MVP. Elle doit rendre visibles les événements connus, leur source, leur niveau de preuve, leurs limites et les acteurs impliqués.

| Étape | Événement tracé | Données clés | Source | Preuve | Visibilité |
| --- | --- | --- | --- | --- | --- |
| Déclaration | Arrivage déclaré | Espèce, quantité, quai, heure | Pêcheur, agent, import | Déclarative | Acteurs autorisés |
| Validation | Signal contrôlé | Agent, statut, commentaire | Agent terrain | Validée | Admin, partenaires autorisés |
| Lot | Identifiant créé | ID lot, statut, lien arrivage | Système | Système | Selon rôle |
| Qualité | Qualité renseignée | Fraîcheur, risque, statut | Acteur, agent, système | Estimée ou vérifiée | Acheteur, support |
| Opportunité | Matching détecté | Lot, besoin, score | Moteur | Système explicable | Acheteurs, coordination |
| Réservation | Lot réservé | Réservataire, date, statut | Système + acteur | Confirmation | Parties concernées |
| Transaction | Transaction créée | Étapes, acteur, volume | Système | Historique | Parties et pilotage |
| Retrait | Retrait préparé | Heure, responsable, statut | Acteur, agent | Confirmation | Parties concernées |
| Livraison | Livraison ou finalisation | Statut, preuve, commentaire | Acteur, agent | Validée si disponible | Parties et reporting |
| Incident | Problème déclaré | Type, gravité, preuve | Acteur, support | Déclarative ou validée | Support, admin |
| Clôture | Transaction ou litige clos | Résolution, date, responsable | Support, système | Auditée | Selon mandat |
| Reporting | Agrégation produite | KPI, source, limites | Moteur + admin | Auditée | Institutionnel agrégé |

### Composants de traçabilité

| Élément | Règle |
| --- | --- |
| Identifiant lot | Format lisible, unique, rattaché au quai, à l'année et à une séquence |
| Timeline | Événements ordonnés, horodatés et filtrables par rôle |
| Acteurs impliqués | Nominatifs selon droits, agrégés pour institutionnel |
| Horodatage | Date et heure de création ou de modification |
| Source | Acteur, agent, système, import, document ou confirmation |
| Preuve | Déclarative, validée, documentaire, système, auditée ou absente |
| Statut | État opérationnel du lot, de la transaction ou de l'incident |
| Droits de visibilité | Accès par rôle, mandat, territoire, organisation et sensibilité |

### Limites par horizon

| Horizon | Capacité attendue | Limite assumée |
| --- | --- | --- |
| MVP | Identifiant lot, timeline simple, statut, source, preuve déclarative ou système | Pas de certification officielle |
| V1 | Validation terrain, incidents, qualité vérifiée, exports contrôlés | Preuve dépendante du réseau humain |
| V2 | Géolocalisation, documents avancés, intégrations, audit renforcé | Gouvernance et conformité nécessaires |

## 4. Qualité des lots

La qualité doit aider à décider vite sans créer une illusion de certitude. Mbàmbulaan distingue ce qui est déclaré, estimé, vérifié ou contesté. La qualité combine fraîcheur, heure de débarquement, espèce, quai, conditions de conservation, délai depuis déclaration, contrôle humain, preuves futures, statut qualité, risque de perte et urgence de valorisation.

| Statut qualité | Définition | Source | Fiabilité | Action recommandée | Risque |
| --- | --- | --- | --- | --- | --- |
| Qualité non renseignée | Aucun signal qualité disponible | Aucun ou déclaration incomplète | Faible | Demander qualification | Décision à l'aveugle |
| Qualité déclarée | Qualité indiquée par acteur | Pêcheur, vendeur, acheteur | Moyenne | Afficher source | Surévaluation possible |
| Qualité estimée | Score calculé par règles simples | Heure, espèce, quai, statut | Moyenne | Prioriser contrôle ou réservation | Erreur de contexte |
| Qualité vérifiée | Qualité confirmée par agent ou processus | Agent terrain, contrôle humain | Forte | Autoriser usage avancé | Coût de validation |
| Qualité contestée | Qualité remise en cause | Acheteur, support, agent | Variable | Ouvrir incident | Litige |
| Lot sensible | Lot avec risque de perte ou tension | Qualité + tension + délai | Moyenne à forte | Accélérer valorisation | Perte économique |
| Lot à risque | Lot non réservé ou dégradé | Qualité, délai, statut | Moyenne | Alerter transformateurs ou support | Gaspillage |

### Dimensions de qualité

| Dimension | Signal | Usage |
| --- | --- | --- |
| Fraîcheur | Heure de débarquement et délai | Prioriser traitement |
| Espèce | Sensibilité et saisonnalité | Adapter risque |
| Quai | Capacité et tension territoriale | Orienter action |
| Conservation | Déclarée ou contrôlée | Évaluer urgence |
| Contrôle humain | Agent ou référent | Augmenter preuve |
| Photo future | Preuve documentaire possible | Renforcer confiance |
| Transaction existante | Réservation ou retrait | Réduire risque |
| Incident | Litige ou contestation | Dégrader statut prudent |

## 5. Score de confiance

Les scores Mbàmbulaan doivent aider à décider prudemment. Ils ne doivent jamais devenir des scores opaques, punitifs ou automatiques d'exclusion. Chaque score doit être expliqué par des facteurs visibles et permettre une correction humaine.

| Score | Données d'entrée | Logique | Sortie | Usage produit | Limite | Explicabilité | Risque à éviter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Score acteur | Historique, validations, incidents, transactions | Pondération simple et revue humaine | Niveau faible/moyen/élevé | Choisir partenaire | Données partielles | Facteurs listés | Exclusion injuste |
| Score organisation | Mandat, membres, historique, litiges | Agrégation prudente | Fiabilité organisation | Contracter | Hétérogénéité membres | Sources visibles | Généralisation abusive |
| Score lot | Qualité, preuve, disponibilité, incidents | Règles qualité + traçabilité | Lot fiable/sensible/risqué | Réserver | Qualité déclarative | Raisons du score | Surpromesse |
| Score besoin | Urgence, acteur, historique, couverture | Priorité + fiabilité demande | Besoin fiable/prioritaire | Répondre | Besoin peut changer | Critères | Bloquer demande réelle |
| Score transaction | Réservation, statuts, retards, preuves | Suivi workflow | Transaction fiable/à risque | Piloter | Retard contextualisé | Timeline | Sanction automatique |
| Score donnée | Source, validation, fraîcheur, cohérence | Qualité data | Donnée déclarée/validée/estimée | Afficher KPI | Donnée terrain fluctuante | Niveau de preuve | Faux officiel |
| Score programme | Objectifs, KPI, preuves, délais | Suivi agrégé | Programme robuste/à surveiller | Financer | Scope variable | Méthode | Surévaluer impact |
| Score territoire | Tension, activité, incidents, validations | Agrégation locale | Territoire fiable/sous tension | Prioriser | Biais de couverture | Sources | Stigmatiser zone |

## 6. Incidents, litiges et risques

Les incidents ne sont pas seulement des erreurs. Ils deviennent des signaux de gouvernance, de support, de formation, de risque et d'amélioration produit. Mbàmbulaan doit les historiser sans exposer inutilement les acteurs.

| Incident | Source | Gravité | Action recommandée | Acteur responsable | Preuve attendue | Effet sur confiance | Règle de clôture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Annulation | Acteur ou système | Moyenne | Demander motif | Réservataire ou vendeur | Message, statut | Dégrade si répétée | Motif renseigné |
| Retard | Transaction | Moyenne | Relancer ou replanifier | Partie en retard | Horodatage | Dégrade légèrement | Nouveau délai accepté |
| Lot indisponible | Vendeur, agent | Forte | Retirer lot | Vendeur | Confirmation agent | Dégrade lot et acteur | Lot retiré ou corrigé |
| Qualité contestée | Acheteur, agent | Forte | Ouvrir litige qualité | Vendeur ou transport | Photo, contrôle, message | Dégrade lot | Résolution support |
| Volume incorrect | Acheteur, agent | Moyenne | Corriger volume | Déclarant | Pesée ou validation | Dégrade donnée | Volume corrigé |
| Doublon | Système, admin | Faible | Fusionner | Admin | Historique | Neutre si corrigé | Fusion auditée |
| Fausse déclaration | Agent, support | Critique | Suspendre signal | Déclarant | Preuve contradictoire | Dégrade fortement | Revue admin |
| Besoin non honoré | Vendeur, support | Moyenne | Marquer non honoré | Acheteur | Historique réservation | Dégrade acheteur | Motif et clôture |
| Réservation abusive | Support, vendeur | Forte | Limiter réservation | Acheteur | Historique répétitif | Dégrade acheteur | Règle appliquée |
| Transaction non clôturée | Système | Moyenne | Relance support | Parties | Statut bloqué | Dégrade workflow | Statut final renseigné |
| Conflit acteur | Support | Forte | Médiation | Parties | Notes support | Selon résolution | Décision support |
| Erreur agent | Admin | Moyenne | Corriger et former | Agent | Audit trail | Dégrade processus | Correction validée |
| Donnée incohérente | Système, admin | Faible à moyenne | Revue data | Source donnée | Anomalie détectée | Dégrade donnée | Donnée corrigée |

## 7. Preuves et niveaux de preuve

La preuve Mbàmbulaan doit rester prudente. Elle indique ce qui est connu, par qui, quand, avec quel niveau de fiabilité et quelle limite. Elle ne transforme pas une donnée déclarée en vérité officielle.

| Type de preuve | Description | Niveau | Usage | Limite |
| --- | --- | --- | --- | --- |
| Déclaration acteur | Information saisie ou transmise par acteur | Déclarative | Signal initial | Peut être imprécise |
| Validation agent | Contrôle par référent terrain | Validée | Renforcer confiance | Dépend compétence agent |
| Confirmation téléphone | Appel ou échange documenté | Validée | Confirmer disponibilité | Trace à conserver |
| Message WhatsApp | Message reçu ou capturé | Documentaire | Preuve terrain légère | Sensible et contextualisé |
| Photo | Image future du lot ou document | Documentaire | Qualité et litige | Besoin consentement |
| Horodatage | Date/heure système | Système | Timeline | Ne prouve pas la réalité terrain |
| Géolocalisation future | Position si autorisée | Système/documentaire | Territoire et retrait | Surveillance à éviter |
| Statut système | Changement de statut | Système | Workflow | Dépend action utilisateur |
| Confirmation transaction | Accord ou clôture | Validée/système | Reporting économique | Peut manquer de détail |
| Signature ou accord | Accord formalisé | Documentaire | Engagement | Horizon futur |
| Document programme | Mandat, rapport, convention | Documentaire | Institutionnel | Peut être externe |
| Export | Données sorties avec trace | Auditée | Partage contrôlé | Risque de diffusion |
| Audit | Journal complet | Auditée | Gouvernance | Accès limité |

### Niveaux de preuve

| Niveau | Définition | Règle d'affichage |
| --- | --- | --- |
| Preuve déclarative | Fournie par un acteur | Afficher source et date |
| Preuve validée | Contrôlée par humain autorisé | Afficher validateur selon droits |
| Preuve documentaire | Appuyée par document ou media | Protéger contenu sensible |
| Preuve système | Générée par l'application | Expliquer ce qu'elle prouve vraiment |
| Preuve auditée | Historique complet et contrôlé | Réserver aux rôles autorisés |
| Preuve absente | Aucune preuve disponible | Afficher limite et prochaine action |

### Règles de prudence

| Règle | Application |
| --- | --- |
| Ne pas surpromettre | Aucun terme de certification sans processus formel |
| Estimé vs vérifié | Badge et méthode visibles |
| Source et limite | Toujours indiquer source, date, niveau |
| Données sensibles | Masquage selon rôle |
| Surveillance excessive | Géolocalisation et médias uniquement avec cadre clair |
| Droit de correction | Acteur ou admin peut contester une donnée |

## 8. Données et gouvernance

| Donnée | Usage confiance |
| --- | --- |
| Profils acteurs | Identifier et qualifier |
| Organisations | Mandat, droits et responsabilité |
| Validations | Prouver un contrôle |
| Arrivages | Source des lots |
| Besoins | Fiabilité de la demande |
| Lots | Traçabilité et qualité |
| Opportunités | Matching explicable |
| Réservations | Engagement économique |
| Transactions | Preuve de valeur |
| Incidents | Gestion du risque |
| Preuves | Justification |
| Qualité | Décision prudente |
| Scores | Aide à la décision |
| Alertes | Signal risque |
| Rapports | Redevabilité |
| Exports | Partage contrôlé |
| Décisions | Historique institutionnel |

### Visibilité

| Type | Règle |
| --- | --- |
| Données publiques | Démo, agrégées ou scénarisées seulement |
| Données internes | Support, qualité, audit, gouvernance |
| Données sensibles | Identité, incidents, litiges, preuves privées |
| Données auditables | Exports, corrections, décisions, accès sensibles |
| Données visibles par acteur | Ses lots, besoins, transactions et preuves autorisées |
| Données visibles par acheteur | Lots, qualité, disponibilité, confiance utile |
| Données visibles par institution | Agrégats, impact, tensions, limites |
| Données visibles banque/assurance | Scores agrégés ou mandatés, sans exposition abusive |
| Données interdites côté public | Nominatif, incident, transaction réelle, preuve privée |

### Principes

| Principe | Application |
| --- | --- |
| Minimisation | Collecter et afficher uniquement l'utile |
| Consentement | Exiger cadre clair pour données sensibles |
| Audit | Historiser accès, exports et corrections |
| Explicabilité | Scores et preuves expliqués |
| Droit de correction | Permettre contestation et rectification |
| Traçabilité des changements | Tout changement critique garde une trace |
| Séparation réel / démo | Jamais mélanger données démonstration et données réelles |
| Contrôle des accès | RBAC, ABAC, territoire, organisation, mandat |

## 9. IA et moteurs métier

| Moteur | Rôle dans la confiance | Données d'entrée | Sortie attendue | Décision supportée | Règle d'explicabilité | Risque à éviter |
| --- | --- | --- | --- | --- | --- | --- |
| trust | Qualifier fiabilité acteurs et organisations | Historique, validations, incidents | Score et raisons | Travailler avec un acteur | Facteurs visibles | Score punitif |
| traceability | Historiser lots et transactions | Événements, sources, statuts | Timeline | Prouver ou suivre | Source, date, acteur | Fausse certification |
| quality | Estimer ou vérifier qualité | Heure, espèce, quai, preuves | Statut qualité | Réserver ou traiter | Critères affichés | Qualité opaque |
| coordination | Transformer signaux en action | Lots, besoins, alertes | Priorités | Mobiliser | Signal -> action | Trop de bruit |
| matching | Relier lots et besoins | Arrivages, besoins | Opportunités | Proposer relation | Critères simples | Surmatching |
| recommendation | Classer les options | Scores, tension, qualité | Recommandations | Agir en premier | Pourquoi recommandé | Boîte noire |
| impact | Mesurer valeur créée | Transactions, volumes, prix | Impact | Financer ou reporter | Méthode visible | Impact exagéré |
| tension | Lire pression territoriale | Offre, demande, transactions | Niveau tension | Prioriser zone | Données comparées | Stigmatisation |
| prioritization | Ordonner urgences | Alertes, qualité, impact | Priorité | Traiter | Critères | Biais caché |
| alerts | Signaler un risque | Incidents, délais, tensions | Alerte | Réagir | Cause de l'alerte | Fatigue alertes |
| role recommendations | Adapter conseil | Rôle, droits, contexte | Action conseillée | Utiliser correctement | Module cible visible | Conseil hors rôle |
| executive intelligence | Synthétiser prudemment | Agrégats et preuves | Synthèse | Décider | Sources et limites | Simplification abusive |

## 10. UX

| Vue | Mission | CTA principal | Précaution |
| --- | --- | --- | --- |
| Fiche acteur | Voir identité, rôle, historique, confiance | Vérifier ou contacter | Ne pas exposer inutilement |
| Badge confiance | Résumer niveau acteur ou organisation | Voir pourquoi | Éviter jugement définitif |
| Détail lot | Lire qualité, source, disponibilité | Réserver ou demander preuve | Montrer limite |
| Timeline lot | Suivre événements | Voir événement | Filtrer selon rôle |
| Statut qualité | Comprendre fraîcheur et risque | Traiter ou qualifier | Estimé vs vérifié |
| Fiche incident | Gérer litige ou anomalie | Résoudre | Protéger parties |
| Fiche transaction | Suivre engagement | Faire avancer | Historiser |
| Historique preuves | Voir sources et documents | Ajouter preuve | Masquer sensible |
| Audit trail | Contrôler actions | Examiner | Accès restreint |
| Vue admin qualité | Piloter validations | Valider ou corriger | Justification obligatoire |
| Vue support litige | Traiter incidents | Clôturer | Garder trace |
| Vue institution agrégée | Lire confiance sans nominatif | Générer rapport | Agrégation stricte |
| Vue acheteur | Décider sur lot et vendeur | Réserver | Afficher preuve utile |
| Vue pêcheur / agent | Déclarer ou corriger | Compléter preuve | UX légère |
| Vue démo confiance | Montrer valeur sans données réelles | Demander démo | Données scénarisées |

### Règles UX

| Sujet | Règle |
| --- | --- |
| Navigation | Depuis lot, acteur, transaction ou incident vers preuve et historique |
| CTA principaux | Qualifier, vérifier, réserver, corriger, résoudre, exporter |
| États vides | Expliquer l'absence de preuve ou qualité et proposer l'action suivante |
| Messages d'erreur | Droit insuffisant, donnée sensible, preuve absente, conflit de statut |
| Badges | Confiance, qualité, preuve, risque, incident, vérification |
| Niveaux d'alerte | Info, attention, critique |
| Visibilité par rôle | L'utilisateur voit ce qui aide sa décision, pas tout le système |
| Surcharge cognitive | Un score doit toujours être accompagné de trois raisons maximum en vue courte |
| Explication score | Formule en langage simple, facteurs, limite, date de mise à jour |

## 11. Modèle économique associé

| Modèle | Client payeur | Valeur achetée | Mécanisme économique | Horizon | Risque |
| --- | --- | --- | --- | --- | --- |
| Premium traceability | Exportateurs, entreprises | Historique lot et preuve | Option premium ou contrat | V1/V2 | Exigences conformité |
| Reporting preuve | Institutions, bailleurs | Indicateurs avec sources | Rapport premium | V1 | Qualité data |
| Audit programme | ONG, programmes publics | Contrôle actions et preuves | Frais de programme | V1/V2 | Responsabilité |
| Data products agrégés | Banques, assurances | Risque et confiance agrégés | Produit data contrôlé | V2 | Régulation |
| Services qualité | Entreprises, coopératives | Qualification des lots | Service d'accompagnement | MVP/V1 | Coût terrain |
| Certification future | Exportateurs, institutions | Preuve renforcée | Service certifiant futur | V2+ | Cadre légal |
| Contrats entreprise | Agroalimentaire, export | Supply plus fiable | Contrat B2B | MVP/V1 | Attente de garantie |
| Partenariats banques | Banques | Historique et fiabilité | Partenariat data/risque | V2 | Données sensibles |
| Partenariats assurances | Assurances | Incidents et prévention | Partenariat risque | V2 | Cadre assurantiel |
| Observatoire qualité/confiance | Institutions | Tendances agrégées | Licence observatoire | V1/V2 | Gouvernance |

## 12. User Stories

| ID | Acteur | Feature | User Story | Critères d'acceptation | Priorité | Horizon |
| --- | --- | --- | --- | --- | --- | --- |
| TTQ-01 | Pêcheur | Identifiant lot | En tant que pêcheur, je veux qu'un lot déclaré reçoive un identifiant afin de le suivre. | Given déclaration, When lot créé, Then ID unique visible. | Must | MVP |
| TTQ-02 | Pêcheur | Correction | En tant que pêcheur, je veux demander correction d'une donnée afin d'éviter une erreur. | Given donnée erronée, When correction demandée, Then statut en revue. | Must | MVP |
| TTQ-03 | Pêcheur | Preuve déclarative | En tant que pêcheur, je veux voir la source de ma déclaration afin de prouver mon activité. | Given lot déclaré, When détail, Then source affichée. | Must | MVP |
| TTQ-04 | Pêcheur | Réputation | En tant que pêcheur, je veux comprendre ma confiance afin de l'améliorer. | Given score, When détail, Then raisons visibles. | Should | V1 |
| TTQ-05 | Acheteur | Qualité lot | En tant qu'acheteur, je veux voir le statut qualité afin de réserver prudemment. | Given lot, When détail, Then qualité et limite visibles. | Must | MVP |
| TTQ-06 | Acheteur | Historique lot | En tant qu'acheteur, je veux voir la timeline afin de comprendre l'origine. | Given lot, When timeline, Then événements autorisés visibles. | Must | MVP |
| TTQ-07 | Acheteur | Confiance vendeur | En tant qu'acheteur, je veux voir un badge confiance vendeur afin de réduire mon risque. | Given vendeur, When opportunité, Then badge et explication. | Should | V1 |
| TTQ-08 | Acheteur | Incident qualité | En tant qu'acheteur, je veux signaler une qualité contestée afin de résoudre. | Given transaction, When incident, Then support notifié. | Should | V1 |
| TTQ-09 | Mareyeur | Réservation fiable | En tant que mareyeur, je veux savoir si un lot est disponible afin d'éviter une réservation inutile. | Given lot réservé, When liste, Then statut visible. | Must | MVP |
| TTQ-10 | Mareyeur | Preuve transaction | En tant que mareyeur, je veux obtenir une trace de transaction afin de suivre mon achat. | Given transaction, When clôturée, Then historique visible. | Should | V1 |
| TTQ-11 | Transformateur | Lot sensible | En tant que transformateur, je veux voir les lots à risque afin de capter un surplus. | Given lots sensibles, When vue, Then priorité affichée. | Should | V1 |
| TTQ-12 | Transformateur | Qualité estimée | En tant que transformateur, je veux distinguer qualité estimée et vérifiée afin de décider. | Given qualité, When badge, Then niveau affiché. | Must | MVP |
| TTQ-13 | Agent terrain | Validation | En tant qu'agent terrain, je veux valider un signal afin de renforcer sa fiabilité. | Given signal, When validation, Then preuve validée créée. | Must | MVP |
| TTQ-14 | Agent terrain | Correction volume | En tant qu'agent terrain, je veux corriger un volume afin d'améliorer la donnée. | Given anomalie, When correction, Then audit créé. | Should | V1 |
| TTQ-15 | Agent terrain | Incident | En tant qu'agent terrain, je veux déclarer un incident afin d'éviter sa répétition. | Given problème, When incident créé, Then gravité renseignée. | Should | V1 |
| TTQ-16 | Admin | Audit trail | En tant qu'admin, je veux voir l'audit trail afin de contrôler les modifications. | Given donnée critique, When historique, Then actions visibles. | Must | MVP |
| TTQ-17 | Admin | Fusion doublon | En tant qu'admin, je veux fusionner un doublon afin de nettoyer les données. | Given doublon, When fusion, Then trace conservée. | Should | V1 |
| TTQ-18 | Admin | Droits preuves | En tant qu'admin, je veux limiter l'accès aux preuves afin de protéger les acteurs. | Given preuve sensible, When rôle non autorisé, Then masquage. | Must | MVP |
| TTQ-19 | Support | Litige | En tant que support, je veux traiter un litige afin de clôturer proprement. | Given incident, When résolution, Then statut clos et motif. | Must | MVP |
| TTQ-20 | Support | Réservation abusive | En tant que support, je veux repérer les réservations abusives afin de protéger les vendeurs. | Given annulations répétées, When analyse, Then alerte visible. | Should | V1 |
| TTQ-21 | Support | Transaction bloquée | En tant que support, je veux voir les transactions non clôturées afin de relancer. | Given statut bloqué, When tableau, Then action relance. | Must | MVP |
| TTQ-22 | Collectivité | Confiance agrégée | En tant que collectivité, je veux voir la fiabilité agrégée afin de piloter localement. | Given territoire, When dashboard, Then agrégats visibles. | Should | V1 |
| TTQ-23 | Collectivité | Incidents territoire | En tant que collectivité, je veux connaître les incidents agrégés afin de prioriser. | Given incidents, When vue, Then aucun nominatif. | Should | V1 |
| TTQ-24 | Institution | Preuves impact | En tant qu'institution, je veux voir le niveau de preuve d'un indicateur afin de décider prudemment. | Given KPI, When détail, Then niveau affiché. | Must | MVP |
| TTQ-25 | Institution | Rapport auditable | En tant qu'institution, je veux un rapport avec sources afin de rendre compte. | Given rapport, When export, Then sources et limites. | Should | V1 |
| TTQ-26 | ONG | Programme | En tant qu'ONG, je veux rattacher les preuves à un programme afin de démontrer l'impact. | Given programme, When preuve ajoutée, Then lien visible. | Should | V1 |
| TTQ-27 | ONG | Données sensibles | En tant qu'ONG, je veux accéder seulement aux données autorisées afin de protéger les bénéficiaires. | Given mandat, When vue, Then données filtrées. | Must | MVP |
| TTQ-28 | Banque | Confiance agrégée | En tant que banque, je veux une lecture agrégée de fiabilité afin de qualifier un risque. | Given mandat, When vue, Then nominatif masqué. | Could | V2 |
| TTQ-29 | Banque | Historique activité | En tant que banque, je veux voir l'historique validé afin de mieux financer. | Given acteur autorisé, When historique, Then preuves visibles. | Could | V2 |
| TTQ-30 | Assurance | Incidents | En tant qu'assurance, je veux voir les incidents agrégés afin de prévenir les risques. | Given données autorisées, When rapport, Then niveaux visibles. | Could | V2 |
| TTQ-31 | Assurance | Qualité | En tant qu'assurance, je veux lire le risque qualité afin d'adapter mon analyse. | Given lots, When synthèse, Then risques agrégés. | Could | V2 |
| TTQ-32 | Exportateur | Traçabilité | En tant qu'exportateur, je veux suivre l'origine d'un lot afin de préparer conformité. | Given lot autorisé, When dossier, Then timeline et preuves. | Should | V1 |
| TTQ-33 | Exportateur | Qualité vérifiée | En tant qu'exportateur, je veux distinguer les lots vérifiés afin de planifier. | Given lots, When filtre, Then qualité vérifiée disponible. | Should | V1 |
| TTQ-34 | Entreprise | Supply fiable | En tant qu'entreprise, je veux des lots avec preuve afin de sécuriser mon approvisionnement. | Given liste, When filtre preuve, Then lots filtrés. | Should | V1 |
| TTQ-35 | Entreprise | Incident fournisseur | En tant qu'entreprise, je veux connaître les incidents autorisés afin de réduire mon risque. | Given contrat, When vue risque, Then données limitées. | Could | V2 |
| TTQ-36 | Investisseur | Défensibilité | En tant qu'investisseur, je veux comprendre la couche confiance afin d'évaluer la défensibilité. | Given démo, When lecture, Then valeur expliquée. | Must | MVP |
| TTQ-37 | Partenaire | Export contrôlé | En tant que partenaire, je veux exporter seulement un périmètre autorisé afin d'intégrer proprement. | Given droit, When export, Then audit créé. | Could | V2 |
| TTQ-38 | Admin data | Qualité donnée | En tant que data manager, je veux repérer les données incohérentes afin de les corriger. | Given anomalie, When tableau, Then revue possible. | Must | MVP |
| TTQ-39 | Admin data | Séparation démo | En tant que data manager, je veux distinguer données démo et réelles afin d'éviter confusion. | Given donnée, When affichée, Then environnement visible. | Must | MVP |
| TTQ-40 | Product | Explicabilité | En tant que PM, je veux que chaque score ait une explication afin d'éviter une boîte noire. | Given score, When détail, Then facteurs et limites. | Must | MVP |
| TTQ-41 | CTO | Gouvernance | En tant que CTO, je veux une règle d'accès claire afin de préparer l'architecture. | Given rôle, When accès, Then règle documentée. | Must | MVP |
| TTQ-42 | UX Designer | États vides | En tant que designer, je veux des états vides explicites afin de guider l'utilisateur. | Given aucune preuve, When vue, Then prochaine action. | Must | MVP |
| TTQ-43 | Développeur | Timeline | En tant que développeur, je veux une logique timeline claire afin de l'implémenter. | Given événement, When créé, Then source, date, preuve. | Must | MVP |
| TTQ-44 | Fondateur | Business value | En tant que fondateur, je veux relier confiance et revenus afin de vendre la plateforme. | Given pack, When lecture, Then modèles listés. | Must | MVP |
| TTQ-45 | Institution | Correction | En tant qu'institution, je veux voir les corrections auditables afin de faire confiance au reporting. | Given correction, When rapport, Then historique accessible. | Should | V1 |

## 13. Tests

| ID | Domaine | Test | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- |
| TQT-01 | Lot | Création identifiant lot | ID unique généré | Must |
| TQT-02 | Lot | Timeline lot | Événements ordonnés visibles | Must |
| TQT-03 | Qualité | Déclaration qualité | Statut qualité déclarée affiché | Must |
| TQT-04 | Qualité | Qualité estimée | Badge estimé et méthode visibles | Must |
| TQT-05 | Qualité | Qualité vérifiée | Source de vérification visible selon droit | Should |
| TQT-06 | Incident | Incident qualité | Incident ouvert et rattaché au lot | Must |
| TQT-07 | Incident | Annulation | Annulation historisée | Must |
| TQT-08 | Incident | Réservation abusive | Alerte si répétition | Should |
| TQT-09 | Score | Score acteur | Facteurs explicatifs visibles | Must |
| TQT-10 | Score | Score lot | Qualité, preuve et statut pris en compte | Must |
| TQT-11 | Preuve | Preuve absente | Message limite et prochaine action | Must |
| TQT-12 | Preuve | Preuve validée | Niveau validé affiché | Must |
| TQT-13 | Accès | Accès acheteur | Données utiles visibles, sensibles masquées | Must |
| TQT-14 | Accès | Accès institution | Données agrégées sans nominatif | Must |
| TQT-15 | Sécurité | Données sensibles masquées | Aucun incident privé public | Must |
| TQT-16 | Audit | Audit trail | Modification critique historisée | Must |
| TQT-17 | Export | Export contrôlé | Justification et audit créés | Should |
| TQT-18 | Correction | Correction donnée | Ancienne et nouvelle valeur traçables | Should |
| TQT-19 | Droit | Droit insuffisant | Accès refusé ou masqué | Must |
| TQT-20 | UX | État vide | Explication et action suivante | Must |
| TQT-21 | UX | Message erreur | Message clair sans jargon | Must |
| TQT-22 | Données | Données démo | Marquage démo visible | Must |
| TQT-23 | Données | Données réelles | Séparation avec démo respectée | Must |
| TQT-24 | Confiance | Impact incident | Score ou statut dégradé prudemment | Should |
| TQT-25 | Gouvernance | Droit de correction | Demande correction enregistrée | Should |
| TQT-26 | Transaction | Transaction non clôturée | Alerte support visible | Must |
| TQT-27 | Qualité | Lot sensible | Priorité ou alerte générée | Should |
| TQT-28 | Preuve | Source et date | Source/date affichées | Must |
| TQT-29 | Institution | Rapport preuve | Sources et limites incluses | Should |
| TQT-30 | Support | Clôture incident | Résolution et motif obligatoires | Must |

## 14. Definition of Done

| Domaine | Condition de readiness |
| --- | --- |
| Produit | La couche confiance relie acteurs, lots, transactions, preuves et décisions |
| Métier | Traçabilité, qualité, incidents et réputation sont cadrés sans surpromesse |
| Confiance | Les scores sont explicables, prudents et non punitifs |
| Traçabilité | Identifiant lot, timeline, source, preuve et statut sont définis |
| Qualité | Statuts qualité, risques et actions recommandées sont clairs |
| Données | Sensibilité, visibilité, correction et audit sont cadrés |
| UX | Badges, détails, états vides, erreurs et vues par rôle sont définis |
| Sécurité | Accès par rôle, mandat, territoire et niveau de preuve |
| Gouvernance | Consentement, minimisation, audit et séparation démo/réel prévus |
| Moteurs métier | trust, traceability, quality et autres moteurs sont reliés |
| Business model | Revenus liés à preuve, qualité, traçabilité et risque sont cadrés |
| Documentation | Fondateur, Product, CTO, UX, développeurs et partenaires peuvent l'utiliser |
| Reprise future en code | Le document guide l'implémentation future sans ambiguïté |

## Synthèse de livraison

| Indicateur | Nombre |
| --- | --- |
| Sections principales | 14 |
| Objets de confiance | 16 |
| Statuts qualité | 7 |
| Types d'incidents | 13 |
| User Stories | 45 |
| Tests fonctionnels | 30 |
