# CODEX V5 INFRASTRUCTURE CREDIBLE PROMPT - Mbambulaan

## Decision

V4 made Mbambulaan visually and functionally demonstrable. V5 must make it operationally credible.

The biggest product risk is no longer UI polish. The biggest risk is that Mbambulaan currently suggests live operational data without clearly showing the operational model that produces, validates and consolidates that data.

V5 must introduce a credibility layer across the product:

- who produces each data point;
- through which channel;
- who validates it;
- what its trust level is;
- what workflow it belongs to;
- what evidence was produced;
- where history is visible;
- which actor is responsible for the next step.

Do not add generic features. Do not overbuild. Do not break V4.

Core product truth:

> Mbambulaan is not a real-time dashboard. It is a coordination infrastructure that progressively transforms field signals into declared, verified and consolidated information for decisions, financing and proof.

---

## Step 0 - Audit before editing

Inspect:

- `src/app/page.tsx`
- `src/app/espace-prive/page.tsx`
- `src/app/espace-prive/etat/page.tsx` if present
- `src/components/landing/InstitutionalLanding.tsx`
- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryV4Components.tsx`
- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/components/private-space/InstitutionalDocuments.tsx`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`
- `src/app/globals.css`

Identify current handling of:

- signalement, incident, alerte, verification;
- dossier complet, rapport de zone, note au Ministre;
- pirogue cycle, sortie, debarquement;
- community needs and funding dossiers;
- actors, referents or missing actor model;
- species/variety data;
- current data provenance wording;
- all wording using `gravite`, `gravity`, `severity`, `grave`, or similar;
- landing claims that imply real-time data without explaining source/trust.

Then implement V5 in the smallest coherent pass possible.

---

## Step 1 - Document the operational model in the repo

Create a strategic documentation file:

`docs/MBAMBULAAN_OPERATIONAL_MODEL.md`

It must explain the four-level model:

1. National level: Ministry / central directorate. Receives synthesis, arbitrates, funds, decides. Does not directly interact with raw community signals.
2. Regional / technical level: regional directorate or coordination cell. Receives field signals, qualifies them, launches verifications, produces zone reports.
3. Local level: territorial agent or mandated referent. Performs local verification, collects first-level signals, links with quay actors.
4. Community level: fishers, mareyeurs, processors, professional organizations. Produces raw signals and declarations, always mediated by level 3.

Include this principle:

> No community signal becomes visible at ministry decision level before regional/local qualification.

Also document the progressive data path:

- MVP: coherent mock data only;
- Pilot: limited real field collection on 3 to 5 quays using forms, WhatsApp relay and uploads;
- Ministry version: regional adoption, agent app, simplified referent interface, offline-first logic;
- Scalable version: APIs and third-party data only when sources are reliable.

This documentation is a product constraint, not just a note.

---

## Step 2 - Introduce data trust levels

Create a reusable component, likely in `MinistryControlTowerParts.tsx` or a small dedicated file:

`DataTrustBadge`

Supported trust levels:

- `Brute`: unverified raw input;
- `Declaree`: submitted by an identified actor but not independently confirmed;
- `Verifiee`: confirmed by field verification or authorized agent;
- `Consolidee`: aggregated from verified sources and usable in official synthesis.

Visible French labels:

- `Brute`
- `Declaree` or `Déclarée` depending project encoding style
- `Verifiee` or `Vérifiée`
- `Consolidee` or `Consolidée`

Use accents if the project already supports them safely.

Add a helper tooltip-like short text if simple:

- Brute: `Information non vérifiée`
- Déclarée: `Acteur identifié, validation en attente`
- Vérifiée: `Confirmée par vérification terrain`
- Consolidée: `Agrégée pour synthèse officielle`

Apply it visibly to:

- Atlas selected object panel;
- pirogue / landing / quay key facts where relevant;
- Filiere & Financement needs table or selected need panel;
- proof/workflow output register if practical;
- landing data-source section if added.

Do not pretend all data is real-time. If mock data is used, add a small `Simulation métier` or `Données de démonstration` indicator where appropriate.

---

## Step 3 - Correct workflow taxonomy and wording

Implement or align taxonomy:

- `Signalement`: raw observation, not yet qualified.
- `Incident`: qualified factual event, dated and localized.
- `Alerte`: vigilance item requiring follow-up or decision.
- `Anomalie`: internal technical inconsistency. Do not show `Anomalie` as a primary user-facing concept unless translated into a signalement or alert.
- `Verification`: confirmation process attached to an entity.

Use French UI labels:

- `Signalé`
- `Qualifié`
- `En traitement`
- `Clôturé`
- `Escaladé en alerte`

Verification statuses:

- `Demandée`
- `Assignée`
- `En cours`
- `Constat déposé`
- `Vérifiée`

Funding statuses:

- `Éligible`
- `Dossier constitué`
- `Transmis`
- `En négociation`
- `Financé`
- `Décliné`

Replace scary wording:

- For factual events use `Criticité`, not `Gravité`.
- For actions/decisions use `Priorité`, not `Gravité`.

Do not mix both scales:

- Criticité: `Normale` / `Vigilance` / `Critique`.
- Priorité: `Standard` / `Prioritaire` / `Urgente`.

Search the code for old wording and update visible text.

---

## Step 4 - Clarify who launches, receives, executes and closes workflows

For each workflow UI, add a compact operational chain panel or metadata block:

### Verification terrain

Preferred CTA for regional/ministry console:

`Demander une vérification terrain`

Do not phrase it as if the ministry personally verifies on the ground.

Show:

- Lanceur: `Cellule régionale / direction technique`
- Destinataire: `Agent territorial ou référent mandaté`
- Canal pilote: `Application terrain ou WhatsApp structuré`
- Retour attendu: `Constat, pièce jointe, horodatage, vérificateur`
- Historique: `Dossier complet + registre régional`

### Signalement

CTA:

`Signaler une situation`

Show:

- Emetteur: `Référent ou agent territorial`
- Réception: `Cellule régionale`
- Qualification: `Direction technique régionale`
- Escalade possible: `Alerte si criticité confirmée`
- Historique: `Registre régional`

### Incident / Alerte

Make clear:

- an incident is a qualified fact;
- an alert is an item requiring follow-up;
- ministry only sees qualified or escalated items.

### Dossier complet

Clarify in UI:

`Le dossier complet est la vue permanente d'une entité. Il regroupe son historique, ses preuves, ses signalements, ses vérifications et ses documents liés.`

