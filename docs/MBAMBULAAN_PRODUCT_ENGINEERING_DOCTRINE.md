# Mbàmbulaan Product & Engineering Doctrine

**Version :** 1.0  
**Statut :** doctrine de référence  
**Périmètre :** produit, métier, architecture, UX, données, exploitation, modèle économique et développement  
**Autorité :** ce document prévaut sur tout prompt historique ou document antérieur contradictoire, sauf décision explicite plus récente consignée dans `DECISIONS.md`.

---

## 0. Préambule

Mbàmbulaan existe pour résoudre un problème structurel : la pêche artisanale sénégalaise produit de la valeur, de l’information, des engagements, des besoins, des risques et des décisions, mais ces éléments circulent encore de manière fragmentée, tardive, peu vérifiable ou difficilement exploitable.

Mbàmbulaan n’est pas conçu comme une simple application. Il constitue une infrastructure numérique de coordination permettant aux acteurs de mieux agir ensemble, aux territoires de mieux comprendre leur situation, aux institutions de mieux décider et à l’entreprise Mbàmbulaan de construire un modèle économique durable.

La finalité n’est pas de numériser chaque geste existant. La finalité est de rendre la coordination plus fiable, plus rapide, plus explicite et plus utile.

Cette doctrine sert de cadre commun à toute personne ou intelligence artificielle intervenant sur le repository. Elle ne décrit pas uniquement ce qu’il faut construire. Elle décrit comment raisonner lorsque la documentation, les contraintes ou les options techniques sont ambiguës.

---

## 1. Définition officielle du produit

Mbàmbulaan est un **système d’exploitation de coordination pour la filière halieutique**, commençant par la pêche artisanale sénégalaise.

Il organise notamment :

- les acteurs et leurs responsabilités ;
- les territoires, sites et quais ;
- les signaux terrain ;
- les besoins et les capacités ;
- les arrivages, lots et disponibilités ;
- les opportunités et tensions ;
- les engagements ;
- les actions coordonnées ;
- les traces opérationnelles ;
- les éléments de confiance ;
- les résultats observables ;
- les informations utiles à la décision.

Mbàmbulaan doit permettre à l’écosystème de répondre à cinq questions :

1. Que se passe-t-il ?
2. Qui est concerné ?
3. Qu’est-ce qui nécessite une action ?
4. Qui doit agir, quand et sur quelle base ?
5. Quel résultat a été obtenu et comment peut-il être vérifié ?

---

## 2. Ce que Mbàmbulaan n’est pas

Mbàmbulaan ne doit jamais être réduit à :

- une marketplace ;
- un ERP ;
- un CRM ;
- un dashboard ;
- un site vitrine ;
- une banque ;
- un établissement de paiement ;
- un assureur ;
- un logiciel comptable ;
- une collection d’écrans par persona ;
- une plateforme de données sans responsabilité opérationnelle ;
- une intelligence artificielle prenant les décisions à la place des acteurs.

Ces exclusions ne signifient pas que Mbàmbulaan ne peut pas coordonner des achats, règlements, assurances, financements, ventes ou contrats. Elles signifient que Mbàmbulaan organise les engagements, la circulation de l’information, les responsabilités, les validations et les traces autour de ces activités, en s’appuyant si nécessaire sur des partenaires habilités.

---

## 3. Hiérarchie documentaire

Tout intervenant doit lire la documentation du plus ancien au plus récent afin de comprendre l’évolution du produit, mais tous les documents n’ont pas la même autorité.

Ordre d’autorité :

1. **La présente doctrine** ;
2. **`DECISIONS.md` et les arbitrages officiels plus récents** ;
3. **Les audits et notes d’exécution les plus récents validés** ;
4. **`MVP_FREEZE_NOTE.md` pour la priorité immédiate d’exécution** ;
5. **Le modèle métier, le Product Book et les blueprints** ;
6. **Les Lots de roadmap pour les capabilities cibles et dépendances** ;
7. **Les anciens prompts Codex et documents de travail, à titre historique uniquement**.

En cas de contradiction :

