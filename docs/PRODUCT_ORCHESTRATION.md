# Orchestration produit Mbàmbulaan

## Objectif

Réorganiser le MVP autour de parcours utilisateur clairs, sans ajouter de logique métier lourde.

Le produit doit répondre rapidement à trois questions :

- Qui êtes-vous ?
- Que devez-vous faire maintenant ?
- Que déclenche votre action dans l'écosystème Mbàmbulaan ?

## Rôles

### Pêcheur

Objectif : rendre mon lot visible.

Action principale : déclarer un arrivage.

Modules liés :

- Arrivages
- Opportunités
- Transactions
- Notifications

Valeur attendue : le lot peut être qualifié, rapproché d'un besoin, réservé et suivi.

### Mareyeur

Objectif : trouver un lot disponible ou publier un besoin.

Action principale : publier un besoin ou réserver une opportunité.

Modules liés :

- Besoins
- Arrivages
- Opportunités
- Transactions

Valeur attendue : le besoin est relié aux arrivages compatibles.

### Transformateur

Objectif : capter un surplus et sécuriser un approvisionnement.

Action principale : publier un besoin industriel ou réserver un lot sensible.

Modules liés :

- Besoins
- Opportunités
- Transactions
- Notifications

Valeur attendue : les lots sensibles peuvent être valorisés plus vite.

### Collectivité

Objectif : comprendre les tensions territoriales.

Action principale : consulter les quais sous tension.

Modules liés :

- Quais
- Dashboard
- Coordination
- Notifications

Valeur attendue : la collectivité voit où agir et quels quais prioriser.

### Administration / partenaire

Objectif : décider à partir des KPI, risques et priorités.

Action principale : lire la vue exécutive.

Modules liés :

- Executive
- Dashboard
- Coordination
- Quais

Valeur attendue : les signaux métier deviennent une synthèse institutionnelle.

## Parcours transverses

### Parcours lot

Déclaration -> Qualité -> Opportunité -> Réservation -> Traçabilité.

### Parcours besoin

Publication -> Matching -> Priorité -> Réservation.

### Parcours opportunité

Score -> Confiance -> Qualité -> Réservation.

### Parcours transaction

Réservée -> Préparation -> Retrait -> Terminée.

### Décision territoriale

Carte -> Tension -> Priorité -> Décision.

## Actions principales

| Action | Rôle concerné | Module cible | Résultat attendu |
| --- | --- | --- | --- |
| Déclarer un arrivage | Pêcheur | Arrivages | Un lot peut être détecté par un besoin compatible. |
| Publier un besoin | Mareyeur / Transformateur | Besoins | Le matching cherche les arrivages correspondants. |
| Réserver une opportunité | Mareyeur / Transformateur | Opportunités | Une transaction locale peut être suivie. |
| Suivre une transaction | Acteurs opérationnels | Transactions | Le retrait et la finalisation deviennent visibles. |
| Lire une notification critique | Tous les rôles | Notifications | Les signaux critiques sont reliés à une page d'action. |
| Consulter un quai sous tension | Collectivité | Quais | La décision territoriale devient lisible. |
| Lire la vue exécutive | Administration / Partenaire | Executive | Les signaux deviennent une synthèse institutionnelle. |

## Modules liés

- Accueil : promesse, Démo, Parcours, Executive.
- Démo : scénario complet, avant/après, lot, coordination, décision.
- Parcours : entrée par rôle.
- Espaces : pages d'action par acteur.
- Arrivages, Besoins, Opportunités, Transactions, Notifications : modules opérationnels.
- Dashboard : mesure de l'activité du jour.
- Coordination : pilotage opérationnel.
- Quais : décision territoriale.
- Executive : décision institutionnelle.

## Pages à refondre progressivement

Priorité haute :

- Accueil : réduire encore autour de la promesse et des trois CTA.
- Parcours : devenir l'entrée recommandée après l'accueil.
- Espaces : rester orientés action, pas descriptifs.
- Démo : conserver un scénario court et démonstratif.

Priorité moyenne :

- Dashboard : mesurer, sans se confondre avec Executive.
- Coordination : piloter les actions, sans se confondre avec Démo.
- Executive : décider, sans devenir un dashboard long.

Priorité basse :

- Harmonisation visuelle complémentaire.
- Recherche éventuelle de template.

## Priorité produit avant design

Avant tout achat ou intégration de template frontend, stabiliser :

1. Les parcours par rôle.
2. Les actions principales par page.
3. Les liens entre modules.
4. La démonstration du parcours lot.
5. La séparation Dashboard / Coordination / Executive.
6. La carte comme lecture territoriale centrale.
