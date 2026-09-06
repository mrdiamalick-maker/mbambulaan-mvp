# Passation Claude Code — Public Mbàmbulaan

## Objet

Cette passation a un seul objectif : permettre à Claude Code de reprendre immédiatement la construction du **Public Mbàmbulaan** sans perdre le cadrage stratégique déjà arbitré.

Le **design, l’UI et l’UX visuelle doivent être réinventés**. Le code et les maquettes actuels ne doivent pas servir de contrainte esthétique. Ils peuvent être utilisés uniquement comme matière technique si cela accélère le travail.

Le cadrage fonctionnel, l’architecture produit, les frontières Public / Produit et les principes métier ci-dessous constituent en revanche la base de travail à respecter, tout en restant challengables si Claude identifie une meilleure solution cohérente avec les objectifs business.

---

## 1. Positionnement à conserver

Mbàmbulaan n’est pas une simple application, ni une marketplace, ni un ERP, ni un dashboard.

Mbàmbulaan est une **infrastructure de coordination au service de l’économie maritime**, en commençant par la filière halieutique sénégalaise et la pêche artisanale comme premier ancrage opérationnel.

Le Public Mbàmbulaan doit servir à :
- faire comprendre l’écosystème ;
- structurer et diffuser une connaissance métier crédible ;
- rendre les territoires lisibles ;
- capter des besoins ;
- capter des capacités / contributions ;
- orienter vers des programmes, opportunités et interventions ;
- créer des leads qualifiés ;
- alimenter la coordination terrain et le réseau Mbàmbulaan ;
- commencer à générer des revenus avant même la commercialisation du Produit professionnel.

Signature de marque :
**Mbàmbulaan — Connecter les acteurs. Coordonner les territoires. Faire circuler la valeur.**

Formulation centrale :
**Mbàmbulaan construit une infrastructure de connaissance et de coordination pour l’économie maritime, en combinant terrain, réseau, services et technologie.**

---

## 2. Ce qu’il ne faut surtout pas reconstruire

Le Public ne doit pas devenir :
- une marketplace ;
- un annuaire public de prestataires ;
- un catalogue de prix ;
- un dashboard métier public ;
- un clone du futur espace professionnel ;
- un site corporate vide ;
- une succession de pages génériques ;
- un SaaS avec jargon produit ;
- un site où l’on expose des données privées, des volumes individuels ou de la capacité temps réel ;
- un agrégateur d’actualités sans logique métier ;
- un réseau public exposant directement les contacts et rendant Mbàmbulaan contournable.

La valeur de Mbàmbulaan vient de la **qualification, du réseau, de la confiance, de la coordination, de l’exécution, du suivi et de la connaissance accumulée**.

---

## 3. Architecture publique canonique

Les seules expériences publiques majeures visibles sont :

- `/` — Landing
- `/decouvrir` — porte éditoriale / pédagogique
- `/decouvrir/[slug]`
- `/atlas` — Atlas / Territoires
- `/atlas/[slug]`
- `/opportunites`
- `/opportunites/[slug]`
- `/mbambulaan`
- `/contact`
- `/mentions-legales`
- `/confidentialite`

Navigation visible cible :

`MBÀMBULAAN | Découvrir | Territoires | Opportunités | Mbàmbulaan | [Trouver une solution] [Ouvrir l'Atlas]`

+ accès discret **Accès professionnel**.

Important :
- `/solutions` peut exister techniquement, mais ne doit jamais devenir une rubrique visible appelée « Solutions » ;
- `/reseau` ne doit pas devenir une rubrique majeure « Réseau » ;
- « Territoires » doit mener à l’expérience Atlas ;
- les URLs techniques ne doivent jamais dicter la navigation.

---

## 4. Capabilities publiques à construire

### 4.1 Découvrir

Objectif : permettre de comprendre l’économie maritime sénégalaise de façon simple, crédible et métier.

Chaîne de valeur de référence :
**Mer → Débarquement → Conservation → Transformation → Transport → Marchés → Consommation / export**

Axes transverses :
- équipements ;
- maintenance ;
- compétences / formation ;
- financement ;
- institutions ;
- environnement ;
- territoires ;
- infrastructures.

Taxonomie métier cible :
- Pêche & ressources
- Débarquement
- Conservation & froid
- Transformation & valorisation
- Transport & logistique
- Commerce & débouchés
- Équipements & maintenance
- Compétences & formation
- Financement & développement
- Territoires & infrastructures
- Durabilité & environnement

