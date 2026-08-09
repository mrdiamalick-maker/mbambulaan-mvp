# Mbàmbulaan Capability Map

## 1. Vision produit

Mbàmbulaan est une infrastructure numérique de coordination pour la filière halieutique, en commençant par la pêche artisanale sénégalaise.

Le produit doit permettre de :

- connecter les acteurs ;
- rendre les flux visibles ;
- fiabiliser l'information ;
- coordonner les décisions ;
- réduire les pertes ;
- améliorer l'utilisation des capacités ;
- faciliter les arbitrages territoriaux ;
- créer et mesurer une valeur économique pour l'écosystème et pour Mbàmbulaan.

La carte ci-dessous décrit les capacités métier à construire avant de raisonner en écrans, modules ou interfaces.

---

## 2. Principes de conception

Chaque capability doit répondre à huit questions :

1. Quel problème de coordination résout-elle ?
2. Qui l'utilise ?
3. Qui en bénéficie ?
4. Qui décide ?
5. Qui paie ?
6. Pourquoi paierait-il durablement ?
7. Quelle valeur économique Mbàmbulaan peut-il capturer ?
8. Est-elle nécessaire maintenant, ensuite ou plus tard ?

Chaque capability doit être conçue selon la chaîne suivante :

```text
Capability métier
        ↓
Parcours acteurs
        ↓
Flux de valeur
        ↓
Objets du domaine
        ↓
Invariants
        ↓
Services du domaine
        ↓
Moteurs de décision
        ↓
Features
        ↓
API / interfaces
```

---

## 3. Carte globale des capabilities

### A. Référentiel de l'écosystème

Objectif : établir une base fiable et partagée sur les acteurs, les organisations, les territoires, les sites et les moyens opérationnels.

Capabilities :

- gestion des acteurs ;
- gestion des organisations ;
- gestion des territoires ;
- gestion des sites de débarquement ;
- gestion des embarcations ;
- gestion des prestataires ;
- gestion des capacités opérationnelles ;
- gestion des habilitations, responsabilités et rôles ;
- qualification et fiabilisation des données acteurs.

Valeur :

- savoir qui fait quoi ;
- savoir où se trouvent les capacités ;
- réduire l'opacité ;
- rendre possible toute coordination ultérieure.

Priorité : **Fondation — immédiate**.

---

### B. Coordination des sorties et retours de pêche

Objectif : anticiper les arrivées, les volumes et les besoins associés.

Capabilities :

- annonce de sortie ;
- annonce de retour prévu ;
- mise à jour de l'heure estimée d'arrivée ;
- estimation des captures ;
- identification des besoins avant débarquement ;
- détection des retours à risque ;
- coordination du site de débarquement ;
- confirmation d'arrivée.

Valeur :

- préparer la glace, le transport, le stockage et la manutention ;
- réduire l'improvisation ;
- fluidifier les opérations au quai.

Priorité : **MVP — immédiate**.

---

### C. Coordination des services opérationnels

Objectif : mettre en relation les besoins avec les capacités disponibles et piloter leur exécution.

Capabilities :

- création de besoins de service ;
- déclaration de capacités ;
- recherche de capacités compatibles ;
- réservation ;
- suivi de l'exécution ;
- annulation ou réallocation ;
- détection automatique des ruptures ;
- création et résolution de tensions ;
- engagements des acteurs ;
- mesure des résultats.

Valeur :

- mieux utiliser les capacités existantes ;
- réduire les pertes ;
- rendre les engagements visibles ;
- fiabiliser l'exécution.

Priorité : **MVP — déjà engagée**.

---

### D. Débarquement, pesée et constitution des lots

Objectif : transformer un retour de pêche en information fiable, exploitable et partageable.

Capabilities :

- confirmation du débarquement ;
- enregistrement de la pesée ;
- qualification du niveau de confiance ;
- constitution des lots ;
- identification des espèces ;
- classement qualité ;
- état de conservation ;
- disponibilité commerciale ;
- traçabilité de l'origine.

