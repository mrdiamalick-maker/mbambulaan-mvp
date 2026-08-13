# Vision V2 — Tour de contrôle institutionnelle

> Statut : exploration R&D jetable. Ne constitue pas une spécification de production.
> Branche : `codex/rd-exploration` uniquement.
> Interdits : aucune modification du modèle métier existant, des permissions, ni des pages stabilisées Lots 0 à 7. Aucun déploiement.

## 1. Thèse produit

La Tour de contrôle institutionnelle ne doit pas devenir un tableau de bord de plus. Elle doit enrichir la chaîne Mbàmbulaan déjà établie : **signal → lecture territoriale → situation → décision → preuve**.

La valeur institutionnelle est de répondre à quatre questions :

1. Où faut-il regarder maintenant ?
2. Pourquoi ce territoire devient-il prioritaire ?
3. Quelle décision publique est attendue ?
4. Avec quel niveau de confiance dans la donnée ?

Le prototype ci-dessous reste délibérément séparé du domaine actuel. Les objets décrits sont des **candidats V2** et non des demandes d'évolution immédiate de `src/domain/types.ts`.

## 2. Ancrage dans le domaine existant

Objets réellement présents aujourd'hui et exploitables conceptuellement :

- `Territory` : territoire de rattachement.
- `LandingSite` : quai/site de débarquement rattaché à un territoire.
- `Vessel` : embarcation avec numéro d'immatriculation et quai de rattachement.
- `Tension` : signal opérationnel structuré, avec sévérité et territoire.
- `Commitment` : action/engagement lié à une tension.
- `Outcome` : résultat et preuve de valeur.

Le mandat parle aussi de `Signal`, `Situation`, `Decision`. Ces trois concepts doivent être traités comme **couches sémantiques de coordination** à relier au domaine existant, pas ajoutés brutalement au modèle sans cadrage ultérieur.

## 3. Objets candidats V2

### 3.1 `TerritoryHealthSnapshot`

**But** : produire une fiche de santé datée d'un territoire ou d'un quai.

Champs proposés :

- `id`
- `territoryId`
- `landingSiteId?`
- `periodStart`, `periodEnd`
- `activeVesselCount`
- `registeredVesselCount`
- `registrationCoverageRate?`
- `openIncidentCount`
- `criticalIncidentCount`
- `operationalCapacityScore?`
- `resilienceScore?`
- `pressureScore?`
- `dataFreshnessScore`
- `confidenceLevel`
- `generatedAt`

Relations : `Territory` 1→N snapshots ; éventuellement `LandingSite` 1→N snapshots ; agrège `Vessel`, incidents/signaux et capacités.

Source : mixte.

- Comptage embarcations : registre officiel + déclaratif local + données Mbàmbulaan.
- Incidents : déclaratif terrain / services déconcentrés / objets Mbàmbulaan.
- Scores : calcul dérivé, avec formule explicable.

Réalité court terme : **partiellement réaliste**. On peut fiabiliser rapidement les incidents, la disponibilité des infrastructures et les embarcations connues dans Mbàmbulaan. Le taux de couverture d'immatriculation ne devient crédible que si une source officielle est obtenue.

### 3.2 `RegistrationRecord`

**But** : séparer l'identité d'une embarcation de son statut administratif observable.

Champs proposés :

- `id`
- `vesselId`
- `registrationNumber`
- `registrationStatus`: `valid | expired | pending | unknown | disputed`
- `issuingAuthority?`
- `issuedAt?`
- `expiresAt?`
- `lastVerifiedAt?`
- `sourceType`: `official | declared | imported | derived`
- `sourceReference?`
- `confidenceLevel`

Relations : N→1 `Vessel`; alimente `TerritoryHealthSnapshot` et les situations de conformité.

Source : idéalement registre officiel ; à défaut import ponctuel / vérification terrain.

Réalité court terme : **démonstratif tant que l'accès au registre officiel n'est pas sécurisé**. Éviter toute promesse de contrôle réglementaire exhaustif.

### 3.3 `TerritoryIncident`

**But** : couvrir l'incident territorial au-delà des seules tensions opérationnelles de chaîne du froid.

Champs proposés :

- `id`
- `territoryId`
- `landingSiteId?`
- `type`: `safety | infrastructure | conflict | environmental | market | compliance | other`
- `severity`
- `status`
- `occurredAt`
- `reportedAt`
- `reportedByActorId?`
- `description`
- `relatedSignalIds[]`
- `relatedSituationId?`
- `evidenceRefs[]`
- `confidenceLevel`

