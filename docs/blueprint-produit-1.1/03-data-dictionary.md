# 03 — Data Dictionary

## 1. Finalité

Le Data Dictionary définit le sens, la structure, la provenance, la qualité, la sensibilité et les règles de gouvernance des données utilisées par Mbàmbulaan.

Il complète le Domain Model et l'Event Catalog.

Son objectif n'est pas seulement de lister des champs. Il doit éviter les ambiguïtés, les doublons, les interprétations contradictoires et les usages non maîtrisés.

## 2. Principes

Chaque donnée importante doit avoir :

- une définition métier ;
- un type ;
- une source ;
- un moteur propriétaire ;
- un responsable de qualité ;
- un niveau de sensibilité ;
- une règle d'accès ;
- une durée de conservation ;
- une fréquence de mise à jour ;
- un niveau de confiance ;
- une finalité d'usage.

Aucune donnée ne doit être collectée sans justification explicite.

## 3. Niveaux de sensibilité

### Public

Donnée pouvant être diffusée sans risque particulier.

Exemples :

- nom public d'une organisation ;
- territoire administratif ;
- description publique d'une initiative.

### Interne écosystème

Donnée accessible aux acteurs autorisés de l'écosystème.

Exemples :

- état d'une action ;
- calendrier opérationnel ;
- situation non sensible.

### Confidentiel

Donnée accessible uniquement à un périmètre limité.

Exemples :

- budget détaillé ;
- décision en préparation ;
- document contractuel ;
- information stratégique.

### Personnel

Donnée permettant d'identifier ou de caractériser une personne.

Exemples :

- nom ;
- téléphone ;
- adresse ;
- mandat individuel.

### Très sensible

Donnée dont l'exposition pourrait causer un préjudice important.

Exemples :

- identifiant officiel ;
- données financières individuelles ;
- information de sécurité ;
- accusation non vérifiée ;
- secret d'affaires.

## 4. Dimensions de qualité

Les données doivent être évaluées selon :

- complétude ;
- exactitude ;
- cohérence ;
- fraîcheur ;
- unicité ;
- traçabilité ;
- validité ;
- niveau de confiance.

## 5. Métadonnées communes

Tous les objets métier doivent idéalement contenir :

- `id` ;
- `created_at` ;
- `created_by` ;
- `updated_at` ;
- `updated_by` ;
- `status` ;
- `source_system` ;
- `source_reference` ;
- `territory_id` si pertinent ;
- `organization_id` si pertinent ;
- `sensitivity_level` ;
- `confidence_level` ;
- `version` ;
- `archived_at` si applicable.

## 6. Acteur

### actor_id

- **Définition** : identifiant interne stable d'un acteur.
- **Type** : UUID.
- **Obligatoire** : oui.
- **Propriétaire** : Identités et organisations.
- **Sensibilité** : interne.
- **Source** : système Mbàmbulaan.

### display_name

- **Définition** : nom utilisé dans les parcours et interfaces.
- **Type** : texte.
- **Sensibilité** : personnel.
- **Règle** : peut différer du nom légal.

### legal_name

- **Définition** : nom officiel lorsque requis.
- **Type** : texte.
- **Sensibilité** : personnel.
- **Collecte** : uniquement si nécessaire.

### actor_type

- **Définition** : catégorie métier principale de l'acteur.
- **Type** : référentiel.
- **Valeurs possibles** : pêcheur, mareyeur, transformateur, agent public, expert, investisseur, représentant, autre.
- **Règle** : un acteur peut avoir plusieurs rôles, mais un type principal.

### phone_number

- **Définition** : numéro de contact principal.
- **Type** : texte normalisé.
- **Sensibilité** : personnel.
- **Règle** : format international recommandé.

### preferred_language

- **Définition** : langue préférée de communication.
- **Type** : code langue.
- **Exemples** : fr, wo, pul, sr.

### verification_status

- **Définition** : niveau de vérification de l'identité.
- **Valeurs** : non vérifié, partiellement vérifié, vérifié, contesté, suspendu.

### primary_territory_id

- **Définition** : territoire principal d'activité.
- **Type** : référence Territoire.
- **Règle** : ne remplace pas les autres territoires d'activité.

## 7. Organisation

### organization_id

