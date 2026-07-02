# Prompt final Codex - Ministere MVP et landing

## Decision

Un seul prompt pour profiter de la limite Codex.

Priorite P1 : landing et espace Ministere `/espace-prive/etat`.

Priorite P2 seulement si P1 est solide : petites harmonisations des autres pages publiques et espaces, sans refonte globale.

## Prompt a donner a Codex

Travaille sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis dans cet ordre :

- `docs/42_PRODUCT_CHALLENGE_MINISTERE_BEFORE_CODEX.md`
- `docs/41_PRIORITY_LOCK_MINISTERE_ANALYTICS_QUAI.md`
- `docs/35_TERA_PROMPT_CODEX_ANALYTICS_VISUALS_QUAI_DYNAMIC.md`
- `docs/36_CHECKLIST_REVIEW_ANALYTICS_QUAI_MINISTERE.md`
- `docs/37_DATASET_QUAIS_MINISTERE_V1.md`
- `docs/39_DIRECTION_IMAGES_VISUELLES_PREMIUM.md`

Objectif : finaliser un MVP convaincant pour Mbambulaan, avec focus principal sur la landing et l'espace Ministere.

Tu agis comme architecte solution senior et developpeur front senior. Le rendu actuel est une base, pas une contrainte. Tu peux remplacer, reorganiser ou reconstruire les composants si cela donne une meilleure experience.

## Vision produit

Mbambulaan n'est pas un ERP, pas un CRM, pas une BI generique, pas une marketplace.

Mbambulaan est une infrastructure de coordination et de pilotage institutionnel pour la peche artisanale.

Promesse a rendre visible dans l'espace Ministere :

Vision nationale -> choix du quai -> KPIs dynamiques -> insight IA -> referents terrain -> action -> trace.

Le Ministere doit comprendre en moins d'une minute : quoi regarder, pourquoi c'est important, quelle action faire, quelle trace garder.

## P1 - Landing

Ameliore la landing sans changer tout le projet.

Objectifs :

- donner une impression de solution B2B premium ;
- expliquer clairement Mbambulaan ;
- montrer la logique Signal terrain -> Analyse territoriale -> Coordination -> Decision / Rapport ;
- mettre en avant la valeur Ministere sans enfermer Mbambulaan dans un seul acteur ;
- eviter les longs textes ;
- eviter les visuels incomprehensibles ;
- garder CTA principal `Demander un essai` et secondaire `Se connecter`.

Direction visuelle :

- palette mer : ocean, turquoise, cyan, sable, vert lagon, ambre, corail ;
- visuels internes : SVG, gradients, carte stylisee, mini charts, flow ;
- pas d'image externe non maitrisee ;
- pas de logo final ;
- pas de slider pour le moment.

La landing doit faire comprendre : Mbambulaan transforme des signaux terrain disperses en decisions coordonnees et tracables.

## P1 - Espace Ministere

Route cible : `/espace-prive/etat`.

Objectif : faire de cette route une experience analytique institutionnelle premium, dynamique par quai.

Tu peux reconstruire `MinistryInstitutionalSpace` si necessaire.

### Navigation

Conserver une logique simple autour de 6 entrees :

- Vue nationale
- Carte et territoires
- Alertes et incidents
- Programmes et budgets
- Ressources et acteurs
- Notes, preuves et acces

Mais la presentation peut changer si cela ameliore la clarte.

Chaque module doit suivre : Question -> Insight -> Exploration -> Action -> Trace.

### Filtre dynamique par quai

Ajouter ou renforcer un filtre dynamique par quai : Joal, Kayar, Mbour, Saint-Louis, Dakar.

Au choix d'un quai, mettre a jour :

- carte ;
- KPIs ;
- visualisations ;
- fiche quai ;
- programmes ;
- budgets ;
- incidents ;
- ressources ;
- preuves ;
- referents terrain ;
- insight IA ;
- actions recommandees.

