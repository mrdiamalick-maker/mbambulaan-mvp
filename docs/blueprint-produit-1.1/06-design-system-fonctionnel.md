# 06 — Design System fonctionnel

## 1. Finalité

Le Design System fonctionnel décrit les principes d'interaction, les patterns d'interface et les règles d'expérience utilisateur propres à Mbàmbulaan.

Il ne constitue pas encore une charte graphique.

Il sert à garantir que les futurs écrans, formulaires, notifications et parcours :

- soutiennent la coordination ;
- réduisent la charge cognitive ;
- restent compréhensibles par des profils variés ;
- fonctionnent dans des environnements de faible connectivité ;
- rendent visibles les responsabilités, décisions et engagements ;
- inspirent confiance ;
- évitent les interfaces de type ERP générique.

## 2. Principes directeurs

### 2.1 Priorité à l'action métier

Chaque écran doit répondre à une question claire :

- que se passe-t-il ?
- qui doit agir ?
- avant quand ?
- avec quelle preuve ?
- qui décide ?
- quel est le prochain pas ?

### 2.2 Visibilité de la coordination

Les interfaces doivent rendre explicites :

- le responsable ;
- les contributeurs ;
- les bénéficiaires ;
- les dépendances ;
- les blocages ;
- les décisions prises ;
- les engagements en cours.

### 2.3 Simplicité progressive

Les utilisateurs voient d'abord l'essentiel.

Les détails avancés sont accessibles progressivement.

Éviter :

- les écrans surchargés ;
- les formulaires trop longs ;
- les tableaux complexes par défaut ;
- les libellés techniques ;
- les statuts ambigus.

### 2.4 Confiance explicite

La confiance ne doit pas être implicite.

L'interface doit montrer lorsque pertinent :

- la source ;
- la date ;
- le niveau de vérification ;
- l'auteur ;
- la preuve ;
- le mandat ;
- l'historique.

### 2.5 Mobile d'abord

Les parcours principaux doivent être conçus pour :

- un smartphone ;
- un usage à une main ;
- des sessions courtes ;
- une saisie minimale ;
- une connectivité intermittente ;
- des utilisateurs peu familiers des outils numériques.

## 3. Structure générale des interfaces

Les interfaces Mbàmbulaan s'organisent autour de cinq espaces fonctionnels :

### 3.1 Mon travail

Regroupe :

- actions assignées ;
- engagements à tenir ;
- validations demandées ;
- décisions attendues ;
- éléments bloqués ;
- échéances proches.

### 3.2 Territoire

Regroupe :

- situations ouvertes ;
- signalements récents ;
- initiatives en cours ;
- acteurs et organisations ;
- indicateurs utiles ;
- points de vigilance.

### 3.3 Coordination

Regroupe :

- espaces de coordination ;
- engagements ;
- décisions ;
- chronologie ;
- participants ;
- documents et preuves.

### 3.4 Initiatives

Regroupe :

- besoins sources ;
- objectifs ;
- partenaires ;
- financement ;
- exécution ;
- risques ;
- résultats.

### 3.5 Connaissance

Regroupe :

- apprentissages ;
- pratiques réplicables ;
- guides ;
- retours d'expérience.

## 4. Navigation

La navigation doit rester courte et stable.

Sur mobile, recommander au maximum cinq entrées principales.

Exemple :

```text
Accueil
Territoire
Coordination
Initiatives
Profil
```

Les entrées doivent être adaptées au rôle de l'utilisateur.

Un acteur terrain ne doit pas voir la même densité qu'un administrateur institutionnel.

## 5. Pattern — Carte d'objet métier

Chaque objet important doit pouvoir être résumé dans une carte cohérente.

### Contenu minimal

- titre ;
- type ;
- statut ;
- territoire ;
- responsable ;
- échéance ;
- priorité ;
- prochaine action.

### Exemple

```text
Panne de la machine à glace
Critique · Joal
Responsable : GIE X
Échéance : 28 août
Prochaine action : confirmer l'intervention
```

## 6. Pattern — Statut

Les statuts doivent être :

- explicites ;
- limités ;
- orientés action ;
- cohérents entre les modules.

Un statut doit toujours répondre à :

- où en est l'objet ?
- qui doit agir maintenant ?
- quelle transition est possible ?

Éviter les statuts génériques tels que :

- ouvert ;
- traité ;
- terminé ;

sans contexte complémentaire.

## 7. Pattern — Chronologie

La chronologie est un élément central de Mbàmbulaan.

Elle doit afficher :

