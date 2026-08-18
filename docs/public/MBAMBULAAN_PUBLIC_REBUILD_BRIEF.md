# Mbàmbulaan Public — Brief de refonte production

> **Statut : brief d’exécution UX/UI et éditorial.**
>
> La source de vérité métier et fonctionnelle reste `docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`.
>
> Ce document ne change pas l’architecture du Public. Il précise comment la rendre présentable, compréhensible, crédible et prête pour une mise en production.

---

## 1. Ce qui est FIGÉ

Le découpage du Public est validé et ne doit pas être remis en cause :

- `/` — Accueil
- `/decouvrir` — porte éditoriale et pédagogique
- `/decouvrir/[slug]` — pages de contenu et pages thématiques
- `/atlas` — Atlas / Territoires
- `/atlas/[slug]` — fiche territoire / quai
- `/opportunites` — opportunités
- `/opportunites/[slug]` — détail d’une opportunité
- `/mbambulaan` — entreprise, terrain, réseau, technologie
- `/contact` — orientation vers le bon besoin
- capacité transverse **Trouver une solution**
- accès professionnel discret

Navigation visible :

`Découvrir | Territoires | Opportunités | Mbàmbulaan | Trouver une solution | Ouvrir l’Atlas`

Le problème actuel n’est donc pas le découpage. Le problème est la manière dont il est présenté.

---

## 2. Diagnostic à retenir

La version actuelle ressemble trop à un projet étudiant / prototype :

- landing trop longue ;
- trop de sections successives ;
- trop de cartes visuellement équivalentes ;
- manque de hiérarchie ;
- trop de rectangles, badges et pictogrammes ;
- pages qui se ressemblent toutes ;
- les blocs cliquables n’annoncent pas clairement leur destination ;
- certains liens donnent l’impression de filtrer sans ouvrir une vraie page ;
- absence de vraie sensation éditoriale ;
- Atlas encore traité comme un composant dans une page au lieu d’une destination majeure ;
- photos utilisées surtout comme fonds de hero, pas comme matière éditoriale ;
- manque de profondeur visuelle et de rythme ;
- trop de vocabulaire conceptuel ;
- trop d’explications de Mbàmbulaan et pas assez de démonstration par les usages.

Le prochain lot ne doit pas être un polish CSS. Il doit être une **reconstruction de l’expérience visuelle** en conservant la structure métier.

---

## 3. Principe de conception

**Métier devant. Technologie derrière.**

Le visiteur doit comprendre immédiatement :

1. ce qu’il peut découvrir ;
2. ce qu’il peut chercher ;
3. où cela se passe ;
4. ce que Mbàmbulaan peut organiser pour lui ;
5. où mène chaque clic.

Règle :

> Un bloc cliquable doit toujours annoncer sa destination ou son résultat.

Éviter les blocs génériques intitulés seulement « Explorer », « En savoir plus », etc.

Préférer :

- « Comprendre la chaîne du froid » ;
- « Voir le territoire de Joal » ;
- « Lire le guide » ;
- « Voir les opportunités à Mbour » ;
- « Décrire un besoin de transport ».

---

## 4. Direction visuelle

Ne pas utiliser la version actuelle comme référence esthétique.

Le rendu cible doit être :

- premium ;
- éditorial ;
- maritime ;
- humain ;
- territorial ;
- contemporain ;
- sobre ;
- crédible au Sénégal ;
- suffisamment institutionnel pour un ministère ;
- suffisamment vivant pour une entreprise ou une ONG ;
- suffisamment simple pour ne pas devenir un portail administratif.

Éviter absolument :

- le rendu « dashboard » ;
- le rendu « template SaaS » ;
- les grilles de cartes répétées partout ;
- les bordures et badges décoratifs sans fonction ;
- les titres surdimensionnés à chaque section ;
- l’empilement systématique hero + cartes + cartes + CTA ;
- les animations décoratives ;
- les icônes génériques comme principal langage visuel.

L’identité doit reposer davantage sur :

