# Mbàmbulaan Public — Spécification de refondation visuelle

> **Statut : FIGÉ pour la prochaine itération Public**
>
> Ce document ne remplace pas `docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`.
>
> Le `MASTER_SPEC` reste la source de vérité métier, fonctionnelle et d’architecture.
>
> Le présent document traite uniquement de **la manière de présenter le Public** : direction visuelle, hiérarchie, longueur des pages, profondeur des contenus, destinations des clics et niveau de finition attendu.
>
> **Décision CEO : la structure fonctionnelle actuelle du Public est globalement validée. La présentation visuelle actuelle est rejetée.**
>
> La prochaine itération ne doit donc pas rouvrir le cadrage métier. Elle doit rendre l’expérience réellement publiable.

---

# 1. Ordre d’exécution

La priorité immédiate reste **Mbàmbulaan Produit**.

Claude ne doit pas relancer une refonte du Public tant que le prochain jalon Produit demandé par le CEO n’est pas terminé ou explicitement mis en pause.

Lorsque le CEO autorise le retour sur le Public :

1. lire intégralement `MBAMBULAAN_PUBLIC_MASTER_SPEC.md` ;
2. lire intégralement ce document ;
3. considérer le design actuel comme non validé ;
4. conserver les moteurs fonctionnels utiles déjà construits ;
5. reconstruire la présentation sans reprendre la grammaire visuelle actuelle par confort.

---

# 2. Diagnostic à prendre comme point de départ

Le problème principal n’est pas le découpage du Public.

Le découpage suivant est confirmé :

- Landing ;
- Découvrir ;
- contenus éditoriaux ;
- Atlas / Territoires ;
- fiches territoire ;
- Opportunités ;
- fiches opportunité ;
- Mbàmbulaan ;
- Trouver une solution ;
- Contact ;
- accès professionnel discret.

Le problème est **la manière dont ces expériences sont aujourd’hui présentées**.

La version actuelle donne trop souvent l’impression :

`grand hero → titre → grille de cartes → autre grille → CTA → autre bloc`

Elle est cohérente techniquement mais paraît :

- trop longue ;
- trop répétitive ;
- trop composée de blocs équivalents ;
- trop proche d’un projet étudiant ou d’un template assemblé ;
- insuffisamment éditoriale ;
- insuffisamment visuelle ;
- insuffisamment territoriale ;
- pas assez évidente lorsqu’on clique ;
- pas encore prête pour une mise en production crédible.

La prochaine itération ne doit pas être un simple changement de couleurs ou de bordures.

**Il faut changer la grammaire de mise en page.**

---

# 3. Règle fondamentale de la nouvelle présentation

Le Public doit donner cette sensation :

**Je découvre → je comprends → je vois un territoire / un sujet / une opportunité → je sais où cliquer → j’arrive sur une vraie page → je peux agir.**

Jamais :

**Je vois une série de blocs → je clique sans savoir ce qui va s’ouvrir → j’arrive sur une page générique ou un filtre.**

Chaque élément cliquable doit avoir :

- une destination réelle ;
- un libellé explicite ;
- une page existante ;
- un contenu suffisant ;
- un retour clair vers l’univers d’origine ;
- un CTA contextuel lorsque pertinent.

Aucun bloc décoratif ne doit sembler cliquable.

Aucun lien ne doit servir uniquement à modifier silencieusement un paramètre sans que le visiteur comprenne ce qui se passe.

---

# 4. Landing — cible production

## 4.1 Longueur

La landing actuelle est trop longue.

Cible : **5 à 6 grandes séquences maximum, hors header et footer.**

Elle doit pouvoir être comprise rapidement sans demander au visiteur de traverser un dossier institutionnel complet.

Les statistiques macro-économiques détaillées et la chaîne de valeur complète doivent vivre prioritairement dans `Découvrir`, pas occuper une place disproportionnée sur l’accueil.

## 4.2 Structure cible

### Séquence 1 — Hero

Objectif : comprendre Mbàmbulaan en moins de 10 secondes.

Doit contenir :

- promesse principale ;
- une phrase d’explication maximum ;
- CTA principal `Trouver une solution` ;
- CTA secondaire `Ouvrir l’Atlas` ;
- une photographie documentaire forte.

Pas de statistiques, pas de longues preuves, pas de multiples sous-messages dans le hero.

### Séquence 2 — Que cherchez-vous à faire ?

Faire apparaître immédiatement les besoins concrets :

- transporter ;
- conserver / froid ;
- transformer ;
- s’équiper / réparer ;
- trouver un débouché ;
- développer un programme ;
- comprendre un territoire ;
- autre.

Cette entrée doit ressembler à un **moteur de besoin**, pas à une grille marketing de fonctionnalités.

