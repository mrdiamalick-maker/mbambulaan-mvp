# Recette produit Mbàmbulaan

## Accès

- URL Vercel publique : `https://mbambulaan-ecosysteme-v1.vercel.app` ;
- accès validé sans authentification ChatGPT, protection Vercel ou mot de passe ;
- date de déploiement et de recette : 29 juillet 2026 ;
- commit fonctionnel du portage : `5baa6bd` ;
- mode : démonstration déterministe, données simulées et non officielles ;
- ancienne URL Sites : historique de build uniquement, non utilisée pour la recette ;
- site public : `/` ;
- Atlas public : `/atlas` ;
- offres : `/offres` ;
- démonstration : `/demo` ;
- connexion : `/connexion` ;
- application : `/app/travail` ;
- Mbàmbulaan Ops : `/app/administration`.

## Comptes

La page `/connexion` ouvre directement les comptes de démonstration.

| Profil | Organisation | Territoire | Plan | Accès principal | Parcours recommandé |
|---|---|---|---|---|---|
| Administrateur Mbàmbulaan | Mbàmbulaan Ops | National | Professionnel démo | Supervision et audit | Réinitialiser, agir, lire le journal |
| Opérateur de quai | Gestion des quais pilotes | Multi-sites | Professionnel démo | Débarquement et pesée | Confirmer arrivée, débarquement, pesée et lots |
| Capitaine | Collectif des capitaines | Joal | Organisation démo | Sortie et retour | Annoncer le retour de Jambar II |
| Mareyeuse | GIE des mareyeurs | Joal / Mbour | Professionnel démo | Besoins et opportunités | Valider puis exécuter une opportunité |
| Transformatrice | Naatangué | Mbour / Hann | Professionnel démo | Approvisionnement | Consulter le surplus de sardinelle |
| Prestataire | Froid Sénégal Services | Petite-Côte | Professionnel démo | Capacités et intervention | Traiter la machine à glace |
| Gestionnaire | Collectif des capitaines | Joal / Mbour | Organisation démo | Membres et actifs | Consulter droits et capacités |
| Coordinateur | Cellule nationale | Multi-territoires | Institution démo | Coordination complète | Jouer les deux machines d’état |
| Institution | Cellule nationale | National | Institution démo | Atlas et pilotage | Lire tension, résultats et rapport |
| Partenaire | Résilience littorale | Multi-territoires | Partenaire démo | Initiative et résultats | Instruire la chaîne du froid |

OTP local alternatif : `246810`.

Variables Vercel :

- `SESSION_SECRET` : secret sensible configuré dans Vercel, jamais committé ;
- `DEMO_MODE=true` : comptes de recette et OTP local autorisés ;
- `DATABASE_URL` : optionnelle, absente de la démonstration publique.

En l’absence de base, l’état est conservé dans le navigateur sous `mbambulaan-demo-state-v1`. Les commandes restent contrôlées par les permissions serveur. Le bouton **Réinitialiser** restaure le seed.

## Parcours opérationnel

1. Réinitialiser la démonstration.
2. Ouvrir `/app/operations`.
3. En vue **Capitaine**, annoncer le retour de Jambar II.
4. Passer en vue **Opérateur de quai**.
5. Confirmer l’arrivée.
6. Enregistrer le débarquement.
7. Confirmer la pesée.
8. Créer les lots.
9. Ouvrir `/app/coordination`.
10. Passer en vue **Mareyeuse** ou **Coordinateur**.
11. Valider l’engagement proposé.
12. Confirmer le résultat logistique.
13. Vérifier le lot valorisé, le besoin clos et l’audit.

Résultat attendu : sortie, débarquement, lots, opportunité, coordination et résultat restent reliés.

## Scénario infrastructure

1. Ouvrir `/app/situations/sit-glace`.
2. Qualifier le signal.
3. Confirmer la priorité.
4. Créer la coordination.
5. Démarrer l’intervention.
6. Documenter une attente.
7. Reprendre.
8. Enregistrer résultat et confirmation.
9. Clôturer.
10. Vérifier `/app/initiatives` et `/app/pilotage`.

