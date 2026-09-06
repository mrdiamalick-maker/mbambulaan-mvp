# Mbàmbulaan Public V2 — Brief de refonte UX/UI

> **Statut : CADRAGE D’EXÉCUTION — À UTILISER APRÈS LA PRIORITÉ MBÀMBULAAN PRODUIT**
>
> La structure métier et les grandes rubriques définies dans `docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md` restent valides.
>
> Ce brief ne remet pas en cause le découpage du Public. Il cadre **la manière de le présenter, de le rendre navigable, crédible et publiable**.
>
> La version visuelle actuellement codée sur `codex/xxl-premium` n’est **pas validée**. Elle ne doit pas servir de référence esthétique.

---

# 1. Décision CEO

Nous conservons :

- la navigation principale ;
- les expériences `Découvrir`, `Territoires / Atlas`, `Opportunités`, `Mbàmbulaan`, `Trouver une solution`, `Contact` ;
- la frontière Public / Produit ;
- les moteurs métier déjà cadrés ;
- les formulaires et mécanismes utiles s’ils sont conformes au MASTER_SPEC.

Nous rejetons comme référence :

- la longueur actuelle de la landing ;
- la répétition de grands blocs de cartes ;
- les pages construites comme des suites de rectangles équivalents ;
- le même hero sombre appliqué mécaniquement partout ;
- le rendu “template / projet étudiant” ;
- les blocs cliquables dont la destination n’est pas évidente ;
- les contenus qui servent surtout à expliquer notre architecture interne ;
- toute absence de vraie page derrière un contenu, un territoire ou une opportunité.

**Objectif : garder la structure, refaire entièrement sa mise en scène.**

---

# 2. Ce que doit ressentir un visiteur

Le Public ne doit pas donner l’impression de consulter une documentation sur Mbàmbulaan.

Le visiteur doit pouvoir vivre naturellement :

**Je comprends → j’explore → je trouve quelque chose qui me concerne → je vais plus loin → j’agis → Mbàmbulaan prend le relais.**

Le site doit donner trois impressions immédiates :

1. **Mbàmbulaan connaît la filière et les territoires.**
2. **Mbàmbulaan sait orienter vers une réponse concrète.**
3. **Mbàmbulaan est une vraie entreprise sénégalaise, sérieuse et crédible, pas un prototype numérique.**

---

# 3. Principes visuels non négociables

## 3.1 Moins de blocs, plus de composition

Ne pas construire les pages comme :

`titre → 3 cartes → titre → 6 cartes → titre → 3 cartes → CTA`.

Une page premium doit utiliser une combinaison de :

- grandes images éditoriales ;
- compositions asymétriques ;
- textes courts bien hiérarchisés ;
- listes éditoriales ;
- cartes seulement lorsqu’elles ont un vrai rôle ;
- données ponctuelles ;
- carte territoriale ;
- citations / repères / sources ;
- appels à l’action contextuels.

Les cartes ne doivent jamais être le langage visuel par défaut.

## 3.2 Ne pas répéter le même hero sur toutes les pages

Chaque grande rubrique doit appartenir au même univers de marque mais avoir sa propre composition.

Exemples possibles :

- Landing : hero photographique fort + accès immédiat à l’action ;
- Découvrir : couverture éditoriale de type magazine / dossier ;
- Atlas : carte dominante dès l’ouverture ;
- Opportunités : entrée claire et utile, plus proche d’un service que d’un hero marketing ;
- Mbàmbulaan : page entreprise très photographique et humaine ;
- Trouver une solution : expérience focalisée sur le besoin, sans décor inutile.

## 3.3 Photographie comme matière éditoriale

Les photos ne doivent pas être uniquement des fonds sombres derrière un titre.

Elles doivent servir à :

- montrer un territoire ;
- montrer un métier ;
- montrer un geste ;
- créer une respiration ;
- illustrer un contenu ;
- donner une identité reconnaissable à Mbàmbulaan.

Une image générée ou illustrative ne doit jamais être présentée comme une preuve d’une action réellement menée par Mbàmbulaan.

## 3.4 Si une vraie image manque