- photographie documentaire ;
- typographie ;
- espace ;
- mise en page éditoriale ;
- carte / territoire ;
- images de gestes métier ;
- données sourcées lorsqu’elles apportent quelque chose ;
- CTA précis.

---

## 5. Règle sur les images

Chaque expérience majeure doit avoir une vraie présence visuelle.

Si aucune photo terrain réelle et exploitable n’est disponible, utiliser :

- une image éditoriale générée ;
- une image générique par domaine ;
- un visuel territorial ;
- une composition abstraite / documentaire cohérente avec la marque.

Mais ne jamais utiliser une image générée comme preuve d’une activité réelle de Mbàmbulaan.

Prévoir au minimum une bibliothèque de visuels cohérente pour :

- pêche & ressources ;
- débarquement ;
- conservation / froid ;
- transformation ;
- transport / logistique ;
- commerce / débouchés ;
- équipements / maintenance ;
- formation ;
- financement / programmes ;
- territoires ;
- environnement.

Une même image générique peut servir à plusieurs contenus d’un même domaine tant qu’elle est utilisée comme illustration éditoriale et non comme preuve terrain.

---

## 6. Landing cible — courte et prête production

La landing ne doit pas être un résumé de toutes les pages du site.

Cible : 5 à 6 séquences maximum avant le footer.

### Séquence 1 — Hero

Objectif : comprendre Mbàmbulaan en quelques secondes.

Contenu :

- signature claire ;
- phrase simple ;
- CTA principal « Trouver une solution » ;
- CTA secondaire « Ouvrir l’Atlas » ;
- grande photo documentaire forte.

Éviter plusieurs lignes de preuves ou badges sous le hero.

### Séquence 2 — Que cherchez-vous à faire ?

Faire apparaître immédiatement les usages :

- Transporter / livrer ;
- Conserver / refroidir ;
- Transformer / valoriser ;
- S’équiper / maintenir ;
- Se former ;
- Trouver des débouchés ;
- Déployer un programme ;
- Comprendre un territoire.

Cette séquence doit lancer le parcours « Trouver une solution » avec le contexte déjà renseigné.

### Séquence 3 — Atlas / Territoires

Un seul grand aperçu visuel de l’Atlas, pas une grille de territoires.

Objectif : donner envie d’entrer dans le territoire.

CTA clair : « Explorer les territoires ».

### Séquence 4 — À découvrir

Une vraie composition éditoriale :

- 1 contenu principal avec grande image ;
- 2 ou 3 contenus secondaires maximum ;
- chaque contenu mène vers une vraie page `/decouvrir/[slug]`.

### Séquence 5 — Opportunités

3 opportunités maximum, réellement utiles et clairement sourcées.

CTA : « Voir toutes les opportunités ».

### Séquence 6 — Mbàmbulaan

Bloc très court :

- Terrain ;
- Réseau ;
- Technologie ;
- une phrase sur la manière de travailler ;
- CTA « Découvrir Mbàmbulaan ».

Puis footer.

### À retirer de la landing

- longue chaîne de valeur développée ;
- bandes de statistiques successives ;
- multiples répétitions de CTA ;
- longues explications stratégiques ;
- détails sur le futur Produit professionnel ;
- blocs « pourquoi / comment / encore comment » redondants.

La chaîne de valeur et les chiffres ont davantage leur place dans `/decouvrir`.

---

## 7. Découvrir — passer d’une taxonomie à un média métier

`/decouvrir` ne doit pas ressembler à une grille de catégories.

Structure cible :

1. hero éditorial ;
2. grand contenu mis en avant ;
3. navigation simple par thèmes ;
4. sélection de contenus avec images ;
5. chaîne de valeur / compréhension de la filière ;
6. territoires reliés ;
7. CTA contextuel.

Les domaines restent ceux du `MASTER_SPEC`, mais leur présentation doit être plus éditoriale.

### Pages thématiques

Les thèmes doivent disposer d’une vraie destination lorsque cela est utile.

Utiliser `/decouvrir/[slug]` pour créer des pages thématiques telles que :

