# Prompt final demo associe - espace Etat

## Objectif

Finaliser `/espace-prive/etat` pour une demo associe demain. Priorite au parcours, au design premium XXL et a la comprehension metier.

Garde la PR #26 en draft. Ne touche pas au backend, API, auth, logo, slider ou base de donnees.

## A lire avant execution

- `docs/48_PROMPT_REGION_FILTER_IA_DASHBOARD_FINAL.md`
- `docs/49_CHECKLIST_ANTI_OUBLI_REGION_IA_ETAT.md`
- `docs/47_PROMPT_XXL_PREMIUM_ETAT_LANDING_USE_CASES.md`

## 1. Filtre unique region

Il y a actuellement trop de filtres en haut. Il faut un seul filtre principal.

- Supprimer les filtres du header haut.
- Garder un seul filtre region dans `02 - Lecture territoriale` : Tout, Dakar, Saint-Louis, Thies, Fatick, Ziguinchor, Louga, Kaolack.
- Le header doit proposer autre chose : aide a la lecture, export synthese, contact referent ou action plus utile.
- Si une region est choisie, toutes les sections doivent afficher uniquement les donnees de cette region.
- En mode Tout, afficher une lecture multi-regions et multi-quais, pas une moyenne globale.

## 2. Centre de pilotage national

Le bloc 01 est trop textuel et trop grand. Le transformer en synthese executive premium.

Afficher rapidement : region active, quais visibles, tonnage du jour, alertes ouvertes, conflits/plaintes, actions en attente, elements a verifier, dernier point de coordination.

Ajouter une ligne courte : `Ce qu'il faut regarder maintenant`.

Repenser le bouton `Preparer note` : le renommer, le deplacer ou le remplacer par une action plus claire comme `Preparer une note d'arbitrage`, `Exporter la synthese region`, `Creer une action de suivi` ou `Preparer le point de coordination`.

## 3. Scoring et graphes

Le score est difficile a expliquer. Les donuts sont faibles visuellement.

- Remplacer le score opaque par une lecture plus metier : priorite d'attention, niveau de vigilance, urgence operationnelle.
- Afficher les facteurs : alertes, volume inhabituel, plainte/conflit, justificatif manquant, ressource critique, espece a surveiller.
- Remplacer les donuts faibles par barres premium, jauges horizontales, heat chips, mini bar charts ou cartes comparatives.
- Les graphes doivent etre sur fonds transparents ou tres legers.

## 4. Bulles info

Revoir toutes les bulles info.

Elles doivent expliquer ce que l'indicateur permet de voir, sans analyser la valeur. Elles sont discretes, au hover ou clic, 1 a 2 phrases maximum.

Ajouter des bulles sur : centre de pilotage, lecture territoriale, quais visibles, tonnage, peches du jour, alertes, incidents, conflits/plaintes, especes a surveiller, programmes et moyens, referents, actions en attente, justificatifs et traces, decision documentee, suggestions IA, IA Mbambulaan.

## 5. Justificatifs et traces

Le wording `preuves disponibles` est trop vague.

Utiliser des termes plus clairs : justificatifs et traces, pieces de suivi, elements a verifier, preuves de terrain, trace de decision.

Expliquer que cela peut etre : compte rendu terrain, confirmation referent, releve de tonnage, piece programme/budget, trace d'arbitrage.

## 6. Note actionnable

`Preparer une note` doit devenir un vrai parcours.

- Clic sur `Preparer une note d'arbitrage`.
- Afficher un brouillon avec contexte region/quai, probleme observe, donnees utiles, referent a mobiliser, elements manquants, prochaine action, statut `Brouillon a valider`.
- Proposer des actions : valider le brouillon, demander complement terrain, affecter a un referent, exporter la note.
- Ajouter une trace visible dans actions en attente ou trace de decision.

Bulle info obligatoire : `Prepare une note de travail a partir des donnees visibles. La note reste un brouillon tant qu'un utilisateur ne la valide pas.`

## 7. Especes a surveiller

Les boutons doivent etre plus actionnables.

Actions possibles : demander verification terrain, affecter referent, creer note de vigilance, ajouter a la trace, marquer comme a surveiller.

Chaque action doit produire une consequence visible : trace, action en attente, statut, note ou referent associe.

## 8. IA Mbambulaan

L'IA assiste mais ne remplace pas l'utilisateur.

Sans IA, l'utilisateur doit pouvoir lire, filtrer, comprendre, agir, preparer une note, affecter, documenter et tracer.

Avec IA activee, l'utilisateur est mieux assiste : synthese, suggestions, notes, compte rendu, analyse, resume, recherche assistee.

- Garder interrupteur IA activee/desactivee.
- Si IA desactivee : parcours complet en mode manuel, sans commentaires IA automatiques.
- Si IA activee : suggestions actionnables.
- Chaque suggestion doit produire note, trace, focus, comparaison ou action en attente.
- Mention obligatoire : `IA simulee - donnees mockees. L'humain valide chaque decision.`

## 9. Design premium XXL

Prends l'initiative.

- Moins dashboard admin.
- Plus palette mer dans encadres, titres, separations, boutons, chips, KPIs.
- Sections mieux differenciees.
- Graphes moins lourds.
- Textes plus courts.
- Infos cles faciles a trouver.
- Actions visibles mais elegantes.

## 10. Footer

Verifier que le footer landing ne contient plus `Lancer la demo`.

Il doit afficher le copyright Mbambulaan, solution de Epic conseil, tous droits reserves.

## 11. P2 facultatif

Si P1 est solide, harmoniser rapidement `/espace-prive` avec landing et espace Etat. Ne pas refondre tous les espaces.

## Validation

Executer :

```bash
npm run typecheck
npm run build
```

Mettre a jour le body de PR avec les changements, les validations et les limites restantes.

## Definition de succes

- Un seul filtre region/Tout.
- Header sans filtres redondants.
- Chaque region affiche uniquement ses donnees.
- Centre de pilotage clair et premium.
- Score explicable ou remplace.
- Donuts remplaces ou fortement ameliores.
- Bulles info correctes et nombreuses.
- Note actionnable.
- Especes a surveiller actionnables.
- IA utile mais non dominante.
- Design seduisant pour demo associe.