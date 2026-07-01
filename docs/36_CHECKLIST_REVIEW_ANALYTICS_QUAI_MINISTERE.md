# Checklist review - Analytics quai Ministere

## Objectif

Preparer la prochaine review de `/espace-prive/etat` pendant que Codex est limite.

Cette checklist sert a verifier si la prochaine passe transforme vraiment l'espace Ministere en solution analytique institutionnelle achetable.

## Decision CPO

La prochaine iteration ne doit pas seulement ajouter des elements visuels. Elle doit prouver une logique produit :

Selection quai -> KPIs dynamiques -> Insight -> Referents terrain -> Action -> Trace.

## Parcours cible

1. Le Ministere ouvre Carte et territoires.
2. Il choisit un quai de peche.
3. Les KPIs changent selon le quai.
4. La carte met en evidence le quai choisi.
5. Une fiche quai s'affiche.
6. Les programmes, budgets, incidents, ressources et preuves du quai s'affichent.
7. Les referents terrain du quai sont visibles.
8. L'IA propose un insight court lie au quai.
9. L'utilisateur declenche une action.
10. L'action modifie l'interface et apparait dans Actions en attente.

## Criteres visuels

- Palette mer visible : ocean, turquoise, cyan, sable, vert lagon, ambre, corail.
- KPI cards basiques remplacees par donuts, barres, jauges, progress bars ou mini charts.
- Chaque KPI doit etre lisible en moins de 3 secondes.
- Pas de gros blocs de texte.
- Pas de panels vides ou decoratifs.
- Pas d'empilement admin.
- Chaque module doit avoir une action principale claire.

## KPIs minimum par quai

- tension du quai ;
- score priorite ;
- incidents ouverts ;
- taux execution budgetaire ;
- financement en attente ;
- ressources critiques ;
- programmes actifs ;
- preuves validees ;
- referents disponibles ;
- derniere mise a jour.

## Referents terrain

Chaque quai doit avoir au moins 2 referents fictifs :

- referent pecheur ;
- referent mareyeur ;
- organisation ou relais local.

Chaque fiche referent doit afficher :

- nom ;
- role ;
- quai ;
- niveau de confiance ;
- disponibilite ;
- dernier compte rendu ;
- besoins remontes ;
- programmes suivis ;
- action possible.

## Actions attendues

Les actions doivent produire un changement visible.

### Prioriser quai

Resultat attendu : badge ou score du quai modifie, action ajoutee dans Actions en attente.

### Signaler ecart budget

Resultat attendu : ligne budget change de statut, action ajoutee dans Actions en attente.

### Demander maintenance

Resultat attendu : ressource change de statut, action ajoutee dans Actions en attente.

### Demander compte rendu

Resultat attendu : referent change de statut, note terrain pre-remplie, action ajoutee dans Actions en attente.

### Generer note

Resultat attendu : brouillon visible dans Notes ou rail d'action.

## IA Mbambulaan

L'IA doit reagir au quai selectionne.

Elle doit afficher :

- pourquoi le quai est prioritaire ;
- le principal risque ;
- l'action recommandee ;
- une donnee manquante ou obsolete ;
- mention : IA simulee - donnees mockees, humain valide.

## Questions a se poser pendant la review

- Est-ce que le Ministere comprend quoi faire en 10 secondes ?
- Est-ce que le quai selectionne change vraiment l'experience ?
- Est-ce qu'on voit une difference entre Joal, Kayar, Mbour et Saint-Louis ?
- Est-ce que les referents terrain renforcent la coordination ?
- Est-ce que les actions vont plus loin qu'un simple message ?
- Est-ce que le design donne une impression premium / analytics ?
- Est-ce que Mbambulaan reste different d'un ERP, CRM ou BI generique ?

## Red flags

- Trop de texte.
- Trop de cartes identiques.
- Une seule zone mise en avant sans vrai filtre.
- KPIs statiques.
- Actions qui affichent seulement un toast.
- Referents presentes comme contacts CRM.
- Couleurs trop admin ou trop grises.
- Modules qui ne changent pas avec le quai.

## Definition de done

La prochaine passe est acceptable si :

- le filtre par quai fonctionne ;
- les KPIs se mettent a jour ;
- les visualisations sont plus proches d'une solution analytics ;
- les referents terrain existent ;
- les actions modifient l'interface ;
- Actions en attente existe ;
- l'IA reagit au quai choisi ;
- `npm run typecheck` passe ;
- `npm run build` passe.