- `/decouvrir/peche-ressources`
- `/decouvrir/debarquement`
- `/decouvrir/conservation-froid`
- `/decouvrir/transformation-valorisation`
- `/decouvrir/transport-logistique`
- `/decouvrir/commerce-debouches`
- `/decouvrir/equipements-maintenance`
- `/decouvrir/competences-formation`
- `/decouvrir/financement-developpement`
- `/decouvrir/territoires-infrastructures`
- `/decouvrir/durabilite-environnement`

Chaque page thématique doit contenir :

- une image / couverture ;
- une introduction ;
- ce qu’il faut comprendre ;
- contenus associés ;
- territoires concernés ;
- opportunités reliées ;
- CTA métier adapté.

Le visiteur ne doit pas cliquer sur une « catégorie » pour constater simplement que la grille s’est filtrée.

### Pages de contenu

Chaque article / guide / portrait / analyse doit avoir une vraie page :

- titre ;
- image ;
- type ;
- thème ;
- territoire ;
- date ;
- auteur / source ;
- corps éditorial ;
- sources ;
- contenus liés ;
- territoire lié ;
- opportunités liées ;
- CTA métier contextuel.

---

## 8. Atlas — destination majeure

`/atlas` doit être **map-first**.

Ne pas commencer par un hero classique occupant une grande partie de l’écran.

Desktop :

- recherche / filtres sobres ;
- carte dominante ;
- panneau latéral ou drawer ;
- territoire sélectionné ;
- photo ;
- description ;
- activités ;
- services documentés ;
- contenus ;
- opportunités ;
- CTA « Trouver une solution sur ce territoire ».

Mobile :

- carte dominante ;
- bottom sheet ;
- recherche accessible ;
- fiche territoire simple.

L’Atlas doit faire ressentir la connaissance territoriale de Mbàmbulaan.

### Fiche territoire `/atlas/[slug]`

Doit être une vraie page destination :

- grande image ;
- nom du territoire ;
- contexte ;
- carte / localisation ;
- activités ;
- services documentés ;
- espèces / saisonnalité seulement si fiables ;
- niveau de documentation ;
- source et mise à jour ;
- contenus reliés ;
- opportunités ;
- correction / contribution ;
- CTA besoin.

Pas de métriques privées ni disponibilité en temps réel.

---

## 9. Opportunités — utile, crédible, actionnable

La page ne doit pas ressembler à un catalogue de cartes fictives.

Priorité : vraies opportunités publiques vérifiées lorsqu’elles sont disponibles.

Chaque opportunité doit avoir :

- type ;
- titre ;
- organisateur ;
- territoire ;
- public concerné ;
- date / échéance ;
- source ;
- statut ;
- niveau d’implication de Mbàmbulaan ;
- CTA clair.

`/opportunites/[slug]` doit être une vraie page :

- contexte ;
- informations essentielles ;
- à qui cela s’adresse ;
- conditions ;
- source ;
- rôle de Mbàmbulaan ;
- manifestation d’intérêt si Mbàmbulaan coordonne.

Ne pas afficher un mur de cartes toutes marquées « Démonstration » sur une version présentée comme prête production.

---

## 10. Page Mbàmbulaan

Objectif : répondre simplement à :

- qui sommes-nous ?
- pourquoi existons-nous ?
- comment travaillons-nous ?
- qu’est-ce que cela change pour les acteurs ?
- comment travailler avec nous ?

Conserver les trois piliers :

- Terrain ;
- Réseau ;
- Technologie.

Mais retirer toute cuisine interne :

- stratégie de revenu ;
- roadmap Produit ;
- « ce que nous ferons plus tard » ;
- distinction interne Public / Produit ;
- détails de monétisation.

Ne jamais présenter une image générée comme preuve de présence terrain réelle.

---

## 11. Trouver une solution

Le moteur métier actuel peut être conservé s’il fonctionne.

La présentation doit devenir plus simple et plus rassurante.

Le visiteur doit comprendre :

> « Dites-nous ce que vous cherchez à faire. Nous comprenons le besoin, vérifions le contexte et organisons la suite. »

