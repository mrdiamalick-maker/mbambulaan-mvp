# 02 — Event Catalog

## 1. Finalité

L'Event Catalog décrit les événements métier qui relient les moteurs de Mbàmbulaan.

Un événement métier représente un fait important qui s'est produit dans le système ou dans l'écosystème et qui peut déclencher une action, une décision, une notification, une mesure ou un changement d'état.

Il ne doit pas être confondu avec :

- une commande ;
- une simple mise à jour technique ;
- un log ;
- une notification ;
- un appel API.

## 2. Principes

Les événements doivent être :

- exprimés au passé ;
- immuables ;
- traçables ;
- rattachés à un objet métier ;
- produits par un moteur propriétaire ;
- consommables par plusieurs moteurs ;
- idempotents ;
- compréhensibles sans dépendre de l'interface utilisateur ;
- suffisamment riches pour soutenir une décision ;
- limités au strict besoin métier.

## 3. Structure standard d'un événement

Chaque événement doit contenir au minimum :

- `event_id` ;
- `event_type` ;
- `occurred_at` ;
- `recorded_at` ;
- `aggregate_type` ;
- `aggregate_id` ;
- `aggregate_version` ;
- `producer` ;
- `actor_id` si applicable ;
- `mandate_id` si applicable ;
- `territory_id` si applicable ;
- `correlation_id` ;
- `causation_id` ;
- `payload` ;
- `sensitivity_level` ;
- `schema_version`.

## 4. Règles de nommage

Format recommandé :

```text
NomObjet + VerbeAuParticipePasse
```

Exemples :

- `SignalementSoumis` ;
- `SituationQualifiee` ;
- `InitiativeValidee` ;
- `EngagementAccepte` ;
- `ActionTerminee`.

Éviter :

- `UpdateSignalement` ;
- `ProcessSituation` ;
- `NotificationEnvoyee` comme événement principal ;
- les noms trop techniques.

## 5. Événements — Identités et organisations

### ActeurCree

**Producteur** : Identités et organisations

**Déclencheur** : création d'un nouvel acteur.

**Consommateurs possibles** : Coordination, Observation, Confiance et gouvernance.

**Effets** : l'acteur peut être rattaché à des organisations, territoires ou mandats.

### ActeurVerifie

**Producteur** : Identités et organisations

**Déclencheur** : validation de l'identité ou du statut d'un acteur.

**Consommateurs** : Confiance et gouvernance, Décision, Investissements.

### OrganisationCreee

**Producteur** : Identités et organisations

**Consommateurs** : Coordination, Initiatives, Investissements.

### OrganisationVerifiee

**Producteur** : Identités et organisations

**Effets** : élargissement éventuel des droits et de la confiance accordée.

### MandatAccorde

**Producteur** : Identités et organisations

**Déclencheur** : un acteur reçoit une autorisation formelle d'agir.

**Consommateurs** : Décision, Coordination, Confiance et gouvernance.

### MandatExpire

**Producteur** : Identités et organisations

**Effets** : retrait des droits associés.

### MandatRevoque

**Producteur** : Identités et organisations

**Effets** : désactivation immédiate du mandat et traçabilité renforcée.

## 6. Événements — Territoires

### TerritoireCree

**Producteur** : Territoires

### TerritoireMisAJour

**Producteur** : Territoires

**Règle** : uniquement pour une modification métier significative.

### RelationTerritorialeAjoutee

**Producteur** : Territoires

**Exemples** : rattachement, chevauchement, dépendance fonctionnelle.

### OrganisationRattacheeAuTerritoire

**Producteur** : Territoires

**Consommateurs** : Coordination, Observation, Initiatives.

## 7. Événements — Observation

### ObservationEnregistree

**Producteur** : Observation

**Déclencheur** : une donnée ou un fait est saisi ou importé.

**Consommateurs** : Qualification, Mesure et impact.

### ObservationValidee

