# Spec fonctionnelle v1 - Espace Ministere Mbambulaan

## Objectif

Construire l'espace Ministere comme premier espace prive de reference.

Cet espace doit demontrer que Mbambulaan n'est ni un site, ni un ERP, ni un CRM, ni une BI generique. C'est une infrastructure de coordination et de pilotage institutionnel pour la peche artisanale.

## Utilisateur cible

Ministere, direction de la peche, cellule programme, cabinet, service technique, equipe de suivi.

## Promesse

Mbambulaan aide le Ministere a voir, prioriser, coordonner, suivre et documenter l'action publique sur la peche artisanale.

## Probleme a resoudre

Le Ministere peut avoir des donnees fragmentees, des fichiers Excel disperses, des rapports PDF lents, des remontes terrain incompletes, peu de vision territoriale, un suivi budgetaire difficile, des programmes qui se chevauchent, des incidents mal historises et des ressources dont l'etat est peu visible.

## Valeur achetable

- Vision nationale et territoriale des quais.
- Suivi des tensions, alertes et incidents.
- Priorisation des territoires.
- Suivi des programmes publics et partenaires.
- Suivi budgetaire oriente decision.
- Suivi des financements octroyes, consommes ou bloques.
- Suivi des ressources humaines, materielles et infrastructures.
- Detection d'obsolescence et de risques operationnels.
- Production plus rapide de notes et rapports.
- Base de preuves reliee aux decisions.
- IA simulee pour synthese, alertes, priorites et notes.

## Positionnement UX

Nom recommande : Espace de pilotage institutionnel.

Termes a eviter : cockpit, marketplace, CRM, ERP.

Termes preferes : centre de coordination, vue de decision, tableau de bord institutionnel, note d'arbitrage, suivi public, preuve, territoire, programme.

## Parcours principal

1. Le Ministere se connecte.
2. Il arrive sur Synthese nationale.
3. Il voit la situation : zones critiques, tensions, programmes a risque, budgets en retard, incidents ouverts.
4. Il ouvre la Carte des quais pour comprendre territorialement.
5. Il clique un quai ou territoire.
6. Il voit acteurs, tensions, programmes, financement, ressources, incidents, preuves.
7. Il genere une synthese IA simulee.
8. Il cree ou prepare une note d'arbitrage.
9. Il suit l'action dans Programmes, Budgets, Ressources ou Incidents.

## Menus obligatoires

1. Synthese nationale
2. Carte des quais
3. Territoires
4. Tensions et alertes
5. Programmes
6. Budgets et financements
7. Ressources et infrastructures
8. Incidents et obsolescence
9. Acteurs
10. Notes et rapports
11. Preuves
12. Parametres et acces

Chaque menu doit afficher un module different.

## Module 1 - Synthese nationale

But : comprendre la situation en 60 secondes.

Contenu :

- KPIs analytiques : territoires critiques, programmes a risque, taux execution budgetaire, incidents ouverts, financements bloques, ressources critiques.
- Bloc IA simulee : resume national court.
- Liste des decisions attendues.
- Top 3 zones critiques.
- Top 3 alertes budgetaires ou operationnelles.
- Dernieres preuves validees.

Actions :

- Generer synthese.
- Ouvrir zone critique.
- Marquer decision a suivre.
- Preparer note d'arbitrage.

## Module 2 - Carte des quais

But : visualiser et agir territorialement.

Contenu :

- Grande carte stylisee.
- Points de quais avec lat/lng mockes.
- Couleur par tension.
- Filtres : tension, territoire, programme, financement, incident, preuve.
- Panneau detail au clic.
- Acteurs presents.
- Programmes actifs.
- Budget ou financement associe.
- Ressources ou infrastructures critiques.
- Incidents ouverts.
- Niveau de preuve.

Actions :

- Prioriser zone.
- Demander verification terrain.
- Ouvrir fiche territoire.
- Generer note territoire.

## Module 3 - Territoires

But : comparer et prioriser.

Contenu :

- Tableau des territoires.
- Score priorite.
- Tension.
- Signaux recents.
- Budget engage.
- Programmes actifs.
- Incidents ouverts.
- Ressources critiques.
- Action recommandee.

Actions :

- Changer priorite.
- Affecter suivi.
- Exporter liste simulee.
- Ouvrir carte filtree.

## Module 4 - Tensions et alertes

But : suivre les urgences et signaux sensibles.

Contenu :

- Alertes par severite.
- Type : conflit, volume, prix, froid, carburant, incident, budget, programme.
- Territoire.
- Responsable.
- Statut.
- Delai.
- Impact potentiel.

Actions :

- Changer statut.
- Assigner responsable.
- Creer note d'alerte.
- Demander verification.

## Module 5 - Programmes

But : suivre les interventions publiques et partenaires.

Contenu :

