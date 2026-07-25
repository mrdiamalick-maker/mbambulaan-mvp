# Audit critique — Mbàmbulaan
### Comité indépendant (McKinsey Partner transformation publique · VC Partner SaaS B2B · CPO plateformes à grande échelle · Architecte DDD/EDA senior · Expert UX faible connectivité · Spécialiste politiques publiques africaines · Entrepreneur marchés émergents)

**Sources effectivement consultées** : dépôt `mrdiamalick-maker/mbambulaan-mvp`, branche `docs/blueprint-produit-1.0` (tarball complet téléchargé et lu) — `docs/blueprint-produit-1.0/*` (10 fichiers), `docs/blueprint-produit-1.1/*` (11 fichiers), `docs/blueprint-produit-1.2/*` (4 fichiers), ainsi que `README.md`, `PRODUCT_AUDIT.md`, `RISKS.md`, `DECISIONS.md`, `MVP_ROADMAP.md`, `MVP_FREEZE_NOTE.md`, `FOUNDER_NOTES.md`, `package.json`, et l'arborescence complète de `src/` (174 fichiers). Les ~100 autres fichiers `docs/*.md` (séries CODEX_V2 à V15, TERA_PROMPT, PACK_*) ont été inventoriés mais non lus intégralement ; leur volume est en soi une donnée d'audit (cf. §5).

---

## 1. Résumé exécutif

Mbàmbulaan présente une **vision stratégique cohérente et bien argumentée sur le papier** (théorie du changement, alignement d'intérêts multi-acteurs, discipline de « quatre niveaux de valeur »), mais le dépôt révèle un **écart massif entre l'ambition documentée et la réalité livrée**, ainsi que **au moins quatre définitions concurrentes et non réconciliées du produit et de son MVP**, écrites à des moments différents, avec des vocabulaires différents, sans qu'aucun document ne signale explicitement lequel fait foi.

Concrètement :

- Le code livré (`package.json`) est une **application Next.js statique sans API, sans base de données, sans authentification et sans backend d'aucune sorte** — uniquement `next`, `react`, `tailwind`. Toutes les données (`src/data/*.ts`) sont explicitement commentées comme « mockées ».
- Le Blueprint 1.0/1.1 décrit en parallèle une architecture de **12 moteurs métier**, **13 bounded contexts DDD**, un **event catalog** complet, une **API versionnée avec idempotence, webhooks, offline-first** — c'est-à-dire une architecture de plateforme nationale de production. Aucun de ces éléments n'existe dans le code.
- Le propre `MVP_ROADMAP.md` de l'équipe place l'authentification, l'API, la base de données et les données réelles en **Phase 4 (dernière phase)**, après une « Phase 3 — MVP Premium » consacrée au storytelling visuel. C'est un **ordre d'ingénierie inversé** : on peaufine l'expérience avant d'avoir la moindre fondation fonctionnelle.
- Le projet affirme dans `DECISIONS.md` et dans le Blueprint que Mbàmbulaan « n'est pas une simple marketplace », mais son propre `MVP_ROADMAP.md` indique que la Phase 1, **quasiment terminée**, est composée de : arrivages, besoins, **matching automatique**, opportunités, **réservation**, **transactions** — soit, fonctionnellement, une marketplace d'appariement offre/demande. Le positionnement affiché et le produit réellement construit se contredisent.
- Le dépôt contient plus d'une centaine de documents markdown, dont des dizaines de prompts d'itération (« CODEX_V2 » à « CODEX_V15 », plusieurs « TERA_PROMPT »), et le code source contient des composants dupliqués/rebâtis en parallèle (`MinistryControlTower.tsx`, `MinistryControlTowerParts.tsx`, `MinistryV3Components.tsx`, `MinistryV4Components.tsx`, deux arborescences de « espaces » par rôle : `espace-prive/*` et `espaces/*`). Le `MVP_FREEZE_NOTE.md` reconnaît lui-même ce problème (« arrêt des nouveaux packs documentaires »).

Ce n'est donc pas, à ce stade, un dossier prêt pour une décision d'investissement de 5 M€ ni pour un soutien institutionnel. C'est un **dossier de vision produit de haute qualité conceptuelle**, adossé à un **prototype de démonstration** (un site vitrine interactif avec données fictives), sans aucune preuve d'usage terrain, sans architecture technique réelle, et avec une confusion stratégique non résolue sur ce qu'est réellement Mbàmbulaan.

---

## 2. Verdict global

**Oui, sous conditions strictes — mais pas dans l'état actuel du dossier.** La vision et la méthode de conception (théorie du changement, discipline « qui utilise/bénéficie/décide/paie », critères d'admission de fonctionnalité) sont d'un niveau rare pour un stade pré-seed. Mais le produit tel que documenté est **massivement surdimensionné** par rapport à ce qui est réellement construit et par rapport à ce qui a été validé sur le terrain (zéro preuve terrain n'apparaît dans le dépôt — aucune donnée d'usage réel, aucun retour d'acteur cité nommément, aucune métrique observée). Le risque numéro un n'est pas technique : c'est que l'équipe continue à documenter et complexifier un système avant d'avoir testé la moindre hypothèse avec de vrais pêcheurs, mareyeurs ou agents territoriaux.