Chaque choix doit mener à `Trouver une solution` avec le contexte prérempli.

### Séquence 3 — À découvrir maintenant

3 contenus éditoriaux maximum, réellement cliquables.

Hiérarchie :

- 1 contenu principal fortement visuel ;
- 2 contenus secondaires.

Pas six cartes équivalentes.

Chaque contenu doit mener à une vraie URL `/decouvrir/[slug]`.

### Séquence 4 — Atlas / territoires

Un aperçu visuel fort de l’Atlas.

Objectif : donner envie d’explorer le littoral.

Ne pas reproduire une simple carte dans une carte.

Montrer :

- une portion de carte / littoral ;
- quelques territoires ;
- une fiche territoire mise en avant ;
- CTA `Explorer les territoires`.

### Séquence 5 — Opportunités

3 opportunités maximum.

Elles doivent être lisibles immédiatement :

- type ;
- titre ;
- territoire ;
- échéance ;
- organisateur ;
- statut ;
- action possible.

Pas de faux contenu présenté comme réel.

### Séquence 6 — Mbàmbulaan / confiance / action finale

Une seule section concise expliquant :

**terrain + réseau + technologie**

et ce que Mbàmbulaan fait concrètement :

**comprendre → trouver les bons acteurs → organiser la réponse → suivre le résultat.**

CTA final : `Parler à Mbàmbulaan` ou `Trouver une solution` selon la mise en page.

---

# 5. Découvrir — ne plus ressembler à une taxonomie

`/decouvrir` ne doit pas afficher onze domaines comme onze blocs égaux occupant l’essentiel de la page.

La taxonomie reste nécessaire en arrière-plan, mais l’expérience doit ressembler à **un média métier premium**, pas à un catalogue de catégories.

Structure recommandée :

1. hero éditorial court ;
2. grand contenu à la une ;
3. sélection de contenus récents / utiles ;
4. navigation par thèmes plus discrète ;
5. exploration par chaîne de valeur ;
6. lien vers territoires et opportunités.

Les domaines peuvent être présentés sous forme :

- filtres ;
- menu éditorial ;
- navigation horizontale ;
- liste structurée ;
- sous-navigation.

Éviter une grille de 11 cartes identiques.

---

# 6. Pages de contenu — obligation de profondeur

Tout contenu visible sur la landing ou `/decouvrir` doit mener à une vraie page :

`/decouvrir/[slug]`

Créer un modèle éditorial générique réutilisable.

## 6.1 Composition minimale d’une page contenu

- fil d’Ariane ou retour clair ;
- type de contenu ;
- titre ;
- chapô ;
- territoire / thème ;
- date ;
- source / niveau de vérification ;
- image de couverture ;
- corps de contenu structuré ;
- intertitres ;
- encadré ou donnée utile si pertinent ;
- contenus reliés ;
- territoire relié ;
- CTA contextuel.

Exemples de CTA :

- sujet froid → `Trouver une solution de froid` ;
- sujet transport → `Organiser un transport` ;
- sujet financement → `Être accompagné` ;
- sujet territoire → `Explorer ce territoire`.

## 6.2 Visuels

Il n’est pas nécessaire de produire immédiatement une photographie unique pour chaque article.

Prévoir un composant de couverture générique avec :

- image spécifique si disponible ;
- sinon image de catégorie cohérente ;
- traitement commun ;
- ratio constant ;
- alt text ;
- aucune fausse preuve terrain.

Une série de 8 à 12 visuels de catégories bien construits vaut mieux que 30 images incohérentes.

---

# 7. Atlas — map-first

L’Atlas ne doit plus ressembler à une page marketing contenant une carte.

Il doit donner l’impression d’entrer dans **une expérience territoriale**.

## 7.1 Structure cible

- header Public compact ;
- introduction courte ;
- carte dominante occupant l’essentiel du premier écran utile ;
- recherche territoire / quai / activité ;
- liste / résultats à gauche sur desktop ou panneau inférieur sur mobile ;
- fiche territoire contextuelle ;
- navigation naturelle vers `/atlas/[slug]`.

Le hero, s’il existe, doit rester court et ne pas repousser la carte sous la ligne de flottaison.

## 7.2 Fiche territoire

Chaque territoire important doit disposer d’une vraie page :

`/atlas/[slug]`

Elle doit contenir :

- photographie ou visuel territorial ;
- localisation ;
- description ;
- activités ;
- services / infrastructures documentés ;
- espèces / saisonnalité si fiables ;
- niveau de documentation ;
- source et mise à jour ;
- contenus liés ;
- opportunités liées ;
- CTA `Trouver une solution sur ce territoire` ;
- CTA `Proposer une correction`.

Pas de métriques opérationnelles privées.

---

# 8. Opportunités — rendre chaque opportunité crédible

