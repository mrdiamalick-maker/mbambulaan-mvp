# Mbàmbulaan

Mbàmbulaan est l’écosystème numérique de connaissance, de coordination, de pilotage, de valorisation et de durabilité de la filière halieutique, en commençant par la pêche artisanale sénégalaise.

Le parcours de référence est :

`pirogue → retour → besoin opérationnel → arrivée → débarquement → pesée → lot → tension ou opportunité → engagement → action coordonnée → trace → résultat → rapport`

Les données incluses sont déterministes, simulées et non officielles.

## Stack

- Next.js 15, React 19, TypeScript strict et Tailwind CSS ;
- App Router et routes API internes ;
- domaine partagé dans `src/domain` ;
- persistance PostgreSQL activable, avec repli mémoire réservé à la démonstration ;
- session signée, permissions serveur et comptes de recette ;
- PWA minimale et brouillon terrain local ;
- tests unitaires, métier, permissions, intégrité et smoke E2E.

## Lancer localement

```bash
npm install
npm run dev
```

Entrées principales :

- `/` : site public ;
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
- `/app/organisation` : membres, plan et entitlements ;
- `/app/administration` : audit et santé du tenant.

Le code OTP local est `246810`. Aucun SMS, paiement ou message WhatsApp réel n’est simulé.

## Comptes de démonstration

La page `/connexion` permet d’ouvrir directement les vues suivantes :

- administrateur Mbàmbulaan ;
- opérateur de quai ;
- capitaine ;
- mareyeur ;
- transformateur ;
- prestataire d’infrastructure ;
- gestionnaire d’organisation ;
- coordinateur territorial ;
- institution ;
- partenaire.

Tous utilisent les mêmes objets métier. Seuls le mandat, la navigation et les actions autorisées changent.

## Persistance et réinitialisation

Variables :

```bash
DATABASE_URL=postgres://...
SESSION_SECRET=...
```

Sans `DATABASE_URL`, le produit conserve un snapshot en mémoire pour permettre une démonstration immédiate. Avec PostgreSQL, la couche repository utilise :

- `mbambulaan_tenant_state` ;
- `mbambulaan_command_log` pour l’idempotence ;
- `mbambulaan_outbox` pour préparer les intégrations futures.

La migration reproductible est `db/migrations/001_initial.sql`. Le bouton **Réinitialiser** et `POST /api/demo/reset` restaurent le seed.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
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
