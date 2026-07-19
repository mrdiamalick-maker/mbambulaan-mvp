# CODEX V15 — Consolidation produit premium XXL avant stabilisation

## Instruction d’exécution

Tu travailles sur le repository `mrdiamalick-maker/mbambulaan-mvp`, branche `feature-atlas-quais-pivot`, PR #35.

Cette passe est la dernière passe structurante avant une phase de test et de démonstration. Elle doit consolider le produit existant, supprimer ses incohérences et améliorer fortement son expérience. Elle ne doit pas empiler de nouvelles fonctions, lancer une refonte infinie ni remplacer l’architecture validée.

Commence par inspecter le code actif et l’état réel de la branche. Établis un plan d’exécution court, puis exécute-le intégralement sans t’arrêter après l’analyse et sans demander une validation intermédiaire, sauf blocage réellement impossible à résoudre dans le dépôt.

Travaille comme un CPO, un architecte produit, un designer d’interfaces institutionnelles et un développeur senior. Prends les décisions d’implémentation raisonnables nécessaires pour atteindre le résultat attendu.

## Objectif final

Faire de Mbàmbulaan une démonstration GovTech cohérente, premium et immédiatement compréhensible pour le Ministère des Pêches :

- le Ministère voit la situation nationale et peut arbitrer ;
- l’Atlas donne une lecture territoriale centrée sur les quais ;
- les besoins communautaires deviennent des programmes et des dossiers de financement sans confusion de statuts ;
- un agent sait traiter un dossier en quelques clics ;
- chaque quai fonctionne réellement et Kayar n’est plus le produit entier ;
- l’assistance IA est facultative, utile et encadrée ;
- le site public et la console racontent la même promesse sans se dupliquer.

Le résultat doit donner envie d’organiser un atelier de cadrage ou de financer un pilote Mbàmbulaan. Il ne doit pas prétendre connaître définitivement l’organisation administrative du Ministère.

## Diagnostic à corriger

Le code actuel contient plusieurs défauts précis. Ne les contourne pas par du wording : corrige leur cause.

1. `/espace-prive` est trop chargé. La page de connexion contient une présentation des trois modules, des statistiques de démonstration, des informations de version et un discours produit. Une porte d’entrée sécurisée n’est pas une landing page.
2. Le module `Besoins remontés` mélange la maturité d’un besoin avec la création d’un programme et sa capacité de financement. `Programme proposé` et `Finançable` ne sont pas des statuts de besoin.
3. Kayar est codé comme priorité et destination par défaut dans plusieurs composants. Le KPI des huit quais ouvre Kayar. Des actions de dossier utilisent `scope: "Kayar"`, `sourceId: "kayar"` et `quayId: "kayar"` même quand l’objet sélectionné devrait décider du contexte.
4. Le Pilotage ne restitue pas assez la réalité opérationnelle : espèces, débarquements, volumes du jour, pirogues, activité et tendances sont insuffisamment visibles.
5. Les données sont présentées séparément dans plusieurs modules au lieu d’être dérivées d’une même source filtrée. Cela crée des risques d’incohérence.
6. Le parcours dossier expose trop de sections et de statuts avant d’expliquer simplement ce que l’agent doit faire et quel résultat il doit obtenir.
7. Le bouton d’assistance existe, mais l’utilisateur perçoit peu de différence lorsqu’il l’active. L’assistance publique et privée n’a pas encore une proposition de valeur assez visible.
8. L’Atlas, Pilotage et Communautés & Programmes sont liés, mais leurs responsabilités sont encore poreuses ou dupliquées.

## Contrat produit non négociable

### 1. Pilotage

Répond à : **Que se passe-t-il, quelles tendances comptent et que faut-il décider ?**

Il contient :

- indicateurs agrégés ;
- comparaisons ;
- tendances ;
- graphiques ;
- filtres nationaux et territoriaux ;
- points d’attention ;
- décisions attendues ;
- accès contextuels vers Atlas, Communautés & Programmes ou un dossier.

Il ne contient pas :