**Producteur** : Observation

**Effets** : l'observation peut être utilisée dans une qualification ou une décision.

### ObservationInvalidee

**Producteur** : Observation

**Effets** : exclusion de certains calculs ou décisions.

### SignalementSoumis

**Producteur** : Observation

**Consommateurs** : Qualification, Coordination, Notification.

**Effets** : accusé de réception, création d'une tâche de qualification.

### SignalementRecu

**Producteur** : Observation

**Effets** : confirmation au contributeur.

### SignalementRattacheASituation

**Producteur** : Qualification

**Effets** : consolidation avec une situation existante.

### SignalementClos

**Producteur** : Observation

**Règle** : la clôture doit être motivée.

## 8. Événements — Qualification

### SituationDetectee

**Producteur** : Qualification

**Déclencheur** : plusieurs éléments indiquent un problème, besoin ou opportunité.

### SituationQualifiee

**Producteur** : Qualification

**Consommateurs** : Décision, Coordination, Initiatives.

**Payload minimal** :

- criticité ;
- urgence ;
- périmètre ;
- niveau de confiance ;
- orientation proposée.

### SituationRequalifiee

**Producteur** : Qualification

**Règle** : conserver l'historique et la justification.

### SituationOrienteVersCoordination

**Producteur** : Qualification

### SituationOrienteVersInitiative

**Producteur** : Qualification

### SituationArchivee

**Producteur** : Qualification

## 9. Événements — Décision

### BesoinPriorise

**Producteur** : Décision

**Consommateurs** : Initiatives, Coordination, Investissements.

### BesoinNonPriorise

**Producteur** : Décision

**Règle** : justification obligatoire.

### PrioriteRevisee

**Producteur** : Décision

### DecisionProposee

**Producteur** : Décision

### DecisionPrise

**Producteur** : Décision

**Consommateurs** : Coordination, Initiatives, Exécution et risques, Notification.

**Payload minimal** :

- objet ;
- décideur ;
- mandat ;
- option retenue ;
- justification ;
- conditions.

### DecisionRevisee

**Producteur** : Décision

**Règle** : ne jamais écraser la décision précédente.

### DecisionAnnulee

**Producteur** : Décision

## 10. Événements — Coordination

### EspaceDeCoordinationCree

**Producteur** : Coordination

### ParticipantAjouteALaCoordination

**Producteur** : Coordination

### EngagementPropose

**Producteur** : Coordination

### EngagementAccepte

**Producteur** : Coordination

**Consommateurs** : Exécution et risques, Notification, Mesure et impact.

### EngagementRefuse

**Producteur** : Coordination

### EngagementMisEnCours

**Producteur** : Coordination

### EngagementTenu

**Producteur** : Coordination

### EngagementPartiellementTenu

**Producteur** : Coordination

### EngagementNonTenu

**Producteur** : Coordination

**Effets** : alerte, revue, risque éventuel.

### SujetDeCoordinationBloque

**Producteur** : Coordination

### BlocageLeve

**Producteur** : Coordination

## 11. Événements — Initiatives

### InitiativeCreee

**Producteur** : Initiatives

### InitiativeSoumisePourValidation

**Producteur** : Initiatives

### InitiativeValidee

**Producteur** : Initiatives

**Consommateurs** : Investissements, Exécution et risques, Mesure et impact.

### InitiativeRejetee

**Producteur** : Initiatives

### InitiativeEntreeEnRechercheDAppui

**Producteur** : Initiatives

### InitiativeFinancee

**Producteur** : Initiatives ou Investissements selon règle d'orchestration.

### InitiativeLancee

**Producteur** : Initiatives

### InitiativeSuspendue

**Producteur** : Initiatives

### InitiativeTerminee

**Producteur** : Initiatives

### InitiativeAbandonnee

**Producteur** : Initiatives

### InitiativeAjouteeAuPortefeuille

**Producteur** : Initiatives