Formats possibles :
- Comprendre
- Terrain
- Analyse
- Portrait
- Guide
- Actualité
- Opportunité
- Programme
- Rencontre
- Formation

Les pages doivent avoir une vraie hiérarchie éditoriale, des sources, des contenus reliés, un lien territorial et un CTA contextuel.

### 4.2 Atlas Mbàmbulaan

Promesse :
**Explorer l’économie maritime par les territoires.**

Le parcours doit être :
**territoire → comprendre → ce qui existe → contenus / opportunités → besoin / contribution → Mbàmbulaan**.

Priorité V1 : quais et territoires halieutiques.

L’Atlas peut montrer :
- localisation ;
- description éditoriale ;
- activités ;
- espèces / saisonnalité si les sources sont fiables ;
- services publics documentés ;
- infrastructures / capacités présentées sans données sensibles ;
- photos ;
- niveau de documentation / source / mise à jour ;
- contenus et opportunités reliés ;
- CTA « Trouver une solution » ;
- CTA « Signaler / proposer une correction ».

Ne jamais montrer publiquement :
- incidents privés ;
- volumes de transactions ;
- capacité privée temps réel ;
- performance individuelle ;
- contacts privés ;
- intelligence opérationnelle du futur Produit.

États de couverture utiles :
- Référencé
- Documenté
- Enrichi avec réseau local

Les données illustratives ou de démonstration doivent être explicitement marquées comme telles.

### 4.3 Trouver une solution

C’est le principal moteur de conversion du Public.

Promesse :
**Décrivez votre besoin. Mbàmbulaan vous aide à identifier et organiser la bonne réponse.**

Pas de prix public. Pas de liste publique de prestataires. Pas de compte requis.

Intentions de référence :
- Transporter / livrer
- Conserver / refroidir
- Transformer / valoriser
- Acheter / s’équiper
- Entretenir / réparer
- Former / développer des compétences
- Trouver des débouchés
- Déployer un projet / programme
- Identifier des acteurs / capacités
- Comprendre un territoire
- Financer / soutenir une initiative
- Autre

Parcours cible :
1. intention
2. territoire
3. questions métier dynamiques
4. description + éventuellement document / photo
5. contact + canal préféré

Après soumission :
- création d’une demande structurée ;
- qualification par Mbàmbulaan ;
- reprise possible par WhatsApp / téléphone / terrain ;
- statut suivi côté interne.

Statuts métiers publics possibles :
Reçue → En cours d’étude → Solution recherchée → Organisation en cours → Action engagée → Terminée / Non aboutie.

### 4.4 Contribution réseau

Deuxième moteur : **Je peux apporter une solution**.

Acteurs possibles : entreprises, transporteurs, fournisseurs, transformateurs, acheteurs, centres de formation, ONG, bailleurs, experts, organisations, institutions, etc.

Demander :
- service / capacité ;
- territoires ;
- capacité approximative ;
- conditions ;
- organisation ;
- site web optionnel ;
- contact ;
- documents optionnels.

Ne jamais créer automatiquement un statut « partenaire » ou « référencé ».

Workflow interne :
Identifié → En relation → Documenté → Vérifié → Mobilisable → Expérimenté.

### 4.5 Opportunités

Le Public doit regrouper des opportunités utiles :
- Formation
- Programme
- Financement
- Rencontre
- Appel
- Opportunité économique

Une opportunité doit comporter au minimum :
- type ;
- territoire ;
- échéance ;
- audience ;
- organisateur ;
- statut ;
- source ;
- niveau d’implication de Mbàmbulaan.

Trois modes :
- information uniquement ;
- Mbàmbulaan relaie ;
- Mbàmbulaan coordonne → capture d’intérêt / lead.

Aucune fausse opportunité ne doit être présentée comme réelle. Les exemples de démonstration doivent être clairement identifiés.

### 4.6 Page Mbàmbulaan

Position :
**Mbàmbulaan est une entreprise sénégalaise qui construit une infrastructure de coordination pour l’économie maritime, en combinant présence terrain, réseau d’acteurs, données, services et technologie.**

Trois piliers :
- Terrain
- Réseau
- Technologie

Boucle de valeur :
Observer → Qualifier → Connecter → Coordonner → Réaliser → Mesurer → Apprendre.

La page doit expliquer pourquoi « le numérique ne suffit pas » et comment le terrain, WhatsApp, téléphone, organisations, relais locaux, partenaires et digital fonctionnent ensemble.

### 4.7 Contact

