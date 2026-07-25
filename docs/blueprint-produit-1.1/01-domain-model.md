# 01 — Domain Model

## 1. Finalité

Le Domain Model décrit les objets métier structurants de Mbàmbulaan, leurs responsabilités, leurs relations et leurs règles de cohérence.

Il sert de base commune aux équipes produit, design, data et développement.

Il ne doit pas être interprété comme un simple schéma de base de données. Il formalise le sens métier des objets qui permettent à Mbàmbulaan de coordonner l'écosystème.

## 2. Principes de modélisation

Le modèle respecte les principes suivants :

- un objet métier a un sens précis ;
- un objet a un moteur propriétaire ;
- les responsabilités sont explicites ;
- les relations sont typées ;
- la provenance est conservée ;
- les décisions sont traçables ;
- la donnée n'est pas dupliquée sans raison ;
- les droits d'accès sont liés au contexte ;
- les objets du pilote restent simples ;
- les extensions futures ne doivent pas casser le cœur du modèle.

## 3. Vue d'ensemble

```text
Acteur
   ↓ appartient à / représente
Organisation
   ↓ agit sur
Territoire
   ↓ contient
Situation
   ↓ peut devenir
Besoin priorisé
   ↓ peut être traité par
Initiative
   ↓ mobilise
Engagement / Financement
   ↓ se traduit en
Action / Jalon / Risque
   ↓ produit
Résultat / Effet / Impact
   ↓ alimente
Apprentissage / Pratique réplicable
```

## 4. Référentiels structurants

### 4.1 Acteur

**Définition**

Une personne ou une entité humaine agissant dans l'écosystème.

**Exemples**

- pêcheur ;
- mareyeur ;
- femme transformatrice ;
- agent public ;
- expert ;
- investisseur ;
- représentant d'une organisation.

**Attributs essentiels**

- identifiant ;
- nom d'usage ;
- type d'acteur ;
- coordonnées ;
- langue préférée ;
- statut de vérification ;
- territoire principal ;
- organisations associées ;
- mandats ;
- consentements ;
- état actif ou inactif.

**Moteur propriétaire**

Identités et organisations.

**Règles**

- un acteur peut appartenir à plusieurs organisations ;
- un acteur peut disposer de plusieurs mandats ;
- l'identité personnelle ne doit pas être confondue avec le rôle institutionnel ;
- les données sensibles doivent être minimisées.

### 4.2 Organisation

**Définition**

Une structure collective reconnue dans l'écosystème.

**Exemples**

- CLPA ;
- GIE ;
- ministère ;
- commune ;
- ONG ;
- banque ;
- bailleur ;
- entreprise ;
- université.

**Attributs essentiels**

- identifiant ;
- nom ;
- type ;
- statut juridique ou institutionnel ;
- territoires d'intervention ;
- contacts ;
- statut de vérification ;
- capacités déclarées ;
- état actif ou inactif.

**Moteur propriétaire**

Identités et organisations.

### 4.3 Mandat

**Définition**

Une autorisation temporaire ou permanente permettant à un acteur d'agir au nom d'une organisation ou sur un périmètre donné.

**Exemples**

- valider un signalement ;
- représenter une organisation ;
- arbitrer une initiative ;
- consulter des données confidentielles ;
- administrer un territoire.

**Attributs essentiels**

- acteur ;
- organisation ;
- rôle ;
- périmètre ;
- date de début ;
- date de fin ;
- statut ;
- justificatif ;
- autorité ayant accordé le mandat.

**Règles**

- un mandat expiré ne permet plus d'agir ;
- toute action sensible doit être rattachée au mandat utilisé ;
- le mandat est distinct du profil utilisateur.

### 4.4 Territoire

**Définition**

Un espace géographique, administratif ou fonctionnel utilisé pour organiser l'information et la coordination.

**Exemples**

- site de débarquement ;
- commune ;
- département ;
- région ;
- zone de pêche ;
- corridor logistique.

**Attributs essentiels**

- identifiant ;
- nom ;
- type ;
- géométrie ou localisation ;
- territoire parent ;
- statut ;
- référentiels externes ;
- organisations responsables ;
- niveau de confidentialité éventuel.

**Moteur propriétaire**

Territoires.

**Règles**

- les territoires peuvent être hiérarchiques ou se chevaucher ;
- chaque relation territoriale doit être typée ;
- les référentiels externes conservent leur provenance.

