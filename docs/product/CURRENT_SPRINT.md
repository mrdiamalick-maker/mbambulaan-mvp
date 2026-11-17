# CURRENT SPRINT — T02 — Voice + AI Understanding + Structured Terrain Intent

Status: READY FOR IMPLEMENTATION
Branch: `product/whatsapp-revenue-mvp`
Depends on: T01 accepted

## 1. Sprint objective

Turn Mbàmbulaan Terrain from a transport/inbox feature into an intelligent field intake.

At the end of T02, Mbàmbulaan must be able to receive a **text, voice note or image** from WhatsApp, preserve the original content, derive a structured interpretation, and classify the business intent as one of:

- SIGNAL
- NEED
- OBSERVATION
- CAPACITY

The output must remain explainable, auditable and reversible. AI assistance must never silently create a VERIFIED fact.

T02 does **not** implement automated matching or payments. That is T03.

## 2. Product correction inherited from T01

T01 stored every onboarding answer as a `TerrainInteraction`. Product review rejects that behaviour for the operational inbox.

New rule:
- the initial substantive message from an unknown contact remains a `TerrainInteraction`;
- answers whose only purpose is onboarding (name, role, territory/site) remain in `Conversation.messages`;
- onboarding answers must **not** appear as operational terrain interactions;
- once onboarding is complete, subsequent substantive messages again create terrain interactions.

Do not delete conversation history. The correction concerns only operational interaction creation/projection.

Add tests for this exact rule.

## 3. AI boundary

Introduce an AI/intelligence abstraction independent from WhatsApp and from any one model provider.

Target conceptual flow:

`Channel Adapter → Media/Text Normalisation → Intelligence Adapter → Structured Interpretation → Domain Update`

The core domain must not import a vendor SDK.

Suggested boundary, adapt names to project conventions:
- `IntelligenceAdapter`
- `transcribeAudio(...)`
- `analyseImage(...)`
- `interpretTerrainMessage(...)`

Provider-specific code belongs outside `src/domain`.

If a provider is configured, use it through environment variables.
If no provider credentials are available, deterministic fixtures/mocks must allow the complete flow to be tested without fabricating production success.

Do not hard-code business logic into prompts only. Validate AI output against strict runtime schemas before applying it.

## 4. Supported input types

### 4.1 Text
Use the original inbound text.

### 4.2 Audio / voice note
For a WhatsApp audio message:
1. retrieve media metadata/file through the provider API;
2. persist provider/media reference safely;
3. transcribe audio through the intelligence adapter;
4. preserve the original audio reference and the transcription;
5. run the transcription through terrain interpretation;
6. mark the interaction as processed only after a valid structured interpretation exists.

The product must work when the spoken language is not French.

Target languages for the first real pilot:
- French;
- Wolof where the chosen transcription/model genuinely supports it;
- unknown/other must remain a valid state rather than being forced to French.

Do not claim Wolof support if the chosen runtime provider cannot demonstrate acceptable transcription. Expose language + confidence/uncertainty.

### 4.3 Image
For a WhatsApp image:
1. retrieve the media;
2. preserve the media/provider reference;
3. analyse image content through the intelligence adapter;
4. if caption/text exists, combine it with image analysis;
5. produce a proposed interpretation;
6. never treat visual inference alone as VERIFIED.

Examples:
- equipment appears damaged;
- ice machine/photo of equipment;
- landing/product context;
- infrastructure state.

The system must describe uncertainty. "Looks like" is not verification.

## 5. Structured terrain interpretation

Extend `TerrainInteraction` or introduce one tightly-linked interpretation object. Avoid duplicate source-of-truth objects.

Minimum structured output:

- `intent`: SIGNAL | NEED | OBSERVATION | CAPACITY | UNCLASSIFIED
- `summary`: short human-readable summary
- `language`: detected/declared language when available
- `subject`: free but normalised short concept, e.g. ice, cold storage, transport, buyer, equipment
- `territoryId` when reliably resolvable
- `siteId` when reliably resolvable
- `quantity` optional
- `unit` optional
- `timeWindow` optional
- `confidence` or equivalent bounded score/category for the AI interpretation
- `needsHumanReview`: boolean
- provenance linking back to original message/media/transcription

Important:
- do not fabricate missing quantity, location or date;
- absence is better than invention;
- preserve raw/original content;
- the AI interpretation is not the evidence status.

## 6. Intent definitions

### SIGNAL
A problem, incident, disruption or risk.
Examples:
- "La machine à glace est en panne."
- "Le camion n'est pas venu."

### NEED
An actor is looking for a resource, service, buyer, transport, cold capacity, etc.
Examples:
- "J'ai besoin de glace à Mbour aujourd'hui."
- "Je cherche un camion pour Dakar."

### OBSERVATION
Useful field information without a direct request or available capacity.
Examples:
- "Beaucoup de pirogues sont rentrées ce matin."
- "Le prix du thiof a augmenté."

### CAPACITY
An actor offers/declares an available resource, service or ability.
Examples:
- "J'ai 2 tonnes de froid disponibles."
- "Mon camion est libre demain matin."

### UNCLASSIFIED
Use when the message is conversational, ambiguous or the interpretation cannot safely decide.

Never force one of the four business intents.

