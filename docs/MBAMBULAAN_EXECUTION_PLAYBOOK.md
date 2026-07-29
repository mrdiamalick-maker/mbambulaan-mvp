# Mbàmbulaan Execution Playbook

## Statut du document

Ce document décrit la méthode d’exécution attendue pour toute intervention structurante sur Mbàmbulaan, qu’elle soit réalisée par Codex, un développeur, un architecte, un designer ou un agent d’intelligence artificielle.

Il complète :

1. `MBAMBULAAN_PRODUCT_ENGINEERING_DOCTRINE.md` — pourquoi et selon quels principes ;
2. `MBAMBULAAN_EXECUTION_PLAYBOOK.md` — comment travailler ;
3. `CODEX_MASTER_EXECUTION_PROMPT.md` — quoi exécuter maintenant.

En cas de conflit, la doctrine prévaut sur le playbook. Les décisions récentes et explicites prévalent sur les documents plus anciens.

---

# 1. Finalité du playbook

Le playbook vise à empêcher cinq dérives :

- développer avant de comprendre ;
- ajouter des écrans au lieu de consolider des parcours ;
- dupliquer le domaine ou les routes ;
- implémenter plusieurs capabilities de manière incomplète ;
- laisser un repository incohérent, fragile ou non exécutable.

Le résultat attendu n’est pas le maximum de code produit.

Le résultat attendu est le maximum de valeur métier cohérente, démontrable et maintenable.

---

# 2. Principes d’exécution non négociables

## 2.1 Comprendre avant de modifier

Aucune modification structurante ne commence avant :

- l’exploration du repository ;
- l’identification des documents normatifs ;
- la compréhension du modèle métier ;
- la cartographie des routes, domaines, composants et flux existants ;
- l’identification des contradictions et duplications.

## 2.2 Finir avant d’étendre

Une capability terminée vaut mieux que cinq capabilities amorcées.

Lorsqu’un parcours est incomplet, il doit être consolidé avant de créer un nouveau parcours.

## 2.3 Converger avant d’enrichir

Avant d’ajouter une nouvelle couche, il faut réduire :

- les architectures parallèles ;
- les modèles concurrents ;
- les routes dupliquées ;
- les composants redondants ;
- les conventions divergentes.

## 2.4 Préserver le produit

Toute intervention doit conserver :

- la nature d’infrastructure de coordination ;
- le parcours de coordination de référence ;
- le modèle configurable sans forks ;
- les traces opérationnelles ;
- les résultats observables ;
- les niveaux de confiance ;
- la distinction entre utilisateurs, bénéficiaires, décideurs, payeurs et financeurs.

## 2.5 Laisser le repository meilleur qu’à l’arrivée

À la fin de l’intervention :

- le repository doit être exécutable ;
- le build doit passer ;
- les tests pertinents doivent passer ;
- la documentation impactée doit être à jour ;
- les arbitrages doivent être traçables ;
- aucune architecture parallèle ne doit avoir été introduite.

---

# 3. Hiérarchie de lecture

L’exécutant doit lire les sources dans cet ordre :

1. doctrine produit et engineering ;
2. décisions et arbitrages récents ;
3. présent playbook ;
4. prompt d’exécution courant ;
5. MVP Freeze Note pour l’ordre immédiat ;
6. Product Book, blueprints et modèle métier ;
7. Lots 1 à 23 pour les capabilities et contraintes futures ;
8. audits récents ;
9. documentation historique ;
10. anciens prompts, considérés comme archives.

En cas de contradiction :

- identifier explicitement la contradiction ;
- retenir la source la plus récente et la plus normative ;
- documenter l’arbitrage ;
- ne jamais tenter de satisfaire simultanément deux instructions incompatibles.

---

# 4. Séquence d’exécution obligatoire

## Phase 0 — Sécurisation

Avant toute modification :

- vérifier la branche de travail ;
- vérifier la branche cible ;
- identifier les PR ouvertes ;
- confirmer que la PR #52 ne sera ni modifiée, ni fusionnée, ni marquée prête pour review, ni fermée, ni configurée en auto-merge ;
- créer une branche dédiée si nécessaire ;
- relever l’état initial du build et des tests.

### Sortie attendue

Un état initial fiable et un périmètre de travail sécurisé.

---

## Phase 1 — Exploration du repository

Explorer :

