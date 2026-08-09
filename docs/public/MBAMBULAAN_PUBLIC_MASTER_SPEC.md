# Mbàmbulaan Public — Master Specification

> **Statut : FIGÉ — source de vérité pour le Public Mbàmbulaan.**
>
> Cette spécification remplace les anciennes interprétations du Public. Le code doit s’aligner sur ce document, jamais l’inverse.

## 1. Vision

Mbàmbulaan est une entreprise sénégalaise qui construit une infrastructure de coordination au service de l’économie maritime, en commençant par la filière halieutique sénégalaise et avec un premier ancrage fort dans la pêche artisanale.

Mbàmbulaan combine :
- présence terrain ;
- réseau d’acteurs et de capacités ;
- connaissance territoriale ;
- contenus métier ;
- services d’intermédiation et de coordination ;
- technologie.

Principe de langage : **sophistication derrière, simplicité devant**.

Le Public ne doit être ni un média générique, ni un annuaire, ni une marketplace, ni un simple site vitrine. Il doit être une couche active de l’entreprise Mbàmbulaan.

## 2. Mission du Public

Le Public doit permettre de :

1. attirer ;
2. informer ;
3. vulgariser l’économie maritime et la filière halieutique ;
4. créer de la confiance ;
5. rendre visibles les territoires et les opportunités ;
6. capter des besoins ;
7. capter des capacités et partenaires ;
8. créer des leads ;
9. permettre à Mbàmbulaan de qualifier, coordonner et monétiser lorsqu’une valeur réelle est créée.

Boucle cible :

`Terrain / SEO / partenaires / réseaux -> Mbàmbulaan.sn -> contenu / Atlas / opportunité -> intention -> Mbàmbulaan -> qualification -> action -> résultat -> connaissance -> nouvelle activité`

## 3. Frontière Public / Professionnel

Le Public sert à :
- découvrir ;
- comprendre ;
- explorer ;
- chercher ;
- proposer ;
- manifester un intérêt ;
- contacter ;
- entrer dans le réseau.

Le Public ne doit jamais exposer :
- situations opérationnelles privées ;
- incidents ;
- engagements internes ;
- informations commerciales sensibles ;
- capacités temps réel privées ;
- coordonnées individuelles permettant de contourner Mbàmbulaan ;
- décisions institutionnelles internes ;
- données de performance d’acteurs ;
- dashboards SaaS.

## 4. Audiences prioritaires

Le site web public cible principalement les audiences structurées et digitalement accessibles :

- entreprises privées ;
- transporteurs et logisticiens ;
- équipementiers et prestataires ;
- ONG ;
- bailleurs ;
- programmes de développement ;
- organisations professionnelles ;
- institutions ;
- collectivités ;
- acheteurs et distributeurs ;
- centres de formation ;
- experts et chercheurs ;
- médias spécialisés.

Les pêcheurs et autres acteurs très informels restent essentiels à l’activité Mbàmbulaan, mais ils ne sont pas la cible principale du site public. Leur interaction passe prioritairement par téléphone, WhatsApp, SMS, relais terrain, organisations professionnelles et accompagnement humain.

## 5. Navigation publique canonique

Header cible :

- **Découvrir**
- **Territoires**
- **Opportunités**
- **Mbàmbulaan**
- CTA principal : **Trouver une solution**
- CTA distinctif : **Ouvrir l’Atlas**
- Accès professionnel discret

Le Public ne doit pas exposer dans le header une liste exhaustive de types de contenus.

## 6. Architecture publique canonique

Routes cibles :

- `/`
- `/decouvrir`
- `/decouvrir/[slug]`
- `/atlas`
- `/atlas/[slug]`
- `/opportunites`
- `/opportunites/[slug]`
- `/solutions`
- `/reseau`
- `/mbambulaan`
- `/contact`
- `/mentions-legales`
- `/confidentialite`

Les anciennes routes publiques doivent être migrées puis redirigées, sans coexistence legacy visible.

## 7. Landing page

La landing actuelle peut rester comme base visuelle, mais doit être progressivement alignée sur le cadrage cible.

Obligations :
- promesse Mbàmbulaan ;
- moteur “Trouver une solution” visible haut dans la page ;
- contenus vivants ;
- accès fort à l’Atlas ;
- preuve terrain et réseau ;
- opportunités ;
- Mbàmbulaan entreprise ;
- CTA contextuels.

Le Public doit parler d’abord de la filière et des usages, pas d’un catalogue de fonctionnalités SaaS.

## 8. Découvrir

La rubrique “Découvrir” est une porte pédagogique vers l’économie maritime.

Domaines initiaux :
- Pêche & ressources ;
- Débarquement ;
- Conservation & froid ;
- Transformation & valorisation ;
- Transport & logistique ;
- Commerce & débouchés ;
- Équipements & maintenance ;
- Compétences & formation ;
- Financement & développement ;
- Territoires & infrastructures ;
- Durabilité & environnement.