## 5. Observation et qualification

### 5.1 Observation

**Définition**

Un fait, une mesure ou une information collectée à propos d'un territoire, d'un acteur, d'une infrastructure ou d'une activité.

**Exemples**

- volume débarqué ;
- disponibilité de glace ;
- prix observé ;
- panne ;
- état sanitaire ;
- disponibilité d'un équipement.

**Attributs essentiels**

- type ;
- valeur ;
- unité ;
- date et heure ;
- lieu ;
- source ;
- auteur ;
- niveau de confiance ;
- preuve ;
- statut de validation.

**Moteur propriétaire**

Observation.

### 5.2 Signalement

**Définition**

Une contribution intentionnelle signalant un problème, un besoin, une opportunité ou un changement.

**Attributs essentiels**

- auteur ;
- type ;
- description ;
- territoire ;
- date ;
- pièces jointes ;
- niveau d'urgence déclaré ;
- statut ;
- destinataire initial ;
- accusé de réception.

**Moteur propriétaire**

Observation.

**Cycle de vie**

```text
Brouillon
→ Soumis
→ Reçu
→ En qualification
→ Qualifié
→ Orienté
→ Clos
```

**Règles**

- l'auteur doit recevoir un accusé de réception ;
- toute clôture doit être motivée ;
- un signalement peut être relié à une situation existante ;
- un signalement ne devient pas automatiquement une priorité.

### 5.3 Situation

**Définition**

Un état de fait consolidé représentant un problème, un besoin, un risque ou une opportunité nécessitant une compréhension ou une action collective.

**Exemples**

- rupture récurrente de glace ;
- panne critique d'une infrastructure ;
- baisse anormale des débarquements ;
- opportunité de nouveau débouché ;
- besoin de formation partagé.

**Attributs essentiels**

- titre ;
- type ;
- description ;
- territoire ;
- période ;
- acteurs concernés ;
- observations sources ;
- criticité ;
- urgence ;
- étendue ;
- niveau de confiance ;
- responsable de qualification ;
- statut ;
- orientation.

**Moteur propriétaire**

Qualification.

**Cycle de vie**

```text
Détectée
→ En analyse
→ Qualifiée
→ Priorisée ou non priorisée
→ En traitement
→ Résolue, stabilisée ou archivée
```

### 5.4 Besoin priorisé

**Définition**

Une situation reconnue comme devant faire l'objet d'une réponse, avec un niveau de priorité et une justification explicites.

**Attributs essentiels**

- situation source ;
- priorité ;
- critères utilisés ;
- justification ;
- instance décisionnaire ;
- date de décision ;
- périmètre ;
- horizon ;
- statut.

**Moteur propriétaire**

Décision, avec une référence forte vers Qualification.

**Règles**

- une priorité doit être justifiée ;
- les critères doivent être visibles aux acteurs autorisés ;
- une priorité peut être révisée ;
- la non-priorisation doit aussi être traçable.

## 6. Coordination et engagement

### 6.1 Espace de coordination

**Définition**

Un cadre structuré permettant à plusieurs acteurs de partager des informations, décisions et engagements autour d'un objet commun.

**Peut être rattaché à**

- une situation ;
- une initiative ;
- un territoire ;
- un portefeuille ;
- un incident.

**Attributs essentiels**

- objet principal ;
- participants ;
- rôles ;
- règles de visibilité ;
- échéances ;
- sujets ouverts ;
- historique.

**Moteur propriétaire**

Coordination.

### 6.2 Engagement

**Définition**

Une promesse explicite prise par un acteur ou une organisation.

**Exemples**

- fournir une donnée ;
- exécuter une action ;
- mobiliser un financement ;
- valider un document ;
- mettre à disposition un équipement.

**Attributs essentiels**

- auteur de l'engagement ;
- bénéficiaire ;
- objet ;
- contenu ;
- échéance ;
- conditions ;
- preuve attendue ;
- statut ;
- date d'acceptation.

**Moteur propriétaire**

Coordination.

**Cycle de vie**

```text
Proposé
→ Accepté
→ En cours
→ Tenu, partiellement tenu, non tenu ou annulé
```

### 6.3 Décision

**Définition**

Un arbitrage explicite pris par une personne ou une instance habilitée.

**Attributs essentiels**

- objet ;
- décideur ;
- mandat ;
- options examinées ;
- décision retenue ;
- justification ;
- conditions ;
- date ;
- statut ;
- possibilité de révision.

