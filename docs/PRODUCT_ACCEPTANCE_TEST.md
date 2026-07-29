# Recette produit Mbàmbulaan

## Accès

- URL Sites : à renseigner après publication ;
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

La réinitialisation restaure le scénario et supprime les actions temporaires.

## Limites

- données simulées et non officielles ;
- carte structurée, non SIG réglementaire ;
- repli mémoire non adapté à la production ;
- aucune transmission externe ;
- aucune facturation réelle ;
- aucune certification ;
- aucun moteur prédictif ;
- les exports sont imprimables, pas archivés dans un stockage objet ;
- recette PostgreSQL réelle à réaliser avec `DATABASE_URL`.
