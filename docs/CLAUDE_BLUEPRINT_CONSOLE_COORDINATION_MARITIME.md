# Mbambulaan - Claude Blueprint - Console de Coordination Maritime

Ce document devient la nouvelle reference produit/design pour la refonte de l'espace prive.

Il declassse les prompts precedents. Les versions actuelles ne doivent plus servir de reference visuelle.

## Verdict de Claude

Le probleme n'est pas seulement visuel. Il est conceptuel.

Les iterations precedentes echouent parce qu'elles utilisent encore le referentiel visuel d'un SaaS B2B ou d'un dashboard Tailwind : cards blanches, grille generique, radius eleve, ombres decoratives, hero marketing, carte illustrative.

Mbambulaan doit changer de referentiel : passer d'une application web a un instrument de pilotage institutionnel.

References mentales : console VTS maritime, outil de coordination territoriale, SCADA, cockpit decisionnel public, outil de renseignement operationnel, MarineTraffic pour la lecture cartographique.

## Nouvelle direction

Nom public francais : Console de Coordination Maritime.

Positionnement international / bailleurs : Maritime Coordination OS.

Promesse : observer l'activite maritime, qualifier les signaux terrain, coordonner les actions, tracer les decisions, produire une preuve institutionnelle.

## Principes UI non negociables

1. La donnee prime sur la decoration.
2. La couleur encode un statut, pas une humeur graphique.
3. Densite maitrisée : plus d'information utile par ecran, moins d'espace decoratif.
4. Angles droits ou quasi droits : radius 2 a 6 px, maximum 8 px.
5. Pas d'ombres decoratives : separateurs fins et contrastes de fond.
6. La carte est le coeur du module Atlas, pas un widget.
7. Wording operationnel : verifier, qualifier, arbitrer, exporter.
8. Chaque ecran repond a une question de pilotage : que se passe-t-il, qu'est-ce qui merite attention, quelle action prendre.

## Interdictions strictes

- pas de dashboard Tailwind generique ;
- pas de cards blanches arrondies partout ;
- pas de radius superieur a 8 px ;
- pas d'ombres avec blur superieur a 4 px ;
- pas de hero SaaS ;
- pas de wording marketing ;
- pas de cyan/violet flashy ;
- pas de carte decorative ;
- pas de navigation horizontale en onglets dans la console ;
- pas de style OSM/Leaflet par defaut non stylise ;
- pas d'ambre ou rouge hors alertes/statuts.

## Tokens design cibles

--mb-white: #FFFFFF
--mb-offwhite: #F6F5F1
--mb-neutral-100: #EDEBE5
--mb-neutral-200: #DDDAD1
--mb-neutral-400: #9C9A93
--mb-neutral-600: #5D5C57
--mb-neutral-900: #1F2422
--mb-navy-900: #0B1F33
--mb-navy-700: #12314F
--mb-navy-500: #1E4A73
--mb-ocean-600: #2A6F8E
--mb-ocean-400: #4C93B0
--mb-bluegray-500: #5C7A8A
--mb-sand-300: #E4D9C2
--mb-green-600: #2F6E4E
--mb-amber-500: #C08A2E
--mb-red-600: #B0402F

Regles :

- rouge seulement urgence ;
- ambre seulement vigilance ;
- vert seulement conforme/actif ;
- ocean pour action primaire et selection ;
- navy pour structure institutionnelle ;
- offwhite/neutres pour les fonds.

## Typographie

UI : Inter.

Donnees, timestamps, identifiants, coordonnees : IBM Plex Mono ou JetBrains Mono.

Echelle recommandee : 11 / 12 / 13 / 15 / 18 / 24 / 32 px.

Le 32 px doit etre reserve aux chiffres cles, pas aux titres marketing.

## Page /espace-prive

Role : sas institutionnel, pas landing page.

Structure cible :

- ecran plein ;
- fond navy institutionnel ;
- composition asymetrique 60/40 ;
- bloc gauche : positionnement institutionnel ;
- bloc droit : acces console sur fond clair ;
- wording exact du bouton : Acceder a la console ;
- ligne de confiance : Acces trace et reserve aux acteurs habilites de la filiere ;
- pied minimal : version, contact, mentions.

Titre propose : Coordonner la filiere peche artisanale, avec des donnees verifiees.

A eviter : hero centre, grand titre marketing, carousel, gros bouton arrondi, cards de modules decoratives.

## Page /espace-prive/etat

Role : application metier de coordination.

Structure globale : AppShell.

- TopBar institutionnelle ;
- NavigationRail verticale gauche ;
- zone de travail centrale ;
- ContextPanel droit ;
- registre / timeline accessible ;
- pas d'onglets horizontaux.

TopBar : nom console, organisation, statut de synchronisation, derniere synchronisation, export contextuel.

NavigationRail : trois espaces avec icones sobres et labels :

1. Atlas maritime ;
2. Filiere & programmes ;
3. Pilotage institutionnel.

## Espace 01 - Atlas maritime

