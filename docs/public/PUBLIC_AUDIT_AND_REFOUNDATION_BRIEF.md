# Audit CPO — Public Mbàmbulaan

> **Statut : document d’audit et de refondation**
>
> Ce document complète `docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`. Le MASTER_SPEC reste la source de vérité fonctionnelle et stratégique. Le présent document explique ce qui ne va pas dans la version actuelle du Public et ce qui doit être repris pour atteindre un niveau réellement production-ready.

---

## 1. Verdict

La structure du Public est globalement la bonne : Landing, Découvrir, Territoires / Atlas, Opportunités, Mbàmbulaan, Trouver une solution, Contact.

Le problème principal n’est donc pas le découpage. Il est dans **la manière de raconter, de hiérarchiser et de présenter**.

La version actuelle ressemble encore trop à un prototype très propre ou à un projet étudiant :

- landing trop longue ;
- trop de sections successives ;
- trop de cartes et blocs équivalents ;
- hiérarchie visuelle faible ;
- trop de texte explicatif ;
- trop peu d’expérience éditoriale ;
- trop peu de respiration ;
- clics dont la destination n’est pas toujours évidente ;
- pages de contenu insuffisamment traitées comme de vraies pages éditoriales ;
- Atlas encore traité comme un composant dans une page alors qu’il doit être une destination majeure ;
- design trop homogène dans le mauvais sens : même logique de cartes répétée partout.

Le Public respecte mieux le cahier des charges sur le fond qu’avant, mais **pas encore son esprit**.

Le Public doit donner la sensation :

**Je découvre → je comprends → j’explore → je trouve ce qui me concerne → j’agis → Mbàmbulaan prend le relais.**

Aujourd’hui, il donne encore trop souvent la sensation :

**Je lis → je lis encore → je vois des cartes → je clique éventuellement.**

---

## 2. Ce qui doit être conservé

- l’architecture générale du Public ;
- la navigation canonique ;
- la séparation Public / Produit ;
- les catégories métier ;
- le principe de l’Atlas public ;
- le moteur « Trouver une solution » ;
- le routeur d’intentions du Contact ;
- la distinction opportunités / contenus / territoires ;
- l’usage des photos documentaires ;
- la logique de données publiques séparées des données privées ;
- les pages détail `/decouvrir/[slug]`, `/atlas/[slug]`, `/opportunites/[slug]` lorsqu’elles sont bien exploitées.

---

## 3. Ce qui doit être refondu

### 3.1 Landing

La landing doit être beaucoup plus courte et beaucoup plus claire.

Elle doit être conçue comme une vraie porte d’entrée de production, pas comme une présentation exhaustive de Mbàmbulaan.

Structure recommandée :

1. **Hero très fort**
   - promesse claire ;
   - photo documentaire ;
   - 2 actions maximum : Trouver une solution / Ouvrir l’Atlas.

2. **Bloc métier immédiat**
   - « Que cherchez-vous à faire ? »
   - transport, froid, équipement, transformation, débouchés, formation, programme, territoire.
   - chaque choix doit lancer ou pré-remplir le bon parcours.

3. **Atlas / Territoires**
   - mise en avant visuelle forte ;
   - quelques territoires ;
   - un vrai aperçu de l’expérience.

4. **À découvrir / À lire**
   - 3 à 4 contenus éditoriaux maximum ;
   - vrais visuels ;
   - vraie hiérarchie ;
   - pas 6 cartes identiques.

5. **Opportunités**
   - 3 opportunités utiles maximum ;
   - source, type, public, échéance.

6. **Qui est Mbàmbulaan ?**
   - terrain + réseau + technologie ;
   - très court ;
   - preuve de méthode, pas de roadmap interne.

7. **CTA final**
   - besoin / capacité / partenariat.

La landing ne doit pas essayer de raconter toute la chaîne de valeur, toute la stratégie, tous les chiffres et toutes les capacités en une seule page.

### 3.2 Découvrir

Découvrir doit devenir un véritable espace éditorial métier.

Aujourd’hui, la taxonomie est correcte, mais l’affichage est trop « catalogue de catégories ».

Cible :

- un sujet principal mis en avant ;
- un sujet terrain ;
- un guide pratique ;
- une analyse ;
- un portrait ;
- des entrées par domaine en second niveau ;
- des liens vers territoires et opportunités ;
- des CTA contextuels.

Chaque contenu doit disposer d’une vraie page :

- image de couverture ;
- titre ;
- chapô ;
- source ;
- corps éditorial ;
- éléments clés ;
- territoire associé ;
- contenus liés ;
- opportunités liées ;
- CTA métier.

### 3.3 Atlas

L’Atlas doit devenir une expérience dominante, pas un simple bloc placé sous un hero.

Cible :

- carte quasi plein écran ;
- recherche territoire / quai / activité ;
- sélection de territoire ;
- fiche latérale ou panneau mobile ;
- photo ;
- description ;
- activités ;
- services documentés ;
- espèces si fiables ;
- source / niveau de couverture ;
- contenus liés ;
- opportunités liées ;
- CTA Trouver une solution ;
- CTA Proposer une correction.

Le visiteur doit sentir immédiatement que Mbàmbulaan **connaît le territoire**.

### 3.4 Opportunités

La page doit être plus crédible et moins « démo ».

À éviter : afficher « Démonstration » sur toutes les cartes.

