# Mbàmbulaan — Carte complète des flux de valeur de la filière pêche artisanale

## 1. Objet du document

Ce document constitue le premier socle du modèle métier de Mbàmbulaan.

Il ne décrit ni des écrans, ni une architecture technique, ni un backlog produit. Il décrit la filière comme un système de flux interdépendants afin d'identifier :

- où la valeur est créée ;
- où elle se dégrade ou se perd ;
- quels acteurs coordonnent ou arbitrent ;
- quelles informations sont nécessaires ;
- quels paiements et contreparties circulent ;
- quelles capacités numériques doivent ensuite être conçues.

Mbàmbulaan est considéré ici comme une infrastructure de coordination au service de la filière, et non comme une simple marketplace ou un outil de gestion.

---

## 2. Principes de modélisation

Chaque étape est analysée selon cinq flux :

1. **Flux physique** : poisson, glace, carburant, emballage, équipements, véhicules, stockage.
2. **Flux d'information** : prévisions, volumes, qualité, disponibilité, besoins, prix, incidents, confirmations.
3. **Flux financier** : avances, paiements, commissions, frais de service, taxes, coûts logistiques, pertes.
4. **Flux de décision** : qui annonce, valide, alloue, arbitre, achète, paie, contrôle ou assume le risque.
5. **Flux de confiance** : preuves, réputation, traçabilité, contrôle, conformité et responsabilité.

---

## 3. Vue d'ensemble du flux de valeur

```text
Préparation de campagne
        ↓
Départ et activité en mer
        ↓
Capture et conservation à bord
        ↓
Annonce et préparation du retour
        ↓
Débarquement, contrôle et pesée
        ↓
Constitution des lots
        ↓
Première allocation commerciale
        ↓
Conservation, transformation ou transport
        ↓
Distribution et revente
        ↓
Consommation finale
        ↓
Règlement, justification et pilotage sectoriel
```

Ce flux n'est pas strictement linéaire. Des boucles existent :

- réallocation vers transformation en cas de baisse de qualité ;
- réorientation vers un autre site en cas de saturation ;
- recherche urgente de glace ou de transport ;
- renégociation de prix ;
- arbitrage institutionnel en cas de pénurie, tension ou crise.

---

## 4. Étape 1 — Préparation de campagne

### Objectif métier

Permettre à l'unité de pêche de partir avec les ressources nécessaires, un niveau de risque acceptable et une destination de retour plausible.

### Acteurs principaux

- propriétaire ou armateur artisanal ;
- capitaine ;
- équipage ;
- fournisseur de carburant ;
- fournisseur de glace ;
- fournisseur d'équipements et d'appâts ;
- organisation de pêcheurs ;
- financeur ou avanceur informel ;
- autorité locale ou maritime.

### Flux physiques

- carburant ;
- glace ;
- appâts ;
- vivres ;
- filets et équipements ;
- moyens de sécurité ;
- pièces de rechange.

### Flux d'information

- date et heure prévues de départ ;
- pirogue, équipage et capitaine ;
- zone de pêche envisagée ;
- autonomie disponible ;
- météo et conditions de mer ;
- état du matériel ;
- besoin estimé en carburant et glace ;
- engagements ou avances reçus.

### Flux financiers

- achat ou avance de carburant ;
- achat ou crédit fournisseur pour la glace ;
- partage du financement entre propriétaire, capitaine, équipage ou acheteur ;
- dette informelle conditionnant parfois la vente future.

### Décisions critiques

- autoriser ou reporter le départ ;
- choisir le niveau d'investissement dans la campagne ;
- accepter ou refuser une avance liée à un futur droit d'achat ;
- choisir le site de retour pressenti.

### Frictions et pertes de valeur

- sous-financement du départ ;
- dépendance à des avances informelles ;
- équipement incomplet ;
- faible visibilité sur les ressources réellement disponibles ;
- absence de preuve sur les engagements financiers ;
- départ sans glace suffisante ou sans moyen de sécurité adapté.

### Valeur capturable par Mbàmbulaan

- visibilité sur les besoins de campagne ;
- coordination avec fournisseurs de carburant, glace et équipements ;
- traçabilité des avances et engagements ;
- réduction des départs à risque ou sous-équipés ;
- meilleure prévisibilité des futurs retours.

---

## 5. Étape 2 — Départ et activité en mer

### Objectif métier

Suivre le statut de l'unité de pêche et produire une visibilité minimale sur son activité sans imposer une surveillance irréaliste.

### Acteurs principaux

- capitaine ;
- équipage ;
- propriétaire ;
- relais à terre ;
- organisation de pêcheurs ;
- autorités de sécurité maritime.

