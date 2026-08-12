# Vision R&D — Tendances publiques des prix et disponibilités

> Statut : exploration R&D jetable. Ne constitue ni une spécification de production, ni un lot à implémenter.
> Branche : `codex/rd-exploration` uniquement.
> Interdits : aucune connexion au Produit réel, aucune modification du domaine ou des permissions, aucune donnée réelle exposée, aucun déploiement.

## 1. Verdict exécutif

L'idée brute — un **simulateur public des prix, des espèces et de la rareté présenté comme un outil de lutte contre l'inflation et la spéculation** — n'est pas défendable à court terme.

Elle agrège abusivement quatre promesses différentes :

1. mesurer des prix locaux ;
2. expliquer leur évolution ;
3. prévoir leur trajectoire ;
4. démontrer une inflation, une rareté biologique ou une spéculation.

Mbàmbulaan peut raisonnablement explorer la première, commencer à documenter la deuxième, simuler des scénarios très encadrés pour la troisième, mais ne dispose pas aujourd'hui de la méthode, de la couverture ni de l'autorité nécessaires pour affirmer la quatrième.

La version R&D recommandée est donc un **baromètre territorial des observations de marché avec explorateur de scénarios**, et non un prédicteur de prix :

- il montre ce qui a été observé, où, quand et avec quelle couverture ;
- il sépare la disponibilité commerciale locale de l'état scientifique d'un stock ;
- il permet de tester des hypothèses directionnelles sans présenter le résultat comme une prévision ;
- il ne qualifie jamais automatiquement une hausse de « spéculation » ;
- il ne se présente jamais comme un indice d'inflation.

## 2. Problème utilisateur et valeur recherchée

### Usagers potentiels

- ménages et consommateurs : comprendre si une espèce semble plus ou moins disponible localement et découvrir des alternatives ;
- restaurateurs, cantines et petits acheteurs : anticiper une tension d'approvisionnement à très court terme ;
- acteurs de marché : partager une lecture agrégée sans exposer leurs prix ou transactions privés ;
- médias, associations et société civile : accéder à une information sourcée plutôt qu'à une rumeur ;
- institutions : observer la qualité et la couverture des données, mais dans un espace décisionnel distinct du public.

### Bénéfices possibles

- réduire l'asymétrie d'information entre territoires et marchés ;
- rendre visibles la saisonnalité, la fraîcheur et les limites de la donnée ;
- aider le public à distinguer une indisponibilité locale d'une « disparition » d'espèce ;
- orienter vers des alternatives sans prescrire un achat ni imposer un prix ;
- faire remonter les besoins d'amélioration de la collecte.

### Qui décide et qui paie ?

Le public consulte, mais il paiera probablement peu ou pas pour ce service. Le payeur durable éventuel serait plutôt :

- une institution finançant une mission d'information et d'observation ;
- une collectivité ou un programme territorial ;
- un partenaire de filière finançant la collecte et la qualité des données ;
- éventuellement un acteur professionnel achetant une version approfondie et privée.

La valeur économique pour Mbàmbulaan est donc **indirecte et conditionnelle** : crédibilité, acquisition, données agrégées et porte d'entrée vers une offre institutionnelle ou professionnelle. Ce simulateur public ne constitue pas, seul, un modèle économique solide.

## 3. Clarification des concepts

### 3.1 Prix observé

Un prix constaté dans un lieu, pour une espèce, une forme de produit, une qualité, une unité et une période données.

Ce n'est ni un prix officiel, ni un prix conseillé, ni le prix payé par tous. Un prix au quai n'est pas comparable directement à un prix au détail.

### 3.2 Tendance de prix observée

Évolution d'un agrégat robuste d'observations comparables entre deux périodes. Elle doit toujours afficher : périmètre, échantillon, dates, méthode et niveau de couverture.

Ce n'est pas « l'inflation locale ». L'inflation est mesurée à partir d'un panier, d'une pondération et d'une méthode statistique dédiée. L'ANSD publie l'IHPC national ; Mbàmbulaan ne doit pas s'approprier ce vocabulaire.

### 3.3 Disponibilité commerciale locale

Présence observée d'une espèce dans un quai ou un marché pendant une période, au regard d'un nombre de points de collecte.

Ce n'est ni l'abondance en mer, ni la biomasse, ni la santé du stock. Une faible disponibilité peut provenir de la météo, d'une panne, d'un repos biologique, du transport, de la saisonnalité ou d'un déplacement des flux.

