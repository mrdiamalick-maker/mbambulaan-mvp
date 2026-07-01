# Tera prompt Codex - analytics visuels, filtres quai et referents terrain

## Mission

Tu travailles sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis d'abord :

- `docs/34_TERA_PROMPT_CODEX_CREATIVE_REDESIGN_NO_LEGACY_BIAS.md`
- `docs/33_TERA_PROMPT_CODEX_DESIGN_SYSTEM_SIMPLIFICATION.md`
- `docs/31_TERA_PROMPT_CODEX_MINISTERE_EXECUTION_FINAL.md`
- `docs/26_SPEC_FONCTIONNELLE_ESPACE_MINISTERE_V1.md`

Objectif : renforcer `/espace-prive/etat` pour en faire une vraie experience analytique institutionnelle : plus de visualisations, KPIs dynamiques, filtre par quai de peche, referents terrain par quai et actions qui vont plus loin.

## Diagnostic produit

Le rendu actuel se rapproche d'un MVP, mais il manque encore :

- des KPIs plus visuels et moins card simples ;
- des donuts, barres, jauges, progress bars et mini charts ;
- une palette plus mer / Qlik-like ;
- une vraie interaction dynamique par quai ;
- des actions de pilotage qui produisent un resultat visible ;
- des fiches referents terrain par quai ;
- plus de liens entre quai, programme, budget, incident, ressource, preuve et action.

## Decision CPO

La logique est pertinente et forte commercialement.

Pour le Ministere, Mbambulaan devient achetable si la solution permet de :

- choisir un quai ;
- voir instantanement les indicateurs du quai ;
- identifier les referents pecheur / mareyeur / organisation ;
- suivre les programmes et financements lies ;
- detecter incidents et ressources critiques ;
- generer une note ou demande de verification ;
- faciliter contact, compte rendu, financement et suivi.

C'est une promesse plus forte qu'une carte statique.

## Regle importante

Ne pas creer une fiche CRM generique.

Les referents ne sont pas des contacts commerciaux. Ce sont des points d'ancrage de coordination terrain : relais, verification, compte rendu, remontée besoin, suivi programme, appui financement.

## Couleurs et visualisations

Palette dominante :

- ocean profond ;
- turquoise ;
- cyan doux ;
- sable ;
- vert lagon ;
- ambre ;
- corail pour alerte.

Remplacer les KPI cards trop simples par des composants visuels :

- donut compact pour execution budgetaire ;
- barre horizontale pour tension ou criticite ;
- mini stacked bar pour repartition programmes / incidents ;
- progress bar pour budget engage / consomme ;
- score radial ou gauge pour priorite territoire ;
- sparkline simple pour tendance incidents ou signaux ;
- chips statistiques compacts.

Ne pas utiliser de librairie chart lourde si inutile. CSS/SVG simple suffit.

## Nouveau comportement - Carte et quais

Dans le module `Carte et territoires`, ajouter un filtre dynamique par quai de peche.

Fonctionnement attendu :

1. L'utilisateur voit une liste ou selecteur de quais : Joal, Kayar, Mbour, Saint-Louis, Dakar, etc.
2. Il clique un quai sur la carte ou dans un selecteur.
3. Les KPIs du module se mettent a jour selon le quai selectionne.
4. Le panneau detail affiche les donnees du quai.
5. Les referents terrain du quai s'affichent.
6. Les programmes, budgets, incidents, ressources et preuves lies au quai s'affichent.

## KPIs dynamiques par quai

Afficher plus de KPIs, mais de facon compacte :

- tension du quai ;
- score priorite ;
- incidents ouverts ;
- taux execution budgetaire ;
- financement en attente ;
- ressources critiques ;
- programmes actifs ;
- preuves validees ;
- referents disponibles ;
- derniere mise a jour.

Ne pas tout afficher en gros blocs. Organiser en grille compacte avec visualisations.

## Fiche quai

Chaque quai doit avoir une fiche compacte :

- nom ;
- commune / region ;
- lat/lng mockes ;
- niveau tension ;
- priorite ;
- programmes actifs ;
- budget associe ;
- incidents ;
- ressources critiques ;
- preuves ;
- referents terrain ;
- action recommandee.

## Referents terrain par quai