- une deuxième carte ;
- la fiche complète d’un quai ;
- la liste exhaustive des dossiers ;
- le détail complet des programmes ou des financements.

### 2. Atlas

Répond à : **Où se situe l’activité et que se passe-t-il sur ce quai ou cette unité ?**

Il contient :

- la carte ;
- les huit quais ;
- une vue `Quais & activité` ;
- une vue `Suivi en mer` ;
- les filtres géographiques et opérationnels ;
- la fiche du quai sélectionné ;
- les pirogues, débarquements, espèces et situations rattachés au quai ;
- des accès vers le dossier ou le module communautaire concerné.

Il ne contient pas :

- les tableaux de financement ;
- le portefeuille complet de programmes ;
- un pipeline de besoins ;
- un cycle pirogue représenté comme un faux point géographique.

Le cycle pirogue est une chronologie. Il doit apparaître dans la fiche d’une pirogue ou dans l’activité du quai, jamais comme une catégorie géographique ambiguë.

### 3. Communautés & Programmes

Répond à : **Quels besoins remontent du terrain, quelles réponses sont organisées et quels financements doivent être mobilisés ?**

Il contient trois lectures distinctes :

1. `Besoins remontés` ;
2. `Programmes & actions` ;
3. `Financements & partenaires`.

Il ne contient pas :

- une seconde carte maritime ;
- les indicateurs détaillés de navigation ou de débarquement ;
- une copie du tableau de bord Pilotage ;
- les mêmes statuts répétés dans les trois lectures.

### 4. Dossiers

Répond à : **Qui traite, quelle est la prochaine action et quelle sortie doit être produite ?**

Le dossier reste un moteur transversal accessible depuis les trois modules. Il ne devient pas une quatrième entrée principale de navigation.

Un même dossier doit garder partout :

- la même référence ;
- le même quai ou territoire ;
- le même responsable ;
- la même prochaine action ;
- les mêmes pièces ;
- le même historique ;
- la même sortie attendue.

## Référence de conception internationale — s’inspirer sans copier

- GOV.UK privilégie un point d’entrée de service simple, avec juste assez d’information et une action claire. Appliquer ce principe à `/espace-prive`.
- ArcGIS Dashboards relie sélecteurs, graphiques, listes et carte par des actions de filtrage cohérentes. Appliquer ce principe à Pilotage et Atlas : un filtre ou un clic agit sur les données correspondantes, pas sur une destination codée en dur.
- Global Fishing Watch garde la carte centrée sur la recherche, la période, le navire et l’activité maritime. Éviter de transformer l’Atlas en tableau de bord ou en accumulation de marqueurs.
- Les directives FAO sur la pêche artisanale placent les personnes, les moyens de subsistance, la chaîne de valeur, le genre et les communautés au même niveau que la ressource halieutique. Communautés & Programmes doit donc rester une capacité centrale, pas un résumé marginal.

Références :

- https://design-system.service.gov.uk/patterns/start-using-a-service/
- https://doc.arcgis.com/en/dashboards/latest/create-and-share/configuring-actions-on-dashboard-elements.htm
- https://globalfishingwatch.org/user-guide/
- https://www.fao.org/voluntary-guidelines-small-scale-fisheries/en

## Lot 1 — Simplifier radicalement `/espace-prive`

Modifier `src/app/espace-prive/page.tsx`.

### Résultat attendu

Une page d’accès institutionnel sobre : une bannière de marque et un bloc de connexion. Rien d’autre.

### Garder

- logo Mbàmbulaan ;
- titre `Accès Ministère` ou `Accès institutionnel` ;
- une phrase maximum : `Accès réservé aux équipes et partenaires habilités.` ;
- organisation ;
- identifiant ;
- code d’accès ;
- CTA `Accéder à la console` ;
- une courte mention de sécurité et de données simulées.

### Retirer

- la description détaillée Pilotage / Atlas / Communautés & Programmes ;
- les trois indicateurs `8 quais`, `323 pirogues`, `dernière synchronisation` ;
- le paragraphe de promesse produit ;
- la version pilote et les informations de support mises en avant ;
- toute explication de ce que l’utilisateur verra après connexion.

