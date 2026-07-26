# Mbàmbulaan — Product Capability Blueprint

## 1. Finalité

Ce document définit le cadre obligatoire de conception de toute nouvelle capability Mbàmbulaan.

L'objectif est d'éviter trois dérives :

- construire des écrans avant d'avoir défini le métier ;
- accumuler des fonctionnalités sans flux de valeur cohérent ;
- développer des composants techniquement intéressants mais sans utilité opérationnelle ni modèle économique clair.

Une capability ne doit entrer dans la roadmap qu'après validation de ce blueprint.

---

## 2. Identité de la capability

### Nom

Nom métier clair et compréhensible par les acteurs de terrain.

### Description courte

Une phrase décrivant ce que la capability permet de coordonner.

### Domaine concerné

- Référentiel
- Retours de pêche
- Services opérationnels
- Débarquement / pesée / lots
- Commercialisation
- Logistique
- Froid / transformation
- Qualité / traçabilité
- Tensions / incidents
- Pilotage territorial
- Performance / impact
- Paiements / partage de valeur
- Confiance / réputation
- Financement / assurance
- Données / intégrations
- Gouvernance / sécurité

### Statut produit

- À explorer
- À valider terrain
- Cadrée
- Prête pour conception domaine
- Prête pour développement
- En expérimentation
- En production
- À réviser

---

## 3. Problème de coordination

Décrire précisément le problème réel.

Questions obligatoires :

1. Qu'est-ce qui est aujourd'hui mal coordonné ?
2. Quelles informations manquent ?
3. Quels acteurs prennent des décisions sans visibilité suffisante ?
4. Où se créent les pertes, retards, conflits ou sous-utilisations ?
5. Que se passe-t-il si Mbàmbulaan ne résout pas ce problème ?

Le problème doit être formulé en termes opérationnels, et non en termes d'interface ou de logiciel.

---

## 4. Acteurs et responsabilités

### Utilisateurs directs

Qui saisit, consulte, confirme, réserve, exécute ou signale ?

### Bénéficiaires

Qui gagne du temps, évite une perte, augmente son revenu ou réduit son risque ?

### Décideurs

Qui possède l'autorité pour arbitrer, confirmer, annuler, bloquer ou engager ?

### Payeurs potentiels

Qui pourrait payer durablement pour cette capability ?

### Responsabilités critiques

Pour chaque acteur :

| Acteur | Responsabilité | Décision autorisée | Données fournies | Valeur reçue |
|---|---|---|---|---|
| | | | | |

---

## 5. Flux de valeur

Décrire le flux métier de bout en bout.

```text
Déclencheur
    ↓
Information initiale
    ↓
Analyse / coordination
    ↓
Décision
    ↓
Exécution
    ↓
Résultat
    ↓
Valeur mesurée
```

Le flux doit montrer :

- le déclencheur ;
- les informations nécessaires ;
- les décisions ;
- les engagements ;
- les actions ;
- le résultat final ;
- la valeur produite.

---

## 6. Sous-capabilities

Lister les sous-capabilities indispensables.

Pour chacune :

### Nom

### Objectif

### Déclencheur

### Résultat attendu

### Acteurs impliqués

### Dépendances

### Priorité

- MVP
- Phase 2
- Phase 3
- Hors périmètre actuel

---

## 7. Commandes métier

Lister les intentions explicites envoyées au domaine.

Exemples de formulation :

- annoncer un retour prévu ;
- confirmer un débarquement ;
- réserver une capacité ;
- signaler une tension ;
- bloquer un lot ;
- confirmer une exécution.

Pour chaque commande :

| Commande | Acteur autorisé | Préconditions | Résultat | Erreurs métier possibles |
|---|---|---|---|---|
| | | | | |

---

## 8. Événements métier

Lister les faits métier significatifs produits après exécution d'une commande.

Exemples :

- `ExpectedReturnAnnounced`
- `LandingConfirmed`
- `CapacityReserved`
- `TensionReported`
- `LotBlocked`

Pour chaque événement :

| Événement | Déclencheur | Consommateurs | Effets secondaires autorisés |
|---|---|---|---|
| | | | |

Un événement doit représenter un fait passé, immuable et utile à d'autres capabilities.

---

