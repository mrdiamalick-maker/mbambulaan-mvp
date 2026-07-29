# Technical Design — Débarquement, pesée et constitution des lots

## 1. Objectif

Ce document traduit la capability produit « Débarquement, pesée et constitution des lots » en conception de domaine prête à implémenter.

Il ne décrit pas d'écran. Il définit :

- les types métier ;
- les commandes ;
- les événements ;
- les agrégats ;
- les invariants ;
- les services du domaine ;
- les moteurs métier ;
- les tests attendus ;
- les features d'orchestration.

---

## 2. Découpage du domaine

### Agrégats principaux

- `Landing`
- `Weighing`
- `Lot`

### Services du domaine

- `LandingDomainService`
- `WeighingDomainService`
- `LotDomainService`

### Moteurs

- `LandingReconciliationEngine`
- `LotRiskEngine`

### Sélecteurs

- `getLandingByExpectedReturn`
- `getWeighingsByLanding`
- `getActiveLotsByLanding`
- `getLandingWeightBalance`
- `getLotsAtRiskByTerritory`

---

## 3. Types métier

```ts
export type LandingStatus =
  | "confirmed"
  | "cancelled";

export interface Landing {
  id: EntityId;
  expectedReturnId?: EntityId;
  vesselId: EntityId;
  landingSiteId: EntityId;
  territoryId: EntityId;
  landedAt: ISODateTime;
  confirmedByActorId: EntityId;
  status: LandingStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

```ts
export type WeighingMethod =
  | "digital_scale"
  | "mechanical_scale"
  | "estimated";

export type DataConfidenceLevel =
  | "declared"
  | "confirmed"
  | "verified"
  | "disputed";

