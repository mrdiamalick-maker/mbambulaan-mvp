# Mbàmbulaan — Infrastructures numériques de la filière

## 1. Objet du document

Ce document dérive les infrastructures numériques à partir de la carte des flux de valeur de la filière pêche artisanale.

Une infrastructure numérique n'est pas un écran, une application ou un module technique. C'est un ensemble cohérent de capacités métier, de règles, de données et de mécanismes de confiance permettant à plusieurs acteurs de mieux coordonner leurs décisions et leurs opérations.

L'objectif est d'identifier les moteurs structurants de Mbàmbulaan avant de définir les produits, interfaces et développements.

---

## 2. Principes de conception

Chaque infrastructure doit répondre à cinq questions :

1. Quel flux de valeur améliore-t-elle ?
2. Quelle rupture de coordination réduit-elle ?
3. Quels acteurs l'utilisent ?
4. Quels acteurs en bénéficient ?
5. Quel modèle économique peut la soutenir durablement ?

Une infrastructure est retenue seulement si elle :

- améliore la coordination ;
- crée une valeur métier explicite ;
- réduit une friction importante ;
- peut être adoptée par les acteurs réels ;
- peut générer ou soutenir une valeur économique pour Mbàmbulaan.

---

## 3. Cartographie synthétique

Mbàmbulaan repose sur huit infrastructures numériques :

1. Infrastructure d'identité, de rôles et de confiance.
2. Infrastructure de visibilité opérationnelle.
3. Infrastructure de traçabilité des produits et événements.
4. Infrastructure de disponibilité et d'allocation.
5. Infrastructure de coordination des tensions et engagements.
6. Infrastructure de transaction et de règlement.
7. Infrastructure de pilotage sectoriel et de preuve de valeur.
8. Infrastructure d'intégration et d'interopérabilité.

Elles sont complémentaires. Aucune ne doit être pensée comme une application autonome.

```text
Identité et confiance
        ↓
Visibilité opérationnelle
        ↓
Traçabilité
        ↓
Disponibilité et allocation
        ↓
Coordination des tensions
        ↓
Transaction et règlement
        ↓
Pilotage et preuve de valeur
```

L'infrastructure d'intégration traverse l'ensemble.

---

## 4. Infrastructure 1 — Identité, rôles et confiance

### Finalité

Établir qui est qui, qui peut faire quoi, pour quel territoire, avec quel niveau de confiance et sous la responsabilité de quelle organisation.

### Ruptures traitées

- acteurs difficiles à identifier ;
- rôles informels ou ambigus ;
- absence de responsabilité claire ;
- difficulté à distinguer déclaration, confirmation et vérification ;
- réputation dispersée et non exploitable.

### Objets métier principaux

- acteur ;
- organisation ;
- rôle ;
- territoire ;
- affiliation ;
- statut ;
- niveau de confiance ;
- preuve ;
- historique d'activité.

### Capacités majeures

- enregistrer un acteur ou une organisation ;
- attribuer un rôle métier ;
- relier un acteur à une organisation et un territoire ;
- distinguer les droits de déclaration, confirmation, validation et arbitrage ;
- conserver les preuves associées à une action ;
- produire un historique de fiabilité ;
- gérer la suspension ou l'inactivation d'un acteur.

### Acteurs utilisateurs

- organisations de pêcheurs ;
- gestionnaires de sites ;
- opérateurs de services ;
- acheteurs ;
- coordinateurs territoriaux ;
- institutions publiques.

### Bénéfices métier

- responsabilités explicites ;
- réduction des contestations ;
- meilleure confiance entre acteurs ;
- base d'un futur scoring de fiabilité ;
- contrôle des accès sans imposer une structure lourde.

### Hypothèses de modèle économique

- gratuite pour les acteurs individuels afin de faciliter l'adoption ;
- incluse dans les abonnements organisationnels ;
- valorisable dans les services institutionnels ;
- base future pour des services premium de certification ou de scoring.

### Positionnement dans le MVP

**Indispensable, mais minimaliste.**

Le MVP doit gérer les identités, rôles, organisations, territoires et niveaux simples de confiance. Il ne doit pas construire immédiatement une solution complète de certification ou de réputation.

