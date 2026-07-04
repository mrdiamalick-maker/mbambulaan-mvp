# Preparation step by step - Parcours Note d'arbitrage

## Objectif

Preparer une livraison Codex unique, mais controlee, pour ajouter le premier parcours actionnable complet : `Note d'arbitrage`.

Ce parcours doit montrer que Mbambulaan transforme une lecture metier en decision documentee, sans casser la navigation laterale dynamique.

## Rappel de la regle produit

Modele attendu :

```text
Menu lateral -> section metier dediee -> action -> suite visible -> validation humaine -> trace
```

Modele interdit :

```text
Bloc global statique -> memes composants partout -> donnees mises a jour
```

Le parcours doit enrichir les sections existantes, pas les remplacer.

## Step 1 - Perimetre strict

Ne traiter que le parcours `Note d'arbitrage`.

Ne pas traiter dans cette livraison :

- arbitrage financement complet ;
- verification terrain complete ;
- parcours vigilance espece complet ;
- parcours veille complet ;
- nouveau systeme global de dossier actif ;
- refonte generale de l'espace Etat.

Les autres actions peuvent continuer a produire des traces ou statuts comme aujourd'hui.

## Step 2 - Declencheurs autorises

Le parcours Note d'arbitrage peut etre ouvert depuis :

1. bouton `Preparer une note` du bandeau de contexte ;
2. bouton `Preparer note` dans Lecture territoriale ;
3. bouton `Ajouter a la note` dans Programmes publics ;
4. bouton `Preparer note` dans Demandes de financement ;
5. suggestion IA `Creer brouillon` ;
6. section Notes et pieces de suivi.

Important : cliquer ces actions ne doit pas changer toute la page en bloc statique. Le menu lateral reste dynamique.

## Step 3 - Comportement attendu

Quand l'utilisateur declenche une note :

1. Le brouillon est cree ou mis a jour.
2. La section `Notes et pieces de suivi` devient la section active, seulement si cela est utile au parcours.
3. Un bloc premium `Parcours note d'arbitrage` apparait dans la section Notes.
4. Le bloc affiche la progression du parcours.
5. L'utilisateur peut continuer jusqu'a validation ou export simule.
6. Chaque action produit une trace.

## Step 4 - Bloc parcours a ajouter dans la section Notes

Ajouter un bloc visible uniquement dans la section `Notes et pieces de suivi`.

Nom possible :

- `Parcours note d'arbitrage`
- ou `Dossier de note en cours`

Ce bloc doit etre premium, compact, maritime et non admin.

Il doit contenir :

- titre de la note ;
- region ;
- quai ;
- mode : manuel ou assiste Mbambulaan ;
- statut ;
- etape courante ;
- donnees utilisees ;
- pieces attendues ;
- referent propose ;
- brouillon visible ;
- prochaine decision ;
- trace recente.

## Step 5 - Progression du parcours

Utiliser une progression simple :

1. Signal selectionne ;
2. Brouillon prepare ;
3. Complement ou referent ;
4. Validation humaine ;
5. Trace conservee.

Afficher la progression sous forme de stepper, chips ou barre sobre.

## Step 6 - Actions dans le parcours

Le bloc doit proposer ces actions :

- `Valider le brouillon` ;
- `Demander complement terrain` ;
- `Affecter referent` ;
- `Exporter note`.

Chaque action doit :

- mettre a jour le statut ;
- faire avancer l'etape ;
- ajouter une trace ;
- modifier le contenu visible du bloc.

## Step 7 - Avec / sans IA

Si IA activee et capacite `Notes` activee :

- le bloc indique `Mode assiste Mbambulaan` ;
- le brouillon est plus riche ;
- les donnees utilisees sont visibles ;
- une mention explique que l'IA assiste mais ne decide pas.

Si IA desactivee ou capacite Notes inactive :

- le bloc indique `Mode manuel` ;
- le brouillon reste disponible mais moins assiste ;
- l'utilisateur garde les memes actions.

Mention obligatoire :

```text
IA simulee - donnees mockees. L'humain valide chaque decision.
```

## Step 8 - Donnees utilisees

Utiliser uniquement les donnees deja disponibles :

- region ;
- quai ;
- tension ;
- tonnage ;
- debarquements ;
- incidents ;
- plaintes / conflits ;
- niveau de preuve ;
- financement en attente ;
- ressources ;
- referents ;
- action recommandee.

Ne pas inventer de donnees backend.

## Step 9 - Non-regression obligatoire

Ne pas casser :

