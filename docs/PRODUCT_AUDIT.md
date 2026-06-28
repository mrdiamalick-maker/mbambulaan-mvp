# Audit produit Mbàmbulaan

## 1. Vision produit actuelle

Mbàmbulaan est un écosystème numérique de coordination pour la pêche artisanale sénégalaise.

Sa valeur n'est pas de présenter des pages isolées, mais d'organiser les signaux métier : arrivages, besoins, opportunités, réservations, transactions, notifications, tensions territoriales, qualité des lots, traçabilité et décision institutionnelle.

Mbàmbulaan n'est pas :

- une marketplace simple ;
- un blog ;
- un dashboard isolé ;
- une collection de pages.

La vision produit attendue est celle d'un système de coordination qui relie les acteurs, les quais, les lots et les décisions. Le MVP actuel contient déjà beaucoup de briques, mais leur orchestration reste encore trop implicite. L'utilisateur doit comprendre plus vite quoi faire, pourquoi le faire, et quel module est impacté.

## 2. Parcours cible par acteur

### Pêcheur

Le pêcheur doit pouvoir déclarer un lot, suivre son lot, recevoir une notification, puis voir si une opportunité ou une transaction existe.

Parcours cible :

1. Entrer dans l'espace Pêcheur.
2. Déclarer un arrivage.
3. Voir le lot apparaître dans Arrivages.
4. Consulter la traçabilité du lot.
5. Recevoir une notification lorsqu'une opportunité ou réservation apparaît.
6. Suivre la transaction si le lot est réservé.

### Mareyeur

Le mareyeur doit pouvoir consulter les lots, publier un besoin, recevoir une opportunité, réserver, puis suivre la transaction.

Parcours cible :

1. Entrer dans l'espace Mareyeur.
2. Rechercher des arrivages disponibles.
3. Publier un besoin d'achat.
4. Voir les opportunités compatibles.
5. Réserver un lot.
6. Suivre la transaction jusqu'au retrait.

### Transformateur

Le transformateur doit publier un besoin, capter un surplus, sécuriser un approvisionnement, puis suivre la livraison.

Parcours cible :

1. Entrer dans l'espace Transformateur.
2. Identifier les surplus ou lots sensibles.
3. Publier un besoin industriel.
4. Réserver une opportunité prioritaire.
5. Suivre la transaction et les notifications de livraison.

### Collectivité

La collectivité doit voir les quais, identifier les tensions, prioriser une action et suivre l'impact.

Parcours cible :

1. Entrer dans l'espace Collectivité.
2. Lire la carte des quais.
3. Identifier les zones en tension.
4. Consulter le Dashboard ou Coordination.
5. Prioriser une action territoriale.
6. Suivre l'impact de la journée.

### Administration / partenaire

L'administration ou le partenaire doit accéder à la vue exécutive, lire les KPI, voir la carte, comprendre les risques et prendre une décision.

Parcours cible :

1. Ouvrir la Vue exécutive.
2. Lire les KPI clés.
3. Voir la carte des quais prioritaires.
4. Identifier les risques et décisions recommandées.
5. Comprendre l'impact économique, social et territorial.

## 3. Inventaire des modules existants

