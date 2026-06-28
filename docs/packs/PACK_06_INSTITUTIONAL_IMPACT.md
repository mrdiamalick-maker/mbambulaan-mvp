# PACK 06 - Institutional & Impact Intelligence

## Statut du document

Ce pack décrit la capability `INSTITUTIONAL & IMPACT INTELLIGENCE` de Mbàmbulaan.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Ce document couvre la capacité de Mbàmbulaan à produire une lecture institutionnelle, stratégique et économique de la filière : impact, priorités, tensions, programmes, reporting, aide à la décision, preuves, indicateurs, gouvernance et valeur pour les institutions, collectivités, ONG, bailleurs, financeurs, banques, assurances, entreprises et partenaires.

Mbàmbulaan n'est pas un dashboard institutionnel générique. Cette capability transforme des signaux terrain, transactions, tensions, alertes et historiques en intelligence décisionnelle utile, monétisable et défendable.

Question centrale : pourquoi une institution, une collectivité, une ONG, un bailleur, un programme public, une banque, une assurance ou un partenaire stratégique paierait durablement Mbàmbulaan ?

Ce document ne crée aucune nouvelle vision produit, ne modifie pas le Product Book, n'ajoute aucun module hors vision stabilisée et ne contient aucune implémentation.

## 1. Vision

Cette capability existe pour donner aux décideurs une lecture fiable de ce qui se passe réellement dans la filière : où les volumes circulent, quels besoins restent critiques, quels quais sont sous tension, quels lots sont valorisés, quelles pertes sont évitées, quels programmes produisent des résultats et quels risques doivent être traités.

Elle n'est pas un simple dashboard car elle ne se limite pas à afficher des indicateurs. Elle transforme des signaux terrain en décisions : prioriser un territoire, financer une action, mobiliser des acteurs, suivre un programme, réduire une perte, sécuriser une transaction, ou démontrer un impact.

| Problème décideur | Effet actuel | Réponse Mbàmbulaan | Valeur créée | Valeur capturable par Mbàmbulaan |
| --- | --- | --- | --- | --- |
| Données dispersées | Décisions lentes ou partielles | Consolidation terrain, besoins, lots, alertes | Vision unifiée | Licence institutionnelle |
| Impact peu prouvé | Difficulté à financer ou justifier | Indicateurs prudents et traçables | Redevabilité | Reporting premium |
| Tensions invisibles | Programmes mal ciblés | Tension par quai, zone, espèce | Priorisation | Observatoire territorial |
| Risques non anticipés | Pertes, incidents, conflits | Alertes, qualité, confiance | Réduction risque | Diagnostic territorial |
| Programmes peu suivis | Résultats difficiles à mesurer | Suivi programme et KPI | Pilotage | Frais de programme |
| Données sensibles exposables | Frein à la collaboration | Agrégation, droits, audit | Confiance | Contrats institutionnels |

### KPIs principaux

| KPI | Définition |
| --- | --- |
| Territoires couverts | Territoires avec données ou programmes suivis |
| Quais actifs | Quais générant signaux récents |
| Volumes suivis | Volumes rattachés à arrivages, transactions ou programmes |
| Lots valorisés | Lots reliés à opportunité, réservation ou transaction |
| Pertes estimées évitées | Volume sensible valorisé ou réorienté |
| Besoins critiques couverts | Besoins urgents ayant reçu action |
| Alertes traitées | Alertes clôturées avec preuve |
| Programmes actifs | Programmes suivis avec indicateurs |
| Acteurs accompagnés | Pêcheurs, acheteurs, organisations ou agents actifs |
| Délai signal -> décision | Temps entre détection et décision |
| Taux de couverture des besoins | Besoins couverts / besoins ouverts |
| Score de confiance moyen | Signal agrégé de fiabilité réseau |
| Transactions suivies | Transactions historisées |
| Valeur économique estimée | Volume valorisé x prix indicatif |
| Rapports générés | Rapports produits par segment ou programme |

## 2. Clients, bénéficiaires et décideurs

| Catégorie | Définition |
| --- | --- |
| Utilisateurs | Personnes qui consultent ou utilisent les vues |
| Bénéficiaires | Acteurs qui profitent indirectement de la coordination |
| Décideurs | Personnes qui arbitrent, financent ou priorisent |
| Financeurs | Acteurs qui paient ou subventionnent |
| Prescripteurs | Acteurs qui recommandent l'adoption |
| Partenaires | Acteurs qui déploient, intègrent ou accompagnent |
| Clients payeurs | Organisations qui contractent avec Mbàmbulaan |

