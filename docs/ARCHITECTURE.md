# Architecture de l’écosystème Mbàmbulaan

## Principe

Mbàmbulaan est un produit unique configurable. Les espaces par rôle sont des projections du même domaine et non des applications distinctes.

```text
Site public / Démo / Application
               |
         ProductProvider
               |
 État navigateur démo / PostgreSQL
               |
   Routes API + session signée
               |
      Permissions serveur
               |
     Commandes du domaine
               |
 Repository + audit + outbox
               |
 PostgreSQL ou état démo navigateur
```

## Frontières

- `src/domain/types.ts` : objets partagés et commandes ;
- `src/domain/rules.ts` : transitions, validations, matching simple et traces ;
- `src/data/demo-state.ts` : seed déterministe interconnecté ;
- `src/server/permissions.ts` : mandat par rôle ;
- `src/server/session.ts` : session signée ;
- `src/server/repository.ts` : persistance, idempotence et outbox ;
- `src/components/providers/ProductProvider.tsx` : état de session, stockage local de démonstration et appels de commandes ;
- `src/components` : affichage et orchestration d’interactions ;
- `src/app` : routes publiques, professionnelles et API.

La logique métier essentielle ne réside pas dans les composants.

## Domaine partagé

Le modèle relie :

- identité : acteurs, organisations, rôles, plans et entitlements ;
- géographie : territoires, sites, quais, marchés et zones ;
- actifs : pirogues, immatriculations et infrastructures ;
- opérations : sorties, retours, débarquements, pesées, captures et lots ;
- coordination : signaux, situations, besoins, capacités, opportunités, engagements et résultats ;
- connaissance : espèces, prix, rareté, sources et confiance ;
- durabilité : provenance, pratique, complétude et recommandation ;
- Community : publications, catégories et transformation en situation ;
- pilotage : rapports, métriques, limites et audit.

## Parcours profond

Le scénario Joal commence par une pirogue en mer et une machine à glace indisponible. Les commandes font évoluer les mêmes objets :

1. annonce de retour ;
2. arrivée au quai ;
3. enregistrement du débarquement ;
4. confirmation de la pesée ;
5. création des lots ;
6. détection explicable d’une opportunité ;
7. engagement humain ;
8. résultat logistique ;
9. rapport et apprentissage.

Le scénario infrastructure conserve en parallèle la machine d’état :

`reçue → qualification → priorisée → coordination → intervention → attente éventuelle → résultat → réglée`.

## Persistance progressive et Vercel

La cible de recette officielle est Vercel avec le runtime Next.js natif. OpenNext, Wrangler et Cloudflare ne participent pas au runtime Vercel.

Deux modes sont disponibles :

1. sans `DATABASE_URL`, `/api/state` fournit le seed et le navigateur conserve son snapshot dans `localStorage` ; chaque commande transmet ce snapshot à l’API, qui contrôle le rôle puis applique les règles du domaine avant de retourner l’état suivant ;
2. avec `DATABASE_URL`, le repository stocke un snapshot JSONB par tenant, un journal idempotent des commandes et une outbox.

Ce compromis garantit :

- une démonstration sans service externe ;
- un état cohérent pendant la session malgré l’isolation des fonctions serverless ;
- une réinitialisation déterministe ;
- des migrations reproductibles ;
- une transition future vers des tables relationnelles par sous-domaine ;
- des contrats de commandes stables.

Les données de démonstration restent séparées par `tenant-demo`.

## Sécurité

- le navigateur ne choisit jamais l’identité portée par l’audit ;
- l’API remplace l’`actorId` reçu par celui de la session ;
- chaque commande est contrôlée selon le rôle ;
- la session est signée HMAC ;
- `SESSION_SECRET` est configuré hors dépôt sur Vercel ;
- l’OTP local est disponible en production uniquement avec `DEMO_MODE=true` ;
- l’état navigateur est falsifiable par l’utilisateur et n’est donc jamais assimilé à une donnée officielle ;
- aucune donnée sensible réelle n’est incluse.

## Extension préparée

Sans les simuler comme terminées, l’outbox, les partenaires et les entitlements préparent :

- paiement, assurance et financement via partenaires habilités ;
- stockage objet terrain ;
- interopérabilité ;
- API publique gouvernée ;
- moteur prédictif explicable ;
- application mobile native.

Ces extensions ne doivent pas modifier le domaine partagé ni fragmenter le produit.
