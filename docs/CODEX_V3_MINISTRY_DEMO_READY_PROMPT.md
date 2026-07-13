# CODEX V3 MINISTRY DEMO READY PROMPT - Mbambulaan

## Decision

The V2 is a good system, but it is not yet a desirable ministry-grade product.

This V3 must make Mbambulaan Ministry Demo Ready.

Core ambition:

> Mbambulaan must become the national control room for Senegal artisanal fishing: the place where a field signal becomes, in a few clicks, a documented decision, a funded program, and an impact proof transmissible to a partner.

This is not a cosmetic pass. The priority is not to add more features. The priority is to make the existing value demonstrable, premium, transmissible, and credible in front of a ministry cabinet.

## Non negotiable priority order

1. Replace every txt export with a real styled PDF or a print-ready HTML document downloadable as PDF through the browser.
2. Make the funding request journey produce a premium dossier that can be shown to a funder.
3. Add strong situation banners on Atlas and Pilotage.
4. Rename Filiere & programmes to Filiere & Financement everywhere.
5. Redesign Filiere & Financement around value, funding opportunities, matching, and impact proof.
6. Enrich mock data with realistic names, amounts, beneficiaries, programs, and funder-like partners.
7. Improve Atlas and Pilotage only after the above items are handled.

## Step 0 - Audit before editing

Before modifying code, inspect the current implementation:

- routes for /espace-prive and /espace-prive/etat;
- current private-space components;
- current workflow drawer and artifact generation logic;
- current download function that creates txt files;
- current mock data in ministryControlTowerData and ministryValueJourneyData;
- current wording for Atlas, Filiere & programmes, Pilotage institutionnel;
- current CI workflow and package dependencies.

Then implement the V3 without breaking the V2 workflow foundation.

## Step 1 - Replace txt exports

Remove the current txt artifact experience as the primary output.

No user-facing generated document should download as .txt.

Implement a reusable document generation layer:

- DocumentPreview
- GeneratedDocument
- DownloadPdfButton or PrintReadyDocumentButton
- DocumentHeader
- DocumentMetaGrid
- DocumentSection
- DocumentFooter

Preferred approach:

- If adding a stable client-side PDF dependency is safe, add it and generate PDF files.
- If a dependency is risky, create a print-ready HTML document in a new window or Blob with @media print CSS and trigger browser print/save as PDF.

The output must look like an institutional document:

- navy/ocean header band;
- Mbambulaan identity;
- title;
- document type;
- perimeter;
- date/time;
- validator;
- source note;
- structured body;
- evidence section;
- footer: Document genere par Mbambulaan - infrastructure de coordination de la filiere peche artisanale.

Document names must follow:

- Mbambulaan_RapportZone_[Perimetre]_[Date].pdf
- Mbambulaan_DossierFinancement_[Perimetre]_[Date].pdf
- Mbambulaan_NoteMinistre_[Perimetre]_[Date].pdf
- Mbambulaan_DossierSynthese_[Perimetre]_[Date].pdf

If true PDF creation cannot be guaranteed, use print-ready HTML but never present a txt as the final output.

## Step 2 - Funding dossier journey

The funding request journey is the top product proof.

Rename CTA:

- from Creer une demande de financement
- to Constituer un dossier de financement

The journey must produce a visually premium funding dossier with:

- cover/title block;
- source need;
- estimated amount;
- requested amount;
- beneficiaries;
- target funder or partner;
- responsible ministry unit;
- expected impact;
- attached proofs;
- maturity score;
- eligibility status;
- validator and date;
- final section: Dossier transmissible.

The generated funding dossier must be visible in:

- Filiere & Financement;
- Pilotage institutionnel if it needs arbitration;
- artifact/document register.

Statuses to use:

- A qualifier
- Eligible au financement
- En instruction
- Dossier genere
- Transmis
- Finance

## Step 3 - Rename and redesign Filiere & Financement

Rename all visible occurrences of Filiere & programmes to Filiere & Financement.

Screen title:

> Filiere & Financement - Valoriser la filiere, structurer le financement

This space must read as a 30-second funding story:

1. Global value banner
2. Portfolio of needs
3. Valorization pipeline
4. Funding opportunities
5. Impact proof

### 3.1 Global value banner

At the top of the space, before any board, display a strong sentence-number:

> 4,2 Mds FCFA de besoins qualifies - 18 programmes actifs - 6 partenaires mobilisables

Compute from mock data where possible. Use realistic mock values if needed.

### 3.2 Portfolio of needs

Show:

- number of qualified needs;
- total estimated amount;
- categories: equipment, training, infrastructure, direct funding;
- horizontal stacked bars, not pie charts;
- maturity distribution.

### 3.3 Valorization pipeline

Keep the workflow logic, but each item must show:

- realistic program or need name;
- territory;
- estimated amount;
- maturity score;
- next action;
- status badge.

Use concrete names such as:

- Modernisation des debarcaderes de la Petite Cote
- Chaine de froid Joal-Mbour
- Securite des pirogues de Guet Ndar
- Pesee et tracabilite a Kayar
- Parcours metiers bleus Fass Boye

### 3.4 Funding opportunities

Show matching cards with:

- need;
- compatible partner/funder type;
- amount;
- beneficiaries;
- compatibility score, e.g. 87%;
- status Eligible au financement;
- CTA Constituer un dossier de financement.

