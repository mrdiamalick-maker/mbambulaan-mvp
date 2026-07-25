# Product Architecture Blueprint — Mbàmbulaan

## 1. Constitution produit

Mbàmbulaan n'est ni un tableau de bord, ni un outil de gestion de dossiers, ni une marketplace, ni un ERP.

Mbàmbulaan est une infrastructure numérique de coordination pour la filière halieutique sénégalaise. Elle doit :

- relier les acteurs ;
- organiser les flux de valeur ;
- fiabiliser les informations utiles ;
- faciliter les décisions et l'exécution ;
- améliorer la confiance ;
- valoriser la filière et les territoires ;
- créer des services suffisamment utiles pour justifier un financement, une licence, un abonnement ou une participation durable.

Toute initiative produit doit pouvoir être reliée à cette constitution.

## 2. Architecture logique

L'architecture produit suit l'ordre suivant :

1. réalités terrain ;
2. flux de valeur ;
3. infrastructures sectorielles ;
4. capacités métier ;
5. objets métier communs ;
6. parcours acteurs ;
7. interfaces et automatisations.

Les écrans ne sont qu'une représentation des capacités. Ils ne doivent jamais dicter l'architecture métier.

## 3. Les infrastructures sectorielles de Mbàmbulaan

### 3.1 Infrastructure Mer et activité de pêche

**Finalité**

Rendre visible et coordonnable l'activité de pêche, depuis la préparation du retour jusqu'à l'arrivée au quai.

**Flux couverts**
- sortie et retour prévisionnel ;
- pêche du jour ;
- besoins avant débarquement ;
- alertes et contraintes de retour ;
- reconnaissance de l'activité réelle.

**Capacités métier**
- annoncer un retour ;
- partager une estimation qualifiée des captures ;
- indiquer les besoins de glace, manutention ou transport ;
- recevoir les conditions d'accueil du quai ;
- relier le retour à la pirogue, l'organisation et le territoire.

**Valeur économique**
- réduction de l'attente et des pertes ;
- meilleur accès aux services ;
- meilleure reconnaissance de l'activité des organisations de pêcheurs.

### 3.2 Infrastructure Débarquement, pesée et traçabilité

**Finalité**

Transformer un retour en information confirmée, partagée et réutilisable par les acteurs autorisés.

**Flux couverts**
- accueil et débarquement ;
- pesée ;
- qualification des volumes ;
- origine et destination ;
- niveau de confiance et preuve.

**Capacités métier**
- confirmer un débarquement ;
- enregistrer ou valider une pesée ;
- qualifier les espèces, volumes et état de conservation ;
- rattacher les données au quai, à la pirogue et aux acteurs ;
- corriger une information selon des règles de gouvernance.

**Valeur économique**
- visibilité crédible sur les volumes ;
- réduction des litiges ;
- traçabilité opérationnelle ;
- base fiable pour les services commerciaux, publics et financiers.

### 3.3 Infrastructure Quais et continuité opérationnelle

**Finalité**

Donner aux quais et territoires une capacité de coordination de leurs ressources, contraintes et services.

**Flux couverts**
- capacité d'accueil ;
- affectation d'espaces et de services ;
- équipements et disponibilité ;
- incidents et interventions ;
- saturation et alternatives.

**Capacités métier**
- publier les capacités utiles ;
- préparer l'accueil des retours ;
- signaler une panne ou saturation ;
- mobiliser un prestataire ou une autorité ;
- suivre la continuité du service jusqu'au résultat.

**Valeur économique**
- meilleure exploitation des quais ;
- réduction des interruptions ;
- justification des besoins d'investissement ;
- services professionnels monétisables pour les gestionnaires et prestataires.

### 3.4 Infrastructure Froid, glace, transport et conservation

**Finalité**

Coordonner les capacités nécessaires pour préserver la valeur du produit après capture.

**Flux couverts**
- demande de glace ;
- disponibilité de froid ;
- stockage ;
- transport ;
- rupture de conservation ;
- solution alternative.

**Capacités métier**
- exprimer un besoin ;
- publier une capacité disponible ;
- réserver ou affecter une ressource selon les règles retenues ;
- signaler un risque de rupture ;
- coordonner une alternative territoriale.

**Valeur économique**
- réduction des pertes post-capture ;
- meilleure utilisation des équipements ;
- revenus additionnels pour les opérateurs de services ;
- continuité de la chaîne de valeur.

### 3.5 Infrastructure Prix, marchés et débouchés

**Finalité**

Améliorer la capacité de décision des acteurs sans réduire Mbàmbulaan à une marketplace.

