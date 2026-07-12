# CODEX TERA PROMPT FINAL — Refonte graphique totale Mbambulaan

## 0. Contexte critique

Les iterations precedentes ont echoue sur un point essentiel : le rendu ressemble encore a un dashboard Tailwind generique. Cette passe est la derniere passe de finalisation design.

Ne cherche pas a ameliorer l'existant. Remplace-le graphiquement.

Tu dois agir comme CPO, CTO, architecte produit, designer senior et developpeur full-stack. L'objectif n'est pas de produire une jolie page, mais une solution institutionnelle vendable a un ministere, des directions techniques, des bailleurs et des partenaires de la filiere peche artisanale.

Mbambulaan doit donner une impression de produit serieux, premium, professionnel et operationnel. Le resultat ne doit rien avoir a envier aux grands produits connus de coordination, cartographie, mobilite et plateformes B2B.

## 1. Interdiction absolue

Ne produis pas une autre variante Tailwind.
Ne garde pas la meme structure visuelle.
Ne garde pas l'effet empilement de cards.
Ne te contente pas de changer les couleurs.
Ne garde pas des blocs marketing SaaS.
Ne garde pas une navigation grossiere en onglets.
Ne fais pas un dashboard admin.
Ne fais pas une landing page de startup.
Ne fais pas de cyan flashy partout.
Ne fais pas de gros gradients decoratifs.
Ne livre pas une petite amelioration.

Si le resultat ressemble encore aux versions precedentes, la mission est ratee.

## 2. Nouvelle direction produit

Nom de direction : **Mbambulaan Maritime Coordination OS**.

Mbambulaan n'est pas une marketplace, pas un ERP, pas un dashboard, pas une simple application.

Mbambulaan est une infrastructure numerique de coordination pour la filiere peche artisanale senegalaise. L'espace prive doit aider a :

- observer l'activite maritime et littorale ;
- fiabiliser les informations terrain ;
- coordonner les acteurs ;
- transformer les signaux en programmes ;
- piloter les decisions institutionnelles ;
- produire de la preuve et de la confiance.

## 3. Direction graphique attendue

Le rendu doit etre :

- institutionnel ;
- premium ;
- maritime ;
- professionnel ;
- clair ;
- dense mais lisible ;
- sobre ;
- vendable ;
- directement montrable a un ministere.

Palette prioritaire :

- blanc, off-white, gris neutres ;
- bleu marine profond ;
- bleu ocean ;
- bleu-gris professionnel ;
- sable tres discret ;
- vert maritime pour validation ;
- ambre pour attention ;
- rouge uniquement pour urgence.

Exemples de couleurs possibles :

- background : #F5F7F8, #F8FAFC, #EEF3F4 ;
- surfaces : #FFFFFF, #FAFCFC ;
- navy : #062330, #0B3142, #102A43 ;
- ocean : #0E7490, #0F6B7A, #155E75 ;
- neutral : #334155, #64748B, #94A3B8 ;
- sand : #E8D8A8, #F3EAD2 ;
- green : #0F766E ;
- amber : #B7791F ;
- red : #B42318.

Utilise les couleurs comme un systeme fonctionnel, pas comme une decoration.

## 4. Changement de trajectoire UI

Tu dois reconstruire l'experience comme un progiciel premium, pas comme des composants Tailwind empiles.

Nouvelle structure cible :

- une vraie porte d'acces institutionnelle sur `/espace-prive` ;
- une vraie console applicative sur `/espace-prive/etat` ;
- navigation produit laterale ou rail compact ;
- topbar professionnelle ;
- zone centrale forte ;
- panneau contextuel de decision ;
- composants metier harmonises ;
- aucune page longue inutilement si une composition applicative est possible.

L'espace `/espace-prive/etat` doit ressembler a un outil professionnel de coordination, pas a une page web.

## 5. Renommage des espaces

Challenge les noms actuels si necessaire. Utilise des appellations premium, claires et institutionnelles.