Relations : `Territory`, `LandingSite`, couche `Signal`, couche `Situation`.

Source : déclaratif terrain, services locaux, partenaires, puis confirmation institutionnelle.

Réalité court terme : **forte**. C'est une extension naturelle des remontées terrain et très utile en rendez-vous ministère.

### 3.4 `ResilienceAssessment`

**But** : mesurer la capacité d'un territoire à absorber un choc et maintenir les opérations essentielles.

Champs proposés :

- `id`
- `territoryId`
- `period`
- `coldCapacityScore`
- `transportContinuityScore`
- `infrastructureAvailabilityScore`
- `responseTimeScore`
- `actorCoordinationScore`
- `overallScore`
- `methodVersion`
- `evidenceCoverage`
- `confidenceLevel`

Relations : dérive de capacités, incidents, engagements et résultats.

Source : calcul dérivé à partir de données Mbàmbulaan + inventaires institutionnels.

Réalité court terme : **réaliste en indice transparent**, pas en vérité scientifique. Il faut l'appeler « indice de résilience opérationnelle » et montrer sa formule.

### 3.5 `FishingPressureIndicator`

**But** : signaler une pression anormale potentielle sur une zone ou une espèce.

Champs proposés :

- `id`
- `territoryId`
- `speciesCode?`
- `period`
- `observedLandingKg?`
- `vesselActivityIndex?`
- `historicalBaseline?`
- `pressureLevel`: `normal | elevated | high | unknown`
- `method`
- `confidenceLevel`

Relations : `Territory`; potentiellement lots/débarquements agrégés ; alimente `Situation`.

Source : calcul dérivé depuis débarquements, effort de pêche, saisonnalité et référentiels scientifiques.

Réalité court terme : **faible à moyenne**. Sans données d'effort de pêche robustes et baseline scientifique, il faut éviter le vocabulaire « sur-exploitation ». Présenter plutôt « pression observée / anomalie d'activité ».

### 3.6 `SpeciesWatch`

**But** : vigilance sur espèces protégées, menacées ou soumises à restriction.

Champs proposés :

- `id`
- `speciesCode`
- `commonName`
- `scientificName?`
- `regulatoryStatus`
- `restrictionType?`
- `restrictionStart?`
- `restrictionEnd?`
- `sourceAuthority`
- `sourceReference`
- `lastUpdatedAt`

Relation : référentiel lié aux lots/débarquements/signaux via `speciesCode`.

Source : **officielle uniquement** pour le statut réglementaire ; éventuellement référentiels scientifiques externes pour enrichissement.

Réalité court terme : **forte si la source réglementaire est accessible et maintenue**. Très démontrable sans prétendre faire de détection automatique.

### 3.7 `ComplianceObservation`

**But** : enregistrer une observation de non-conformité potentielle sans se substituer au contrôle légal.

Champs proposés :

- `id`
- `territoryId`
- `landingSiteId?`
- `vesselId?`
- `observationType`: `registration | license | closed_period | protected_species | gear | traceability | other`
- `severity`
- `observedAt`
- `sourceType`
- `sourceReference?`
- `status`: `unverified | under_review | confirmed | dismissed`
- `confidenceLevel`

Relations : `Territory`, `Vessel`, `Signal`, `Situation`.

Source : observation terrain, agents habilités, croisement de données.

Réalité court terme : **réaliste comme dossier d'observation**, pas comme « indice de pêche illégale » automatique.

### 3.8 `IllegalFishingRiskSignal`

**But** : produire un niveau de vigilance à investiguer, jamais une accusation.

Champs proposés :

- `id`
- `territoryId`
- `period`
- `riskLevel`
- `triggerTypes[]`
- `supportingObservationIds[]`
- `methodVersion`
- `confidenceLevel`
- `reviewStatus`

Source : calcul dérivé de `ComplianceObservation`, incohérences d'immatriculation, activité hors période, espèces réglementées, etc.

Réalité court terme : **à ne pas vendre comme capacité mature**. Risque juridique, politique et réputationnel élevé. À réserver à une exploration conjointe avec l'administration compétente.

### 3.9 `LocalPriceObservation`

**But** : suivre prix locaux de référence sans construire un indice macroéconomique artificiel.

Champs proposés :

- `id`
- `territoryId`
- `landingSiteId?`
- `speciesCode?`
- `productCategory`
- `pricePerUnit`
- `unit`
- `currency`
- `observedAt`
- `sourceType`
- `sampleSize?`
- `confidenceLevel`