| Acteur | Rôle | Problème principal | Décision à prendre | Indicateur attendu | Valeur perçue | Capacité à payer | Cycle de vente probable | Risque d'adoption | Expérience cible |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ministère ou direction nationale | Pilotage sectoriel | Peu de visibilité consolidée | Arbitrer politiques et programmes | Tensions, impact, volumes | Observatoire national | Élevée | Long | Gouvernance, marchés publics | Vue agrégée nationale |
| Collectivité locale | Action territoriale | Difficulté à prioriser | Où agir localement | Quais actifs, alertes | Décision locale | Moyenne | Moyen | Budget limité | Dashboard collectivité |
| ONG | Appui terrain | Ciblage imparfait | Où intervenir | Zones vulnérables, pertes | Impact mesurable | Moyenne | Moyen | Preuve d'impact | Vue impact |
| Bailleur international | Financement | Impact difficile à vérifier | Financer ou poursuivre | KPI audités, reporting | Redevabilité | Élevée | Long | Exigences compliance | Rapports et observatoire |
| Programme public | Exécution | Suivi opérationnel faible | Ajuster actions | Couverture, alertes | Pilotage programme | Élevée | Moyen à long | Coordination multi-acteurs | Fiche programme |
| Programme alimentaire ou social | Couverture besoins | Approvisionnement local | Couvrir besoins sociaux | Besoins couverts | Sécurité alimentaire | Moyenne | Moyen | Qualité et logistique | Vue programme |
| Banque | Évaluation risque | Peu de preuves d'activité | Financer acteur ou groupe | Historique, confiance | Qualification risque | Moyenne à élevée | Long | Réglementation | Vue risque agrégée |
| Assurance | Prévention et preuve | Risques peu objectivés | Couvrir ou prévenir | Incidents, qualité, historique | Tarification prudente | Moyenne à élevée | Long | Données fiables | Vue risque et preuve |
| Entreprise agroalimentaire | Approvisionnement | Fiabilité irrégulière | Sécuriser volume | Qualité, transactions | Supply fiable | Élevée | Moyen | Attente trop transactionnelle | Vue entreprise |
| Exportateur | Volumes et conformité | Traçabilité incomplète | Planifier export | Lots suivis, preuves | Conformité | Élevée | Moyen | Exigences fortes | Vue traçabilité |
| Partenaire technique | Intégration | Besoin de données propres | Connecter ou déployer | API, qualité data | Interopérabilité | Variable | Moyen | Accès données | Vue intégration limitée |
| Investisseur | Évaluation business | Défensibilité à prouver | Investir ou suivre | Revenus, impact, traction | Potentiel scalable | Élevée | Moyen | Données mock vs réelles | Vue démo investisseur |
| Équipe Mbàmbulaan | Pilotage interne | Priorités multiples | Où concentrer l'effort | Activation, qualité, revenus | Focus opérationnel | Interne | Continu | Dispersion | Cockpit interne |

## 3. Propositions de valeur institutionnelles

| Segment | Problème prioritaire | Promesse Mbàmbulaan | Preuve attendue | Bénéfice métier | Bénéfice économique | Risque à traiter | Offre commerciale possible |
| --- | --- | --- | --- | --- | --- | --- | --- |
| État / ministère | Manque de vue consolidée | Observatoire sectoriel | KPI nationaux, territoires, tensions | Arbitrage public | Meilleur ciblage budgets | Gouvernance data | Licence nationale |
| Collectivités | Priorités locales floues | Dashboard territorial | Quais, alertes, actions | Décision locale | Moins de pertes | Adoption terrain | Abonnement collectivité |
| ONG | Intervention mal ciblée | Lecture vulnérabilités et impact | Zones, pertes, acteurs | Appui ciblé | Meilleur coût/impact | Preuve estimée | Pack programme ONG |
| Bailleurs | Besoin de redevabilité | Reporting auditable | Rapports et preuves | Suivi financement | Justification investissement | Compliance | Reporting premium |
| Programmes publics | Coordination opérationnelle | Suivi action et impact | Fiche programme | Pilotage | Efficacité programme | Multi-acteurs | Frais de programme |
| Banques | Risque mal évalué | Historique et confiance | Activité, transactions | Qualification crédit | Réduction risque | Données sensibles | Data product agrégé |
| Assurances | Risques peu objectivés | Incidents, qualité, preuves | Historique, alertes | Prévention | Tarification prudente | Validité preuve | Partenariat assurance |
| Entreprises | Approvisionnement irrégulier | Intelligence supply locale | Qualité, lots, transactions | Planification | Sécurisation volumes | Attente marketplace | Contrat entreprise |
| Investisseurs | Scalabilité à démontrer | Traction + impact + revenus | KPI business et impact | Décision investissement | Potentiel retour | Données pré-pilote | Data room produit |
| Partenaires techniques | Intégration terrain complexe | Données gouvernées et API future | Qualité, logs, référentiels | Déploiement | Services intégrés | Accès trop large | Contrat intégration |