Le contact doit être un routeur d’intention, pas un simple formulaire générique.

Entrées :
- J’ai un besoin
- Je propose mes services
- Institution / ONG / Entreprise
- Travailler / collaborer avec Mbàmbulaan
- Presse / recherche / information
- Autre

Le contexte venant d’une page, d’un territoire, d’une opportunité ou d’un contenu doit être conservé.

---

## 5. Public vs Produit professionnel

Le Produit professionnel sera recadré plus tard et commercialisé séparément comme **Mbàmbulaan Produit**.

Ne pas reconstruire maintenant l’espace professionnel.

Le Public doit donner envie de travailler avec Mbàmbulaan sans exposer :
- les workflows internes ;
- les opérations ;
- les dossiers ;
- les alertes ;
- les décisions ;
- les capacités privées ;
- les données de performance ;
- les outils de pilotage.

Règle :
**Public = éditorial + territorial + transaction légère.**
**Produit = workflow + coordination + données + pilotage.**

---

## 6. Business model à garder en tête

Le Public n’est pas un coût marketing : il doit devenir un actif d’acquisition et de monétisation.

Sources de revenus possibles :
1. intermédiation / success fee lorsque Mbàmbulaan crée réellement la valeur ;
2. services professionnels ;
3. sourcing / qualification ;
4. programmes terrain ;
5. diagnostics / études / collecte de données ;
6. suivi / reporting ;
7. formation / événements ;
8. market-entry support ;
9. déploiement ONG / institution ;
10. data / intelligence ;
11. plus tard : Mbàmbulaan Produit.

Ne pas inventer une commission universelle.

Le funnel est :
**Terrain / SEO / social / partenaires / QR → Public → intention → qualification → réseau / terrain → solution / programme / transaction → valeur → revenu → nouvelle connaissance.**

---

## 7. Audience prioritaire

Le site s’adresse surtout aux publics structurés / digitaux :
- ONG / bailleurs / programmes ;
- entreprises privées ;
- transport / logistique ;
- fournisseurs ;
- transformateurs structurés ;
- acheteurs / distributeurs ;
- organisations professionnelles ;
- institutions / collectivités ;
- financeurs / assureurs ;
- formation ;
- chercheurs / médias / étudiants / grand public.

Les pêcheurs artisanaux restent une source majeure d’activité et de besoins, mais beaucoup seront atteints via WhatsApp, téléphone, terrain, relais de quai, organisations et saisie assistée.

---

## 8. Principes UX à respecter sans imposer un design

Le design actuel peut être ignoré.

À réinventer entièrement :
- direction artistique ;
- UI ;
- mise en page ;
- composants ;
- interactions ;
- style photo ;
- navigation détaillée ;
- responsive ;
- micro-interactions ;
- iconographie.

Contraintes d’expérience seulement :
- mobile-first ;
- simple ;
- crédible ;
- premium mais léger ;
- performant sur connexions sénégalaises ;
- accessible ;
- français d’abord ;
- architecture prête pour Wolof / anglais plus tard ;
- ton concret et terrain ;
- aucun jargon SaaS côté public ;
- pas d’interface dense type dashboard.

Le principe essentiel :
**Sophistication behind, simplicity in front.**

---

## 9. V1 à livrer

La V1 Public doit au minimum permettre :
1. publier et découvrir des contenus ;
2. explorer Atlas / quais / territoires ;
3. consulter des opportunités ;
4. décrire un besoin via Trouver une solution ;
5. contacter Mbàmbulaan par plusieurs canaux ;
6. proposer une capacité / information / correction / partenariat ;
7. mesurer les parcours.

À différer :
- matching IA ;
- paiement ;
- devis automatisé ;
- prix public ;
- notation publique ;
- compte public ;
- app native ;
- chat complet ;
- traduction complète ;
- CRM complet ;
- recommender ;
- automatisation avancée.

Critères de définition de fini :
- navigation propre ;
- contenu crédible ;
- Atlas fonctionnel ;
- moteur de demande ;
- persistance des demandes ;
- contact ;
- mobile ;
- confiance / sources ;
- SEO ;
- analytics ;
- pas de legacy visible ;
- qualité visuelle homogène.

---

## 10. Documents GitHub à lire en priorité

### Source de vérité Public
`docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`

C’est le document principal. Si le code actuel contredit ce document, le code doit changer.

