# Template Shortlist Mbàmbulaan

## Statut

Ce document prépare le choix du template premium avant reconstruction frontend propre.

Il s'appuie sur le Product UX Blueprint final, le guide de sélection template, le mapping Mbàmbulaan et l'issue 17.

La PR 13 reste un laboratoire. Elle ne doit pas devenir la base finale.

## Objectif

Choisir un template capable de porter Mbàmbulaan comme infrastructure de coordination, command center métier, espace de travail par rôle, plateforme de données, preuves, cartes, rapports et actions.

## Critères de scoring

Score sur 100 :

| Critère | Points |
| --- | ---: |
| Qualité visuelle premium | 15 |
| Dashboard / command center | 15 |
| Tables et data display | 10 |
| Charts et visualisations | 10 |
| Sidebar / navigation | 10 |
| Forms / flows commerciaux | 8 |
| Pages détails / profils | 8 |
| Adaptation role-based | 8 |
| Responsive | 6 |
| Facilité d'intégration Next / React | 6 |
| Licence / coût / maintenabilité | 4 |

Score minimum recommandé : 80 / 100.

## Shortlist

### 1. TailAdmin

Type : Admin dashboard Tailwind multi-framework.

Score : 88 / 100

Pourquoi il convient :

- disponible en Next.js, React, Tailwind ;
- beaucoup de composants dashboard ;
- dashboards analytics, CRM, SaaS, logistics, finance ;
- sidebar layouts ;
- charts, maps, tables, cards ;
- cohérent avec une reconstruction rapide de l'espace privé ;
- plus proche de notre stack actuelle qu'un template Material UI lourd.

Forces :

- bon équilibre entre vitesse d'intégration et richesse visuelle ;
- Tailwind facilite l'adaptation au design Mbàmbulaan ;
- présence de logistics et SaaS dashboard utile pour flux, territoires, coordination ;
- cartes, graphes, tableaux et dark panels disponibles ;
- plusieurs frameworks, dont Next.js.

Faiblesses :

- peut paraître générique si on ne personnalise pas fortement ;
- il faudra créer une direction artistique Mbàmbulaan plus institutionnelle ;
- les cartes géographiques devront probablement être adaptées.

Risque : moyen.

Recommandation : candidat prioritaire si on veut reconstruire vite avec Tailwind.

Mapping Mbàmbulaan :

- Analytics dashboard vers espace privé ;
- Logistics dashboard vers mareyeur, flux et produits ;
- CRM dashboard vers registre acteurs et partenaires ;
- SaaS dashboard vers investisseur et modèle économique ;
- Maps / cards vers vue territoire et signaux ;
- Tables vers financements, programmes, rapports et acteurs.

### 2. Mosaic

Type : Tailwind admin dashboard premium.

Score : 84 / 100

Pourquoi il convient :

- template admin premium sobre ;
- disponible en Next.js, React, Vue, Laravel, HTML ;
- beaucoup de pages pré-construites ;
- bon design pour apps complexes ;
- bon candidat si on veut un produit sérieux et lisible.

Forces :

- design mature, propre et crédible ;
- bonne base pour dashboard dense ;
- plus sobre que beaucoup de templates généralistes ;
- utile pour créer un espace premium simulé élégant.

Faiblesses :

- moins orienté command center métier ;
- pas forcément de landing intégrée ;
- il faudra construire ou adapter la carte opérationnelle ;
- moins spectaculaire que Metronic.

Risque : faible à moyen.

Recommandation : très bon candidat si priorité à la sobriété, lisibilité et qualité Tailwind.

### 3. Metronic

Type : toolkit dashboard très complet, Tailwind / React / Next.js.

Score : 86 / 100

Pourquoi il convient :

- très large base de layouts, pages et composants ;
- nombreux starter kits ;
- disponible en React et Next.js ;
- très adapté si on veut un vrai produit B2B dense et complet ;
- beaucoup de composants pour profils, comptes, équipes, paramètres, CRM, projets.

Forces :

- richesse exceptionnelle ;
- crédible pour espace privé complet ;
- plusieurs layouts et démos ;
- bon support des pages entreprise, profils, projets, paramètres ;
- peut couvrir rapidement beaucoup de futurs modules.