- la décision la plus récente et explicitement validée prévaut ;
- une note de priorité immédiate ne supprime pas une ambition cible, sauf mention explicite ;
- un ancien prompt ne doit jamais contredire une doctrine ou une décision plus récente ;
- une ambiguïté non résolue doit être documentée avant toute implémentation irréversible.

---

## 4. Les douze lois de Mbàmbulaan

### Loi 1 — Toute capability doit améliorer la coordination

Une capability sans effet clair sur la coordination, la valeur métier, la confiance, l’exploitation ou le modèle économique n’est pas prioritaire.

### Loi 2 — Une capability sans parcours complet est incomplète

Une capability doit avoir un déclencheur, des acteurs, des états, des décisions, des exceptions, des traces et un résultat observable.

### Loi 3 — Un écran sans décision n’a pas sa place

Chaque écran doit permettre au minimum de comprendre, prioriser, décider, agir ou vérifier.

### Loi 4 — Toute donnée doit avoir une utilité métier

Aucune donnée ne doit être demandée, stockée ou affichée sans usage identifié.

### Loi 5 — La confiance se démontre

La confiance ne doit jamais être déclarée abstraitement. Elle repose sur une source, une date, une responsabilité, un niveau de validation, un historique ou une trace.

### Loi 6 — Le produit ne se fragmente pas

Un seul produit configurable doit servir plusieurs rôles, organisations et territoires. Les forks fonctionnels ou territoriaux sont interdits sauf décision exceptionnelle documentée.

### Loi 7 — Un acteur ne voit que ce qui lui permet d’agir

Les espaces acteurs ne sont pas des copies du produit. Ils sont des vues contextualisées sur un même domaine partagé.

### Loi 8 — Le code suit le domaine

Les objets, règles, états et événements métier précèdent les composants et les routes.

### Loi 9 — Toute action importante produit une trace

Toute qualification, validation, engagement, décision, fermeture ou exception significative doit être traçable.

### Loi 10 — Toute recommandation doit être explicable

Aucune boîte noire. Toute règle, score ou recommandation doit exposer ses raisons et ses limites.

### Loi 11 — Toute évolution doit réduire ou maîtriser la dette

Une évolution ne doit pas uniquement ajouter. Elle doit également supprimer les duplications, clarifier le modèle et améliorer la maintenabilité.

### Loi 12 — La valeur créée doit pouvoir être démontrée

Mbàmbulaan doit être capable de montrer ce qui a changé, pour qui, selon quelle méthode et avec quel niveau de confiance.

---

## 5. Ordre permanent de raisonnement

Toute décision doit suivre l’ordre suivant :

1. rupture de coordination ;
2. résultat métier attendu ;
3. acteurs concernés ;
4. parcours ;
5. capability ;
6. règles métier ;
7. données et traces ;
8. architecture ;
9. expérience utilisateur ;
10. écrans ;
11. code.

Il est interdit de partir d’un écran, d’une technologie ou d’une fonctionnalité pour inventer ensuite son utilité métier.

---

## 6. Questions obligatoires avant toute évolution

Pour toute nouvelle capability, route, composant ou service, répondre explicitement à :

- Qui utilise ?
- Qui bénéficie ?
- Qui décide ?
- Qui paie ?
- Pourquoi paierait-il durablement ?
- Quelle rupture de coordination est réduite ?
- Quel résultat observable est produit ?
- Quelle trace opérationnelle est créée ?
- Quel élément de confiance est renforcé ?
- Quelle valeur économique est créée ou protégée ?
- Cette capability est-elle différenciante ?
- Est-elle nécessaire maintenant ?
- Peut-elle être configurée plutôt que dupliquée ?
- Est-elle compatible avec un usage terrain, une connectivité faible et une maturité numérique hétérogène ?
- Quel est son coût de construction, d’exploitation et de support ?

Une réponse insuffisante impose de reporter, simplifier ou supprimer l’évolution.

---

## 7. Parcours de coordination de référence

Le parcours cœur est :

`Signal terrain -> qualification -> tension ou opportunité -> action -> trace opérationnelle -> résultat observable -> rapport`

Sa traduction métier étendue est :

