# 10 — Operating Model produit

## 1. Finalité

L'Operating Model produit définit comment Mbàmbulaan transforme sa vision, ses priorités et les besoins du terrain en décisions, livraisons et apprentissages continus.

Il précise :

- qui décide ;
- qui propose ;
- qui exécute ;
- qui valide ;
- à quelle cadence ;
- sur quelles données ;
- avec quels critères d'arbitrage ;
- comment le terrain influence le produit ;
- comment les priorités restent cohérentes avec le modèle économique.

L'objectif est d'éviter deux dérives :

- un produit piloté uniquement par les demandes des partenaires ;
- un produit construit uniquement par l'équipe technique sans validation métier.

## 2. Principes directeurs

### 2.1 Le terrain éclaire, il ne gouverne pas seul

Les retours terrain sont indispensables, mais chaque demande doit être arbitrée selon :

- sa valeur pour la coordination ;
- sa fréquence ;
- sa portée ;
- son coût ;
- son impact sur le modèle économique ;
- sa cohérence avec l'architecture produit.

### 2.2 Le sponsor ne définit pas le produit

Un ministère, une collectivité, un bailleur ou un partenaire peut financer un pilote sans devenir propriétaire de la vision produit.

Mbàmbulaan doit préserver :

- sa propriété intellectuelle ;
- son architecture ;
- ses moteurs métier ;
- sa capacité de réplication ;
- son indépendance stratégique.

### 2.3 Une décision produit doit être explicable

Chaque arbitrage important doit préciser :

- le problème traité ;
- les utilisateurs concernés ;
- la valeur attendue ;
- l'hypothèse testée ;
- le coût estimé ;
- les dépendances ;
- la métrique de succès ;
- la raison du choix.

### 2.4 Le produit doit rester sobre

L'équipe doit privilégier :

- les flux critiques ;
- les capacités réutilisables ;
- les standards ;
- les patterns communs ;
- les décisions réversibles ;
- les livraisons courtes.

## 3. Rôles clés

### 3.1 Responsable produit

Responsabilités :

- porter la vision ;
- maintenir le backlog ;
- arbitrer les priorités ;
- formaliser les hypothèses ;
- coordonner design, tech et terrain ;
- suivre les KPI ;
- protéger la cohérence du produit.

Il ne doit pas devenir simple collecteur de demandes.

### 3.2 Responsable terrain et partenariats

Responsabilités :

- mobiliser les acteurs ;
- comprendre les processus réels ;
- organiser les tests ;
- détecter les blocages d'adoption ;
- documenter les retours ;
- maintenir la relation avec les relais locaux.

### 3.3 Référent métier

Responsabilités :

- clarifier les pratiques ;
- valider les termes ;
- expliquer les contraintes ;
- identifier les écarts entre processus formels et réalité terrain ;
- contribuer aux critères d'acceptation.

### 3.4 Responsable technique

Responsabilités :

- garantir l'architecture ;
- estimer les impacts ;
- sécuriser la qualité ;
- gérer la dette technique ;
- assurer la cohérence des contrats et événements ;
- rendre visible le coût des choix.

### 3.5 Designer produit

Responsabilités :

- simplifier les parcours ;
- tester la compréhension ;
- adapter les interfaces aux usages terrain ;
- garantir l'accessibilité ;
- maintenir les patterns fonctionnels.

### 3.6 Responsable données et impact

Responsabilités :

- définir les indicateurs ;
- contrôler la qualité ;
- documenter les méthodes ;
- produire les analyses ;
- éviter les interprétations trompeuses.

### 3.7 Sponsor ou partenaire institutionnel

Responsabilités :

- faciliter l'accès ;
- légitimer le pilote ;
- mobiliser les organisations ;
- contribuer aux décisions de gouvernance ;
- financer ou soutenir le déploiement.

Il ne valide pas seul le backlog.

## 4. Matrice de décision

### Vision et positionnement

- décideur : direction Mbàmbulaan ;
- contributeurs : produit, business, terrain ;
- consultés : partenaires stratégiques.