Relations : territoire/quai ; agrégation possible avec lots et besoins marché.

Source : prix déclarés, transactions observées, enquête terrain, données partenaires.

Réalité court terme : **forte pour une tendance locale**, faible pour « inflation locale » au sens statistique. Préférer « évolution des prix observés ».

### 3.10 `InformalityEstimate`

**But** : estimer la part d'activité non enregistrée dans un périmètre donné.

Champs proposés :

- `id`
- `territoryId`
- `period`
- `metric`: `vessels | actors | landings | transactions`
- `estimatedShare`
- `method`
- `sampleSize?`
- `confidenceInterval?`
- `confidenceLevel`

Source : enquête, comparaison registre/terrain, étude statistique.

Réalité court terme : **faible**. Ne pas afficher un pourcentage précis sans méthodologie institutionnelle validée. À court terme, afficher plutôt « couverture d'enregistrement connue ».

### 3.11 `LicenseStatusRecord`

**But** : suivre le statut d'une licence/autorisation si l'autorité fournit la donnée.

Champs proposés :

- `id`
- `vesselId?`
- `actorId?`
- `licenseType`
- `licenseNumber?`
- `status`: `valid | expired | suspended | pending | unknown`
- `issuedAt?`
- `expiresAt?`
- `authority`
- `lastVerifiedAt`
- `sourceReference?`
- `confidenceLevel`

Source : registre officiel.

Réalité court terme : **démonstratif sans partenariat de données**.

## 4. Couches `Signal`, `Situation`, `Decision`

### Signal

Un fait atomique : incident, variation de prix, immatriculation expirée, rupture de glace, apparition d'une espèce réglementée, etc.

Minimum : `id`, `type`, `territoryId`, `occurredAt`, `severity`, `source`, `confidenceLevel`, `relatedEntityRefs`.

### Situation

Une interprétation agrégée et datée de plusieurs signaux qui nécessite une lecture humaine.

Minimum : `id`, `territoryId`, `title`, `status`, `priority`, `signalIds`, `assessment`, `confidenceLevel`, `recommendedDecisionType`, `updatedAt`.

### Decision

Un arbitrage institutionnel associé à une situation : demander vérification, mobiliser capacité, lancer contrôle, prioriser maintenance, solliciter programme, etc.

Minimum : `id`, `situationId`, `decisionType`, `owner`, `status`, `dueAt`, `rationale`, `evidenceRefs`, `outcomeId?`.

**Règle decision-first** : la Tour de contrôle doit afficher d'abord les situations qui exigent une décision, puis permettre de descendre vers les métriques qui expliquent pourquoi.

## 5. Provenance et fiabilité

Toute donnée V2 devrait porter quatre métadonnées transverses :

- `sourceType`: officiel / déclaratif / partenaire / calcul dérivé ;
- `sourceReference` ;
- `observedAt` ou `period` ;
- `confidenceLevel`.

Sans ces métadonnées, une « tour de contrôle » deviendrait plus dangereuse qu'utile, car elle donnerait une apparence de certitude à des données hétérogènes.

## 6. Ce qui est réellement alimentable

### Alimentable tôt

- incidents terrain ;
- disponibilité / indisponibilité des infrastructures et capacités ;
- embarcations déjà enregistrées dans Mbàmbulaan ;
- signaux opérationnels ;
- prix observés localement ;
- décisions, engagements, délais, preuves ;
- fiches territoire avec fraîcheur et niveau de confiance.

### Alimentable avec partenariat de données

- statut officiel des immatriculations ;
- licences ;
- périodes de fermeture / restrictions ;
- référentiel réglementaire espèces ;
- historiques territoriaux fiables.

### Longtemps démonstratif ou méthodologiquement fragile

- taux de sur-exploitation ;
- « sur-population » de pêcheurs/pirogues ;
- indice automatique de pêche illégale ;
- part de l'informel en pourcentage précis ;
- inflation locale au sens statistique.

## 7. Avis CPO — priorité ministère

### À montrer en priorité lors d'une rencontre

1. **Fiche santé territoire/quai** : excellente porte d'entrée car elle transforme des données dispersées en une lecture opérationnelle.
2. **Incidents + résilience opérationnelle** : directement raccordés aux capacités Mbàmbulaan et au scénario chaîne du froid.
3. **Conformité administrative observable** : immatriculations/licences avec statut de source clairement affiché.
4. **Vigilance espèces réglementées** : forte valeur publique si basée sur un référentiel officiel.
5. **Évolution des prix observés** : utile pour comprendre les tensions économiques locales.
6. **File de situations à arbitrer** : la plus importante. C'est elle qui matérialise la promesse « decision-first ».