### Design

- desktop : bannière maritime institutionnelle occupant environ 35 à 40 % de la largeur et formulaire occupant le reste ;
- mobile : bannière compacte au-dessus du formulaire ;
- aucune grande statistique ;
- un seul CTA principal ;
- contraste AA ;
- aucune impression de landing page ou de pitch.

## Lot 2 — Clarifier le modèle Besoin → Programme → Financement

Modifier au minimum :

- `src/components/private-space/MinistryCommunityProgramsView.tsx` ;
- `src/data/ministryControlTowerData.ts` ;
- `src/data/ministryValueJourneyData.ts` ;
- les types et sélecteurs associés.

### Statuts des besoins

La lecture `Besoins remontés` utilise uniquement :

1. `Signalé` — le besoin a une source, un canal, un territoire et un public concerné ;
2. `Vérifié` — l’existence et les éléments essentiels ont été confirmés ;
3. `Qualifié` — le problème, les bénéficiaires, la priorité et une première estimation sont exploitables.

Retirer `Programme proposé` et `Finançable` de la liste des statuts de besoins.

Un besoin qualifié peut afficher des relations, pas un changement de nature :

- `Relié au programme PRG-…` ;
- `Opportunité de financement associée` ;
- CTA `Ouvrir le programme` ;
- CTA `Structurer une réponse`.

### Statuts des programmes

Dans `Programmes & actions`, utiliser une maturité propre, par exemple :

- `Proposé` ;
- `En préparation` ;
- `Actif` ;
- `Terminé`.

### Statuts des financements

Dans `Financements & partenaires`, utiliser une maturité propre, par exemple :

- `À structurer` ;
- `Prêt à présenter` ;
- `Transmission confirmée` ;
- `Réponse attendue` ;
- `Partiellement financé` ;
- `Financé`.

Ne jamais afficher une transmission réelle si elle n’a pas été confirmée manuellement.

### Présentation

Remplacer les cinq colonnes simultanées de type Kanban par :

- une liste documentaire unique ;
- filtres statut, territoire, catégorie, urgence et public ;
- compteurs synthétiques ;
- une seule action principale par ligne ;
- un lien explicite vers le programme ou le financement relié.

## Lot 3 — Généraliser tout le produit aux huit quais

Kayar peut rester une donnée et un scénario de démonstration parmi d’autres. Il ne doit plus être une règle de code, une priorité par défaut ou une destination implicite.

### Corriger les hardcodes actifs

Inspecter et corriger notamment :

- `src/components/private-space/MinistryPilotageView.tsx` ;
- `src/components/private-space/MinistryDossiersView.tsx` ;
- `src/components/private-space/MinistryControlTower.tsx` ;
- `src/components/private-space/MinistryDossierExperience.tsx` ;
- `src/components/private-space/QuayProfileSheet.tsx` ;
- `src/lib/ministryOperationalDossiers.ts`.

Supprimer du comportement actif :

- `onViewAtlas("kayar")` pour le KPI des quais ;
- `Ouvrir la priorité Kayar` ;
- `Reprendre la démonstration Kayar` ;
- les appels de workflow avec `scope: "Kayar"`, `sourceId: "kayar"`, `quayId: "kayar"` quand le dossier courant fournit déjà ces valeurs ;
- les filtres de quais limités à Kayar, Joal et Saint-Louis ;
- la réinitialisation Kayar exposée comme fonction produit normale.

### Comportement générique obligatoire

- un clic sur `8 quais suivis` ouvre l’Atlas sans quai présélectionné ;
- un clic sur Saint-Louis ouvre Saint-Louis ;
- un clic sur Kayar ouvre Kayar ;
- idem pour Mbour, Joal-Fadiouth, Hann, Soumbédioune, Fass Boye et Kafountine ;
- un dossier utilise systématiquement `dossier.quayId`, `dossier.sourceId`, `dossier.territory` et `dossier.linkedObject` ;
- la fermeture d’une fiche ou d’un dossier rend l’utilisateur au contexte d’origine ;
- sélectionner deux fois le même quai après être passé ailleurs doit toujours rouvrir sa bonne fiche ;
- les programmes et opportunités couvrent plusieurs territoires, sans faire de Joal–Mbour un second hardcode dominant.

