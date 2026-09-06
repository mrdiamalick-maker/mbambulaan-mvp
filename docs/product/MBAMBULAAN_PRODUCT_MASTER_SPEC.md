# Mbàmbulaan Produit — Cahier des charges maître

> **Statut : SOURCE DE VÉRITÉ — NOUVEAU CADRAGE PRODUIT**
>
> Ce document définit Mbàmbulaan Produit à partir de zéro. L’ancienne application, ses parcours, ses écrans, ses modules, son design et ses choix techniques sont considérés comme **obsolètes** et ne doivent pas influencer la nouvelle conception.
>
> Le code existant peut être audité et réutilisé uniquement comme matière technique lorsqu’il sert explicitement ce cahier des charges. Il n’a aucune valeur normative.
>
> Toute décision structurante qui contredit ce document doit être explicitement soumise au CEO avant implémentation.

---

## 0. Résumé exécutif

**Mbàmbulaan Produit** est la solution professionnelle commercialisable de l’entreprise Mbàmbulaan.

Ce n’est ni un ERP, ni une marketplace, ni un tableau de bord, ni un simple outil de collecte.

C’est une **infrastructure professionnelle de coordination, de connaissance et d’action pour l’économie maritime**, déployée d’abord sur la filière halieutique sénégalaise et la pêche artisanale comme premier ancrage opérationnel.

Le Produit doit relier :

- territoires ;
- quais et sites ;
- acteurs et organisations ;
- pirogues, sorties, débarquements et lots ;
- besoins et capacités ;
- infrastructures et services ;
- situations à traiter ;
- communications multicanales ;
- décisions, engagements et preuves ;
- programmes, financements et résultats ;
- données, sources, confiance et apprentissage.

Sa boucle de valeur centrale est :

`SIGNAL → QUALIFICATION → SITUATION → DÉCISION → ENGAGEMENT → EXÉCUTION → PREUVE → RÉSULTAT → APPRENTISSAGE`

La démonstration au ministère doit montrer une chose simple :

> **Mbàmbulaan permet de voir la filière, de coordonner l’action entre acteurs, de suivre ce qui a été fait et de produire une information fiable pour décider et investir.**

---

# 1. Vision et ambition

## 1.1 Vision

Mbàmbulaan construit une infrastructure de coordination pour l’économie maritime sénégalaise.

Le Produit est le système professionnel qui permet à cette infrastructure de fonctionner à l’échelle :

- sur le terrain ;
- entre organisations ;
- entre territoires ;
- entre acteurs informels et structurés ;
- entre opérateurs économiques et institutions ;
- entre action opérationnelle et décision publique.

## 1.2 Point de départ

Le premier domaine de profondeur est la **filière halieutique sénégalaise**.

Le premier ancrage terrain est la **pêche artisanale**, ses quais, ses métiers, ses flux, ses besoins et ses infrastructures.

L’architecture métier doit toutefois rester extensible à d’autres composantes de l’économie maritime :

- aquaculture ;
- services portuaires ;
- logistique maritime ;
- maintenance navale ;
- chaîne du froid ;
- transformation ;
- environnement littoral ;
- formation maritime ;
- sécurité ;
- programmes d’économie bleue.

## 1.3 Ambition institutionnelle

Pour un ministère, Mbàmbulaan doit devenir progressivement :

- une vue territoriale consolidée ;
- un outil de coordination multi-acteurs ;
- un registre de situations, besoins et interventions ;
- un support de décision ;
- une mémoire des actions et résultats ;
- un outil de suivi des programmes et investissements ;
- une couche de confiance entre le terrain, les organisations et l’État.

## 1.4 Ambition économique

Mbàmbulaan Produit doit être monétisable auprès de plusieurs catégories de payeurs :

- institutions et collectivités ;
- organisations professionnelles ;
- gestionnaires de sites et infrastructures ;
- entreprises privées ;
- programmes, ONG et bailleurs ;
- partenaires techniques ;
- prestataires structurés ;
- acteurs de la transformation, logistique et commercialisation.

Le Produit doit permettre un modèle mixte :

- abonnement ;
- licence territoriale ou institutionnelle ;
- déploiement et onboarding ;
- prestations terrain ;
- programme sponsorisé ;
- coordination et suivi ;
- reporting ;
- modules premium ;
- services d’intelligence ;
- intégrations spécifiques.

---

# 2. Invariants stratégiques

## 2.1 Le Produit n’est pas un écran

Chaque fonctionnalité doit répondre à :

- qui utilise ?
- qui bénéficie ?
- qui décide ?
- qui paie ?
- quelle rupture de coordination est résolue ?
- quelle donnée ou preuve est produite ?
- quel résultat devient observable ?
- pourquoi Mbàmbulaan reste utile après la première interaction ?

## 2.2 Le terrain et le numérique forment un seul système

Le Produit doit accepter qu’une activité soit initiée par :

- le Web professionnel ;
- WhatsApp Business ;
- téléphone ;
- SMS ;
- agent ou relais terrain ;
- organisation partenaire ;
- QR code ;
- import de données ;
- système tiers.

Tous les canaux doivent créer ou enrichir les mêmes objets métier.

**WhatsApp, téléphone et terrain ne sont pas des systèmes parallèles. Ce sont des interfaces vers Mbàmbulaan.**

## 2.3 Une seule source de vérité par objet

Une demande reçue par WhatsApp, un besoin saisi par un agent et un signal créé dans l’application doivent converger vers un seul objet, avec :

- origine ;
- auteur ;
- date ;
- territoire ;
- niveau de confiance ;
- historique ;
- statut ;
- responsable ;
- preuve.

## 2.4 L’humain reste décisionnaire

L’IA peut :

- résumer ;
- rapprocher ;
- détecter des similitudes ;
- suggérer ;
- préparer un rapport ;
- expliquer une alerte.

Elle ne doit jamais :

