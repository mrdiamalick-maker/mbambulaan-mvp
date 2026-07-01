# Tera prompt Codex - redesign sans biais de l'existant

## Mission

Tu travailles sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis d'abord :

- `docs/33_TERA_PROMPT_CODEX_DESIGN_SYSTEM_SIMPLIFICATION.md`
- `docs/32_DIAGNOSTIC_GAP_QLIK_TEMPLATE_VS_PARCOURS.md`
- `docs/31_TERA_PROMPT_CODEX_MINISTERE_EXECUTION_FINAL.md`
- `docs/26_SPEC_FONCTIONNELLE_ESPACE_MINISTERE_V1.md`

## Instruction critique

Ne te laisse pas enfermer par le design actuel, les composants actuels ou les blocs existants.

L'existant n'est pas une contrainte visuelle. C'est une base fonctionnelle que tu peux challenger.

Tu peux remplacer, reorganiser ou supprimer des composants si cela permet d'obtenir une meilleure experience.

Si une vue doit etre reconstruite presque entierement, fais-le.

## Objectif

Produire une experience plus proche d'une solution analytique institutionnelle avec lecture progressive :

Question -> Insight -> Exploration -> Action -> Trace.

Mbambulaan doit donner l'impression d'une solution produit premium, pas d'une page admin.

## Priorite

1. Landing publique.
2. `/espace-prive/etat`.

Ne retravaille pas tous les espaces acteurs.

## Direction produit

L'utilisateur Ministere doit comprendre rapidement :

- quoi regarder ;
- pourquoi c'est important ;
- quelle action faire ;
- quelle preuve existe ;
- quelle note ou decision peut etre preparee.

## Nouvelle architecture visuelle pour l'espace Ministere

Tu peux abandonner la structure actuelle sidebar + gros panels si tu proposes mieux.

Proposition possible :

- header compact institutionnel ;
- navigation horizontale ou rail lateral plus discret ;
- zone principale en lecture progressive ;
- haut de page : question cle et 3 indicateurs ;
- milieu : visualisation forte ou tableau compact ;
- droite ou bas : action recommandee et IA assistee ;
- historique / preuve en section secondaire.

## Regle de densite

Chaque ecran doit etre compris en moins de 10 secondes.

Maximum :

- 3 KPIs visibles ;
- 1 visualisation principale ;
- 1 liste compacte ;
- 1 action principale ;
- 2 actions secondaires.

Supprimer les grands paragraphes.

Remplacer les textes longs par :

- labels courts ;
- chiffres ;
- tendances ;
- badges ;
- mini visualisations ;
- actions.

## Landing

Ne garde pas la landing actuelle si elle limite le rendu.

Construire une landing plus simple :

- header premium, clair, aere ;
- promesse : Ecosysteme numerique au service de la peche artisanale ;
- hero sobre ;
- flow visuel explicable : Signal terrain -> Analyse territoriale -> Coordination -> Decision / Rapport ;
- matrice cas d'usage elegante ;
- aperçu solution vraiment explicable ;
- CTA : Demander un essai, Se connecter.

Pas de bloc decoratif incomprehensible.

## Espace Ministere

Conserver la navigation fonctionnelle en 6 entrees :

- Vue nationale
- Carte et territoires
- Alertes et incidents
- Programmes et budgets
- Ressources et acteurs
- Notes, preuves et acces

Mais tu peux changer totalement la presentation de ces entrees.

Chaque entree doit suivre :

- Question cle ;
- Insight principal ;
- Visualisation ou tableau compact ;
- Action recommandee ;
- Trace / preuve.

## Exemples de questions par module

Vue nationale : Que doit savoir le Ministere aujourd'hui ?

Carte et territoires : Quelle zone prioriser et pourquoi ?

Alertes et incidents : Qu'est-ce qui demande une reaction rapide ?

Programmes et budgets : Quels programmes ou budgets posent probleme ?

Ressources et acteurs : Quels moyens sont disponibles ou critiques ?

Notes, preuves et acces : Quelle decision peut etre documentee et validee ?

## IA Mbambulaan

L'IA doit etre visible mais sobre.

Elle ne doit pas prendre toute la place.

Afficher :

- IA assiste, humain valide ;
- modules IA activables/desactivables ;
- brouillon uniquement pour notes ;
- historique disponible ;
- donnees mockees.

L'IA doit produire des insights actionnables, pas des paragraphes longs.

## Design attendu

- sobre ;
- moderne ;
- institutionnel ;
- analytique ;
- premium ;
- moins admin ;
- plus Qlik-like ;
- surfaces propres ;
- typographie stricte ;
- cartes compactes ;
- graphiques ou mini visualisations ;
- beaucoup moins de texte.

Palette : bleu ocean, turquoise, sable, vert lagon, ambre/corail.

## Droit de remplacement

Tu peux :

- remplacer MinistryInstitutionalSpace ;
- creer de nouveaux composants ;
- supprimer des panels ;
- reorganiser la navigation ;
- remplacer les gros blocs ;
- reduire les textes ;
- changer la grille ;
- reconstruire la landing.

Mais conserve :

- les routes ;
- les donnees utiles ;
- les actions simulees ;
- le focus Ministere ;
- la PR en draft ;
- les validations typecheck/build.

## Ne pas faire

- ne pas copier Qlik ;
- ne pas changer tout le projet inutilement ;
- ne pas surcharger ;
- ne pas ajouter plus de texte ;
- ne pas faire un ERP ;
- ne pas faire une BI generique ;
- ne pas creer une marketplace.

## Validation

Executer :

```bash
npm run typecheck
npm run build
```

Puis resumer :

- ce qui a ete remplace ;
- ce qui a ete simplifie ;
- comment la lecture progressive fonctionne ;
- comment la landing a ete clarifiee ;
- comment `/espace-prive/etat` est devenu plus analytique et institutionnel ;
- PR #26 toujours draft.
