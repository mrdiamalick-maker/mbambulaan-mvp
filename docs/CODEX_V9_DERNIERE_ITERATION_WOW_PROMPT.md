# CODEX V9 - Derniere iteration Wahou avant stabilisation

## Diagnostic

La V8 a resolu la logique, mais pas encore le desir. Mbambulaan est coherent une fois que l'utilisateur est dedans, mais il ne donne pas encore assez envie d'etre ouvert chaque matin.

V9 ne doit pas ajouter un grand module ni un graphique gadget. Elle doit transformer la perception du produit en creant une entree quotidienne claire, rolee, vivante et utile.

Phrase directrice :

> Mbambulaan doit dire en 10 secondes : voici la situation, voici ce qui attend, voici ce qui a ete fait, voici l'action prioritaire, et voici pourquoi vous pouvez faire confiance.

## Contraintes strictes

- Pas de backend.
- Pas de vraie API WhatsApp.
- Pas de nouveau grand module.
- Ne pas transformer Mbambulaan en ERP, BI, CRM ou simple dashboard.
- Conserver les acquis V8 : machines d'etat, anti-repetition, panneau guide, scenario Kayar, WhatsApp manuel et explicite.
- Ne pas casser les routes `/`, `/espace-prive`, `/espace-prive/etat`.
- Rester institutionnel, maritime, senegalais, sobre et premium.
- Penser agent non technique, direction regionale, Ministere et bailleur.

## Etape 0 - Audit obligatoire

Avant modification, inspecter :

- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryOperationalRegisters.tsx`
- `src/components/private-space/MinistryV4Components.tsx`
- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`

Identifier ou creer au bon endroit : `TodayView`, `RegisterSummaryBanner`, `CoordinationBanner`, `ImpactDemonstrated`, `RisksPanel`.

## Priorite 1 - Creer la page Aujourd'hui

Créer une vraie page d'ouverture dans `/espace-prive/etat`, avant le choix d'un espace.

Elle doit remplacer l'arrivee directe sur Atlas.

Structure attendue :

1. Bandeau de situation globale : exemple `186 pirogues suivies · 12 quais actifs · 3 zones en vigilance`.
2. Bloc principal `A traiter maintenant` : 1 ou 2 actions prioritaires seulement, sous forme de grandes cartes avec CTA clair.
3. Bloc `Fait aujourd'hui` : 3 ou 4 derniers evenements termines, avec heure et auteur/fonction si disponible.
4. Colonne laterale : acces rapides vers Atlas, Filiere & Financement, Pilotage institutionnel, avec mini-compteurs.
5. Message de confiance : donnees de demonstration, confiance visible, transmissions manuelles non simulees.

La page doit repondre sans clic a :

- ce que Mbambulaan observe ;
- ce qui demande attention ;
- ce qui a deja ete fait ;
- ce qu'il faut faire maintenant ;
- pourquoi l'outil sert tous les jours.

## Priorite 2 - Transformer Vue actuelle en vrai mode dynamique

Le selecteur `Vue actuelle` reste, mais doit changer reellement l'experience.

Profils :

- Ministere : TodayView priorise arbitrages, notes, financements, risques, syntheses. Moins de details terrain.
- Direction regionale : TodayView priorise verifications, signalements, besoins a qualifier, WhatsApp terrain, rapports de zone.
- Partenaire / Bailleur : TodayView priorise dossiers finançables, preuves d'impact, montants, statuts de transmission. Aucune vue terrain brute.

Le profil doit influencer :

- les cartes `A traiter maintenant` ;
- les mini-compteurs des modules ;
- l'ordre ou la mise en avant des espaces ;
- certains titres et microcopies ;
- le niveau de detail visible.

Acceptance : changer de profil doit produire une difference visible et immediate sur TodayView, pas seulement filtrer une table plus bas.

## Priorite 3 - Registres vivants

Creer `RegisterSummaryBanner` et l'ajouter en tete des registres existants :

- financement ;
- notes & decisions ;
- WhatsApp / remontees terrain ;
- rapports de zone si pertinent.

Structure fixe :

