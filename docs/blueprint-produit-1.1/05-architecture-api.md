# 05 — Architecture API

## 1. Finalité

L'Architecture API définit la manière dont les contextes métier de Mbàmbulaan exposent leurs capacités, échangent des données et orchestrent les parcours.

Elle doit permettre :

- une architecture modulaire ;
- des responsabilités claires ;
- des intégrations maîtrisées ;
- une sécurité cohérente ;
- une faible dépendance entre moteurs ;
- une évolution progressive du produit ;
- une compatibilité avec les usages mobiles et la faible connectivité.

L'objectif n'est pas de produire immédiatement un catalogue exhaustif d'endpoints, mais de fixer les contrats, conventions et règles d'exposition.

## 2. Principes directeurs

Les APIs de Mbàmbulaan doivent respecter les principes suivants :

- les APIs exposent des capacités métier, pas la structure interne de la base de données ;
- chaque ressource a un contexte propriétaire ;
- les commandes et les consultations sont distinguées ;
- les règles métier restent dans le domaine ;
- les contrats sont versionnés ;
- les opérations sensibles sont traçables ;
- les traitements doivent être idempotents lorsque nécessaire ;
- les erreurs doivent être explicites et actionnables ;
- les échanges doivent minimiser les données personnelles ;
- l'expérience mobile et hors ligne doit être prise en compte dès la conception.

## 3. Style architectural recommandé

Pour le pilote :

- monolithe modulaire ;
- APIs REST pour les interactions synchrones ;
- événements métier internes pour le découplage ;
- traitements asynchrones pour les notifications, synchronisations et tâches longues ;
- stockage documentaire séparé du cœur transactionnel ;
- journal d'audit transversal.

Les microservices ne sont pas une exigence initiale.

Ils ne deviennent pertinents que si :

- un contexte doit évoluer indépendamment ;
- la charge le justifie ;
- des contraintes de sécurité l'imposent ;
- une équipe autonome en devient propriétaire ;
- le coût opérationnel reste maîtrisé.

## 4. Typologie des APIs

### 4.1 API de commandes

Elle déclenche une intention métier.

Exemples :

- soumettre un signalement ;
- qualifier une situation ;
- accepter un engagement ;
- assigner une action ;
- prendre une décision.

Les commandes doivent utiliser des verbes explicites lorsque l'action ne correspond pas à une simple modification de ressource.

Exemple :

```http
POST /api/v1/signalements/{id}/soumettre
```

### 4.2 API de consultation

Elle permet de lire une vue métier adaptée à un usage.

Exemples :

- consulter les situations prioritaires d'un territoire ;
- afficher les engagements en retard ;
- obtenir la chronologie d'une initiative.

Les vues de consultation peuvent agréger plusieurs contextes, à condition de ne pas devenir des sources de vérité concurrentes.

### 4.3 API d'administration

Elle gère :

- référentiels ;
- politiques d'accès ;
- paramètres territoriaux ;
- règles de validation ;
- configuration des notifications.

Elle doit être strictement contrôlée.

### 4.4 API d'intégration

Elle permet les échanges avec des systèmes externes.

Elle doit utiliser :

- des contrats dédiés ;
- des identifiants externes ;
- des règles d'idempotence ;
- une journalisation ;
- une stratégie de reprise ;
- une limitation claire du périmètre.

## 5. Convention d'URL

Format recommandé :

```text
/api/{version}/{ressource}
```

Exemples :

```text
/api/v1/acteurs
/api/v1/organisations
/api/v1/territoires
/api/v1/signalements
/api/v1/situations
/api/v1/engagements
/api/v1/actions
/api/v1/decisions
```

Règles :

- noms au pluriel ;
- minuscules ;
- kebab-case si nécessaire ;
- pas de verbes génériques dans les ressources ;
- verbes métier uniquement pour les transitions explicites ;
- profondeur limitée.

## 6. Versionnement

La version majeure est portée dans l'URL :

```text
/api/v1/
```

Une nouvelle version majeure est requise lorsque :