---

## 5. Infrastructure 2 — Visibilité opérationnelle

### Finalité

Donner une vision partagée et suffisamment anticipée des départs, retours, arrivées, volumes estimés, besoins et contraintes de site.

### Ruptures traitées

- retour non annoncé ;
- estimation tardive ;
- services préparés trop tard ;
- congestion du site ;
- incapacité à anticiper les ressources nécessaires.

### Objets métier principaux

- campagne ;
- départ ;
- unité de pêche ;
- retour attendu ;
- estimation de capture ;
- besoin de service ;
- site de débarquement ;
- statut opérationnel.

### Capacités majeures

- déclarer une préparation de campagne ;
- enregistrer un départ ;
- mettre à jour le statut d'une unité en mer ;
- annoncer un retour ;
- estimer les captures ;
- déclarer des besoins de glace, froid, transport ou manutention ;
- confirmer une arrivée ;
- visualiser les retours attendus par site et territoire ;
- détecter un risque de saturation.

### Acteurs utilisateurs

- capitaine ;
- relais à terre ;
- organisation de pêcheurs ;
- gestionnaire de site ;
- coordinateur territorial ;
- opérateur de service.

### Bénéfices métier

- préparation des ressources ;
- réduction des attentes ;
- meilleure utilisation des capacités ;
- diminution des pertes liées aux retards ;
- capacité à prioriser les situations urgentes.

### Hypothèses de modèle économique

- capacité d'adoption gratuite ou subventionnée ;
- valeur indirecte pour les gestionnaires de sites ;
- composante d'une offre institutionnelle de pilotage ;
- base d'un abonnement organisationnel pour sites et opérateurs.

### Positionnement dans le MVP

**Priorité très élevée.**

Cette infrastructure constitue l'un des meilleurs points d'entrée car elle crée de la valeur avant même toute transaction.

---

## 6. Infrastructure 3 — Traçabilité des produits et événements

### Finalité

Créer une référence partagée sur les événements, mesures, lots, qualités et décisions associées au produit.

### Ruptures traitées

- pesée contestée ;
- origine difficile à établir ;
- qualité non documentée ;
- incohérence entre estimation, pesée et lots ;
- absence de preuve lors d'un litige.

### Objets métier principaux

- débarquement ;
- pesée ;
- méthode de mesure ;
- niveau de confiance ;
- lot ;
- espèce ;
- qualité ;
- état de conservation ;
- preuve ;
- chaîne d'événements.

### Capacités majeures

- confirmer un débarquement ;
- enregistrer une pesée ;
- qualifier la méthode de mesure ;
- rattacher une vérification ;
- constituer des lots ;
- contrôler la cohérence des poids ;
- attribuer qualité et état de conservation ;
- suivre les changements d'état d'un lot ;
- produire un historique d'origine et de transformation.

### Acteurs utilisateurs

- gestionnaire de site ;
- peseur ;
- agent de contrôle ;
- mareyeur ;
- transformateur ;
- organisation de pêcheurs ;
- institution publique.

### Bénéfices métier

- réduction des litiges ;
- meilleure confiance ;
- base fiable pour la transaction ;
- amélioration du pilotage qualité ;
- données exploitables pour les institutions.

### Hypothèses de modèle économique

- capacité incluse dans les offres de site ou d'organisation ;
- valeur transactionnelle indirecte ;
- service premium pour acheteurs exigeant une traçabilité renforcée ;
- composante d'offres institutionnelles ou de conformité.

### Positionnement dans le MVP

**Priorité élevée, avec niveau de preuve simple.**

Le MVP doit distinguer clairement déclaration, confirmation et vérification, sans chercher une traçabilité réglementaire exhaustive.

---

## 7. Infrastructure 4 — Disponibilité et allocation

### Finalité

Rendre visibles les lots, besoins et capacités afin de les rapprocher et de les allouer rapidement.

### Ruptures traitées

- offre et demande dispersées ;
- capacité de froid ou transport invisible ;
- double réservation ;
- lot mal orienté ;
- perte de temps avant prise en charge ;
- sous-utilisation d'une capacité disponible.

