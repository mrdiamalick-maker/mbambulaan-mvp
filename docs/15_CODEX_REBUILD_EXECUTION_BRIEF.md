# Codex Rebuild Execution Brief Mbàmbulaan

## Statut

Ce fichier est le brief opérationnel à lire directement sur la branche `rebuild-premium-template`.

Il ne remplace pas les documents produit. Il sert de checklist d'exécution pour Codex ou pour tout développeur qui reprend la reconstruction.

## Branche

`rebuild-premium-template`

## Mission

Reconstruire proprement le frontend Mbàmbulaan à partir du blueprint produit et de la décision template.

Mbàmbulaan doit apparaître comme une infrastructure de coordination premium pour la pêche artisanale sénégalaise, pas comme une marketplace, pas comme un dashboard générique et pas comme une simple application.

## Documents à lire avant de coder

- `docs/07_PRODUCT_UX_BLUEPRINT_FINAL.md`
- `docs/08_TEMPLATE_SELECTION_GUIDE.md`
- `docs/09_TEMPLATE_MAPPING_MBAMBULAAN.md`
- `docs/10_TEMPLATE_SHORTLIST.md`
- `docs/11_SELECTED_TEMPLATE_MAPPING.md`
- `docs/12_REBUILD_PREMIUM_TEMPLATE_PROMPT.md`
- `docs/14_TEMPLATE_DECISION.md`

## Référence template

Template prioritaire : TailAdmin.

Utiliser TailAdmin comme référence de structure : app shell, sidebar, cards KPI, tables, charts, map panels, forms, dashboards.

Ne pas copier un template tel quel. Transformer les patterns en espaces métier Mbàmbulaan.

## Parcours cible

`/` acquisition premium
→ `/demo` sélection de rôle
→ `/demo/<role>` preuve de valeur métier
→ `/demande-demo` ou `/devis` cadrage commercial
→ `/espace-prive` espace premium simulé après souscription

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

## Données mockées

Créer :

`src/data/mockMbambulaan.ts`

Inclure :

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

## Composants partagés attendus

Créer ou restructurer autour de composants partagés :

- app shell ;
- sidebar ;
- topbar ;
- KPI cards ;
- role selector ;
- role workspace ;
- data table ;
- activity feed ;
- territory panel ;
- report cards ;
- lead forms ;
- module gate.

## Règles strictes

- Ne pas repartir de PR #13 comme base finale.
- Ne pas exposer les modules métier comme pages publiques autonomes.
- Ne pas transformer Mbàmbulaan en marketplace.
- Ne pas faire une app pêcheur-first complète au MVP.
- Ne pas créer une série de pages isolées sans parcours.
- Ne pas mélanger plusieurs directions visuelles.
- Ne pas faire une landing longue et explicative.

## Ce que le rendu doit prouver

Avant achat : le prospect comprend rapidement la promesse et explore une démo adaptée à son rôle.

Après souscription : le partenaire voit un espace premium crédible avec modules, données, KPIs, actions, rapports et preuves.

## Critères d'acceptation

- Landing premium courte et claire.
- Démo par rôle non générique.
- Chaque rôle a une valeur métier distincte.
- Espace privé crédible comme produit quotidien après souscription.
- Modules métier accessibles dans l'espace premium, pas comme pages publiques.
- Typecheck OK.
- Build OK.

## Validation technique

Exécuter :

```bash
npm install
npm run typecheck
npm run build
```

## PR attendue

Mettre à jour la PR draft associée à `rebuild-premium-template` vers `main` ou en créer une si elle n'existe pas.

La PR doit rester draft tant que le rendu visuel n'est pas validé.