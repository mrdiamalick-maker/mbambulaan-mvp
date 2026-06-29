# Mbàmbulaan Design System v1.0

## Statut du document

Ce document définit la référence officielle de design system pour Mbàmbulaan. Il doit guider les designers, développeurs frontend, UX leads et CTO dans la construction future du produit.

Il ne contient aucune implémentation, aucun composant React et aucun code. Il s'appuie sur les documents 01 à 05 et ne doit pas les contredire.

## 1. Design Philosophy

Mbàmbulaan n'est ni un site vitrine, ni un ERP classique. C'est une plateforme adaptative de coordination territoriale, conçue pour aider des acteurs différents à prendre des décisions utiles avec des données fiables.

Le design doit inspirer la confiance d'une GovTech, la lisibilité d'un logiciel critique, la clarté d'un outil BI, la souplesse d'un workspace moderne et la rigueur d'une plateforme d'analyse.

| Principe | Implication |
| --- | --- |
| Décision avant décoration | Chaque écran doit aider à décider, agir ou comprendre |
| Sobriété institutionnelle | La crédibilité prime sur l'effet visuel |
| Densité contrôlée | Les données peuvent être nombreuses, mais toujours hiérarchisées |
| Confiance visible | Sources, statuts, droits et historiques doivent être lisibles |
| Adaptation par rôle | Le même système visuel sert des expériences différentes |
| Terrain et institution | Mobile simple pour le terrain, lecture robuste pour les décideurs |

## 2. Visual Language

| Dimension | Direction |
| --- | --- |
| Minimalisme | Retirer l'ornement inutile, garder les repères fonctionnels |
| Respiration | Utiliser l'espace pour séparer décisions, signaux et actions |
| Densité d'information | Autoriser des vues riches uniquement si la hiérarchie est nette |
| Hiérarchie | Titre, contexte, signal, décision, action |
| Contraste | Fort sur texte et décisions ; modéré sur surfaces secondaires |
| Micro-interactions | Discrètes, utiles, orientées feedback |
| Motion | Courte, calme, jamais décorative |
| Rythme visuel | Alternance entre blocs synthétiques, listes actionnables et détails |

## 3. Color System

Les couleurs ne sont jamais choisies uniquement pour leur esthétique. Elles servent la décision, le statut, le risque, la priorité et la lisibilité.

| Palette | Rôle | Usage recommandé |
| --- | --- | --- |
| Primary | Action principale, identité produit | CTA, lien actif, élément sélectionné |
| Secondary | Action secondaire, contexte | Bouton secondaire, onglet, panneau secondaire |
| Success | Confirmation, disponibilité, action positive | Statut disponible, succès, validation |
| Warning | Attention, tension moyenne | Alertes non critiques, lot à surveiller |
| Error | Risque, blocage, critique | Erreur, tension critique, action impossible |
| Info | Information neutre et guidance | Aide, notification informative |
| Neutral | Structure UI | Textes, surfaces, lignes, icônes |
| Background | Fond global | Pages et workspaces |
| Surface | Cartes, panneaux, modales | Contenants d'information |
| Border | Séparation | Tableaux, cartes, champs |
| Overlay | Focus, modal, drawer | États superposés |
| Text | Lisibilité | Titres, corps, labels, captions |

### Logique d'usage

| Cas | Couleur dominante | Règle |
| --- | --- | --- |
| Action | Primary | Une seule action principale par zone |
| Statut métier | Success, Warning, Error, Info | Toujours accompagné d'un texte |
| Donnée critique | Error ou Warning | Ne jamais dépendre uniquement de la couleur |
| Tableau de bord | Neutral + accent statut | Éviter les palettes arc-en-ciel |
| Cartographie | Success, Warning, Error | Vert, jaune, rouge uniquement pour activité ou tension |

## 4. Typography

La typographie doit être claire, dense et professionnelle. Les écrans opérationnels n'utilisent pas de titres héroïques.

| Niveau | Usage | Règle |
| --- | --- | --- |
| Display | Landing, démo institutionnelle | Rare, uniquement pour promesse ou grand récit |
| H1 | Titre page | Une fois par page |
| H2 | Section majeure | Structure les blocs décisionnels |
| H3 | Sous-section ou carte importante | Titre compact |
| Body | Texte courant | Lisible, sobre, sans emphase excessive |
| Caption | Source, aide, métadonnée | Court, discret |
| Label | Champ, filtre, badge | Précis, stable |
| Metric | Valeur chiffrée | Forte lisibilité, unité visible |
| Dashboard KPI | KPI institutionnel ou opérationnel | Valeur + sens + évolution |
| Tables | Données comparables | Alignement, troncature contrôlée, labels courts |

