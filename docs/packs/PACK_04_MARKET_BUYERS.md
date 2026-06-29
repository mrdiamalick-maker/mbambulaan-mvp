# PACK 04 - Market & Buyers Network

## Statut du document

Ce pack décrit la capability `MARKET & BUYERS NETWORK` de Mbàmbulaan.

Référence unique : `docs/MBAMBULAAN_PRODUCT_BOOK_v1.md`.

Ce document couvre tout ce qui concerne les acheteurs, mareyeurs, transformateurs, coopératives, entreprises, marchés et organisations qui expriment des besoins, recherchent des lots, réservent, suivent des transactions ou structurent l'écoulement des produits.

Mbàmbulaan n'est pas une simple marketplace. Le Market & Buyers Network est un réseau de demande, de coordination et d'activation économique permettant de transformer les arrivages visibles en opportunités utiles, réservations, transactions, décisions et impact.

Ce document ne crée aucune nouvelle vision produit, ne modifie pas le Product Book, n'ajoute aucun module hors vision stabilisée et ne contient aucune implémentation.

## 1. Vision

### Pourquoi ce réseau existe

Le réseau acheteurs existe pour donner une forme structurée à la demande. Dans la filière pêche artisanale, la demande peut être urgente, orale, fragmentée, saisonnière, localisée ou portée par des acteurs très différents : mareyeurs, transformateurs, coopératives, entreprises, marchés, collectivités ou programmes alimentaires.

Mbàmbulaan rend cette demande lisible et coordonnable afin que les arrivages visibles puissent rencontrer des besoins réels, qualifiés et actionnables.

### Problème résolu côté demande

| Problème | Effet actuel | Réponse Mbàmbulaan |
| --- | --- | --- |
| Demande dispersée | Les besoins restent dans les réseaux privés | Structuration des besoins par espèce, volume, zone et urgence |
| Manque de visibilité sur l'offre | Les acheteurs ne savent pas toujours quels lots sont disponibles | Arrivages visibles, opportunités recommandées |
| Urgence mal coordonnée | Les besoins critiques arrivent trop tard | Priorisation, alertes, notifications |
| Réservations informelles | Risque de conflit ou d'annulation | Réservation tracée, statut, historique |
| Faible preuve transactionnelle | Difficulté à suivre l'activité | Historique besoins, réservations, transactions |
| Décisions peu territorialisées | Les acheteurs ne voient pas les zones sous tension | Carte, tensions, recommandations territoriales |

### Valeur apportée à la filière

| Valeur | Description |
| --- | --- |
| Meilleure circulation des lots | Les arrivages peuvent être orientés vers des besoins qualifiés |
| Réduction des pertes | Les lots sensibles ou surplus trouvent plus vite une demande |
| Meilleure planification | Besoins récurrents et saisonniers rendent la demande prévisible |
| Confiance | Acheteurs, réservations et transactions disposent d'un historique |
| Impact économique | Les volumes valorisés deviennent mesurables |
| Décision territoriale | Les tensions entre offre et demande deviennent visibles |

### Marketplace classique vs réseau coordonné de demande

| Marketplace classique | Market & Buyers Network Mbàmbulaan |
| --- | --- |
| Catalogue d'offres | Coordination entre arrivages, besoins, territoires et acteurs |
| Transaction comme finalité | Opportunité, réservation, traçabilité et impact comme chaîne de valeur |
| Acheteur isolé | Acheteur situé dans un réseau, une zone, une organisation et une filière |
| Prix et achat dominants | Besoin, qualité, urgence, confiance, tension et disponibilité |
| Matching peu explicité | Recommandations expliquées et validables |
| Relation purement digitale | Réseau humain, terrain, WhatsApp, agents, support |

### KPIs principaux

