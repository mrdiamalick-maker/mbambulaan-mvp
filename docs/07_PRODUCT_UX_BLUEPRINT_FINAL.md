# Mbàmbulaan Product UX Blueprint Final

## Statut du document

Ce document fige l'architecture produit et UX cible de Mbàmbulaan avant choix de template et reconstruction frontend propre.

Il sert de référence pour le CEO, le CPO, le CTO, le Product Designer, les développeurs frontend, Codex et tout prestataire externe. Il ne décrit pas une implémentation technique immédiate. Il définit ce qui doit être construit, pourquoi, pour qui, avec quels parcours et quelles preuves de valeur.

La PR `#13` reste un laboratoire. Elle ne doit pas être considérée comme la base finale à merger.

## 1. Product Positioning

Mbàmbulaan est une infrastructure numérique de coordination pour la pêche artisanale sénégalaise. Elle permet aux institutions, programmes, collectivités, entreprises et acteurs terrain de voir les signaux utiles, coordonner les actions, fiabiliser l'information, suivre les besoins, faciliter les décisions et prouver la valeur des interventions.

Mbàmbulaan n'est pas :

- une marketplace de poissons ;
- un simple dashboard ;
- une app pêcheur-first ;
- un outil de reporting isolé ;
- un annuaire ;
- une plateforme de formulaires ;
- une landing page marketing ;
- un ERP générique.

Mbàmbulaan devient :

- une couche de coordination ;
- un cockpit métier ;
- un espace de travail par rôle ;
- une infrastructure de données et de preuve ;
- un moteur de services ;
- un système d'aide à la décision ;
- une mémoire opérationnelle de la filière.

La promesse centrale : transformer l'information dispersée de la filière en décisions utiles, coordonnées et prouvables.

## 2. Architecture Produit Cible

L'architecture cible est organisée en six niveaux.

| Niveau | Nom | Objectif | Routes |
| --- | --- | --- | --- |
| 1 | Public / Acquisition | Faire comprendre la promesse sans exposer les modules métier | `/` |
| 2 | Démo personnalisée | Choisir un rôle et entrer dans un parcours adapté | `/demo` |
| 3 | Espaces de démo par rôle | Montrer la valeur métier avant achat | `/demo/etat`, `/demo/ong`, `/demo/collectivite`, `/demo/pecheur`, `/demo/mareyeur`, `/demo/exportateur`, `/demo/organisation`, `/demo/investisseur` |
| 4 | Cadrage commercial | Qualifier l'intérêt et préparer pilote, convention ou offre | `/demande-demo`, `/devis` |
| 5 | Espace premium simulé | Montrer le produit final comme si le partenaire avait déjà souscrit | `/espace-prive` |
| 6 | Futur espace réel | Préparer authentification, permissions, données réelles et intégrations | Futur workspace privé |

### Niveau 1 — Public / Acquisition

La route `/` doit être une landing premium courte, claire et sobre.

Contenu attendu :

- promesse forte ;
- problème de coordination ;
- aperçu visuel de coordination ;
- CTA principal `Explorer la démo` ;
- CTA secondaire `Cadrer un pilote`.

La landing ne doit pas exposer les modules privés. Elle doit créer le désir d'entrer dans l'expérience.

### Niveau 2 — Démo Personnalisée

La route `/demo` doit être une sélection de rôle premium.

Rôles :

- État / Ministère ;
- ONG / Programme ;
- Collectivité ;
- Pêcheur ;
- Mareyeur ;
- Entreprise / Exportateur ;
- Organisation professionnelle ;
- Investisseur.

La page ne doit pas être une grille de cartes répétitives. Elle doit permettre de comprendre que chaque rôle dispose d'un espace, d'une logique, de KPIs et de décisions propres.

### Niveau 3 — Espaces De Démo Par Rôle

Chaque route `/demo/<role>` doit montrer la valeur métier avant achat. Ces pages ne doivent pas partager le même écran avec seulement les textes changés.

Chaque espace doit avoir :

- son modèle mental ;
- ses KPIs ;
- ses visualisations ;
- ses données mockées ;
- ses actions ;
- ses CTA ;
- ses preuves et limites.

