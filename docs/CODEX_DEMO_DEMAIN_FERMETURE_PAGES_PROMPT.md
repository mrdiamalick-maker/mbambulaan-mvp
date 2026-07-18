# Codex — fermeture finale des pages pour la démonstration

## Contexte

Tu travailles sur `mrdiamalick-maker/mbambulaan-mvp`, branche `feature-atlas-quais-pivot`, PR #35.

Le rééquilibrage final de la console est déjà livré et validé :

- navigation : **Pilotage / Atlas / Communautés & Programmes** ;
- **Dossiers à traiter** comme moteur transversal ;
- Atlas centré sur les quais ;
- parcours Kayar opérationnel ;
- parcours Joal–Mbour communautaire et financier ;
- assistance locale facultative et désactivée par défaut ;
- aucun backend, aucune API, aucune transmission réelle.

La CI du commit `47d356f5ef6633d3d7194cf9886bf7539e1f1c65` est verte.

Cette passe est le **dernier lot avant la démonstration**. Elle ne doit pas refaire la console ni modifier ses machines d’état. Elle doit uniquement fermer les pages publiques et les incohérences visibles autour de la nouvelle architecture.

## Diagnostic vérifié

Les éléments suivants existent déjà :

- `/` : landing institutionnelle ;
- `/demande-demo` : ancienne route technique du formulaire local, à conserver seulement comme redirection ;
- `/espace-prive` : accès institutionnel ;
- `/espace-prive/etat` : console avec les trois modules finaux ;
- les composants Pilotage, Atlas et Communautés & Programmes ;
- les parcours Kayar et Joal–Mbour.

Les manques ou incohérences à traiter :

1. `/espace-prive` présente encore l’ancien vocabulaire « Filière & Financement » au lieu de « Communautés & Programmes ».
2. La route publique porte encore le nom technique `/demande-demo`, trop centré sur la démonstration alors qu’elle doit accueillir ateliers, partenariats, financements et collaborations.
3. Le hub public éditorial ouvert évoqué dans l’architecture n’existe pas encore.
4. La landing ne permet pas d’accéder clairement à un espace public de découverte, d’initiatives et de collaboration.
5. Le bouton du formulaire public prépare une demande, mais l’expérience doit rendre explicitement visible qu’aucune donnée n’est envoyée.

## Objectif

Livrer deux univers clairement séparés : un site public accessible à tous, et une console réservée au Ministère. Le site public doit être cohérent et démontrable demain, sans diluer le cœur Ministère :

1. **Landing** — promettre et orienter.
2. **Découvrir Mbàmbulaan** — vulgariser la pêche artisanale, montrer initiatives, ressources et possibilités de collaboration.
3. **Contact public** — permettre à tout visiteur de préciser simplement l’objet de sa demande sans simuler un envoi.
4. **Accès Ministère** — présenter exactement la même architecture que la console.
5. **Console** — rester intacte sur le fond.

## Architecture impérative

Il n’existe que deux univers :

- **Site public accessible à tous** : `/`, `/decouvrir`, `/contact` ;
- **Console Ministère** : `/espace-prive`, puis `/espace-prive/etat`.

`/decouvrir` et `/contact` sont des pages du site public, jamais des espaces ou produits séparés.

## Périmètre impératif

### 1. Aligner la page `/espace-prive`

Modifier `src/app/espace-prive/page.tsx`.

Remplacer les trois promesses visibles par :

- **Pilotage** — Lire la situation nationale, prioriser et préparer les décisions.
- **Atlas** — Superviser les quais, l’activité, les pirogues et les situations territoriales.
- **Communautés & Programmes** — Transformer les besoins remontés en programmes, financements et partenariats.

Conserver la connexion simulée et le CTA vers `/espace-prive/etat`.

Ne pas réintroduire un sélecteur de rôle complexe. Ne pas promettre d’authentification réelle.

### 2. Créer un hub public unique `/decouvrir`

Créer une page publique high-level, éditoriale et respirante. Une seule route suffit pour le MVP ; ne crée pas une arborescence de blog complète.

La page doit contenir au maximum cinq sections :

1. **Hero**
   - titre : « Comprendre la pêche artisanale. Faire émerger les initiatives qui comptent. »
   - expliquer que cet espace public valorise les communautés, les métiers, les territoires et les programmes ;
   - CTA : « Découvrir les initiatives » et « Proposer une collaboration ».

2. **Comprendre la filière**
   - trois contenus éditoriaux de démonstration clairement étiquetés :
     - sécurité et prévention en mer ;
     - chaîne de froid et réduction des pertes ;
     - femmes transformatrices et valeur locale ;
   - format magazine premium, pas trois cartes SaaS identiques ;
   - indiquer « contenu de démonstration » si nécessaire.

3. **Vidéos et ressources**
   - deux ou trois aperçus visuels statiques, sans intégrer de service vidéo externe ;
   - sujets : métier d’un poste/relais local, débarquement, transformation ;
   - chaque aperçu doit afficher durée, sujet et type de ressource ;
   - aucun lien cassé.

4. **Initiatives et programmes**
   - reprendre les thèmes existants : sécurité en mer, sensibilisation, formation, chaîne de froid, femmes transformatrices, jeunes et pêche durable ;
   - montrer territoire, bénéficiaires, résultat attendu et partenaire potentiel ;
   - relier élégamment vers `/contact`.

5. **Nous contacter**
   - formulaire public unique avec quatre objets possibles : atelier Ministère, partenariat/bailleur, programme ou financement, autre demande ;
   - CTA unique vers `/contact`.

Réutiliser les tokens et le langage visuel de `InstitutionalLanding.tsx` : bleu marine, océan, sable, fond clair, bordures fines, boutons rectangulaires sobres. Ne pas utiliser l’ancien template cyan arrondi.

