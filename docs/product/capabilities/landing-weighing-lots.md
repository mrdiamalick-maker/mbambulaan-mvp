# Capability — Débarquement, pesée et constitution des lots

## 1. Rôle dans le produit

Cette capability transforme un retour de pêche annoncé en information opérationnelle fiable, exploitable par les acteurs de terrain, les acheteurs, les prestataires, les coordinateurs territoriaux et les institutions.

Elle constitue le pont entre :

- la coordination des retours ;
- la coordination des services ;
- la commercialisation ;
- la logistique ;
- la qualité et la traçabilité ;
- la mesure de valeur.

Elle ne doit pas être conçue comme un simple formulaire de saisie. Sa fonction produit est de créer une vérité partagée sur ce qui a réellement été débarqué, pesé, qualifié et rendu disponible.

---

## 2. Problèmes de coordination résolus

- Les volumes réels sont connus tardivement ou de manière fragmentée.
- Plusieurs acteurs peuvent disposer de chiffres différents pour une même opération.
- La pesée peut être mesurée, estimée ou contestée.
- Les lots sont parfois constitués sans règles explicites ni traçabilité suffisante.
- Les besoins en froid, transport, manutention ou débouchés ne sont pas recalculés à partir du réel.
- Les décideurs territoriaux ne voient pas rapidement les écarts entre prévision et réalité.

---

## 3. Acteurs

### Utilisateurs directs

- capitaine ou pêcheur responsable ;
- agent de site de débarquement ;
- peseur ;
- responsable de quai ;
- coordinateur territorial ;
- transformateur ou mareyeur autorisé à qualifier un lot.

### Bénéficiaires

- organisations de pêcheurs ;
- acheteurs ;
- transporteurs ;
- opérateurs de froid ;
- transformateurs ;
- autorités publiques ;
- Mbàmbulaan, par la création d'une donnée fiable et monétisable.

### Décideurs

- agent habilité à confirmer le débarquement ;
- peseur ou vérificateur habilité ;
- acteur habilité à constituer ou corriger les lots ;
- coordinateur territorial en cas d'écart ou de contestation.

---

## 4. Flux de valeur principal

```text
Retour prévu
    ↓
Arrivée confirmée
    ↓
Débarquement confirmé
    ↓
Pesée enregistrée
    ↓
Écart prévision / réel calculé
    ↓
Lots constitués
    ↓
Qualité et conservation qualifiées
    ↓
Disponibilité commerciale et opérationnelle
    ↓
Besoins et risques recalculés
```

---

## 5. Sous-capabilities

### 5.1 Confirmer le débarquement

Objectif : établir que l'embarcation a effectivement débarqué sur un site donné à un instant donné.

Commandes :

- confirmer un débarquement ;
- corriger un débarquement avant verrouillage ;
- annuler un débarquement erroné.

Événements métier :

- `LandingConfirmed` ;
- `LandingCorrected` ;
- `LandingCancelled`.

Règles :

- un débarquement confirmé doit référencer une embarcation existante ;
- le site doit être opérationnel ou explicitement autorisé malgré une contrainte ;
- un retour prévu déjà annulé ne peut pas être confirmé comme débarqué ;
- un même retour prévu ne peut pas produire plusieurs débarquements actifs sans motif explicite ;
- l'acteur qui confirme doit être habilité pour le site ou le territoire.

### 5.2 Enregistrer la pesée

Objectif : produire une mesure du volume débarqué et qualifier sa fiabilité.

Commandes :

- enregistrer une pesée ;
- vérifier une pesée ;
- contester une pesée ;
- corriger une pesée avant clôture.

Événements métier :

- `WeighingRecorded` ;
- `WeighingVerified` ;
- `WeighingContested` ;
- `WeighingCorrected`.

Règles :

- une pesée doit être rattachée à un débarquement confirmé ;
- le poids total doit être strictement positif ;
- une méthode estimée ne peut pas être qualifiée comme vérifiée sans preuve complémentaire ;
- une pesée contestée ne doit pas alimenter automatiquement des engagements financiers définitifs ;
- l'historique des corrections doit être conservé.

### 5.3 Analyser l'écart entre prévision et réel

Objectif : détecter rapidement les écarts significatifs entre capture estimée et volume réellement débarqué.

Commandes :

- calculer l'écart ;
- qualifier l'écart ;
- déclencher une réévaluation des besoins.

Événements métier :

- `LandingVarianceCalculated` ;
- `SignificantVarianceDetected` ;
- `ServiceNeedsReassessmentRequested`.