Le scénario Kayar peut rester disponible comme cas démontrable dans les données, mais aucun CTA majeur ne doit faire croire que Mbàmbulaan est un pilote Kayar.

## Lot 4 — Créer une source de vérité commune

Les chiffres de Pilotage, les fiches Atlas et les résumés Communautés doivent être dérivés des mêmes données.

Créer si pertinent un fichier de sélecteurs, par exemple :

- `src/lib/ministrySelectors.ts` ;

avec des fonctions pures pour :

- filtrer par période, région, quai et espèce ;
- calculer quais actifs ;
- calculer pirogues actives et en mer ;
- calculer débarquements et volumes ;
- agréger les espèces ;
- agréger les situations par niveau ;
- agréger les besoins par maturité ;
- agréger les programmes et financements ;
- produire les séries temporelles nécessaires aux graphiques.

Ne pas recopier manuellement une valeur dans trois composants. Un clic de filtre doit produire la même sélection dans les KPI, graphiques et listes concernés.

Utiliser des données simulées cohérentes pour les huit quais. Les valeurs doivent rester explicitement identifiées comme données de démonstration.

## Lot 5 — Enrichir Pilotage sans dupliquer l’Atlas

Refondre `src/components/private-space/MinistryPilotageView.tsx` comme tableau de bord décisionnel premium.

### Barre de filtres

Ajouter une barre compacte et claire :

- périmètre : national, région ou quai ;
- période : aujourd’hui, 7 jours, 30 jours ;
- espèce ;
- réinitialiser.

Tous les KPI et graphiques doivent réagir à ces filtres.

### Six KPI opérationnels maximum en tête

Afficher en priorité :

1. quais actifs ;
2. pirogues actives, avec sous-information `en mer` ;
3. débarquements sur la période ;
4. volume débarqué ;
5. espèces suivies ;
6. situations nécessitant une attention.

Chaque KPI doit avoir :

- unité claire ;
- comparaison ou contexte ;
- source ou heure de mise à jour ;
- une action pertinente ;
- aucune destination Kayar codée en dur.

### Graphiques obligatoires

Créer des composants graphiques réutilisables, légers et accessibles, sans dépendance lourde :

1. histogramme des volumes ou débarquements par période ;
2. barres horizontales des volumes par quai ;
3. donut de répartition des espèces ;
4. donut ou barre empilée du statut des pirogues ;
5. barres des situations par niveau ou nature.

Ajouter plus bas une synthèse complémentaire `Communautés & Programmes` :

- besoins signalés, vérifiés et qualifiés ;
- programmes actifs ;
- budget couvert ;
- reste à mobiliser ;
- CTA vers le module correspondant.

Cette synthèse n’est pas le pipeline détaillé. Le détail reste dans Communautés & Programmes.

### Interaction

- cliquer une barre de quai ouvre la fiche de ce quai dans Atlas ;
- cliquer une espèce applique ou met à jour le filtre espèce ;
- cliquer un besoin ouvre Communautés & Programmes avec le bon filtre ;
- cliquer une décision ouvre son dossier ;
- les graphiques ne doivent jamais renvoyer arbitrairement vers Kayar.

### Qualité visuelle

- composition éditoriale, pas mur de cartes ;
- 2 grands graphiques et 2 à 3 graphiques secondaires ;
- titres, unité, période et légende visibles ;
- couleurs limitées et cohérentes ;
- aucune information uniquement portée par la couleur ;
- SVG ou CSS accessibles avec libellés et valeurs lisibles ;
- responsive sans scroll horizontal à 390, 768, 1280 et 1440 px.

## Lot 6 — Consolider l’Atlas autour des quais

Conserver le quai comme objet pivot.

### Carte

- carte dégagée ;
- vue par défaut : les huit quais ;
- marqueurs lisibles ;
- recherche et filtres région, quai, niveau et activité ;
- une seule sélection active ;
- pirogues affichées seulement dans `Suivi en mer` ;
- incidents éventuels dans une couche optionnelle clairement identifiée ;
- l’alerte est un état visuel d’un objet, pas un doublon de l’incident.