### Flux physiques

- consommation progressive de carburant, glace et vivres ;
- déplacement de l'unité de pêche ;
- accumulation des captures.

### Flux d'information

- heure réelle de départ ;
- statut en mer ;
- incidents ;
- estimation du retour ;
- estimation approximative des captures ;
- besoins éventuels d'assistance.

### Flux financiers

- coûts déjà engagés ;
- exposition financière croissante en cas de prolongation ou d'incident.

### Décisions critiques

- poursuivre ou interrompre la campagne ;
- modifier la zone de pêche ;
- annoncer un retour anticipé ;
- solliciter une assistance.

### Frictions et pertes de valeur

- absence de visibilité pour les acteurs à terre ;
- retard non anticipé ;
- impossibilité de préparer les services de retour ;
- difficulté à distinguer un retard normal d'une situation de danger.

### Valeur capturable par Mbàmbulaan

- statut déclaratif léger ;
- mise à jour simple de l'heure estimée de retour ;
- déclenchement d'alertes proportionnées ;
- préparation progressive du débarquement.

---

## 6. Étape 3 — Capture et conservation à bord

### Objectif métier

Préserver la qualité du poisson et produire une première estimation exploitable de l'offre à venir.

### Acteurs principaux

- capitaine ;
- équipage ;
- propriétaire ;
- acheteur ou mareyeur lié par avance ;
- relais à terre.

### Flux physiques

- captures par espèce ;
- glace utilisée ;
- contenants ;
- séparation éventuelle des espèces ou qualités.

### Flux d'information

- espèces capturées ;
- estimation des volumes ;
- qualité perçue ;
- niveau de glace restant ;
- heure probable de retour ;
- destination de débarquement.

### Flux financiers

- valeur potentielle de la capture ;
- risque de perte lié à la conservation ;
- exposition du financeur ou de l'acheteur ayant avancé des fonds.

### Décisions critiques

- retourner plus tôt ;
- poursuivre la pêche ;
- changer de site de débarquement ;
- alerter sur un besoin urgent de glace, transport ou froid.

### Frictions et pertes de valeur

- estimation imprécise ;
- information tardive ;
- mauvaise conservation ;
- incapacité à préparer un débouché adapté ;
- chute rapide de la valeur marchande.

### Valeur capturable par Mbàmbulaan

- estimation structurée de la capture ;
- classification simple du niveau de confiance ;
- déclenchement anticipé des besoins de service ;
- réduction des pertes de qualité.

---

## 7. Étape 4 — Annonce et préparation du retour

### Objectif métier

Transformer une information de retour en plan de coordination concret.

### Acteurs principaux

- capitaine ou relais à terre ;
- gestionnaire du site de débarquement ;
- peseur ;
- manutentionnaire ;
- fournisseur de glace ;
- opérateur de froid ;
- transporteur ;
- mareyeur ;
- transformateur ;
- coordinateur territorial.

### Flux physiques préparés

- capacité de quai ;
- glace ;
- bacs et emballages ;
- personnel de manutention ;
- place en chambre froide ;
- véhicule disponible ;
- capacité de transformation.

### Flux d'information

- pirogue attendue ;
- heure estimée d'arrivée ;
- espèces et volumes estimés ;
- niveau de confiance ;
- services nécessaires ;
- contraintes du site ;
- acheteurs ou débouchés pressentis.

### Flux financiers

- coût attendu des services ;
- disponibilité budgétaire ;
- prix indicatifs ;
- engagement éventuel d'un acheteur.

### Décisions critiques

- accepter le site de retour ;
- réorienter vers un autre site ;
- réserver ou non une capacité ;
- prioriser une arrivée ;
- déclencher une coordination urgente.

### Frictions et pertes de valeur

- annonce tardive ;
- saturation du quai ;
- absence de glace ou de transport ;
- acteurs non informés ;
- capacités réservées mais non utilisées ;
- conflit entre plusieurs arrivées simultanées.

### Valeur capturable par Mbàmbulaan

- visibilité partagée sur les retours ;
- préparation des ressources ;
- arbitrage des priorités ;
- réduction des attentes et congestions ;
- coordination préventive plutôt que corrective.

---

## 8. Étape 5 — Débarquement, contrôle et pesée

### Objectif métier

Établir une réalité opérationnelle commune sur l'arrivée, le volume et les premières caractéristiques du produit.

### Acteurs principaux

- capitaine et équipage ;
- gestionnaire de quai ;
- peseur ;
- agent de contrôle ;
- mareyeur ;
- propriétaire ;
- organisation de pêcheurs ;
- services publics concernés.

