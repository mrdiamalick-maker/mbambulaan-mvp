# Tera prompt Codex - ecosysteme numerique Mbambulaan

## Mission

Tu travailles sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Objectif : faire evoluer la version actuelle d'une belle simulation front vers un produit prive plus profond, vendable et defendable.

Lire d'abord :

- `docs/18_PRODUCT_CHALLENGE_CAPABILITIES.md`
- `docs/17_TERA_PROMPT_CODEX_PRIVATE_SPACES.md`
- `docs/14_TEMPLATE_DECISION.md`
- `docs/07_PRODUCT_UX_BLUEPRINT_FINAL.md`

## Vision a respecter

Mbambulaan n'est pas une marketplace, pas un dashboard generique, pas une application pecheur-first et pas une collection de pages.

Mbambulaan est une infrastructure numerique de coordination pour la peche artisanale senegalaise.

Le produit doit connecter quais, acteurs, signaux, flux, demandes, programmes, financements, preuves, actions, rapports et decisions.

Chaque acteur doit avoir son espace prive avec ses propres capacites, pas seulement son propre habillage.

## Resultat attendu

La version doit permettre au CEO de presenter a son associe :

1. La vision : infrastructure de coordination.
2. Le produit : espaces prives par acteur.
3. Les parcours : chaque acteur a un travail different.
4. La valeur : chaque espace justifie un prix.
5. Le potentiel : Mbambulaan peut s'imposer comme couche numerique de la filiere.

## Capacite majeure a ajouter : cartographie

Ajouter une carte stylisee des quais de peche et des acteurs.

Pas besoin d'une vraie integration GIS. Une carte mockee premium suffit pour cette iteration.

Elle doit contenir :

- quais ;
- zones ;
- acteurs ;
- tensions ;
- signaux ;
- programmes ;
- demandes ;
- priorites.

La carte est obligatoire pour le Ministere.

Elle doit aussi etre adaptee selon les profils quand utile : collectivite, ONG, mareyeur, exportateur, organisation, investisseur.

Pour le pecheur, ne pas faire une carte dense. Afficher une vue simple du quai, du relais et du statut.

## Espaces prives a renforcer

### Ministere / Etat

Transformer l'espace en cockpit institutionnel.

Ajouter ou renforcer :

- carte des quais et tensions ;
- priorisation des territoires ;
- programmes par zone ;
- demandes de financement ;
- alertes institutionnelles ;
- detection de doublons ;
- note ministerielle simulee ;
- suivi des decisions.

Actions simulees : prioriser territoire, generer note, changer statut alerte, ouvrir detail programme, marquer decision.

### ONG / Programme

Transformer l'espace en pilotage programme et reporting bailleur.

Ajouter ou renforcer :

- portefeuille d'actions ;
- beneficiaires ;
- preuves terrain ;
- score de preuve ;
- alertes retard ;
- rapport bailleur ;
- comparaison territoires ;
- checklist suivi-evaluation.

Actions simulees : ajouter preuve, marquer action realisee, filtrer par territoire, generer rapport, afficher gaps de preuve.

### Collectivite

Transformer l'espace en cockpit local communal.

Ajouter ou renforcer :

- vue commune et quais ;
- demandes terrain ;
- partenaires mobilisables ;
- actions locales ;
- calendrier ;
- note mairie ;
- responsable/action/date.

Actions simulees : affecter action, prioriser quai, demander appui partenaire, generer note communale.

### Pecheur

Transformer l'espace en parcours assiste mobile-first.

Ne pas faire un dashboard dense.

Ajouter ou renforcer :

- signalement simple ;
- statut lisible ;
- relais quai ;
- prochaine etape ;
- retour recu ;
- demande d'aide.

Actions simulees : creer signalement, changer etape, afficher relais, afficher retour, confirmer demande.

### Mareyeur

Transformer l'espace en coordination flux / qualite / logistique.

Ajouter ou renforcer :

- lots qualifies ;
- qualite ;
- risque perte ;
- besoin froid ;
- plan retrait ;
- transport ;
- historique lots ;
- alertes flux.

Actions simulees : qualifier lot, organiser retrait, demander froid, signaler risque, voir detail lot.

Ne pas faire une marketplace.

### Exportateur / Entreprise

Transformer l'espace en supply qualifie et reduction de risque.

Ajouter ou renforcer :

- pipeline supply qualifie ;
- opportunites non publiques ;
- score confiance ;
- preuves ;
- risques qualite ;
- conditions logistiques ;
- decision d'achat preparee.

Actions simulees : demander preuve, qualifier opportunite, suivre risque, generer decision memo.

Ne pas faire un catalogue public.

### Organisation professionnelle

Transformer l'espace en outil de structuration collective.

Ajouter ou renforcer :

- registre membres ;
- demandes collectives ;
- dossiers partenaires ;
- priorites bureau ;
- preuves besoins ;
- note plaidoyer ;
- membres par quai.

Actions simulees : ajouter membre temporaire, classer demande, generer note partenaire, suivre dossier.

### Investisseur / Associe

Transformer l'espace en executive room.

Ajouter ou renforcer :

- these infrastructure ;
- segments payeurs ;
- offres ;
- potentiel revenus ;
- pipeline partenaires ;
- carte expansion ;
- risques ;
- roadmap ;
- data room ;
- unit economics preliminaire.

Actions simulees : filtrer segments, ouvrir data room, generer investment memo, marquer risque, voir roadmap.

## Exigence de profondeur fonctionnelle

Chaque espace doit avoir au moins :

- une navigation propre ;
- une carte ou vue territoire quand utile ;
- un tableau metier ;
- un panneau detail ;
- un workflow ;
- une action de synthese ou rapport ;
- au moins trois actions simulees utiles ;
- un message clair pour les actions non connectees backend.

## Donnees

Enrichir `src/data/privateSpaces.ts` ou creer des mocks specialises.

Les donnees doivent etre coherentes entre profils, mais affichees differemment selon les permissions et besoins.

Ajouter si necessaire :

- fishingQuays ;
- actorMap ;
- territoryRisks ;
- programPortfolio ;
- beneficiaryRecords ;
- lotRecords ;
- supplyOpportunities ;
- collectiveRequests ;
- payerSegments ;
- investmentRoadmap.

## Design

S'inspirer de TailAdmin : structure premium, sidebar, topbar, cards, tables, map panels, report panels, data room, workflow boards.

Mais le rendu doit rester Mbambulaan : coordination, territoire, preuve, filiere, ecosysteme.

## Validation

Executer :

```bash
npm run typecheck
npm run build
```

## Livraison attendue

Mettre a jour PR #26 avec :

- espaces prives plus profonds ;
- cartographie operationnelle ;
- workflows metier differencies ;
- actions simulees fonctionnelles ;
- donnees enrichies ;
- route investisseur utile pour presenter a l'associe ;
- PR toujours en draft ;
- resume clair de ce qui a ete livre.