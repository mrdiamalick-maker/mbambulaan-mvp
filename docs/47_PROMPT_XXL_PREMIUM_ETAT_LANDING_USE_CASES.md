# Prompt XXL final - Premium Etat, landing et cas d'usage peche

## Decision produit

Cette passe doit etre traitee comme la derniere execution Codex avant attente de limite.

Objectif : sortir une version pilote MVP premium, presentable au Ministere de la Peche et de l'Economie maritime.

Priorite absolue :

1. `/espace-prive/etat`
2. landing page

Ne pas elargir au backend, API, auth, logo, slider ou refonte complete des autres espaces.

## Prompt a donner a Codex

Travaille sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis avant de coder :

- `docs/46_PROMPT_CORRECTION_BLOQUANTE_ESPACE_MINISTERE.md`
- `docs/45_PROMPT_CODEX_POLISH_PREMIUM_LANDING_MINISTERE.md`
- `docs/44_RETOURS_PRODUIT_DESIGN_AVANT_PROMPT_FINAL.md`
- `docs/37_DATASET_QUAIS_MINISTERE_V1.md`
- `docs/35_TERA_PROMPT_CODEX_ANALYTICS_VISUALS_QUAI_DYNAMIC.md`
- `docs/36_CHECKLIST_REVIEW_ANALYTICS_QUAI_MINISTERE.md`
- `docs/39_DIRECTION_IMAGES_VISUELLES_PREMIUM.md`

Objectif : faire une derniere passe XXL premium sur l'espace prive Etat et la landing.

Le rendu actuel progresse mais il n'est pas encore au niveau attendu. Il faut aller plus loin en design, en structure, en cas d'usage metier et en experience IA.

Tu agis comme architecte solution senior, designer produit senior, CPO, CTO et developpeur front senior.

## Vision a respecter

Mbambulaan n'est pas un ERP, pas un CRM, pas une BI generique, pas une marketplace et pas un simple dashboard.

Mbambulaan est une infrastructure de coordination pour la filiere peche artisanale.

Pour le Ministere, la solution doit donner de la visibilite sur :

- les quais ;
- les peches du jour ;
- les tonnages ;
- les varietes de produits de la mer ;
- les especes sensibles, protegees ou a proteger ;
- les conflits, plaintes et alertes terrain ;
- les programmes ;
- les budgets ;
- les ressources ;
- les referents terrain ;
- les preuves ;
- les actions et traces.

Promesse : voir ou agir, qui mobiliser, quel risque suivre, quelle action declencher et quelle trace conserver.

## P1 - Espace prive Etat : premium XXL

Route cible : `/espace-prive/etat`.

### 1. Structure verticale avec transitions entre blocs

L'agencement vertical est valide, mais il manque des transitions et une categorisation claire entre les blocs.

Corriger cela : l'utilisateur ne doit pas avoir l'impression de passer d'une information a une autre sans separation, logique ou mise en scene.

Ajouter des sections clairement categorisees avec transitions visuelles :

1. Command center / Synthese nationale
2. Filtre quai et lecture territoriale
3. Indicateurs critiques / priorite / production
4. Carte et fiche quai
5. Peches du jour et varietes
6. Programmes, budgets et ressources
7. Alertes, conflits et plaintes
8. Referents terrain et coordination
9. Actions, notes et traces
10. IA Mbambulaan gouvernee

Chaque section doit avoir :

- un titre vendeur et clair ;
- un sous-titre explicatif court ;
- une separation visuelle premium ;
- un background ou transition subtile ;
- une logique de lecture ;
- une action ou une consequence.

Utilise des separateurs premium : bandeaux doux, gradients mer, petites lignes de flux, libelles de section, ancres visuelles, chips de contexte.

Ne fais pas une simple succession de cards.

### 2. Palette mer premium et composants mieux chartes

Certains blocs ne sont pas iso palette mer. Corriger.

Appliquer vraiment la palette mer sur l'ensemble de l'espace :

- bleu ocean profond ;
- turquoise ;
- cyan doux ;
- sable ;
- vert lagon ;
- ambre ;
- corail pour alertes ;
- vert / jaune / rouge pour criticite et priorite.