Valeur :

- créer une vérité opérationnelle commune ;
- améliorer la confiance entre vendeurs, acheteurs et institutions ;
- préparer la commercialisation et le suivi qualité.

Priorité : **MVP — prochaine capability à développer**.

---

### E. Coordination commerciale et mise en relation offre-demande

Objectif : rapprocher les lots disponibles des besoins du marché sans réduire Mbàmbulaan à une simple marketplace.

Capabilities :

- déclaration de besoins marché ;
- publication contrôlée de disponibilités ;
- matching entre lots et besoins ;
- réservation commerciale ;
- négociation assistée ;
- confirmation d'accord ;
- suivi du retrait ou de la livraison ;
- détection de risque d'invendu ;
- orientation vers transformation ou conservation.

Valeur :

- réduire le temps de vente ;
- limiter les invendus ;
- améliorer l'accès aux débouchés ;
- créer de la visibilité sur la demande réelle.

Priorité : **Phase 2**.

---

### F. Coordination logistique

Objectif : organiser les mouvements physiques entre quai, marché, stockage et transformation.

Capabilities :

- déclaration des moyens de transport ;
- planification des enlèvements ;
- affectation des véhicules ;
- groupage des flux ;
- suivi des chargements ;
- confirmation de livraison ;
- gestion des retards et incidents ;
- réallocation en cas de rupture ;
- mesure des performances logistiques.

Valeur :

- réduire les délais ;
- mutualiser les coûts ;
- améliorer la continuité de la chaîne du froid ;
- fiabiliser la livraison.

Priorité : **Phase 2**.

---

### G. Conservation, froid et transformation

Objectif : préserver la valeur du produit lorsqu'il ne peut pas être vendu immédiatement.

Capabilities :

- suivi de disponibilité en glace ;
- suivi des chambres froides ;
- réservation de stockage ;
- gestion des durées de conservation ;
- alertes de rupture de froid ;
- orientation vers transformation ;
- planification de transformation ;
- suivi des pertes et rendements ;
- libération et réallocation des capacités.

Valeur :

- réduire les pertes post-capture ;
- prolonger la fenêtre commerciale ;
- soutenir la transformation locale ;
- mieux valoriser les surplus.

Priorité : **Phase 2**.

---

### H. Qualité, traçabilité et conformité

Objectif : fiabiliser l'origine, les conditions de traitement et la conformité du produit.

Capabilities :

- traçabilité du lot ;
- enregistrement des contrôles ;
- suivi des non-conformités ;
- gestion des inspections ;
- preuves documentaires ;
- historique des manipulations ;
- alertes sanitaires ;
- blocage ou libération d'un lot ;
- production d'indicateurs de conformité.

Valeur :

- améliorer la confiance ;
- faciliter l'accès à des marchés plus exigeants ;
- réduire les risques sanitaires ;
- soutenir l'action publique.

Priorité : **Phase 2 / Phase 3 selon réglementation et partenaires**.

---

### I. Gestion des tensions, incidents et continuité d'activité

Objectif : rendre visibles les ruptures, coordonner les réponses et mesurer leur résolution.

Capabilities :

- signalement d'une tension ;
- qualification de la gravité ;
- identification des acteurs concernés ;
- engagements de résolution ;
- suivi des actions ;
- escalade territoriale ;
- résolution ;
- documentation des résultats ;
- apprentissage à partir des incidents.

Valeur :

- accélérer la réponse collective ;
- réduire les pertes ;
- renforcer la responsabilité ;
- constituer une mémoire opérationnelle.

Priorité : **MVP — déjà engagée**.

---

### J. Pilotage territorial et aide à la décision

Objectif : donner aux coordinateurs et décideurs une vision actionnable du territoire.

Capabilities :

- plan de coordination territorial ;
- priorisation des besoins ;
- recommandations d'allocation ;
- détection des capacités inutilisées ;
- détection des risques ;
- consolidation multi-sites ;
- comparaison entre territoires ;
- suivi des engagements ;
- simulation de scénarios ;
- alertes décisionnelles.