Chaque quai doit raconter une histoire differente.

### KPIs et visualisations

Les KPI cards simples ne suffisent pas.

Utilise des composants plus analytiques :

- donuts ;
- barres d'execution ;
- progress bars ;
- jauges ;
- score radial ;
- mini charts ;
- badges compacts ;
- chips statistiques.

KPIs minimum par quai :

- tension ;
- score priorite ;
- incidents ouverts ;
- taux execution budgetaire ;
- financement en attente ;
- ressources critiques ;
- programmes actifs ;
- preuves validees ;
- referents disponibles ;
- derniere mise a jour.

### Carte et fiche quai

La carte doit etre une porte d'entree operationnelle, pas une decoration.

Au clic sur un quai, afficher une fiche compacte :

- nom ;
- commune / region ;
- lat/lng mockes ;
- tension ;
- score priorite ;
- risque dominant ;
- programmes ;
- budget ;
- incidents ;
- ressources critiques ;
- preuves ;
- referents ;
- action recommandee.

### Referents terrain

Les referents doivent etre des points d'ancrage terrain, pas des contacts CRM.

Pour chaque quai, afficher des fiches sobres :

- referent pecheur ;
- referent mareyeur ;
- organisation professionnelle ;
- relais local ;
- partenaire programme si pertinent.

Chaque fiche : nom fictif, role, confiance, disponibilite, dernier compte rendu, besoins remontes, programmes suivis, action possible.

Actions possibles : demander compte rendu, demander verification, relier a un financement, affecter suivi programme, preparer prise de contact.

### Actions qui vont jusqu'au bout

Les actions doivent changer l'interface, pas seulement afficher un message.

Actions attendues :

- prioriser quai ;
- signaler ecart budget ;
- demander maintenance ;
- demander compte rendu ;
- generer note ;
- demander verification terrain ;
- valider preuve.

Chaque action doit produire une trace visible : statut modifie, action en attente, note pre-remplie, preuve demandee ou element actualise.

Ajouter un bloc compact `Actions en attente`.

### IA Mbambulaan

L'IA doit etre contextualisee au quai selectionne.

Elle doit afficher un insight court : pourquoi ce quai est prioritaire, risque dominant, action recommandee, donnee manquante ou obsolete, note a preparer.

Afficher clairement : `IA simulee - donnees mockees. L'humain valide.`

Les modules IA doivent rester rassurants : activables ou desactivables, brouillon uniquement pour les notes, validation humaine.

## Design attendu

Le rendu doit etre plus premium et moins admin.

Reduire : longs paragraphes, gros blocs, panels empiles, cards repetitives, textes decoratifs.

Renforcer : visualisations, hierarchie, respiration, lecture progressive, action principale claire, trace visible.

Inspiration : Qlik / BI premium sans copier.

## P2 - Autres pages si P1 solide

Seulement apres avoir finalise P1, harmoniser legerement :

- `/demo`
- `/demande-demo`
- `/espace-prive`
- pages demo role si facile

Objectif P2 : coherence visuelle et vocabulaire. Ne pas refaire les autres espaces. Ne pas elargir le scope.

## Contraintes

Ne pas travailler : logo final, slider, branding final, nouveau template, nouvelles pages non essentielles.

Ne pas transformer Mbambulaan en ERP, CRM, BI generique ou marketplace.

Ne pas importer d'images externes non maitrisees.

## Validation obligatoire

Executer :

```bash
npm run typecheck
npm run build
```

Corriger les erreurs bloquantes.

Garder PR #26 en draft.

Mettre a jour le body de PR avec :

- fichiers modifies ;
- landing amelioree ;
- espace Ministere dynamique par quai ;
- KPIs visuels ;
- referents terrain ;
- actions qui modifient l'interface ;
- IA contextualisee ;
- actions en attente ;
- validations typecheck/build ;
- limites restantes.