**Moteur propriétaire**

Décision.

**Règles**

- le décideur et son mandat doivent être identifiables ;
- les éléments ayant appuyé la décision doivent être conservés ;
- une décision révisée ne remplace pas silencieusement l'historique.

## 7. Initiative et portefeuille

### 7.1 Initiative

**Définition**

Une réponse structurée destinée à traiter un besoin priorisé ou à saisir une opportunité.

**Attributs essentiels**

- titre ;
- problème ou besoin source ;
- objectif ;
- bénéficiaires ;
- territoire ;
- porteur ;
- partenaires ;
- activités ;
- livrables ;
- calendrier ;
- budget estimé ;
- indicateurs ;
- risques ;
- dépendances ;
- statut ;
- niveau de maturité.

**Moteur propriétaire**

Initiatives.

**Cycle de vie**

```text
Idée
→ En structuration
→ À valider
→ Validée
→ En recherche d'appui
→ Financée
→ En exécution
→ Suspendue, terminée ou abandonnée
```

**Règles**

- une initiative doit être reliée à un besoin ou une opportunité ;
- les responsabilités doivent être explicites ;
- les résultats attendus doivent être mesurables ;
- l'abandon doit être motivé.

### 7.2 Portefeuille de transformation

**Définition**

Un ensemble cohérent d'initiatives contribuant à une même transformation.

**Exemples**

- réduire les pertes post-capture ;
- améliorer la sécurité en mer ;
- renforcer l'accès au financement ;
- améliorer la qualité sanitaire.

**Attributs essentiels**

- objectif de transformation ;
- territoires ;
- initiatives ;
- indicateurs consolidés ;
- responsables ;
- financements ;
- risques systémiques ;
- statut.

**Moteur propriétaire**

Initiatives, avec contribution des moteurs Décision, Investissements et Mesure.

## 8. Investissements et ressources

### 8.1 Besoin de financement

**Définition**

Le montant et la nature des ressources nécessaires à une initiative.

**Attributs essentiels**

- initiative ;
- catégorie ;
- montant ;
- devise ;
- période ;
- affectation ;
- niveau de priorité ;
- financement déjà sécurisé ;
- reste à financer.

**Moteur propriétaire**

Investissements.

### 8.2 Opportunité de financement

**Définition**

Une source potentielle d'appui financier ou non financier.

**Attributs essentiels**

- financeur ;
- type d'appui ;
- critères ;
- territoires éligibles ;
- calendrier ;
- montant indicatif ;
- conditions ;
- statut.

**Moteur propriétaire**

Investissements.

### 8.3 Engagement financier

**Définition**

Une intention ou décision de mobiliser des ressources au bénéfice d'une initiative.

**Attributs essentiels**

- financeur ;
- bénéficiaire ;
- initiative ;
- montant ;
- devise ;
- type ;
- conditions ;
- calendrier ;
- statut ;
- preuves.

**Cycle de vie**

```text
Manifestation d'intérêt
→ Proposition
→ Accord de principe
→ Confirmé
→ Décaissé partiellement ou totalement
→ Clos ou annulé
```

**Limite**

Mbàmbulaan peut tracer l'engagement et son état, sans nécessairement exécuter le paiement.

## 9. Exécution et risques

### 9.1 Action

**Définition**

Une unité de travail assignée à un responsable avec une échéance et un résultat attendu.

**Attributs essentiels**

- titre ;
- objet parent ;
- responsable ;
- contributeurs ;
- échéance ;
- priorité ;
- statut ;
- résultat attendu ;
- preuve ;
- dépendances.

**Moteur propriétaire**

Exécution et risques.

**Cycle de vie**

```text
À faire
→ Planifiée
→ En cours
→ Bloquée
→ Terminée
→ Vérifiée
```

### 9.2 Jalon

**Définition**

Un point de contrôle important dans l'exécution d'une initiative ou d'un engagement.

**Attributs essentiels**

- date cible ;
- condition de réalisation ;
- responsable ;
- statut ;
- preuve ;
- décision associée.

### 9.3 Risque

**Définition**

Un événement incertain susceptible d'affecter un objectif, une initiative ou un portefeuille.

**Attributs essentiels**

- description ;
- catégorie ;
- probabilité ;
- impact ;
- criticité ;
- propriétaire ;
- mesures de mitigation ;
- indicateurs d'alerte ;
- statut.