Important : conserver les indicateurs de criticite vert / jaune / rouge parce qu'ils sont utiles et lisibles.

Mais les blocs, KPIs, backgrounds, sections, cartes, tableaux, actions, referents et traces doivent etre mieux chartes et plus premium.

Les graphs doivent etre integres sur background transparent ou tres leger. Eviter les encadres de graphes lourds ou peu elegants.

Ameliorer :

- Priorite quai ;
- KPIs ;
- score radial ;
- donuts ;
- progress bars ;
- mini charts ;
- carte ;
- fiches quai ;
- cartes referents ;
- actions ;
- actions en attente ;
- notes ;
- tableaux ;
- alertes.

Le rendu doit faire premium XXL, pas tableau admin, pas PowerPoint, pas composants assembles.

### 3. Peches du jour et production halieutique

Ajouter une vraie section metier `Peches du jour` ou `Production du jour` dans l'espace Etat.

Le Ministere doit avoir une visibilite sur les debarquements et produits de la mer.

Donnees mockees par quai, dynamiques selon le quai selectionne :

- tonnage du jour ;
- nombre de debarquements ;
- principales especes / varietes ;
- repartition par espece ;
- variation vs moyenne 7 jours ;
- signal sur volume inhabituel ;
- qualite ou froid si pertinent.

Exemples d'especes / produits de la mer :

- thiof ;
- sardinelle ;
- yabboy ;
- capitaine ;
- sole ;
- crevette ;
- poulpe ;
- cymbium / yet ;
- dorade ;
- maquereau.

Ne pas surcharger. Mettre en scene avec mini charts, chips, barres ou cartes compactes.

### 4. Especes sensibles, protegees ou a proteger

Ajouter une section ou un bloc `Especes sensibles`.

But : montrer que l'Etat peut suivre les signaux de protection, pression ou risque.

Donnees mockees :

- espece ;
- statut : sensible, sous pression, protegee, a surveiller ;
- nombre de signaux ;
- quai concerne ;
- action recommandee ;
- niveau de criticite.

Important : rester prudent dans le wording. Ne pas faire de claims scientifiques non fondes. Utiliser `signal`, `a surveiller`, `donnees mockees`, `verification requise`.

### 5. Conflits, plaintes et alertes terrain

Ajouter ou renforcer une section `Conflits et plaintes`.

L'Etat doit voir les declarations de conflits ou plaintes des pecheurs, mareyeurs et acteurs terrain.

Donnees mockees dynamiques par quai :

- type : conflit acces quai, plainte mareyeur, tension carburant, retard paiement, conflit zone de debarquement, froid indisponible, controle qualite ;
- declarant : pecheur, mareyeur, organisation, relais local ;
- criticite ;
- statut ;
- action recommandee ;
- referent associe ;
- trace.

Actions possibles :

- demander verification terrain ;
- affecter referent ;
- creer note ;
- marquer comme a arbitrer ;
- valider traitement.

### 6. IA Mbambulaan : fonctionnalite ajoutee qui enrichit les dashboards

La demande actuelle n'est pas satisfaite.

L'IA ne doit pas seulement etre un bloc ou un bouton decoratif.

Elle doit etre une fonctionnalite activee/desactivee qui change la maniere dont les dashboards sont commentes et enrichis.

Implementer :

- interrupteur principal `Activer IA Mbambulaan` ;
- capacites cochables : `Synthese`, `Alertes`, `Notes`, `Recherche assistee` ;
- lorsque l'IA est desactivee :
  - aucun commentaire IA automatique dans les sections ;
  - les dashboards restent fonctionnels ;
  - afficher `Mode manuel : donnees et actions disponibles sans assistance IA` ;
  - les notes sont des brouillons manuels.
- lorsque l'IA est activee :
  - ajouter des commentaires d'analyse dans les dashboards ;
  - ajouter des recommandations contextualisees ;
  - enrichir les alertes ;
  - pre-remplir les notes ;
  - mettre a jour la synthese selon le quai selectionne ;
  - mentionner les donnees manquantes ou a verifier.

L'IA doit sembler analyser l'espace et proposer des commentaires, mais elle ne doit jamais remplacer l'action humaine.

