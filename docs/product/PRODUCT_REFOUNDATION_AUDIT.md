# Mbàmbulaan Produit — Audit de refondation

> **Statut : audit de cadrage, à arbitrer par le CEO avant toute reprise du développement.**
> Répond à `docs/product/MBAMBULAAN_PRODUCT_MASTER_SPEC.md` (source de vérité). Ce document ne redéfinit pas la vision — il mesure l'écart entre le repo réel et cette vision, et propose une trajectoire.
> Écrit après un audit de code (imports réels, pas de suppositions) et la lecture intégrale du spec maître.

---

## 0. Ce qu'il faut retenir en premier

Le repo n'est pas un champ de ruines à raser : une partie du travail livré **ces derniers jours** (authentification réelle, permissions serveur, persistance Postgres isolée par contexte, système de composants shadcn/ui) sert directement le nouveau cadrage et n'a pas besoin d'être refaite. En revanche, une **partie substantielle du dossier `src/domain/` est du code mort** issu des itérations précédentes (~90 documents de prompts historiques), et **la totalité des pages opérationnelles `/app/*` antérieures à cette semaine** repose sur un design et une architecture d'information que le spec maître déclare explicitement obsolètes.

Le vrai risque n'est pas technique, il est de continuité : deux systèmes de vérité métier coexistent aujourd'hui (le modèle `Situation`/`CoordinationSpace`/`Commitment` déjà en base, et les mini-domaines isolés construits pour l'Espace État — `field-visit`, `vigilance`). Le spec maître exige un seul système. C'est l'écart le plus important à traiter.

---

## 1. Classification — garder / adapter / remplacer / supprimer

### 1.1 Garder tel quel

| Élément | Pourquoi |
|---|---|
| `src/server/session.ts`, `src/server/accounts-repository.ts`, `/api/auth/*` | Authentification réelle (e-mail + mot de passe, scrypt, session signée HMAC), construite cette semaine — sert directement §13 du spec. Aucune dépendance à l'ancien produit. |
| `src/server/permissions.ts` (+ `assertCan`) | RBAC serveur fonctionnel, testé (`tests/permissions.test.ts`). À **étendre** (voir §1.2) mais la fondation est saine. |
| Pattern de persistance isolée par contexte (`public-repository.ts`, `accounts-repository.ts`, `ministry-repository.ts`) — pool Postgres dédié, fallback mémoire, schéma auto-créé | Correspond exactement à l'exigence §14.3 (Postgres réel, migrations, seed déterministe) et évite de tout entasser dans un blob JSON unique. Le *pattern* est bon ; certains objets qu'il porte aujourd'hui (voir §1.2) doivent être refondus dans le modèle unifié. |
| `src/domain/types.ts` (le cœur : `Situation`, `CoordinationSpace`, `Commitment`, `Observation`, `Actor`, `Organization`, `Territory`, `Initiative`) | Recoupe déjà une bonne partie du vocabulaire du spec maître (`Situation`, `CoordinationSpace`, `Commitment` portent les **mêmes noms**). C'est une bonne nouvelle largement invisible tant qu'on regarde l'ancien design plutôt que le modèle de données. |
| `src/domain/rules.ts`, `src/runtime/event-engine.ts`, le pattern commande/événement idempotent | Boucle de coordination déjà partiellement implémentée (`create_signal → qualify → prioritize → coordinate → start_intervention → record_result → close`), proche de la boucle cible §4.1. À étendre, pas à jeter. |
| `src/components/ui/*` (shadcn/ui, cloné directement depuis GitHub) | Fondation **technique** de composants — accepté explicitement par le CEO comme socle, pas comme direction produit. |
| `db/migrations/*`, discipline de tests (`tests/*.test.ts`), scripts `lint`/`typecheck`/`build`/`test`/`test:e2e` | Hygiène d'ingénierie conforme à §18.5. |
| Site Public (`src/app/(public)*`, `src/domain/public/*`) | Hors périmètre de ce chantier sauf blocage technique bloquant (aucun identifié). Relié au Produit par `ServiceRequest` — voir §5. |

### 1.2 Adapter

| Élément | État actuel | Écart au spec | Action |
|---|---|---|---|
| Modèle `Signal` | `Observation` existe (territoire, acteur, canal, catégorie) et alimente déjà `Situation.observationIds[]` — la mécanique de promotion Signal→Situation existe en germe. | Le spec veut un objet `Signal` explicite avec confiance et statut de qualification propres, pas seulement un sous-objet d'`Observation`. | Renommer/étendre `Observation` en `Signal` avec les champs de qualification (§5.7) plutôt que recréer un objet parallèle. |
| `Decision` | Implicite : une transition de statut sur `Situation` (`qualification → priorisee → coordination`…) fait office de décision, sans objet ni décideur explicite. | Le spec veut `Decision` comme objet de première classe, avec choix explicite (§4, étape 4) et traçabilité. | Ajouter un objet `Decision` (référence situation, décideur, choix, motif, horodatage) créé à chaque transition significative. |
| `Evidence` (preuve) | Champs libres `result` / `confirmation` sur `Situation`. | Le spec veut une preuve typée (photo, document, mesure, bordereau, validation) réutilisable sur plusieurs objets. | Nouvel objet `Evidence` (type, lien vers objet source, fichier/texte, auteur, horodatage), remplace les champs texte libres. |
| `ServiceRequest` | **Deux implémentations parallèles et incompatibles existent déjà** : `Need` côté Produit (achat/transformation/conservation/transport) et `PublicRequest` côté Public (transport/froid/stockage/transformation/équipement/maintenance/formation/financement/sourcing/…, avec canal et source). `PublicRequest` est en réalité **plus proche du `ServiceRequest` du spec** que l'objet côté Produit. | Le spec veut un seul objet `ServiceRequest`, alimenté par tous les canaux (§5.6). | Ne pas recréer un troisième objet. Faire converger `Need` vers la forme de `PublicRequest` (ou l'inverse) lors du lot correspondant — décision d'architecture, pas de développement now. |
| Espace État — `field-visit.ts` / `vigilance.ts` (`src/domain/ministry`, `src/server/ministry-repository.ts`) | Construit cette semaine comme **système parallèle isolé**, hors du modèle `Situation`/`Commitment`. Fonctionnellement correct mais architecturalement en contradiction avec l'invariant §2.3 (« une seule source de vérité par objet »). | Un cas de vigilance devrait être un `Signal`/`Situation` (catégorie sécurité), une mission terrain devrait être un `Commitment`. | À refondre dans le modèle unifié lors du lot Institution (§ plan d'exécution). Le trancher maintenant serait exactement le développement fonctionnel que le CEO a demandé de ne pas lancer avant arbitrage. |
| `TrustLevel` (`declaree \| observee \| verifiee \| consolidee`) | Bon socle, testé, déjà utilisé pour étiqueter les données de démonstration. | Le spec liste 8 niveaux (§12.1) : déclaré, rapproché, documenté, vérifié, officiel, estimé, contesté, expiré. | Étendre l'énumération plutôt que la remplacer — préserve les tests et les données existantes. |
| Chrome partagé (`AppShell` / `AppSidebar` / `SiteHeader`, shadcn Sidebar) | Livré cette semaine, un seul système visuel pour tous les rôles. | Contredit directement §10.3 et l'instruction explicite du CEO : les rôles doivent avoir des **expériences différentes** (décision/situation/task/mobile/outcome-first), pas des variantes d'un même dashboard. | La coquille technique (sidebar, header, primitives shadcn) reste ; la composition par rôle (page d'accueil, hiérarchie de l'information, densité) doit diverger. Détaillé en §7. |
| `mbambulaan_tenant_state` (blob JSONB unique) | Fonctionne pour un tenant de démonstration unique. | Le spec veut une vraie isolation multi-tenant (§13.3). | Acceptable pour la démo V1 (un seul tenant), mais chaque nouvel objet (Signal, Decision, Evidence, ServiceRequest) doit porter un `tenantId` dès sa création pour éviter une migration coûteuse plus tard. |

