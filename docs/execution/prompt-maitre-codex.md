# Prompt maître Codex — Exécution continue du produit Mbàmbulaan

## 1. Rôle

Tu es l’agent d’exécution technique principal de Mbàmbulaan.

Ta mission n’est pas de redéfinir la stratégie produit, de refaire un audit général ou de proposer un nouveau MVP.

Ta mission est de transformer le dépôt existant en une première tranche verticale complète, cohérente, visible, testable et déployable du produit Mbàmbulaan.

Tu dois travailler en autonomie continue jusqu’à livraison complète, tant que tu restes dans le cadre fixé.

---

# 2. Référentiel obligatoire

Lis d’abord, dans cet ordre :

1. `docs/execution/source-de-verite-produit-codex.md`
2. `docs/execution/readiness-codex-produit.md`
3. Issue #42
4. `docs/blueprint-produit-1.2/04-specifications-fonctionnelles-flux-pilote.md` ou son équivalent réel dans le dépôt
5. les documents de parcours acteurs et wireframes fonctionnels
6. le MVP détaillé
7. l’architecture et le modèle de domaine

En cas de contradiction, `source-de-verite-produit-codex.md` prévaut.

Le code existant n’est pas la source de vérité produit. Il est une base technique à réutiliser lorsqu’il sert la cible.

---

# 3. Objectif produit unique

Construire et livrer un parcours complet de coordination autour du scénario suivant :

> Une machine à glace tombe en panne sur un site de débarquement. Un acteur terrain remonte la difficulté. Un coordinateur la comprend, la qualifie, désigne un responsable, organise l’intervention, suit l’avancement et constate le résultat. Un décideur voit ce qui a réellement été résolu.

Le produit doit rendre visible la chaîne suivante :

1. J’ai un problème
2. Quelqu’un le prend en charge
3. On organise la réponse
4. Je vois où cela en est
5. Je constate que c’est réglé

---

# 4. Périmètre fonctionnel obligatoire

## Acteur terrain

Doit pouvoir :

- remonter une difficulté ;
- recevoir une confirmation ;
- suivre sa situation ;
- comprendre le statut ;
- voir qui s’en occupe ;
- voir la prochaine étape ;
- consulter le résultat final.

## Coordinateur

Doit pouvoir :

- voir les situations prioritaires ;
- ouvrir une situation ;
- comprendre et qualifier ;
- désigner un responsable ;
- planifier une intervention ;
- suivre les délais ;
- signaler ou voir les blocages ;
- constater le résultat ;
- clôturer.

## Responsable opérationnel

Doit pouvoir :

- voir les interventions affectées ;
- démarrer l’intervention ;
- signaler un blocage ;
- renseigner un motif ;
- ajouter une confirmation d’intervention ;
- déclarer la fin.

## Décideur / Ministère

Doit pouvoir :

- voir les situations critiques ;
- voir les situations en retard ;
- voir les situations réglées ;
- comprendre les délais ;
- voir les responsables ;
- consulter les éléments de confirmation ;
- ouvrir le détail d’une situation.

---

# 5. Statuts obligatoires

Utiliser exactement les statuts utilisateurs suivants :

1. Reçu
2. En cours d’examen
3. Pris en charge
4. Intervention prévue
5. Intervention en cours
6. En attente
7. Réglé

Ne pas afficher d’autres statuts principaux sans nécessité technique forte.

---

# 6. Vocabulaire obligatoire

Utiliser :

- Remonter une difficulté
- Comprendre la situation
- Désigner un responsable
- Organiser l’intervention
- Suivre l’avancement
- Constater le résultat
- Voir ce qui a été fait
- Confirmation d’intervention
- Élément de confirmation

Éviter dans l’interface :

- workflow
- ticket
- case
- incident management
- preuve
- marketplace
- matching

---

# 7. Hors périmètre strict

Ne pas développer dans cette exécution :

- marketplace ;
- arrivages ;
- offres et demandes commerciales ;
- matching ;
- réservation ;
- paiement ;
- transaction ;
- scoring ;
- assurance ;
- financement ;
- logistique avancée ;
- chat complet ;
- IA décisionnelle ;
- multi-filières ;
- déploiement national ;
- refonte générale de tous les espaces publics.

Si des éléments existants relèvent de ces périmètres, les isoler de la navigation principale. Ne pas les supprimer si cela crée un risque technique inutile.

---

# 8. Méthode d’exécution

## Étape 1 — Audit technique court et immédiat

Inspecte le dépôt et identifie :

- stack ;
- architecture ;
- routes ;
- composants réutilisables ;
- état de la donnée ;
- mocks ;
- tests ;
- CI ;
- dette bloquante ;
- parcours contradictoires ;
- fonctions marketplace à isoler.

Produis un résumé bref dans un fichier de travail ou dans la PR.

Ne t’arrête pas après cet audit.

Enchaîne immédiatement sur le développement.

## Étape 2 — Plan d’implémentation

Établis un plan court par incréments visibles.

Le plan doit privilégier :

- réutilisation ;
- cohérence ;
- verticalité ;
- démonstrabilité ;
- risque minimal.

## Étape 3 — Développement continu

Implémente successivement :

1. navigation cohérente ;
2. parcours acteur terrain ;
3. parcours coordinateur ;
4. parcours responsable ;
5. vue décideur ;
6. données de démonstration ;
7. historique et règles métier ;
8. responsive ;
9. tests ;
10. captures et documentation de livraison.

N’attends pas de validation intermédiaire pour les choix réversibles.

## Étape 4 — Corrections

Exécute :

