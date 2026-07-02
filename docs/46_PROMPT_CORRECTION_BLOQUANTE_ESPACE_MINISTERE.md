# Prompt correction bloquante - espace prive Ministere

## Constat

La derniere passe n'a pas suffisamment pris en compte les demandes sur l'espace prive Etat / Ministere.

Trois points sont bloquants avant merge :

1. Decompresser la page et occuper verticalement, avec scroll possible.
2. Appliquer une vraie palette mer sur tous les composants.
3. Reprendre l'UX IA Mbambulaan pour la rendre activable/desactivable et gouvernee.

## Prompt a donner a Codex

Travaille sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Objectif unique : corriger `/espace-prive/etat` sur les trois points bloquants ci-dessous.

Ne travaille pas la landing sauf correction minime liee a une erreur. Ne travaille pas les autres pages. Ne touche pas au logo, slider, branding final, API, base de donnees ou auth.

## 1. Decompression verticale

Le rendu actuel reste trop compresse horizontalement.

Reorganise l'espace Ministere en parcours vertical, avec scroll accepte.

Ne cherche pas a tout faire tenir en un ecran.

Structure attendue :

1. Header institutionnel clair ;
2. Synthese nationale / quai selectionne ;
3. Filtre par quai tres visible ;
4. Ligne ou grille de KPIs premium respirante ;
5. Carte large + fiche quai ;
6. Actions principales et actions en attente ;
7. Referents terrain ;
8. Programmes / budgets / incidents ;
9. Preuves / notes / trace ;
10. Module IA Mbambulaan gouverne.

Chaque section doit respirer, avoir un titre clair, un insight, une action utile et une trace quand necessaire.

Evite les colonnes trop serrees et les panneaux empiles dans une largeur trop contrainte.

## 2. Palette mer et design premium

Applique la palette mer de facon visible et coherente sur tous les composants :

- bleu ocean ;
- turquoise ;
- cyan doux ;
- sable ;
- vert lagon ;
- ambre ;
- corail pour alertes.

Les KPIs, cartes, tableaux, actions, fiches quai, referents, statuts, alertes et traces doivent etre mieux designes.

Ce n'est pas suffisant d'avoir un fond leger ou quelques boutons cyan.

Ameliore :

- score radial ;
- donuts ;
- progress bars ;
- mini charts ;
- badges ;
- tableaux ;
- actions ;
- cartes referents ;
- cartes programmes/budget/incidents ;
- traces et notes.

Le rendu doit paraitre construit, premium, institutionnel, moderne, pas PowerPoint, pas admin.

## 3. IA Mbambulaan gouvernee

L'IA ne doit pas etre omnipresente dans tous les blocs.

Elle doit etre un module clair, valorise, mais gouverne.

Implementer une UX nette :

- interrupteur principal `IA Mbambulaan activee / desactivee` ;
- capacites cochables : `Synthese`, `Alertes`, `Notes`, `Recherche assistee` ;
- si l'IA est desactivee, les parcours restent fonctionnels sans IA ;
- si l'IA est activee, elle enrichit la synthese, les alertes et les notes ;
- si une capacite est desactivee, ne pas afficher son contenu comme si elle etait activee ;
- afficher clairement : `IA simulee - donnees mockees. L'humain valide.`

Ne pas laisser croire que l'IA decide.

L'IA assiste, l'humain valide.

Si IA desactivee : afficher une synthese metier classique et un etat propre `IA desactivee`.

Si IA activee : afficher un insight IA court, contextualise au quai selectionne.

## Fonctions a verifier

Le filtre par quai doit rester central : Joal, Kayar, Mbour, Saint-Louis, Dakar.

Au choix du quai, doivent changer : KPIs, carte, fiche quai, programmes, budgets, incidents, ressources, preuves, referents, actions, synthese et IA si activee.

Les actions doivent continuer a modifier l'interface :

- Prioriser quai ;
- Signaler ecart budget ;
- Demander maintenance ;
- Demander compte rendu ;
- Demander verification terrain ;
- Valider preuve ;
- Generer note.

Chaque action doit laisser une trace visible dans `Actions en attente` ou dans la zone trace/note.

## Validation obligatoire

Executer :

```bash
npm run typecheck
npm run build
```

Corriger toute erreur bloquante.

Mettre a jour le body de PR en indiquant explicitement :

- decomposition verticale corrigee ;
- palette mer appliquee aux composants ;
- IA Mbambulaan activable/desactivable ;
- actions et traces conservees ;
- validations typecheck/build ;
- limites restantes.

Ne pas merger. Garder la PR en draft.