Formats éditoriaux :
- Comprendre ;
- Terrain ;
- Analyse ;
- Portrait ;
- Guide ;
- Actualité ;
- Opportunité ;
- Programme ;
- Rencontre ;
- Formation.

Chaque contenu doit remplir au moins une fonction : attirer, expliquer, révéler, connecter, faire agir, construire la confiance.

## 9. Contenu commercialement intelligent

Le contenu ne doit pas être séparé de l’activité Mbàmbulaan.

Exemples :
- contenu sur la glace -> CTA “Trouver une solution de froid” ;
- contenu sur le transport -> CTA “Organiser un transport” ;
- contenu sur la formation -> CTA “Manifester mon intérêt” ;
- contenu sur un financement -> CTA “Être accompagné” ;
- contenu sur un territoire -> CTA “Trouver une solution sur ce territoire”.

Les CTA doivent être contextuels, non agressifs et adaptés au besoin réel.

## 10. Opportunités

La page Opportunités regroupe :
- formations ;
- programmes ;
- financements ;
- rencontres ;
- appels à manifestation ;
- consultations ;
- initiatives ;
- appels à projets ;
- opportunités économiques sélectionnées.

Chaque opportunité doit préciser :
- type ;
- territoire ;
- public concerné ;
- date / période ;
- organisateur ;
- statut ;
- source ;
- niveau d’implication Mbàmbulaan.

Trois modes :
1. information uniquement ;
2. Mbàmbulaan relaie ;
3. Mbàmbulaan coordonne.

Dans le troisième cas, CTA “Je suis intéressé” ou équivalent, sans désintermédiation.

## 11. Atlas public

L’Atlas est une destination publique majeure et une porte d’entrée territoriale.

Objectif :
`Découvrir un territoire -> comprendre son écosystème -> voir ce qui existe -> accéder aux contenus/opportunités -> exprimer un besoin -> passer par Mbàmbulaan`.

Expérience cible : carte large, recherche, filtres simples, fiche territoire/quai, CTA contextuels.

Priorité initiale : les quais et territoires halieutiques.

Une fiche peut contenir :
- nom ;
- type ;
- région / département / commune ;
- localisation ;
- description publique ;
- activités ;
- domaines ;
- services/capacités publiques documentés ;
- espèces / saisonnalité si suffisamment fiables ;
- images ;
- source ;
- date de mise à jour ;
- niveau de vérification ;
- contenus liés ;
- opportunités liées.

Ne jamais afficher de faux temps réel ou de fausse précision.

Niveaux de confiance possibles :
- information publique consolidée ;
- information enrichie par Mbàmbulaan ;
- information vérifiée avec relais/partenaire territorial.

CTA :
- Trouver une solution sur ce territoire ;
- Parler à Mbàmbulaan ;
- Étudier une intervention ;
- Proposer une correction.

## 12. Trouver une solution

Cette capability est le principal moteur de conversion du Public.

Ce n’est pas un comparateur de devis.

Principes :
- aucun prix public ;
- aucun catalogue ouvert de prestataires ;
- pas de création de compte obligatoire ;
- pas de mise en relation automatique non contrôlée ;
- Mbàmbulaan reste au cœur de la qualification et de la coordination.

Parcours cible :
1. intention ;
2. territoire ;
3. questions métier dynamiques ;
4. description / pièce jointe éventuelle ;
5. coordonnées ;
6. canal préféré ;
7. confirmation et référence.

Intentions initiales :
- Transporter / livrer ;
- Conserver / refroidir ;
- Transformer / valoriser ;
- Acheter / s’équiper ;
- Entretenir / réparer ;
- Former / développer des compétences ;
- Trouver des débouchés ;
- Déployer un projet ou programme ;
- Identifier des acteurs ou capacités ;
- Comprendre un territoire ;
- Financer / soutenir une initiative ;
- Autre besoin.

Chaque demande doit enregistrer :
- identifiant ;
- source ;
- contexte ;
- intention ;
- catégorie ;
- territoire ;
- description ;
- type d’acteur ;
- organisation ;
- nom ;
- téléphone ;
- email éventuel ;
- canal préféré ;
- consentement ;
- statut ;
- date.

Statuts publics compréhensibles :
- Reçue ;
- En cours d’étude ;
- Solution recherchée ;
- Organisation en cours ;
- Action engagée ;
- Terminée ;
- Non aboutie.

Canaux :
- Web ;
- WhatsApp ;
- téléphone ;
- terrain ;
- partenaire ;
- événement / QR ;
- autres canaux futurs.

Tous doivent alimenter le même objet de demande.