## 12. Événements — Investissements

### BesoinDeFinancementDeclare

**Producteur** : Investissements

### OpportuniteDeFinancementPubliee

**Producteur** : Investissements

### InitiativeDeclareeEligible

**Producteur** : Investissements

### ManifestationDInteretRecue

**Producteur** : Investissements

### EngagementFinancierPropose

**Producteur** : Investissements

### EngagementFinancierConfirme

**Producteur** : Investissements

### DecaissementEnregistre

**Producteur** : Investissements

**Règle** : Mbàmbulaan peut enregistrer un décaissement sans l'exécuter.

### EngagementFinancierAnnule

**Producteur** : Investissements

### BesoinDeFinancementCouvert

**Producteur** : Investissements

## 13. Événements — Exécution et risques

### ActionCreee

**Producteur** : Exécution et risques

### ActionAssignee

**Producteur** : Exécution et risques

### ActionDemarree

**Producteur** : Exécution et risques

### ActionBloquee

**Producteur** : Exécution et risques

### ActionTerminee

**Producteur** : Exécution et risques

### ActionVerifiee

**Producteur** : Exécution et risques

### JalonAtteint

**Producteur** : Exécution et risques

### JalonEnRetard

**Producteur** : Exécution et risques

### RisqueIdentifie

**Producteur** : Exécution et risques

### RisqueReevalue

**Producteur** : Exécution et risques

### RisqueRealise

**Producteur** : Exécution et risques

### RisqueClos

**Producteur** : Exécution et risques

### IncidentDeclare

**Producteur** : Exécution et risques

### IncidentResolue

**Producteur** : Exécution et risques

### IncidentClos

**Producteur** : Exécution et risques

## 14. Événements — Mesure et impact

### IndicateurDefini

**Producteur** : Mesure et impact

### CibleDefinie

**Producteur** : Mesure et impact

### MesureEnregistree

**Producteur** : Mesure et impact

### MesureValidee

**Producteur** : Mesure et impact

### ResultatDeclare

**Producteur** : Mesure et impact

### ResultatValide

**Producteur** : Mesure et impact

### EffetObserve

**Producteur** : Mesure et impact

### ImpactEvalue

**Producteur** : Mesure et impact

### EcartDePerformanceDetecte

**Producteur** : Mesure et impact

**Consommateurs** : Décision, Coordination, Exécution et risques.

## 15. Événements — Connaissance et réplication

### ApprentissageCapture

**Producteur** : Connaissance et réplication

### ApprentissageValide

**Producteur** : Connaissance et réplication

### PratiqueDeclareeReplicable

**Producteur** : Connaissance et réplication

### PratiqueReplicableValidee

**Producteur** : Connaissance et réplication

### ReplicationLancee

**Producteur** : Connaissance et réplication

### ReplicationEvaluee

**Producteur** : Connaissance et réplication

## 16. Événements — Confiance et gouvernance

### PreuveAjoutee

**Producteur** : Confiance et gouvernance ou moteur propriétaire de l'objet.

### ValidationDemandee

**Producteur** : moteur métier concerné.

### ObjetValide

**Producteur** : Confiance et gouvernance.

### ObjetRejete

**Producteur** : Confiance et gouvernance.

### PolitiqueDAccesModifiee

**Producteur** : Confiance et gouvernance.

### ConsentementAccorde

**Producteur** : Confiance et gouvernance.

### ConsentementRetire

**Producteur** : Confiance et gouvernance.

### AccesSensibleAccorde

**Producteur** : Confiance et gouvernance.

### AccesSensibleRefuse

**Producteur** : Confiance et gouvernance.

### SuspicionDeDonneeDetectee

**Producteur** : Confiance et gouvernance.

## 17. Événements transversaux techniques à portée métier

Ces événements ne doivent être utilisés que s'ils ont une conséquence métier visible.

### ImportTermine

### ImportPartiellementEchoue