## 4. Intelligence décisionnelle

| Type | Donnée d'entrée | Traitement | Sortie | Décision associée | Explicabilité | Limite ou précaution |
| --- | --- | --- | --- | --- | --- | --- |
| Territoriale | Quais, zones, acteurs, tensions | Agrégation par territoire | Carte et priorités | Où agir | Sources et niveaux | Pas de carte décorative |
| Impact | Volumes, transactions, pertes | Calcul prudent | Impact estimé ou vérifié | Financer ou reporter | Méthode visible | Séparer estimé/vérifié |
| Économique | Volumes, prix indicatifs | Estimation valeur | Valeur économique | Investir ou prioriser | Calcul simple | Prix non définitifs |
| Risque | Incidents, qualité, retards | Scoring risque | Alertes risque | Prévenir | Facteurs affichés | Pas d'exclusion automatique |
| Confiance | Historique, validations | Score confiance | Niveau confiance | Mobiliser acteur | Raisons visibles | Revue humaine |
| Qualité | Heure, espèce, statut | Score qualité | Lot sensible | Accélérer | Critères affichés | Données parfois déclarées |
| Traçabilité | Événements lot | Timeline | Preuve | Justifier | Historique | Preuve selon source |
| Programme | Objectifs, actions, KPI | Suivi programme | Rapport programme | Ajuster | Périmètre visible | Mandat nécessaire |
| Opérationnelle | Alertes, priorités | File actionnable | Actions | Assigner | Déclencheur visible | Éviter surcharge |
| Prospective | Historique, saisonnalité | Projection prudente | Tendance | Anticiper | Hypothèses visibles | Non prédictif officiel |

## 5. Impact et preuves

| Indicateur | Mesure ou estimation |
| --- | --- |
| Volumes suivis | Somme des arrivages et transactions rattachés |
| Lots valorisés | Lots avec opportunité, réservation ou transaction |
| Pertes évitées | Lots sensibles réorientés ou transactionnés |
| Besoins couverts | Besoins totalement ou partiellement satisfaits |
| Transactions suivies | Transactions avec statut et historique |
| Acteurs accompagnés | Acteurs actifs ou suivis |
| Zones prioritaires | Territoires avec tension ou action |
| Programmes actifs | Programmes avec objectifs et KPI |
| Confiance réseau | Score agrégé des acteurs |
| Qualité des données | Complétude, validation, anomalies |
| Activité terrain | Signaux, validations, alertes |
| Valeur économique générée | Volumes valorisés x prix indicatif |

### Niveaux de preuve

| Niveau | Définition | Usage |
| --- | --- | --- |
| Données déclarées | Saisies par acteur ou agent | Signal initial |
| Données validées | Contrôlées par humain ou règle | Pilotage opérationnel |
| Données estimées | Calcul prudent | Impact ou tendance |
| Données agrégées | Consolidées sans nominatif | Institutionnel |
| Données auditées | Historique et source vérifiables | Reporting sensible |
| Données non disponibles | Information absente ou non autorisée | Limite affichée |

### Règles de prudence

| Règle | Application |
| --- | --- |
| Données mockées | Jamais présentées comme officielles |
| Impact estimé vs vérifié | Mention explicite |
| Sources | Toujours indiquées quand disponibles |
| Limites | Visibles dans rapports et dashboards |
| Données sensibles | Protégées par droits et agrégation |

## 6. Reporting et observatoire

| Rapport | Destinataire | Fréquence | Contenu | Décisions supportées | Format possible | Confidentialité |
| --- | --- | --- | --- | --- | --- | --- |
| Collectivité | Mairie, territoire | Mensuel | Quais, tensions, alertes | Prioriser action | PDF, dashboard | Agrégé local |
| Institutionnel | Ministère, direction | Trimestriel | Volumes, territoires, risques | Politique publique | PDF, dashboard | Agrégé |
| ONG | ONG territoriale | Mensuel/projet | Impact, zones, acteurs | Cibler appui | Rapport programme | Agrégé + mandat |
| Bailleur | Financeur | Trimestriel | KPI, preuves, risques | Financer, poursuivre | PDF, data room | Auditable |
| Programme | Responsable programme | Hebdo/mensuel | Objectifs, actions, couverture | Ajuster | Dashboard, export | Selon mandat |
| Entreprise | Client entreprise | Mensuel | Qualité, transactions, supply | Planifier | Dashboard | Privé |
| Impact | Décideurs | Mensuel/trimestriel | Pertes, volumes, valeur | Arbitrer | Rapport | Agrégé |
| Risque | Banque, assurance | Périodique | Incidents, confiance, historique | Évaluer | Export contrôlé | Sensible |
| Activité | Mbàmbulaan | Hebdo | Usage, activation, support | Piloter | Dashboard interne | Interne |
| Qualité data | Data/Admin | Hebdo | Complétude, doublons | Nettoyer | Dashboard | Interne |