## 9. Agrégats et frontières du domaine

Identifier les agrégats responsables de la cohérence métier.

Pour chaque agrégat :

### Nom

### Responsabilité

### Racine d'agrégat

### Entités internes

### Invariants protégés

### Commandes acceptées

### Événements produits

### Données externes autorisées

Une capability ne doit pas créer un agrégat sans responsabilité métier claire.

---

## 10. Invariants métier

Lister les règles qui doivent toujours rester vraies.

Exemples :

- une quantité réservée ne peut pas dépasser la disponibilité ;
- un lot bloqué ne peut pas être vendu ;
- une exécution ne peut pas être confirmée sur une allocation annulée ;
- un besoin satisfait ne peut pas rester ouvert ;
- un acteur non habilité ne peut pas confirmer une opération réglementée.

Pour chaque invariant :

| Invariant | Agrégat responsable | Moment de contrôle | Conséquence en cas de violation |
|---|---|---|---|
| | | | |

---

## 11. Politiques métier

Décrire les règles de décision qui peuvent traverser plusieurs agrégats.

Exemples :

- politique de priorité ;
- politique de matching ;
- politique de confiance ;
- politique de réallocation ;
- politique de blocage ;
- politique de tarification.

Pour chaque politique :

### Entrées

### Règles

### Sorties

### Décision automatique ou assistée

### Possibilité de dérogation humaine

### Journalisation requise

---

## 12. Moteurs métier concernés

Sélectionner uniquement les moteurs réellement nécessaires.

- Coordination Engine
- Matching Engine
- Allocation Engine
- Risk Engine
- Trust Engine
- Outcome Engine
- Pricing & Revenue Engine
- Forecast Engine
- Reconciliation Engine

Pour chaque moteur :

| Moteur | Données d'entrée | Décision produite | Limites | Validation humaine requise |
|---|---|---|---|---|
| | | | | |

Un moteur recommande ou décide selon des règles explicites. Il ne doit jamais cacher une règle métier importante dans une implémentation opaque.

---

## 13. Parcours acteurs

Décrire les parcours prioritaires par acteur.

Pour chaque parcours :

1. point de départ ;
2. information consultée ;
3. décision prise ;
4. action effectuée ;
5. confirmation reçue ;
6. exception possible ;
7. résultat métier.

Ne pas décrire les écrans. Décrire les actions et décisions.

---

## 14. Cas nominaux et cas d'exception

### Cas nominal

Décrire le fonctionnement lorsque tout se passe normalement.

### Cas d'exception obligatoires

- donnée manquante ;
- acteur non habilité ;
- capacité indisponible ;
- retard ;
- annulation ;
- conflit ;
- contestation ;
- donnée peu fiable ;
- perte de connectivité ;
- action déjà effectuée ;
- changement après engagement.

Pour chaque exception :

| Exception | Détection | Décision | Acteur responsable | Résolution |
|---|---|---|---|---|
| | | | | |

---

## 15. Données et niveau de confiance

Lister les données utilisées et leur origine.

| Donnée | Producteur | Méthode de collecte | Niveau de confiance | Fréquence de mise à jour | Sensibilité |
|---|---|---|---|---|---|
| | | | | | |

Niveaux de confiance recommandés :

- `declared`
- `confirmed`
- `verified`
- `disputed`

Toute décision automatisée importante doit tenir compte du niveau de confiance.

---

## 16. Indicateurs de coordination

Mesurer le fonctionnement opérationnel.

Exemples :

- délai moyen de coordination ;
- taux de besoins couverts ;
- taux d'exécution ;
- taux d'annulation ;
- temps de résolution des tensions ;
- utilisation des capacités ;
- qualité et complétude des données.

---

## 17. Indicateurs de valeur

Mesurer la valeur réelle créée.

Exemples :

- kilogrammes de pertes évitées ;
- revenus additionnels générés ;
- coûts logistiques évités ;
- délai de vente réduit ;
- capacité inutilisée mobilisée ;
- incidents sanitaires évités ;
- engagements respectés ;
- amélioration du taux de service.

Aucune capability ne doit être déclarée réussie uniquement sur la base de métriques d'usage.

---

## 18. Modèle économique

Répondre obligatoirement aux questions suivantes :

