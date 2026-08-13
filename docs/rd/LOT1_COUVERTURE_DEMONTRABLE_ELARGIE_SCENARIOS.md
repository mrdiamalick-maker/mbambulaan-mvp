# Lot 1 — Couverture démontrable élargie

**Statut :** proposition R&D soumise à validation CEO

**Branche de conception :** `codex/rd-exploration`

**Nature :** scénarios de démonstration, sans intégration au Produit réel

**Date de cadrage :** 13 août 2026

## 1. Décision proposée

Retenir **six nouveaux scénarios complets**, répartis sur le nord, le centre et le sud du littoral :

1. Lompoul-sur-Mer — besoin de balises de géolocalisation pour pirogues ;
2. Fass Boye — régularisation d'une immatriculation et d'une licence déclarées ;
3. Yoff — tension locale de prix et débouché à qualifier ;
4. Foundiougne — capacité de fumage réduite par un équipement défaillant ;
5. Elinkine — retour de pirogue retardé et chaîne de sécurité à activer ;
6. Cap Skirring — débouché annulé pour un lot déjà préparé.

Ces scénarios ne remplacent pas les parcours déjà profonds de Joal, Saint-Louis, Kafountine, Rufisque, Djiffer et Soumbédioune. Ils élargissent la couverture à de nouveaux territoires et réutilisent la même boucle métier :

> Signal → Qualification → Situation → Décision → Engagement → Exécution → Preuve → Résultat → Apprentissage

Ils n'introduisent aucune nouvelle promesse statistique, aucun chiffre national et aucune donnée réelle.

## 2. Référentiel de cohérence

La conception a été rapprochée, en lecture seule, de la version récente de `src/data/demo-state.ts` et de `src/domain/types.ts` sur `codex/xxl-premium`.

### 2.1 Niveaux de confiance

Le code récent nomme le champ `trust`. Il correspond à l'exigence de `confidenceLevel` mentionnée dans le mandat. Les scénarios utilisent uniquement les statuts existants :

| Statut | Sens démontrable |
|---|---|
| `declaree` | information rapportée par un acteur ou son relais, non encore recoupée ; |
| `observee` | fait constaté localement, sans validation institutionnelle ; |
| `rapprochee` | information comparée à une autre source ou à un référentiel ; |
| `documentee` | information appuyée par une pièce ou une trace exploitable ; |
| `verifiee` | fait contrôlé par un acteur mandaté selon la règle de démonstration ; |
| `officielle` | information issue d'une source institutionnelle explicitement compétente ; |
| `estimee` | quantité, coût ou délai indicatif, jamais présenté comme acquis ; |
| `contestee` / `expiree` | information qui ne peut pas soutenir une décision sans nouvelle vérification. |

Un même dossier peut donc commencer en `declaree`, devenir `observee` après un constat terrain, puis `documentee` ou `verifiee` après preuve. Une saisie par un agent de quai n'augmente pas mécaniquement la confiance.

### 2.2 Canaux compatibles

Les canaux actuels de `Signal` sont `terrain`, `telephone`, `whatsapp_structure` et `poste_quai`. Le modèle de relais est représentable sans masquer la provenance :

- **acteur autonome** : `actorId` = acteur source ; `channel` = `whatsapp_structure`, `telephone` ou `terrain` ;
- **relais humain** : `actorId` = agent qui saisit ; `channel` = `poste_quai` ou `telephone` ; `source` nomme l'acteur d'origine et le message vocal/appel ;
- la référence au média brut reste une trace de communication simulée, pas une preuve du contenu.

Pour une industrialisation propre, Claude Code devra préserver séparément l'auteur du besoin et le saisisseur, par exemple avec `reportedByActorId`, `capturedByActorId`, `rawChannel` et `rawMessageReference`. Cette note ne modifie pas le modèle métier.

### 2.3 Points de compatibilité à arbitrer

#### Catégorie de conformité

La catégorie `Signal` actuelle ne contient pas `conformite`. Le scénario de Fass Boye ne doit pas être rangé artificiellement dans `production`.

Deux voies sont possibles lors de l'intégration :

1. **voie propre recommandée** : ajouter la catégorie `conformite` après validation du modèle ;
2. **voie transitoire** : conserver `qualite` uniquement au sens de « qualité de la donnée administrative », avec le sous-type visible `conformité administrative`.

