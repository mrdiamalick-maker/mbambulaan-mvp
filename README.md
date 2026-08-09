# Mbàmbulaan

Mbàmbulaan est une infrastructure numérique de coordination, de confiance, de pilotage, de valorisation et de durabilité de la filière halieutique, en commençant par la pêche artisanale sénégalaise. Ce n’est ni une marketplace, ni un ERP, ni une collection de tableaux de bord par métier.

Le parcours de référence est :

`pirogue → retour → besoin opérationnel → arrivée → débarquement → pesée → lot → tension ou opportunité → engagement → action coordonnée → trace → résultat → rapport`

Les données incluses sont déterministes, simulées et non officielles.

## Démonstration premium

- URL canonique Vercel : [https://mbambulaan-product.vercel.app](https://mbambulaan-product.vercel.app) ;
- miroir de recette Sites : [https://mbambulaan-ecosysteme-v1.malick-dia-1822.chatgpt.site](https://mbambulaan-ecosysteme-v1.malick-dia-1822.chatgpt.site) ;
- accès privé par défaut ;
- données déterministes, simulées et réinitialisables depuis l’application ;
- 18 territoires côtiers, 54 sites, 64 pirogues et sorties, 64 débarquements, 80 lots, 28 situations, 24 coordinations, 8 programmes et 8 rapports ;
- tous les contenus, montants, immatriculations, annonces et scénarios sont illustratifs et non officiels.

## Stack

- Next.js 15, React 19, TypeScript strict et Tailwind CSS ;
- App Router et routes API internes ;
- domaine partagé dans `src/domain` ;
- persistance PostgreSQL activable, avec état navigateur réservé à la démonstration ;
- session signée, permissions serveur et comptes de recette ;
- PWA minimale et brouillon terrain local ;
- tests unitaires, métier, permissions, intégrité et smoke E2E.

## Lancer localement

```bash
npm ci
npm run dev
```

Entrées principales :

- `/` : site public ;
- `/filiere` : compréhension de la chaîne de valeur et des ruptures de coordination ;
- `/actualites` : actualités, annonces et opportunités de démonstration ;
- `/a-propos` : mission, méthode, modèle et charte de confiance ;
- `/atlas` : Atlas public limité ;
- `/offres` : plans et valeur par segment ;
- `/demo` : six scénarios guidés ;
- `/connexion` : OTP local ou comptes de recette ;
- `/app/travail` : briefing adapté au rôle ;
- `/app/atlas` : Atlas professionnel ;
- `/app/operations` : pirogues, sorties, débarquements, pesées et lots ;
- `/app/coordination` : besoins, capacités, opportunités et engagements ;
- `/app/marches` : prix, marchés et rareté ;
- `/app/community` : échanges professionnels transformables en action ;
- `/app/durabilite` : provenance et continuité de traçabilité ;
- `/app/pilotage` : situation, résultats et rapport ;
- `/app/initiatives` : programmes, besoins de financement, conditions et indicateurs ;
- `/app/organisation` : membres, plan et entitlements ;
- `/app/administration` : audit et santé du tenant.

Le code OTP local est `246810`. Aucun SMS, paiement ou message WhatsApp réel n’est déclenché. Les exports Excel utilisent un fichier CSV compatible et le bouton PDF ouvre la mise en page d’impression du navigateur.

## Missions de démonstration

La page `/connexion` donne cinq portes d’entrée qui utilisent la même plateforme :

- opérations terrain ;
- organisation professionnelle ;
- coordination territoriale ;
- institution nationale ;
- partenaire & programme.

L’administration technique reste accessible séparément. Les métiers spécialisés — capitaine, opérateur, mareyeur, transformation et prestataire — apparaissent dans les opérations et responsabilités auxquelles ils contribuent, sans créer dix mini-produits.

Tous utilisent les mêmes objets métier. Seuls le mandat, la navigation et les actions autorisées changent.

## Persistance et réinitialisation

Variables :

```bash
DATABASE_URL=postgres://...
SESSION_SECRET=...
DEMO_MODE=true
```

`SESSION_SECRET` est obligatoire sur un environnement public. `DEMO_MODE=true` autorise uniquement les comptes de recette et l’OTP local `246810` ; aucune transmission SMS n’est effectuée.

Sans `DATABASE_URL`, le produit fonctionne en démonstration déterministe : les commandes restent validées par l’API et l’état de la session est conservé dans le stockage local du navigateur. Ce mode résiste aux fonctions serverless sans supposer une mémoire serveur partagée. Avec PostgreSQL, la couche repository utilise :

- `mbambulaan_tenant_state` ;
- `mbambulaan_command_log` pour l’idempotence ;
- `mbambulaan_outbox` pour préparer les intégrations futures.

La migration reproductible est `db/migrations/001_initial.sql`. Le bouton **Réinitialiser** et `POST /api/demo/reset` restaurent le seed. La réinitialisation du navigateur peut aussi être forcée en supprimant la clé `mbambulaan-demo-state-v1` du stockage local.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
SMOKE_BASE_URL=https://mbambulaan-product.vercel.app npm run test:e2e
git diff --check
```

Le guide complet de recette est [docs/PRODUCT_ACCEPTANCE_TEST.md](docs/PRODUCT_ACCEPTANCE_TEST.md).

## Limites explicites

- aucune donnée n’est officielle ;
- aucune transaction financière réelle ;
- aucun fournisseur OTP/SMS branché ;
- aucune certification réglementaire ;
- aucune API publique ouverte ;
- aucune IA générative ou décision automatique ;
- la carte est une exploration territoriale structurée, pas un SIG réglementaire ;
- PostgreSQL doit être configuré et recetté avant une exploitation réelle.
