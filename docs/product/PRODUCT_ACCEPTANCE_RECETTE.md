# Mbàmbulaan Produit — Recette d'acceptation (Lot 6, étape 4/4)

> Vérification des 15 critères d'acceptation du spec maître (§21), un par un, plus les 10 conditions de refus. Recette desktop + mobile. Référence : `docs/product/MBAMBULAAN_PRODUCT_MASTER_SPEC.md` §21, `docs/product/PRODUCT_EXECUTION_PLAN.md` Lot 6.

## Statut global

**Le Produit satisfait les 15 critères §21 sur le parcours canonique** (vue nationale → territoire Joal → signal → situation → décision → coordination → engagements → preuve → résultat → besoin collectif → programme/financement → rapport → rejeu terrain mobile). Le build est vert (lint/typecheck/test/build/test:e2e) à chaque étape des Lots 0 à 6. Les limites assumées sont documentées en fin de fichier — aucune n'est cachée sous un critère coché à tort.

## 1. Les 15 critères (§21)

| # | Critère | Statut | Preuve |
|---|---|---|---|
| 1 | Ouvrir la vue nationale | ✅ | `/app/etat` (InstitutionShell, D9, Lot 2). `test:e2e` (`expectOk("/app/etat")` sous mandat institution). Capture `guide-step1-etat.png`. |
| 2 | Identifier un territoire prioritaire | ✅ | Carte territoriale sur `/app/etat` : statut stable/vigilance/critique visible par couleur, Joal-Fadiouth en critique dans le jeu de démonstration. |
| 3 | Ouvrir sa fiche | ✅ | Sélection d'un territoire sur la carte ouvre `TerritoryDecisionPanel` (même page, `/app/etat`). |
| 4 | Voir une situation et sa source | ✅ | Fiche situation affiche canal (Signal reçu/Poste de quai), niveau de confiance (Déclarée/Vérifiée…) et référence (`MBA-SIT-…`). Capture `guide-step6-situation-room.png`. |
| 5 | Comprendre l'impact | ✅ | Bloc « Impact clé » sur `/app/etat` (FCFA exécuté, territoires suivis, signaux traités). Capture `guide-step1-etat.png`. |
| 6 | Ouvrir la Situation Room | ✅ | `/app/situations/[id]` (D9, Lot 4). `test:e2e` (`expectOk("/app/situations/sit-glace")`). |
| 7 | Voir acteurs, décisions, engagements | ✅ | `CoordinationProposal.tsx` (Lot 4) : acteurs mobilisés, décisions (`create_decision`), engagements avec statut. Domaine : `tests/decision.test.ts`. Capture `d9-coordination-detail.png`. |
| 8 | Mobiliser ou sélectionner une capacité | ✅ | `accept_opportunity`/`complete_logistics`. Domaine : `tests/operations-cycle.test.ts`. `test:e2e` : cycle pirogue complet (débarquement → lots → opportunité → engagement → résultat). |
| 9 | Préparer une communication | ✅ | `log_communication` (simulée, D5). `CommunicationForm.tsx` (Lot 4) côté Situation Room ; `TerrainCaptainView.tsx` (Lot 6) côté terrain. Domaine : `tests/communication.test.ts`. `test:e2e` (appel simulé capitaine). |
| 10 | Enregistrer une preuve | ✅ | `record_evidence`, objet `Evidence` de première classe (D3). Panneau Preuve, Situation Room (Lot 4). Domaine : `tests/evidence.test.ts`. |
| 11 | Clôturer avec résultat | ✅ | `record_result` + `close`. Domaine : `tests/domain-cycle.test.ts`. `test:e2e` : cycle complet jusqu'à `status === "reglee"`. Dette ouverte documentée en D10 (coexistence avec `record_evidence`, non refermée sans arbitrage — voir « Limites »). |
| 12 | Voir l'impact dans le pilotage | ✅ | `/app/pilotage` (`PilotageWorkspace.tsx`). `test:e2e` (`expectOk("/app/pilotage")`). |
| 13 | Transformer plusieurs besoins en programme | ✅ | `create_initiative` (Lot 5) : regroupement de `ServiceRequest` ouvertes de même intention, seuil ≥ 2. `CollectiveNeedsPanel.tsx` + `InitiativeForm.tsx`, `/app/initiatives`. Domaine : `tests/initiative.test.ts`. Capture `initiatives-apres-creation.png` (portefeuille 8→9 après création réelle). |
| 14 | Exporter un rapport (PDF ou Excel réel, minimum) | ✅ | `downloadXlsx` (Lot 5, `exceljs`) : fichier `.xlsx` réel vérifié (`file` → *Microsoft Excel 2007+*, `xl/worksheets/sheet1.xml` présent). `/app/etat/rapport` : export `.md` + impression déjà réels et tracés (source/limite par métrique), non refaits. |
| 15 | Rejouer le parcours depuis un rôle terrain mobile | ✅ | `/app/terrain` (D9, entrée technique distincte, Lot 6). `TerrainCaptainView.tsx` : prochaine action réelle (`state.trips`), confirmation en un geste (`announce_return`), appel/WhatsApp simulés (`log_communication`), signalement minimal (`create_signal`). `test:e2e` : connexion capitaine → confirmation de retour (`en_mer`→`retour_annonce`) → appel → signal, chacun vérifié en écriture. Capture `terrain-mobile-after-signal.png` (mobile 390×844) et `terrain-desktop.png`. |

