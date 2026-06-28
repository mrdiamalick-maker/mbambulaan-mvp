# Règles métier — Mbàmbulaan

## 1. Arrivage

Un arrivage représente un lot de poisson débarqué sur un quai.

Champs principaux :

- identifiant du lot
- espèce
- quai
- quantité
- unité
- heure de débarquement
- statut
- acteur déclarant

Statuts possibles :

- Disponible
- Réservé
- Contrôle qualité
- Expédié
- Livré

## 2. Besoin

Un besoin représente une demande exprimée par un acheteur, un mareyeur, un transformateur ou une collectivité.

Champs principaux :

- espèce recherchée
- quantité demandée
- unité
- quai ou zone cible
- niveau d’urgence
- acteur demandeur
- commentaire optionnel

Statuts possibles :

- Ouvert
- En cours
- Couvert
- Clos

## 3. Matching

Un matching rapproche un arrivage et un besoin.

Critères MVP :

- espèce compatible
- quantité suffisante
- zone géographique cohérente
- disponibilité
- urgence du besoin

Le matching produit une opportunité.

## 4. Opportunité

Une opportunité représente une proposition de mise en relation entre une offre et un besoin.

Une opportunité peut être :

- Détectée
- Proposée
- Acceptée
- Réservée
- Terminée

## 5. Réservation

Une réservation indique qu’un acteur manifeste son intérêt pour un lot.

Règles MVP :

- une opportunité réservée n’est plus considérée comme pleinement disponible ;
- une réservation peut générer une transaction ;
- une réservation déclenche une notification métier.

## 6. Transaction

Une transaction suit l’évolution après réservation.

Statuts possibles :

- Réservée
- En préparation
- En cours de retrait
- Terminée
- Annulée

## 7. Notifications

Les notifications transforment les événements métier en alertes actionnables.

Exemples :

- nouvel arrivage disponible ;
- besoin urgent publié ;
- opportunité détectée ;
- lot réservé ;
- transaction terminée ;
- tension territoriale critique.

## 8. Intelligence métier

Les moteurs métier doivent rester centralisés dans `src/lib`.

Modules principaux :

- coordination
- matching
- recommendation
- trust
- impact
- tension
- prioritization
- alerts
- traceability

Les composants React doivent afficher les données, pas porter la logique métier lourde.
