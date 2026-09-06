# Mbàmbulaan Public — Brief de refondation UX/UI

> **Statut : CADRAGE DE LA PROCHAINE ITÉRATION PUBLIC**
>
> Ce document ne remplace pas `docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`.
>
> Le `MASTER_SPEC` reste la source de vérité métier et fonctionnelle. Ce brief précise uniquement **comment le Public doit être présenté, ressenti et parcouru** lors de la prochaine refondation UX/UI.
>
> La structure fonctionnelle déjà validée est conservée. Le problème actuel n’est pas le découpage du Public mais sa mise en scène, sa longueur, son manque de hiérarchie visuelle et le caractère trop répétitif / scolaire du rendu.
>
> **Priorité de séquencement : Mbàmbulaan Produit d’abord. Ce chantier Public vient ensuite.**

---

## 1. Ce qui est figé et ne doit pas être rediscuté

Le Public conserve les expériences principales suivantes :

- Landing `/`
- Découvrir `/decouvrir`
- contenus `/decouvrir/[slug]`
- Atlas / Territoires `/atlas`
- fiches territoire `/atlas/[slug]`
- Opportunités `/opportunites`
- détails opportunité `/opportunites/[slug]`
- Mbàmbulaan `/mbambulaan`
- Contact `/contact`
- capacité transverse **Trouver une solution**
- accès professionnel discret

La navigation reste :

**Découvrir | Territoires | Opportunités | Mbàmbulaan | Trouver une solution | Ouvrir l’Atlas**

Le prochain travail ne doit donc pas réinventer le périmètre. Il doit rendre cette architecture **désirable, claire et crédible en production**.

---

## 2. Diagnostic du rendu actuel

Le site actuel est structurellement plus proche du cadrage, mais le rendu reste insuffisant pour une mise en production.

Les principaux défauts à corriger :

- landing trop longue ;
- trop de sections de poids visuel équivalent ;
- répétition de grilles de cartes ;
- pages qui donnent une sensation de prototype ou de projet étudiant ;
- hiérarchie visuelle faible entre ce qui est essentiel et secondaire ;
- trop d’informations expliquées avant de proposer une action ;
- destinations de certains blocs pas assez évidentes ;
- manque de vraies pages de contenu suffisamment riches derrière les blocs ;
- manque de respiration et d’éditorialisation ;
- identité visuelle pas assez distinctive ;
- iconographie trop présente par rapport à la photographie et au contenu ;
- Atlas trop traité comme un composant dans une page, pas comme une expérience majeure ;
- opportunités trop proches d’une grille de démonstration ;
- page Mbàmbulaan trop proche d’une présentation interne de stratégie ;
- trop de formes arrondies, cartes et blocs homogènes ;
- design trop “template” malgré un système visuel cohérent.

Le prochain rendu doit être jugé comme un **site pouvant réellement être mis en production**, pas comme une maquette fonctionnelle.

---

## 3. Règle UX principale

Le Public doit faire vivre ce parcours :

**Je comprends rapidement → je découvre quelque chose qui me concerne → j’explore → j’agis → Mbàmbulaan prend le relais.**

Le site ne doit plus donner la sensation :

**je lis une présentation → je lis une autre présentation → je vois des cartes → je lis encore.**

Règle :

> **Moins de blocs, plus de hiérarchie. Moins de cartes, plus d’expériences. Moins d’explications abstraites, plus d’usages.**

---

# 4. Landing — cible production

## 4.1 Objectif

La landing doit être plus courte, plus directe et plus élégante.

Elle ne doit pas chercher à tout expliquer.

Elle doit répondre en quelques secondes à :

1. Qu’est-ce que Mbàmbulaan ?
2. Pourquoi cela m’intéresse ?
3. Que puis-je faire ici ?
4. Où puis-je explorer davantage ?

## 4.2 Longueur cible

La landing ne doit pas devenir une succession de 10 ou 12 sections.