### 1.3 Remplacer

| Élément | Pourquoi |
|---|---|
| Toutes les pages `/app/travail`, `/app/operations`, `/app/situations`, `/app/coordination`, `/app/marches`, `/app/durabilite`, `/app/organisation`, `/app/community`, `/app/initiatives`, `/app/pilotage` (UI) | Construites sur `brand.css` / classes `.surface` / `.ops-*` — le design système que le spec maître déclare explicitement obsolète (§10.1). La **logique** derrière ces écrans (lecture de `ProductState`, actions via `rules.ts`) reste largement réutilisable ; l'interface doit être reconstruite par rôle. |
| La navigation unique « Agir / Comprendre / Structurer / Décider » (ancien `ProductShell`, remplacée cette semaine par `AppSidebar`) | Groupement générique, pas une architecture d'information par intention de rôle. Déjà partiellement remplacée ; le remplacement doit maintenant se prolonger jusqu'à des pages d'accueil distinctes par rôle. |
| `/app/etat` dans sa forme actuelle | Utile comme brouillon et comme validation du système shadcn, mais bâti sur le CDC "Espace État" (périmètre plus étroit que le spec maître) et sur les mini-domaines `ministry/*` isolés. À reconstruire comme l'expérience **decision-first** de l'Institution, connectée au modèle unifié Signal → Situation → Décision → Engagement → Preuve → Résultat → Programme. |
| Ancien `brand.css` / `.surface` / `.ops-*` (`src/app/globals.css`, `src/app/brand.css`) | Superseded par la fondation shadcn ; à retirer une fois toutes les pages migrées (pas avant, elles servent encore les pages non migrées). |

