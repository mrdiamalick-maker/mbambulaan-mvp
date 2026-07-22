# Plan de suite post-audit — Mbàmbulaan

## 1. Principe de travail

Le CEO pilote la vision, les arbitrages, les priorités et la validation produit.

Les outils sont répartis clairement :

- **Claude** : audits, challenge stratégique, contradictions, risques, critique produit et recommandations.
- **Codex** : développement, intégration, correction, nettoyage du code et production de versions visibles et testables.
- **CEO** : décisions, priorisation, validation des parcours et arbitrage entre les options.

Mbàmbulaan doit rester un produit à voir, manipuler et tester. Nous ne devons pas transformer le projet en usine documentaire.

## 2. Décision immédiate

Ne pas lancer de nouvel audit interne ni produire de nouveaux blueprints sans besoin direct de développement.

La priorité est désormais de transformer les décisions produit en versions visibles, puis de les tester.

## 3. Séquence recommandée

### Étape 1 — Arbitrage CEO

Décider formellement entre trois options :

- **Option A — Marketplace transactionnelle** : arrivages, besoins, matching, réservation, transactions.
- **Option B — Infrastructure de coordination** : signalement, qualification, décision, action, suivi, confirmation.
- **Option C — Modèle hybride** : infrastructure de coordination avec un module transactionnel secondaire.

La recommandation produit reste de ne pas lancer l'option C comme premier périmètre. Elle cumule les risques des deux modèles et rend le produit plus difficile à comprendre et à développer.

### Étape 2 — Cadrage de développement minimal

Une fois l'option choisie, produire uniquement un brief opérationnel court pour Codex comprenant :

- la promesse produit ;
- l'acteur principal ;
- le parcours à rendre visible ;
- les écrans à construire ou corriger ;
- les règles métier indispensables ;
- les données de démonstration nécessaires ;
- les critères d'acceptation ;
- ce qui est hors périmètre.

Ce brief n'est pas un nouveau blueprint. C'est une instruction de développement.

### Étape 3 — Développement Codex

Codex intervient pour :

- construire le parcours prioritaire ;
- rendre le produit cohérent et navigable ;
- supprimer ou isoler les composants contradictoires ;
- brancher les fondations techniques nécessaires au test ;
- produire une version déployable et visible ;
- documenter uniquement ce qui est indispensable à la maintenance du code.

Codex ne doit pas être utilisé comme auditeur stratégique ni comme product manager principal.

### Étape 4 — Revue CEO du produit visible

À chaque version, le CEO doit pouvoir :

- ouvrir le produit ;
- comprendre immédiatement la promesse ;
- suivre un parcours complet ;
- identifier les incohérences ;
- décider ce qui doit être gardé, corrigé, simplifié ou supprimé.

Les décisions se prennent à partir du produit visible, pas uniquement à partir des documents.

### Étape 5 — Test rapide avec utilisateurs

Dès qu'un parcours est suffisamment cohérent, le montrer à quelques utilisateurs ou relais terrain.

Le but n'est pas encore de lancer une infrastructure nationale. Le but est de vérifier :

- est-ce compris ;
- est-ce utile ;
- est-ce crédible ;
- est-ce utilisable ;
- est-ce que l'acteur reviendrait ;
- quelle valeur opérationnelle est réellement perçue.

### Étape 6 — Audit Claude ciblé

Claude intervient seulement à des moments de décision :

- après une évolution majeure du positionnement ;
- avant un engagement institutionnel important ;
- avant une levée de fonds ;
- lorsqu'une contradiction stratégique importante apparaît ;
- pour challenger une version visible du produit et non uniquement une documentation théorique.

Les audits doivent être ciblés, espacés et orientés décision.

## 4. À faire maintenant

- trancher le premier positionnement produit ;
- choisir un parcours unique à rendre visible ;
- préparer un brief de développement Codex court ;
- développer une version cohérente ;
- la visualiser et la tester ;
- décider la suite à partir de ce retour.

## 5. À ne pas faire maintenant

- produire de nouveaux packs documentaires ;
- demander à Codex un nouvel audit général ;
- construire une matrice exhaustive avant de toucher au produit ;
- modéliser tous les bounded contexts avant le prochain test ;
- enrichir simultanément tous les espaces acteurs ;
- ajouter de nouveaux moteurs métier sans parcours démontrable ;
- confondre volume de documentation et avancement produit.

## 6. Rythme de travail recommandé

Chaque cycle doit suivre cette logique :

1. décision CEO ;
2. brief court ;
3. développement Codex ;
4. version visible ;
5. revue CEO ;
6. test utilisateur ;
7. ajustement.

Claude intervient ponctuellement pour challenger les décisions structurantes, pas dans chaque cycle de développement.

## 7. Critère de progression

Une étape est considérée comme avancée lorsqu'il existe un résultat visible et testable :

- un parcours fonctionne ;
- une décision est compréhensible ;
- un utilisateur peut accomplir une action ;
- une valeur métier peut être expliquée et observée.

Un document seul ne constitue pas une progression produit.