### 3.4 Rareté biologique / état du stock

Qualification scientifique reposant sur des campagnes, des données de capture et d'effort, des indices d'abondance et une évaluation par une autorité scientifique compétente.

Mbàmbulaan ne doit jamais déduire cet état de ses seules observations de marché. L'interface doit employer **« état scientifique du stock »** et afficher « non renseigné » lorsqu'aucune évaluation récente et applicable n'est disponible.

### 3.5 Tension de marché

Convergence documentée entre disponibilité observée, dispersion ou évolution des prix, demande et perturbations opérationnelles.

Une tension n'est pas une preuve de spéculation. La qualification de spéculation exige une investigation économique et, potentiellement, juridique qui dépasse un moteur automatique.

### 3.6 Scénario

Une hypothèse introduite par l'utilisateur — par exemple moins d'arrivages, transport perturbé ou capacité de froid réduite — produisant une **direction de pression plausible**, pas une prévision chiffrée.

## 4. Objets de données candidats R&D

Ces objets sont des candidats autonomes. Ils ne doivent pas être ajoutés à `src/domain` dans cette exploration.

### 4.1 `SpeciesReference`

**But** : normaliser les espèces, noms locaux et formes commerciales.

Champs :

- `id`, `canonicalCode` ;
- `commonNameFr`, `localNames[]`, `scientificName?` ;
- `commercialForms[]`: frais, congelé, fumé, séché, transformé ;
- `typicalUnits[]` ;
- `seasonalityNotes?` ;
- `referenceSource`, `lastVerifiedAt`.

Source : référentiel institutionnel ou scientifique, enrichissement validé par des acteurs terrain.

Réalité court terme : **forte pour un petit nombre d'espèces pilotes**, avec un travail indispensable sur les synonymes et formes de vente.

### 4.2 `ObservedPricePoint`

**But** : conserver une observation de prix contextualisée.

Champs :

- `id`, `speciesCode`, `territoryId`, `observationPointId` ;
- `marketStage`: `landing | wholesale | retail | processing` ;
- `productForm`, `qualityGrade?` ;
- `price`, `currency`, `unit`, `normalizedPricePerKg?` ;
- `observedAt`, `collectedAt` ;
- `sourceType`: `field_agent | partner | transaction_derived | official` ;
- `collectorRef?`, `evidenceRef?` ;
- `validationStatus`, `confidenceLevel`.

Source : enquête terrain structurée, partenaires de marché, données officielles ou agrégation de transactions consenties.

Réalité court terme : **moyenne**. La saisie est simple ; obtenir une série comparable, régulière et non biaisée est coûteux. Les prix privés et les transactions réelles restent interdits côté public.

### 4.3 `AvailabilityObservation`

**But** : enregistrer la présence commerciale observable d'une espèce.

Champs :

- `id`, `speciesCode`, `territoryId`, `observationPointId` ;
- `marketStage`, `observedAt` ;
- `availabilityBand`: `not_seen | low | usual | high | unknown` ;
- `observedVolumeKg?`, `lotCount?`, `vendorCount?` ;
- `observationWindow`, `sourceType` ;
- `validationStatus`, `confidenceLevel`.

Source : enquête quai/marché, lots consentis et agrégés, partenaires, éventuellement données publiques de débarquements.

Réalité court terme : **moyenne à forte pour une observation locale**, faible pour une couverture nationale ou temps réel.

### 4.4 `LandingAggregate`

**But** : consolider des débarquements par espèce, territoire et période sans exposer les lots.

Champs :

- `id`, `territoryId`, `landingSiteId?`, `speciesCode?` ;
- `periodStart`, `periodEnd` ;
- `landedVolumeKg`, `tripCount?`, `vesselCount?` ;
- `aggregationLevel`, `sourceType`, `sourceReference` ;
- `publicationLagDays`, `confidenceLevel`.

Source : DPM/Ministère, ANSD/AGRIDATA, collecte locale ou agrégation Mbàmbulaan autorisée.

Réalité court terme : **forte pour des historiques agrégés mais souvent tardifs et géographiquement larges** ; plus faible pour une donnée récente au quai.

### 4.5 `DataCoverageSnapshot`

**But** : empêcher qu'une courbe pauvre soit prise pour une tendance solide.

Champs :

- `id`, `territoryId`, `speciesCode?`, `period` ;
- `observationPointCount`, `observationCount`, `activeDayCount` ;
- `expectedPointCount?`, `coverageRate?` ;
- `missingDayCount`, `lastObservationAt` ;
- `representativeness`: `insufficient | partial | acceptable | strong` ;
- `knownBiases[]`.