## 7. Human confirmation

When confidence is low, key fields are missing, or the interpretation is consequential, Mbàmbulaan must ask a short confirmation/clarification.

Examples:
- "J'ai compris que vous cherchez de la glace à Mbour aujourd'hui. C'est bien cela ?"
- "Vous signalez une panne de la machine à glace ?"

Do not build an open-ended autonomous agent.

The system may generate/suggest a concise reply, but:
- onboarding still has deterministic priority;
- domain changes must be based on validated structured output;
- clarification must not silently alter the original user statement.

## 8. Terrain UI

Upgrade the existing Terrain interaction view.

For each operational interaction show at minimum:
- actor/contact;
- role if known;
- territory/site if known;
- original message or transcription;
- media type;
- intent badge;
- short interpreted summary;
- subject;
- evidence status;
- AI confidence/review status;
- processing status;
- timestamp.

Provide a way for an authorised operator to:
- confirm the interpretation;
- correct intent and key extracted fields;
- mark interpretation for review.

Human correction must remain auditable.

Do not redesign the full application.

## 9. Evidence / trust rule

Default inbound actor content remains `declaree`.

AI processing does not upgrade evidence status.

An image can support an observation, but does not automatically produce `verifiee`.

Only an existing/explicit authorised human workflow may set VERIFIED.

## 10. Provider/media handling

Extend the WhatsApp adapter to retrieve media safely when configured.

Requirements:
- no long-lived provider secrets in logs/state;
- avoid persisting binary media in the tenant JSON payload if architecture makes that unsafe/heavy;
- persist durable references/metadata appropriate to the current project architecture;
- define a clean storage boundary for media if binary persistence is required;
- media retrieval failures become explicit processing errors/retryable states, not lost messages.

## 11. Failure modes

The following must not lose the original interaction:
- transcription failure;
- unsupported language;
- AI timeout;
- malformed AI JSON;
- image analysis failure;
- provider media download failure;
- ambiguous classification.

In all such cases:
- keep original interaction;
- set explicit processing/review state;
- allow retry/manual handling.

## 12. Tests required

At minimum:

### T01 regression/correction
- first substantive message before onboarding is preserved as terrain interaction;
- name/role/site onboarding answers remain only in conversation history and do not pollute terrain inbox;
- known onboarded contact produces terrain interactions normally.

### Text intelligence
- NEED: "J'ai besoin de glace aujourd'hui à Mbour."
- CAPACITY: "J'ai 2 tonnes de chambre froide disponibles à Mbour aujourd'hui."
- SIGNAL: "La machine à glace du quai est en panne."
- OBSERVATION: "Beaucoup de pirogues sont rentrées ce matin."
- ambiguous conversational message → UNCLASSIFIED or human review, never forced.

### Audio
- audio fixture reaches transcription adapter;
- transcription preserved;
- interpreted result stored;
- transcription failure preserves original interaction and marks failure/review.

### Image
- image fixture reaches vision adapter;
- analysis preserved;
- AI output does not upgrade evidence status;
- analysis failure preserves original interaction.

### Robustness
- malformed intelligence output rejected by schema;
- duplicate provider event still idempotent;
- existing test suite remains green.

Run:
`npm run lint`
`npm run typecheck`
`npm test`
`npm run build`
`git diff --check`

Run E2E where supported.

## 13. Acceptance scenarios

### Scenario A — Text NEED
Known actor sends:
"J'ai besoin de glace aujourd'hui à Mbour."

Expected:
- one terrain interaction;
- intent NEED;
- subject roughly equivalent to ice/glace;
- territory Mbour if resolvable;
- time window today if extractable;
- evidence remains DECLARED;
- visible in Terrain UI.

### Scenario B — Voice NEED
Known actor sends a voice note expressing a need for ice.

Expected:
- media retrieved;
- transcription stored;
- language recorded if detectable;
- intent NEED if interpretation is reliable;
- original media provenance retained;
- visible in Terrain UI.

### Scenario C — Image SIGNAL
Known actor sends a photo of an apparently damaged ice-related machine, optionally with a short caption.

Expected:
- image analysis stored as AI interpretation;
- likely SIGNAL only if evidence/context is sufficient;
- needsHumanReview true when uncertain;
- evidence is never automatically VERIFIED.

## 14. Explicit out of scope

Do not build:
- need ↔ capacity matching;
- automated provider notifications;
- subscriptions/payment;
- marketplace;
- autonomous purchasing/booking;
- State-space redesign;
- Public-space redesign;
- phone-call/IVR integration;
- full multilingual conversational agent;
- semantic knowledge base/RAG.

These belong to later sprints.

## 15. Required implementation handoff

Append a new T02 section to `docs/product/IMPLEMENTATION_LOG.md` containing:
- completion status;
- final commit SHA;
- files created/modified;
- intelligence/provider architecture;
- runtime provider(s) used;
- environment variables;
- media storage/retrieval approach;
- schemas used for structured AI output;
- tests/results;
- manual review routes/screenshots;
- demonstrated language support;
- external blockers;
- deviations and why;
- known debt for T03.

Do not mark T02 DONE merely because mocks pass. Clearly distinguish:
- implemented architecture;
- deterministic test coverage;
- real provider/API validation;
- real WhatsApp validation.
