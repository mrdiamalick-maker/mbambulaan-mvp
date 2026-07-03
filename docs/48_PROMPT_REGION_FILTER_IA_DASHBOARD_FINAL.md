# Prompt final - filtre region, dashboards Etat et IA Mbambulaan

## Decision produit

Cette passe doit corriger un point structurant : l'espace Etat ne doit plus etre pilote uniquement par un filtre de quai. Le filtre principal doit etre un filtre par region, avec une option `Tout`.

Le Ministere doit pouvoir :

- voir toutes les regions et tous les quais ;
- filtrer par region ;
- ne voir que les donnees de la region choisie ;
- comprendre les KPIs par quai, pas uniquement une moyenne ;
- aller de la region au quai, puis du quai a l'action et a la trace.

Priorite absolue : `/espace-prive/etat`.

P2 : harmoniser `/espace-prive` si P1 est solide.

## Prompt a donner a Codex

Travaille sur la branche `rebuild-premium-template` et la PR #26.

Garde la PR en draft.

Lis avant de coder :

- `docs/47_PROMPT_XXL_PREMIUM_ETAT_LANDING_USE_CASES.md`
- `docs/46_PROMPT_CORRECTION_BLOQUANTE_ESPACE_MINISTERE.md`
- `docs/37_DATASET_QUAIS_MINISTERE_V1.md`
- `docs/39_DIRECTION_IMAGES_VISUELLES_PREMIUM.md`

Objectif : corriger et finaliser l'espace prive Etat avec une vraie lecture par region, des KPIs par quai, une IA Mbambulaan plus actionnable, et une meilleure comprehension des indicateurs.

Ne pas utiliser Codex pour de petites corrections hors scope. Ne pas travailler API, backend, auth, logo, slider ou base de donnees.

## 1. Remplacer le filtre principal quai par un filtre region

Le filtre principal en haut doit devenir :

- Tout ;
- Dakar ;
- Saint-Louis ;
- Thies ;
- Fatick ;
- Ziguinchor ;
- Louga ;
- Kaolack ou autres regions pertinentes si utile.

Attention : utiliser `Thies` dans le code si besoin ASCII, mais afficher `Thiès` a l'ecran.

Quand `Tout` est selectionne :

- afficher toutes les regions ;
- afficher tous les quais ;
- afficher les KPIs par quai ou par region selon le meilleur rendu ;
- ne pas afficher une simple moyenne qui cache les disparites ;
- montrer les meilleurs / pires quais, les volumes, alertes, especes et actions par zone.

Quand une region est selectionnee :

- afficher uniquement les quais de cette region ;
- afficher uniquement les peches, tonnages, especes, conflits, plaintes, alertes, programmes, budgets, ressources, referents et preuves de cette region ;
- ne jamais montrer Joal si Dakar est selectionne ;
- ne jamais montrer des donnees hors region selectionnee ;
- la carte doit mettre en avant uniquement les points de la region choisie, ou tous les points si `Tout` est actif.

Garder la possibilite de selectionner un quai secondairement dans la region pour voir sa fiche detaillee.

## 2. Ajouter plus de quais et points de geolocalisation mockes

Simuler plusieurs quais par region, pour rendre l'espace credible.

Exemples :

Dakar : Soumbedioune, Hann, Yoff, Ngor, Ouakam, Rufisque.
Saint-Louis : Guet Ndar, Goxu Mbacc, Hydrobase, Langue de Barbarie.
Thies : Joal, Mbour, Kayar, Popenguine, Saly-Portudal, Nianing.
Fatick : Foundiougne, Djiffer, Ndangane, Missirah.
Ziguinchor : Cap Skirring, Kafountine, Elinkine, Ziguinchor port.
Louga : Lompoul, Potou, Fass Boye.
Kaolack : Kaolack port, Sokone, Foundiougne peut etre rattache a Fatick si preferable.

Chaque quai doit avoir :

- region ;
- commune ;
- lat/lng mockes ;
- niveau de tension ;
- score priorite ;
- peches du jour ;
- tonnage ;
- especes principales ;
- incidents ;
- plaintes/conflits ;
- referents ;
- programmes/budgets/ressources ;
- preuves ;
- actions recommandees.

## 3. Les 9 categories doivent respecter le filtre region/Tout

Toutes les categories doivent se recalculer selon le filtre.

Renommer `Command center` en francais et adapte au contexte. Proposition : `Centre de pilotage national`.

Categories attendues :

1. Centre de pilotage national
2. Lecture territoriale
3. Indicateurs critiques
4. Carte et fiches de quai
5. Peches du jour
6. Programmes et moyens
7. Alertes terrain et incidents operationnels
8. Coordination terrain
9. Preuves, notes et traces
10. IA Mbambulaan gouvernee si activee

Si `Tout` est selectionne :

- les KPIs doivent montrer une lecture par quai ou classement par quai ;
- eviter les moyennes globales seules ;
- afficher des distributions : top quais critiques, volumes par quai, alertes par quai, especes par quai, actions par quai.

Si une region est selectionnee :

- toutes les sections affichent uniquement les donnees de cette region ;
- les KPIs deviennent regionaux avec details par quai ;
- les cartes, listes et charts ne doivent pas afficher hors region.

## 4. Bulles d'information discretes sur les indicateurs

Ajouter une bulle d'information `i` a cote des titres des indicateurs ou sections importantes.

Contraintes :

- visible mais discrete ;
- n'occupe pas de place ;
- s'affiche au hover et/ou au clic ;
- ne doit pas analyser la valeur ;
- explique simplement ce que le KPI permet de voir ;
- 1 a 2 phrases maximum ;
- vocabulaire clair pour Ministere, direction, programme, partenaire.

