# Prochaines actions — Mbàmbulaan

## Situation actuelle

Codex est temporairement indisponible à cause de la limite de messages.

Le dernier pack lancé, `PACK IM 008 — Traçabilité des lots`, a été interrompu avant validation complète.

## Priorité absolue à la reprise Codex

Ne pas lancer un nouveau pack.

Reprendre uniquement le pack Traçabilité et le finaliser proprement.

## Prompt de reprise à utiliser

```text
REPRISE PACK IM 008 — Traçabilité des lots

Objectif

Reprendre le travail interrompu sur le moteur de traçabilité.

Ne lance aucun nouveau pack.
Ne crée aucune nouvelle fonctionnalité hors périmètre.
Ne modifie pas l’architecture globale.

Travail demandé

1. Inspecter les fichiers déjà modifiés pendant le PACK IM 008.

2. Finaliser proprement :

- src/lib/traceability.ts
- bloc Historique du lot dans la fiche opportunité
- accès ou détail traçabilité depuis Transactions
- KPI Lots suivis dans Dashboard
- panneau Lots à suivre dans Coordination
- carte Traçabilité de bout en bout dans Démo

3. Vérifier que la logique reste centralisée dans src/lib/traceability.ts.

4. Les composants doivent uniquement afficher les données.

5. Lancer :

tsc --noEmit
next build

6. Corriger uniquement les erreurs liées à la traçabilité.

7. Mettre à jour la Pull Request existante.

8. Un seul commit.

Répondre uniquement avec :

- commit
- fichiers créés/modifiés
- validations
- lien PR
```

## Travail non-Codex à faire pendant l’attente

### Produit

- Relire `docs/PRODUCT_VISION.md`
- Valider le positionnement : écosystème numérique de coordination
- Identifier les termes métier à ajuster pour le Sénégal

### Démo

- Relire `docs/DEMO_SCRIPT.md`
- Vérifier si le scénario est convaincant en 3 à 5 minutes
- Préparer un pitch oral court

### Roadmap

- Relire `docs/MVP_ROADMAP.md`
- Vérifier que la Phase 2 reste prioritaire avant le MVP Premium
- Éviter les sujets V1 trop tôt : auth, API, paiement, back-office complet

### Qualité produit

- Vérifier que chaque module apporte une valeur métier claire
- Éviter d’ajouter des pages sans valeur démonstrative
- Garder la logique : un pack = une capacité métier complète

## Décision actuelle

La prochaine action Codex est obligatoirement la reprise de la traçabilité.
