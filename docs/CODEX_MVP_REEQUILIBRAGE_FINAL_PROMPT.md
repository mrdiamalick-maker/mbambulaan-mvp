# Codex — Rééquilibrage final du MVP Ministère Mbàmbulaan

Tu travailles sur le repository `mrdiamalick-maker/mbambulaan-mvp`, branche existante `feature-atlas-quais-pivot`, PR #35.

Ce document est la source d’autorité de la prochaine exécution.

## 1. Mission

Rééquilibrer la console Ministère afin que Mbàmbulaan démontre simultanément :

1. une capacité de pilotage institutionnel ;
2. une capacité de supervision territoriale par les quais ;
3. une capacité d’écoute et de valorisation des communautés ;
4. une capacité de structuration de programmes et de mobilisation de financements ;
5. une capacité de traitement traçable grâce aux dossiers opérationnels.

La V14 a correctement renforcé Atlas, le dossier unique et le parcours Kayar, mais elle a trop transformé Mbàmbulaan en outil de gestion de dossiers. Cette passe doit restaurer la promesse communautaire et financière sans casser les acquis.

Il ne s’agit pas d’ajouter plusieurs produits. Il faut clarifier la hiérarchie entre les espaces de valeur et le moteur transversal de dossiers.

## 2. Doctrine produit non négociable

Mbàmbulaan n’est pas :

- un outil de ticketing ;
- un ERP ;
- un CRM bailleur ;
- une marketplace ;
- un tableau de bord SaaS générique ;
- une carte décorative ;
- une IA décisionnaire.

Mbàmbulaan est une infrastructure de coordination pour la pêche artisanale sénégalaise.

La promesse complète est :

> Voir la filière. Écouter le terrain. Transformer les besoins en programmes finançables. Décider avec des preuves.

Chaque écran doit répondre immédiatement à cinq questions :

1. Que se passe-t-il ?
2. Pourquoi est-ce important ?
3. Que faut-il regarder ?
4. Quelle action faut-il mener ?
5. Quel résultat sera obtenu ?

Une page doit avoir une vue dominante, une action principale et une hiérarchie claire.

## 3. Architecture finale de la console

La navigation métier visible contient exactement trois entrées :

1. **Pilotage**
2. **Atlas**
3. **Communautés & Programmes**

La console ouvre **Pilotage** par défaut.

**Dossiers** disparaît de la navigation principale et devient un moteur transversal accessible en permanence :

- bouton global dans l’en-tête : `Dossiers à traiter · N` ;
- ouverture d’une corbeille ou d’un espace superposé ;
- même dossier, même identifiant, mêmes notes, pièces et historique depuis Pilotage, Atlas et Communautés & Programmes ;
- fermeture du panneau sans perdre le contexte du module courant.

Ne pas créer de quatrième module principal.

## 4. Acquis à préserver strictement

Ne pas casser :

- le quai comme pivot territorial de l’Atlas ;
- la carte actuelle, sa lisibilité et ses filtres ;
- les fiches métier des quais ;
- le cycle opérationnel dans la fiche quai, pas comme couche géographique ;
- le dossier unique et son modèle TypeScript ;
- les notes, pièces, historique, responsable, canal et résultat attendu ;
- la machine d’état Kayar ;
- l’anti-répétition des actions ;
- les niveaux de confiance ;
- WhatsApp et téléphone explicitement manuels ;
- l’absence de backend ;
- l’absence d’API ;
- les routes actuelles ;
- la posture institutionnelle paramétrable après cadrage ;
- les tests et la compilation existants.

Le dossier Kayar `VER-2026-0142` reste identique depuis tous les points d’entrée.

## 5. Pilotage — situation nationale high-level

### Objectif

Donner au Ministère une sensation immédiate de maîtrise, de contrôle, de visibilité sur les besoins et de capacité d’action.

### Composition