---

## 3. Vision, problème, positionnement

**Vision** — Claire dans son intention (« infrastructure de confiance », théorie du changement information→confiance→coordination→décision→action→résultat), mais elle décrit un résultat systémique (transformation de toute une filière) sans qu'aucune preuve de causalité ne soit apportée. C'est une hypothèse, présentée avec la certitude d'une thèse validée. Des infrastructures de coordination similaires existent déjà dans le développement international sous d'autres noms (systèmes d'information de gestion de projets/bailleurs — type DHIS2 dans la santé, plateformes de type Kobo/ODK pour la collecte terrain, CommCare) : le document ne les mentionne jamais et ne démontre donc pas en quoi Mbàmbulaan serait différenciant plutôt que redondant avec des outils déjà éprouvés et gratuits/open source dans des contextes comparables.

**Problème** — Le problème décrit (fragmentation de l'information, doublons de financement, silos institutionnels) est réel et documenté dans la littérature du développement, mais le document ne cite **aucune donnée primaire propre au Sénégal** (pas de chiffre de pertes post-capture, pas de nombre de pêcheurs concernés, pas de témoignage). Tout est formulé au niveau générique « la filière souffre de X ». Un comité d'investissement demandera : combien de FCFA perdus par an à cause de ce problème précis, mesurés comment, par qui ?

**Positionnement** — C'est le point le plus fragile. Le Blueprint affirme sept fois plutôt qu'une que Mbàmbulaan n'est « ni une marketplace, ni un ERP, ni un CRM, ni un dashboard ». Mais :
1. le roadmap réel de développement démontre une marketplace (matching, réservation, transactions) ;
2. le « moteur des investissements », le « moteur de décision », le « moteur de mesure et d'impact » recouvrent des fonctions de CRM/ERP de portefeuille de projets, déjà couvertes par des outils comme Salesforce, Airtable, Power BI, ou des systèmes de gestion de projet de bailleurs (comme les outils de suivi-évaluation utilisés par la Banque mondiale, la BAD, la GIZ) ;
3. le « moteur territorial » et les « jumeaux territoriaux » recouvrent des fonctions de SIG (Système d'Information Géographique), déjà couvertes par QGIS/ArcGIS/Kobo.

Répéter qu'on n'est « pas un ERP/CRM/SIG » n'est pas un argument de différenciation — c'est une déclaration d'intention qui doit être démontrée par l'usage, pas par la documentation. Le risque de confusion catégorielle est élevé et non traité par une comparaison concurrentielle explicite (aucun concurrent n'est nommé nulle part dans les 25 documents lus).

---

## 4. Valeur par acteur, adoption

Le document 02 (« Acteurs et alignement des intérêts ») est le plus solide du corpus : la matrice utilise/bénéficie/décide/paie est une bonne discipline. Mais elle reste théorique — aucun acteur cité n'est un individu ou une organisation réelle ayant testé quoi que ce soit. Le risque d'adoption central, nommé par le document lui-même (§7 du fichier 02 : « le principal risque est de construire un produit où les acteurs de terrain fournissent l'information tandis que la valeur est captée uniquement par les institutions »), est bien identifié mais **non résolu par le produit actuel** : le prototype construit (arrivages/besoins/opportunités) suppose que le pêcheur saisit des données sans qu'aucun mécanisme concret de retour immédiat (paiement, alerte utile, service tangible) ne soit implémenté — tout est simulé.

**Frein d'adoption majeur non traité** : aucune section ne discute la maîtrise numérique réelle, l'alphabétisation, la disponibilité d'un smartphone personnel (vs. partagé), le coût data, ou la confiance envers une plateforme perçue comme liée à l'État — alors que le contexte (§6 de l'audit package) mentionne explicitement ces contraintes. Le Design System (fichier 06 du Blueprint 1.1) prévoit bien un mode hors-ligne et des patterns d'accessibilité, mais ce sont des intentions de conception, non des résultats de test utilisateur.

---

## 5. Produit : Domain Model, Bounded Contexts, événements, MVP — la contradiction centrale

Le dépôt contient **quatre définitions différentes et non réconciliées** de ce qu'est le MVP de Mbàmbulaan. Conformément à la consigne de rigueur, je les signale explicitement sans les arbitrer moi-même :

| Document | Vocabulaire | Flux central | Statut |
|---|---|---|---|
| `blueprint-produit-1.0/03-flux-de-valeur.md` | « Infrastructure de coordination » | Signaler → qualifier → transformer en initiative → financer → agir → apprendre | Cadre conceptuel, 6 flux |
| `blueprint-produit-1.1/07-mvp-detaille.md` | « Infrastructure numérique de coordination » | Signalement → Qualification → Priorisation → Coordination → Engagements → Actions → Preuves → Clôture, avec auth OTP, mandats, 5 rôles | MVP « détaillé », non codé |
| `MVP_FREEZE_NOTE.md` (racine) | « Operating System de coordination » | Signal terrain → qualification → tension/opportunité → action → preuve → rapport | Note de gel CPO, la plus récente en apparence |
| `MVP_ROADMAP.md` + `PRODUCT_AUDIT.md` (racine) | Marketplace de filière | Arrivages → Besoins → Matching → Opportunités → Réservation → Transactions | **Ce qui est réellement codé**, « quasiment terminé » |

Ces quatre versions sont incompatibles sur le périmètre, les objets métier, les acteurs centraux et la valeur livrée. L'absence d'une source de vérité unique rend impossible toute priorisation rationnelle du développement.

### Trois options de résolution

**Option A — Assumer une marketplace transactionnelle.**

Avantages : le code existant et les parcours arrivages/besoins/matching sont réutilisables ; la valeur pour les acteurs privés est concrète et rapide ; le modèle économique peut devenir transactionnel.

Inconvénients : contradiction forte avec le narratif d'infrastructure publique ; concurrence frontale avec des acteurs et solutions commerciales ; dépendance à la liquidité du marché ; moindre pertinence directe pour le ministère.

**Option B — Abandonner la marketplace et recentrer le MVP sur un flux de coordination publique.**

Avantages : cohérence avec la vision, le Blueprint et la cible institutionnelle ; possibilité de démontrer une réduction de délai ou une amélioration de suivi sur un cas concret.

Inconvénients : une grande partie du prototype devient obsolète ; monétisation plus lente ; dépendance accrue aux institutions et bailleurs.

**Option C — Conserver la marketplace comme module secondaire d'une infrastructure de coordination.**

Avantages : possibilité de créer une valeur immédiate terrain tout en construisant progressivement la couche institutionnelle.

Inconvénients : risque maximal de surdimensionnement ; double go-to-market ; produit difficile à expliquer ; architecture et gouvernance plus complexes. Cette option n'est viable qu'après preuve séparée de valeur pour chacun des deux axes.

### Domain Model et bounded contexts

Le Domain Model et les 13 bounded contexts sont conceptuellement structurés, mais ils semblent issus d'un exercice de modélisation exhaustive plutôt que d'un apprentissage terrain. Un MVP n'a pas besoin de 13 contextes. Pour un pilote, trois contextes pourraient suffire :

1. identité et acteurs ;
2. signalements/qualification ;
3. actions/suivi.

Les autres doivent être traités comme des hypothèses futures, non comme une architecture à implémenter dès maintenant.

### Event catalog

Le catalogue d'événements est utile pour formaliser les transitions métier, mais il est prématuré tant que les objets métier et le flux prioritaire ne sont pas stabilisés. Plusieurs événements documentent des processus qui n'ont jamais été observés ni testés. Ils ne doivent pas être considérés comme des exigences réelles.

---

## 6. MVP et séquencement technique

Le séquencement actuel est inversé : l'authentification, les données réelles, la base de données et l'API sont reportées après les phases de storytelling visuel. Cela crée une illusion d'avancement alors que les fondations d'un MVP fonctionnel sont absentes.

Le terme « MVP quasiment terminé » ne doit plus être utilisé. L'état réel est : **prototype front-end de démonstration avec données fictives**.

Avant tout enrichissement visuel, il faut :

- choisir un flux unique ;
- choisir un territoire et des acteurs pilotes réels ;
- mettre en place une authentification minimale ;
- utiliser une base réelle ;
- enregistrer des événements métier réels ;
- mesurer un résultat opérationnel.

---

## 7. Modèle économique

Le modèle économique reste hypothétique. Plusieurs payeurs possibles sont évoqués — ministère, collectivités, coopératives, bailleurs, acteurs privés — mais aucun ne dispose d'une proposition de valeur, d'un prix, d'un budget identifié et d'une preuve de volonté de payer.

La dépendance au financement public est élevée. Le projet risque de devenir un outil financé par subventions, utilisé tant que le programme existe, puis abandonné faute de budget de fonctionnement et d'animation.

La piste la plus crédible à court terme n'est probablement pas un pur SaaS. Elle serait plutôt un modèle **logiciel + service**, comprenant :

- configuration du territoire ;
- formation ;
- animation du réseau ;
- reporting ;
- support opérationnel.

Mais ce modèle doit être chiffré, testé et comparé aux coûts réels d'acquisition et de déploiement.

---

## 8. Gouvernance et scalabilité

Le projet suppose un coordinateur ou une structure capable de qualifier, prioriser, arbitrer et suivre les actions. Or ce rôle n'est pas garanti dans la réalité. Si personne n'a le mandat ou l'incitation pour agir, la plateforme ne coordonne rien : elle devient un registre d'informations.

La scalabilité n'est donc pas seulement technique. Elle dépend de la possibilité de reproduire une gouvernance locale fonctionnelle. Passer d'un territoire à cent territoires suppose :

- un modèle d'onboarding ;
- des rôles standardisés mais adaptables ;
- une capacité locale d'animation ;
- des règles de décision ;
- un financement récurrent ;
- une assistance et un contrôle qualité.

Ces coûts humains ne sont pas intégrés au narratif de plateforme scalable.

---

## 9. Architecture

L'architecture cible décrite est trop complexe pour le stade du projet. Une architecture event-driven, 13 bounded contexts, webhooks, idempotence, offline-first et API versionnée peut être pertinente à maturité, mais elle ne doit pas précéder la validation du flux principal.

La priorité technique doit être un monolithe modulaire simple avec :

- authentification ;
- base relationnelle ;
- journal d'activité ;
- gestion des rôles ;
- synchronisation différée limitée si le terrain le nécessite réellement ;
- instrumentation analytique.

L'architecture distribuée et les moteurs séparés doivent rester des options d'évolution, pas des engagements actuels.

---

## 10. Les 10 plus grandes forces

1. Vision systémique ambitieuse et cohérente.
2. Bonne discipline de questionnement sur l'utilisateur, le bénéficiaire, le décideur et le payeur.
3. Théorie du changement explicite.
4. Compréhension du risque de captation institutionnelle de la valeur.
5. Effort de formalisation métier supérieur à la moyenne d'un projet pré-seed.
6. Prise en compte conceptuelle du mobile, du hors-ligne et de l'accessibilité.
7. Potentiel d'impact important si un flux prioritaire est validé.
8. Possibilité de s'appuyer sur des structures territoriales existantes.
9. Potentiel de modèle logiciel + service.
10. Capacité de remise en question déjà démontrée par la note de gel documentaire.

---

## 11. Les 10 plus grandes faiblesses

1. Quatre définitions concurrentes du MVP.
2. Contradiction entre positionnement infrastructure et produit marketplace.
3. Absence totale de validation terrain visible.
4. Absence de backend, base de données et authentification.
5. Surdimensionnement architectural.
6. Accumulation documentaire sans source de vérité.
7. Séquencement technique inversé.
8. Modèle économique non validé.
9. Dépendance potentielle au secteur public.
10. Absence de comparaison concurrentielle explicite.

---

## 12. Les 10 décisions prioritaires

1. Trancher le positionnement entre marketplace, infrastructure ou modèle hybride.
2. Désigner un document unique comme source de vérité produit.
3. Requalifier officiellement le produit actuel en prototype de démonstration.
4. Sélectionner un territoire pilote et un problème unique.
5. Identifier un sponsor opérationnel réel.
6. Réduire le MVP à un flux prioritaire unique.
7. Réduire le Domain Model à trois bounded contexts maximum pour le pilote.
8. Construire les fondations fonctionnelles avant tout nouveau polish visuel.
9. Définir une baseline et des critères de succès terrain.
10. Tester la volonté de payer de plusieurs acheteurs réels.

---

## 13. Les 10 éléments à supprimer ou reporter

1. Implémentation immédiate des 12 moteurs métier.
2. Implémentation immédiate des 13 bounded contexts.
3. Architecture distribuée event-driven complète.
4. Jumeaux territoriaux avancés.
5. Services financiers et scoring.
6. Multiplication des espaces et dashboards par rôle.
7. Matching automatique avancé tant que le positionnement n'est pas tranché.
8. Storytelling « MVP Premium » avant données réelles.
9. Extension à d'autres filières.
10. Nouveaux packs documentaires avant réconciliation du dépôt.

---

## 14. Les 10 éléments à approfondir

1. Données primaires sur les problèmes de la pêche artisanale sénégalaise.
2. Analyse concurrentielle et solutions open source existantes.
3. Incitations concrètes des acteurs terrain.
4. Rôle réel du coordinateur.
5. Gouvernance locale du pilote.
6. Coût d'animation et de déploiement.
7. Modèle de revenus par segment.
8. Cadre juridique et propriété des données.
9. Usage hors-ligne réellement nécessaire.
10. Capacité et composition de l'équipe technique.

---

## 15. Les 5 hypothèses les plus dangereuses

1. Les acteurs accepteront de saisir et partager des données sans retour immédiat démontré.
2. Un coordinateur disposant du mandat et des moyens existera sur chaque territoire.
3. Le ministère ou les bailleurs financeront durablement l'exploitation.
4. L'infrastructure de coordination sera perçue comme distincte des outils existants.
5. Une architecture exhaustive peut être définie avant l'apprentissage terrain sans créer de dette conceptuelle.

---

## 16. Les 5 raisons principales d'échec

1. Continuer à documenter et coder plusieurs visions incompatibles.
2. Ne pas obtenir d'adoption terrain réelle.
3. Ne pas identifier de payeur durable.
4. Construire une architecture trop lourde avant le product-market fit.
5. Devenir un projet institutionnel dépendant d'un sponsor politique ou d'un programme limité dans le temps.

---

## 17. Les 5 raisons principales de réussite possible

1. Le problème de coordination inter-acteurs est réel et important.
2. Une valeur forte peut être démontrée sur un flux simple et mesurable.
3. Les structures territoriales existantes peuvent accélérer l'adoption.
4. Le projet peut combiner logiciel et accompagnement opérationnel.
5. Une réussite sur la pêche peut créer un actif réutilisable dans d'autres filières.

---

## 18. Tableau des 30 risques majeurs

| # | Risque | Impact | Probabilité | Criticité | Mitigation |
|---|---|---:|---:|---:|---|
| 1 | Positionnement non tranché entre marketplace et infrastructure | Très élevé | Élevée | Critique | Décision formelle et source de vérité unique |
| 2 | Absence de validation terrain | Très élevé | Élevée | Critique | Pilote réel avant nouveau développement |
| 3 | Absence de payeur identifié | Très élevé | Élevée | Critique | Entretiens et lettres d'intention |
| 4 | Surdimensionnement du MVP | Très élevé | Élevée | Critique | Réduction à un flux unique |
| 5 | Produit actuel limité à une démo mockée | Élevé | Élevée | Critique | Backend, auth et données réelles minimales |
| 6 | Multiplication des sources de vérité | Élevé | Élevée | Critique | Gouvernance documentaire et archivage |
| 7 | Ordre d'ingénierie inversé | Élevé | Élevée | Critique | Prioriser fondations fonctionnelles |
| 8 | Dépendance au financement public | Très élevé | Moyenne-élevée | Critique | Diversification des payeurs |
| 9 | Absence de coordinateur opérationnel mandaté | Très élevé | Moyenne-élevée | Critique | Sponsor local et gouvernance pilote |
| 10 | Faible incitation des acteurs à renseigner les données | Très élevé | Élevée | Critique | Valeur immédiate et test d'usage |
| 11 | Coûts d'animation terrain sous-estimés | Élevé | Élevée | Élevé | Modèle logiciel + service chiffré |
| 12 | Rejet d'un outil perçu comme étatique | Élevé | Moyenne | Élevé | Gouvernance neutre et communication locale |
| 13 | Données incomplètes ou manipulées | Élevé | Élevée | Élevé | Contrôles, rôles et traçabilité |
| 14 | Concurrence d'outils existants/open source | Élevé | Moyenne | Élevé | Benchmark et stratégie d'intégration |
| 15 | Architecture trop complexe pour l'équipe | Élevé | Élevée | Élevé | Monolithe modulaire initial |
| 16 | Dilution du produit entre acteurs publics et privés | Élevé | Élevée | Élevé | Segment prioritaire unique |
| 17 | Absence de propriétaire métier des décisions | Élevé | Moyenne | Élevé | RACI opérationnel réel |
| 18 | Mauvaise compréhension des réalités d'alphabétisation | Élevé | Moyenne | Élevé | Tests terrain inclusifs |
| 19 | Dette de données mockées difficile à faire évoluer vers données réelles | Moyen | Moyenne | Moyen | Concevoir dès maintenant le schéma cible réel |
| 20 | Absence d'équipe technique dimensionnée pour l'ambition architecturale | Élevé | Moyenne | Élevé | Chiffrer l'effort réel et constituer l'équipe |
| 21 | Burn-out lié aux cycles de re-documentation | Moyen | Moyenne | Moyen | Limiter strictement la production documentaire |
| 22 | Ambiguïté entre offre gratuite et payante | Moyen | Moyenne | Moyen | Règles commerciales claires |
| 23 | Risque réglementaire sur les services financiers/scoring | Élevé | Faible-moyenne | Moyen | Avis juridique préalable |
| 24 | Multilingue/accessibilité annoncés mais non testés | Moyen | Moyenne | Moyen | Tests avec utilisateurs réels |
| 25 | Dépendance aux outils de génération de code | Moyen | Moyenne | Moyen | Revue humaine et maîtrise interne |
| 26 | Absence de baseline avant pilote | Moyen | Élevée | Moyen | Mesure préalable |
| 27 | Narratif investisseur instable | Moyen | Moyenne | Moyen | Positionnement tranché avant pitch |
| 28 | Changement de sponsor institutionnel | Moyen | Moyenne | Moyen | Diversification des sponsors |
| 29 | Expérience incohérente liée aux pages dupliquées | Faible-moyen | Élevée | Moyen | Consolidation avant démo externe |
| 30 | Absence de tests automatisés malgré la Definition of Done | Moyen | Élevée | Moyen | Audit technique et couverture minimale |

---

## 19. Les 20 opportunités principales

1. Positionnement unique possible si le pivot « infrastructure vs marketplace » est tranché clairement et communiqué de façon distinctive.
2. Partenariats bailleurs (GIZ, FAO, BAD) déjà identifiés dans la cartographie d'acteurs — accès facilité si un pilote réel est montré.
3. CLPA existantes au Sénégal comme relais de gouvernance locale déjà en place, réduisant le coût de mobilisation terrain.
4. Forte pénétration mobile au Sénégal facilitant l'adoption d'un outil léger et bien conçu pour le hors-ligne.
5. Discipline de conception par la valeur, si appliquée strictement, peut produire un produit très différenciant en simplicité face à des ERP lourds.
6. Marché des outils de suivi-évaluation pour bailleurs est structurellement mal servi par des outils souvent rigides — opportunité réelle si bien exécutée.
7. Réutilisation de l'infrastructure vers d'autres filières agricoles/rurales sénégalaises si le pilote pêche réussit.
8. Opportunité de devenir un partenaire de mesure d'impact crédible pour les bailleurs.
9. Effet de réseau possible entre acteurs privés si la marketplace est assumée et bien exécutée.
10. Opportunité de capter une clientèle B2B indépendamment du financement public.
11. Cadre réglementaire sénégalais en évolution sur la digitalisation de la pêche pouvant créer une fenêtre d'opportunité institutionnelle.
12. Programmes internationaux de digitalisation agricole/halieutique pouvant financer un pilote.
13. Marché de la donnée agrégée anonymisée pour la recherche et les études sectorielles.
14. Narratif plus modeste et mesurable, par exemple réduire un délai de coordination précis.
15. Partenariat technique avec Kobo, DHIS2 ou d'autres plateformes existantes.
16. Narratif d'impact social fort autour des pertes post-capture et de la sécurité alimentaire.
17. Diaspora sénégalaise et réseaux professionnels comme relais de financement ou de test.
18. Déploiement territorial incrémental via CLPA et collectivités.
19. Modèle logiciel + service générant du revenu récurrent.
20. Possibilité de lever une preuve de concept terrain rapidement et à faible coût.

---

## 20. Décision d'investissement — 5 millions d'euros

**Oui, mais sous conditions strictes — pas dans l'état actuel.**

Investir 5 M€ aujourd'hui financerait la poursuite d'un système qui n'a pas résolu son ambiguïté stratégique, n'a produit aucune preuve d'usage terrain et dont l'architecture cible est hors de portée de l'équipe actuelle en l'état documenté.

Conditions préalables :

1. un positionnement unique remplaçant les quatre versions concurrentes du MVP ;
2. un pilote terrain réel avec métriques mesurées ;
3. une preuve de volonté de payer d'au moins un acheteur ;
4. un chiffrage réaliste de l'ingénierie et une équipe dimensionnée.

Sous ces conditions, un ticket d'amorçage plus restreint, de quelques centaines de milliers d'euros, pour financer six à neuf mois de validation serait plus rationnel qu'un investissement de 5 M€ immédiat.

---

## 21. Recommandation au Ministère des Pêches du Sénégal

**Ne pas soutenir officiellement Mbàmbulaan à ce stade en tant qu'infrastructure nationale.**

Une posture raisonnable serait un rôle de facilitateur d'accès terrain et de partenaire de test, sans caution politique ni financement majeur avant preuve d'utilité.

Conditions minimales :

1. démonstration sur données réelles ;
2. convention de partenariat claire ;
3. financement conditionné à des jalons ;
4. clarification du positionnement avant communication publique.

---

## 22. Feuille de route de consolidation avant tout nouveau développement

1. **Semaines 1-2** — Trancher le positionnement et rendre les anciennes versions obsolètes.
2. **Semaines 1-2** — Nettoyer le dépôt, fusionner les doublons et archiver les documents obsolètes.
3. **Semaines 3-6** — Choisir un territoire, un cas d'usage et un sponsor opérationnel réel.
4. **Semaines 3-8** — Réduire le Domain Model à trois bounded contexts et construire une base réelle avec authentification simple.
5. **Semaines 6-10** — Tester un flux réel : signalement → qualification → décision → action → confirmation.
6. **Semaines 8-12** — Tester la volonté de payer auprès d'au moins trois acheteurs potentiels.
7. **Semaines 10-12** — Comparer les résultats à la baseline et prendre une décision go/no-go.
8. **Avant toute levée** — Mettre à jour le narratif pour refléter honnêtement l'état du produit.

---

*Fin de l'audit. Les contradictions relevées n'ont pas été résolues par le comité : elles sont signalées avec options à trancher par l'équipe produit.*
