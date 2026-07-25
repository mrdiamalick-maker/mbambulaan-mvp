# Mbàmbulaan — Décision : reprendre le développement maintenant

## 1. Arbitrage

La décision est de **reprendre le développement maintenant**, mais de manière strictement guidée par les six documents métier déjà produits.

Nous ne poursuivons pas, à ce stade, une longue série documentaire complète sur l'architecture DDD, les bounded contexts, les agrégats, les événements et la roadmap technique.

Ces documents restent utiles, mais leur valeur marginale est désormais inférieure à celle d'une confrontation rapide avec le produit existant et le terrain.

---

## 2. Pourquoi reprendre le développement

Nous disposons déjà de suffisamment de matière pour éviter un développement aveugle :

- carte des flux de valeur ;
- infrastructures numériques ;
- capacités métier ;
- cartographie des acteurs ;
- modèles économiques ;
- roadmap MVP.

Continuer à documenter sans tester le code risquerait de produire une architecture théorique trop détaillée avant validation opérationnelle.

Le domaine existant contient déjà plusieurs objets et services alignés avec la boucle MVP :

- `ExpectedReturn` ;
- `Landing` ;
- `Weighing` ;
- `Lot` ;
- `Capacity` ;
- `Tension` ;
- `Commitment` ;
- `Outcome` ;
- `announceExpectedReturn` ;
- `confirmLanding` ;
- `registerWeighing` ;
- `createLot` ;
- `reportTension` ;
- `createCommitment` ;
- `recordOutcome`.

La prochaine source d'apprentissage doit donc être l'écart entre :

- les capacités métier prioritaires ;
- le domaine réellement implémenté ;
- les parcours existants ;
- les données manquantes ;
- les règles métier encore faibles ou absentes.

---

## 3. Ce que nous ne faisons pas

Nous ne reprenons pas le développement comme avant.

Nous ne devons pas :

- construire de nouveaux écrans isolés ;
- ajouter des entités sans résultat métier associé ;
- étendre le périmètre vers le paiement, le crédit, l'assurance ou une marketplace complète ;
- perfectionner l'architecture pour des besoins futurs non validés ;
- créer une documentation DDD exhaustive avant d'avoir identifié les vrais écarts du code.

---

## 4. Mode de reprise retenu

La reprise doit commencer par un **audit d'alignement produit-domaine**, puis par une seule tranche verticale de la boucle MVP.

### Étape 1 — Audit du domaine existant

Comparer les fichiers suivants aux capacités P0 et P1 :

- `src/domain/types.ts` ;
- `src/domain/data.ts` ;
- `src/domain/repositories.ts` ;
- `src/domain/selectors.ts` ;
- `src/domain/services.ts` ;
- `src/domain/validation.ts`.

Pour chaque capacité, déterminer :

- couverte ;
- partiellement couverte ;
- absente ;
- mal modélisée ;
- prématurée ;
- à supprimer ou différer.

### Étape 2 — Identifier les écarts critiques

Les écarts prioritaires à vérifier sont :

- besoin de service rattaché à un retour ;
- capacité réellement disponible dans le temps et sur un territoire ;
- proposition ou affectation d'une capacité ;
- réservation et confirmation d'exécution ;
- responsable explicite d'une tension ;
- échéance et retard d'un engagement ;
- preuve d'exécution ;
- valeur créée en FCFA avec méthode et niveau de confiance ;
- permissions et saisie assistée.

### Étape 3 — Construire une tranche verticale

La première tranche doit couvrir :

```text
Retour annoncé
→ besoin de service
→ capacité identifiée
→ tension si manque
→ engagement
→ exécution
→ résultat
```

Cette tranche doit être fonctionnelle de bout en bout avant d'élargir le produit.

---

## 5. Documentation encore autorisée

La documentation ne s'arrête pas. Elle devient **juste-à-temps**.

Nous produisons uniquement les documents nécessaires pour sécuriser une décision de code immédiate.

### Documents autorisés pendant la reprise

- ADR courts pour les décisions structurantes ;
- langage ubiquitaire ciblé sur les termes ambigus ;
- schéma de flux pour la tranche en cours ;
- invariants associés aux entités modifiées ;
- cas d'usage détaillé avant implémentation ;
- critères d'acceptation et tests métier.

### Documents différés

- cartographie exhaustive des bounded contexts ;
- catalogue complet des événements métier ;
- architecture cible multi-années ;
- stratégie d'intégration nationale ;
- modèle complet de scoring ;
- documentation des services financiers futurs.

---

## 6. Règle d'investissement produit

Chaque développement doit passer ce filtre :

1. Quelle capacité métier sert-il ?
2. Quel acteur l'utilise ?
3. Quel acteur en bénéficie ?
4. Quelle décision améliore-t-il ?
5. Quelle valeur permet-il de mesurer ?
6. Est-il nécessaire pour la boucle MVP actuelle ?
7. Peut-il être testé sans infrastructure plus lourde ?

Une réponse floue à ces questions signifie que le développement doit être différé.

---

## 7. Prochain livrable recommandé

Le prochain travail dans le dépôt doit être un **audit d'alignement du domaine existant**.

Livrable attendu :

`docs/architecture/01-audit-alignement-domaine-mvp.md`

Il devra contenir :

- les capacités P0/P1 ;
- leur couverture dans le code ;
- les fichiers concernés ;
- les règles déjà présentes ;
- les incohérences ;
- les dettes ;
- les suppressions éventuelles ;
- le backlog technique priorisé ;
- la première tranche verticale à implémenter.

---

## 8. Décision finale

**Nous reprenons le développement.**

Mais nous le reprenons sous une nouvelle discipline :

> documents métier comme référentiel, audit du code comme point de départ, tranche verticale comme unité de livraison, et documentation technique uniquement lorsqu'elle soutient une décision immédiate.

Cette approche réduit deux risques opposés :

- construire trop vite un produit mal aligné ;
- documenter trop longtemps sans produire d'apprentissage réel.