`Pirogue ou acteur terrain -> retour ou signal -> besoin opérationnel -> arrivée -> débarquement -> pesée -> lot -> disponibilité -> besoin ou débouché -> tension ou opportunité -> engagement -> action coordonnée -> trace -> résultat -> lecture de décision`

Ce parcours est la colonne vertébrale du produit. Les autres capabilities doivent s’y rattacher ou justifier explicitement leur autonomie.

Chaque étape doit préciser :

- l’acteur responsable ;
- l’état d’entrée ;
- l’action possible ;
- l’état de sortie ;
- les exceptions ;
- la source de l’information ;
- le niveau de confiance ;
- la trace générée ;
- le résultat attendu.

---

## 8. Principes d’architecture fonctionnelle

### 8.1 Un domaine partagé

Les espaces acteurs doivent utiliser un modèle métier unique comprenant notamment :

- Actor ;
- Organization ;
- Role ;
- Territory ;
- Site ;
- Quay ;
- Vessel ;
- Signal ;
- ReturnAnnouncement ;
- Arrival ;
- Need ;
- Capacity ;
- Lot ;
- Opportunity ;
- Tension ;
- Commitment ;
- CoordinationAction ;
- Incident ;
- Proof ou OperationalTrace ;
- TrustSignal ;
- QualityStatus ;
- Decision ;
- Outcome ;
- ReportMetric.

### 8.2 Une capability n’est pas un écran

Une capability regroupe :

- règles ;
- états ;
- événements ;
- services ;
- permissions ;
- traces ;
- vues adaptées aux rôles.

### 8.3 Les espaces acteurs sont des projections

Un pêcheur, un mareyeur, un agent terrain, une collectivité ou un décideur n’utilisent pas des produits différents. Ils utilisent des projections différentes d’un même système.

### 8.4 Les événements métier structurent la coordination

Exemples :

- retour annoncé ;
- besoin déclaré ;
- capacité disponible ;
- arrivée confirmée ;
- lot constitué ;
- tension détectée ;
- opportunité identifiée ;
- engagement pris ;
- action assignée ;
- incident signalé ;
- preuve ajoutée ;
- résultat confirmé ;
- dossier clôturé.

---

## 9. Principes d’architecture technique

### 9.1 Centraliser la logique métier

La logique métier doit rester hors des composants d’interface et être centralisée dans des domaines, services ou moteurs testables.

### 9.2 Une seule architecture de routes

Les duplications de type `espaces/`, `espace-prive/` et `demo/{role}` doivent converger vers :

- un espace public ;
- une démo guidée ;
- une application authentifiée ;
- des workspaces dynamiques selon rôle, organisation et territoire.

Le mode démo ne doit pas constituer un second produit.

### 9.3 Persistance progressive mais réelle

Le produit peut conserver des données de démonstration, mais l’architecture doit permettre une persistance réelle sans réécriture majeure.

Le socle minimal attendu comprend :

- schéma de données partagé ;
- migrations ;
- seeds réalistes ;
- séparation des données de démonstration et des données persistées ;
- couche de service ou repository ;
- identités, rôles et organisations ;
- journalisation des actions significatives.

### 9.4 Pas de sur-ingénierie

Ne pas introduire prématurément :

- microservices ;
- event bus distribué ;
- IA complexe ;
- API publique générale ;
- moteur de workflow générique lourd ;
- infrastructures coûteuses sans usage démontré.

### 9.5 Extensibilité contrôlée

L’architecture doit préparer, sans les sur-construire :

- multi-territoires ;
- partenaires tiers ;
- services financiers coordonnés ;
- interopérabilité ;
- observabilité ;
- mode dégradé ;
- souveraineté et réversibilité.

### 9.6 Qualité technique minimale

Toute livraison doit respecter :

- typage strict ;
- build réussi ;
- tests utiles ;
- migrations vérifiées ;
- données de seed cohérentes ;
- composants réutilisables ;
- logique métier testable ;
- gestion des erreurs ;
- documentation mise à jour ;
- absence de dépendance injustifiée.

---

## 10. Principes UX et design

### 10.1 Pas de dashboard passif

Une vue de pilotage doit aider à agir. Chaque indicateur doit être relié à un contexte, une cause, une priorité ou une décision.