- décider seule ;
- déclarer une donnée officielle ;
- affecter automatiquement une responsabilité sensible ;
- engager une transaction ;
- contacter un acteur sans règle explicite ;
- masquer son niveau d’incertitude.

## 2.5 La confiance est une fonctionnalité produit

Toute information importante doit pouvoir préciser :

- sa source ;
- sa fraîcheur ;
- son niveau de vérification ;
- ce qui est déclaré ;
- ce qui est estimé ;
- ce qui est confirmé ;
- ce qui reste à compléter.

## 2.6 Pas de faux temps réel

Le Produit ne doit afficher “temps réel” que lorsque la donnée est effectivement rafraîchie et horodatée selon une règle connue.

Sinon, utiliser :

- dernière mise à jour ;
- donnée déclarée ;
- donnée consolidée ;
- donnée en attente de confirmation.

---

# 3. Audiences, décideurs et payeurs

## 3.1 Acteurs terrain

- capitaine de pirogue ;
- pêcheur / équipage ;
- opérateur de quai ;
- mareyeur / mareyeuse ;
- transformateur / transformatrice ;
- transporteur ;
- technicien ;
- prestataire de froid ;
- agent ou relais Mbàmbulaan.

Besoins : simplicité, rapidité, téléphone/WhatsApp, actions concrètes, peu de saisie, langue adaptée, visibilité sur la prochaine étape.

## 3.2 Organisations professionnelles

- GIE ;
- coopératives ;
- fédérations ;
- unions ;
- gestionnaires de sites ;
- organisations de femmes transformatrices ;
- structures d’accompagnement.

Besoins : membres, besoins collectifs, capacités, programmes, services, documents, coordination et reporting.

## 3.3 Coordinateurs territoriaux

- collectivités ;
- services déconcentrés ;
- équipes de programme ;
- coordinateurs Mbàmbulaan ;
- gestionnaires de territoire.

Besoins : voir les situations, mobiliser les acteurs, suivre les engagements, escalader, documenter les résultats.

## 3.4 Institutions nationales

- ministère ;
- directions techniques ;
- agences ;
- autorités compétentes ;
- structures publiques.

Besoins : vue nationale, cohérence territoriale, besoins prioritaires, infrastructures, programmes, financements, preuves, rapports et capacité d’arbitrage.

## 3.5 ONG, bailleurs et partenaires

Besoins : diagnostic, ciblage, bénéficiaires, terrain, coordination, suivi, indicateurs, budget, preuves, capitalisation et reporting.

## 3.6 Entreprises privées

- acheteurs ;
- transformateurs structurés ;
- logisticiens ;
- équipementiers ;
- assureurs ;
- financeurs ;
- fournisseurs ;
- entreprises de services.

Besoins : sourcing, besoins qualifiés, territoires, coordination, qualité, contrats, suivi et accès au réseau.

## 3.7 Administration Mbàmbulaan

Besoins : tenants, plans, modules, habilitations, qualité des données, contenus de référence, support, audit, facturation, configuration et exploitation.

---

# 4. Modèle opérationnel unifié

## 4.1 Boucle de coordination

### Étape 1 — Signal

Un fait apparaît :

- retour de pirogue ;
- besoin de glace ;
- panne ;
- retard ;
- surabondance ;
- manque d’équipement ;
- demande de formation ;
- opportunité de financement ;
- alerte sécurité ;
- besoin collectif.

### Étape 2 — Qualification

Mbàmbulaan précise :

- quoi ;
- où ;
- quand ;
- qui est concerné ;
- source ;
- urgence ;
- confiance ;
- impact ;
- prochaine vérification.

### Étape 3 — Situation

Le signal devient un dossier suivi avec :

- référence ;
- statut ;
- priorité ;
- territoire ;
- acteurs ;
- objets liés ;
- responsable ;
- échéance ;
- historique.

### Étape 4 — Décision

Une décision humaine choisit :

- mobiliser une capacité ;
- ouvrir une coordination ;
- demander une vérification ;
- informer ;
- escalader ;
- lancer une intervention ;
- constituer un programme ;
- clôturer sans action.

### Étape 5 — Engagement

Chaque action devient un engagement :

- responsable ;
- résultat attendu ;
- échéance ;
- canal ;
- dépendances ;
- preuve attendue.

### Étape 6 — Exécution

Les acteurs agissent sur le terrain et par les canaux disponibles.

### Étape 7 — Preuve

- confirmation ;
- photo ;
- document ;
- mesure ;
- appel consigné ;
- validation ;
- bordereau ;
- résultat déclaré puis vérifié.

### Étape 8 — Résultat

- problème résolu ;
- valeur préservée ;
- capacité mobilisée ;
- bénéficiaires accompagnés ;
- délai réduit ;
- intervention réalisée ;
- programme avancé.

### Étape 9 — Apprentissage

- cause récurrente ;
- capacité fiable ;
- territoire à renforcer ;
- besoin collectif ;
- programme potentiel ;
- règle à améliorer.

---

# 5. Carte des capabilities produit

## 5.1 Identité, organisations et multi-tenancy

Le Produit doit gérer :

- utilisateur ;
- acteur métier ;
- organisation ;
- tenant ;
- rôle ;
- mandat ;
- territoire autorisé ;
- module activé ;
- permission par action ;
- durée d’habilitation ;
- journal d’accès.

Règle : voir un module ne signifie pas avoir accès à toutes ses données.

## 5.2 Référentiel territorial et jumeau numérique

Le Produit doit représenter :

- régions ;
- départements ;
- communes ;
- territoires halieutiques ;
- quais ;
- sites de débarquement ;
- marchés ;
- zones de transformation ;
- infrastructures ;
- routes / relations logistiques ;
- organisations ;
- capacités ;
- programmes ;
- objets opérationnels reliés.