## 13. Réseau Mbàmbulaan

Le réseau n’est ni un annuaire ni une marketplace.

Il représente les personnes, organisations, capacités, expertises et relations que Mbàmbulaan connaît suffisamment pour mobiliser.

Niveaux internes possibles :
- Identifié ;
- En relation ;
- Documenté ;
- Vérifié ;
- Mobilisable ;
- Expérimenté avec Mbàmbulaan.

Parcours public : “Proposer mes services / capacités”.

Formulaire :
- type d’acteur ;
- services/capacités ;
- territoires couverts ;
- capacité approximative ;
- organisation ;
- contact ;
- documents éventuels.

Une soumission n’entraîne jamais un référencement automatique.

## 14. Présence terrain

Le terrain est une capability de l’entreprise, pas un simple canal marketing.

Le Public doit progressivement montrer :
- visites ;
- ateliers ;
- rencontres ;
- quais ;
- équipes ;
- programmes ;
- partenaires ;
- preuves d’activité.

Une activité terrain peut alimenter :
- contenu ;
- réseau ;
- Atlas ;
- besoin ;
- capacité ;
- opportunité ;
- programme.

## 15. Mbàmbulaan — page entreprise

La page doit expliquer :
- pourquoi Mbàmbulaan existe ;
- ce que l’entreprise fait ;
- comment elle travaille ;
- pour qui ;
- son approche de confiance ;
- ses territoires ;
- comment travailler avec elle.

Formulation stratégique :
> Mbàmbulaan construit une infrastructure de coordination pour l’économie maritime, en commençant par la filière halieutique sénégalaise.

Piliers :
- Terrain ;
- Réseau ;
- Technologie.

Boucle métier :
`Observer -> Qualifier -> Connecter -> Coordonner -> Réaliser -> Mesurer -> Apprendre`.

## 16. Contact

La page Contact est un routeur d’intentions.

Entrées :
- J’ai un besoin ;
- Je propose mes services ;
- Je représente une organisation / ONG / entreprise ;
- Je souhaite devenir partenaire ;
- Presse / recherche / information ;
- Autre demande.

Le canal de retour peut être WhatsApp, téléphone ou email.

## 17. Modèle économique du Public

Le Public peut générer du revenu pour Mbàmbulaan entreprise avant toute utilisation du produit professionnel.

Familles de revenus potentielles :
- intermédiation ;
- commission de succès ;
- frais de mise en relation qualifiée ;
- sourcing ;
- étude / diagnostic ;
- connaissance territoriale ;
- coordination ;
- déploiement terrain ;
- programme / monitoring / reporting ;
- sponsoring clairement signalé ;
- partenariats et opérations.

Principe :
> Plus Mbàmbulaan intervient réellement dans la création de valeur, plus Mbàmbulaan peut légitimement facturer.

Ne jamais vendre la confiance, la vérification ou le classement comme de simples espaces publicitaires.

## 18. UX/UI

Personnalité :
- océan ;
- littoral ;
- économie réelle ;
- confiance ;
- Sénégal contemporain ;
- photographie documentaire ;
- design premium et sobre.

Palette :
- bleu-vert profond ;
- turquoise Mbàmbulaan ;
- blanc cassé ;
- sable ;
- ivoire ;
- gris minéraux.

Principes :
- mobile-first ;
- performance sur connexion moyenne ;
- design cohérent ;
- peu d’animations gadget ;
- micro-indications utiles ;
- navigation réduite ;
- Atlas plein écran / quasi plein écran ;
- CTA précis ;
- pas de jargon SaaS.

## 19. Système de composants Public

Composants cibles :
- PublicHeader ;
- PublicFooter ;
- Hero ;
- SectionHeader ;
- ContentCard ;
- OpportunityCard ;
- TerritoryCard ;
- AtlasMap ;
- AtlasDrawer ;
- SolutionLauncher ;
- SolutionWizard ;
- ContextualCTA ;
- TrustIndicator ;
- ProgrammeCard ;
- FieldStory ;
- ContactPanel.

Les pages assemblent ces composants et ne réinventent pas une direction visuelle différente à chaque route.

## 20. Données de lancement

Dataset éditorial cible initial : environ 30 contenus crédibles couvrant compréhension, terrain, métiers, guides, Mbàmbulaan, actualités et initiatives.

Dataset Atlas cible : couverture représentative du littoral, notamment Saint-Louis, Fass Boye, Kayar, Yoff, Soumbédioune, Hann, Rufisque, Bargny, Popenguine, Ngaparou, Mbour, Joal, Djifère, Foundiougne, Missirah, Toubacouta, Cap Skirring, Kafountine, Elinkine, Ziguinchor et autres sites pertinents après validation.

Dataset opportunités : environ 12 à 15 exemples couvrant formation, atelier, rencontre, programme, appel à projets, financement, consultation, partenariat, équipement collectif, accompagnement.

