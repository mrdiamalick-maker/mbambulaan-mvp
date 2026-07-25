# Blueprint Produit 1.1 — Mbàmbulaan

## 1. Finalité

Le Blueprint Produit 1.1 traduit la vision et les principes du Blueprint 1.0 en artefacts directement exploitables par les équipes produit, design, data et développement.

Le Blueprint 1.0 répond principalement à :

- pourquoi Mbàmbulaan existe ;
- pour qui ;
- comment la valeur circule ;
- quelles capacités et quels moteurs structurent le produit ;
- comment le modèle économique et la roadmap s'articulent.

Le Blueprint 1.1 répond principalement à :

- quels objets métier nous devons gérer ;
- comment ils s'organisent ;
- quels événements structurent les flux ;
- quelles frontières de domaine nous devons respecter ;
- quelles données sont requises ;
- comment les APIs et parcours doivent être conçus ;
- comment transformer les capacités en backlog exécutable.

## 2. Positionnement

Mbàmbulaan reste une infrastructure numérique de coordination pour l'écosystème halieutique sénégalais, en commençant par la pêche artisanale.

Le Blueprint 1.1 ne doit jamais dériver vers une logique de simple logiciel de gestion. Chaque artefact doit rester aligné avec les objectifs suivants :

- améliorer la coordination ;
- créer de la valeur métier ;
- fiabiliser l'information ;
- rendre les responsabilités visibles ;
- faciliter les décisions ;
- suivre l'exécution ;
- mesurer les résultats ;
- capitaliser les apprentissages ;
- soutenir un modèle économique durable pour Mbàmbulaan.

## 3. Dépendance au Blueprint 1.0

Le dossier suivant reste la source stratégique de référence :

`docs/blueprint-produit-1.0/`

En cas de contradiction, les documents suivants doivent guider l'arbitrage :

1. `01-vision-et-theorie-du-changement.md`
2. `04-capacites-collectives.md`
3. `05-moteurs-metier.md`
4. `06-architecture-fonctionnelle.md`
5. `08-modele-economique.md`
6. `09-roadmap-produit.md`
7. `10-principes-fondateurs.md`

## 4. Structure du Blueprint 1.1

La séquence proposée est la suivante :

1. **Domain Model** — objets métier, agrégats, identifiants et relations ;
2. **Event Catalog** — événements métier, producteurs, consommateurs et effets ;
3. **Data Dictionary** — définitions, qualité, provenance, sensibilité et cycle de vie ;
4. **Bounded Contexts** — frontières fonctionnelles et responsabilités ;
5. **Architecture API** — contrats, règles d'intégration et principes d'exposition ;
6. **Design System fonctionnel** — patterns de parcours, états, décisions et confiance ;
7. **MVP détaillé** — périmètre produit et opérationnel du pilote ;
8. **Backlog structuré** — Epics, Features, Stories et critères d'acceptation ;
9. **KPI et modèle d'impact** — mesure de l'utilité, de l'adoption, de la coordination et de la rentabilité ;
10. **Operating Model produit** — gouvernance, rôles, décisions et cadence d'exécution.

## 5. Ordre recommandé

Le travail doit commencer par le Domain Model, car il conditionne :

- les responsabilités des moteurs ;
- les APIs ;
- les événements ;
- les règles de données ;
- les parcours ;
- les tests ;
- le backlog technique.

La séquence recommandée est :

```text
Domain Model
   ↓
Bounded Contexts
   ↓
Event Catalog
   ↓
Data Dictionary
   ↓
Architecture API
   ↓
MVP détaillé
   ↓
Backlog
   ↓
KPI et Operating Model
```

## 6. Règles de production

Chaque document du Blueprint 1.1 doit :

- citer les moteurs métier concernés ;
- identifier les acteurs ;
- expliciter les objets et responsabilités ;
- distinguer le pilote du futur ;
- éviter le sur-mesure ;
- préciser les règles de confiance et d'accès ;
- rester exploitable par une équipe de développement ;
- indiquer les décisions encore ouvertes ;
- préserver la compatibilité avec une faible connectivité ;
- intégrer la logique économique de Mbàmbulaan.

## 7. Critères de qualité

Un artefact est considéré comme exploitable s'il permet à une équipe de répondre sans ambiguïté à ces questions :

- quel problème métier est traité ?
- quel acteur agit ?
- quel acteur bénéficie ?
- quel moteur possède la règle ?
- quel objet est créé ou modifié ?
- quel événement est produit ?
- quelles données sont nécessaires ?
- quelles permissions s'appliquent ?
- quelle preuve de succès est attendue ?
- cette capacité est-elle nécessaire au pilote ?

## 8. Principe directeur

> Le Blueprint 1.1 transforme la stratégie produit en modèle de domaine, contrats, événements, données et backlog, sans perdre la logique de coordination qui constitue le cœur de Mbàmbulaan.