| KPI | Définition | Décision associée |
| --- | --- | --- |
| Acheteurs référencés | Nombre d'acheteurs connus | Mesurer couverture de demande |
| Acheteurs actifs | Acheteurs ayant publié ou réservé récemment | Mesurer activation |
| Besoins publiés | Nombre de besoins structurés | Mesurer expression de demande |
| Besoins couverts | Besoins ayant trouvé opportunité ou transaction | Mesurer efficacité |
| Taux de couverture | Besoins couverts / besoins ouverts | Prioriser offre ou demande |
| Réservations créées | Opportunités réservées | Mesurer activation économique |
| Transactions finalisées | Réservations clôturées avec preuve | Mesurer valeur réelle |
| Annulations | Réservations annulées ou abandonnées | Identifier risque |
| Délai besoin -> opportunité | Temps entre besoin et recommandation | Optimiser coordination |
| Score confiance acheteur | Signal consolidé par historique | Prioriser relations fiables |

## 2. Personas

| Persona | Rôle | Besoin principal | Digitalisation probable | Canal probable | Valeur attendue | Risque produit | Expérience cible |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mareyeur référent | Acheteur local régulier | Trouver vite des lots fiables | Moyenne | WhatsApp, appel, mobile | Gain de temps, priorité, confiance | Réservations abusives | Besoins rapides, opportunités claires |
| Mareyeur occasionnel | Acheteur ponctuel | Accéder à des lots sans réseau fort | Faible à moyenne | Appel, WhatsApp, agent | Visibilité et simplicité | Données incomplètes | Publication assistée |
| Transformateur | Acteur de valorisation | Capter volumes et surplus | Moyenne | Mobile, WhatsApp, tableau de bord | Sécuriser approvisionnement | Besoins mal qualifiés | Besoins récurrents, qualité, transaction |
| Coopérative acheteuse | Organisation collective | Mutualiser achats ou écoulement | Moyenne | App, agent, WhatsApp | Coordination membres | Confusion rôle individuel/collectif | Vue organisationnelle |
| Entreprise agroalimentaire | Acheteur structuré | Planifier volumes et qualité | Élevée | Dashboard, email, API future | Fiabilité, traçabilité | Attentes trop marketplace | Besoins planifiés et reporting |
| Exportateur | Acteur volumes et conformité | Lots qualifiés et traçables | Élevée | Dashboard, téléphone | Traçabilité, régularité | Exigences qualité non disponibles | Opportunités filtrées et preuves |
| Marché local | Point de demande territorial | Comprendre volumes disponibles | Faible à moyenne | Agent, WhatsApp, appel | Anticipation locale | Données collectives floues | Vue marché simple |
| Collectivité acheteuse ou programme alimentaire | Organisation publique ou programme | Couvrir besoins sociaux ou territoriaux | Moyenne | Dashboard, agent, email | Impact, traçabilité, décision | Gouvernance et confidentialité | Besoins programme et suivi |
| Acheteur institutionnel | Institution, ONG, programme | Financer ou organiser une demande | Moyenne à élevée | Dashboard, rendez-vous, email | Pilotage, impact, preuve | Confondre demo et produit réel | Vue agrégée, contrôlée |
| Agent terrain côté demande | Relais d'acheteurs peu numériques | Saisir et valider des besoins | Moyenne | Mobile, appel, WhatsApp | Inclusion, qualité data | Erreurs de saisie | Parcours assisté et hors ligne |

## 3. Acquisition

### Canaux de recrutement et activation

| Canal | Usage | Preuve ou validation attendue |
| --- | --- | --- |
| Prospection terrain | Identifier mareyeurs, transformateurs, marchés | Validation par agent ou référent |
| Quais et marchés | Observer demande réelle au point d'activité | Rattachement territorial |
| Associations professionnelles | Recruter acteurs structurés | Validation organisationnelle |
| GIE et coopératives | Activer achats collectifs | Liste de membres ou mandat |
| WhatsApp | Premier contact, besoin rapide, suivi | Confirmation humaine |
| Appels téléphoniques | Inclusion d'acteurs peu numériques | Saisie assistée |
| Agents terrain | Qualification, formation, relance | Historique d'accompagnement |
| Partenariats institutionnels | Programmes, collectivités, ONG | Cadre de gouvernance |
| Entreprises pilotes | Besoins récurrents et qualité | Accord pilote |
| Démonstrations ciblées | Conversion de prospects qualifiés | Scénario par acteur |

### Étapes d'activation

