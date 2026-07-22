# Dossier d'audit critique Mbàmbulaan — à transmettre à Claude

## 1. Objet

Ce document regroupe le cadrage minimal nécessaire pour permettre à Claude de challenger Mbàmbulaan avec rigueur, sans parcourir le dépôt à l'aveugle.

Claude doit analyser le projet comme un comité d'investissement, un ministère, un Chief Product Officer et un architecte logiciel réunis.

Il ne doit pas valider les documents par défaut. Il doit identifier les contradictions, les hypothèses fragiles, les surdimensionnements, les risques d'adoption, les failles de gouvernance et les impasses économiques ou techniques.

## 2. Dépôt

Dépôt GitHub :

`https://github.com/mrdiamalick-maker/mbambulaan-mvp`

Branche documentaire de référence :

`docs/blueprint-produit-1.0`

## 3. Documents à lire en priorité

### Blueprint Produit 1.0

- `docs/blueprint-produit-1.0/README.md`
- `docs/blueprint-produit-1.0/01-domain-model.md`
- `docs/blueprint-produit-1.0/02-event-catalog.md`
- `docs/blueprint-produit-1.0/03-data-dictionary.md`
- `docs/blueprint-produit-1.0/04-bounded-contexts.md`
- `docs/blueprint-produit-1.0/05-architecture-api.md`
- `docs/blueprint-produit-1.0/06-design-system-fonctionnel.md`
- `docs/blueprint-produit-1.0/07-mvp-detaille.md`

### Blueprint Produit 1.1

- `docs/blueprint-produit-1.1/08-product-backlog.md`
- `docs/blueprint-produit-1.1/09-kpi-modele-impact.md`
- `docs/blueprint-produit-1.1/10-operating-model-produit.md`

### Blueprint Produit 1.2

- `docs/blueprint-produit-1.2/01-lexique-metier.md`
- `docs/blueprint-produit-1.2/02-parcours-acteurs-detailles.md`
- `docs/blueprint-produit-1.2/03-ecrans-et-wireframes-fonctionnels.md`
- `docs/blueprint-produit-1.2/04-specifications-fonctionnelles-flux-pilote.md`

## 4. Vision du projet

Mbàmbulaan n'est pas une simple application, une marketplace, un ERP, un CRM, un dashboard ou un outil de ticketing.

L'ambition est de construire une infrastructure numérique de coordination pour les acteurs d'une filière économique, en commençant par la pêche artisanale sénégalaise.

La solution doit :

- connecter les acteurs ;
- organiser les flux ;
- fiabiliser l'information ;
- améliorer la confiance ;
- faciliter la décision ;
- suivre les engagements et l'exécution ;
- créer de la valeur pour l'écosystème ;
- capturer une valeur économique rentable pour l'entreprise.

## 5. Questions stratégiques fondamentales

Claude doit systématiquement examiner :

- quelle coordination est réellement améliorée ;
- quelle valeur métier est créée ;
- qui utilise ;
- qui bénéficie ;
- qui décide ;
- qui paie ;
- pourquoi il paierait durablement ;
- comment Mbàmbulaan devient rentable ;
- ce qui est réellement différenciant ;
- ce qui est nécessaire maintenant et ce qui doit être reporté.

## 6. Contraintes du contexte

Le premier terrain est le Sénégal et plus précisément la pêche artisanale.

Contraintes à prendre en compte :

- usages principalement mobiles ;
- connectivité parfois faible ;
- hétérogénéité des acteurs ;
- faible maturité numérique de certains utilisateurs ;
- gouvernance multi-acteurs ;
- forte présence des autorités publiques ;
- budgets limités ;
- besoin de confiance et de légitimité ;
- risque de dépendance au financement institutionnel.

## 7. Prompt d'audit à exécuter

Tu es un comité indépendant composé de plusieurs experts réunis pour évaluer un projet de startup avant une décision d'investissement et un éventuel soutien institutionnel.

Le comité est composé de :

- un ancien Partner McKinsey spécialisé en transformation publique ;
- un Venture Capital Partner ayant investi dans plusieurs entreprises SaaS B2B ;
- un Chief Product Officer ayant construit plusieurs plateformes à grande échelle ;
- un architecte logiciel senior spécialisé Domain-Driven Design et architectures événementielles ;
- un expert UX travaillant dans des environnements à faible connectivité ;
- un spécialiste des politiques publiques africaines et de la transformation numérique des États ;
- un entrepreneur ayant lancé plusieurs plateformes dans des marchés émergents.

Vous devez produire une seule analyse commune.

Vous n'êtes pas là pour encourager le projet.

Vous devez essayer de démontrer pourquoi il pourrait échouer.

Ne cherchez jamais à confirmer les hypothèses des auteurs.

Au contraire, essayez de les invalider.

Si quelque chose manque, dites-le.

Si quelque chose est inutile, dites-le.

Si une décision est mauvaise, expliquez pourquoi.

Je préfère une critique sévère mais juste qu'une validation complaisante.

### Mission

Réalisez un audit critique complet de Mbàmbulaan à partir des documents listés dans ce dossier et du dépôt GitHub.

Analysez obligatoirement :

1. la vision et son caractère différenciant ;
2. l'importance réelle du problème ;
3. le positionnement par rapport aux ERP, CRM, SIG, outils collaboratifs, ticketing et logiciels métiers ;
4. la valeur créée pour chaque acteur ;
5. les freins d'adoption ;
6. le Domain Model ;
7. les Bounded Contexts ;
8. les événements métier ;
9. les parcours utilisateurs ;
10. les workflows et règles métier ;
11. la cohérence du MVP ;
12. le modèle économique ;
13. la dépendance au financement public ;
14. la gouvernance ;
15. la scalabilité ;
16. l'architecture ;
17. les contradictions entre documentation et produit existant.

Pour chaque point, recherchez systématiquement :

- les incohérences ;
- les redondances ;
- les concepts inutiles ;
- les concepts manquants ;
- les hypothèses non démontrées ;
- les risques cachés ;
- les fonctionnalités surdimensionnées ;
- les éléments sans valeur métier claire.

### Livrables attendus

Produisez :

- un résumé exécutif ;
- un verdict global ;
- les 10 plus grandes forces ;
- les 10 plus grandes faiblesses ;
- les 10 décisions prioritaires ;
- les 10 éléments à supprimer ou reporter ;
- les 10 éléments à approfondir ;
- les 5 hypothèses les plus dangereuses ;
- les 5 principales raisons d'échec ;
- les 5 principales raisons de réussite possible ;
- un tableau des 30 risques les plus importants avec impact, probabilité, criticité et mitigation ;
- les 20 opportunités les plus importantes ;
- une réponse claire à la question : investiriez-vous 5 millions d'euros ? Oui, non, ou oui sous conditions ;
- une réponse claire à la question : recommanderiez-vous au Ministère des Pêches du Sénégal de soutenir Mbàmbulaan ? ;
- une feuille de route de consolidation avant tout nouveau développement.

### Consignes de rigueur

- Ne réécrivez pas silencieusement les contradictions : signalez-les.
- Distinguez toujours ce qui est documenté, ce qui est implémenté, ce qui est supposé et ce qui est validé terrain.
- Ne considérez pas la documentation comme une preuve de réalité.
- Ne considérez pas le code comme une preuve de valeur métier.
- Ne proposez pas de nouvelles fonctionnalités avant d'avoir démontré qu'elles sont nécessaires.
- Priorisez les critiques par impact stratégique.
- Soyez précis, argumenté et concret.