Créer un composant de couverture générique premium, cohérent avec Mbàmbulaan, pour les contenus qui n’ont pas de photo.

Ce composant peut utiliser :

- territoire ;
- domaine métier ;
- type de contenu ;
- motif maritime / topographique discret ;
- texture / ligne de côte ;
- typographie de marque.

Il doit donner une vraie couverture éditoriale, jamais un rectangle vide avec une icône Lucide au centre.

---

# 4. Landing V2 — courte et publiable

La landing actuelle est trop longue.

La V2 doit tenir dans une narration resserrée. Elle ne doit pas chercher à résumer tout Mbàmbulaan.

## Structure recommandée

### 1. Hero

Objectif : comprendre Mbàmbulaan et agir immédiatement.

Doit contenir :

- signature ou promesse forte ;
- phrase simple ;
- accès `Trouver une solution` ;
- accès `Ouvrir l’Atlas` ;
- éventuellement un mini-sélecteur de besoins directement dans le hero ou immédiatement dessous.

Éviter un long paragraphe institutionnel.

### 2. “Que cherchez-vous à faire ?”

Entrée métier immédiatement utile.

Exemples :

- Transporter / livrer ;
- Conserver / refroidir ;
- S’équiper / réparer ;
- Transformer / valoriser ;
- Trouver des débouchés ;
- Former ;
- Déployer un programme ;
- Comprendre un territoire.

Cette section doit préremplir `Trouver une solution`, pas créer une nouvelle rubrique.

### 3. Explorer les territoires

Teaser Atlas fort et très visuel :

- aperçu de carte ;
- 3 à 5 territoires mis en avant ;
- une phrase métier ;
- CTA Atlas.

### 4. À découvrir

Maximum 3 contenus éditoriaux mis en avant.

Pas une grille de 6 contenus identiques.

Hiérarchie recommandée :

- 1 grand contenu principal avec image ;
- 2 contenus secondaires.

### 5. Opportunités utiles

Maximum 3 opportunités récentes / pertinentes.

Chaque élément doit indiquer clairement : type, territoire, date, organisateur et destination du clic.

### 6. Mbàmbulaan en action

Très court :

- terrain ;
- réseau ;
- technologie ;
- une grande image ou composition ;
- ce que cela permet concrètement ;
- lien vers `/mbambulaan`.

### 7. CTA final

Deux choix maximum :

- `J’ai un besoin` ;
- `Je peux apporter une solution / capacité`.

**La landing ne doit pas devenir une page encyclopédique.**

---

# 5. Découvrir V2 — un média métier, pas une taxonomie

La taxonomie du MASTER_SPEC reste valide, mais elle ne doit pas être affichée comme onze cartes de même importance.

## En haut de page

Créer une vraie couverture éditoriale :

- sujet principal ;
- image ;
- titre ;
- résumé ;
- territoire / domaine ;
- accès au contenu.

Puis présenter :

- contenus récents ;
- guides ;
- analyses ;
- terrain / portraits ;
- navigation par domaine sous une forme légère : menu, filtres, chips, méga-menu ou index éditorial.

## Pages de contenu obligatoires

Tout contenu cliquable doit mener vers une vraie URL claire :

`/decouvrir/[slug]`

Ne pas utiliser des identifiants techniques illisibles comme adresse publique si un slug humain peut être créé.

Exemples :

- `/decouvrir/chaine-du-froid-peche-artisanale`
- `/decouvrir/transport-poisson-joal-dakar`
- `/decouvrir/transformation-artisanale-poisson`

Chaque page de contenu doit contenir :

- une couverture / image ;
- catégorie ;
- titre ;
- résumé ;
- territoire si pertinent ;
- date ;
- source(s) ;
- corps lisible ;
- contenus liés ;
- CTA métier contextuel ;
- lien vers Atlas si pertinent.

Le visiteur doit toujours savoir où il est et où le clic l’emmène.

---

# 6. Atlas V2 — une vraie destination

L’Atlas ne doit plus ressembler à un widget placé sous un hero.

## Desktop

L’expérience doit être dominée par :

