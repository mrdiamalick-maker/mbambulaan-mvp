# Mbàmbulaan MVP Freeze Note

## Statut

Cette note fige le périmètre immédiat de reprise du développement.

Elle ne remplace pas le Product Book v1.0. Elle sert uniquement à transformer la vision stabilisée en slice produit exécutable.

Décision CPO : arrêt des nouveaux packs documentaires. Reprise du développement sur un MVP strict.

## 1. Positionnement figé

Mbàmbulaan est un Operating System de coordination pour la pêche artisanale sénégalaise.

La plateforme ne doit pas être réduite à une marketplace, un ERP, un dashboard ou un site vitrine. Elle organise les signaux, les acteurs, les territoires, les besoins, les lots, les opportunités, les preuves et les décisions.

Vision à 5 ans : toute organisation qui travaille avec la pêche artisanale au Sénégal doit naturellement passer par Mbàmbulaan.

## 2. Objectif du MVP exécutable

Le MVP doit prouver que Mbàmbulaan peut :

- capter ou simuler un signal terrain ;
- qualifier ce signal ;
- relier ce signal à un territoire, un acteur, un besoin ou un lot ;
- détecter une tension ou une opportunité ;
- proposer une action prioritaire ;
- conserver une preuve ou une trace ;
- produire une lecture claire pour la décision.

Le MVP doit montrer l'Operating System en action, même avec des données mockées.

## 3. Slice prioritaire

Parcours prioritaire :

```text
Signal terrain -> qualification -> tension ou opportunité -> action -> preuve -> rapport
```

Ce parcours devient la colonne vertébrale de la reprise du développement.

Il est prioritaire sur : paiement, marketplace complète, messagerie libre, API, certification officielle, scoring bancaire, assurance, export conformité avancée et back-office lourd.

## 4. Pages à développer ou stabiliser

### 4.1 Public / Landing

Objectif : expliquer la vision Operating System sans exposer de données réelles.

Attendus :

- promesse claire ;
- positionnement filière ;
- cas d'usage par acteur ;
- CTA démo ;
- séparation public / privé / démo.

### 4.2 Démo guidée

Objectif : montrer le slice prioritaire de bout en bout.

Attendus :

- scénario contrôlé ;
- signal terrain ;
- qualification ;
- tension ou opportunité ;
- action recommandée ;
- preuve ;
- rapport ou synthèse finale.

### 4.3 Workspace opérationnel

Objectif : donner une entrée contextualisée selon le rôle.

Rôles minimum :

- administrateur Mbàmbulaan ;
- agent ou animateur terrain ;
- acteur offre ;
- acteur demande ;
- décideur ou partenaire.

### 4.4 Arrivages / Signaux terrain

Objectif : déclarer ou afficher les signaux de base.

Attendus :

- espèce ;
- volume ;
- quai ou zone ;
- heure ;
- source ;
- statut ;
- niveau de preuve ;
- qualité déclarée ou estimée.

### 4.5 Besoins

Objectif : structurer la demande.

Attendus :

- acteur demandeur ;
- espèce recherchée ;
- volume ;
- urgence ;
- territoire souhaité ;
- statut ;
- niveau de fiabilité.

### 4.6 Opportunités

Objectif : relier offre et demande avec explication.

Attendus :

- lot ou signal lié ;
- besoin lié ;
- score ou niveau de compatibilité ;
- raisons de la recommandation ;
- action proposée.

### 4.7 Carte territoriale

Objectif : lire les quais, zones, tensions et alertes.

Attendus :

- quais pilotes ;
- zones suivies ;
- tensions ;
- alertes ;
- lots sensibles ;
- besoins critiques ;
- actions prioritaires.

### 4.8 Coordination Center

Objectif : transformer les signaux en actions suivies.

Attendus :

- file de priorités ;
- actions recommandées ;
- responsables ;
- statut ;
- preuve ou trace ;
- fermeture de l'action.

### 4.9 Executive / Rapport

Objectif : produire une synthèse de décision.

Attendus :

- KPI prudents ;
- impact estimé ;
- tensions ;
- actions prises ;
- limites de données ;
- recommandations.

## 5. Composants prioritaires

Composants à stabiliser ou créer :

- `ProductCard` ;
- `MapPanel` ;
- `KpiCard` ;
- `SignalCard` ;
- `NeedCard` ;
- `OpportunityCard` ;
- `ActionQueue` ;
- `ProofBadge` ;
- `TrustBadge` ;
- `QualityBadge` ;
- `TerritoryTensionCard` ;
- `Timeline` ;
- `RoleWorkspaceHeader` ;
- `DecisionSummary` ;
- `EmptyState` ;
- `StatusBadge`.

Règle UI : chaque composant doit aider à décider, pas seulement décorer.

## 6. Données mockées nécessaires

Le MVP reste local et peut utiliser des données mockées.

Modèles minimum :

- actor ;
- organization ;
- territory ;
- quay ;
- arrival ;
- need ;
- opportunity ;
- action ;
- proof ;
- incident ;
- qualityStatus ;
- trustSignal ;
- reportMetric.

Chaque donnée mockée doit pouvoir indiquer :

- source ;
- statut ;
- niveau de preuve ;
- date ;
- territoire ;
- rôle concerné.

## 7. Moteurs métier nécessaires

Moteurs minimum pour la reprise :

- coordination engine ;
- matching engine ;
- tension engine ;
- prioritization engine ;
- trust helper ;
- quality helper ;
- traceability helper ;
- impact summary helper.

Ces moteurs peuvent rester simples et locaux.

Règle : aucune boîte noire. Chaque recommandation doit avoir une explication lisible.

## 8. Non-goals immédiats

À ne pas développer maintenant :

- paiement natif ;
- marketplace complète ;
- messagerie libre ;
- API publique ;
- intégrations externes ;
- certification officielle ;
- scoring bancaire ;
- assurance ;
- conformité export avancée ;
- application mobile dédiée ;
- offline complexe ;
- back-office lourd ;
- moteur IA complexe ;
- pricing définitif ;
- données réelles sensibles.

## 9. Critères de validation produit

Le MVP est validable si :

- un utilisateur comprend que Mbàmbulaan est un Operating System de filière ;
- la démo montre un signal devenir une décision ;
- les arrivages, besoins, opportunités, tensions et actions sont reliés ;
- la carte sert à décider ;
- les preuves et niveaux de fiabilité sont visibles ;
- les limites de données sont explicites ;
- l'executive view produit une synthèse crédible ;
- aucun écran ne ressemble à un dashboard isolé sans action ;
- aucun parcours ne pousse Mbàmbulaan vers une marketplace simple.

## 10. Critères techniques

Avant sortie de la PR :

- `npm run typecheck` doit passer ;
- `npm run build` doit passer ;
- aucune nouvelle dépendance sans justification ;
- aucune API ou base de données imposée ;
- logique métier centralisée dans `src/lib` ;
- composants réutilisables ;
- données mockées isolées ;
- responsive correct sur les vues principales.

## 11. Décision finale

Cette note fige le périmètre de reprise.

Après validation, le travail doit passer en développement sur le slice :

```text
Signal terrain -> qualification -> tension ou opportunité -> action -> preuve -> rapport
```

Tout ajout hors de ce périmètre doit être explicitement justifié par sa contribution à l'Operating System de coordination.