Cible : **5 à 7 séquences fortes maximum**, hors footer.

## 4.3 Séquences recommandées

### 1 — Hero

- promesse claire ;
- phrase courte ;
- deux actions maximum : **Trouver une solution** / **Ouvrir l’Atlas** ;
- photographie ou composition forte ;
- aucun catalogue de fonctionnalités.

### 2 — Point d’entrée métier

Au lieu d’un simple bouton, montrer immédiatement quelques besoins concrets :

- Transporter / livrer
- Conserver / refroidir
- S’équiper / réparer
- Trouver un débouché
- Déployer un programme
- Comprendre un territoire

Le visiteur doit comprendre que Mbàmbulaan peut l’aider à accomplir quelque chose.

### 3 — Découvrir

Une seule grande mise en avant éditoriale + quelques contenus secondaires.

Éviter une grille de six cartes identiques.

### 4 — Atlas / Territoires

Une séquence visuelle forte avec aperçu de carte, quelques territoires et une vraie envie d’ouvrir l’Atlas.

### 5 — Opportunités

Mettre en avant 2 ou 3 opportunités réellement intéressantes, pas une grille exhaustive.

### 6 — Mbàmbulaan

Expliquer en peu de mots :

**terrain + réseau + connaissance + services + technologie**

et ce que cela permet concrètement.

### 7 — CTA final

Une seule question :

**Vous avez un besoin, une capacité à proposer ou un projet à déployer ?**

Puis orientation claire.

## 4.4 Ce qui doit quitter la landing

Doit être déplacé vers Découvrir ou les pages de contenu :

- statistiques trop détaillées ;
- explication complète de la chaîne de valeur ;
- longue présentation de Mbàmbulaan ;
- listes détaillées de domaines ;
- roadmap ou éléments futurs ;
- répétitions de CTA.

La landing donne envie. Les pages spécialisées expliquent.

---

# 5. Système visuel — nouvelle grammaire

## 5.1 Ne pas refaire un nouveau thème de cartes

Le prochain design ne doit pas être une nouvelle version de :

`hero + cards + cards + CTA`.

Limiter volontairement les cartes.

Utiliser plutôt :

- compositions éditoriales ;
- grandes photographies ;
- image + texte ;
- panneaux territoriaux ;
- listes éditoriales élégantes ;
- blocs asymétriques ;
- grands contenus vedettes ;
- bandeaux de navigation contextuels ;
- typographie forte ;
- espaces blancs ;
- séparations simples ;
- cartes seulement lorsqu’elles sont réellement utiles à la comparaison.

## 5.2 Direction visuelle

Le Public doit paraître :

- premium ;
- éditorial ;
- documentaire ;
- maritime ;
- sénégalais sans folklore ;
- humain ;
- territorial ;
- contemporain ;
- crédible pour une institution et une entreprise ;
- suffisamment chaleureux pour ne pas ressembler à un portail administratif.

Éviter :

- esthétique SaaS ;
- surabondance d’icônes ;
- gradients décoratifs gratuits ;
- chiffres géants partout ;
- bordures et cartes sur chaque information ;
- effets “startup template” ;
- dessins génériques de bateau utilisés comme identité principale.

## 5.3 Photographie

La photographie devient un matériau central de l’identité.

Utiliser :

- quais ;
- gestes métier ;
- transformation ;
- infrastructures ;
- marchés ;
- territoires ;
- acteurs vus en situation.

Les images générées peuvent être utilisées comme **illustrations éditoriales** lorsque nous n’avons pas encore de photographie terrain exploitable.

Elles ne doivent jamais être présentées comme preuve d’une intervention réelle de Mbàmbulaan.

## 5.4 Composant visuel générique autorisé

Il est acceptable de créer un composant générique de couverture pour les pages et contenus, avec :

- image dédiée ;
- catégorie ;
- territoire ;
- titre ;
- source / état de documentation si nécessaire.