## 5. Spacing System

| Valeur | Usage |
| --- | --- |
| 4 | Séparation fine, icône/texte, micro-gap |
| 8 | Espacement interne compact, badges, petites listes |
| 12 | Champs, lignes de formulaire, groupes serrés |
| 16 | Padding standard de carte ou panneau |
| 24 | Séparation entre blocs liés |
| 32 | Séparation entre sections |
| 48 | Respiration page, grands blocs |
| 64 | Sections landing ou executive |
| 80 | Grandes respirations narratives |
| 96 | Hero ou transition majeure, usage rare |

## 6. Grid System

| Contexte | Grille | Règle |
| --- | --- | --- |
| Desktop | 12 colonnes | Dashboard, executive, administration |
| Tablet | 8 colonnes | Réduction des panneaux, priorité aux listes |
| Mobile | 4 colonnes | Une colonne principale, actions prioritaires |
| Dashboard | 12 colonnes + cartes KPI | KPI en haut, détails ensuite |
| Landing | Sections verticales | Narration, preuve, conversion |
| Administration | Grille dense | Tableaux, filtres, panneaux latéraux |

## 7. Iconography

| Élément | Règle |
| --- | --- |
| Style | Linéaire, simple, géométrique, non illustratif |
| Épaisseur | Cohérente, moyenne, lisible sur mobile |
| Taille | 16 pour inline, 20 pour boutons, 24 pour cartes |
| Couleurs | Neutral par défaut, statut seulement si signification métier |
| Règles | Une icône doit clarifier une action ou un statut, jamais décorer |

## 8. Illustration

| Support | Quand l'utiliser | Quand éviter |
| --- | --- | --- |
| Cartes | Territoires, quais, tensions, priorités | Quand la donnée n'est pas géographique |
| Photos | Landing, preuve terrain, contexte humain | Si elles deviennent stock ou décoratives |
| Satellite | Vision future, risque territorial, preuve géographique | Si non exploitable pour décision |
| Icônes | Actions, statuts, catégories | Si elles remplacent un texte nécessaire |
| Diagrammes | Architecture, flux, parcours, décision | Si le diagramme complexifie |
| Cartographie | Quais, zones, tension, impact | Si elle masque les actions |

## 9. Data Visualization

| Visualisation | Usage | Règle |
| --- | --- | --- |
| Cartes | Localiser quais, tensions, opportunités | Toujours avec légende claire |
| Heatmaps | Montrer densité ou tension | Éviter si peu de données |
| Courbes | Évolution dans le temps | Unité et période visibles |
| Barres | Comparer volumes, besoins, quais | Trier par priorité métier |
| Jauges | Couverture ou progression | Seulement pour seuils compréhensibles |
| Indicateurs | Valeur simple | Toujours relié à une décision |
| Sparklines | Tendance rapide | Ne pas remplacer le chiffre principal |
| KPIs | Synthèse décisionnelle | Valeur, contexte, variation, action |
| Comparateurs | Offre vs demande, territoire vs territoire | Montrer l'écart, pas seulement deux valeurs |
| Chronologies | Traçabilité, transaction, journée simulée | Événements datés et statuts |
| Matrices | Droits, accès, priorités | Lisibles, pas trop larges en mobile |
| Cartographie pêche | Quais, zones, espèces, activité | Couleurs statut limitées et explicites |

## 10. Component Library

