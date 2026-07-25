# Readiness Codex — Produit Mbàmbulaan

## 1. Conclusion exécutive

Nous ne devons plus produire de nouveaux documents stratégiques généraux avant Codex.

Le dépôt contient déjà suffisamment de matière sur :

- la vision ;
- le domaine métier ;
- les événements ;
- les données ;
- les bounded contexts ;
- l’architecture ;
- le design fonctionnel ;
- le MVP ;
- le backlog ;
- les KPI ;
- les parcours ;
- les wireframes ;
- les flux pilote ;
- le modèle économique ;
- le go-to-market ;
- la gouvernance ;
- l’écosystème ;
- le pilote institutionnel.

Le risque principal n’est plus le manque de documentation. Le risque est désormais la contradiction entre documents, code existant et périmètre demandé à Codex.

Avant le prompt d’exécution unique, trois livrables techniques restent indispensables.

---

# 2. Livrables indispensables avant Codex

## Livrable A — Source de vérité produit exécutable

Objectif : réduire toute la documentation à une décision produit unique.

Ce document doit fixer sans ambiguïté :

- la promesse du produit ;
- les acteurs du premier incrément ;
- le parcours exact ;
- les statuts ;
- les règles métier ;
- les écrans ;
- les données de démonstration ;
- les critères d’acceptation ;
- le hors-périmètre ;
- l’ordre de lecture des documents en cas de contradiction.

Statut : produit et disponible dans `docs/execution/source-de-verite-produit-codex.md`.

## Livrable B — Audit d’écart code / cible

Objectif : demander à Codex de transformer le produit existant sans reconstruire à l’aveugle.

Contenu attendu :

- architecture et stack réellement présentes ;
- routes actuelles ;
- composants réutilisables ;
- données et mocks existants ;
- parcours contradictoires ;
- fonctionnalités marketplace à isoler ou retirer ;
- dette bloquante ;
- tests et CI disponibles ;
- stratégie de migration minimale.

Statut : Codex doit commencer par cet audit technique court, puis exécuter immédiatement. Il ne doit pas s’arrêter pour demander une validation sauf blocage irréversible.

## Livrable C — Contrat d’exécution Codex

Objectif : encadrer une exécution continue avec des gates observables.

Le contrat doit imposer :

- une branche dédiée ;
- des commits cohérents ;
- aucune dérive fonctionnelle ;
- tests à chaque étape ;
- captures d’écran ;
- routes de démonstration ;
- données déterministes ;
- rapport final ;
- PR prête à relire ;
- liste explicite des écarts résiduels.

Statut : intégré dans `docs/execution/prompt-maitre-codex.md`.

---

# 3. Périmètre recommandé pour l’exécution continue

## Acteurs à développer maintenant

### Acteur terrain

Intentions :

- remonter une difficulté ;
- suivre sa prise en charge ;
- constater le résultat.

### Coordinateur

Intentions :

- comprendre la situation ;
- qualifier ;
- désigner un responsable ;
- organiser l’intervention ;
- suivre les blocages ;
- clôturer avec un élément de confirmation.

### Responsable opérationnel

Le responsable opérationnel est interactif dans ce premier incrément.

Il doit pouvoir :

- voir les interventions affectées ;
- démarrer une intervention ;
- mettre à jour l’avancement ;
- signaler un blocage ;
- renseigner un motif d’attente ;
- fournir une confirmation d’intervention ;
- déclarer la fin de l’intervention.

## Acteur à rendre visible principalement en lecture et pilotage

### Décideur / Ministère

- voir les situations ;
- comprendre les délais ;
- distinguer ce qui est réglé, bloqué ou en retard ;
- consulter les résultats agrégés.

## Cas de démonstration obligatoire

Panne d’une machine à glace sur un site de débarquement.

Le scénario doit montrer de bout en bout :

1. la difficulté est remontée ;
2. elle est reçue ;
3. elle est examinée ;
4. elle est prise en charge ;
5. une intervention est prévue ;
6. l’intervention est en cours ;
7. un blocage éventuel est visible ;
8. le résultat est constaté ;
9. la situation est réglée ;
10. le décideur voit ce qui a été réellement résolu.

---

# 4. Vocabulaire obligatoire

## Actions acteur terrain

- Remonter une difficulté
- Suivre ma situation
- Voir ce qui a été fait

## Actions coordinateur

- Comprendre la situation
- Désigner un responsable
- Organiser l’intervention
- Suivre l’avancement
- Constater le résultat

## Statuts utilisateurs

- Reçu
- En cours d’examen
- Pris en charge
- Intervention prévue
- Intervention en cours
- En attente
- Réglé