- **Définition** : identifiant interne stable d'une organisation.
- **Type** : UUID.
- **Propriétaire** : Identités et organisations.

### organization_name

- **Définition** : nom officiel ou d'usage.
- **Type** : texte.
- **Sensibilité** : public ou interne selon contexte.

### organization_type

- **Valeurs possibles** : GIE, CLPA, ministère, commune, ONG, bailleur, banque, entreprise, université, autre.

### legal_status

- **Définition** : statut juridique ou institutionnel.
- **Type** : texte ou référentiel.

### verification_status

- **Définition** : niveau de confiance institutionnelle accordé.
- **Valeurs** : non vérifiée, vérification en cours, vérifiée, suspendue.

### intervention_territories

- **Définition** : territoires sur lesquels l'organisation intervient.
- **Type** : liste de références.

## 8. Mandat

### mandate_id

- **Définition** : identifiant stable du mandat.
- **Type** : UUID.

### mandate_role

- **Définition** : rôle autorisé.
- **Exemples** : validateur, administrateur territorial, représentant, décideur, observateur.

### mandate_scope

- **Définition** : périmètre exact d'exercice du mandat.
- **Type** : combinaison territoire, organisation, objet et action.

### valid_from / valid_until

- **Définition** : période de validité du mandat.
- **Type** : date et heure.

### granting_authority

- **Définition** : acteur ou organisation ayant accordé le mandat.

### mandate_status

- **Valeurs** : proposé, actif, expiré, révoqué, suspendu.

## 9. Territoire

### territory_id

- **Définition** : identifiant interne stable du territoire.
- **Type** : UUID.

### territory_name

- **Définition** : nom d'usage du territoire.

### territory_type

- **Valeurs possibles** : site de débarquement, commune, département, région, zone de pêche, corridor, autre.

### geometry

- **Définition** : représentation géographique du territoire.
- **Type** : point, polygone ou référence externe.
- **Sensibilité** : variable selon contexte.

### parent_territory_id

- **Définition** : territoire parent dans une hiérarchie.
- **Règle** : optionnel si les territoires se chevauchent sans hiérarchie.

### external_reference

- **Définition** : identifiant dans un référentiel externe.

## 10. Observation

### observation_id

- **Définition** : identifiant stable d'une observation.

### observation_type

- **Définition** : nature de l'observation.
- **Exemples** : volume, prix, panne, disponibilité, état sanitaire, incident.

### observed_value

- **Définition** : valeur observée.
- **Type** : numérique, texte, booléen ou catégorie.

### unit

- **Définition** : unité associée à la valeur.
- **Exemples** : kg, tonne, CFA/kg, heure, pourcentage.

### observed_at

- **Définition** : date et heure réelle de l'observation.

### recorded_at

- **Définition** : date et heure d'enregistrement dans Mbàmbulaan.

### source_type

- **Valeurs** : humain, capteur, système externe, document, import.

### confidence_level

- **Valeurs** : faible, moyen, élevé, vérifié.

### validation_status

- **Valeurs** : non validée, en validation, validée, invalidée.

## 11. Signalement

### report_id

- **Définition** : identifiant stable du signalement.

### report_type

- **Valeurs** : problème, besoin, opportunité, incident, alerte, autre.

### description

- **Définition** : description libre du signalement.
- **Sensibilité** : variable.

### urgency_level

- **Valeurs** : faible, normale, élevée, critique.
- **Règle** : urgence déclarée, distincte de la criticité qualifiée.

### submitted_at

- **Définition** : date et heure de soumission.

### receipt_status

- **Valeurs** : soumis, reçu, en qualification, orienté, clos.

### closure_reason

- **Définition** : motif de clôture.
- **Obligatoire** : oui lors de la clôture.

## 12. Situation

### situation_id

- **Définition** : identifiant stable d'une situation consolidée.

### situation_type

- **Valeurs** : problème, besoin, risque, opportunité.

### criticality

- **Définition** : gravité métier de la situation.
- **Valeurs** : faible, modérée, élevée, critique.

### urgency

- **Définition** : vitesse de réaction nécessaire.
- **Valeurs** : faible, normale, élevée, immédiate.

### scope

- **Définition** : périmètre d'impact.
- **Exemples** : acteur, organisation, territoire, multi-territoires, filière.