- l’arborescence ;
- les routes ;
- les domaines ;
- les modèles de données ;
- les services ;
- les composants ;
- les seeds et fixtures ;
- les tests ;
- la documentation ;
- les workflows CI/CD ;
- les configurations d’environnement.

L’exploration doit répondre à quatre questions :

1. Qu’est-ce qui fonctionne réellement ?
2. Qu’est-ce qui est seulement démonstratif ?
3. Qu’est-ce qui est dupliqué ?
4. Qu’est-ce qui bloque le parcours de coordination de référence ?

### Sortie attendue

Une carte synthétique de l’existant et des risques.

---

## Phase 2 — Audit et arbitrages

Classer chaque constat dans une des catégories suivantes :

- à préserver ;
- à consolider ;
- à unifier ;
- à refactorer ;
- à supprimer ;
- à différer ;
- à préparer architecturalement.

Pour chaque arbitrage, préciser :

- le problème ;
- l’impact métier ;
- l’impact technique ;
- la décision ;
- le risque ;
- la vérification attendue.

### Règle

Ne jamais supprimer un élément métier sans solution de remplacement ou justification documentée.

### Sortie attendue

Un plan d’intervention ordonné par valeur et dépendances.

---

## Phase 3 — Convergence architecturale

Avant le développement fonctionnel :

- unifier les routes concurrentes ;
- choisir une seule structure d’espaces par rôle ;
- consolider le modèle de domaine partagé ;
- centraliser les règles métier ;
- supprimer la logique métier des composants ;
- clarifier les responsabilités entre domaine, application, infrastructure et interface ;
- aligner les données de démonstration sur le modèle réel.

### Règle

Aucune nouvelle capability ne doit être construite sur une architecture dont la duplication est déjà connue.

### Sortie attendue

Une base cohérente permettant de développer sans ajouter de dette structurelle.

---

## Phase 4 — Développement du parcours cœur

Le parcours prioritaire est :

`Pirogue / acteur terrain -> retour ou signal -> besoin opérationnel -> arrivée -> débarquement -> pesée -> lot -> disponibilité -> besoin ou débouché -> tension ou opportunité -> engagement -> action coordonnée -> trace opérationnelle -> résultat observable -> rapport`

L’objectif n’est pas de représenter toutes les variantes possibles.

L’objectif est de rendre ce parcours :

- complet ;
- compréhensible ;
- navigable ;
- multi-rôles ;
- persistant ;
- démontrable ;
- testable ;
- extensible.

### Ordre de priorité interne

1. signal ou besoin ;
2. qualification ;
3. affectation ou engagement ;
4. action coordonnée ;
5. trace opérationnelle ;
6. résultat observable ;
7. restitution et rapport.

### Exceptions minimales à traiter

- information incomplète ;
- conflit ou doublon ;
- acteur indisponible ;
- action annulée ;
- engagement non tenu ;
- niveau de confiance insuffisant ;
- absence de débouché ;
- réseau dégradé ou reprise ultérieure.

### Sortie attendue

Un parcours de coordination de référence démontrable de bout en bout.

---

## Phase 5 — Socle réel minimal

Le produit ne doit pas rester une démonstration jetable.

Le socle minimal comprend, selon la stack existante :

- authentification ;
- rôles et autorisations ;
- organisations ;
- territoires et sites ;
- persistance ;
- migrations ;
- seeds cohérents ;
- historique minimal ;
- traces opérationnelles ;
- audit des actions sensibles ;
- gestion raisonnable des erreurs.

### Règle

Construire le socle strictement nécessaire au parcours cœur. Ne pas développer un back-office lourd ou une plateforme d’administration complète.

### Sortie attendue

Un noyau fonctionnel crédible qui ne devra pas être réécrit pour devenir réel.

---

## Phase 6 — UX et espaces de travail

Les interfaces doivent permettre de :

- comprendre la situation ;
- identifier les priorités ;
- prendre une décision ;
- agir ;
- vérifier les éléments de confiance ;
- suivre le résultat.

### Règles

- pas de dashboard passif ;
- pas de KPI sans contexte ;
- pas de notification sans action possible ;
- pas de liste sans priorisation ;
- pas d’écran décoratif ;
- pas de redesign global non justifié ;
- pas de duplication d’interface par territoire ;
- une seule logique de navigation par rôle.

### Sortie attendue

Des espaces de travail cohérents, responsives et orientés décision.

---

