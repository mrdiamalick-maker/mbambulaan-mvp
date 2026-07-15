# CODEX PRODUCT CHALLENGE PREMIUM XXL AUDIT PROMPT — Mbambulaan

## Mission

You are not asked to code.
You are not asked to redesign screens.
You are not asked to implement fixes.

You are asked to challenge the Mbambulaan product as a senior CPO, product strategist, service designer, institutional buyer, field operations architect, data architect, funder, and Senegal fisheries sector operator.

Your output will be used by the founder to prepare a later implementation prompt. Be demanding, concrete, and strategic.

Language: French.

## Product context

Mbambulaan is not a marketplace, not an ERP, not a generic dashboard, and not a simple app.

Mbambulaan is intended to become a national coordination infrastructure for Senegal artisanal fishing. It must connect field signals, maritime activity, landings, community needs, funding, proof generation, species and variety intelligence, and institutional decision-making.

Current product state:

- public landing page exists;
- private console exists at `/espace-prive/etat`;
- three spaces exist: Atlas maritime, Filiere & Financement, Pilotage institutionnel;
- print-ready institutional documents exist;
- proof workflows exist;
- Atlas now shows a clearer map and pirogue cycle;
- Filiere & Financement now has a simplified needs view;
- workflows are more pedagogical but still questionable from an operational service-design point of view.

## Founder notes to challenge

Challenge these notes directly. Do not simply agree. Separate what is valid, incomplete, risky, or wrongly framed.

### Workflow questions

- `Lancer une verification terrain`: is it the ministry that launches it? Who receives the verification, when and how? Who performs the verification on site? How is the result returned to the ministry once completed? Where can we see the history of submitted signals?
- Same questions for incident reporting.
- Same for `Voir le dossier complet` and `Generer un rapport de zone`: what is the added value? Who uses it? For what decision?
- The word `Gravite` feels frightening. `Criticite` or `Priorite` may sound better.

### Financing and community value

- Financing needs stats are better, but charts such as histograms or budget tracking may be needed.
- What about community value and the promise that Mbambulaan will sell itself to the ministry?
- Who would buy and/or finance the solution today? What do they gain?

### Data source and operating model

- What is the main data source?
- Where do the highlighted data come from?
- APIs created by Mbambulaan?
- uploaded files?
- local contacts on site?
- WhatsApp or other lightweight channels?

### Field referents and actors

- The role of referents such as fishers and fish traders is not visible enough.
- Where should their interaction with the ministry appear?
- Should they interact with the ministry directly or through a controlled layer?

### Species, varieties and classification

- Where is the directory and classification of fish varieties?
- This is important because the ministry can track species by day, month, year, quay, landing site, territory, and region.
- The product should also expose protected species, endangered species, restricted species, trend analysis, and reliable intelligence for the ministry and partners.

### Landing feedback to challenge

Recent landing feedback:

- too much black/navy;
- typography too small;
- product promise clearer but still may not sell the solution strongly enough;
- landing must convince a ministry, a partner, and a funder that Mbambulaan is not just a prototype.

Challenge whether the landing should primarily sell:

- institutional control;
- field coordination;
- data reliability;
- financing leverage;
- species intelligence;
- value-chain visibility;
- or all of the above with one dominant narrative.

## Audit scope

Inspect the current code and product structure only to understand what exists. Do not edit files.

Inspect at least:

- `src/app/page.tsx`
- `src/components/landing/InstitutionalLanding.tsx`
- `src/app/espace-prive/page.tsx`
- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryV4Components.tsx`
- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/components/private-space/InstitutionalDocuments.tsx`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`

## Required output structure

Produce a strategic product review in French with the following sections.

### 1. Verdict brutal

Explain clearly:

- what is now credible;
- what is still weak;
- what is operationally unclear;
- what would block a ministry purchase;
- what would block a funder;
- what would block field adoption;
- what creates confusion between a demo and a real coordination system.

### 2. The real product problem now

Identify the real problem behind the founder notes.

For example, is the issue:

- missing screens?
- missing workflows?
- unclear roles?
- unclear operating model?
- missing data architecture?
- lack of service design?
- weak buyer narrative?
- weak field adoption model?

Do not answer superficially.

### 3. Operating model: who does what?

Define a clear operating model for:

- ministry central team;
- regional/departmental services;
- landing-site or quay referents;
- fishers;
- fish traders / mareyeurs;
- processors / transformatrices;
- professional organizations;
- partners and funders;
- Mbambulaan as company/operator.

For each actor, define:

- what they can report;
- what they can verify;
- what they can validate;
- what they can see;
- what they should never directly control;
- what incentive they have to participate.

### 4. Workflow challenge: verification, incident, dossier, report

For each workflow:

- `Lancer une verification terrain`;
- `Signaler un incident`;
- `Voir le dossier complet`;
- `Generer un rapport de zone`;
- `Qualifier un besoin`;
- `Constituer un dossier de financement`;
- `Solliciter un partenaire`;
- `Generer la note au Ministre`;
- `Exporter le dossier de synthese`.

Answer:

- who starts it;
- who receives it;
- who executes it;
- what happens in real life;
- what happens inside the product;
- what status changes;
- what history is created;
- what proof is generated;
- what value it creates;
- what should be visible in UI;
- what should be hidden or reserved for later.

### 5. Naming and wording

Challenge terminology.

Propose better wording for:

- `Gravite`;
- `Criticite`;
- `Priorite`;
- `Signalement`;
- `Incident`;
- `Verification terrain`;
- `Dossier complet`;
- `Rapport de zone`;
- `Preuve`;
- `Dossier transmissible`;
- `Filiere & Financement`;
- landing headlines and CTAs.

Give final recommended UI terms and terms to avoid.

### 6. Data source architecture

Define the credible data-source story for Mbambulaan.

Cover:

- field declarations;
- WhatsApp/lightweight mobile channels;
- web forms or local portal;
- data uploads from existing ministry files;
- future APIs;
- manual verification by referents;
- species/variety registry;
- partner/funding data;
- audit trail;
- confidence level per data point.

Explain what should be shown in the MVP now and what should be kept as future architecture.

### 7. Referents and field network

Define how referents should appear in product.

Should there be:

- a `Reseau de referents` module?
- a referent layer inside Atlas?
- a referent column in signal history?
- a referent status on verification workflows?
- a trust score or accreditation status?
- a contact method such as WhatsApp?

Be concrete and cautious. This product must not create uncontrolled direct ministry noise.

### 8. Signal history and operational traceability

Define where histories should live:

- signal history;
- incident history;
- verification history;
- document history;
- actor interaction history;
- species and landing observations;
- funding dossier history.

Propose a simple information architecture.

### 9. Species, varieties and resource intelligence

Design the product logic for fish species and varieties.

Cover:

- directory of species and local names;
- classification by commercial value, volume, seasonality, risk, protected status;
- daily/monthly/yearly views;
- quay, territory and region views;
- protected/endangered species alerts;
- trend intelligence for the ministry;
- value for partners/funders;
- how it connects to Atlas, Filiere & Financement, and Pilotage.

Explain what should be visible in the current demo and what should be future.

### 10. Financing and value capture

Answer directly:

- who could pay for Mbambulaan;
- who could finance it without being the buyer;
- what each stakeholder gains;
- what economic value Mbambulaan captures;
- why the ministry would justify buying it;
- why a funder would support it;
- why communities would participate;
- what must be shown in the demo to make this obvious.

Include at least three business model options:

- public institutional license;
- program/funder-funded deployment;
- value-chain intelligence and coordination services.

Challenge each option.

### 11. Landing page critique

Critique the current landing as a buyer-facing asset.

Evaluate:

- narrative;
- first impression;
- color balance;
- typography;
- credibility;
- whether it sells the full product;
- whether it sells financing and species intelligence enough;
- whether it explains the operating model;
- whether it gives a clear reason to request a demo.

Propose a better landing narrative, section order, hero message, CTA hierarchy, and content blocks.

### 12. Premium XXL solution blueprint

Propose the next premium XXL product version.

This should be a blueprint, not implementation instructions yet.

Include:

- recommended product modules;
- recommended navigation;
- key screens;
- key workflows;
- key data objects;
- proof and audit model;
- dashboards/charts that matter;
- what to remove;
- what to merge;
- what to defer;
- what would impress a ministry in 5 minutes;
- what would reassure a funder;
- what would make field actors participate.

### 13. Implementation prompt preparation

Do not write the final Codex implementation prompt.

Instead, prepare the raw material for a later TERA prompt:

- top 10 priorities;
- files likely impacted;
- components likely needed;
- data models likely needed;
- new mock data needed;
- wording replacements;
- acceptance criteria;
- risks;
- non-goals;
- what must not be broken.

## Rules

- Be direct and rigorous.
- Challenge the founder notes when needed.
- Do not overbuild.
- Do not propose a full enterprise ERP.
- Keep it feasible for a premium demo with Next/React/Tailwind and mock data.
- Make clear what belongs to MVP demo and what belongs to later product.
- Always reason from coordination, trust, proof, decision, financing, and adoption.
- Avoid generic startup language.
- Avoid vague recommendations.

## Final instruction

At the end, provide a one-page executive conclusion:

- what Mbambulaan should become;
- what must change next;
- why the current product is not yet premium XXL;
- what the next implementation pass must focus on.
