# Mbàmbulaan Produit — Recette d'acceptation

> Vérification des 15 critères d'acceptation du spec maître (§21), un par un, plus les 10 conditions de refus. Référence : `docs/product/MBAMBULAAN_PRODUCT_MASTER_SPEC.md` §21, `docs/product/PRODUCT_EXECUTION_PLAN.md` Lot 6, `docs/product/PRODUCT_DECISION_LOG.md` (D9/D10).
>
> **Établie au Lot 6, mise à jour au Lot 7.** Le Lot 7 a fermé quatre des limites listées à l'issue du Lot 6 (rôles hors périmètre, homogénéisation D9, D10, audit mobile). Ce document reflète l'état après le Lot 7 — la version Lot 6 (limites encore ouvertes à l'époque) reste consultable dans l'historique git de ce fichier.

## Statut global

**Le Produit satisfait les 15 critères §21 sur le parcours canonique**, et les 4 limites assumées à l'issue du Lot 6 sont closes. Il reste deux exceptions **délibérées et bornées** (pas des oublis) au design homogène, et une frontière de périmètre V1 inchangée (WhatsApp/SMS réels) — détaillées en §3. Build vert (lint/typecheck/test/build/test:e2e) à chaque étape des Lots 0 à 7, sans exception.

## 1. Les 15 critères (§21)

| # | Critère | Statut | Preuve |
|---|---|---|---|
| 1 | Ouvrir la vue nationale | ✅ | `/app/etat` (InstitutionShell, D9, Lot 2). `test:e2e`. |
| 2 | Identifier un territoire prioritaire | ✅ | Carte territoriale sur `/app/etat` : statut stable/vigilance/critique par couleur. |
| 3 | Ouvrir sa fiche | ✅ | Sélection d'un territoire ouvre `TerritoryDecisionPanel` (même page). |
| 4 | Voir une situation et sa source | ✅ | Canal, niveau de confiance, référence (`MBA-SIT-…`) affichés sur chaque situation. |
| 5 | Comprendre l'impact | ✅ | Bloc « Impact clé » sur `/app/etat`. |
| 6 | Ouvrir la Situation Room | ✅ | `/app/situations/[id]` (D9, Lot 4). `test:e2e`. |
| 7 | Voir acteurs, décisions, engagements | ✅ | `CoordinationProposal.tsx` (Lot 4) ; `/app/coordination/[id]` restylé D9 (passe de cohérence pré-Lot 6). Domaine : `tests/decision.test.ts`. |
| 8 | Mobiliser ou sélectionner une capacité | ✅ | `accept_opportunity`/`complete_logistics`. Domaine : `tests/operations-cycle.test.ts`. Consommé aussi par `BuyerTaskView.tsx` (Lot 7, mareyeur/transformateur). `test:e2e`. |
| 9 | Préparer une communication | ✅ | `log_communication` (simulée, D5). `CommunicationForm.tsx` (Situation Room) et `TerrainCaptainView.tsx` (Terrain). Domaine : `tests/communication.test.ts`. `test:e2e`. |
| 10 | Enregistrer une preuve | ✅ | `record_evidence`, objet `Evidence` (D3). Panneau Preuve, Situation Room. **Depuis le Lot 7 : `record_result` produit aussi une `Evidence` réelle** (D10 refermée, §3). Domaine : `tests/evidence.test.ts`, `tests/domain-cycle.test.ts`. |
| 11 | Clôturer avec résultat | ✅ | `record_result` + `close`. Domaine : `tests/domain-cycle.test.ts`. `test:e2e` : cycle complet jusqu'à `status === "reglee"`. **D10 refermée au Lot 7** — voir §3, ex-limite maintenant close. |
| 12 | Voir l'impact dans le pilotage | ✅ | `/app/pilotage` (`PilotageWorkspace.tsx`, restylé D9 au Lot 7 avec `NationalControlCenter`/`InstitutionDecisionPanel`). `test:e2e`. |
| 13 | Transformer plusieurs besoins en programme | ✅ | `create_initiative` (Lot 5) : regroupement de `ServiceRequest` ouvertes de même intention, seuil ≥ 2. Domaine : `tests/initiative.test.ts`. |
| 14 | Exporter un rapport (PDF ou Excel réel, minimum) | ✅ | `downloadXlsx` (Lot 5, `exceljs`) : fichier `.xlsx` réel vérifié. `/app/etat/rapport` : export `.md` + impression, tracés (source/limite par métrique). |
| 15 | Rejouer le parcours depuis un rôle terrain mobile | ✅ | `/app/terrain` (D9, entrée technique distincte, Lot 6). `test:e2e` : connexion capitaine → confirmation de retour → appel → signal, chacun vérifié en écriture. |

## 2. Les 10 conditions de refus

| # | Condition de refus | Statut | Constat |
|---|---|---|---|
| 1 | Données publiques et privées mélangées | ✅ Absent | Stores strictement séparés (`public-repository.ts` vs `repository.ts`/`accounts-repository.ts`), A17. |
| 2 | Le ministère voit un simple dashboard | ✅ Absent | `InstitutionShell` décision-first (A14, D9). |
| 3 | Démonstration dépendante d'un écran séparé artificiel | ✅ Absent | Mode présentation guidée (Lot 6) rejoue les vraies pages. |
| 4 | Les rôles voient la même chose | ✅ Absent | Institution/Coordination/Terrain : 3 entrées techniques distinctes (D9). **Depuis le Lot 7**, 4 expériences task-first dédiées de plus (opérateur, mareyeur, transformateur, prestataire) au lieu d'un repli générique sur `CoordinatorHub`. |
| 5 | Une situation ne mène pas à une action | ✅ Absent | Action recommandée explicite sur chaque situation. |
| 6 | Les canaux terrain restent décoratifs | ✅ Absent | Corrigé au Lot 6 (retrait d'`UnifiedWorkView`, liens `/terrain/whatsapp`\|`/terrain/telephone` morts). |
| 7 | Rapports non traçables | ✅ Absent | Source/confiance/limite par métrique. |
| 8 | Le design change d'une page à l'autre | ✅ Absent, **2 exceptions délibérées et bornées** | **Fermé au Lot 7** (étape 2/4, 5 commits, 8 pages migrées + 5 panneaux co-rendus). Deux exceptions assumées, pas des oublis : (a) le poste de commande sombre de `ProfessionalAtlasWorkspace.tsx` (carte, positions territoriales) — retouché uniquement pour son code de couleur aurait fait courir un risque de régression sur le code de positionnement qui portait le bug des 18 territoires corrigé avant le Lot 5 ; (b) `/app/situations`, décidé au Lot 3 pour rester sur son propre système au bénéfice des rôles task-first. Les deux sont documentées dans le code (commentaires) et dans les commits `5ab4601`/historique Lot 3. |
| 9 | Le build n'est pas vert | ✅ Absent | Lint/typecheck/test/build/test:e2e verts à chaque étape de chaque lot, sans exception, y compris les 7 commits du Lot 7. |
| 10 | Le mobile est cassé | ✅ Absent | **Fermé au Lot 7** (étape 4/4) : sweep automatisé (scrollWidth vs clientWidth, signal objectif) sur 21 routes / 7 mandats. 1 défaut réel trouvé (`/app/etat`, `shrink-0` empêchant deux boutons de passer à la ligne à 390px) et corrigé ; re-sweep : 21/21 sans débordement, 0 erreur JS. |

## 3. Limites du Lot 6 — état après le Lot 7

| Limite listée à l'issue du Lot 6 | Statut | Ce qui a fermé l'écart |
|---|---|---|
| Pages hors D9 (administration, marches, organisation, durabilite, operations, community, atlas partiel) | ✅ Close | Lot 7, étape 2/4 (5 commits : `8277ffe`, `ef93a54`, `ce7ec89`, `5ab4601`) — 8 pages + `AccessSummary`, `NationalControlCenter`, `InstitutionDecisionPanel`, `AtlasExecutiveSummary` (co-rendus, trouvés en cours de route et migrés avec les pages qui les portent). Reste : les 2 exceptions délibérées du §2.8 ci-dessus. |
| Audit mobile incomplet (seul le Terrain vérifié) | ✅ Close | Lot 7, étape 4/4 (`4371c4c`). Voir `docs/product/PRODUCT_MOBILE_AUDIT.md` — méthode, résultat par mandat, défaut trouvé et corrigé. |
| D10 — coexistence `record_result`/`record_evidence` | ✅ Close | Lot 7, étape 3/4 (`2f37362`). Option B retenue (additive, risque faible) parmi 3 présentées. `record_result` produit désormais aussi une `Evidence` réelle de type `confirmation`. Note de discipline : cet arbitrage a été validé a posteriori par le CEO après un signalement sur la forme de consultation utilisée (voir échange du 2026-08-11) — la décision de fond n'est pas remise en cause, seule la façon dont elle a été soumise l'a été. |
| Rôles hors périmètre (opérateur/mareyeur/transformateur/prestataire sans expérience dédiée) | ✅ Close | Lot 7, étape 1/4 (`672d95e`). `OperatorTaskView.tsx`, `BuyerTaskView.tsx` (mareyeur + transformateur), `ProviderTaskView.tsx`, tous dans `AppShell` (D9 le permet pour Opérateur explicitement ; extension aux 3 autres actée avec le CEO). Écart comblé au passage : `create_service_request` n'avait jamais de formulaire UI (`ServiceRequestForm.tsx`, nouveau). |
| WhatsApp/SMS/téléphonie réels | — Toujours différé | Frontière de périmètre V1 (arbitrage fournisseur séparé, spec §23 « à challenger avant décision »). N'a jamais été une limite du Lot 6 à fermer — reste hors périmètre par construction, pas un oubli. |

**Aucune limite du Lot 6 ne reste ouverte sans explication.** Les deux exceptions du §2.8 sont les seuls écarts restants au design homogène, et elles sont bornées, documentées dans le code et justifiées par un risque de régression réel plutôt que par un manque de temps.

## 4. Recette desktop + mobile — méthode

- **Desktop** (1440×900/1000) : parcours rejoué au navigateur (Playwright) à chaque lot depuis le Lot 4.
- **Mobile** (390×844, `isMobile`/`hasTouch`) : Terrain mobile (Lot 6) puis les 21 routes/7 mandats du Lot 7 (`docs/product/PRODUCT_MOBILE_AUDIT.md`), mesure objective (scrollWidth) plutôt qu'appréciation visuelle seule.
- **`npm run test:e2e`** : couvre le parcours canonique de bout en bout, Institution et Terrain mobile compris (étendu au Lot 6, inchangé depuis).
