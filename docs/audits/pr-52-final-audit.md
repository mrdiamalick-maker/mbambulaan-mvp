# Audit final — PR #52

## Décision exécutive

La PR #52 doit rester ouverte, en brouillon, non fusionnée et sans auto-merge tant que les critères de sortie ci-dessous ne sont pas satisfaits.

La base est très avancée sur les plans métier, produit et technique. La priorité n'est plus d'ajouter de nouveaux domaines, mais de stabiliser le parcours de coordination de référence et le socle commun qui soutient les usages multi-acteurs.

## Retours produit capitalisés

Les décisions et principes suivants sont désormais considérés comme acquis et ne doivent plus être réouverts sans élément nouveau :

- Mbàmbulaan n'est ni une simple application, ni une marketplace, ni un ERP, ni un dashboard ;
- Mbàmbulaan est une infrastructure numérique de coordination pour l'écosystème halieutique ;
- le produit ne doit pas être réduit à ses flux transactionnels ;
- le commerce et le paiement ne constituent qu'une partie des flux coordonnés ;
- le vocabulaire de pilotage doit privilégier coordination, capacités, besoins, engagements, tensions, continuité, confiance, traçabilité, décision et création de valeur ;
- le terme « preuve » doit être réservé aux cas où il désigne réellement un justificatif, une validation ou une trace requise ;
- selon le contexte, employer plutôt résultat observable, trace opérationnelle, élément de confiance, validation terrain ou confirmation ;
- « golden path » est remplacé par « parcours de coordination de référence » ;
- une évolution produit doit être évaluée selon les utilisateurs, bénéficiaires, décideurs, payeurs, valeur métier, rentabilité, différenciation et priorité ;
- les capacités métier, parcours acteurs et flux de valeur précèdent les écrans et le code ;
- les arbitrages déjà validés doivent être capitalisés dans le dépôt afin d'éviter les régressions de cadrage et les débats répétitifs.

## Maturité globale estimée

68 %.

Cette estimation signifie que Mbàmbulaan est assez avancé pour poursuivre un développement structuré et préparer une démonstration contrôlée, mais pas encore pour être considéré comme un produit complet prêt à fusionner ou à déployer.

## Forces

- vision produit cohérente avec une infrastructure de coordination ;
- domaine métier riche ;
- chaîne de coordination opérationnelle et économique avancée ;
- invariants métier sérieux ;
- API versionnée, PostgreSQL, migrations, transactions, outbox et journaux rejouables ;
- scénarios économiques explicités ;
- documentation produit solide.

## Bloquants P0

1. Deployment CI rouge sur le contrôle des vulnérabilités runtime critiques.
2. Ephemeral Cluster CI rouge sur la vérification des migrations.
3. PR trop volumineuse pour une revue saine.
4. Absence de revue humaine substantielle.
5. Parcours de coordination de référence non consolidé dans un scénario E2E unique.
6. Pages statiques, démonstrateurs et vues exécutables insuffisamment distingués.
7. Migrations non validées de façon fiable sur base vierge et redémarrage.
8. Autorisations multi-acteurs insuffisamment validées en E2E.
9. Données de démonstration et données opérationnelles pas toujours clairement séparées.
10. Absence d'un readiness gate global reproductible.

## Parcours de coordination de référence

Un capitaine annonce son retour à Kayar et demande de la glace.

1. annonce du retour ;
2. création du besoin de glace ;
3. visualisation des capacités ;
4. réservation ;
5. acceptation par l'opérateur ;
6. réalisation du service avec confirmation et trace opérationnelle ;
7. création d'une tension en cas d'insuffisance ;
8. engagement correctif ;
9. confirmation du débarquement ;
10. pesée ;
11. constitution des lots ;
12. réservation commerciale ;
13. sélection du transporteur ;
14. confirmation de livraison ;
15. paiement ;
16. réconciliation ;
17. calcul de la valeur protégée ;
18. alimentation du cockpit institutionnel uniquement à partir de l'opération réelle.

Ce parcours ne définit pas Mbàmbulaan comme un produit transactionnel. Il sert de fil conducteur pour valider la continuité de coordination entre besoins, capacités, engagements, opérations, information, décisions et flux économiques.

## Roadmap de stabilisation

### Lot 0 — Gel et clarification

- geler tout nouveau domaine ;
- fixer le périmètre immuable de la PR #52 ;
- classer chaque page : exécutable, démonstrateur ou vision future ;
- inventorier les composants réellement utilisés par le parcours de coordination de référence.

### Lot 1 — Socle d'exécution et résilience

- corriger Deployment CI ;
- récupérer et traiter la liste des vulnérabilités ;
- corriger Ephemeral Cluster CI ;
- valider les migrations sur base vierge ;
- valider redémarrage, replay et restauration ;
- vérifier la continuité des besoins, capacités, engagements, tensions, opérations, lots, incidents et indicateurs.

### Lot 2 — Coordination opérationnelle de référence

- construire une navigation unique de bout en bout ;
- utiliser uniquement les identifiants réels renvoyés par le serveur ;
- afficher acteur, organisation, responsable, date, état et éléments de confiance ;
- automatiser le scénario E2E ;
- couvrir les besoins, capacités, engagements, tensions, débarquement, lots, services et décisions.

### Lot 3 — Autorisations et responsabilités

- renforcer les contrôles multi-acteurs ;
- tester qu'un acteur ne peut pas réaliser l'étape d'un autre ;
- rendre visibles responsable, échéance et retard ;
- documenter les politiques d'accès aux données.

### Lot 4 — Terrain

- réduire les formulaires ;
- ajouter un mode concierge ;
- tester sur appareil Android basique ;
- tester connexion instable, synchronisation et conflits ;
- mesurer le temps par opération.

### Lot 5 — Économie réelle

- mesurer coût de support, coût de saisie et frais de paiement ;
- tester commission et abonnement ;
- séparer strictement GMV, revenu et marge ;
- obtenir des premiers consentements à payer.

## Critères de sortie de la PR #52

La PR pourra sortir du statut brouillon seulement lorsque :

1. les quatre pipelines de référence seront verts ;
2. aucune vulnérabilité runtime critique non arbitrée ne subsistera ;
3. les migrations fonctionneront sur une base vierge ;
4. le parcours de coordination de référence passera en HTTP avec PostgreSQL réel ;
5. les contrôles de rôles passeront en E2E ;
6. les pages non connectées seront retirées du parcours principal ou marquées comme vision ;
7. un test de restauration sera concluant ;
8. une revue humaine architecture sera obtenue ;
9. une revue sécurité sera obtenue ;
10. une revue produit/métier sera obtenue ;
11. la description de PR sera alignée avec ce qui est réellement validé ;
12. aucun nouveau périmètre fonctionnel ne sera ajouté.

## Règle de développement

Aucune nouvelle infrastructure ne doit être ajoutée tant que le parcours de coordination de référence n'est pas stable, démontrable et industrialisable.

Ordre de priorité :

1. fiabiliser migrations et cluster éphémère ;
2. corriger le gate de sécurité runtime ;
3. consolider le parcours de coordination de référence ;
4. préserver l'équilibre entre coordination opérationnelle, information, décision, confiance et flux économiques.
