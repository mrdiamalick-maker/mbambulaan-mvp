# 04 — Spécifications fonctionnelles du flux pilote

## 1. Finalité

Ce document décrit les règles fonctionnelles détaillées du flux pilote de Mbàmbulaan.

Le flux couvert est :

```text
Signalement
→ Qualification
→ Décision
→ Coordination
→ Engagement
→ Action
→ Confirmation
→ Clôture
```

L’objectif est de permettre à une équipe produit, design et développement d’implémenter le flux principal sans ambiguïté sur :

- les acteurs ;
- les objets métier ;
- les règles ;
- les statuts ;
- les permissions ;
- les transitions ;
- les cas d’erreur ;
- les notifications ;
- les traces attendues.

## 2. Principes fonctionnels

Le flux doit :

- réduire les zones d’incertitude ;
- rendre chaque responsabilité explicite ;
- conserver l’historique ;
- empêcher les transitions incohérentes ;
- distinguer déclaration, analyse, décision et exécution ;
- permettre une lecture simple par les acteurs métier ;
- fonctionner en contexte de faible connectivité.

## 3. Acteurs du flux

### 3.1 Acteur terrain

Peut :

- créer un signalement ;
- compléter une demande ;
- consulter le suivi ;
- confirmer ou contester un résultat.

### 3.2 Coordinateur local

Peut :

- qualifier un signalement ;
- regrouper des signalements ;
- préparer une décision ;
- organiser la coordination ;
- suivre les engagements et actions ;
- proposer la clôture.

### 3.3 Décideur

Peut :

- arbitrer ;
- valider une priorité ;
- prendre une décision ;
- désigner un responsable ;
- demander un complément ;
- refuser avec justification.

### 3.4 Partenaire d’exécution

Peut :

- accepter ou refuser un engagement ;
- exécuter une action ;
- déclarer un blocage ;
- ajouter une confirmation d’intervention.

### 3.5 Validateur

Peut :

- confirmer une action ;
- demander un complément ;
- rejeter une confirmation avec motif.

### 3.6 Administrateur

Peut :

- corriger des données avec trace ;
- gérer les droits ;
- traiter les erreurs techniques ;
- réouvrir exceptionnellement une situation selon mandat.

## 4. Vue d’ensemble des objets

Le flux manipule les objets suivants :

- Signalement ;
- Situation ;
- Décision ;
- Espace de coordination ;
- Engagement ;
- Action ;
- Blocage ;
- Élément de confirmation ;
- Validation ;
- Notification ;
- Trace d’audit.

## 5. Étape 1 — Signalement

### 5.1 Objectif

Permettre à un acteur de terrain de faire remonter un problème ou un besoin.

### 5.2 Données minimales

- type de remontée ;
- description ;
- territoire ou site ;
- auteur ;
- date de création.

### 5.3 Données facultatives

- photo ;
- document ;
- niveau d’urgence perçu ;
- personnes concernées ;
- commentaire complémentaire.

### 5.4 Statuts

- Brouillon ;
- Soumis ;
- En attente de complément ;
- Reçu ;
- Converti en situation ;
- Clôturé sans suite ;
- Doublon.

### 5.5 Règles

- un brouillon peut être modifié par son auteur ;
- un signalement soumis ne peut plus être supprimé par l’auteur ;
- une correction doit conserver l’ancienne valeur ;
- un signalement ne peut devenir une situation qu’après qualification ;
- un doublon doit être rattaché à la situation principale ;
- un signalement clôturé sans suite doit comporter un motif.

### 5.6 Notifications

- accusé de réception à l’auteur ;
- notification au coordinateur ;
- notification en cas de demande de complément ;
- notification en cas de rattachement à une situation existante.

## 6. Étape 2 — Qualification

### 6.1 Objectif

Transformer une remontée brute en situation exploitable.

### 6.2 Données de qualification

- nature de la situation ;
- urgence ;
- criticité ;
- périmètre ;
- acteurs concernés ;
- orientation ;
- justification ;
- éventuel besoin priorisé.

### 6.3 Statuts

- À qualifier ;
- En analyse ;
- Complément demandé ;
- Qualifié ;
- Non fondé ;
- Doublon.

### 6.4 Règles

- seule une personne habilitée peut qualifier ;
- la criticité et l’urgence doivent être distinguées ;
- une demande de complément doit être précise ;
- toute qualification doit être justifiée ;
- plusieurs signalements peuvent alimenter une même situation ;
- une qualification doit produire une situation ou un motif de non-poursuite.

### 6.5 Sorties possibles

- situation créée ;
- signalement rattaché à une situation existante ;
- signalement clôturé comme non fondé ;
- signalement marqué comme doublon.

## 7. Étape 3 — Décision

### 7.1 Objectif

Formaliser l’arbitrage nécessaire pour faire progresser la situation.