**Cycle de vie**

```text
Identifié
→ Évalué
→ Mitigé
→ Surveillé
→ Réalisé ou clos
```

### 9.4 Incident

**Définition**

Un événement avéré perturbant une activité ou une initiative.

**Attributs essentiels**

- type ;
- gravité ;
- date ;
- territoire ;
- objet affecté ;
- responsable de traitement ;
- actions ;
- statut ;
- résolution ;
- leçons apprises.

## 10. Résultats et impact

### 10.1 Indicateur

**Définition**

Une mesure définie pour suivre une situation, une activité, un résultat, un effet ou un impact.

**Attributs essentiels**

- nom ;
- définition ;
- type ;
- unité ;
- formule ;
- fréquence ;
- source ;
- niveau de désagrégation ;
- responsable ;
- cible éventuelle.

**Moteur propriétaire**

Mesure et impact.

### 10.2 Mesure

**Définition**

Une valeur observée pour un indicateur à une date et sur un périmètre donnés.

**Attributs essentiels**

- indicateur ;
- valeur ;
- date ;
- territoire ;
- objet associé ;
- source ;
- niveau de confiance ;
- validation.

### 10.3 Résultat

**Définition**

Un changement directement attribuable à une action ou une initiative.

**Exemples**

- équipement remis en service ;
- délai réduit ;
- acteurs formés ;
- volume de pertes évité.

### 10.4 Effet

**Définition**

Un changement de comportement, de performance ou de condition résultant des résultats produits.

### 10.5 Impact

**Définition**

Un changement durable et significatif à l'échelle d'un territoire, d'une population ou de la filière.

**Règle**

Les liens d'attribution doivent être distingués des liens de contribution.

## 11. Connaissance et réplication

### 11.1 Apprentissage

**Définition**

Une conclusion structurée issue d'une expérience, d'une initiative, d'un incident ou d'une analyse.

**Attributs essentiels**

- contexte ;
- observation ;
- conclusion ;
- preuve ;
- auteur ;
- niveau de validation ;
- conditions d'application ;
- objets liés.

**Moteur propriétaire**

Connaissance et réplication.

### 11.2 Pratique réplicable

**Définition**

Une méthode ou initiative suffisamment documentée pour être reproduite dans un autre contexte.

**Attributs essentiels**

- problème traité ;
- prérequis ;
- étapes ;
- acteurs ;
- ressources ;
- coûts ;
- risques ;
- résultats observés ;
- conditions de succès ;
- contextes non adaptés.

### 11.3 Document

**Définition**

Une pièce justificative ou ressource liée à un objet métier.

**Attributs essentiels**

- type ;
- titre ;
- fichier ou lien ;
- auteur ;
- date ;
- version ;
- objet lié ;
- confidentialité ;
- statut de validation.

**Service propriétaire**

Socle documentaire transversal.

## 12. Confiance et gouvernance

### 12.1 Preuve

**Définition**

Un élément permettant de soutenir une affirmation, une mesure, une action ou une décision.

**Exemples**

- photo ;
- document ;
- validation institutionnelle ;
- donnée externe ;
- signature ;
- géolocalisation ;
- historique système.

### 12.2 Validation

**Définition**

Une action par laquelle un acteur habilité confirme la qualité, la conformité ou l'acceptabilité d'un objet.

**Attributs essentiels**

- objet ;
- validateur ;
- mandat ;
- type de validation ;
- décision ;
- commentaire ;
- date ;
- statut.

### 12.3 Politique d'accès

**Définition**

Une règle déterminant qui peut voir ou agir sur un objet, dans quel contexte et pour quelle finalité.

**Dimensions**

- rôle ;
- organisation ;
- mandat ;
- territoire ;
- objet ;
- finalité ;
- sensibilité ;
- consentement ;
- validité temporelle.

### 12.4 Trace d'audit

**Définition**

Un enregistrement immuable d'une action importante réalisée sur un objet métier.

**Attributs essentiels**

- acteur ;
- mandat ;
- action ;
- objet ;
- date ;
- contexte ;
- état avant et après ;
- source technique.

## 13. Relations transversales

### 13.1 Relation entre objets

Toute relation importante doit pouvoir préciser :

- type ;
- source ;
- date de début ;
- date de fin ;
- niveau de confiance ;
- auteur ;
- statut ;
- visibilité.

### 13.2 Relation entre acteurs et organisations

