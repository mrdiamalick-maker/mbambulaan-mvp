# Audit CPO — Mbàmbulaan Produit

> **Statut : document d’audit et de refondation**
>
> Ce document complète `docs/product/MBAMBULAAN_PRODUCT_MASTER_SPEC.md` et `docs/product/CLAUDE_CODE_HANDOFF_PRODUCT.md`. Le MASTER_SPEC reste la source de vérité. Le présent document synthétise les points à auditer, les risques actuels et les priorités de refondation à respecter avant de poursuivre le développement.

---

## 1. Verdict

Le nouveau cadrage de Mbàmbulaan Produit est bon et beaucoup plus ambitieux que l’ancien Produit.

Le risque principal est désormais de **conserver trop de l’ancien produit sous prétexte que le socle technique fonctionne**.

La bonne approche est donc :

- garder les briques techniques réellement solides ;
- jeter les anciens parcours, menus, dashboards et hiérarchies lorsqu’ils ne servent pas le nouveau modèle ;
- ne pas transformer la refondation en simple relooking ;
- ne pas construire une console ministère isolée ;
- ne pas construire un dashboard universel ;
- structurer tout autour de la boucle métier centrale.

Boucle cible :

**Un besoin ou problème est remonté → Mbàmbulaan le comprend et le vérifie → identifie qui peut agir → organise la réponse → suit les engagements → vérifie ce qui a été fait → mesure le résultat → conserve la connaissance pour mieux agir ensuite.**

C’est cette chaîne qui doit être visible dans le Produit.

---

## 2. Ce qui peut être conservé si l’audit le confirme

- authentification réelle ;
- gestion des sessions ;
- permissions si elles sont suffisamment fines ;
- persistance PostgreSQL ;
- tests et CI ;
- shadcn/ui comme bibliothèque technique ;
- composants techniques réutilisables ;
- modèle de données existant lorsqu’il recoupe réellement les nouveaux objets métier ;
- shell commun comme structure technique, à condition de ne pas imposer la même expérience à tous les rôles.

Important : **même shell ne veut pas dire même espace métier.**

- Institution = décision-first ;
- Coordinateur = situation-first ;
- Opérateur = task-first ;
- Terrain = mobile-first ;
- Partenaire / bailleur = outcome-first.

---

## 3. Ce qui doit être considéré comme obsolète

- anciens dashboards ;
- anciennes sidebars ;
- ancienne architecture de navigation ;
- anciens écrans par rôle ;
- anciennes pages Ministère ;
- anciens modules qui se chevauchent ;
- anciennes logiques de démonstration ;
- anciens parcours hérités ;
- composants visuels qui enferment le nouveau Produit dans l’ancien design ;
- toute logique qui sépare artificiellement Web / WhatsApp / téléphone / terrain du même besoin métier.

L’ancien Produit ne doit servir que de matière technique, jamais de référence UX ou fonctionnelle.

---

## 4. Problème central à éviter

Le Produit ne doit pas devenir une collection de modules :

- Atlas ;
- Opérations ;
- Community ;
- Ministère ;
- Durabilité ;
- Pilotage ;
- Programmes ;
- etc.

Il doit donner la sensation d’un seul système où les informations circulent.

Exemple :

**Un pêcheur ou un relais appelle → le besoin est enregistré → il est vérifié → il devient un dossier à traiter → un coordinateur mobilise une capacité → un acteur s’engage → l’action est réalisée → une preuve est enregistrée → le résultat apparaît dans le suivi du territoire → plusieurs problèmes similaires deviennent un programme.**

C’est cette continuité qui doit produire l’effet « waouh ».

---

## 5. Priorités métier du Produit

### 5.1 Vue nationale / institutionnelle

Le ministère doit pouvoir :

- voir les territoires ;
- voir les besoins importants ;
- voir les problèmes récurrents ;
- voir les infrastructures ;
- voir les programmes ;
- voir les résultats ;
- comprendre la qualité des informations ;
- descendre dans le détail selon ses droits.

Il ne doit pas voir un simple tableau de bord décoratif.

### 5.2 Coordination territoriale

Le coordinateur doit pouvoir :

- voir ce qui doit être traité ;
- comprendre le contexte ;
- identifier les acteurs concernés ;
- décider ou préparer une décision ;
- mobiliser une capacité ;
- assigner des engagements ;
- suivre les échéances ;
- communiquer ;
- recueillir la preuve ;
- clôturer avec un résultat.

### 5.3 Terrain

Le terrain doit être extrêmement simple :

- prochaine action ;
- appeler ;
- WhatsApp ;
- confirmer ;
- prendre une photo ;
- envoyer un vocal ;
- saisir un poids ou une information simple ;
- signaler un problème ;
- voir la prochaine étape.

Le terrain ne doit pas subir un ERP mobile.

### 5.4 Programmes et financements

Le Produit doit montrer comment plusieurs besoins récurrents deviennent :

