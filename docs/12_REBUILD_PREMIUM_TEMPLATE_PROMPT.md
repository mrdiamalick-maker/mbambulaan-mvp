# Rebuild Premium Template Prompt — Mbàmbulaan

## Statut

Ce document prépare la prochaine mission Codex après validation du blueprint et du choix template.

Il ne faut pas encore reconstruire tant que PR 16 et PR 18 ne sont pas validées.

## Objectif de la future mission

Reconstruire proprement l'expérience Mbàmbulaan à partir du blueprint produit et du template choisi.

La reconstruction doit montrer deux moments :

1. avant achat : landing premium, démo par rôle, preuve de valeur ;
2. après souscription : espace premium simulé avec sidebar, modules, données mockées, KPIs, actions et rapports.

## Branche cible

Créer une nouvelle branche :

`rebuild-premium-template`

Ne pas repartir de la PR 13 comme base finale.

## Sources à respecter

Lire et appliquer :

- `docs/07_PRODUCT_UX_BLUEPRINT_FINAL.md`
- `docs/08_TEMPLATE_SELECTION_GUIDE.md`
- `docs/09_TEMPLATE_MAPPING_MBAMBULAAN.md`
- `docs/10_TEMPLATE_SHORTLIST.md`
- `docs/11_SELECTED_TEMPLATE_MAPPING.md`

## Règles strictes

- Ne pas exposer les modules métier comme pages publiques autonomes.
- Ne pas transformer Mbàmbulaan en marketplace.
- Ne pas créer une app pêcheur-first complète au MVP.
- Ne pas faire une landing trop explicative.
- Ne pas multiplier les pages incohérentes.
- Ne pas coder avant d'avoir compris le parcours complet.

## Routes à reconstruire

- `/`
- `/demo`
- `/demo/etat`
- `/demo/ong`
- `/demo/collectivite`
- `/demo/pecheur`
- `/demo/mareyeur`
- `/demo/exportateur`
- `/demo/organisation`
- `/demo/investisseur`
- `/demande-demo`
- `/devis`
- `/espace-prive`

## Modules privés à intégrer dans l'espace premium

- Vue d'ensemble
- Territoires
- Signaux
- Acteurs
- Programmes
- Financements
- Produits / flux
- Coordination
- Rapports
- Preuves
- Paramètres

## Données mockées à créer

Créer un fichier :

`src/data/mockMbambulaan.ts`

Il doit contenir :

- territoires ;
- acteurs ;
- rôles ;
- signaux ;
- programmes ;
- financements ;
- produits ;
- rapports ;
- actions ;
- permissions ;
- KPIs par rôle.

## Expérience attendue

### Landing

Courte, premium, claire.

Objectif : acquisition.

CTA : explorer la démo, cadrer un pilote.

### Démo

Choix de rôle premium.

La page ne doit pas être une simple grille répétitive.

### Espaces de démo

Chaque rôle doit avoir une expérience distincte.

Le prospect doit comprendre : problème, valeur, données, décisions, CTA.

### Cadrage commercial

`/demande-demo` et `/devis` doivent qualifier le prospect et l'amener vers l'espace premium simulé.

### Espace privé

Simuler le produit final après souscription.

Il doit contenir une vraie sidebar, des KPIs, des modules, des données mockées, des actions et des rapports.

## Critères d'acceptation

La mission est réussie si :

- le build passe ;
- le typecheck passe ;
- les routes clés fonctionnent ;
- le parcours public vers espace premium est clair ;
- le produit paraît premium, crédible et B2B ;
- les modules métier ne sont pas exposés publiquement ;
- chaque rôle a une valeur claire ;
- l'espace privé donne l'impression d'un produit quotidien réel.

## Commandes de validation

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Ordre d'implémentation recommandé

1. intégrer le template choisi ;
2. créer design tokens Mbàmbulaan ;
3. créer `mockMbambulaan.ts` ;
4. créer l'app shell ;
5. reconstruire landing ;
6. reconstruire `/demo` ;
7. reconstruire les espaces par rôle ;
8. reconstruire `/espace-prive` ;
9. reconstruire formulaires ;
10. neutraliser les anciennes routes publiques de modules ;
11. valider typecheck et build.