### Observatoires

| Observatoire | Mission |
| --- | --- |
| Territorial | Lire quais, zones, flux, priorités |
| Tensions | Suivre offre, demande, alertes |
| Pertes | Estimer pertes évitées ou risques |
| Besoins | Observer demande critique et couverture |
| Confiance | Suivre fiabilité du réseau |
| Impact | Mesurer valeur économique, sociale et territoriale |

## 7. Programmes et projets

| Type | Objectif | Données suivies | Acteurs concernés | KPIs | Décisions | Reporting | Horizon |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Programme public | Piloter action sectorielle | Territoires, alertes, impact | État, collectivités | Couverture, tensions | Arbitrer | Institutionnel | V1 |
| Projet ONG | Cibler appui | Zones, pertes, acteurs | ONG, terrain | Pertes évitées | Intervenir | ONG | MVP/V1 |
| Projet bailleur | Financer impact | KPI, preuves, risques | Bailleurs, institutions | Impact, audit | Financer | Bailleur | V1 |
| Programme alimentaire | Couvrir besoin social | Besoins, lots, transactions | Collectivité, marchés | Besoins couverts | Approvisionner | Programme | V1 |
| Programme inclusion | Accompagner acteurs | Acteurs, usage, formation | Terrain, ONG | Acteurs actifs | Former | Impact social | V1 |
| Programme réduction pertes | Valoriser lots sensibles | Qualité, surplus, transactions | Quais, transformateurs | Volume sauvé | Réorienter | Impact | MVP/V1 |
| Programme traçabilité | Suivre lots | Lots, preuves, historique | Exportateurs, institutions | Lots suivis | Certifier | Traçabilité | V1/V2 |
| Programme financement | Qualifier activité | Historique, confiance | Banques, coopératives | Acteurs éligibles | Financer | Risque | V2 |
| Programme assurance | Prévenir risque | Incidents, qualité | Assurances, acteurs | Risques | Couvrir | Risque | V2 |
| Pilote entreprise | Sécuriser supply | Besoins, qualité, transactions | Entreprise, acheteurs | Transactions | Planifier | Entreprise | MVP/V1 |

## 8. Modèle économique associé

| Modèle | Client payeur | Valeur achetée | Prix possible à cadrer plus tard | Complexité de vente | Marge potentielle | Risque | Horizon |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Licence institutionnelle | État, agence | Observatoire et reporting | Oui | Élevée | Élevée | Cycle long | V1/V2 |
| Abonnement collectivité | Collectivité | Dashboard local | Oui | Moyenne | Moyenne | Budget | V1 |
| Abonnement ONG / programme | ONG | Suivi impact | Oui | Moyenne | Moyenne | Preuve | MVP/V1 |
| Reporting premium | Bailleur, institution | Rapports avancés | Oui | Moyenne | Élevée | Qualité data | V1 |
| Observatoire sectoriel | État, partenaires | Données agrégées | Oui | Élevée | Élevée | Gouvernance | V1/V2 |
| Accompagnement déploiement | Institutions, ONG | Adoption terrain | Oui | Moyenne | Moyenne | Ressources humaines | MVP/V1 |
| Diagnostic territorial | Collectivité, bailleur | Analyse ponctuelle | Oui | Moyenne | Élevée | Données suffisantes | MVP/V1 |
| API / exports | Partenaire technique | Accès contrôlé | Oui | Élevée | Élevée | Sécurité | V2 |
| Data products agrégés | Banque, assurance | Risque et activité | Oui | Élevée | Élevée | Régulation | V2 |
| Frais de programme | Programme public/ONG | Suivi opérationnel | Oui | Moyenne | Moyenne | Scope creep | V1 |
| Services d'audit | Bailleur, institution | Preuves et contrôle | Oui | Élevée | Moyenne | Responsabilité | V2 |
| Contrats entreprise | Entreprises, exportateurs | Supply intelligence | Oui | Moyenne | Élevée | Attente marketplace | MVP/V1 |
| Financement par bailleurs | Bailleurs | Déploiement impact | Oui | Élevée | Moyenne | Dépendance subvention | MVP/V1 |
| Partenariats banques / assurances | Banques, assurances | Scores et historiques agrégés | Oui | Élevée | Élevée | Données sensibles | V2 |

## 9. Données et gouvernance

