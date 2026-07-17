# CLAUDE V10 - Dossiers, canaux et travail quotidien agent

## Contexte

Nous construisons Mbambulaan, une infrastructure numerique de coordination pour la peche artisanale senegalaise. Les versions V1-V9 ont apporte : Atlas maritime, Filiere & Financement, Pilotage institutionnel, machines d'etat, anti-repetition, confiance des donnees, scenario Kayar, page Aujourd'hui et Vue actuelle dynamique.

Retour demo avec associe : la logique existe, mais l'experience agent n'est pas encore assez intuitive. L'agent ne doit pas avoir l'impression de voir une suite de statuts qui se mettent a jour. Il doit avoir l'impression de gerer des dossiers operationnels, avec stock, traitement, notes, canaux, pieces, historique, import/export et transparence.

## Probleme central

Mbambulaan doit passer de :

> des statuts qui avancent

vers :

> un outil de gestion de dossiers et de coordination des informations.

Chaque information doit avoir : origine, canal d'entree, point de contact, dossier associe, responsable, parcours, historique, pieces, notes, transmissions, sortie finale.

## Nouveaux faits terrain importants

Le Ministere possede un referent / point de contact a chaque quai, appele parfois poste. Ces postes pourraient devenir les relais operationnels du systeme : WhatsApp, telephone, constat terrain, clarification, transmission au niveau regional.

Il faut challenger leur role exact :

- sont-ils les premiers recepteurs de l'info ?
- sont-ils validateurs ?
- sont-ils seulement relais ?
- qui les mandate ?
- quelle relation avec direction regionale ?
- comment tracer leurs actions ?

## Points a challenger fortement

1. Gestion de dossiers agent
L'agent doit pouvoir voir son stock de dossiers : a traiter, en attente, bloques, termines. Chaque dossier doit avoir une fiche claire : objet, canal d'origine, point de contact, confiance, statut metier, notes, pieces, historique, prochaine action, export/import.

2. Canaux d'entree et de transit
L'information peut venir de WhatsApp, telephone, poste de quai, agent terrain, referent, formulaire, import, document. Il faut montrer d'ou vient l'info et par ou elle transite jusqu'a la fin du parcours. Le canal telephone doit etre pris en compte, pas uniquement WhatsApp.

3. WhatsApp mieux valorise
WhatsApp ne doit pas etre un petit bloc technique. Il doit etre presente comme un canal terrain structure, manuel, credible, associe a des dossiers. Il faut aussi comparer avec telephone : appel recu, resume d'appel, note d'appel, demande de rappel, piece manquante.

4. Role des postes / referents de quai
Proposer un modele operationnel realiste pour les postes : relais terrain, point de contact, source de signal, executant de verification, ou acteur de confirmation. Dire ce qui est MVP et ce qui est plus tard.

5. Atlas et clics differencies
Aujourd'hui, le clic sur quai, pirogue, debarquement, incident semble trop similaire. Il faut definir ce que chaque clic doit ouvrir :
- Quai : dossier territorial / point de coordination / referents / activite / alertes / dossiers actifs.
- Pirogue : dossier unite / cycle / declaration / proprietaire ou responsable / derniers debarquements.
- Debarquement : fiche operation / especes / volumes / ecarts / preuves.
- Incident : fiche evenement / criticite / origine / traitement / escalade.
- Besoin : fiche opportunite / financement / beneficiaires / pieces.

6. Repenser Voir le detail complet
Cette action est trop vague. Proposer un meilleur wording et une meilleure structure : Ouvrir le dossier, Voir le dossier du quai, Ouvrir la fiche incident, Ouvrir le dossier de verification, etc.

7. Page Aujourd'hui et Briefing du jour
Challenger la plus-value de Aujourd'hui. Risque : diluer l'effet Wahou. Faut-il garder Aujourd'hui, fusionner avec Briefing du jour, transformer en centre de travail agent, ou en faire un vrai inbox operationnel ? Le briefing du jour est apprecie : proposer comment le dynamiser.

8. Plus-value produit
Le produit doit prouver que Mbambulaan n'est