Ce choix appartient à l'équipe de développement ; la présente R&D n'altère aucun type.

#### Initiative sans budget ni financeur acquis

Le modèle récent ne possède pas un statut technique `recherche_financement`. Il propose `cadrage`, `financee`, `execution` et `terminee`. Il impose également un `budgetFcfa` numérique, tandis qu'un financement éventuel exige un partenaire et un montant.

Pour le scénario de Lompoul, la représentation honnête est donc :

- `Initiative.status = cadrage` ;
- `Initiative.funding = []` tant qu'aucun financeur ne s'est engagé ;
- libellé d'interface **« Recherche de financement »**, dérivé du cadrage et de l'absence de financement, pas stocké comme un financement acquis ;
- budget affiché **« À estimer »**, sans partenaire fictif et sans montant de démonstration présenté comme réel.

Avant intégration, Claude Code devra arbitrer la représentation du budget non encore chiffré. La voie propre consiste à rendre le montant optionnel ou à lui associer un statut explicite (`a_estimer`, `estime`, `valide`). La voie transitoire consistant à stocker `0` ne peut être acceptable que si ce zéro est traité comme une absence de chiffrage et n'est jamais affiché comme un budget réel.

## 3. Matrice de couverture

| # | Territoire | Zone | Type unique | Entrée | Trace métier principale | Confiance finale utile |
|---|---|---|---|---|---|---|
| 1 | Lompoul-sur-Mer | Nord | Besoin d'équipement de sécurité | Relais, note vocale | Terrain, Opérateur, Prestataire, Programmes & financements | besoin `documentee`, coût `estimee` |
| 2 | Fass Boye | Nord | Conformité administrative | Directe | Opérateur, Terrain, Capitaine | dossier `rapprochee`, statut officiel en attente |
| 3 | Yoff | Centre | Tension de prix / marché | Directe | Mareyeur/Transformateur, Opérateur | situation `observee`, résultat `documentee` |
| 4 | Foundiougne | Centre | Capacité / équipement | Relais, appel | Transformateur, Prestataire, Terrain | panne `verifiee`, remise en service `documentee` |
| 5 | Elinkine | Sud | Sécurité en mer | Relais, appel radio/téléphone | Terrain, Opérateur, Capitaine | retour `verifiee` après constat |
| 6 | Cap Skirring | Sud | Tension de marché | Directe | Mareyeur/Transformateur, Opérateur | débouché annulé `documentee`, livraison `verifiee` |

La répartition ne repose donc pas sur l'Espace Institution ou Coordinateur : chaque scénario crée une trace exploitable dans au moins un espace opérationnel, et l'ensemble couvre les quatre vues à démontrer — Opérateur, Mareyeur/Transformateur, Prestataire et Terrain.

---

## 4. Scénario 1 — Lompoul-sur-Mer

### Besoin de balises de géolocalisation pour pirogues

**Type unique :** besoin d'équipement de sécurité en mer

**Accès initial :** relais humain à partir d'une note vocale

**Message principal :** sécurité en mer et réduction des pertes ; aucune communication centrée sur l'immigration clandestine.

### Déclencheur

Le capitaine d'une pirogue envoie une note vocale à l'agent de quai :

> « Plusieurs équipages veulent pouvoir signaler leur position quand le retour se prolonge. Nous avons besoin de balises simples et d'une procédure pour les utiliser. »

L'agent écoute le message, rappelle le capitaine pour confirmer le territoire et saisit le besoin dans **Décrire une situation**.

### Boucle détaillée

