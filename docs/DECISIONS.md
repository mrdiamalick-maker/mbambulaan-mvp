# Journal de decisions Mbambulaan

## Decision 1 - Mbambulaan n est pas une simple marketplace

Mbambulaan est positionne comme un ecosysteme de coordination pour la peche artisanale.

Raison: une marketplace ne suffit pas a expliquer la valeur territoriale, l impact, la priorisation, la tracabilite et l aide a la decision.

## Decision 2 - Developpement par packs

Le projet avance par packs de developpement.

Raison: chaque intervention Codex doit livrer une capacite metier complete et eviter les micro taches.

## Decision 3 - Donnees mockees pendant le MVP

Le MVP reste local, sans API et sans base de donnees.

Raison: priorite a la demonstration metier avant l architecture de production.

## Decision 4 - Phase 2 avant MVP Premium

L intelligence metier est prioritaire avant le polish UX.

Raison: le produit doit d abord prouver sa valeur avant d etre embelli.

## Decision 5 - Centralisation de la logique dans src/lib

Les moteurs metier doivent etre dans src/lib.

Raison: les composants React doivent afficher les donnees, pas porter les calculs metier.

## Decision 6 - Reprise obligatoire de la tracabilite

Le pack Tracabilite doit etre finalise avant tout nouveau pack.

Raison: le travail a ete interrompu avant validation complete et ne doit pas rester incomplet.
