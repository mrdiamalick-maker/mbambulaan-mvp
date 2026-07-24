# Source de vérité produit — Exécution Codex

## 1. Statut

Ce document est la source de vérité produit pour la prochaine exécution Codex.

En cas de contradiction, l’ordre de priorité est :

1. ce document ;
2. le prompt maître Codex ;
3. `docs/execution/readiness-codex-produit.md` ;
4. Issue #42 ;
5. les spécifications fonctionnelles du flux pilote ;
6. les parcours acteurs et wireframes ;
7. le MVP détaillé ;
8. les autres documents ;
9. le code existant.

Le code existant est une base technique à réutiliser lorsqu’elle sert cette cible. Il n’est pas la source de vérité produit.

---

# 2. Promesse produit

Mbàmbulaan aide les acteurs d’un territoire à remonter une difficulté, organiser sa prise en charge, suivre l’intervention et constater le résultat.

Le produit ne doit pas être présenté comme :

- une marketplace ;
- un ERP ;
- un outil de ticketing ;
- un simple tableau de bord ;
- une plateforme de mise en relation commerciale.

La valeur visible doit être la coordination.

---

# 3. Premier incrément à développer

Le premier incrément est une tranche verticale complète centrée sur un seul parcours :

> Une machine à glace tombe en panne sur un site de débarquement. Un acteur terrain remonte la difficulté. Un coordinateur la qualifie, désigne un responsable, organise l’intervention et suit l’avancement. Le résultat est confirmé. Le décideur voit ce qui a été réellement résolu.

Ce parcours doit fonctionner de bout en bout.

---

# 4. Acteurs

## 4.1 Acteur terrain

Intentions :

- remonter une difficulté ;
- savoir si elle a été reçue ;
- voir qui s’en occupe ;
- suivre la prochaine étape ;
- constater le résultat.

Il ne doit pas voir de vocabulaire administratif ou technique inutile.

## 4.2 Coordinateur

Intentions :

- comprendre ce qui se passe ;
- qualifier la situation ;
- désigner un responsable ;
- organiser l’intervention ;
- suivre les délais et blocages ;
- constater le résultat ;
- clôturer la situation.

## 4.3 Responsable opérationnel

Intentions :

- voir les interventions qui lui sont affectées ;
- comprendre ce qui est attendu ;
- indiquer le statut ;
- signaler un blocage ;
- ajouter une confirmation d’intervention.

## 4.4 Décideur / Ministère

Intentions :

- voir les situations critiques ;
- comprendre les délais ;
- voir les responsabilités ;
- distinguer ce qui est réglé, bloqué ou en retard ;
- consulter les résultats agrégés.

---

# 5. Parcours cible

## Étape 1 — Remonter une difficulté

L’acteur terrain ouvre un formulaire simple.

Champs minimum :

- type de difficulté ;
- site ;
- description courte ;
- niveau d’urgence ;
- photo ou document facultatif ;
- contact ou identité selon le contexte du produit existant.

Résultat :

- la situation est créée ;
- un numéro lisible est généré ;
- le statut est `Reçu` ;
- une confirmation claire est affichée.

## Étape 2 — Comprendre la situation

Le coordinateur consulte la situation.

Il voit :

- le problème ;
- le site ;
- la date ;
- l’urgence ;
- les éléments fournis ;
- les acteurs concernés ;
- l’historique.

Il peut compléter ou corriger la qualification.

Statut possible : `En cours d’examen`.

## Étape 3 — Désigner un responsable

Le coordinateur affecte un responsable opérationnel ou un prestataire.

Le produit affiche clairement :

- le responsable ;
- la prochaine action ;
- l’échéance ;
- le canal ou moyen de contact si disponible.

Statut : `Pris en charge`.

## Étape 4 — Organiser l’intervention

Le coordinateur ou le responsable définit :

- une date prévue ;
- une action attendue ;
- une priorité ;
- une note opérationnelle ;
- éventuellement un besoin préalable.

Statut : `Intervention prévue`.

## Étape 5 — Suivre l’avancement

Le responsable peut passer la situation à :

