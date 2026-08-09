# Mbàmbulaan — Langage métier partagé

## 1. Finalité

Ce document fixe le vocabulaire métier commun de Mbàmbulaan.

Il doit être utilisé de manière cohérente dans :

- les échanges avec les acteurs de terrain ;
- les documents produit ;
- les blueprints de capabilities ;
- le code du domaine ;
- les événements métier ;
- les contrats d'API ;
- les supports destinés aux partenaires et institutions.

L'objectif est d'éviter qu'un même mot désigne plusieurs réalités, ou qu'une même réalité soit nommée différemment selon les équipes.

---

## 2. Principes de vocabulaire

1. Un terme métier doit décrire une réalité opérationnelle, pas une interface.
2. Un terme doit avoir une responsabilité claire dans le domaine.
3. Un terme ambigu doit être remplacé par un terme plus précis.
4. Les statuts doivent décrire un état réel, pas une intention vague.
5. Les événements doivent être formulés comme des faits passés.
6. Les décisions automatiques doivent rester distinguées des décisions humaines.
7. Les niveaux de confiance doivent être explicites.

---

## 3. Concepts fondamentaux

### Acteur

Personne physique participant à un flux de la filière.

Exemples : pêcheur, capitaine, mareyeur, transformateur, agent de site, transporteur, coordinateur.

Un acteur peut appartenir à une ou plusieurs organisations et porter plusieurs rôles selon le contexte.

### Organisation

Structure collective ou institutionnelle à laquelle des acteurs peuvent être rattachés.

Exemples : GIE, coopérative, entreprise, association, collectivité, service public.

### Rôle

Responsabilité opérationnelle accordée à un acteur dans un contexte donné.

Exemples : confirmateur de débarquement, peseur, responsable de capacité, coordinateur territorial.

Un rôle ne doit pas être confondu avec un métier ou un intitulé de poste.

### Habilitation

Autorisation explicite permettant à un acteur d'effectuer une action sensible.

Exemples : confirmer un débarquement, vérifier une pesée, bloquer un lot.

### Territoire

Périmètre géographique et opérationnel dans lequel Mbàmbulaan coordonne des acteurs, des ressources et des décisions.

Un territoire peut contenir plusieurs sites de débarquement.

### Site de débarquement

Lieu physique reconnu où une embarcation peut débarquer des captures et où des opérations associées peuvent être coordonnées.

### Embarcation

Moyen de pêche identifié et rattaché à des acteurs ou organisations.

---

## 4. Coordination

### Coordination

Processus par lequel Mbàmbulaan rend visibles des besoins, des capacités, des contraintes et des engagements afin d'aider les acteurs à prendre et exécuter une décision collective.

La coordination n'est pas une simple mise en relation.

Elle comprend au minimum :

- une situation à traiter ;
- des acteurs concernés ;
- une information partagée ;
- une décision ;
- un engagement ;
- une exécution ;
- un résultat mesurable.

### Décision de coordination

Résultat d'une analyse métier indiquant ce qu'il convient de faire.

Exemples : réserver une capacité, surveiller une exécution, signaler une tension.

Une décision peut être :

- automatique ;
- assistée ;
- validée manuellement.

### Recommandation

Proposition d'action produite par un moteur métier.

Une recommandation n'est pas encore un engagement.

### Plan de coordination

Ensemble priorisé de recommandations et d'actions à mener pour un territoire ou une situation donnée.

---

## 5. Besoins, capacités et allocations

### Besoin

Résultat opérationnel à obtenir pour permettre la continuité d'un flux.

Exemples : besoin de glace, besoin de transport, besoin de froid, besoin de manutention.

Un besoin doit toujours préciser :

- son type ;
- sa quantité ;
- son territoire ;
- sa priorité ;
- son échéance ;
- son statut.

### Besoin de service

Besoin nécessitant l'intervention d'un acteur ou la mobilisation d'une ressource externe.

### Capacité

Ressource mobilisable pour répondre à un besoin.

Exemples : quantité de glace, volume de chambre froide, véhicule, équipe de manutention.

Une capacité doit toujours préciser :

- son type ;
- son propriétaire ou opérateur ;
- sa quantité totale ;
- sa quantité disponible ;
- son territoire ;
- sa période de disponibilité ;
- son statut.

### Capacité compatible

Capacité pouvant répondre à un besoin selon les règles de type, quantité, territoire, disponibilité et échéance.

### Allocation

Affectation explicite d'une partie d'une capacité à un besoin.

Une allocation lie :

- un besoin ;
- une capacité ;
- une quantité réservée ;
- une période ;
- un statut.

### Réservation

Action qui crée ou confirme une allocation.

### Exécution

Réalisation effective du service prévu par une allocation.

### Couverture

Part d'un besoin déjà satisfaite par des allocations ou exécutions valides.

### Quantité restante

Part du besoin qui reste à couvrir après prise en compte des allocations et exécutions valides.

---

## 6. Tensions, incidents et engagements

### Tension