Règles :

- le calcul doit être reproductible à partir de données historisées ;
- le seuil d'écart significatif doit être paramétrable par territoire ;
- un écart important doit pouvoir déclencher une nouvelle analyse des capacités ;
- l'écart ne doit pas être interprété comme fraude sans validation humaine.

### 5.4 Constituer les lots

Objectif : découper le volume débarqué en unités opérationnelles cohérentes et traçables.

Commandes :

- créer un lot ;
- fractionner un lot ;
- fusionner des lots compatibles ;
- corriger un lot ;
- rendre un lot indisponible.

Événements métier :

- `LotCreated` ;
- `LotSplit` ;
- `LotsMerged` ;
- `LotCorrected` ;
- `LotMadeUnavailable`.

Règles :

- la somme des poids des lots actifs ne doit pas dépasser le poids de référence autorisé ;
- un lot doit appartenir à un seul débarquement ;
- un lot doit porter une espèce, un poids, un grade qualité et un état de conservation ;
- seuls des lots compatibles peuvent être fusionnés ;
- un lot vendu, bloqué ou déjà engagé ne peut pas être modifié librement ;
- toute réduction de poids doit être justifiée par une perte, une correction ou une transformation.

### 5.5 Qualifier qualité et conservation

Objectif : rendre visible la capacité du lot à être vendu, stocké, transporté ou transformé.

Commandes :

- attribuer un grade qualité ;
- qualifier l'état de conservation ;
- déclarer un lot à risque ;
- bloquer ou libérer un lot.

Événements métier :

- `LotQualityGraded` ;
- `ConservationStatusUpdated` ;
- `LotAtRiskDeclared` ;
- `LotBlocked` ;
- `LotReleased`.

Règles :

- toute qualification doit être attribuée par un acteur habilité ;
- un lot à risque ne doit pas être proposé comme disponible sans avertissement ;
- le blocage sanitaire ou qualité doit primer sur la disponibilité commerciale ;
- la libération d'un lot bloqué doit être justifiée et auditée.

### 5.6 Publier la disponibilité opérationnelle

Objectif : rendre le lot exploitable par les capacités commerciales, logistiques et de conservation.

Commandes :

- rendre un lot disponible ;
- réserver partiellement un lot ;
- réserver totalement un lot ;
- clôturer sa disponibilité.

Événements métier :

- `LotMadeAvailable` ;
- `LotPartiallyReserved` ;
- `LotReserved` ;
- `LotAvailabilityClosed`.

Règles :

- un lot indisponible, bloqué ou vendu ne peut pas être proposé ;
- les quantités réservées ne doivent pas dépasser le poids disponible ;
- toute réservation doit être traçable ;
- la disponibilité doit être recalculée après chaque engagement.

---

## 6. Agrégats du domaine

### Landing

Responsabilité : garantir la cohérence de l'arrivée et du débarquement.

Frontière :

- embarcation ;
- site ;
- date et heure ;
- retour prévu éventuel ;
- statut ;
- acteur confirmateur.

### Weighing

Responsabilité : garantir la cohérence de la mesure et de son niveau de confiance.

Frontière :

- débarquement ;
- poids total ;
- méthode ;
- niveau de confiance ;
- vérificateur ;
- éventuelle contestation.

### Lot

Responsabilité : garantir la cohérence d'une unité de produit exploitable.

Frontière :

- origine ;
- espèce ;
- poids ;
- qualité ;
- conservation ;
- disponibilité ;
- réservations ;
- blocages.

---

## 7. Politiques métier

### Politique de fiabilité de la pesée

```text
Pesée digitale vérifiée
    → confiance verified

Pesée mécanique confirmée
    → confiance confirmed

Pesée estimée non vérifiée
    → confiance declared
```

### Politique de cohérence des poids

```text
Poids des lots actifs
    ≤
Poids de référence du débarquement
```

Une marge de tolérance peut être paramétrée pour les écarts techniques, pertes d'eau, déchets ou erreurs de mesure.

### Politique de recalcul opérationnel

Un écart significatif entre prévision et pesée réelle doit déclencher :

- une réévaluation des besoins de glace ;
- une réévaluation du stockage ;
- une réévaluation du transport ;
- une réévaluation du risque d'invendu ;
- une mise à jour du plan territorial.

### Politique de disponibilité

Un lot ne peut être `available` que si :

- son poids est positif ;
- son origine est connue ;
- il n'est pas bloqué ;
- son état de conservation est compatible avec l'usage visé ;
- il n'est pas totalement réservé ou vendu.