## Phase 7 — Qualité, tests et non-régression

Tester en priorité :

- les transitions d’état ;
- les règles métier ;
- les permissions ;
- le parcours cœur ;
- les exceptions critiques ;
- la persistance ;
- les migrations ;
- les données seedées ;
- les routes principales.

### Vérifications obligatoires

- typecheck ;
- lint si disponible ;
- tests unitaires pertinents ;
- tests d’intégration pertinents ;
- build de production ;
- vérification manuelle du parcours cœur.

### Règle

Un test ne doit pas seulement vérifier qu’un composant s’affiche. Il doit vérifier qu’une règle ou un résultat attendu est respecté.

### Sortie attendue

Un repository stable et une démonstration reproductible.

---

## Phase 8 — Documentation utile

Mettre à jour uniquement les documents nécessaires pour :

- expliquer l’architecture retenue ;
- documenter les arbitrages structurants ;
- décrire l’installation et l’exécution ;
- expliquer les seeds ;
- expliquer le parcours cœur ;
- préciser les limites et suites recommandées.

### Interdits

- créer des documents redondants ;
- réécrire le Product Book ;
- produire une documentation volumineuse sans utilité opérationnelle ;
- multiplier les ADR pour des décisions mineures.

### Sortie attendue

Une documentation courte, exacte et exploitable.

---

## Phase 9 — Préparation de la PR

La PR doit contenir :

- le problème traité ;
- les décisions prises ;
- les changements majeurs ;
- le parcours démontrable ;
- les tests exécutés ;
- les limites ;
- les risques ;
- les suites proposées ;
- la confirmation explicite que la PR #52 n’a pas été modifiée.

La PR doit être créée en draft.

### Sortie attendue

Une PR lisible, auditable et prête pour une revue fondatrice.

---

# 5. Arbitrages obligatoires

Lorsqu’il faut choisir entre deux options, appliquer les priorités suivantes :

## 5.1 Cohérence contre volume

Choisir la cohérence.

## 5.2 Parcours complet contre écrans supplémentaires

Choisir le parcours complet.

## 5.3 Réduction de dette contre fonctionnalité secondaire

Choisir la réduction de dette.

## 5.4 Valeur métier contre sophistication technique

Choisir la valeur métier.

## 5.5 Configuration contre fork

Choisir la configuration.

## 5.6 Modèle partagé contre logique locale dupliquée

Choisir le modèle partagé.

## 5.7 Trace vérifiable contre déclaration de confiance

Choisir la trace vérifiable.

## 5.8 Résultat observable contre métrique décorative

Choisir le résultat observable.

## 5.9 Simplicité évolutive contre abstraction prématurée

Choisir la simplicité évolutive.

## 5.10 Livraison terminée contre chantier large inachevé

Choisir la livraison terminée.

---

# 6. Definition of Done Mbàmbulaan

Une capability est considérée comme terminée uniquement si les conditions suivantes sont réunies.

## Domaine

- les concepts métier sont nommés clairement ;
- les règles métier sont centralisées ;
- les états et transitions sont cohérents ;
- les exceptions principales sont traitées.

## Parcours

- l’entrée du parcours est identifiable ;
- les rôles concernés peuvent agir ;
- le résultat est observable ;
- la trace opérationnelle existe ;
- les responsabilités sont explicites.

## Données

- les données sont persistées ou seedées de manière cohérente ;
- leur origine et leur statut sont compréhensibles ;
- les niveaux de confiance sont représentés lorsque nécessaire ;
- aucune donnée inutile n’est collectée.

## Interface

- l’utilisateur comprend la situation ;
- l’action principale est claire ;
- les erreurs et états vides sont gérés ;
- l’interface est responsive ;
- l’accessibilité minimale est respectée.

## Technique

- le typecheck passe ;
- les tests pertinents passent ;
- le build passe ;
- aucune logique métier critique n’est enfouie dans les composants ;
- aucune architecture parallèle n’est introduite.

## Documentation

- les décisions structurantes sont documentées ;
- les instructions d’exécution sont à jour ;
- les limites sont explicites.

Une capability qui ne respecte pas ces critères doit être qualifiée de partielle, expérimentale ou préparatoire. Elle ne doit pas être présentée comme terminée.

---

# 7. Règles en cas de temps limité

Si le temps, le contexte ou les ressources ne permettent pas de tout réaliser :