| Module | Objectif métier | Utilisateur cible | Action principale attendue | Données affichées | Lien avec les autres modules | Problème actuel éventuel |
| --- | --- | --- | --- | --- | --- | --- |
| Arrivages | Rendre visibles les lots débarqués. | Pêcheur, mareyeur, coordinateur. | Déclarer un arrivage ou consulter les lots. | Espèce, quai, quantité, heure, statut, qualité. | Alimente matching, opportunités, qualité, traçabilité, impact. | L'action de déclaration existe, mais le lien avec opportunités et transactions doit être plus explicite. |
| Besoins | Qualifier la demande d'achat. | Mareyeur, transformateur. | Publier un besoin. | Espèce, quantité, unité, quai, urgence, statut, priorité. | Alimente matching, priorisation, tension, couverture. | Le besoin publié doit mieux montrer ce qu'il déclenche ensuite. |
| Opportunités | Afficher les correspondances entre offres et besoins. | Mareyeur, transformateur, coordinateur. | Consulter, initier un contact, réserver un lot. | Espèce, vendeur, acheteur, score, priorité, confiance, qualité. | Relie arrivage, besoin, réservation, transaction, traçabilité. | Module central, mais encore trop perçu comme une liste plutôt qu'un poste d'action. |
| Transactions | Suivre le cycle après réservation. | Mareyeur, transformateur, pêcheur. | Faire avancer ou suivre une transaction. | Statut, lot, espèce, quai, quantité, date, acteur. | Reçoit les réservations et nourrit dashboard, notifications, impact, traçabilité. | Le passage opportunité -> transaction doit être plus visible. |
| Notifications | Centraliser les signaux métier. | Tous les acteurs. | Lire et marquer comme lu. | Alertes, événements, niveaux, liens. | Reçoit signaux d'arrivages, besoins, opportunités, transactions, alertes. | Les notifications doivent devenir un vrai fil d'action, pas seulement une liste. |
| Dashboard | Lire la performance opérationnelle. | Collectivité, partenaire, équipe projet. | Comprendre l'activité et l'impact. | KPI, tensions, impact, qualité, simulation, executive. | Agrège tous les moteurs métier. | Trop riche : il faut hiérarchiser les décisions avant les détails. |
| Quais | Donner une lecture territoriale. | Collectivité, administration, coordinateur. | Sélectionner un quai et comprendre son état. | Carte, volume, arrivages, besoins, opportunités, tension. | Relie tension, impact, dashboard, arrivages, besoins, opportunités. | Le module est stratégique et doit être plus central dans le parcours. |
| Coordination | Piloter les actions prioritaires. | Coordinateur, équipe opérationnelle. | Réserver, proposer, ignorer, simuler, prioriser. | Arrivages, besoins urgents, opportunités, alertes, activité, KPI. | Devrait être le cockpit de tous les moteurs. | Risque de surcharge : trop de panneaux sans hiérarchie d'action suffisante. |
| Espaces | Adapter le produit par profil. | Tous les profils. | Choisir son espace métier. | Rôle, besoins, fonctionnalités, recommandations. | Devrait orienter vers modules et actions utiles. | Très important pour l'adoption, mais encore peu mis en avant comme porte d'entrée. |
| Démo | Montrer le scénario complet. | Investisseur, ministère, partenaire, équipe produit. | Lancer une simulation guidée. | Avant/après, lot suivi, flux, acteurs, décision, carte. | Relie tous les modules dans une narration. | Doit rester courte et prouver le système en moins de deux écrans. |
| Executive | Donner une synthèse décisionnelle. | Administration, collectivité, partenaire financier. | Lire les décisions recommandées. | KPI, carte, graphiques, risques, territoires. | Agrège impact, tension, priorité, qualité, confiance. | Doit être une page BI de décision, pas un second dashboard long. |

## 4. Inventaire des moteurs métier