### Fiche quai

Organiser les contenus en cinq rubriques stables :

1. `Vue d’ensemble` ;
2. `Activité du jour` ;
3. `Pirogues` ;
4. `Espèces` ;
5. `Situations & dossiers`.

La vue d’ensemble montre :

- débarquements ;
- volume ;
- pirogues actives et en mer ;
- espèces dominantes ;
- situations en attention ;
- poste ou relais local reconnu ;
- dernière mise à jour ;
- niveau de confiance.

La fiche peut afficher trois compteurs communautaires discrets : besoins, programmes, financement. Leur CTA ouvre Communautés & Programmes filtré sur le quai. Elle ne doit pas recopier les cartes détaillées de ce module.

### Cycle pirogue

Le cycle est une timeline rattachée à une pirogue ou une agrégation dans `Activité du jour` :

- préparation ;
- départ ;
- en mer ;
- retour attendu ;
- retour ;
- débarquement ;
- déclaration ;
- vérification.

Ne pas l’afficher comme un type de marqueur géographique autonome.

## Lot 7 — Simplifier et magnifier le traitement des dossiers

Le dossier doit ressembler à un document opérationnel institutionnel, pas à un ticket et pas à une accumulation de statuts.

### Corbeille transversale

- remplacer tout CTA Kayar par `Reprendre le dossier prioritaire` calculé dynamiquement ;
- liste unique priorisée ;
- filtres situation de travail, type, canal, quai et échéance ;
- huit vrais noms de quais ;
- une ligne = référence, objet, quai, responsable, prochaine action, échéance ;
- un seul CTA : `Ouvrir le dossier`.

### Panneau dossier

Hiérarchie obligatoire :

1. couverture : référence, objet, quai, canal d’origine, responsable, confiance ;
2. bloc dominant `À faire maintenant` ;
3. explication `Résultat attendu` ;
4. un seul CTA principal ;
5. progression synthétique en quatre étapes maximum : `Signalement`, `Instruction`, `Validation`, `Sortie` ;
6. sections secondaires repliables : notes, pièces, historique ;
7. sortie finale et possibilité de relire le document.

Les détails de la machine d’état restent dans les données et l’historique. Ils ne doivent pas submerger la première lecture.

### Parcours générique

La boucle doit fonctionner pour tout dossier et tout quai :

`Signal ou besoin → dossier → instruction → preuve → validation humaine → décision ou programme → document → clôture`.

Conserver l’anti-répétition : une action accomplie ne redevient jamais l’action principale.

## Lot 8 — Donner une vraie valeur à l’assistance IA facultative

L’IA est un plus, jamais une condition d’utilisation.

### Gouvernance

- désactivée par défaut ;
- activation explicite ;
- aucune donnée envoyée hors du navigateur ;
- aucun appel API ;
- aucune décision automatique ;
- aucune accusation ou détection sensible automatique ;
- résultats marqués `Proposition à valider` ;
- faits et sources locales visibles ;
- validation humaine obligatoire.

### Expérience d’activation

Le bouton actuel ne doit plus seulement changer un état invisible.

Quand l’utilisateur active `Assistance Mbàmbulaan` :

- ouvrir un panneau contextuel ou afficher un point d’entrée immédiatement perceptible ;
- expliquer en une phrase ce qui est possible dans le module courant ;
- permettre de refermer ou désactiver facilement ;
- mémoriser l’état pendant la session seulement.

### Cas d’usage privés

Pilotage :

- résumer la sélection filtrée ;
- faire ressortir trois points à surveiller ;
- préparer un projet de note d’arbitrage.

Atlas :

- résumer le quai sélectionné ;
- relever les données manquantes ;
- suggérer la prochaine vérification à valider.

Communautés & Programmes :

- regrouper les besoins similaires ;
- proposer un canevas de programme ;
- préparer un résumé partenaire à valider.

Dossier :

- synthétiser le dossier ;
- préparer une note ;
- rappeler les pièces attendues.