### Priorisation du backlog

- décideur : responsable produit ;
- contributeurs : technique, design, terrain, business ;
- informés : partenaires du pilote.

### Architecture technique

- décideur : responsable technique ;
- validation de cohérence : responsable produit ;
- consultation : sécurité, data.

### Choix d'un territoire pilote

- décision conjointe : produit, terrain, direction ;
- consultation : sponsor et acteurs locaux.

### Ajout d'une nouvelle capacité majeure

- décision : direction + produit ;
- avis obligatoire : technique, business, terrain.

### Changement du modèle économique

- décision : direction ;
- contribution : produit, finance, partenariats.

## 5. Instances de gouvernance

### 5.1 Product Review hebdomadaire

Participants : produit, design, technique, terrain.

Objectifs :

- examiner les retours ;
- suivre les hypothèses ;
- arbitrer les priorités courtes ;
- préparer les décisions.

### 5.2 Delivery Review bimensuelle

Objectifs :

- démontrer les incréments ;
- vérifier les critères d'acceptation ;
- identifier les écarts ;
- décider des corrections.

### 5.3 Comité pilote mensuel

Participants : Mbàmbulaan, coordinateur local, partenaires clés.

Objectifs :

- suivre l'adoption ;
- traiter les blocages ;
- suivre les KPI ;
- décider des ajustements opérationnels.

### 5.4 Revue stratégique trimestrielle

Objectifs :

- évaluer la trajectoire ;
- revoir le modèle économique ;
- décider des nouveaux territoires ;
- arbitrer les investissements ;
- confirmer les priorités structurantes.

## 6. Cadence produit

### Hebdomadaire

- analyse des usages ;
- retours terrain ;
- suivi des incidents ;
- revue du backlog ;
- préparation des tests.

### Bimensuelle

- livraison ;
- démonstration ;
- tests utilisateurs ;
- arbitrage de l'incrément suivant.

### Mensuelle

- revue des KPI ;
- adoption ;
- qualité ;
- coûts ;
- risques ;
- dépendances institutionnelles.

### Trimestrielle

- stratégie ;
- modèle économique ;
- architecture ;
- déploiement ;
- financement.

## 7. Cycle de décision produit

```text
Problème observé
→ Analyse
→ Hypothèse
→ Priorisation
→ Conception
→ Développement
→ Test terrain
→ Mesure
→ Décision : poursuivre, ajuster ou arrêter
```

Aucune feature majeure ne doit passer directement de la demande au développement.

## 8. Collecte des besoins

Les besoins peuvent venir de :

- acteurs terrain ;
- coordinateurs ;
- institutions ;
- données d'usage ;
- incidents ;
- stratégie commerciale ;
- contraintes réglementaires ;
- opportunités de financement.

Chaque besoin doit être reformulé en problème métier.

Exemple :

« Il faut un tableau Excel dans l'application » devient :

« Le coordinateur doit comparer rapidement les situations et identifier celles qui nécessitent une action. »

## 9. Critères d'arbitrage

Chaque demande est évaluée selon une note ou appréciation sur :

- impact coordination ;
- impact utilisateur ;
- impact économique ;
- urgence ;
- fréquence ;
- réutilisabilité ;
- complexité ;
- dépendance ;
- risque ;
- nécessité pour le pilote.

## 10. Règle de refus

Mbàmbulaan doit savoir dire non à :

- une personnalisation propre à un seul partenaire ;
- une fonctionnalité qui contourne les moteurs métier ;
- une demande qui transforme le produit en ERP ;
- une demande non mesurable ;
- une demande financée mais incompatible avec la stratégie ;
- un développement sans propriétaire métier.

## 11. Gestion des retours terrain

Chaque retour doit être qualifié :

- incompréhension ;
- problème d'usage ;
- besoin métier ;
- bug ;
- manque de formation ;
- problème de processus ;
- contrainte de connectivité ;
- demande spécifique.

Tous les retours ne doivent pas devenir des stories.