| Moteur | Rôle | Pages qui l'utilisent | Valeur métier | Visibilité actuelle dans l'UX | Problème éventuel |
| --- | --- | --- | --- | --- | --- |
| matching | Détecter les compatibilités offre/besoin. | Opportunités, Coordination, Dashboard, Démo. | Transforme un arrivage et un besoin en opportunité. | Visible via opportunités et scores. | Le déclenchement automatique doit être mieux expliqué. |
| recommendation | Classer les meilleures mises en relation. | Opportunités, Coordination, Dashboard. | Priorise les opportunités à traiter. | Visible via scores et badges. | Les raisons du score doivent être systématiquement mises en avant. |
| reference | Centraliser quais, espèces, profils et statuts. | Toutes les pages métier. | Donne de la crédibilité locale. | Peu visible, mais structure les données. | Utile en profondeur, mais pas encore valorisé comme référentiel métier. |
| trust | Calculer la confiance acteur. | Opportunités, Coordination, Dashboard. | Aide à savoir avec qui travailler. | Visible dans opportunités et KPI. | La confiance doit être reliée à la décision de réserver. |
| impact | Calculer l'impact économique, social et territorial. | Dashboard, Démo, Coordination, Executive. | Prouve la valeur créée. | Visible mais dispersé. | Doit être ramené à quelques indicateurs décisifs. |
| tension | Identifier les zones où la demande dépasse l'offre. | Dashboard, Quais, Coordination, Démo, Executive. | Oriente l'action territoriale. | Visible dans carte et tableaux. | La carte doit devenir une entrée principale, pas une section secondaire. |
| prioritization | Calculer les priorités de besoins, opportunités et actions. | Besoins, Opportunités, Coordination, Dashboard, Démo. | Aide à décider quoi traiter d'abord. | Visible via badges et files de priorité. | Les actions prioritaires doivent être plus cliquables et plus concrètes. |
| alerts | Transformer les signaux en alertes actionnables. | Notifications, Coordination, Dashboard, Démo. | Pousse les bons signaux au bon acteur. | Visible dans notifications et alertes. | Les alertes critiques doivent avoir une action claire. |
| traceability | Suivre l'historique complet du lot. | Opportunités, Transactions, Dashboard, Coordination, Démo. | Donne confiance et continuité métier. | Présente dans détails et KPI. | La traçabilité doit être attachée visiblement au lot central. |
| quality | Evaluer fraîcheur, risque de perte et action recommandée. | Arrivages, Opportunités, Transactions, Dashboard, Coordination, Démo. | Réduit le risque de gaspillage. | Visible via badges et panneaux. | Trop utile pour rester secondaire : doit guider la priorité. |
| daySimulation | Simuler une journée de pêche. | Démo, Dashboard, Coordination, Notifications. | Montre Mbàmbulaan comme système vivant. | Visible dans démo et cockpit. | Doit raconter une progression, pas seulement ajouter des événements. |
| roleRecommendations | Adapter les recommandations par rôle. | Espaces, Dashboard, Coordination, Démo. | Rend le produit personnel et compréhensible. | Visible dans espaces. | Sous-exploité comme entrée produit principale. |
| executive | Consolider la synthèse institutionnelle. | Executive, Dashboard, Coordination, Démo. | Transforme les données en décision. | Visible dans vue exécutive. | Doit éviter la redondance avec Dashboard. |

## 5. Analyse de cohérence

### Packs bien exploités

- Arrivages et Besoins : les deux flux opérationnels existent et alimentent le reste.
- Matching et Opportunités : le coeur de coordination est présent.
- Transactions et Notifications : la chaîne après réservation existe.
- Impact, tension, priorisation et executive : la logique de décision est déjà développée.
- Carte des quais : la dimension territoriale existe et commence à devenir visible.

### Packs sous-exploités

- Espaces par rôle : ils devraient être une porte d'entrée majeure, mais restent encore trop séparés du scénario principal.
- Traçabilité : forte valeur métier, mais doit devenir le fil conducteur du lot.
- Qualité : essentielle pour le risque de perte, mais pas encore assez centrale dans la décision.
- Role recommendations : très utile pour clarifier "que dois-je faire ?", mais encore peu dominante.
- Day simulation : utile pour démontrer le système, mais doit être reliée à une narration plus stricte.

### Fonctionnalités invisibles

- Les raisons exactes d'une recommandation.
- Le passage logique entre opportunité réservée et transaction.
- La façon dont une notification devient une action.
- La contribution de la qualité du lot à la priorité.
- La traçabilité complète comme preuve de continuité.
- Le rôle du référentiel métier dans la crédibilité locale.

### Pages redondantes

- Dashboard, Coordination et Executive peuvent se recouvrir si leur mission n'est pas stricte.
- Démo et Coordination peuvent sembler proches si la démo devient trop opérationnelle.
- Espaces et modules métier peuvent se répéter si les espaces ne deviennent pas des parcours orientés action.

Répartition cible :

- Démo : prouver le scénario complet.
- Espaces : orienter un utilisateur selon son rôle.
- Modules opérationnels : exécuter une action.
- Coordination : piloter la journée.
- Dashboard : mesurer.
- Executive : décider.

### Actions utilisateur pas assez claires

- Que faire après avoir déclaré un arrivage ?
- Que se passe-t-il après publication d'un besoin ?
- Quelle opportunité traiter en premier ?
- Pourquoi réserver ce lot plutôt qu'un autre ?
- Quelle notification demande une action immédiate ?
- Quelle décision territoriale prendre à partir de la carte ?

