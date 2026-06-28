# Risques Mbambulaan

## Risques produit

### Confusion avec une marketplace

Risque: le projet peut etre percu comme une simple plateforme d annonces.

Reponse: insister sur coordination, impact, tracabilite, tensions territoriales et aide a la decision.

### MVP trop large

Risque: ajouter trop de fonctionnalites avant validation.

Reponse: rester sur les packs metier prioritaires et eviter auth, API, paiement et back office complet avant V1.

### Demonstration peu claire

Risque: le parcours n est pas compris en moins de cinq minutes.

Reponse: utiliser le script demo et raconter un flux complet de bout en bout.

## Risques metier

### Donnees non verifiees

Risque: les donnees mock peuvent etre prises pour des chiffres officiels.

Reponse: preciser que les donnees sont simulees et devront etre sourcees pour une version institutionnelle.

### Adoption terrain

Risque: les acteurs terrain n adoptent pas l outil si la valeur immediate n est pas claire.

Reponse: prioriser les usages simples: declarer, voir, reserver, etre alerte.

### Complexite des flux reels

Risque: les pratiques locales sont plus complexes que le modele MVP.

Reponse: tester avec acteurs terrain et ajuster les regles metier.

## Risques techniques

### Logique metier dispersee

Risque: les calculs sont places dans les composants.

Reponse: centraliser dans src/lib.

### Dette de donnees mockees

Risque: les donnees locales deviennent difficiles a maintenir.

Reponse: garder les references metier propres et documentees.

### Pack interrompu

Risque: PACK IM 008 reste incomplet.

Reponse: reprise obligatoire avant tout nouveau developpement.
