# CODEX V4 CLARTE CYCLE COMPLET PROMPT — Mbambulaan

## Decision

The V3 is functionally credible: institutional exports work, proof workflows exist, funding dossiers exist, and the three-module structure is stable.

But the product is still not premium XXL. It is richer than it is immediately understandable.

This V4 must not add a new layer of complexity. It must make the existing product clearer, more impressive, and more faithful to the real fishing cycle.

Core ambition:

> Mbambulaan rend visible, en un seul regard, tout le cycle de la peche artisanale — du depart en mer jusqu'a la decision ministerielle — et transforme chaque etape en preuve, en financement et en action coordonnee.

Non-negotiable priorities:

1. Make Atlas visually clear and impressive.
2. Show the complete fishing cycle: preparation, departure, at sea, return, landing, declaration, proof.
3. Simplify Filiere & Financement by merging confusing blocks into one clear needs view.
4. Make every proof workflow pedagogical: the agent must understand what the action produces before clicking.
5. Preserve the working V3 print-ready institutional documents.

Do not do another cosmetic pass. Do not add unrelated features. Do not break the V3 document/export foundation.

---

## Step 0 — Audit before editing

Before modifying code, inspect:

- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryV3Components.tsx`
- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/components/private-space/InstitutionalDocuments.tsx`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`
- `src/app/globals.css`

Identify:

- current Atlas map implementation and map layers;
- current marker types;
- where land/sea/coast visuals are defined;
- current pirogue data model;
- whether departure/return data already exists;
- current Filiere & Financement layout;
- current Portefeuille/Pipeline sections;
- current proof workflow wrappers;
- current document template implementation.

Then implement V4 while preserving working V3 exports.

---

## Step 1 — Atlas: fix map clarity first

The Atlas is the most important ministry-demo screen. It must produce a positive wow effect.

Priority: make the map immediately readable.

### Required visual hierarchy

The user must identify the following in less than 5 seconds without reading a legend:

- sea;
- beach / coastline;
- land;
- quay;
- pirogue at sea;
- departure / return / landing events;
- alert / incident.

### Map style requirements

Refactor the current custom map rendering so that:

- the sea has a clear depth gradient: darker navy offshore, lighter ocean closer to the coast;
- the beach / coastline is a clear sand band using `--mb-sand-300` or an equivalent sand tone;
- land is visually quieter using off-white / neutral tones;
- the coastline is not just a hard single line: add a subtle shore transition or texture;
- quays are placed at the land/sea boundary and use a distinct geometric marker;
- visual clutter is reduced.

Do not add decorative imagery. The goal is maritime clarity, not illustration.

### Marker limit

At any moment, the map should use no more than 5 marker families:

1. Quay
2. Pirogue at sea
3. Cycle event: departure / return / landing
4. Alert / incident
5. Selected or active object emphasis

If existing markers exceed this, merge or simplify them.

---

## Step 2 — Add the complete pirogue cycle

Atlas currently focuses too much on landings. It must show the real cycle of artisanal fishing:

Preparation -> Departure -> At sea -> Return -> Landing -> Declaration -> Proof

Add mock data for pirogues:

- `cycleStage`: `preparation | departure | atSea | expectedReturn | returned | landing | declared | verified`
- `departureTime`
- `expectedReturnTime`
- `actualReturnTime`
- `landingTime`
- `declaredAt`
- `lastCycleEvent`
- `cycleHistory` if useful

Add or enrich mock events for:

- departures from quay;
- expected returns;
- actual returns;
- landings;
- declarations;
- verification/proof events.

### CycleTimeline component

Create a reusable `CycleTimeline` component displayed in the Atlas detail panel when a pirogue is selected.

It should show:

- Preparation
- Depart
- En mer
- Retour
- Debarquement
- Declare

Highlight the current stage. Show times where available. Keep it compact and premium.

Do not add the cycle as a flat text field. It must be a visual timeline.

### Map behavior

- Departure events start at a quay.
- Pirogue trajectory should visually originate from the departure marker.
- Landing and declaration are distinct events.
- The selected pirogue should show both current position and recent cycle path.

---

## Step 3 — Atlas briefing and detail panel

Add or improve the Atlas opening summary.

The Atlas should open with a clear situation sentence, for example:

> 14 pirogues en mer · 6 retours attendus avant 18h · 3 debarquements declares ce matin · 1 zone en vigilance

Keep the existing `BriefingPanel` if present, but make it more useful:

- today at the coast;
- pirogues at sea;
- expected returns;
- landings declared;
- zones in vigilance;
- recommended next action.

Refactor the Atlas detail panel into 3 blocks:

1. Strong identity band: name, type, status, latest activity.
2. Cycle/status block: `CycleTimeline` for pirogues, status/tendency for quays.
3. History and actions: events, proofs, actions.

CTA wording:

- Keep: `Lancer une verification terrain`
- Keep: `Generer un rapport de zone`
- Prefer on map incidents: `Signaler un incident`
- Keep: `Voir le dossier complet` if implemented

Remove or merge duplicate CTAs that open the same action.

---

## Step 4 — Simplify Filiere & Financement

Problem: `Portefeuille de besoins` and `Pipeline de valorisation` are not clear enough. They answer the same question from two angles and create cognitive load.

Replace the two separated blocks with a single clear view:

## Besoins de la filiere

Structure:

1. Keep a strong value line at the top:
   - total qualified amount;
   - number of needs;
   - number of active programs;
   - number of funder-like partners.

2. Add a single filterable `NeedsTable` with four statuses:
   - Signale
   - Qualifie
   - Eligible au financement
   - Finance

Each row must show:

- need name;
- territory/community;
- amount;
- category;
- affected actors/beneficiaries;
- current status;
- next recommended action.

3. Add a right-side context panel `Partenaires & preuves` when a need is selected.

The context panel should show:

- compatible partner/funder-like actor;
- compatibility score;
- proof/impact evidence;
- suggested next action;
- CTA to qualify, build funding dossier, or solicit partner.

This replaces the confusing separation between portfolio, pipeline, opportunities and proof blocks. The user should understand in 10 seconds:

- what needs exist;
- which ones are ready to fund;
- what amount is at stake;
- who is affected;
- who can help;
- what proof supports it;
- what action to take now.

### WhatNowPanel

Create or reuse a `WhatNowPanel` component for Filiere & Financement:

Title: `Que faire maintenant ?`

It should list 3 to 5 immediate actions:

- need to qualify;
- funding dossier to build;
- partner to solicit;
- stalled dossier;
- proof missing.

Keep it practical and agent-friendly.

---

## Step 5 — Make proof workflows pedagogical

The workflows exist, but they must become clearer before and after click.

Rule: before each CTA, the agent should understand what the action will produce.

Add short helper sentences near the action buttons or inside the selected context panel.

Examples:

- Verification: `Cette information n'a pas encore ete confirmee sur place.`
- Incident: `Decrivez ce qui se passe — cela creera une alerte suivie.`
- Zone report: `Ce rapport inclura la carte, les statuts et les evenements de la zone.`
- Need qualification: `Qualifier ce besoin permettra de l'evaluer pour un financement.`
- Funding dossier: `Ce dossier pourra etre transmis a un partenaire ou bailleur.`
- Partner solicitation: `Une note de sollicitation sera generee pour ce besoin.`
- Minister note: `Cette note reprendra la situation du jour et les decisions en attente.`
- Synthesis dossier: `Ce dossier regroupe les donnees de synthese pour transmission externe.`

