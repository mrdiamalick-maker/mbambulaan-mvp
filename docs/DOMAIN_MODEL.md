# Modèle de domaine Mbàmbulaan

## Agrégats

| Agrégat | Objets principaux | Responsabilité |
|---|---|---|
| Identité | Actor, Organization, Role, Subscription | Mandat, territoire, plan et droits |
| Territoire | Territory, Site, Infrastructure, Capacity | Connaissance et mobilisation des ressources |
| Opérations | Vessel, FishingTrip, Landing, CatchLine, Lot | De la sortie au produit disponible |
| Coordination | Observation, Situation, Need, Opportunity, CoordinationSpace | Transformer un signal en engagement et résultat |
| Marché | Species, PriceObservation, ScarcityIndicator | Expliquer disponibilité, prix et tension |
| Durabilité | SustainabilityAssessment | Relier provenance, lacunes et amélioration |
| Community | CommunityPost | Transformer un échange utile en objet opérationnel |
| Pilotage | Report, AuditEntry, Learning | Décider, rendre compte et capitaliser |
| SaaS | Plan, Subscription, PartnerService | Expliquer les droits et la valeur payante |

## Invariants

- une arrivée ne peut être confirmée avant l’annonce de retour ;
- un débarquement ne peut être pesé avant l’arrivée ;
- les lots ne peuvent être créés avant une pesée confirmée ;
- une opportunité exige espèce identique, quantité suffisante et raisons explicites ;
- un engagement est validé par un humain ;
- une situation prise en charge exige responsable et échéance ;
- une mise en attente exige un motif ;
- un résultat exige un élément de confirmation ;
- chaque commande significative ajoute une entrée d’audit ;
- une publication Community transformée ne crée qu’un seul objet opérationnel.

## Confiance

Niveaux utilisés :

- `Déclarée` : information transmise par un acteur ;
- `Observée` : information vue ou relevée, non recoupée ;
- `Vérifiée` : recoupement ou validation terrain simulée ;
- `Consolidée` : résultat ou synthèse rapprochant plusieurs éléments.

Ces niveaux décrivent le traitement interne de la donnée. Ils ne constituent pas une certification officielle.