Situation dans laquelle un besoin important ne peut pas être couvert normalement ou risque de ne pas l'être à temps.

Exemples : manque de glace, saturation du froid, indisponibilité du transport.

Une tension doit être qualifiée par :

- son type ;
- sa gravité ;
- son territoire ;
- les acteurs concernés ;
- son statut ;
- son échéance ;
- sa résolution éventuelle.

### Incident

Événement opérationnel négatif affectant un flux déjà engagé ou en cours d'exécution.

Exemples : panne d'équipement, retard de véhicule, rupture de froid.

Une tension peut exister sans incident. Un incident peut provoquer une tension.

### Engagement

Promesse explicite d'un acteur d'effectuer une action à une échéance donnée.

Un engagement doit préciser :

- qui s'engage ;
- sur quelle action ;
- pour quelle situation ;
- avant quelle échéance ;
- avec quel statut.

### Résolution

État atteint lorsqu'une tension ou un incident a été traité de manière suffisante pour restaurer la continuité du flux.

### Escalade

Transmission d'une situation à un niveau de décision supérieur lorsque les acteurs initiaux ne peuvent pas la résoudre.

---

## 7. Retours, débarquements et pesées

### Retour prévu

Annonce anticipée de l'arrivée estimée d'une embarcation.

Il doit préciser au minimum :

- l'embarcation ;
- le site prévu ;
- l'heure estimée d'arrivée ;
- le volume ou les captures estimées ;
- les besoins anticipés.

### Débarquement

Fait qu'une embarcation a effectivement débarqué sur un site donné à un instant donné.

Un débarquement est un fait réel, distinct de l'annonce de retour.

### Pesée

Mesure ou estimation du poids débarqué.

Une pesée doit toujours préciser :

- la méthode ;
- le poids ;
- l'acteur qui l'enregistre ;
- le niveau de confiance ;
- la date ;
- son statut éventuel de contestation.

### Pesée de référence

Pesée retenue par les règles du domaine pour servir de base aux calculs de poids, lots, engagements ou analyses.

### Écart de débarquement

Différence entre ce qui était prévu et ce qui a été réellement débarqué.

L'écart peut porter sur :

- l'heure ;
- le poids ;
- les espèces ;
- les besoins opérationnels.

---

## 8. Lots, disponibilité et qualité

### Lot

Unité opérationnelle de produit issue d'un débarquement et partageant des caractéristiques homogènes.

Un lot doit préciser :

- son origine ;
- son espèce ;
- son poids ;
- son niveau de qualité ;
- son état de conservation ;
- son statut de disponibilité.

### Origine

Lien traçable entre un lot et son débarquement, son embarcation et son site.

### Qualité

Appréciation métier ou réglementaire de l'état d'un lot.

La qualité ne doit pas être confondue avec l'état de conservation.

### État de conservation

Condition physique du produit au regard du froid, de la glace, du temps et des manipulations.

### Disponibilité

Capacité d'un lot à être proposé, réservé, transporté, stocké ou transformé.

### Lot à risque

Lot exposé à une dégradation, une perte, une incohérence de données ou une absence de débouché.

### Lot bloqué

Lot rendu temporairement ou définitivement indisponible pour des raisons de qualité, de conformité, de litige ou de sécurité.

---

## 9. Commercialisation et flux marché

### Besoin marché

Demande exprimée par un acheteur ou un canal commercial sur un produit, une quantité, une qualité, un lieu et une échéance.

### Disponibilité commerciale

Part d'un lot pouvant être proposée à un acheteur.

### Mise en relation

Rapprochement entre une offre et un besoin marché.

Une mise en relation ne vaut ni accord ni réservation.

### Accord commercial

Entente explicite entre parties sur un produit, une quantité, un prix et des conditions d'exécution.

### Réservation commerciale

Quantité d'un lot temporairement affectée à un accord ou à un acheteur.

### Vente

Accord commercial confirmé et exécuté selon les règles applicables.

---

## 10. Résultats, impact et valeur

### Résultat

Effet mesurable obtenu à la suite d'une action ou d'une coordination.

Exemples : besoin couvert, lot sauvé, capacité mobilisée, tension résolue.

### Outcome

Terme technique utilisé dans le code pour représenter un résultat métier mesurable.

Dans les documents en français, préférer « résultat ».

### Valeur créée

Bénéfice économique, opérationnel, social ou institutionnel produit pour un acteur ou le territoire.

### Valeur capturée

Part de la valeur créée que Mbàmbulaan transforme en revenu ou avantage économique durable.

### Perte évitée

Valeur ou quantité qui aurait probablement été perdue sans coordination.

### Capacité mobilisée

Ressource disponible qui a effectivement été affectée à un besoin.

### Fiabilité d'exécution

Capacité d'un acteur à respecter ses engagements dans les délais et conditions convenus.

---

## 11. Données, preuves et confiance

### Donnée déclarée

Information fournie par un acteur sans vérification indépendante.

### Donnée confirmée

Information corroborée par un acteur habilité ou par une seconde source crédible.