| Étape | Contenu démontrable | Confiance et limite |
|---|---|---|
| **Signal** | `sig-lompoul-balises` — « Besoin de balises de géolocalisation pour pirogues ». Source : note vocale d'un capitaine, saisie par `act-relais-lompoul`. Canal structuré : `poste_quai`. Le signal mentionne un premier groupe de 25 pirogues intéressées. | `declaree`. Le nombre de pirogues est une déclaration à confirmer ; la note vocale prouve l'origine du signal, pas la réalité du besoin collectif. |
| **Qualification** | L'opérateur vérifie qu'il s'agit d'un besoin d'équipement, non d'une alerte de pirogue en détresse. Trois capitaines et le responsable du quai confirment l'existence du besoin. Les exigences minimales sont listées : autonomie, étanchéité, déclenchement, formation, maintenance et responsabilité de suivi. | Le besoin devient `observee`. La taille du parc, la technologie, le coût et l'efficacité restent non validés. |
| **Situation** | `sit-lompoul-balises` — « Équipement de géolocalisation insuffisant pour le suivi des retours ». Priorité `haute`, statut `qualification`, visibilité `partenaires`. Prochain pas : documenter le périmètre et les conditions d'usage. | `observee`. La situation ne dit pas que les balises réduiront automatiquement les accidents ni qu'une solution technique est déjà choisie. |
| **Décision** | 1) `demander_verification` : dresser une liste nominative volontaire et qualifier l'usage ; 2) `constituer_programme` : transformer le besoin documenté en initiative de recherche de financement. Un espace de coordination porte ensuite les engagements techniques. | Décision humaine tracée. Aucune décision d'achat, aucun fournisseur sélectionné. |
| **Engagements** | Relais Terrain : confirmer les pirogues candidates et les contacts. Prestataire : produire une note d'options techniques sans proposition commerciale engageante. Coordinateur : définir les critères de financement et de gouvernance. Opérateur : créer l'initiative dans Programmes & financements. | Liste `rapprochee` après recoupement ; options et coût restent `estimee`. |
| **Exécution** | Deux courtes séances au quai, consolidation des besoins, description de la procédure d'alerte, identification des responsabilités de maintenance, préparation d'une fiche initiative. | Traces simulées et datées. Aucune position GPS réelle n'est collectée. |
| **Preuve** | Référence de la note vocale, compte rendu des confirmations, liste volontaire des pirogues, fiche d'exigences, note technique, validation humaine du responsable de quai. | Besoin `documentee`; note technique `documentee`; coût `estimee`. |
| **Résultat** | `init-lompoul-balises` apparaît dans **Programmes & financements** avec le libellé **Recherche de financement**. Côté modèle actuel : statut `cadrage`, tableau `funding` vide et budget « À estimer » selon l'arbitrage décrit plus haut. Le périmètre, les bénéficiaires à confirmer, la gouvernance, la maintenance et les preuves attendues sont visibles. | Le résultat est l'existence d'un besoin finançable mieux défini — pas l'installation de balises, pas un financement acquis. |
| **Apprentissage** | « Un message vocal court peut devenir un dossier d'équipement exploitable si l'auteur, le relais, les confirmations et les limites restent visibles. » Réutilisable à Fass Boye, Kayar et Elinkine. | `documentee` comme apprentissage de processus, pas comme preuve d'impact sécurité. |

### Traces visibles par espace

- **Terrain** : message vocal reçu, saisie par relais, rappels à effectuer, confirmations recueillies ;
- **Opérateur** : signal structuré, qualification, historique et décision ;
- **Prestataire** : demande de note technique, engagement et pièce déposée ;
- **Programmes & financements** : initiative en recherche de financement, sans partenaire présenté comme engagé.

### Critère de démonstration

En moins de deux minutes, le public doit comprendre que Mbàmbulaan ne géolocalise pas encore les pirogues : il sait déjà **faire remonter, qualifier, coordonner et présenter au financement** un besoin d'équipement de géolocalisation.

---

## 5. Scénario 2 — Fass Boye

### Immatriculation et licence déclarées à régulariser

**Type unique :** conformité administrative

**Accès initial :** direct, par un capitaine capable d'utiliser l'espace.

### Déclencheur

Un capitaine photographie la pièce d'immatriculation présentée au quai et indique que le nom figurant sur sa licence ne correspond pas exactement au profil de la pirogue.

### Boucle détaillée

