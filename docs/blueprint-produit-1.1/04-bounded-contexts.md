# 04 — Bounded Contexts

## 1. Finalité

Les Bounded Contexts définissent les frontières de responsabilité du produit Mbàmbulaan.

Ils permettent de répondre clairement à ces questions :

- quel moteur possède quelle règle métier ?
- quel moteur crée et modifie quel objet ?
- quelles données peuvent être lues ailleurs ?
- quels échanges doivent passer par des événements ou des APIs ?
- quelles responsabilités ne doivent pas être dupliquées ?

L'objectif n'est pas de multiplier artificiellement les services techniques. Il s'agit d'abord de clarifier le modèle métier et les responsabilités durables.

## 2. Principes

Les frontières doivent respecter les règles suivantes :

- un objet métier a un propriétaire principal ;
- une règle métier ne doit exister que dans un seul contexte ;
- les autres contextes consomment des contrats explicites ;
- les données partagées sont minimisées ;
- les dépendances circulaires sont évitées ;
- la coordination passe par des événements ou des commandes explicites ;
- le pilote peut être déployé dans un monolithe modulaire ;
- les frontières métier doivent exister même si les services techniques ne sont pas encore séparés ;
- aucun contexte ne doit devenir un “fourre-tout”.

## 3. Vue d'ensemble

```text
Identités & Organisations
           ↓
       Territoires
           ↓
       Observation
           ↓
      Qualification
           ↓
        Décision
           ↓
      Coordination
           ↓
       Initiatives
           ↓
      Investissements
           ↓
  Exécution & Risques
           ↓
    Mesure & Impact
           ↓
Connaissance & Réplication

Confiance & Gouvernance = transversal
Notifications = transversal
Documents = transversal
Intégrations = transversal
```

## 4. Contexte — Identités et Organisations

### Responsabilité

Gérer les acteurs, les organisations, leurs rattachements, leurs rôles, leurs mandats et leurs statuts de vérification.

### Objets propriétaires

- Acteur ;
- Organisation ;
- Mandat ;
- Appartenance ;
- Représentation ;
- Consentement de base ;
- Statut de vérification.

### Règles principales

- unicité d'un acteur ;
- cycle de vie d'un mandat ;
- distinction identité personnelle / rôle institutionnel ;
- gestion des appartenances multiples ;
- contrôle de la validité d'un mandat ;
- vérification des acteurs et organisations.

### Ce que ce contexte ne possède pas

- les décisions prises par l'acteur ;
- les signalements créés ;
- les initiatives portées ;
- les droits d'accès métier détaillés sur chaque objet.

### Services exposés

- rechercher un acteur ou une organisation ;
- vérifier un mandat ;
- obtenir les rôles actifs ;
- obtenir les organisations liées ;
- vérifier un statut de confiance.

### Événements produits

- ActeurCree ;
- ActeurVerifie ;
- OrganisationCreee ;
- OrganisationVerifiee ;
- MandatAccorde ;
- MandatExpire ;
- MandatRevoque.

## 5. Contexte — Territoires

### Responsabilité

Gérer les territoires, leurs hiérarchies, leurs relations, leurs référentiels et les rattachements institutionnels principaux.

### Objets propriétaires

- Territoire ;
- Type de territoire ;
- Relation territoriale ;
- Référence géographique ;
- Rattachement organisation-territoire.

### Règles principales

- validité des relations territoriales ;
- gestion des territoires parents ;
- gestion des chevauchements ;
- cohérence des référentiels externes ;
- statut actif ou archivé.

### Ce que ce contexte ne possède pas

- les observations faites sur un territoire ;
- les priorités territoriales ;
- les initiatives territoriales ;
- la gouvernance politique du territoire.

### Services exposés

- rechercher un territoire ;
- résoudre une hiérarchie ;
- obtenir les territoires liés ;
- vérifier qu'un acteur ou une organisation agit sur un territoire.

## 6. Contexte — Observation

### Responsabilité

Recevoir, enregistrer et tracer les observations, contributions et signalements issus du terrain ou de systèmes externes.

### Objets propriétaires