| Étape | Objectif | Sortie |
| --- | --- | --- |
| Identifier | Repérer un acteur de demande | Prospect |
| Qualifier | Comprendre rôle, zone, espèces, volumes | Profil acheteur |
| Valider | Confirmer identité, organisation, contact | Acheteur validé |
| Publier | Créer le premier besoin | Besoin actif |
| Recommander | Relier à des arrivages | Opportunités |
| Réserver | Activer une mise en relation | Réservation |
| Suivre | Transformer en transaction | Historique et preuve |

## 4. Besoins

### Types de besoins

| Type | Description | Exemple |
| --- | --- | --- |
| Besoin ponctuel | Demande unique | 300 kg de dorade aujourd'hui |
| Besoin récurrent | Demande répétée | 500 kg chaque semaine |
| Besoin urgent | Délai court | Retrait avant midi |
| Besoin saisonnier | Dépend d'une période | Sardinelle en haute saison |
| Besoin par espèce | Centré sur une espèce | Thiof uniquement |
| Besoin par volume | Centré sur quantité | Minimum 2 tonnes |
| Besoin par quai ou zone | Localisé | Joal ou Mbour |
| Besoin qualité | Exige fraîcheur ou état | Lot très frais |
| Besoin programme / collectivité | Lié à une action publique | Cantines, programme social |
| Besoin entreprise | Structuré par organisation | Approvisionnement industriel |

### Données minimales

| Donnée | Usage |
| --- | --- |
| Acheteur ou organisation | Identifier la demande |
| Espèce recherchée | Matching |
| Quantité | Couverture |
| Unité | Normalisation |
| Quai ou zone | Proximité et tension |
| Urgence | Priorisation |
| Date ou délai | Disponibilité |
| Qualité attendue | Filtrage |
| Canal de contact | Suivi |
| Commentaire | Contexte |

### Règles de validation

| Règle | Application |
| --- | --- |
| Espèce obligatoire | Sans espèce, pas de matching fiable |
| Quantité obligatoire | Sans volume, pas de couverture |
| Zone recommandée | Sans zone, opportunités moins pertinentes |
| Urgence explicitée | Urgent, normal, planifié ou saisonnier |
| Organisation validée si besoin collectif | Évite confusion individuelle / organisation |
| Doublons détectés | Besoins proches du même acteur signalés |
| Expiration définie | Évite besoins obsolètes |

### Statuts

| Statut | Signification |
| --- | --- |
| Brouillon | Saisi mais non publié |
| Ouvert | Visible pour coordination |
| En cours | Opportunité ou réservation active |
| Partiellement couvert | Volume partiellement satisfait |
| Couvert | Besoin satisfait |
| Expiré | Délai dépassé |
| Clos | Fermé par acheteur ou admin |
| Annulé | Retiré avec raison |

### Cycle de vie

| Étape | Description |
| --- | --- |
| Création | Besoin saisi directement ou assisté |
| Validation | Contrôle minimal des données |
| Publication | Besoin devient coordonnable |
| Matching | Arrivages compatibles recherchés |
| Opportunité | Recommandation proposée |
| Réservation | Acheteur active une opportunité |
| Transaction | Suivi opérationnel |
| Clôture | Besoin couvert, expiré, clos ou annulé |

### Erreurs à éviter

| Erreur | Risque |
| --- | --- |
| Besoin sans délai | Matching non actionnable |
| Volume irréaliste | Opportunités inutiles |
| Espèce vague | Recommandation faible |
| Doublons non fusionnés | Surévaluation de la demande |
| Besoin non expiré | Fausse tension |
| Canal non vérifié | Réservation impossible |

### Doublons, expiration et clôture

Les besoins du même acheteur, sur la même espèce, zone et période, doivent être rapprochés ou signalés. Un besoin doit pouvoir expirer automatiquement selon son délai, mais la clôture finale peut rester humaine si une transaction ou un conflit existe.

## 5. Opportunités et réservations

### Rencontre entre besoin et arrivage

Un besoin rencontre un arrivage lorsque les critères métier stabilisés sont satisfaits : espèce compatible, quantité suffisante ou partiellement couvrable, disponibilité, zone pertinente, qualité acceptable et acteur fiable.

### Explication d'une opportunité