- un besoin collectif ;
- une initiative ;
- un programme ;
- un budget ;
- des partenaires ;
- des actions ;
- des indicateurs ;
- des preuves ;
- un rapport.

C’est un axe majeur pour convaincre ministère, bailleurs et ONG.

---

## 6. Démonstration ministère

La démonstration cible doit rester :

**Vue nationale → Joal → problème remonté par WhatsApp / téléphone / terrain → compréhension et vérification → dossier à traiter → coordination → engagement d’un acteur → action → preuve → résultat → besoins similaires → programme → rapport.**

Scénario recommandé :

- problème de chaîne du froid / machine à glace indisponible ;
- impact potentiel sur les débarquements ;
- recherche d’une capacité alternative ;
- mobilisation d’un autre acteur ou site ;
- engagements et communication ;
- preuve terrain ;
- résultat ;
- besoin récurrent transformé en programme d’investissement.

Le ministère doit comprendre :

> **Mbàmbulaan ne montre pas seulement les problèmes. Mbàmbulaan aide à organiser la réponse, à suivre ce qui a été fait et à transformer la connaissance du terrain en décisions et investissements.**

---

## 7. Design et expérience

Le design actuel du Produit n’est pas une référence.

shadcn/ui peut rester une base technique, mais il ne doit pas produire un rendu de template SaaS générique.

Principes :

- institutionnel sans être administratif ;
- premium sans être décoratif ;
- maritime sans folklore ;
- riche en information mais lisible ;
- très cohérent ;
- adapté au rôle ;
- desktop fort pour institution / coordination ;
- mobile fort pour terrain ;
- très peu de bruit visuel ;
- hiérarchie claire ;
- prochaines actions évidentes.

Le « waouh » doit venir du métier et de la continuité, pas d’effets graphiques gratuits.

---

## 8. Administration

Ne pas faire de l’Admin la priorité tant que l’architecture du Produit n’est pas stabilisée.

L’Admin doit découler du modèle final :

- organisations clientes ;
- utilisateurs ;
- rôles ;
- territoires ;
- plans ;
- modules ;
- droits ;
- canaux ;
- qualité des données ;
- audit ;
- support ;
- environnement de démonstration.

---

## 9. Données et confiance

Chaque information importante doit permettre de savoir :

- d’où elle vient ;
- qui l’a fournie ;
- par quel canal ;
- quand ;
- si elle est encore fraîche ;
- si elle est déclarée, documentée, vérifiée, officielle, estimée ou contestée ;
- qui peut la voir.

Les données de démonstration doivent être explicitement marquées `DEMO`.

Ne jamais créer de faux temps réel ou de faux chiffres officiels.

---

## 10. Ce que Claude doit auditer avant de poursuivre

Claude doit produire un audit concret du repo actuel avec quatre catégories :

1. garder ;
2. adapter ;
3. remplacer ;
4. supprimer.

À auditer :

- routes ;
- modèles métier ;
- authentification ;
- permissions ;
- persistance ;
- composants ;
- navigation ;
- rôles ;
- Atlas ;
- coordination ;
- programmes ;
- reporting ;
- canaux ;
- mobile ;
- tests ;
- sécurité ;
- déploiement ;
- dépendances avec le Public.

Il doit ensuite proposer :

- architecture cible ;
- architecture d’information ;
- parcours par rôle ;
- lots de livraison ;
- arbitrages CEO ;
- éléments réellement fonctionnels, simulés ou différés.

---

## 11. Ordre recommandé

1. Audit et baseline.
2. Socle métier et permissions.
3. Vue nationale + Atlas professionnel.
4. Besoins / problèmes / coordination.
5. Engagements / communication / preuve / résultat.
6. Besoins collectifs / programmes / financements.
7. Reporting.
8. Terrain mobile.
9. Admin.
10. Polish et démonstration finale.

---

## 12. Définition de fini

La V1 institutionnelle est acceptable si l’on peut réellement :

- ouvrir la vue nationale ;
- identifier un territoire ;
- descendre dans Joal ;
- voir un besoin ou problème remonté ;
- comprendre son origine ;
- voir qui doit agir ;
- assigner un engagement ;
- mobiliser une capacité ;
- préparer une communication ;
- enregistrer une preuve ;
- clôturer avec un résultat ;
- voir ce résultat dans le suivi ;
- regrouper plusieurs besoins ;
- créer un programme ;
- produire un rapport ;
- rejouer une action simple depuis un mobile terrain.

---

## 13. Message clé pour Claude

Ne continue pas à « améliorer l’ancien Produit ».

**Construis le nouveau Mbàmbulaan Produit à partir du modèle métier.**

Garde uniquement les fondations techniques qui nous font gagner du temps sans nous enfermer dans l’ancien système.

Objectif : quand le ministère voit le Produit, il ne doit pas voir un dashboard. Il doit voir une infrastructure capable de transformer une information terrain en action coordonnée, résultat vérifiable et décision d’investissement.
