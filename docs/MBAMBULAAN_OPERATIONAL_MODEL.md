# Modèle opérationnel Mbàmbulaan

## Objet

Mbàmbulaan est une infrastructure de coordination. Elle ne prétend pas transformer une remontée communautaire en donnée nationale instantanément. Elle organise la progression d'un signal vers une information qualifiée, vérifiée, consolidée puis exploitable pour une décision, un financement ou une preuve.

> Aucun signal communautaire ne devient visible au niveau de décision ministériel avant qualification régionale ou locale.

Ce principe est une contrainte produit. Toute interface, collecte ou synthèse future doit préserver l'origine, le niveau de confiance, le responsable de l'étape suivante et l'historique de validation.

## Les quatre niveaux opérationnels

### 1. Niveau national

**Acteurs :** ministère, direction centrale, cabinet et unités nationales habilitées.

**Responsabilités :** recevoir les synthèses consolidées, arbitrer, financer, décider et transmettre des orientations. Le niveau national ne traite pas directement les signaux communautaires bruts.

**Entrées :** rapports de zone, alertes qualifiées, notes décisionnelles, dossiers de financement et indicateurs consolidés.

**Sorties :** arbitrages, priorités nationales, financements, notes au Ministre et demandes d'instruction.

### 2. Niveau régional ou technique

**Acteurs :** direction régionale, service technique ou cellule de coordination.

**Responsabilités :** recevoir les signaux terrain, les qualifier, demander des vérifications, rapprocher les sources et produire des rapports de zone.

**Entrées :** déclarations d'acteurs identifiés, signalements locaux, constats, pièces et remontées des référents.

**Sorties :** incidents qualifiés, alertes à suivre, demandes de vérification, besoins qualifiés et synthèses régionales.

### 3. Niveau local

**Acteurs :** agent territorial, référent mandaté, relais de quai.

**Responsabilités :** réaliser les vérifications locales, collecter les signaux de premier niveau, rattacher les informations au quai et transmettre les constats à la cellule régionale.

**Canaux pilotes :** application terrain, formulaire structuré, WhatsApp structuré, téléphone avec saisie par un agent.

**Sorties :** constat horodaté, pièce jointe, auteur identifié, statut de vérification et remontée contextualisée.

### 4. Niveau communautaire

**Acteurs :** pêcheurs, mareyeurs, transformatrices, organisations professionnelles et comités de quai.

**Responsabilités :** produire les signaux bruts et déclarations liés aux sorties, débarquements, incidents, besoins et capacités locales.

Les interactions sont toujours médiées par le niveau local. Les acteurs communautaires ne disposent pas d'un contrôle direct sur le pilotage ministériel.

## Progression de confiance des données

| Niveau | Définition | Usage autorisé |
| --- | --- | --- |
| Brute | Information non vérifiée, reçue depuis le terrain. | Qualification locale ou régionale uniquement. |
| Déclarée | Information transmise par un acteur identifié, en attente de confirmation indépendante. | Suivi régional et demande de vérification. |
| Vérifiée | Information confirmée par un agent territorial ou référent mandaté, avec constat. | Rapport de zone, dossier de financement et suivi institutionnel. |
| Consolidée | Agrégation de sources vérifiées et contextualisées. | Synthèse officielle, arbitrage et note au Ministre. |

Chaque donnée importante doit conserver sa source, son canal, son auteur, sa date, son territoire, son niveau de confiance et son historique.

## Taxonomie des workflows

### Signalement

Observation brute ou déclarée, datée et localisée. Le signalement est reçu par la cellule régionale puis qualifié. États attendus : **Signalé**, **Qualifié**, **En traitement**, **Clôturé** ou **Escaladé en alerte**.

### Incident

Événement factuel qualifié, daté et localisé. Sa **criticité** est Normale, Vigilance ou Critique. Il dispose d'un responsable et d'une prochaine action.

### Alerte

Objet de vigilance nécessitant un suivi ou une décision. Une alerte provient d'un signalement ou incident qualifié. Elle n'est pas un synonyme de signalement.

### Vérification

Processus de confirmation attaché à une entité. États attendus : **Demandée**, **Assignée**, **En cours**, **Constat déposé**, **Vérifiée**.

Chaîne de responsabilité :

1. la cellule régionale ou direction technique lance la demande ;
2. un agent territorial ou référent mandaté la reçoit ;
3. l'agent exécute le contrôle via le canal pilote ;
4. il retourne constat, pièce, horodatage et identité du vérificateur ;
5. la cellule régionale contrôle et clôture ;
6. le dossier complet et le registre régional conservent l'historique.

## Distinction des livrables

- **Dossier complet :** vue permanente d'une entité regroupant historique, preuves, signalements, vérifications et documents liés.
- **Rapport de zone :** document daté sur une zone et une période, destiné à une direction, un programme ou un partenaire.
- **Note au Ministre :** synthèse décisionnelle assortie de recommandations d'arbitrage.
- **Dossier de financement :** transformation d'un besoin qualifié en livrable transmissible à un partenaire ou bailleur.

## Trajectoire de déploiement des données

### MVP

Données mockées cohérentes uniquement. Elles démontrent le modèle de coordination et ne sont jamais présentées comme des flux opérationnels réels.

### Pilote

Collecte terrain limitée sur trois à cinq quais. Formulaires structurés, relais WhatsApp et téléversement de pièces. Référents mandatés et cellule régionale identifiés.

### Version ministère

Adoption régionale, application agent, interface simplifiée pour référents et logique hors connexion. Consolidation nationale fondée sur les données vérifiées.

### Version extensible

APIs et sources tierces uniquement lorsque leur disponibilité, leur gouvernance et leur fiabilité sont établies. Chaque source externe conserve son niveau de confiance et sa date de mise à jour.

## Règles non négociables

1. Le ministère ne traite pas directement un signal brut communautaire.
2. Une donnée sans source ni niveau de confiance ne peut alimenter une synthèse officielle.
3. Une action indique toujours qui lance, reçoit, exécute et clôture.
4. La criticité qualifie un événement ; la priorité qualifie une action.
5. Une preuve repose sur une validation humaine identifiée.
6. Une consolidation ne masque jamais les sources dont elle dépend.
7. Les référents sont des points d'ancrage terrain, pas des utilisateurs ministériels ni des contacts CRM.