**Flux couverts**
- disponibilité confirmée ;
- observation de prix ;
- inflation et tensions ;
- besoin d'approvisionnement ;
- capacité d'achat ou de transformation ;
- risque de mévente.

**Capacités métier**
- consulter des disponibilités crédibles ;
- publier une observation de prix qualifiée ;
- exprimer un besoin d'achat ou de transformation ;
- détecter une tension ou un risque de perte ;
- relier les volumes aux capacités de transport, froid et transformation.

**Valeur économique**
- réduction des coûts de recherche ;
- approvisionnement mieux sécurisé ;
- meilleure valorisation des volumes ;
- services d'information et de coordination pouvant justifier un abonnement professionnel.

### 3.6 Infrastructure Pirogues, organisations et conformité

**Finalité**

Créer un référentiel opérationnel fiable des unités, acteurs et organisations de la filière.

**Flux couverts**
- identité de la pirogue ;
- immatriculation ;
- rattachement aux propriétaires, équipages et organisations ;
- conformité documentaire ;
- historique d'activité autorisé.

**Capacités métier**
- créer ou consolider une identité ;
- vérifier les informations utiles ;
- suivre le statut d'immatriculation ;
- rattacher les activités et services à la bonne unité ;
- gérer les niveaux d'accès et de confidentialité.

**Valeur économique**
- fiabilisation des services ;
- réduction de la fraude et des doublons ;
- accès simplifié aux programmes, assurances, financements ou services autorisés.

### 3.7 Infrastructure Initiatives locales et valorisation communautaire

**Finalité**

Faire émerger, coordonner et valoriser les actions portées par les communautés et territoires.

**Flux couverts**
- besoin local ;
- proposition d'initiative ;
- mobilisation d'acteurs ;
- exécution ;
- résultat ;
- capitalisation.

**Capacités métier**
- faire remonter une initiative ;
- identifier les bénéficiaires et partenaires ;
- relier l'initiative à un besoin documenté ;
- suivre les engagements et résultats ;
- valoriser les acteurs locaux et enseignements.

**Valeur économique**
- meilleure visibilité des initiatives crédibles ;
- accès renforcé aux partenaires et financements ;
- réduction de la dispersion des projets ;
- création de services territoriaux et communautaires.

### 3.8 Infrastructure Environnement, anti-pollution et sensibilisation

**Finalité**

Relier les observations environnementales, les interventions et les actions de prévention.

**Flux couverts**
- observation ;
- signalement ;
- qualification ;
- intervention ;
- contrôle ;
- sensibilisation ;
- suivi.

**Capacités métier**
- signaler une pollution ou un risque ;
- documenter l'impact sur l'activité et le territoire ;
- coordonner les acteurs d'intervention ;
- organiser une campagne de sensibilisation ;
- suivre les récurrences et résultats.

**Valeur économique**
- protection de l'activité et des ressources ;
- meilleure allocation des moyens d'intervention ;
- financement possible par programmes publics, collectivités, bailleurs ou entreprises engagées.

### 3.9 Infrastructure Programmes publics et politiques sectorielles

**Finalité**

Faire de Mbàmbulaan une infrastructure d'exécution publique, pas seulement d'observation.

**Flux couverts**
- identification du besoin ;
- priorisation ;
- conception du programme ;
- ciblage ;
- exécution ;
- contrôle ;
- résultat ;
- réajustement.

**Capacités métier**
- cibler un territoire ou une population ;
- lancer un programme ;
- relier les bénéficiaires aux réalités terrain ;
- suivre les engagements et jalons ;
- mesurer les résultats et écarts ;
- capitaliser pour les politiques futures.

**Valeur économique**
- licence institutionnelle ;
- amélioration de l'efficacité des dépenses publiques ;
- meilleure preuve de résultat ;
- réduction des dispositifs parallèles et fragmentés.

### 3.10 Infrastructure Financements et investissements

**Finalité**

Relier les besoins démontrés, les initiatives crédibles, les financeurs et les résultats.

**Flux couverts**
- besoin de financement ;
- qualification ;
- instruction ;
- décision ;
- décaissement ;
- exécution ;
- preuve ;
- résultat.

**Capacités métier**
- identifier les besoins issus de l'activité réelle ;
- présenter une initiative qualifiée ;
- vérifier les conditions d'éligibilité ;
- suivre les jalons et utilisations ;
- démontrer les effets territoriaux ou communautaires.

**Valeur économique**
- réduction du risque d'allocation ;
- financement de modules, programmes ou territoires ;
- services premium d'instruction, monitoring et preuve d'impact.