| Donnée | Usage institutionnel |
| --- | --- |
| Territoires | Agrégation et couverture |
| Quais | Activité opérationnelle |
| Acteurs | Réseau et accompagnement |
| Organisations | Programmes, entreprises, institutions |
| Arrivages | Volumes suivis |
| Besoins | Demande et couverture |
| Opportunités | Coordination |
| Réservations | Activation économique |
| Transactions | Preuve de valeur |
| Alertes | Risques et actions |
| Incidents | Gouvernance du risque |
| Programmes | Suivi objectifs |
| Décisions | Historique institutionnel |
| Preuves | Audit et reporting |
| Indicateurs d'impact | Arbitrage et financement |
| Scores | Confiance, qualité, priorité |
| Historiques | Traçabilité |
| Exports | Rapports contrôlés |
| Rapports | Livrables décisionnels |

### Visibilité

| Type | Règle |
| --- | --- |
| Données publiques | Scénarisées ou agrégées seulement |
| Données internes | Opérations, qualité, audit |
| Données sensibles | Contacts, transactions, incidents, confiance |
| Données agrégées | Institution, collectivité, observatoire |
| Données auditables | Preuves, décisions, exports |
| Institution | Agrégé selon mandat |
| Collectivité | Territoire autorisé |
| ONG | Programme ou zone autorisée |
| Entreprise | Données privées contractuelles |
| Interdit public | Nominatif, transaction réelle, incident, prix privé |

### Principes

| Principe | Application |
| --- | --- |
| Minimisation | Montrer uniquement le nécessaire |
| Agrégation | Institutionnel par défaut |
| Traçabilité | Sources et historiques |
| Consentement | Quand données personnelles ou sensibles |
| Confidentialité | Masquage selon rôle |
| Contrôle des accès | RBAC, ABAC, territoire |
| Audit | Exports, décisions, accès sensibles |
| Explicabilité | Scores, estimations, alertes expliqués |

## 10. IA et moteurs métier

| Moteur | Utilité institutionnelle | Donnée d'entrée | Sortie attendue | Décision associée | Valeur business | Explicabilité | Risque à éviter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| coordination | Relier signaux à actions | Alertes, besoins, lots | Actions suivies | Piloter | Licence | Signal -> action | Confusion dashboard |
| matching | Mesurer couverture | Arrivages, besoins | Opportunités | Couvrir besoin | Impact | Critères | Surpromesse |
| recommendation | Prioriser | Scores, tension, qualité | Classement | Agir d'abord | Premium | Raisons | Opacité |
| trust | Lire fiabilité | Historiques | Score confiance | Financer, mobiliser | Banques/assurances | Facteurs | Discrimination |
| impact | Mesurer valeur | Volumes, prix, transactions | Impact | Financer | Reporting | Calcul | Faux officiel |
| tension | Identifier risques | Offre, demande, zone | Niveau tension | Intervenir | Observatoire | Offre/demande | Mauvais seuil |
| prioritization | Ordonner décisions | Alertes, impact | Priorités | Décider | Executive | Critères | Biais |
| alerts | Alerter décideur | Incidents, tensions | Alertes | Escalader | Support programme | Cause | Fatigue alertes |
| traceability | Prouver | Événements | Timeline | Auditer | Audit | Historique | Preuve faible |
| quality | Identifier lots sensibles | Heure, statut | Score qualité | Prévenir perte | Impact | Facteurs | Données manquantes |
| role recommendations | Adapter lecture | Rôle, droits | Recos segmentées | Orienter | Adoption | Module cible | Bruit |
| executive intelligence | Synthétiser | Agrégats | Synthèse décideur | Arbitrer | Institutionnel | Sources | Simplification abusive |

## 11. UX

### Vues nécessaires

| Vue | Mission | CTA principal |
| --- | --- | --- |
| Executive dashboard | Synthèse décideur | Voir priorités |
| Vue institutionnelle | Lecture agrégée multi-territoires | Générer rapport |
| Vue collectivité | Lecture locale | Traiter priorité |
| Vue programme | Suivi objectifs | Mettre à jour |
| Vue impact | Impact économique, social, territorial | Voir preuves |
| Vue observatoire | Tensions, pertes, besoins, confiance | Explorer |
| Vue rapport | Construire ou consulter rapport | Exporter |
| Vue risques | Incidents, qualité, confiance | Traiter risque |
| Vue territoires | Carte et zones | Ouvrir territoire |
| Vue partenaires | Programmes, contrats, acteurs | Suivre partenaire |
| Vue audit | Décisions, exports, preuves | Examiner |
| Vue export | Périmètre, format, justification | Exporter |
| Vue démo institutionnelle | Scénario contrôlé | Demander présentation |

### Règles UX