- Observation ;
- Signalement ;
- Source de donnée ;
- Pièce jointe initiale ;
- Accusé de réception.

### Règles principales

- réception des contributions ;
- statut du signalement ;
- preuve de soumission ;
- rattachement à une source ;
- validation ou invalidation d'une observation ;
- accusé de réception au contributeur.

### Ce que ce contexte ne possède pas

- la qualification finale d'une situation ;
- la priorité ;
- la décision ;
- le plan d'action ;
- l'impact.

### Services exposés

- soumettre un signalement ;
- enregistrer une observation ;
- suivre la réception ;
- ajouter une preuve ;
- consulter l'historique d'un signalement.

## 7. Contexte — Qualification

### Responsabilité

Transformer les contributions brutes en situations consolidées, qualifiées et orientables.

### Objets propriétaires

- Situation ;
- Qualification ;
- Criticité ;
- Urgence qualifiée ;
- Étendue ;
- Niveau de confiance ;
- Orientation.

### Règles principales

- regroupement de plusieurs signalements ;
- rattachement de nouvelles observations ;
- qualification de la criticité ;
- distinction urgence déclarée / urgence qualifiée ;
- détection de doublons ;
- orientation vers coordination, initiative ou archivage.

### Ce que ce contexte ne possède pas

- la décision de priorité institutionnelle ;
- les engagements ;
- les actions ;
- les financements.

### Services exposés

- créer une situation ;
- rattacher un signalement ;
- qualifier une situation ;
- proposer une orientation ;
- réviser une qualification.

## 8. Contexte — Décision

### Responsabilité

Formaliser les arbitrages, les priorités et les décisions prises par les acteurs ou instances habilitées.

### Objets propriétaires

- Décision ;
- Besoin priorisé ;
- Option ;
- Critère d'arbitrage ;
- Justification ;
- Révision de décision.

### Règles principales

- vérification du mandat du décideur ;
- traçabilité des options examinées ;
- justification obligatoire ;
- historisation des révisions ;
- distinction proposition / décision ;
- gestion des conditions de validité.

### Ce que ce contexte ne possède pas

- la qualification technique de la situation ;
- l'exécution de la décision ;
- la création automatique d'une initiative ;
- le financement.

### Services exposés

- proposer une décision ;
- prendre une décision ;
- réviser une décision ;
- prioriser un besoin ;
- consulter l'historique d'un arbitrage.

## 9. Contexte — Coordination

### Responsabilité

Organiser les interactions entre acteurs, rendre visibles les responsabilités et suivre les engagements.

### Objets propriétaires

- Espace de coordination ;
- Participant ;
- Sujet ouvert ;
- Engagement ;
- Blocage ;
- Compte rendu structuré.

### Règles principales

- invitation et rôle des participants ;
- visibilité des sujets ;
- proposition et acceptation d'un engagement ;
- suivi des échéances ;
- statut tenu / non tenu ;
- escalade d'un blocage ;
- traçabilité des interactions structurantes.

### Ce que ce contexte ne possède pas

- les tâches détaillées d'exécution ;
- les règles de financement ;
- la définition des indicateurs ;
- les décisions institutionnelles.

### Services exposés

- créer un espace de coordination ;
- inviter un participant ;
- proposer un engagement ;
- accepter ou refuser ;
- déclarer un blocage ;
- suivre les engagements.

## 10. Contexte — Initiatives

### Responsabilité

Structurer les réponses organisées aux besoins priorisés et gérer leur cycle de vie.

### Objets propriétaires

- Initiative ;
- Portefeuille ;
- Objectif ;
- Activité ;
- Livrable ;
- Partenaire ;
- Budget estimatif ;
- Dépendance ;
- Niveau de maturité.

### Règles principales

- rattachement à un besoin ou une opportunité ;
- définition d'un porteur ;
- cohérence objectifs / résultats attendus ;
- validation de la maturité ;
- cycle de vie de l'initiative ;
- gestion du portefeuille.

### Ce que ce contexte ne possède pas

- l'exécution détaillée des actions ;
- les décaissements ;
- les mesures observées ;
- la décision de priorité initiale.

### Services exposés