L’objectif est d’assurer une qualité homogène lorsqu’un contenu n’a pas encore sa propre mise en page spécifique.

Mais ce composant ne doit pas rendre toutes les pages identiques.

---

# 6. Navigation et destinations — aucune ambiguïté

Chaque bloc cliquable doit faire comprendre **où il mène et pourquoi**.

Pas de carte cliquable sans destination évidente.

Pas de bouton “Explorer” générique si une formulation plus précise existe.

Exemples :

- **Lire le guide**
- **Comprendre la chaîne du froid**
- **Voir Joal dans l’Atlas**
- **Voir cette opportunité**
- **Trouver une solution à Mbour**
- **Proposer mes services**

Chaque contenu, territoire et opportunité doit avoir une vraie page de destination.

---

# 7. Découvrir — devenir un vrai espace éditorial

Découvrir ne doit pas être une grille représentant notre taxonomie interne.

La taxonomie reste utile pour organiser les contenus en arrière-plan.

À l’écran, privilégier :

- un sujet vedette ;
- quelques dossiers / guides ;
- un contenu terrain ;
- des lectures liées à un territoire ;
- les derniers contenus utiles ;
- une navigation secondaire par thèmes si nécessaire.

Un visiteur doit avoir l’impression d’entrer dans un **média métier premium**, pas dans une base documentaire.

Les 11 domaines restent accessibles mais ne doivent pas tous être présentés comme 11 cartes de même importance.

---

# 8. Pages de contenu — obligatoires et riches

Les cartes éditoriales ne sont que des portes d’entrée.

Chaque contenu `/decouvrir/[slug]` doit devenir une vraie page :

- couverture visuelle ;
- catégorie ;
- titre ;
- introduction ;
- corps structuré ;
- photos / schémas si utiles ;
- territoire concerné ;
- source ;
- date / fraîcheur ;
- contenus liés ;
- CTA métier contextuel ;
- lien Atlas lorsque pertinent.

Le site doit pouvoir publier de vrais dossiers, guides, portraits et analyses sans recréer la page à chaque fois.

Créer un **template éditorial premium réutilisable**.

---

# 9. Atlas — expérience majeure

L’Atlas ne doit plus paraître comme un widget inséré sous un hero classique.

Il doit donner immédiatement la sensation d’explorer le littoral.

Cible :

- carte dominante ;
- recherche visible ;
- sélection territoire / quai ;
- panneau de détail ;
- photo du territoire si disponible ;
- activités ;
- services documentés ;
- contenus ;
- opportunités ;
- source / niveau de documentation ;
- CTA contextuel.

Sur desktop : expérience large, presque plein écran.

Sur mobile : carte ou recherche + panneau déroulant simple.

Les fiches `/atlas/[slug]` doivent être de vraies pages territoriales, utiles indépendamment de la carte.

---

# 10. Opportunités — crédibilité avant volume

Ne pas chercher à remplir la page avec des dizaines de démonstrations.

À terme, privilégier de vraies opportunités publiques et vérifiables.

Chaque opportunité doit avoir sa page :

- organisateur ;
- source ;
- public concerné ;
- territoire ;
- échéance ;
- description ;
- conditions ;
- rôle de Mbàmbulaan ;
- CTA adapté.

La page liste doit favoriser :

- une ou deux opportunités mises en avant ;
- filtres sobres ;
- liste claire ;
- signaux de confiance.

Pas de “Démonstration” répété sur chaque carte en environnement destiné à une présentation institutionnelle. Les données de démo restent identifiables, mais de manière plus élégante et contextualisée.

---

# 11. Page Mbàmbulaan — parler au marché, pas à nous-mêmes

Cette page doit répondre à :

- qui sommes-nous ?
- comment travaillons-nous ?
- pourquoi le terrain compte ?
- pourquoi notre réseau compte ?
- que peut-on nous confier ?
- comment travailler avec nous ?

À supprimer du visible public :

