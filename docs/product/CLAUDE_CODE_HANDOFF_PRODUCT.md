# Passation Claude Code — Mbàmbulaan Produit

> **Mission prioritaire : refonder et livrer Mbàmbulaan Produit.**
>
> Ce document est un prompt d’exécution. La source de vérité fonctionnelle et stratégique reste :
>
> `docs/product/MBAMBULAAN_PRODUCT_MASTER_SPEC.md`

---

## Prompt à donner intégralement à Claude Code

Tu reprends le repository :

`mrdiamalick-maker/mbambulaan-mvp`

sur la branche existante :

`codex/xxl-premium`

Travaille sur cette branche. Ne crée pas une nouvelle branche, ne repars pas de `main` et n’explore pas les anciennes branches sauf demande explicite du CEO.

## 1. Lecture obligatoire avant toute modification

Lis intégralement :

1. `docs/product/MBAMBULAAN_PRODUCT_MASTER_SPEC.md`
2. `docs/product/CLAUDE_CODE_HANDOFF_PRODUCT.md`

Le `MASTER_SPEC` est la source de vérité du nouveau Produit.

Les anciens écrans, routes, menus, modules, parcours, composants, styles et choix d’architecture du Produit sont **obsolètes**. Leur existence dans le repository ne constitue jamais une justification pour les conserver.

Le code existant peut être réutilisé uniquement si l’audit démontre qu’il sert directement le nouveau modèle métier, sans imposer l’ancienne UX, l’ancienne architecture ou des doublons fonctionnels.

## 2. Frontière avec le Public

Le Public Mbàmbulaan est un chantier distinct déjà cadré dans :

`docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`

Dans cette mission :

- ne refonds pas le Public ;
- ne modifies pas sa navigation, son positionnement ou son design ;
- ne mélanges pas ses contenus avec les outils professionnels ;
- ne fais que préserver l’intégration nécessaire entre le Public et le Produit, notamment l’entrée d’une demande publique comme `ServiceRequest`.

Toute modification substantielle du Public nécessite un arbitrage préalable du CEO.

## 3. Positionnement à préserver

Mbàmbulaan Produit n’est ni :

- un ERP ;
- une marketplace ;
- un simple dashboard ;
- un outil de collecte isolé ;
- une application de démonstration ;
- un logiciel identique pour tous les rôles.

Mbàmbulaan Produit est une **infrastructure professionnelle de coordination, de connaissance et d’action pour l’économie maritime**, déployée d’abord sur la filière halieutique sénégalaise et la pêche artisanale.

Sa boucle métier centrale est :

`SIGNAL → QUALIFICATION → SITUATION → DÉCISION → ENGAGEMENT → EXÉCUTION → PREUVE → RÉSULTAT → APPRENTISSAGE`

Le Produit doit relier le terrain, les organisations, les territoires, les capacités, les opérations, les programmes et la décision institutionnelle.

## 4. Règle de conception absolue

**Le design, l’UX et l’architecture d’information actuels sont obsolètes et doivent être réinventés.**

Ne copie pas :

- l’ancienne sidebar ;
- les anciens dashboards ;
- les anciennes cartes ;
- les anciennes pages par rôle ;
- les anciennes navigations ;
- les anciens modules qui se chevauchent ;
- les styles historiques ;
- les parcours de démonstration artificiels.

Tu disposes d’une liberté de création UX/UI complète, à condition de respecter le modèle métier, les rôles, les parcours, la confiance, la sécurité, le mobile et la démonstration institutionnelle.

Le résultat doit être :

- institutionnel sans être administratif ;
- premium sans être décoratif ;
- maritime sans folklore ;
- riche en données sans devenir illisible ;
- moderne sans ressembler à un template SaaS générique ;
- cohérent sur desktop, tablette et mobile ;
- crédible pour un ministère, une organisation professionnelle, une ONG, un bailleur et un opérateur terrain.

L’effet « waouh » doit venir de la continuité métier, de la profondeur territoriale, de la traçabilité et de la capacité d’action — pas d’animations gratuites.

## 5. Première étape obligatoire : audit de refondation

Avant de coder la nouvelle version, audite le repository actuel par rapport au `MASTER_SPEC`.

Classe chaque élément utile en quatre catégories :