### Donnée vérifiée

Information contrôlée par une méthode, une preuve ou un acteur reconnu.

### Donnée contestée

Information faisant l'objet d'un désaccord ou d'un doute explicite.

### Preuve

Élément permettant de renforcer ou vérifier une information.

Exemples : ticket de pesée, photo, signature, donnée de capteur, validation d'un agent.

### Niveau de confiance

Qualification de la fiabilité d'une donnée.

Valeurs standard :

- `declared`
- `confirmed`
- `verified`
- `disputed`

### Traçabilité

Capacité à reconstituer l'origine, les transformations, les décisions et les mouvements d'un objet métier.

### Journal d'audit

Historique immuable des actions sensibles, corrections et changements de statut.

---

## 12. Commandes, événements et politiques

### Commande métier

Intention explicite d'un acteur visant à modifier l'état du domaine.

Exemple : confirmer un débarquement.

Une commande peut être refusée si les préconditions ou invariants ne sont pas respectés.

### Événement métier

Fait significatif ayant déjà eu lieu dans le domaine.

Exemple : `LandingConfirmed`.

Un événement ne doit pas être formulé comme une instruction.

### Invariant

Règle qui doit toujours rester vraie dans une frontière métier donnée.

### Politique métier

Règle de décision pouvant dépendre de plusieurs objets ou agrégats.

### Moteur métier

Composant du domaine qui applique des politiques explicites afin de produire une décision, une recommandation ou une évaluation.

### Agrégat

Ensemble d'objets métier protégés par une même frontière de cohérence.

### Service du domaine

Composant qui exécute une opération métier ne relevant pas naturellement d'une seule entité.

### Sélecteur

Fonction pure permettant de retrouver ou calculer une vue métier à partir des données du domaine.

---

## 13. Statuts standardisés

### Statuts d'un besoin

- `open`
- `partially_covered`
- `covered`
- `fulfilled`
- `cancelled`

### Statuts d'une capacité

- `available`
- `partially_reserved`
- `reserved`
- `unavailable`
- `cancelled`

### Statuts d'une allocation

- `reserved`
- `confirmed`
- `executed`
- `cancelled`

### Statuts d'une tension

- `open`
- `acknowledged`
- `in_resolution`
- `resolved`
- `cancelled`

### Statuts d'un engagement

- `open`
- `in_progress`
- `fulfilled`
- `failed`
- `cancelled`

### Statuts d'un lot

- `draft`
- `available`
- `partially_reserved`
- `reserved`
- `blocked`
- `sold`
- `cancelled`

Les statuts ne doivent pas être multipliés sans nécessité métier démontrée.

---

## 14. Termes à éviter

### Utilisateur

À éviter lorsqu'un rôle métier précis peut être nommé.

Préférer : pêcheur, agent de site, coordinateur, mareyeur, transporteur.

### Ressource

À éviter seul car trop générique.

Préférer : capacité de glace, capacité de froid, véhicule, équipe de manutention.

### Demande

À éviter si le terme précis est « besoin de service » ou « besoin marché ».

### Transaction

À éviter si l'on parle d'une allocation, d'un accord commercial, d'un paiement ou d'une exécution.

### Validation

À éviter sans préciser ce qui est validé et par qui.

Préférer : confirmation, vérification, approbation, libération.

### Alerte

À éviter comme concept central du domaine.

Une alerte est un mode de notification. Le concept métier sous-jacent est souvent un risque, une tension ou un incident.

### Marketplace

Ne pas utiliser pour décrire Mbàmbulaan.

Mbàmbulaan peut coordonner des flux commerciaux, mais sa valeur principale est la coordination de l'écosystème.

### ERP

Ne pas utiliser pour décrire Mbàmbulaan.

Mbàmbulaan n'a pas vocation à gérer l'ensemble des processus internes d'une organisation.

---

## 15. Règles de nommage dans le code

1. Les types et classes utilisent les termes anglais stabilisés du domaine.
2. Les documents produit restent en français.
3. Un même concept ne doit pas avoir plusieurs noms techniques.
4. Les événements sont au passé.
5. Les commandes commencent par un verbe d'action.
6. Les sélecteurs commencent par `get`, `find`, `select`, `calculate` ou `assess` selon leur responsabilité.
7. Les moteurs se terminent par `Engine`.
8. Les politiques se terminent par `Policy` lorsqu'elles sont matérialisées en code.

Exemples :

```ts
ConfirmLandingCommand
LandingConfirmedEvent
selectReferenceWeighing
calculateLandingWeightBalance
LandingReconciliationEngine
CapacityAllocationPolicy
```

---

## 16. Règle de gouvernance

Toute nouvelle capability doit :

- utiliser ce vocabulaire ;
- proposer explicitement tout nouveau terme ;
- éviter les synonymes non maîtrisés ;
- préciser les différences avec les concepts existants ;
- mettre à jour ce document si le terme est validé.

Le langage métier partagé doit évoluer avec le terrain, mais jamais de manière implicite.