Le jumeau numérique n’est pas une carte décorative. Il doit permettre de comprendre :

- ce qui existe ;
- ce qui fonctionne ;
- ce qui manque ;
- ce qui est relié ;
- ce qui est en tension ;
- qui peut agir ;
- quelles preuves sont disponibles.

## 5.3 Registre des acteurs et réseau de confiance

Le Produit doit gérer :

- personnes ;
- métiers ;
- organisations ;
- affiliations ;
- territoires ;
- moyens de contact ;
- capacités ;
- documents ;
- vérifications ;
- historique de mobilisation ;
- consentement ;
- niveau de relation.

Niveaux internes :

`Identifié → En relation → Documenté → Vérifié → Mobilisable → Expérimenté avec Mbàmbulaan`

## 5.4 Actifs et infrastructures

- pirogues ;
- moteurs ;
- équipements ;
- chambres froides ;
- machines à glace ;
- véhicules ;
- unités de transformation ;
- balances ;
- magasins ;
- équipements de sécurité.

Chaque actif peut avoir :

- propriétaire / gestionnaire ;
- localisation ;
- statut ;
- capacité théorique ;
- capacité déclarée ;
- disponibilité ;
- maintenance ;
- documents ;
- incidents ;
- preuve ;
- historique.

## 5.5 Opérations halieutiques

Cycle cible :

`Sortie → Retour annoncé → Arrivée → Débarquement → Pesée → Captures → Lots → Conservation → Transformation / Transport / Vente → Résultat`

Le Produit doit permettre un niveau de saisie progressif :

- minimal au terrain ;
- enrichi par un opérateur ;
- vérifié ultérieurement.

Les champs manquants restent visibles sans bloquer toute l’opération.

## 5.6 Besoins et demandes de services

Un objet `Demande Mbàmbulaan` doit recevoir les demandes issues :

- du Public ;
- de WhatsApp ;
- du téléphone ;
- du terrain ;
- d’une organisation ;
- d’une situation ;
- d’un programme.

Intentions :

- transport ;
- froid ;
- stockage ;
- transformation ;
- équipement ;
- maintenance ;
- formation ;
- financement ;
- sourcing ;
- autorisation / démarche ;
- expertise ;
- autre.

Le Produit doit agréger les demandes similaires pour détecter des **besoins collectifs**.

## 5.7 Moteur de situations

Une situation doit comporter :

- référence ;
- titre ;
- type ;
- description ;
- territoire ;
- priorité ;
- statut ;
- source ;
- confiance ;
- objets liés ;
- acteurs concernés ;
- responsable ;
- décision attendue ;
- prochaine étape ;
- échéance ;
- historique ;
- résultat.

Statuts cibles :

`Nouveau → À qualifier → Qualifié → En décision → En coordination → En exécution → À vérifier → Réglé → Clos`

Sorties alternatives :

- doublon ;
- non confirmé ;
- hors périmètre ;
- annulé.

## 5.8 Salle de coordination

La Situation Room est un espace de travail, pas une page de discussion.

Elle rassemble :

- contexte ;
- chronologie ;
- participants ;
- communications ;
- décisions ;
- engagements ;
- documents ;
- objets liés ;
- preuves ;
- risques ;
- résultat attendu ;
- synthèse ;
- clôture.

## 5.9 Capacités et services

Le Produit doit permettre de rechercher et mobiliser :

- froid ;
- transport ;
- transformation ;
- maintenance ;
- stockage ;
- équipement ;
- formation ;
- expertise ;
- financement ;
- partenaires terrain.

Le matching automatique n’est pas requis en V1.

Le Produit propose des capacités potentielles, mais un humain valide leur mobilisation.

## 5.10 Communication omnicanale

Canaux :

- WhatsApp Business ;
- téléphone ;
- SMS ;
- email ;
- notifications Produit ;
- saisie terrain ;
- plus tard USSD / radio / API.

Chaque communication doit pouvoir être reliée à :

- acteur ;
- demande ;
- situation ;
- opération ;
- engagement ;
- programme.

Statuts :

- préparé ;
- envoyé ;
- remis ;
- lu ;
- répondu ;
- échec ;
- relance requise.

## 5.11 Marchés, débouchés et opportunités

Le Produit doit relier :

- lots disponibles ;
- besoins d’achat ;
- qualité ;
- quantité ;
- territoire ;
- fenêtre temporelle ;
- transformation ;
- transport ;
- conservation ;
- opportunité ;
- décision humaine.

Ce module n’est pas une marketplace publique.

## 5.12 Durabilité, provenance et conformité

- provenance progressive ;
- sortie / pirogue / zone / espèce ;
- débarquement ;
- lot ;
- transformation ;
- destination ;
- saisonnalité ;
- complétude ;
- source ;
- niveau de vérification ;
- documents ;
- actions d’amélioration.

Le Produit ne doit pas devenir un outil punitif ou de surveillance opaque.

## 5.13 Programmes, initiatives et financements

Le Produit doit gérer :

- besoin d’origine ;
- initiative ;
- programme ;
- porteur ;
- territoires ;
- bénéficiaires ;
- partenaires ;
- budget ;
- financement acquis / recherché ;
- calendrier ;
- actions ;
- indicateurs ;
- preuves ;
- rapports ;
- résultats ;
- risques.

Un besoin récurrent peut être promu en initiative ou programme.

## 5.14 Reporting et redevabilité

Rapports :

- territorial ;
- national ;
- opérationnel ;
- situation ;
- programme ;
- financeur ;
- organisation ;
- durabilité ;
- performance de coordination.

Exports :

- PDF ;
- Excel ;
- CSV ;
- PowerPoint ;
- impression ;
- lien sécurisé ;
- API / JSON selon plan.

Chaque indicateur doit pouvoir revenir à :

- source ;
- période ;
- territoire ;
- objets d’origine ;
- limites ;
- méthode de calcul.