Question centrale : que se passe-t-il sur le littoral et en mer ?

Composition :

- MapCanvas dominant ;
- LayerControl flottant sur la carte ;
- couches : quais, pirogues, debarquements, alertes ;
- switch anguleux Vue quais / Vue pirogues ;
- filtres fins : zone, statut, periode, quai ;
- ContextPanel droit apres selection ;
- EvidenceTimeline / registre d'evenements ;
- actions : Verifier, Creer une alerte, Ouvrir la fiche complete, Exporter la zone.

Carte : utiliser MapLibre GL JS si possible.

MapLibre est recommande car open-source, sans cle API payante, et permet un style vectoriel custom. Ne pas utiliser le rendu OSM par defaut.

Si MapLibre est impossible techniquement, documenter le blocage et produire un MapCanvas custom beaucoup plus credible, sans revenir a une illustration faible.

## Espace 02 - Filiere & programmes

Question centrale : comment transformer un signal terrain en programme et impact ?

Parcours : Signal terrain -> Qualification -> Programme -> Partenaire -> Action -> Impact.

Composition :

- WorkflowBoard en colonnes fixes ;
- compteur mono par colonne ;
- elements compacts, pas grosses cards ;
- ProgramPipeline pour programmes actifs ;
- ContextPanel droit sur signal/programme/partenaire ;
- DecisionPanel : decisions a prendre ;
- EvidenceTimeline : preuves d'impact.

Le module doit ressembler a un moteur de coordination, pas a un catalogue.

## Espace 03 - Pilotage institutionnel

Question centrale : quelle decision prendre aujourd'hui ?

Composition :

- MetricRow haut avec 4 a 6 KPI institutionnels ;
- mini carte de synthese ;
- DataTable volumes par quai/region/espece ;
- Alertes critiques toujours visibles ;
- DecisionPanel : arbitrages recommandes ;
- ActionRegister : actions prioritaires ;
- EvidenceTimeline : preuve ;
- ExportPanel : export institutionnel.

Ce module doit etre un cockpit de decision, pas un dashboard vitrine.

## Composants a creer ou refondre

- AppShell ;
- TopBar ;
- NavigationRail ;
- WorkspaceHeader ;
- MapCanvas ;
- LayerControl ;
- ContextPanel ;
- DecisionPanel ;
- EvidenceTimeline ;
- MetricRow ;
- StatusBadge ;
- DataTable ;
- WorkflowBoard ;
- ProgramPipeline ;
- ActionRegister ;
- ExportPanel.

## Wording obligatoire

- Acceder a la console ;
- Verifier ;
- Qualifier ;
- Creer une alerte ;
- Decisions a prendre ;
- Actions prioritaires ;
- Registre de preuve ;
- Export institutionnel ;
- Derniere synchronisation.

Supprimer les formulations generiques : Bienvenue, Decouvrez, Boostez, Tableau de bord, Statistiques, Vos donnees.

## Prompt final Codex / Sites

Lire ce fichier entier avant toute modification.

Objectif : remplacer completement l'actuelle interface privee par une Console de Coordination Maritime premium et institutionnelle.

Ne pas ameliorer l'existant. Le remplacer.

Etape 0 : audit obligatoire.

- explorer l'arborescence ;
- identifier les fichiers cibles ;
- verifier routes /espace-prive et /espace-prive/etat ;
- verifier le systeme de styles ;
- verifier dependances ;
- lister ce qui sera supprime/remplace.

Fichiers probables :

- src/app/espace-prive/page.tsx ;
- src/app/espace-prive/etat/page.tsx ;
- src/app/globals.css ;
- src/components/private-space/MinistryControlTower.tsx ;
- src/components/private-space/MinistryControlTowerParts.tsx ;
- src/data/ministryControlTowerData.ts si necessaire.

Execution :

1. creer les tokens design dans globals.css ;
2. creer/refondre AppShell, TopBar, NavigationRail, WorkspaceHeader ;
3. refaire /espace-prive en sas institutionnel asymetrique ;
4. refaire /espace-prive/etat en app console ;
5. integrer MapLibre GL JS si compatible ;
6. sinon documenter pourquoi et produire un MapCanvas custom plus credible ;
7. refaire Atlas maritime ;
8. refaire Filiere & programmes ;
9. refaire Pilotage institutionnel ;
10. remplacer le wording generique ;
11. supprimer les patterns cards/radius/ombres ;
12. lancer npm run typecheck ;
13. lancer npm run build ;
14. corriger les erreurs.

Critere d'acceptation :

- aucune card SaaS generique visible ;
- aucun radius > 8 px ;
- aucune ombre decorative forte ;
- la carte domine Atlas maritime ;
- les couleurs sont professionnelles et fonctionnelles ;
- les trois espaces ont des compositions metier distinctes ;
- le produit est montrable a un ministere ou un bailleur sans excuse de design.

Si une contrainte technique empeche un point, le signaler explicitement plutot que revenir silencieusement a un choix generique.