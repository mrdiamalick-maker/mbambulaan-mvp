# Élargissement du jeu de démonstration — sept territoires

**Statut :** intégré après validation CEO du 18 août 2026

**Branche :** `codex/rd-exploration` exclusivement

**Nature :** données fictives de démonstration, sans connexion à une source réelle

**Déploiement :** aucun

## 1. Décision appliquée

Le jeu de démonstration approfondit les sept territoires du référentiel Produit qui ne disposaient pas encore d'une boucle métier complète :

1. Kayar ;
2. Soumbédioune ;
3. Rufisque–Bargny ;
4. Djiffer ;
5. Popenguine ;
6. Missirah ;
7. Ouakam.

Chaque scénario relie désormais :

> Signal → Situation → Décision → Engagements → Preuves → Résultat → Apprentissage

Les quatre situations déjà présentes (`sit-kayar`, `sit-soumbedioune`, `sit-rufisque`, `sit-djiffer`) ont été conservées sous leur identifiant existant et complétées. Les veilles génériques de Popenguine, Missirah et Ouakam ont été remplacées par des situations canoniques détaillées.

## 2. Référentiel territorial conservé

La vérification distingue deux référentiels, qui ne doivent pas être fusionnés implicitement :

- Public : 20 territoires ;
- Produit : 18 territoires ;
- intersection : 16 territoires ;
- Public uniquement : Bargny, Ngaparou, Toubacouta et Ziguinchor ;
- Produit uniquement : Lompoul et Ouakam.

Le territoire Produit `rufisque` conserve le libellé **Rufisque-Bargny**. Aucun territoire `bargny` autonome n'est ajouté tant que la règle de découpage canonique n'est pas arbitrée.

## 3. Matrice des scénarios intégrés

| Territoire | Situation canonique | Type | Décision principale | Résultat démontré | Limite explicite |
|---|---|---|---|---|---|
| Kayar | `sit-kayar` | Tension commerciale locale | Ouvrir une coordination | Lot local pesé accepté comme couverture partielle ; reliquat maintenu ouvert | Ni inflation, ni raréfaction biologique déduite |
| Soumbédioune | `sit-soumbedioune` | Conformité administrative | Demander une vérification | Rattachement confirmé par une réponse institutionnelle simulée | La photographie initiale reste déclarative |
| Rufisque–Bargny | `sit-rufisque` | Transport froid | Mobiliser une capacité | Premier enlèvement documenté ; solde planifié | Aucune perte évitée chiffrée sans preuve |
| Djiffer | `sit-djiffer` | Fiabilité de la pesée | Lancer une intervention | Balance recalibrée ; mesures antérieures contestées exclues | Remise en service distincte d'un volume traité |
| Popenguine | `sit-popenguine-vente-locale` | Vente locale ordinaire | Ouvrir une coordination | Lot remis dans le créneau convenu | Scénario stable, aucune crise fabriquée |
| Missirah | `sit-missirah-traceabilite` | Traçabilité d'un lot | Demander une vérification | Provenance et remise documentées avant prise en charge | Traçabilité distincte d'une certification écologique |
| Ouakam | `sit-ouakam-creneau-quai` | Organisation du débarquement | Ouvrir une coordination | Créneau alternatif exécuté sans incident déclaré | Vigilance légère, sans escalade artificielle |

## 4. Discipline de confiance

### Kayar

- le besoin de 600 kg reste `declaree` à l'origine ;
- la pesée locale de 140 kg est `observee` ;
- l'acceptation partielle et le maintien du reliquat sont `documentee` ;
- l'indicateur local porte le statut `sous_tension`, jamais une conclusion écologique ;
- le point de prix isolé est signalé comme fragile et non statistique.

### Soumbédioune

- le document reçu par le relais commence en `declaree` ;
- la copie et sa provenance deviennent `documentee` ;
- seul le retour simulé du service compétent est étiqueté `officielle` ;
- l'auteur du document et le relais de saisie restent distincts.

### Missirah

- la note vocale commence en `declaree` ;
- le lieu, l'heure, la photographie et la remise rendent le dossier `documentee` ;
- aucune preuve de durabilité ou d'état de la ressource n'est dérivée de cette traçabilité.

## 5. Cohérences associées

- Le scénario de Djiffer n'est plus rattaché au programme de sécurité en mer : il concerne exclusivement la qualité de la mesure.
- La capacité de transport de Rufisque–Bargny reste `fragile` tant que le prestataire alternatif n'est pas confirmé.
- Popenguine est présenté comme un territoire `stable`, afin que la démonstration ne soit pas composée uniquement de crises.
- Les programmes, notifications et publications Community utilisent les identifiants des situations approfondies ; aucune référence ne pointe vers une veille générique supprimée.
- Des acteurs opérationnels dédiés rendent les traces visibles côté mareyeur, prestataire, Terrain et opérateur sans ajouter de rôle ou de permission.

## 6. Contrôles automatiques

Le test `tests/demo-territory-depth.test.ts` vérifie notamment :

- la présence d'un signal, d'une décision, d'une coordination, d'au moins deux engagements terminés, d'une preuve, d'un résultat et d'un apprentissage pour chacun des sept territoires ;
- l'absence de situation générique concurrente `sit-<territoire>-veille` ;
- les limites de confiance propres à Kayar, Soumbédioune, Missirah et Popenguine ;
- les tailles et différences exactes des référentiels Public et Produit ;
- l'absence de situation orpheline dans les initiatives et les publications converties.

Ces tests protègent la cohérence de démonstration ; ils ne transforment pas les données simulées en observations réelles.