### À challenger / repousser

- **Sur-exploitation** : trop scientifique pour être déduite proprement des seules données de plateforme.
- **Sur-population** : terme mal défini et politiquement maladroit. Remplacer par « densité d'activité / pression sur capacité locale ».
- **Indice de pêche illégale** : forte sensibilité juridique. Montrer des « observations de conformité à vérifier », pas un score accusatoire.
- **Part de l'informel** : peut devenir un chantier statistique national. Ce n'est pas un bon sujet pour prouver la valeur du produit maintenant.
- **Inflation locale** : Mbàmbulaan peut montrer une tendance de prix sectorielle, pas produire un indicateur macroéconomique crédible sans dispositif statistique dédié.

## 8. Hypothèse commerciale

Le ministère ne paiera pas durablement pour « plus d'indicateurs ». Il peut payer pour une infrastructure qui réduit le temps entre **remontée terrain, qualification, arbitrage, coordination et preuve d'exécution**.

La Tour de contrôle V2 doit donc être vendue comme une **capacité de supervision territoriale orientée décision**, pas comme un observatoire statistique exhaustif.

## 9. Trajectoire de légitimité des données

La légitimité de la Tour de contrôle ne dépend pas d'un partenariat de données national unique à obtenir avant de commencer. Elle doit se construire progressivement par la **densité, la continuité, la provenance et le croisement** des observations.

`Mbàmbulaan Terrain` constitue la première source réelle et continue : incidents, capacités, disponibilités, observations locales, décisions et preuves d'exécution. Cette base doit ensuite s'élargir à toute voie pertinente et licite au fil de la crédibilité acquise : acteurs de la filière, partenaires, déclaratif structuré, imports, sources ouvertes, recherche et institutions.

Chaque canal conserve son niveau de preuve ; une remontée Terrain ne devient pas une statistique officielle par accumulation. La valeur vient de la capacité à documenter l'origine, la fraîcheur, la couverture, les contradictions et les validations successives, puis à renforcer progressivement les observations par recoupement.

La trajectoire de fond est de faire de Mbàmbulaan une **infrastructure de confiance et un digital twin progressif de l'économie maritime**, en commençant par la filière halieutique. Cette ambition ne justifie toutefois aucun raccourci méthodologique : le niveau de promesse affiché doit toujours rester inférieur ou égal au niveau de preuve réellement acquis.

## 10. Vision KPI — indicateurs illustratifs et financement des programmes

### 10.1 Décision de conception

La Vision KPI ne doit pas transformer la Tour de contrôle en catalogue de chiffres. Elle doit montrer, dans cet ordre :

1. ce qui nécessite une décision ;
2. ce qui est effectivement exécuté ;
3. ce qui est prouvé ;
4. quels besoins peuvent devenir des programmes ;
5. quels financements restent à structurer, instruire ou suivre.

Les KPI sont donc des **portes d'entrée vers des dossiers traçables**, jamais une fin en soi. Un clic doit toujours conduire aux situations, engagements, preuves, programmes ou financements qui composent l'indicateur.

### 10.2 Périmètre de démonstration

Les valeurs proposées ci-dessous sont exclusivement des **valeurs illustratives de maquette**. Elles ne proviennent ni d'une collecte réelle, ni d'une consolidation nationale, ni d'un ministère ou d'un partenaire financier.

Le futur rendu visuel devra afficher en permanence :

> Données simulées — exemple de fonctionnement, pas bilan réel de la filière.

Chaque carte conserve quatre informations : période, périmètre, source et niveau de confiance. Une valeur sans dénominateur ou sans dossier sous-jacent ne doit pas être affichée.

### 10.3 Six indicateurs de tête maximum

Exemple de photographie de démonstration sur six territoires et trente jours :