1. **Conserver** — conforme au nouveau domaine et réutilisable sans influence legacy.
2. **Adapter** — base technique utile mais modèle, API ou comportement à corriger.
3. **Remplacer** — conception incompatible avec la nouvelle architecture.
4. **Supprimer / rediriger** — legacy, doublon, route obsolète ou écran sans valeur cible.

L’audit doit couvrir :

- routes et layouts ;
- composants ;
- modèle domaine ;
- données et seeds ;
- API et persistance ;
- authentification et sessions ;
- permissions ;
- multi-tenant ;
- canaux terrain ;
- Atlas ;
- situations et coordination ;
- opérations ;
- programmes et financements ;
- reporting ;
- exports ;
- tests ;
- CI/CD ;
- performance ;
- accessibilité ;
- responsive ;
- sécurité ;
- dette et risques.

Identifie également :

- les doublons métier ;
- les dépendances entre domaine et UI ;
- les données fictives présentées comme réelles ;
- les actions purement décoratives ;
- les boutons sans effet ;
- les formulaires non persistés ;
- les écrans sans prochaine action ;
- les fuites entre tenants ;
- les permissions insuffisantes ;
- les parcours cassés ;
- les blocages de build, lint, typecheck et tests.

## 6. Livrables de l’audit avant implémentation massive

Présente au CEO un diagnostic court mais concret comprenant :

1. état du build et de la CI ;
2. cartographie des routes actuelles ;
3. éléments à conserver / adapter / remplacer / supprimer ;
4. modèle domaine cible ;
5. architecture technique proposée ;
6. architecture d’information proposée ;
7. stratégie de migration du legacy ;
8. design system et direction UX proposés sans reprendre l’ancien design ;
9. risques, dépendances et arbitrages ;
10. plan de livraison par lots ;
11. périmètre précis de la démonstration ministère ;
12. estimation de ce qui sera réellement fonctionnel, simulé ou différé.

N’implémente pas silencieusement une décision structurante avant cet arbitrage.

Tu peux toutefois corriger immédiatement un blocage technique trivial nécessaire à l’audit ou au build, en le documentant.

## 7. Priorité de livraison

Le timing est serré. La priorité n’est pas de construire toutes les ambitions futures.

Ordre recommandé :

### Lot 0 — Audit et baseline

- audit ;
- restauration d’un build vert ;
- suppression des blocages critiques ;
- confirmation de l’architecture cible.

### Lot 1 — Socle produit

- identité et session ;
- tenant ;
- rôles et permissions ;
- modèle domaine ;
- persistance ;
- audit log ;
- design system entièrement nouveau ;
- shell adaptatif ;
- dataset déterministe.

### Lot 2 — Vue nationale et Atlas professionnel

- vue institutionnelle nationale ;
- Atlas professionnel ;
- territoire ;
- quais, acteurs, organisations, infrastructures et capacités ;
- provenance, fraîcheur et niveau de confiance ;
- drill-down selon habilitation.

### Lot 3 — Signal, demande et situation

- intake web / WhatsApp / téléphone / SMS / terrain simulé ;
- `ServiceRequest` et `Signal` unifiés ;
- qualification ;
- création ou enrichissement de `Situation` ;
- impact ;
- décision ;
- engagements ;
- chronologie.

### Lot 4 — Situation Room et exécution

- acteurs ;
- responsabilités ;
- capacités ;
- communications ;
- échéances ;
- preuves ;
- clôture ;
- résultats ;
- apprentissage.

### Lot 5 — Besoins collectifs, programmes et reporting

- agrégation de besoins ;
- initiative ;
- programme ;
- bénéficiaires ;
- budget ;
- financement ;
- actions ;
- indicateurs ;
- preuves ;
- rapport ;
- exports PDF et Excel au minimum.

### Lot 6 — Terrain mobile et polish

- parcours mobile ;
- faible connectivité ;
- médias ;
- accessibilité ;
- performance ;
- mode présentation institutionnelle ;
- recette finale.

## 8. Démonstration institutionnelle obligatoire

La démonstration doit utiliser le vrai Produit dans un tenant `DEMO` déterministe, sans application parallèle.

Narration cible, en 12 à 15 minutes :

1. vue nationale du littoral ;
2. identification d’un territoire prioritaire ;
3. descente vers Joal ;
4. signal reçu via WhatsApp ou téléphone ;
5. source et niveau de confiance visibles ;
6. qualification du signal ;
7. création de la situation « machine à glace indisponible » ;
8. ouverture de la Situation Room ;
9. impact sur les débarquements / lots ;
10. sélection ou mobilisation d’une capacité alternative ;
11. décisions, responsables, engagements et échéances ;
12. préparation d’une communication ;
13. preuve terrain ;
14. clôture avec résultat ;
15. impact reflété dans le pilotage ;
16. transformation de besoins récurrents en programme finançable ;
17. génération d’un rapport institutionnel traçable et exportable.