## 12. Product Discovery

Le Discovery doit précéder le Delivery.

Méthodes :

- entretiens ;
- observation terrain ;
- tests de compréhension ;
- prototypes ;
- analyse de données ;
- simulation de parcours ;
- expérimentation manuelle.

Objectif : réduire l'incertitude avant le développement.

## 13. Product Delivery

Le Delivery doit produire des incréments :

- testables ;
- démontrables ;
- utilisables ;
- mesurables ;
- réversibles autant que possible.

Chaque incrément doit être relié à une hypothèse.

## 14. Gestion de la dette

La dette peut être :

- technique ;
- UX ;
- data ;
- opérationnelle ;
- documentaire ;
- organisationnelle.

Une part de capacité doit être réservée régulièrement à sa réduction.

## 15. Gouvernance des données

Les décisions sur les données doivent préciser :

- propriétaire ;
- finalité ;
- source ;
- qualité ;
- accès ;
- durée de conservation ;
- sensibilité ;
- possibilité de correction.

## 16. Gouvernance terminologique

Le vocabulaire métier doit être cohérent.

Principes :

- éviter les termes juridiques ou techniques inutiles ;
- tester les libellés avec les acteurs ;
- documenter les termes ambigus ;
- distinguer vocabulaire interne et vocabulaire utilisateur ;
- mettre à jour le lexique métier.

Le terme « preuve » ne doit pas être utilisé comme libellé générique dans les interfaces.

## 17. Relation avec les partenaires

Chaque partenariat doit préciser :

- objectifs ;
- responsabilités ;
- gouvernance ;
- données ;
- financement ;
- propriété intellectuelle ;
- durée ;
- sortie ;
- réutilisation des apprentissages.

## 18. Relation avec le ministère

Le ministère peut jouer plusieurs rôles :

- sponsor ;
- facilitateur ;
- financeur ;
- client ;
- partenaire de déploiement ;
- prescripteur.

Ces rôles doivent être distingués.

Une contribution financière ne doit pas automatiquement donner :

- le contrôle du produit ;
- la propriété du code ;
- une exclusivité nationale ;
- le pouvoir d'imposer toutes les priorités.

## 19. Operating Model du pilote

### Avant le pilote

- cadrage ;
- sélection du territoire ;
- nomination des relais ;
- baseline ;
- formation ;
- préparation du support.

### Pendant le pilote

- animation hebdomadaire ;
- support ;
- suivi des situations ;
- revue des KPI ;
- corrections rapides ;
- documentation des décisions.

### Après le pilote

- bilan ;
- décision go/pivot/stop ;
- offre commerciale ;
- plan de déploiement ;
- recherche de financement ;
- mise à jour du Blueprint.

## 20. Artefacts de pilotage

- vision produit ;
- roadmap ;
- backlog ;
- journal des décisions ;
- registre des risques ;
- tableau de bord KPI ;
- synthèse des retours terrain ;
- modèle économique ;
- plan de déploiement ;
- lexique métier.

## 21. Conditions de passage à l'échelle

Mbàmbulaan ne doit pas se déployer sur un nouveau territoire si :

- le flux principal n'est pas stabilisé ;
- l'adoption dépend entièrement de l'équipe centrale ;
- aucun relais local n'est opérationnel ;
- le coût de support est inconnu ;
- la valeur n'est pas démontrée ;
- le financement n'est pas identifié.

## 22. Indicateurs de santé produit

- taux d'utilisation des capacités critiques ;
- délai de résolution des incidents ;
- volume de demandes spécifiques ;
- dette technique ;
- satisfaction des utilisateurs clés ;
- coût de support ;
- taux de rétention des organisations ;
- proportion du backlog liée à la stratégie.

## 23. Principe directeur

> L'Operating Model de Mbàmbulaan doit permettre de rester proche du terrain sans devenir prisonnier des demandes locales, de travailler avec les institutions sans perdre l'indépendance du produit et de livrer uniquement ce qui améliore réellement la coordination et la viabilité économique.