### Flux physiques

- poisson débarqué ;
- manutention ;
- tri initial ;
- glace complémentaire ;
- matériels de pesée.

### Flux d'information

- heure réelle d'arrivée ;
- confirmation du débarquement ;
- poids total ;
- méthode de pesée ;
- niveau de confiance ;
- qualité initiale ;
- écarts entre estimation et réalité.

### Flux financiers

- frais de quai, pesée, manutention ou glace ;
- base de calcul de la valeur marchande ;
- justification d'engagements antérieurs.

### Décisions critiques

- valider ou contester la mesure ;
- déclencher un contrôle complémentaire ;
- orienter le produit vers vente, froid ou transformation ;
- traiter immédiatement un risque de perte.

### Frictions et pertes de valeur

- mesure contestée ;
- absence de preuve ;
- pesée tardive ou estimée ;
- manipulation multiple du poisson ;
- conflit entre propriétaires, pêcheurs et acheteurs.

### Valeur capturable par Mbàmbulaan

- horodatage et confirmation ;
- traçabilité de la mesure ;
- niveau explicite de confiance ;
- réduction des litiges ;
- production d'une référence commune pour la suite.

---

## 9. Étape 6 — Constitution des lots

### Objectif métier

Transformer une masse débarquée en unités de décision, d'allocation et de transaction.

### Acteurs principaux

- gestionnaire du site ;
- peseur ;
- mareyeur ;
- transformateur ;
- propriétaire ;
- agent qualité ;
- coordinateur.

### Flux physiques

- tri par espèce ;
- séparation par qualité ;
- conditionnement ;
- affectation vers glace, froid, transport ou transformation.

### Flux d'information

- espèce ;
- poids ;
- qualité ;
- état de conservation ;
- disponibilité ;
- prix indicatif ;
- destination ou réservation.

### Flux financiers

- valorisation potentielle par lot ;
- coût de conservation ou de transport ;
- marge attendue selon le débouché.

### Décisions critiques

- taille et composition du lot ;
- priorité de vente ;
- allocation à un acheteur ;
- orientation vers transformation ;
- déclassement qualité.

### Frictions et pertes de valeur

- absence de lotissement clair ;
- double réservation ;
- poids incohérents ;
- qualité non documentée ;
- difficulté à rapprocher offre et besoin.

### Valeur capturable par Mbàmbulaan

- lot comme unité de coordination ;
- disponibilité fiable ;
- meilleure affectation des services ;
- préparation du matching commercial et logistique ;
- traçabilité des décisions.

---

## 10. Étape 7 — Première allocation commerciale

### Objectif métier

Affecter les lots aux débouchés les plus pertinents avant dégradation de la qualité ou perte de valeur.

### Acteurs principaux

- mareyeurs ;
- détaillants ;
- grossistes ;
- transformateurs ;
- restaurateurs ;
- distributeurs ;
- organisations communautaires ;
- coordinateurs de marché.

### Flux physiques

- lots disponibles ;
- réservations partielles ;
- enlèvement ;
- transfert vers froid ou transformation.

### Flux d'information

- besoin d'achat ;
- espèce ;
- quantité ;
- qualité ;
- localisation ;
- délai ;
- prix ;
- conditions de paiement ;
- statut de réservation.

### Flux financiers

- prix d'achat ;
- acompte éventuel ;
- commission ;
- frais de réservation ou de mise en relation ;
- coût des services complémentaires.

### Décisions critiques

- accepter une offre ;
- fractionner un lot ;
- prioriser un acheteur ;
- réserver avec ou sans acompte ;
- annuler ou réallouer.

### Frictions et pertes de valeur

- asymétrie d'information ;
- marchandage tardif ;
- acheteur absent ;
- double engagement ;
- vente forcée à bas prix ;
- absence de preuve des conditions convenues.

### Valeur capturable par Mbàmbulaan

- rapprochement offre-besoin ;
- preuve des engagements ;
- réduction du temps de vente ;
- meilleure concurrence entre débouchés ;
- possibilité de monétisation transactionnelle.

---

## 11. Étape 8 — Conservation, transformation ou transport

### Objectif métier

Maintenir ou augmenter la valeur du produit jusqu'au prochain maillon.

### Acteurs principaux

- opérateur de chambre froide ;
- fournisseur de glace ;
- transporteur ;
- transformateur artisanal ou industriel ;
- mareyeur ;
- manutentionnaire ;
- coordinateur territorial.

### Flux physiques