### 1.4 Supprimer

Audit d'imports réels (pas de suppositions) : sur les **68 fichiers** de `src/domain/`, **54 ne sont importés nulle part** dans `src/app`, `src/components` ou `src/server`. Ce sont des artefacts des ~90 documents de prompts historiques (`docs/CODEX_V2_*` à `V15_*`, `docs/24_*` à `61_*`), chaque itération ayant généré sa propre couche de domaine sans que les précédentes soient nettoyées.

Fichiers à zéro import (liste vérifiée, non exhaustive au sens strict mais représentative) :
`business/lead.ts`, `channels/*` (gateway, message, signal, signal-converter, whatsapp), `cockpit/snapshot.ts`, `copilot-engine.ts`, `copilot/*`, `data/confidence.ts`, `data/evidence.ts`, `decision/action.ts`, `decision/decision-engine.ts`, `digital-twin/*`, `events/event.ts`, `events/notification.ts`, `institutional-engine.ts`, `integration/*`, `intelligence/*`, `learning-engine.ts`, `market-engine.ts`, `network/*`, `notification/*`, `onboarding/*`, `pilot/*`, `platform/access.ts`, `platform/membership.ts`, `platform/permissions.ts` **(doublon mort de `server/permissions.ts`, qui lui est réellement utilisé)**, `platform/plan-mapping.ts` *(utilisé, à vérifier — voir note)*, `platform/session.ts`, `platform/subscription.ts`, `platform/tenant.ts`, `product/product-config.ts`, `reporting/*`, `security/*`, `terrain/*`, `trust/*`, `workflow/*`.

Quatre fichiers ne sont utilisés qu'**une seule fois**, par des composants eux-mêmes en marge de la navigation active (`TerritoryDecisionPanel`, `InstitutionDecisionPanel`, `NationalControlCenter`, `ValueImpactPanel`) : `coordination-engine.ts`, `institution/decision-engine.ts`, `national/national-engine.ts`, `value-engine.ts`. À évaluer composant par composant lors de l'audit d'écran (certains peuvent contenir de bonnes idées de présentation à récupérer avant suppression).

**Recommandation** : lot de nettoyage à faible risque en tout début d'exécution — supprimer les 54 fichiers à zéro import (aucun risque de régression puisque rien ne les appelle), documenter le sort des 4 fichiers à usage unique après revue de leurs composants.

---

## 2. Modèle métier cible

Le modèle cible est celui du spec maître (§6). Ce qui suit précise **comment y arriver depuis l'existant**, objet par objet.