### 3. Assistance publique — préfiguration facultative

Dans `/decouvrir`, ajouter un bloc secondaire et repliable :

**Explorer les ressources avec l’assistance Mbàmbulaan**

Contraintes :

- fermé ou discret par défaut ;
- seulement trois questions prédéfinies ;
- réponses locales, déterministes et courtes ;
- sources locales visibles ;
- mention « Préfiguration locale · aucune donnée transmise » ;
- aucune API, aucun chatbot libre, aucun contenu opérationnel ou sensible ;
- ce bloc ne doit jamais dominer la page.

Questions possibles :

- Pourquoi la chaîne de froid est-elle importante ?
- Comment un besoin communautaire devient-il un programme ?
- Quel rôle jouent les femmes transformatrices ?

### 4. Aligner la landing

Modifier `src/components/landing/InstitutionalLanding.tsx` sans la reconstruire.

Ajouter une navigation publique simple :

- Découvrir ;
- Voir la démonstration ;
- Nous contacter ;
- Accès Ministère.

Les liens doivent pointer respectivement vers :

- `/decouvrir` ;
- `/espace-prive/etat` ;
- `/contact` ;
- `/espace-prive`.

Sur mobile, garder une navigation compacte sans débordement.

Ne pas augmenter le nombre actuel de grandes sections de la landing.

### 5. Créer la page publique `/contact` et conserver la compatibilité

Créer `src/app/contact/page.tsx` comme simple page fonctionnelle du site public, et non comme un troisième espace produit. La route historique `/demande-demo` ne doit plus être promue dans l’interface : la conserver comme redirection Next.js vers `/contact` afin de ne casser aucun lien existant.

La page `/contact` doit couvrir quatre objets de demande :

- atelier Ministère ;
- partenariat ou bailleur ;
- programme / financement ;
- collaboration générale.

Conserver une expérience locale et honnête :

- aucun envoi réseau ;
- aucun message « demande envoyée » ;
- au clic, afficher un récapitulatif local clairement intitulé **Demande préparée localement** ;
- mentionner qu’un canal officiel sera confirmé pendant le cadrage ;
- permettre de modifier les informations ;
- ne pas inventer d’adresse e-mail.

Réutiliser le design institutionnel de la landing. Éviter les gros arrondis, pills, ombres SaaS et anciennes classes cyan génériques. Si modifier `PremiumComponents.tsx` risque d’altérer d’autres routes, créer un petit composant dédié à cette page.

### 6. Ne pas toucher au cœur de la console

Sauf correction de libellé évidente, ne pas modifier :

- `MinistryControlTower.tsx` ;
- `MinistryQuayAtlas.tsx` ;
- `QuayProfileSheet.tsx` ;
- `MinistryPilotageView.tsx` ;
- `MinistryCommunityProgramsView.tsx` ;
- `MinistryDossierExperience.tsx` ;
- les données et machines d’état ;
- les parcours Kayar et Joal–Mbour.

Aucune nouvelle dépendance.

## Fichiers probables

- `src/app/espace-prive/page.tsx`
- `src/app/contact/page.tsx` — nouvelle page publique
- `src/app/demande-demo/page.tsx` — redirection de compatibilité vers `/contact`
- `src/app/decouvrir/page.tsx` — nouveau
- `src/components/landing/InstitutionalLanding.tsx`
- éventuellement un seul composant client dédié au formulaire public
- `src/app/globals.css` uniquement si les tokens existants ne suffisent pas

## Critères d’acceptation pour la démo

En ouvrant `/`, un partenaire doit comprendre en moins de 15 secondes :

- Mbàmbulaan donne au Ministère une capacité de maîtrise et de décision ;
- Mbàmbulaan valorise les communautés et transforme leurs besoins en programmes finançables ;
- l’Atlas, les dossiers et les preuves restent dans la console institutionnelle ;
- l’espace public partage connaissances, initiatives et possibilités de collaboration.

Le site public forme un seul univers accessible à tous. `/contact` est une fonction de ce site, pas un espace distinct ; `/demande-demo` n’est qu’un alias historique :

`/ → /decouvrir → /contact`, puis accès séparé à la console via `/espace-prive → /espace-prive/etat`

Le parcours console existant doit rester fonctionnel :

- Pilotage ;
- Atlas ;
- Communautés & Programmes ;
- Dossiers à traiter ;
- Kayar ;
- Joal–Mbour ;
- assistance désactivable.

## Validation obligatoire

Exécuter :

```bash
npm run typecheck
npm run build
git diff --check
```

Vérifier les routes :

- `/`
- `/decouvrir`
- `/contact`
- `/demande-demo` — redirection vers `/contact`
- `/espace-prive`
- `/espace-prive/etat`

Faire une vérification responsive au minimum aux largeurs 1440, 1280, 768 et 390 px si l’environnement le permet.

## Interdictions

- pas de nouvelle refonte de la console ;
- pas de backend ;
- pas d’API ;
- pas de véritable IA ;
- pas de CMS ;
- pas de faux formulaire envoyé ;
- pas de blog complet ;
- pas de marketplace ;
- pas de nouveaux rôles institutionnels ;
- pas de nouvelle branche ;
- ne pas merger la PR.

## Restitution dans la PR

Mettre à jour la PR #35 avec :

- pages créées et pages alignées ;
- fichiers modifiés ;
- résultat des validations ;
- parcours public vérifié ;
- confirmation explicite que le cœur de la console n’a pas été modifié ;
- limites restantes.

Cette passe doit fermer la démonstration, pas ouvrir un nouveau cycle produit.