Exemples :

- membre ;
- représentant ;
- employé ;
- élu ;
- bénéficiaire ;
- partenaire ;
- prestataire ;
- financeur.

### 13.3 Relation entre situations et initiatives

Une initiative peut traiter plusieurs situations liées.

Une situation peut être adressée par plusieurs initiatives complémentaires.

La relation doit préciser :

- contribution attendue ;
- couverture partielle ou totale ;
- territoire ;
- période ;
- responsable.

## 14. Agrégats métier proposés

Les agrégats suivants sont proposés comme unités principales de cohérence transactionnelle.

### Agrégat Identité

- Acteur ;
- Mandat ;
- Appartenance organisationnelle ;
- Consentement.

### Agrégat Organisation

- Organisation ;
- Représentants ;
- Territoires d'intervention ;
- Statut de vérification.

### Agrégat Signalement

- Signalement ;
- Pièces jointes ;
- Accusé de réception ;
- Historique de statut.

### Agrégat Situation

- Situation ;
- Observations sources ;
- Qualification ;
- Orientation ;
- Niveau de priorité.

### Agrégat Initiative

- Initiative ;
- Activités ;
- Livrables ;
- Budget ;
- Indicateurs ;
- Risques ;
- Partenaires.

### Agrégat Engagement

- Engagement ;
- Conditions ;
- Échéance ;
- Preuves ;
- Statut.

### Agrégat Exécution

- Action ;
- Jalon ;
- Incident ;
- Risque opérationnel.

### Agrégat Mesure

- Indicateur ;
- Mesures ;
- Cibles ;
- Méthode de calcul.

### Agrégat Connaissance

- Apprentissage ;
- Pratique réplicable ;
- Évaluation ;
- Contextes d'application.

## 15. Identifiants et versionnement

Chaque objet métier doit disposer :

- d'un identifiant interne stable ;
- d'éventuels identifiants externes ;
- d'une date de création ;
- d'une date de dernière modification ;
- d'un auteur ou système source ;
- d'un statut ;
- d'une version lorsque la modification doit être historisée.

Les objets suivants doivent conserver un historique renforcé :

- décisions ;
- mandats ;
- validations ;
- engagements ;
- priorités ;
- mesures ;
- politiques d'accès.

## 16. Statuts communs

Pour éviter les incohérences, les statuts doivent rester adaptés au domaine mais suivre des conventions communes :

- brouillon ;
- actif ;
- suspendu ;
- clos ;
- annulé ;
- archivé.

Les statuts métier plus précis doivent être définis dans le moteur propriétaire.

## 17. Objets prioritaires pour le pilote

Le pilote doit se concentrer sur :

- Acteur ;
- Organisation ;
- Mandat simple ;
- Territoire ;
- Signalement ;
- Situation ;
- Engagement ;
- Action ;
- Décision simple ;
- Document ;
- Preuve ;
- Notification ;
- Trace d'audit minimale.

Les objets suivants peuvent être simplifiés ou reportés :

- portefeuille de transformation avancé ;
- opportunités de financement structurées ;
- effets et impacts complexes ;
- pratiques réplicables avancées ;
- scoring ;
- recommandations automatisées ;
- intégrations financières profondes.

## 18. Questions ouvertes

Les décisions suivantes doivent être précisées lors des prochains chapitres :

- frontière exacte entre Situation et Besoin priorisé ;
- niveau de granularité des territoires ;
- gestion des acteurs sans identité numérique vérifiée ;
- modèle de consentement ;
- règles de fusion des doublons ;
- gouvernance des référentiels ;
- niveau de preuve requis selon les objets ;
- séparation entre engagement opérationnel et engagement financier ;
- cycle de validation des apprentissages ;
- politique d'archivage.

## 19. Test de cohérence

Avant d'ajouter un nouvel objet métier, vérifier :

- porte-t-il un sens métier distinct ?
- existe-t-il déjà sous une autre forme ?
- quel moteur le possède ?
- quel acteur le crée ?
- qui peut le modifier ?
- quelle décision améliore-t-il ?
- quel événement produit-il ?
- est-il nécessaire au pilote ?
- son coût de gestion est-il justifié ?

## 20. Principe directeur

> Le Domain Model de Mbàmbulaan doit rendre explicites les objets qui portent la coordination, la confiance, l'exécution et l'impact, sans transformer la plateforme en système généraliste.
