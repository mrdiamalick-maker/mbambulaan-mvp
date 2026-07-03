# Codex Reset Restart Prompt Mbambulaan

## Situation

Codex s'est reinitialise. Ce fichier sert a reprendre sans perdre le contexte.

Important : ce fichier ne lance pas Codex automatiquement. Il doit etre copie dans Codex ou utilise comme brief manuel.

## Etat GitHub

- `main` contient le Product UX Blueprint final et la decision template.
- La branche active est `rebuild-premium-template`.
- La PR active est la PR #26.
- La PR #26 est draft et doit rester draft tant que le rendu visuel et le build ne sont pas valides.
- La PR #13 est un laboratoire historique. Ne pas l'utiliser comme base finale.

## Mission immediate

Travailler sur la branche `rebuild-premium-template` et transformer la PR #26 en vraie reconstruction frontend premium.

Aujourd'hui, PR #26 contient surtout le brief :

- `docs/15_CODEX_REBUILD_EXECUTION_BRIEF.md`
- `docs/16_CODEX_RESET_RESTART_PROMPT.md`

Il faut maintenant produire le frontend.

## Documents a lire avant de coder

Lire dans cet ordre :

1. `docs/07_PRODUCT_UX_BLUEPRINT_FINAL.md`
2. `docs/08_TEMPLATE_SELECTION_GUIDE.md`
3. `docs/09_TEMPLATE_MAPPING_MBAMBULAAN.md`
4. `docs/10_TEMPLATE_SHORTLIST.md`
5. `docs/11_SELECTED_TEMPLATE_MAPPING.md`
6. `docs/12_REBUILD_PREMIUM_TEMPLATE_PROMPT.md`
7. `docs/14_TEMPLATE_DECISION.md`
8. `docs/15_CODEX_REBUILD_EXECUTION_BRIEF.md`

## Produit a construire

Mbambulaan n'est pas :

- une marketplace ;
- un dashboard generique ;
- une landing longue ;
- une app pecheur-first complete ;
- une serie de pages sans parcours.

Mbambulaan est une infrastructure numerique de coordination pour la peche artisanale senegalaise.

## Reference template

Template prioritaire : TailAdmin.

Utiliser TailAdmin comme reference visuelle et structurelle :

- app shell ;
- sidebar ;
- KPI cards ;
- tables ;
- charts ;
- map panels ;
- forms ;
- dashboards.

Ne pas copier un template brut. Adapter les patterns a Mbambulaan.

## Parcours cible

`/` acquisition premium
-> `/demo` selection de role
-> `/demo/<role>` preuve de valeur metier
-> `/demande-demo` ou `/devis` cadrage commercial
-> `/espace-prive` espace premium simule apres souscription

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

## Donnees mockees

Creer :

`src/data/mockMbambulaan.ts`

Inclure :

- territoires ;
- acteurs ;
- roles ;
- signaux ;
- programmes ;
- financements ;
- produits ;
- rapports ;
- actions ;
- permissions ;
- KPIs par role.

## Composants partages a creer

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

## Priorite d'implementation

1. Creer les mocks.
2. Creer les composants partages.
3. Reconstruire `/`.
4. Reconstruire `/demo`.
5. Reconstruire les routes `/demo/<role>`.
6. Reconstruire `/demande-demo` et `/devis`.
7. Reconstruire `/espace-prive`.
8. Neutraliser les modules publics isoles si necessaire.
9. Executer typecheck et build.

## Regles strictes

- Ne pas exposer arrivages, besoins, opportunites ou coordination comme modules publics autonomes.
- Ne pas transformer les opportunites en marketplace.
- Ne pas donner un dashboard complet au pecheur dans le MVP. Le pecheur doit etre un parcours assiste.
- Ne pas faire une landing encyclopedique.
- Ne pas melanger plusieurs styles visuels.
- Ne pas merger tant que la PR est draft.

## Validation technique

Executer :

```bash
npm install
npm run typecheck
npm run build
```

## Resultat attendu

Une PR #26 enrichie avec une premiere version frontend coherent, premium, testable et visible de bout en bout.