---

## 8. Moteurs métier concernés

### Landing Reconciliation Engine

Compare le retour prévu, le débarquement réel et la pesée.

Résultats :

- écart de temps ;
- écart de volume ;
- besoin de vérification ;
- demande de réévaluation des services.

### Lot Formation Engine

Assiste la constitution des lots à partir :

- du poids réel ;
- des espèces ;
- de la qualité ;
- des contraintes de conservation ;
- des besoins marché connus.

Le moteur recommande ; l'acteur habilité décide.

### Lot Risk Engine

Détecte :

- les lots non glacés ;
- les lots sans capacité de froid ;
- les lots sans transport ;
- les lots sans débouché ;
- les incohérences de poids ;
- les données à faible confiance.

---

## 9. Parcours acteurs prioritaires

### Parcours agent de débarquement

1. Voir les retours attendus sur le site.
2. Sélectionner l'embarcation arrivée.
3. Confirmer le débarquement.
4. Enregistrer ou appeler la pesée.
5. Vérifier les écarts.
6. Constituer ou valider les lots.
7. Déclarer les besoins ou incidents complémentaires.

### Parcours peseur

1. Identifier le débarquement.
2. Enregistrer la mesure et la méthode.
3. Joindre une preuve si disponible.
4. Confirmer ou soumettre à vérification.
5. Corriger uniquement selon les règles autorisées.

### Parcours coordinateur territorial

1. Voir les débarquements en attente ou incomplets.
2. Voir les écarts significatifs.
3. Voir les lots à risque.
4. Déclencher une coordination de service.
5. Affecter un acteur responsable.
6. Suivre la résolution et la valeur sauvée.

---

## 10. Indicateurs de valeur

- taux de débarquements confirmés dans les délais ;
- taux de pesées vérifiées ;
- délai moyen entre arrivée et pesée ;
- part des volumes constitués en lots traçables ;
- écart moyen prévision / réel ;
- nombre de réallocations déclenchées grâce à la donnée réelle ;
- kilogrammes à risque détectés ;
- kilogrammes de pertes évitées ;
- délai moyen entre pesée et disponibilité commerciale ;
- taux de lots avec données complètes.

---

## 11. Valeur économique et monétisation

### Valeur pour les acteurs

- réduction des litiges ;
- accès plus rapide aux services ;
- meilleure visibilité sur les volumes ;
- commercialisation plus rapide ;
- meilleure traçabilité.

### Valeur pour les institutions

- visibilité sur les volumes débarqués ;
- qualité de la donnée territoriale ;
- détection des points de saturation ;
- capacité à mesurer les pertes et besoins d'investissement.

### Valeur capturable par Mbàmbulaan

- abonnement institutionnel pour le pilotage ;
- frais de coordination sur services activés ;
- services de traçabilité ou de preuve ;
- accès professionnel aux données agrégées ;
- commissions futures sur transactions ou services, uniquement après preuve d'utilité.

Cette capability ne doit pas être monétisée seule au départ. Elle renforce la valeur des flux de coordination, de commercialisation et de traçabilité.

---

## 12. Périmètre MVP

À construire maintenant :

- confirmation du débarquement ;
- enregistrement d'une pesée ;
- niveau de confiance ;
- constitution simple des lots ;
- contrôle de cohérence des poids ;
- qualité et conservation ;
- disponibilité du lot ;
- calcul de l'écart prévision / réel ;
- déclenchement d'une réévaluation des besoins ;
- indicateurs de base.

À différer :

- fusion et fractionnement complexes ;
- inspection réglementaire complète ;
- pricing dynamique ;
- certificats avancés ;
- automatisation par capteurs ;
- preuve blockchain ;
- scoring de réputation ;
- export et conformité avancés.

---

## 13. Critères de réussite produit

La capability est réussie si, sur un site pilote :

- les acteurs utilisent une même référence de débarquement ;
- le volume réel est connu rapidement ;
- les lots sont traçables jusqu'au débarquement ;
- les besoins opérationnels sont recalculés à partir du réel ;
- les écarts déclenchent des actions concrètes ;
- Mbàmbulaan peut démontrer des pertes évitées ou une meilleure mobilisation des capacités.

---

## 14. Prochaine étape de conception

La prochaine étape doit être la traduction de cette capability en :

- événements et commandes TypeScript ;
- invariants détaillés ;
- services du domaine ;
- moteur de réconciliation ;
- tests métier ;
- features d'orchestration.

Aucun écran ne doit être conçu avant validation de ces éléments.