It is a page/view, not primarily a generated document.

### Rapport de zone

Clarify:

`Le rapport de zone est un document daté sur une zone et une période. Il sert à transmettre une situation opérationnelle à une direction, un partenaire ou un programme.`

### Note au Ministre

Clarify:

`La note au Ministre est une synthèse décisionnelle avec recommandations d'arbitrage.`

### Dossier de financement

Clarify:

`Le dossier de financement transforme un besoin qualifié en livrable transmissible à un partenaire ou bailleur.`

Do not create giant modals. Use small panels, helper texts and metadata rows.

---

## Step 5 - Add a lightweight field referents model

Add mock data for referents in `src/data/ministryControlTowerData.ts` or a new data file if cleaner.

Referent fields:

- id;
- name;
- role: pecheur referent / mareyeur referent / quai referent / agent territorial;
- quayId or region;
- status: actif / en attente / suspendu;
- reliabilityScore;
- verificationsCompleted;
- lastActivity;
- contactChannel: WhatsApp / telephone / app terrain;
- supervisingCell: regional directorate/cell.

Create a lightweight `Repertoire acteurs` or `ReferentsPanel` capability:

- show referents attached to selected quay in Atlas context panel;
- show referent reliability and role;
- show that interactions are mediated by regional cell;
- do not give referents direct ministry-level control;
- avoid building full auth or messaging.

Add wording:

`Référent mandaté`
`Contact via cellule régionale`
`Fiabilité des vérifications`

This is crucial for operational credibility.

---

## Step 6 - Add species and varieties capability

Create a lightweight but credible capability:

`Répertoire espèces & variétés`

It can be a section inside Filiere & Financement or a transversal panel accessible from Atlas/Filiere. Avoid full navigation rework unless simple.

Species fields:

- id;
- localName;
- scientificName if available/mocked;
- category;
- regulatoryStatus: libre / réglementée / protégée / repos biologique;
- commonZones;
- seasonality;
- monthlyVolumeTrend;
- recentLandingVolume;
- alertLevel;
- decisionUse.

Show:

- species/variety cards or table;
- filter by regulatory status;
- trend bars or simple line-like bars;
- linked quays/regions;
- biodiversity/regulatory alert if protected or biological rest.

This must not be a static catalog. Each species should be tied to:

- recent volume;
- trend;
- zone;
- regulatory status;
- possible decision or alert.

