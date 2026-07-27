# Runbook de mise en production nationale

## Objectif

Déployer une version immuable de Mbàmbulaan dans un environnement cible, exécuter les migrations contrôlées, vérifier la disponibilité du service et revenir à la révision précédente en cas d'échec.

## Principes non négociables

- Une image est construite une seule fois puis promue par digest SHA-256.
- Aucune reconstruction n'est autorisée entre intégration, staging et production.
- Les secrets ne sont jamais stockés dans Git.
- Les migrations de production ne sont jamais lancées au démarrage des pods applicatifs.
- Une seule promotion peut s'exécuter par environnement.
- La production utilise un environnement GitHub protégé avec approbation humaine.
- Une release n'est réussie qu'après validation des probes `live` et `ready`.

## Environnements

| Environnement | Usage | Capacité minimale | Approbation |
|---|---|---:|---|
| integration | validation technique et connecteurs | 1 pod | non obligatoire |
| staging | répétition de production et recette | 2 pods | recommandée |
| production | exploitation nationale | 3 pods | obligatoire |

## Préparation initiale

Créer les environnements GitHub suivants :

- `integration`
- `staging`
- `production`

Pour chacun, configurer :

- secret `KUBE_CONFIG_B64` contenant un kubeconfig limité au namespace cible ;
- variable `HEALTHCHECK_URL` contenant l'URL publique de l'environnement ;
- règles d'approbation adaptées au niveau de risque.

En production, configurer également le `ClusterSecretStore` nommé `mbambulaan-production-vault` et les secrets distants attendus par l'`ExternalSecret`.

## Publication d'une image

1. Exécuter le workflow `Container Release`.
2. Vérifier que le build, la provenance et le SBOM sont publiés.
3. Copier le digest retourné, au format :

```text
sha256:<64 caractères hexadécimaux>
```

Un tag seul ne constitue jamais une référence de promotion acceptable.

## Promotion

1. Ouvrir le workflow `Promote Environment`.
2. Sélectionner l'environnement cible.
3. Fournir le digest de l'image déjà publiée.
4. Maintenir l'exécution des migrations activée, sauf décision explicite documentée.
5. Valider l'approbation de l'environnement si elle est requise.

Le workflow :

1. valide le digest ;
2. rend l'overlay Kustomize cible ;
3. capture la révision actuellement déployée ;
4. applique les ressources ;
5. attend la fin du job de migration ;
6. attend la réussite du rollout ;
7. vérifie les endpoints de santé ;
8. déclenche un rollback en cas d'échec.

## Contrôles après promotion

Vérifier au minimum :

- `/api/health/live` retourne un succès ;
- `/api/health/ready` retourne un succès ;
- le Deployment utilise le digest attendu ;
- le job de migration est terminé avec succès ;
- aucune erreur critique n'est visible dans la télémétrie ;
- les SLO de disponibilité et de latence restent conformes ;
- les workers essentiels traitent leurs files ;
- les connecteurs critiques répondent.

## Rollback

Le workflow tente automatiquement de restaurer la révision précédente lorsqu'une étape de promotion échoue.

Rollback manuel :

```bash
kubectl -n mbambulaan-<environnement> rollout history deployment/mbambulaan-platform-<environnement>
kubectl -n mbambulaan-<environnement> rollout undo deployment/mbambulaan-platform-<environnement> --to-revision=<revision>
kubectl -n mbambulaan-<environnement> rollout status deployment/mbambulaan-platform-<environnement> --timeout=10m
```

Une migration destructive ne doit jamais être publiée sans stratégie de compatibilité descendante. Le rollback applicatif ne garantit pas le rollback des données.

## Stratégie de migration sûre

Appliquer la méthode `expand / migrate / contract` :

1. **Expand** : ajouter les nouvelles structures sans supprimer les anciennes.
2. **Migrate** : migrer et vérifier les données en arrière-plan.
3. **Contract** : supprimer les anciennes structures dans une release ultérieure.

Les migrations doivent être :

- ordonnées ;
- rejouables sans corruption ;
- observables ;
- compatibles avec la version applicative précédente pendant la fenêtre de déploiement.

## Échec de migration

En cas d'échec :

1. bloquer la promotion ;
2. conserver les logs du job ;
3. vérifier la migration enregistrée dans `schema_migrations` ;
4. ne pas relancer aveuglément une migration partiellement appliquée ;
5. ouvrir un incident opérationnel ;
6. appliquer la procédure de correction ou de restauration documentée.

## Critères d'autorisation de production

La production ne peut être promue que si :

- `CI` est vert ;
- `Domain CI` est vert ;
- `Deployment CI` est vert ;
- l'image est publiée par digest avec provenance ;
- le même digest a été validé en staging ;
- les migrations ont été répétées en staging ;
- les secrets et URLs de santé sont configurés ;
- un responsable de release et un responsable rollback sont identifiés.