| Objet spec | Équivalent actuel | Écart |
|---|---|---|
| `Tenant` | `Tenant` (existe, un seul tenant instancié) | Aucun renommage nécessaire ; multi-tenance réelle différée. |
| `User` / `Actor` | `Actor` (existe) + comptes (`mbambulaan_accounts`) | `User` (identité de connexion) et `Actor` (identité métier) sont déjà distincts dans le code — c'est la bonne séparation, à documenter explicitement. |
| `Organization` | `Organization` (existe) | Aucun écart structurel majeur. |
| `Mandate` | Approximé par `Actor.role` + `Actor.territoryIds[]` | Pas d'objet dédié avec portée temporelle/modulaire. À ajouter si les cas d'usage V1 l'exigent (mandat borné dans le temps) — sinon différer. |
| `Territory`, `Site` | Existent, bien peuplés (18-20 territoires) | Correspond à `Quay`/`Site` du spec ; suffisant. |
| `Infrastructure`, `Capacity` | Existent | Correspondance directe. |
| `Vessel`, `Trip`, `Landing`, `CatchLine`, `Lot` | Existent (`Vessel`, `FishingTrip`, `Landing`, `CatchLine`, `Lot`) | Cycle `Sortie → Retour → Débarquement → Pesée → Lots` déjà modélisé, proche de §5.5. |
| `Signal` | `Observation` (à étendre — voir §1.2) | Renommage + champs de qualification. |
| `Situation` | `Situation` (nom identique) | Bon état ; ajouter `Decision`/`Evidence` liés plutôt que champs libres. |
| `CoordinationSpace` | `CoordinationSpace` (nom identique) | Bon état. |
| `Decision` | Absent comme objet | À créer (§1.2). |
| `Commitment` | `Commitment` (nom identique) | Bon état. |
| `Evidence` | Absent comme objet | À créer (§1.2). |
| `ServiceRequest` | Deux objets partiels (`Need`, `PublicRequest`) | À unifier (§1.2, §5). |
| `Communication` | Absent en tant que log générique ; `CommunityPost` existe pour un usage différent (forum public) | À créer pour porter la traçabilité omnicanale (§5.10) — peut rester **simulé** pour la V1 (voir §9). |
| `Initiative` / `Program` / `Funding` / `Indicator` | `Initiative` (avec `funding[]`, `indicators[]`) couvre déjà l'essentiel | `Program` peut être un statut/type d'`Initiative` plutôt qu'un objet séparé pour la V1. |
| `Report` | `Report` (existe, avec `metrics[]` sourcés/fiables/limités) | Déjà conforme à l'exigence de traçabilité §5.14. |
| `Subscription` / `Plan` / `ModuleEntitlement` | `Subscription`, `Plan` existent ; `PlatformModule` + `resolveCapabilities` existent | Bon socle pour la console Admin future (hors scope immédiat). |
| `AuditEvent` | `AuditEntry` (nom proche) | Correspondance directe. |
| `Document` | Absent | À créer si un cas d'usage V1 l'exige (pièce jointe sur `Evidence`) ; sinon différer au-delà de la V1. |

---

## 3. Architecture technique cible

- **Domain-first, sans dépendance aux composants React** — déjà vrai aujourd'hui (`src/domain` ne dépend d'aucun composant), à préserver.
- **Persistance par contexte borné plutôt qu'un blob unique** — pattern déjà initié (public / accounts / ministry) à généraliser : `Signal`/`Situation`/`Decision`/`Commitment`/`Evidence` peuvent rester dans l'agrégat `ProductState` existant (ils forment un seul graphe fortement lié, casser ce graphe en tables séparées maintenant serait une réécriture risquée sans bénéfice immédiat) ; les nouveaux contextes plus indépendants (Programmes/Financements si détachés, futurs canaux) suivent le pattern isolé.
- **API interne** : conserver `/api/actions` (commandes) et `/api/events` (ingestion omnicanale) comme point d'entrée unique — c'est déjà la bonne forme pour "un seul modèle quel que soit le canal" (§2.2). Les futurs adaptateurs (WhatsApp, SMS) doivent écrire dans `/api/events`, pas créer leurs propres tables.
- **Structure de dossiers** : le spec propose une arborescence (`domain/identity`, `domain/territories`, `domain/operations`…). Vu l'ampleur du nettoyage déjà nécessaire (§1.4), une **réorganisation physique complète des dossiers n'est pas la priorité** — le risque de régression dépasse le bénéfice tant que le contenu lui-même (les objets) n'est pas stabilisé. Recommandation : stabiliser d'abord les objets dans `types.ts`, réorganiser les fichiers dans un lot dédié une fois le modèle figé.

