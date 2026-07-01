# Product challenge - capabilities, map, private value

## Point de decision

La PR 26 montre des espaces prives par role. C'est bien pour la demonstration, mais le prochain niveau doit challenger les fonctionnalites vendables.

Un espace prive ne doit pas seulement etre un layout different. Il doit porter les vraies capacites metier que le client achete.

## Vision

Mbambulaan doit devenir une infrastructure de coordination pour la peche artisanale senegalaise.

Le produit connecte : quais, acteurs, signaux, flux, demandes, programmes, financements, preuves, actions, rapports et decisions.

Chaque profil accede a une partie utile de cette infrastructure. Aucun profil ne voit tout. Chaque profil voit ce qui lui permet de mieux travailler, decider, prouver ou reduire un risque.

## Capacite centrale : cartographie

Ajouter une carte stylisee des quais de peche et des acteurs.

Elle peut etre mockee sans vraie integration GIS au depart, mais elle doit ressembler a une carte operationnelle.

A minima, elle est obligatoire pour le Ministere.

La carte doit montrer :

- quais suivis ;
- niveau de tension ;
- acteurs presents ;
- signaux recents ;
- programmes actifs ;
- demandes de financement ;
- priorites ;
- alertes.

Extension par role :

- Ministere : vue nationale et territoriale ;
- Collectivite : vue communale et quais locaux ;
- ONG : zones d'intervention et beneficiaires ;
- Mareyeur : flux, retraits, froid, transport ;
- Exportateur : zones de supply qualifie ;
- Organisation : membres et demandes collectives par quai ;
- Investisseur : couverture territoriale et expansion ;
- Pecheur : vue tres simple du quai, relais et statut.

## Challenge par role

### Ministere

Le Ministere achete une capacite d'arbitrage et de coordination institutionnelle.

Fonctions a montrer : carte des quais, radar des tensions, priorisation des territoires, programmes par zone, demandes de financement, alertes, generation de note ministerielle, suivi des decisions, detection des doublons d'intervention.

### ONG / Programme

L'ONG achete une capacite de pilotage programme et de preuve.

Fonctions a montrer : portefeuille d'actions, beneficiaires, preuves terrain, score de preuve, alertes retard, rapport bailleur, comparaison de territoires, journal terrain, checklist suivi-evaluation.

### Collectivite

La collectivite achete une capacite d'action locale.

Fonctions a montrer : commune et quais, demandes terrain, partenaires mobilisables, actions locales, calendrier, note mairie, responsable/action/date, carte locale.

### Pecheur

Le pecheur ne doit pas avoir un dashboard complexe.

Fonctions a montrer : signalement simple, statut, relais quai, prochaine etape, retour recu, preuve declarative. Mobile-first. Peu de jargon.

### Mareyeur

Le mareyeur achete la coordination des flux et la reduction des pertes.

Fonctions a montrer : lots qualifies, qualite, risque de perte, besoin froid, plan retrait, transport, historique lots, alertes flux. Pas de marketplace.

### Exportateur / Entreprise

L'exportateur achete la reduction du risque supply.

Fonctions a montrer : pipeline supply qualifie, opportunites non publiques, score confiance, preuves, risques qualite, conditions logistiques, demande de preuve, decision d'achat preparee. Pas de catalogue public.

### Organisation professionnelle

L'organisation achete une capacite de structuration collective.

Fonctions a montrer : registre membres, demandes collectives, dossiers partenaires, priorites bureau, preuves des besoins, note de plaidoyer, cartographie des membres par quai.

### Investisseur / Associe

L'investisseur doit comprendre la these d'infrastructure.

Fonctions a montrer : segments payeurs, offres, pipeline partenaires, potentiel revenus, carte expansion, risques, roadmap, data room, unit economics preliminaire.

## Regles de gestion

1. Aucun profil ne voit tout.
2. Chaque profil a ses propres actions et permissions.
3. Chaque action a un responsable, un statut, une preuve et une prochaine etape.
4. La meme donnee peut apparaitre dans plusieurs espaces avec un sens different.
5. Les opportunites ne sont jamais une marketplace publique.
6. Le pecheur est un utilisateur terrain, pas forcement le payeur.
7. La carte est une colonne vertebrale de coordination, pas une decoration.
8. Les espaces payeurs doivent montrer clairement pourquoi ils paient.
9. Les modules publics doivent rester gates.
10. Le vocabulaire doit changer selon le role.

## Objectif pour la prochaine iteration Codex

Faire evoluer PR 26 vers un produit plus profond : carte, workflows metier, actions utiles, rapports, preuves, permissions, et parcours capables de justifier un prix d'achat.