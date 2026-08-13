# Prototype R&D — Relais WhatsApp et besoin de balises

## Statut

Prototype jetable conçu sur `codex/rd-exploration` pour illustrer le Lot 3 révisé.

- données entièrement simulées ;
- aucun import du Produit Mbàmbulaan ;
- aucun service, API, permission ou état réel ;
- aucune connexion à WhatsApp ;
- aucune géolocalisation et aucun suivi de pirogue ;
- aucun financement, prestataire ou budget réel ;
- aucun déploiement.

## Ce que la maquette démontre

Deux personnes peuvent faire remonter le même besoin :

1. un capitaine à l'aise avec le numérique écrit lui-même dans un parcours WhatsApp simulé ;
2. un capitaine envoie une note vocale ou appelle un agent de quai, qui écoute, reformule avec lui et saisit l'information en tant que relais.

Dans les deux cas, Mbàmbulaan produit le même signal structuré `SIM-LMP-001`. La source du besoin et la personne qui effectue la saisie restent distinguées. Le relais ne transforme jamais une déclaration en information vérifiée.

La maquette déroule ensuite un exemple concret à Lompoul-sur-Mer :

> besoin de balises de géolocalisation pour pirogues → qualification → situation → décision → engagements → exécution → preuves → résultat → apprentissage.

Le résultat démontré est une initiative visible dans **Programmes & financements**, au statut **Recherche de financement**. Ce n'est ni un achat, ni une installation de balises, ni une promesse de financement.

## Discipline de confiance

- réception du message : besoin `declaree` ;
- confirmations locales : besoin `observee` ;
- fiche, liste volontaire et note technique : besoin `documentee` ;
- coût : `estimee` tant qu'aucune offre comparable n'est validée ;
- financement : **non acquis** tant qu'aucun engagement explicite n'existe.

La note vocale prouve l'origine du signal, pas la réalité de tout son contenu. La saisie par un agent de quai ne rehausse pas automatiquement la confiance.

Dans le modèle récent, le libellé d'interface **Recherche de financement** doit correspondre à une initiative en `cadrage` avec un tableau `funding` vide. Aucun objet de financement fictif ne doit être créé. Le budget « À estimer » nécessitera un arbitrage avant intégration, car le type actuel impose encore un montant numérique.

## Interactions disponibles

- bascule entre le parcours **Saisie directe** et le parcours **Avec un relais** ;
- affichage du signal structuré commun aux deux parcours ;
- navigation dans les neuf étapes de la boucle métier ;
- lecture de la fiche initiative candidate au financement.

## Visualisation locale

Ouvrir `index.html` dans un navigateur. Le prototype est autonome et n'a besoin d'aucune installation.

## Hors périmètre

Cette maquette ne doit pas être présentée comme :

- une intégration officielle ou fonctionnelle avec WhatsApp ;
- un dispositif de suivi GPS ou une carte de positions ;
- un outil de détection de détresse ;
- une réponse centrée sur l'immigration clandestine ;
- une preuve d'efficacité sécuritaire ;
- une interface connectée au Produit réel.

Après validation du CEO, Claude Code pourra reprendre le scénario, l'adapter au modèle métier final et l'intégrer au jeu de démonstration avec les contrôles et tests appropriés.
