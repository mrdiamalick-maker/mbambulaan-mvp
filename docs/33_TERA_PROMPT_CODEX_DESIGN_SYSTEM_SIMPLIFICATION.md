# Tera prompt Codex - design system et simplification Qlik-like

## Mission

Tu travailles sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis d'abord :

- `docs/32_DIAGNOSTIC_GAP_QLIK_TEMPLATE_VS_PARCOURS.md`
- `docs/31_TERA_PROMPT_CODEX_MINISTERE_EXECUTION_FINAL.md`
- `docs/26_SPEC_FONCTIONNELLE_ESPACE_MINISTERE_V1.md`

Objectif : reduire l'effet admin, alleger les blocs, reduire le texte et rapprocher Mbambulaan d'une experience analytics B2B premium inspiree de Qlik.

Ne change pas de template. Ameliore le parcours, le design system, la densite, la hierarchie et les composants.

## Probleme observe

Les blocs sont trop grands.

Il y a trop de texte.

Les vues empilent trop de panels.

L'utilisateur peut se perdre.

Le rendu reste trop admin et pas assez solution analytics premium.

## Direction generale

Chaque vue doit repondre a une question simple :

- Que dois-je savoir maintenant ?
- Quelle zone prioriser ?
- Quel budget pose probleme ?
- Quel programme se chevauche ?
- Quelle ressource est critique ?
- Quelle note puis-je preparer ?

Si un bloc ne repond pas a une question claire, le simplifier ou le retirer.

## Design system a appliquer

Créer ou renforcer des composants plus compacts :

- `InsightCard` : petit bloc insight avec titre court, valeur, tendance, action.
- `MetricTile` : KPI compact, pas une grosse carte.
- `ActionStrip` : 3 actions principales max.
- `DataPreviewTable` : tableau epure avec 4 a 5 colonnes max.
- `DecisionFlow` : flow visuel simple question -> analyse -> action.
- `AiAssistPanel` : IA sobre, rassurante, non envahissante.
- `CompactPanel` : panel avec moins de padding et moins de texte.
- `ModuleHeader` : titre, question cle, action principale.

Utiliser ces composants pour la landing et surtout `/espace-prive/etat`.

## Regles UX

- Maximum 3 KPIs principaux visibles en haut d'une vue.
- Maximum 2 gros blocs par vue.
- Maximum 1 action principale par module, puis 2 actions secondaires.
- Reduire les paragraphes longs.
- Remplacer les explications longues par des labels courts et insights.
- Utiliser des flows, matrices et mini visualisations.
- Eviter les cartes trop grandes sans information actionnable.
- Donner plus d'air : espaces blancs, grille claire, alignements stricts.
- Les textes doivent etre institutionnels, courts et utiles.

## Landing

Refondre les sections trop textuelles.

Hero : plus simple, plus premium, moins charge.

Remplacer l'apercu solution par un flow visuel clair :

Signal terrain -> Analyse territoriale -> Coordination -> Decision / Rapport

La section cas d'usage doit devenir un diagramme ou une matrice propre :

Acteur -> Ce qu'il doit voir -> Decision facilitee -> Module Mbambulaan

Ne pas multiplier les cards.

## Espace Ministere

Route principale : `/espace-prive/etat`.

Conserver les 6 entrees principales :

- Vue nationale
- Carte et territoires
- Alertes et incidents
- Programmes et budgets
- Ressources et acteurs
- Notes, preuves et acces

Mais chaque vue doit etre plus compacte.

## Vue nationale

Objectif : situation en 60 secondes.

Afficher :

- 3 KPIs maximum en haut ;
- un flow decisionnel court ;
- une synthese IA courte ;
- une liste compacte des 3 decisions attendues ;
- une action principale : Preparer une note.

Reduire les gros blocs `Top zones critiques`, `Alertes budgetaires`, `Dernieres preuves` si trop encombrants. Les transformer en colonnes compactes ou onglets internes.

## Carte et territoires

La carte peut rester grande, mais les details doivent etre plus lisibles.

Afficher :

- carte grande ;
- panneau detail compact ;
- filtres simples ;
- tableau territories compact sous la carte ou a droite.

Eviter les grands textes.

## Alertes et incidents

Transformer en vue de triage :

- 3 compteurs courts ;
- liste compacte d'alertes ;
- niveau de severite ;
- responsable ;
- prochaine action ;
- action principale : Assigner / demander verification.

## Programmes et budgets

Transformer en vue de pilotage :

- 3 KPIs : taux execution, ecarts, programmes a risque ;
- table compacte programmes/budgets ;
- mini bar d'execution ;
- action principale : Signaler ecart ou preparer arbitrage.

Ne pas donner l'impression d'un ERP comptable.

## Ressources et acteurs

Transformer en vue capacite operationnelle :

- ressources critiques ;
- acteurs clefs ;
- infrastructures sensibles ;
- disponibilite ;
- action principale : demander maintenance ou affecter ressource.

## Notes, preuves et acces

Transformer en vue gouvernance :

- notes en brouillon ;
- preuves recentes ;
- modules IA activables/desactivables ;
- permissions principales ;
- action principale : generer note IA ou valider preuve.

Le bloc IA doit etre rassurant : l'IA assiste, l'humain valide.

## Style visuel

Palette : bleu ocean, turquoise, sable, vert lagon, ambre/corail.

Moins de bordures lourdes.

Moins de background colores partout.

Plus de surfaces blanches et sections propres.

Typographie : titres courts, texte secondaire discret.

Boutons : clairs, lisibles, actions peu nombreuses.

## Ne pas faire

- ne pas changer tout le template ;
- ne pas ajouter plus de texte ;
- ne pas ajouter plus de pages ;
- ne pas multiplier les cards ;
- ne pas surcharger les vues ;
- ne pas transformer Mbambulaan en ERP ou BI generique ;
- ne pas retravailler tous les espaces acteurs.

## Validation attendue

L'utilisateur doit pouvoir comprendre chaque vue en moins de 10 secondes.

Le Ministere doit voir :

- quoi regarder ;
- pourquoi c'est important ;
- quelle action faire.

## Execution

Priorite : landing et `/espace-prive/etat`.

A la fin, executer :

```bash
npm run typecheck
npm run build
```

Puis resumer :

- composants simplifiés ;
- blocs reduits ;
- textes reduits ;
- parcours clarifie ;
- design plus Qlik-like ;
- PR #26 toujours draft.
