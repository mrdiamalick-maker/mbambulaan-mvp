# Mbàmbulaan Produit — Journal de décisions

> Compagnon de `PRODUCT_REFOUNDATION_AUDIT.md` et `PRODUCT_EXECUTION_PLAN.md`. Deux sections : décisions déjà actées (ne pas rouvrir sans raison sérieuse), et décisions qui attendent l'arbitrage du CEO avant que le Lot 1 ne démarre.

---

## 1. Décisions déjà actées

| # | Décision | Source |
|---|---|---|
| A1 | L'ancienne version de Mbàmbulaan Produit (design, parcours, écrans) est non normative. | Spec maître §23 |
| A2 | Le nouveau Produit est conçu à partir de `MBAMBULAAN_PRODUCT_MASTER_SPEC.md`. | Spec maître, CEO |
| A3 | Mbàmbulaan est une infrastructure de coordination de l'économie maritime ; premier domaine : filière halieutique ; premier ancrage : pêche artisanale. | Spec maître §1 |
| A4 | Boucle de coordination unique : Signal → Qualification → Situation → Décision → Engagement → Exécution → Preuve → Résultat → Apprentissage. | Spec maître §4 |
| A5 | Un seul modèle métier, quel que soit le canal (Web, WhatsApp, téléphone, SMS, terrain). | Spec maître §2.2 |
| A6 | Human-in-the-loop : l'IA suggère, ne décide jamais seule. | Spec maître §2.4 |
| A7 | Multi-tenant et permissions granulaires comme cible architecturale ; isolation stricte différée à après la V1. | Spec maître §13 + audit |
| A8 | Atlas professionnel relié aux objets métier (pas une carte décorative) ; Situation Room comme moteur d'action. | Spec maître §5.2, §5.8 |
| A9 | Demandes individuelles et besoins collectifs ; programmes, financements et reporting traçables. | Spec maître §5.6, §5.13, §5.14 |
| A10 | Design et UX entièrement réinventés — aucune reprise des anciens écrans par confort. | Spec maître §10.1 |
| A11 | La démonstration se fait dans le vrai Produit, tenant de démonstration déterministe, jamais une application parallèle. | Spec maître §9.1 |
| A12 | Données de démonstration déterministes, volumétriques, explicitement marquées comme telles. | Spec maître §16 |
| A13 | shadcn/ui est accepté comme **fondation technique de composants**, pas comme direction produit ou UX imposée. | CEO, ce jour |
| A14 | Le shell professionnel peut être partagé entre rôles, mais les expériences doivent être différenciées (décision-first / situation-first / task-first / mobile-first / outcome-first) — jamais deux variantes du même dashboard. | CEO, ce jour |
| A15 | La console Admin (tenants, plans, modules, permissions, canaux, audit, qualité des données) fait partie de la cible mais n'est pas développée maintenant ; son périmètre découlera de l'architecture finale. | CEO, ce jour |
| A16 | L'ancien Produit n'est réutilisable (auth, permissions, composants, persistance, tests) qu'après démonstration qu'il sert directement le nouveau domaine — jamais par défaut. | CEO, ce jour |
| A17 | Le Public n'est pas touché dans ce chantier sauf nécessité technique bloquante ; Public et Produit restent deux expériences distinctes reliées par les objets métier, notamment `ServiceRequest`. | CEO, ce jour |
| A18 | Priorité V1 : démonstration institutionnelle démontrable en 12-15 minutes, scénario Joal / chaîne du froid / machine à glace indisponible, jusqu'au rapport. | CEO, ce jour |
| A19 | Pas de nouveau développement fonctionnel majeur avant l'arbitrage des décisions de la section 2 ci-dessous. | CEO, ce jour |

---

## 2. Décisions à trancher avant le Lot 1

Chaque entrée : la question, les options considérées, une recommandation (pas une décision — le CEO tranche), et pourquoi.

### D1 — Unification de `ServiceRequest`

**Question** : `Need` (Produit) et `PublicRequest` (Public) portent aujourd'hui la même intention avec deux formes différentes. Le spec veut un seul `ServiceRequest` alimenté par tous les canaux.

**Options** :
- (a) Faire converger `Need` vers la forme de `PublicRequest` (canal, source, intention plus riche déjà modélisée).
- (b) Faire converger `PublicRequest` vers la forme de `Need`.
- (c) Garder les deux objets, ajouter une passerelle de conversion entre eux.

**Recommandation** : (a). `PublicRequest` est déjà plus proche de la forme cible (canal, source, intention détaillée) et a été conçu récemment avec cette discipline. Convergence moins coûteuse dans ce sens.

**Impact si reporté** : le Lot 1 ne peut pas livrer un `ServiceRequest` unifié propre ; le Lot 5 (besoin collectif → programme) devra agréger deux formes différentes, plus fragile.

---

