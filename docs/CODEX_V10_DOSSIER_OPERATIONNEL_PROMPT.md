# CODEX V10 - Dossier operationnel vivant

## Diagnostic

La V9 a ameliore l'ouverture et la logique. Le retour demo revele encore un probleme d'ergonomie cognitive : l'agent voit des statuts qui bougent, pas des dossiers qu'il gere.

Objectif V10 : faire de Mbambulaan un outil quotidien de gestion de dossiers operationnels, branche sur les canaux terrain, sans casser les acquis V8/V9.

## Principe produit

Un badge de statut est une information. Un dossier qu'on ouvre, annote, complete, exporte et cloture est un objet de travail.

Le dossier devient l'enveloppe commune au-dessus des objets metier existants : verification, signalement/incident, besoin-financement, rapport de zone, note institutionnelle.

## Contraintes strictes

- Pas de backend.
- Pas de vraie API WhatsApp.
- Pas de vrai appel telephonique integre.
- Pas de transmission externe inventee.
- Pas d'ERP lourd ni outil de ticketing generique.
- Conserver V8/V9 : machines d'etat, anti-repetition, confiance des donnees, Kayar demo, page d'ouverture, role selector.
- Ne pas supprimer Atlas, Filiere & Financement, Pilotage institutionnel.
- Travailler en cartes, dossiers, panneaux et microcopies claires, pas en tables denses.

## Etape 0 - Audit obligatoire

Inspecter avant modification :

- src/components/private-space/MinistryControlTower.tsx
- src/components/private-space/MinistryDailyExperience.tsx
- src/components/private-space/MinistryControlTowerParts.tsx
- src/components/private-space/MinistryOperationalRegisters.tsx
- src/components/private-space/MinistryV4Components.tsx
- src/components/private-space/MinistryValueWorkflows.tsx
- src/components/private-space/MinistryCredibility.tsx
- src/data/ministryControlTowerData.ts
- src/data/ministryValueJourneyData.ts

Localiser les composants : TodayView, ContextPanel, DataTrustBadge, RoleFrame, WhatsAppBridge, FundingRegister, DecisionRegister, ReportRegister, ReferentsPanel, MapCanvas.

## Priorite 1 - Enveloppe Dossier

Creer une couche DossierOperationnel pour presenter les objets existants comme des dossiers manipulables.

Champs requis :

- identifiant lisible : VER-2026-0142, INC-2026-0081, FIN-2026-0031, RAP-2026-0022, NOT-2026-0007 ;
- type : Verification, Incident, Financement, Rapport, Note ;
- objet lie : quai, pirogue, debarquement, besoin, zone ;
- statut de travail : Nouveau, A traiter, En attente, Bloque, Termine ;
- statut metier fin : conserver la machine d'etat V8 ;
- canal d'origine ;
- responsable actuel ;
- prochaine action ;
- notes ;
- pieces ;
- historique ;
- sortie finale.

Important : le statut de travail sert a trier la pile agent. Il ne remplace jamais les machines d'etat V8.

## Priorite 2 - Notes, pieces et historique

Dans le panneau de dossier / panneau de contexte existant, ajouter une lecture type dossier :

- Notes : notes horodatees, auteur, texte court, append-only mock ;
- Pieces : photo, message, compte rendu d'appel, document, preuve ;
- Historique du dossier : reprendre EvidenceTimeline, mais avec libelle dossier.

Ne pas creer une grosse structure parallele. Reutiliser le panneau V8 et enrichir son bloc historique.

## Priorite 3 - Canaux d'origine et de transit

Ajouter un badge Canal d'origine sur chaque dossier et dans l'historique.

Canaux :

- WhatsApp ;
- Telephone ;
- Poste de quai ;
- Agent territorial ;
- Formulaire ;
- Import ;
- Document.

Chaque dossier doit montrer : d'ou vient l'information, qui l'a prise en charge, et par quel canal elle a ete completee.

WhatsApp doit etre valorise comme canal terrain structure manuel. Telephone doit etre visible : appel recu, resume d'appel, rappel, piece manquante.

## Priorite 4 - Poste de quai

Ajouter l'entite Poste de quai, distincte du Referent.

Definition : presence institutionnelle ou point de contact officiel rattache a un quai. Il est au-dessus du referent communautaire en legitimite administrative, mais ne valide pas finalement.

Regles :