### Niveau 4 — Cadrage Commercial

Les routes `/demande-demo` et `/devis` servent à qualifier l'intérêt, préparer un pilote, une convention ou une offre.

Important : le formulaire n'est pas une fin. Après soumission locale, l'utilisateur doit pouvoir accéder à `/espace-prive` pour voir ce qu'il obtiendrait après souscription.

### Niveau 5 — Espace Premium Simulé

La route `/espace-prive` montre le produit final simulé.

Elle doit contenir :

- modules activés ;
- données mockées ;
- carte opérationnelle ;
- KPIs ;
- actions quotidiennes ;
- rapports ;
- financements ;
- programmes ;
- coordination ;
- usage après souscription.

### Niveau 6 — Futur Espace Réel

Le futur espace réel ajoutera :

- authentification ;
- invitations ;
- organisations ;
- rôles et permissions ;
- données réelles ;
- intégrations API ;
- journal d'audit ;
- historique des décisions ;
- exports et reporting.

Ce niveau n'est pas à coder maintenant, mais il doit guider le choix du template et la reconstruction.

## 3. Parcours Cible Complet

Parcours final :

`Landing -> Explorer la démo -> Choisir rôle -> Entrer dans espace de démo -> Voir valeur métier -> Cadrer pilote / devis -> Accéder à espace premium simulé -> Voir usage quotidien après souscription`

### Avant Achat

Objectif : convaincre.

Contenu :

- démo guidée ;
- valeur par rôle ;
- données simulées ;
- preuve de potentiel ;
- CTA commercial ;
- limites explicites.

### Après Souscription

Objectif : montrer l'usage quotidien.

Contenu :

- espace privé ;
- modules activés ;
- rôles ;
- permissions ;
- actions ;
- rapports ;
- données continues ;
- tableaux de bord ;
- coordination.

La démonstration doit permettre de dire : voici Mbàmbulaan avant achat, puis voici Mbàmbulaan après souscription.

## 4. Espaces Par Rôle

### 4.1 État / Ministère

| Dimension | Référence |
| --- | --- |
| Positionnement | Espace d'aide à la décision institutionnelle |
| Problème | Vue dispersée des territoires, tensions, besoins, programmes, financements et acteurs |
| Utilisateurs | Cabinet, direction technique, service pêche, cellule programme |
| Payeurs | État, ministère, projet public, partenaire institutionnel |
| Raison de payer | Piloter, arbitrer, prioriser, coordonner, éviter les doublons, produire des notes de décision |

Modules :

- Vue territoire ;
- carte des tensions ;
- signaux qualifiés ;
- demandes de financement ;
- programmes actifs ;
- innovations ;
- acteurs à coordonner ;
- notes ministère ;
- preuves et limites.

KPIs :

- territoires suivis ;
- signaux qualifiés ;
- tensions critiques ;
- demandes de financement ;
- programmes actifs ;
- décisions en attente ;
- acteurs coordonnés ;
- notes générées.

Visualisations :

- carte du littoral ;
- matrice tensions / territoires ;
- tableau financements ;
- pipeline décisions ;
- note de synthèse ;
- score de preuve.

CTA :

- `Cadrer un pilote institutionnel` ;
- `Générer une note ministère` ;
- `Ouvrir une coordination territoriale`.

Valeur : le ministère ne paie pas pour voir un dashboard, mais pour financer une couche de coordination et d'arbitrage.

### 4.2 ONG / Programme

| Dimension | Référence |
| --- | --- |
| Positionnement | Espace de pilotage programme et reporting bailleur |
| Problème | Suivre les actions, prouver l'impact, éviter les doublons, rendre compte |
| Utilisateurs | Chef de programme, M&E officer, coordinateur terrain, bailleur |
| Payeurs | ONG, bailleur, programme de développement |
| Raison de payer | Mieux cibler, suivre bénéficiaires, documenter preuves, réduire risque programme |

Modules :

- Portefeuille programme ;
- bénéficiaires ;
- actions terrain ;
- preuves collectées ;
- reporting bailleur ;
- alertes ;
- couverture territoriale ;
- doublons.

KPIs :