export interface Weighing {
  id: EntityId;
  landingId: EntityId;
  totalWeightKg: number;
  method: WeighingMethod;
  confidenceLevel: DataConfidenceLevel;
  recordedByActorId: EntityId;
  verifiedByActorId?: EntityId;
  recordedAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

```ts
export type LotStatus =
  | "draft"
  | "available"
  | "partially_reserved"
  | "reserved"
  | "blocked"
  | "sold"
  | "cancelled";

export type LotQualityGrade =
  | "premium"
  | "standard"
  | "processing"
  | "rejected";

export type ConservationStatus =
  | "fresh"
  | "iced"
  | "chilled"
  | "frozen"
  | "at_risk";

export interface Lot {
  id: EntityId;
  landingId: EntityId;
  speciesCode: string;
  weightKg: number;
  reservedWeightKg: number;
  qualityGrade: LotQualityGrade;
  conservationStatus: ConservationStatus;
  status: LotStatus;
  createdByActorId: EntityId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

---

## 4. Extensions de DomainData

```ts
export interface DomainData {
  // existant
  landings: Landing[];
  weighings: Weighing[];
  lots: Lot[];
}
```

Précondition de migration : si ces collections existent déjà, elles doivent être enrichies sans duplication de concept.

---

## 5. Commandes

### ConfirmLandingCommand

```ts
export interface ConfirmLandingCommand {
  landingId: EntityId;
  expectedReturnId?: EntityId;
  vesselId: EntityId;
  landingSiteId: EntityId;
  territoryId: EntityId;
  landedAt: ISODateTime;
  confirmedByActorId: EntityId;
}
```

### CancelLandingCommand

```ts
export interface CancelLandingCommand {
  landingId: EntityId;
  cancelledAt: ISODateTime;
  cancelledByActorId: EntityId;
  reason: string;
}
```

### RegisterWeighingCommand

```ts
export interface RegisterWeighingCommand {
  weighingId: EntityId;
  landingId: EntityId;
  totalWeightKg: number;
  method: WeighingMethod;
  recordedByActorId: EntityId;
  recordedAt: ISODateTime;
}
```

### VerifyWeighingCommand

```ts
export interface VerifyWeighingCommand {
  weighingId: EntityId;
  verifiedByActorId: EntityId;
  verifiedAt: ISODateTime;
}
```

### DisputeWeighingCommand

```ts
export interface DisputeWeighingCommand {
  weighingId: EntityId;
  disputedByActorId: EntityId;
  disputedAt: ISODateTime;
  reason: string;
}
```

### CreateLotCommand

```ts
export interface CreateLotCommand {
  lotId: EntityId;
  landingId: EntityId;
  speciesCode: string;
  weightKg: number;
  qualityGrade: LotQualityGrade;
  conservationStatus: ConservationStatus;
  createdByActorId: EntityId;
  createdAt: ISODateTime;
}
```

### MakeLotAvailableCommand

```ts
export interface MakeLotAvailableCommand {
  lotId: EntityId;
  actorId: EntityId;
  availableAt: ISODateTime;
}
```

### BlockLotCommand

```ts
export interface BlockLotCommand {
  lotId: EntityId;
  actorId: EntityId;
  blockedAt: ISODateTime;
  reason: string;
}
```

---

## 6. Événements métier

```ts
export type LandingDomainEvent =
  | LandingConfirmedEvent
  | LandingCancelledEvent
  | WeighingRecordedEvent
  | WeighingVerifiedEvent
  | WeighingDisputedEvent
  | LotCreatedEvent
  | LotMadeAvailableEvent
  | LotBlockedEvent
  | SignificantLandingVarianceDetectedEvent;
```

Événements minimaux :

- `LandingConfirmed`
- `LandingCancelled`
- `WeighingRecorded`
- `WeighingVerified`
- `WeighingDisputed`
- `LotCreated`
- `LotMadeAvailable`
- `LotBlocked`
- `SignificantLandingVarianceDetected`
- `ServiceNeedsReassessmentRequested`

Chaque événement doit contenir :

- `eventId`
- `occurredAt`
- `actorId` si applicable
- identifiants métier concernés
- données minimales utiles aux consommateurs

---

## 7. Invariants

### Landing

1. L'embarcation doit exister.
2. Le site de débarquement doit exister.
3. Le territoire du site doit être cohérent avec le territoire du débarquement.
4. Un retour prévu annulé ne peut pas produire un débarquement actif.
5. Un retour prévu ne peut pas avoir plusieurs débarquements actifs.
6. Un débarquement annulé ne peut plus recevoir de nouvelle pesée.

### Weighing

1. Le débarquement doit exister et être actif.
2. Le poids doit être strictement positif.
3. Une pesée estimée démarre au niveau `declared`.
4. Une pesée mécanique démarre au niveau `confirmed`.
5. Une pesée digitale peut démarrer à `confirmed`, puis être vérifiée.
6. Une pesée `disputed` ne peut pas servir de référence financière définitive.
7. Une pesée vérifiée ne peut être modifiée sans correction auditée.

### Lot

1. Le débarquement doit disposer d'une pesée de référence exploitable.
2. Le poids du lot doit être strictement positif.
3. La somme des poids des lots actifs ne doit pas dépasser le poids autorisé.
4. `reservedWeightKg` doit être compris entre 0 et `weightKg`.
5. Un lot bloqué ne peut pas devenir disponible.
6. Un lot `sold` ou `cancelled` ne peut plus être réservé.
7. Un lot `rejected` ne peut pas être disponible commercialement.
8. Un lot `at_risk` peut être disponible uniquement selon une politique explicite.

---

## 8. Politique de référence de pesée

Par défaut, la pesée de référence d'un débarquement est :

1. la pesée `verified` la plus récente ;
2. sinon la pesée `confirmed` la plus récente ;
3. sinon la pesée `declared` la plus récente ;
4. une pesée `disputed` ne doit pas être retenue.

```ts
export function selectReferenceWeighing(
  weighings: Weighing[],
): Weighing | undefined;
```

---

## 9. Politique de cohérence des poids

```ts
export interface LandingWeightBalance {
  landingId: EntityId;
  referenceWeightKg: number;
  activeLotsWeightKg: number;
  remainingWeightKg: number;
  isOverAllocated: boolean;
}
```

Règle :

```text
activeLotsWeightKg <= referenceWeightKg + toleranceKg
```

La tolérance doit être explicite et paramétrable. Valeur MVP recommandée : `0` par défaut.

---

## 10. LandingReconciliationEngine

### Entrées

- retour prévu ;
- débarquement ;
- pesée de référence ;
- seuils territoriaux.

### Sortie

```ts
export interface LandingReconciliationDecision {
  landingId: EntityId;
  expectedWeightKg?: number;
  actualWeightKg?: number;
  weightVarianceKg?: number;
  weightVariancePercent?: number;
  expectedArrivalAt?: ISODateTime;
  actualLandingAt: ISODateTime;
  arrivalDelayMinutes?: number;
  significantWeightVariance: boolean;
  significantArrivalDelay: boolean;
  serviceNeedsReassessmentRequired: boolean;
}
```

### Règles MVP

- écart de poids significatif si supérieur au seuil du territoire ;
- retard significatif si supérieur au seuil du territoire ;
- tout écart de poids significatif déclenche une réévaluation des besoins ;
- le moteur ne qualifie jamais automatiquement une fraude.

---

## 11. LotRiskEngine

### Risques détectés

- lot sans glace alors que conservation requise ;
- lot sans capacité de froid ;
- lot sans transport ;
- lot à faible niveau de confiance ;
- lot non affecté après un délai donné ;
- incohérence entre poids de référence et poids des lots.

### Sortie

```ts
export type LotRiskType =
  | "missing_ice"
  | "missing_cold_storage"
  | "missing_transport"
  | "low_confidence_data"
  | "commercial_delay"
  | "weight_inconsistency";

export interface LotRiskAssessment {
  lotId: EntityId;
  territoryId: EntityId;
  risks: LotRiskType[];
  severity: "low" | "medium" | "high" | "critical";
  recommendedAction:
    | "create_service_need"
    | "report_tension"
    | "verify_data"
    | "monitor"
    | "no_action";
}
```

---

## 12. Services du domaine

### LandingDomainService

Méthodes :

```ts
confirmLanding(command: ConfirmLandingCommand): Landing
cancelLanding(command: CancelLandingCommand): Landing
```

### WeighingDomainService

Méthodes :

```ts
registerWeighing(command: RegisterWeighingCommand): Weighing
verifyWeighing(command: VerifyWeighingCommand): Weighing
disputeWeighing(command: DisputeWeighingCommand): Weighing
```

### LotDomainService

Méthodes :

```ts
createLot(command: CreateLotCommand): Lot
makeLotAvailable(command: MakeLotAvailableCommand): Lot
blockLot(command: BlockLotCommand): Lot
```

Les services doivent :

- valider les préconditions ;
- appliquer les invariants ;
- persister dans `DomainData` ;
- produire les événements métier attendus ;
- ne contenir aucune logique d'interface.

---

## 13. Sélecteurs

### getLandingByExpectedReturn

Retourne le débarquement actif associé à un retour prévu.

### getWeighingsByLanding

Retourne les pesées d'un débarquement triées par date décroissante.

### getActiveLotsByLanding

Exclut les lots `cancelled`.

### getLandingWeightBalance

Calcule le poids de référence, le poids alloué et le solde disponible.

### getLotsAtRiskByTerritory

Retourne les lots actifs nécessitant une attention opérationnelle.

---

## 14. Features d'orchestration

À créer après le domaine :

- `confirmLanding.ts`
- `registerWeighing.ts`
- `verifyWeighing.ts`
- `disputeWeighing.ts`
- `createLot.ts`
- `makeLotAvailable.ts`
- `blockLot.ts`
- `reconcileLanding.ts`
- `assessLotRisk.ts`

Features composites :

### confirmLandingAndReconcile

1. confirme le débarquement ;
2. lance la réconciliation si les données nécessaires existent ;
3. déclenche une réévaluation des besoins si nécessaire.

### registerWeighingAndAssess

1. enregistre la pesée ;
2. sélectionne la pesée de référence ;
3. calcule l'écart ;
4. met à jour la coordination territoriale.

### createLotAndAssessRisk

1. crée le lot ;
2. vérifie la cohérence des poids ;
3. évalue les risques ;
4. recommande un besoin de service ou une tension.

---

## 15. Tests du domaine

### Landing

- confirme un débarquement valide ;
- refuse une embarcation inconnue ;
- refuse un site inconnu ;
- refuse un retour prévu annulé ;
- refuse deux débarquements actifs pour le même retour ;
- annule un débarquement actif ;
- refuse une pesée après annulation.

### Weighing

- enregistre une pesée positive ;
- refuse un poids nul ou négatif ;
- applique le bon niveau de confiance selon la méthode ;
- vérifie une pesée ;
- conteste une pesée ;
- exclut une pesée contestée de la référence.

### Lot

- crée un lot valide ;
- refuse un poids supérieur au solde disponible ;
- refuse un lot sans pesée de référence ;
- refuse de rendre disponible un lot bloqué ;
- refuse un lot rejeté ;
- calcule correctement le poids restant ;
- détecte une surallocation.

### Reconciliation Engine

- calcule un écart de poids ;
- calcule un retard ;
- respecte les seuils territoriaux ;
- déclenche la réévaluation des besoins ;
- ne qualifie pas une fraude.

### Lot Risk Engine

- détecte un manque de glace ;
- détecte un manque de froid ;
- détecte un manque de transport ;
- détecte une donnée peu fiable ;
- détecte une incohérence de poids ;
- calcule la bonne sévérité.

---

## 16. Ordre d'implémentation

```text
1. Étendre les types métier
2. Étendre DomainData
3. Ajouter les sélecteurs de référence
4. Implémenter LandingDomainService
5. Implémenter WeighingDomainService
6. Implémenter LotDomainService
7. Ajouter LandingReconciliationEngine
8. Ajouter LotRiskEngine
9. Écrire les tests du domaine
10. Ajouter les wrappers application
11. Ajouter les features composites
12. Brancher le Territory Coordination Plan
```

---

## 17. Décision produit

Statut : `GO sous conditions`

Conditions :

- confirmer les règles réelles de pesée sur le site pilote ;
- confirmer qui est autorisé à constituer un lot ;
- confirmer la signification terrain des grades qualité ;
- confirmer les seuils d'écart jugés opérationnellement significatifs ;
- ne pas intégrer de logique réglementaire avancée avant validation avec les autorités compétentes.

Le périmètre technique proposé reste volontairement limité à la coordination opérationnelle et à la fiabilité de la donnée.