Source : calcul dérivé du dispositif de collecte.

Réalité court terme : **forte et obligatoire**. Sans cet objet, aucun résultat public ne doit être publié.

### 4.6 `ObservedMarketTrend`

**But** : publier un agrégat explicable de prix ou de disponibilité.

Champs :

- `id`, `metric`: `price_band | availability | landed_volume` ;
- `territoryId`, `speciesCode`, `marketStage`, `period` ;
- `currentBand`, `comparisonBand?`, `direction`: `down | stable | up | unclear` ;
- `observationCount`, `methodVersion` ;
- `coverageSnapshotId`, `confidenceLevel` ;
- `publicationStatus`, `generatedAt`.

Source : calcul robuste sur observations validées et comparables.

Réalité court terme : **moyenne**. Ne publier que si des seuils de couverture préalablement définis sont atteints. La médiane et un intervalle sont préférables à une moyenne isolée.

### 4.7 `ScientificStockAssessment`

**But** : référencer une qualification scientifique sans la recalculer.

Champs :

- `id`, `speciesCode`, `stockGeography` ;
- `assessmentStatus`, `assessmentMethod` ;
- `assessmentPeriod`, `publishedAt` ;
- `authority`, `sourceReference` ;
- `applicabilityNotes`, `freshnessStatus`.

Source : CRODT/ISRA, groupes scientifiques compétents, FAO/COPACE ou autre autorité reconnue.

Réalité court terme : **faible à moyenne selon l'espèce et la fraîcheur des évaluations**. L'immobilisation annoncée du navire de recherche *Itaf Dème* depuis novembre 2022 a affecté les campagnes océanographiques ; une donnée de marché ne peut pas combler ce manque scientifique.

### 4.8 `MarketContextEvent`

**But** : documenter des facteurs pouvant éclairer une variation sans prétendre en prouver la cause.

Champs :

- `id`, `territoryId?`, `speciesCode?` ;
- `type`: `weather | closure | transport | cold_capacity | fuel | festival | regulation | other` ;
- `periodStart`, `periodEnd`, `description` ;
- `sourceType`, `sourceReference`, `confidenceLevel`.

Source : services compétents, partenaires, Mbàmbulaan, données météo ou réglementation officielle.

Réalité court terme : **moyenne**. L'événement peut être affiché comme contexte, jamais comme causalité automatique.

### 4.9 `ScenarioAssumption`

**But** : formaliser une hypothèse manipulée dans l'explorateur.

Champs :

- `id`, `scenarioRunId` ;
- `factor`: `arrivals | demand | transport | cold_capacity | fuel_cost` ;
- `direction`: `decrease | stable | increase` ;
- `intensityBand`: `light | moderate | strong` ;
- `userProvided`, `explanation`.

Source : saisie de l'utilisateur ou scénario pédagogique prédéfini.

Réalité court terme : **forte**, à condition de ne pas confondre hypothèse et donnée observée.

### 4.10 `ScenarioResult`

**But** : restituer des conséquences directionnelles et leurs limites.

Champs :

- `id`, `scenarioRunId`, `speciesCode`, `territoryId` ;
- `availabilityPressure`: `lower | unchanged | higher | indeterminate` ;
- `pricePressure`: `lower | unchanged | higher | indeterminate` ;
- `confidenceLevel`, `ruleVersion` ;
- `reasoningFactors[]`, `limitations[]` ;
- `generatedAt`.

Source : règles pédagogiques explicables ; aucun modèle prédictif opaque dans la phase R&D.

Réalité court terme : **forte comme outil pédagogique**, nulle comme prévision fiable tant que le modèle n'est pas calibré et évalué sur des historiques suffisants.

### 4.11 `MarketAnomalyReview`

**But** : qualifier humainement un écart inhabituel sans accuser un acteur.

Champs :

- `id`, `trendId`, `anomalyType` ;
- `status`: `detected | under_review | explained | unresolved | dismissed` ;
- `supportingContextIds[]`, `reviewerRole` ;
- `publicWording?`, `reviewedAt?`.

Source : détection statistique simple puis revue humaine.

Réalité court terme : **moyenne en interne**. Côté public, parler d'« écart à documenter », jamais de spéculation automatique.

## 5. Sources réellement mobilisables