Add a visible progression indicator to all multi-step proof workflows. If `StepIndicator` exists, reuse it. If not, create/refactor one.

Keep steps simple:

- Verification: Constat -> Preuve -> Validation
- Incident: Description -> Gravite / responsable
- Funding dossier: Montant / justification -> Beneficiaires -> Pieces -> Apercu
- Minister note: Perimetre -> Elements retenus -> Synthese -> Apercu

Avoid long forms that feel administrative. Each workflow should make its output clear.

---

## Step 6 — Pilotage institutionnel: make decision obvious

Pilotage must answer in 20 seconds:

- what is happening nationally;
- what is urgent;
- what must be decided;
- what can be funded;
- what is blocked;
- what documents are ready to transmit.

Structure order:

1. Situation line: large narrative sentence, first item on screen.
2. `Decisions a arbitrer aujourd'hui`: 3 to 5 items max.
3. `Financements a arbitrer`: link to Filiere & Financement sources.
4. `Blocages en attente`: overdue verifications, stalled partner responses, delayed dossiers.
5. `Documents prets a transmettre`: latest print-ready documents.
6. Regional synthesis sorted by criticality.

Every item should link back to its source:

- Atlas source for maritime/zone incidents;
- Filiere & Financement source for funding needs and dossiers;
- generated document source for notes and synthesis dossiers.

Pilotage must not be a dead-end dashboard. It is a decision cockpit.

---

## Step 7 — Documents

Preserve the working V3 document/export system.

If there are multiple document preview/rendering variants, consolidate around one shared `DocumentTemplate` or the current `InstitutionalDocuments` abstraction.

Acceptance for documents:

- all generated documents share the same visual structure;
- no `.txt` output returns;
- generated documents include: header, metadata, structured body, validation statement, footer;
- documents still open correctly in a print-ready window.

Do not break the export that is now working.

---

## Step 8 — Acceptance criteria

The V4 is accepted only if:

- the distinction sea / beach / land / quay is immediately visible on the Atlas;
- the Atlas gives a stronger ministry-demo impression than V3;
- departure, return, landing and declaration are represented as a complete cycle;
- a selected pirogue shows a clear `CycleTimeline`;
- Filiere & Financement no longer shows confusing separate `Portefeuille` and `Pipeline` blocks;
- `Besoins de la filiere` is a single filterable view with clear statuses;
- each proof workflow includes a short explanation of what it produces before click;
- multi-step workflows show progression;
- Pilotage keeps a strict decision hierarchy;
- all documents still open in print-ready format;
- `npm run typecheck` passes;
- `npm run build` passes.

---

## Tests to run

Run:

```bash
npm run typecheck
npm run build
```

Manual checks:

1. Atlas screenshot test: a new user must identify sea, beach, land and quays in less than 5 seconds.
2. Pirogue cycle test: select a pirogue and verify the cycle timeline matches its mock data.
3. NeedsTable test: filter `Eligible au financement` and verify rows match expected funding-ready needs.
4. Workflow clarity test: each CTA has a short explanation of what it will produce.
5. Document regression test: generate a funding dossier and minister note; both must open in print-ready format.

---

## Final report expected from Codex

At the end, summarize:

- audit findings;
- files changed;
- data structures added or modified;
- Atlas map clarity changes;
- pirogue cycle implementation;
- Filiere & Financement simplification;
- workflow pedagogy changes;
- Pilotage improvements;
- document/export regression status;
- typecheck result;
- build result;
- remaining limits.