### 7.2 Types de décision

- traiter immédiatement ;
- prioriser ;
- mobiliser un acteur ;
- engager une ressource ;
- transférer à une autorité ;
- reporter ;
- refuser ;
- clôturer sans action.

### 7.3 Données obligatoires

- décideur ;
- mandat ;
- décision ;
- justification ;
- date ;
- responsables désignés ;
- prochaine étape.

### 7.4 Statuts

- À décider ;
- Décision en attente ;
- Complément demandé ;
- Décidé ;
- Refusé ;
- Reporté.

### 7.5 Règles

- le décideur doit disposer d’un mandat valide ;
- une décision doit être compréhensible par les acteurs concernés ;
- une décision révisée ne doit pas écraser l’ancienne ;
- un refus doit être motivé ;
- un report doit comporter une date de réexamen ;
- une décision doit déclencher une suite opérationnelle ou une clôture motivée.

## 8. Étape 4 — Coordination

### 8.1 Objectif

Organiser les acteurs autour de la situation et de la décision.

### 8.2 Données principales

- participants ;
- coordinateur ;
- objectif ;
- décisions associées ;
- engagements ;
- actions ;
- échéances ;
- blocages.

### 8.3 Statuts

- À organiser ;
- En coordination ;
- En attente d’engagement ;
- En exécution ;
- Bloqué ;
- Prêt à clôturer ;
- Clôturé.

### 8.4 Règles

- chaque coordination doit avoir un coordinateur ;
- chaque participant doit avoir une raison d’être impliqué ;
- les responsabilités doivent être explicites ;
- une coordination sans prochaine action est invalide ;
- les commentaires ne remplacent pas les actions ;
- les blocages doivent être visibles et suivis.

## 9. Étape 5 — Engagement

### 9.1 Objectif

Formaliser qui s’engage à faire quoi, pour quand et au bénéfice de qui.

### 9.2 Données obligatoires

- responsable ;
- bénéficiaire ;
- contenu ;
- échéance ;
- résultat attendu ;
- mode de confirmation ;
- statut.

### 9.3 Statuts

- Proposé ;
- Accepté ;
- Refusé ;
- En cours ;
- Tenu ;
- Partiellement tenu ;
- Non tenu ;
- Annulé.

### 9.4 Règles

- un engagement proposé doit être accepté ou refusé ;
- un refus doit être motivé ;
- une modification importante après acceptation nécessite une nouvelle validation ;
- un engagement arrivé à échéance doit être requalifié ;
- un engagement peut produire une ou plusieurs actions.

## 10. Étape 6 — Action

### 10.1 Objectif

Suivre l’exécution concrète d’une décision ou d’un engagement.

### 10.2 Données obligatoires

- titre ;
- description ;
- responsable ;
- échéance ;
- statut ;
- résultat attendu.

### 10.3 Données facultatives

- site ;
- participants ;
- documents ;
- dépendances ;
- estimation de coût ;
- mode de confirmation.

### 10.4 Statuts

- À faire ;
- Acceptée ;
- En cours ;
- Bloquée ;
- Terminée ;
- À confirmer ;
- Confirmée ;
- Rejetée ;
- Annulée.

### 10.5 Règles

- une action doit avoir un responsable ;
- une action doit avoir une échéance ou un délai cible ;
- une action terminée n’est pas forcément confirmée ;
- un blocage doit comporter une cause et une prochaine étape ;
- une action rejetée revient au responsable avec un motif ;
- une action confirmée ne peut plus être modifiée sans réouverture.

## 11. Étape 7 — Confirmation

### 11.1 Objectif

Confirmer qu’une action ou un résultat correspond à ce qui était attendu.

### 11.2 Formes possibles

Selon le contexte :

- photo ;
- document ;
- justificatif ;
- compte rendu ;
- validation d’un tiers ;
- confirmation de l’acteur terrain ;
- donnée issue d’un système externe.

### 11.3 Statuts

- Non requise ;
- Attendue ;
- Soumise ;
- Acceptée ;
- Rejetée ;
- Complément demandé.

### 11.4 Règles

- le mode de confirmation doit être défini avant la fin de l’action ;
- la confirmation doit être adaptée au contexte ;
- une confirmation rejetée doit comporter un motif ;
- l’auteur de l’action et le validateur peuvent être différents ;
- certaines actions simples peuvent être confirmées automatiquement.

## 12. Étape 8 — Clôture

### 12.1 Objectif

Terminer officiellement une situation avec un résultat compréhensible.

### 12.2 Conditions de clôture

Une situation peut être clôturée si :

- les décisions ont été exécutées ou explicitement abandonnées ;
- les actions critiques sont terminées ;
- les confirmations nécessaires sont disponibles ;
- les blocages restants sont documentés ;
- un motif de clôture est sélectionné ;
- le résultat est décrit.

