# Prompt leger - UX navigation espace Etat

## Contexte

La version alpha premium est mergee. Cette nouvelle passe doit rester legere et ciblee.

Objectif : ameliorer l'UX de navigation de `/espace-prive/etat` sans rouvrir une grosse refonte.

Problemes observes :

- le scroll vertical affiche trop d'elements ;
- il faut une meilleure navigation entre les sections ;
- la lecture territoriale devrait peut-etre devenir le premier niveau d'entree ;
- la page est trop large ;
- les couleurs mer sont trop presentes ;
- il faut plus de blanc, de transparence et de respiration.

## Prompt a donner a Codex

Travaille depuis `main`.

Cree une nouvelle branche courte, par exemple :

`polish-etat-navigation-ux`

Ouvre une PR en draft vers `main`.

Priorite absolue : `/espace-prive/etat`.

Ne travaille pas backend, API, auth, logo, slider, base de donnees ou autres espaces acteurs.

## 1. Repenser la navigation sans grosse refonte

La page verticale contient trop de sections visibles a la suite.

Ajoute une navigation UX plus claire :

- soit une navigation sticky par sections ;
- soit des tabs / segments ;
- soit un sommaire lateral discret ;
- soit une combinaison simple.

Objectif : permettre a l'utilisateur de passer rapidement entre :

- Lecture territoriale ;
- Synthese ;
- Production / peches du jour ;
- Alertes et incidents ;
- Programmes et moyens ;
- Coordination terrain ;
- Justificatifs et traces ;
- IA Mbambulaan ;
- Veille filiere.

Ne pas cacher les informations critiques, mais eviter l'effet tunnel de scroll infini.

## 2. Placer Lecture territoriale en premier niveau

La lecture territoriale doit devenir l'entree principale de l'espace.

Le filtre region/Tout doit etre visible avant la synthese, ou alors la synthese doit clairement dependre du filtre juste au-dessus.

Parcours attendu :

1. Choisir la lecture territoriale : Tout ou region.
2. Voir la synthese adaptee a ce choix.
3. Naviguer vers les sections metier.

Si cela améliore l'UX, remonter `02 - Lecture territoriale` avant `01 - Centre de pilotage national` et renommer les sections pour que l'ordre reste logique.

Proposition :

- `01 - Lecture territoriale`
- `02 - Synthese de pilotage`
- `03 - Production et alertes`
- `04 - Coordination et traces`
- `05 - Assistance IA et veille`

Ajuste si mieux.

## 3. Reduire la largeur percue

La page donne une impression trop large.

A faire :

- reduire certains conteneurs trop etendus ;
- limiter la largeur de lecture des blocs textuels ;
- eviter les grilles trop longues ;
- preferer des blocs plus centres, plus respirants ;
- garder une experience premium institutionnelle.

## 4. Calmer la palette mer

Les couleurs mer sont trop presentes.

A faire :

- garder la palette mer comme accent ;
- revenir a plus de blanc, blanc casse, transparence, fonds tres legers ;
- reserver les couleurs fortes aux actions, etats, alertes, priorites ;
- conserver les indicateurs vert / jaune / rouge pour criticite ;
- eviter les grands aplats trop satures.

Le rendu doit etre plus premium, sobre, lisible et moins charge.

## 5. Conserver les acquis

Ne pas casser :

- filtre region/Tout ;
- donnees strictement filtrees par region ;
- mode Tout multi-regions/multi-quais ;
- actions tracables ;
- note d'arbitrage actionnable ;
- IA activable/desactivable ;
- veille filiere ;
- bulles d'information ;
- footer copyright.

## 6. Validation

Executer :

```bash
npm run typecheck
npm run build
```

Mettre a jour la PR avec :

- navigation ajoutee ;
- ordre des sections ajuste ;
- largeur reduite ;
- palette mer apaisee ;
- elements conserves ;
- validations ;
- limites restantes.

## Definition de succes

La passe est reussie si :

1. l'utilisateur comprend d'abord qu'il doit choisir une lecture territoriale ;
2. la synthese reagit clairement au filtre ;
3. la page ne donne plus une impression de tunnel vertical ;
4. les sections sont accessibles via une navigation claire ;
5. la page est moins large et plus elegante ;
6. la palette mer devient premium et non envahissante ;
7. les fonctionnalites deja validees ne regressent pas.