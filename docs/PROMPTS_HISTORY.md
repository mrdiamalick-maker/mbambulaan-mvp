# Historique des prompts et missions Mbàmbulaan

## Statut du document

Ce document reconstitue l'historique des prompts et missions connus du projet Mbàmbulaan à partir :

- du fil Codex disponible ;
- des documents présents dans le dépôt ;
- des noms de pièces jointes mentionnées dans le fil ;
- des livrables déjà créés dans `docs/` et `docs/packs/`.

Il ne crée aucune nouvelle vision produit. Il sert de mémoire de travail pour retrouver la séquence des demandes, des packs et des documents produits.

Quand le prompt exact n'est pas entièrement récupérable, la ligne est marquée `reconstitué`.

## 1. Accès GitHub et initialisation

| Ordre | Mission | Statut | Livrable connu |
| --- | --- | --- | --- |
| 1 | Vérifier l'accès au dépôt GitHub `mrdiamalick-maker/mbambulaan-mvp` via le plugin GitHub connecté | connu | Accès dépôt confirmé |
| 2 | Vérifier si le dépôt est vide ou non | connu | État dépôt vérifié |
| 3 | Créer la branche `build/001-landing-page` | connu | Branche créée |
| 4 | Créer un commit minimal d'initialisation avec `README.md` et `.gitignore` Node / Next.js, sans code applicatif | connu | Commit initial |
| 5 | Vérifier l'accès en écriture avec `STATUS.md` contenant `Codex write access OK` | connu | Commit `chore: verify GitHub write access` |

## 2. MVP fonctionnel initial

| Pack | Objectif | Contraintes principales | Livrables connus |
| --- | --- | --- | --- |
| Build 001 | Créer la première version professionnelle du MVP | Next.js 15, TypeScript, Tailwind, architecture propre, mock data | Landing page, sections Hero, projet, acteurs, fonctionnalités, bénéfices, footer |
| Revue Build 001 | Revoir le build initial | Ne modifier aucun fichier | Arborescence, vérification `app/` vs `src/app/`, démarrage, capture |
| Sprint 002 | Faire fonctionner la route `/` et afficher la landing page | Ignorer npm, Watchpack, EMFILE ; travailler uniquement le code | Correction route racine |
| Sprint 003 | Créer `/arrivages` | Mock JSON local, recherche, filtre statut, badges, responsive, retour accueil | Page Arrivages |
| Sprint 004 | Permettre à un pêcheur de déclarer un arrivage | État React local, aucun backend, aucune API | Modal ou drawer de déclaration, validation, ajout immédiat |
| Sprint 005 | Créer le parcours `Publier un besoin` sur `/besoins` | Même design system que `/arrivages`, données locales | Liste besoins, modal, recherche, filtre urgence, stats |
| Sprint 006 | Créer le matching entre Arrivages et Besoins | Matching simple : même espèce et quantité disponible suffisante | `src/lib/matching.ts`, `/opportunites` |

## 3. MVP coordination et pilotage

| Pack | Objectif | Livrables connus |
| --- | --- | --- |
| Pack MVP 002 | Transformer une opportunité en proposition de mise en relation | Opportunité enrichie, bouton `Je suis intéressé`, détail opportunité |
| Pack MVP 003 | Créer le Dashboard MVP | `/dashboard`, KPI, activité quais, espèces demandées, opportunités récentes, lecture institutionnelle |
| Pack MVP 004 | Centraliser le moteur métier | `src/lib/coordination.ts`, fonctions `computeMatching`, `computeCompatibility`, `computePriority`, `computeDashboardMetrics`, `computeAlerts` |
| Épopée 1 - Vision territoriale | Transformer Mbàmbulaan en plateforme territoriale | `/quais`, carte SVG Sénégal, `src/lib/map.ts`, panneau quai |
| Pack Notifications | Créer un centre de notifications métier | `/notifications`, notifications automatiques, badge header, dernières notifications dashboard |
| Pack Réservation | Ajouter la réservation d'une opportunité | Bouton `Réserver ce lot`, statut `Réservée`, dashboard mis à jour, notification |
| Stabilisation MVP | Revue qualité rapide et correction des problèmes bloquants | Navigation, boutons principaux, mobile, build |
| Pack MVP 005 | Créer le suivi transaction après réservation | `/transactions`, états de transaction, progression depuis fiche opportunité |
| Pack Parcours Démo MVP | Créer `/demo` comme parcours guidé | Timeline pêcheur -> arrivage -> besoin -> opportunité -> réservation -> transaction -> notifications -> dashboard -> carte |
| Pack MVP 006 | Créer les espaces adaptés aux acteurs | `/espaces`, pages pêcheur, mareyeur, transformateur, collectivité, admin |
| Pack MVP 007 | Créer le centre de coordination | `/coordination`, six panneaux, simulation, réinitialisation journée |
| Pack MVP 008 | Améliorer l'expérience de démonstration | Démo guidée, progression visuelle, résumé final, bouton Démonstration sur landing |