| Source | Apport réaliste | Limite principale | Usage public recommandé |
| --- | --- | --- | --- |
| Collecte Mbàmbulaan aux quais et marchés | Prix et disponibilité récents, contexte local | Biais d'échantillonnage, coût de collecte, déclaratif | Agrégats avec couverture et délai |
| Lots/transactions Mbàmbulaan consentis | Prix, volumes, fréquence | Données privées, échantillon non représentatif | Jamais en brut ; agrégation minimale |
| DPM / Ministère et AGRIDATA-ANSD | Débarquements, pirogues, séries agrégées | Délai, granularité régionale, nomenclatures | Contexte historique sourcé |
| ANSD — IHPC | Mesure officielle de l'évolution générale des prix | National, panier et méthode distincts | Lien de référence ; ne pas recalculer |
| CRODT/ISRA et FAO/COPACE | Évaluations de stocks et connaissance scientifique | Périodicité, périmètre du stock, fraîcheur variable | Statut daté, sourcé et séparé |
| Partenaires professionnels | Signaux de marché, ruptures, transport | Intérêt propre, formats hétérogènes | Contexte après validation |
| Contribution du grand public | Signal faible et couverture potentielle | Manipulation, doublons, unités, qualité | Pas dans le pilote sans dispositif antifraude |

### Références officielles vérifiées le 12 août 2026

- ANSD, **Indice harmonisé des prix à la consommation, base 100 en 2023** : méthode et série officielle nationale. <https://www.ansd.sn/Indicateur/indice-harmonise-des-prix-la-consommation-ihpc-base-100-en-2023>
- ANSD/AGRIDATA, **catalogue des jeux de données pêche** : débarquements artisanaux, pirogues et autres séries agrégées. <https://agridata.ansd.sn/dataset/?groups=peche&organization=ministeredespeches>
- ANSD, **Recensement national des unités de pêche artisanale 2025** : collecte face-à-face sur les sites de débarquement. <https://www.ansd.sn/mademba/recensement-national-des-unites-de-peche-artisanale>
- ANSD/ANADS, **métadonnées du recensement de la pêche artisanale maritime** : effort, capture et recensement, avec enquêtes quotidiennes historiquement concentrées sur huit sites majeurs. <https://anads.ansd.sn/index.php/catalog/77>
- ISRA/CRODT, **rôle des campagnes d'évaluation des stocks** et impact de l'immobilisation de l'*Itaf Dème*. <https://isra.sn/2026/05/19/le-secretaire-general-du-ministere-des-peches-et-de-leconomie-maritime-visite-le-navire-de-recherche-itaf-deme-une-volonte-affichee-de-rehabiliter-l/>

## 6. Méthode minimale de publication

### Règles de comparabilité

Une observation n'est comparable que si l'espèce, la forme, la qualité, l'unité, le stade de marché, le territoire et la fenêtre temporelle sont compatibles.

### Seuils à définir avant pilote

- nombre minimum d'observations par espèce, territoire et période ;
- nombre minimum de points de collecte indépendants ;
- nombre de jours actifs dans la période ;
- seuil de concentration maximale d'une seule source ;
- règle d'agrégation protégeant les prix et transactions privés ;
- durée maximale avant qu'une donnée soit qualifiée d'ancienne.

La présente R&D ne fixe pas artificiellement ces seuils. Ils doivent être calibrés sur un pilote et validés avec un statisticien ou l'institution partenaire.

### Restitution publique

Afficher en permanence :

- « observations », jamais « vérité du marché » ;
- une fourchette ou catégorie, pas un faux chiffre universel ;
- le nombre d'observations et de lieux ;
- la date de dernière collecte ;
- la couverture : insuffisante, partielle, acceptable ou forte ;
- la distinction `OBSERVÉ`, `SCÉNARIO` et `SOURCE SCIENTIFIQUE` ;
- les facteurs contextuels possibles sans causalité affirmée.

## 7. Moteur de scénario R&D

### Entrées autorisées

- arrivages : baisse / stables / hausse ;
- demande : baisse / stable / hausse ;
- transport : normal / perturbé ;
- capacité de froid : disponible / sous tension ;
- intensité de l'hypothèse : légère / modérée / forte.

### Sorties autorisées

- pression plausible sur disponibilité : baisse, stable, hausse, indéterminée ;
- pression plausible sur les prix : baisse, stable, hausse, indéterminée ;
- facteurs ayant conduit au résultat ;
- limites et données manquantes.

### Sorties interdites à ce stade