- la carte ;
- la recherche ;
- la liste / sélection de territoires ;
- une fiche contextuelle qui s’ouvre sans perdre la carte.

Le visiteur doit pouvoir partir :

`Sénégal → région → territoire / quai → comprendre → voir les activités et services documentés → consulter contenus / opportunités → demander de l’aide.`

## Mobile

- carte plein écran ou quasi plein écran ;
- bottom sheet / panneau glissant ;
- recherche très simple ;
- actions accessibles au pouce.

## Pages territoire obligatoires

Chaque territoire cliquable doit avoir une vraie page :

`/atlas/[slug]`

Exemple :

`/atlas/joal`

La page doit avoir :

- couverture / photo si possible ;
- situation géographique ;
- description simple ;
- activités ;
- services / infrastructures documentés ;
- espèces / saisonnalité uniquement si sourcées ;
- niveau de documentation ;
- source / mise à jour ;
- contenus liés ;
- opportunités liées ;
- `Trouver une solution sur ce territoire` ;
- `Signaler une information`.

---

# 7. Opportunités V2 — crédibles et utiles

L’utilisateur doit comprendre immédiatement :

- de quoi il s’agit ;
- qui organise ;
- pour qui ;
- où ;
- quand ;
- ce que fait Mbàmbulaan ;
- ce qui se passe quand il clique.

Chaque opportunité doit avoir une page :

`/opportunites/[slug]`

La page détail doit contenir :

- titre ;
- type ;
- organisateur ;
- territoire ;
- public concerné ;
- échéance ;
- résumé ;
- source ;
- statut ;
- implication Mbàmbulaan ;
- CTA pertinent.

Pour une présentation institutionnelle, privilégier des opportunités réelles et sourcées lorsque possible.

Les exemples fictifs doivent rester explicitement identifiés comme illustrations et ne doivent pas dominer visuellement la page.

---

# 8. Page Mbàmbulaan V2 — entreprise, pas roadmap interne

La page doit répondre simplement :

1. Qui sommes-nous ?
2. Quel problème cherchons-nous à résoudre ?
3. Comment travaillons-nous ?
4. Que pouvons-nous faire aujourd’hui ?
5. Avec qui travaillons-nous ?
6. Comment nous contacter ?

Conserver les trois piliers :

- Terrain ;
- Réseau ;
- Technologie.

Mais les traduire par des bénéfices concrets.

Ne pas afficher publiquement :

- notre roadmap Produit ;
- notre stratégie interne de monétisation ;
- “ce que nous ferons plus tard” ;
- nos objectifs internes de revenus ;
- des éléments réservés aux investisseurs ou au pilotage interne.

La page doit être courte, photographique, crédible et très humaine.

---

# 9. Trouver une solution V2 — priorité à l’usage

Le moteur métier peut être conservé s’il fonctionne.

L’expérience visuelle doit être simplifiée.

Le visiteur doit toujours savoir :

- ce qu’on lui demande ;
- pourquoi ;
- combien d’étapes restent ;
- ce qui se passera après l’envoi.

Éviter :

- jargon interne ;
- formulaires longs affichés en une fois ;
- surcharge d’informations expliquant notre architecture.

Promesse visible :

**Décrivez votre besoin. Mbàmbulaan vous aide à organiser la bonne réponse.**

---

# 10. Contact V2

Conserver le principe de routeur d’intentions.

Mais le rendre plus compact et plus humain.

Les entrées doivent être évidentes :

- J’ai un besoin ;
- Je propose mes services / capacités ;
- Je représente une organisation ;
- Je souhaite collaborer avec Mbàmbulaan ;
- Presse / recherche / information ;
- Autre.

Ne jamais afficher :

- faux numéro ;
- faux WhatsApp ;
- fausse adresse ;
- canal présenté comme actif s’il ne l’est pas.

---

# 11. Navigation et destination des clics

Règle absolue : **aucun bloc cliquable ambigu.**

Chaque élément interactif doit répondre à une intention claire :

