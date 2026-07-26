# Mbàmbulaan — Plan de conception des infrastructures numériques

## 1. Finalité

Ce document transforme les huit infrastructures numériques de Mbàmbulaan en un plan de conception produit complet et séquencé.

L'objectif n'est pas d'ajouter une couche documentaire supplémentaire. Il est de définir, pour chaque infrastructure :

- les produits acteurs à construire ;
- les capacités métier à rendre exécutables ;
- les flux de valeur associés ;
- les données propriétaires ;
- les moteurs métier ;
- les interfaces prioritaires ;
- les modèles économiques ;
- l'ordre d'implémentation.

---

## 2. Principe directeur

Mbàmbulaan ne doit pas être construit comme huit applications séparées.

Les huit infrastructures partagent un même socle :

```text
Identité et confiance
        ↓
Visibilité opérationnelle
        ↓
Traçabilité
        ↓
Disponibilité et allocation
        ↓
Coordination des tensions
        ↓
Transaction et règlement
        ↓
Pilotage et preuve de valeur
```

L'interopérabilité traverse toutes les couches.

Chaque infrastructure doit donc être conçue comme une capability transverse, exposée différemment selon les acteurs.

---

## 3. Produits acteurs

### Pêcheur / capitaine

Valeur attendue :

- annoncer un départ et un retour ;
- signaler ses besoins ;
- sécuriser la prise en charge du débarquement ;
- suivre ses lots ;
- accéder à des débouchés ;
- suivre les engagements et paiements.

### Organisation de pêcheurs

Valeur attendue :

- suivre les embarcations ;
- centraliser les retours ;
- organiser les services ;
- consolider les volumes ;
- mesurer les pertes évitées et revenus créés ;
- accéder à des offres de financement ou d'assurance.

### Gestionnaire de site

Valeur attendue :

- anticiper les arrivées ;
- gérer les capacités du site ;
- sécuriser pesées et lots ;
- détecter les tensions ;
- arbitrer les priorités ;
- produire une preuve d'activité.

### Opérateur de service

Valeur attendue :

- publier ses capacités ;
- recevoir des besoins qualifiés ;
- réserver des créneaux ;
- exécuter les services ;
- prouver l'exécution ;
- être payé ;
- bâtir une réputation.

### Acheteur / mareyeur / transformateur

Valeur attendue :

- consulter des lots disponibles ;
- exprimer un besoin marché ;
- vérifier origine, qualité et disponibilité ;
- réserver ;
- coordonner transport et froid ;
- sécuriser paiement et livraison.

### Coordinateur territorial

Valeur attendue :

- disposer d'un plan de coordination ;
- prioriser les besoins ;
- mobiliser les capacités ;
- gérer les tensions et engagements ;
- suivre les résultats ;
- escalader les blocages.

### Institution publique

Valeur attendue :

- piloter l'activité par territoire ;
- suivre les tensions structurantes ;
- mesurer l'impact ;
- disposer de données fiables et agrégées ;
- cibler les investissements ;
- évaluer les dispositifs publics.

---

## 4. Infrastructure 1 — Identité, rôles et confiance

### Produit cible

Un registre opérationnel des acteurs, organisations, affiliations, rôles, habilitations et preuves de fiabilité.

### Capacités exécutables à construire

- enregistrer un acteur ;
- enregistrer une organisation ;
- rattacher un acteur à une organisation ;
- attribuer un rôle ;
- attribuer une habilitation ;
- suspendre ou réactiver ;
- enregistrer une preuve ;
- calculer un historique de fiabilité ;
- afficher le niveau de confiance opérationnel.

### Données propriétaires

- Actor
- Organization
- Affiliation
- RoleAssignment
- Authorization
- Evidence
- TrustProfile

### Moteurs métier

- Authorization Engine
- Trust Engine

### Interfaces prioritaires