### Objets métier principaux

- lot disponible ;
- besoin marché ;
- capacité de service ;
- disponibilité ;
- réservation ;
- allocation ;
- créneau ;
- priorité ;
- correspondance.

### Capacités majeures

- publier un lot disponible ;
- déclarer un besoin d'achat ;
- déclarer une capacité de glace, froid, transport ou transformation ;
- rechercher des correspondances ;
- proposer une allocation ;
- réserver une capacité ou un lot ;
- fractionner une allocation ;
- gérer l'expiration ou l'annulation ;
- réallouer en cas d'échec ;
- prioriser les lots à risque.

### Acteurs utilisateurs

- mareyeurs ;
- acheteurs ;
- transformateurs ;
- transporteurs ;
- opérateurs de froid ;
- gestionnaires de site ;
- coordinateurs.

### Bénéfices métier

- réduction du temps de recherche ;
- baisse des pertes ;
- amélioration du taux d'utilisation des capacités ;
- création de débouchés ;
- meilleure rotation des lots.

### Hypothèses de modèle économique

- commission ou frais par réservation ;
- abonnement pour opérateurs de capacité ;
- frais de coordination ;
- offre premium de visibilité prioritaire ;
- services institutionnels de gestion de pénurie.

### Positionnement dans le MVP

**Priorité élevée, mais ciblée.**

Le MVP ne doit pas devenir une marketplace complète. Il doit démontrer la capacité de rapprocher un besoin concret avec une offre ou une capacité disponible.

---

## 8. Infrastructure 5 — Coordination des tensions et engagements

### Finalité

Transformer une difficulté opérationnelle en responsabilité claire, action attendue, échéance et résultat prouvé.

### Ruptures traitées

- problème connu mais non pris en charge ;
- absence de responsable ;
- engagement verbal non suivi ;
- retard sans escalade ;
- résolution non documentée ;
- impossibilité de mesurer la valeur créée.

### Objets métier principaux

- tension ;
- niveau de sévérité ;
- entité liée ;
- responsable ;
- engagement ;
- échéance ;
- statut ;
- escalade ;
- résultat ;
- preuve.

### Capacités majeures

- signaler une tension ;
- qualifier le type et la gravité ;
- rattacher la tension à un objet métier ;
- proposer un responsable ;
- formaliser un engagement ;
- suivre l'avancement ;
- détecter un retard ;
- escalader ;
- clôturer avec preuve ;
- enregistrer une perte évitée ou une valeur créée.

### Acteurs utilisateurs

- coordinateur territorial ;
- gestionnaire de site ;
- opérateur de service ;
- organisation de pêcheurs ;
- acheteur ;
- institution publique.

### Bénéfices métier

- réduction du temps de résolution ;
- responsabilisation ;
- meilleure continuité opérationnelle ;
- mémoire des incidents ;
- preuve de la valeur de la coordination.

### Hypothèses de modèle économique

- abonnement organisationnel ;
- licence institutionnelle ;
- frais de coordination sur certains services ;
- composante différenciante de l'offre Mbàmbulaan.

### Positionnement dans le MVP

**Infrastructure différenciante et stratégique.**

Cette infrastructure est probablement le cœur de la proposition de valeur de Mbàmbulaan. Elle doit être présente très tôt, mais avec un périmètre clair et simple.

---

## 9. Infrastructure 6 — Transaction et règlement

### Finalité

Sécuriser les conditions convenues, l'exécution des services et la réconciliation des paiements.

### Ruptures traitées

- accord verbal ambigu ;
- avance difficile à tracer ;
- paiement retardé ;
- service contesté ;
- frais non transparents ;
- absence de preuve de règlement.

### Objets métier principaux

- offre ;
- condition commerciale ;
- commande ;
- réservation ;
- avance ;
- paiement ;
- commission ;
- validation de service ;
- remboursement ;
- litige.

### Capacités majeures

- formaliser une condition commerciale ;
- confirmer une réservation ;
- enregistrer une avance ;
- valider une livraison ou un service ;
- déclencher un paiement ;
- suivre les règlements ;
- calculer une commission ;
- réconcilier les montants ;
- ouvrir un litige ;
- conserver une preuve.