- lint ;
- typecheck ;
- tests ;
- build ;
- vérification des routes ;
- vérification responsive ;
- vérification console ;
- vérification des données de démonstration.

Corrige jusqu’à obtention d’un résultat propre.

---

# 9. Règles métier obligatoires

1. Une situation non réglée doit toujours afficher une prochaine étape.
2. Une situation `Pris en charge` doit avoir un responsable.
3. Une situation `Intervention prévue` doit avoir une échéance.
4. Une situation `En attente` doit avoir un motif.
5. Une situation `Réglé` doit avoir une note de résultat, une date de fin et un élément de confirmation ou une justification explicite.
6. Chaque changement important doit apparaître dans un historique lisible.
7. L’acteur terrain ne voit que l’information utile.
8. Le décideur est principalement en lecture et pilotage.

---

# 10. Données de démonstration obligatoires

Créer un jeu de données déterministe.

## Site principal

`Quai de débarquement de Mbao`

## Situation principale

Titre : `Machine à glace en panne`

Description :

`La machine à glace ne produit plus depuis ce matin. Les pêcheurs et mareyeurs risquent de ne pas pouvoir conserver les produits débarqués.`

Urgence : `Élevée`

Coordinateur :

`Awa Diop — Coordination locale`

Responsable :

`Mamadou Ndiaye — Maintenance Froid`

Décideur :

`Direction de la pêche artisanale`

## Chronologie

1. 08:10 — difficulté remontée
2. 08:18 — situation reçue
3. 08:35 — examen commencé
4. 09:00 — responsable désigné
5. 09:20 — intervention prévue à 11:00
6. 11:15 — intervention en cours
7. 11:45 — attente d’une pièce
8. 14:30 — pièce reçue et intervention reprise
9. 15:40 — machine remise en service
10. 16:00 — résultat confirmé et situation réglée

Créer aussi au moins une situation par statut pour éviter les écrans vides.

---

# 11. UX attendue

## Terrain

- mobile-first ;
- formulaire court ;
- retour immédiat ;
- statut lisible ;
- prochaine étape visible ;
- langage concret.

## Coordinateur

- vue priorisée ;
- actions principales visibles ;
- retards et attentes identifiables ;
- aucune surcharge inutile.

## Responsable

- interventions affectées ;
- actions simples ;
- saisie minimale ;
- confirmation facile.

## Décideur

- lecture rapide ;
- indicateurs utiles ;
- accès au détail ;
- visibilité sur ce qui est réellement réglé.

---

# 12. Critères d’acceptation

## Fonctionnels

Le scénario complet doit être jouable de bout en bout.

L’acteur terrain doit pouvoir créer et suivre une situation.

Le coordinateur doit pouvoir qualifier, affecter, planifier, suivre et clôturer.

Le responsable doit pouvoir démarrer, bloquer, confirmer et terminer.

Le décideur doit pouvoir comprendre les résultats.

## UX

- aucun lien mort ;
- aucune page principale vide ;
- aucune incohérence de navigation ;
- aucune terminologie marketplace dans le parcours principal ;
- responsive desktop et mobile ;
- feedback après chaque action ;
- prochaine étape visible.

## Technique

- installation reproductible ;
- lint propre ;
- typecheck propre ;
- tests au vert ;
- build réussi ;
- aucune erreur console critique ;
- données déterministes ;
- documentation minimale de lancement.

---

# 13. Branche et commits

Crée une branche dédiée à partir de la branche de travail actuelle.

Nom recommandé :

`feat/parcours-coordination-machine-glace`

Fais des commits cohérents par incrément.

Exemples :

- `feat: recentrer la navigation sur la coordination`
- `feat: ajouter le parcours terrain de remontée`
- `feat: ajouter le pilotage coordinateur`
- `feat: ajouter le suivi responsable`
- `feat: ajouter la vue décideur`
- `test: couvrir le scénario machine à glace`
- `docs: ajouter les instructions de démonstration`

---

# 14. Livrables finaux obligatoires

À la fin, fournir :

1. branche ;
2. PR ;
3. résumé des changements ;
4. routes de démonstration ;
5. comptes ou modes d’accès de démonstration si nécessaires ;
6. commandes de lancement ;
7. commandes de test ;
8. résultats lint / typecheck / tests / build ;
9. captures desktop ;
10. captures mobile ;
11. liste des écarts résiduels ;
12. risques techniques ;
13. recommandations pour le prochain incrément.

---

# 15. Conditions d’arrêt

Tu ne dois t’arrêter et demander une décision que si :

- un choix implique une suppression irréversible de données ;
- un changement d’architecture majeur est indispensable ;
- un secret ou accès externe manque ;
- une contrainte légale ou sécurité empêche l’exécution ;
- deux exigences prioritaires sont réellement incompatibles ;
- la branche de référence est ambiguë ou inaccessible.

Pour tout choix réversible, prends la décision la plus simple, cohérente et conforme à la source de vérité.

---

# 16. Interdictions

Ne pas :

- créer un nouveau blueprint ;
- redéfinir le positionnement ;
- élargir le produit ;
- faire de Codex le product manager ;
- privilégier une refonte totale sans nécessité ;
- multiplier les composants génériques sans usage visible ;
- livrer uniquement du code sans démonstration ;
- t’arrêter après l’audit ;
- demander une validation pour chaque étape.

---

# 17. Définition de réussite

La mission est réussie lorsqu’une personne peut ouvrir le produit, jouer le scénario de la machine à glace de bout en bout, comprendre chaque responsabilité, suivre l’avancement et voir le résultat final sans explication orale supplémentaire.

Le produit livré doit faire comprendre immédiatement que Mbàmbulaan est une infrastructure de coordination.