- glace ;
- capacité frigorifique ;
- véhicules ;
- caisses et emballages ;
- lignes ou espaces de transformation ;
- produit brut, conservé ou transformé.

### Flux d'information

- capacité disponible ;
- créneau ;
- température ou état de conservation ;
- lot pris en charge ;
- heure de départ et d'arrivée ;
- incident ;
- quantité traitée ;
- pertes constatées.

### Flux financiers

- coût du froid ;
- coût de glace ;
- coût du transport ;
- coût de transformation ;
- paiement du prestataire ;
- marge additionnelle créée par la transformation.

### Décisions critiques

- allouer une capacité ;
- choisir le prestataire ;
- prioriser un lot à risque ;
- réorienter un lot ;
- accepter un coût pour éviter une perte supérieure.

### Frictions et pertes de valeur

- capacité invisible ou mal actualisée ;
- réservation non honorée ;
- rupture de froid ;
- véhicule non disponible ;
- retard ;
- absence de responsabilité en cas de dommage.

### Valeur capturable par Mbàmbulaan

- annuaire opérationnel des capacités ;
- réservation et allocation ;
- gestion des priorités ;
- suivi des engagements ;
- preuves de prise en charge ;
- commission ou frais de coordination.

---

## 12. Étape 9 — Distribution et revente

### Objectif métier

Acheminer le produit vers les marchés et clients en maximisant la rotation, la marge et la qualité résiduelle.

### Acteurs principaux

- grossistes ;
- mareyeurs ;
- détaillants ;
- marchés ;
- restaurants ;
- hôtels ;
- distributeurs ;
- transformateurs ;
- consommateurs institutionnels.

### Flux physiques

- lots ou sous-lots ;
- produits frais, réfrigérés ou transformés ;
- emballages ;
- livraison finale.

### Flux d'information

- disponibilité ;
- prix ;
- demande ;
- destination ;
- délai ;
- qualité ;
- invendus ;
- retour client.

### Flux financiers

- prix de revente ;
- marge ;
- frais de place ou de marché ;
- paiement différé ;
- pertes sur invendus.

### Décisions critiques

- choix du canal ;
- répartition du stock ;
- baisse de prix ;
- redirection vers transformation ;
- crédit accordé au client.

### Frictions et pertes de valeur

- manque de visibilité sur la demande ;
- surstock local ;
- prix très volatils ;
- paiement tardif ;
- invendus ;
- absence de traçabilité commerciale.

### Valeur capturable par Mbàmbulaan

- remontée structurée des besoins ;
- amélioration de la rotation ;
- réallocation des invendus ;
- données de prix et de demande ;
- services de confiance entre vendeurs et acheteurs.

---

## 13. Étape 10 — Consommation finale

### Objectif métier

Fournir un produit accessible, sûr et conforme aux attentes tout en faisant remonter une information utile vers l'amont.

### Acteurs principaux

- ménages ;
- restaurants ;
- hôtels ;
- cantines ;
- commerces ;
- acheteurs institutionnels.

### Flux physiques

- produit consommé ;
- déchets et pertes finales.

### Flux d'information

- origine ;
- fraîcheur ;
- qualité ;
- prix ;
- disponibilité ;
- satisfaction ;
- incident sanitaire éventuel.

### Flux financiers

- paiement final ;
- taxe ou frais associés ;
- valeur répartie entre les maillons.

### Décisions critiques

- choix du produit et du vendeur ;
- acceptation du prix ;
- signalement d'un défaut ;
- fidélisation.

### Frictions et pertes de valeur

- manque de confiance ;
- qualité irrégulière ;
- absence d'information sur l'origine ;
- prix final déconnecté de la rémunération à l'amont.

### Valeur capturable par Mbàmbulaan

- traçabilité ciblée ;
- confiance ;
- boucle de retour qualité ;
- meilleure compréhension de la demande finale.

---

## 14. Étape 11 — Règlement, justification et pilotage sectoriel

### Objectif métier

Fermer la boucle économique, produire des preuves et transformer les opérations en capacité de décision collective.

### Acteurs principaux

- pêcheurs et propriétaires ;
- mareyeurs et acheteurs ;
- prestataires ;
- organisations professionnelles ;
- collectivités ;
- ministère ;
- bailleurs et programmes ;
- organismes de contrôle ;
- assureurs ou financeurs futurs.

### Flux physiques

- justificatifs, reçus ou preuves lorsqu'ils existent encore sous forme papier.

### Flux d'information

- volumes débarqués ;
- espèces ;
- prix ;
- services consommés ;
- capacités mobilisées ;
- incidents ;
- pertes évitées ;
- délais de paiement ;
- résultats territoriaux.