Use value messaging:

`Suivre les volumes, les saisons et les espèces sensibles pour éclairer les décisions réglementaires, biodiversité et financement.`

---

## Step 7 - Upgrade Filiere & Financement with 3 useful charts max

Add simple visualizations using existing React/Tailwind only. Do not add chart dependencies.

Priority visualizations:

1. Funding funnel / waterfall-like summary:
   `Signalé -> Qualifié -> Éligible -> Financé -> Reste à financer`
2. Horizontal bars by category of need.
3. Monthly trend comparing `montant qualifié` and `montant financé`.

Rules:

- Max 4 numeric visualizations visible without interaction.
- No pie charts.
- No radar charts.
- No dashboard wall.
- Charts must support decisions: what to qualify, what to fund, what is blocked.

Audience split:

- Agent regional: next actions and line-level details.
- Ministry: summary, regional distribution, rest to finance.
- Funder: evidence, impact, previously funded outcomes.

If space is limited, prioritize funnel + category bars + `Que faire maintenant`.

---

## Step 8 - Refactor landing for credibility, not just beauty

The landing should not only describe modules. It must answer:

- what the system observes;
- where the data comes from;
- what each actor gains;
- what documents/proofs are produced;
- why a ministry buys or a funder finances;
- why the solution is credible despite progressive data maturity.

Adjust `src/components/landing/InstitutionalLanding.tsx`.

Add or strengthen blocks:

1. Opening promise: keep clear, less dark, readable typography.
2. `Ce que le système observe`: show terrain/Atlas preview with quays, pirogues, landings, signals.
3. `D'où viennent les données`: explain MVP/pilot/ministry/scalable data path with trust badges.
4. `Ce que chaque acteur gagne`: ministry, regional directorate, referent/community, funder/partner.
5. `Ce que le système produit`: zone report, field proof, funding dossier, minister note.
6. `Pourquoi financer Mbambulaan`: governance, proof, impact, biodiversity/species, funding pipeline.

Reduce excessive black/navy. Keep navy for institutional accents, not full-page dominance.

Increase readability:

- body text minimum 15px on desktop;
- key cards 14px+;
- navigation 13px+;
- avoid tiny 8px/9px text except optional labels.

Do not make the landing too long with abstract text. Use concrete blocks.

---

## Step 9 - Preserve existing V4 foundations

Do not break:

- `/`
- `/espace-prive`
- `/espace-prive/etat`
- print-ready document generation;
- funding dossier generation;
- minister note generation;
- Atlas pirogue cycle;
- `Besoins de la filiere` view;
- CI build.

If refactoring creates risk, keep changes small and local.

---

## Acceptance criteria

- A user can understand who produces and validates key data.
- Atlas and Filiere show data trust levels.
- The product no longer implies fake real-time certainty.
- Verification workflow says who launches, who receives, who executes, who returns evidence.
- Signalement / Incident / Alerte wording is clear and non-duplicative.
- `Gravité` is no longer used in visible UI; `Criticité` and `Priorité` are used correctly.
- Dossier complet / Rapport de zone / Note au Ministre / Dossier de financement are clearly differentiated.
- Referents are visible as operational actors without giving them unrealistic ministry-level access.
- Species/varieties are visible as a strategic data capability, not a static list.
- Filiere & Financement has a simple funding funnel or equivalent visualization.
- Landing explains data sources, actor value and funding rationale.
- No new heavy dependency is introduced.
- `npm run typecheck` passes.
- `npm run build` passes.

---

## Tests to run

Run:

```bash
npm run typecheck
npm run build
```

Manual checks:

1. Landing: verify it is lighter, readable and explains data sources.
2. Atlas: select a quay/pirogue and confirm data trust + referent info is visible.
3. Verification workflow: confirm operational chain is shown.
4. Signalement/incident/alert: confirm wording and statuses.
5. Filiere & Financement: confirm trust levels, funding funnel and species/varieties capability.
6. Documents: generate at least funding dossier and minister note.
7. Search visible UI for `Gravité` and remove if found.

---

## Final report expected from Codex

At the end, summarize:

- audit findings;
- files changed;
- operational model documentation added;
- data trust implementation;
- workflow taxonomy changes;
- verification/signalement chain clarifications;
- referents implementation;
- species/varieties implementation;
- Filiere & Financement chart improvements;
- landing credibility changes;
- regression status for document exports;
- typecheck result;
- build result;
- remaining limits.