## Termes à éviter dans l’interface

- workflow
- ticket
- case
- incident management
- preuve
- marketplace
- matching

Le terme `confirmation` est interdit comme libellé de statut principal. Il reste autorisé dans les expressions métier suivantes :

- confirmation d’intervention ;
- élément de confirmation ;
- confirmation de création.

## Alternatives préférées

- situation
- difficulté
- intervention
- photo
- document
- justificatif
- confirmation d’intervention
- constat
- source
- élément de confirmation

---

# 5. Hors périmètre strict

Codex ne doit pas développer dans ce cycle :

- marketplace ;
- arrivages ;
- offres et demandes commerciales ;
- matching ;
- réservation ;
- paiement ;
- transaction ;
- scoring ;
- assurance ;
- financement ;
- logistique avancée ;
- chat complet ;
- moteur national multi-filières ;
- IA décisionnelle ;
- refonte documentaire générale.

Les composants existants correspondants doivent être isolés de la navigation principale, pas nécessairement supprimés s’ils peuvent être conservés sans dette active.

---

# 6. Gates de qualité

## Gate 1 — Cohérence

- une seule promesse visible ;
- navigation sans liens morts ;
- aucun écran principal ne ramène à une logique marketplace ;
- vocabulaire acteur cohérent.

## Gate 2 — Parcours terrain

- création d’une situation en moins de trois minutes ;
- formulaire compréhensible ;
- validation et message de succès ;
- détail consultable ;
- statut visible ;
- prochaine étape visible.

## Gate 3 — Parcours coordinateur

- liste priorisée ;
- détail exploitable ;
- qualification ;
- affectation ;
- planification ;
- mise à jour ;
- clôture.

## Gate 4 — Démonstration

- scénario machine à glace entièrement jouable ;
- données déterministes ;
- aucun écran vide ;
- état initial réinitialisable ;
- routes fournies ;
- captures desktop et mobile.

## Gate 5 — Qualité technique

- installation reproductible ;
- lint ;
- typecheck ;
- tests ;
- build ;
- aucune erreur console critique ;
- responsive minimum ;
- accessibilité de base.

## Gate 6 — Livraison

- branche dédiée ;
- commits lisibles ;
- PR ;
- résumé des changements ;
- instructions de test ;
- écarts résiduels ;
- captures d’écran.

Les critères subjectifs de compréhension et de valeur perçue sont évalués en revue humaine post-PR. Codex ne doit pas s’auto-certifier sur ces critères.

---

# 7. Règle d’arbitrage documentaire

En cas de contradiction, Codex doit appliquer l’ordre suivant :

1. `docs/execution/source-de-verite-produit-codex.md` ;
2. `docs/execution/prompt-maitre-codex.md` ;
3. présent document de readiness ;
4. Issue #42 ;
5. spécifications fonctionnelles du flux pilote ;
6. parcours acteurs et wireframes ;
7. MVP détaillé ;
8. architecture et modèle de domaine ;
9. autres documents stratégiques ;
10. code existant.

Le code existant n’est pas une source de vérité produit. Il est une base technique à réutiliser lorsqu’elle sert la cible.

---

# 8. Usage recommandé de Claude

Un nouvel audit général n’est pas nécessaire avant Codex.

Claude peut être utilisé une seule fois, de manière ciblée, pour challenger :

- la source de vérité exécutable ;
- le prompt maître ;
- les critères d’acceptation ;
- les risques de dérive.

La question à poser à Claude doit être :

> Identifie uniquement les contradictions, ambiguïtés ou conditions manquantes qui pourraient faire dévier une exécution Codex de ce périmètre. Ne propose pas de nouveau produit et ne crée pas de nouveau blueprint.

Après ce challenge, les arbitrages sont intégrés une seule fois, puis Codex démarre.

---

# 9. Décision de lancement

Les éléments nécessaires sont désormais consolidés :

- source de vérité exécutable ;
- scénario et données de démonstration ;
- critères d’acceptation ;
- contrat d’exécution ;
- ordre de priorité documentaire.

Aucun Investor Deck, Ministry Deck, Executive Summary ou document marketing supplémentaire n’est requis pour commencer le développement produit.

---

# 10. Position CPO

La priorité absolue est maintenant de produire une version visible, cohérente et testable.

Le bon objectif n’est pas :

> Codex développe tout Mbàmbulaan en continu.

Le bon objectif est :

> Codex transforme le dépôt existant en une première tranche verticale complète de coordination, démontrable de bout en bout, techniquement propre et sans dérive marketplace.

Une exécution trop large augmenterait fortement le risque d’erreur, de consommation inutile de limite et de produit incohérent.