| Sujet | Règle |
| --- | --- |
| Navigation | Courte, par niveau de lecture |
| CTA | Un CTA principal par vue |
| États vides | Expliquer donnée absente et prochaine action |
| Erreurs | Donnée manquante, droit insuffisant, limite de preuve |
| Niveaux de lecture | Public, démo, privé, admin séparés |
| Granularité | Agrégé par défaut pour institution |
| Mobile vs desktop | Desktop pour pilotage, mobile pour consultation légère |
| Surcharge cognitive | KPIs limités, hiérarchie forte |
| Présentation investisseur | Story claire, chiffres prudents, preuves |

### Différences de vues

| Vue | Données |
| --- | --- |
| Publique | Scénarisées ou non sensibles |
| Démo | Mockées et contrôlées |
| Privée | Selon mandat et rôle |
| Admin | Gouvernance, audit, configuration |

## 12. User Stories

| ID | Acteur | Feature | User Story | Critères d'acceptation | Priorité | Horizon |
| --- | --- | --- | --- | --- | --- | --- |
| II-01 | Ministère | Executive dashboard | En tant que ministère, je veux voir une synthèse nationale afin d'arbitrer. | Given données agrégées, When dashboard, Then KPI visibles. | Must | V1 |
| II-02 | Collectivité | Vue locale | En tant que collectivité, je veux voir mes quais afin de décider localement. | Given territoire autorisé, When vue, Then seuls mes quais apparaissent. | Must | MVP |
| II-03 | ONG | Impact | En tant qu'ONG, je veux voir les pertes évitées afin de cibler mon appui. | Given actions suivies, When impact, Then estimation affichée. | Must | V1 |
| II-04 | Bailleur | Reporting | En tant que bailleur, je veux un rapport auditable afin de suivre le financement. | Given programme, When rapport, Then sources et limites visibles. | Should | V1 |
| II-05 | Programme public | Programme | En tant que programme public, je veux suivre mes objectifs afin d'ajuster. | Given objectifs, When vue programme, Then progression visible. | Should | V1 |
| II-06 | Programme social | Besoins couverts | En tant que programme social, je veux voir les besoins couverts afin de mesurer la couverture. | Given besoins liés, When dashboard, Then taux affiché. | Should | V1 |
| II-07 | Banque | Risque | En tant que banque, je veux voir un historique agrégé afin d'évaluer un risque. | Given mandat, When vue risque, Then nominatif masqué. | Could | V2 |
| II-08 | Assurance | Incidents | En tant qu'assurance, je veux voir incidents et qualité afin de prévenir. | Given données autorisées, When vue risque, Then incidents agrégés. | Could | V2 |
| II-09 | Entreprise | Supply intelligence | En tant qu'entreprise, je veux voir les territoires fiables afin de planifier. | Given contrat, When vue entreprise, Then qualité et volumes agrégés. | Should | V1 |
| II-10 | Exportateur | Traçabilité | En tant qu'exportateur, je veux voir lots suivis afin d'évaluer conformité. | Given lots liés, When vue, Then preuves visibles selon droits. | Should | V1 |
| II-11 | Partenaire technique | Export | En tant que partenaire, je veux un export contrôlé afin d'intégrer. | Given droit, When export, Then audit créé. | Could | V2 |
| II-12 | Investisseur | Démo institutionnelle | En tant qu'investisseur, je veux une démo impact afin d'évaluer la défensibilité. | Given démo, When parcours, Then données scénarisées. | Must | MVP |
| II-13 | Équipe Mbàmbulaan | Cockpit | En tant qu'équipe Mbàmbulaan, je veux suivre activation et revenus afin de prioriser. | Given données internes, When cockpit, Then priorités visibles. | Must | MVP |
| II-14 | Collectivité | Tensions | En tant que collectivité, je veux voir les tensions critiques afin d'intervenir. | Given tension critique, When vue, Then alerte et action. | Must | MVP |
| II-15 | Institution | Confidentialité | En tant qu'institution, je veux consulter sans données nominatives afin de respecter la gouvernance. | Given rôle institution, When vue, Then nominatif masqué. | Must | MVP |
| II-16 | ONG | Zones prioritaires | En tant qu'ONG, je veux voir les zones prioritaires afin de planifier une mission. | Given tensions, When observatoire, Then zones classées. | Should | V1 |
| II-17 | Bailleur | Impact vérifié | En tant que bailleur, je veux distinguer impact estimé et vérifié afin d'éviter une fausse preuve. | Given indicateur, When affiché, Then niveau de preuve visible. | Must | MVP |
| II-18 | Ministère | Rapports | En tant que ministère, je veux générer un rapport afin de communiquer. | Given période, When rapport, Then document agrégé prêt. | Should | V1 |
| II-19 | Collectivité | Programme | En tant que collectivité, je veux rattacher une action à un programme afin de suivre. | Given programme, When action liée, Then KPI mis à jour. | Should | V1 |
| II-20 | ONG | Données limitées | En tant qu'ONG, je veux accéder seulement aux données de mon programme afin de protéger les acteurs. | Given mandat, When accès, Then périmètre filtré. | Must | MVP |
| II-21 | Banque | Confiance | En tant que banque, je veux comprendre un score de confiance afin de l'utiliser prudemment. | Given score, When détail, Then facteurs affichés. | Could | V2 |
| II-22 | Assurance | Qualité | En tant qu'assurance, je veux voir les risques qualité afin de prévenir les pertes. | Given qualité, When dashboard, Then niveaux agrégés. | Could | V2 |
| II-23 | Entreprise | Rapport supply | En tant qu'entreprise, je veux recevoir un rapport supply afin de planifier. | Given contrat, When rapport, Then données privées affichées. | Should | V1 |
| II-24 | Investisseur | Business model | En tant qu'investisseur, je veux voir les revenus possibles afin d'évaluer le modèle. | Given vue démo, When section business, Then modèles listés. | Must | MVP |
| II-25 | Admin | Audit | En tant qu'admin, je veux auditer les exports afin de contrôler les données. | Given export, When audit, Then auteur et justification visibles. | Must | MVP |
| II-26 | Institution | Observatoire | En tant qu'institution, je veux lire un observatoire des tensions afin d'anticiper. | Given données agrégées, When observatoire, Then tendances visibles. | Should | V1 |
| II-27 | Collectivité | État vide | En tant que collectivité, je veux comprendre une absence de données afin de savoir quoi faire. | Given aucun signal, When vue, Then message actionnable. | Must | MVP |
| II-28 | Programme | Alerte | En tant que programme, je veux recevoir les alertes liées afin de réagir. | Given alerte programme, When créée, Then notification envoyée. | Should | V1 |
| II-29 | ONG | Export | En tant qu'ONG, je veux exporter mes indicateurs afin de rendre compte. | Given droits, When export, Then fichier et audit. | Should | V1 |
| II-30 | Ministère | Multi-territoires | En tant que ministère, je veux comparer les territoires afin de prioriser les politiques. | Given territoires, When comparaison, Then KPI comparables. | Should | V1 |
| II-31 | Bailleur | Limites | En tant que bailleur, je veux voir les limites méthodologiques afin de juger la preuve. | Given rapport, When lecture, Then limites affichées. | Must | MVP |
| II-32 | Entreprise | Confidentialité | En tant qu'entreprise, je veux protéger mes données d'approvisionnement afin de conserver ma stratégie. | Given vue publique, When consultation, Then rien de privé. | Must | MVP |
| II-33 | Équipe Mbàmbulaan | Monétisation | En tant que fondateur, je veux voir les segments payeurs afin de prioriser la vente. | Given segments, When vue business, Then opportunités classées. | Should | V1 |
| II-34 | Partenaire technique | API future | En tant que partenaire, je veux comprendre le périmètre API afin de préparer l'intégration. | Given doc, When lecture, Then données autorisées listées. | Could | V2 |
| II-35 | Assurance | Audit preuve | En tant qu'assurance, je veux accéder aux preuves autorisées afin de traiter un risque. | Given mandat, When preuve, Then audit et trace visibles. | Could | V2 |
| II-36 | Programme public | Délai signal décision | En tant que programme public, je veux suivre le délai signal-décision afin d'améliorer. | Given actions, When KPI, Then délai calculé. | Should | V1 |
| II-37 | Collectivité | Alertes traitées | En tant que collectivité, je veux voir les alertes traitées afin de mesurer l'effort. | Given alertes closes, When dashboard, Then compteur visible. | Must | MVP |
| II-38 | ONG | Acteurs accompagnés | En tant qu'ONG, je veux voir les acteurs accompagnés afin de mesurer l'inclusion. | Given programme, When impact, Then acteurs agrégés visibles. | Should | V1 |
| II-39 | Institution | Qualité data | En tant qu'institution, je veux connaître la qualité des données afin de décider prudemment. | Given KPI, When détail, Then qualité data affichée. | Should | V1 |
| II-40 | Investisseur | Traction | En tant qu'investisseur, je veux voir traction et usage afin d'évaluer l'adoption. | Given démo, When synthèse, Then KPI usage visibles. | Must | MVP |
| II-41 | Admin | Droits | En tant qu'admin, je veux contrôler les droits par segment afin de protéger les données. | Given rôle, When accès, Then permissions appliquées. | Must | MVP |
| II-42 | Institution | Données manquantes | En tant qu'institution, je veux savoir pourquoi un KPI est absent afin d'éviter une mauvaise lecture. | Given donnée manquante, When KPI, Then explication visible. | Must | MVP |
| II-43 | Bailleur | Historique | En tant que bailleur, je veux consulter l'historique des décisions afin de vérifier. | Given programme, When audit, Then timeline visible. | Should | V1 |
| II-44 | Collectivité | Mobile | En tant qu'élu ou agent, je veux consulter une synthèse mobile afin de suivre rapidement. | Given mobile, When vue, Then synthèse lisible. | Could | V1.5 |
| II-45 | Équipe Mbàmbulaan | Documentation | En tant que PM, je veux une spécification claire afin de reprendre en code. | Given pack, When lecture, Then sections et DoD exploitables. | Must | MVP |

