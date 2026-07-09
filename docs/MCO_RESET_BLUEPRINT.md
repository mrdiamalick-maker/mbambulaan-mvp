# MCO Reset Blueprint

We restart the private space design from zero.

Do not use previous iterations as visual reference. Keep only the business logic: quays, pirogues, landings, alerts, needs, programs, partners and institutional steering.

Product direction: Mbambulaan Maritime Coordination OS.

Mbambulaan is not a website, not an admin panel, not a marketplace and not an ERP. It is a coordination console for Senegal artisanal fishing.

## Target application

Private space must become a horizontal product console with three workspaces:

1. Maritime Atlas
2. Value Chain and Communities
3. Institutional Steering

Layout target:

Topbar: Mbambulaan, ministry context, period, search, export, demo status.
Left rail: three workspaces.
Center: active workspace.
Right panel: selected object, next action, decision.

No marketing hero inside the console. No stacked card dashboard. No generic admin layout.

## Workspace 1: Maritime Atlas

Purpose: understand where activity happens.

Flow: global view -> layers -> filters -> select quay or pirogue -> detail -> action.

Required components:
- dominant map area;
- layer controls: quays, pirogues, landings, alerts;
- filters: region, quay, species, status;
- view switch: quay view and pirogue view;
- selected object panel;
- event timeline;
- actions: verify declaration, create alert, view landings, export zone summary.

If possible, integrate Leaflet or MapLibre. If not, build a much stronger cartographic prototype, but it must look like an operational map tool, not an illustration.

## Workspace 2: Value Chain and Communities

Purpose: transform field needs into programs and actions.

Flow: field need -> qualification -> initiative/program -> partner -> action -> impact.

Required components:
- priority needs panel;
- qualification workflow;
- active programs;
- partner matching;
- next decision;
- impact tracking.

This must not be a list of cards. It must feel like an action workflow.

## Workspace 3: Institutional Steering

Purpose: make decisions and export a situation summary.

Flow: situation -> KPI -> anomaly -> analysis -> priority action -> export.

Required components:
- daily situation;
- high-level KPI;
- critical alerts;
- volumes by quay/species/region;
- overdue actions;
- recent landings;
- recommended decisions;
- export action.

This must be a decision cockpit, not a marketing dashboard.

## Local design system

Create or refactor components:
- PrivateAppShell
- PrivateTopBar
- ModuleRail
- WorkspacePanel
- ContextPanel
- MetricTile
- StatusBadge
- LayerToggle
- ObjectDrawer
- ActionButton
- WorkflowLane
- DecisionCard
- EventTimeline
- DataTable

Use a sober maritime palette:
- app background #F4F7F8
- surface #FFFFFF
- navy #062330 and #0B3142
- ocean #0E7490 and #0891B2
- slate #334155 and #64748B
- sand #E8D8A8
- green #0F766E
- amber for attention
- red only for urgent

Design rules:
- moderate radius, not huge rounded cards everywhere;
- thin borders;
- subtle shadows;
- limited gradients;
- dense but readable typography;
- functional colors, not decorative colors;
- every block must support a business decision.

## Pages to rebuild

Rebuild:
- /espace-prive
- /espace-prive/etat

/espace-prive must be a serious institutional access page: short intro, ministry access, three workspaces preview, operational signals, CTA to console, demo note.

/espace-prive/etat must be the actual product console with the horizontal layout above.

## Files likely involved

- src/app/espace-prive/page.tsx
- src/app/espace-prive/etat/page.tsx
- src/components/private-space/MinistryControlTower.tsx
- src/components/private-space/MinistryControlTowerParts.tsx
- src/data/ministryControlTowerData.ts only if useful

## Codex instruction

Read this file and execute the reset.

Do not make a small improvement. Do not keep the old layout. Do not only rename modules. Do not produce another Tailwind cards page.

Deliver a visible design rupture across all private-space components and all three workspaces.

Run:
- npm run typecheck
- npm run build

Fix all errors.

Final acceptance criterion: the result must be showable to a partner without apologizing for design quality.