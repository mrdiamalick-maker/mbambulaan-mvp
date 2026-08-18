# Refonte produit Mbàmbulaan — socle canonique 2026

## Décision

La branche `codex/ecosysteme-halieu-v1` reste la baseline fonctionnelle. La refonte ne remplace pas ses moteurs, ses permissions, son seed ni ses parcours testés. Elle remplace la manière dont le produit les rend visibles et désirables.

## Diagnostic

### À préserver

- domaine partagé et objets reliés ;
- parcours sortie → retour → débarquement → lot → coordination → résultat ;
- situation infrastructure → qualification → intervention → résultat ;
- rôles et droits ;
- sources, fraîcheur, confiance et traces ;
- mode de démonstration déterministe ;
- tests métier et compatibilité PostgreSQL ;
- routes publiques, démonstration et application.

### À corriger

- landing trop proche d’une table des fonctionnalités ;
- Atlas trop abstrait et trop pauvre visuellement ;
- navigation professionnelle longue et sans regroupement mental ;
- écrans dominés par des cartes rectangulaires de même poids ;
- données riches peu mises en scène ;
- valeur communautaire, économique et durable insuffisamment reliée au jumeau territorial ;
- pilotage institutionnel trop peu visuel ;
- distinction insuffisante entre observer, agir, coordonner et décider.

## Architecture produit canonique

Mbàmbulaan est une seule infrastructure, projetée en quatre expériences.

1. **Espace public** — comprendre la filière, explorer un Atlas limité, découvrir les initiatives et demander une collaboration.
2. **Jumeau territorial** — partager une vue opérationnelle commune des territoires, quais, activités, capacités, espèces et tensions.
3. **Workspaces métier** — exécuter les responsabilités liées aux opérations, à la coordination, aux marchés, à la communauté et à la durabilité.
4. **Pilotage & impact** — décider, suivre les résultats et démontrer la valeur créée.

La démonstration n’est pas un cinquième produit. Elle orchestre les quatre expériences avec un seed et des rôles contrôlés.

## Promesse

**Voir la filière. Coordonner l’action. Préserver et créer de la valeur.**

## Objet pivot

Le territoire est le contexte. Le quai est le nœud opérationnel. La situation est l’unité de coordination. Le résultat est la preuve de valeur.

Le jumeau numérique relie :

`territoire → quai → acteurs et actifs → activité → situation → action → résultat`

## Missions des univers

| Univers | Mission | Objet dominant |
|---|---|---|
| Jumeau territorial | comprendre où et pourquoi agir | territoire / quai |
| Opérations | suivre les flux physiques et informationnels | sortie / débarquement / lot |
| Coordination | répartir les responsabilités et fermer les ruptures | situation / engagement |
| Marchés & valorisation | éclairer les opportunités économiques | lot / besoin / prix |
| Communauté & savoirs | capitaliser l’expérience et faire émerger les initiatives | observation / initiative |
| Durabilité | rendre la provenance et les améliorations vérifiables | lot / trace |
| Pilotage & impact | décider et démontrer les résultats | décision / outcome / métrique |

## Doctrine UX

- Une page, une mission et une action dominante.
- Une carte montre des objets localisables ; un cycle ou une chronologie vit dans une fiche.
- Les états de confiance sont secondaires mais vérifiables.
- Les chiffres sont visualisés dans leur contexte, jamais en rangée décorative.
- Les mêmes objets conservent le même nom, la même identité et le même historique sur toutes les routes.
- Le mobile sert les tâches terrain ; le desktop sert la vue opérationnelle commune.
- L’esthétique institutionnelle repose sur la hiérarchie, la précision et le calme, pas sur l’accumulation d’effets.

## IA

L’IA reste une capacité activable et gouvernée :

- synthèse de situation ;
- rapprochement explicable ;
- détection d’incohérence ;
- préparation de rapport ;
- capitalisation des apprentissages.

Elle ne décide pas, n’engage pas un acteur et ne transforme pas une estimation en fait.

## Critère de réussite

En moins d’une minute, un décideur doit comprendre :

1. ce que Mbàmbulaan représente ;
2. ce qui se passe sur le littoral ;
3. comment une information devient une action ;
4. comment les acteurs et capacités sont coordonnés ;
5. quelle valeur économique, sociale ou environnementale est créée ;
6. pourquoi une institution ou une organisation paierait et renouvellerait.