- profil acteur ;
- profil organisation ;
- gestion des rôles et habilitations ;
- historique de fiabilité ;
- contrôle des actions sensibles.

### Modèle économique

- gratuit pour les acteurs individuels ;
- inclus dans les abonnements organisationnels ;
- services premium de certification ;
- valeur institutionnelle pour l'identification et la fiabilité.

### Priorité

Fondation transverse. À construire avant toute transaction sensible.

---

## 5. Infrastructure 2 — Visibilité opérationnelle

### Produit cible

Une vision partagée des départs, retours, arrivées, volumes estimés, besoins et contraintes.

### Capacités exécutables à construire

- enregistrer une campagne ;
- enregistrer un départ ;
- annoncer un retour ;
- mettre à jour l'heure estimée ;
- estimer les captures ;
- déclarer les besoins anticipés ;
- confirmer l'arrivée ;
- détecter la saturation ;
- produire une vue par site et territoire.

### Données propriétaires

- FishingTrip
- Departure
- ExpectedReturn
- CatchEstimate
- ServiceNeed
- LandingSiteOperationalState

### Moteurs métier

- Forecast Engine
- Saturation Risk Engine
- Coordination Engine

### Interfaces prioritaires

- espace capitaine ;
- tableau des retours attendus ;
- fiche retour ;
- agenda opérationnel du site ;
- vue territoriale.

### Modèle économique

- usage gratuit ou subventionné côté pêcheur ;
- abonnement site ou organisation ;
- licence institutionnelle de visibilité territoriale.

### Priorité

Déjà partiellement exécutée. À compléter avec campagnes, départs et saturation.

---

## 6. Infrastructure 3 — Traçabilité

### Produit cible

Une référence partagée sur les débarquements, pesées, lots, qualités, transformations et preuves.

### Capacités exécutables à construire

- confirmer un débarquement ;
- enregistrer une pesée ;
- sélectionner une pesée de référence ;
- vérifier ou contester ;
- constituer un lot ;
- fractionner ou fusionner ;
- qualifier qualité et conservation ;
- bloquer ou libérer ;
- enregistrer une transformation ;
- produire un historique complet.

### Données propriétaires

- Landing
- Weighing
- Lot
- LotSplit
- LotMerge
- QualityAssessment
- ConservationEvent
- TransformationEvent
- TraceabilityRecord

### Moteurs métier

- Reconciliation Engine
- Lot Risk Engine
- Traceability Engine

### Interfaces prioritaires

- fiche débarquement ;
- enregistrement de pesée ;
- constitution de lot ;
- fiche lot ;
- historique de traçabilité ;
- gestion des blocages.

### Modèle économique

- inclus dans les offres site ;
- service premium pour acheteurs ;
- service institutionnel ou conformité ;
- preuve valorisable dans les transactions.

### Priorité

Déjà partiellement exécutée. À compléter par vérification, contestation, blocage et historique.

---

## 7. Infrastructure 4 — Disponibilité et allocation

### Produit cible

Un moteur de rapprochement et d'allocation entre besoins, lots et capacités.

### Capacités exécutables à construire

- publier une capacité ;
- publier un lot disponible ;
- exprimer un besoin marché ;
- rechercher des correspondances ;
- recommander une allocation ;
- réserver ;
- fractionner ;
- expirer ;
- annuler ;
- réallouer ;
- prioriser les lots à risque.

### Données propriétaires

- Capacity
- ServiceNeed
- MarketNeed
- ServiceAllocation
- CommercialReservation
- MatchingProposal

### Moteurs métier

- Matching Engine
- Allocation Engine
- Priority Engine

### Interfaces prioritaires

- catalogue des capacités ;
- besoins de service ;
- besoins marché ;
- recommandations de matching ;
- écran de réservation ;
- suivi des allocations.

### Modèle économique

- frais de coordination ;
- commission de réservation ;
- abonnement opérateur ;
- visibilité premium ;
- gestion institutionnelle des pénuries.

### Priorité