- créer une initiative ;
- soumettre pour validation ;
- valider la structure ;
- rattacher à un portefeuille ;
- déclarer le besoin de financement ;
- lancer ou suspendre une initiative.

## 11. Contexte — Investissements

### Responsabilité

Mettre en relation les besoins de financement, les opportunités d'appui et les engagements financiers.

### Objets propriétaires

- Besoin de financement ;
- Opportunité de financement ;
- Manifestation d'intérêt ;
- Éligibilité ;
- Engagement financier ;
- Décaissement déclaré ;
- Couverture financière.

### Règles principales

- qualification du besoin ;
- éligibilité ;
- conditions d'un financement ;
- statut d'un engagement financier ;
- couverture partielle ou totale ;
- traçabilité des déclarations de décaissement.

### Ce que ce contexte ne possède pas

- le paiement bancaire ;
- la comptabilité générale ;
- la validation métier d'une initiative ;
- le suivi opérationnel des actions.

### Services exposés

- déclarer un besoin ;
- publier une opportunité ;
- tester une éligibilité ;
- enregistrer un intérêt ;
- confirmer un engagement ;
- déclarer un décaissement.

## 12. Contexte — Exécution et Risques

### Responsabilité

Transformer les engagements, décisions et initiatives en actions suivies, jalons, risques et incidents.

### Objets propriétaires

- Action ;
- Jalon ;
- Risque ;
- Incident ;
- Dépendance opérationnelle ;
- Preuve d'exécution.

### Règles principales

- assignation ;
- échéance ;
- statut d'exécution ;
- vérification d'une action ;
- gestion des blocages ;
- évaluation des risques ;
- traitement des incidents ;
- clôture et preuve.

### Ce que ce contexte ne possède pas

- la décision institutionnelle ;
- la définition de l'initiative ;
- l'engagement initial ;
- la mesure d'impact à long terme.

### Services exposés

- créer et assigner une action ;
- déclarer un blocage ;
- marquer comme terminée ;
- vérifier une action ;
- créer un risque ;
- déclarer un incident ;
- suivre les jalons.

## 13. Contexte — Mesure et Impact

### Responsabilité

Définir les indicateurs, enregistrer les mesures et distinguer activité, résultat, effet et impact.

### Objets propriétaires

- Indicateur ;
- Cible ;
- Mesure ;
- Résultat ;
- Effet ;
- Impact ;
- Méthode de calcul ;
- Écart de performance.

### Règles principales

- définition non ambiguë d'un indicateur ;
- traçabilité de la source ;
- validation des mesures ;
- versionnement des formules ;
- distinction attribution / contribution ;
- consolidation par territoire ou portefeuille.

### Ce que ce contexte ne possède pas

- les observations brutes du terrain ;
- la décision ;
- l'exécution ;
- la narration libre d'un apprentissage.

### Services exposés

- définir un indicateur ;
- enregistrer une mesure ;
- valider une mesure ;
- calculer un écart ;
- déclarer un résultat ;
- évaluer un effet ou un impact.

## 14. Contexte — Connaissance et Réplication

### Responsabilité

Capitaliser les apprentissages, documenter les pratiques réplicables et soutenir leur adaptation à d'autres contextes.

### Objets propriétaires

- Apprentissage ;
- Pratique réplicable ;
- Condition d'application ;
- Évaluation de réplication ;
- Guide ;
- Leçon issue d'un incident.

### Règles principales

- rattachement à des preuves ;
- validation de l'apprentissage ;
- explicitation du contexte ;
- distinction apprentissage / opinion ;
- évaluation des conditions de réplication ;
- conservation des limites.

### Ce que ce contexte ne possède pas

- les mesures sources ;
- les actions ;
- les décisions ;
- les documents purement administratifs.

### Services exposés

- capturer un apprentissage ;
- le faire valider ;
- déclarer une pratique réplicable ;
- lancer une réplication ;
- enregistrer son évaluation.

## 15. Contexte transversal — Confiance et Gouvernance

### Responsabilité

Appliquer les règles de preuve, validation, accès, consentement, audit et confiance sur l'ensemble du produit.

### Objets propriétaires