Faiblesses :

- peut être trop lourd ;
- risque de complexité d'intégration ;
- risque de design trop générique enterprise si mal personnalisé ;
- peut ralentir le MVP si on essaie de tout utiliser.

Risque : moyen à élevé.

Recommandation : candidat puissant, mais seulement si on accepte un template plus lourd et une phase d'adaptation rigoureuse.

### 4. Materio

Type : Next.js admin template basé sur Material UI.

Score : 79 / 100

Pourquoi il pourrait convenir :

- Next.js avec App Router ;
- Material UI mature ;
- CRM, analytics, logistics, charts, flows utilisateurs ;
- routes publiques, privées et partagées ;
- bonne structure pour application SaaS.

Forces :

- très structuré ;
- bon pour auth, routes privées, flows applicatifs ;
- Material UI apporte un cadre robuste ;
- dashboards CRM, analytics et logistics utiles.

Faiblesses :

- notre repo actuel est plutôt Tailwind ;
- Material UI peut imposer une direction visuelle moins différenciante ;
- personnalisation premium institutionnelle plus coûteuse ;
- licence commerciale à vérifier avec attention.

Risque : moyen.

Recommandation : candidat secondaire. Bon techniquement, mais moins naturel si on veut rester Tailwind.

### 5. Tremor + shadcn custom

Type : approche component library plutôt que template complet.

Score : 76 / 100

Pourquoi considérer cette option :

- excellente flexibilité ;
- permet de créer une vraie identité Mbàmbulaan ;
- bon pour charts, cards, dashboards sobres ;
- shadcn s'intègre bien avec Next.js et Tailwind.

Forces :

- pas enfermé dans un template ;
- très adapté si on veut une direction produit sur mesure ;
- qualité composant moderne ;
- maintenabilité élevée si bien structuré.

Faiblesses :

- demande plus de temps design ;
- pas de pages complètes prêtes à l'emploi ;
- risque de retomber dans l'exécution fragmentée si le design n'est pas cadré ;
- moins efficace pour accélérer immédiatement.

Risque : moyen.

Recommandation : option à garder si aucun template ne correspond ou si on veut construire une identité plus propriétaire.

## Classement recommandé

| Rang | Template | Score | Décision |
| ---: | --- | ---: | --- |
| 1 | TailAdmin | 88 | Meilleur compromis vitesse, stack et composants |
| 2 | Metronic | 86 | Plus puissant, mais plus lourd |
| 3 | Mosaic | 84 | Très propre, sobre, bon choix premium |
| 4 | Materio | 79 | Solide mais moins aligné Tailwind |
| 5 | Tremor + shadcn custom | 76 | Flexible mais demande plus de design |

## Recommandation finale

Choix prioritaire : TailAdmin.

TailAdmin est le meilleur point de départ si l'objectif est de reconstruire proprement, vite, en restant proche de Next.js et Tailwind. Il couvre les besoins essentiels : dashboards, sidebar, cards, charts, maps, tables, SaaS, CRM et logistics.

Alternative premium sobre : Mosaic.

Mosaic est probablement le meilleur choix si nous voulons une esthétique plus sobre et moins générique, mais il faudra plus de travail pour créer le command center métier.

Alternative très complète : Metronic.

Metronic est puissant mais plus risqué. Il peut être excellent pour une version plus mature, mais il faut éviter de se perdre dans la complexité.

## Décision proposée

Avant achat, faire une revue visuelle rapide de :

1. TailAdmin Next.js demo ;
2. Mosaic Next.js demo ;
3. Metronic Next.js demos.

Puis choisir entre :

- TailAdmin si priorité à l'exécution rapide ;
- Mosaic si priorité au premium sobre ;
- Metronic si priorité à la richesse produit et aux futurs modules.

## Étape suivante après choix

Créer :

`docs/11_SELECTED_TEMPLATE_MAPPING.md`

Ce document devra mapper précisément : landing, demo, espaces par rôle, devis, demande demo, espace privé, modules privés, composants, mocks, navigation et design system.

Ensuite seulement : créer la branche `rebuild-premium-template`.