- bénéficiaires suivis ;
- actions actives ;
- preuves collectées ;
- territoires couverts ;
- alertes terrain ;
- rapport prêt ;
- budget suivi.

Visualisations :

- pipeline programme ;
- tableau bénéficiaires ;
- carte d'intervention ;
- graphe impact estimé ;
- rapport bailleur mocké.

CTA :

- `Préparer rapport bailleur` ;
- `Réorienter action` ;
- `Demander preuve terrain`.

### 4.3 Collectivité

| Dimension | Référence |
| --- | --- |
| Positionnement | Espace territorial simple et actionnable |
| Problème | Transformer les problèmes du quai en actions locales visibles |
| Utilisateurs | Maire, adjoint économie, service local, agent communal |
| Payeurs | Collectivité, programme partenaire, État, projet territorial |
| Raison de payer | Services locaux, visibilité publique, partenaires, revenus potentiels |

Modules :

- Carte communale ;
- problèmes prioritaires ;
- actions locales ;
- partenaires ;
- revenus potentiels ;
- notes mairie ;
- demandes citoyennes ;
- suivi quai.

KPIs :

- quais suivis ;
- acteurs locaux ;
- problèmes prioritaires ;
- actions communales ;
- partenaires mobilisables ;
- revenus potentiels.

Visualisations :

- carte commune / quai ;
- pipeline action ;
- tableau problèmes ;
- partenaires mobilisables ;
- note conseil municipal.

CTA :

- `Lancer territoire pilote` ;
- `Préparer note maire` ;
- `Mobiliser partenaire`.

### 4.4 Pêcheur

| Dimension | Référence |
| --- | --- |
| Positionnement | Parcours assisté, pas dashboard complet |
| Problème | Signaler un besoin et recevoir un retour clair sans interface complexe |
| Utilisateurs | Pêcheur, relais quai, agent terrain, pêcheur référent |
| Payeurs | Programme, collectivité, organisation, État, partenaire |
| Raison de financer | Inclusion, remontée terrain, confiance, accès services, données utiles |

Modules :

- Signalement assisté ;
- suivi demande ;
- relais quai ;
- opportunités encadrées ;
- financement orienté ;
- historique confiance.

KPIs :

- signaux envoyés ;
- demandes suivies ;
- relais actifs ;
- opportunités reçues ;
- statuts ;
- score confiance.

Visualisations :

- timeline simple ;
- statut demande ;
- carte relais ;
- pictos ;
- mobile-first.

CTA :

- `Activer relais quai` ;
- `Signaler disponibilité` ;
- `Demander accompagnement`.

### 4.5 Mareyeur

| Dimension | Référence |
| --- | --- |
| Positionnement | Espace opérationnel flux, qualité, logistique |
| Problème | Incertitude sur volumes, qualité, prix, acheteurs et logistique |
| Utilisateurs | Mareyeur, responsable flux, relais quai |
| Payeurs | Mareyeur avancé, entreprise, programme, coopérative, service premium |
| Raison de payer | Anticiper, sécuriser qualité, réduire pertes, organiser transport, gagner crédibilité |

Modules :

- Produits disponibles ;
- besoins marché ;
- qualité ;
- prix indicatif ;
- logistique ;
- historique confiance ;
- financement court terme.

KPIs :

- lots disponibles ;
- besoins marché ;
- qualité ;
- délai ;
- prix indicatif ;
- flux à organiser ;
- financement disponible.

Visualisations :

- tableau lots ;
- graphe prix indicatif ;
- pipeline logistique ;
- alertes qualité ;
- matching encadré.

CTA :

- `Organiser un flux` ;
- `Demander transport` ;
- `Suivre qualité` ;
- `Demander fonds de roulement`.

### 4.6 Entreprise / Exportateur

| Dimension | Référence |
| --- | --- |
| Positionnement | Qualification d'opportunité, pas marketplace |
| Problème | Réduire l'incertitude commerciale avant engagement |
| Utilisateurs | Acheteur, exportateur, responsable supply, qualité |
| Payeurs | Entreprise, exportateur, acheteur institutionnel |
| Raison de payer | Réduire risque, qualifier qualité, obtenir trace, coordonner acteurs |

Modules :