Proposition recommandee :

1. **Atlas maritime**
   - carte, quais, pirogues, debarquements, alertes, zones.

2. **Filiere & programmes**
   - besoins terrain, qualification, initiatives, partenaires, actions, impact.

3. **Pilotage institutionnel**
   - situation, KPI, risques, actions, arbitrages, exports.

Les noms doivent etre coherents en francais. Evite un melange anglais/francais si cela degrade la perception institutionnelle.

## 6. Page `/espace-prive`

Refais cette page entierement.

Objectif : donner confiance et faire comprendre que l'utilisateur entre dans une console privee institutionnelle.

Elle doit contenir :

- header tres sobre Mbambulaan ;
- phrase de positionnement courte ;
- bloc acces Ministere / demonstration ;
- apercu des 3 espaces ;
- signaux operationnels simules ;
- CTA clair vers `/espace-prive/etat` ;
- mention claire que les donnees sont mockees et que les decisions restent humaines.

Elle ne doit pas etre une landing page marketing. Elle doit etre une porte d'entree produit, comme un acces a un progiciel institutionnel.

## 7. Page `/espace-prive/etat`

Refais cette page entierement.

Objectif : donner l'impression d'un poste de coordination maritime moderne.

Structure recommandee :

- Topbar : Mbambulaan, Ministere, periode, statut demo, actions export/synthese.
- Rail gauche : les 3 espaces de travail.
- Zone centrale : contenu du module actif.
- Panneau droit : contexte, selection, prochaine action, decision.

Evite :

- hero enorme ;
- blocs empiles verticalement ;
- onglets grossiers ;
- cartes repetitives ;
- textes longs ;
- design full dark.

## 8. Module 1 — Atlas maritime

C'est le module le plus important visuellement.

Parcours attendu :

Vue globale -> couches -> filtres -> selection quai/pirogue -> detail -> action.

Elements obligatoires :

- carte dominante ;
- switch clair entre vue quais et vue pirogues ;
- couches : quais, pirogues, debarquements, alertes ;
- filtres compacts : region, quai, espece, niveau, recherche ;
- marqueurs professionnels ;
- debarquements visibles ;
- alertes visibles ;
- panneau detail premium ;
- actions : verifier, creer alerte, voir debarquements, exporter zone.

Decision technique :

- Si possible et stable, integre une vraie carte gratuite : Leaflet, React Leaflet ou MapLibre.
- Si tu ne peux pas l'integrer proprement, reconstruis le prototype cartographique de maniere beaucoup plus professionnelle.
- Dans tous les cas, la carte ne doit pas ressembler a une illustration decorative.

La carte doit donner une sensation d'outil geospatial professionnel : couches, controles, labels propres, information actionnable.

## 9. Module 2 — Filiere & programmes

Ce module ne doit pas etre un catalogue de cards.

Parcours attendu :

Signal terrain -> qualification -> programme -> partenaire -> action -> impact.

Composants attendus :

- file des besoins terrain ;
- pipeline de qualification ;
- programmes actifs ;
- partenaires mobilisables ;
- decision suivante ;
- indicateurs d'impact ;
- actions visibles.

Le module doit montrer comment Mbambulaan transforme une remontee terrain en action financee, suivie et valorisee.

## 10. Module 3 — Pilotage institutionnel

Ce module doit etre une salle de decision.

Parcours attendu :

Situation du jour -> KPI -> anomalie -> analyse -> action prioritaire -> export.

Composants attendus :

- synthese du jour ;
- KPI high-level ;
- alertes prioritaires ;
- volumes par quai, region ou espece ;
- actions en retard ;
- debarquements recents ;
- decisions recommandees ;
- export institutionnel.

Ce module doit permettre au ministere de repondre vite : que se passe-t-il, ou est le risque, que faut-il faire, que peut-on transmettre.

## 11. Design system local a creer