### qualification_status

- **Valeurs** : détectée, en analyse, qualifiée, priorisée, non priorisée, en traitement, résolue, archivée.

### qualification_rationale

- **Définition** : justification de la qualification.

## 13. Besoin priorisé

### priority_id

- **Définition** : identifiant de la décision de priorité.

### priority_level

- **Valeurs** : basse, moyenne, haute, critique.

### decision_criteria

- **Définition** : critères ayant servi à l'arbitrage.

### prioritization_rationale

- **Définition** : justification de la décision.

### decision_authority

- **Définition** : acteur ou instance habilitée.

## 14. Initiative

### initiative_id

- **Définition** : identifiant stable de l'initiative.

### initiative_title

- **Définition** : titre court et compréhensible.

### objective

- **Définition** : changement recherché.

### source_need_id

- **Définition** : besoin ou situation source.

### lead_organization_id

- **Définition** : organisation porteuse.

### maturity_level

- **Valeurs** : idée, cadrée, validée, prête à financer, financée, en exécution, terminée.

### estimated_budget

- **Définition** : budget estimatif total.
- **Type** : montant + devise.
- **Sensibilité** : confidentiel.

### expected_results

- **Définition** : résultats directs attendus.

### initiative_status

- **Valeurs** : idée, en structuration, à valider, validée, en recherche d'appui, financée, en exécution, suspendue, terminée, abandonnée.

## 15. Engagement

### commitment_id

- **Définition** : identifiant stable de l'engagement.

### commitment_type

- **Valeurs** : opérationnel, informationnel, financier, matériel, décisionnel.

### committed_by

- **Définition** : acteur ou organisation prenant l'engagement.

### beneficiary

- **Définition** : acteur, organisation ou initiative bénéficiaire.

### due_at

- **Définition** : échéance de réalisation.

### expected_evidence

- **Définition** : preuve attendue de réalisation.

### commitment_status

- **Valeurs** : proposé, accepté, en cours, tenu, partiellement tenu, non tenu, annulé.

## 16. Décision

### decision_id

- **Définition** : identifiant stable de la décision.

### decision_object

- **Définition** : objet concerné.

### decision_maker

- **Définition** : acteur ou instance décisionnaire.

### mandate_id

- **Définition** : mandat utilisé pour décider.

### options_considered

- **Définition** : options réellement examinées.

### selected_option

- **Définition** : option retenue.

### rationale

- **Définition** : justification.

### decision_status

- **Valeurs** : proposée, prise, révisée, annulée.

## 17. Action

### action_id

- **Définition** : identifiant stable de l'action.

### parent_object

- **Définition** : initiative, engagement, situation ou décision d'origine.

### assignee

- **Définition** : responsable principal.

### due_at

- **Définition** : échéance.

### action_status

- **Valeurs** : à faire, planifiée, en cours, bloquée, terminée, vérifiée.

### blocking_reason

- **Définition** : cause du blocage.

### completion_evidence

- **Définition** : preuve de réalisation.

## 18. Risque

### risk_id

- **Définition** : identifiant stable du risque.

### probability

- **Valeurs** : faible, moyenne, élevée, quasi certaine.

### impact

- **Valeurs** : faible, modéré, majeur, critique.

### risk_score

- **Définition** : score calculé selon la méthode retenue.
- **Règle** : formule documentée et versionnée.

### risk_owner

- **Définition** : acteur ou organisation responsable du suivi.

### mitigation_plan

- **Définition** : mesures prévues.

## 19. Indicateur et mesure

### indicator_id

- **Définition** : identifiant stable de l'indicateur.

### indicator_name

- **Définition** : nom court.

### indicator_definition

- **Définition** : formulation précise et non ambiguë.

### formula

- **Définition** : méthode de calcul.

### frequency

- **Valeurs** : temps réel, quotidien, hebdomadaire, mensuel, trimestriel, annuel, ad hoc.

### measure_id

- **Définition** : identifiant d'une mesure.

### measured_value

- **Définition** : valeur observée.

### measurement_date

- **Définition** : date de référence.

### measurement_source

- **Définition** : source de la mesure.

## 20. Apprentissage

### learning_id

- **Définition** : identifiant stable d'un apprentissage.

### learning_context