Formule a afficher :

`IA simulee - donnees mockees. L'humain valide chaque decision.`

Quand l'IA est activee, montrer des tags ou commentaires sobres comme :

- Analyse IA ;
- Signal faible ;
- Note suggeree ;
- Verification requise ;
- Donnee manquante.

Quand l'IA est desactivee, ces tags doivent disparaitre ou devenir neutres.

### 7. Actions et parcours jusqu'au bout

Conserver et renforcer les actions existantes :

- Prioriser quai ;
- Signaler ecart budget ;
- Demander maintenance ;
- Demander compte rendu ;
- Demander verification terrain ;
- Valider preuve ;
- Generer note.

Ajouter actions metier si pertinent :

- declarer conflit ;
- traiter plainte ;
- signaler espece sensible ;
- demander releve tonnage ;
- demander controle froid ;
- demander confirmation de debarquement.

Chaque action doit avoir une consequence visible :

- statut modifie ;
- action ajoutee dans Actions en attente ;
- trace ajoutee ;
- note ou brouillon mis a jour ;
- referent associe ;
- badge ou etat visuel actualise.

## P1 bis - Landing premium XXL

Reprendre la landing, surtout le tableau actuellement affiche.

Le tableau des cas d'usage ne doit pas ressembler a un tableau basique.

Remplacer par une mise en scene premium :

- cartes acteurs ;
- pictos ;
- figures ;
- workflow ;
- mini visualisations ;
- segments cibles ;
- cas d'usage mieux designes.

Landing attendue :

- plus vendeuse ;
- plus premium ;
- couleurs mer ;
- CTA beaux et simples ;
- storytelling clair ;
- public cible qui se reconnait ;
- valeur Ministere visible sans reduire Mbambulaan uniquement au Ministere.

Wording possible :

- Piloter la filiere peche artisanale, du quai a la decision.
- Voir les debarquements, les tensions, les programmes et les preuves dans une meme lecture.
- Transformer les signaux terrain en actions coordonnees et tracables.
- Une infrastructure pour connecter le terrain, les acteurs et la decision publique.

Garder :

- CTA principal `Demander un essai pilote` ;
- CTA secondaire `Se connecter` ;
- pas de logo final ;
- pas de slider ;
- pas d'image externe.

## Donnees mockees a ajouter si necessaire

Ajouter dans `src/data/ministrySpace.ts` ou localement au composant des donnees propres pour :

- dailyCatch ;
- speciesBreakdown ;
- sensitiveSpeciesSignals ;
- conflictReports ;
- complaints ;
- quayProductionSummary.

Les donnees doivent etre differentes selon Joal, Kayar, Mbour, Saint-Louis et Dakar.

## Contraintes strictes

Ne pas faire :

- API ;
- base de donnees ;
- auth reelle ;
- logo final ;
- slider ;
- refonte complete de tous les espaces ;
- nouvelles routes non necessaires.

Garder la PR #26 en draft.

## Validation obligatoire

Executer :

```bash
npm run typecheck
npm run build
```

Corriger toutes les erreurs bloquantes.

Mettre a jour le body de PR avec :

- design premium XXL applique ;
- transitions et categorisation entre blocs ;
- palette mer renforcee ;
- graphes mieux integres ;
- IA Mbambulaan activee/desactivee qui enrichit les dashboards ;
- peches du jour / tonnages / varietes ;
- especes sensibles ;
- conflits et plaintes ;
- landing premium et tableau remplace ;
- fichiers modifies ;
- validations typecheck/build ;
- limites restantes.

## Definition de succes

La version est acceptable si :

1. l'espace Etat parait premium XXL ;
2. les blocs ont des transitions, categories et respirations claires ;
3. la palette mer est visible partout ;
4. les graphs ne sont plus dans des encadres lourds ;
5. l'IA change vraiment l'experience quand elle est activee ;
6. les peches du jour et tonnages sont visibles ;
7. les especes sensibles sont suivies ;
8. les conflits et plaintes existent ;
9. les actions produisent des traces visibles ;
10. la landing donne envie et le tableau basique est remplace par une experience premium.