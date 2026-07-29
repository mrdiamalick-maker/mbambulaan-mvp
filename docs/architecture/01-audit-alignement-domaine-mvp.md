# Mbàmbulaan — Audit d'alignement du domaine avec le MVP

## 1. Décision

Le dépôt dispose déjà d'un modèle métier solide et d'une boucle MVP explicite. Le problème principal n'est pas l'absence de moteurs métier, mais l'écart entre :

- la documentation produit ;
- le domaine réellement implémenté ;
- les parcours visibles ;
- les pages de démonstration récemment ajoutées ;
- les capacités exclues du MVP.

La priorité est donc la consolidation d'une seule tranche verticale fonctionnelle :

```text
Retour annoncé
→ besoin de service
→ capacité identifiée
→ réservation
→ exécution du service
→ tension si écart
→ engagement
→ débarquement
→ pesée
→ lot
→ résultat et valeur documentée
```

Aucun nouveau domaine autonome ne doit être ajouté avant que cette boucle soit navigable, testable et cohérente de bout en bout.

---

## 2. Référentiels utilisés

L'audit s'appuie sur :

- `docs/modele-metier/02-infrastructures-numeriques.md` ;
- `docs/modele-metier/03-capacites-metier.md` ;
- `docs/modele-metier/04-cartographie-acteurs.md` ;
- `docs/modele-metier/05-modeles-economiques.md` ;
- `docs/modele-metier/06-roadmap-mvp.md` ;
- `docs/modele-metier/07-decision-reprise-developpement.md` ;
- `src/domain/types.ts` ;
- `src/domain/data.ts` ;
- `src/domain/repositories.ts` ;
- `src/domain/selectors.ts` ;
- `src/domain/services.ts` ;
- `src/domain/validation.ts` ;
- les parcours `retours-attendus`, `debarquements`, `pesees`, `lots` et `tensions`.

---

## 3. Synthèse exécutive

### 3.1 Ce qui est déjà correctement modélisé

Le domaine couvre déjà les objets structurants de la boucle MVP :

- acteurs, organisations, territoires et sites ;
- pirogues ;
- retours attendus ;
- besoins de service ;
- capacités disponibles dans le temps ;
- allocations de service ;
- exécutions avec preuves ;
- débarquements ;
- pesées ;
- lots ;
- tensions ;
- engagements ;
- résultats et valeur en XOF.

Les services métier couvrent déjà :

- l'annonce d'un retour ;
- la création d'un besoin de service ;
- la déclaration d'une capacité ;
- la réservation d'une capacité ;
- la confirmation d'exécution ;
- la confirmation d'un débarquement ;
- l'enregistrement d'une pesée ;
- la création d'un lot ;
- le signalement d'une tension ;
- la création d'un engagement ;
- l'enregistrement d'un résultat.

Conclusion : le moteur de coordination des services n'était pas à inventer. Il existait déjà dans le domaine.

### 3.2 Ce qui manque réellement

Le principal déficit est l'intégration produit :

- les écrans existants ne rendent pas encore toute la boucle navigable ;
- les pages récemment ajoutées utilisent surtout des données statiques et ne s'appuient pas clairement sur le domaine ;
- certains états et règles sont présents dans le code mais invisibles dans les parcours ;
- les responsabilités, preuves, méthodes de calcul et niveaux de confiance ne sont pas toujours explicités dans l'interface ;
- la progression du MVP n'est pas lisible dans une vue unique.

### 3.3 Risque majeur identifié

Les pages suivantes introduites récemment présentent un risque de duplication ou de dérive :

- `coordination-services` ;
- `engagements-commercials` ;
- `coordination-territoriale` ;
- `resilience-filiere` ;
- `financement-services`.

Elles peuvent être utiles comme maquettes de vision, mais elles ne doivent pas être considérées comme des domaines fonctionnels livrés tant qu'elles ne reposent pas sur les entités, services, sélecteurs et règles du domaine.

La page `financement-services` est en contradiction directe avec le périmètre MVP documenté, qui exclut le crédit et le financement. Elle doit être classée comme vision future, déplacée hors du parcours MVP ou supprimée de la navigation principale.

---

## 4. Matrice de couverture des capacités MVP