- **Définition** : contexte dans lequel l'apprentissage est valable.

### evidence_summary

- **Définition** : résumé des preuves.

### conclusion

- **Définition** : apprentissage formulé de manière exploitable.

### applicability_conditions

- **Définition** : conditions de validité ou de réplication.

### validation_status

- **Valeurs** : brouillon, revu, validé, contesté, archivé.

## 21. Document et preuve

### document_id

- **Définition** : identifiant stable du document.

### document_type

- **Valeurs** : justificatif, contrat, photo, rapport, décision, preuve, guide, autre.

### storage_reference

- **Définition** : référence technique vers le fichier.

### checksum

- **Définition** : empreinte permettant de vérifier l'intégrité.

### confidentiality_level

- **Valeurs** : public, interne, confidentiel, personnel, très sensible.

### validation_status

- **Valeurs** : non vérifié, vérifié, rejeté, expiré.

## 22. Provenance

Toute donnée importante doit pouvoir indiquer :

- auteur humain ou système ;
- système source ;
- date réelle de production ;
- date d'import ;
- méthode de collecte ;
- pièce justificative ;
- niveau de confiance ;
- transformation éventuelle ;
- règle de calcul utilisée.

## 23. Référentiels

Les référentiels suivants doivent être gouvernés :

- types d'acteurs ;
- types d'organisations ;
- types de territoires ;
- types de signalements ;
- niveaux d'urgence ;
- niveaux de criticité ;
- statuts ;
- types d'engagements ;
- catégories de risques ;
- unités de mesure ;
- devises ;
- langues ;
- types de documents.

Chaque référentiel doit avoir :

- un propriétaire ;
- une version ;
- une date d'effet ;
- un historique ;
- des règles de dépréciation.

## 24. Règles de conservation

La durée de conservation doit dépendre :

- de la finalité ;
- de la sensibilité ;
- des obligations légales ;
- de la valeur historique ;
- du risque ;
- du consentement.

Principes :

- minimisation ;
- archivage maîtrisé ;
- suppression lorsqu'elle est justifiée ;
- conservation renforcée des décisions et traces d'audit ;
- révision périodique des données personnelles.

## 25. Données minimales du pilote

Le pilote doit limiter la collecte aux données nécessaires pour :

- identifier les acteurs et organisations ;
- rattacher les contributions à un territoire ;
- recevoir un signalement ;
- qualifier une situation ;
- prendre une décision simple ;
- créer un engagement ;
- assigner une action ;
- suivre son statut ;
- joindre une preuve ;
- notifier les acteurs ;
- conserver une trace d'audit minimale.

## 26. Données à ne pas collecter au départ

À éviter sans justification forte :

- données biométriques ;
- historique financier individuel détaillé ;
- géolocalisation permanente ;
- données de santé ;
- identifiants officiels complets ;
- opinions politiques ;
- données familiales ;
- données commerciales stratégiques non nécessaires ;
- données comportementales fines.

## 27. Contrôles de qualité

Les contrôles prioritaires sont :

- format des numéros de téléphone ;
- unicité des identifiants ;
- cohérence des dates ;
- validité des statuts ;
- présence d'une source ;
- justification des clôtures ;
- cohérence territoire-organisation ;
- cohérence mandat-action ;
- absence de doublons de signalements ;
- validité des unités.

## 28. Propriété et responsabilité

La propriété des données ne signifie pas toujours possession juridique.

Dans Mbàmbulaan, elle signifie principalement :

- responsabilité de définition ;
- responsabilité de qualité ;
- responsabilité des règles ;
- responsabilité des accès ;
- responsabilité du cycle de vie.

## 29. Test d'admission d'une nouvelle donnée

Avant d'ajouter une donnée, vérifier :

- quelle décision améliore-t-elle ?
- qui la produit ?
- qui la valide ?
- qui l'utilise ?
- qui en bénéficie ?
- quel moteur la possède ?
- quel est son niveau de sensibilité ?
- combien coûte sa collecte et sa maintenance ?
- peut-elle être obtenue ailleurs ?
- est-elle nécessaire au pilote ?

## 30. Principe directeur

> La donnée de Mbàmbulaan doit être utile, gouvernée, traçable et proportionnée à la décision qu'elle permet d'améliorer.
