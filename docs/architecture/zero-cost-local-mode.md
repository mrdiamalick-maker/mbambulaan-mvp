# Mbàmbulaan — Mode local gratuit

## Principe non négociable

Le produit complet doit pouvoir être installé, démarré et testé sans carte bancaire, abonnement, clé API payante ou compte cloud.

Le coût mensuel obligatoire du mode local est donc de **0 FCFA**, hors ordinateur, électricité et connexion déjà disponibles pour l'équipe.

## Composants gratuits utilisés

| Besoin | Composant du mode local | Nature |
|---|---|---|
| Application | Next.js / Node.js | Open source |
| Base de données | PostgreSQL | Open source, auto-hébergé |
| Conteneurs | Docker compatible / Podman | Exécution locale |
| Orchestration de test | Docker Compose et Kind/Kubernetes local | Open source |
| Analyse de sécurité | Trivy | Open source |
| SMS | Simulateur Mbàmbulaan | Aucun envoi réel |
| WhatsApp | Simulateur Mbàmbulaan | Aucun envoi réel |
| Mobile Money | Simulateurs Wave et Orange Money | Aucune transaction réelle |
| Météo | Données déterministes simulées | Aucun abonnement |
| Antivirus | Simulateur d'analyse | Aucun service externe |
| Stockage documentaire | Références et stockage simulés | Aucun stockage managé |
| Télémétrie | État embarqué du runtime | Aucun SaaS |
| Atlas | Moteurs Mbàmbulaan embarqués | Aucun service d'IA payant requis |

## Kubernetes n'est pas un coût obligatoire

Les manifests Kubernetes servent à vérifier que Mbàmbulaan peut être industrialisé et déployé proprement. Ils ne nous obligent pas à acheter un cluster cloud.

Pour les tests :

- Kind crée un cluster Kubernetes éphémère sur le runner GitHub ou l'ordinateur local ;
- aucun cluster AWS, Azure, Google Cloud ou autre n'est provisionné ;
- aucun abonnement Kubernetes managé n'est nécessaire ;
- le chemin le plus simple reste `compose.local.yaml`.

## Démarrage local

```bash
docker compose -f compose.local.yaml up --build
```

Puis ouvrir :

- `http://localhost:3000/produit`
- `http://localhost:3000/atlas`
- `http://localhost:3000/test-produit`
- `http://localhost:3000/environnement-test`

Arrêt :

```bash
docker compose -f compose.local.yaml down
```

Suppression volontaire des données locales :

```bash
docker compose -f compose.local.yaml down -v
```

## Services qui pourraient coûter plus tard

Ces services restent optionnels et ne doivent jamais être activés sans décision explicite :

- hébergement public d'une instance accessible sur Internet ;
- nom de domaine ;
- SMS réellement envoyés ;
- API WhatsApp Business ;
- frais opérateurs Mobile Money ;
- stockage objet managé ;
- base PostgreSQL managée ;
- monitoring SaaS ;
- service météo commercial ;
- intelligence artificielle externe facturée à l'usage.

Leur activation devra respecter trois règles :

1. un besoin métier réel et validé ;
2. un budget approuvé ;
3. une variable `ALLOW_PAID_INTEGRATIONS=true` définie volontairement hors mode local gratuit.

## Garde-fou technique

Par défaut :

```text
MBAMBULAAN_LOCAL_FREE_MODE=true
ALLOW_PAID_INTEGRATIONS=false
```

Toute configuration déclarant un fournisseur `external_paid` est rejetée dans ce mode.

La règle est testée automatiquement dans le pipeline métier.