Conserver une grande introduction institutionnelle, puis afficher six indicateurs maximum :

1. quais suivis ;
2. situations nécessitant une attention ;
3. besoins communautaires qualifiés ;
4. programmes actifs ;
5. financement restant à mobiliser ;
6. décisions à arbitrer.

Les débarquements et volumes restent importants mais doivent être présentés dans un graphique ou une section métier, pas nécessairement comme KPI d’ouverture.

### Visualisations utiles

Créer des composants sobres et directement annotés :

- comparaison des volumes par quai ;
- évolution ou répartition des situations en attention ;
- progression des besoins : signalés, qualifiés, programmés, financés ;
- financement couvert versus reste à mobiliser ;
- couverture territoriale des programmes ;
- une décision prioritaire reliée à ses preuves.

Éviter les graphiques décoratifs, les donuts multiples, les visualisations 3D et les cartes dupliquées.

### Sections attendues

- Situation nationale ;
- Action prioritaire ;
- Activité et couverture territoriale ;
- Communautés et programmes ;
- Financement et impact ;
- Décisions et documents récents ;
- confiance et fraîcheur des données.

Chaque section doit contenir une phrase métier, pas seulement un chiffre.

## 6. Atlas — contrôle territorial centré sur les quais

### Objectif

Conserver l’Atlas dégagé et puissant. Le quai reste le seul objet territorial principal.

### Carte

Ne pas ajouter de marqueurs communautaires, programmes ou financements sur la carte.

Conserver :

- quais ;
- lecture activité ;
- suivi en mer ;
- niveaux normal, vigilance, critique ;
- recherche et filtres simples ;
- ouverture de la fiche métier du quai.

### Fiche quai

La fiche doit présenter de façon high-level :

- synthèse ;
- activité du jour et débarquements ;
- pirogues et cycle ;
- espèces et volumes ;
- besoins communautaires ;
- programmes actifs ;
- dossiers et preuves ;
- point d’ancrage terrain et référents.

Éviter une multiplication excessive des onglets. Si nécessaire, regrouper la fin de fiche sous une rubrique cohérente comme `Besoins, programmes & dossiers`.

Dans la synthèse, afficher un résumé compact :

- `2 besoins remontés` ;
- `1 programme actif` ;
- `1 opportunité finançable`.

Ajouter un CTA contextuel :

- `Voir les besoins et programmes de ce quai` ;
- il ouvre Communautés & Programmes avec le quai présélectionné.

L’ouverture d’un dossier depuis la fiche doit utiliser le même panneau transversal.

## 7. Communautés & Programmes — nouveau troisième espace

Créer un composant dédié, par exemple :

`src/components/private-space/MinistryCommunityProgramsView.tsx`

### Objectif

Montrer que Mbàmbulaan transforme les besoins réels des communautés en programmes structurés, mesurables et finançables.

Le module ne doit pas ressembler à une grille de tickets ou à un CRM partenaires.

### Structure interne

Prévoir trois lectures ou onglets internes simples :

1. **Besoins remontés**
2. **Programmes & actions**
3. **Financements & partenaires**

Ce sont des vues internes, pas de nouveaux espaces de navigation globale.

### Vue Besoins remontés

Afficher :

- besoin ;
- territoire et quai ;
- acteurs concernés ;
- source et canal ;
- niveau de confiance ;
- urgence ;
- nombre de bénéficiaires ;
- niveau de qualification ;
- prochaine action.

La vue dominante peut être un pipeline de maturité :

`Signalé → Vérifié → Qualifié → Programme proposé → Finançable`

Éviter une simple collection de cartes.

### Vue Programmes & actions

Afficher et valoriser :

- projets communautaires ;
- formations ;
- campagnes de sensibilisation ;
- sécurité en mer ;
- qualité et hygiène ;
- femmes transformatrices ;
- insertion et métiers bleus pour les jeunes ;
- pêche durable ;
- traçabilité et pesée.