## 4. Intelligence métier

| Pack | Objectif | Livrables connus |
| --- | --- | --- |
| Pack IM 001 | Créer le moteur de recommandation | `src/lib/recommendation.ts`, score, explication dans opportunité, top recommandations |
| Pack IM 002 | Transformer les mocks en référentiel crédible | `src/lib/reference.ts`, quais, espèces, profils acteurs, statuts métier |
| Pack IM 003 | Créer le score de confiance des acteurs | `src/lib/trust.ts`, badges confiance, explications, KPI dashboard |
| Pack IM 004 | Créer les indicateurs d'impact métier | `src/lib/impact.ts`, impact journée, démo, coordination |
| Pack IM 005 | Créer le moteur de tension territoriale | `src/lib/tension.ts`, tensions par quai, espèces, zones prioritaires |
| Pack IM 006 | Créer le moteur de priorisation métier | `src/lib/prioritization.ts`, priorités besoins, opportunités, actions |
| Pack IM 007 | Créer le moteur d'alertes intelligentes | `src/lib/alerts.ts`, alertes critiques, coordination, dashboard, notifications, démo |
| Pack IM 008 | Créer le moteur de traçabilité métier | `src/lib/traceability.ts`, historique lot, transactions, dashboard, coordination, démo |
| Reprise Pack IM 008 | Finaliser proprement la traçabilité interrompue | Finalisation logique centralisée, tests `tsc`, `next build` |
| Pack IM 009 | Créer le moteur de qualité des lots | `src/lib/quality.ts`, score qualité, fraîcheur, risque gaspillage |
| Pack IM 010 | Créer le moteur de simulation d'une journée de pêche | `src/lib/daySimulation.ts`, chronologie, démo, dashboard, coordination, notifications |
| Pack IM 011 | Créer les recommandations par rôle | `src/lib/roleRecommendations.ts`, espaces métiers, dashboard, coordination, démo |
| Pack IM 012 | Créer la vue exécutive institutionnelle | `src/lib/executive.ts`, `/executive`, dashboard, coordination, démo |

## 5. Premium UI et revue MVP

| Pack | Objectif | Livrables connus |
| --- | --- | --- |
| Pack Premium 001 | Harmoniser l'UX/UI du MVP | Mini design system local, Dashboard, Coordination, Démo, pages métiers |
| Pack Premium 002 | Étendre l'harmonisation à toutes les pages métier | Arrivages, Besoins, Opportunités, Fiche, Transactions, Notifications, Quais, Espaces, Executive |
| Pack Premium 003 | Transformer `/demo` en parcours narratif premium | Introduction forte, étapes numérotées, progression, conclusion, CTA internes |
| Revue MVP complète | Auditer routes principales et corriger uniquement les problèmes simples | Vérification cohérence, liens, TypeScript, build |

## 6. Packs frontend et produit via pièces jointes

Ces prompts ont été fournis comme pièces jointes. Le contenu exact n'est pas entièrement disponible dans le fil courant, mais les intitulés sont connus.

| Pièce jointe | Statut | Intention connue |
| --- | --- | --- |
| `PACK DEMO UX 001 Objectif Refondre complètement l’expérience de la page /demo...` | reconstitué | Refonte UX de `/demo` |
| `PACK DEMO UX 002 Objectif Corriger la PR #2 et refondre l’expérience produit Mb...` | reconstitué | Correction PR #2 et refonte expérience produit |
| `PACK FRONTEND SENIOR 001 Objectif Reprendre la PR #2 en profondeur...` | reconstitué | Reprise frontend approfondie |
| `PACK FRONTEND RESET 001 Objectif Abandonner la direction frontend actuelle...` | reconstitué | Reset direction frontend |
| `PACK BRAND EXPERIENCE 001 Objectif Reprendre la PR #2 en intégrant une vraie...` | reconstitué | Direction brand experience |
| `PACK BRAND UX CORRECTION 002 — VERSION MISE À JOUR Objectif Corriger la PR #2...` | reconstitué | Correction brand UX |
| `PACK FRONTEND FINAL PRESENTATION 001 Objectif Faire une dernière passe frontend...` | reconstitué | Dernière passe de présentation frontend |
| `PACK PRODUCT GENIUS 001 Objectif Faire une passe produit/frontend forte...` | reconstitué | Passe produit/frontend forte |

## 7. Audit et orchestration produit