La démonstration doit également pouvoir montrer un rôle terrain mobile effectuant une action simple.

## 9. Moments « waouh » non négociables

- passage national → territoire → situation → objet d’origine sans rupture ;
- origine WhatsApp / téléphone / terrain visible ;
- transformation d’un message en objet métier ;
- situation menant à une décision puis à des engagements ;
- responsabilité et échéance explicites ;
- capacité mobilisée avec niveau de confiance ;
- preuve terrain reliée au résultat ;
- rapport dont chaque indicateur revient à ses sources ;
- plusieurs besoins similaires transformés en programme ;
- rôle terrain mobile simple et crédible ;
- espaces réellement différenciés par rôle et mandat.

## 10. Utilisateurs et logique d’expérience

Ne construis pas un dashboard universel.

- **Institution : décision-first** — tendances, arbitrages, programmes, investissements, qualité des données et rapports.
- **Coordinateur : situation-first** — situations, décisions, engagements, blocages et capacités.
- **Opérateur de quai : task-first** — retours, arrivées, débarquements, pesées, lots et anomalies.
- **Acteur terrain : mobile-first** — prochaine action, confirmation, appel, WhatsApp, photo, vocal, poids et signal.
- **Organisation professionnelle : network-first** — membres, besoins, capacités, programmes et rapports.
- **Partenaire / bailleur : outcome-first** — bénéficiaires, budget, actions, risques, preuves et résultats.
- **Administrateur Mbàmbulaan : operations-first** — tenants, utilisateurs, modules, support, qualité, canaux, audit et démonstration.

Chaque rôle voit uniquement son périmètre, son mandat et ses actions autorisées.

## 11. Règles métier et techniques majeures

- Domain-first : le domaine ne dépend pas de React.
- Multi-tenant strict.
- RBAC + organisation + territoire + mandat + module + action + sensibilité.
- API-first et adaptateurs de canaux.
- Une communication est reliée à un objet métier.
- Une situation ne peut pas se clôturer sans résultat, preuve ou justification.
- Un engagement possède responsable, échéance et statut.
- Une donnée critique possède source, date, auteur, canal, fraîcheur et confiance.
- Toute action sensible est auditée.
- Les canaux Web, WhatsApp, téléphone, SMS et terrain alimentent le même modèle métier.
- La mémoire locale n’est pas une persistance de production.
- Les données de démonstration sont déterministes et explicitement marquées `DEMO`.
- Pas de capacité « temps réel » non confirmée.
- Pas d’IA magique : source, raisonnement, incertitude et validation humaine visibles.
- Aucun bouton critique ne doit être décoratif.
- Aucun formulaire critique ne doit perdre les données après soumission.
- Aucun export affiché comme disponible ne doit être fictif.

## 12. Périmètre V1 à respecter

### Obligatoire

- authentification et tenant de démonstration ;
- rôles et permissions ;
- vue nationale institutionnelle ;
- Atlas professionnel ;
- fiche territoire ;
- demandes omnicanales ;
- moteur de situations ;
- Situation Room ;
- décisions ;
- engagements ;
- communication simulée mais fonctionnelle ;
- preuves ;
- résultats ;
- besoins collectifs ;
- programmes et financements ;
- rapports ;
- export PDF et Excel ;
- dataset riche ;
- parcours terrain mobile ;
- administration minimale ;
- design entièrement nouveau et homogène.

### À différer

- paiement ;
- marketplace ;
- matching autonome ;
- IA décisionnelle ;
- application native ;
- USSD ;
- signature électronique avancée ;
- facturation automatisée complète ;
- géospatial scientifique avancé ;
- prévision scientifique ;
- intégrations officielles temps réel sans accord.

## 13. Jeu de données de démonstration

Le tenant de démonstration doit donner une impression nationale crédible sans inventer des données officielles.

Cible indicative :