- poste = relais principal WhatsApp / telephone / clarification ;
- poste = executant possible de verification de premier niveau ;
- poste != validateur final ;
- validation reste regionale ;
- afficher Poste officiel dans le dossier du quai avant les referents.

A ajouter dans le repertoire acteurs ou dans les donnees referents existantes selon audit.

## Priorite 5 - Briefing du jour remplace Aujourd'hui

Renommer l'entree Aujourd'hui en Briefing du jour.

Transformer TodayView :

- ne plus montrer des cartes abstraites de recommandation ;
- afficher les 2 ou 3 dossiers les plus urgents ;
- afficher identifiant, type, objet lie, canal, statut de travail, prochaine action ;
- renommer Fait aujourd'hui en Dossiers clotures aujourd'hui ;
- les acces modules comptent des dossiers : dossiers a verifier, dossiers prets a transmettre, dossiers a arbitrer.

Le Briefing du jour doit etre l'entree de travail, pas une page decorative.

## Priorite 6 - Mes dossiers

Ajouter pour la Direction regionale une vue Mes dossiers ou une section visible depuis Briefing / Atlas.

Colonnes ou groupes :

- Nouveau ;
- A traiter ;
- En attente ;
- Bloque ;
- Termine.

Affichage en cartes compactes, pas en tableau ERP.

Filtres simples : type, canal, quai.

Un dossier en attente trop longtemps doit apparaitre Bloque avec action secondaire Relancer.

## Priorite 7 - Semantique des clics Atlas

Remplacer le libelle vague Voir le detail complet par des libelles contextuels :

- Quai -> Ouvrir le dossier du quai ;
- Pirogue -> Ouvrir la fiche pirogue ;
- Debarquement -> Ouvrir le dossier de debarquement ;
- Incident / Signalement -> Ouvrir le dossier incident ;
- Besoin -> Ouvrir le besoin financable ;
- Verification -> Ouvrir le dossier de verification.

Chaque type doit avoir une intention claire.

Quai : poste, referents, activite, alertes, dossiers actifs.
Pirogue : identite, cycle, declarations, derniers debarquements.
Debarquement : especes, volumes, ecarts, preuves.
Incident : criticite, origine, traitement, escalade.
Besoin : montant, beneficiaires, pieces, eligibilite.
Verification : demande, canal, constat, validation.

## Priorite 8 - Wording

Utiliser strictement :

- Dossier ;
- Fiche ;
- Notes ;
- Pieces ;
- Historique du dossier ;
- Canal d'origine ;
- Poste officiel ;
- Referent mandate ;
- Briefing du jour ;
- Mes dossiers ;
- Relancer ;
- Bloque depuis N jours.

Eviter : ticket, item, log, detail complet, workflow technique, API, synchronisation externe automatique.

## Priorite 9 - Design

Design : premium institutionnel senegalais maritime.

- Dossiers en cartes compactes ;
- icone dossier / classeur sobre ;
- badges canal neutres ;
- pas de couleurs vives par canal ;
- pas de table dense facon ERP ;
- garder la densite des pages de travail ;
- Briefing du jour plus concret, pas plus decoratif.

## Tests obligatoires

Lancer :

```bash
npm run typecheck
npm run build
```

Tests manuels :

1. /espace-prive/etat affiche Briefing du jour, pas Aujourd'hui.
2. Briefing affiche des dossiers urgents cliquables, pas des recommandations abstraites.
3. Kayar reste jouable : verification, WhatsApp, suivi, constat, validation, rapport.
4. Le dossier Kayar affiche identifiant, canal d'origine, poste ou referent, notes, pieces, historique.
5. Voir le detail complet n'apparait plus comme CTA principal.
6. Atlas distingue au moins quai et pirogue avec libelles differents.
7. Mes dossiers permet de voir Nouveau, A traiter, En attente, Bloque, Termine.
8. WhatsApp et Telephone apparaissent comme canaux possibles.
9. Poste de quai est distingue de Referent.

## Criteres d'acceptation

- L'agent a l'impression de gerer des dossiers, pas de suivre des statuts.
- Chaque dossier montre canal, responsable, notes, pieces, historique et prochaine action.
- Briefing du jour donne envie d'ouvrir des dossiers concrets.
- Atlas ouvre des objets metier differencies.
- Le systeme prouve qu'il fait mieux que WhatsApp + appels + Excel : il canalise, rattache, trace, produit une preuve et permet une sortie.
- Aucune fausse integration externe n'est revendiquee.

Documenter dans la PR les limites restantes et les resultats typecheck/build.