## 5.15 Assistance Mbàmbulaan / Copilot

Fonctions possibles :

- résumé de situation ;
- points bloquants ;
- acteurs à relancer ;
- engagements en retard ;
- demandes similaires ;
- capacité potentielle ;
- préparation de message ;
- préparation de rapport ;
- explication d’un indicateur ;
- détection de données manquantes.

Toujours afficher :

- pourquoi la suggestion est faite ;
- quelles données sont utilisées ;
- niveau d’incertitude ;
- validation humaine requise.

## 5.16 Administration, plans et modules

L’administration Mbàmbulaan doit gérer :

- tenants ;
- organisations ;
- utilisateurs ;
- rôles ;
- territoires ;
- plans ;
- modules ;
- niveaux de service ;
- quotas ;
- entitlements ;
- onboarding ;
- configuration des canaux ;
- audit ;
- support ;
- environnement de démonstration.

---

# 6. Objets métier centraux

Le modèle doit être domain-first.

Objets principaux :

- `Tenant`
- `User`
- `Actor`
- `Organization`
- `Mandate`
- `Role`
- `Permission`
- `Territory`
- `Site`
- `Quay`
- `Infrastructure`
- `Capacity`
- `Service`
- `Vessel`
- `Trip`
- `ReturnNotice`
- `Landing`
- `CatchLine`
- `Lot`
- `TransformationBatch`
- `TransportMission`
- `ServiceRequest`
- `Signal`
- `Situation`
- `CoordinationSpace`
- `Decision`
- `Commitment`
- `Evidence`
- `Communication`
- `Notification`
- `Initiative`
- `Program`
- `Funding`
- `Indicator`
- `Report`
- `Document`
- `AuditEvent`
- `Subscription`
- `Plan`
- `ModuleEntitlement`

## 6.1 Règles de relation

- un signal peut créer ou enrichir une situation ;
- une situation peut contenir plusieurs décisions ;
- une décision peut créer plusieurs engagements ;
- un engagement doit produire une preuve ou une justification ;
- une situation clôturée doit avoir un résultat ;
- une demande peut devenir une situation, une coordination ou une initiative ;
- plusieurs demandes similaires peuvent former un besoin collectif ;
- un besoin collectif peut devenir un programme ;
- toute donnée critique possède source, fraîcheur et confiance ;
- toute action sensible est auditée.

---

# 7. Espaces de travail par rôle

Le Produit ne doit pas offrir le même dashboard à tout le monde.

## 7.1 Acteur terrain

Priorité : prochaine action.

Doit voir :

- ce qui me concerne aujourd’hui ;
- actions à confirmer ;
- demandes ;
- messages ;
- documents simples ;
- bouton appel / WhatsApp ;
- mode mobile ;
- saisie minimale.

## 7.2 Opérateur de quai

- retours attendus ;
- arrivées ;
- débarquements ;
- pesées ;
- lots ;
- anomalies ;
- capacités ;
- situations du site ;
- communications.

## 7.3 Organisation professionnelle

- membres ;
- territoires ;
- besoins ;
- capacités ;
- engagements ;
- programmes ;
- formations ;
- rapports ;
- habilitations.

## 7.4 Coordinateur territorial

- vue territoire ;
- situations prioritaires ;
- décisions attendues ;
- engagements ;
- capacités à mobiliser ;
- acteurs ;
- retards ;
- résultats ;
- rapport territorial.

## 7.5 Institution

- vue nationale ;
- territoires ;
- tendances ;
- situations agrégées ;
- infrastructures ;
- programmes ;
- financements ;
- besoins collectifs ;
- résultats ;
- rapports ;
- qualité des données ;
- drill-down selon habilitation.

## 7.6 Partenaire / bailleur / ONG

- programmes autorisés ;
- territoires concernés ;
- bénéficiaires agrégés ;
- calendrier ;
- budget ;
- actions ;
- risques ;
- preuves ;
- indicateurs ;
- rapports.

## 7.7 Administrateur Mbàmbulaan

- exploitation globale ;
- tenants ;
- modules ;
- utilisateurs ;
- support ;
- données ;
- canaux ;
- qualité ;
- audit ;
- facturation ;
- démonstration.

---

# 8. Parcours canoniques de bout en bout

## 8.1 Retour → débarquement → lot → débouché

1. Un capitaine annonce son retour par WhatsApp ou téléphone.
2. Le Produit crée un retour attendu.
3. Le quai confirme l’arrivée.
4. La pesée documente les captures.
5. Des lots sont créés.
6. Un besoin de froid ou transport apparaît.
7. Mbàmbulaan mobilise une capacité.
8. Le lot est orienté vers transformation, marché ou stockage.
9. La valeur préservée est estimée et documentée.
10. Un rapport est généré.

## 8.2 Panne de machine à glace

1. Signal terrain.
2. Qualification et preuve photo.
3. Situation critique créée.
4. Impact sur débarquements attendus.
5. Recherche de capacité alternative.
6. Coordination avec autre quai / prestataire / transport.
7. Engagements assignés.
8. Intervention réalisée.
9. Lots protégés.
10. Résultat et enseignement enregistrés.

## 8.3 Surabondance de sardinelle

1. Plusieurs débarquements convergent.
2. Le volume déclaré dépasse la capacité locale documentée.
3. Le Produit propose des pistes : transformation, transport, stockage.
4. Un coordinateur valide une coordination.
5. Les acteurs confirment leurs capacités.
6. Les lots sont orientés.
7. La perte évitée et la valeur préservée sont documentées.

## 8.4 Retour retardé / sécurité

1. Retour non confirmé.
2. Signal par quai ou proche habilité.
3. Vérification des dernières informations.
4. Chaîne d’alerte selon protocole.
5. Communications consignées.
6. Autorité compétente identifiée.
7. Résultat documenté.

Le Produit ne remplace jamais les autorités de sécurité.

