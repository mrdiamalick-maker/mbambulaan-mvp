# Mbàmbulaan — Seuil de préparation de la première démonstration du produit complet

## 1. Décision

La première démonstration qualifiée de **produit complet** ne peut être organisée que lorsque **tous les gros lots officiels atteignent au moins 80 % de conformité**.

Cette règle vise à avancer rapidement sans produire une démonstration trompeuse, fragile ou déséquilibrée.

Un lot à 80 % n'est pas exhaustif. Il doit néanmoins être suffisamment complet pour démontrer une boucle de valeur réelle, cohérente et défendable devant un acteur terrain, un partenaire institutionnel ou un financeur.

## 2. Gros lots officiels soumis au seuil

1. Identité, rôles, confiance et administration de l'écosystème.
2. Campagnes, retours et visibilité opérationnelle.
3. Débarquement, pesée, qualité, lots et traçabilité.
4. Capacités, services, allocation et coordination.
5. Commerce, logistique, livraison, paiement et règlement.
6. Conservation, transformation, anti-perte et valorisation produit.
7. Community, inclusion et partage de valeur.
8. Durabilité, ressources et résilience climatique.
9. Tensions, incidents, continuité et gestion de crise.
10. Government, Development et pilotage des politiques/programmes.
11. Knowledge, Atlas et intelligence décisionnelle.
12. Finance, assurance et investissement.
13. Intégration, persistance, sécurité, observabilité et exploitation.
14. Expérience acteur et scénario transversal de démonstration.

Aucun lot critique ne peut être exclu du calcul parce qu'il est moins visible dans l'interface.

## 3. Méthode de calcul commune

Chaque gros lot est noté sur 100 points.

| Dimension | Poids | Condition attendue |
|---|---:|---|
| Cadrage métier et flux de valeur | 10 | Problème, acteurs, bénéficiaires, décideur, payeur et résultat attendus sont explicites. |
| Domaine et invariants | 15 | Agrégats, règles, exceptions, statuts, commandes et événements sont cohérents. |
| Exécution API/service | 15 | Le flux principal et ses erreurs peuvent être exécutés sans manipulation interne. |
| Parcours et responsabilités acteurs | 15 | Les acteurs concernés disposent d'actions, décisions et files de travail adaptées. |
| Persistance, audit et qualité des données | 10 | État, preuves, historique, confiance et rejeu sont conservés. |
| Preuve bout en bout et tests | 15 | Un scénario représentatif fonctionne avec tests métier et intégration. |
| Mesure de valeur et pilotage | 10 | Les résultats opérationnels, économiques, sociaux ou environnementaux sont calculés. |
| Sécurité, résilience et intégration transverse | 10 | Habilitations, isolation territoriale, erreurs, reprise et dépendances sont maîtrisées. |

**Score du lot = somme des points validés par dimension.**

Une dimension ne reçoit ses points complets que si elle est démontrable dans le code ou dans un scénario exécutable. Une documentation seule ne suffit pas pour les dimensions d'exécution, acteur, persistance, preuve ou mesure.

## 4. Conditions obligatoires en plus du score de 80 %

Un lot n'est pas déclaré prêt si l'une des conditions suivantes manque, même si son score arithmétique atteint 80 % :

- au moins un parcours acteur réel ;
- une API ou un service exécutable ;
- une persistance ou un mécanisme de continuité adapté au périmètre ;
- un scénario bout en bout automatisé ou rejouable ;
- une mesure de valeur ;
- des contrôles d'accès et de territoire ;
- aucun défaut bloquant connu sur le flux principal ;
- les pipelines obligatoires sont verts sur le head de démonstration.

## 5. Seuil global de démonstration

La démonstration du produit complet est autorisée uniquement si :

1. chaque gros lot obtient un score supérieur ou égal à 80 % ;
2. aucun lot ne comporte une dimension à zéro parmi : exécution, acteur, persistance, preuve, sécurité ;
3. le scénario transversal relie au minimum :
   - acteur identifié ;
   - opération ou besoin visible ;
   - produit ou capacité qualifié ;
   - coordination multi-acteurs ;
   - engagement ou transaction ;
   - exécution prouvée ;
   - valeur économique, communautaire ou environnementale mesurée ;
   - visibilité Government, Development, Knowledge ou Atlas ;
4. les données de démonstration sont cohérentes et non codées en dur dans les interfaces ;
5. les quatre pipelines de référence sont verts ;
6. la PR reste en brouillon tant que le seuil n'est pas formellement atteint et audité.

## 6. Règles d'exécution pour avancer rapidement mais sereinement

- Limiter le travail en cours à **deux gros lots maximum** : un lot principal et un lot transverse de stabilisation.
- Terminer une tranche verticale avant d'ouvrir une nouvelle capability : domaine → API → acteur → persistance → preuve → mesure.
- Corriger immédiatement tout CI rouge lié au head courant avant d'empiler de nouveaux développements.
- Réutiliser les moteurs existants et éviter les doublons de domaine.
- Prioriser les écarts qui empêchent d'atteindre 80 %, pas les fonctionnalités les plus faciles ou les plus visibles.
- Mettre à jour le registre de conformité après chaque tranche significative.
- Ne pas augmenter artificiellement un score avec des écrans descriptifs, des données simulées non traçables ou des tests unitaires isolés.

## 7. Statuts officiels

| Score | Statut | Interprétation |
|---:|---|---|
| 0–39 % | Fragmentaire | Cadrage ou briques isolées. |
| 40–59 % | Partiel | Domaine présent mais boucle de valeur incomplète. |
| 60–79 % | Avancé | Flux principal visible, mais dépendances majeures encore absentes. |
| 80–89 % | Démontrable | Boucle de valeur complète, stable et mesurable sur le périmètre pilote. |
| 90–100 % | Pilote renforcé | Couverture, robustesse et exploitation proches d'un pilote terrain élargi. |

## 8. Définition de « produit complet » pour la première démonstration

Le produit complet ne signifie pas que toutes les ambitions de Mbàmbulaan sont terminées. Il signifie que les infrastructures essentielles fonctionnent ensemble et démontrent la proposition de valeur globale :

> Mbàmbulaan identifie les acteurs, organise les opérations, qualifie les produits et capacités, coordonne les engagements, sécurise l'exécution, conserve les preuves, mesure la valeur créée et rend cette valeur exploitable par les acteurs économiques, communautaires, institutionnels et financiers.

Toute démonstration antérieure peut être qualifiée de **test de capability**, **test de parcours** ou **démonstration technique**, mais pas de démonstration du produit complet.
