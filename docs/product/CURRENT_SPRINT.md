# CURRENT SPRINT — T03 — Need/Capacity Matching + First Coordination Loop

Status: READY FOR IMPLEMENTATION
Branch: `product/whatsapp-revenue-mvp`
Depends on: T02 accepted

## 1. Sprint objective

Build the first end-to-end coordination loop that can create economic value.

At the end of T03:

1. a terrain interaction classified as NEED can become a structured active need;
2. a terrain interaction classified as CAPACITY can become a structured available capacity;
3. Mbàmbulaan can identify relevant matches between them;
4. an authorised operator can review and trigger a coordination;
5. both sides can be notified through the existing channel abstraction;
6. the coordination outcome can be tracked;
7. the platform can measure whether Mbàmbulaan created a useful connection.

This is the first Revenue MVP loop.

T03 does not implement payments or subscriptions.

## 2. Product principle

Mbàmbulaan is not a marketplace.

Matching is a coordination capability, not a public listing/catalogue.

The product must answer:

- who needs what?
- who can provide it?
- where?
- when?
- how compatible are they?
- can Mbàmbulaan initiate a useful coordination?
- did it result in an outcome?

Do not create a generic marketplace browse/search experience.

## 3. Reuse existing domain before creating new objects

Before coding, inspect the current domain for:
- ServiceRequest;
- PartnerService / provider capacities;
- Opportunity;
- Coordination;
- Commitment / Engagement;
- Infrastructure available capacity;
- Actor / Organization / Territory / Site;
- any existing need/capacity matching logic.

The repository already has substantial coordination concepts. T03 must connect the new TerrainInteraction pipeline to them rather than creating a parallel mini-product.

If a new object is needed, document why existing domain objects are insufficient in IMPLEMENTATION_LOG.

## 4. Promote interpreted interactions into business objects

### NEED

When a `TerrainInteraction` has:
- intent = `besoin`;
- a valid interpretation;
- sufficient structured information;
- and no blocking human-review condition;

the system must support creating/reusing the canonical domain object representing an active need/request.

Minimum useful attributes:
- source interaction id;
- requesting actor;
- organization if known;
- territory/site;
- subject/category;
- quantity/unit if known;
- required time window if known;
- createdAt;
- status;
- provenance / evidence link.

Do not fabricate missing values.

### CAPACITY

When a `TerrainInteraction` has:
- intent = `capacite`;
- a valid interpretation;
- sufficient structured information;

the system must support creating/reusing the canonical domain representation of a provider/resource/service capacity.

Minimum useful attributes:
- source interaction id;
- provider actor / organization;
- territory/site;
- subject/category;
- quantity/unit if known;
- availability window if known;
- createdAt;
- status;
- provenance / evidence link.

Do not treat every CAPACITY as a permanent provider catalogue entry. A statement such as "mon camion est libre aujourd'hui" is time-bounded.

## 5. Initial commercial categories

For T03, matching quality matters more than breadth.

Support explicitly these first categories:

1. **Glace / froid**
   - ice supply;
   - cold storage / available cold capacity.

2. **Transport**
   - fish/logistics transport.

3. **Acheteur / débouché**
   - buyer/outlet demand and available buying interest.

The architecture may remain extensible, but do not implement a generic ontology engine.

## 6. Matching engine

Matching must be deterministic/explainable in T03.

Do not let an LLM directly decide that two actors should be connected.

A match should consider, when available:
- compatible subject/category;
- territory/site proximity or same territory;
- time-window overlap;
- compatible quantity/unit;
- active status;
- provider/requester are not the same actor;
- provider capacity is not expired;
- trust/evidence status as a reason/flag, not an opaque score.

Output should include:
- need id;
- capacity/provider id;
- match status;
- human-readable reasons;
- warnings/gaps;
- createdAt;
- optional simple priority level.

Do not invent a pseudo-scientific 0-100 score unless the current domain already has a justified equivalent.

## 7. Human-in-the-loop

T03 must not automatically connect people solely because a match exists.

An authorised Mbàmbulaan operator must be able to:

- review the need;
- review candidate capacity/providers;
- see why each candidate matches;
- reject a bad match;
- select a candidate;
- initiate coordination.

Later automation may be added after field validation.

## 8. Coordination initiation

When an operator initiates coordination:

1. create/reuse the canonical Coordination/Commitment/Engagement domain object;
2. link it to:
   - source need;
   - selected provider/capacity;
   - requesting actor;
   - provider actor/organization;
   - territory;
   - originating TerrainInteraction(s);
3. create outbound notification intents for both sides.

Example requester message:
"Mbàmbulaan a identifié une possibilité pour votre besoin de glace à Mbour. Souhaitez-vous être mis en relation ?"

Example provider message:
"Un acteur à Mbour recherche de la glace aujourd'hui. Souhaitez-vous recevoir la demande ?"

Use concise configurable templates. Do not expose personal contact details until the coordination step authorises it.

## 9. Channel notification

Use the existing channel abstraction.