- `Ce qui vient d'etre fait` ;
- `Ce qui attend une action` ;
- `Ce qui est pret a transmettre` ;
- `Ce qui est bloque` uniquement si blocage reel, jamais bloc vide.

Objectif : les registres ne doivent plus ressembler uniquement a des tables administratives. Ils doivent raconter ce qui bouge.

## Priorite 4 - Atlas : bandeau de coordination

Ajouter un `CoordinationBanner` sous la situation Atlas.

Contenu :

- 2 ou 3 zones a traiter, cliquables ;
- une action prioritaire du jour ;
- un fil de coordination compact avec 3 ou 4 evenements significatifs ;
- badges de confiance visibles.

Ne pas casser le panneau V8 de selection. Le scenario Kayar doit rester rejouable de bout en bout.

## Priorite 5 - Filiere & Financement : Impact demontre

Ajouter un bloc `Impact demontre` juste apres le bandeau de valeur globale, avant le detail des besoins.

Contenu :

- 2 ou 3 chiffres d'impact mockes mais coherents ;
- lien vers preuves ou artefacts existants ;
- mise en avant du reste a financer, dossiers prets, beneficiaires, valeur creee.

Objectif : vendre la filiere au premier regard a un Ministere ou bailleur, avant le detail operationnel.

## Priorite 6 - Pilotage : bloc Risques

Ajouter un bloc `Risques` distinct des decisions.

Un risque n'est pas une decision. C'est une tendance a surveiller, formulee en une phrase : baisse de volume, retard de verification, concentration de besoins, blocage de financement.

Chaque risque doit etre relie a une source ou un module.

## Priorite 7 - Badges de confiance traçables

Rendre `DataTrustBadge` cliquable ou actionnable partout ou possible.

Comportement accepte : scroll vers preuve, historique, registre, ou ouverture d'un detail explicatif si aucune source precise n'existe.

Ne pas pretendre a une source serveur inexistante.

## Wording et design

Remplacer les formulations trop techniques cote utilisateur :

- `Pont terrain WhatsApp structure` -> `Remontees WhatsApp` ou `Message WhatsApp a envoyer`.
- `Registre` peut rester pour Ministere, mais preferer `Suivi` quand l'usage est quotidien.
- Conserver `Brute`, `Declaree`, `Verifiee`, `Consolidee`, avec aide courte.

Direction graphique : premium institutionnel senegalais maritime. Pas trop sombre. Pas template SaaS. Forte hierarchie visuelle. Pages de travail denses, TodayView plus respirante.

## Tests fonctionnels manuels

Tester :

1. Ouvrir `/espace-prive/etat` : TodayView doit apparaitre avant Atlas.
2. Changer `Vue actuelle` : Ministere, Direction regionale, Partenaire/Bailleur doivent afficher des priorites differentes.
3. Depuis TodayView, cliquer une action prioritaire et arriver au bon module ou workflow.
4. Atlas / Kayar : demander verification, preparer message WhatsApp, suivre verification, deposer constat, valider, generer rapport, relire rapport.
5. Les actions deja faites ne redeviennent jamais action principale.
6. Registres : chaque registre affiche son resume narratif avant les lignes detaillees.
7. Filiere : `Impact demontre` est visible avant le detail des besoins.
8. Pilotage : `Risques` est visible et distinct des decisions.
9. Les badges de confiance sont actionnables ou expliquent leur source.

## Commandes obligatoires

Lancer :

```bash
npm run typecheck
npm run build
```

## Criteres d'acceptation

- En 10 secondes, l'utilisateur comprend la situation, ce qui attend, ce qui a ete fait et l'action prioritaire.
- `Vue actuelle` change visiblement l'experience.
- Mbambulaan ressemble davantage a un outil quotidien de coordination qu'a une console a comprendre.
- Le scenario Kayar V8 fonctionne toujours.
- Pas de fausse API, pas de fausse transmission, pas de backend invente.
- CI verte.

## Interdits

- Ne pas cacher les limites de simulation.
- Ne pas creer un portail separe par profil.
- Ne pas ajouter un nouveau module lourd.
- Ne pas casser la logique V8.
- Ne pas coder uniquement pour Kayar : Kayar reste scenario de demo, les machines d'etat restent generiques.
