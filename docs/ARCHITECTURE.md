# Architecture d'exécution — Mbàmbulaan

## Vue d’ensemble

Mbàmbulaan est un monolithe modulaire Next.js. Tous les rôles utilisent les mêmes objets métier et la même source de vérité. Les vues et les commandes autorisées changent selon le mandat, jamais le produit.

## Structure cible actuelle

```text
src/
  app/               routes publiques, produit et contrats HTTP
  components/        shell, vues métier et composants d'affichage
  data/              tenant de démonstration déterministe
  domain/            objets, commandes, transitions et invariants
  server/            sessions, permissions et persistance
db/migrations/       schéma PostgreSQL versionné
tests/               règles métier et permissions
```

## Principes d’architecture

### Source de vérité

`src/server/repository.ts` persiste un état de tenant dans PostgreSQL lorsque `DATABASE_URL` est configuré. Le mode mémoire est un repli explicite de démonstration. Les commandes sont idempotentes.

### Règles métier

`src/domain/rules.ts` protège les transitions : prochaine étape, responsable et échéance après prise en charge, motif de blocage, résultat et élément de confirmation avant clôture.

### Accès et sécurité

Les sessions sont signées côté serveur. `src/server/permissions.ts` contrôle chaque commande par mandat. Les changements sensibles alimentent le journal d'audit.

### Déconnexion et reprise

Le formulaire terrain conserve uniquement les brouillons non synchronisés sur l'appareil. La donnée métier validée reste côté serveur. Les identifiants et clés d'idempotence empêchent les doublons lors d'une reprise réseau.

### Limites connues

- le fournisseur OTP/SMS doit être branché pour la production ;
- le stockage objet S3 des médias est préparé au niveau produit mais pas connecté ;
- la migration JSONB initiale devra être normalisée progressivement lorsque les volumes réels seront connus ;
- le tenant de démonstration ne contient aucune statistique officielle.