Valeur :

- passer de l'information à l'action ;
- améliorer l'allocation des ressources ;
- aider les collectivités et institutions à décider ;
- rendre la coordination mesurable.

Priorité : **MVP avancé — déjà engagé**.

---

### K. Mesure de valeur et performance de l'écosystème

Objectif : prouver la valeur créée par la coordination.

Capabilities :

- mesure des pertes évitées ;
- mesure des volumes sauvés ;
- mesure des capacités réallouées ;
- mesure de la rapidité de résolution ;
- mesure du taux de service ;
- mesure de la fiabilité des engagements ;
- mesure des revenus additionnels ;
- mesure de l'impact territorial ;
- reporting pour partenaires et financeurs.

Valeur :

- démontrer l'utilité de Mbàmbulaan ;
- justifier le paiement ;
- convaincre les institutions et investisseurs ;
- améliorer en continu le produit.

Priorité : **MVP — indispensable pour la légitimité et la monétisation**.

---

### L. Paiements, facturation et partage de valeur

Objectif : rendre les transactions et services coordonnés économiquement soutenables.

Capabilities :

- tarification des services ;
- calcul des montants dus ;
- facturation ;
- commissions Mbàmbulaan ;
- partage de revenus ;
- suivi des règlements ;
- gestion des impayés ;
- rapprochement transactionnel ;
- transparence des flux financiers.

Valeur :

- transformer la coordination en modèle économique ;
- rendre la plateforme durable ;
- sécuriser les acteurs ;
- créer des revenus récurrents pour Mbàmbulaan.

Priorité : **Phase 2**, après preuve d'utilité opérationnelle.

---

### M. Réputation, confiance et fiabilité des acteurs

Objectif : améliorer la confiance sans créer un système arbitraire de notation.

Capabilities :

- historique des engagements ;
- taux d'exécution ;
- taux d'annulation ;
- niveau de preuve ;
- fiabilité des données déclarées ;
- résolution des contestations ;
- qualification progressive des acteurs ;
- visibilité contrôlée des indicateurs de confiance.

Valeur :

- réduire le risque ;
- améliorer les décisions ;
- favoriser les acteurs fiables ;
- soutenir les relations commerciales durables.

Priorité : **Phase 3**.

---

### N. Accès au financement et à l'assurance

Objectif : utiliser les données opérationnelles fiables pour faciliter l'accès à des services financiers adaptés.

Capabilities :

- historique d'activité ;
- preuve de revenus ;
- preuve de capacité d'exécution ;
- dossier de financement ;
- orientation vers partenaires ;
- suivi des remboursements ou primes ;
- déclaration d'incidents assurables ;
- mesure du risque opérationnel.

Valeur :

- améliorer l'accès au financement ;
- réduire l'asymétrie d'information ;
- créer de nouveaux revenus de partenariat ;
- renforcer la résilience des acteurs.

Priorité : **Phase 3**, après accumulation de données fiables.

---

### O. Données, intégrations et interopérabilité

Objectif : permettre à Mbàmbulaan de devenir une infrastructure et non un système fermé.

Capabilities :

- API métiers ;
- import et export de données ;
- intégration avec balances, capteurs et outils mobiles ;
- intégration avec services publics ;
- intégration avec paiement et logistique ;
- gestion des identités ;
- synchronisation hors ligne ;
- gouvernance et qualité des données ;
- auditabilité.

Valeur :

- réduire les doubles saisies ;
- faciliter l'adoption ;
- rendre l'écosystème extensible ;
- créer un avantage d'infrastructure.

Priorité : **Transverse — progressive**.

---

### P. Administration, sécurité et gouvernance de la plateforme

Objectif : garantir le contrôle, la sécurité et la pérennité de l'écosystème.

Capabilities :

- gestion des accès ;
- gestion des rôles ;
- journal d'audit ;
- gestion du consentement ;
- confidentialité ;
- sécurité des données ;
- gestion des règles territoriales ;
- paramétrage des workflows ;
- supervision technique ;
- gestion des incidents de plateforme.