## 13. Tests

| ID | Domaine | Test | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- |
| IT-01 | Accès institutionnel | Ouvrir vue institution | Données agrégées visibles | Must |
| IT-02 | Accès collectivité | Ouvrir territoire autorisé | Données locales visibles | Must |
| IT-03 | Vue agrégée | Masquer nominatif | Aucun nom sensible | Must |
| IT-04 | Confidentialité | Accès hors mandat | Refus ou masquage | Must |
| IT-05 | Données sensibles | Transactions privées | Masquées selon rôle | Must |
| IT-06 | Génération rapport | Rapport collectivité | Rapport créé | Should |
| IT-07 | Export | Export avec justification | Audit créé | Should |
| IT-08 | Impact estimé | Afficher estimation | Badge estimé visible | Must |
| IT-09 | Impact vérifié | Afficher preuve validée | Badge vérifié visible | Should |
| IT-10 | Programme actif | Vue programme | KPI programme visibles | Should |
| IT-11 | Observatoire territorial | Ouvrir observatoire | Tensions agrégées visibles | Should |
| IT-12 | Tension critique | Niveau critique | Alerte et priorité | Must |
| IT-13 | Alertes traitées | Clôture alerte | Compteur mis à jour | Must |
| IT-14 | Droits | Rôle non autorisé | Accès bloqué | Must |
| IT-15 | Audit | Consulter décision | Timeline visible | Must |
| IT-16 | États vides | Aucun programme | Message actionnable | Must |
| IT-17 | Erreurs données manquantes | KPI sans source | Limite affichée | Must |
| IT-18 | Démo institutionnelle | Données démo | Données mock/scénarisées seulement | Must |
| IT-19 | Dashboard executive | Ouvrir synthèse | KPI prioritaires visibles | Must |
| IT-20 | Mobile | Vue synthèse mobile | Lisible | Could |
| IT-21 | Reporting ONG | Rapport ONG | Zones et impact affichés | Should |
| IT-22 | Rapport bailleur | Sources et limites | Affichées | Should |
| IT-23 | Vue risque | Incidents agrégés | Pas de nominatif sans droit | Should |
| IT-24 | Vue entreprise | Données privées | Limitées au contrat | Should |
| IT-25 | Observatoire pertes | Pertes estimées | Méthode visible | Should |
| IT-26 | Score confiance | Explication score | Facteurs visibles | Should |
| IT-27 | Données publiques | Page publique | Aucune vraie donnée privée | Must |
| IT-28 | Qualité data | KPI qualité | Source et niveau visibles | Should |