| Élément | Explication attendue |
| --- | --- |
| Espèce | Correspond à la demande |
| Quantité | Couvre totalement ou partiellement le besoin |
| Quai | Proche ou pertinent |
| Qualité | Compatible avec attente |
| Délai | Disponible dans la fenêtre utile |
| Confiance | Vendeur et acheteur ont un historique lisible |
| Impact | Volume valorisé, tension réduite ou perte évitée |

### Manifestation d'intérêt

L'acheteur peut manifester son intérêt via une action contextualisée. Cette action ne doit pas être confondue avec un achat définitif. Elle déclenche un statut, une trace et éventuellement une notification.

### Réservation sécurisée

| Règle | Objectif |
| --- | --- |
| Confirmation explicite | Éviter clic involontaire |
| Quantité réservée | Éviter sur-réservation |
| Délai de validité | Éviter blocage abusif |
| Historique | Conserver preuve |
| Annulation justifiée | Préserver confiance |
| Notification | Informer les acteurs concernés |

### Réservations abusives

Mbàmbulaan doit limiter les réservations abusives par l'historique, le score de confiance, les limites de volume, les délais d'expiration, la revue humaine et la possibilité de signaler une annulation répétée.

### Annulation, indisponibilité, conflit ou retard

| Cas | Traitement |
| --- | --- |
| Annulation acheteur | Demander raison, libérer lot, historiser |
| Indisponibilité lot | Notifier acheteur, proposer alternative |
| Conflit volume | Comparer déclaration, réservation, transaction |
| Retard retrait | Alerter, replanifier, tracer |
| Litige qualité | Ouvrir incident et rattacher preuve |

### Événements à tracer

| Événement | Trace minimale |
| --- | --- |
| Opportunité proposée | Besoin, arrivage, score, raisons |
| Intérêt exprimé | Acheteur, date, quantité |
| Réservation créée | Lot, besoin, statut, délai |
| Réservation annulée | Auteur, raison, date |
| Retard signalé | Responsable, commentaire |
| Conflit ouvert | Type, acteurs, objet |
| Transaction créée | Référence, statut initial |

## 6. Transactions

### Suivi transactionnel

| Étape | Description | Preuve possible |
| --- | --- | --- |
| Réservation | Lot bloqué pour un acheteur | Horodatage |
| Confirmation | Acteurs confirment intention | Notification ou appel |
| Préparation | Lot préparé pour retrait ou livraison | Statut |
| Retrait | Acheteur ou relais récupère | Confirmation terrain |
| Livraison | Lot livré si applicable | Photo, signature ou commentaire |
| Clôture | Transaction terminée | Statut final |
| Annulation | Transaction stoppée | Raison |
| Incident | Problème déclaré | Rapport ou preuve |
| Preuve | Élément documentaire | Photo, commentaire, historique |

### Limites MVP

| Limite | Raison |
| --- | --- |
| Pas de paiement natif obligatoire | Priorité à coordination, traçabilité et preuve |
| Pas de marketplace complète au départ | Mbàmbulaan n'est pas un catalogue transactionnel classique |
| Pas de messagerie libre hors contexte | Éviter bruit, abus et perte de traçabilité |
| Pas de prix imposé automatiquement | Les prix peuvent rester indicatifs et contextualisés |
| Pas d'automatisation critique sans humain | Confiance et conflits exigent validation |

## 7. Données

### Données nécessaires

| Donnée | Usage |
| --- | --- |
| Profil acheteur | Identifier l'acteur |
| Organisation | Rattacher à entreprise, coopérative, marché, programme |
| Zone | Localiser demande |
| Espèces recherchées | Matching |
| Volumes moyens | Prévision et couverture |
| Fréquence | Besoin ponctuel ou récurrent |
| Canaux préférés | Notification et suivi |
| Historique besoins | Fiabilité et analytics |
| Historique réservations | Confiance |
| Historique transactions | Preuve et valeur |
| Incidents | Gestion risque |
| Score de confiance | Priorisation |
| Préférences de notification | Pertinence canal |

### Sensibilité et visibilité

| Type | Règle |
| --- | --- |
| Données sensibles | Contacts, incidents, transactions et confiance sous droits |
| Données visibles par rôle | Chaque acteur voit uniquement les informations utiles et autorisées |
| Données agrégées | Utilisables pour dashboard, executive, impact et tensions |
| Données interdites côté public | Contacts, transactions réelles, prix privés, incidents, réservations |