Pas de jargon interne.

Le parcours conserve :

1. besoin ;
2. territoire ;
3. quelques précisions utiles ;
4. description ;
5. coordonnées et canal préféré ;
6. confirmation.

Le contexte d’origine doit être conservé lorsqu’on vient d’un territoire, contenu ou opportunité.

---

## 12. Contact

Le routeur d’intentions est conservé.

Mais réduire l’impression de « grille de formulaires ».

Utiliser une mise en page plus simple :

- « J’ai un besoin » ;
- « Je propose une capacité » ;
- « Je représente une organisation » ;
- « Presse / recherche / information » ;
- autre.

Les canaux réels seulement.

Aucun faux téléphone, faux WhatsApp, faux email ou contact placeholder ne doit être cliquable en production.

---

## 13. Composants attendus

Ne pas multiplier les composants décoratifs.

Composants utiles :

- Header ;
- Footer ;
- Hero visuel ;
- image éditoriale ;
- bloc contenu principal ;
- carte contenu secondaire ;
- carte opportunité ;
- aperçu territoire ;
- panneau Atlas ;
- CTA métier contextuel ;
- bloc source / confiance ;
- formulaire besoin ;
- formulaire contribution.

Les composants doivent permettre des mises en page variées. Ils ne doivent pas forcer toutes les pages à devenir des grilles de cartes.

---

## 14. Critères visuels de validation

La refonte est refusée si :

- la landing dépasse inutilement 6 grandes séquences ;
- toutes les pages utilisent la même construction hero + grille de cartes ;
- la majorité des sections sont des rectangles bordés ;
- les images sont uniquement décoratives ;
- l’Atlas ressemble à un widget ;
- les thèmes Découvrir n’ont pas de vraie destination ;
- un clic ne permet pas de comprendre où l’on va ;
- les pages de contenu ressemblent à des placeholders ;
- une page secondaire paraît moins finie que la landing ;
- la version mobile ressemble à une version desktop empilée ;
- des données fictives sont présentées comme réelles ;
- des contacts placeholder sont cliquables ;
- le site expose la roadmap ou la stratégie interne Mbàmbulaan.

La refonte est acceptable si :

- la landing se comprend en moins de 20 secondes ;
- la landing paraît prête à être publiée ;
- l’Atlas donne envie d’explorer ;
- Découvrir donne envie de lire ;
- chaque clic a une destination claire ;
- les pages thématiques et de contenu ont une vraie profondeur ;
- Opportunités paraît utile et crédible ;
- Mbàmbulaan paraît être une entreprise réelle et sérieuse ;
- Trouver une solution est naturel et visible ;
- le site est homogène sans être répétitif ;
- desktop et mobile ont tous deux été réellement conçus ;
- aucune page importante ne ressemble à un prototype.

---

## 15. Ordre d’exécution

**Ne pas lancer cette refonte avant le lot prioritaire Mbàmbulaan Produit demandé par le CEO.**

Lorsque le travail Public reprend :

1. conserver l’architecture métier et les routes validées ;
2. auditer les destinations de tous les clics ;
3. reconstruire le système visuel ;
4. raccourcir la landing ;
5. créer les pages thématiques manquantes ;
6. renforcer les pages de contenu ;
7. reconstruire l’Atlas en map-first ;
8. refaire Opportunités ;
9. nettoyer Mbàmbulaan ;
10. simplifier Contact / Trouver une solution ;
11. créer / compléter les visuels ;
12. recette desktop + mobile ;
13. supprimer placeholders et données trompeuses ;
14. build, smoke, preview Vercel ;
15. revue CEO avant livraison.

---

## 16. Instruction à Claude Code

Avant de reprendre le Public, lire intégralement :

1. `docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`
2. `docs/public/MBAMBULAAN_PUBLIC_REBUILD_BRIEF.md`

Le premier document définit **ce que le Public doit être**.

Le second définit **le niveau d’expérience et de présentation minimum attendu pour qu’il soit acceptable en production**.

Ne pas changer le découpage validé. Refaire la manière de le présenter.
