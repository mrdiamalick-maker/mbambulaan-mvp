# Mbàmbulaan — Registre de conformité du produit complet

## 1. Rôle du registre

Ce registre devient le point de contrôle obligatoire entre le cadrage produit et le code.

Avant chaque gros lot, l’équipe doit vérifier les sources suivantes :

- carte globale des capabilities ;
- blueprints de capabilities ;
- architecture des infrastructures ;
- système produit et produits acteurs ;
- parcours acteurs ;
- modèles de complétude MVP ;
- prompts Codex et instructions de réalisation ;
- modèles de domaine ;
- APIs, interfaces, migrations et tests existants.

Aucun lot ne doit être lancé à partir de la seule lecture de l’interface ou du dernier développement réalisé.

---

## 2. Échelle de conformité

| Statut | Définition |
|---|---|
| Cadré | La documentation métier et le blueprint existent. |
| Domaine | Les agrégats, invariants, commandes et événements existent. |
| Exécutable | Le flux peut être exécuté via un service ou une API. |
| Acteur | Au moins un produit acteur expose le parcours. |
| Prouvé | Un scénario bout en bout et des tests démontrent la valeur. |
| Mesurable | Les résultats économiques, sociaux, opérationnels ou environnementaux sont calculés. |
| Monétisable | Le payeur, l’offre et la valeur capturable peuvent être testés. |

Une infrastructure n’est pas considérée comme livrée parce que des classes ou écrans existent. Elle doit atteindre au minimum **Acteur + Prouvé** sur son périmètre MVP.

---

## 3. Produits acteurs officiels

Le portefeuille cible comporte neuf produits complémentaires :

| Produit | Acteurs principaux | Fonction stratégique |
|---|---|---|
| Mbàmbulaan Fisher | Pêcheur, capitaine, équipage | Adoption terrain et visibilité des opérations. |
| Mbàmbulaan Cooperative | Coopératives et organisations de producteurs | Coordination collective, mutualisation et pouvoir de négociation. |
| Mbàmbulaan Business | Acheteurs, mareyeurs, transformateurs, transporteurs et froid | Exécution des échanges et services économiques. |
| Mbàmbulaan Government | Ministère, agences et services territoriaux | Supervision, politique publique et régulation. |
| Mbàmbulaan Development | Bailleurs, ONG et programmes | Ciblage, financement, exécution et impact des interventions. |
| Mbàmbulaan Finance | Banques, fonds, mutuelles, assureurs | Financement fondé sur des preuves opérationnelles. |
| Mbàmbulaan Community | Communautés, associations, femmes et jeunes | Gouvernance locale, inclusion et partage de valeur. |
| Mbàmbulaan Knowledge | Recherche, formation, experts et référentiels | Connaissance, qualité des données et apprentissage. |
| Mbàmbulaan Atlas | Décideurs, dirigeants et partenaires stratégiques | Intelligence décisionnelle et scénarios. |

Règle : aucun produit ne doit absorber les responsabilités d’un autre. Tous doivent partager le même socle de données, preuves et événements.

---

## 4. Matrice initiale de conformité des infrastructures