### Acteurs utilisateurs

- acheteurs ;
- vendeurs ;
- organisations de pêcheurs ;
- opérateurs de services ;
- gestionnaires de site ;
- prestataires de paiement futurs.

### Bénéfices métier

- réduction des impayés ;
- transparence ;
- base d'un modèle transactionnel ;
- meilleure confiance ;
- mesure des revenus et coûts.

### Hypothèses de modèle économique

- commission transactionnelle ;
- frais de règlement ou de sécurisation ;
- abonnement professionnel ;
- services financiers futurs avec partenaires agréés.

### Positionnement dans le MVP

**À introduire avec prudence.**

Le MVP peut enregistrer les conditions et preuves de règlement, mais ne doit pas immédiatement porter des flux financiers complexes ni se substituer à un prestataire de paiement réglementé.

---

## 10. Infrastructure 7 — Pilotage sectoriel et preuve de valeur

### Finalité

Transformer les opérations en indicateurs fiables permettant de piloter les sites, territoires, organisations et politiques publiques.

### Ruptures traitées

- données fragmentées ;
- reporting tardif ;
- incapacité à mesurer les pertes ;
- difficulté à justifier un financement ;
- décisions publiques prises sans visibilité opérationnelle.

### Objets métier principaux

- indicateur ;
- événement ;
- volume ;
- prix ;
- capacité ;
- incident ;
- délai ;
- perte évitée ;
- valeur créée ;
- territoire ;
- période.

### Capacités majeures

- consolider les volumes ;
- suivre les prix et délais ;
- mesurer les écarts entre prévision et réalité ;
- suivre les capacités disponibles et utilisées ;
- mesurer les tensions et leur résolution ;
- quantifier les pertes évitées ;
- produire des vues territoriales ;
- exporter ou partager des indicateurs ;
- documenter l'impact d'un programme.

### Acteurs utilisateurs

- gestionnaires de sites ;
- organisations professionnelles ;
- collectivités ;
- ministère ;
- programmes et bailleurs ;
- direction de Mbàmbulaan.

### Bénéfices métier

- décision plus rapide ;
- allocation des investissements ;
- justification de financements ;
- visibilité sur l'impact ;
- avantage concurrentiel par la donnée.

### Hypothèses de modèle économique

- contrats institutionnels ;
- abonnement de pilotage ;
- études et données agrégées ;
- reporting financé par programmes ou bailleurs ;
- services premium d'analyse.

### Positionnement dans le MVP

**Présent dès le début, mais limité aux indicateurs directement issus des opérations.**

Il faut éviter un dashboard décoratif. Chaque indicateur doit répondre à une décision réelle.

---

## 11. Infrastructure 8 — Intégration et interopérabilité

### Finalité

Permettre à Mbàmbulaan de fonctionner avec des canaux simples et des systèmes externes sans enfermer les acteurs dans une interface unique.

### Ruptures traitées

- acteurs peu équipés ;
- connectivité irrégulière ;
- dépendance à une application unique ;
- duplication de saisie ;
- données institutionnelles ou partenaires isolées.

### Objets métier principaux

- canal ;
- source ;
- événement ;
- message ;
- synchronisation ;
- import ;
- export ;
- consentement ;
- journal d'intégration.

### Capacités majeures

- saisir via application légère ;
- utiliser des relais humains ;
- recevoir ou envoyer des notifications ;
- fonctionner en mode dégradé ;
- importer et exporter des données ;
- exposer des interfaces d'intégration ;
- journaliser les échanges ;
- respecter les droits et consentements.

### Acteurs utilisateurs

- tous les acteurs de la filière ;
- partenaires techniques ;
- institutions ;
- opérateurs de paiement ;
- programmes et systèmes publics.

### Bénéfices métier

- adoption plus large ;
- résilience ;
- réduction de la double saisie ;
- possibilité de déploiement progressif ;
- ouverture à l'écosystème.

### Hypothèses de modèle économique

- incluse dans les offres principales ;
- frais d'intégration pour partenaires complexes ;
- services professionnels ;
- contrat d'interopérabilité institutionnelle.

