# 03 — Écrans et wireframes fonctionnels

## 1. Finalité

Ce document traduit les parcours acteurs en écrans fonctionnels directement exploitables par le design et le développement.

Il ne cherche pas à définir une direction artistique complète. Il précise surtout :

- le rôle de chaque écran ;
- les informations affichées ;
- les actions disponibles ;
- les règles métier ;
- les états de l’interface ;
- les composants réutilisables ;
- les transitions entre écrans.

## 2. Principes d’interface

Les écrans Mbàmbulaan doivent être :

- simples ;
- orientés action ;
- mobile-first ;
- lisibles en situation de terrain ;
- compatibles avec une connectivité instable ;
- cohérents avec le lexique métier ;
- conçus pour réduire l’incertitude et les erreurs.

## 3. Architecture de navigation

### Navigation principale

- **Mon travail** ;
- **Territoire** ;
- **Coordination** ;
- **Initiatives** ;
- **Connaissance**.

### Navigation adaptée au rôle

#### Acteur terrain

- Accueil ;
- Signaler ;
- Mes remontées ;
- Notifications.

#### Coordinateur

- Mon travail ;
- Signalements ;
- Situations ;
- Coordination ;
- Territoire.

#### Décideur

- Synthèse ;
- À décider ;
- Territoires ;
- Résultats.

#### Partenaire d’exécution

- Mes actions ;
- Mes engagements ;
- Notifications.

#### Administrateur

- Utilisateurs ;
- Organisations ;
- Territoires ;
- Référentiels ;
- Support.

## 4. Écran 1 — Connexion

### Objectif

Permettre un accès simple et sécurisé par téléphone.

### Contenu

- logo Mbàmbulaan ;
- champ numéro de téléphone ;
- indicatif pays ;
- bouton « Recevoir un code » ;
- message d’aide ;
- lien d’assistance.

### États

- numéro invalide ;
- envoi en cours ;
- code envoyé ;
- échec d’envoi ;
- trop de tentatives.

### Règles

- code temporaire ;
- expiration ;
- limitation des tentatives ;
- audit de connexion.

## 5. Écran 2 — Saisie du code

### Contenu

- numéro masqué ;
- champ code ;
- compteur avant renvoi ;
- bouton « Continuer » ;
- bouton « Renvoyer le code ».

### Actions

- valider ;
- corriger le numéro ;
- demander un nouveau code.

## 6. Écran 3 — Accueil acteur terrain

### Objectif

Donner un accès immédiat aux trois actions essentielles.

### Contenu

- message de bienvenue ;
- bouton principal « Signaler un problème » ;
- bouton secondaire « Signaler un besoin » ;
- accès « Suivre mes remontées » ;
- dernières notifications ;
- état de synchronisation.

### Composants

- carte d’action principale ;
- carte de remontée récente ;
- badge de statut ;
- indicateur hors ligne.

## 7. Écran 4 — Choix du type de remontée

### Contenu

- Problème ;
- Besoin ;
- Alerte urgente ;
- Autre.

### Règles

- limiter le nombre de choix ;
- prévoir une description simple ;
- permettre l’évolution des catégories via un référentiel.

## 8. Écran 5 — Formulaire de signalement

### Objectif

Permettre une saisie courte et exploitable.

### Sections

#### Situation

- type ;
- description ;
- urgence perçue.

#### Lieu

- territoire ;
- site ;
- géolocalisation facultative.

#### Pièces jointes

- ajouter une photo ;
- ajouter un document ;
- enregistrer une note vocale à terme.

### Actions

- enregistrer en brouillon ;
- envoyer ;
- annuler.

### États

- brouillon local ;
- synchronisation en attente ;
- erreur ;
- succès.

## 9. Écran 6 — Confirmation d’envoi

### Contenu

- message de confirmation ;
- identifiant de suivi ;
- statut initial ;
- prochaine étape ;
- bouton « Voir le suivi » ;
- bouton « Faire une autre remontée ».

## 10. Écran 7 — Liste Mes remontées

### Contenu

- recherche ;
- filtres par statut ;
- cartes de remontées ;
- date ;
- lieu ;
- statut ;
- prochaine étape.

### États vides

- aucune remontée ;
- aucun résultat après filtre.

## 11. Écran 8 — Détail d’une remontée

### Contenu

- titre ;
- résumé ;
- statut ;
- chronologie ;
- responsable actuel ;
- prochaine étape ;
- demande de complément éventuelle ;
- photo ou document ;
- motif de clôture.

### Actions

- répondre à une demande ;
- ajouter une information ;
- confirmer le résultat ;
- signaler que le problème persiste.

## 12. Écran 9 — Mon travail coordinateur

### Objectif

Faire apparaître ce qui exige une action immédiate.

