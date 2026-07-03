# Prompt urgent - fix desktop overflow et palette espace Etat

## Contexte

La derniere passe UX a degrade le rendu visuel :

- trop de blanc ;
- perte de la palette mer ;
- blocs trop larges ;
- scroll horizontal sur desktop ;
- experience moins premium que souhaitee.

Ce sont des points bloquants pour une demo associe. La correction doit etre courte, stricte et technique. Ne pas rouvrir le produit ni ajouter de nouvelles fonctionnalites.

## Prompt a donner a Codex

Travaille depuis `main`.

Cree une branche courte :

`hotfix-etat-desktop-overflow-palette`

Ouvre une PR draft vers `main`.

Priorite absolue : `/espace-prive/etat`.

Objectif : corriger le rendu desktop sans casser les fonctionnalites existantes.

## 1. Supprimer tout scroll horizontal

Point bloquant : la page depasse sur la largeur desktop.

A faire imperativement :

- aucun element ne doit provoquer de scroll horizontal ;
- verifier les grilles, widths, min-width, sticky nav, cards, charts et containers ;
- eviter les layouts avec colonnes trop larges ;
- utiliser `max-w`, `min-w-0`, `overflow-hidden`, `grid-cols`, `flex-wrap` si necessaire ;
- le body et le main ne doivent pas deborder ;
- les cards doivent se replier proprement ;
- la navigation sticky ne doit jamais pousser la page hors viewport.

Definition de succes : sur desktop, on peut scroller verticalement, mais jamais horizontalement.

## 2. Retrouver une palette mer premium mais maitrisee

La correction precedente a trop blanchi l'interface. Il faut retrouver l'identite mer sans tomber dans la saturation.

A faire :

- garder des fonds blancs ou translucides pour la lisibilite ;
- remettre des accents mer visibles : bleu ocean, turquoise, cyan, vert lagon ;
- utiliser des bandeaux, chips, bordures, titres, petites zones gradient et boutons pour porter la couleur ;
- ne pas faire de grands aplats agressifs ;
- conserver les etats vert / jaune / rouge pour criticite ;
- viser un rendu institutionnel premium : sobre, maritime, clair, pas froid.

## 3. Redonner du relief aux sections

Trop de blanc donne une impression de page plate.

A faire :

- ajouter des fonds doux par section ;
- differencier visuellement les grandes zones ;
- garder la navigation par section si elle aide ;
- ameliorer les transitions entre sections ;
- conserver une lecture compacte et respirante.

## 4. Ne pas casser les acquis

Ne pas casser :

- filtre unique region / Tout ;
- donnees strictement filtrees par region ;
- mode Tout multi-regions / multi-quais ;
- lecture territoriale comme entree principale ;
- synthese dependante du filtre ;
- note d'arbitrage actionnable ;
- especes a surveiller actionnables ;
- IA activable/desactivable ;
- veille filiere ;
- bulles d'information ;
- footer copyright.

## 5. Ne pas faire

Ne pas ajouter de nouvelle feature.
Ne pas modifier le dataset sauf necessite technique.
Ne pas toucher au backend, API, auth, logo, slider ou autres espaces.
Ne pas refaire toute la page.

## 6. Validation obligatoire

Executer :

```bash
npm run typecheck
npm run build
```

Mettre a jour le body de PR avec :

- overflow horizontal corrige ;
- palette mer retablie et maitrisee ;
- sections mieux differenciees ;
- fonctionnalites conservees ;
- validations ;
- limites restantes.

## Definition de succes

La correction est acceptable si :

1. il n'y a plus aucun scroll horizontal sur desktop ;
2. l'espace retrouve une identite mer premium ;
3. le blanc reste utilise pour la lisibilite mais ne domine plus tout ;
4. les sections sont mieux differenciees ;
5. le rendu donne envie d'etre montre a un associe ;
6. les fonctionnalites existantes ne regressent pas.