### 3.11 Infrastructure Monitoring territorial et coordination

**Finalité**

Transformer les contributions distribuées en capacité collective de décision et d'exécution.

**Flux couverts**
- remontée terrain ;
- qualification ;
- priorité ;
- décision ;
- engagement ;
- exécution ;
- résultat ;
- enseignement.

**Capacités métier**
- détecter une tension ;
- relier les données aux acteurs concernés ;
- arbitrer ;
- suivre les engagements ;
- comparer les situations territoriales sans effacer les contextes ;
- produire des alertes et connaissances réutilisables.

**Valeur économique**
- capacité de pilotage pour Ministère, collectivités et organisations ;
- services de monitoring financés par programmes ou licences ;
- amélioration de la continuité et de la coordination inter-acteurs.

### 3.12 Infrastructure Connaissance, apprentissage et confiance

**Finalité**

Transformer les flux exécutés en connaissances utiles, méthodes et règles de confiance.

**Flux couverts**
- collecte contextualisée ;
- validation ;
- interprétation ;
- partage ;
- réutilisation ;
- amélioration continue.

**Capacités métier**
- qualifier la provenance et le niveau de confiance ;
- conserver les enseignements issus des actions ;
- produire des références territoriales ;
- diffuser des recommandations selon les droits ;
- mesurer les effets des initiatives et politiques.

**Valeur économique**
- avantage concurrentiel cumulatif ;
- expertise sectorielle difficile à reproduire ;
- services d'aide à la décision, d'étude et d'accompagnement.

## 4. Objets métier communs

Les infrastructures doivent partager un noyau commun d'objets. Ces objets ne doivent jamais être recréés en silos.

- acteur ;
- organisation ;
- territoire ;
- quai ;
- pirogue ou unité ;
- retour prévu ;
- débarquement ;
- pesée ;
- lot ou disponibilité ;
- espèce ou catégorie ;
- capacité de service ;
- équipement ;
- observation de prix ;
- besoin ;
- tension ou incident ;
- initiative ;
- programme ;
- financement ;
- engagement ;
- intervention ;
- résultat ;
- preuve ;
- niveau de confiance.

Le même objet doit être accessible sous des vues différentes selon le rôle et les droits. Par exemple, un débarquement reste le même objet pour le pêcheur, le gestionnaire de quai, l'acheteur, le coordinateur et la tutelle.

## 5. Moteurs métier transverses

### 5.1 Moteur d'identité et de droits

Il gère les acteurs, organisations, rôles, territoires, droits d'accès et responsabilités.

### 5.2 Moteur de confiance

Il distingue information déclarée, confirmée, vérifiée ou consolidée et conserve la provenance des contributions.

### 5.3 Moteur de coordination

Il relie besoins, acteurs, décisions, engagements, délais, interventions et résultats.

### 5.4 Moteur de capacités

Il rend visibles les capacités disponibles : quais, froid, glace, transport, transformation, expertise, financement et services.

### 5.5 Moteur territorial

Il contextualise les informations par territoire, quai, organisation et réseau d'acteurs.

### 5.6 Moteur de règles et d'éligibilité

Il applique les règles métier pour les programmes, financements, services, droits et niveaux de diffusion.

### 5.7 Moteur de preuve et de résultat

Il relie chaque action à des preuves, bénéficiaires, ressources, résultats et enseignements.

### 5.8 Moteur d'alertes et de tensions

Il détecte ou reçoit les ruptures : saturation, panne, pollution, chute de prix, manque de froid, retard ou absence de débouché.

## 6. Parcours acteurs prioritaires

### Pêcheur ou organisation de pêcheurs

Le produit doit lui permettre de préparer son retour, accéder aux services du quai, faire reconnaître son débarquement, suivre les informations de marché pertinentes et accéder aux opportunités adaptées.

### Gestionnaire de quai

Le produit doit lui permettre d'anticiper les arrivées, gérer ses capacités, coordonner les incidents et démontrer les besoins réels de son infrastructure.

### Mareyeur, transformateur ou acheteur

Le produit doit lui permettre d'accéder à des disponibilités crédibles, organiser son approvisionnement et coordonner les contraintes de froid, transport et transformation.

### Collectivité ou coordination territoriale

Le produit doit lui permettre de comprendre les tensions locales, mobiliser les bons acteurs et suivre les réponses jusqu'au résultat.

### Ministère ou service public

Le produit doit lui permettre de piloter et exécuter les politiques sectorielles, cibler les interventions et mesurer les résultats réels.

### Partenaire financier ou bailleur

