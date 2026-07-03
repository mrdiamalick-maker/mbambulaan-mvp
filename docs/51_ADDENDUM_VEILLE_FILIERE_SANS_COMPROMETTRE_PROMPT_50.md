# Addendum - Veille filiere sans compromettre le prompt 50

## Decision produit

Oui, une brique `Veille filiere` peut seduire le Ministere, a condition qu'elle reste sobre, utile et non bloquante.

Elle ne doit pas remplacer ni retarder les corrections du `docs/50_PROMPT_FINAL_DEMO_ASSOCIE_ETAT.md`.

Priorite absolue inchangee : appliquer d'abord le prompt 50.

La veille filiere est un plus de demo, a integrer uniquement si les corrections P1 du prompt 50 sont solides.

## Pourquoi c'est pertinent

Pour un Ministere, l'espace ne doit pas seulement montrer les donnees internes du jour. Il doit aussi donner une lecture du contexte :

- actualites filiere ;
- signaux du moment ;
- annonces institutionnelles ;
- tensions ou alertes publiques ;
- meteo maritime ou conditions generales si mockees ;
- marche, export, hygiene, controle, peche durable ;
- programmes ou initiatives publiques ;
- points a surveiller.

Cela renforce l'idee que Mbambulaan est un espace de pilotage, pas un simple dashboard.

## Regles strictes

- Ne pas utiliser de flux d'actualites reel.
- Ne pas appeler d'API externe.
- Utiliser des donnees mockees.
- Ne pas faire de claims factuels non verifies.
- Ne pas surcharger l'espace.
- Ne pas compromettre le filtre region/Tout.
- Ne pas masquer les sections metier prioritaires.

## Position dans le parcours

Proposition : ajouter une section compacte apres le `Centre de pilotage national` ou dans une colonne laterale de synthese.

Nom conseille :

`Veille filiere et signaux du moment`

Alternative :

`Actualites et signaux filiere`

La section doit etre concise, premium et actionnable.

## Comportement avec le filtre region/Tout

Quand `Tout` est selectionne : afficher une veille nationale filiere avec quelques signaux transverses.

Quand une region est selectionnee : afficher uniquement les signaux et actualites mockees rattaches a cette region.

Exemple : si Dakar est selectionnee, ne pas afficher Joal, Mbour, Kayar ou Saint-Louis.

## Contenu mocke attendu

Chaque item de veille peut contenir :

- titre court ;
- categorie ;
- portee : national ou region ;
- criticite : faible, moyenne, haute ;
- date relative ;
- source mockee : Service regional, programme, relais terrain, note institutionnelle, observation terrain ;
- action possible.

Categories possibles :

- Reglementation ;
- Production ;
- Marche ;
- Hygiene et qualite ;
- Ressources ;
- Meteo maritime mockee ;
- Especes a surveiller ;
- Programme public ;
- Tension terrain ;
- Export.

## Actions possibles

La veille doit etre actionnable, mais simplement :

- `Ajouter a la synthese` ;
- `Creer action de suivi` ;
- `Demander verification terrain` ;
- `Lier a une region` ;
- `Inclure dans la note`.

Chaque action doit produire une consequence visible : action en attente, trace, note ou focus.

## IA Mbambulaan et veille

Si IA desactivee : la veille reste une liste simple de signaux mockes.

Si IA activee : l'IA peut proposer une lecture courte :

- `Signal a surveiller` ;
- `A lier a une note` ;
- `Verification recommandee` ;
- `Possible impact sur la priorite d'attention`.

L'IA ne decide jamais. L'utilisateur choisit d'inclure ou non un signal dans une note ou action.

## Prompt additionnel a donner a Codex apres le prompt 50

Applique d'abord `docs/50_PROMPT_FINAL_DEMO_ASSOCIE_ETAT.md`.

Ensuite, seulement si P1 est solide, ajoute une petite section premium et non intrusive :

`Veille filiere et signaux du moment`.

Contraintes :

- donnees mockees uniquement ;
- pas d'API externe ;
- pas de news reelle ;
- respecte le filtre region/Tout ;
- en mode region, ne montre que les signaux de la region selectionnee ;
- en mode Tout, montre les signaux nationaux et multi-regions ;
- chaque item doit avoir une action simple ;
- les actions ajoutent une trace, une note ou une action en attente ;
- si IA activee, elle peut commenter ou suggerer quoi faire ;
- si IA desactivee, la veille reste disponible en mode manuel ;
- ne surcharge pas l'interface ;
- design premium XXL, palette mer, discret mais seduisant.

## Definition de succes

La veille est reussie si :

1. elle seduit sans prendre trop de place ;
2. elle renforce la lecture Ministere ;
3. elle respecte le filtre region/Tout ;
4. elle reste actionnable ;
5. elle ne compromet aucune correction du prompt 50 ;
6. elle reste clairement mockee pour la demo.