### Blocs

- nouveaux signalements ;
- situations urgentes ;
- décisions attendues ;
- actions bloquées ;
- échéances proches ;
- validations en attente.

### Règle

Le tri doit être piloté par la priorité et la prochaine action, pas seulement par la date.

## 13. Écran 10 — File de qualification

### Contenu

- liste des signalements à analyser ;
- urgence ;
- territoire ;
- auteur ;
- ancienneté ;
- similarités détectées ;
- statut de complétude.

### Actions

- ouvrir ;
- filtrer ;
- trier ;
- attribuer ;
- regrouper.

## 14. Écran 11 — Qualification d’une situation

### Sections

#### Résumé du signalement

- description ;
- auteur ;
- lieu ;
- pièces jointes.

#### Analyse

- nature ;
- urgence ;
- criticité ;
- périmètre ;
- acteurs concernés ;
- justification.

#### Orientation

- demander un complément ;
- créer une situation ;
- rattacher à une situation existante ;
- classer sans suite avec motif.

## 15. Écran 12 — Demande de complément

### Contenu

- information manquante ;
- raison de la demande ;
- type de réponse attendue ;
- délai souhaité ;
- destinataire.

### Actions

- envoyer ;
- enregistrer en brouillon ;
- annuler.

## 16. Écran 13 — Détail d’une situation

### Objectif

Créer une vue unique de la situation.

### En-tête

- titre ;
- statut ;
- priorité ;
- territoire ;
- coordinateur ;
- prochaine action.

### Onglets

- Synthèse ;
- Chronologie ;
- Participants ;
- Engagements ;
- Actions ;
- Documents ;
- Décisions.

### Actions principales

- prioriser ;
- demander une décision ;
- ajouter un participant ;
- créer un engagement ;
- créer une action ;
- déclarer un blocage ;
- proposer une clôture.

## 17. Écran 14 — Priorisation

### Contenu

- niveau de priorité ;
- urgence ;
- criticité ;
- personnes affectées ;
- conséquences ;
- justification ;
- décideur éventuel.

### Règles

- conserver l’historique ;
- exiger une justification pour les niveaux élevés ;
- notifier les acteurs concernés.

## 18. Écran 15 — Espace de coordination

### Contenu

- résumé de la situation ;
- participants ;
- engagements ;
- actions ;
- blocages ;
- décisions ;
- chronologie.

### Principe

L’écran doit montrer « qui fait quoi, pour quand et ce qui bloque ».

## 19. Écran 16 — Création d’un engagement

### Champs

- acteur ou organisation responsable ;
- bénéficiaire ;
- contenu de l’engagement ;
- échéance ;
- confirmation attendue ;
- commentaire.

### Actions

- proposer ;
- enregistrer en brouillon ;
- annuler.

## 20. Écran 17 — Acceptation d’un engagement

### Contenu

- contenu ;
- échéance ;
- responsable ;
- bénéficiaire ;
- contexte ;
- confirmation attendue.

### Actions

- accepter ;
- proposer une autre date ;
- refuser avec motif ;
- demander une précision.

## 21. Écran 18 — Création d’une action

### Champs

- titre ;
- description ;
- responsable ;
- échéance ;
- priorité ;
- résultat attendu ;
- mode de confirmation ;
- dépendances.

### Règles

- responsable obligatoire ;
- résultat attendu explicite ;
- action reliée à une situation ou un engagement.

## 22. Écran 19 — Détail d’une action

### Contenu

- titre ;
- statut ;
- responsable ;
- échéance ;
- résultat attendu ;
- blocages ;
- historique ;
- photo ou document éventuel.

### Actions

- démarrer ;
- déclarer un blocage ;
- terminer ;
- ajouter une photo ;
- demander une validation.

## 23. Écran 20 — Déclaration d’un blocage

### Champs

- cause ;
- impact ;
- aide nécessaire ;
- responsable de résolution ;
- date cible.

### Règles

- un blocage doit créer une prochaine action ;
- il doit être visible dans Mon travail ;
- il doit être clôturé explicitement.

## 24. Écran 21 — Validation d’une action

### Contenu

- action ;
- responsable ;
- résultat déclaré ;
- photo, document ou compte rendu ;
- date de réalisation ;
- commentaires.

### Actions

- confirmer ;
- demander un complément ;
- refuser avec motif.

## 25. Écran 22 — Vue décideur

### Blocs

- à décider ;
- critiques ;
- en retard ;
- décisions prises ;
- résultats récents.

### Règle

L’information doit être synthétique et orientée arbitrage.

## 26. Écran 23 — Détail de décision

### Contenu

- résumé ;
- faits essentiels ;
- urgence ;
- criticité ;
- options ;
- impacts ;
- recommandation ;
- acteurs concernés.