Déjà partiellement exécutée côté services. À étendre aux lots et besoins marché.

---

## 8. Infrastructure 5 — Tensions et engagements

### Produit cible

Un système de transformation des problèmes opérationnels en responsabilités, engagements, délais et résultats mesurés.

### Capacités exécutables à construire

- signaler une tension ;
- qualifier gravité et type ;
- assigner un responsable ;
- créer un engagement ;
- accepter ou refuser ;
- suivre l'avancement ;
- détecter un retard ;
- escalader ;
- résoudre ;
- enregistrer une preuve ;
- mesurer la valeur créée.

### Données propriétaires

- Tension
- Commitment
- Escalation
- Resolution
- Outcome
- Evidence

### Moteurs métier

- Risk Engine
- Escalation Engine
- Outcome Engine

### Interfaces prioritaires

- file des tensions ;
- fiche tension ;
- gestion des engagements ;
- vue des retards ;
- clôture avec preuve ;
- tableau de valeur créée.

### Modèle économique

- abonnement organisationnel ;
- licence institutionnelle ;
- frais de coordination ;
- différenciation cœur de produit.

### Priorité

Déjà partiellement exécutée. À compléter par affectation, escalade et preuve de résolution.

---

## 9. Infrastructure 6 — Transaction et règlement

### Produit cible

Un cadre sécurisé pour formaliser accords, commandes, exécutions, paiements, commissions et litiges.

### Capacités exécutables à construire

- émettre une offre ;
- négocier une condition commerciale ;
- confirmer un accord ;
- créer une commande ;
- réserver un lot ou un service ;
- confirmer la livraison ;
- confirmer l'exécution ;
- initier un paiement ;
- enregistrer un règlement ;
- calculer la commission ;
- gérer un remboursement ;
- ouvrir et résoudre un litige.

### Données propriétaires

- Offer
- CommercialAgreement
- Order
- Delivery
- PaymentInstruction
- Payment
- Commission
- Refund
- Dispute

### Moteurs métier

- Pricing & Revenue Engine
- Settlement Engine
- Dispute Engine

### Interfaces prioritaires

- offre commerciale ;
- commande ;
- suivi de livraison ;
- statut de paiement ;
- commissions ;
- gestion des litiges.

### Modèle économique

- commission transactionnelle ;
- frais de service ;
- abonnement premium ;
- services de sécurisation et de réconciliation.

### Priorité

Phase suivante après stabilisation de la traçabilité et de l'allocation.

---

## 10. Infrastructure 7 — Pilotage sectoriel et preuve de valeur

### Produit cible

Un système de pilotage territorial et institutionnel fondé sur des données fiables, des indicateurs et des résultats démontrables.

### Capacités exécutables à construire

- consolider l'activité ;
- produire des indicateurs territoriaux ;
- mesurer les pertes évitées ;
- mesurer les capacités mobilisées ;
- suivre les délais de résolution ;
- analyser les tensions récurrentes ;
- produire des rapports ;
- comparer les territoires ;
- tracer l'impact d'un programme public ;
- exporter des données agrégées.

### Données propriétaires

- Outcome
- KPI Definition
- Metric
- TerritorialSnapshot
- ImpactReport
- ProgramEvaluation

### Moteurs métier

- Outcome Engine
- KPI Engine
- Forecast & Planning Engine

### Interfaces prioritaires

- cockpit territorial ;
- cockpit institutionnel ;
- rapport d'impact ;
- carte des tensions ;
- analyse des capacités ;
- suivi de programme.

### Modèle économique

- licence institutionnelle ;
- abonnement multi-sites ;
- rapports premium ;
- services d'aide à la décision ;
- contrats de programme.

### Priorité

À construire progressivement dès maintenant autour des données existantes.

---

## 11. Infrastructure 8 — Intégration et interopérabilité

### Produit cible

Une couche d'échange sécurisée permettant à Mbàmbulaan de se connecter aux systèmes, partenaires et canaux existants.

