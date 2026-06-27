# Backlog des packs Codex — Mbàmbulaan

## Règle de pilotage

Le projet avance par packs de développement.

Un pack doit livrer une capacité métier complète, testable et utile pour la démonstration.

Chaque pack doit produire :

- un seul commit ;
- `tsc --noEmit` OK ;
- `next build` OK ;
- Pull Request mise à jour ;
- valeur métier claire.

## Pack en cours

### PACK IM 008 — Traçabilité des lots

Statut : interrompu par la limite Codex.

Objectif : suivre l’historique complet d’un lot, depuis l’arrivage jusqu’à la réservation, la transaction et la livraison.

À reprendre dès disponibilité Codex.

Livrables attendus :

- `src/lib/traceability.ts` finalisé ;
- bloc `Historique du lot` dans la fiche opportunité ;
- accès traçabilité depuis Transactions ;
- KPI `Lots suivis` dans Dashboard ;
- panneau `Lots à suivre` dans Coordination ;
- carte de démonstration `Traçabilité de bout en bout` ;
- validation TypeScript et build.

## Packs suivants — Phase 2 Intelligence métier

### PACK IM 009 — Moteur de qualité des lots

Objectif : qualifier les lots selon fraîcheur, conservation, contrôle qualité, urgence de vente et risque de perte.

Valeur : renforcer la confiance et prioriser les lots sensibles.

### PACK IM 010 — Simulation d’une journée de pêche

Objectif : créer une journée type avec événements successifs : arrivages, besoins, opportunités, réservations, transactions, alertes, dashboard.

Valeur : rendre la démonstration plus vivante.

### PACK IM 011 — Recommandations par rôle

Objectif : afficher des recommandations différentes pour pêcheur, mareyeur, transformateur et collectivité.

Valeur : faire comprendre que Mbàmbulaan parle à chaque acteur.

### PACK IM 012 — Vue exécutive institutionnelle

Objectif : créer une lecture synthétique pour ministère, collectivité ou bailleur : impact, tensions, priorités, valeur économique.

Valeur : préparer les présentations partenaires.

## Phase 3 — MVP Premium

### PACK PREMIUM 001 — Harmonisation UX/UI

Objectif : harmoniser les cartes, badges, boutons, titres, espacements, navigation et messages.

### PACK PREMIUM 002 — Données réalistes Sénégal

Objectif : enrichir les données mock avec volumes, saisons, zones, espèces et scénarios plus crédibles.

### PACK PREMIUM 003 — Storytelling de démonstration

Objectif : transformer `/demo` en parcours narratif fluide et convaincant.

## Packs à éviter pour l’instant

- Authentification
- Base de données
- API
- Paiement
- Messagerie temps réel
- Back-office complet

Ces sujets relèvent de la V1, pas du MVP de démonstration.