## 8.5 Besoin de formation devenu programme

1. Plusieurs organisations expriment le même besoin.
2. Mbàmbulaan agrège les demandes.
3. Le besoin collectif est qualifié.
4. Une initiative est créée.
5. Un partenaire ou financeur est identifié.
6. Programme, budget et bénéficiaires sont définis.
7. Sessions terrain réalisées.
8. Présences et preuves collectées.
9. Résultats et rapport produits.

## 8.6 Déploiement ONG / bailleur

1. Le partenaire définit un objectif.
2. Mbàmbulaan explore le territoire et les acteurs.
3. Bénéficiaires et capacités sont qualifiés.
4. Actions, budget et indicateurs sont structurés.
5. Les interventions sont coordonnées.
6. Le terrain alimente le suivi.
7. Le partenaire voit l’avancement et les preuves.
8. Un rapport final est généré.

## 8.7 Demande publique → Produit

1. Une entreprise dépose une demande sur Mbàmbulaan.sn.
2. La demande entre comme `ServiceRequest` avec contexte et source.
3. Mbàmbulaan qualifie.
4. La demande devient mise en relation, coordination, sourcing ou programme.
5. Les actions sont suivies dans le Produit.
6. Le résultat alimente le CRM, la connaissance et éventuellement la facturation.

---

# 9. Démonstration “Waouh” pour le ministère

## 9.1 Principe

Pas de produit de démonstration séparé.

La démonstration utilise le vrai Produit, dans un tenant de démonstration déterministe, avec des rôles simulables et des données clairement identifiées.

## 9.2 Narration recommandée — 12 à 15 minutes

### Séquence 1 — Vue nationale

- Atlas national du littoral ;
- principaux quais ;
- niveaux de documentation ;
- besoins et capacités agrégés ;
- programmes ;
- qualité des données.

Message :
> Le ministère voit le système territorial sans exposer les données privées inutiles.

### Séquence 2 — Descente vers Joal

- fiche territoire ;
- acteurs et infrastructures ;
- activités ;
- machine à glace ;
- débarquements attendus ;
- situation prioritaire.

Message :
> Le national peut descendre jusqu’au territoire et comprendre le contexte.

### Séquence 3 — Origine omnicanale

- signal reçu via WhatsApp / téléphone ;
- source visible ;
- message transformé en objet métier ;
- confiance et éléments à confirmer.

Message :
> Mbàmbulaan inclut les acteurs qui ne travaillent pas dans une application complexe.

### Séquence 4 — Situation Room

- impact ;
- acteurs ;
- décision ;
- capacité alternative ;
- engagements ;
- communication ;
- échéances.

Message :
> Mbàmbulaan ne se contente pas de montrer le problème : il organise l’action.

### Séquence 5 — Résultat

- capacité mobilisée ;
- preuve ;
- lots protégés ;
- délai ;
- résultat ;
- apprentissage.

Message :
> Chaque action laisse une trace exploitable.

### Séquence 6 — Programme et financement

- plusieurs situations similaires ;
- besoin collectif ;
- programme chaîne du froid ;
- territoires ;
- budget ;
- partenaires ;
- indicateurs.

Message :
> Le terrain peut devenir une décision d’investissement structurée.

### Séquence 7 — Rapport institutionnel

- synthèse ;
- sources ;
- limites ;
- export PDF / Excel ;
- lien sécurisé.

Message :
> Le ministère obtient une information traçable pour piloter et rendre compte.

## 9.3 Moments “waouh” obligatoires

- passage national → territoire → objet opérationnel sans rupture ;
- visualisation de l’origine WhatsApp / téléphone ;
- transformation d’un signal en coordination ;
- engagement avec responsable et échéance ;
- preuve terrain ;
- génération d’un rapport traçable ;
- transformation de besoins récurrents en programme finançable.

---

# 10. UX/UI à réinventer entièrement

## 10.1 Règle absolue

Le design actuel est obsolète.

Codex ne doit pas :

- copier l’ancienne sidebar ;
- conserver les anciens dashboards ;
- reproduire les anciennes cartes ;
- reprendre les anciens parcours ;
- maintenir des écrans seulement parce qu’ils existent ;
- construire un thème générique de template SaaS.

## 10.2 Direction d’expérience

Le Produit doit paraître :

- institutionnel sans être administratif ;
- premium sans être décoratif ;
- maritime sans folklore ;
- riche en données sans devenir illisible ;
- moderne sans jargon startup ;
- rassurant ;
- opérationnel ;
- cohérent sur desktop, tablette et mobile.

## 10.3 Principes par usage

- **Institution : décision-first** — priorité aux arbitrages, tendances, preuves et rapports.
- **Coordinateur : situation-first** — priorité aux situations, engagements et blocages.
- **Opérateur : task-first** — priorité aux actions du jour.
- **Terrain : mobile-first** — priorité aux gestes simples, contacts, photos, vocaux et confirmation.
- **Atlas : map-first** — priorité au territoire et aux relations.
- **Programme : outcome-first** — priorité aux bénéficiaires, actions, budget, preuves et résultats.

## 10.4 Architecture UX recommandée

Composants d’expérience :

- Command Center adapté au rôle ;
- Atlas / jumeau numérique ;
- Work Queue ;
- Situation Room ;
- fiche objet unifiée ;
- timeline de preuve ;
- panneau de communication ;
- panneau de décision ;
- panneau d’assistance ;
- recherche globale ;
- rapports ;
- mode présentation institutionnelle ;
- mode terrain mobile.

## 10.5 Une fiche objet cohérente

Chaque objet important doit partager une structure :

1. identité ;
2. statut ;
3. contexte ;
4. relations ;
5. prochaine action ;
6. chronologie ;
7. communications ;
8. documents ;
9. confiance ;
10. historique / audit.

## 10.6 États UX obligatoires