`/opportunites` doit ressembler à un service utile, pas à une grille de cartes de démonstration.

Priorité : vraies opportunités publiques vérifiées lorsque disponibles.

Une carte doit afficher clairement :

- type ;
- titre ;
- organisateur ;
- territoire ;
- public concerné ;
- échéance ;
- statut ;
- niveau d’implication Mbàmbulaan.

Chaque carte mène à :

`/opportunites/[slug]`

La page détail doit inclure :

- résumé ;
- informations essentielles ;
- source ;
- lien externe officiel lorsque pertinent ;
- ce que fait Mbàmbulaan ;
- CTA `Je suis intéressé` uniquement lorsque cela a du sens.

Les opportunités `DEMO` peuvent exister en environnement de démonstration, mais une page de production ne doit pas être dominée par un mur d’opportunités fictives.

---

# 9. Page Mbàmbulaan — parler aux visiteurs, pas raconter notre roadmap

La page `/mbambulaan` doit expliquer :

- qui nous sommes ;
- pourquoi Mbàmbulaan existe ;
- notre présence terrain ;
- notre réseau ;
- notre technologie ;
- comment nous intervenons ;
- avec qui nous pouvons travailler ;
- comment nous contacter.

À retirer du contenu visible :

- stratégie interne de monétisation ;
- formulation du type « générer un revenu avant le Produit » ;
- roadmap interne ;
- comparaison détaillée « aujourd’hui / futur Produit » ;
- jargon de gestion de produit.

Le visiteur doit comprendre :

**Mbàmbulaan comprend le besoin, identifie les acteurs utiles, organise la réponse et suit ce qui a été réalisé.**

Une photographie générée ou illustrative ne doit jamais être présentée comme une preuve réelle de présence terrain.

---

# 10. Trouver une solution — plus service, moins page marketing

Le moteur est une capability centrale et peut conserver sa logique fonctionnelle actuelle si elle est conforme.

La présentation doit cependant être plus directe :

- header compact ;
- titre simple ;
- progression visible ;
- une question à la fois ;
- langage métier ;
- peu de décoration ;
- possibilité d’être rappelé ;
- confirmation claire ;
- référence de demande ;
- explication de la prochaine étape.

Éviter un grand hero institutionnel avant un formulaire que le visiteur veut simplement remplir.

---

# 11. Contact — routeur simple

Le principe du routeur d’intention est confirmé.

La présentation ne doit pas forcément être une grille de six cartes identiques.

Possibilités :

- liste structurée ;
- grandes entrées verticales ;
- choix progressif ;
- deux colonnes ;
- navigation conversationnelle légère.

Objectif : trouver la bonne entrée en moins de 10 secondes.

Règle de production :

- aucun faux numéro ;
- aucun faux email ;
- aucun canal cliquable non opérationnel ;
- coordonnées centralisées en configuration ;
- masquer un canal tant qu’il n’est pas réellement activé.

---

# 12. Grammaire visuelle attendue

## 12.1 Ce qu’il faut éviter

- « card soup » : dizaines de rectangles arrondis équivalents ;
- répétition du même hero sur toutes les pages ;
- mêmes grilles sur toutes les pages ;
- pictogrammes génériques partout ;
- numérotation décorative de toutes les sections ;
- grandes vagues / séparateurs répétés entre chaque bloc ;
- effets de template ;
- trop de texte centré ;
- pages secondaires visuellement moins finies que la landing ;
- utilisation systématique de fonds sombres pour créer artificiellement du contraste.

## 12.2 Ce qu’il faut rechercher

- forte hiérarchie typographique ;
- beaucoup d’espace utile ;
- photos documentaires ;
- grandes compositions éditoriales ;
- asymétrie maîtrisée ;
- alternance image / texte / liste / carte / carte géographique ;
- détails fins plutôt que gros effets ;
- couleurs naturelles et profondes ;
- CTA évidents mais non agressifs ;
- densité adaptée à chaque page ;
- cohérence forte sans uniformité.

## 12.3 Système visuel

Le design doit être réinventé, mais garder une identité Mbàmbulaan cohérente autour de :

- bleu-vert profond ;
- turquoise comme accent d’action ;
- tons ivoire / minéraux / sable sobres ;
- photographie humaine ;
- typographie premium et très lisible ;
- détails inspirés du littoral sans folklore.

Le choix précis des fontes, rayons, ombres, espacements et composants est libre.

Ce document ne demande pas de reproduire le design actuel.

---

# 13. Images et composants génériques

Créer des composants réutilisables pour éviter les pages vides :

- `EditorialHero` ;
- `ContentCover` ;
- `TerritoryHero` ;
- `OpportunityHeader` ;
- `RelatedContent` ;
- `ContextualAction` ;
- `SourceBlock`.

Ces noms sont indicatifs : Claude peut les renommer.