## 8. IA et moteurs métier

| Moteur | Utilité côté acheteur | Donnée d'entrée | Sortie attendue | Explicabilité |
| --- | --- | --- | --- | --- |
| matching | Relier besoin et arrivage | Espèce, volume, zone | Opportunités compatibles | Critères affichés |
| recommendation | Classer les meilleures opportunités | Besoins, arrivages, qualité, urgence | Score et classement | Raisons du score |
| trust | Évaluer fiabilité vendeur et acheteur | Historique, annulations, transactions | Badge confiance | Facteurs visibles |
| impact | Mesurer valeur créée | Volumes, transactions, prix indicatifs | Volume valorisé, impact | Calcul résumé |
| tension | Identifier zones où demande dépasse offre | Besoins, arrivages, transactions | Niveau tension | Offre vs demande |
| prioritization | Mettre en avant besoins et opportunités critiques | Urgence, impact, tension, confiance | Priorité | Critères affichés |
| alerts | Transformer signaux en alertes | Besoins critiques, retards, tensions | Alertes actionnables | Niveau et raison |
| traceability | Suivre lot et transaction | Événements lot, réservation, retrait | Historique | Timeline |
| quality | Évaluer fraîcheur et risque | Heure, espèce, quai, statut | Score qualité | Facteurs qualité |
| role recommendations | Adapter conseils à l'acheteur | Rôle, besoins, activité | Actions recommandées | Module cible |
| executive intelligence | Agréger pour décideurs | Données consolidées | Synthèse et risques | Sources agrégées |

## 9. UX

### Vues nécessaires

| Vue | Objectif | CTA principal |
| --- | --- | --- |
| Espace acheteur | Synthèse des besoins, opportunités, transactions | Publier un besoin |
| Publication besoin | Saisir demande structurée | Publier |
| Liste besoins | Suivre besoins ouverts, couverts, expirés | Filtrer |
| Détail besoin | Comprendre couverture et opportunités | Voir opportunités |
| Opportunités recommandées | Prioriser lots compatibles | Réserver |
| Détail opportunité | Lire raisons, qualité, confiance, trace | Réserver ou contacter contexte |
| Réservation | Confirmer quantité, délai et responsabilité | Confirmer |
| Suivi transaction | Avancer statut et gérer preuve | Mettre à jour |
| Historique | Revoir besoins, réservations, incidents | Consulter |
| Notifications | Lire alertes et actions | Marquer traité |
| Tableau de bord acheteur | Lire activité et valeur | Agir sur priorité |
| Vue mobile terrain | Saisie ou confirmation rapide | Action courte |

### Navigation

La navigation acheteur doit rester courte : Accueil, Besoins, Opportunités, Réservations, Transactions, Notifications, Historique. Les vues avancées doivent être accessibles par contexte, pas par menu long.

### CTA principaux

| Contexte | CTA |
| --- | --- |
| Aucun besoin ouvert | Publier un besoin |
| Besoin ouvert | Voir opportunités |
| Opportunité compatible | Réserver |
| Réservation active | Suivre transaction |
| Transaction bloquée | Signaler incident |
| Besoin couvert | Clôturer |

### États vides

| État vide | Message attendu |
| --- | --- |
| Aucun besoin | Inviter à publier un besoin |
| Aucune opportunité | Expliquer critères et proposer d'élargir zone ou délai |
| Aucune transaction | Montrer le parcours besoin -> opportunité -> réservation |
| Aucune notification | Confirmer qu'aucune action n'est attendue |

### Messages d'erreur

Les messages doivent être simples et actionnables : quantité manquante, espèce absente, délai expiré, lot indisponible, réservation déjà prise, droits insuffisants, synchronisation impossible.

### Mobile first, accessibilité et surcharge cognitive

| Principe | Application |
| --- | --- |
| Mobile first | Publication besoin et réservation doivent tenir sur mobile |
| Accessibilité | Contrastes, labels, navigation clavier |
| Progressive disclosure | Score, historique et détails avancés après résumé |
| One Action Principle | Une action dominante par écran |
| No cognitive overload | Pas de dashboard dense pour un acteur terrain |

## 10. User Stories