## 14. Definition of Done

| Domaine | Condition de readiness |
| --- | --- |
| Produit | La capability explique l'intelligence institutionnelle sans devenir dashboard générique |
| Métier | Impact, tensions, preuves, programmes et décisions sont reliés |
| Business model | Les mécanismes de revenu sont cadrés sans prix définitifs |
| UX | Vues décideur, rapports, exports, audit et démo sont définis |
| Données | Sensibilité, agrégation, visibilité et audit sont cadrés |
| Moteurs métier | Coordination, impact, tension, trust, alerts, traceability et executive intelligence sont reliés |
| Sécurité | Accès par rôle, mandat et granularité |
| Gouvernance | Sources, limites, consentement et audit sont prévus |
| Analytics | KPIs institutionnels et business sont définis |
| Impact | Estimé, validé, agrégé et audité distingués |
| Reporting | Types de rapports, destinataires, fréquence et confidentialité définis |
| Partenaires | Institutions, ONG, bailleurs, banques, assurances et entreprises couverts |
| Documentation | Fondateur, Product, CTO, UX et partenaires peuvent l'utiliser |
| Reprise future en code | Le document guide l'implémentation future |

## Synthèse de livraison

| Indicateur | Nombre |
| --- | --- |
| Sections principales | 14 |
| Segments institutionnels | 10 |
| Modèles économiques | 14 |
| User Stories | 45 |
| Tests fonctionnels | 28 |