## Atlas

1. Ouvrir `/atlas` pour la vue publique.
2. Changer de territoire et de couche.
3. Ouvrir `/app/atlas`.
4. Vérifier Tensions, Capacités, Espèces, Prix, Rareté et Durabilité.
5. Contrôler qu’une absence de donnée est explicitée.

## Marchés et rareté

1. Ouvrir `/app/marches`.
2. Filtrer le thiof puis Kayar.
3. Lire le prix, la source, la confiance et les raisons de rareté.
4. Signaler une observation pour vérification.
5. Vérifier l’entrée dans `/app/administration`.

## Community

1. Ouvrir `/app/community`.
2. Publier un besoin territorial.
3. Transformer la publication en signal.
4. Ouvrir la situation générée.
5. Vérifier l’audit.

## Durabilité

1. Ouvrir `/app/durabilite`.
2. Sélectionner un lot.
3. Vérifier sortie, pirogue, débarquement, complétude, pratique et recommandation.
4. Ouvrir la coordination suggérée.

## Pilotage institutionnel

1. Ouvrir `/app/pilotage`.
2. Vérifier période, source, confiance et limites des métriques.
3. Imprimer le rapport.
4. Contrôler que la valeur économique est marquée estimée.

## Offres et verrouillages

1. Ouvrir `/offres`.
2. Comparer les sept plans.
3. Ouvrir `/app/organisation`.
4. Changer de rôle.
5. Vérifier que navigation, plan et droits évoluent sans changer les objets métier.

## Réinitialisation

- interface : bouton **Réinitialiser** ;
- API : `POST /api/demo/reset` ;
- seed : `src/data/demo-state.ts`.
- navigateur : suppression optionnelle de `localStorage["mbambulaan-demo-state-v1"]`.

La réinitialisation restaure le scénario et supprime les actions temporaires.

## Résultats de la recette Vercel

| Scénario obligatoire | Résultat |
|---|---|
| Retour et débarquement | Validé : retour, arrivée, débarquement, pesée, lots, opportunité et résultat logistique |
| Coordination commerciale | Validé : matching explicable, engagement humain, exécution et valorisation |
| Infrastructure | Validé : qualification, priorité, coordination, intervention, attente, reprise, résultat et clôture |
| Community | Validé : publication, transformation en situation et continuité d’audit |
| Atlas | Validé : public/professionnel, six couches, territoire, espèce, période, source, fraîcheur et action liée |
| Institution | Validé : briefing, priorités, sources, confiance, résultats et rapport imprimable |

Contrôles techniques :

- `npm ci` : OK ;
- `npm run lint` : OK ;
- `npm run typecheck` : OK ;
- `npm test` : 8/8 ;
- `npm run build` : OK, 32 routes ;
- `npm run test:e2e` : OK en local ;
- `SMOKE_BASE_URL=https://mbambulaan-ecosysteme-v1.vercel.app npm run test:e2e` : OK sur Vercel ;
- `git diff --check` : OK ;
- aucune erreur console bloquante pendant les captures ;
- aucun débordement horizontal à 1440 × 1100 et 390 × 844.

Captures finales dans `docs/screenshots` :

- `landing-vercel-desktop.jpg` ;
- `atlas-vercel-desktop.jpg` ;
- `operations-vercel-desktop.jpg` ;
- `pilotage-institutionnel-vercel-desktop.jpg` ;
- `offres-vercel-desktop.jpg` ;
- `demo-vercel-mobile.jpg` ;
- `operations-vercel-mobile.jpg` ;
- `atlas-vercel-mobile.jpg`.

## Limites

- données simulées et non officielles ;
- carte structurée, non SIG réglementaire ;
- état navigateur de démonstration non adapté à la production ;
- le mode navigateur de démonstration n’est ni partagé entre appareils ni une source de vérité officielle ;
- aucune transmission externe ;
- aucune facturation réelle ;
- aucune certification ;
- aucun moteur prédictif ;
- les exports sont imprimables, pas archivés dans un stockage objet ;
- recette PostgreSQL réelle à réaliser avec `DATABASE_URL`.
