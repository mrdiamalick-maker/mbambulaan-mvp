# Architecture — Mbàmbulaan MVP

## Vue d’ensemble

Le MVP est une application Next.js avec données locales mockées.

L’objectif actuel n’est pas de créer une architecture finale de production, mais de séparer correctement :

- l’interface ;
- les données ;
- les règles métier ;
- les moteurs d’intelligence métier.

## Structure cible actuelle

```text
src/
  app/
    arrivages/
    besoins/
    opportunites/
    transactions/
    notifications/
    dashboard/
    quais/
    coordination/
    demo/
    espaces/
  components/
    arrivages/
    besoins/
    opportunites/
    transactions/
    notifications/
    dashboard/
    quais/
    coordination/
    demo/
    espaces/
  data/
    arrivages.json
    besoins.json
    demo.json
  lib/
    coordination.ts
    matching.ts
    recommendation.ts
    trust.ts
    impact.ts
    tension.ts
    prioritization.ts
    alerts.ts
    traceability.ts
    reference.ts
```

## Principes d’architecture

### 1. Les pages orchestrent

Les fichiers `src/app/**/page.tsx` doivent rester simples.

Ils chargent les données et passent les résultats aux composants.

### 2. Les composants affichent

Les composants React doivent gérer l’UX et l’affichage.

Ils ne doivent pas contenir la logique métier principale.

### 3. Les moteurs métier calculent

Les modules dans `src/lib` portent la logique métier.

Exemples :

- `coordination.ts` : coordination générale ;
- `recommendation.ts` : recommandation ;
- `trust.ts` : score de confiance ;
- `impact.ts` : indicateurs d’impact ;
- `tension.ts` : tension territoriale ;
- `prioritization.ts` : priorités métier ;
- `alerts.ts` : alertes ;
- `traceability.ts` : traçabilité.

## Évolution vers une V1

À terme, les fichiers JSON pourront être remplacés par :

- une API ;
- une base de données ;
- un système d’authentification ;
- un back-office ;
- des intégrations partenaires.

La séparation actuelle doit permettre cette évolution sans réécrire toute l’interface.
