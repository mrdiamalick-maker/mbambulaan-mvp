# Prompt - navigation laterale premium espace Etat

## Contexte

La page `/espace-prive/etat` contient maintenant beaucoup de valeur metier, mais le parcours reste trop dense en scroll vertical. Pour une experience plus lisible, il faut passer a une navigation laterale premium.

Attention : il ne faut pas creer une page admin classique. Mbambulaan doit rester une solution premium vendable, une infrastructure de coordination pour la peche artisanale.

## Objectif Codex

Travaille sur la branche `hotfix-etat-desktop-overflow-palette` et la PR #29.

Garde la PR en draft.

Priorite absolue : `/espace-prive/etat`.

Objectif : transformer le parcours en experience avec menu lateral premium, affichage dynamique du contenu, moins de scroll, meilleure comprehension des KPIs et des actions.

Ne touche pas au backend, API, auth, base de donnees, logo, slider ou autres espaces acteurs.

## 1. Navigation laterale premium, pas admin

Mettre en place un menu lateral gauche ou une navigation laterale premium.

Le menu doit etre :

- clair ;
- compact ;
- elegant ;
- inspire solution institutionnelle / maritime ;
- pas admin froid ;
- avec icones ou pictos simples si possible ;
- avec etats actifs visibles ;
- responsive ;
- sans scroll horizontal.

Le menu ne doit pas ressembler a un panneau ERP. Il doit donner l'impression d'un espace de pilotage premium.

## 2. Affichage dynamique par section

Limiter le scroll vertical en affichant principalement le contenu de la section active.

Quand l'utilisateur clique un item du menu, le contenu central change.

Conserver un header de contexte ou bandeau superieur avec :

- region active ou Tout ;
- quelques indicateurs cles ;
- action principale utile ;
- IA activee/desactivee si pertinent.

Le filtre Region / Tout doit rester facilement accessible et influencer toutes les sections.

## 3. Architecture de menu recommandee

Regrouper intelligemment les sections.

Proposition de menu :

1. Lecture territoriale
   - filtre Tout / region
   - carte ou vue resumee des quais
   - entree principale de l'espace

2. Synthese de pilotage
   - equivalent du centre de pilotage national
   - synthese executive
   - ce qu'il faut regarder maintenant
   - KPIs prioritaires

3. Production et ressources halieutiques
   - peches du jour
   - debarquements
   - tonnages
   - especes / varietes
   - especes a surveiller
   - conflits et plaintes rattaches a la production si pertinent

4. Programmes, budgets et moyens
   - programmes
   - budgets
   - demandes de financement
   - ressources
   - moyens disponibles ou critiques

5. Alertes et coordination terrain
   - alertes terrain
   - incidents operationnels
   - conflits et plaintes
   - referents terrain
   - actions de coordination
   - cartographie operationnelle si pertinent

6. Notes, justificatifs et traces
   - remplacer wording si meilleur
   - notes d'arbitrage
   - pieces de suivi
   - elements a verifier
   - traces de decision
   - actions en attente

7. Veille filiere
   - signaux du moment
   - actualites mockees
   - contexte filiere
   - signaux a surveiller

8. IA Mbambulaan
   - visible comme capacite activee/desactivee
   - suggestions actionnables
   - brouillons, resumes, analyses
   - l'humain valide

Tu peux ajuster les noms si tu trouves plus clair, mais l'objectif est de regrouper les elements pour que l'utilisateur comprenne ou aller.

## 4. Wording a challenger

Eviter les mots trop generiques ou admin.

Revoir notamment :

- `Justificatifs et traces` si trop lourd ;
- `Preuves` si trop vague ;
- `Centre de pilotage national` si trop abstrait ;
- `Command center` ne doit pas apparaitre.

Propositions :

- `Dossier de suivi` ;
- `Notes et pieces de suivi` ;
- `Traces de decision` ;
- `Synthese de pilotage` ;
- `Lecture territoriale` ;
- `Coordination terrain`.

Choisir le wording le plus clair pour un Ministere, une direction ou un partenaire.

## 5. Parcours utilisateur attendu

Le parcours doit devenir :

1. Je choisis une lecture territoriale : Tout ou region.
2. Je consulte une synthese qui depend de cette lecture.
3. Je vais dans le menu qui m'interesse : production, budgets, alertes, coordination, notes, veille, IA.
4. Je comprends les KPIs grace aux bulles info.
5. Je lance une action : note, verification, referent, trace, veille, IA.
6. Je vois une consequence visible.

## 6. Design premium XXL

Le design doit rester premium maritime.

A faire :

- fond clair mais pas plat ;
- accents mer sur menu, boutons, KPIs, chips, jauges ;
- cards mieux hierarchisees ;
- sections moins longues ;
- pas de scroll horizontal ;
- pas de page admin ;
- moins de scroll vertical ;
- plus de clarte sur les actions ;
- conserver les pills premium de criticite ;
- garder les couleurs vert / jaune / rouge pour criticite.

## 7. Ne pas casser les acquis

Conserver :

- filtre unique Region / Tout ;
- donnees strictement filtrees par region ;
- mode Tout multi-regions ;
- note d'arbitrage actionnable ;
- especes a surveiller actionnables ;
- IA activable/desactivable ;
- veille filiere ;
- bulles info ;
- footer copyright ;
- zero scroll horizontal.

## 8. Validation obligatoire

Executer :

```bash
npm run typecheck
npm run build
```

Mettre a jour le body de PR #29 avec :

- navigation laterale ajoutee ;
- sections regroupees ;
- affichage dynamique ;
- scroll vertical reduit ;
- filtre Region / Tout conserve ;
- design premium non admin ;
- fonctionnalites conservees ;
- validations ;
- limites restantes.

## Definition de succes

La passe est reussie si :

1. la page ne ressemble pas a un admin classique ;
2. le menu lateral rend la navigation plus simple ;
3. le scroll vertical est fortement reduit ;
4. le filtre Region / Tout reste central ;
5. chaque section affiche des informations coherentes avec la region active ;
6. les KPIs sont plus faciles a comprendre ;
7. les actions sont plus lisibles ;
8. le rendu est premium, maritime, clair et vendable.