- événements métier ;
- décisions ;
- engagements ;
- preuves ;
- changements de statut ;
- commentaires importants ;
- notifications critiques.

Chaque entrée doit préciser :

- qui ;
- quoi ;
- quand ;
- pourquoi ;
- avec quelle preuve.

## 8. Pattern — Prochaine action

Chaque vue opérationnelle doit afficher une prochaine action claire.

Exemples :

- qualifier le signalement ;
- accepter l'engagement ;
- joindre une preuve ;
- arbitrer la priorité ;
- vérifier l'action terminée ;
- relancer le responsable.

La prochaine action doit être visible sans parcourir plusieurs écrans.

## 9. Pattern — Blocage

Un objet bloqué doit afficher :

- la cause ;
- le propriétaire du blocage ;
- la date de début ;
- l'impact ;
- l'action attendue ;
- la possibilité d'escalade.

Le blocage doit être distinct d'un simple retard.

## 10. Pattern — Engagement

Un engagement doit afficher :

- qui s'engage ;
- envers qui ;
- sur quoi ;
- avant quand ;
- sous quelles conditions ;
- quelle preuve est attendue ;
- son statut.

Transitions principales :

```text
Proposé
→ Accepté
→ En cours
→ Tenu / Partiellement tenu / Non tenu / Annulé
```

## 11. Pattern — Décision

Une décision doit rendre visibles :

- l'objet ;
- le décideur ;
- le mandat ;
- les options examinées ;
- la décision retenue ;
- la justification ;
- les conditions ;
- les conséquences.

Les décisions révisées doivent conserver l'historique.

## 12. Pattern — Signalement

Le parcours de signalement doit être très court.

### Étapes minimales

1. choisir le type ;
2. décrire simplement ;
3. indiquer le lieu ;
4. joindre une preuve facultative ;
5. confirmer l'envoi.

L'utilisateur doit recevoir :

- un accusé de réception ;
- un numéro de suivi ;
- l'état du traitement ;
- une explication en cas de clôture.

## 13. Pattern — Formulaire progressif

Les formulaires longs doivent être découpés.

Règles :

- une intention par étape ;
- sauvegarde automatique ;
- brouillon disponible ;
- champs facultatifs clairement identifiés ;
- explications simples ;
- validation progressive ;
- reprise après interruption.

## 14. Pattern — Preuve

Une preuve doit être facile à ajouter.

Types :

- photo ;
- document ;
- commentaire ;
- validation ;
- signature ;
- donnée externe.

L'interface doit afficher :

- auteur ;
- date ;
- objet lié ;
- niveau de vérification ;
- confidentialité.

## 15. Pattern — Validation

Une validation doit toujours présenter :

- l'objet à valider ;
- le demandeur ;
- le motif ;
- les preuves ;
- l'impact de la validation ;
- les options disponibles.

Actions possibles :

- valider ;
- rejeter ;
- demander une correction ;
- demander un complément.

## 16. Pattern — Priorisation

La priorisation doit être explicable.

L'interface doit montrer :

- criticité ;
- urgence ;
- nombre d'acteurs concernés ;
- étendue territoriale ;
- faisabilité ;
- dépendances ;
- justification de la priorité.

Le score ne doit jamais remplacer la décision humaine.

## 17. Pattern — Territoire

La vue territoire doit éviter le tableau de bord abstrait.

Elle doit montrer :

- ce qui nécessite une attention ;
- les situations critiques ;
- les engagements en retard ;
- les initiatives actives ;
- les décisions attendues ;
- les tendances utiles.

## 18. Pattern — Vue synthèse

Une synthèse doit répondre à trois niveaux :

### Maintenant

- urgences ;
- blocages ;
- échéances.

### En cours

- situations ;
- engagements ;
- initiatives.

### À apprendre

- résultats ;
- écarts ;
- pratiques utiles.

## 19. Pattern — Notification

Une notification doit contenir :

- le fait important ;
- l'objet concerné ;
- l'action attendue ;
- l'échéance ;
- un accès direct.

Exemple :

```text
Votre validation est requise
Situation : panne de glace à Joal
À traiter avant demain 12h
```

Éviter les notifications sans action claire.

## 20. Pattern — Confirmation et prévention d'erreur

Les confirmations fortes sont réservées aux actions sensibles :

- clôturer ;
- rejeter ;
- révoquer un mandat ;
- annuler un engagement ;
- supprimer une preuve ;
- prendre une décision irréversible.

Les messages doivent expliquer la conséquence.

## 21. Pattern — Erreur

Une erreur doit indiquer :