| ID | Persona | Feature | User Story | Critères d'acceptation | Priorité | Horizon |
| --- | --- | --- | --- | --- | --- | --- |
| MB-01 | Mareyeur référent | Publication besoin | En tant que mareyeur référent, je veux publier un besoin rapide afin de trouver un lot disponible. | Given un profil validé, When je saisis espèce et quantité, Then le besoin passe ouvert. | Must | MVP |
| MB-02 | Mareyeur occasionnel | Saisie assistée | En tant que mareyeur occasionnel, je veux publier par appel afin de ne pas dépendre d'une application. | Given un appel, When l'agent saisit, Then le canal est historisé. | Must | MVP |
| MB-03 | Transformateur | Besoin récurrent | En tant que transformateur, je veux créer un besoin récurrent afin de planifier mon approvisionnement. | Given une fréquence, When je valide, Then le besoin est marqué récurrent. | Should | V1 |
| MB-04 | Coopérative acheteuse | Organisation | En tant que coopérative, je veux rattacher un besoin à mon organisation afin de suivre l'achat collectif. | Given une organisation validée, When je publie, Then le besoin est lié à la coopérative. | Must | MVP |
| MB-05 | Entreprise agroalimentaire | Qualité | En tant qu'entreprise, je veux préciser une qualité attendue afin de filtrer les opportunités. | Given une exigence qualité, When matching, Then les lots incompatibles sont signalés. | Should | V1 |
| MB-06 | Exportateur | Traçabilité | En tant qu'exportateur, je veux voir la traçabilité d'un lot afin d'évaluer sa conformité. | Given une opportunité, When j'ouvre le détail, Then l'historique du lot est visible selon droits. | Should | V1 |
| MB-07 | Marché local | Zone | En tant que marché local, je veux exprimer un besoin par zone afin de rester proche du quai. | Given un quai, When je publie, Then les opportunités proches sont priorisées. | Must | MVP |
| MB-08 | Collectivité acheteuse | Programme | En tant que collectivité, je veux publier un besoin programme afin de suivre son impact. | Given un programme, When le besoin est couvert, Then l'impact est rattaché. | Should | V1 |
| MB-09 | Acheteur institutionnel | Agrégation | En tant qu'acheteur institutionnel, je veux voir des données agrégées afin de décider sans exposer de données sensibles. | Given mon rôle, When je consulte, Then les données nominatives sont masquées. | Must | MVP |
| MB-10 | Agent terrain demande | Saisie terrain | En tant qu'agent terrain, je veux saisir un besoin pour un acheteur afin d'inclure les acteurs peu numériques. | Given un acteur non numérique, When je saisis, Then mon identité d'agent est tracée. | Must | MVP |
| MB-11 | Mareyeur référent | Opportunité | En tant que mareyeur, je veux recevoir des opportunités compatibles afin d'agir vite. | Given un besoin ouvert, When un arrivage compatible existe, Then une opportunité est proposée. | Must | MVP |
| MB-12 | Transformateur | Score | En tant que transformateur, je veux comprendre le score d'une recommandation afin de décider. | Given une opportunité, When je lis le score, Then les critères sont affichés. | Must | MVP |
| MB-13 | Mareyeur occasionnel | Réservation | En tant qu'acheteur, je veux réserver une quantité afin de sécuriser un lot. | Given une opportunité disponible, When je confirme, Then la réservation est créée. | Must | MVP |
| MB-14 | Coopérative acheteuse | Réservation partielle | En tant que coopérative, je veux réserver partiellement afin de couvrir une partie du besoin. | Given volume inférieur, When je réserve, Then le besoin devient partiellement couvert. | Should | V1 |
| MB-15 | Exportateur | Délai | En tant qu'exportateur, je veux connaître le délai disponible afin d'organiser le retrait. | Given une opportunité, When j'ouvre détail, Then délai et expiration sont visibles. | Must | MVP |
| MB-16 | Mareyeur référent | Annulation | En tant que mareyeur, je veux annuler avec raison afin de libérer le lot proprement. | Given une réservation, When j'annule, Then raison et date sont historisées. | Must | MVP |
| MB-17 | Support | Abus | En tant que support, je veux voir les annulations répétées afin de réduire les réservations abusives. | Given plusieurs annulations, When je consulte le profil, Then le signal risque apparaît. | Should | V1 |
| MB-18 | Transformateur | Transaction | En tant que transformateur, je veux suivre la transaction afin de savoir si le lot est prêt. | Given réservation active, When statut change, Then je suis notifié. | Must | MVP |
| MB-19 | Agent terrain demande | Retrait | En tant qu'agent, je veux confirmer un retrait afin de tracer la transaction. | Given un retrait terrain, When je confirme, Then la preuve est associée. | Should | V1 |
| MB-20 | Entreprise agroalimentaire | Historique | En tant qu'entreprise, je veux voir l'historique des transactions afin de suivre la fiabilité. | Given transactions passées, When je consulte, Then elles sont listées avec statuts. | Should | V1 |
| MB-21 | Acheteur institutionnel | Impact | En tant qu'institution, je veux voir l'impact des besoins couverts afin d'évaluer le programme. | Given besoins couverts, When dashboard, Then volumes et impact agrégés sont visibles. | Should | V1 |
| MB-22 | Mareyeur référent | Notification | En tant que mareyeur, je veux être notifié d'un lot compatible afin de répondre vite. | Given opportunité, When elle est créée, Then notification envoyée selon canal. | Must | MVP |
| MB-23 | Marché local | État vide | En tant que marché local, je veux comprendre pourquoi aucune opportunité n'existe afin d'ajuster mon besoin. | Given aucun match, When je consulte, Then critères bloquants sont expliqués. | Must | MVP |
| MB-24 | Transformateur | Qualité lot | En tant que transformateur, je veux connaître le risque qualité afin de prioriser le retrait. | Given lot sensible, When détail, Then qualité et action recommandée sont visibles. | Should | V1 |
| MB-25 | Coopérative acheteuse | Droits | En tant que coopérative, je veux limiter les actions par rôle afin de protéger les données membres. | Given utilisateurs multiples, When accès, Then droits appliqués. | Should | V1 |
| MB-26 | Exportateur | Confidentialité | En tant qu'exportateur, je veux que mes besoins privés ne soient pas publics afin de protéger ma stratégie. | Given besoin entreprise, When public, Then aucune donnée sensible n'apparaît. | Must | MVP |
| MB-27 | Mareyeur occasionnel | Mobile | En tant que mareyeur occasionnel, je veux utiliser mobile afin de publier vite au marché. | Given petit écran, When formulaire, Then champs essentiels restent lisibles. | Must | MVP |
| MB-28 | Agent terrain demande | Offline | En tant qu'agent, je veux saisir hors ligne afin de continuer au marché. | Given pas de réseau, When saisie, Then brouillon conservé. | Could | V1.5 |
| MB-29 | Admin Données | Doublon besoin | En tant qu'Admin Données, je veux détecter les doublons afin d'éviter une fausse tension. | Given besoins similaires, When validation, Then alerte doublon affichée. | Must | MVP |
| MB-30 | Mareyeur référent | Clôture | En tant que mareyeur, je veux clôturer un besoin couvert afin de ne plus recevoir d'opportunités. | Given besoin couvert, When je clôture, Then il sort des recommandations. | Must | MVP |
| MB-31 | Transformateur | Priorisation | En tant que transformateur, je veux voir les lots prioritaires afin de sauver les volumes sensibles. | Given lots à risque, When opportunités, Then priorité est affichée. | Should | V1 |
| MB-32 | Collectivité acheteuse | Tension | En tant que collectivité, je veux voir les tensions de demande afin de décider où intervenir. | Given besoins par zone, When vue territoire, Then tension est visible. | Should | V1 |
| MB-33 | Customer Success | Activation | En tant que Customer Success, je veux voir les acheteurs inactifs afin de les relancer. | Given absence activité, When filtre, Then liste de relance apparaît. | Could | V1.5 |
| MB-34 | Support | Incident | En tant que support, je veux ouvrir un incident transaction afin de traiter un conflit. | Given problème qualité ou retard, When j'ouvre incident, Then statut et preuve sont historisés. | Should | V1 |
| MB-35 | Investisseur | Démo contrôlée | En tant qu'investisseur, je veux comprendre le réseau demande afin d'évaluer la valeur sans accéder aux données réelles. | Given démo publique, When scénario acheteur, Then données scénarisées seulement. | Must | MVP |