- Opportunités qualifiées ;
- lots suivis ;
- score qualité ;
- niveau de trace ;
- risques ;
- conditions ;
- demandes de preuve ;
- coordination achat.

KPIs :

- opportunités qualifiées ;
- lots suivis ;
- score qualité ;
- trace ;
- risques ouverts ;
- preuves demandées.

Visualisations :

- pipeline opportunités ;
- matrice risques ;
- score qualité ;
- tableau lots ;
- carte approvisionnement.

CTA :

- `Qualifier une opportunité` ;
- `Demander preuve` ;
- `Lancer coordination`.

### 4.7 Organisation Professionnelle

| Dimension | Référence |
| --- | --- |
| Positionnement | Structuration, représentation, dossiers collectifs |
| Problème | Membres et demandes existent, mais peu de preuve et peu de dossiers défendables |
| Utilisateurs | Bureau d'organisation, président GIE, secrétaire, relais |
| Payeurs | Organisation avancée, ONG, État, programme, collectivité |
| Raison de payer | Crédibilité, registre membres, demandes collectives, plaidoyer, financement |

Modules :

- Registre membres ;
- demandes collectives ;
- besoins agrégés ;
- preuves ;
- notes plaidoyer ;
- partenaires ;
- suivi action.

KPIs :

- membres recensés ;
- demandes collectives ;
- besoins récurrents ;
- preuves ;
- partenaires ;
- dossiers prêts.

Visualisations :

- registre ;
- carte membres ;
- tableau besoins ;
- pipeline plaidoyer ;
- note partenaire.

CTA :

- `Structurer pilote organisation` ;
- `Générer note partenaire` ;
- `Créer demande collective`.

### 4.8 Investisseur

| Dimension | Référence |
| --- | --- |
| Positionnement | Thèse infrastructure et potentiel économique |
| Problème | Prouver que Mbàmbulaan est une infrastructure verticale avec plusieurs payeurs |
| Utilisateurs | Investisseur, advisor, partenaire stratégique |
| Payeurs | Investisseur potentiel, programme d'accélération, partenaire stratégique |
| Raison de payer / investir | Marché fragmenté, besoin systémique, données propriétaires, réseau terrain, services monétisables |

Modules :

- Segments payeurs ;
- flux de valeur ;
- risques ;
- roadmap ;
- territoires pilotes ;
- services monétisables ;
- traction ;
- data room simulée.

KPIs :

- segments payeurs ;
- services monétisables ;
- territoires pilotes ;
- risques suivis ;
- revenus potentiels ;
- jalons.

Visualisations :

- carte écosystème ;
- matrice payeurs ;
- flux de valeur ;
- roadmap ;
- matrice risques.

CTA :

- `Ouvrir session investisseur` ;
- `Demander data room` ;
- `Voir thèse économique`.

## 5. Espace Premium Souscrit

La route `/espace-prive` est le produit final simulé.

Objectif : montrer ce que voit un partenaire après souscription.

Structure :

- Header : organisation simulée, rôle actif, territoire, statut simulation premium, paramètres, CTA `Cadrer l'offre` ;
- Sidebar : Vue territoire, Registre acteurs, Signaux, Programmes, Financements, Produits / flux, Coordination, Rapports, Preuves, Paramètres ;
- Tableau de bord : KPIs globaux, carte opérationnelle, modules activés, actions quotidiennes, rapports, données mockées, rôle actif.

Fonctionnalité de simulation :

- changer le rôle actif ;
- modifier les KPIs prioritaires selon le rôle ;
- modifier les modules mis en avant ;
- modifier les actions recommandées ;
- modifier les rapports ou priorités affichés.

L'espace n'a pas besoin de backend maintenant. Il doit donner l'impression d'un produit utilisé quotidiennement.

## 6. Données Mockées À Prévoir