- chargement ;
- vide ;
- erreur ;
- donnée incomplète ;
- hors périmètre ;
- succès ;
- permission insuffisante ;
- connexion faible ;
- synchronisation différée.

---

# 11. Mobile, terrain et faible connectivité

## 11.1 Mobile-first réel

Le terrain doit pouvoir :

- retrouver une action ;
- confirmer ;
- appeler ;
- envoyer WhatsApp ;
- prendre une photo ;
- enregistrer un vocal ;
- saisir un poids ;
- signaler un problème ;
- voir la prochaine étape ;
- fonctionner avec peu de texte.

## 11.2 Offline / synchronisation différée

Prévoir :

- file locale ;
- statut “à synchroniser” ;
- reprise après coupure ;
- horodatage local et serveur ;
- gestion de conflit simple ;
- compression des médias.

## 11.3 Langues

- français en V1 ;
- architecture prête pour wolof ;
- messages simples ;
- contenus audio possibles ;
- anglais pour partenaires plus tard.

---

# 12. Données, confiance et gouvernance

## 12.1 Niveaux de confiance

- déclaré ;
- rapproché ;
- documenté ;
- vérifié ;
- officiel ;
- estimé ;
- contesté ;
- expiré.

## 12.2 Provenance

Chaque donnée sensible doit conserver :

- source ;
- auteur ;
- canal ;
- date ;
- document / preuve ;
- dernière modification ;
- organisation ;
- règle de visibilité.

## 12.3 Qualité

- complétude ;
- fraîcheur ;
- cohérence ;
- doublon ;
- anomalie ;
- validation attendue.

## 12.4 Données personnelles

- minimisation ;
- consentement ;
- droits d’accès ;
- journalisation ;
- masquage ;
- rétention ;
- export / suppression selon politique ;
- aucune exposition publique sans base légitime.

---

# 13. Sécurité et permissions

## 13.1 RBAC + périmètre

L’accès dépend de :

- rôle ;
- organisation ;
- territoire ;
- mandat ;
- module ;
- action ;
- sensibilité de la donnée.

Actions :

- voir ;
- créer ;
- modifier ;
- valider ;
- assigner ;
- exporter ;
- administrer ;
- partager.

## 13.2 Audit

Journaliser :

- connexion ;
- création ;
- modification ;
- décision ;
- export ;
- partage ;
- changement de permission ;
- accès sensible ;
- action d’administration.

## 13.3 Séparation des tenants

Aucune donnée d’un client ne doit être accessible à un autre client sans relation ou partage explicitement autorisé.

---

# 14. Intégrations et architecture technique cible

## 14.1 Principes

- domain-first ;
- multi-tenant ;
- API-first ;
- event-aware ;
- adapters pour canaux ;
- configuration par environnement ;
- observabilité ;
- tests automatisés ;
- données déterministes de démonstration.

## 14.2 Canaux

Prévoir des adaptateurs pour :

- WhatsApp Business Cloud API ;
- SMS ;
- email ;
- téléphonie / journal d’appel ;
- notifications push ;
- import Excel / CSV ;
- API partenaires.

Aucun fournisseur spécifique ne doit être profondément couplé au domaine.

## 14.3 Persistance

Production : PostgreSQL ou équivalent relationnel robuste.

Prévoir :

- migrations ;
- transactions ;
- audit log ;
- stockage documentaire séparé ;
- médias sécurisés ;
- sauvegardes ;
- seed de démonstration.

La mémoire locale ne peut être qu’un outil de développement.

## 14.4 Structure recommandée

```text
src/
  app/
  components/
    product/
    field/
    institution/
    coordination/
    atlas/
    reporting/
    shared/
  domain/
    identity/
    territories/
    actors/
    operations/
    requests/
    situations/
    coordination/
    capacities/
    programs/
    reporting/
    trust/
    subscriptions/
  server/
    api/
    repositories/
    services/
    channels/
    auth/
    audit/
  data/
    demo/
  config/
  tests/
```

La structure exacte peut être challengée, mais le domaine ne doit pas dépendre des composants React.

---

# 15. Plans, modules et commercialisation

## 15.1 Principe

Le Produit doit être configurable par modules, niveaux et périmètres.

Ne pas hardcoder un menu par plan.

## 15.2 Modules commerciaux possibles

### Core Coordination

- acteurs ;
- territoires ;
- demandes ;
- situations ;
- engagements ;
- communications ;
- audit.

### Operations

- sorties ;
- retours ;
- débarquements ;
- pesées ;
- lots ;
- missions.

### Territory Intelligence

- Atlas professionnel ;
- infrastructures ;
- capacités ;
- tendances ;
- besoins collectifs.

### Organization

- membres ;
- mandats ;
- capacités ;
- services ;
- programmes ;
- rapports.

### Programs & Funding

- initiatives ;
- budgets ;
- financements ;
- bénéficiaires ;
- preuves ;
- reporting.

### Institution

- vue nationale ;
- multi-territoires ;
- arbitrage ;
- reporting ;
- exports ;
- gouvernance.

### Trust & Sustainability

- provenance ;
- complétude ;
- preuves ;
- durabilité ;
- conformité progressive.

### Copilot

- synthèse ;
- suggestions ;
- préparation de rapports ;
- recherche augmentée.

## 15.3 Offres indicatives

- **Professionnel** : acteur / petite structure ;
- **Organisation** : organisation et membres ;
- **Territoire** : coordination locale ;
- **Institution** : national / multi-territoires ;
- **Programme** : ONG / bailleur / projet ;
- **Partenaire** : entreprise / infrastructure / service ;
- **Mbàmbulaan Admin** : exploitation interne.

Les prix et limites seront définis après pilote et étude de willingness-to-pay.

## 15.4 Sponsoring institutionnel

Le ministère ou un partenaire peut financer :