### Présence publique

Dans `/decouvrir`, conserver une assistance repliable mais la rendre plus utile :

- `Comprendre ce contenu` ;
- questions liées à l’article ou au programme affiché ;
- réponse issue uniquement des contenus locaux ;
- source visible ;
- mention `Préfiguration locale de l’assistance Mbàmbulaan`.

Ne pas transformer la landing en vitrine IA. L’IA publique reste une capacité pédagogique facultative.

## Lot 9 — Cohérence du site public

Le site public existant `/`, `/decouvrir`, `/decouvrir/[slug]` et `/contact` reste un espace vivant pour tous les visiteurs.

Ne pas le reconstruire entièrement. Faire seulement une passe de cohérence :

- landing courte et lisible ;
- contenus factices présentés comme de vrais contenus, pas comme des instructions de démo ;
- publications, programmes, agenda et contact fonctionnels localement ;
- CTA contrastés ;
- vocabulaire cohérent avec la console ;
- accès Ministère clairement séparé ;
- aucune répétition des détails de la console sur le public.

## Lot 10 — Design system premium XXL

Conserver l’identité institutionnelle maritime actuelle et la rendre plus cohérente.

### Direction

`Institution publique sobre + centre de coordination maritime + document administratif premium`.

### Règles

- fond clair dominant ;
- bleu marine pour la structure ;
- bleu océan pour la sélection et l’information ;
- vert pour les états confirmés ;
- ambre pour l’attention ;
- rouge uniquement pour l’urgence réelle ;
- sable en accent institutionnel, jamais comme couleur de texte faiblement contrastée ;
- coins modérés, pas de bulles SaaS partout ;
- lignes fines et sections documentaires ;
- ombres rares ;
- pictogrammes fonctionnels seulement ;
- boutons avec hiérarchie primaire, secondaire, consultation et action sensible ;
- focus clavier visible ;
- minimum 44 px pour les actions principales tactiles ;
- contraste WCAG AA ;
- aucune couleur de texte identique ou proche de son fond.

### Composants à consolider

- `PrimaryAction` ;
- `SecondaryAction` ;
- `FilterBar` ;
- `MetricCard` ;
- `ChartPanel` ;
- `EmptyState` ;
- `QuayLink` ;
- `DossierSummaryRow` ;
- `AssistancePanel` ;
- badges de confiance et de situation.

Réutiliser les primitives existantes lorsque c’est propre. Ne pas introduire un nouveau framework ni une bibliothèque graphique lourde.

## Données de démonstration à couvrir

Les huit quais doivent être visibles et fonctionnels :

- Saint-Louis ;
- Fass Boye ;
- Kayar ;
- Soumbédioune ;
- Hann ;
- Mbour ;
- Joal-Fadiouth ;
- Kafountine.

Chaque quai doit avoir assez de données cohérentes pour ouvrir une fiche crédible :

- région ;
- coordonnées d’affichage ;
- débarquements ;
- volume ;
- espèces ;
- pirogues ;
- activité du jour ;
- niveau de situation ;
- au moins un relais local ;
- zéro ou plusieurs besoins, programmes et dossiers.

Ne pas mettre une alerte ou un dossier critique artificiel sur chaque quai. La diversité des situations rend la démonstration crédible.

## Fichiers principaux à inspecter et adapter

- `src/app/espace-prive/page.tsx`
- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryPilotageView.tsx`
- `src/components/private-space/MinistryQuayAtlas.tsx`
- `src/components/private-space/QuayProfileSheet.tsx`
- `src/components/private-space/MinistryCommunityProgramsView.tsx`
- `src/components/private-space/MinistryDossiersView.tsx`
- `src/components/private-space/MinistryDossierExperience.tsx`
- `src/lib/ministryOperationalDossiers.ts`
- `src/lib/mbambulaanAssistant.ts`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`
- composants publics actifs sous `src/components/public/`
- éventuellement un nouveau `src/lib/ministrySelectors.ts`
- éventuellement de nouveaux composants graphiques sous `src/components/private-space/charts/`