- `Intervention en cours` ;
- `En attente`.

En cas d’attente, le motif doit être visible.

Exemples :

- pièce indisponible ;
- accès au site impossible ;
- validation nécessaire ;
- prestataire indisponible.

## Étape 6 — Constater le résultat

Le responsable ou le coordinateur ajoute :

- une note de résultat ;
- une photo, un document, un justificatif ou une confirmation d’intervention ;
- une date de fin ;
- éventuellement une recommandation de suivi.

Le coordinateur valide la clôture.

Statut : `Réglé`.

## Étape 7 — Voir ce qui a été réellement résolu

Le décideur consulte :

- la situation ;
- le délai total ;
- les étapes ;
- le responsable ;
- le résultat ;
- l’élément de confirmation ;
- les éventuels retards.

---

# 6. Statuts obligatoires

Les statuts utilisateurs sont exactement :

1. Reçu
2. En cours d’examen
3. Pris en charge
4. Intervention prévue
5. Intervention en cours
6. En attente
7. Réglé

Toute autre valeur technique peut exister en interne, mais ne doit pas apparaître comme statut principal dans l’interface sans arbitrage produit.

---

# 7. Règles métier

## Règle 1 — Une situation doit toujours avoir une prochaine étape

Tant qu’elle n’est pas réglée, l’interface doit montrer :

- ce qui doit se passer ensuite ;
- qui doit agir ;
- quand cela est attendu.

## Règle 2 — Une prise en charge doit avoir un responsable

Une situation ne peut pas être `Pris en charge` sans responsable identifié.

## Règle 3 — Une intervention prévue doit avoir une date ou une échéance

Une situation ne peut pas être `Intervention prévue` sans échéance visible.

## Règle 4 — Une attente doit avoir un motif

Une situation ne peut pas être `En attente` sans motif.

## Règle 5 — Une clôture doit avoir un résultat

Une situation ne peut pas être `Réglé` sans :

- note de résultat ;
- date de fin ;
- élément de confirmation ou justification explicite de son absence.

## Règle 6 — L’historique doit être lisible

Chaque changement important doit apparaître dans une chronologie compréhensible.

## Règle 7 — Le terrain voit uniquement l’information utile

L’acteur terrain ne doit pas voir de données internes sensibles, de commentaires de gouvernance ou de détails inutiles.

## Règle 8 — Le décideur ne modifie pas le parcours opérationnel

L’espace décideur est principalement en lecture et en pilotage.

---

# 8. Écrans minimum

## 8.1 Accueil acteur terrain

Doit répondre immédiatement à trois intentions :

- Remonter une difficulté
- Suivre ma situation
- Voir ce qui a été fait

## 8.2 Formulaire de remontée

Simple, mobile-first et compréhensible.

## 8.3 Confirmation de création

Doit afficher :

- confirmation ;
- numéro de situation ;
- statut ;
- prochaine étape ;
- accès au suivi.

## 8.4 Détail terrain

Doit afficher :

- résumé ;
- statut ;
- responsable ou indication de prise en charge ;
- prochaine étape ;
- historique simplifié ;
- résultat lorsque disponible.

## 8.5 Accueil coordinateur

Doit afficher :

- situations prioritaires ;
- urgences ;
- attentes ;
- retards ;
- situations sans responsable ;
- interventions du jour.

## 8.6 Détail coordinateur

Doit permettre :

- qualification ;
- affectation ;
- planification ;
- changement de statut ;
- ajout de note ;
- consultation de l’historique ;
- clôture.

## 8.7 Accueil responsable

Doit afficher :

- interventions affectées ;
- échéances ;
- priorités ;
- situations bloquées.

## 8.8 Détail responsable

Doit permettre :

- démarrage ;
- mise en attente ;
- motif ;
- ajout d’une confirmation ;
- déclaration de fin.

## 8.9 Accueil décideur

Doit afficher :

- nombre de situations ;
- situations critiques ;
- situations réglées ;
- situations en attente ;
- délais ;
- tendances simples ;
- accès au détail.

---

# 9. Données de démonstration obligatoires

## Site

