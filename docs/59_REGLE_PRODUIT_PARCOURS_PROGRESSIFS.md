# Regle produit - parcours actionnables progressifs

## Decision

A partir de maintenant, les parcours complets doivent etre ajoutes progressivement, sans casser la navigation laterale dynamique.

Mbambulaan n'est pas un dashboard. C'est une infrastructure de coordination. Mais cette coordination doit etre construite sans remplacer les sections metier existantes.

## Principe non negociable

La navigation laterale reste le controleur principal de l'espace Etat.

Modele attendu :

```text
Menu lateral -> section metier dediee -> action -> suite visible -> validation humaine -> trace
```

Modele interdit :

```text
Bloc global statique -> memes composants partout -> donnees mises a jour
```

## Regle d'integration

Tout nouveau parcours doit respecter les regles suivantes :

1. Il part d'une section metier existante.
2. Il ne remplace pas le contenu de la section active.
3. Il ajoute une suite visible a l'action.
4. Il conserve la navigation laterale dynamique.
5. Il produit une trace.
6. Il garde l'humain comme validateur final.
7. Il doit etre testable independamment.

## Ordre de livraison recommande

### 1. Parcours Note d'arbitrage

Objectif : aller au bout d'une note, depuis une action jusqu'a validation.

Declencheurs :

- Preparer note ;
- Creer brouillon ;
- Ajouter a la note ;
- action IA de note.

Suite attendue :

- brouillon visible ;
- statut de la note ;
- pieces attendues ;
- referent propose ;
- boutons : valider, demander complement, affecter referent, exporter ;
- trace finale.

### 2. Parcours Arbitrage financement

Objectif : montrer la valeur Ministere sur les financements.

Declencheurs :

- Prioriser financement ;
- Demander justificatif ;
- Ouvrir arbitrage ;
- action depuis Programmes publics.

Suite attendue :

- montant ;
- objet finance ;
- programme rattache ;
- justificatif attendu ;
- urgence ;
- decision possible ;
- trace.

### 3. Parcours Verification terrain

Objectif : montrer que l'information devient coordination terrain.

Declencheurs :

- Verifier terrain ;
- Demander complement ;
- action referent ;
- action sur preuve declarative ou partielle.

Suite attendue :

- referent ;
- element a verifier ;
- piece attendue ;
- statut mission ;
- trace.

### 4. Parcours IA assistee

Objectif : montrer le avec/sans IA sans casser les sections.

Declencheurs :

- suggestion IA ;
- brouillon IA ;
- comparaison ;
- complement terrain propose.

Suite attendue :

- donnees utilisees ;
- pourquoi l'IA propose ;
- action humaine ;
- validation ;
- trace.

## Design attendu

Les suites doivent etre :

- premium ;
- compactes ;
- visibles dans la section active ;
- non intrusives ;
- maritimes ;
- lisibles en demo ;
- jamais admin.

## Validation obligatoire avant merge

Pour chaque parcours :

```bash
npm run typecheck
npm run build
```

Validation visuelle manuelle :

- cliquer chaque entree du menu lateral ;
- verifier que chaque section affiche ses composants specifiques ;
- verifier que le parcours ajoute une suite visible ;
- verifier qu'il n'y a pas de scroll horizontal ;
- verifier que le parcours peut etre explique en demo.

## Definition de succes

Une livraison est acceptable si :

1. la navigation laterale reste dynamique ;
2. les sections metier restent distinctes ;
3. l'action ouvre une suite visible ;
4. l'utilisateur peut aller jusqu'a une validation ou une trace ;
5. l'IA enrichit sans remplacer l'humain ;
6. le rendu renforce la valeur de Mbambulaan comme ecosysteme de coordination.