| Composant | Objectif | Quand l'utiliser | Quand ne pas l'utiliser | Variantes |
| --- | --- | --- | --- | --- |
| Button | Déclencher une action | Action claire | Pour afficher un état | Primary, secondary, ghost, danger |
| Card | Grouper une information | Élément autonome | Pour encadrer toute une page | Standard, compact, interactive |
| Metric | Montrer un KPI | Décision chiffrée | Chiffre sans action | KPI, delta, benchmark |
| Panel | Regrouper une zone dense | Dashboard, détail | Si une carte suffit | Side, inline, collapsible |
| Chart | Visualiser une tendance | Comparaison ou évolution | Donnée trop faible | Line, bar, gauge |
| Map | Lire un territoire | Quais, zones, tension | Donnée non géographique | Static, interactive, heat |
| Timeline | Suivre événements | Transaction, traçabilité | Liste simple | Vertical, compact |
| Alert | Signaler un risque | Priorité, erreur, tension | Message neutre | Info, warning, critical |
| Notification | Message ciblé | Centre de notifications | Alerte système bloquante | Read, unread, critical |
| Modal | Décision courte | Confirmation, saisie simple | Flux long | Confirm, form |
| Drawer | Détail contextuel | Carte, liste, détail rapide | Contenu majeur | Right, bottom mobile |
| Filter | Réduire une liste | Statut, quai, urgence | Navigation principale | Chips, select, segmented |
| Search | Trouver une donnée | Listes, global search | Petit groupe visible | Local, global |
| Badge | Qualifier statut | Statut, priorité, risque | Texte long | Status, priority, role |
| Avatar | Identifier un acteur | Relation humaine | Donnée anonyme | Person, organization |
| Role Card | Présenter un espace | Choix profil | Module opérationnel | Public, verified |
| Opportunity Card | Résumer une opportunité | Matching | Transaction déjà détaillée | Compact, detailed |
| Decision Card | Exposer recommandation | Dashboard, executive | Simple info | Priority, risk |
| Signal Card | Remonter un signal | Coordination | KPI stable | Alert, insight |
| Programme Card | Suivre un programme | Institution, ONG | Action individuelle | Funding, territorial |
| Workflow Card | Montrer étape | Transaction | Statut isolé | Step, progress |
| Table | Comparer données | Administration, listes denses | Mobile terrain critique | Standard, compact |
| Form | Saisir données | Arrivage, besoin, invitation | Lecture seule | Simple, validated |
| Empty State | Guider sans données | Premier usage | Si données chargent | Create, import, request access |
| Toast | Feedback immédiat | Sauvegarde, succès | Information persistante | Success, error, sync |
| Tabs | Séparer vues proches | Détail avec sections | Navigation globale | Standard, compact |
| Breadcrumb | Orientation | Profondeur | Page simple | Standard |
| Stepper | Processus guidé | Transaction, démo | Action unique | Horizontal, vertical |
| Command Menu | Recherche rapide | Power users | Terrain mobile simple | Global, contextual |

## 11. Page Templates

| Template | Structure | Usage |
| --- | --- | --- |
| Landing | Hero, problème, solution, preuves, CTA | Découverte publique |
| Demo | Scénario, étapes, preuve, prochaine action | Démo par audience |
| Workspace | Synthèse, alertes, actions, historique | Accueil connecté |
| Dashboard | KPI, visualisations, décisions, détails | Pilotage |
| Administration | Table, filtres, validations, panneau détail | Gouvernance |
| Map | Carte, légende, panneau latéral, actions | Territoire |
| Opportunity | Résumé, score, acteurs, action, historique | Matching |
| Programme | Objectifs, territoires, KPI, actions | Institutions, ONG |
| Project | Contexte, tâches, impact, acteurs | Déploiements |
| Decision | Synthèse, options, risques, recommandations | Executive |
| Actor | Profil, droits, activité, recommandations | Espaces |

## 12. Responsive Rules

| Contexte | Règle |
| --- | --- |
| Desktop | Favoriser comparaison, dashboard, panneaux multiples |
| Tablet | Garder deux zones maximum : liste + détail |
| Mobile | Une action prioritaire, contenu vertical, filtres simplifiés |
| Offline | Brouillons, état de synchronisation, confirmation différée |
| Terrain | WhatsApp, SMS et saisie rapide doivent rester possibles |

## 13. Accessibility

| Sujet | Exigence |
| --- | --- |
| Contraste | Texte et actions doivent rester lisibles sur surfaces claires |
| Navigation clavier | Toutes les actions doivent être accessibles sans souris |
| ARIA | Les composants interactifs futurs devront être nommés correctement |
| Lisibilité | Phrases courtes, labels explicites, unités visibles |
| Couleurs | Jamais seul indicateur d'état |
| Internationalisation | Prévoir français, langues locales et formats numériques adaptés |

## 14. Micro Interactions

| Interaction | Règle |
| --- | --- |
| Hover | Montrer interactivité sans déplacer le layout |
| Loading | Indiquer ce qui charge et préserver la structure |
| Saving | Afficher sauvegarde, succès ou erreur |
| Sync | Montrer connecté, hors ligne, en attente |
| Notification | Prioriser, dater, permettre traitement |
| Error | Expliquer le problème et l'action corrective |
| Success | Confirmer l'action, puis proposer la suite |
| Transitions | Courtes, discrètes, orientées contexte |