- `Lire` → page de contenu ;
- `Voir le territoire` → page Atlas ;
- `Voir l’opportunité` → page opportunité ;
- `Trouver une solution` → moteur de besoin ;
- `Proposer mes services` → parcours contribution ;
- `En savoir plus sur Mbàmbulaan` → page entreprise.

Les cartes doivent avoir :

- un état hover / focus clair ;
- un libellé d’action clair ;
- une URL réelle ;
- aucune destination surprise.

## Slugs et alias

Les URLs publiques doivent être humaines et stables.

Si les anciennes routes ou anciens identifiants existent déjà :

- créer le nouveau slug ;
- mettre en place la redirection ;
- ne pas maintenir deux versions visibles de la même page.

---

# 12. Système de pages génériques à créer

Pour éviter de recoder une page différente pour chaque contenu tout en gardant un bon niveau visuel, créer des modèles réutilisables.

## Modèle Contenu

Pour `/decouvrir/[slug]` :

- cover ;
- metadata ;
- article ;
- source ;
- territoire ;
- contenus liés ;
- CTA contextuel.

## Modèle Territoire

Pour `/atlas/[slug]` :

- cover ;
- carte / localisation ;
- portrait ;
- activités ;
- services ;
- sources ;
- contenus / opportunités ;
- CTA.

## Modèle Opportunité

Pour `/opportunites/[slug]` :

- cover ou bandeau ;
- résumé ;
- informations essentielles ;
- source ;
- statut ;
- action.

Ces modèles doivent produire un résultat premium même lorsqu’une donnée optionnelle manque.

---

# 13. Critères visuels d’acceptation

Le Public V2 n’est pas accepté si :

- la landing semble interminable ;
- chaque section repose sur une grille de cartes ;
- toutes les pages ont exactement le même hero ;
- une page secondaire semble moins finie que la landing ;
- un contenu cliquable ne possède pas de vraie page ;
- on ne comprend pas la destination d’un clic ;
- une image illustrative est présentée comme une preuve terrain ;
- un faux contact est visible ;
- le rendu ressemble à un template SaaS générique ;
- le site paraît être un prototype étudiant ;
- le mobile est une simple réduction du desktop ;
- les textes internes de stratégie / roadmap sont exposés au public.

Le Public V2 est acceptable si :

- la landing est courte, claire et orientée action ;
- chaque grande rubrique a une identité visuelle propre tout en appartenant à la même marque ;
- Atlas est une vraie destination territoriale ;
- Découvrir ressemble à un média métier premium ;
- chaque contenu possède une page et une URL humaine ;
- chaque territoire important possède une page ;
- chaque opportunité possède une page ;
- les actions sont évidentes ;
- les photos et couvertures donnent de la profondeur ;
- les pages secondaires sont aussi travaillées que la landing ;
- le résultat semble publiable tel quel pour une institution, une entreprise ou un partenaire.

---

# 14. Ordre d’exécution demandé à Claude

**Ne pas lancer ce chantier avant le travail prioritaire sur Mbàmbulaan Produit.**

Lorsque le CEO donne le feu vert Public :

1. lire `MBAMBULAAN_PUBLIC_MASTER_SPEC.md` ;
2. lire ce brief ;
3. auditer uniquement la présentation et la navigation actuelles ;
4. proposer 2 ou 3 directions visuelles en mots / références de composition, sans modifier le cadrage métier ;
5. faire valider une direction ;
6. reconstruire d’abord Landing + un exemple de page Contenu + un exemple Territoire + un exemple Opportunité ;
7. faire valider le niveau de qualité ;
8. seulement ensuite décliner les autres pages ;
9. vérifier desktop + mobile ;
10. livrer une preview complète avant de déclarer le Public terminé.

**Règle : ne plus fabriquer toutes les pages avant validation visuelle d’un petit échantillon représentatif.**

---

# 15. Résultat attendu

Mbàmbulaan.sn doit pouvoir être montré sans explication préalable.

Un visiteur doit comprendre :

**ce qu’est Mbàmbulaan → ce qu’il peut découvrir → ce qu’il peut faire → pourquoi faire confiance → comment entrer en relation.**

La sophistication reste derrière. La simplicité, la beauté et l’utilité restent devant.
