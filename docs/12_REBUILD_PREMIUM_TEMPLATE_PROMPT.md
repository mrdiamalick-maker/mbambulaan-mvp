# Rebuild Premium Template Prompt Mbambulaan

## Statut

Ce document prepare la prochaine mission Codex apres validation du blueprint et du choix template.

Ne pas reconstruire tant que les PR documentaires ne sont pas validees.

## Objectif

Reconstruire proprement l experience Mbambulaan a partir du blueprint produit et du template choisi.

La reconstruction doit montrer deux moments : avant achat avec landing premium et demo par role, puis apres souscription avec espace premium simule, sidebar, modules, donnees mockees, KPIs, actions et rapports.

## Branche cible

Creer une nouvelle branche :

`rebuild-premium-template`

Ne pas repartir de la PR 13 comme base finale.

## Sources a respecter

Lire et appliquer :

- `docs/07_PRODUCT_UX_BLUEPRINT_FINAL.md`
- `docs/08_TEMPLATE_SELECTION_GUIDE.md`
- `docs/09_TEMPLATE_MAPPING_MBAMBULAAN.md`
- `docs/10_TEMPLATE_SHORTLIST.md`
- `docs/11_SELECTED_TEMPLATE_MAPPING.md`

## Regles strictes

- Ne pas exposer les modules metier comme pages publiques autonomes.
- Ne pas transformer Mbambulaan en marketplace.
- Ne pas creer une app pecheur-first complete au MVP.
- Ne pas faire une landing trop explicative.
- Ne pas multiplier les pages incoherentes.
- Ne pas coder avant d avoir compris le parcours complet.

## Routes a reconstruire

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

## Modules prives a integrer dans l espace premium

- Vue d ensemble
- Territoires
- Signaux
- Acteurs
- Programmes
- Financements
- Produits / flux
- Coordination
- Rapports
- Preuves
- Parametres

## Donnees mockees a creer

Creer un fichier :

`src/data/mockMbambulaan.ts`

Il doit contenir territoires, acteurs, roles, signaux, programmes, financements, produits, rapports, actions, permissions et KPIs par role.

## Experience attendue

Landing : courte, premium, claire. Objectif acquisition. CTA explorer la demo et cadrer un pilote.

Demo : choix de role premium. La page ne doit pas etre une simple grille repetitive.

Espaces de demo : chaque role doit avoir une experience distincte. Le prospect doit comprendre probleme, valeur, donnees, decisions et CTA.

Cadrage commercial : `/demande-demo` et `/devis` doivent qualifier le prospect et l amener vers l espace premium simule.

Espace prive : simuler le produit final apres souscription avec sidebar, KPIs, modules, donnees mockees, actions et rapports.

## Criteres d acceptation

- Build OK.
- Typecheck OK.
- Routes cles fonctionnelles.
- Parcours public vers espace premium clair.
- Produit premium, credible et B2B.
- Modules metier non exposes publiquement.
- Valeur claire par role.
- Espace prive credible comme produit quotidien reel.

## Commandes de validation

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Ordre d implementation recommande

1. integrer le template choisi ;
2. creer design tokens Mbambulaan ;
3. creer `mockMbambulaan.ts` ;
4. creer l app shell ;
5. reconstruire landing ;
6. reconstruire `/demo` ;
7. reconstruire les espaces par role ;
8. reconstruire `/espace-prive` ;
9. reconstruire formulaires ;
10. neutraliser les anciennes routes publiques de modules ;
11. valider typecheck et build.
