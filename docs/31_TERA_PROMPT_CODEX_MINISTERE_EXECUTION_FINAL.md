# Tera prompt Codex - execution finale Ministere

## Mission

Tu travailles sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis d'abord :

- `docs/26_SPEC_FONCTIONNELLE_ESPACE_MINISTERE_V1.md`
- `docs/30_STRATEGIE_IA_MODULAIRE_GOUVERNANCE.md`
- `docs/29_CATALOGUE_SERVICES_MODULES_V1.md`
- `docs/28_STRATEGIE_MODULES_SECURITE_DEPLOIEMENT.md`
- `docs/25_TERA_PROMPT_CODEX_MINISTERE_FIRST.md`

Objectif : faire de `/espace-prive/etat` le premier espace prive vraiment excellent de Mbambulaan.

Ne retravaille pas tous les espaces maintenant. Focus Ministere.

## Positionnement

L'espace Ministere doit etre un `Espace de pilotage institutionnel`.

Mbambulaan ne doit pas ressembler a :

- un site admin ;
- un ERP ;
- un CRM ;
- une BI generique ;
- une marketplace.

Mbambulaan doit etre percu comme une solution modulaire de coordination, cartographie, suivi, analyse, IA assistee, notes, preuves et decision.

## Corrections globales rapides

- Remplacer `Solution data & coordination` par `Ecosysteme numerique au service de la peche artisanale`.
- Supprimer le mot `cockpit` partout.
- Remplacer le bloc d'apercu solution de la landing s'il n'est pas explicable.
- Preferer un flow simple : Signal terrain -> Analyse territoriale -> Coordination -> Decision / Rapport.
- Rendre la section cas d'usage plus claire avec flow ou matrice simple.

## Navigation Ministere

Ne pas afficher 12 menus de premier niveau.

Utiliser 6 entrees principales :

1. Vue nationale
2. Carte et territoires
3. Alertes et incidents
4. Programmes et budgets
5. Ressources et acteurs
6. Notes, preuves et acces

Les 12 capacites restent presentes comme sous-sections ou blocs internes :

- Synthese nationale
- Carte des quais
- Territoires
- Tensions et alertes
- Programmes
- Budgets et financements
- Ressources et infrastructures
- Incidents et obsolescence
- Acteurs
- Notes et rapports
- Preuves
- Parametres et acces

## Module 1 - Vue nationale

But : comprendre la situation en 60 secondes.

Afficher :

- KPIs analytiques : territoires critiques, programmes a risque, taux execution budgetaire, incidents ouverts, financements bloques, ressources critiques.
- Resume IA simule.
- Decisions attendues.
- Top zones critiques.
- Alertes budgetaires ou operationnelles.
- Dernieres preuves validees.

Actions client :

- generer synthese ;
- ouvrir zone critique ;
- marquer decision ;
- preparer note.

## Module 2 - Carte et territoires

But : visualiser et prioriser.

Afficher :

- grande carte stylisee ;
- quais avec lat/lng mockes ;
- points couleur par tension ;
- filtres : tension, territoire, programme, financement, incident, preuve ;
- panneau detail ;
- acteurs presents ;
- programmes actifs ;
- budget ou financement associe ;
- ressources critiques ;
- incidents ouverts ;
- niveau de preuve ;
- tableau de priorisation territoires.

Actions client :

- prioriser zone ;
- demander verification terrain ;
- ouvrir fiche territoire ;
- generer note territoire ;
- ouvrir carte filtree.

## Module 3 - Alertes et incidents

But : suivre ce qui demande une reaction.

Afficher :

- tensions ;
- alertes ;
- incidents ;
- obsolescence ;
- severite ;
- territoire ;
- responsable ;
- statut ;
- delai ;
- impact potentiel ;
- ressource touchee ;
- prochaine action.

Actions client :

- changer statut ;
- assigner responsable ;
- demander verification ;
- declarer incident ;
- creer note d'urgence ;
- relier incident a financement.

## Module 4 - Programmes et budgets

But : relier action publique, financement et execution.

Afficher :