| Étape | Contenu démontrable | Confiance et limite |
|---|---|---|
| **Signal** | `sig-fass-boye-conformite` — pièce envoyée directement par le capitaine via un formulaire structuré. | `declaree`. La présence d'une photo ne rend pas la pièce officielle ni valide. |
| **Qualification** | L'opérateur contrôle la lisibilité, la date, le numéro déclaré et le rattachement au profil. Il détecte un écart de dénomination et demande la pièce complémentaire. | `documentee` pour la pièce reçue ; statut administratif encore non vérifié. |
| **Situation** | `sit-fass-boye-conformite` — « Rattachement administratif d'une pirogue à vérifier ». Priorité `moyenne`, statut `qualification`. | `rapprochee` lorsque les deux pièces concordent entre elles ; jamais `officielle` avant réponse de la source compétente. |
| **Décision** | `demander_verification` auprès du point administratif mandaté ; ne pas bloquer la trace d'activité, mais afficher « conformité en vérification ». | La décision évite les deux erreurs : effacer le dossier ou le présenter comme conforme. |
| **Engagements** | Capitaine : déposer la pièce manquante. Agent Terrain : vérifier l'identité du dossier présenté au quai. Opérateur : préparer le paquet de rapprochement. Institution : confirmer ou corriger le statut. | Chaque pièce garde sa source, sa date et son statut. |
| **Exécution** | Dépôt du complément, rapprochement des identifiants, envoi de la demande de contrôle, consignation de la réponse. | Aucune accusation d'irrégularité ; seulement un dossier incomplet ou incohérent. |
| **Preuve** | Deux pièces liées au dossier, journal de rapprochement, réponse du service compétent ou statut « réponse attendue ». | `officielle` uniquement si la réponse vient du référentiel compétent ; sinon `rapprochee`. |
| **Résultat** | Le dossier affiche soit « rattachement confirmé », soit « correction demandée », soit « vérification en attente ». La démonstration retient la troisième option jusqu'à la preuve officielle. | Résultat honnête : l'incertitude est visible et actionnable. |
| **Apprentissage** | « Une donnée administrative déclarée peut soutenir le suivi sans être confondue avec une donnée officielle. » | Réutilisable pour Soumbédioune, Hann et Rufisque. |

### Traces visibles par espace

- **Opérateur** : file de dossiers à rapprocher et prochaines actions ;
- **Terrain** : contrôle de présence de la pièce et demande de complément ;
- **Capitaine** : statut compréhensible, pièce manquante et droit de correction.

---

## 6. Scénario 3 — Yoff

### Tension locale de prix et débouché à qualifier

**Type unique :** prix / marché

**Accès initial :** direct, par une mareyeuse.

### Déclencheur

Une mareyeuse signale que plusieurs offres de sardinelle au même stade de vente sont plus élevées que la veille, tandis qu'un volume demeure sans débouché confirmé.

### Boucle détaillée

| Étape | Contenu démontrable | Confiance et limite |
|---|---|---|
| **Signal** | `sig-yoff-marche` — quatre prix déclarés, même espèce, même unité, même stade de marché, accompagnés d'un volume disponible de démonstration. Canal `whatsapp_structure`. | Prix `declaree`; le signal ne mesure ni inflation ni spéculation. |
| **Qualification** | L'opérateur sépare prix au quai et prix de revente, exclut une offre non comparable et demande la qualité/forme du produit. Trois observations restent comparables. | Situation `observee`, couverture explicitement limitée à quelques offres. |
| **Situation** | `sit-yoff-marche` — « Écart local entre prix proposés et débouché disponible ». Priorité `haute`, statut `priorisee`. | `observee`. Aucun pourcentage de tendance n'est affiché comme statistique territoriale. |
| **Décision** | `ouvrir_coordination` entre mareyeuse et transformateur ; chercher un débouché compatible plutôt que prétendre corriger le prix du marché. | Décision opérationnelle, sans promesse de stabilisation des prix. |
| **Engagements** | Mareyeuse : confirmer quantité, qualité et délai. Transformateur : confirmer capacité et prix de reprise. Opérateur : conserver les offres comparables et la décision. | Prix de reprise `declaree` jusqu'à acceptation ; volume `observee`. |
| **Exécution** | Échange des conditions, réservation du volume, préparation et enlèvement dans la fenêtre annoncée. | Simulation de coordination ; aucune transaction réelle. |
| **Preuve** | Offre acceptée, bordereau simulé, confirmation de l'enlèvement et du poids. | Résultat `documentee`, puis `verifiee` si le poids est confirmé par une pesée liée. |
| **Résultat** | Le volume est orienté vers le transformateur. Le résultat documente le volume et le délai ; il ne prétend pas que Mbàmbulaan a fait baisser le prix local. | Causalité économique non revendiquée. |
| **Apprentissage** | « Un signal de prix devient utile lorsqu'il déclenche une coordination documentée ; il ne devient pas un indice d'inflation. » | Réutilisable dans le simulateur public uniquement comme garde-fou méthodologique. |