- 20+ territoires / sites ;
- 80+ organisations ;
- 250+ acteurs ;
- 120+ pirogues / actifs ;
- 150+ sorties ;
- 200+ débarquements ;
- 400+ lignes de capture ;
- 250+ lots ;
- 60+ infrastructures ;
- 80+ capacités / services ;
- 60+ demandes ;
- 40+ situations ;
- 20+ coordinations ;
- 100+ engagements ;
- 12+ programmes / initiatives ;
- 20+ rapports ;
- 100+ communications omnicanales.

Les données doivent être cohérentes entre elles, déterministes et clairement marquées comme démonstration.

## 14. Qualité et discipline de livraison

Après chaque lot significatif, exécute et communique :

- `npm run lint` ;
- `npm run typecheck` ;
- `npm test` ;
- `npm run build` ;
- smoke tests ;
- liste des routes impactées ;
- résumé des changements ;
- limitations connues ;
- captures ou preview Vercel ;
- écarts restant à traiter.

Ne qualifie jamais un lot de terminé si :

- le build n’est pas vert ;
- une route critique retourne une erreur ;
- un parcours canonique est cassé ;
- le mobile est inutilisable ;
- le rôle voit des données hors périmètre ;
- le design change d’une page à l’autre ;
- un bouton central ne fonctionne pas ;
- les données de démo ne sont pas identifiables ;
- les rapports ne sont pas traçables.

## 15. Définition de fini de la V1 ministère

La V1 est acceptable uniquement si un utilisateur peut :

1. ouvrir la vue nationale ;
2. identifier un territoire prioritaire ;
3. ouvrir sa fiche ;
4. voir une situation et sa source ;
5. comprendre son impact ;
6. ouvrir la Situation Room ;
7. voir acteurs, décisions et engagements ;
8. mobiliser une capacité ;
9. préparer une communication ;
10. enregistrer une preuve ;
11. clôturer avec résultat ;
12. voir le résultat dans le pilotage ;
13. transformer plusieurs besoins en programme ;
14. exporter un rapport PDF et Excel ;
15. rejouer une étape depuis un rôle terrain mobile.

## 16. Anti-patterns interdits

- recopier l’ancien Produit ;
- conserver les anciennes routes par confort ;
- créer un dashboard identique pour tous ;
- multiplier les modules doublons ;
- séparer les canaux du modèle métier ;
- construire un produit desktop-only ;
- inventer des données officielles ;
- afficher du temps réel non confirmé ;
- produire des rapports sans sources ;
- afficher des exports non fonctionnels ;
- utiliser une IA opaque ;
- créer une marketplace ou un annuaire public ;
- confondre activité, résultat et impact ;
- construire un thème SaaS générique ;
- coder avant d’avoir validé le parcours canonique ;
- toucher au Public sans arbitrage ;
- créer une application de démonstration séparée.

## 17. Liberté de challenge et arbitrages

Tu peux challenger :

- la stack cartographique ;
- l’architecture technique ;
- le design system ;
- le découpage des lots ;
- les fournisseurs de canaux ;
- la stratégie offline ;
- certains KPI ;
- certaines priorités de V1 si tu démontres un meilleur rapport valeur / délai.

Tu ne peux pas modifier silencieusement :

- le positionnement ;
- la boucle centrale ;
- la frontière Public / Produit ;
- le rôle central du terrain ;
- le multi-tenant ;
- la traçabilité ;
- la Situation Room ;
- la démonstration dans le vrai Produit ;
- le principe human-in-the-loop ;
- les données `DEMO` identifiées ;
- l’obsolescence de l’ancienne UX.

Pour tout changement structurant : explique le problème, la proposition, les bénéfices, les risques, le coût et attends l’arbitrage du CEO.

## 18. Format de ta première réponse

Après lecture des documents, réponds en français avec :

1. **Compréhension des invariants** — 10 points maximum.
2. **État du repository** — build, architecture, routes, domaine, dette.
3. **Tableau garder / adapter / remplacer / supprimer**.
4. **Architecture cible proposée**.
5. **Direction UX/UI proposée**, sans reprendre le design actuel.
6. **Parcours ministère détaillé**.
7. **Lots de livraison** avec livrables et critères d’acceptation.
8. **Risques et arbitrages CEO**.
9. **Première action technique recommandée**.

Ne commence pas une refonte massive avant d’avoir présenté cette réponse.

---

## Résultat attendu

À la fin de la mission, le ministère ne doit pas voir une collection d’écrans.

Il doit voir un système capable de :

**voir le territoire → recevoir un signal → comprendre le contexte → décider → coordonner → prouver → mesurer → apprendre → structurer un investissement.**
