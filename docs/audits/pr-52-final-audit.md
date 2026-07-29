# Audit final — PR #52

## Décision exécutive

La PR #52 doit rester ouverte, en brouillon, non fusionnée et sans auto-merge tant que les critères de sortie ci-dessous ne sont pas satisfaits.

La base est très avancée sur les plans métier, produit et technique, mais l'étendue déclarée dépasse encore la preuve consolidée disponible. La priorité n'est plus d'ajouter de nouveaux domaines, mais de stabiliser une golden path exécutable, testable et industrialisable.

## Maturité globale estimée

68 %.

Cette estimation signifie que Mbàmbulaan est assez avancé pour poursuivre un développement structuré et préparer une démonstration contrôlée, mais pas encore pour être considéré comme un produit complet prêt à fusionner ou à déployer.

## Forces

- vision produit cohérente avec une infrastructure de coordination ;
- domaine métier riche ;
- chaîne commerciale avancée ;
- invariants métier sérieux ;
- API versionnée, PostgreSQL, migrations, transactions, outbox et journaux rejouables ;
- scénarios économiques explicités ;
- documentation produit solide.

## Bloquants P0

1. Deployment CI rouge sur le contrôle des vulnérabilités runtime critiques.
2. Ephemeral Cluster CI rouge sur la vérification des migrations.
3. PR trop volumineuse pour une revue saine.
4. Absence de revue humaine substantielle.
5. Golden path non consolidée dans une preuve E2E unique.
6. Pages statiques, démonstrateurs et vues exécutables insuffisamment distingués.
7. Migrations non prouvées de façon fiable sur base vierge et redémarrage.
8. Autorisations multi-acteurs insuffisamment prouvées en E2E.
9. Données de démonstration et données opérationnelles pas toujours clairement séparées.
10. Absence d'un readiness gate global reproductible.

## Golden path de référence

Un capitaine annonce son retour à Kayar et demande de la glace.

1. annonce du retour ;
2. création du besoin de glace ;
3. visualisation des capacités ;
4. réservation ;
5. acceptation par l'opérateur ;
6. exécution avec preuve ;
7. création d'une tension en cas d'insuffisance ;
8. engagement correctif ;
9. confirmation du débarquement ;
10. pesée ;
11. constitution des lots ;
12. réservation commerciale ;
13. sélection du transporteur ;
14. livraison prouvée ;
15. paiement ;
16. réconciliation ;
17. calcul de la valeur protégée ;
18. alimentation du cockpit institutionnel uniquement à partir de l'opération réelle.

## Roadmap de stabilisation

### Lot 0 — Gel et clarification

- geler tout nouveau domaine ;
- fixer le périmètre immuable de la PR #52 ;
- classer chaque page : exécutable, démonstrateur ou vision future ;
- inventorier les composants réellement utilisés par la golden path.

### Lot 1 — CI et sécurité

- corriger Deployment CI ;
- récupérer et traiter la liste des vulnérabilités ;
- corriger Ephemeral Cluster CI ;
- valider migrations sur base vierge ;
- valider redémarrage, replay et restauration.

### Lot 2 — Golden path produit

- construire une navigation unique de bout en bout ;
- utiliser uniquement les identifiants réels renvoyés par le serveur ;
- afficher acteur, organisation, auteur, date et preuve ;
- automatiser le scénario E2E.

### Lot 3 — Autorisations et responsabilités

- renforcer les contrôles multi-acteurs ;
- tester qu'un acteur ne peut pas exécuter l'étape d'un autre ;
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
4. la golden path passera en HTTP avec PostgreSQL réel ;
5. les contrôles de rôles passeront en E2E ;
6. les pages non connectées seront retirées du parcours principal ou marquées comme vision ;
7. un test de restauration sera concluant ;
8. une revue humaine architecture sera obtenue ;
9. une revue sécurité sera obtenue ;
10. une revue produit/métier sera obtenue ;
11. la description de PR sera alignée avec ce qui est réellement prouvé ;
12. aucun nouveau périmètre fonctionnel ne sera ajouté.

## Règle de développement

Aucune nouvelle infrastructure ne doit être ajoutée tant que la golden path n'est pas stable, démontrable et industrialisable.

Ordre de priorité :

1. fiabiliser migrations et cluster éphémère ;
2. corriger le gate de sécurité runtime ;
3. consolider la golden path de bout en bout.