---

## 4. Architecture d'information cible

Le shell (`AppShell`/`AppSidebar`/`SiteHeader`) reste **la même charpente technique** pour tous les rôles — c'est ce que permet shadcn et ce que le CEO a validé. Ce qui doit changer, par rôle, c'est la **composition** :

| Rôle | Principe | Page d'accueil cible | Densité |
|---|---|---|---|
| Institution / Ministère | Décision-first | Vue nationale → territoires en tension → situations nécessitant un arbitrage | Faible, un élément dominant à la fois |
| Coordinateur territorial | Situation-first | File de situations actives, priorisées, avec prochaine action | Moyenne, orientée liste d'action |
| Opérateur de quai / gestionnaire d'organisation | Task-first | Tâches du jour, retours attendus, anomalies | Haute mais filtrée au strict nécessaire |
| Terrain (capitaine, mareyeur, transformateur) | Mobile-first | Prochaine action, bouton appel/WhatsApp, saisie minimale | Minimale, un geste à la fois |
| Partenaire / bailleur | Outcome-first | Programmes autorisés, bénéficiaires, preuves, indicateurs | Orientée résultat, pas opérationnelle |

Ceci est un changement de principe de conception, pas un plan d'écrans détaillé — le détail (maquettage, arbitrage visuel) revient au lot d'exécution correspondant, pas à cet audit.

---

## 5. Web / WhatsApp / téléphone / SMS / terrain → un seul système