- Portefeuille programmes.
- Zone.
- Budget.
- Taux execution.
- Avancement.
- Partenaire.
- Risque de doublon.
- Indicateurs attendus.

Actions :

- Ouvrir programme.
- Detecter doublon simule.
- Marquer risque.
- Generer point de suivi.

## Module 6 - Budgets et financements

But : suivre les budgets, financements octroyes, retards et ecarts sans devenir un ERP.

Contenu :

- Budget prevu.
- Budget engage.
- Budget consomme.
- Taux execution.
- Ecart.
- Partenaire.
- Territoire.
- Programme.
- Statut.
- Retard.
- Preuve associee.

Actions :

- Prioriser dossier.
- Demander justification.
- Demander preuve.
- Preparer arbitrage.
- Signaler ecart.

Regle : Mbambulaan ne fait pas la comptabilite. Il montre les ecarts utiles a la decision.

## Module 7 - Ressources et infrastructures

But : voir les ressources disponibles, critiques ou obsoletes.

Contenu :

- Agents.
- Relais.
- Materiel.
- Froid.
- Quai.
- Equipements.
- Etat.
- Localisation.
- Responsable.
- Disponibilite.
- Programme lie.

Actions :

- Affecter ressource.
- Declarer indisponibilite.
- Demander maintenance.
- Relier ressource a programme.

Regle : Mbambulaan ne remplace pas la gestion RH ou maintenance. Il donne une vue operationnelle decisionnelle.

## Module 8 - Incidents et obsolescence

But : suivre pannes, incidents et risques operationnels.

Contenu :

- Incident.
- Type.
- Territoire.
- Gravite.
- Ressource touchee.
- Date.
- Responsable.
- Statut.
- Prochaine action.
- Financement associe si besoin.

Actions :

- Declarer incident.
- Changer statut.
- Demander verification.
- Creer note d'urgence.
- Relier incident a financement.

## Module 9 - Acteurs

But : comprendre qui agit sur chaque territoire.

Contenu :

- Services publics.
- Communes.
- ONG.
- Organisations professionnelles.
- Relais.
- Mareyeurs.
- Exportateurs.
- Partenaires techniques.
- Role.
- Territoire.
- Niveau de confiance.

Actions :

- Ouvrir fiche acteur.
- Filtrer par territoire.
- Affecter contact.
- Relier acteur a programme ou incident.

## Module 10 - Notes et rapports

But : accelerer la production de documents utiles.

Contenu :

- Notes brouillon.
- Notes pretes.
- Rapports.
- Destinataire.
- Statut.
- Sources de donnees.
- Date.

Actions :

- Generer note IA simulee.
- Passer en validation.
- Archiver.
- Lier note a budget, territoire ou incident.

## Module 11 - Preuves

But : savoir ce qui est fiable.

Contenu :

- Source.
- Niveau de preuve.
- Territoire.
- Date.
- Validation.
- Donnee liee.
- Decision liee.

Actions :

- Demander verification terrain.
- Valider preuve.
- Relier preuve a decision.

## Module 12 - Parametres et acces

But : administrer l'espace achete.

Contenu :

- Utilisateurs.
- Roles.
- Permissions.
- Modules actifs.
- Historique d'actions.
- Statut publication : brouillon, valide, archive.

Actions :

- Modifier role.
- Activer module.
- Consulter historique.
- Simuler publication interne.

## IA Mbambulaan Ministere

IA simulee visible mais prudente.

Fonctions :

- Synthese automatique.
- Resume territoire.
- Detection doublon programme.
- Alerte budgetaire.
- Detection financement bloque ou sous-utilise.
- Detection ressource critique ou obsolete.
- Resume incident.
- Preparation note d'arbitrage.

Questions rapides :

- Que se passe-t-il a Joal ?
- Quelles zones prioriser cette semaine ?
- Quels programmes risquent de se chevaucher ?
- Quels budgets sont en retard ?
- Quelles ressources sont critiques ou obsoletes ?
- Quels incidents doivent etre traites cette semaine ?

Afficher : IA simulee - donnees mockees.

## Donnees mockees necessaires

- territories
- quays avec lat/lng
- programs
- budgetLines
- fundingRecords
- resources
- infrastructureAssets
- incidents
- actors
- proofs
- reports
- users
- permissions
- aiRecommendations

## Criteres de validation

- Le Ministere comprend la situation nationale en moins d'une minute.
- La carte est utile et explicable.
- Chaque menu affiche un module different.
- Budget, ressources et incidents sont presents sans transformer Mbambulaan en ERP.
- L'IA simulee aide a comprendre et preparer une decision.
- Les actions principales fonctionnent cote client.
- Le vocabulaire est institutionnel et sobre.
- Le mot cockpit n'apparait plus.
- La route `/espace-prive/etat` donne envie d'acheter la solution.

## Commandes de validation

```bash
npm run typecheck
npm run build
```