### 12.3 Motifs de clôture

- Résolu ;
- Partiellement résolu ;
- Transféré ;
- Non fondé ;
- Doublon ;
- Impossible à traiter ;
- Abandonné.

### 12.4 Règles

- la clôture doit être justifiée ;
- le déclarant ou bénéficiaire doit être notifié ;
- une contestation peut entraîner une réouverture ;
- une réouverture doit être tracée ;
- une situation clôturée reste consultable.

## 13. Règles de réouverture

Une situation peut être réouverte si :

- le résultat est contesté ;
- le problème persiste ;
- une nouvelle information importante apparaît ;
- une erreur de clôture est constatée.

La réouverture doit préciser :

- le motif ;
- l’auteur ;
- la date ;
- le nouveau responsable ;
- la prochaine action.

## 14. Règles de permissions

### Acteur terrain

- créer et consulter ses signalements ;
- compléter lorsqu’il est sollicité ;
- confirmer ou contester un résultat.

### Coordinateur

- qualifier ;
- créer une situation ;
- organiser la coordination ;
- créer des actions et engagements ;
- proposer la clôture.

### Décideur

- prendre ou réviser une décision ;
- valider une priorité ;
- désigner un responsable.

### Partenaire d’exécution

- voir les actions qui le concernent ;
- accepter, refuser, mettre à jour et terminer.

### Validateur

- confirmer ou rejeter selon mandat.

### Administrateur

- gérer les accès ;
- corriger avec trace ;
- traiter les cas exceptionnels.

## 15. Règles de notifications

Les notifications doivent être émises pour :

- signalement reçu ;
- complément demandé ;
- situation créée ;
- décision attendue ;
- décision prise ;
- engagement proposé ;
- engagement accepté ou refusé ;
- action assignée ;
- échéance proche ;
- blocage déclaré ;
- confirmation demandée ;
- action rejetée ;
- situation clôturée ;
- situation réouverte.

## 16. Règles hors ligne

Le système doit permettre :

- création de brouillon hors ligne ;
- ajout local de photo ;
- mise en file des opérations ;
- visualisation de l’état de synchronisation ;
- reprise automatique après retour réseau ;
- prévention des doublons.

Les décisions critiques et validations institutionnelles nécessitent une confirmation serveur avant d’être considérées comme définitives.

## 17. Gestion des doublons

Le système doit pouvoir détecter ou suggérer des doublons selon :

- le lieu ;
- le type ;
- la période ;
- la description ;
- les acteurs concernés.

La fusion ne doit pas supprimer les signalements d’origine.

## 18. Gestion des erreurs

### Erreur de saisie

Permettre la correction avec historique.

### Erreur de permission

Afficher une explication claire et la personne à contacter.

### Erreur de synchronisation

Conserver l’opération et permettre une nouvelle tentative.

### Conflit de modification

Afficher les deux versions et demander un arbitrage si nécessaire.

### Erreur de clôture

Permettre une réouverture contrôlée.

## 19. Événements métier principaux

- SignalementSoumis ;
- ComplémentDemandé ;
- SignalementQualifié ;
- SituationCréée ;
- DécisionPrise ;
- CoordinationOuverte ;
- EngagementProposé ;
- EngagementAccepté ;
- ActionAssignée ;
- BlocageDéclaré ;
- ActionTerminée ;
- ConfirmationSoumise ;
- ActionConfirmée ;
- SituationClôturée ;
- SituationRéouverte.

## 20. Critères d’acceptation du flux pilote

Le flux est fonctionnel si :

- un acteur peut créer un signalement ;
- un coordinateur peut le qualifier ;
- une décision peut être prise ;
- une coordination peut être ouverte ;
- un engagement et une action peuvent être créés ;
- l’exécutant peut mettre à jour son action ;
- un blocage peut être déclaré ;
- une action peut être confirmée ;
- une situation peut être clôturée ;
- l’historique reste consultable ;
- les acteurs sont notifiés aux moments clés.

## 21. Cas de test bout en bout de référence

### Scénario

Une panne d’équipement est signalée sur un site de débarquement.

### Étapes attendues

1. Un acteur terrain soumet le signalement.
2. Le coordinateur le qualifie comme critique et urgent.
3. Le décideur autorise l’intervention.
4. Le coordinateur ouvre la coordination.
5. Le technicien accepte l’engagement.
6. Une action de réparation est assignée.
7. Le technicien déclare l’action terminée et ajoute une photo.
8. Le responsable du site confirme le fonctionnement.
9. Le coordinateur clôture la situation comme résolue.
10. L’auteur du signalement reçoit la notification de clôture.

## 22. Principe directeur

> Le flux pilote de Mbàmbulaan doit rendre visible la progression d’une situation depuis la remontée terrain jusqu’à une issue confirmée, sans confondre information, décision, engagement et exécution.
