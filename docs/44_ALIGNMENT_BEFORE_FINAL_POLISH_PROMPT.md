# Alignement avant prompt final polish

## Contexte

La PR #26 contient maintenant une version MVP testable : landing, espace Ministere dynamique par quai, KPIs visuels, referents terrain, actions qui modifient l'interface, IA contextualisee, P2 leger sur demo et portail espace prive.

Mais la version n'est pas encore assez aboutie visuellement pour une presentation pilote devant le Ministere.

## Feedback fondateur

### Landing

La landing doit devenir beaucoup plus premium.

Attendus :

- couleurs de la mer plus presentes ;
- wording plus vendeur, plus accrocheur ;
- lecture qui donne envie de decouvrir la solution ;
- public cible qui se reconnait rapidement ;
- blocs et CTA simples, beaux, modernes ;
- eviter l'effet PowerPoint ou simple encadre avec contour ;
- remplacer les explications simplistes par un design mieux charte ;
- utiliser pictos, figures, workflow ou visuel de parcours.

### Espace Ministere

L'espace est sur la bonne voie mais doit etre plus premium.

Attendus :

- couleurs de la mer sur les lignes KPI et composants ;
- meilleure presentation de tous les composants : synthese, territoires, carte, KPIs, actions, referents, notes ;
- utiliser davantage la hauteur de page et accepter le scroll ;
- eviter de tout serrer horizontalement ;
- donner plus de respiration ;
- IA Mbambulaan activable/desactivable ;
- ne pas afficher l'IA systematiquement dans tous les blocs ;
- valoriser l'IA sans induire en erreur.

## Position CPO / CTO / Design

Le probleme n'est plus fonctionnel. Le probleme est maintenant la maturite percue.

La solution doit paraitre :

- premium ;
- institutionnelle ;
- credible ;
- claire ;
- achetable ;
- utile pour une presentation pilote Ministere.

Le prochain prompt Codex ne doit pas ajouter de nouvelles grandes features. Il doit faire une passe finale de design, UX, narration et architecture front.

## Direction produit finale

Priorite 1 : Landing.

Elle doit vendre l'ecosysteme sans le sur-expliquer.

Message central : Mbambulaan transforme les signaux terrain disperses en decisions coordonnees, suivies et tracables.

Priorite 2 : Espace Ministere.

Il doit faire ressentir le passage :

Vision nationale -> quai -> KPI -> analyse -> referent -> action -> trace.

Priorite 3 : IA.

L'IA doit etre un module valorise, activable/desactivable, rassurant, non envahissant.

## Regles pour le prompt final

- Un seul prompt Codex.
- Ne pas rouvrir le produit entier.
- Ne pas travailler logo, slider, branding complet.
- Ne pas refondre tous les autres espaces.
- Ne pas ajouter API ou backend.
- Ne pas cacher les donnees mockees.
- Ne pas transformer Mbambulaan en BI generique.
- Ne pas perdre le filtre par quai.
- Ne pas casser les actions qui modifient l'interface.

## Definition de fini pour cette phase

La version est acceptable si :

1. la landing donne envie ;
2. le Ministere comprend la valeur en moins d'une minute ;
3. l'espace Ministere respire et parait premium ;
4. le filtre par quai est central ;
5. les KPIs et cartes sont beaux et lisibles ;
6. les referents terrain ont une vraie fonction de coordination ;
7. les actions laissent une trace visible ;
8. l'IA est valorisee sans etre intrusive ;
9. typecheck et build passent ;
10. la PR reste draft.