Ajouter des personas / fiches referents par quai.

Types de referents :

- referent pecheur ;
- referent mareyeur ;
- organisation professionnelle ;
- agent ou relais local ;
- partenaire programme si pertinent.

Chaque referent doit avoir :

- nom fictif ;
- role ;
- quai ;
- niveau de confiance ;
- disponibilite ;
- dernier compte rendu ;
- besoins remontes ;
- programmes suivis ;
- action possible.

Actions possibles :

- demander compte rendu ;
- preparer prise de contact ;
- relier a une demande de financement ;
- affecter suivi programme ;
- demander verification terrain.

Afficher clairement que c'est une simulation MVP.

## Actions qui vont plus loin

Les actions ne doivent pas seulement afficher un toast/message.

Elles doivent produire un changement visible dans l'interface.

Exemples :

### Pilotage budget

Action : Signaler ecart.

Resultat visible :

- ligne budget passe en statut `Ecart signale` ;
- un element apparait dans `Actions en attente` ;
- la note d'arbitrage se met a jour.

### Capacite operationnelle

Action : Demander maintenance.

Resultat visible :

- ressource passe en statut `Maintenance demandee` ;
- incident lie apparait ou change de statut ;
- action en attente ajoutee.

### Referent terrain

Action : Demander compte rendu.

Resultat visible :

- referent passe en statut `Compte rendu demande` ;
- action en attente ajoutee ;
- note terrain pre-remplie.

### Quai prioritaire

Action : Prioriser quai.

Resultat visible :

- score ou badge du quai change ;
- le quai remonte en tete ;
- synthese IA mentionne cette priorite.

## Nouveau bloc - Actions en attente

Ajouter un bloc compact `Actions en attente`.

Il liste les actions generees par l'utilisateur :

- ecart budget signale ;
- verification terrain demandee ;
- maintenance demandee ;
- compte rendu referent demande ;
- note d'arbitrage preparee.

Cela rend le parcours plus concret.

## IA Mbambulaan

L'IA doit reagir au quai selectionne.

Afficher une synthese courte :

- pourquoi ce quai est prioritaire ;
- quel risque est principal ;
- quelle action est recommandee ;
- quelles donnees sont manquantes ou obsoletes.

Questions rapides dynamiques :

- Pourquoi ce quai est prioritaire ?
- Quel financement est bloque ?
- Quel referent contacter ?
- Quelle ressource est critique ?
- Quelle note preparer ?

Toujours afficher : IA simulee - donnees mockees. L'humain valide.

## Module Programmes et budgets

Ameliorer le rendu visuel :

- donut ou gauge execution budgetaire ;
- barres prevu / engage / consomme ;
- classement programmes a risque ;
- filtres par quai / territoire ;
- action Signaler ecart avec changement visible.

## Module Ressources et acteurs

Ameliorer le rendu :

- capacite operationnelle sous forme de score ou jauge ;
- ressources critiques en liste compacte ;
- referents par quai ;
- action Demander maintenance ou Demander compte rendu avec changement visible.

## Design attendu

- plus analytique ;
- plus Qlik-like ;
- moins card brute ;
- moins texte ;
- plus de visualisations ;
- couleurs de la mer ;
- plus de liens entre donnees et actions ;
- lecture progressive : selection quai -> KPIs -> insight -> referents -> action -> trace.

## Ne pas faire

- ne pas transformer en CRM ;
- ne pas transformer en ERP ;
- ne pas ajouter de gros paragraphes ;
- ne pas afficher toutes les donnees en meme temps ;
- ne pas perdre la sobriete institutionnelle ;
- ne pas retravailler tous les espaces.

## Donnees a enrichir

Dans `src/data/ministrySpace.ts` ou fichier equivalent, ajouter ou enrichir :

- quays ;
- quayMetrics ;
- quayContacts ou referents ;
- quayPrograms ;
- quayBudgets ;
- quayResources ;
- quayIncidents ;
- quayProofs ;
- pendingActions.

## Validation

Executer :

```bash
npm run typecheck
npm run build
```

Puis resumer :

- nouveaux visuels KPI ;
- filtre dynamique par quai ;
- referents terrain ;
- actions qui changent l'interface ;
- donnees enrichies ;
- PR #26 toujours draft.