Toute donnée fictive ou de démonstration doit être clairement identifiée comme telle et ne jamais être présentée comme un événement réel.

## 21. Analytics

Événements minimums :
- page_view ;
- content_view ;
- atlas_open ;
- atlas_search ;
- atlas_location_view ;
- solution_started ;
- solution_step_completed ;
- solution_submitted ;
- whatsapp_clicked ;
- callback_requested ;
- opportunity_view ;
- opportunity_interest ;
- network_submission ;
- partnership_submission ;
- atlas_correction ;
- contact_started.

Funnel métier :
`visiteurs -> engagement contenu/Atlas -> intentions -> demandes -> demandes qualifiées -> solutions trouvées -> actions réalisées -> revenus Mbàmbulaan`.

## 22. SEO

Obligations :
- URLs propres ;
- metadata ;
- OpenGraph ;
- sitemap ;
- robots ;
- canonical ;
- maillage interne ;
- pages Atlas indexables ;
- performance ;
- données structurées pertinentes.

Pas de génération massive de pages SEO artificielles.

## 23. Confiance et données

Règles :
- aucune fausse précision ;
- source visible lorsque pertinent ;
- date de mise à jour ;
- niveau de vérification ;
- distinction claire entre démonstration et production ;
- consentement pour coordonnées ;
- minimisation des données ;
- aucune donnée personnelle exposée publiquement ;
- anti-spam ;
- validation serveur ;
- pièces jointes contrôlées.

## 24. Parcours de recette V1

Parcours obligatoires :

1. Landing -> contenu froid -> CTA contextualisé -> demande -> référence -> WhatsApp.
2. Landing -> Atlas -> Joal -> fiche -> besoin transport -> demande.
3. Landing -> Opportunités -> programme -> intérêt -> contact Mbàmbulaan.
4. Landing -> Réseau -> prestataire transport -> proposition de capacité.
5. Mobile -> Contact -> être rappelé.
6. Demande créée depuis source terrain -> même objet métier que le Web.

Si un de ces parcours casse, la V1 n’est pas livrée.

## 25. Definition of Done Public

Bloquants V1 :
- navigation cohérente ;
- contenu crédible ;
- Atlas fonctionnel ;
- moteur Trouver une solution ;
- demandes persistées ;
- Contact ;
- mobile ;
- confiance / sources ;
- SEO de base ;
- analytics ;
- absence de legacy visible ;
- qualité visuelle homogène.

Non bloquants :
- IA avancée ;
- matching automatique ;
- paiement ;
- devis automatique ;
- notation publique ;
- application native ;
- chat propriétaire ;
- compte public ;
- traduction complète ;
- CRM sophistiqué.

## 26. Anti-patterns interdits

- Pas de retour aux anciennes pages Public.
- Pas de doublons `/public/...` versus routes canoniques.
- Pas de marketplace ouverte.
- Pas de prix dans le moteur.
- Pas d’annuaire de prestataires.
- Pas de fausses statistiques.
- Pas de faux temps réel.
- Pas de menu à 12 entrées.
- Pas de pages vides.
- Pas de dashboard SaaS dans le Public.
- Pas de données opérationnelles privées dans l’Atlas.
- Pas de lorem ipsum.
- Pas de CTA commercial agressif partout.
- Pas de design différent à chaque page.
- Pas de jargon produit incompréhensible pour le visiteur.

## 27. Registre des décisions figées

### FIGÉ
- Ambition : économie maritime.
- Premier domaine profond : filière halieutique sénégalaise.
- Premier ancrage : pêche artisanale.
- Public = contenu + Atlas + opportunités + moteur de besoins + réseau + terrain + conversion.
- Header réduit.
- Atlas comme service public majeur.
- “Trouver une solution” comme moteur central de conversion.
- Aucun prix public.
- Pas de marketplace.
- Mbàmbulaan reste intermédiaire et opérateur de valeur.
- Terrain + réseau + technologie.
- Mobile-first.
- Source de vérité documentaire : ce document GitHub.

### PLUS TARD
- IA avancée.
- Matching automatique.
- Paiement.
- Devis chiffré.
- Compte public.
- Traductions complètes.
- CRM avancé.

### HORS SCOPE DU PUBLIC ACTUEL
- refonte du produit professionnel ;
- fonctionnalités institutionnelles privées ;
- situations opérationnelles ;
- cockpit ;
- reporting client privé.

---

## 28. Règle d’exécution

Toute modification du Public doit être évaluée contre cette spécification.

Si une implémentation existante contredit ce document, **l’implémentation doit être modifiée**.

Si une nouvelle idée contredit une décision FIGÉE, elle ne doit pas être implémentée sans décision explicite du CEO.