- un champ obligatoire est supprimé ;
- le sens d'un champ change ;
- un comportement métier devient incompatible ;
- une structure de réponse change fortement ;
- une règle d'autorisation est fondamentalement modifiée.

Les changements compatibles doivent être privilégiés.

## 7. Format de réponse standard

### Réponse simple

```json
{
  "data": {},
  "meta": {
    "request_id": "...",
    "timestamp": "..."
  }
}
```

### Liste paginée

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 125,
    "request_id": "..."
  }
}
```

### Erreur

```json
{
  "error": {
    "code": "ENGAGEMENT_DEJA_ACCEPTE",
    "message": "Cet engagement a déjà été accepté.",
    "details": {},
    "request_id": "..."
  }
}
```

## 8. Codes HTTP

Utilisation recommandée :

- `200` : succès ;
- `201` : ressource créée ;
- `202` : traitement accepté et asynchrone ;
- `204` : succès sans contenu ;
- `400` : requête invalide ;
- `401` : authentification requise ;
- `403` : action interdite ;
- `404` : ressource introuvable ;
- `409` : conflit métier ;
- `422` : règle métier non satisfaite ;
- `429` : limitation de débit ;
- `500` : erreur interne ;
- `503` : service temporairement indisponible.

## 9. Identité et autorisation

Chaque requête sensible doit pouvoir déterminer :

- l'acteur ;
- l'organisation représentée ;
- le mandat utilisé ;
- le territoire concerné ;
- la finalité ;
- les permissions applicables.

Le contrôle d'accès doit combiner :

- rôle ;
- mandat ;
- organisation ;
- territoire ;
- propriété ou participation ;
- sensibilité de l'objet ;
- état de l'objet.

## 10. Authentification

Le pilote peut utiliser :

- authentification par numéro de téléphone ;
- code à usage unique ;
- session sécurisée ;
- authentification renforcée pour les profils sensibles.

Les intégrations utilisent :

- clés d'API ;
- OAuth 2.0 lorsque pertinent ;
- certificats ou signatures pour les échanges sensibles.

## 11. Idempotence

Les opérations suivantes doivent accepter une clé d'idempotence :

- soumission d'un signalement ;
- création d'un engagement ;
- enregistrement d'un décaissement ;
- import de données ;
- synchronisation hors ligne ;
- traitement déclenché par un système externe.

Exemple d'en-tête :

```http
Idempotency-Key: 7f8b...
```

## 12. Concurrence et version optimiste

Les mises à jour sensibles utilisent un numéro de version ou un `ETag`.

Exemple :

```http
If-Match: "v12"
```

En cas de conflit :

```http
409 Conflict
```

Les objets concernés en priorité :

- situations ;
- engagements ;
- décisions ;
- initiatives ;
- politiques d'accès.

## 13. Pagination, filtrage et tri

Paramètres recommandés :

```text
?page=1
&page_size=20
&status=en_cours
&territory_id=...
&sort=-created_at
```

Règles :

- pagination obligatoire pour les collections ;
- taille maximale contrôlée ;
- filtres documentés ;
- tri stable ;
- pas de requêtes arbitraires exposant la structure interne.

## 14. Recherche

La recherche doit distinguer :

- recherche simple ;
- filtres métier ;
- recherche plein texte ;
- recherche géographique.

Exemple :

```http
GET /api/v1/situations?query=glace&territory_id=...
```

La visibilité des résultats doit respecter les droits d'accès.

## 15. Téléversement de documents

Flux recommandé :

1. demande d'autorisation d'envoi ;
2. génération d'une URL temporaire ;
3. téléversement direct vers le stockage ;
4. confirmation ;
5. analyse de sécurité ;
6. rattachement à l'objet métier ;
7. émission de `DocumentAjoute`.

Les APIs ne doivent pas transporter inutilement de gros fichiers en base64.

## 16. Gestion hors ligne

Le client mobile doit pouvoir :

- créer des brouillons hors ligne ;
- conserver une file d'opérations ;
- synchroniser ultérieurement ;
- détecter les conflits ;
- afficher l'état de synchronisation ;
- éviter les doubles soumissions.

Chaque opération locale doit comporter :

- un identifiant client ;
- une date locale ;
- une clé d'idempotence ;
- une version de schéma ;
- le contexte minimal.

## 17. Contrats par contexte

### 17.1 Identités et organisations

Capacités principales :

- créer et lire un acteur ;
- créer et vérifier une organisation ;
- accorder ou révoquer un mandat ;
- consulter les rôles et représentations.

Exemples :

```http
POST /api/v1/acteurs
GET /api/v1/acteurs/{id}
POST /api/v1/organisations
POST /api/v1/mandats
POST /api/v1/mandats/{id}/revoquer
```

### 17.2 Territoires

```http
GET /api/v1/territoires
GET /api/v1/territoires/{id}
GET /api/v1/territoires/{id}/contexte
```

### 17.3 Observation

```http
POST /api/v1/signalements
POST /api/v1/signalements/{id}/soumettre
GET /api/v1/signalements/{id}
POST /api/v1/observations
```

### 17.4 Qualification

```http
POST /api/v1/situations
POST /api/v1/situations/{id}/qualifier
POST /api/v1/situations/{id}/orienter
GET /api/v1/situations/{id}
```

### 17.5 Décision

```http
POST /api/v1/decisions
POST /api/v1/decisions/{id}/prendre
POST /api/v1/decisions/{id}/reviser
POST /api/v1/situations/{id}/prioriser
```

### 17.6 Coordination

```http
POST /api/v1/espaces-coordination
POST /api/v1/engagements
POST /api/v1/engagements/{id}/accepter
POST /api/v1/engagements/{id}/declarer-tenu
GET /api/v1/espaces-coordination/{id}/chronologie
```

### 17.7 Initiatives

```http
POST /api/v1/initiatives
POST /api/v1/initiatives/{id}/soumettre
POST /api/v1/initiatives/{id}/valider
POST /api/v1/initiatives/{id}/lancer
GET /api/v1/initiatives/{id}
```

### 17.8 Investissements

```http
POST /api/v1/besoins-financement
POST /api/v1/engagements-financiers
POST /api/v1/engagements-financiers/{id}/confirmer
POST /api/v1/decaissements
```

### 17.9 Exécution et risques

```http
POST /api/v1/actions
POST /api/v1/actions/{id}/assigner
POST /api/v1/actions/{id}/demarrer
POST /api/v1/actions/{id}/bloquer
POST /api/v1/actions/{id}/terminer
POST /api/v1/actions/{id}/verifier
POST /api/v1/risques
```

### 17.10 Mesure et impact

```http
POST /api/v1/indicateurs
POST /api/v1/mesures
POST /api/v1/resultats
GET /api/v1/initiatives/{id}/performance
```

### 17.11 Connaissance et réplication

```http
POST /api/v1/apprentissages
POST /api/v1/apprentissages/{id}/valider
POST /api/v1/pratiques-replicables
```

## 18. Vues transversales

Certaines vues doivent agréger plusieurs contextes.

Exemples :

```http
GET /api/v1/mon-travail
GET /api/v1/territoires/{id}/synthese
GET /api/v1/initiatives/{id}/chronologie
GET /api/v1/portefeuilles/{id}/sante
```

Ces vues sont en lecture seule.

Elles ne deviennent jamais propriétaires des objets agrégés.

## 19. Événements et API

Une commande synchrone peut :

1. valider l'identité et les droits ;
2. appliquer une règle métier ;
3. modifier un agrégat ;
4. enregistrer la transaction ;
5. publier un événement métier ;
6. retourner le nouvel état.

La publication d'événement doit utiliser un mécanisme fiable, par exemple une outbox transactionnelle.

## 20. Webhooks

Les webhooks peuvent notifier des systèmes externes.

Ils doivent comporter :

- signature ;
- identifiant d'événement ;
- date ;
- version ;
- mécanisme de retry ;
- politique d'expiration ;
- journal de livraison.

Les consommateurs doivent gérer les doublons.

## 21. Intégrations externes

Chaque intégration doit documenter :

- système source ;
- système cible ;
- source de vérité ;
- données échangées ;
- fréquence ;
- responsabilité en cas d'erreur ;
- transformation ;
- mapping ;
- idempotence ;
- sécurité ;
- rétention ;
- stratégie de déconnexion.

Mbàmbulaan doit privilégier l'intégration à la reconstruction.

## 22. Notifications

Les notifications sont déclenchées par les événements, mais restent séparées du domaine.

Canaux possibles :

- notification applicative ;
- SMS ;
- WhatsApp ou canal équivalent si autorisé ;
- e-mail ;
- appel ou relai humain pour certains cas critiques.

Une notification doit avoir :

- un destinataire ;
- une finalité ;
- un événement source ;
- un statut ;
- une politique de retry ;
- une langue ;
- un niveau de priorité.

## 23. Audit

Toute opération sensible doit enregistrer :

- acteur ;
- mandat ;
- action ;
- objet ;
- date ;
- adresse ou source technique pertinente ;
- état avant et après ;
- justification si requise ;
- request_id.

Sont prioritaires :

- décisions ;
- validations ;
- mandats ;
- changements de droits ;
- clôtures ;
- engagements financiers ;
- accès à des données sensibles.

## 24. Sécurité

Mesures minimales :

- chiffrement en transit ;
- chiffrement au repos pour les données sensibles ;
- rotation des secrets ;
- limitation de débit ;
- validation stricte des entrées ;
- contrôle des types de fichiers ;
- protection contre les injections ;
- séparation des environnements ;
- journalisation sécurisée ;
- revue des permissions.

## 25. Observabilité

Les APIs doivent produire :

- métriques de disponibilité ;
- latence ;
- taux d'erreur ;
- volume ;
- saturation ;
- traces distribuées lorsque utile ;
- logs structurés ;
- métriques métier.

Exemples de métriques métier :

- signalements soumis ;
- délai moyen de qualification ;
- engagements en retard ;
- actions bloquées ;
- décisions prises ;
- taux de synchronisation réussie.

## 26. Limitation de débit

Les limites doivent dépendre :

- du type d'acteur ;
- du canal ;
- de l'opération ;
- du niveau de sensibilité ;
- du risque d'abus.

Les intégrations doivent disposer de quotas explicites.

## 27. Cache

Le cache est acceptable pour :

- référentiels ;
- territoires ;
- listes publiques ;
- vues de synthèse non critiques.

Il doit être évité ou contrôlé pour :

- droits ;
- mandats ;
- décisions récentes ;
- données financières ;
- états opérationnels critiques.

## 28. Tests de contrat

Chaque endpoint doit disposer de tests portant sur :

- structure ;
- validation ;
- droits ;
- transitions métier ;
- erreurs ;
- idempotence ;
- concurrence ;
- version ;
- confidentialité.

Les intégrations doivent inclure des tests consommateurs-fournisseurs lorsque pertinent.

## 29. APIs prioritaires pour le pilote

Le pilote doit se concentrer sur :

- authentification simple ;
- acteurs et organisations ;
- mandats simples ;
- territoires ;
- signalements ;
- situations ;
- décisions simples ;
- espaces de coordination ;
- engagements ;
- actions ;
- documents et preuves ;
- notifications ;
- chronologie ;
- audit minimal ;
- synchronisation hors ligne.

## 30. Hors périmètre initial

À reporter :

- API publique ouverte ;
- marketplace d'APIs ;
- GraphQL généralisé ;
- streaming temps réel sur tous les objets ;
- paiements natifs ;
- scoring automatisé ;
- moteur de recommandation ;
- architecture multi-cloud complexe ;
- microservices généralisés.

## 31. Gouvernance des contrats

Toute nouvelle API doit préciser :

- problème métier ;
- contexte propriétaire ;
- acteurs ;
- droits ;
- ressource ou commande ;
- règles métier ;
- données minimales ;
- erreurs ;
- événements produits ;
- idempotence ;
- tests ;
- version ;
- nécessité pour le pilote.

## 32. Principe directeur

> Une API Mbàmbulaan doit exposer une capacité métier claire, préserver la propriété des moteurs et réduire les frictions de coordination sans créer de dépendance technique inutile.
