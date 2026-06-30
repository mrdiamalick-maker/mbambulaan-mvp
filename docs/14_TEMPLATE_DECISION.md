# Template Decision Mbàmbulaan

## Décision

Template retenu pour la reconstruction propre : TailAdmin, sous réserve de validation visuelle finale avant achat.

## Pourquoi TailAdmin

TailAdmin est le meilleur compromis pour Mbàmbulaan à ce stade :

- compatible avec Next.js, React, TypeScript et Tailwind ;
- proche de la stack actuelle ;
- adapté aux dashboards B2B ;
- contient sidebar, cards, charts, tables, maps et layouts dashboard ;
- propose des dashboards utiles pour analytics, CRM, SaaS, logistics et finance ;
- permet d'aller vite sans imposer une stack trop lourde.

## Alternatives non retenues en priorité

### Mosaic

Très bon choix premium sobre. À garder en alternative si la revue visuelle TailAdmin paraît trop générique.

### Metronic

Très puissant, mais plus lourd. À garder pour une version plus mature ou si TailAdmin ne suffit pas pour les futurs modules.

### Materio

Solide, mais moins naturel pour le repo actuel car basé sur Material UI.

### Tremor + shadcn custom

Très flexible, mais demande plus d'effort design et risque de ralentir l'exécution.

## Risques acceptés

- TailAdmin peut sembler générique si la personnalisation est faible.
- La landing devra probablement être fortement personnalisée.
- La vue territoire devra probablement être adaptée ou construite sur mesure.
- Les dashboards TailAdmin devront être transformés en espaces métier, pas copiés tels quels.

## Règles d'utilisation

Ne pas importer tout le template sans stratégie.

Utiliser seulement :

- app shell ;
- sidebar ;
- cards KPI ;
- charts ;
- tables ;
- maps ou map-like panels ;
- forms ;
- profile / CRM / logistics patterns ;
- dark panels ;
- responsive layout.

Ignorer ou neutraliser :

- e-commerce ;
- pages marketing génériques ;
- composants décoratifs inutiles ;
- modules sans lien avec la coordination ;
- pages qui recréent une marketplace.

## Mapping prioritaire

| Besoin Mbàmbulaan | Élément TailAdmin probable |
| --- | --- |
| Espace premium | Dashboard shell avec sidebar |
| Ministère | Analytics / command center |
| ONG | Project / analytics dashboard |
| Collectivité | Operations dashboard |
| Mareyeur | Logistics dashboard |
| Exportateur | CRM / pipeline |
| Organisation | CRM / contacts / profile |
| Investisseur | SaaS / finance dashboard |
| Signaux | Activity feed / tables |
| Financements | Data tables et status badges |
| Rapports | Cards et document lists |
| Preuves | Badges, confidence bars, notes |

## Impact sur la reconstruction

Créer ensuite une branche :

`rebuild-premium-template`

Objectif : reconstruire proprement les routes :

- `/`
- `/demo`
- `/demo/etat`
- `/demo/ong`
- `/demo/collectivite`
- `/demo/pecheur`
- `/demo/mareyeur`
- `/demo/exportateur`
- `/demo/organisation`
- `/demo/investisseur`
- `/demande-demo`
- `/devis`
- `/espace-prive`

## Critère de validation finale

TailAdmin est confirmé seulement si la revue visuelle montre que l'on peut produire un rendu premium, institutionnel, crédible pour ministère, ONG, collectivité, entreprise, exportateur et investisseur.

Si TailAdmin paraît trop générique après revue visuelle, basculer vers Mosaic.

Si le besoin de richesse produit devient prioritaire sur la vitesse, basculer vers Metronic.