### Positionnement dans le MVP

**Architecture nécessaire, sophistication limitée.**

Le MVP doit être compatible avec des opérations assistées et ne pas exiger que chaque acteur dispose immédiatement d'un smartphone ou d'une connexion permanente.

---

## 12. Relations entre les infrastructures

### Exemple 1 — Retour annoncé et tension de glace

```text
Identité
→ capitaine ou relais identifié

Visibilité opérationnelle
→ retour annoncé avec volume estimé

Disponibilité et allocation
→ besoin de glace comparé aux capacités disponibles

Coordination des tensions
→ pénurie détectée et responsable mobilisé

Transaction et règlement
→ conditions du service confirmées

Pilotage
→ délai, volume sauvé et coût enregistrés
```

### Exemple 2 — Lot disponible et besoin acheteur

```text
Traçabilité
→ lot qualifié et poids vérifié

Disponibilité et allocation
→ besoin acheteur rapproché du lot

Transaction
→ réservation et conditions convenues

Coordination
→ engagement de transport suivi

Pilotage
→ délai de vente, prix et résultat mesurés
```

---

## 13. Hiérarchie stratégique

Toutes les infrastructures n'ont pas la même priorité.

### Socle indispensable

- identité, rôles et confiance ;
- visibilité opérationnelle ;
- traçabilité minimale ;
- intégration légère.

### Cœur différenciant

- disponibilité et allocation ;
- coordination des tensions et engagements.

### Moteurs de revenu

- transaction et règlement ;
- abonnements organisationnels ;
- pilotage institutionnel ;
- services de données et d'intégration.

### Extensions futures

- scoring avancé ;
- assurance ;
- financement ;
- prévision algorithmique ;
- automatisation complète du matching ;
- traçabilité réglementaire étendue.

---

## 14. Risques de dérive à éviter

### Dérive 1 — Construire une marketplace trop tôt

Le matching commercial ne doit pas absorber tout le produit. La coordination des capacités, tensions et engagements est plus différenciante.

### Dérive 2 — Construire un ERP de filière

Mbàmbulaan ne doit pas gérer toute la comptabilité, les stocks internes ou la paie des acteurs. Il doit connecter et coordonner les flux critiques.

### Dérive 3 — Construire un dashboard sans action

Un indicateur n'a de valeur que s'il permet une décision, une allocation ou une intervention.

### Dérive 4 — Exiger une digitalisation complète

Le système doit accepter des relais humains, des saisies assistées et une connectivité imparfaite.

### Dérive 5 — Mélanger adoption et monétisation

Certaines capacités doivent être gratuites pour générer la donnée et la confiance. Les revenus doivent venir des acteurs qui capturent une valeur économique réelle.

---

## 15. Priorité proposée pour le futur MVP

Le MVP doit démontrer une boucle complète de coordination, et non une accumulation de fonctionnalités.

### Boucle prioritaire

```text
Retour annoncé
→ Besoin de service détecté
→ Capacité identifiée
→ Tension signalée si insuffisance
→ Engagement pris
→ Service exécuté
→ Débarquement et lot confirmés
→ Résultat et valeur enregistrés
```

### Infrastructures mobilisées

- identité et confiance ;
- visibilité opérationnelle ;
- traçabilité ;
- disponibilité et allocation ;
- coordination des tensions ;
- pilotage de la valeur.

### Ce qui peut rester manuel au départ

- paiement effectif ;
- matching complexe ;
- scoring ;
- notifications multi-canaux avancées ;
- intégrations externes lourdes ;
- analyse prédictive.

---

## 16. Prochaine étape

Le document suivant doit décomposer chaque infrastructure en capacités métier détaillées avec, pour chaque capacité :

- déclencheur ;
- utilisateur ;
- bénéficiaire ;
- décideur ;
- payeur potentiel ;
- valeur créée ;
- règle métier ;
- donnée requise ;
- résultat attendu ;
- priorité MVP ;
- hypothèse de revenu.

Cette décomposition servira ensuite à décider quelles capacités méritent un produit numérique, lesquelles peuvent rester assistées ou manuelles, et lesquelles doivent être différées.