Le produit doit lui permettre d'identifier des besoins crédibles, financer des initiatives qualifiées et vérifier les résultats.

### Association, expert ou acteur communautaire

Le produit doit lui permettre de lancer, coordonner et valoriser des actions locales, environnementales, sociales ou de sensibilisation.

## 7. Modèle économique architectural

Le modèle économique doit être attaché aux capacités rendues possibles, pas au nombre d'écrans.

### Socle institutionnel
- licence Ministère ou infrastructure sectorielle ;
- déploiement territorial ;
- monitoring et exécution de programmes ;
- gouvernance, sécurité et interopérabilité.

### Services professionnels
- abonnements pour organisations de pêcheurs, quais, opérateurs, mareyeurs, transformateurs et prestataires ;
- accès à des capacités avancées de coordination, planification, disponibilité, preuve et analyse.

### Programmes et financements
- financement de modules ou territoires par bailleurs, collectivités ou programmes publics ;
- services d'instruction, suivi et mesure des résultats.

### Services économiques ciblés
- participation ou commission uniquement lorsqu'un service économique identifiable est rendu ;
- aucun modèle transactionnel ne doit réduire Mbàmbulaan à une marketplace.

### Connaissance et accompagnement
- études, assistance à la décision, expertise, accompagnement de programmes et capitalisation ;
- uniquement à partir d'informations gouvernées, autorisées et contextualisées.

## 8. Dépendances entre infrastructures

Le développement doit suivre les dépendances métier suivantes :

1. identité des acteurs, organisations, territoires, quais et pirogues ;
2. retours prévus et débarquements ;
3. pesée, lots et disponibilités ;
4. capacités des quais, froid, glace et transport ;
5. prix, besoins et débouchés ;
6. tensions, coordination et résultats ;
7. programmes, financements et initiatives ;
8. monitoring, apprentissage et connaissance.

Les infrastructures publiques, financières et de connaissance doivent être alimentées par les flux opérationnels. Elles ne doivent pas être construites comme des couches de reporting séparées.

## 9. Frontière du MVP

Le MVP doit prouver le flux :

> Mer → Quai → Pesée → Disponibilité → Débouché → Coordination d'une tension → Résultat visible.

Le MVP doit inclure :
- acteurs et organisations minimaux ;
- territoires, quais et pirogues ;
- retour prévu ;
- débarquement et pesée ;
- capacité du quai ;
- disponibilité et observation de prix ;
- besoin d'un acheteur ou transformateur ;
- coordination d'un problème de froid, transport ou capacité ;
- preuve de résultat ;
- vue de pilotage dérivée des mêmes objets.

Le MVP ne doit pas inclure de fonctionnalité sans lien direct avec ce flux, même si elle semble utile isolément.

## 10. Critères obligatoires pour toute initiative

Avant toute décision, vérifier :

1. Quel flux de valeur est amélioré ?
2. Quelle infrastructure est renforcée ?
3. Quelle capacité nouvelle est créée ?
4. Qui utilise, bénéficie, décide et paie ?
5. Quelle contribution enrichit l'écosystème ?
6. Quels objets métier communs sont utilisés ?
7. Quelle valeur peut être démontrée ?
8. Pourquoi cette capacité serait-elle financée durablement ?
9. Est-elle nécessaire maintenant ?
10. Risque-t-elle de créer un silo, un dashboard ou un outil de dossiers ?

Une initiative qui échoue à ce test doit être rejetée, reportée ou reformulée.

## 11. Hypothèses à valider sur le terrain

Ce blueprint est une architecture stratégique. Il ne doit pas être considéré comme une vérité terrain complète.

Les validations prioritaires sont :
- fonctionnement réel des annonces de retour et débarquements ;
- rôle concret des gestionnaires de quais et organisations de pêcheurs ;
- pratiques de pesée et niveaux de confiance ;
- circulation réelle des informations de prix ;
- modalités d'achat et de transformation ;
- disponibilité et gouvernance de la glace, du froid et du transport ;
- réalité de l'immatriculation et des référentiels de pirogues ;
- mécanismes publics de programme, contrôle et financement ;
- capacité et volonté de chaque acteur à contribuer ;
- acteur réellement disposé à payer pour chaque service.

## 12. Prochaine séquence de travail

1. transformer le flux MVP en scénario de démonstration détaillé ;
2. définir le modèle de données minimal ;
3. définir les droits, contributions et bénéfices par acteur ;
4. établir le backlog produit par étape du flux ;
5. identifier les hypothèses terrain les plus risquées ;
6. ne développer que les éléments nécessaires à la preuve de valeur.