### Documents de fond utiles
- `docs/MBAMBULAAN_EXECUTION_PLAYBOOK.md`
- `docs/MBAMBULAAN_PRODUCT_ENGINEERING_DOCTRINE.md`
- `docs/PRODUCT_REFOUNDATION_2026.md`
- `docs/DOMAIN_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/PRODUCT_ACCEPTANCE_TEST.md`
- `docs/CODEX_MASTER_EXECUTION_PROMPT.md`

Ces documents contiennent l’historique de réflexion produit / architecture. Ils peuvent être challengés, mais ils permettent de comprendre les décisions déjà prises.

### Fichiers actuels à regarder uniquement comme matière technique / fonctionnelle
- `src/app/page.tsx`
- `src/app/decouvrir/page.tsx`
- `src/app/atlas/page.tsx`
- `src/app/opportunites/page.tsx`
- `src/app/mbambulaan/page.tsx`
- `src/app/solutions/page.tsx`
- `src/app/contact/page.tsx`
- `src/components/public/*`
- `src/data/public-content.ts`

Ne pas reproduire leur design par défaut.

### Architecture / runtime
- `package.json`
- `.github/workflows/ci.yml`
- `next.config.ts`
- `.env.example`

---

## 11. Branche de travail

Branche actuelle à reprendre :
`codex/xxl-premium`

Éviter de repartir de vieilles branches ou de vieux prototypes.

Dernier commit de nettoyage Public connu au moment de cette passation :
`618ad8327216e843520a830dbc6acf0ed4000070`

Le statut Vercel était encore en échec avant ce dernier nettoyage ; un nouveau build / lint / typecheck / test doit donc être exécuté localement par Claude Code avant toute livraison.

---

## 12. Priorité de reprise pour Claude Code

Ordre recommandé :

1. Lire intégralement `docs/public/MBAMBULAAN_PUBLIC_MASTER_SPEC.md`.
2. Lire ce document de passation.
3. Challenger l’architecture si nécessaire, mais expliquer clairement tout changement de cadrage.
4. Ne pas utiliser le design actuel comme référence.
5. Reconcevoir l’expérience Public comme un produit web cohérent et premium.
6. Construire les parcours canoniques et supprimer / rediriger les routes legacy visibles.
7. Remplacer les jeux de données démonstration trop opérationnels par des données publiques / éditoriales correctement labellisées.
8. Implémenter les pages détail manquantes (`decouvrir/[slug]`, `atlas/[slug]`, `opportunites/[slug]`).
9. Rendre `Trouver une solution` réellement fonctionnel, avec persistance des demandes au minimum.
10. Exécuter : `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, puis smoke tests.
11. Vérifier le rendu mobile et desktop sur les parcours principaux.
12. Déployer uniquement lorsque le build est vert.

---

## 13. Parcours de recette à garantir

1. Landing → contenu froid / guide → Trouver une solution → demande créée.
2. Landing → Atlas → Joal → besoin transport / froid → demande.
3. Landing → Opportunité → détail → intérêt / contact.
4. Landing → contribution réseau → soumission.
5. Mobile → Contact → demande de rappel.
6. Besoin capté sur le terrain → même modèle de demande avec `source=terrain` côté système.

---

## 14. Liberté donnée à Claude Code

Claude Code est explicitement autorisé à challenger :
- structure technique ;
- composants ;
- architecture frontend ;
- modèle de données ;
- parcours ;
- ordre des sections ;
- stack ou abstractions internes si besoin ;
- wording secondaire ;
- architecture SEO ;
- navigation secondaire ;
- organisation du code.

Mais tout challenge doit préserver les invariants :
- Mbàmbulaan = infrastructure de coordination ;
- Public ≠ Produit professionnel ;
- pas de marketplace / annuaire / prix ;
- Atlas public non opérationnel ;
- demande qualifiée comme moteur de conversion ;
- terrain + réseau + services + technologie ;
- business model fondé sur la valeur réellement créée ;
- simplicité côté utilisateur ;
- crédibilité et absence de données inventées présentées comme réelles.

---

## 15. Instruction finale

Ne cherche pas à « améliorer le site actuel » visuellement.

Considère que le **design actuel n’existe pas**.

Repars du cadrage métier, de l’architecture Public et des parcours pour proposer puis construire la meilleure expérience possible pour Mbàmbulaan.sn.

Le résultat attendu est un Public qui donne immédiatement le sentiment qu’il existe derrière Mbàmbulaan :
- une connaissance du terrain ;
- un réseau ;
- une capacité de coordination ;
- une ambition nationale crédible ;
- un produit numérique sérieux ;
- une entreprise capable de créer et capter de la valeur.
