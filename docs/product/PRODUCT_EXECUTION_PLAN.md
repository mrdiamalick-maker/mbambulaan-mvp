# Mbàmbulaan Produit — Plan d'exécution V1 institutionnelle

> Dérive de `PRODUCT_REFOUNDATION_AUDIT.md` et de `MBAMBULAAN_PRODUCT_MASTER_SPEC.md`.
> Périmètre strictement borné à la **démonstration institutionnelle V1** demandée par le CEO — pas l'intégralité du spec maître. Ordre de bataille, pas calendrier : chaque lot ne démarre qu'après arbitrage explicite et clôture du précédent avec build vert.

## Fil rouge de la démonstration (rappel, ne pas dévier)

`Vue nationale → territoire (Joal) → signal omnicanal → qualification → situation (machine à glace indisponible) → décision → coordination → engagements → preuve → résultat → besoin collectif → programme/financement → rapport`

Un ministre doit comprendre en 12–15 minutes que Mbàmbulaan transforme une information terrain en action coordonnée, résultat vérifiable et décision d'investissement — pas seulement visualiser la filière.

## Hors périmètre de ce plan (rappel des arbitrages déjà faits)

- Console Admin (tenants/plans/modules/canaux/audit/qualité des données) — cible confirmée, développement explicitement différé par le CEO.
- Site Public — inchangé sauf blocage technique bloquant.
- WhatsApp/SMS/téléphonie réels — simulés pour la V1, intégration réelle différée (choix de fournisseur = arbitrage CEO séparé).
- Paiement, marketplace, matching autonome, IA décisionnelle, app native, USSD — différés (spec §19.2).

---

## Lot 0 — Nettoyage et stabilisation du socle

**Objectif** : repartir d'un repo lisible, sans code mort, sans changer une seule page visible.

