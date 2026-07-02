# Checklist anti-oubli - filtre region, KPIs par quai et IA Etat

## Objectif

Cette checklist sert de garde-fou pour verifier que `docs/48_PROMPT_REGION_FILTER_IA_DASHBOARD_FINAL.md` est bien applique sans oubli.

Codex doit traiter cette checklist comme obligatoire avant de terminer.

## 1. Filtre principal

- [ ] Le filtre principal n'est plus un filtre par quai.
- [ ] Le filtre principal est un filtre par region.
- [ ] Le filtre contient une option `Tout`.
- [ ] Le filtre contient au minimum : Dakar, Saint-Louis, Thies/Thiès, Fatick, Ziguinchor, Louga, Kaolack si pertinent.
- [ ] L'option `Tout` est visible en premier.
- [ ] L'utilisateur peut encore consulter une fiche detaillee de quai apres selection d'une region.

## 2. Donnees coherentes par region

- [ ] Quand `Tout` est selectionne, toutes les regions et tous les quais sont visibles.
- [ ] Quand Dakar est selectionne, aucun element de Joal, Mbour, Kayar, Saint-Louis, Fatick, Ziguinchor, Louga ou Kaolack n'apparait.
- [ ] Quand Saint-Louis est selectionne, seuls les quais de Saint-Louis apparaissent.
- [ ] Quand Thies/Thiès est selectionne, seuls Joal, Mbour, Kayar, Popenguine, Saly-Portudal, Nianing ou quais rattaches a cette region apparaissent.
- [ ] Cette regle vaut pour toutes les regions.
- [ ] Aucun KPI, graphe, carte, liste, action, referent, preuve, note ou suggestion IA ne montre une donnee hors region selectionnee.

## 3. Plusieurs quais et geolocalisation

- [ ] Plusieurs quais sont simules par region.
- [ ] Dakar contient plusieurs points : Soumbedioune, Hann, Yoff, Ngor, Ouakam, Rufisque ou equivalent.
- [ ] Saint-Louis contient plusieurs points : Guet Ndar, Goxu Mbacc, Hydrobase, Langue de Barbarie ou equivalent.
- [ ] Thies contient plusieurs points : Joal, Mbour, Kayar, Popenguine, Saly-Portudal, Nianing ou equivalent.
- [ ] Fatick, Ziguinchor, Louga et Kaolack ont aussi plusieurs points si incluses.
- [ ] Chaque point a une region, une commune, une latitude/longitude mockee et des coordonnees visuelles.
- [ ] La carte affiche tous les points en mode `Tout`.
- [ ] La carte affiche uniquement les points de la region selectionnee en mode region.

## 4. KPIs par quai, pas moyenne reductrice

- [ ] En mode `Tout`, les KPIs ne sont pas uniquement des moyennes globales.
- [ ] En mode `Tout`, les KPIs affichent des classements, distributions ou comparaisons par quai.
- [ ] En mode region, les KPIs affichent une lecture regionale avec detail par quai.
- [ ] Les 9 categories principales respectent le filtre region/Tout.

Categories a verifier :

- [ ] Centre de pilotage national.
- [ ] Lecture territoriale.
- [ ] Indicateurs critiques.
- [ ] Carte et fiches de quai.
- [ ] Peches du jour.
- [ ] Programmes et moyens.
- [ ] Alertes terrain et incidents operationnels.
- [ ] Coordination terrain.
- [ ] Preuves, notes et traces.
- [ ] IA Mbambulaan gouvernee si activee.

## 5. Design premium XXL

- [ ] Le terme `Command center` n'apparait plus dans l'interface.
- [ ] Le nom francais adapte est utilise : `Centre de pilotage national` ou mieux.
- [ ] La palette mer est visible dans tous les KPIs, cartes, encadres, tableaux, actions et traces.
- [ ] Les indicateurs vert / jaune / rouge de criticite sont conserves.
- [ ] Les graphes ne sont pas dans des encadres lourds.
- [ ] Les graphes sont integres dans des backgrounds transparents ou tres legers.
- [ ] Les transitions entre blocs guident la lecture.
- [ ] L'espace reste premium, institutionnel et lisible.

## 6. Bulles d'information

- [ ] Les titres des indicateurs importants ont une bulle `i`.
- [ ] La bulle est discrete et visible.
- [ ] La bulle s'affiche au hover et/ou au clic.
- [ ] La bulle n'occupe pas d'espace permanent.
- [ ] La bulle explique ce que le KPI permet de voir.
- [ ] La bulle n'analyse pas la valeur du KPI.
- [ ] Chaque texte fait 1 a 2 phrases maximum.
- [ ] Le vocabulaire parle a un Ministere, une direction, un programme ou un partenaire.

## 7. IA Mbambulaan actionnable

- [ ] L'IA n'apparait comme composant complet que si la fonctionnalite IA est activee.
- [ ] Si IA desactivee : afficher un etat simple `Mode manuel`.
- [ ] Si IA desactivee : les commentaires IA automatiques disparaissent.
- [ ] Si IA activee : les dashboards sont enrichis par des commentaires contextuels.
- [ ] Les capacites cochables existent : Synthese, Alertes, Notes, Recherche assistee.
- [ ] Si une capacite est desactivee, son contenu n'apparait pas comme actif.
- [ ] Les suggestions IA proposent une action concrete.
- [ ] Chaque action IA produit une consequence visible : note, trace, action en attente, focus visuel ou comparaison.
- [ ] L'IA ne decide jamais.
- [ ] La mention reste visible : `IA simulee - donnees mockees. L'humain valide chaque decision.`

## 8. Cas d'usage metier Etat

- [ ] Peches du jour par quai.
- [ ] Tonnages par quai.
- [ ] Debarquements par quai.
- [ ] Varietes / especes par quai.
- [ ] Especes sensibles, protegees ou a surveiller.
- [ ] Conflits et plaintes pecheurs/mareyeurs.
- [ ] Alertes terrain.
- [ ] Incidents operationnels.
- [ ] Programmes et moyens.
- [ ] Preuves, notes et traces.

## 9. Footer landing

- [ ] Le CTA footer `Lancer la demo` n'existe plus.
- [ ] Le footer contient le copyright : `Mbàmbulaan, une solution de Epic conseil, tous droits réservés.`
- [ ] Le footer garde un rendu sobre et premium.

## 10. P2 /espace-prive

A traiter uniquement si P1 est solide.

- [ ] La page `/espace-prive` est plus coherente avec la landing et l'espace Etat.
- [ ] Elle explique que chaque espace prive est role-specific apres cadrage.
- [ ] Elle met l'espace Ministere en reference.
- [ ] Elle ne refond pas tous les autres espaces acteurs.

## 11. Validation finale obligatoire

- [ ] `npm run typecheck` OK.
- [ ] `npm run build` OK.
- [ ] Body de PR mis a jour.
- [ ] PR gardee en draft.

## Instruction finale pour Codex

Ne termine pas tant que cette checklist n'est pas remplie ou que les ecarts ne sont pas expliques explicitement dans le body de PR.