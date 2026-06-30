# Mbàmbulaan Template Mapping

## Statut du document

Ce document décrit comment mapper Mbàmbulaan sur un futur template premium. Il doit être utilisé après le choix du template et avant la reconstruction frontend.

La PR `#13` reste un laboratoire. La reconstruction finale doit partir d'une branche propre : `rebuild-premium-template`.

## 1. Mapping Global

| Besoin Mbàmbulaan | Élément template à utiliser |
| --- | --- |
| Landing premium | Marketing hero sobre + preview produit |
| Sélection de rôle | Onboarding, tabs, segmented control ou selector layout |
| Espace ministère | Command center dashboard |
| Espace ONG | Project / program dashboard |
| Espace collectivité | Local operations dashboard |
| Espace pêcheur | Mobile-friendly assisted journey |
| Espace mareyeur | Logistics / operations dashboard |
| Espace exportateur | Risk / supply qualification dashboard |
| Espace organisation | CRM / members dashboard |
| Espace investisseur | Executive analytics dashboard |
| Espace premium simulé | Main app dashboard with sidebar |
| Devis / demande démo | Forms page |
| Rapports | Reports / documents page |
| Preuves | Audit / status / evidence cards |

## 2. Mapping Des Routes

| Route Mbàmbulaan | Page template recommandée | Remarque |
| --- | --- | --- |
| `/` | Landing / marketing page | Très courte, orientée acquisition |
| `/demo` | Onboarding / selection page | Sélection de rôle dynamique |
| `/demo/etat` | Executive command center | Espace le plus stratégique |
| `/demo/ong` | Program management page | Pipeline, bénéficiaires, preuves |
| `/demo/collectivite` | Local operations page | Carte locale, actions, partenaires |
| `/demo/pecheur` | Assisted mobile workflow | Timeline simple, relais, statut |
| `/demo/mareyeur` | Logistics dashboard | Lots, flux, qualité, transport |
| `/demo/exportateur` | Supply risk dashboard | Opportunités, trace, qualité, risque |
| `/demo/organisation` | CRM / members page | Registre, demandes, plaidoyer |
| `/demo/investisseur` | Executive analytics page | Payeurs, flux de valeur, risques |
| `/demande-demo` | Form page | Cadrage, pas destination finale |
| `/devis` | Form / quote page | Cadrage offre ou pilote |
| `/espace-prive` | Main app shell | Produit après souscription |

## 3. Mapping Des Modules Privés

| Module Mbàmbulaan | Composants template |
| --- | --- |
| Vue territoire | Map card, region panel, status dots |
| Registre acteurs | CRM table, profile cards, filters |
| Signaux qualifiés | Activity feed, signal cards, status badges |
| Programmes | Project board, timeline, progress bars |
| Financements | Data table, pipeline, priority badges |
| Produits / flux | Logistics table, quality badges, route cards |
| Coordination | Task board, action queue, owners table |
| Rapports | Reports grid, document cards, preview modal |
| Preuves | Audit trail, evidence badges, proof levels |
| Paramètres d'accès | Settings, roles, permissions, organization profile |

## 4. Mapping Des Données Mockées

| Donnée mockée | Affichage template |
| --- | --- |
| Territories | Map, territory cards, tension matrix |
| Actors | CRM list, contact cards, role chips |
| Signals | Activity feed, timeline, alert cards |
| Funding requests | Table, pipeline, status badges |
| Programs | Project cards, progress bars, milestone timeline |
| Products | Table, quality score, logistics card |
| Reports | Document grid, report cards, proof chips |
| Actions | Task board, action queue, owner/status table |
| Proof levels | Badge system, audit panel |
| KPIs | Metric cards, mini charts, trend indicators |

## 5. Mapping Des Espaces Par Rôle

### État / Ministère

Template idéal :

- command center ;
- executive dashboard ;
- map panel ;
- decision queue ;
- report preview.

Composants à utiliser :

- KPI grid ;
- territory map ;
- tension cards ;
- funding table ;
- program list ;
- note preview ;
- action queue.