**Livrables**
- Suppression des ~54 fichiers de `src/domain/` sans aucun import réel (liste en annexe de l'audit).
- Décision documentée (garder / réécrire / supprimer) sur les 4 fichiers à usage unique (`coordination-engine.ts`, `institution/decision-engine.ts`, `national/national-engine.ts`, `value-engine.ts`) après revue des composants qui les consomment.
- Extension non cassante de `TrustLevel` (4 → 8 valeurs, rétrocompatible).
- Ajout de `tenantId` sur les tables `ministry-repository` (aujourd'hui absent, prépare l'isolation multi-tenant future sans migration lourde).

**Critères d'acceptation**
- `npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e` verts.
- Aucune page, aucun écran ne change visuellement.
- Diff = suppressions + additions de types, zéro changement de comportement.

**Risque** : très faible (suppression de code non référencé).

---

## Lot 1 — Modèle métier unifié

**Objectif** : un seul système de vérité pour signal → situation → décision → engagement → preuve, quel que soit le canal ou le rôle. Condition préalable à tous les lots suivants.

**Livrables**
- `Signal` (extension de `Observation` existant) avec statut de qualification et confiance explicites.
- `Decision` comme objet de première classe (situation liée, décideur, choix, motif, horodatage), créé à chaque transition significative de `Situation`.
- `Evidence` comme objet de première classe (type, objet source, contenu/document, auteur, horodatage), remplace les champs texte libres `result`/`confirmation`.
- `Communication` (canal, statut, contenu, objet lié) — porte les échanges simulés WhatsApp/téléphone/SMS de la V1.
- Arbitrage tranché et implémenté sur `ServiceRequest` (unification `Need` / `PublicRequest` — sens de la convergence selon décision CEO).
- Arbitrage tranché et implémenté sur `field-visit`/`vigilance` (Espace État) : intégration dans le modèle unifié ou statut transitoire assumé jusqu'à la bascule de l'écran Institution (Lot 2).
- Nouvelles commandes dans `rules.ts` : `create_decision`, `record_evidence`, `log_communication` (ou équivalent), cohérentes avec le pattern commande/événement idempotent existant.
- Extension de `assertCan` (permissions) : portée territoriale/organisationnelle en plus du rôle.
- Tests domaine pour chaque nouvel objet et chaque nouvelle commande (mêmes standards que `tests/domain-cycle.test.ts`, `tests/permissions.test.ts`).

**Critères d'acceptation**
- Les objets existants (`Situation`, `CoordinationSpace`, `Commitment`) continuent de fonctionner sans régression (tests existants toujours verts).
- Un signal peut être créé depuis au moins deux origines différentes (Web, simulation WhatsApp) et converger vers le même objet `Situation`.
- Une décision et une preuve sont visibles dans l'historique d'une situation de bout en bout.
- Build vert complet.

**Risque** : moyen — c'est le lot qui touche le plus de code partagé. À faire dans une branche vérifiée à chaque étape, jamais en un seul commit massif.

---

## Lot 2 — Atlas national → territoire (Institution, decision-first)

**Objectif** : livrer les séquences 1 et 2 de la démonstration (vue nationale, descente vers Joal).

**Livrables**
- Vue nationale institutionnelle : territoires, niveaux de tension, besoins et capacités agrégés, qualité des données — composée dans l'esprit décision-first (un élément dominant, pas une grille de tuiles).
- Fiche territoire (Joal en premier, généralisable) : acteurs, infrastructures, activité, situation prioritaire, accès direct à la Situation Room correspondante.
- Reconstruction de `/app/etat` (ou nouvelle route dédiée si la reconstruction s'avère plus saine qu'une évolution) comme page d'accueil Institution, consommant le modèle unifié du Lot 1 plutôt que le sous-domaine `ministry/*` isolé.
- Diversification des revenus, programmes en cours, KPIs : réintégrés comme sections secondaires de cette même expérience decision-first, pas des écrans séparés.

**Critères d'acceptation**
- Un utilisateur institution peut, sans quitter le fil, aller de la vue nationale à une situation précise sur un territoire précis.
- Aucune donnée privée/opérationnelle non pertinente n'est exposée à ce rôle (respect du filtrage par habilitation).
- Design cohérent avec le principe decision-first (validé visuellement, captures à l'appui).

**Risque** : moyen — dépend du Lot 1 livré et stable.

---

## Lot 3 — Signal omnicanal → Situation → Décision (Coordinateur, situation-first)

**Objectif** : séquence 3 de la démonstration (origine omnicanale visible, signal transformé en objet métier).

**Livrables**
- Intake omnicanal simulé : au moins un scénario de signal reçu par WhatsApp/téléphone, visible avec son origine et son niveau de confiance.
- Reconstruction de l'expérience Coordinateur (remplace `/app/situations`/`/app/travail` dans leur forme actuelle) autour d'une file de situations priorisées et de la prochaine action — situation-first, pas un dashboard générique.
- Le scénario canonique Joal / machine à glace indisponible est jouable de bout en bout jusqu'à l'étape décision.

**Critères d'acceptation**
- Le scénario de démonstration (§8.2 du spec maître, panne machine à glace) est rejouable sans étape cachée ou données incohérentes.
- L'origine du signal (WhatsApp simulé, téléphone simulé, terrain) reste visible à chaque étape.

**Risque** : moyen.

---

## Lot 4 — Situation Room, preuve, résultat

**Objectif** : séquences 4 et 5 (coordination, preuve, résultat).

**Livrables**
- Situation Room reconstruite : contexte, chronologie, participants, décision, capacité alternative, engagements, communication, preuve, clôture, résultat — dans le nouveau système de composants.
- Panneau de preuve (Evidence) et panneau de communication (Communication) intégrés, pas des ajouts ad hoc.
- Le scénario canonique va jusqu'au résultat documenté et à l'enseignement enregistré.

**Critères d'acceptation**
- Chaque engagement produit une preuve ou une justification explicite avant clôture (cohérent avec §6.1 du spec).
- Le résultat de la situation est visible depuis la vue territoire et la vue nationale (remontée sans rupture).

**Risque** : moyen.

---

## Lot 5 — Besoin collectif → Programme/Financement → Rapport

**Objectif** : séquences 6 et 7 (programme et financement, rapport institutionnel).

**Livrables**
- Détection/agrégation de `ServiceRequest` similaires en besoin collectif (peut rester une opération assistée, pas un matching automatique — explicitement hors scope V1).
- Un besoin collectif peut être promu en `Initiative`/programme, avec budget, partenaires, indicateurs (réutilise le modèle `Initiative` existant, déjà solide).
- Rapport institutionnel exportable : étendre le travail déjà livré (export Markdown + impression) avec au minimum un export PDF ou Excel réel (§19.1 l'exige au minimum).
- Chaque indicateur du rapport reste traçable à sa source, sa période, ses limites (déjà le cas pour les rapports existants — à préserver).

**Critères d'acceptation**
- Le scénario canonique se termine par un rapport exportable qui reprend fidèlement les événements du scénario joué.

**Risque** : faible à moyen.

---

## Lot 6 — Terrain mobile et recette finale

**Objectif** : couvrir la présentation mobile terrain exigée par le spec (§11, §19.1) et fermer la boucle de recette institutionnelle.

**Livrables**
- Expérience mobile-first minimale pour un rôle terrain (capitaine ou opérateur) : prochaine action, appel/WhatsApp, confirmation, saisie minimale.
- Mode présentation guidée (rejoue le scénario canonique sans manipulation live risquée devant le ministère).
- Vérification des 15 critères d'acceptation du spec maître (§21) un par un, documentée.
- Recette desktop + mobile.

**Critères d'acceptation**
- Les 15 critères du §21 du spec maître sont vérifiés et cochés explicitement.
- `npm run test:e2e` couvre le parcours canonique de bout en bout.

**Risque** : faible (polish et vérification, peu de nouveauté fonctionnelle).

---

## Séquencement et jalons de vérification

Après **chaque** lot, sans exception :
1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`
5. `npm run test:e2e`
6. Résumé écrit : ce qui a été livré, routes touchées, captures d'écran, écarts restants.

Aucun lot ne démarre avant que le précédent soit vert et que le CEO ait vu le résultat (capture ou preview) — cohérent avec la discipline déjà appliquée cette semaine (Espace État, shadcn).

## Ce que ce plan ne couvre pas encore

- Console Admin complète (Lot séparé, hors périmètre V1 par arbitrage CEO).
- Expériences Opérateur et Partenaire dans leur version complète (esquissées aux Lots 2-3 via les objets partagés, mais pas construites comme expériences dédiées avant que la démonstration institution/coordinateur soit validée).
- Intégration réelle WhatsApp/SMS (dépend d'un arbitrage fournisseur, voir `PRODUCT_DECISION_LOG.md`).
- Réorganisation physique des dossiers `src/domain/*` vers l'arborescence cible du spec (différée tant que le contenu n'est pas stabilisé, voir audit §3).