| Indicateur affiché | Valeur illustrative | Construction attendue | Décision rendue possible | Limite visible |
|---|---:|---|---|---|
| **Situations nécessitant une décision** | `4` | situations de priorité haute ou critique sans décision exécutée | arbitrer, affecter un responsable ou escalader | ne mesure pas la gravité nationale de la filière |
| **Engagements à risque d'échéance** | `3 sur 14` | engagements ouverts dont l'échéance est dépassée ou proche | relancer, réaffecter ou lever un blocage | le taux dépend du périmètre de démonstration |
| **Résultats accompagnés d'une preuve** | `5 sur 8` | résultats reliés à au moins une preuve recevable | demander un complément ou valider un résultat | présence d'une pièce ne signifie pas validation de son contenu |
| **Données suffisamment fiables pour décider** | `13 sur 19 (68 %)` | objets utiles à la décision en `rapprochee`, `documentee`, `verifiee` ou `officielle` / objets évalués | cibler les vérifications avant arbitrage | formule et dénominateur obligatoires ; valeur simulée |
| **Besoins transformés en programme** | `1 sur 4` | besoins qualifiés reliés à une initiative en `cadrage` | constituer le dossier, regrouper ou différer | un programme créé n'est pas encore finançable |
| **Financements confirmés** | `0` | financements avec engagement explicite d'un partenaire habilité | ne rien annoncer ; poursuivre le cadrage | zéro est volontaire : aucun bailleur fictif dans la démonstration |

Ces six cartes suffisent pour l'ouverture. Les prix, espèces, immatriculations, incidents ou capacités apparaissent ensuite comme **lectures explicatives** et non comme une deuxième rangée de KPI concurrents.

### 10.4 Indicateurs détaillés par famille

#### Coordination et exécution

- signaux reçus par territoire et canal, avec part issue d'un relais humain ;
- délai médian entre signal et qualification ;
- situations par priorité et statut ;
- décisions prises, en attente et réexaminées ;
- engagements à faire, en cours, bloqués et terminés ;
- délai entre décision et première action ;
- résultats confirmés par l'acteur bénéficiaire.

#### Preuve et confiance

- engagements disposant d'une preuve reliée ;
- résultats avec preuve `documentee` ou `verifiee` ;
- répartition des objets par niveau de confiance ;
- données à actualiser ou expirées ;
- contradictions ouvertes entre déclaratif, terrain, partenaire et source officielle ;
- apprentissages réutilisés dans un autre territoire.

#### Territoires et services essentiels

- territoires couverts par une remontée récente ;
- incidents ouverts et délai de traitement ;
- infrastructures disponibles, fragiles ou indisponibles ;
- capacités réellement mobilisables, sans confondre capacité théorique et disponibilité ;
- dossiers administratifs déclarés, rapprochés et officiellement confirmés.

Ces indicateurs restent subordonnés aux règles de la section 6 : Mbàmbulaan peut agréger ce qu'il observe, mais ne doit pas extrapoler une couverture nationale qu'il ne possède pas.

### 10.5 Lecture Programme → Financement

Pour un ministère ou un partenaire technique et financier, la valeur n'est pas « voir un montant total ». Elle est de comprendre **où se trouve chaque dossier, pourquoi il est bloqué et quelles preuves manquent**.

Le parcours recommandé est :

```text
Besoin remonté
  → besoin qualifié
  → programme en cadrage
  → dossier techniquement complet
  → financement à rechercher
  → financement en instruction
  → financement confirmé
  → décaissement suivi
  → exécution et résultats prouvés
```

Les statuts du besoin, du programme et du financement restent distincts. « Besoin prioritaire », « programme structuré » et « financement confirmé » ne sont jamais interchangeables.

#### Indicateurs de portefeuille finançable

| Indicateur | Question métier | Règle de calcul / prudence |
|---|---|---|
| Besoins qualifiés sans programme | quels besoins restent à structurer ? | compter uniquement les besoins ayant passé la qualification |
| Programmes en cadrage | quels dossiers ont un responsable et un objectif ? | ne pas les appeler « financés » ou « éligibles » |
| Dossiers techniquement complets | quels dossiers peuvent être présentés pour instruction ? | exiger périmètre, bénéficiaires, gouvernance, maintenance, budget et preuves attendues |
| Budget à estimer | quels programmes ne peuvent pas encore exprimer un besoin financier fiable ? | afficher « à estimer », jamais `0 FCFA` comme montant réel |
| Montant demandé | quelle enveloppe a été formellement sollicitée ? | séparer demande, validation, engagement et décaissement |
| Montant confirmé | quel financement possède un engagement explicite ? | aucun partenaire ou montant fictif |
| Écart de financement | que reste-t-il à mobiliser ? | calculer uniquement si budget validé et financement confirmé sont comparables |
| Décaissement lié aux jalons | les fonds suivent-ils l'exécution prévue ? | relier chaque tranche à un jalon et à ses preuves |
| Exécution physique / financière | l'activité et la dépense progressent-elles ensemble ? | ne pas déduire l'impact du seul taux de consommation budgétaire |
| Bénéficiaires vérifiés | qui bénéficie réellement du programme ? | distinguer déclarés, confirmés et servis |
| Résultats prouvés | quels effets sont documentés ? | résultat, source, période, confiance et limite obligatoires |