| Pack | Objectif | Fichier produit |
| --- | --- | --- |
| Pack Product Audit 001 | Auditer complètement le produit Mbàmbulaan avant nouvelle itération frontend | `docs/PRODUCT_AUDIT.md` |
| Pack Product Orchestration 001 | Réorganiser le MVP autour de l'orchestration produit | `docs/PRODUCT_ORCHESTRATION.md` |

## 8. Référentiels stratégiques v1

| Mission | Objectif | Fichier produit |
| --- | --- | --- |
| Mission Pack MP-01 | Créer le Product Blueprint v1.0 | `docs/01_PRODUCT_BLUEPRINT.md` |
| Mission Pack MP-02 | Créer la Functional Architecture v1.0 | `docs/02_FUNCTIONAL_ARCHITECTURE.md` |
| Mission Pack 03 | Créer le Business Model & Go-to-Market | `docs/03_BUSINESS_MODEL.md` |
| Mission Pack 04 | Créer les Actor Journeys | `docs/04_ACTOR_JOURNEYS.md` |
| Mission Pack 05 | Créer l'UX Target, Information Architecture et Navigation Model | `docs/05_UX_INFORMATION_ARCHITECTURE.md` |
| Mission Pack 06 | Créer le Design System | `docs/06_DESIGN_SYSTEM.md` |
| Mission Pack 07 | Créer le Product Backlog officiel | `docs/07_PRODUCT_BACKLOG.md` |
| Mission Pack 08 | Créer l'Engineering Blueprint officiel | `docs/08_ENGINEERING_BLUEPRINT.md` |
| Mission Pack 09 | Consolider les huit documents précédents dans le Product Book | `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md` |

## 9. Capabilities produit découpées en packs

| Mission | Capability | Fichier produit | Statut |
| --- | --- | --- | --- |
| Mission Pack 10 | Public Experience | `docs/packs/PACK_01_PUBLIC_EXPERIENCE.md` | créé |
| Mission Pack 11 | Admin Platform | `docs/packs/PACK_02_ADMIN_PLATFORM.md` | créé |
| Mission Pack 03 | Fisher Network | `docs/packs/PACK_03_FISHERS.md` | créé |

## 10. Prompts récents reconstitués

### Mission Pack 09 - Product Book