### Modules peu reliés au parcours

- Espaces doit relier plus directement vers actions métier.
- Notifications doit renvoyer vers les modules concernés avec des actions plus explicites.
- Quais doit être connecté au cockpit décisionnel.
- Executive doit être accessible depuis la démo comme synthèse finale.

### Où la vision produit est perdue

La vision se perd lorsque l'application ressemble à une somme de pages riches au lieu d'un parcours coordonné. Le MVP doit réduire la charge cognitive : un acteur doit savoir en quelques secondes ce qu'il peut faire, quelle donnée est importante, et quel impact son action produit.

## 6. Parcours produit cible

Parcours cible simple :

Accueil
-> Choix du profil ou démo guidée
-> Déclaration / besoin / opportunité
-> Réservation / transaction
-> Traçabilité / notification
-> Dashboard / coordination
-> Executive / décision

Ce parcours doit être le fil directeur de la prochaine itération produit. Chaque page doit indiquer où l'utilisateur se situe dans ce flux.

## 7. Refonte produit recommandée

### A. Accueil

Objectif : faire comprendre la promesse et orienter immédiatement.

Contenu attendu :

- promesse claire ;
- choix : lancer démo ou choisir un profil ;
- carte territoriale visible ;
- accès secondaire aux modules.

### B. Démo guidée

Objectif : prouver l'écosystème complet.

Contenu attendu :

- scénario complet ;
- avant / après ;
- parcours d'un lot ;
- décisions et impact ;
- liens vers modules seulement si utiles.

### C. Espaces par rôle

Objectif : aider chaque acteur à comprendre que la plateforme est faite pour lui.

Espaces :

- pêcheur ;
- mareyeur ;
- transformateur ;
- collectivité ;
- administration.

Chaque espace doit commencer par les trois actions prioritaires du rôle.

### D. Modules opérationnels

Objectif : exécuter une action métier.

Modules :

- arrivages ;
- besoins ;
- opportunités ;
- transactions ;
- notifications.

Chaque module doit avoir une action principale visible, une liste claire, et un lien explicite vers l'étape suivante.

### E. Pilotage

Objectif : gérer la journée et le territoire.

Modules :

- dashboard ;
- coordination ;
- carte des quais.

Le pilotage doit montrer les signaux, les priorités et les actions à faire.

### F. Institutionnel

Objectif : permettre la décision.

Module :

- executive.

La vue Executive doit rester synthétique : KPI, carte, risques, décisions recommandées.

## 8. Backlog correctif avant design

Corrections prioritaires avant tout achat de template :

1. Clarifier les parcours principaux par acteur.
2. Définir une action principale par page.
3. Réduire la navigation visible aux entrées utiles.
4. Relier chaque module à l'étape précédente et suivante.
5. Recentrer la démo sur un lot unique, un flux et une décision finale.
6. Recentrer Executive sur la décision, pas sur l'exhaustivité.
7. Mettre la cartographie au centre du pilotage territorial.
8. Identifier les pages qui se recouvrent et préciser leur mission.
9. Transformer notifications et alertes en points d'action.
10. Rendre traçabilité, qualité, tension et priorité visibles dans un même parcours.

Priorité produit recommandée :

- P0 : parcours guidé et actions principales.
- P1 : clarification Dashboard / Coordination / Executive.
- P2 : intégration plus forte des espaces par rôle.
- P3 : choix éventuel d'un template ou système visuel externe.

## 9. Décision sur template frontend

Un template frontend pourra être étudié après clarification produit.

Le risque actuel serait d'acheter un template pour masquer un problème d'orchestration. Le besoin prioritaire est de savoir quels parcours doivent être démontrés, quelles actions doivent être mises en avant, et quelles pages doivent porter la décision.

Critères futurs de choix :

- React / Next.js ;
- dashboard BI ;
- composants cartes/KPI ;
- navigation claire ;
- support responsive ;
- possibilité d'intégrer cartes ;
- design professionnel sobre ;
- pas trop lourd.

Décision recommandée : ne pas choisir de template tant que les parcours Pêcheur, Mareyeur, Transformateur, Collectivité et Administration ne sont pas stabilisés.