For WhatsApp contacts:
- send a clear notification;
- preserve outbound conversation history;
- persist delivery attempt/status where architecture supports it;
- provider failure must not lose the coordination object.

If live WhatsApp credentials are not available, deterministic adapter tests are acceptable, but the handoff must clearly distinguish live vs fixture validation.

## 10. Coordination statuses

Reuse existing statuses if available.

The loop must support at least the semantic equivalents of:

- proposed;
- requester accepted / declined;
- provider accepted / declined;
- connected;
- completed;
- failed/cancelled.

Avoid introducing a new status model if existing coordination/engagement objects already cover this.

## 11. Outcome capture

This is essential.

For each initiated coordination, allow an operator to record:

- did the connection happen?
- was the need fulfilled?
- quantity/value if known;
- short outcome note;
- failure reason if not fulfilled.

Do not force transaction value when unknown.

This data will later become the foundation for Mbàmbulaan's commercial proof:
- needs detected;
- matches proposed;
- coordinations initiated;
- successful outcomes.

## 12. Revenue evidence, not billing

T03 must expose simple evidence that a professional actor received value.

At minimum, for provider-side actors/organizations track or derive:
- opportunities received;
- opportunities accepted;
- successful coordinations.

Do not implement payment, invoicing, subscription enforcement or commissions yet.

We need proof of willingness-to-pay before billing automation.

## 13. UI

Extend existing Coordination / Terrain spaces rather than creating a marketplace.

Minimum operator workflow:

### From Terrain
Interaction NEED/CAPACITY
→ "Créer/qualifier en besoin/capacité" if required
→ link to resulting business object.

### In Coordination
Need
→ candidate matches
→ reasons/warnings
→ select provider
→ initiate coordination
→ follow status/outcome.

Keep UI operational and compact.

## 14. Idempotence / provenance

The same TerrainInteraction must not create duplicate needs/capacities if retried.

Every promoted object must retain source TerrainInteraction provenance.

Every coordination must be traceable back to:
- need;
- capacity/provider;
- original interactions.

## 15. Tests required

At minimum:

### Promotion
- NEED interaction creates exactly one canonical need;
- duplicate promotion does not duplicate;
- CAPACITY interaction creates exactly one capacity representation;
- missing required data routes to review, not fabricated data.

### Matching
- ice need at Mbour matches active ice/cold capacity in Mbour;
- expired capacity does not match;
- transport need does not match cold storage;
- actor does not match themselves;
- time mismatch produces warning or exclusion according to explicit rule;
- quantity mismatch is explained.

### Coordination
- operator can select valid match and initiate coordination;
- notifications generated for both sides;
- duplicate initiation is idempotent;
- provider/requester acceptance updates coordination;
- outcome can be recorded;
- failed notification does not delete coordination.

### Regression
- T01 webhook/idempotence remains green;
- T02 intent/media/AI tests remain green;
- evidence status is never silently promoted.

Run:
`npm run lint`
`npm run typecheck`
`npm test`
`npm run build`
`git diff --check`

Run E2E where supported.

## 16. Acceptance scenario — first revenue-value loop

### Actors
- Awa, mareyeuse in Mbour, known WhatsApp actor.
- Froid Mbour, professional cold/ice provider.

### Inbound need
Awa sends:
"J'ai besoin de glace aujourd'hui à Mbour."

Expected:
- T02 classifies NEED;
- canonical active need exists;
- source interaction retained.

### Inbound capacity
Provider sends:
"Nous avons de la glace disponible aujourd'hui à Mbour."

Expected:
- T02 classifies CAPACITY;
- active capacity exists;
- source interaction retained.

### Match
Expected:
- Mbàmbulaan identifies a candidate match;
- reason includes compatible category + Mbour + compatible time window;
- operator can review it.

### Coordination
Operator selects the match and initiates coordination.

Expected:
- coordination object exists;
- requester/provider notifications are generated;
- both source interactions remain traceable;
- operator can record final result.

### Outcome
Operator records:
"Besoin satisfait."

Expected:
- coordination marked successful/completed;
- provider-side value evidence increments.

This full scenario must be demonstrable without a marketplace.

## 17. Explicit out of scope

Do not build:
- payments;
- commissions;
- subscription enforcement;
- automated billing;
- public marketplace/catalogue;
- AI-autonomous matching;
- bidding/auction;
- delivery fleet;
- escrow;
- ratings/reviews;
- complex geospatial routing;
- State/Public redesign.

## 18. Required implementation handoff

Append T03 to `docs/product/IMPLEMENTATION_LOG.md` with:
- completion status;
- final commit SHA;
- existing domain concepts reused;
- new domain concepts and justification;
- matching rules;
- coordination workflow/status mapping;
- notification behaviour;
- tests/results;
- manual review routes;
- live vs fixture validation;
- known blockers;
- deviations;
- debt/preparation for T04 commercial validation.

Do not mark T03 DONE solely because objects exist. The full acceptance scenario must pass end-to-end.