### 10.2 Pas de KPI isolé

Un KPI doit préciser :

- son périmètre ;
- sa période ;
- sa source ;
- son niveau de fiabilité ;
- sa variation ;
- l’action qu’il peut déclencher.

### 10.3 Pas de notification sans action

Toute alerte doit préciser :

- ce qui s’est produit ;
- pourquoi cela compte ;
- qui doit agir ;
- quand ;
- quelles options sont disponibles.

### 10.4 Pas de liste sans priorité

Les listes opérationnelles doivent permettre de comprendre ce qui est urgent, bloqué, risqué ou attendu.

### 10.5 Design premium, mais terrain

Le design doit être :

- distinctif ;
- sobre ;
- crédible institutionnellement ;
- lisible en extérieur ;
- utilisable sur mobile et desktop ;
- accessible ;
- adapté aux connexions lentes ;
- compréhensible sans formation lourde.

Le design ne doit jamais sacrifier la clarté à l’effet visuel.

### 10.6 Une vue, une mission

- Dashboard : comprendre la situation ;
- Coordination Center : piloter les actions ;
- Executive / Rapport : décider et rendre compte ;
- Workspace acteur : exécuter les responsabilités du rôle.

Ces missions ne doivent pas être dupliquées.

---

## 11. Principes relatifs à la confiance et aux traces

Toute information importante doit pouvoir inclure :

- source ;
- auteur ;
- date ;
- territoire ;
- statut ;
- niveau de preuve ;
- niveau de fiabilité ;
- validation éventuelle ;
- historique des modifications.

Le vocabulaire recommandé est :

- trace opérationnelle ;
- élément de confiance ;
- résultat observable ;
- validation terrain ;
- niveau de fiabilité.

Éviter d’utiliser abusivement le mot « preuve » lorsque l’information n’a pas de force probante réelle.

---

## 12. Principes IA et aide à la décision

L’intelligence artificielle peut :

- détecter ;
- expliquer ;
- rapprocher ;
- prioriser ;
- recommander ;
- simuler ;
- résumer ;
- capitaliser des apprentissages.

Elle ne doit pas :

- décider à la place d’un responsable ;
- masquer ses critères ;
- attribuer une certitude non justifiée ;
- produire un score opaque ;
- engager automatiquement un acteur sans règle et validation explicites.

Toute recommandation doit afficher :

- les éléments utilisés ;
- les raisons principales ;
- les incertitudes ;
- les limites ;
- la personne qui valide.

---

## 13. Principes business et monétisation

Toujours distinguer :

- utilisateur ;
- bénéficiaire ;
- décideur ;
- payeur ;
- financeur ;
- partenaire ;
- opérateur.

Une capability n’est pas monétisable uniquement parce qu’elle est utile.

Pour être économiquement viable, elle doit permettre d’identifier :

- une valeur créée ou protégée ;
- un bénéficiaire qui reconnaît cette valeur ;
- un payeur légitime ;
- une fréquence ou un événement de facturation ;
- un coût de service maîtrisable ;
- une marge soutenable ;
- une raison de renouveler.

Mbàmbulaan ne doit pas dépendre d’une seule hypothèse de revenus. Le modèle peut combiner :

- abonnement institutionnel ou organisationnel ;
- frais de déploiement ;
- accompagnement et exploitation ;
- intégration avec des partenaires ;
- modules ou niveaux de service ;
- financement de programmes ;
- services coordonnés via partenaires habilités.

Une subvention finance un développement ou un déploiement. Elle ne constitue pas à elle seule un modèle économique.

---

## 14. Principes d’exploitation

Un produit utile mais inexploitable n’est pas un produit fini.

Mbàmbulaan doit prévoir :

- supervision des parcours critiques ;
- traitement des incidents ;
- gestion des exceptions ;
- support des utilisateurs ;
- correction des données ;
- suivi des actions en attente ;
- journal d’audit ;
- observabilité technique ;
- observabilité métier ;
- continuité de service ;
- procédures de reprise.

L’observabilité métier doit mesurer les ruptures de coordination, pas seulement les erreurs serveur.

---