### Traces visibles par espace

- **Mareyeur/Transformateur** : offre, capacité, engagement et confirmation ;
- **Opérateur** : comparabilité des observations, décision et preuve ;
- **Terrain** : pesée ou constat d'enlèvement si disponible.

---

## 7. Scénario 4 — Foundiougne

### Capacité de fumage réduite par un équipement défaillant

**Type unique :** capacité / équipement

**Accès initial :** relais humain à partir d'un appel.

### Déclencheur

La responsable d'un groupement de transformatrices appelle l'agent de quai. Deux claies de fumage sont inutilisables et la capacité prévue pour l'après-midi est réduite.

### Boucle détaillée

| Étape | Contenu démontrable | Confiance et limite |
|---|---|---|
| **Signal** | `sig-foundiougne-claies` — appel reçu et saisi par le relais Terrain. La responsable du groupement est la source ; l'agent est le saisisseur. | `declaree`. La baisse de capacité est encore estimée par l'appelante. |
| **Qualification** | L'agent effectue un constat visuel, photographie les deux claies et confirme qu'une réparation locale est possible. | État des claies `observee`; capacité disponible `estimee`. |
| **Situation** | `sit-foundiougne-claies` — « Capacité de fumage réduite avant la prochaine préparation ». Priorité `haute`, statut `coordination`. | `observee`; pas de chiffre de pertes évitées sans lots liés. |
| **Décision** | `mobiliser_capacite` : activer un prestataire référencé pour une réparation courte et réorganiser la file de préparation. | Décision bornée à l'équipement. |
| **Engagements** | Prestataire : diagnostiquer et réparer une claie prioritaire. Transformateur : libérer la zone et confirmer l'ordre des lots. Relais : suivre l'arrivée et déposer le constat final. | Diagnostic `documentee` après fiche d'intervention. |
| **Exécution** | Déplacement du prestataire, remplacement d'un élément, essai de stabilité et remise en service d'une claie. | Toute autre claie reste affichée « indisponible » tant qu'elle n'est pas réparée. |
| **Preuve** | Photos avant/après, fiche d'intervention, confirmation de la responsable et heure de remise en service. | Remise en service `verifiee` par le relais mandaté ; capacité restante `observee`. |
| **Résultat** | Une claie redevient disponible et la file de préparation est mise à jour. Aucun volume sauvé n'est calculé sans lot relié. | Résultat `documentee`. |
| **Apprentissage** | « Distinguer équipement réparé, capacité réellement disponible et volume effectivement traité évite de gonfler le résultat. » | Réutilisable pour les équipements de transformation et de pesée. |

### Traces visibles par espace

- **Transformateur** : capacité indisponible, ordre des lots, confirmation ;
- **Prestataire** : mission, diagnostic, exécution et preuve ;
- **Terrain** : appel reçu, constat et validation finale ;
- **Opérateur** : situation, décision et historique.

---

## 8. Scénario 5 — Elinkine

### Retour de pirogue retardé et chaîne de sécurité à activer

**Type unique :** sécurité en mer

**Accès initial :** relais humain à partir d'un appel radio/téléphone.

### Déclencheur

Un proche habilité appelle le poste de quai : une pirogue n'est pas revenue à l'heure annoncée. Il ne dispose pas d'une position confirmée.

### Boucle détaillée