Cree ou refactorise un vrai systeme local de composants. N'utilise pas seulement `ShellCard` partout.

Composants cibles :

- `PrivateConsoleShell` ;
- `InstitutionalTopBar` ;
- `WorkspaceRail` ;
- `WorkspaceHeader` ;
- `DecisionPanel` ;
- `MetricBlock` ;
- `StatusPill` ;
- `LayerControl` ;
- `FilterBar` ;
- `MapWorkspace` ;
- `ObjectInspector` ;
- `WorkflowPipeline` ;
- `ProgramPanel` ;
- `PartnerPanel` ;
- `SteeringBrief` ;
- `ActionList` ;
- `EvidenceTimeline`.

Les composants doivent donner une nouvelle grammaire visuelle. Si tu gardes les memes cards avec de nouveaux textes, la mission est ratee.

## 12. Wording

Revois les wordings. Ils doivent etre courts, metier et institutionnels.

Evite :

- jargon SaaS ;
- slogans vagues ;
- phrases trop marketing ;
- melange anglais/francais inutile.

Prefere :

- Atlas maritime ;
- Situation du jour ;
- Signal terrain ;
- Programme associe ;
- Partenaire mobilisable ;
- Action prioritaire ;
- Preuve disponible ;
- Export institutionnel ;
- Verification requise.

## 13. Fichiers a modifier

Tu peux changer tout ce qui est necessaire dans l'espace prive :

- `src/app/espace-prive/page.tsx` ;
- `src/app/espace-prive/etat/page.tsx` ;
- `src/components/private-space/MinistryControlTower.tsx` ;
- `src/components/private-space/MinistryControlTowerParts.tsx` ;
- `src/data/ministryControlTowerData.ts` si utile ;
- creer de nouveaux composants dans `src/components/private-space/` si necessaire ;
- ajouter une dependance gratuite si elle apporte une vraie valeur et reste stable.

Tu as le droit de supprimer, renommer, reorganiser et refactoriser les composants existants si cela aide a obtenir une vraie rupture.

## 14. Utilisation de Codex Sites

Si tu utilises le progiciel Sites de Codex, traite ce prompt comme un brief de direction artistique et produit.

Objectif Sites : proposer une nouvelle version graphique complete, pas seulement une reorganisation.

Le resultat doit etre evalue comme si on le presentait a :

- un ministre ;
- un directeur technique ;
- un bailleur ;
- un partenaire de programme ;
- une organisation de pecheurs.

Question d'acceptation : est-ce que cette interface inspire confiance et donne envie de financer ou piloter un pilote Mbambulaan ?

## 15. Validations obligatoires

Lance :

```bash
npm run typecheck
npm run build
```

Corrige toutes les erreurs.

Teste manuellement :

- `/espace-prive` ;
- `/espace-prive/etat` ;
- Atlas maritime ;
- Filiere & programmes ;
- Pilotage institutionnel ;
- switch vue quais / vue pirogues ;
- selection quai ;
- selection pirogue ;
- filtres ;
- panneau detail ;
- responsive laptop.

## 16. Critere final non negociable

Le rendu doit etre visiblement different des versions precedentes.

Il doit etre premium, institutionnel, professionnel et vendable.

Il doit abandonner l'effet dashboard Tailwind.

Il doit pouvoir etre montre a un partenaire sans excuse.

Si tu penses que l'existant t'empeche d'atteindre ce niveau, remplace l'existant.

## 17. Resume attendu dans ta reponse finale

A la fin, indique clairement :

- fichiers modifies ;
- nouveaux composants crees ;
- changements de direction graphique ;
- nouveaux noms d'espaces ;
- changements sur la carte ;
- changements sur Filiere & programmes ;
- changements sur Pilotage institutionnel ;
- dependances ajoutees ou non ;
- resultat typecheck ;
- resultat build ;
- limites restantes.

Ne livre pas une petite amelioration. Livre la version finale graphique.