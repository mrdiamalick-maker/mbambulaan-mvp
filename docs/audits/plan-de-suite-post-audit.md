# Plan de suite post-audit — Mbàmbulaan

## 1. Décision immédiate

Ne pas reprendre le développement ni produire de nouveaux blueprints tant que les contradictions structurantes relevées par l'audit ne sont pas arbitrées.

La priorité n'est pas de corriger le code. La priorité est de rétablir une seule vérité produit.

## 2. Séquence recommandée

### Étape 1 — Arbitrage fondateur

Décider formellement entre trois options :

- **Option A — Marketplace transactionnelle** : arrivages, besoins, matching, réservation, transactions.
- **Option B — Infrastructure de coordination publique** : signalement, qualification, décision, action, suivi, confirmation.
- **Option C — Modèle hybride** : infrastructure de coordination avec un module transactionnel secondaire.

La recommandation produit est de ne pas retenir l'option C maintenant. Elle cumule les risques des deux autres modèles et dilue le go-to-market.

### Étape 2 — Source de vérité unique

Créer un document de référence unique qui précise :

- le problème prioritaire ;
- l'acteur principal ;
- le bénéficiaire ;
- le décideur ;
- le payeur ;
- le flux MVP unique ;
- les objets métier nécessaires ;
- les résultats mesurables ;
- ce qui est explicitement hors périmètre.

Tous les anciens documents contradictoires devront être marqués comme :

- `ACTIF` ;
- `CIBLE FUTURE` ;
- `OBSOLETE` ;
- `A RECONCILIER`.

### Étape 3 — Matrice de vérité

Construire une matrice avec les colonnes suivantes :

| Élément | Documenté | Codé | Testé | Validé terrain | Décision | Action |
|---|---:|---:|---:|---:|---|---|

Cette matrice doit couvrir :

- vision ;
- acteurs ;
- parcours ;
- bounded contexts ;
- événements métier ;
- écrans ;
- fonctionnalités ;
- KPI ;
- modèle économique.

### Étape 4 — Pilote terrain

Choisir :

- un territoire ;
- un problème unique ;
- un sponsor opérationnel réel ;
- cinq à quinze utilisateurs réels ;
- une baseline ;
- trois KPI maximum ;
- une durée de test limitée.

Le pilote doit mesurer une valeur opérationnelle, par exemple :

- réduction du délai entre signalement et décision ;
- réduction du nombre de relances ;
- augmentation du taux d'actions clôturées ;
- amélioration de la visibilité sur les engagements.

### Étape 5 — Audit Codex

Quand le quota Codex sera disponible, lui demander un audit strict du dépôt, sans développement.

Livrables attendus :

- carte de l'existant ;
- liste des routes et composants ;
- liste des données mockées ;
- doublons et composants obsolètes ;
- écarts entre code et source de vérité ;
- dette technique ;
- plan de nettoyage ;
- estimation de l'effort pour un pilote fonctionnel.

### Étape 6 — Reprise du développement

Le développement ne reprend qu'après validation des quatre conditions suivantes :

1. positionnement tranché ;
2. source de vérité validée ;
3. pilote cadré ;
4. backlog réduit au flux prioritaire.

## 3. Décisions recommandées à ce stade

### À faire maintenant

- geler les nouveaux documents ;
- trancher le positionnement ;
- produire la source de vérité ;
- préparer la matrice de vérité ;
- cadrer un pilote terrain ;
- préparer le prompt d'audit Codex.

### À ne pas faire maintenant

- enrichir les dashboards ;
- ajouter de nouveaux moteurs ;
- implémenter les 13 bounded contexts ;
- étendre à d'autres filières ;
- travailler le scoring ou les services financiers ;
- lancer une communication institutionnelle forte ;
- présenter le produit comme un MVP opérationnel.

## 4. Recommandation stratégique

La prochaine décision structurante est le choix entre :

- une **plateforme transactionnelle de filière**, plus proche du produit déjà codé ;
- une **infrastructure de coordination**, plus proche de la vision stratégique et du besoin institutionnel.

La seconde option semble plus cohérente avec l'ambition Mbàmbulaan, mais elle exige d'accepter que le code actuel soit principalement un prototype exploratoire et non la base du MVP final.

## 5. Critère de sortie de la phase de consolidation

Cette phase est terminée lorsque l'équipe peut répondre en une page, sans contradiction, aux questions suivantes :

- Quel problème précis résolvons-nous en premier ?
- Pour qui ?
- Qui bénéficie ?
- Qui décide ?
- Qui paie ?
- Quel flux unique testons-nous ?
- Quel résultat mesurable devons-nous obtenir ?
- Qu'est-ce qui est explicitement hors périmètre ?