| Étape | Contenu démontrable | Confiance et limite |
|---|---|---|
| **Signal** | `sig-elinkine-retour` — appel consigné par l'agent de quai, heure de retour annoncée dépassée, équipage et contact de sécurité identifiés. | `declaree`. « Retard » ne signifie pas « détresse ». Aucune position n'est inventée. |
| **Qualification** | Le relais confirme l'heure de départ, l'heure attendue, le dernier contact et l'absence d'arrivée sur un second point. | `rapprochee` après deux confirmations ; position toujours inconnue. |
| **Situation** | `sit-elinkine-retour` — « Retour retardé à qualifier ». Priorité `critique`, statut `attente`, responsable et prochaine revue horodatés. | `rapprochee`, puis `verifiee` seulement après contact ou arrivée constatée. |
| **Décision** | `escalader` selon la procédure territoriale et maintenir un point de contact unique pour éviter les informations contradictoires. | Décision de sécurité, pas diagnostic automatique. |
| **Engagements** | Agent Terrain : relancer le contact convenu. Opérateur : consigner chaque appel. Coordinateur : informer le responsable mandaté. Capitaine : confirmer retour dès contact. | Chaque appel garde son auteur et son statut. |
| **Exécution** | Trois tentatives consignées ; le deuxième contact radio confirme que l'équipage se dirige vers la côte ; le quai prépare l'accueil. | Contact radio `declaree` tant que l'arrivée n'est pas constatée. |
| **Preuve** | Journal d'appels, confirmation radio, heure d'arrivée observée et validation de l'agent de quai. | Retour final `verifiee`; cause du retard `declaree` si elle n'est pas contrôlée. |
| **Résultat** | Équipage revenu, chaîne d'alerte clôturée, responsables informés. Aucun indicateur de « vies sauvées » n'est produit. | Résultat `verifiee` limité à l'arrivée et au fonctionnement de la coordination. |
| **Apprentissage** | « Le système doit escalader l'incertitude sans transformer un retard déclaré en détresse certaine. » | Réutilisable à Lompoul et Saint-Louis. |

### Traces visibles par espace

- **Terrain** : appel, relances, arrivée constatée ;
- **Opérateur** : situation critique, horodatage et journal ;
- **Capitaine** : confirmation de retour et droit de corriger la cause rapportée ;
- **Coordinateur** : escalade et clôture, sans monopoliser le scénario.

---

## 9. Scénario 6 — Cap Skirring

### Débouché annulé pour un lot déjà préparé

**Type unique :** tension de marché

**Accès initial :** direct, par une transformatrice.

### Déclencheur

Une transformatrice indique qu'un acheteur a annulé l'enlèvement d'un lot de démonstration déjà préparé. Elle demande une orientation vers un autre débouché avant la fin de la fenêtre de conservation annoncée.

### Boucle détaillée

| Étape | Contenu démontrable | Confiance et limite |
|---|---|---|
| **Signal** | `sig-cap-skirring-debouche` — annulation saisie directement, lot, quantité, qualité, horaire et contact renseignés. | Annulation `declaree`; lot `documentee` si relié à la pesée et à la fiche qualité. |
| **Qualification** | L'opérateur vérifie le lot, l'absence d'engagement actif, la fenêtre de conservation et le prix attendu. | Lot `verifiee`; disponibilité commerciale `observee`; prix attendu `declaree`. |
| **Situation** | `sit-cap-skirring-debouche` — « Lot préparé sans débouché confirmé ». Priorité `haute`, statut `priorisee`. | Le risque de perte est `estimee`, pas présenté comme une perte réalisée. |
| **Décision** | `ouvrir_coordination` avec un mareyeur et un second transformateur ; proposer une solution avant l'échéance, sans modifier automatiquement le prix. | Validation humaine obligatoire. |
| **Engagements** | Transformatrice : maintenir le lot dans les conditions annoncées. Mareyeur : confirmer véhicule et débouché. Opérateur : comparer les conditions. Acheteur alternatif : accepter ou refuser explicitement. | Engagements séparés ; aucune vente implicite. |
| **Exécution** | Proposition, validation des conditions, réservation du transport, enlèvement et confirmation à destination. | Simulation sans transaction réelle. |
| **Preuve** | Annulation initiale, fiche lot, acceptation alternative, bordereau d'enlèvement et confirmation de réception. | Résultat `verifiee` si toutes les pièces sont liées ; valeur économique `estimee`. |
| **Résultat** | Lot orienté vers un débouché alternatif dans la fenêtre documentée. Le résultat porte sur le lot et le délai, pas sur une baisse de prix ou une lutte contre la spéculation. | Causalité strictement bornée. |
| **Apprentissage** | « Une annulation devient une situation coordonnable si le lot, le délai et les engagements sont reliés dans un même dossier. » | Réutilisable à Yoff et Kafountine. |