Ne pas réanimer les anciens composants ou routes obsolètes qui ne sont plus utilisés par la console V15.

## Contraintes techniques

- Next.js 15, React 19, TypeScript, Tailwind CSS, App Router ;
- pas de backend ;
- pas de base de données ;
- pas d’API cartographique ;
- pas d’API WhatsApp ou téléphonique ;
- pas d’API IA ;
- pas de persistance prétendue ;
- pas de dépendance lourde ;
- pas de changement de framework ;
- données et documents explicitement simulés ;
- transmissions externes explicitement manuelles ;
- organisation institutionnelle paramétrable après cadrage ;
- landing et routes publiques existantes préservées ;
- navigation privée limitée à Pilotage, Atlas et Communautés & Programmes ;
- Dossiers et Assistance restent transversaux.

## Ce qu’il faut supprimer ou éviter

- tout CTA majeur mentionnant Kayar comme priorité globale ;
- tout clic `8 quais` qui ouvre Kayar ;
- les statuts `Programme proposé` et `Finançable` dans la vue Besoins ;
- les cinq colonnes Kanban de maturité des besoins ;
- le discours produit sur la page de connexion ;
- les chiffres indépendants et incohérents entre modules ;
- les graphiques décoratifs sans filtre ou sans sens métier ;
- les doubles cartes ;
- les besoins et financements détaillés dans l’Atlas ;
- les détails maritimes complets dans Communautés & Programmes ;
- les listes de dossiers exhaustives dans Pilotage ;
- les composants SaaS génériques ;
- les badges excessifs ;
- les actions déjà accomplies reproposées ;
- les faux envois, fausses synchronisations et fausses décisions IA.

## Parcours de démonstration final

### Parcours A — lecture nationale et territoire

1. ouvrir `/espace-prive` ;
2. comprendre immédiatement qu’il s’agit d’un accès sécurisé ;
3. entrer dans Pilotage ;
4. filtrer la période et observer KPI, histogramme, espèces et pirogues ;
5. cliquer Mbour ou Saint-Louis dans le graphique des quais ;
6. arriver dans Atlas sur le bon quai ;
7. consulter activité, pirogues, espèces et situations ;
8. revenir au contexte sans perdre les filtres utiles.

### Parcours B — traitement opérationnel

1. depuis Atlas ou Pilotage, ouvrir un dossier territorial ;
2. voir immédiatement `À faire maintenant` et `Résultat attendu` ;
3. demander ou enregistrer la vérification ;
4. préparer un message manuel si nécessaire ;
5. déposer une pièce ;
6. valider humainement ;
7. produire le document ;
8. clôturer ;
9. vérifier que l’action accomplie ne réapparaît pas.

Kayar peut servir à cette démonstration, mais le code doit permettre le même parcours pour n’importe quel quai.

### Parcours C — communauté et financement

1. ouvrir Communautés & Programmes ;
2. filtrer les besoins qualifiés ;
3. ouvrir un besoin ;
4. suivre le lien vers son programme ;
5. consulter bénéficiaires, résultat attendu et jalon ;
6. ouvrir l’opportunité de financement reliée ;
7. préparer le dossier ;
8. confirmer manuellement une transmission ;
9. enregistrer une réponse partenaire.

### Parcours D — assistance facultative

1. utiliser la console avec assistance désactivée ; le parcours reste complet ;
2. activer l’assistance ;
3. constater immédiatement l’apparition d’un panneau contextuel ;
4. demander une synthèse ou un projet de note ;
5. vérifier les faits et sources ;
6. désactiver l’assistance sans perdre le contexte.

## Critères d’acceptation fonctionnels

La passe est terminée uniquement si :

