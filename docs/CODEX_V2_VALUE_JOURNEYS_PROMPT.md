# CODEX V2 VALUE JOURNEYS PROMPT — Mbambulaan

## Decision

The current Claude Blueprint implementation is better, but not enough to sell Mbambulaan to a ministry.

Do not start another cosmetic redesign.

This V2 must make the product demonstrable, fundable, and decision-oriented.

Directive:

> Mbambulaan must transform each field signal into a traced decision, an exploitable proof, and a funding opportunity for the fishing value chain.

## What is wrong today

The V1 solved part of the generic SaaS/Tailwind problem, but it is still too neutral and not valuable enough in demo.

Problems to fix:

1. The UI does not feel maritime enough. It is sober, but too close to generic institutional/B2B software.
2. The Atlas is the best workspace but still behaves mostly like a map with layers, not like an operational surveillance and verification tool.
3. CTAs are weak. A click on Verify, Create alert, Export, etc. mostly creates a notification or a log. That does not prove value to a ministry.
4. The product does not yet show full workflows: instruction, form, human validation, generated proof, exportable artifact.
5. Filiere & programmes does not yet demonstrate value creation, community valorization, funding readiness, partner matching, or impact evidence.
6. Pilotage institutionnel still risks being perceived as a KPI dashboard instead of a high-level decision cockpit.
7. The product must show how Mbambulaan can help structure financing for the fishing value chain.

## Non-negotiable V2 goals

1. Strengthen the maritime identity without becoming decorative.
2. Turn key CTAs into real end-to-end workflows.
3. Make Filiere & programmes the value and funding engine of the product.
4. Make Pilotage institutionnel a high-level decision tool with written recommendations and institutional note generation.
5. Keep the V1 institutional discipline: low radius, no heavy shadows, no SaaS cards, dense professional interface.

## Files to inspect first

Run an audit before changing code.

Inspect at least:

- `src/app/espace-prive/page.tsx`
- `src/app/espace-prive/etat/page.tsx`
- `src/app/globals.css`
- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/data/ministryControlTowerData.ts`
- `.github/workflows/ci.yml`

Confirm existing components before editing:

- AppShell
- TopBar
- NavigationRail
- MobileWorkspaceNav
- WorkspaceHeader
- MapCanvas
- LayerControl
- ContextPanel
- DecisionPanel
- EvidenceTimeline
- MetricRow
- StatusBadge
- DataTable
- WorkflowBoard
- ProgramPipeline
- ActionRegister
- ExportPanel

Do not assume. Inspect current implementation first.

## Axis 1 — Maritime identity enhancement

Do not make the UI decorative. Make it more maritime through functional visual language.

### Tokens

Add:

```css
--mb-foam: #EAF2F1;
```

Use `--mb-ocean-600` more actively as the interaction and selection color:

- active navigation state;
- selected map element border;
- selected table row;
- active layer state;
- field focus;
- selected workflow item;
- generated proof highlight.

### Dark zones

For TopBar, NavigationRail and Atlas header areas, replace flat navy where appropriate with a very subtle navy to ocean treatment.

Constraint:

- no loud gradient;
- no decorative wave;
- no marketing background;
- 3 to 5 percent visual shift maximum;
- still serious and institutional.

Add a very subtle bathymetric/isobath SVG texture on dark zones if possible:

- opacity 2 to 3 percent;
- thin contour lines;
- no illustration feel;
- should feel like maritime chart material.

### Map

Improve MapCanvas:

- more visible sea identity;
- better land/sea contrast;
- add thin isobath lines;
- preserve professional density;
- add trajectories for pirogues;
- add an incidents layer distinct from alerts;
- improve selected object treatment.

Do not add MapLibre unless you can install and build successfully. If MapLibre is not added, document that the custom MapCanvas is still a temporary cartographic prototype.

## Axis 2 — End-to-end workflows

Rule: no important CTA should only create a notification.

Each key action must open a drawer, route, or panel with:

- structured form;
- visible steps;
- required fields;
- human validation;
- generated proof or document;
- confirmation state;
- persistent record in EvidenceTimeline or ActionRegister.

Create a reusable workflow foundation.

Recommended components:

- `ProcessDrawer`
- `StepIndicator`
- `FormSection`
- `ReviewBlock`
- `GeneratedArtifactPreview`
- `ProofReceipt`
- `DocumentPreview`
- `ValidationStamp`

If simpler, create one generic `ProcessDrawer` with different content per workflow.

### Required workflows

#### 1. Verify

CTA: `Vérifier`

Open `VerificationDrawer`.

Steps:

1. Object summary: quay, pirogue, landing or alert.
2. Verification method: terrain, declarative, source cross-check.
3. Finding: short structured text.
4. Optional attachment placeholder.
5. Human validation: name, role, timestamp.
6. Proof generated.

Generated artifact:

- proof receipt in EvidenceTimeline;
- status can become verified in demo state;
- entry in ActionRegister.

Value shown:

- data reliability;
- traceability;
- proof for ministry and funders.

#### 2. Create alert

CTA: `Créer une alerte`

Open `AlertCreationForm`.

Fields:

- alert type: zone tension, declaration gap, technical incident, safety risk;
- severity: vigilance or critical;
- zone/quay/pirogue;
- description;
- assigned owner;
- due date.

Validation:

- explicit human confirmation.

Generated artifact:

- alert record;
- visible in Atlas layer;
- critical alerts visible in Pilotage.

#### 3. Open full file

CTA: `Ouvrir la fiche complète`

Create a route if feasible:

- `/espace-prive/etat/fiche/[type]/[id]`

If dynamic routes are too much for this pass, implement an in-app full screen detail panel.

Content:

- identity;
- full history;
- linked alerts;
- linked landings;
- proof timeline;
- documents;
- available actions.

Value:

- demonstrates that map points are backed by real operational records.

#### 4. Export zone

CTA: `Exporter la zone`

Open extended `ExportPanel` or drawer.

Steps:

1. Select perimeter: national, region, quay, current selection.
2. Select period.
3. Select layers: quays, pirogues, landings, alerts, incidents.
4. Preview generated document.
5. Download simulated file or generate readable downloadable text/html file.

Generated artifact:

- document preview;
- export record in EvidenceTimeline.

Important:

- do not fake with just a toast;
- at minimum generate a downloadable `.txt`, `.json`, `.csv` or client-side HTML/text report if PDF is not feasible.

#### 5. Qualify need

CTA: `Qualifier un besoin`

Open `QualificationForm` in Filiere & programmes.

Fields:

- category: equipment, training, infrastructure, direct financing;
- scale: actors affected;
- estimated amount;
- maturity score;
- affected community;
- required evidence;
- qualifier name/role.

Generated artifact:

- qualified need record;
- moved/updated pipeline item;
- evidence entry.

#### 6. Create funding request

CTA: `Créer une demande de financement`

This is the most important V2 workflow.

Open `FundingRequestForm`.

Fields:

- source need;
- amount requested;
- justification;
- beneficiary count;
- beneficiary type;
- target partner/funder;
- expected impact;
- required documents;
- responsible ministry unit.

Steps:

1. Select/confirm need.
2. Funding structure.
3. Beneficiaries and impact.
4. Supporting proof.
5. Human validation.
6. Generated funding dossier preview.

Generated artifact:

- funding request dossier;
- visible in Filiere & programmes;
- visible as decision/opportunity in Pilotage;
- downloadable document if feasible.

Value:

- shows how Mbambulaan can help capture and structure funding for the fishing value chain.

#### 7. Associate program

CTA: `Associer un programme`

Open a program matching panel.

Fields:

- selected program;
- reason for match;
- expected impact;
- owner;
- next milestone.

Generated artifact:

- link between need/funding request and program;
- ProgramPipeline updated;
- evidence entry.

#### 8. Mobilize partner

CTA: `Mobiliser un partenaire`

Open `PartnerMobilizationForm`.

Fields:

- partner;
- support type: financing, technical, equipment, training;
- requested contribution;
- expected response date;
- note to partner;
- responsible owner.

Generated artifact:

- partner solicitation note;
- partner status: draft, sent, in discussion, confirmed, declined;
- ActionRegister entry.

#### 9. Prepare institutional note

CTA: `Préparer une note institutionnelle`

Open `InstitutionalNoteBuilder` from Pilotage.

Steps:

1. Choose scope and period.
2. Auto-select key metrics, alerts, recommendations, funding opportunities.
3. Edit decision summary.
4. Preview note.
5. Generate export.

Generated artifact:

- institutional note preview;
- downloadable text/html report if PDF not feasible;
- evidence record.

Value:

- gives the ministry an actual decision support deliverable.

#### 10. Institutional export

CTA: `Export institutionnel`

Extend ExportPanel for global exports.

Options:

- synthesis report;
- raw data CSV;
- proof register;
- funding opportunity register.

Must generate a visible artifact or downloadable simulated file.

## Axis 3 — Improve the three spaces

### A. Atlas maritime

Make Atlas an operational surveillance and verification space.

Add/improve:

- pirogue trajectories;
- incidents layer distinct from alerts;
- selected object visual treatment;
- mini trend/sparkline in ContextPanel;
- verification workflow accessible in max two clicks;
- exportable and filterable event register;
- stronger sea/ocean visual identity.

Acceptance:

- Atlas must answer: can the ministry trust this data and act on it?

### B. Filiere & programmes

This is the most important functional repositioning.

Replace the current single pipeline emphasis with four blocks:

1. `Portefeuille de besoins`
   - MetricRow with:
     - number of qualified needs;
     - total estimated amount;
     - needs by category;
     - number of ready-to-fund opportunities.

2. `Pipeline de valorisation`
   - workflow items with:
     - estimated amount;
     - maturity score;
     - status;
     - next action.

3. `Opportunités de financement`
   - partner/funder matching;
   - compatible needs;
   - amount requested;
   - expected impact;
   - CTA: create funding request, mobilize partner.

4. `Preuves d’impact`
   - impact-oriented EvidenceTimeline;
   - proof linked to programs;
   - credibility for funding dossiers.

This workspace must show that Mbambulaan can structure funding by turning field needs into mature, documented, partner-ready opportunities.

### C. Pilotage institutionnel

Make it high-level and decision-oriented.

At the top, replace raw KPI opening with a written synthesis sentence:

Example:

> Aujourd'hui : 8 quais actifs, 5 alertes ouvertes, 2 vérifications en retard et 3 opportunités de financement prêtes à instruire.

Then show:

- 3 to 5 action priorities maximum;
- each priority has a direct action;
- recommended decisions written in human language;
- summary by region/quay with trend indicator;
- institutional note builder as primary output;
- funding opportunities should appear in high-level steering.

Acceptance:

- a director with 20 seconds must understand what needs to be done today.

## Data requirements

If existing mock data is insufficient, extend `src/data/ministryControlTowerData.ts` carefully.

Add mock structures if needed:

- incidents;
- fundingRequests;
- fundingOpportunities;
- partnerRegistry;
- needMaturityScores;
- generatedDocuments;
- workflowProofs;
- trends/sparklines.

Keep data local and deterministic.

## Document generation

Do not over-engineer PDF if difficult.

Acceptable minimum:

- generated document preview in UI;
- downloadable `.txt`, `.json`, `.csv`, or `.html` file using client-side Blob;
- EvidenceTimeline entry showing document generated.

The point is to demonstrate the artifact, not build a production document engine.

## Testing

Run:

```bash
npm run typecheck
npm run build
```

Fix all errors.

Manually verify in code logic that:

- each of the 10 CTAs opens a workflow, page, or panel;
- each workflow has a validation step;
- each workflow generates a proof/document/action record;
- Filiere & programmes shows total estimated funding amount without extra click;
- there is at least one visible need-to-partner/funder match;
- Pilotage opens with a written synthesis sentence;
- Atlas still works with layer toggles and selection;
- generated documents are visible and downloadable if implemented.

## Acceptance criteria

V2 is accepted only if:

1. No key CTA ends with only a notification.
2. `Créer une demande de financement` works end-to-end and creates a visible funding dossier.
3. Filiere & programmes clearly shows community/value-chain valorization and financing potential.
4. Pilotage institutionnel reads like a decision cockpit, not a KPI dashboard.
5. Atlas feels more maritime and more operational.
6. The product better demonstrates value for a ministry, a funder, and a technical director.
7. `npm run typecheck` passes.
8. `npm run build` passes.

## Final response expected from Codex

At the end, summarize:

- audit findings;
- files changed;
- components created;
- data structures added;
- workflows implemented;
- documents/exports implemented;
- maritime identity changes;
- improvements to Atlas;
- improvements to Filiere & programmes;
- improvements to Pilotage institutionnel;
- typecheck result;
- build result;
- known limits.