### Traces visibles par espace

- **Mareyeur/Transformateur** : lot, annulation, proposition, engagement et réception ;
- **Opérateur** : qualification et comparaison des conditions ;
- **Terrain** : enlèvement et livraison si un relais intervient.

---

## 10. Cohérence du modèle de relais

Trois scénarios utilisent explicitement un relais : Lompoul-sur-Mer, Foundiougne et Elinkine.

Dans les trois cas :

1. l'acteur terrain produit l'information brute par note vocale ou appel ;
2. le relais humain écoute, rappelle si nécessaire et saisit une version structurée ;
3. le signal garde l'acteur comme source et l'agent comme saisisseur ;
4. le niveau initial reste `declaree` ;
5. seuls les recoupements et preuves ultérieurs font évoluer la confiance ;
6. l'acteur peut corriger ce qui a été saisi en son nom.

Ce modèle ne supprime pas la couche directe. Il établit deux portes d'accès à la même boucle métier :

```text
Acteur autonome ───────────────┐
                              ├─> Signal structuré ─> même workflow
Acteur → audio/appel → relais ─┘
```

## 11. Objets candidats pour l'intégration ultérieure

La présente liste ne constitue pas du code. Elle sert de guide à Claude Code après validation.

| Scénario | Identifiants candidats |
|---|---|
| Lompoul | `sig-lompoul-balises`, `sit-lompoul-balises`, `coord-lompoul-balises`, `init-lompoul-balises`, `learn-lompoul-balises` |
| Fass Boye | `sig-fass-boye-conformite`, `sit-fass-boye-conformite`, `coord-fass-boye-conformite`, `learn-fass-boye-conformite` |
| Yoff | `sig-yoff-marche`, `sit-yoff-marche`, `coord-yoff-marche`, `learn-yoff-marche` |
| Foundiougne | `sig-foundiougne-claies`, `sit-foundiougne-claies`, `coord-foundiougne-claies`, `learn-foundiougne-claies` |
| Elinkine | `sig-elinkine-retour`, `sit-elinkine-retour`, `coord-elinkine-retour`, `learn-elinkine-retour` |
| Cap Skirring | `sig-cap-skirring-debouche`, `sit-cap-skirring-debouche`, `coord-cap-skirring-debouche`, `learn-cap-skirring-debouche` |

Objets à prévoir par scénario :

- un `Signal` avec canal, source et confiance ;
- une `Situation` avec priorité, statut, responsable, échéance et historique ;
- une ou deux `Decision` explicites ;
- un `CoordinationSpace` avec engagements et risques ;
- au moins une `Evidence` liée à un engagement ;
- un résultat borné et une confirmation ;
- un `Learning` réutilisable ;
- des notifications dans les espaces opérationnels concernés.

## 12. Ce que ces scénarios ne doivent jamais montrer

- une donnée vocale devenue « vérifiée » parce qu'un agent l'a saisie ;
- une position GPS réelle ou un suivi de pirogue en temps réel ;
- un partenaire financier présenté comme engagé ;
- un budget présenté comme réel avant chiffrage ;
- un signal de prix présenté comme inflation ou spéculation ;
- un écart administratif présenté comme fraude ;
- un retour retardé présenté comme détresse certaine ;
- un résultat économique ou sécuritaire attribué à Mbàmbulaan sans preuve.

## 13. Critères de validation CEO avant intégration

Le Lot 1 est prêt à transmettre à Claude Code si les sept points suivants sont validés :

1. les six territoires et les six types de situation ;
2. Lompoul comme scénario de balises de géolocalisation ;
3. l'initiative Lompoul avec le statut « Recherche de financement » et aucun montant ferme ;
4. le modèle de relais avec auteur et saisisseur distincts ;
5. la discipline des niveaux de confiance ;
6. le point de compatibilité relatif à la catégorie `conformite` ;
7. la représentation d'une initiative en cadrage sans budget chiffré ni financeur engagé.

Après validation, l'équipe de développement devra reprendre ces scénarios, les adapter au modèle final, ajouter les tests et les intégrer au jeu de démonstration. Aucun élément de ce document ne doit être injecté automatiquement dans le Produit.