Principe :

**une structure générique solide + des contenus et visuels propres à chaque page.**

Pour les visuels :

- une image de couverture par grande page ;
- visuels par grandes catégories de contenus ;
- photos territoire lorsque disponibles ;
- fallback visuel cohérent ;
- aucun faux témoignage visuel ;
- aucune image générée présentée comme une preuve terrain réelle.

---

# 14. Navigation et destinations — règle zéro ambiguïté

Avant livraison, produire un inventaire :

| Point de départ | Élément cliquable | Destination | Page existe ? | Contexte conservé ? |
|---|---|---|---|---|

Tous les éléments doivent être vérifiés.

Exigences :

- aucun lien mort ;
- aucun clic ambigu ;
- aucune carte cliquable vers une page sans contenu ;
- aucune catégorie qui donne l’impression d’ouvrir une page mais ne fait qu’ajouter un paramètre invisible ;
- breadcrumb ou retour clair sur les pages détail ;
- liens internes cohérents entre contenu, territoire, opportunité et action.

---

# 15. Production readiness visuelle

La prochaine itération Public n’est pas considérée acceptable tant que les pages suivantes n’ont pas été vérifiées visuellement :

- `/` ;
- `/decouvrir` ;
- au moins 3 `/decouvrir/[slug]` ;
- `/atlas` ;
- au moins 3 `/atlas/[slug]` ;
- `/opportunites` ;
- au moins 2 `/opportunites/[slug]` ;
- `/mbambulaan` ;
- `/solutions` ;
- `/contact`.

Recette obligatoire :

- desktop large ;
- laptop ;
- mobile 390px ;
- aucun débordement ;
- aucun texte coupé ;
- aucune image mal cadrée ;
- aucune page vide ;
- aucun CTA cassé ;
- header / footer cohérents ;
- pages détail au même niveau de finition que l’accueil.

---

# 16. Critères CEO — « acceptable à la prochaine itération »

La prochaine version est acceptable uniquement si :

1. la landing est courte et ressemble à un vrai site en production ;
2. le visiteur comprend Mbàmbulaan en quelques secondes ;
3. `Trouver une solution` est visible sans dominer tout le site ;
4. chaque contenu cliquable mène à une vraie page éditoriale ;
5. les fiches territoire sont de vraies pages ;
6. les opportunités ont de vraies pages de détail ;
7. l’Atlas ressemble à une expérience territoriale, pas à un widget ;
8. la page Mbàmbulaan ne montre plus notre cuisine interne ;
9. les pages ne sont plus une succession de cartes identiques ;
10. l’imagerie apporte de la profondeur et de la crédibilité ;
11. les pages secondaires sont aussi soignées que la landing ;
12. le mobile est réellement utilisable ;
13. aucun faux contact ou faux canal n’est exposé ;
14. aucun contenu fictif n’est présenté comme réel ;
15. le site donne envie de continuer à explorer ou de contacter Mbàmbulaan.

---

# 17. Ce qui est conservable de la version actuelle

Sous réserve de vérification :

- navigation canonique ;
- logique `Trouver une solution` ;
- persistance des demandes ;
- routeur Contact ;
- structure des contenus ;
- routes détail ;
- séparation Atlas public / Produit ;
- modèle de données éditorial public ;
- SEO / sitemap / metadata ;
- analytics ;
- règles de confidentialité ;
- sources / niveaux de vérification ;
- données de démonstration identifiées.

Ces éléments sont des fondations fonctionnelles.

**Ils ne constituent pas une validation du design actuel.**

---

# 18. Instruction finale à Claude

Lorsque le CEO autorise la prochaine itération Public :

> Ne recadre pas le produit. Ne réécris pas le `MASTER_SPEC`. La structure métier et les expériences publiques sont validées.
>
> Ta mission est de transformer ces fondations en une expérience visuelle réellement publiable.
>
> Commence par proposer la nouvelle grammaire visuelle et les wireframes de structure des 10 expériences à recetter. Ensuite seulement, implémente.
>
> Ne fais pas une nouvelle passe de « polish » sur le design existant. Recompose les pages.
>
> La landing doit être raccourcie à 5–6 séquences maximum.
>
> Chaque clic doit avoir une destination réelle et une page suffisamment construite.
>
> Les pages détail doivent devenir des expériences de contenu à part entière.
>
> L’Atlas doit être map-first.
>
> Le design ne doit plus ressembler à un projet étudiant ou à une collection de cartes issues d’un template.
>
> Conserve les moteurs fonctionnels conformes. Rejette la présentation actuelle lorsqu’elle nuit à la qualité.
>
> Avant de déclarer la livraison terminée, effectue une recette visuelle desktop et mobile de toutes les routes indiquées dans la section 15 et fournis les captures.