Pour une présentation institutionnelle :

- privilégier de vraies opportunités publiques vérifiées ;
- afficher clairement la source ;
- montrer le niveau d’implication Mbàmbulaan ;
- si un élément est fictif, l’indiquer comme « Exemple illustratif » et limiter son nombre.

### 3.5 Page Mbàmbulaan

Cette page doit présenter l’entreprise, pas sa stratégie interne.

À supprimer du visible public :

- « générer un revenu avant le lancement du Produit » ;
- distinction interne « aujourd’hui / plus tard » fondée sur notre roadmap ;
- détails sur les futurs workflows et dashboards ;
- langage de stratégie produit.

À montrer :

- ce que Mbàmbulaan fait ;
- comment Mbàmbulaan travaille ;
- pourquoi le terrain compte ;
- comment le réseau est mobilisé ;
- comment la technologie aide ;
- comment une organisation peut travailler avec Mbàmbulaan.

### 3.6 Contact et canaux

Ne jamais laisser de faux numéro ou faux contact cliquable.

Si WhatsApp n’est pas encore prêt :

- ne pas afficher de faux numéro ;
- utiliser un canal réel ;
- ou indiquer clairement qu’il sera disponible prochainement.

### 3.7 Photos

Les images générées peuvent illustrer une ambiance ou un usage.

Elles ne doivent jamais être présentées comme preuve réelle de la présence terrain de l’équipe Mbàmbulaan.

Les légendes doivent être neutres si l’image est illustrative.

---

## 4. Direction design attendue

Le design doit être entièrement repris sans changer le découpage métier.

Principes :

- premium ;
- documentaire ;
- éditorial ;
- maritime ;
- humain ;
- territorial ;
- sobre ;
- très lisible ;
- mobile-first ;
- production-ready.

À éviter :

- accumulation de cartes ;
- répétition de blocs identiques ;
- petits pictogrammes génériques comme principal ressort visuel ;
- titres, cartes et boutons qui occupent tous la même importance ;
- longues pages sans respiration ;
- look SaaS ;
- look « projet étudiant » ;
- pages secondaires visuellement inférieures à la landing.

Le Public doit reposer sur une vraie grammaire visuelle :

- grande photographie documentaire ;
- typographie éditoriale forte ;
- blocs de contenu plus asymétriques ;
- espaces blancs ;
- sections courtes ;
- cartes uniquement lorsqu’elles apportent réellement quelque chose ;
- navigation claire ;
- micro-interactions sobres ;
- cohérence forte entre toutes les pages.

---

## 5. Règle de navigation et de clic

Aucun bloc cliquable ne doit être ambigu.

Chaque carte ou bloc doit :

- annoncer clairement ce qu’il représente ;
- avoir une destination logique ;
- ouvrir une vraie page de contenu lorsqu’un contenu est annoncé ;
- éviter les blocs décoratifs qui ressemblent à des liens sans en être ;
- éviter les liens génériques vers une page qui ne correspond pas précisément à la promesse du bloc.

Les pages de contenu doivent être traitées comme des destinations complètes, pas comme des fiches minimales.

---

## 6. Priorité de refonte pour Claude

### Lot Public 1 — Direction visuelle + Landing

- nouvelle direction artistique ;
- design system ;
- landing raccourcie ;
- moteur métier haut dans la page ;
- Atlas mis en avant ;
- contenus et opportunités mieux hiérarchisés.

### Lot Public 2 — Découvrir + pages de contenu

- page Découvrir éditoriale ;
- vraies pages contenu ;
- images génériques cohérentes si nécessaire ;
- liens territoires / opportunités / CTA contextuels.

### Lot Public 3 — Atlas

- expérience territoriale immersive ;
- carte dominante ;
- fiches territoires ;
- mobile.

### Lot Public 4 — Opportunités + Mbàmbulaan + Contact

- opportunités crédibles ;
- page entreprise simplifiée ;
- contacts réels ;
- cohérence globale.

### Lot Public 5 — Recette

- desktop ;
- mobile ;
- parcours ;
- performance ;
- SEO ;
- accessibilité ;
- cohérence visuelle.

---

## 7. Définition de fini

Le Public est acceptable si :

- la landing est courte, claire et production-ready ;
- chaque bloc a une fonction ;
- les clics mènent à de vraies destinations ;
- Découvrir ressemble à un vrai espace éditorial ;
- l’Atlas est une destination forte ;
- les opportunités sont crédibles ;
- Mbàmbulaan est présenté comme une entreprise réelle et utile ;
- la photo soutient le récit sans créer de fausse preuve ;
- le design est cohérent et premium ;
- le mobile est solide ;
- aucune page secondaire ne semble moins aboutie que la landing ;
- le site ne ressemble ni à un SaaS, ni à un dashboard, ni à un projet étudiant.

---

## 8. Message clé pour Claude

La structure métier du Public est bonne. **Ne la réinvente pas inutilement.**

Ce qui doit être réinventé est :

- la hiérarchie ;
- la longueur ;
- la composition ;
- la direction artistique ;
- l’expérience éditoriale ;
- la mise en scène des territoires ;
- la clarté des destinations ;
- la qualité des pages de contenu.

Objectif : produire un Mbàmbulaan.sn que l’on peut montrer immédiatement à un ministère, une ONG, une entreprise ou un bailleur sans avoir à expliquer que « c’est encore une démo ».