- un territoire pilote ;
- l’onboarding d’organisations ;
- le réseau de relais ;
- la collecte et vérification de données ;
- un module national ;
- un programme spécifique ;
- l’accès subventionné de certains acteurs.

La propriété intellectuelle, l’exploitation commerciale et la gouvernance de Mbàmbulaan restent à contractualiser séparément.

---

# 16. Jeu de données de démonstration

## 16.1 Couverture territoriale

Le tenant de démonstration doit donner une impression nationale crédible, avec profondeur variable et transparence.

Inclure notamment :

- Saint-Louis ;
- Fass Boye ;
- Kayar ;
- Yoff ;
- Soumbédioune ;
- Hann ;
- Rufisque ;
- Bargny ;
- Popenguine ;
- Ngaparou ;
- Mbour ;
- Joal ;
- Djifère ;
- Foundiougne ;
- Missirah ;
- Toubacouta ;
- Kafountine ;
- Elinkine ;
- Cap Skirring ;
- Ziguinchor.

## 16.2 Volumétrie indicative

Pour une démonstration riche :

- 20+ territoires / sites ;
- 80+ organisations ;
- 250+ acteurs ;
- 120+ pirogues / actifs ;
- 150+ sorties ;
- 200+ débarquements ;
- 400+ lignes de capture ;
- 250+ lots ;
- 60+ infrastructures ;
- 80+ capacités / services ;
- 60+ demandes ;
- 40+ situations ;
- 20+ coordinations ;
- 100+ engagements ;
- 12+ programmes / initiatives ;
- 20+ rapports ;
- 100+ communications omnicanales.

La volumétrie doit être générée de façon déterministe et cohérente, pas aléatoire à chaque rendu.

## 16.3 Règle de vérité

Toute donnée de démonstration est marquée `DEMO` ou équivalent.

Aucune donnée fictive ne doit être présentée comme officielle.

---

# 17. Analytics produit et KPI

## 17.1 Produit

- utilisateurs actifs ;
- organisations actives ;
- demandes créées ;
- demandes qualifiées ;
- situations ouvertes ;
- temps de qualification ;
- temps de coordination ;
- engagements en retard ;
- taux de résolution ;
- preuves collectées ;
- rapports générés ;
- complétude ;
- canaux utilisés ;
- adoption mobile.

## 17.2 Valeur métier

- pertes évitées ;
- capacité mobilisée ;
- délai réduit ;
- bénéficiaires ;
- interventions réalisées ;
- besoins collectifs structurés ;
- financements mobilisés ;
- valeur économique estimée / confirmée ;
- programmes déployés ;
- satisfaction / réutilisation.

Chaque KPI doit préciser sa méthode et ses limites.

---

# 18. Exigences non fonctionnelles

## 18.1 Performance

- pages essentielles utilisables sur connexion moyenne ;
- chargement progressif de l’Atlas ;
- images optimisées ;
- listes virtualisées si nécessaire ;
- pas de dépendances lourdes sans justification.

## 18.2 Accessibilité

- contraste ;
- clavier ;
- lecteurs d’écran ;
- tailles tactiles ;
- libellés ;
- états visibles ;
- langage simple.

## 18.3 Résilience

- erreurs explicites ;
- reprise ;
- retry ;
- file d’événements ;
- dégradation contrôlée si un canal externe est indisponible.

## 18.4 Observabilité

- logs ;
- erreurs ;
- métriques ;
- traces ;
- audit ;
- statut des intégrations ;
- alertes techniques.

## 18.5 Qualité

À chaque livraison :

- lint ;
- typecheck ;
- tests domaine ;
- tests permissions ;
- build ;
- smoke tests ;
- recette mobile ;
- recette desktop ;
- vérification des parcours canoniques.

---

# 19. Périmètre V1 institutionnelle

## 19.1 Obligatoire

- authentification / session de démonstration ;
- rôles et permissions ;
- vue nationale institutionnelle ;
- Atlas professionnel ;
- fiche territoire ;
- demandes omnicanales ;
- moteur de situations ;
- Situation Room ;
- engagements ;
- communication simulée ;
- preuves ;
- résultats ;
- besoins collectifs ;
- programmes / financements ;
- rapports PDF / Excel au minimum ;
- jeu de données riche ;
- présentation mobile terrain ;
- administration minimale ;
- design entièrement nouveau et homogène.

## 19.2 À différer

- paiement ;
- marketplace ;
- matching autonome ;
- IA décisionnelle ;
- application native ;
- USSD ;
- signature électronique avancée ;
- facturation automatisée complète ;
- géospatial avancé ;
- prévision scientifique ;
- intégration temps réel à des systèmes officiels sans accord.

---

# 20. Ordre de réalisation recommandé

## Lot 0 — Audit et refondation

- lire ce document ;
- auditer le repo ;
- classer : garder / adapter / remplacer / supprimer ;
- identifier les blocages ;
- proposer architecture technique ;
- supprimer l’influence de l’ancien produit.

## Lot 1 — Socle

- identité ;
- tenants ;
- permissions ;
- modèle domaine ;
- persistance ;
- design system nouveau ;
- shell adaptatif ;
- seed.

## Lot 2 — Atlas et institution

- vue nationale ;
- territoire ;
- actifs ;
- acteurs ;
- infrastructures ;
- confiance ;
- drill-down.

## Lot 3 — Signal, demande et situation

- intake omnicanal ;
- qualification ;
- situation ;
- timeline ;
- décision ;
- engagements.

## Lot 4 — Coordination et exécution

- Situation Room ;
- capacités ;
- communications ;
- preuves ;
- clôture ;
- résultats.

## Lot 5 — Programmes et reporting

- besoins collectifs ;
- initiatives ;
- programmes ;
- financements ;
- indicateurs ;
- exports.

## Lot 6 — Terrain mobile et polish

- mobile ;
- offline léger ;
- média ;
- accessibilité ;
- performance ;
- guided presentation ;
- recette.

