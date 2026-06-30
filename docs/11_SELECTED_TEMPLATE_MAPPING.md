# Selected Template Mapping Mbàmbulaan

## Statut

Document préparatoire pour mapper Mbàmbulaan sur le template retenu.

Template prioritaire provisoire : TailAdmin.
Alternative sobre : Mosaic.
Alternative très complète : Metronic.

## Principe

Le template ne définit pas le produit. Mbàmbulaan définit le produit. Le template fournit les layouts, composants, tables, charts, sidebar, formulaires et pages de détail.

## Routes à reconstruire

| Route | Rôle produit | Zone template probable |
| --- | --- | --- |
| `/` | Landing premium acquisition | Landing custom |
| `/demo` | Sélection de rôle | Onboarding custom |
| `/demo/etat` | Espace ministère | Command center |
| `/demo/ong` | Espace programme | Project dashboard |
| `/demo/collectivite` | Espace territoire | Operations dashboard |
| `/demo/pecheur` | Parcours assisté | Timeline mobile-first |
| `/demo/mareyeur` | Flux et produits | Logistics dashboard |
| `/demo/exportateur` | Opportunités qualifiées | CRM pipeline |
| `/demo/organisation` | Membres et plaidoyer | CRM members |
| `/demo/investisseur` | Thèse infrastructure | Executive analytics |
| `/devis` | Cadrage offre | Form wizard |
| `/demande-demo` | Préparation démo | Form wizard |
| `/espace-prive` | Produit final simulé | App shell avec sidebar |

## Sidebar cible espace privé

1. Vue d'ensemble
2. Territoires
3. Signaux
4. Acteurs
5. Programmes
6. Financements
7. Produits / flux
8. Coordination
9. Rapports
10. Preuves
11. Paramètres

## Composants à mapper

| Besoin Mbàmbulaan | Composant template |
| --- | --- |
| KPIs | Metric cards |
| Signaux terrain | Activity feed |
| Territoires | Map panel |
| Financements | Data table |
| Programmes | Project tracker |
| Acteurs | CRM table |
| Actions | Task board |
| Rapports | Report cards |
| Preuves | Badges et confidence bars |
| Formulaires | Form wizard |

## Espaces par rôle

### État / Ministère

Layout : command center dense.

Blocs : KPIs institutionnels, carte des tensions, demandes de financement, programmes actifs, acteurs à coordonner, décision recommandée, note ministère, preuve.

### ONG / Programme

Layout : project dashboard.

Blocs : portefeuille programme, bénéficiaires, actions terrain, preuves, risques, reporting bailleur, progression.

### Collectivité

Layout : operations dashboard simple.

Blocs : carte communale, problèmes prioritaires, actions locales, partenaires, revenus potentiels, note maire.

### Pêcheur

Layout : timeline mobile-first.

Blocs : signalement assisté, suivi demande, relais quai, statut simple, opportunités encadrées.

### Mareyeur

Layout : logistics dashboard.

Blocs : lots, volumes, qualité, prix indicatifs, logistique, alertes, financement court terme.

### Exportateur

Layout : CRM pipeline et risk matrix.

Blocs : opportunités, pipeline, score qualité, trace, risques, conditions, preuves demandées.

### Organisation professionnelle

Layout : CRM members et project dashboard.

Blocs : registre membres, besoins agrégés, demandes collectives, partenaires, preuves, note plaidoyer.

### Investisseur

Layout : executive analytics.

Blocs : segments payeurs, flux de valeur, roadmap, risques, territoires pilotes, services monétisables.

## Mocks nécessaires

Créer plus tard :

`src/data/mockMbambulaan.ts`

Objets : mockTerritories, mockActors, mockSignals, mockFundingRequests, mockPrograms, mockProducts, mockReports, mockActions, mockRoles, mockPermissions.

## Branche de reconstruction

Créer après choix du template :

`rebuild-premium-template`

## Ordre de reconstruction

1. intégrer le template choisi ;
2. définir design tokens Mbàmbulaan ;
3. créer app shell ;
4. créer mocks ;
5. reconstruire landing ;
6. reconstruire demo ;
7. reconstruire espaces par rôle ;
8. reconstruire espace privé ;
9. reconstruire formulaires ;
10. neutraliser modules publics isolés ;
11. tester typecheck et build.