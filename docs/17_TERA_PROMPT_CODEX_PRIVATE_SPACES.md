# Tera prompt Codex - espaces prives Mbambulaan

## Mission

Transformer la PR 26 en produit vendable, pas seulement en demo.

Branche: `rebuild-premium-template`.
PR: `#26`.
Statut: rester en draft.

Le CEO doit pouvoir presenter la version a son associe pour expliquer la vision, le produit, les parcours, la valeur et le potentiel business.

## Probleme actuel a corriger

L'espace prive ne doit pas etre un espace unique ou on clique sur des menus ou sur un switch de roles pour tout voir.

Chaque partie prenante doit sentir qu'elle est dans son propre espace prive.

Chaque espace doit avoir ses propres priorites, modules, donnees, actions, vocabulaire, workflows et tableaux.

## Inspiration visuelle

S'inspirer de TailAdmin pour la qualite de structure: sidebar, topbar, cards KPI, tables, charts, panels, forms, layout dashboard, dark/light premium, densite B2B.

Ne pas copier un template generique. Adapter a Mbambulaan.

## Produit

Mbambulaan n'est pas:

- une marketplace;
- un dashboard generique;
- une landing longue;
- une app pecheur-first complete;
- une serie de pages sans parcours.

Mbambulaan est une infrastructure numerique de coordination pour la peche artisanale senegalaise.

## Architecture attendue

Garder:

- `/` landing premium courte;
- `/demo` sas de qualification par role;
- `/demo/<role>` apercu contextualise;
- `/demande-demo`;
- `/devis`.

Ajouter de preference:

- `/espace-prive/etat`;
- `/espace-prive/ong`;
- `/espace-prive/collectivite`;
- `/espace-prive/pecheur`;
- `/espace-prive/mareyeur`;
- `/espace-prive/exportateur`;
- `/espace-prive/organisation`;
- `/espace-prive/investisseur`.

La route `/espace-prive` doit devenir un portail qui oriente vers les espaces prives, pas un seul workspace ou l'on voit tout.

## Regle UX principale

Une organisation qui paie doit avoir l'impression d'acheter son espace operationnel.

Donc chaque espace doit changer fortement:

- titre;
- sidebar;
- modules;
- KPIs;
- actions;
- tableaux;
- donnees;
- workflows;
- rapports;
- niveau de complexite;
- vocabulaire metier.

## Espaces a construire

### Etat / Ministere

Ambiance: cockpit institutionnel.

But: arbitrer, prioriser, coordonner, rendre compte.

Modules: carte des territoires, tensions, priorites, programmes, financements, notes ministerielles, rapports consolides.

Actions fonctionnelles simulees: prioriser un territoire, ouvrir une note, changer statut d'une alerte, generer une synthese.

### ONG / Programme

Ambiance: pilotage programme et reporting bailleur.

But: suivre actions, beneficiaires, preuves, risques et reporting.

Modules: portefeuille d'actions, beneficiaires, indicateurs, preuves terrain, risques, rapport bailleur.

Actions simulees: ajouter preuve locale, marquer action realisee, filtrer par territoire, generer rapport.

### Collectivite

Ambiance: espace communal concret.

But: suivre les urgences locales et coordonner les acteurs du quai.

Modules: commune, quais, actions locales, demandes terrain, partenaires, note mairie.

Actions simulees: affecter action, prioriser quai, demander appui partenaire, generer note communale.

### Pecheur

Ambiance: parcours assiste mobile-first.

But: signaler, suivre, comprendre le statut, recevoir un retour.

Ne pas faire un dashboard complexe.

Modules: mes signalements, mes demandes, statut simple, relais quai, retours recus.

Actions simulees: creer signalement, suivre statut, voir relais, afficher prochaine etape.

### Mareyeur

Ambiance: flux, qualite, logistique.

But: organiser les volumes, anticiper les risques, securiser retraits.

Modules: lots, qualite, risques de perte, retraits, froid, transport, coordination.

Actions simulees: qualifier un lot, organiser retrait, demander froid, signaler risque.