| Capacité | Couverture domaine | Couverture parcours | Statut | Décision |
|---|---|---|---|---|
| Enregistrer acteurs et organisations | Oui | Partielle | Partiellement couverte | Garder, améliorer l'administration |
| Rattacher acteur, territoire et site | Oui | Partielle | Partiellement couverte | Rendre les rattachements visibles |
| Niveaux de confiance | Oui | Faible | Partiellement couverte | Afficher source, auteur et niveau |
| Annoncer un retour attendu | Oui | Oui | Couverte | Consolider dans la boucle globale |
| Mettre à jour l'ETA | Modèle compatible | À vérifier | Partiellement couverte | Ajouter action et historique si absent |
| Déclarer un besoin de service | Oui | Insuffisante | Partiellement couverte | Priorité P0 produit |
| Confirmer une arrivée | Oui via débarquement | Oui | Couverte | Clarifier le passage retour → arrivée |
| Enregistrer un débarquement | Oui | Oui | Couverte | Conserver |
| Enregistrer une pesée | Oui | Oui | Couverte | Conserver |
| Constituer un lot | Oui | Oui | Couverte | Conserver |
| Contrôler cohérence poids / lots | Validation à confirmer | Peu visible | Partielle | Afficher le reliquat et bloquer les dépassements |
| Déclarer une capacité | Oui | Insuffisante | Partiellement couverte | Priorité P0 produit |
| Visualiser disponibilité | Oui | Insuffisante | Partiellement couverte | Construire une vue opérationnelle connectée |
| Réserver une capacité | Oui | Insuffisante | Partiellement couverte | Exposer le service métier existant |
| Confirmer l'exécution | Oui | Insuffisante | Partiellement couverte | Exposer preuves et quantité exécutée |
| Créer une tension | Oui | Oui | Couverte | Relier automatiquement aux écarts de service |
| Désigner un responsable | Non explicite dans `Tension` | Faible | Mal modélisée | Ajouter responsabilité explicite ou lier un engagement principal |
| Créer un engagement et une échéance | Oui | Oui/partielle | Partiellement couverte | Afficher retard, responsable et preuve de clôture |
| Enregistrer un résultat | Oui | Faible | Partiellement couverte | Construire la clôture de la boucle |
| Estimer la valeur en FCFA | Oui | Faible | Partiellement couverte | Ajouter méthode et confiance |
| Saisie assistée | Non structurée | Faible | Absente | À tester dans le pilote concierge |
| Notifications essentielles | Non | Non | Absente | Différer jusqu'au canal pilote |

---

## 5. Incohérences et dettes prioritaires

### 5.1 Tension sans responsable explicite

`Tension` possède une source, une gravité, un statut et une entité liée, mais aucun responsable direct ni échéance. La documentation MVP exige qu'une tension mobilise un responsable.

Décision :

- soit ajouter `ownerActorId` ou `ownerOrganizationId` à `Tension` ;
- soit considérer qu'une tension n'est coordonnée qu'à partir du moment où un engagement principal est accepté.

Pour le MVP, la seconde option limite le changement de modèle : le responsable opérationnel est porté par l'engagement accepté.

### 5.2 Résultat économique insuffisamment qualifié

`Outcome` permet `valueCreated` et `currency`, mais ne conserve pas :

- la méthode de calcul ;
- l'hypothèse de référence ;
- le niveau de confiance global ;
- le coût de coordination associé.

Décision : ajouter ces informations avant toute communication institutionnelle sur l'impact.

### 5.3 Allocation techniquement solide mais peu visible

Le service `reserveCapacity` contrôle déjà :

- la quantité positive ;
- l'existence du besoin ;
- l'existence de la capacité ;
- la disponibilité restante ;
- le non-dépassement du besoin ;
- la mise à jour de la capacité ;
- la mise à jour du statut du besoin.

Le déficit est donc principalement produit et non métier.

### 5.4 Exécution avec preuve déjà modélisée

`ServiceExecution` inclut les preuves, l'auteur, la date et la quantité exécutée. La priorité est de rendre ce parcours visible et non de créer un nouveau moteur de preuve.

### 5.5 Pages statiques non reliées au domaine

Les pages de vision récemment créées ne doivent pas être utilisées comme preuve de maturité fonctionnelle. Elles doivent recevoir l'un des statuts suivants :

- **à intégrer** : si elles représentent une vue utile du domaine existant ;
- **vision future** : si elles dépassent le MVP ;
- **à retirer** : si elles dupliquent sans valeur supplémentaire.

---

## 6. Classement des pages récemment ajoutées