## 15. Animation Principles

Les animations sont toujours discrètes, jamais décoratives et toujours utiles.

| Principe | Application |
| --- | --- |
| Fonctionnelle | Aide à comprendre changement, progression ou focus |
| Courte | Éviter toute lenteur perçue |
| Stable | Ne pas déplacer les données critiques inutilement |
| Accessible | Respecter la réduction de mouvement |
| Contextuelle | Animation seulement si elle clarifie le flux |

## 16. Design Anti Patterns

| Anti-pattern interdit | Raison |
| --- | --- |
| Fonds décoratifs | Diminuent la crédibilité et la lisibilité |
| Gradients inutiles | Détournent des décisions |
| Cards sans rôle | Ajoutent du bruit |
| Ombres excessives | Donnent un rendu gadget |
| Scroll infini | Cache la prochaine action |
| Menus de 15 entrées | Contredit la navigation par rôle |
| KPI décoratifs | Produit un dashboard passif |
| Couleurs arbitraires | Brouillent statuts et priorités |
| Icônes sans label utile | Réduit la compréhension |
| Animations décoratives | Fatigue et ralentit |
| Textes marketing dans workspace | Brouille l'usage opérationnel |
| Cartes sans légende | Rend la donnée géographique ambiguë |

## 17. Design Review Checklist

Avant toute livraison, vérifier :

1. La page a une mission unique.
2. L'action principale est évidente.
3. Les données visibles sont justifiées par le rôle.
4. Les données sensibles sont masquées.
5. Les KPI conduisent à une décision.
6. Les états vide, chargement, erreur et succès existent.
7. Le mobile garde l'action prioritaire.
8. Les couleurs respectent leur signification métier.
9. Les textes sont courts, utiles et non décoratifs.
10. Les cartes ont un rôle clair.
11. La navigation ne dépasse pas 7 entrées principales.
12. L'accessibilité couleur et clavier est prévue.
13. Les animations sont utiles ou absentes.
14. Le design ne contredit aucun document 01 à 05.

## 18. Template Recommendations

Cette analyse vise à accélérer le développement futur sans enfermer Mbàmbulaan dans un style générique.

| Template | Compatibilité | Qualité | Risques | Effort | Coût estimatif |
| --- | --- | --- | --- | --- | --- |
| Tailwind UI | Forte avec Tailwind et Next.js | Très élevée, sobre, mature | Peut paraître SaaS générique | Moyen | Payant premium |
| Untitled UI | Forte pour dashboards et composants | Très élevée, très complète | Style startup occidental à adapter | Moyen | Payant premium |
| Shadcn/ui | Très forte avec React/Tailwind | Flexible, moderne, composable | Demande forte direction design | Moyen | Gratuit, coût intégration |
| Catalyst | Forte avec Tailwind | Qualité élevée, application UI | Couverture moins large | Moyen | Payant premium |
| Flowbite Pro | Bonne | Large bibliothèque | Risque visuel moins premium | Faible à moyen | Payant |
| Tremor | Forte pour dashboards data | Excellent pour KPI et charts | Moins adapté landing/espaces | Faible | Gratuit/premium selon usage |
| Admin LTE | Moyenne | Robuste admin historique | Visuel daté, peu premium | Moyen | Gratuit |
| Tabler | Bonne | Large, propre, admin solide | Peut manquer de personnalité | Moyen | Gratuit/premium |
| Aceternity | Moyenne | Effets modernes | Trop décoratif pour mission-critical | Moyen | Payant/partiel |
| NextUI | Bonne | Composants accessibles modernes | Moins aligné Tailwind-first | Moyen | Gratuit/pro |

### Recommandation finale

La meilleure trajectoire est hybride :

1. Utiliser Shadcn/ui comme base composable pour les composants applicatifs.
2. S'inspirer de Tailwind UI ou Catalyst pour les patterns de layout premium.
3. Utiliser Tremor seulement pour les blocs data visualization si compatible.
4. Éviter Aceternity pour le produit opérationnel, sauf landing très contrôlée.
5. Éviter Admin LTE comme base visuelle principale.

Le choix final doit respecter trois conditions : sobriété institutionnelle, forte lisibilité data, capacité à créer des espaces par rôle.