1. arrêter d’ouvrir de nouveaux chantiers ;
2. terminer le parcours déjà engagé ;
3. supprimer ou désactiver proprement les éléments incomplets ;
4. garantir que le build reste vert ;
5. documenter les écarts ;
6. classer les suites par priorité ;
7. ne jamais masquer une incapacité derrière une interface statique.

### Ordre de sauvegarde

En cas de contrainte forte, préserver dans cet ordre :

1. cohérence du domaine ;
2. parcours cœur ;
3. intégrité des données ;
4. permissions ;
5. tests critiques ;
6. build ;
7. UX ;
8. documentation ;
9. fonctionnalités secondaires.

---

# 8. Critères d’arrêt

L’exécution doit s’arrêter lorsqu’une des situations suivantes survient :

- une décision fondatrice manque et ne peut pas être inférée sans risque ;
- une migration présente un risque de perte de données non maîtrisé ;
- la PR #52 risque d’être modifiée ;
- une dépendance externe indispensable est inaccessible ;
- le build ne peut plus être restauré dans le temps disponible ;
- deux choix architecturaux incompatibles exigent un arbitrage fondateur ;
- la poursuite produirait davantage de dette que de valeur.

Dans ce cas, l’exécutant doit :

- arrêter proprement ;
- documenter le blocage ;
- conserver un état stable ;
- proposer une décision claire ;
- ne pas improviser un contournement irréversible.

---

# 9. Interdits absolus

Ne jamais :

- toucher au statut de la PR #52 ;
- fusionner une PR sans décision explicite ;
- activer l’auto-merge ;
- créer un fork produit par persona, client ou territoire ;
- créer une architecture de routes parallèle ;
- déplacer la logique métier dans les composants ;
- construire un écran sans parcours ;
- présenter une donnée non vérifiable comme certaine ;
- implémenter un paiement natif, une assurance native ou un scoring bancaire ;
- transformer Mbàmbulaan en marketplace, ERP, CRM, banque ou dashboard ;
- masquer une fonctionnalité incomplète derrière des données statiques trompeuses ;
- supprimer un domaine existant sans analyse d’impact ;
- introduire une nouvelle technologie sans bénéfice démontrable ;
- réécrire l’ensemble du produit sans nécessité.

---

# 10. Livrables minimaux d’une grande itération

Une grande itération doit produire au minimum :

- une note d’audit synthétique ;
- une liste d’arbitrages ;
- un modèle ou une architecture convergée ;
- un parcours métier démontrable ;
- des données cohérentes ;
- des tests ;
- un build réussi ;
- une documentation de démarrage à jour ;
- une PR draft détaillée.

Les documents ne remplacent jamais le produit fonctionnel.

---

# 11. Grille de contrôle finale

Avant de conclure, vérifier :

## Produit

- La coordination est-elle meilleure ?
- Le parcours est-il complet ?
- Le résultat est-il observable ?
- Les acteurs savent-ils quoi faire ?

## Confiance

- L’information est-elle traçable ?
- Son niveau de confiance est-il compréhensible ?
- Les validations sont-elles visibles ?

## Business

- Le bénéficiaire est-il identifiable ?
- Le décideur est-il identifiable ?
- Le payeur potentiel est-il identifiable ?
- La valeur créée peut-elle être expliquée ?

## Architecture

- Existe-t-il une seule logique métier ?
- Existe-t-il une seule architecture de routes ?
- Les variations sont-elles configurables ?
- La dette a-t-elle diminué ?

## Qualité

- Les tests passent-ils ?
- Le build passe-t-il ?
- Les erreurs principales sont-elles gérées ?
- Le repository est-il plus facile à maintenir ?

## Gouvernance

- Les arbitrages sont-ils documentés ?
- Les limites sont-elles explicites ?
- La PR #52 est-elle strictement inchangée ?

---

# 12. Résultat attendu

À la fin d’une intervention conforme à ce playbook, Mbàmbulaan doit être :

- plus cohérent ;
- plus utile ;
- plus démontrable ;
- plus crédible techniquement ;
- plus facile à exploiter ;
- plus proche d’un modèle économique durable ;
- mieux préparé pour le terrain ;
- sans perte de son identité d’infrastructure de coordination.

La réussite ne se mesure pas au nombre de fichiers modifiés.

Elle se mesure à la capacité du produit à mieux coordonner des acteurs réels autour d’un résultat observable et vérifiable.