## 11. Tests

| ID | Domaine | Test | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- |
| T-01 | Publication besoin | Créer un besoin avec champs obligatoires | Besoin ouvert | Must |
| T-02 | Publication besoin | Soumettre sans espèce | Erreur claire | Must |
| T-03 | Publication besoin | Soumettre sans quantité | Erreur claire | Must |
| T-04 | Validation données | Détecter doublon proche | Alerte doublon | Must |
| T-05 | Validation données | Expirer un besoin dépassé | Statut expiré | Must |
| T-06 | Matching | Besoin compatible avec arrivage | Opportunité générée | Must |
| T-07 | Matching | Quantité insuffisante | Couverture partielle ou absence selon règle | Must |
| T-08 | Opportunité | Afficher raisons du score | Critères visibles | Must |
| T-09 | Opportunité | Lot indisponible | Réservation bloquée | Must |
| T-10 | Réservation | Confirmer réservation | Statut réservé et trace | Must |
| T-11 | Réservation | Réserver un lot déjà réservé | Message d'indisponibilité | Must |
| T-12 | Annulation | Annuler avec raison | Lot libéré et historique | Must |
| T-13 | Transaction | Avancer préparation -> retrait | Statut mis à jour | Must |
| T-14 | Transaction | Clôturer transaction | Preuve et statut final | Should |
| T-15 | Notification | Opportunité créée | Acheteur notifié | Must |
| T-16 | Confidentialité | Vue publique | Aucune donnée acheteur sensible | Must |
| T-17 | Droits | Organisation multi-utilisateurs | Actions limitées par rôle | Should |
| T-18 | Mobile | Publier besoin sur petit écran | Formulaire lisible | Must |
| T-19 | États vides | Aucune opportunité | Explication et prochaine action | Must |
| T-20 | Erreurs | Synchronisation impossible | Message clair et conservation brouillon | Should |
| T-21 | Incident | Retard ou qualité contestée | Incident historisé | Should |
| T-22 | Analytics | Besoin publié | Événement mesuré | Should |