- menu lateral dynamique ;
- affichage par section active ;
- Programmes publics enrichi ;
- IA enrichie ;
- filtre Region / Tout ;
- zero scroll horizontal ;
- veille filiere ;
- bulles info ;
- footer copyright.

## Step 10 - Test manuel attendu

Apres execution, tester :

1. cliquer chaque entree du menu lateral ;
2. verifier que chaque section affiche ses composants specifiques ;
3. cliquer `Preparer une note` ;
4. verifier que la section Notes affiche le parcours note ;
5. valider le brouillon ;
6. demander complement ;
7. affecter referent ;
8. exporter note ;
9. verifier que les traces changent ;
10. verifier qu'il n'y a pas de scroll horizontal.

## Prompt Codex final

```text
Travaille sur une nouvelle branche depuis main.

Nom de branche propose : feature-note-arbitrage-journey

Ouvre une PR draft vers main.

Priorite absolue : /espace-prive/etat

Objectif : ajouter uniquement le premier parcours actionnable complet : Note d'arbitrage.

Contexte produit : Mbambulaan est une infrastructure de coordination, pas un dashboard. On veut montrer que l'utilisateur peut partir d'un signal ou d'une action, preparer une note, la faire avancer, valider humainement et garder une trace.

Regle non negociable : ne pas casser la navigation laterale dynamique.

Le modele attendu reste : Menu lateral -> section metier dediee -> action -> suite visible -> validation humaine -> trace.

Ne pas remplacer les sections existantes par un dossier global. Le parcours Note doit etre integre dans la section Notes et pieces de suivi.

Perimetre strict :
- traiter seulement le parcours Note d'arbitrage ;
- ne pas ajouter de parcours financement complet ;
- ne pas ajouter de parcours verification terrain complet ;
- ne pas ajouter de dossier actif global ;
- ne pas refondre toute la page.

Declencheurs a connecter :
1. bouton Preparer une note du bandeau ;
2. bouton Preparer note dans Lecture territoriale ;
3. bouton Ajouter a la note dans Programmes publics ;
4. bouton Preparer note dans Demandes de financement ;
5. suggestion IA Creer brouillon ;
6. section Notes et pieces de suivi.

Comportement attendu :
- un brouillon est cree ou mis a jour ;
- la section Notes peut devenir active si pertinent ;
- dans Notes, afficher un bloc premium Parcours note d'arbitrage ;
- ce bloc montre la progression, le brouillon, les pieces attendues, le referent, le statut et la prochaine decision ;
- chaque action met a jour le parcours et ajoute une trace.

Bloc a creer dans la section Notes :
- titre de la note ;
- region ;
- quai ;
- mode : manuel ou assiste Mbambulaan ;
- statut ;
- etape courante ;
- donnees utilisees ;
- pieces attendues ;
- referent propose ;
- brouillon visible ;
- prochaine decision ;
- trace recente.

Progression :
1. Signal selectionne ;
2. Brouillon prepare ;
3. Complement ou referent ;
4. Validation humaine ;
5. Trace conservee.

Actions dans le parcours :
- Valider le brouillon ;
- Demander complement terrain ;
- Affecter referent ;
- Exporter note.

Chaque action doit :
- mettre a jour le statut ;
- faire avancer l'etape ;
- ajouter une trace ;
- modifier le contenu visible du bloc.

Avec IA :
- si IA activee et capacite Notes activee, afficher Mode assiste Mbambulaan ;
- le brouillon doit etre plus riche ;
- les donnees utilisees doivent etre visibles ;
- rappeler que l'IA assiste mais ne decide pas.

Sans IA :
- afficher Mode manuel ;
- garder les memes actions ;
- brouillon disponible mais moins assiste.

Mention obligatoire : IA simulee - donnees mockees. L'humain valide chaque decision.

Donnees a utiliser : region, quai, tension, tonnage, debarquements, incidents, conflits, preuve, financement, ressources, referents, action recommandee.

Ne pas toucher : backend, API, auth, base de donnees, logo, slider, autres espaces acteurs.

Validation obligatoire :
- npm run typecheck
- npm run build

Validation visuelle obligatoire :
- cliquer chaque entree du menu lateral et verifier que les sections changent vraiment ;
- cliquer Preparer une note ;
- verifier le parcours dans Notes ;
- tester Valider, Complement, Affecter referent, Exporter ;
- verifier traces ;
- verifier zero scroll horizontal.

Mettre a jour la PR avec :
- parcours Note d'arbitrage ajoute ;
- navigation laterale conservee ;
- tests effectues ;
- limites restantes.
```