### Capacités exécutables à construire

- exposer des API métier ;
- gérer les identifiants externes ;
- importer des référentiels ;
- recevoir des événements externes ;
- publier des événements ;
- connecter SMS, WhatsApp ou USSD ;
- intégrer des moyens de paiement ;
- intégrer des capteurs ou balances ;
- synchroniser avec des systèmes institutionnels ;
- journaliser les échanges.

### Données propriétaires

- ExternalIdentifier
- IntegrationEndpoint
- IntegrationEvent
- MappingRule
- ImportBatch
- ExportBatch
- WebhookSubscription
- SyncLog

### Moteurs métier

- Mapping Engine
- Synchronization Engine
- Data Quality Engine

### Interfaces prioritaires

- console d'intégration ;
- gestion des référentiels externes ;
- suivi des imports ;
- journal des synchronisations ;
- configuration des canaux.

### Modèle économique

- frais d'intégration ;
- licence API ;
- connecteurs premium ;
- contrats institutionnels ;
- partenariats technologiques.

### Priorité

Fondation progressive. Les API métier doivent accompagner chaque nouveau flux.

---

## 12. Matrice acteurs × infrastructures

| Acteur | Identité | Visibilité | Traçabilité | Allocation | Tensions | Transaction | Pilotage | Intégration |
|---|---|---|---|---|---|---|---|---|
| Pêcheur / capitaine | Essentiel | Essentiel | Consultation | Indirect | Signalement | Essentiel | Limité | SMS / mobile |
| Organisation de pêcheurs | Essentiel | Essentiel | Essentiel | Essentiel | Essentiel | Essentiel | Essentiel | Import / export |
| Gestionnaire de site | Essentiel | Essentiel | Essentiel | Essentiel | Essentiel | Partiel | Essentiel | Équipements / API |
| Opérateur de service | Essentiel | Consultation | Preuve | Essentiel | Essentiel | Essentiel | Performance | API / mobile |
| Acheteur / transformateur | Essentiel | Consultation | Essentiel | Essentiel | Partiel | Essentiel | Analyse | API |
| Coordinateur territorial | Essentiel | Essentiel | Consultation | Essentiel | Essentiel | Supervision | Essentiel | API |
| Institution publique | Gouvernance | Agrégé | Agrégé | Agrégé | Supervision | Agrégé | Essentiel | SI institutionnel |

---

## 13. Ordre de conception et d'implémentation

### Vague 1 — Compléter le noyau opérationnel

- identité minimale et habilitations ;
- retours, débarquements, pesées et lots ;
- besoins, capacités et allocations ;
- tensions, engagements et résultats ;
- cockpit territorial initial.

### Vague 2 — Produits acteurs complets

- espace capitaine ;
- espace gestionnaire de site ;
- espace opérateur de service ;
- espace coordinateur territorial ;
- espace acheteur / transformateur.

### Vague 3 — Transaction et monétisation

- accords commerciaux ;
- commandes ;
- livraison ;
- paiement ;
- commission ;
- litiges.

### Vague 4 — Institution et échelle

- cockpit institutionnel ;
- rapports d'impact ;
- intégrations ;
- API partenaires ;
- référentiels externes ;
- extension multi-territoires.

---

## 14. Règle d'avancement

À partir de ce document, chaque infrastructure doit avancer selon le même cycle :

```text
Produit acteur
    ↓
Flux de valeur
    ↓
Capability Blueprint
    ↓
Modèle de domaine
    ↓
Moteur métier
    ↓
Feature exécutable
    ↓
Interface opérationnelle
    ↓
Mesure de valeur
    ↓
Monétisation testable
```

Une infrastructure n'est pas considérée comme avancée si elle existe seulement dans la documentation ou seulement dans le code du domaine.

Elle doit produire une valeur observable pour au moins un acteur et permettre de tester un modèle économique.