Pour chaque programme :

- objectif ;
- territoire ;
- public cible ;
- bénéficiaires ;
- période ;
- statut ;
- partenaire potentiel ;
- indicateur d’impact ;
- prochaine action.

Utiliser une chronologie, un portefeuille ou une liste documentaire high-level, pas un Kanban.

### Vue Financements & partenaires

Afficher :

- programme ou besoin ;
- budget estimatif ;
- montant couvert ;
- reste à financer ;
- maturité ;
- pièces disponibles ;
- partenaire potentiel ;
- compatibilité ;
- impact attendu ;
- statut de préparation ou transmission.

Aucune transmission réelle ne doit être simulée.

Les actions possibles sont :

- qualifier le besoin ;
- structurer le programme ;
- constituer le dossier de financement ;
- préparer une fiche partenaire ;
- consulter les preuves ;
- confirmer manuellement une transmission ;
- enregistrer une réponse partenaire.

Chaque action ouvre ou complète le même dossier transversal.

### Données à réutiliser

Réutiliser et normaliser les données existantes lorsqu’elles sont cohérentes :

- `communityNeeds` ;
- `communityProjects` ;
- `trainingPrograms` ;
- `partners` ;
- `fundingOpportunities` ;
- `impactProofs` ;
- les artefacts et dossiers existants.

Ne pas réactiver brutalement les anciens composants denses. Réutiliser les données et les fonctions pertinentes, mais construire une expérience adaptée à l’architecture finale.

Tous les chiffres restent explicitement simulés et doivent être cohérents entre les vues.

## 8. Deux parcours de démonstration

### Parcours A — Kayar, capacité opérationnelle

Conserver et tester :

`Signal → dossier → demande de vérification → WhatsApp manuel → retour terrain → constat → validation humaine → rapport → clôture`

Une action accomplie ne redevient jamais principale.

### Parcours B — Joal–Mbour, capacité communautaire et financière

Créer une démonstration cohérente à partir des données existantes :

`Besoin de chaîne de froid → communautés concernées → besoin qualifié → programme Joal–Mbour → bénéficiaires et impact → budget → partenaire potentiel → dossier de financement → document prêt à relire`

Le parcours doit rester générique dans le code, même si Joal–Mbour est le scénario de démonstration.

Le dossier de financement doit être accessible depuis Communautés & Programmes et depuis Pilotage.

## 9. Dossiers transversaux

Réutiliser `MinistryDossiersView` et `OperationalDossierPanel`, mais ne plus afficher Dossiers comme espace principal.

Créer une expérience de corbeille globale :

- bouton dans l’en-tête ;
- compteur calculé depuis les dossiers actifs ;
- filtres simples ;
- liste priorisée ;
- ouverture du document dossier ;
- fermeture et retour au module précédent.

Le panneau dossier doit rester premium et administratif :

- référence ;
- type ;
- objet ;
- canal ;
- responsable ;
- niveau de confiance ;
- pièces ;
- notes ;
- historique ;
- prochaine action ;
- résultat attendu ;
- sortie finale.

Il ne doit jamais masquer le fait que le produit apporte aussi supervision, communautés, programmes et financements.

## 10. IA responsable et désactivable

La console doit fonctionner intégralement sans IA.

Ajouter une préférence locale et explicite, par exemple :

`Assistance intelligente : désactivée / activée pour la démonstration`

Contraintes :

- désactivée par défaut ;
- activable depuis une zone de paramètres ou un contrôle discret ;
- état React local uniquement ;
- lorsqu’elle est désactivée, masquer proprement les blocs sans laisser de vide ;
- aucune action métier essentielle ne dépend de l’assistance ;
- aucune API réelle ;
- aucune donnée transmise ;
- conserver uniquement des fonctions locales déterministes ;
- chaque sortie affiche `Proposition à valider`, les sources et la validation humaine ;
- aucun automatisme de décision ou de transmission ;
- aucune détection ou accusation sensible.