- portefeuille programmes ;
- budget prevu ;
- budget engage ;
- budget consomme ;
- taux execution ;
- ecart ;
- partenaire ;
- territoire ;
- programme ;
- retard ;
- preuve ;
- risque de doublon.

Actions client :

- ouvrir programme ;
- detecter doublon simule ;
- marquer risque ;
- generer point de suivi ;
- demander justification ;
- demander preuve ;
- preparer arbitrage ;
- signaler ecart.

Regle : ne pas faire une comptabilite complete. Montrer les ecarts utiles a la decision.

## Module 5 - Ressources et acteurs

But : savoir qui agit et avec quels moyens.

Afficher :

- ressources humaines ;
- agents ;
- relais ;
- materiel ;
- froid ;
- quais ;
- equipements ;
- infrastructures ;
- etat ;
- localisation ;
- responsable ;
- disponibilite ;
- acteurs : services, communes, ONG, organisations, relais, mareyeurs, exportateurs, partenaires techniques.

Actions client :

- affecter ressource ;
- declarer indisponibilite ;
- demander maintenance ;
- relier ressource a programme ;
- ouvrir fiche acteur ;
- filtrer par territoire ;
- affecter contact.

Regle : ne pas faire une gestion RH ou maintenance complete. Donner une vue operationnelle decisionnelle.

## Module 6 - Notes, preuves et acces

But : documenter, valider et administrer.

Afficher :

- notes brouillon ;
- notes pretes ;
- rapports ;
- destinataire ;
- statut ;
- sources de donnees ;
- preuves ;
- niveau de preuve ;
- validation ;
- utilisateurs ;
- roles ;
- permissions ;
- modules actifs ;
- historique d'actions ;
- gouvernance IA.

Actions client :

- generer note IA simulee ;
- passer en validation ;
- archiver ;
- relier note a budget, territoire ou incident ;
- demander verification terrain ;
- valider preuve ;
- relier preuve a decision ;
- modifier role ;
- activer module ;
- simuler publication interne.

## IA Mbambulaan

Ajouter une zone visible de gouvernance IA.

Message : l'IA assiste, l'humain valide.

Afficher des modules IA activables ou desactivables :

- IA Synthese : activee ;
- IA Territoire : activee ;
- IA Alertes budgetaires : activee ;
- IA Notes : brouillon uniquement ;
- IA Recherche assistee : desactivee ;
- Validation humaine : obligatoire ;
- Historique : disponible.

Questions rapides :

- Que se passe-t-il a Joal ?
- Quelles zones prioriser cette semaine ?
- Quels programmes risquent de se chevaucher ?
- Quels budgets sont en retard ?
- Quelles ressources sont critiques ou obsoletes ?
- Quels incidents doivent etre traites cette semaine ?

Afficher clairement : `IA simulee - donnees mockees`.

## Donnees mockees a enrichir

Ajouter ou enrichir dans les fichiers data existants :

- territories ;
- quays avec lat/lng ;
- programs ;
- budgetLines ;
- fundingRecords ;
- resources ;
- infrastructureAssets ;
- incidents ;
- actors ;
- proofs ;
- reports ;
- users ;
- permissions ;
- aiRecommendations ;
- aiModules.

## Design

- Simple, epure, institutionnel, moderne.
- Palette mer : bleu ocean, turquoise, sable, vert lagon, ambre/corail.
- Boutons lisibles.
- KPIs type plateforme BI : valeur, tendance, mini visualisation, insight, action.
- Eviter surcharge et effet admin.

## Livrables attendus

- `/espace-prive/etat` fortement retravaille.
- Navigation Ministere en 6 entrees principales.
- Tous les modules Ministere distincts et actionnables.
- Carte utile et explicable.
- Budgets, ressources, incidents presents sans transformer Mbambulaan en ERP.
- IA modulaire visible, activable/desactivable.
- Landing corrigee sur les termes critiques.
- Mot `cockpit` supprime.
- Actions client fonctionnelles avec message de simulation.
- PR #26 toujours draft.

## Validation

Executer :

```bash
npm run typecheck
npm run build
```

Puis resumer precisement ce qui a ete livre.