Créer `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Contraintes connues :

- ne pas créer de nouvelles idées ;
- ne pas modifier la vision ;
- ne pas inventer de nouveaux modules ;
- consolider uniquement les documents 01 à 08 ;
- produire un document utilisable par investisseur, CTO, Product Manager, UX Designer, développeur et partenaire.

Chapitres demandés :

1. Executive Summary
2. Vision
3. Les problèmes résolus
4. Les utilisateurs
5. Les personas
6. Les propositions de valeur
7. Les moteurs métier
8. Les modules
9. Les espaces
10. Les parcours
11. Les parcours de démonstration
12. Les modèles économiques
13. Les offres
14. Les règles produit
15. Les règles UX
16. Les règles Engineering
17. Les principes Design
18. Les principes IA
19. Les principes Sécurité
20. Les principes Data
21. Les KPIs
22. Les Roadmaps
23. Les décisions ouvertes
24. Glossaire
25. Annexes

Fin attendue :

- commit ;
- résumé ;
- nombre de chapitres ;
- nombre de pages équivalent ;
- nombre de diagrammes référencés ;
- nombre de tableaux ;
- lien PR.

### Mission Pack 10 - Public Experience

Créer `docs/packs/PACK_01_PUBLIC_EXPERIENCE.md`.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Capability : `PUBLIC EXPERIENCE`.

Question centrale :

> Pourquoi un visiteur resterait sur le site et demanderait une démonstration ?

Sections demandées :

1. Vision
2. Pages
3. Navigation
4. Démonstrations
5. Conversion
6. UX
7. Composants
8. User Stories
9. APIs
10. Analytics
11. Tests
12. Definition of Done

Pages demandées :

- Landing
- Vision
- Solutions
- Cas d'usage
- Impact
- Tarifs
- À propos
- FAQ
- Contact
- Démo

Démonstrations demandées :

- Démo Investisseur
- Démo État
- Démo Collectivité
- Démo ONG
- Démo Entreprise
- Démo Institution
- Démo Coopérative

Fin attendue :

- commit ;
- résumé ;
- nombre de pages ;
- nombre de composants ;
- nombre de User Stories ;
- nombre de tests ;
- lien PR.

### Mission Pack 11 - Admin Platform

Créer `docs/packs/PACK_02_ADMIN_PLATFORM.md`.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Capability : `ADMIN PLATFORM`.

Positionnement :

- back-office utilisé exclusivement par l'équipe Mbàmbulaan ;
- pas un espace client ;
- cockpit de l'entreprise.

Sections demandées :

1. Vision
2. Utilisateurs
3. Espaces
4. Tous les parcours
5. Toutes les permissions
6. Données
7. IA
8. APIs
9. UX
10. User Stories
11. Tests
12. Definition of Done

Utilisateurs demandés :

- Super Admin
- Admin Produit
- Admin Données
- Admin IA
- Support
- Customer Success
- Opérations Terrain
- Data Manager

Espaces demandés :

- Dashboard
- Organisation
- Utilisateurs
- Permissions
- Territoires
- Communautés
- Pêcheurs
- Marayeurs
- Déclarations
- Validation
- Alertes
- Opportunités
- Marchés
- Prix
- Projets
- Programmes
- Contenus
- Notifications
- Catalogue IA
- API
- Logs
- Analytics
- Configuration
- Facturation
- CRM
- Support
- Audit

Fin attendue :

- commit ;
- résumé ;
- nombre de pages ;
- nombre de composants ;
- nombre de User Stories ;
- nombre de tests ;
- lien PR.

### Mission Pack 03 - Fisher Network

Créer `docs/packs/PACK_03_FISHERS.md`.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Capability : `FISHER NETWORK`.

Positionnement :

- couvre tout ce qui concerne les pêcheurs ;
- le pêcheur n'est pas un utilisateur numérique par défaut ;
- le produit crée un réseau humain de confiance ;
- le digital simplifie seulement les interactions.

Sections demandées :

1. Vision
2. Personas
3. Acquisition
4. Déclarations
5. Validation
6. Cycle de vie
7. Données
8. IA
9. UX
10. User Stories
11. Tests
12. Definition of Done

Personas demandés :

- Pêcheur référent
- Pêcheur occasionnel
- Président de GIE
- Capitaine
- Jeune pêcheur
- Femme pêcheuse

Canaux de déclaration demandés :

- Déclaration WhatsApp
- Appel téléphonique
- SMS
- Application
- Agent terrain
- Import API
- Import manuel

Fin attendue :

- commit ;
- résumé ;
- nombre de pages ;
- nombre de composants ;
- nombre de User Stories ;
- nombre de tests ;
- lien PR.

## 11. Documents actuellement connus dans le dépôt

| Fichier | Rôle |
| --- | --- |
| `docs/01_PRODUCT_BLUEPRINT.md` | Vision produit |
| `docs/02_FUNCTIONAL_ARCHITECTURE.md` | Architecture fonctionnelle |
| `docs/03_BUSINESS_MODEL.md` | Business model et go-to-market |
| `docs/04_ACTOR_JOURNEYS.md` | Parcours acteurs |
| `docs/05_UX_INFORMATION_ARCHITECTURE.md` | Information architecture UX |
| `docs/06_DESIGN_SYSTEM.md` | Design system |
| `docs/07_PRODUCT_BACKLOG.md` | Backlog produit |
| `docs/08_ENGINEERING_BLUEPRINT.md` | Référentiel engineering |
| `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md` | Document consolidé de référence |
| `docs/PRODUCT_AUDIT.md` | Audit produit |
| `docs/PRODUCT_ORCHESTRATION.md` | Orchestration produit |
| `docs/packs/PACK_01_PUBLIC_EXPERIENCE.md` | Capability Public Experience |
| `docs/packs/PACK_02_ADMIN_PLATFORM.md` | Capability Admin Platform |
| `docs/packs/PACK_03_FISHERS.md` | Capability Fisher Network |

## 12. Points à compléter si la discussion ChatGPT est retrouvée

| Élément | Pourquoi compléter |
| --- | --- |
| Prompts exacts des pièces jointes frontend | Le fil ne contient que les noms de fichiers attachés |
| Prompt complet Mission Pack MP-01 | Connu par livrable mais détail exact partiellement reconstitué |
| Prompt complet Mission Pack MP-02 | Connu par livrable mais détail exact partiellement reconstitué |
| Prompt complet Mission Pack 04 | Fourni en pièce jointe, détail exact absent du fil courant |
| Prompt complet Mission Pack 06 | Fourni en pièce jointe, détail exact absent du fil courant |
| Éventuels prompts intermédiaires non envoyés à Codex | Ils peuvent n'exister que dans l'ancienne discussion ChatGPT |

## 13. Prochaine utilisation recommandée

Ce fichier peut servir à :

- reprendre la séquence de missions sans dépendre de l'ancienne discussion ChatGPT ;
- créer les prochains packs de capability en gardant la même structure ;
- vérifier qu'une nouvelle demande ne contredit pas le Product Book ;
- reconstruire un backlog de prompts ;
- documenter l'origine des fichiers présents dans `docs/`.