### ONG / Programme

Template idéal :

- project dashboard ;
- monitoring and evaluation page ;
- reporting interface.

Composants à utiliser :

- program pipeline ;
- beneficiaries table ;
- evidence cards ;
- impact chart ;
- report card ;
- alerts.

### Collectivité

Template idéal :

- local operations dashboard ;
- civic action tracker.

Composants à utiliser :

- local map ;
- issue cards ;
- partner list ;
- action pipeline ;
- municipal note preview.

### Pêcheur

Template idéal :

- assisted workflow ;
- mobile-first task view ;
- status tracker.

Composants à utiliser :

- simple timeline ;
- status pill ;
- relay contact card ;
- signal form ;
- feedback card.

### Mareyeur

Template idéal :

- logistics dashboard ;
- operations board.

Composants à utiliser :

- products table ;
- quality badges ;
- logistics pipeline ;
- price chart ;
- finance request card.

### Entreprise / Exportateur

Template idéal :

- supply qualification dashboard ;
- risk management page.

Composants à utiliser :

- opportunity pipeline ;
- risk matrix ;
- traceability score ;
- proof request card ;
- conditions table.

### Organisation Professionnelle

Template idéal :

- CRM / member management ;
- association dashboard.

Composants à utiliser :

- members register ;
- collective needs table ;
- partner pipeline ;
- advocacy note ;
- evidence status.

### Investisseur

Template idéal :

- executive analytics dashboard ;
- startup data room preview.

Composants à utiliser :

- payer matrix ;
- value flow diagram ;
- risk matrix ;
- roadmap ;
- traction cards ;
- data room links.

## 6. Design System Mapping

| Design need | Template component |
| --- | --- |
| KPI | MetricCard |
| Statut | StatusBadge |
| Preuve | EvidenceBadge / custom badge |
| Priorité | PriorityBadge |
| Tension | RiskBadge / alert badge |
| Action | TaskCard / ActionRow |
| Rapport | DocumentCard |
| Territoire | MapPanel |
| Signal | ActivityItem |
| Rôle | Segment / Tabs |
| CTA | PrimaryButton / SecondaryButton |

## 7. Reconstruction Frontend Recommandée

Créer une branche propre :

`rebuild-premium-template`

Ordre de reconstruction :

1. Installer le template et nettoyer les exemples inutiles.
2. Créer le shell global : public shell et private app shell.
3. Reconstruire `/` avec la landing premium.
4. Reconstruire `/demo` avec sélection de rôle.
5. Reconstruire les espaces `/demo/<role>`.
6. Reconstruire `/demande-demo` et `/devis`.
7. Reconstruire `/espace-prive`.
8. Ajouter les mocks structurés.
9. Neutraliser les routes publiques qui brouillent le parcours.
10. Vérifier mobile, typecheck et build.

## 8. Règles De Mapping

- Une page = une mission.
- Un rôle = une expérience distincte.
- Un module public isolé doit devenir privé ou démo.
- Un CTA doit correspondre à l'étape du parcours.
- Un KPI doit aider à décider.
- Une preuve doit afficher son niveau et ses limites.
- Une donnée mockée doit avoir une source, un statut et une action suivante.
- Le formulaire ne doit jamais être la fin de l'expérience.

## 9. Livrables Du Rebuild

Le rebuild doit livrer :

- landing premium ;
- demo role selector ;
- espaces de démo par rôle ;
- espace premium simulé ;
- demande démo ;
- devis ;
- module gates ;
- mocks structurés ;
- design system adapté ;
- documentation courte d'utilisation ;
- validation `typecheck` et `build`.

## 10. Critères De Validation

Le mapping est réussi si :

- le template porte naturellement `/espace-prive` ;
- les rôles ne se ressemblent pas tous ;
- la navigation public / démo / commercial / privé est claire ;
- les modules publics isolés ne dominent plus ;
- les données mockées alimentent cards, tables, charts et maps ;
- le résultat ressemble à une infrastructure métier premium, pas à une landing ou une marketplace.