Ne pas faire une marketplace.

### Exportateur / Entreprise

Ambiance: supply qualifie, preuve, risque.

But: qualifier des opportunites non publiques et preparer une decision d'achat.

Modules: pipeline supply, opportunites qualifiees, score confiance, preuves, risques qualite, conditions logistiques.

Actions simulees: demander preuve, qualifier opportunite, suivre risque, preparer decision.

Ne pas creer un catalogue public.

### Organisation professionnelle

Ambiance: espace collectif et representation.

But: structurer membres, demandes collectives, preuves et plaidoyer.

Modules: registre membres, demandes collectives, dossiers partenaires, preuves, plaidoyer, priorites bureau.

Actions simulees: ajouter membre, classer demande, generer note partenaire, suivre dossier collectif.

### Investisseur / Associe

Ambiance: executive room / investment memo.

But: comprendre vision, business model, segments payeurs, traction, risques, roadmap.

Modules: these infrastructure, segments payeurs, offres, revenus simulables, pipeline partenaires, risques, roadmap, data room.

Actions simulees: ouvrir data room, filtrer segments payeurs, voir potentiel revenus, lire risques, voir roadmap.

Cet espace doit aider l'associe a comprendre pourquoi Mbambulaan peut devenir une entreprise.

## Fonctionnalites qui doivent fonctionner

Pas de boutons morts importants.

Si pas de backend, simuler cote client:

- filtres;
- changement de statut;
- selection de territoire;
- drawer ou detail panel;
- ajout d'une note temporaire;
- marquer une action prioritaire;
- generation d'une synthese simulee;
- confirmation visuelle;
- navigation interne de chaque espace;
- etat conserve pendant la session.

Si une action n'est pas connectee, afficher: `Simulation MVP - action non connectee au backend`.

## Donnees a enrichir

Enrichir les mocks avec:

- territoires;
- acteurs;
- signaux;
- lots;
- demandes;
- opportunites qualifiees;
- programmes;
- preuves;
- rapports;
- actions;
- membres;
- financements;
- risques;
- segments payeurs;
- offres;
- roadmap;
- permissions.

## Composants a creer ou ameliorer

- `PrivateSpaceShell`;
- `PrivateSidebar`;
- `PrivateTopbar`;
- `RoleHome`;
- `RoleKpiGrid`;
- `ActionBoard`;
- `TerritoryMapPanel`;
- `SignalFeed`;
- `EvidencePanel`;
- `ReportBuilderPreview`;
- `InteractiveDataTable`;
- `StatusStepper`;
- `PriorityQueue`;
- `PartnerPipeline`;
- `SimulationNotice`;
- `MobileAssistedFlow`.

Les composants peuvent etre reutilisables, mais l'experience finale ne doit pas sembler identique entre profils.

## Parcours de presentation associe

Le produit doit permettre ce parcours:

1. `/` - promesse en 30 secondes.
2. `/demo` - montrer les parties prenantes.
3. `/demo/etat` - montrer coordination institutionnelle.
4. `/demo/mareyeur` ou `/demo/exportateur` - montrer valeur flux et economie.
5. `/espace-prive/investisseur` - montrer business model et ambition.
6. `/espace-prive/ong` ou `/espace-prive/collectivite` - montrer espaces payeurs differencies.
7. Conclusion: Mbambulaan n'est pas un site, c'est une infrastructure de coordination vendable.

## Critere CEO

A la fin, le CEO doit pouvoir dire:

Je peux montrer cette version a mon associe et il comprendra la vision, le produit, les parcours, la valeur et pourquoi Mbambulaan peut devenir une entreprise.

## Validation

Executer:

```bash
npm run typecheck
npm run build
```

Signaler clairement les resultats.

## Sortie attendue

- PR 26 enrichie;
- espaces prives differencies;
- interactions simulees fonctionnelles;
- routes principales testables;
- build OK;
- PR toujours en draft;
- resume clair de ce qui a ete livre et de ce qui reste a faire.