Exemples de textes :

- Tension : `Indique le niveau de pression observe sur une zone ou un quai a partir des signaux terrain, incidents et alertes.`
- Score priorite : `Aide a reperer les quais qui demandent une attention rapide. Le score est une simulation pour la demo.`
- Peches du jour : `Donne une lecture des debarquements declares et des volumes du jour par quai ou region.`
- Especes sensibles : `Permet d'identifier les especes signalees comme a surveiller. Les signaux doivent etre verifies avant decision.`
- Alertes terrain : `Regroupe les incidents, plaintes et tensions declarees par les relais ou acteurs terrain.`
- Preuves : `Montre les elements disponibles pour documenter une decision, une verification ou un arbitrage.`

Creer un petit composant reusable du type `InfoHint` si pertinent.

## 5. IA Mbambulaan plus actionnable

Les commentaires IA sont pertinents mais il faut aller au bout de ce qu'elle propose.

L'IA ne doit pas juste afficher des questions comme `Quelle note preparer ?` sans action.

Quand IA activee :

- afficher un module IA comme fonctionnalite activee ;
- elle enrichit les dashboards avec commentaires contextuels ;
- elle propose des actions claires ;
- chaque suggestion doit avoir un bouton ou une consequence visible.

Exemples :

Suggestion IA : `Preparer une note sur les tensions carburant a Kayar`
Action : bouton `Generer brouillon`
Resultat : brouillon affiche dans Notes et action ajoutee dans Actions en attente.

Suggestion IA : `Verifier une espece sensible signalee a Saint-Louis`
Action : bouton `Demander verification`
Resultat : trace ajoutee + referent associe.

Suggestion IA : `Comparer les volumes de Mbour et Joal`
Action : bouton `Voir comparaison`
Resultat : petit bloc comparaison affiche.

Suggestion IA : `Alerte : plaintes paiement mareyeurs a Dakar`
Action : bouton `Ouvrir plaintes`
Resultat : scroll/section ou focus visuel sur plaintes de Dakar.

Quand IA desactivee :

- supprimer les commentaires IA automatiques ;
- afficher un etat propre : `Mode manuel : les donnees, actions et traces restent disponibles sans assistance IA.`
- les questions IA ne doivent pas occuper l'espace.

Important : l'IA assiste, elle ne decide jamais. L'humain valide.

## 6. Design premium XXL encore plus fort

Challenge le design.

Problemes a corriger :

- certains blocs restent trop similaires ;
- certaines cartes ne sont pas iso couleur mer ;
- certains graphes ont des encadres lourds ;
- les transitions entre categories doivent mieux guider la lecture.

Attendu :

- palette mer sur tous les encadres ;
- graphes sur backgrounds transparents ou tres legers ;
- indicateurs criticite vert / jaune / rouge conserves ;
- sections avec titres forts ;
- separation visuelle entre categories ;
- scroll vertical fluide ;
- aucun effet PowerPoint ;
- pas d'admin froid ;
- rendu institutionnel, premium, clair et credible.

## 7. Footer landing

Verifier que le CTA footer `Lancer la demo` est supprime.

Le footer doit afficher :

`© 2026 Mbàmbulaan, une solution de Epic conseil, tous droits réservés.`

Ou utiliser l'annee dynamique si deja en place.

## 8. Landing : P1 leger si necessaire

La landing doit rester premium. Revoir surtout le bloc cas d'usage si encore trop tableau.

Poursuivre la logique : cartes acteurs, pictos, workflow, mini visualisations, segments cibles.

Ne pas ajouter logo final ni slider.

## 9. Bonus P2 : page /espace-prive

Si P1 est solide, redesign leger de `/espace-prive`.

Objectif : qu'elle soit coherente avec la landing et l'espace Etat.

Elle doit expliquer :

- chaque espace prive est une experience role-specific apres cadrage ;
- le Ministere est l'espace de reference ;
- les autres espaces sont simules / pilotes ;
- CTA vers espace Ministere et demande demo.

Ne pas refaire tous les espaces acteurs.

## Contraintes strictes

Ne pas faire :

- API ;
- base de donnees ;
- auth reelle ;
- logo final ;
- slider ;
- nouvelle architecture backend ;
- refonte complete des autres espaces acteurs ;
- donnees reelles non verifiees.

Données mockées uniquement.

Garder la PR #26 en draft.

## Validation obligatoire

Executer :

```bash
npm run typecheck
npm run build
```

Corriger toute erreur bloquante.

Mettre a jour le body de PR avec :

- filtre region + option Tout ;
- donnees limitees par region selectionnee ;
- quais et points de geolocalisation ajoutes ;
- KPIs par quai et non moyenne globale seule ;
- bulles d'information ;
- IA actionnable ;
- design premium XXL ;
- footer conserve avec copyright ;
- P2 `/espace-prive` si fait ;
- fichiers modifies ;
- validations typecheck/build ;
- limites restantes.

## Definition de succes

La version est acceptable si :

1. `Tout` affiche une vision multi-regions et multi-quais sans moyenne reductrice ;
2. chaque region affiche uniquement ses donnees ;
3. aucun quai hors region n'apparait dans les KPIs, listes, cartes ou actions ;
4. la carte affiche plusieurs points de geolocalisation ;
5. les 9 categories respectent le filtre ;
6. les bulles `i` aident a comprendre les indicateurs ;
7. l'IA propose des actions qui aboutissent a une trace ;
8. le design est premium, mer, lisible et credible ;
9. le footer ne contient plus `Lancer la demo` ;
10. typecheck et build passent.