### 10.6 Exemple Lompoul — balises de géolocalisation

Le cas Lompoul illustre la discipline attendue :

| Élément | Valeur de démonstration | Statut honnête |
|---|---|---|
| Besoin | balises de géolocalisation pour la sécurité en mer | `documentee` après confirmations et fiche d'exigences |
| Bénéficiaires | 25 pirogues déclarées | à confirmer nominativement |
| Programme | périmètre pilote Lompoul | `cadrage` |
| Budget | non chiffré | à estimer |
| Prestataire | aucun | non sélectionné |
| Financement | aucun | à rechercher |
| Preuves préalables | liste volontaire, gouvernance, note technique, maintenance | dossier en constitution |
| Impact sécurité | non mesuré | aucune promesse de réduction d'accidents |

La carte de synthèse peut donc dire **« 1 programme en cadrage — financement à rechercher »**. Elle ne peut pas dire « 25 pirogues bientôt équipées ».

### 10.7 Valeur pour les partenaires techniques et financiers

Mbàmbulaan peut rendre un programme plus lisible et plus gouvernable pour un partenaire en apportant :

- une remontée structurée des besoins depuis les quais, y compris par relais humain ;
- une provenance et un niveau de confiance visibles ;
- un pipeline comparable de besoins, programmes et financements ;
- des responsabilités, échéances et blocages explicites ;
- des preuves reliées aux engagements et aux jalons ;
- un suivi territorial des bénéficiaires, de l'exécution et des résultats ;
- des exports de reporting construits depuis les mêmes dossiers, sans ressaisie parallèle.

Cette valeur peut faciliter l'instruction, le suivi et la redevabilité. Elle ne garantit ni l'éligibilité d'un programme, ni l'accord d'un bailleur, ni l'impact du financement.

### 10.8 Angle économique pour Mbàmbulaan

L'angle bailleurs ne doit pas transformer Mbàmbulaan en cabinet produisant des tableaux sur mesure. Le produit reste une infrastructure commune de coordination et de preuve.

Trois revenus futurs sont cohérents :

1. abonnement institutionnel pour piloter territoires, programmes et preuves ;
2. financement de la mise en place et de la collecte Terrain dans le budget d'un programme ;
3. service de suivi et reporting destiné à l'autorité porteuse et à ses partenaires, adossé aux données réellement collectées.

La dépendance à un partenaire unique serait un risque. La plateforme doit pouvoir accueillir progressivement plusieurs programmes et partenaires avec la même méthode, les mêmes règles de confiance et des droits d'accès séparés.

### 10.9 Règles de présentation pour la suite visuelle

- six KPI maximum au premier écran ;
- une phrase de situation avant les cartes ;
- chaque carte ouvre les dossiers qui expliquent sa valeur ;
- afficher numérateur et dénominateur pour tout taux ;
- séparer budget estimé, demandé, confirmé, décaissé et dépensé ;
- afficher « non calculable » plutôt qu'un faux zéro ;
- utiliser le libellé **illustratif / simulé** sur chaque vue de démonstration ;
- ne citer aucun partenaire comme intéressé ou engagé sans preuve explicite ;
- ne jamais déduire un impact d'un financement consommé ;
- conserver la hiérarchie : décision → exécution → preuve → financement.

### 10.10 Avis final

Cette Vision KPI a une vraie valeur à court terme **comme langage de démonstration et cadre de futurs programmes**, parce qu'elle relie le terrain, l'action publique, les preuves et le financement. Elle serait prématurée comme tableau national de performance réelle tant que la collecte, les référentiels et les règles de calcul ne sont pas déployés.

La promesse défendable est donc :

> Mbàmbulaan aide à transformer des besoins territoriaux documentés en décisions, programmes et dossiers de financement suivis jusqu'aux preuves de résultat.

Ce cadrage clôt l'exploration R&D. Toute intégration au Produit réel doit désormais être reprise par Claude Code après validation ; toute poursuite graphique ou éditoriale relève du chantier visuel séparé.