This block is the sales argument for funders.

### 3.5 Impact proof

Each proof must include an impact figure:

- 320 pecheurs beneficiaires
- +18% de volumes declares depuis verification
- 42 mareyeuses integrees au programme froid
- 11 quais couverts par le dispositif

## Step 4 - Atlas maritime upgrade

Atlas is already the strongest space. Improve it without destabilizing it.

Screen subtitle:

> Observer l'activite littorale et maritime en temps reel

Add a SituationBanner above the map:

> 186 pirogues actives - 12 quais surveilles - 3 zones en vigilance - Derniere synchronisation il y a 4 min

Add a Briefing du jour action in this banner. It opens a drawer/panel with 5 concise lines:

- new incidents;
- zones to watch;
- pending verifications;
- landing anomalies;
- recommended next action.

CTA wording:

- Verifier -> Lancer une verification terrain
- Creer une alerte -> Signaler une situation
- Ouvrir la fiche complete -> Voir le dossier complet
- Exporter la zone -> Generer un rapport de zone

Improve ContextPanel into a two-level dossier:

- identity band: name, status, last activity, mono key value;
- detail: history, trend sparkline, proofs, actions.

If simple to implement, add or strengthen:

- recent trajectory rendering for pirogues;
- distinct incident markers vs alert markers;
- subtle activity pulse indicator on the map, only one animation allowed.

## Step 5 - Pilotage institutionnel upgrade

Screen title:

> Pilotage institutionnel - Vue nationale et aide a la decision

The first visible element must be a high-level national situation sentence, not KPI cards:

> Situation au 13 juillet 2026 - 08h14 : activite normale sur 9 regions, 2 zones en vigilance, 1 dossier de financement en attente d'arbitrage.

Then show:

- Decisions a arbitrer aujourd'hui: 3 to 5 max, written in decision language;
- Financement en cours: dossiers requiring arbitration/signature;
- Synthese regionale: sorted by criticality, not alphabetically;
- Note institutionnelle: preview of the last generated document and CTA.

CTA wording:

- Preparer une note institutionnelle -> Generer la note au Ministre
- Export institutionnel -> Exporter le dossier de synthese

The note to the minister must generate a premium institutional document, not txt.

## Step 6 - Premium wording replacements

Replace visible labels consistently:

- Filiere & programmes -> Filiere & Financement
- Creer une demande de financement -> Constituer un dossier de financement
- Mobiliser un partenaire -> Solliciter un partenaire
- Ouvrir la fiche complete -> Voir le dossier complet
- Exporter la zone -> Generer un rapport de zone
- Verifier -> Lancer une verification terrain
- Creer une alerte -> Signaler une situation
- Preparer une note institutionnelle -> Generer la note au Ministre
- Export institutionnel -> Exporter le dossier de synthese
- Pret a instruire -> Eligible au financement
- En cours -> En instruction
- Cloture positively -> Finance

Avoid marketing wording. Use institutional consequence wording.

## Step 7 - Mock data upgrade

Make the demo data coherent and memorable.

Use realistic Senegal fishing context names:

- Kayar
- Joal-Fadiouth
- Mbour
- Saint-Louis
- Guet Ndar
- Hann
- Soumbedioune
- Fass Boye
- Kafountine

Use realistic amounts in FCFA. Avoid placeholders.

Use plausible but generic funder/partner labels unless already approved:

- Programme public froid
- Partenaire technique tracabilite
- Cooperation internationale filiere bleue
- ONG securite maritime
- Fonds de valorisation de la filiere

Do not use real external organizations without authorization.

## Step 8 - Components to create or refactor

Create or refactor as needed:

- DocumentPreview
- GeneratedDocument
- DownloadPdfButton or PrintReadyDocumentButton
- SituationBanner
- BriefingPanel
- ValueBanner
- FundingOpportunityCard
- ImpactProofCard
- EntityDossierView
- ContextPanel two-level layout
- FundingRequestForm output preview
- InstitutionalNoteBuilder output preview
- ExportPanel with document preview

Do not remove the existing workflow foundation if it works. Extend it.

## Step 9 - Tests

Run:

npm run typecheck
npm run build

Also manually verify through code or local run if available:

- no generated artifact uses .txt as final user-facing output;
- funding dossier produces a styled document;
- note to minister produces a styled document;
- zone report produces a styled document;
- Filiere & Financement displays a global value banner;
- Pilotage opens with a national situation sentence;
- Atlas opens with a live situation banner;
- CTA labels are updated consistently;
- existing workflows still open and validate.

## Acceptance criteria

- No user-facing export downloads as .txt.
- Funding dossier is presentable to an external partner without manual retouching.
- Note to minister is visually credible and structured.
- Atlas, Filiere & Financement, and Pilotage each open with a strong synthesis element visible without scroll.
- Filiere & Financement explicitly shows funding value, matching, amount, maturity, beneficiaries, and impact proof.
- Pilotage can be understood by a decision-maker in under 20 seconds.
- The UI feels maritime and institutional without becoming decorative.
- CI passes.

## Final response expected from Codex

Summarize:

- audit findings;
- files changed;
- components created/refactored;
- PDF or print-ready document approach chosen;
- exports converted;
- funding journey changes;
- Filiere & Financement changes;
- Atlas changes;
- Pilotage changes;
- wording replacements;
- mock data changes;
- typecheck result;
- build result;
- remaining limits.