### D2 — Refonte de l'Espace État (`field-visit`/`vigilance`) dans le modèle unifié

**Question** : ces deux mini-domaines ont été construits cette semaine comme système isolé, en dehors de `Situation`/`Commitment`. Faut-il les refondre maintenant (Lot 1) ou tolérer leur isolement jusqu'au Lot 2 ?

**Options** :
- (a) Refondre au Lot 1 : un cas de vigilance devient un `Signal`/`Situation` (catégorie sécurité), une mission terrain devient un `Commitment`.
- (b) Les laisser tels quels jusqu'au Lot 2 (reconstruction de l'écran Institution), refondre à ce moment-là.

**Recommandation** : (a). Peu de données réelles existent encore dans ces tables (construites il y a quelques jours) — le coût de migration est minimal maintenant, il augmente à chaque semaine d'usage supplémentaire.

---

### D3 — `Decision` et `Evidence` comme objets de première classe dès la V1

**Question** : le spec veut ces objets explicitement. Est-ce nécessaire pour la démonstration de 12-15 minutes, ou des champs enrichis sur `Situation` suffisent-ils ?

**Options** :
- (a) Objets dédiés dès le Lot 1.
- (b) Champs enrichis sur `Situation` (`decision: {...}`, `evidence: {...}`), promotion en objets séparés plus tard si besoin.

**Recommandation** : (a). La démonstration doit prouver que « chaque action laisse une trace exploitable » (spec §9.2, séquence 5) — un objet `Evidence` typé et réutilisable (photo, document, mesure) est plus convaincant devant un ministère qu'un champ texte, et évite une deuxième migration si le besoin se confirme après la démo.

---

### D4 — Scénario canonique unique ou scénarios de secours

**Question** : le CEO a désigné Joal / chaîne du froid / machine à glace indisponible comme scénario principal. Faut-il en préparer d'autres en réserve ?

**Options** :
- (a) Un seul scénario canonique, approfondi et robuste.
- (b) Deux ou trois scénarios également développés.

**Recommandation** : (a) pour la V1. Un scénario unique mais irréprochable (données cohérentes, tous les objets liés, aucun trou) vaut mieux devant un ministre que plusieurs scénarios à moitié finis. D'autres scénarios (§8.3 à §8.6 du spec) restent documentés comme extensions futures, pas construits maintenant.

---

### D5 — Fournisseur de communication réelle (WhatsApp / SMS / téléphonie)

**Question** : quand et avec quel fournisseur intégrer une communication omnicanale réelle ?

**Options** :
- (a) Différer entièrement au-delà de la V1 — communication simulée et étiquetée comme telle suffit pour la démonstration (explicitement autorisé par le spec §19.1).
- (b) Intégrer un fournisseur réel dès maintenant (WhatsApp Business Cloud API, Twilio…).

**Recommandation** : (a). Une intégration réelle suppose un compte Meta Business vérifié, un numéro dédié, des coûts récurrents et un délai d'approbation — aucun de ces éléments n'est sous le contrôle direct de l'équipe produit à ce stade, et le spec autorise explicitement le simulé pour la V1.

---

### D6 — Stack cartographique de l'Atlas

**Question** : l'Atlas national/territorial a-t-il besoin d'une vraie librairie cartographique (Mapbox, Leaflet…) ou la représentation actuelle (illustrative, sans fond de carte réel) suffit-elle pour la démonstration ?

**Recommandation** : ne pas trancher maintenant — à évaluer concrètement au Lot 2, une fois la maquette de la vue nationale posée. Le spec liste ce point comme « à challenger avant décision », pas comme urgent.

---

### D7 — Réorganisation physique de `src/domain/*`

**Question** : réorganiser maintenant vers l'arborescence cible du spec (§14.4), ou après stabilisation du modèle métier ?

**Recommandation** : après (Lot 1 terminé et stable). Réorganiser des dossiers en même temps qu'on ajoute des objets multiplie le risque de régression pour un bénéfice purement cosmétique à ce stade.

---

### D8 — Sort des 4 fichiers de domaine à usage unique

**Question** : `coordination-engine.ts`, `institution/decision-engine.ts`, `national/national-engine.ts`, `value-engine.ts` ne sont chacun utilisés que par un seul composant, tous en lien avec la zone Institution/National qui sera reconstruite au Lot 2.

**Recommandation** : les réviser avant de coder le Lot 2 plutôt que de les supprimer aveuglément avec le reste du Lot 0 — ils peuvent contenir des idées de présentation ou de calcul valables même si leur UI actuelle est remplacée.

---

## 3. Décisions explicitement hors de ce document

Modèle tarifaire, contrats institutionnels, hébergement de production final : différés, non nécessaires pour trancher le Lot 1 ni pour la démonstration institutionnelle V1 (cohérent avec spec §23 « à challenger avant décision » / « plus tard »).