- « le prix sera de X FCFA » ;
- probabilité chiffrée non calibrée ;
- inflation prévue ;
- accusation ou probabilité de spéculation ;
- diagnostic de raréfaction biologique ;
- recommandation d'achat ou de vente susceptible de manipuler le marché.

## 8. Risques et garde-fous

### Manipulation et jeu stratégique

Un acteur peut déclarer une fausse pénurie ou un faux prix pour influencer le marché. Réponses : sources multiples, plafonnement du poids d'une source, délai de publication, détection d'anomalie et revue humaine.

### Effet autoréalisateur

Une alerte publique de pénurie peut provoquer achats anticipés et hausse. Réponse : langage sobre, catégories larges, pas d'alerte spectaculaire, alternatives et contexte.

### Exposition économique

Un agrégat trop fin peut révéler la stratégie d'un vendeur ou d'un quai. Réponse : seuil minimal, agrégation territoriale et temporelle, suppression des petits échantillons.

### Confusion entre marché et ressource

Une espèce absente un jour n'est pas nécessairement rare en mer. Réponse : séparation visuelle stricte et état scientifique « non renseigné » par défaut.

### Faux rôle institutionnel

Présenter Mbàmbulaan comme producteur d'inflation ou arbitre des prix fragilise sa crédibilité. Réponse : citer l'ANSD pour l'inflation officielle et positionner Mbàmbulaan sur l'observation sectorielle territoriale.

### Risque réputationnel sur la spéculation

Une hausse peut résulter de la météo, du carburant, de la qualité, de la demande ou du transport. Réponse : aucune qualification automatique de comportement ; seulement un écart à documenter.

## 9. Proposition de maquette R&D

La maquette doit montrer un écran public autonome composé de :

1. une promesse prudente : **« Comprendre ce qui est observé, tester ce qui pourrait changer »** ;
2. un sélecteur territoire / espèce ;
3. une carte de disponibilité commerciale locale ;
4. une tendance de prix simulée avec couverture explicite ;
5. un bloc séparé « état scientifique du stock » affiché comme non déduit du marché ;
6. un explorateur de scénario avec hypothèses qualitatives ;
7. un résultat directionnel expliqué, jamais une prévision ;
8. une méthode visible et un avertissement contre les interprétations abusives.

Toutes les valeurs de la maquette sont simulées et doivent porter cette mention.

## 10. Avis CPO — faut-il construire maintenant ?

### Non à la version proposée initialement

Je recommande de **ne pas lancer maintenant un simulateur national public « anti-inflation et anti-spéculation »**.

Raisons :

- la promesse dépasse les données disponibles ;
- le mot « rareté » confond marché et biologie ;
- le mot « inflation » empiète sur une statistique officielle ;
- le mot « spéculation » crée un risque accusatoire ;
- les données publiques trop fraîches et trop fines peuvent perturber le marché ;
- aucun payeur durable n'est encore démontré ;
- le coût principal n'est pas l'interface mais la collecte, la normalisation et la gouvernance.

### Oui à un pilote plus étroit, plus tard

Un pilote peut avoir une vraie valeur si les fronts Produit/Public prioritaires sont stabilisés et si un partenaire data est engagé :

- deux territoires maximum ;
- trois espèces fréquentes et bien identifiées ;
- un seul stade de marché par série ;
- collecte hebdomadaire pendant au moins huit à douze semaines ;
- publication en fourchettes et niveaux de disponibilité ;
- couverture et sources visibles ;
- aucun diagnostic de stock sans source scientifique ;
- aucun discours de lutte contre la spéculation ;
- revue statistique et métier avant ouverture publique.

### Formulation commerciale défendable

> Mbàmbulaan rend lisibles des observations territoriales de prix et de disponibilité, explique leur couverture et permet d'explorer des scénarios sans les confondre avec une prévision ou une statistique officielle.

### Test de décision avant tout futur lot

Ne démarrer un lot d'implémentation que si les réponses suivantes sont positives :

1. Qui finance durablement la collecte et la validation ?
2. Avons-nous des observations comparables et suffisamment couvertes ?
3. Un statisticien ou partenaire institutionnel valide-t-il la méthode ?
4. Les règles d'agrégation protègent-elles les acteurs ?
5. La valeur produite conduit-elle à une décision ou un comportement utile ?
6. Le service renforce-t-il la coordination plutôt qu'une simple curiosité data ?

À défaut, cette exploration doit rester une référence R&D et ne pas devenir un chantier Produit.