- `/espace-prive` ne présente plus les modules ni les KPI ;
- la navigation privée reste exactement `Pilotage`, `Atlas`, `Communautés & Programmes` ;
- `Besoins remontés` ne contient que les statuts Signalé, Vérifié et Qualifié ;
- programmes et financements ont leurs propres statuts ;
- les relations besoin → programme → financement restent visibles ;
- le KPI des huit quais ouvre l’Atlas national, pas Kayar ;
- chacun des huit quais ouvre sa propre fiche ;
- aucun dossier non-Kayar ne reçoit des valeurs Kayar ;
- le Pilotage contient les KPI opérationnels et les cinq familles de graphiques demandées ;
- tous les graphiques réagissent aux filtres ;
- un clic de graphique ouvre le bon contexte ;
- la fiche quai reste territoriale ;
- le cycle pirogue est une timeline, pas un marqueur ;
- le panneau dossier montre une action principale et un résultat attendu ;
- l’assistance est désactivée par défaut et immédiatement visible après activation ;
- l’assistance n’est jamais obligatoire ;
- les pages publiques restent fonctionnelles et cohérentes ;
- aucun CTA n’a un texte invisible ;
- aucune route active n’est cassée ;
- aucun débordement horizontal aux largeurs prévues.

## Contrôles de non-régression ciblés

Après implémentation, rechercher et expliquer tout résultat restant dans le code actif :

```bash
rg -n 'onViewAtlas\("kayar"\)|scope: "Kayar"|sourceId: "kayar"|quayId: "kayar"|Ouvrir la priorité Kayar|Reprendre la démonstration Kayar' src/components/private-space src/lib
```

Les données Kayar sont autorisées. Les comportements génériques codés en dur vers Kayar ne le sont pas.

Vérifier aussi :

```bash
rg -n 'Programme proposé|Finançable' src/components/private-space/MinistryCommunityProgramsView.tsx
```

Ces termes peuvent apparaître dans les lectures Programme ou Financement si leur sens est correct. Ils ne doivent pas être utilisés comme statuts de besoin.

## Validation obligatoire

Exécuter séquentiellement, pas en parallèle :

```bash
npm run typecheck
npm run build
git diff --check
```

Puis vérifier les routes :

- `/` ;
- `/decouvrir` ;
- au moins un `/decouvrir/[slug]` ;
- `/contact` ;
- `/espace-prive` ;
- `/espace-prive/etat`.

Si l’environnement permet une vérification navigateur, tester au minimum 390, 768, 1280 et 1440 px. Vérifier les CTA, les filtres, les graphiques, les panneaux, les modales, les textes, la fermeture et la conservation du contexte.

Faire ensuite une revue finale du diff comme un reviewer :

- logique métier ;
- cohérence des données ;
- absence de hardcode territorial ;
- accessibilité ;
- responsive ;
- imports inutilisés ;
- classes Tailwind invalides ;
- textes français et accents ;
- routes et interactions.

Corriger les défauts trouvés avant de conclure.

## Compte rendu final attendu dans la PR

Mettre à jour la PR #35 avec :

1. architecture finale et responsabilité de chaque module ;
2. simplifications réalisées ;
3. suppression des hardcodes Kayar ;
4. nouveaux indicateurs et graphiques ;
5. modèle Besoin → Programme → Financement ;
6. simplification du dossier ;
7. fonctionnement de l’assistance facultative ;
8. fichiers créés et modifiés ;
9. résultats `typecheck`, `build` et `diff --check` ;
10. routes testées ;
11. limites restant volontairement simulées ;
12. éventuels points qui devront être cadrés avec le Ministère.

## Définition de terminé

Le travail n’est pas terminé parce que l’interface est plus jolie. Il est terminé quand :

- un décideur comprend la valeur nationale de Mbàmbulaan ;
- un agent comprend immédiatement son prochain geste ;
- un besoin communautaire garde son identité tout en étant relié à un programme et à un financement ;
- n’importe quel quai fonctionne sans dépendre de Kayar ;
- les modules se complètent sans se recopier ;
- l’assistance facultative apporte une aide visible sans gouverner la décision ;
- la démonstration peut être jouée de bout en bout sans explication corrective du présentateur ;
- le build est vert ;
- l’équipe peut arrêter les développements et passer aux tests.

Dernier principe d’arbitrage : **si une nouvelle fonctionnalité entre en concurrence avec la clarté de la boucle signal ou besoin → dossier → preuve → décision ou programme → document, la clarté de la boucle gagne toujours.**
