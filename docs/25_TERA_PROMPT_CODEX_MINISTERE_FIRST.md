# Tera prompt Codex - Ministere first

## Mission

Tu travailles sur `rebuild-premium-template` et PR #26.

Garde la PR en draft.

Lis d'abord :

- `docs/24_PRODUCT_FOCUS_MINISTERE.md`
- `docs/22_PRODUCT_RESET_QLIK_LIKE_SOLUTION.md`
- `docs/21_TERA_PROMPT_CODEX_QLIK_PRIVATE_OS.md`

Objectif : arreter de tout traiter en meme temps. Focus uniquement sur l'espace Ministere et les pages publiques qui y menent.

## Priorite produit

Rendre l'espace Ministere excellent, convaincant et achetable.

Le Ministere doit comprendre que Mbambulaan l'aide a maitriser la peche artisanale : territoires, quais, acteurs, tensions, programmes, budgets, financements, ressources, infrastructures, incidents, obsolescence, preuves et decisions.

## Corrections globales rapides

1. Remplacer le sous-titre `Solution data & coordination` par : `Ecosysteme numerique au service de la peche artisanale`.

2. Supprimer le mot `cockpit` partout.

3. Revoir le bloc d'apercu solution sur la landing. S'il n'est pas explicable, le remplacer par un flow clair :

Signal terrain -> Analyse territoriale -> Coordination -> Decision / Rapport.

4. Rendre la section cas d'usage plus belle et plus claire. Preferer un flow ou une matrice simple au lieu de cartes banales.

## Espace Ministere

Route : `/espace-prive/etat`.

Renommer l'experience : `Espace de pilotage institutionnel` ou `Centre de coordination institutionnelle`.

Ne pas utiliser `Salle de decision ministerielle` si cela parait pretentieux.

Remplacer par :

- Vue de decision ;
- Synthese pour arbitrage ;
- Suivi institutionnel ;
- Notes et arbitrages.

## Menus Ministere attendus

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

Chaque menu doit ouvrir un vrai module different.

## Module Synthese nationale

Objectif : comprendre la situation en 60 secondes.

Afficher :

- KPIs analytiques propres ;
- zones critiques ;
- alertes majeures ;
- decisions attendues ;
- programmes a risque ;
- alertes budgetaires ;
- ressources critiques ;
- incidents ouverts ;
- synthese IA simulee.

Actions : generer synthese, ouvrir zone critique, marquer decision, ouvrir alerte budgetaire.

## Module Carte des quais

Objectif : visualiser et agir.

Afficher :

- grande carte claire ;
- points de quais ;
- lat/lng mockes ;
- tension par couleur ;
- filtres ;
- panneau detail ;
- acteurs presents ;
- programmes ;
- financement ;
- ressources ou infrastructures critiques ;
- incidents ;
- preuves.

Actions : prioriser zone, demander verification, generer note, ouvrir fiche territoire.

## Module Territoires

Objectif : comparer et prioriser.

Afficher : classement, score priorite, tension, volume ou signaux, acteurs, preuve, budget engage, incident ouvert, action recommandee.

Actions : classer, affecter suivi, exporter liste simulee.

## Module Tensions et alertes

Objectif : suivre conflits, urgences et signaux sensibles.

Afficher : alerte, severite, territoire, responsable, statut, delai, impact potentiel.

Actions : changer statut, assigner responsable, creer note d'alerte.

## Module Programmes

Objectif : suivre les interventions publiques et partenaires.

Afficher : portefeuille programmes, zone, budget, execution, avancement, partenaire, risque de doublon, indicateurs attendus.

Actions : detecter doublon, ouvrir programme, marquer risque, generer point de suivi.

## Module Budgets et financements

Objectif : suivre les budgets, les financements octroyes, les retards et les ecarts.

Afficher : budget prevu, budget engage, budget consomme, taux execution, partenaire, territoire, programme, statut, retard, preuve.

Actions : prioriser dossier, demander justification, demander preuve, preparer arbitrage, signaler ecart.

## Module Ressources et infrastructures

Objectif : savoir quelles ressources existent, ou elles sont, qui en est responsable et dans quel etat elles se trouvent.

Afficher : ressources humaines, agents, relais, materiel, froid, quais, equipements, etat, localisation, responsable, disponibilite.

Actions : affecter ressource, declarer indisponibilite, demander maintenance, relier ressource a programme.

## Module Incidents et obsolescence

Objectif : suivre les incidents, pannes, equipements obsoletes et risques operationnels.

Afficher : incident, type, territoire, gravite, ressource touchee, date, responsable, statut, prochaine action.

Actions : declarer incident, changer statut, demander verification, creer note d'urgence, relier incident a financement.

## Module Acteurs

Objectif : voir les acteurs clefs par zone.

Afficher : services, communes, ONG, organisations, relais, mareyeurs, exportateurs, agents, partenaires techniques.

Actions : ouvrir fiche, filtrer par territoire, affecter contact.

## Module Notes et rapports

Objectif : reduire le travail manuel.

Afficher : notes brouillon, notes pretes, rapports, destinataire, statut, source de donnees.

Actions : generer note IA simulee, passer en validation, archiver, lier note a budget ou incident.

## Module Preuves

Objectif : savoir ce qui est fiable.

Afficher : source, niveau de preuve, territoire, date, validation, donnee liee, decision liee.

Actions : demander verification terrain, valider preuve, relier preuve a decision.

## Module Parametres et acces

Objectif : administrer l'espace achete.

Afficher : utilisateurs, roles, permissions, modules actifs, historique.

Actions : modifier role, activer module, consulter historique.

## IA simulee

Ajouter un bloc d'aide IA simulee dans l'espace Ministere.

Exemples :

- Que se passe-t-il a Joal ?
- Quelles zones prioriser cette semaine ?
- Quels programmes risquent de se chevaucher ?
- Quelle note peut etre preparee pour arbitrage ?
- Quels budgets sont en retard ?
- Quels financements sont sous-utilises ?
- Quelles ressources sont critiques ou obsoletes ?
- Quels incidents doivent etre traites cette semaine ?

Afficher que l'IA est simulee sur donnees mockees.

## Design

Simple, epure, institutionnel, moderne.

Palette mer : bleu ocean, turquoise, sable, vert lagon, ambre/corail.

Boutons lisibles.

KPIs proches plateforme BI : valeur, tendance, mini visualisation, insight.

## Ne pas faire

- ne pas retravailler tous les espaces maintenant ;
- ne pas creer une marketplace ;
- ne pas faire un ERP ;
- ne pas faire un CRM ;
- ne pas faire une BI generique ;
- ne pas utiliser le mot cockpit ;
- ne pas surcharger.

## Validation

Executer :

```bash
npm run typecheck
npm run build
```

## Livraison attendue

- landing ajustee ;
- demo / demande essai ajustees seulement si utile pour le parcours Ministere ;
- espace Ministere fortement retravaille ;
- modules dynamiques utiles ;
- carte renforcée ;
- budgets et financements renforces ;
- ressources et infrastructures ajoutees ;
- incidents et obsolescence ajoutes ;
- IA simulee ;
- build OK ;
- PR #26 toujours draft.