Valeur :

- protéger les acteurs ;
- renforcer la confiance institutionnelle ;
- rendre la solution déployable à grande échelle.

Priorité : **Transverse — minimale au MVP, renforcée ensuite**.

---

## 4. Moteurs métier transverses

Les capabilities s'appuieront progressivement sur des moteurs transverses.

### Coordination Engine

Analyse les besoins, les capacités, les tensions et les engagements pour produire des décisions opérationnelles.

### Matching Engine

Rapproche les besoins et les offres compatibles : services, lots, transport, stockage, transformation et marché.

### Allocation Engine

Propose la meilleure affectation possible en fonction de la disponibilité, de la priorité, du temps, du territoire et des règles métier.

### Risk Engine

Détecte les retards, ruptures, saturations, invendus, incidents de qualité et risques de perte.

### Trust Engine

Consolide les preuves, historiques d'exécution et niveaux de confiance sans remplacer le jugement humain.

### Outcome Engine

Mesure les résultats obtenus : pertes évitées, valeur créée, capacités mobilisées et continuité restaurée.

### Pricing & Revenue Engine

Calcule la valeur facturable, les commissions, abonnements, frais de coordination ou revenus de services.

---

## 5. Flux de valeur structurants

### Flux 1 — Anticiper et préparer un débarquement

```text
Retour prévu
    ↓
Estimation des captures
    ↓
Besoins de services
    ↓
Capacités mobilisées
    ↓
Débarquement préparé
```

### Flux 2 — Transformer une capture en lot fiable

```text
Débarquement
    ↓
Pesée
    ↓
Qualification
    ↓
Constitution du lot
    ↓
Disponibilité exploitable
```

### Flux 3 — Éviter une perte

```text
Besoin non couvert
    ↓
Détection de rupture
    ↓
Tension
    ↓
Engagements
    ↓
Réallocation / résolution
    ↓
Résultat mesuré
```

### Flux 4 — Trouver un débouché

```text
Lot disponible
    ↓
Besoin marché
    ↓
Matching
    ↓
Accord
    ↓
Logistique
    ↓
Livraison
```

### Flux 5 — Piloter un territoire

```text
Données opérationnelles
    ↓
Analyse des besoins et risques
    ↓
Recommandations
    ↓
Plan de coordination
    ↓
Décisions et engagements
    ↓
Résultats territoriaux
```

---

## 6. Priorisation produit

### Fondation MVP

- Référentiel acteurs et territoires ;
- retours prévus ;
- besoins de services ;
- capacités ;
- allocations et exécutions ;
- tensions et engagements ;
- débarquement, pesée et lots ;
- plan de coordination territorial ;
- mesure des résultats.

### Phase 2 — Extension de la valeur opérationnelle

- coordination commerciale ;
- logistique ;
- froid et transformation ;
- qualité et conformité ;
- premiers mécanismes de facturation.

### Phase 3 — Avantage concurrentiel et monétisation avancée

- réputation et confiance ;
- financement et assurance ;
- simulation et prévision ;
- optimisation interterritoriale ;
- intégrations institutionnelles avancées.

---

## 7. Règle de gouvernance produit

Aucune capability ne doit entrer dans la roadmap simplement parce qu'elle est techniquement intéressante.

Elle doit être retenue uniquement si elle :

- améliore concrètement la coordination ;
- crée une valeur métier mesurable ;
- répond à un parcours acteur réel ;
- possède un bénéficiaire identifiable ;
- peut contribuer à un modèle économique durable ;
- renforce l'avantage concurrentiel de Mbàmbulaan ;
- est prioritaire au regard du terrain et des ressources disponibles.

La prochaine capability recommandée après la coordination des services est :

> **Débarquement, pesée et constitution des lots**

Elle crée le pont indispensable entre l'opération de pêche, la coordination des services, la commercialisation, la qualité, la traçabilité et la mesure de valeur.