## 2. Les 10 conditions de refus

| # | Condition de refus | Statut | Constat |
|---|---|---|---|
| 1 | Données publiques et privées mélangées | ✅ Absent | Stores strictement séparés (`public-repository.ts` vs `repository.ts`/`accounts-repository.ts`), confirmé sur tout l'engagement (A17). |
| 2 | Le ministère voit un simple dashboard | ✅ Absent | `InstitutionShell` décision-first (A14, D9) : fil national → territoire → situation, pas une grille de widgets. |
| 3 | Démonstration dépendante d'un écran séparé artificiel | ✅ Absent | Mode présentation guidée (Lot 6) rejoue les vraies pages (`href` vers `/app/etat`, `/app/situations/sit-glace`, `/app/pilotage`, `/app/initiatives`, `/app/etat/rapport`, `/app/terrain`) — aucune page de démonstration dédiée. |
| 4 | Les rôles voient la même chose | ✅ Absent | Trois entrées techniques distinctes (Institution/Coordination/Terrain, D9) + contenu différencié (`CoordinatorHub` vs `TerrainCaptainView` vs Institution). |
| 5 | Une situation ne mène pas à une action | ✅ Absent | Chaque situation porte une action recommandée explicite (ex. « Qualifier le signal »), visible en capture. |
| 6 | Les canaux terrain restent décoratifs | ✅ Absent **(corrigé ce lot)** | Avant le Lot 6 : `UnifiedWorkView`/`WorkFocus` pointaient vers `/terrain/whatsapp` et `/terrain/telephone`, deux routes inexistantes — retiré (étape 1/4) et remplacé par une expérience réelle branchée sur le state (étape 2/4). |
| 7 | Rapports non traçables | ✅ Absent | Rapport bailleurs : source/confiance/limite par métrique (déjà en place, préservé). Export `.xlsx` : mêmes lignes de données que l'export existant, pas une nouvelle source non tracée. |
| 8 | Le design change d'une page à l'autre | ⚠️ Partiel — voir Limites | Le parcours canonique (Institution/Coordinateur/Situation Room/Terrain/Initiatives/Coordination détail) est en D9 homogène. Des pages hors de ce parcours restent sur d'anciens systèmes visuels (voir §3). |
| 9 | Le build n'est pas vert | ✅ Absent | Lint/typecheck/test/build/test:e2e verts à chaque étape de chaque lot, sans exception, vérifié à l'instant pour ce commit. |
| 10 | Le mobile est cassé | ⚠️ Partiel — voir Limites | Le Terrain mobile (rôle capitaine) est vérifié réel en viewport 390×844. Les autres pages du parcours canonique (Institution, Coordination, Situation Room) utilisent des composants shadcn responsives par défaut mais n'ont pas fait l'objet d'un audit mobile dédié dans ce lot. |

## 3. Limites connues, assumées et non cachées

- **Pages hors D9** : `/app/administration`, `/app/marches`, `/app/organisation`, `/app/durabilite`, `/app/operations`, `/app/community` et une partie de `/app/atlas` restent sur d'anciens systèmes visuels (sarcelle pré-D9 ou système ocean/lagoon). `/app/situations` reste **intentionnellement** sur son propre système pour les rôles task-first (décidé au Lot 3). `/app/administration` a été explicitement reporté au « polish général du Lot 6 » par le CEO mais n'a pas été traité dans cette étape — la bascule complète du Produit vers D9 n'est donc pas terminée.
- **Audit mobile** : seul le Terrain mobile (nouveau ce lot) a été vérifié en viewport réduit. Les autres pages n'ont pas été passées une à une en revue mobile — elles héritent des composants shadcn (responsives par construction) sans garantie testée page par page.
- **D10 (dette ouverte, log de décision)** : `record_result` (texte libre) et `record_evidence` (objet réel) coexistent sans être réconciliés depuis le Lot 4 — décision explicite de ne pas la refermer sans arbitrage CEO dédié. Le critère 11 est satisfait tel quel (les deux mécanismes fonctionnent), la dette reste ouverte.
- **rôles hors périmètre du Lot 6** : opérateur/mareyeur/transformateur/prestataire n'ont pas d'expérience terrain dédiée — ils retombent sur `CoordinatorHub` (`/app/travail`) depuis le retrait d'`UnifiedWorkView`. Un seul rôle terrain (capitaine) a été retenu avec le CEO pour ce lot.
- **WhatsApp/SMS/téléphonie réels** : toujours simulés (D5), intégration réelle différée (arbitrage fournisseur séparé, hors périmètre V1).

## 4. Recette desktop + mobile — méthode

- **Desktop** (1440×900) : parcours rejoué au navigateur (Playwright) à chaque lot depuis le Lot 4, captures conservées dans les commits correspondants.
- **Mobile** (390×844, `isMobile`/`hasTouch`) : Terrain mobile (capitaine) rejoué intégralement — connexion, confirmation de retour, appel simulé, signalement — captures `terrain-mobile-initial.png`/`terrain-mobile-after-signal.png`.
- **`npm run test:e2e`** : couvre désormais le parcours canonique de bout en bout (Institution + Terrain mobile compris), conformément au critère d'acceptation du Lot 6.
