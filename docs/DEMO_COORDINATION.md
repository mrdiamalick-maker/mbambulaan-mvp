# Démonstration du parcours de coordination

## Objectif

Jouer de bout en bout le scénario déterministe « Machine à glace en panne » au quai de débarquement de Mbao.

## Lancement

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000/demo-coordination`.

## Routes

| Rôle | Route | Usage |
|---|---|---|
| Guide | `/demo-coordination` | Voir l’état partagé et choisir un point de vue |
| Acteur terrain | `/terrain` | Remonter et suivre une difficulté |
| Formulaire terrain | `/terrain/remonter` | Créer une situation locale |
| Suivi terrain | `/terrain/situations/MBA-2026-001` | Voir le statut et la prochaine étape |
| Coordinateur | `/coordinateur` | Voir les priorités et organiser la réponse |
| Détail coordinateur | `/coordinateur/situations/MBA-2026-001` | Examiner, affecter, planifier et clôturer |
| Responsable | `/responsable` | Voir les interventions affectées |
| Intervention | `/responsable/interventions/MBA-2026-001` | Démarrer, bloquer, reprendre et terminer |
| Décideur | `/pilotage` | Lire les indicateurs et les résultats |
| Détail décideur | `/pilotage/situations/MBA-2026-001` | Consulter les délais et confirmations |

## Déroulé recommandé

1. Depuis le détail coordinateur, choisir **Comprendre la situation**.
2. Désigner **Mamadou Ndiaye — Maintenance Froid**.
3. Organiser l’intervention à 11:00.
4. Passer dans l’espace responsable et démarrer.
5. Signaler l’attente d’une pièce.
6. Reprendre l’intervention.
7. Déclarer la fin avec le résultat et l’élément de confirmation.
8. Revenir au coordinateur et clôturer.
9. Ouvrir le pilotage pour voir la situation réglée.

Le bouton **Réinitialiser** présent dans l’en-tête restaure à tout moment les données initiales. Les données restent uniquement dans le navigateur via `localStorage`.

## Captures de référence

- [Accueil — desktop](screenshots/coordination/landing-desktop.png)
- [Guide de démonstration — desktop](screenshots/coordination/demo-desktop.png)
- [Vue coordinateur — desktop](screenshots/coordination/coordinateur-desktop.png)
- [Suivi terrain — mobile](screenshots/coordination/terrain-mobile.png)

## Contrôles techniques

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Limites connues

- aucune authentification réelle ;
- aucune persistance serveur ;
- aucune notification externe ;
- les documents joints sont représentés par leur nom et ne sont pas téléversés.
