# Tera prompt Codex - Qlik inspired Private OS

## Mission

Tu travailles sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis d'abord :

- `docs/20_PRODUCT_CHALLENGE_QLIK_STYLE.md`
- `docs/19_TERA_PROMPT_CODEX_ECOSYSTEM_PRODUCT.md`
- `docs/18_PRODUCT_CHALLENGE_CAPABILITIES.md`

Objectif : transformer l'espace prive Mbambulaan en Private OS metier inspire des meilleures plateformes analytics comme Qlik, Power BI et Looker Studio, sans perdre la vision Mbambulaan.

## Probleme a corriger

Aujourd'hui les menus de l'espace prive existent, mais ils doivent devenir vraiment dynamiques.

Un clic sur un menu ne doit pas juste changer un libelle. Il doit afficher un module complet different : carte, tableau, detail, workflow, actions, rapport ou administration.

## Direction produit

Chaque acteur achete une capacite metier :

- Ministere : arbitrage et cartographie institutionnelle ;
- ONG : pilotage programme et preuve bailleur ;
- Collectivite : coordination locale ;
- Pecheur : parcours assiste simple ;
- Mareyeur : flux, qualite, froid et retrait ;
- Exportateur : supply qualifie et reduction de risque ;
- Organisation : structuration collective ;
- Investisseur : these business, payeurs, revenus, roadmap.

## Direction design

Changer la direction visuelle :

- moins de noir ;
- plus de bleu ocean, turquoise, sable, vert lagon, corail/ambre ;
- boutons lisibles ;
- KPIs plus analytiques ;
- blocs plus propres ;
- experience plus moderne, B2B, data et decision.

## Carte dynamique

Creer un vrai module Carte.

Pour le Ministere, la carte doit etre un menu dedie et une grande vue.

Fonctionnalites attendues :

- grand canvas cartographique stylise ;
- points de quais avec lat/lng mockes ;
- couleur par tension ;
- filtres par tension, quai, programme, acteur, preuve ;
- clic sur point pour panneau detail ;
- actions : prioriser, demander verification, generer note, ouvrir territoire ;
- legende ;
- structure de donnees prete pour API geoloc future.

Adapter la carte aux autres profils quand utile.

## Modules par menu

Implementer une vraie logique de rendu par menu actif.

Exemple :

- `Synthese` affiche une vue executive avec KPIs, recommandations et decisions.
- `Carte` affiche la grande cartographie.
- `Territoires` affiche classement, comparaison, priorisation.
- `Tensions` affiche alertes, severite, responsables, statut.
- `Programmes` affiche portefeuille, doublons, avancement.
- `Financements` affiche dossiers, montants, priorites.
- `Notes` affiche generation et historique de notes.
- `Preuves` affiche sources, niveau de confiance, validation.
- `Admin` affiche roles, permissions, modules actives.

Faire la meme logique pour chaque role avec ses propres menus.

## KPIs analytiques

Remplacer les grosses cartes simples par des cartes analytiques :

- valeur principale ;
- tendance ;
- contexte ;
- mini-bar ou sparkline CSS simple ;
- statut ;
- action ou filtre au clic.

## Actions fonctionnelles

Toutes les actions principales doivent fonctionner en simulation client :

- filtrer ;
- changer statut ;
- ouvrir detail ;
- ajouter note ;
- prioriser ;
- generer synthese ;
- preparer rapport ;
- simuler publication interne ;
- modifier permission ;
- afficher confirmation.

Si non connecte backend : afficher `Simulation MVP - action non connectee au backend`.

## Admin prive

Ajouter un module Admin ou Parametres dans les espaces payeurs.

Il doit simuler :

- utilisateurs ;
- roles ;
- permissions ;
- modules actives ;
- historique d'action ;
- statut brouillon / valide / archive.

Le pecheur ne doit pas avoir un admin complexe.

## Landing Qlik-inspired

Revoir la landing pour une impression solution B2B data :

- hero plus clair ;
- message oriente decision ;
- sections cas d'usage ;
- preview produit plus forte ;
- preuve que la solution relie donnees, coordination et action ;
- CTA demo et devis ;
- pas de modules sensibles publics.

## Validation

Executer :

```bash
npm run typecheck
npm run build
```

## Livraison attendue

Mettre a jour PR #26 avec :

- menus vraiment dynamiques ;
- module carte dedie ;
- KPIs analytics plus premium ;
- design ocean/data plus lisible ;
- admin simule ;
- landing amelioree ;
- actions client fonctionnelles ;
- build OK ;
- PR toujours draft.