- ce qui s'est passé ;
- ce que l'utilisateur peut faire ;
- si les données ont été conservées ;
- comment reprendre ;
- comment demander de l'aide.

Éviter les codes techniques seuls.

## 22. Pattern — Hors ligne

L'interface doit distinguer :

- enregistré localement ;
- en attente de synchronisation ;
- synchronisé ;
- conflit détecté ;
- échec de synchronisation.

L'utilisateur doit pouvoir continuer à travailler sans connexion sur les parcours essentiels.

## 23. Pattern — Conflit de données

En cas de conflit :

- afficher les deux versions ;
- préciser les auteurs et dates ;
- proposer une résolution ;
- éviter l'écrasement silencieux ;
- conserver la trace.

## 24. Pattern — Accessibilité

Principes minimaux :

- textes lisibles ;
- contrastes suffisants ;
- boutons suffisamment grands ;
- navigation clavier lorsque pertinent ;
- alternatives textuelles ;
- langage simple ;
- ne pas dépendre uniquement de la couleur.

## 25. Langage et terminologie

Le langage doit être :

- direct ;
- concret ;
- non technique ;
- adapté aux acteurs ;
- cohérent dans tout le produit.

Exemples recommandés :

- « Signaler un problème » plutôt que « Créer un ticket » ;
- « Qui doit agir ? » plutôt que « Assignee » ;
- « Preuve attendue » plutôt que « pièce justificative obligatoire » lorsque le contexte le permet.

## 26. Multilingue

La conception doit anticiper :

- français ;
- wolof ;
- autres langues nationales pertinentes.

Les libellés doivent être courts et traduisibles.

Éviter les textes intégrés dans les images.

## 27. Rôles et personnalisation

L'interface doit s'adapter au rôle.

### Acteur terrain

- signaler ;
- suivre ;
- confirmer ;
- joindre une preuve ;
- recevoir une instruction.

### Coordinateur

- qualifier ;
- orienter ;
- engager ;
- relancer ;
- suivre les blocages.

### Décideur

- arbitrer ;
- valider ;
- consulter les preuves ;
- suivre les engagements critiques.

### Financeur ou partenaire

- consulter les initiatives ;
- analyser les besoins ;
- suivre les résultats ;
- confirmer un appui.

## 28. Composants fonctionnels prioritaires

Pour le pilote :

- carte d'objet ;
- badge de statut ;
- prochaine action ;
- chronologie ;
- carte territoire ;
- formulaire progressif ;
- ajout de preuve ;
- assignation ;
- engagement ;
- décision ;
- validation ;
- notification ;
- indicateur de synchronisation ;
- état vide ;
- message d'erreur ;
- historique minimal.

## 29. États obligatoires

Chaque composant doit prévoir :

- chargement ;
- succès ;
- vide ;
- erreur ;
- hors ligne ;
- accès refusé ;
- donnée expirée ;
- action déjà réalisée ;
- conflit.

## 30. États vides

Un état vide doit :

- expliquer l'absence de contenu ;
- proposer une action pertinente ;
- éviter les formulations négatives ;
- guider le premier usage.

Exemple :

```text
Aucun engagement en cours
Les engagements acceptés apparaîtront ici.
```

## 31. Densité d'information

Trois niveaux de densité sont recommandés :

- essentiel pour le terrain ;
- opérationnel pour les coordinateurs ;
- analytique pour les décideurs.

Le même objet peut disposer de vues adaptées sans modifier sa source de vérité.

## 32. Anti-patterns

Mbàmbulaan doit éviter :

- le dashboard rempli de graphiques sans action ;
- le menu trop profond ;
- le tableau comme interface par défaut ;
- les formulaires exhaustifs dès le départ ;
- les statuts incompréhensibles ;
- les notifications génériques ;
- les actions cachées ;
- les décisions sans justification ;
- les scores opaques ;
- l'imitation d'un ERP classique.

## 33. Critères d'évaluation d'un écran

Avant validation, vérifier :

- quelle décision ou action améliore-t-il ?
- qui l'utilise ?
- à quelle fréquence ?
- quelles informations sont réellement nécessaires ?
- la prochaine action est-elle claire ?
- les responsabilités sont-elles visibles ?
- l'écran fonctionne-t-il sur mobile ?
- fonctionne-t-il avec une connexion faible ?
- le langage est-il compréhensible ?
- les états d'erreur sont-ils prévus ?
- la confiance est-elle explicite ?

## 34. Principe directeur

> Le Design System fonctionnel de Mbàmbulaan doit rendre la coordination visible, l'action évidente et la confiance explicite, sans transformer l'expérience en outil administratif complexe.