## 15. Principes de déploiement territorial

Mbàmbulaan est un produit unique configurable.

Toute variation locale doit être traitée, dans cet ordre, par :

1. configuration ;
2. référentiel ;
3. règle paramétrable ;
4. extension contrôlée ;
5. développement spécifique uniquement en dernier recours.

Un territoire ne doit jamais justifier automatiquement un fork.

Tout nouveau territoire doit préciser :

- acteurs ;
- gouvernance ;
- prérequis ;
- données ;
- coûts de déploiement ;
- coûts d’exploitation ;
- modèle de financement ;
- résultats attendus ;
- conditions de sortie.

---

## 16. Principes GitHub et gestion du repository

### 16.1 Une PR doit converger

Toute pull request doit :

- améliorer un parcours ou une capability ;
- réduire ou maîtriser la dette ;
- respecter les décisions ;
- rester limitée à un objectif cohérent ;
- mettre à jour la documentation concernée ;
- laisser le repository compilable et testable.

### 16.2 Pas de reset sans décision formelle

Un reset UX, architecture ou produit doit être exceptionnel, motivé et documenté. Les cycles de reconstruction successifs sans convergence sont interdits.

### 16.3 Statut protégé de la PR #52

La PR #52 doit rester :

- ouverte ;
- draft ;
- non prête pour review ;
- non mergée ;
- sans auto-merge.

Aucun agent ne doit modifier son statut sans instruction explicite du fondateur.

### 16.4 Les anciens prompts sont des archives

Ils peuvent expliquer l’histoire, mais ne doivent pas piloter une implémentation actuelle s’ils contredisent la doctrine ou une décision récente.

---

## 17. Règles spécifiques pour Codex et les agents IA

Avant de modifier le code, tout agent doit :

1. explorer le repository ;
2. lire la documentation du plus ancien au plus récent ;
3. identifier les documents normatifs ;
4. reconstruire les décisions ;
5. auditer le code existant ;
6. identifier les duplications ;
7. proposer un plan de convergence ;
8. développer seulement après cette analyse.

Pendant l’exécution, l’agent doit :

- réutiliser avant de recréer ;
- connecter avant d’ajouter ;
- fusionner avant de dupliquer ;
- terminer un parcours avant d’ouvrir un autre chantier ;
- conserver un produit exécutable ;
- documenter les arbitrages ;
- produire des commits cohérents ;
- ne jamais masquer un échec de test ou de build.

L’agent ne doit pas :

- réinventer le produit ;
- développer tous les Lots superficiellement ;
- créer des écrans factices ;
- introduire une nouvelle architecture parallèle ;
- utiliser les données mockées comme prétexte pour ignorer le domaine ;
- modifier la PR #52 ;
- merger automatiquement une PR.

---

## 18. Règles de priorisation

Une évolution est prioritaire si elle améliore clairement au moins un des axes suivants :

- coordination ;
- valeur métier ;
- confiance ;
- adoption ;
- exploitation ;
- monétisation ;
- résilience ;
- différenciation.

Elle devient prioritaire seulement si :

- ses dépendances sont maîtrisées ;
- son coût est proportionné ;
- son résultat est vérifiable ;
- elle ne fragmente pas le produit ;
- elle ne bloque pas un parcours plus important.

La priorité doit être attribuée selon quatre niveaux :

- **P0 :** bloquant pour le fonctionnement, la cohérence ou la démonstration ;
- **P1 :** nécessaire pour compléter un parcours cœur ;
- **P2 :** améliore fortement la valeur ou l’exploitation ;
- **P3 :** extension, optimisation ou préparation future.

---

## 19. Niveaux d’implémentation des Lots

Tous les Lots de roadmap ne doivent pas être implémentés au même niveau dans une même itération.

Chaque Lot doit être classé comme :

- **implémenté profondément** : parcours utilisable de bout en bout ;
- **implémenté partiellement** : capability utile mais périmètre volontairement limité ;
- **préparé architecturalement** : interfaces, modèles ou extensions prévues sans sur-construction ;
- **documenté et différé** : aucune implémentation avant validation d’une dépendance ou d’un besoin réel.