### Actions

- approuver ;
- refuser ;
- demander un complément ;
- modifier la priorité ;
- désigner un responsable ;
- reporter.

## 27. Écran 24 — Mes actions partenaire d’exécution

### Contenu

- actions assignées ;
- engagement associé ;
- lieu ;
- échéance ;
- statut ;
- priorité.

### Actions rapides

- accepter ;
- démarrer ;
- déclarer un blocage ;
- terminer.

## 28. Écran 25 — Clôture d’une situation

### Contenu

- résumé ;
- actions terminées ;
- engagements tenus ;
- validations disponibles ;
- retour du bénéficiaire ;
- résultat observé.

### Motifs

- résolu ;
- partiellement résolu ;
- transféré ;
- non fondé ;
- abandonné ;
- impossible à traiter ;
- doublon.

### Actions

- clôturer ;
- demander un complément ;
- rouvrir.

## 29. Écran 26 — Vue territoire

### Blocs

- situations ouvertes ;
- situations critiques ;
- actions en retard ;
- engagements en cours ;
- résultats récents ;
- acteurs actifs.

### Filtres

- période ;
- type ;
- priorité ;
- statut ;
- organisation.

## 30. Écran 27 — Notifications

### Catégories

- action requise ;
- information ;
- échéance ;
- blocage ;
- validation ;
- clôture.

### Actions

- ouvrir ;
- marquer comme lu ;
- filtrer ;
- désactiver certaines notifications non critiques.

## 31. Écran 28 — Administration des utilisateurs

### Contenu

- liste ;
- recherche ;
- rôle ;
- organisation ;
- territoire ;
- statut d’activation ;
- mandat.

### Actions

- créer ;
- inviter ;
- modifier ;
- suspendre ;
- attribuer un mandat.

## 32. Écran 29 — Administration des territoires

### Contenu

- hiérarchie ;
- sites ;
- responsables ;
- organisations présentes ;
- statut actif.

### Actions

- créer ;
- modifier ;
- désactiver ;
- rattacher un site.

## 33. Écran 30 — Support et erreurs de synchronisation

### Contenu

- opérations en échec ;
- utilisateur ;
- objet concerné ;
- date ;
- cause ;
- nombre de tentatives.

### Actions

- relancer ;
- corriger ;
- ignorer avec motif ;
- contacter l’utilisateur.

## 34. Composants fonctionnels réutilisables

- carte d’objet métier ;
- badge de statut ;
- badge de priorité ;
- chronologie ;
- responsable ;
- échéance ;
- prochaine action ;
- blocage ;
- pièce jointe ;
- validation ;
- commentaire structuré ;
- indicateur hors ligne ;
- état de synchronisation ;
- filtre ;
- vue synthèse.

## 35. États obligatoires

Chaque écran doit prévoir :

- chargement ;
- succès ;
- erreur ;
- vide ;
- accès refusé ;
- hors ligne ;
- synchronisation en attente ;
- conflit de données ;
- information incomplète ;
- action indisponible.

## 36. Règles mobile-first

- une action principale visible ;
- formulaires en étapes courtes ;
- champs limités ;
- boutons suffisamment grands ;
- pièces jointes simples ;
- lecture possible en extérieur ;
- possibilité de reprendre une saisie ;
- minimisation de la consommation de données.

## 37. Règles de confiance

L’interface doit toujours rendre visibles :

- l’auteur ;
- la date ;
- le statut ;
- la source ;
- le responsable ;
- la prochaine action ;
- les modifications importantes.

## 38. Wireframe textuel de référence

```text
[Nom de l’objet]                [Statut]
[Priorité] [Territoire]

Résumé
--------------------------------
Information essentielle

Prochaine action
--------------------------------
Responsable : ...
Échéance : ...
[Action principale]

Chronologie
--------------------------------
• Événement 1
• Événement 2

[Actions secondaires]
```

## 39. Priorités MVP

### Écrans indispensables

- Connexion ;
- Accueil terrain ;
- Formulaire de signalement ;
- Mes remontées ;
- Détail remontée ;
- Mon travail coordinateur ;
- File de qualification ;
- Détail situation ;
- Espace de coordination ;
- Engagement ;
- Action ;
- Blocage ;
- Validation ;
- Décision ;
- Clôture ;
- Administration minimale.

### Écrans à reporter

- analytics avancés ;
- personnalisation complète ;
- parcours de financement complet ;
- gestion commerciale ;
- vues publiques ;
- paramétrage avancé par organisation.

## 40. Principe directeur

> Chaque écran de Mbàmbulaan doit aider un acteur à comprendre la situation, savoir ce qu’il doit faire et faire progresser la coordination avec le minimum de friction.