- Politique d'accès ;
- Validation ;
- Preuve ;
- Consentement détaillé ;
- Niveau de confiance ;
- Trace d'audit ;
- Suspicion de donnée.

### Règles principales

- autorisation contextuelle ;
- contrôle du mandat ;
- confidentialité ;
- preuve requise ;
- journalisation ;
- révocation ;
- non-répudiation lorsque nécessaire ;
- minimisation des données.

### Limite importante

Ce contexte ne doit pas absorber les règles métier des autres moteurs. Il fournit les mécanismes transversaux, mais le moteur propriétaire reste responsable de la décision métier.

## 16. Contexte transversal — Documents

### Responsabilité

Stocker, versionner et sécuriser les documents liés aux objets métier.

### Objets propriétaires

- Document ;
- Version ;
- Référence de stockage ;
- Empreinte ;
- Métadonnées documentaires.

### Règles principales

- intégrité ;
- versionnement ;
- lien avec l'objet métier ;
- confidentialité ;
- rétention ;
- archivage.

### Limite

Le document ne décide jamais de son propre statut métier. Le moteur métier lié décide s'il constitue une preuve acceptable.

## 17. Contexte transversal — Notifications

### Responsabilité

Diffuser les informations utiles aux acteurs par les canaux appropriés.

### Objets propriétaires

- Notification ;
- Préférence de canal ;
- Modèle de message ;
- Tentative de livraison ;
- Statut de livraison.

### Règles principales

- respect des préférences ;
- choix du canal ;
- reprise après échec ;
- limitation des envois ;
- contenu proportionné à la sensibilité ;
- lien avec l'événement déclencheur.

### Limite

Une notification n'est pas un événement métier. Elle est une conséquence d'un événement ou d'une règle métier.

## 18. Contexte transversal — Intégrations

### Responsabilité

Assurer les échanges avec les systèmes externes sans transférer les responsabilités métier.

### Objets propriétaires

- Connecteur ;
- Mapping ;
- Synchronisation ;
- Import ;
- Export ;
- Erreur d'intégration ;
- Référence externe.

### Règles principales

- source de vérité explicite ;
- idempotence ;
- reprise sur erreur ;
- traçabilité ;
- contrats versionnés ;
- minimisation ;
- surveillance.

### Limite

Le contexte Intégrations ne doit pas devenir propriétaire des données importées ni des règles métier associées.

## 19. Matrice de propriété simplifiée

| Objet | Contexte propriétaire | Lecteurs principaux |
|---|---|---|
| Acteur | Identités & Organisations | Tous selon droits |
| Organisation | Identités & Organisations | Coordination, Initiatives, Investissements |
| Territoire | Territoires | Tous |
| Signalement | Observation | Qualification, Coordination |
| Situation | Qualification | Décision, Initiatives, Coordination |
| Besoin priorisé | Décision | Initiatives, Investissements |
| Engagement | Coordination | Exécution, Mesure |
| Initiative | Initiatives | Investissements, Exécution, Mesure |
| Engagement financier | Investissements | Initiatives, Mesure |
| Action | Exécution & Risques | Coordination, Mesure |
| Risque | Exécution & Risques | Initiatives, Décision |
| Indicateur | Mesure & Impact | Initiatives, Décision |
| Apprentissage | Connaissance & Réplication | Tous selon contexte |
| Politique d'accès | Confiance & Gouvernance | Tous |
| Document | Documents | Tous selon droits |

## 20. Relations entre contextes

### Identités & Organisations → Tous

Fournit les acteurs, organisations et mandats.

### Territoires → Observation, Qualification, Initiatives, Mesure

Fournit les périmètres géographiques et institutionnels.

### Observation → Qualification

Transmet les observations et signalements soumis.

### Qualification → Décision

Expose les situations qualifiées et leur niveau de confiance.

### Décision → Coordination et Initiatives

Expose les besoins priorisés et les arbitrages.

### Coordination → Exécution

Transmet les engagements acceptés et blocages.

### Initiatives → Investissements et Exécution

Expose les initiatives validées et leur structure.

### Investissements → Initiatives

Expose la couverture financière et les engagements confirmés.

### Exécution → Mesure