Cas d’usage autorisés dans la démonstration :

- synthèse de dossier ;
- contrôle de complétude ;
- regroupement de besoins similaires ;
- projet de note d’arbitrage ;
- projet de fiche programme ;
- projet de fiche partenaire.

Ne pas créer un chatbot global dans la console.

L’assistant public fondé sur des contenus ouverts sera traité dans une PR distincte. La landing peut seulement évoquer une IA responsable et optionnelle, sans simuler une fonctionnalité publique qui n’existe pas encore.

## 11. Landing — restaurer la promesse complète

La landing doit rester concise, premium et publique.

Promesse recommandée :

> Voir la filière. Écouter le terrain. Transformer les besoins en programmes finançables. Décider avec des preuves.

Conserver six sections maximum :

1. hero et promesse ;
2. problème : informations dispersées et besoins peu structurés ;
3. trois capacités : Pilotage, Atlas, Communautés & Programmes ;
4. deux démonstrations : Kayar et Joal–Mbour ;
5. bénéfices Ministère : contrôle, temps, financements, impact, confiance ;
6. cadrage et CTA.

CTA principaux :

- `Demander un atelier de cadrage` ;
- `Voir la démonstration`.

Ne pas construire maintenant le futur espace public éditorial complet, les articles, les vidéos, le CMS ou les formulaires réels. Ce sera une PR séparée après stabilisation de la console.

## 12. Direction UX/UI high-level

Créer une expérience :

- premium institutionnelle sénégalaise ;
- maritime ;
- claire, plutôt lumineuse ;
- moderne sans effet gadget ;
- dense seulement lorsque la tâche le justifie ;
- accessible et responsive.

Principes :

- une vue dominante par écran ;
- une action principale par groupe ;
- peu de badges ;
- badges réservés à confiance, urgence et maturité ;
- tableaux sobres sans quadrillage excessif ;
- graphiques directement annotés ;
- icônes métier cohérentes ;
- panneaux et documents avec lignes fines ;
- espaces de respiration ;
- pas d’empilement systématique de cartes ;
- pas de Kanban ;
- pas de template dashboard SaaS générique ;
- pas de microtexte inférieur à une taille lisible ;
- pas de scroll horizontal sur les écrans desktop et mobile.

Chaque bouton doit annoncer un résultat concret :

- `Ouvrir la priorité` ;
- `Voir les besoins de ce quai` ;
- `Structurer le programme` ;
- `Constituer le dossier de financement` ;
- `Consulter les preuves`.

## 13. Architecture de code recommandée

Adapter selon l’état réel du repository.

Fichiers probables :

- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryPilotageView.tsx`
- `src/components/private-space/MinistryQuayAtlas.tsx`
- `src/components/private-space/QuayProfileSheet.tsx`
- `src/components/private-space/MinistryDossiersView.tsx`
- `src/components/private-space/MinistryDossierExperience.tsx`
- nouveau `src/components/private-space/MinistryCommunityProgramsView.tsx`
- données existantes dans `src/data/`
- dossier et assistance dans `src/lib/`
- `src/components/landing/InstitutionalLanding.tsx`
- `src/app/globals.css`

Préférer de petits composants dédiés aux visualisations et sections, mais éviter la fragmentation artificielle.

Ne pas ajouter de dépendance lourde. Utiliser React, TypeScript, Tailwind et SVG/CSS existants.

Supprimer uniquement les anciens points d’entrée devenus réellement inutilisés après vérification des références. Ne pas supprimer des fichiers par intuition.

## 14. Tests manuels obligatoires

### Navigation

- la console ouvre Pilotage ;
- navigation globale : Pilotage, Atlas, Communautés & Programmes ;
- aucun onglet Dossiers global ;
- bouton Dossiers à traiter visible et fonctionnel ;
- ouverture et fermeture de la corbeille sans perdre le module courant.

### Pilotage

- les six KPI couvrent territoire, situations, besoins, programmes, financement et décisions ;
- les graphiques sont lisibles ;
- Kayar ouvre le bon dossier ;
- Joal–Mbour ouvre le bon besoin ou dossier de financement ;
- aucune carte n’est dupliquée.

### Atlas

- carte inchangée dans sa logique centrale ;
- clic Kayar ouvre la fiche Kayar ;
- activité, pirogues, espèces et cycle restent fonctionnels ;
- résumé besoins/programmes visible ;
- CTA vers Communautés & Programmes présélectionne Kayar ;
- même dossier Kayar accessible.

### Communautés & Programmes

- trois lectures internes fonctionnelles ;
- besoins, programmes, formations et partenaires visibles ;
- Joal–Mbour est compréhensible en moins de 15 secondes ;
- budget, bénéficiaires, reste à financer et preuves cohérents ;
- action de constitution ouvre le même dossier ;
- aucune fausse transmission.

### Dossiers

- Kayar conserve sa machine d’état complète ;
- une action terminée ne redevient pas principale ;
- notes, pièces et historique restent visibles ;
- dossier de financement Joal–Mbour accessible depuis plusieurs modules avec un identifiant unique.

### IA

- assistance désactivée par défaut ;
- activation affiche les blocs locaux ;
- désactivation ne casse aucun parcours ;
- chaque résultat porte `Proposition à valider` et des sources ;
- aucune API ou requête réseau IA.

### Responsive et accessibilité

- aucun chevauchement ;
- aucun texte tronqué ;
- aucun scroll horizontal involontaire ;
- boutons et contrôles accessibles au clavier ;
- desktop, laptop et mobile acceptables.

## 15. Validations techniques obligatoires

Exécuter :

```bash
npm run typecheck
npm run build
git diff --check
```

Corriger toutes les erreurs avant de pousser.

Vérifier les routes :

- `/`
- `/espace-prive`
- `/espace-prive/etat`

## 16. Ce qu’il ne faut pas faire

- ne pas créer une V16 ou une nouvelle architecture ;
- ne pas créer une nouvelle branche ;
- ne pas merger la PR ;
- ne pas ajouter de backend ;
- ne pas ajouter de vraie IA ;
- ne pas intégrer de vraie API WhatsApp ;
- ne pas construire le futur espace public éditorial ;
- ne pas créer de marketplace ;
- ne pas créer de CRM partenaires ;
- ne pas multiplier les rôles institutionnels ;
- ne pas recréer un portail partenaire autonome ;
- ne pas casser Atlas ou Kayar ;
- ne pas transformer chaque donnée en carte ou badge ;
- ne pas remplacer la hiérarchie par une accumulation de fonctionnalités.

## 17. Compte rendu attendu dans la PR

À la fin, mettre à jour la PR avec :

- architecture avant/après ;
- fichiers créés et modifiés ;
- comportements préservés ;
- nouveau module Communautés & Programmes ;
- fonctionnement des Dossiers transversaux ;
- équilibre du Pilotage ;
- liens Atlas vers les besoins et programmes ;
- comportement de l’assistance activée/désactivée ;
- résultats typecheck, build et diff-check ;
- limites restantes ;
- points précis à vérifier visuellement.

## 18. Critère final

La passe est réussie si un décideur du Ministère comprend en moins de 15 secondes que Mbàmbulaan lui apporte :

- davantage de contrôle territorial ;
- moins de dispersion de l’information ;
- une écoute structurée des communautés ;
- des programmes finançables ;
- des partenaires mobilisables ;
- des décisions plus rapides ;
- des preuves et résultats traçables.

Le dossier est le moteur. L’Atlas donne la maîtrise territoriale. Les communautés donnent le sens. Les programmes et financements créent la valeur. Le Pilotage permet au Ministère de décider.