### SynchronisationExterneEchouee

### DocumentAjoute

### DocumentVersionne

### NotificationEchouee

### TacheAutomatiqueEchouee

Ils doivent rester séparés des événements métier principaux.

## 18. Chaînes d'événements de référence

### 18.1 Signalement vers action

```text
SignalementSoumis
→ SignalementRecu
→ SituationDetectee
→ SituationQualifiee
→ BesoinPriorise
→ EspaceDeCoordinationCree
→ EngagementAccepte
→ ActionCreee
→ ActionTerminee
→ ActionVerifiee
→ SignalementClos
```

### 18.2 Besoin vers initiative financée

```text
SituationQualifiee
→ BesoinPriorise
→ InitiativeCreee
→ InitiativeSoumisePourValidation
→ InitiativeValidee
→ BesoinDeFinancementDeclare
→ ManifestationDInteretRecue
→ EngagementFinancierConfirme
→ InitiativeFinancee
→ InitiativeLancee
```

### 18.3 Exécution vers apprentissage

```text
ActionTerminee
→ JalonAtteint
→ ResultatDeclare
→ ResultatValide
→ ApprentissageCapture
→ ApprentissageValide
→ PratiqueDeclareeReplicable
```

## 19. Règles de consommation

Les consommateurs doivent :

- être idempotents ;
- ne jamais supposer un ordre global ;
- gérer les doublons ;
- journaliser les erreurs ;
- prévoir les reprises ;
- éviter les dépendances synchrones inutiles ;
- ne pas modifier directement l'agrégat source ;
- déclencher une commande explicite lorsqu'une action est requise.

## 20. Gestion des versions

Chaque type d'événement doit disposer d'une version de schéma.

Les changements sont classés :

- compatibles ;
- compatibles avec adaptation ;
- incompatibles.

Une nouvelle version doit être créée lorsque :

- un champ obligatoire est ajouté ;
- le sens d'un champ change ;
- la structure est profondément modifiée ;
- le contrat de confidentialité évolue.

## 21. Confidentialité

Un événement doit embarquer uniquement les données nécessaires.

Il ne doit pas contenir par défaut :

- des données personnelles inutiles ;
- des documents complets ;
- des secrets ;
- des informations financières sensibles non requises ;
- des détails confidentiels destinés à un sous-ensemble d'acteurs.

Les consommateurs doivent vérifier leur droit d'accès à l'objet source.

## 22. Événements prioritaires pour le pilote

Le pilote doit se concentrer sur :

- ActeurCree ;
- OrganisationCreee ;
- MandatAccorde ;
- SignalementSoumis ;
- SignalementRecu ;
- SituationDetectee ;
- SituationQualifiee ;
- BesoinPriorise ;
- EspaceDeCoordinationCree ;
- EngagementPropose ;
- EngagementAccepte ;
- ActionCreee ;
- ActionAssignee ;
- ActionBloquee ;
- ActionTerminee ;
- ActionVerifiee ;
- DecisionPrise ;
- PreuveAjoutee ;
- ObjetValide ;
- SignalementClos.

## 23. Hors périmètre initial

À reporter après preuve d'utilité :

- scoring automatisé ;
- recommandations prédictives ;
- orchestration financière avancée ;
- réplication automatique ;
- événements temps réel sur tous les objets ;
- diffusion externe ouverte ;
- analytics événementiels complexes.

## 24. Gouvernance

Tout nouvel événement doit préciser :

- le fait métier représenté ;
- le producteur propriétaire ;
- les consommateurs ;
- le payload minimal ;
- la sensibilité ;
- la durée de rétention ;
- les effets possibles ;
- le besoin d'idempotence ;
- la version du schéma ;
- les tests de contrat.

## 25. Principe directeur

> Un événement métier de Mbàmbulaan doit rendre visible un fait important pour la coordination, sans créer de dépendance inutile entre les moteurs.