| Page | Valeur potentielle | Alignement MVP | Décision |
|---|---|---|---|
| `coordination-services` | Vue consolidée des besoins, capacités et exécutions | Fort | Réécrire avec les données du domaine |
| `engagements-commercials` | Vision future de sécurisation commerciale | Faible à moyen | Sortir du coeur MVP |
| `coordination-territoriale` | Utile pour réplication multi-sites | Faible en pilote mono-territoire | Conserver comme vision future |
| `resilience-filiere` | Bon framing stratégique et institutionnel | Moyen, non opérationnel | Conserver hors parcours principal |
| `financement-services` | Hypothèse future possible | Exclu du MVP | Retirer de la navigation MVP et classer P3 |
| `tracabilite-filiere` | Peut agréger débarquement, pesée et lots | Fort | Connecter aux données réelles |
| `exploitation-mbambulaan` | Peut devenir cockpit opérateur | Fort si issu des opérations | Refaire à partir des sélecteurs réels |

---

## 7. Backlog priorisé

### P0 — Boucle MVP fonctionnelle

1. Créer une vue de parcours d'un retour unique reliant toutes les entités de la boucle.
2. Exposer la création d'un besoin de service depuis un retour attendu.
3. Exposer la déclaration et la réservation d'une capacité.
4. Exposer la confirmation d'exécution avec preuve.
5. Créer automatiquement ou manuellement une tension en cas d'insuffisance ou d'écart.
6. Relier l'engagement au responsable et à l'échéance.
7. Clôturer par un résultat avec quantité protégée et valeur estimée.
8. Afficher l'auteur, l'horodatage et le niveau de confiance sur les étapes critiques.

### P1 — Cohérence et pilotage

1. Ajouter méthode de calcul et confiance à la valeur créée.
2. Ajouter les sélecteurs de progression de la boucle.
3. Afficher les retards d'engagement.
4. Afficher le reliquat entre poids pesé et lots constitués.
5. Construire le cockpit opérationnel à partir des données du domaine.
6. Ajouter des tests métier sur les transitions de service.

### P2 — Adoption terrain

1. Concevoir un mode de saisie assistée.
2. Réduire les formulaires aux données réellement disponibles sur le terrain.
3. Préparer les notifications manuelles ou semi-automatiques.
4. Mesurer le coût d'opération du pilote.

### À différer

- financement et crédit ;
- paiement intégré ;
- assurance ;
- marketplace publique ;
- scoring avancé ;
- multi-territoire complexe ;
- reporting institutionnel non dérivé des opérations.

---

## 8. Première tranche verticale à livrer

### Cas de référence

Un capitaine annonce un retour à Kayar avec un besoin de glace.

Le coordinateur :

1. ouvre le retour ;
2. qualifie le besoin de glace ;
3. visualise les capacités disponibles au bon moment et sur le bon territoire ;
4. réserve une capacité ;
5. confirme l'exécution avec une preuve ;
6. crée une tension si la quantité exécutée est insuffisante ;
7. suit un engagement correctif ;
8. confirme le débarquement ;
9. enregistre la pesée et les lots ;
10. documente la quantité protégée et la valeur évitée.

### Critères d'acceptation

- chaque étape est accessible depuis la précédente ;
- aucune quantité réservée ne dépasse la capacité disponible ;
- aucune exécution ne dépasse la quantité réservée ;
- le statut du besoin évolue automatiquement ;
- l'écart de service peut devenir une tension ;
- le responsable et l'échéance sont visibles ;
- la clôture contient une preuve ;
- la valeur en FCFA affiche sa méthode et son niveau de confiance ;
- le parcours complet peut être démontré sans changer de territoire ni utiliser plusieurs applications.

---

## 9. Définition du produit démontrable

Le produit est démontrable lorsque le CEO peut ouvrir un retour pilote et parcourir, sans explication technique, la chaîne complète depuis l'annonce jusqu'à la preuve de valeur.

Le produit n'est pas démontrable parce qu'il possède beaucoup de pages. Il l'est lorsque :

- les étapes sont reliées ;
- les décisions sont visibles ;
- les responsabilités sont claires ;
- les règles empêchent les incohérences ;
- la valeur créée est compréhensible et contestable.

---

## 10. Conclusion

Le dépôt est plus avancé que ne le laissaient penser les dernières livraisons. Le domaine central existe déjà. La prochaine phase n'est pas une extension fonctionnelle, mais une consolidation stricte du coeur MVP.

La règle à appliquer désormais est :

> aucune nouvelle page sans capacité référencée, données du domaine, action métier réelle, place explicite dans la boucle MVP et critère d'acceptation testable.