## 12. Definition of Done

### Checklist produit

| Critère | Done |
| --- | --- |
| Référence Product Book respectée | Aucune contradiction avec `MBAMBULAAN_PRODUCT_BOOK_v1.md` |
| Positionnement respecté | Réseau coordonné de demande, pas marketplace simple |
| Personas couverts | 10 personas acheteurs et demande |
| Acquisition décrite | Terrain, marchés, associations, WhatsApp, agents, institutions |
| Besoins cadrés | Types, données minimales, validation, statuts, cycle de vie |
| Opportunités expliquées | Critères, score, intérêt, réservation |
| Réservations sécurisées | Anti-abus, annulation, indisponibilité, conflit, retard |
| Transactions limitées MVP | Pas de paiement natif obligatoire, pas de marketplace complète |
| Données gouvernées | Sensibles, visibles par rôle, agrégées, interdites public |
| Moteurs métier reliés | Matching, recommendation, trust, impact, tension, prioritization, alerts, traceability, quality |
| UX spécifiée | Vues, navigation, CTA, états vides, erreurs, mobile, accessibilité |
| User Stories complètes | 35 stories structurées |
| Tests définis | 22 tests fonctionnels |
| Support terrain prévu | Appel, WhatsApp, agents et saisie assistée |
| Reprise future en code possible | Le document peut guider design, produit et engineering |

### Conditions de validation

| Condition | Résultat attendu |
| --- | --- |
| Un acheteur peut exprimer un besoin clair | Oui |
| Un besoin peut rencontrer un arrivage | Oui |
| Une opportunité est expliquée | Oui |
| Une réservation est tracée | Oui |
| Une transaction reste coordonnée sans paiement natif obligatoire | Oui |
| Les données sensibles restent protégées | Oui |
| Le réseau reste humain et contextualisé | Oui |

## Synthèse de livraison

| Indicateur | Nombre |
| --- | --- |
| Sections principales | 12 |
| Personas spécifiés | 10 |
| User Stories | 35 |
| Tests fonctionnels | 22 |