| Domaine | Données |
| --- | --- |
| Territories | Joal, Mbour, Kayar, Saint-Louis, Dakar |
| Actors | Ministère, Service pêche, Commune, ONG, Bailleur, GIE, Pêcheurs, Mareyeurs, Exportateurs, Relais quai, Organisation professionnelle |
| Signals | Disponibilité produit, besoin froid, demande financement, alerte qualité, problème logistique, programme en doublon, preuve terrain, opportunité commerciale |
| Funding requests | Unité glace, caisses isothermes, moteur, fonds de roulement, formation qualité, transformation |
| Programs | Appui froid, formation qualité, financement femmes transformatrices, données terrain, résilience revenus |
| Products | Sardinelle, dorade, thiof, crevettes, volume, qualité, délai, localisation, prix indicatif |
| Reports | Note ministère, reporting bailleur, dossier financement, note mairie, synthèse entreprise, note organisation professionnelle, data room investisseur |

Chaque donnée importante doit avoir :

- source ;
- territoire ;
- acteur ;
- statut ;
- niveau de preuve ;
- date ou heure ;
- action suivante.

## 7. Sitemap Final

Routes à garder :

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

Routes à supprimer ou neutraliser dans le futur rebuild public :

- pages de modules publics isolés ;
- arrivages public ;
- besoins public ;
- opportunités public ;
- executive public ;
- coordination public.

Ces modules doivent exister uniquement dans les espaces privés ou les démos.

## 8. Type De Template À Rechercher

Chercher :

- dashboard B2B premium ;
- command center ;
- data intelligence platform ;
- operations dashboard ;
- logistics dashboard ;
- admin dashboard premium ;
- SaaS analytics dashboard ;
- CRM opérationnel ;
- platform dashboard avec sidebar, tables, charts, cards et map.

Ne pas chercher :

- marketplace ;
- landing SaaS simple ;
- template e-commerce ;
- app mobile simple ;
- portfolio ;
- template trop coloré ;
- template trop startup générique.

Le template doit avoir :

- sidebar premium ;
- dashboard dense ;
- charts ;
- tables ;
- cards ;
- badges ;
- timelines ;
- forms ;
- maps ou map-like components ;
- dark panels ;
- role-based pages ;
- responsive solide ;
- design system propre.

## 9. Mapping Template

| Élément template | Usage Mbàmbulaan |
| --- | --- |
| Sidebar | Modules de l'espace premium |
| Dashboard overview | `/espace-prive` |
| Analytics page | KPIs, signaux, tensions |
| CRM page | Registre acteurs |
| Project management page | Actions de coordination |
| Reports page | Notes, reporting et dossiers |
| Map page | Vue territoire |
| Forms page | Devis et cadrage |
| Settings page | Rôles, permissions et accès |

## 10. Plan De Reconstruction

| Phase | Livrable | Décision |
| --- | --- | --- |
| A | `docs/07_PRODUCT_UX_BLUEPRINT_FINAL.md` | Figer l'architecture produit |
| B | `docs/08_TEMPLATE_SELECTION_GUIDE.md` | Choisir le bon type de template |
| C | `docs/09_TEMPLATE_MAPPING_MBAMBULAAN.md` | Mapper le template sur Mbàmbulaan |
| D | Branche `rebuild-premium-template` | Repartir proprement, ne pas utiliser PR #13 comme base finale |
| E | Implémentation | Landing premium, demo role selector, espaces demo par rôle, espace premium simulé, devis, demande demo, module gates, mocks, design system |

## 11. Questions De Décision

- Quel rôle est prioritaire pour la première démo commerciale : État, ONG, Collectivité ou Investisseur ?
- La première offre payante est-elle un pilote institutionnel, un forfait programme ou une convention territoire ?
- Faut-il acheter un template complet ou seulement un kit dashboard ?
- Le futur rebuild doit-il conserver Next.js 15 et Tailwind comme base ?
- Quelles routes publiques doivent être masquées immédiatement lors du rebuild ?

## 12. Critères D'Acceptation Du Futur Rebuild

Le futur rebuild est réussi si :

- le prospect comprend la promesse en moins de 30 secondes ;
- chaque rôle voit un espace distinct ;
- le formulaire n'est jamais la destination finale ;
- `/espace-prive` montre l'usage après souscription ;
- la différence avant achat / après souscription est évidente ;
- les modules publics isolés ne brouillent plus la vision ;
- les données mockées donnent une impression d'usage réel ;
- les CTA sont contextualisés ;
- le produit semble finançable par institutions, ONG, collectivités, entreprises et investisseurs.
