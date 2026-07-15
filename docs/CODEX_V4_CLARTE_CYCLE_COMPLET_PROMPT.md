# CODEX V4 CLARTE CYCLE COMPLET PROMPT — Mbambulaan

## Decision

The V3 is now functionally credible: institutional exports work, proof workflows exist, funding dossiers exist, and the three-module structure is stable.

But the product is still not premium XXL. It is richer than it is immediately understandable.

This V4 must not add a new layer of complexity. It must make the existing product clearer, more impressive, and more faithful to the real fishing cycle.

Core ambition:

> Mbambulaan rend visible, en un seul regard, tout le cycle de la peche artisanale — du depart en mer jusqu'a la decision ministerielle — et transforme chaque etape en preuve, en financement et en action coordonnee.

This V4 has four non-negotiable priorities:

1. Make Atlas visually clear and impressive.
2. Show the complete fishing cycle: preparation, departure, at sea, return, landing, declaration, proof.
3. Simplify Filiere & Financement by merging confusing blocks into one clear needs view.
4. Make every proof workflow pedagogical: the agent must understand what the action produces before clicking.

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

Then implement V4 while preserving the working V3 exports.

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
- the coastline is not a hard single line only: add a subtle shore transition or texture;
- quays are placed at the land/sea boundary and use a distinct geometric marker, not a generic pin;
- visual clutter is reduced.

Do not add decorative imagery. The goal is maritime clarity, not illustration.

### Marker limit

At any moment, the map should use no more than 5 simultaneous marker families:

1. Quay
2. Pirogue at sea
3. Cycle event: departure / return / landing
4. Alert / incident
5. Selected or active object emphasis

If existing markers exceed this, merge or simplify them.

---

## Step 2 — Add complete pirogue cycle

The Atlas currently focuses too much on landings. It must show the real cycle of artisanal fishing.

Add mock data for pirogue cycle stages:

- preparation;
- departure;
- at sea;
- expected return;
- returned;
- landing;
- declared;
- verified.

Add fields where appropriate:

- `cycleStage`
- `departureTime`
- `expectedReturnTime`
- `actualReturnTime`
- `landingTime`
- `declaredAt`
- `lastCycleEvent`
- optional `cycleHistory