- notre roadmap interne ;
- “avant le lancement du Produit” ;
- stratégie de monétisation interne ;
- formulation de type “générer du revenu avant…” ;
- comparaison “aujourd’hui / future application” trop explicite.

Le visiteur doit comprendre notre valeur actuelle, pas notre feuille de route.

---

# 12. Trouver une solution — moteur visible dans tout le site

La fonctionnalité actuelle peut être conservée si elle est conforme au `MASTER_SPEC`.

La refondation porte surtout sur sa mise en scène.

Le moteur doit être accessible :

- depuis la landing ;
- un territoire ;
- un contenu ;
- une opportunité ;
- la page Mbàmbulaan ;
- Contact.

Le contexte doit être conservé.

L’utilisateur doit sentir :

> **Je décris ce dont j’ai besoin, Mbàmbulaan comprend le contexte et organise la suite.**

Pas :

> “Je remplis un formulaire.”

---

# 13. Contact — simple et crédible

Contact reste un routeur d’intention.

Mais la page doit être visuellement simple.

Ne pas afficher un faux numéro ou un canal non opérationnel.

Les coordonnées doivent être centralisées et réelles avant production.

---

# 14. Niveau de qualité attendu

Avant validation, vérifier toutes les pages en :

- desktop large ;
- laptop ;
- tablette ;
- mobile 390 px environ.

Critères visuels :

- aucune page ne ressemble à un prototype ;
- aucune page secondaire ne paraît moins finie que la landing ;
- pas de section vide ou artificiellement remplie ;
- pas de bouton mort ;
- pas de destination ambiguë ;
- pas de bloc simplement ajouté pour “remplir” ;
- rythme visuel varié ;
- photographie et contenu correctement hiérarchisés ;
- typographie lisible ;
- responsive réellement pensé ;
- performance correcte sur réseau mobile.

---

# 15. Processus obligatoire pour la prochaine itération Claude

**Ne pas démarrer ce chantier avant la priorité Mbàmbulaan Produit décidée par le CEO.**

Lorsque le chantier Public reprend :

1. relire intégralement `MBAMBULAAN_PUBLIC_MASTER_SPEC.md` ;
2. lire ce brief ;
3. conserver l’architecture fonctionnelle validée ;
4. auditer uniquement la présentation actuelle ;
5. proposer avant code :
   - wireframe de la landing ;
   - nouvelle grammaire visuelle ;
   - structure de Découvrir ;
   - structure Atlas ;
   - template contenu ;
   - template opportunité ;
   - structure Mbàmbulaan ;
6. faire valider cette direction par le CEO ;
7. implémenter ensuite ;
8. produire captures desktop + mobile ;
9. faire une recette de tous les liens ;
10. corriger avant de déclarer le Public livré.

---

# 16. Règles de rejet

La prochaine version est refusée si :

- la landing reste très longue ;
- toutes les sections sont des grilles de cartes ;
- les pages se ressemblent toutes ;
- Découvrir ressemble à une taxonomie ;
- l’Atlas reste un petit composant dans une page ;
- les cartes ne mènent pas à de vraies pages ;
- la page Mbàmbulaan expose notre stratégie interne ;
- des coordonnées fictives restent visibles ;
- les images générées sont présentées comme preuves terrain ;
- le rendu ressemble à un template SaaS ou à un projet étudiant ;
- le mobile est seulement une réduction du desktop ;
- des éléments existent sans vraie destination ;
- le `MASTER_SPEC` est contredit pour améliorer l’esthétique.

---

# 17. Résultat recherché

Le visiteur doit quitter le site avec trois idées simples :

1. **Mbàmbulaan connaît les territoires et les métiers.**
2. **Mbàmbulaan peut m’aider à trouver, organiser ou déployer une réponse.**
3. **Je sais exactement où cliquer pour continuer.**

Le Public doit enfin donner l’impression d’une **entreprise réelle, crédible et ambitieuse**, pas d’une démonstration de composants web.
