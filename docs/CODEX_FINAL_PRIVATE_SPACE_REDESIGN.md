# CODEX FINAL PROMPT - Refonte complete espace prive Mbambulaan

## Mission

Tu travailles sur le repo `mrdiamalick-maker/mbambulaan-mvp`, branche `feature-etat-control-tower-refonte`.

Cette mission est la derniere passe design avant decision produit. Les iterations precedentes n'ont pas produit de rupture visuelle suffisante. Le probleme n'est pas le contenu metier, mais la qualite percue de l'interface.

Tu dois refaire le design de tout l'espace prive, pas seulement la carte.

Pages concernees:

- `/espace-prive`
- `/espace-prive/etat`

Fichiers prioritaires:

- `src/app/espace-prive/page.tsx`
- `src/app/espace-prive/etat/page.tsx`
- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/data/ministryControlTowerData.ts` seulement si necessaire

## Contexte produit

Mbambulaan n'est pas un site web, pas une marketplace, pas un ERP et pas un admin dashboard.

Mbambulaan est une solution metier et une infrastructure de coordination pour la peche artisanale senegalaise.

L'espace prive doit montrer un produit credible pour:

- ministere;
- partenaires institutionnels;
- bailleurs;
- programmes publics;
- organisations professionnelles;
- acteurs de la filiere.

L'objectif est une experience produit, pas une page de presentation.

## Modules obligatoires

L'espace prive doit etre structure autour de 3 modules principaux:

1. Cartographie high-level
2. Valorisation communautaire de la filiere
3. Pilotage high-level

Chaque module doit avoir son parcours complet, ses composants propres, sa logique d'action et sa hierarchie visuelle.

## Direction design cible

Nom de direction:

`Mbambulaan Maritime Product Console`

Le rendu doit etre:

- premium;
- moderne;
- institutionnel;
- maritime;
- metier;
- credible;
- sobre;
- directement montrable a un partenaire.

Inspiration, sans copier:

- outils geospatiaux type ArcGIS / ESRI;
- suivi maritime type MarineTraffic / AIS;
- command centers operationnels;
- produits B2B data premium;
- interfaces d'exploitation terrain;
- design systems type Untitled UI open-source pour la qualite des composants.

## Interdictions

Ne refais pas une variation superficielle Tailwind.
Ne change pas seulement les couleurs.
Ne te contente pas de renommer les modules.
Ne garde pas la meme structure visuelle avec quelques cards en plus.
Ne fais pas un admin dashboard generique.
Ne fais pas une landing page.
Ne mets pas des cards arrondies partout sans composition.
Ne fais pas un design full dark illisible.
Ne fais pas de gradients decoratifs partout.
Ne garde pas une fausse impression de produit demo.

## Principe de refonte

Tu dois creer un vrai systeme de composants interne pour l'espace prive:

- App shell;
- header produit;
- navigation modules;
- panneaux lateraux;
- cartes data;
- tables;
- filtres;
- badges;
- boutons;
- switch de vues;
- drawers ou detail panels;
- timeline / workflow;
- KPI blocks;
- alert panels;
- action panels.

Les composants doivent avoir une coherence visuelle nette: meme rayon, memes bordures, memes ombres, meme densite, meme langage d'interaction.

## Palette recommandee

Utiliser une palette sobre:

- navy profond: `#062330`, `#0B3142`, `#102A43`;
- ocean blue: `#0E7490`, `#0891B2`;
- off-white: `#F6F8F7`, `#F8FAFC`;
- slate: `#334155`, `#64748B`;
- sand discret: `#E8D8A8`, `#F3EAD2`;
- maritime green: `#0F766E`;
- amber pour attention;
- red/rose uniquement pour urgence.

Eviter cyan flashy partout.

## Typographie et densite

Le produit doit sembler serieux et exploitable:

- titres moins enormes;
- densite plus professionnelle;
- textes courts et metier;
- labels clairs;
- chiffres lisibles;
- actions visibles;
- hierarchie forte.

## Page `/espace-prive`

Refaire totalement la porte d'entree.

Objectif: donner confiance immediatement et expliquer que l'on entre dans une console produit.

Structure attendue:

- header sobre Mbambulaan;
- bloc hero institutionnel;
- entree vers l'espace Ministere;
- apercu des 3 modules;
- signaux operationnels simules;
- bloc connexion/demo propre;
- CTA clair vers `/espace-prive/etat`.

Cette page ne doit pas ressembler a une landing SaaS. Elle doit ressembler a une porte d'acces produit institutionnelle.

## Page `/espace-prive/etat`

Refaire la page comme une application produit.

Structure cible:

- top bar produit;
- zone contexte / synthese courte;
- navigation modules claire;
- module actif en contenu principal;
- zone action / details;
- footer inutile a eviter dans la console.

La navigation doit permettre de comprendre les 3 modules:

- Cartographie;
- Valorisation communautaire;
- Pilotage.

Ne pas utiliser des onglets enormes ou des cartes grossieres. Faire une navigation produit premium.

## Module 1 - Cartographie high-level

Ce module doit etre le plus fort visuellement.

Parcours:

Vue globale filiere -> filtres -> Vue quais ou Vue pirogues -> selection -> panneau detail -> action.

Elements obligatoires:

- carte large et dominante;
- switch clair `Vue quais` / `Vue pirogues`;
- filtres propres;
- quais positionnes sur le littoral;
- pirogues positionnees en mer;
- debarquements visibles;
- alertes visibles;
- legende sobre;
- stats de carte;
- panneau detail au clic;
- actions: voir debarquements, verifier, creer alerte, exporter synthese.

Important:

Si tu peux integrer rapidement Leaflet ou MapLibre sans casser le projet, fais-le.
Sinon, fais un prototype cartographique SVG beaucoup plus abouti, mais il doit ressembler a un outil cartographique, pas a une illustration.

La carte doit avoir:

- couches visuelles;
- controle de vues;
- markers professionnels;
- labels bien places;
- panel de detail premium;
- vraie sensation command center.

## Module 2 - Valorisation communautaire

Ce module doit devenir un vrai parcours produit, pas une liste de cartes.

Parcours:

Besoin terrain -> qualification -> programme / initiative -> partenaire -> action -> suivi impact.

Composants attendus:

- colonne ou panel `Besoins terrain`;
- workflow de qualification;
- programmes actifs;
- partenaires mobilisables;
- prochaine decision;
- actions a lancer;
- indicateurs d'impact simples.

Le module doit raconter comment Mbambulaan transforme des signaux terrain en programmes concrets.

A eviter:

- catalogue de cartes;
- dashboard marketing;
- textes longs;
- blocs statiques sans decision.

## Module 3 - Pilotage high-level

Ce module doit etre un espace de decision, pas un dashboard generique.

Parcours:

Situation high-level -> KPI -> anomalie -> analyse -> action prioritaire -> export.

Composants attendus:

- synthese du jour;
- KPI high-level;
- volumes par quai;
- alertes prioritaires;
- actions en retard;
- debarquements recents;
- synthese operationnelle;
- bouton export / rapport.

Il doit donner au ministere une lecture claire: que se passe-t-il, ou est le risque, quelle action prendre.

## Niveau visuel attendu

Le resultat doit produire une rupture visible par rapport aux versions precedentes.

On doit voir au premier coup d'oeil:

- une nouvelle composition;
- un design system plus mature;
- une carte plus credible;
- des modules plus metier;
- des composants moins generiques;
- une vraie qualite produit.

Si l'ecran ressemble encore a:

- cards Tailwind arrondies;
- blocs blancs empiles;
- pseudo-dashboard;
- simple changement de couleurs;

alors la mission est ratee.

## Contraintes techniques

Stack actuelle:

- Next.js 15;
- React 19;
- Tailwind 4;
- TypeScript 5.

Tu peux ajouter une dependance gratuite uniquement si elle apporte une vraie valeur et reste compatible.

Autorise:

- `leaflet` / `react-leaflet` si integration propre;
- `maplibre-gl` si integration propre;
- composants inspires d'Untitled UI open-source;
- petits helpers internes.

Eviter:

- gros template admin;
- dependance payante;
- migration massive inutile;
- refonte du projet entier hors scope.

## Methode d'execution

1. Lire les fichiers existants.
2. Identifier les composants generiques a remplacer.
3. Creer ou reorganiser un design system local pour l'espace prive.
4. Refaire `/espace-prive`.
5. Refaire `/espace-prive/etat`.
6. Refaire tous les composants des 3 modules.
7. Verifier que chaque module a un parcours complet.
8. Verifier le rendu desktop/laptop.
9. Verifier responsive raisonnable.
10. Lancer les validations.

## Validations obligatoires

Lancer:

```bash
npm run typecheck
npm run build
```

Corriger toutes les erreurs.

Tester manuellement:

- `/espace-prive`;
- `/espace-prive/etat`;
- Cartographie;
- Valorisation communautaire;
- Pilotage;
- switch Vue quais / Vue pirogues;
- clic quai;
- clic pirogue;
- panneau detail;
- filtres;
- absence de scroll horizontal.

## Resume attendu a la fin

Ajouter un resume clair avec:

- fichiers modifies;
- choix design;
- composants refaits;
- ce qui a change dans la carte;
- ce qui a change dans la valorisation communautaire;
- ce qui a change dans le pilotage;
- dependances ajoutees ou non;
- resultat typecheck;
- resultat build;
- limites restantes.

## Critere final

Le resultat doit etre montrable a un partenaire sans s'excuser du design.

La refonte doit etre visible, complete et credible.

Ne livre pas une petite amelioration. Livre une vraie rupture visuelle et produit.