Le `MVP_FREEZE_NOTE` fixe la séquence immédiate. Il n’annule pas la roadmap cible.

---

## 20. Critères d’acceptation d’une capability

Une capability est acceptée uniquement si :

- son utilisateur est identifié ;
- son bénéficiaire est identifié ;
- son rôle dans un parcours est clair ;
- ses règles sont explicites ;
- ses états et exceptions sont traités ;
- ses permissions sont définies ;
- ses données ont une source ;
- ses actions produisent des traces ;
- son résultat observable est visible ;
- elle est testable ;
- elle est exploitable ;
- elle ne duplique pas une capability existante ;
- son impact économique ou stratégique est compris.

---

## 21. Critères de rejet ou de report

Une évolution doit être rejetée ou reportée lorsqu’elle :

- n’améliore aucune coordination réelle ;
- crée un écran sans décision ;
- duplique une route, un domaine ou une règle ;
- transforme Mbàmbulaan en marketplace ou ERP ;
- impose une dépendance lourde sans besoin démontré ;
- suppose un payeur inexistant ;
- exige des données impossibles à fiabiliser ;
- augmente fortement le coût d’exploitation ;
- dépend d’une réglementation non clarifiée ;
- fragmente le produit par territoire ou persona ;
- introduit une boîte noire ;
- ne peut pas être expliquée à un acteur terrain.

---

## 22. Doctrine de design exceptionnel

Un design exceptionnel pour Mbàmbulaan ne signifie pas multiplier les effets visuels.

Il signifie :

- rendre une situation complexe immédiatement lisible ;
- rendre les responsabilités évidentes ;
- faire ressortir les tensions et priorités ;
- montrer les niveaux de confiance ;
- relier chaque action à ses conséquences ;
- conserver une identité visuelle sénégalaise contemporaine, sobre et premium ;
- fonctionner aussi bien pour un agent terrain que pour un décideur institutionnel.

La qualité du design doit être jugée sur la qualité de la décision qu’il permet, pas uniquement sur son esthétique.

---

## 23. Doctrine de valeur

Mbàmbulaan crée de la valeur lorsqu’il permet notamment de :

- réduire une perte ;
- mieux utiliser une capacité ;
- éviter une rupture ;
- accélérer une décision ;
- améliorer une allocation ;
- sécuriser un engagement ;
- rendre une situation vérifiable ;
- réduire un coût de coordination ;
- améliorer une qualité de service ;
- produire une information collective plus fiable.

La capture de valeur par Mbàmbulaan doit rester proportionnée à la valeur créée, soutenable pour le payeur et compatible avec la mission de l’écosystème.

---

## 24. Doctrine de décision

Lorsqu’une décision est difficile, appliquer successivement les filtres suivants :

1. Est-ce fidèle à la vision ?
2. Est-ce utile à un parcours réel ?
3. Est-ce vérifiable ?
4. Est-ce exploitable ?
5. Est-ce économiquement soutenable ?
6. Est-ce configurable ?
7. Est-ce réversible ?
8. Est-ce nécessaire maintenant ?

En cas d’égalité entre deux options, choisir celle qui :

- réduit la complexité ;
- préserve le domaine ;
- améliore la traçabilité ;
- facilite l’exploitation ;
- évite une dépendance irréversible.

---

## 25. Engagement final

Mbàmbulaan ne doit pas évoluer par accumulation de fonctionnalités.

Il doit évoluer par renforcement progressif de ses capacités de coordination.

Toute personne ou intelligence artificielle travaillant sur ce projet s’engage à :

- comprendre avant de proposer ;
- consolider avant d’ajouter ;
- challenger avant de valider ;
- relier chaque évolution à un parcours ;
- protéger l’unicité du produit ;
- rendre la valeur et la confiance observables ;
- laisser le produit plus cohérent qu’avant son intervention.

La question centrale n’est jamais :

> Quelle fonctionnalité pouvons-nous ajouter ?

La question centrale est :

> Quelle capacité de coordination devons-nous renforcer pour permettre aux acteurs de mieux agir ensemble, créer davantage de valeur et rendre Mbàmbulaan durable, rentable et difficile à remplacer ?
