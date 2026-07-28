# Mbàmbulaan — Règles de langage terrain

## 1. Décision

Les interfaces, messages, parcours de démonstration et documents destinés aux acteurs doivent utiliser le vocabulaire concret de la filière.

Un terme technique peut exister dans le code ou l'architecture, mais il ne doit pas être exposé tel quel lorsqu'un acteur métier emploie un mot plus précis.

Cette règle complète le document `ubiquitous-language.md` et prévaut pour tous les libellés visibles par les acteurs.

## 2. Principe

Toujours nommer :

- l'objet réellement attendu ;
- l'acteur qui agit ;
- l'action concrète ;
- le résultat observable.

Éviter les mots génériques qui obligent l'acteur à interpréter le système.

## 3. Remplacement du terme « preuve » dans les interfaces

Le concept interne de preuve reste utile pour la traçabilité. Dans les interfaces, il doit être remplacé par l'élément concret demandé.

| Contexte | Terme à afficher |
|---|---|
| Pesée | Ticket de pesée, photo de la balance ou confirmation du peseur |
| Débarquement | Confirmation de l'agent de site, photo du débarquement ou registre du site |
| Livraison | Bon de livraison signé, photo de réception ou confirmation du bénéficiaire |
| Paiement | Reçu, référence du paiement ou confirmation de l'établissement financier |
| Vote communautaire | Feuille de présence, compte rendu signé ou résultat du vote |
| Besoin collectif | Constat terrain, demande de l'organisation ou compte rendu de réunion |
| Financement | Convention, avis de virement ou engagement signé du financeur |
| Affectation des fonds | Décision d'affectation, procès-verbal ou autorisation signée |
| Résultat d'une initiative | Liste des bénéficiaires, constat de réalisation, mesure avant/après ou rapport de suivi |
| Qualité ou conformité | Fiche de contrôle, résultat d'analyse ou confirmation de l'agent habilité |

Ne pas afficher :

- « ajouter une preuve » ;
- « preuve obligatoire » ;
- « prouver la livraison » ;
- « financement prouvé ».

Afficher par exemple :

- « joindre le bon de livraison signé » ;
- « confirmer la réception par le bénéficiaire » ;
- « enregistrer la référence du virement » ;
- « ajouter le compte rendu de la réunion ».

## 4. Autres termes techniques à traduire

| Terme interne | Terme métier visible recommandé |
|---|---|
| Evidence | Justificatif précis selon le contexte |
| Outcome | Résultat obtenu |
| Workflow | Parcours ou étapes de traitement |
| Runtime | Système en fonctionnement |
| Snapshot | Situation actuelle |
| Command | Action demandée |
| Event | Fait enregistré |
| Allocation financière | Affectation des fonds |
| Record | Enregistrer |
| Ingestion | Importer ou recevoir une information |
| Confidence score | Niveau de fiabilité |
| Source reference | Origine de l'information |
| Work queue | Actions à traiter |
| Dashboard | Vue de suivi, poste de travail ou tableau de pilotage selon l'acteur |

## 5. Test obligatoire avant livraison d'un gros lot

Avant de déclarer un gros lot démontrable :

1. relire tous les titres, boutons, messages de réussite et messages d'erreur ;
2. remplacer chaque terme technique par une action ou un objet concret ;
3. vérifier que l'acteur sait immédiatement quoi faire ;
4. vérifier que le terme correspond à sa responsabilité réelle ;
5. vérifier que le vocabulaire est cohérent entre l'interface, l'API publique et les supports de démonstration.

Un gros lot ne peut pas atteindre 80 % sur la dimension « parcours acteur » si son interface nécessite une traduction par l'équipe produit.

## 6. Gouvernance

Tout nouveau terme visible doit être évalué selon trois questions :

- Est-ce le mot qu'utiliserait l'acteur sur le terrain ?
- Sait-il immédiatement quelle action ou quel document est attendu ?
- Le même terme désigne-t-il la même réalité partout dans Mbàmbulaan ?

En cas de doute, préférer l'objet concret au concept générique.