---

# 21. Critères d’acceptation — démonstration ministère

Le Produit est démontrable si un utilisateur peut :

1. ouvrir la vue nationale ;
2. identifier un territoire prioritaire ;
3. ouvrir sa fiche ;
4. voir une situation et sa source ;
5. comprendre l’impact ;
6. ouvrir la Situation Room ;
7. voir acteurs, décisions et engagements ;
8. mobiliser ou sélectionner une capacité ;
9. préparer une communication ;
10. enregistrer une preuve ;
11. clôturer avec résultat ;
12. voir l’impact dans le pilotage ;
13. transformer plusieurs besoins en programme ;
14. exporter un rapport ;
15. rejouer le parcours depuis un rôle terrain mobile.

Le Produit n’est pas accepté si :

- les données publiques et privées sont mélangées ;
- le ministère voit un simple dashboard ;
- la démonstration dépend d’un écran séparé artificiel ;
- les rôles voient la même chose ;
- une situation ne mène pas à une action ;
- les canaux terrain restent décoratifs ;
- les rapports ne sont pas traçables ;
- le design change d’une page à l’autre ;
- le build n’est pas vert ;
- le mobile est cassé.

---

# 22. Anti-patterns interdits

- recopier l’ancienne application ;
- reproduire les anciennes routes et menus ;
- conserver des écrans legacy par confort ;
- créer un dashboard unique pour tous ;
- multiplier les modules qui font la même chose ;
- séparer WhatsApp / téléphone / terrain du modèle métier ;
- afficher une IA magique ;
- inventer des données officielles ;
- montrer de la capacité temps réel non confirmée ;
- créer une marketplace ;
- exposer un annuaire de contacts ;
- surcharger le terrain de formulaires ;
- construire un produit desktop-only ;
- produire des rapports sans source ;
- confondre activité, résultat et impact ;
- utiliser un design générique sans identité ;
- laisser les plans commerciaux dicter le domaine ;
- coder avant d’avoir validé le parcours canonique.

---

# 23. Décisions figées

## FIGÉ

- L’ancienne version de Mbàmbulaan Produit est obsolète.
- Le nouveau Produit est conçu à partir de ce cahier des charges.
- Mbàmbulaan est une infrastructure de coordination de l’économie maritime.
- Premier domaine : filière halieutique.
- Premier ancrage : pêche artisanale.
- Terrain + réseau + technologie.
- Une boucle de coordination centrale.
- Un modèle métier unifié, quel que soit le canal.
- Human-in-the-loop.
- Multi-tenant et permissions granulaires.
- Atlas professionnel relié aux objets métier.
- Situation Room comme moteur d’action.
- Demandes individuelles et besoins collectifs.
- Programmes, financements et reporting.
- Design et UX entièrement réinventés.
- Démonstration dans le vrai Produit, pas dans une application parallèle.
- Données de démonstration déterministes et explicitement marquées.

## À CHALLENGER AVANT DÉCISION

- stack cartographique ;
- fournisseur WhatsApp / SMS / téléphonie ;
- stratégie offline détaillée ;
- modèle tarifaire ;
- contrats institutionnels ;
- hébergement final ;
- choix d’un design system ou template ;
- méthode de calcul de certains KPI ;
- intégrations officielles.

## PLUS TARD

- paiement ;
- marketplace ;
- matching autonome ;
- prévisions avancées ;
- application native ;
- USSD ;
- internationalisation complète.

---

# 24. Instruction d’exécution pour Codex

Codex doit commencer par :

1. lire intégralement ce document ;
2. confirmer sa compréhension des invariants ;
3. auditer l’état actuel du repo ;
4. classer chaque élément utile : conserver / adapter / remplacer / supprimer ;
5. proposer une architecture de refondation ;
6. proposer un plan de livraison par lots ;
7. identifier les décisions nécessitant arbitrage CEO ;
8. ne coder qu’après ce diagnostic.

Le design actuel ne doit pas être utilisé comme référence.

Codex dispose d’une liberté de création UX/UI complète, sous réserve de respecter :

- les parcours ;
- les rôles ;
- les objets métier ;
- les frontières ;
- le modèle économique ;
- les exigences de confiance ;
- la priorité mobile / terrain ;
- la démonstration institutionnelle.

Après chaque lot :

- typecheck ;
- lint ;
- tests ;
- build ;
- smoke ;
- résumé ;
- liste des routes ;
- captures ou preview ;
- écarts restant à traiter.

---

# 25. Prompt court à donner à Codex

> Reprends Mbàmbulaan Produit sur la branche `codex/xxl-premium`.
>
> Lis intégralement `docs/product/MBAMBULAAN_PRODUCT_MASTER_SPEC.md` avant toute modification.
>
> L’ancienne application, son UX, ses parcours, ses écrans, ses modules et son design sont obsolètes. Ne t’en inspire pas. Le code existant n’est réutilisable que comme matière technique lorsqu’il sert explicitement le nouveau cahier des charges.
>
> Commence par un audit d’écart entre le repo et le cahier des charges. Classe : conserver / adapter / remplacer / supprimer. Propose ensuite l’architecture cible, les lots de livraison et les arbitrages nécessaires.
>
> Tu peux challenger le cadrage, mais tu dois expliquer tout changement d’invariant et obtenir l’arbitrage du CEO avant de l’implémenter.
>
> Notre priorité est une démonstration institutionnelle “waouh” montrant : vue nationale → territoire → signal omnicanal → situation → coordination → engagements → preuve → résultat → programme → rapport.
>
> Le design et l’UX doivent être entièrement réinventés, premium, cohérents, mobiles et crédibles. Ne construis ni marketplace, ni dashboard générique, ni produit parallèle de démonstration.
>
> Commence par lire le document, auditer le repo et présenter ton diagnostic et ton plan avant de coder.