Nom de démonstration : `Quai de débarquement de Mbao`.

## Situation principale

Titre : `Machine à glace en panne`.

Description :

> La machine à glace ne produit plus depuis ce matin. Les pêcheurs et mareyeurs risquent de ne pas pouvoir conserver les produits débarqués.

Urgence : `Élevée`.

Acteurs concernés :

- pêcheurs ;
- mareyeurs ;
- gestionnaire du site.

Responsable de démonstration :

- `Mamadou Ndiaye — Maintenance Froid`.

Coordinateur :

- `Awa Diop — Coordination locale`.

Décideur :

- `Direction de la pêche artisanale`.

## Chronologie de démonstration

1. 08:10 — difficulté remontée ;
2. 08:18 — situation reçue ;
3. 08:35 — examen commencé ;
4. 09:00 — responsable désigné ;
5. 09:20 — intervention prévue à 11:00 ;
6. 11:15 — intervention en cours ;
7. 11:45 — attente d’une pièce ;
8. 14:30 — pièce reçue et intervention reprise ;
9. 15:40 — machine remise en service ;
10. 16:00 — résultat confirmé et situation réglée.

## Situations secondaires

Prévoir au minimum :

- une situation `Reçu` ;
- une situation `En cours d’examen` ;
- une situation `Pris en charge` ;
- une situation `Intervention prévue` ;
- une situation `Intervention en cours` ;
- une situation `En attente` ;
- une situation `Réglé`.

Ces situations doivent permettre d’alimenter les listes et indicateurs sans écran vide.

---

# 10. Critères d’acceptation fonctionnels

## Acteur terrain

- peut créer une situation ;
- reçoit une confirmation ;
- retrouve la situation ;
- comprend le statut ;
- voit la prochaine étape ;
- voit le résultat final.

## Coordinateur

- voit les priorités ;
- ouvre une situation ;
- qualifie ;
- affecte ;
- planifie ;
- met à jour ;
- clôture ;
- consulte l’historique.

## Responsable

- voit ses interventions ;
- démarre ;
- signale un blocage ;
- ajoute un motif ;
- confirme l’intervention ;
- déclare la fin.

## Décideur

- voit les indicateurs ;
- ouvre une situation ;
- comprend les délais ;
- voit ce qui est réglé ;
- voit les éléments de confirmation.

---

# 11. Critères d’acceptation UX

- mobile-first pour le terrain ;
- aucune page principale vide ;
- aucune navigation incohérente ;
- aucun lien mort ;
- vocabulaire métier ;
- statuts lisibles ;
- prochaine étape visible ;
- actions principales immédiatement identifiables ;
- responsive desktop et mobile ;
- accessibilité de base ;
- feedback après chaque action.

---

# 12. Hors périmètre

Le cycle ne doit pas inclure :

- marketplace ;
- arrivages ;
- besoins commerciaux ;
- matching ;
- réservation ;
- paiement ;
- transaction ;
- scoring ;
- financement ;
- assurance ;
- logistique avancée ;
- chat complet ;
- moteur IA ;
- multi-filières ;
- déploiement national ;
- refonte générale de tous les espaces publics.

---

# 13. Comportement attendu de Codex

Codex doit :

- inspecter le dépôt ;
- réutiliser ce qui sert la cible ;
- isoler les fonctionnalités contradictoires ;
- développer le parcours complet ;
- exécuter les tests ;
- corriger jusqu’à obtention d’un build propre ;
- produire les captures ;
- créer une PR ;
- documenter les routes et instructions de test ;
- lister les écarts résiduels.

Codex ne doit pas :

- inventer un nouveau positionnement ;
- élargir le périmètre ;
- demander des validations intermédiaires pour des choix réversibles ;
- produire un nouvel audit stratégique ;
- réécrire toute l’application sans nécessité ;
- privilégier la documentation au produit visible.

---

# 14. Condition de réussite

Le cycle est réussi lorsqu’un utilisateur peut jouer le scénario complet de la machine à glace depuis la remontée jusqu’à la clôture, avec une expérience cohérente pour le terrain, le coordinateur, le responsable et le décideur.