| Infrastructure | Cadrage | Domaine | Exécutable | Produit acteur | Preuve E2E | Mesure | Monétisation | Écart prioritaire |
|---|---|---|---|---|---|---|---|---|
| Identité, rôles et confiance | Oui | Oui | Oui | Partiel | Partiel | Partiel | Partiel | Administration réelle des acteurs et qualification progressive. |
| Campagnes et visibilité opérationnelle | Oui | Oui | Partiel | Fisher partiel | Partiel | Partiel | Partiel | Parcours campagne-retour-débarquement complet et mobile. |
| Débarquement, pesée, qualité et traçabilité | Oui | Oui renforcé | Moteur exécutable | Fisher/Cooperative à exposer | Tests métier renforcés | Écart, risques et destination calculés | Partiel | Brancher API, persistance et parcours acteurs sur le nouveau moteur. |
| Capacités, services et allocation | Oui | Oui | Oui | Cooperative/Business partiel | Oui | Oui | Partiel | Généraliser aux services de quai, froid, transformation et équipements. |
| Commerce, transaction et règlement | Oui | Oui | Oui | Business/Cooperative partiel | Oui | Oui | Oui | Finaliser annulation effective, compensations et paiements réels. |
| Conservation, transformation et valorisation produit | Oui | Oui | Décision de destination initiale | Business à exposer | Tests transformation anti-perte | Signaux de valeur initiale | Partiel | Relier décision à capacités réelles, engagements et résultat mesuré. |
| Valorisation communautaire et partage de valeur | Oui | Partiel renforcé | Orientation communautaire initiale | Community restauré | Test de destination communautaire | Signaux communautaires initiaux | Partiel | Construire initiative, décision collective, contribution, affectation et impact. |
| Durabilité, ressources et résilience climatique | Oui | Oui | Signaux de réduction des pertes initiaux | Government/Atlas partiel | Tests de destination durable | Oui partiel | Partiel | Relier effort, espèce, zone, saison et décision opérationnelle. |
| Tensions, incidents et continuité | Oui | Oui | Oui | Plusieurs produits partiels | Oui | Oui | Partiel | Unifier incidents commerciaux, opérationnels et territoriaux. |
| Pilotage territorial et politiques publiques | Oui | Oui | Oui | Government/Atlas | Partiel | Oui | Oui | Alimenter le cockpit avec résultats économiques, sociaux et environnementaux réels. |
| Connaissance et intelligence sectorielle | Oui | Oui | Partiel | Knowledge/Atlas | Partiel | Partiel | Oui | Transformer incidents, données et pratiques en contenus actionnables. |
| Financement, assurance et investissement | Oui | Oui | Partiel | Finance/Development | Partiel | Partiel | Oui | Construire un dossier de financement issu de preuves réelles. |
| Intégration et interopérabilité | Oui | Oui | Partiel | Transverse | Partiel | Oui | Oui | Prioriser un canal terrain, paiement et export institutionnel. |

Cette matrice doit être mise à jour après chaque lot significatif.

---

## 5. Contrat obligatoire d’un gros lot

Chaque gros lot doit commencer par une fiche contenant :

1. documents sources consultés ;
2. infrastructure concernée ;
3. produits acteurs concernés ;
4. problème de coordination ;
5. flux de valeur complet ;
6. agrégats et invariants ;
7. commandes et événements ;
8. exceptions obligatoires ;
9. valeur créée ;
10. bénéficiaires et payeur potentiel ;
11. périmètre MVP ;
12. éléments différés ;
13. scénario de preuve bout en bout ;
14. indicateurs de coordination et de valeur ;
15. critères d’acceptation techniques et métier.

Si l’un de ces éléments manque, le lot doit être cadré avant d’être développé.

---

## 6. Règles anti-dérive

- Ne jamais réduire Mbàmbulaan à la dernière capability développée.
- Ne jamais confondre produit complet et exhaustivité immédiate du MVP.
- Ne jamais créer une console sans parcours acteur et décision métier.
- Ne jamais déclarer une capability terminée sans scénario bout en bout.
- Ne jamais mesurer uniquement le nombre d’utilisateurs ou de clics.
- Ne jamais créer une donnée sans propriétaire, niveau de confiance et usage de décision.
- Ne jamais automatiser une règle importante sans la rendre explicable et dérogeable lorsque nécessaire.
- Ne jamais intégrer un fournisseur externe avant d’avoir validé la valeur et le coût du flux.
- Ne jamais supprimer ou marginaliser un produit acteur prévu dans le système produit.

---

## 7. Prochain audit exécutable

Le prochain audit doit comparer les documents et le code selon cet ordre :

1. produits acteurs ;
2. infrastructures et capabilities ;
3. scénarios de démonstration ;
4. objets du domaine ;
5. APIs et persistance ;
6. interfaces ;
7. tests et preuves ;
8. mesures de valeur ;
9. modèles économiques.

Le résultat doit produire une backlog priorisée par **écart de conformité**, et non par facilité technique.