1. Quelle valeur économique est créée ?
2. Qui reçoit cette valeur ?
3. Qui pourrait payer ?
4. Pour quel service précis ?
5. Paiement ponctuel, abonnement, commission ou financement institutionnel ?
6. Quel coût Mbàmbulaan supporte-t-il ?
7. Quelle marge potentielle ?
8. La capability renforce-t-elle une autre source de revenus ?

Modèles possibles :

- abonnement institutionnel ;
- abonnement professionnel ;
- frais de coordination ;
- commission transactionnelle ;
- services de preuve ou de traçabilité ;
- accès à des données agrégées ;
- intégration ou licence d'infrastructure ;
- financement de programme public ou partenaire.

---

## 19. Différenciation et avantage concurrentiel

Décrire ce qui rend cette capability difficile à reproduire.

Sources possibles :

- réseau d'acteurs ;
- données historiques ;
- profondeur des règles métier ;
- intégration entre plusieurs flux ;
- confiance institutionnelle ;
- capacité de coordination en temps réel ;
- preuves d'impact ;
- interopérabilité ;
- connaissance fine du terrain.

Une simple digitalisation d'un formulaire n'est pas un avantage concurrentiel.

---

## 20. Périmètre MVP

### À construire maintenant

Fonctions strictement nécessaires pour prouver la valeur de coordination.

### À différer

Fonctions utiles mais non indispensables à l'expérimentation.

### À exclure

Fonctions séduisantes mais sans valeur démontrée, trop coûteuses ou prématurées.

---

## 21. Hypothèses à tester sur le terrain

Pour chaque hypothèse :

| Hypothèse | Risque | Méthode de test | Signal de validation | Signal d'abandon |
|---|---|---|---|---|
| | | | | |

Catégories obligatoires :

- problème réel ;
- adoption ;
- qualité des données ;
- gouvernance ;
- capacité de paiement ;
- valeur économique ;
- faisabilité opérationnelle.

---

## 22. Critères de réussite pilote

Définir des critères mesurables avant développement.

Exemples :

- nombre d'opérations coordonnées ;
- taux de besoins couverts ;
- réduction du délai ;
- pertes évitées ;
- nombre d'acteurs actifs ;
- qualité des données ;
- volonté de payer ;
- renouvellement ou extension demandé par le partenaire pilote.

---

## 23. Dépendances

### Capabilities prérequises

### Capabilities consommatrices

### Partenaires externes

### Données externes

### Contraintes réglementaires

### Contraintes techniques

### Contraintes terrain

---

## 24. Risques et garde-fous

### Risques produit

- absence d'usage réel ;
- complexité excessive ;
- acteur payeur mal identifié ;
- bénéfice concentré chez un acteur qui ne paie pas ;
- capture de valeur insuffisante.

### Risques opérationnels

- données fausses ou tardives ;
- contournement du système ;
- conflits d'autorité ;
- surcharge des agents ;
- dépendance à la connectivité.

### Risques éthiques et institutionnels

- surveillance excessive ;
- exclusion d'acteurs informels ;
- notation opaque ;
- détournement de données ;
- perte de confiance.

Pour chaque risque, documenter un garde-fou explicite.

---

## 25. Décision de passage en développement

La capability peut passer en conception technique uniquement si les réponses suivantes sont positives :

- Le problème de coordination est réel et prioritaire.
- Les utilisateurs et décideurs sont identifiés.
- Le flux de valeur est clair.
- Les invariants principaux sont connus.
- Les données nécessaires sont accessibles.
- Le périmètre MVP est limité.
- Les critères de réussite sont mesurables.
- La valeur économique est plausible.
- La capability renforce la vision d'infrastructure de Mbàmbulaan.

Décision :

- `GO`
- `GO sous conditions`
- `À retravailler`
- `STOP`

Justification :

---

## 26. Ordre de traduction technique

Une capability validée doit être traduite dans cet ordre :

```text
Blueprint validé
    ↓
Types métier
    ↓
Commandes et événements
    ↓
Agrégats et invariants
    ↓
Services du domaine
    ↓
Moteurs métier
    ↓
Tests du domaine
    ↓
Features d'orchestration
    ↓
API
    ↓
Interfaces
```

Aucune interface ne doit devenir la source de vérité du métier.