État actuel :
- **Web professionnel** : réel (formulaires Public → `PublicRequest`, actions Produit → `/api/actions`).
- **Terrain (saisie directe dans l'app)** : réel.
- **WhatsApp / téléphone / SMS** : absents. Aucun adaptateur, aucune donnée réelle.

Recommandation pour la V1 (cohérente avec §19.1 qui demande une « communication simulée », pas une intégration réelle) :
1. Créer l'objet `Communication` (canal, statut, contenu, objet lié) comme partie du modèle unifié.
2. Alimenter cet objet avec des **scénarios simulés et explicitement étiquetés** pour la démonstration (ex. un signal reçu par WhatsApp, visible avec son origine, dans la Situation Room) — sans connecter de vrai compte WhatsApp Business (dépendance externe hors du contrôle de l'équipe produit à ce stade).
3. Concevoir `/api/events` comme le point d'entrée générique que tout futur adaptateur réel (WhatsApp Business Cloud API, Twilio SMS…) viendrait appeler — sans coupler le domaine à un fournisseur (§14.2).
4. Le choix du fournisseur réel (WhatsApp, SMS, téléphonie) reste un **arbitrage CEO différé**, pas une décision technique de cet audit (déjà listé « à challenger » dans le spec §23).

---

## 6. Stratégie multi-tenant et permissions

- **V1** : un seul tenant de démonstration (`tenant-demo`), comme aujourd'hui — suffisant pour la démonstration institutionnelle, le spec ne l'exige pas avant la V1.
- **Permissions** : `src/server/permissions.ts` fait aujourd'hui du RBAC pur (rôle → types de commandes autorisées), sans portée territoriale ni organisationnelle. Le spec (§13.1) veut : rôle **+** organisation **+** territoire **+** mandat **+** module **+** action **+** sensibilité. Recommandation : étendre `assertCan` pour accepter un contexte (acteur complet, pas seulement son rôle) et vérifier l'appartenance territoriale/organisationnelle en plus du type de commande — extension additive, pas une réécriture.
- **Préparer, ne pas construire** l'isolation multi-tenant réelle : faire porter `tenantId` par tout nouvel objet dès sa création (voir §1.2) pour que l'ouverture à plusieurs tenants plus tard soit une évolution, pas une migration.

---

## 7. Stratégie de données et niveaux de confiance

- Étendre `TrustLevel` de 4 à 8 valeurs (§12.1), en conservant la compatibilité des 4 valeurs existantes (pas de migration de données nécessaire, ajout d'énumération).
- Généraliser le pattern déjà appliqué à l'Espace État et au Public (étiquette visible « Démonstration » / niveau de confiance sur chaque donnée affichée) à **tous** les nouveaux écrans — c'est déjà un acquis culturel du projet, pas une nouveauté à inventer.
- Toute donnée de démonstration reste explicitement marquée, jamais présentée comme officielle (§16.3, déjà respecté partout dans le code livré cette semaine).

---

## 8. Stratégie de migration du legacy

Principe : **additif et par rôle, jamais un big-bang.**

1. **Lot 0 (faible risque)** : supprimer les 54 fichiers de domaine morts (§1.4). Aucune UI ne change, aucun test ne casse (vérifié : aucun de ces fichiers n'est importé, donc aucun test ne les couvre indirectement — à confirmer par un `build` + `test` complet après suppression).
2. **Un rôle à la fois**, dans l'ordre de priorité de la démonstration institutionnelle : Institution → Coordinateur → Opérateur/Terrain → Partenaire. Chaque rôle migré remplace sa navigation et ses écrans, sans toucher aux autres rôles tant qu'ils n'ont pas leur tour.
3. **Le modèle de données évolue en parallèle, additivement** : `Signal`, `Decision`, `Evidence`, `ServiceRequest` unifié s'ajoutent à `types.ts` sans supprimer `Observation`/`Situation`/`Need` existants tant que la bascule n'est pas terminée pour l'écran qui les consomme.
4. **Les anciennes pages restent fonctionnelles** (même avec leur ancien design) jusqu'à ce que leur remplacement soit livré et vérifié — jamais de période où une route casse.
5. Une fois toutes les pages `/app/*` migrées, retirer `brand.css` et les classes `.surface`/`.ops-*`.

---

## 9. Ce qui sera fonctionnel, simulé ou différé — V1 institutionnelle

**Fonctionnel (réel)** : authentification, permissions par rôle, persistance Postgres, Atlas national → territoire, moteur Signal → Situation → Décision → Engagement → Preuve → Résultat, besoins collectifs → programme, export de rapport (Markdown/impression déjà fait, PDF/Excel à ajouter), jeu de données de démonstration déterministe et volumétrique (§16.2).

**Simulé (explicitement étiqueté comme tel)** : communications WhatsApp/téléphone/SMS (pas de vrai fournisseur branché), toute suggestion d'assistance/copilote si elle est construite pendant la V1.

**Différé (hors V1, conforme §19.2)** : paiement, marketplace, matching autonome, IA décisionnelle, application native, USSD, signature électronique avancée, facturation automatisée complète, géospatial avancé, prévisions scientifiques, console Admin complète (tenants/plans/modules — la cible existe dans le modèle `Subscription`/`Plan`/`PlatformModule` mais son développement est explicitement reporté par le CEO).

---

## 10. Synthèse des écarts critiques à trancher

Ces points sont détaillés avec options dans `PRODUCT_DECISION_LOG.md` — listés ici pour vue d'ensemble :

1. Faut-il unifier `Need` et `PublicRequest` en un seul `ServiceRequest`, et dans quel sens (le modèle `PublicRequest` semble le plus proche de la cible) ?
2. Faut-il refondre `field-visit`/`vigilance` (Espace État) dans le modèle `Signal`/`Situation`/`Commitment` unifié maintenant, ou les traiter comme une first version tolérée le temps de la démonstration ministère ?
3. Faut-il des objets `Decision` et `Evidence` dès la V1, ou des champs enrichis sur `Situation` suffisent-ils pour la démonstration des 12-15 minutes ?
4. Quel est le scénario institutionnel principal à câbler en premier (le spec propose Joal / chaîne du froid — à confirmer comme unique fil rouge de la démo, ou en garder d'autres en réserve) ?
5. Le shell partagé suffit-il, ou certains rôles (terrain notamment) ont-ils besoin d'une expérience techniquement séparée (pas seulement une composition différente du même shell) ?