Expose les actions terminées, jalons et preuves.

### Mesure → Décision et Connaissance

Expose les résultats, écarts et effets observés.

### Connaissance → Initiatives et Décision

Expose les apprentissages et pratiques réplicables.

## 21. Patterns d'intégration recommandés

### Lecture synchrone

À utiliser pour :

- vérifier un mandat ;
- lire un référentiel ;
- obtenir un état courant nécessaire à une décision immédiate.

### Événement asynchrone

À utiliser pour :

- notifier un changement d'état ;
- déclencher une réaction dans plusieurs contextes ;
- éviter un couplage fort.

### Commande explicite

À utiliser lorsqu'un contexte demande à un autre d'effectuer une action métier.

Exemple :

```text
CréerActionDepuisEngagement
```

La commande peut être refusée si les règles du contexte cible ne sont pas respectées.

### Projection locale

À utiliser lorsqu'un contexte a besoin d'une vue de lecture optimisée sans devenir propriétaire de la donnée.

## 22. Règles anti-corruption

Lorsqu'un système externe ou un autre contexte utilise un vocabulaire différent, une couche de traduction doit protéger le modèle interne.

Exemples :

- un “projet” externe peut devenir une Initiative ;
- une “plainte” externe peut devenir un Signalement ;
- un “bénéficiaire” peut correspondre à plusieurs rôles selon le contexte ;
- un statut financier externe ne doit pas être copié sans mapping explicite.

## 23. Déploiement recommandé pour le pilote

Le pilote ne nécessite pas des microservices séparés.

Architecture recommandée :

```text
Monolithe modulaire
+ modules métier clairement séparés
+ base de données partagée avec schémas logiques ou conventions strictes
+ événements internes
+ APIs internes explicites
+ journal d'audit
```

Conditions :

- aucune écriture directe dans les tables d'un autre module ;
- contrats de module documentés ;
- événements métier conservés ;
- dépendances unidirectionnelles ;
- tests de frontières.

## 24. Priorités du pilote

Les contextes prioritaires sont :

1. Identités & Organisations ;
2. Territoires ;
3. Observation ;
4. Qualification ;
5. Coordination ;
6. Exécution & Risques ;
7. Décision simple ;
8. Confiance & Gouvernance ;
9. Notifications ;
10. Documents.

Les contextes Initiatives, Investissements, Mesure et Connaissance peuvent démarrer sous une forme simplifiée.

## 25. Risques architecturaux à éviter

- contexte Coordination devenant un outil de messagerie générique ;
- contexte Initiatives devenant un ERP projet complet ;
- contexte Investissements devenant une banque ;
- contexte Mesure devenant un data warehouse sans finalité ;
- contexte Confiance absorbant toutes les règles métier ;
- contexte Intégrations devenant source de vérité ;
- duplication des acteurs et territoires ;
- écriture directe entre modules ;
- partage de tables sans responsabilité explicite ;
- création de microservices trop tôt.

## 26. Questions ouvertes

- faut-il séparer Qualification et Décision dès le pilote ?
- l'Engagement financier reste-t-il dans Investissements ou devient-il une spécialisation d'Engagement ?
- le Consentement appartient-il entièrement à Confiance ou partiellement à Identités ?
- la Preuve doit-elle être un objet transversal unique ou spécialisée par contexte ?
- le Portefeuille appartient-il à Initiatives ou à une gouvernance stratégique future ?
- quelles lectures nécessitent une projection locale ?
- quelles intégrations sont réellement nécessaires au pilote ?

## 27. Test d'admission d'un nouveau contexte

Avant de créer un nouveau Bounded Context, vérifier :

- existe-t-il un langage métier distinct ?
- existe-t-il des règles propres et durables ?
- possède-t-il des objets spécifiques ?
- son cycle de vie est-il autonome ?
- la séparation réduit-elle réellement le couplage ?
- peut-il rester un module d'un contexte existant ?
- est-il nécessaire maintenant ?

## 28. Principe directeur

> Les frontières de Mbàmbulaan doivent protéger la cohérence métier et la capacité d'évolution, sans introduire une complexité technique prématurée.
