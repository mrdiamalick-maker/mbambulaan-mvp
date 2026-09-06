# Mbàmbulaan Produit — Audit mobile complet (Lot 7, étape 4/4)

> Complète `PRODUCT_ACCEPTANCE_RECETTE.md` §2.10 (« le mobile est cassé » marqué partiel : seul le Terrain mobile neuf avait été vérifié). Cet audit couvre le reste du Produit, une fois les étapes 1 à 3 du Lot 7 stabilisées.

## Méthode

Sweep automatisé (Playwright, viewport 390×844, `isMobile`/`hasTouch`) sur les 21 routes accessibles depuis les 7 mandats de démonstration (coordinateur, institution, capitaine, opérateur, mareyeur, transformateur, prestataire). Pour chaque route : connexion réelle avec le compte du mandat, navigation, mesure `document.documentElement.scrollWidth` vs `clientWidth` — tout dépassement de plus de 2px signale un débordement horizontal réel (le signal objectif derrière « le mobile est cassé », §21 du spec maître), pas une appréciation visuelle. Capture d'écran automatique de toute route en défaut. Erreurs JavaScript de page (`pageerror`) également collectées.

## Résultat

**21/21 routes sans débordement horizontal, 0 erreur JavaScript, après correction d'un défaut réel trouvé.**

| Mandat | Routes vérifiées | Résultat |
|---|---|---|
| coordinateur | /app/travail, /app/situations, /app/situations/sit-glace, /app/coordination, /app/coordination/coord-froid, /app/atlas, /app/operations, /app/marches, /app/community, /app/durabilite, /app/organisation, /app/initiatives, /app/pilotage, /app/administration | ✅ 14/14 |
| institution | /app/etat, /app/etat/rapport | ✅ 2/2 (1 défaut trouvé et corrigé, voir ci-dessous) |
| capitaine | /app/terrain | ✅ 1/1 (déjà vérifié au Lot 6, reconfirmé) |
| opérateur | /app/travail (OperatorTaskView) | ✅ 1/1 |
| mareyeur | /app/travail (BuyerTaskView) | ✅ 1/1 |
| transformateur | /app/travail (BuyerTaskView) | ✅ 1/1 |
| prestataire | /app/travail (ProviderTaskView) | ✅ 1/1 |

## Défaut trouvé et corrigé

**`/app/etat` (Espace État, mandat institution) — débordement horizontal réel de 84px (390 → 474px).**

- **Cause** : `src/app/app/etat/page.tsx`, section « Situations critiques à arbitrer ». Le groupe des deux boutons d'action (« Signaler une situation », « Voir toutes les situations ») portait `flex shrink-0 gap-2` — `shrink-0` empêchait ce groupe de se réduire ou de passer à la ligne indépendamment du conteneur parent (lui-même `flex-wrap`, mais cela ne suffit pas à faire passer à la ligne les *enfants* d'un sous-conteneur qui refuse explicitement de rétrécir).
- **Diagnostic** : le premier repérage visuel (bande défilante des territoires, `Marquee`/Magic UI) était un faux positif — `overflow: hidden` sur le conteneur du marquee le confirmait déjà correctement contenu (vérifié : aucun ancêtre avec overflow non contenu ne menait jusqu'à lui). Le vrai responsable a été isolé par un script qui exclut tout élément déjà contenu par un ancêtre `overflow: hidden/auto/scroll`, ne gardant que les débordements réellement non contenus.
- **Correction** : `flex shrink-0 gap-2` → `flex flex-wrap gap-2` — les deux boutons passent à la ligne sur petit écran au lieu de forcer le débordement. Aucun autre endroit du Produit ne portait ce motif (`grep` confirmé).
- **Vérifié** : re-sweep complet après correction — 0 débordement sur les 21 routes, capture avant/après conservée.

## Ce que cet audit ne couvre pas

- Un seul viewport mobile (390×844, iPhone 12/13 mini-ish) — pas de balayage sur toutes les tailles d'écran Android/iOS possibles. Le signal (scrollWidth vs clientWidth) est cependant le même quel que soit l'appareil : un débordement à 390px de large déborderait aussi à 360px, la marge de sécurité va dans le bon sens.
- Interactions tactiles fines (swipe, pincer-zoomer) : non testées, hors périmètre de cet audit (le spec maître §21 vise l'absence de rupture visuelle, pas un test d'ergonomie tactile complet).
- Rôles gestionnaire_organisation/partenaire : partagent les mêmes routes et composants que coordinateur (CoordinatorHub, `/app/initiatives`, etc.) déjà vérifiés — pas de compte de démonstration dédié à ce jour pour les re-tester isolément, mais aucun code spécifique à ces rôles n'existe qui échapperait à ce qui a été balayé.