### Flux financiers

- règlement des achats ;
- paiement des prestataires ;
- commissions ;
- remboursement d'avances ;
- taxes ;
- subventions ou compensations ;
- rémunération de Mbàmbulaan.

### Décisions critiques

- valider un service rendu ;
- déclencher ou refuser un paiement ;
- arbitrer un litige ;
- soutenir un territoire ;
- investir dans une capacité ;
- ajuster une politique publique.

### Frictions et pertes de valeur

- paiements non traçables ;
- retards ;
- difficulté à prouver l'exécution ;
- données fragmentées ;
- décisions publiques prises sur des données tardives ou incomplètes.

### Valeur capturable par Mbàmbulaan

- preuve d'exécution ;
- mesure des résultats ;
- indicateurs territoriaux ;
- données sectorielles ;
- services institutionnels ;
- scoring futur de fiabilité ou d'accès à des services financiers.

---

## 15. Flux transversaux critiques

### 15.1 Flux de qualité

```text
Conservation à bord
→ Contrôle au débarquement
→ Classification du lot
→ Suivi du froid
→ Contrôle à réception
→ Retour client
```

### 15.2 Flux de disponibilité

```text
Besoin déclaré
→ Capacité identifiée
→ Capacité réservée
→ Capacité confirmée
→ Service exécuté
→ Résultat enregistré
```

### 15.3 Flux de confiance

```text
Déclaration
→ Confirmation
→ Vérification
→ Engagement
→ Preuve d'exécution
→ Réputation
```

### 15.4 Flux de tension

```text
Écart ou pénurie détecté
→ Tension qualifiée
→ Responsable identifié
→ Engagement pris
→ Action suivie
→ Résolution prouvée
→ Valeur créée ou perte évitée
```

### 15.5 Flux financier

```text
Besoin de financement ou achat
→ Conditions convenues
→ Avance ou réservation
→ Exécution
→ Validation
→ Paiement
→ Réconciliation
```

---

## 16. Principales ruptures de coordination

Les ruptures les plus structurantes pour Mbàmbulaan sont :

1. retour non annoncé ou mal estimé ;
2. capacité de quai, glace, froid ou transport inconnue ;
3. absence de référence commune sur le poids et la qualité ;
4. difficulté à transformer une capture en lots exploitables ;
5. besoins acheteurs dispersés et informels ;
6. engagements non tracés ;
7. absence de responsable clair en cas de tension ;
8. paiement ou service difficile à prouver ;
9. perte de valeur non mesurée ;
10. données sectorielles produites trop tard pour décider.

---

## 17. Zones de valeur pour Mbàmbulaan

La valeur potentielle de Mbàmbulaan se concentre dans six zones :

### A. Anticipation

Prévoir les retours, volumes, besoins et congestions.

### B. Confiance

Créer une référence partagée sur les acteurs, événements, poids, lots et engagements.

### C. Allocation

Affecter plus rapidement les lots, capacités et services aux bons besoins.

### D. Coordination

Transformer les tensions en responsabilités, actions, échéances et résultats.

### E. Transaction et règlement

Sécuriser les conditions convenues, l'exécution et les paiements.

### F. Pilotage sectoriel

Produire des indicateurs fiables pour les organisations, collectivités, programmes et autorités.

---

## 18. Hypothèses à valider sur le terrain

Cette carte est un modèle de travail. Les hypothèses suivantes doivent être validées auprès des acteurs :

- qui annonce réellement le retour ;
- qui possède l'information la plus fiable sur les volumes ;
- qui décide de l'affectation d'un lot ;
- qui contrôle ou conteste la pesée ;
- qui réserve la glace, le froid ou le transport ;
- comment sont financées les campagnes ;
- quels engagements commerciaux sont liés à des avances ;
- qui supporte les pertes en cas de retard ;
- quels services sont réellement facturés ;
- quelles données le ministère et les collectivités considèrent comme prioritaires ;
- qui accepterait de payer durablement pour la coordination.

---

## 19. Conséquence produit immédiate

Aucune nouvelle page majeure ne doit être développée sur la seule base d'un parcours supposé.

La prochaine étape consiste à dériver de cette carte :

1. les infrastructures numériques ;
2. leurs capacités métier ;
3. les acteurs utilisateurs, bénéficiaires, décideurs et payeurs ;
4. les mécanismes de revenus associés ;
5. le périmètre MVP réellement prioritaire.

Les écrans déjà créés doivent être considérés comme des prototypes exploratoires et non comme l'architecture produit définitive.
