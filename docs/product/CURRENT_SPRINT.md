# CURRENT SPRINT — T04 — Live Pilot Readiness + Commercial Validation

Status: READY FOR IMPLEMENTATION
Branch: `product/whatsapp-revenue-mvp`
Depends on: T03 accepted

## 1. Sprint objective

Move the Revenue MVP from deterministic/tested architecture to a product that can be used by real actors in Dakar/Senegal.

At the end of T04, the team must be able to onboard real WhatsApp users, process real text/voice/image interactions, create real needs/capacities, run the T03 coordination loop, and measure pilot/commercial usage.

This sprint is about **production readiness for a small field pilot**, not adding broad product scope.

## 2. Critical live gaps to close

The following are currently NOT proven live and must be addressed:

1. live Meta WhatsApp Business / Cloud API connectivity;
2. live text send/receive;
3. live media download from Meta;
4. real text/image intelligence provider invocation;
5. real speech-to-text provider for voice notes;
6. operational error visibility for pilot support;
7. minimal pilot metrics and actor management;
8. privacy/consent wording appropriate for real users.

## 3. WhatsApp live configuration

Keep the existing provider abstraction.

Add production-ready configuration/documentation for:
- Meta app;
- WhatsApp Business account/number;
- webhook URL;
- verify token;
- app secret;
- permanent/system-user access token where appropriate;
- phone number id;
- required webhook subscriptions.

Add a startup/configuration health check that can tell an administrator whether:
- inbound webhook is configured;
- outbound messaging credentials are present;
- media retrieval is configured.

Never expose secret values in UI/logs.

## 4. Real speech-to-text

T02 left a genuine capability gap: Anthropic adapter does not transcribe audio.

Choose and implement one real speech-to-text provider behind the existing intelligence abstraction.

Selection criteria:
- reliable API;
- acceptable cost for 10–30 pilot users;
- audio formats compatible with WhatsApp voice notes;
- multilingual capability;
- ability to test French immediately;
- Wolof must be treated honestly: only claim support if demonstrated with real samples.

The provider choice must be documented in IMPLEMENTATION_LOG with:
- pricing model at implementation date;
- supported formats/languages claimed by provider;
- actual tested languages;
- fallback/error behaviour.

Do not couple the domain to the provider.

## 5. Real intelligence validation

The existing real text/image provider path must be exercised with real API credentials before T04 can be marked fully live-ready.

Validate:
- NEED;
- CAPACITY;
- SIGNAL;
- OBSERVATION;
- ambiguous/UNCLASSIFIED;
- image with useful caption;
- image without enough context.

Record actual outputs in test/QA notes without committing personal data or secrets.

If Anthropic remains the provider, use the existing adapter boundary. If another provider is chosen, preserve the same boundary.

## 6. Voice flow

Real acceptance path:

WhatsApp voice note
→ Meta media retrieval
→ speech-to-text provider
→ transcription persisted
→ language metadata if available
→ terrain interpretation
→ NEED/SIGNAL/OBSERVATION/CAPACITY
→ confirmation/review when uncertain
→ visible in Terrain UI.

No manual upload step should be required in the real pilot path.

## 7. WhatsApp-side confirmation responses

T02 sends clarification/confirmation prompts but does not process a user's "oui/non" response as a confirmation.

Implement a minimal deterministic confirmation state for real pilot usability.

Examples:
- Mbàmbulaan asks: "J'ai compris que vous cherchez de la glace à Mbour aujourd'hui. C'est bien cela ?"
- user replies "Oui" → confirm current pending interpretation;
- user replies "Non" → mark for clarification/review and ask a short follow-up.

Requirements:
- only treat yes/no as confirmation when a conversation has an explicit pending confirmation;
- never interpret arbitrary "oui" messages out of context;
- support common simple variants in French;
- Wolof confirmation variants may be added only if validated with the product owner/real users, not guessed.

Keep full conversation trace.

## 8. Pilot actor management

Add a minimal internal pilot view or extend existing admin/terrain UI to show:

- actor;
- phone/contact;
- role;
- territory/site;
- onboarding completeness;
- last interaction;
- number of substantive interactions;
- needs created;
- capacities created;
- coordinations initiated/completed;
- whether provider-side value has been received.

Do not build a CRM.

## 9. Pilot metrics

Expose a compact internal pilot scorecard derived from real state, at minimum:

- onboarded actors;
- active users (at least one substantive interaction);
- substantive interactions;
- NEED count;
- CAPACITY count;
- matches proposed;
- coordinations initiated;
- successful coordinations;
- provider organisations/actors receiving opportunities.

Where possible, distinguish:
- demo/fixture data;
- real pilot data.

Do not fabricate analytics precision.

## 10. Commercial validation fields

For provider-side actors/organisations, add minimal commercial research fields or an adjacent pilot record:

- contacted for pilot: yes/no;
- pilot participation accepted: yes/no;
- willingness-to-pay asked: yes/no;
- willingness-to-pay response: yes/no/maybe;
- indicative amount mentioned, optional;
- note.

This is research evidence, not a subscription system.

Do not create invoices/payments.

## 11. Real-data safeguards

Before real pilot usage:

- clearly flag demo vs real records;
- avoid mixing simulated data into real pilot metrics;
- add consent/privacy notice in the first-contact/onboarding flow;
- disclose that Mbàmbulaan may process text, voice and images to provide the service;
- provide a simple mechanism/flag to stop pilot communications for a contact;
- do not expose actor phone numbers outside authorised internal views.

Keep wording simple and field-appropriate.

## 12. Operational resilience

For real pilot support, provide an internal way to see:
- failed inbound processing;
- failed transcription;
- failed AI interpretation;
- failed outbound WhatsApp sends;
- pending human review.

Allow retry where technically safe.

Do not build a full observability platform.

## 13. Tests required

At minimum:

### WhatsApp live-path contracts
- text webhook path regression;
- media download contract;
- outbound send contract;
- missing/expired credentials produce explicit admin-visible failure.

### Speech-to-text
- provider adapter success;
- provider adapter error;
- unsupported/unknown language handling;
- audio pipeline preserves original interaction on failure.

### Confirmation
- pending confirmation + "Oui" confirms;
- pending confirmation + "Non" routes to review;
- "Oui" with no pending confirmation remains a normal/unclassified message, never mutates previous interaction.

### Pilot metrics
- counts derive correctly;
- demo and real-pilot records can be distinguished;
- successful coordination increments success metrics.

### Commercial research
- willingness-to-pay research fields can be recorded and audited;
- no billing/subscription side effect.

### Regression
- T01–T03 suites remain green.

Run:
`npm run lint`
`npm run typecheck`
`npm test`
`npm run build`
`git diff --check`

Run E2E.

## 14. Live acceptance checklist

T04 is not fully accepted until the following have been demonstrated with real credentials:

1. a real WhatsApp user sends a text to the Mbàmbulaan number;
2. Mbàmbulaan receives and stores it;
3. Mbàmbulaan sends a reply to that same real user;
4. a real voice note is received and transcribed;
5. the transcription is interpreted and visible in Terrain;
6. a real image is received and analysed, without automatic verification;
7. at least one NEED and one CAPACITY can enter the T03 matching loop.

If credentials cannot be provisioned in the coding environment, implementation may be marked CODE COMPLETE but not LIVE ACCEPTED. Document exact remaining activation steps.

## 15. Pilot target

The product should be ready to support the founder's initial Dakar field target:

- 10–30 real actors onboarded;
- multiple roles, not only fishermen;
- at least 3 provider-side actors;
- initial focus: ice/cold, transport, buyer/outlet;
- at least one real coordination attempted;
- willingness-to-pay question asked to provider-side participants.

## 16. Explicit out of scope

Do not build:
- automated payment;
- subscription enforcement;
- marketplace;
- public catalogue;
- autonomous matching;
- large CRM;
- sophisticated BI/dashboard suite;
- call-center/IVR;
- full Wolof conversational agent;
- State/Public redesign.

## 17. Required implementation handoff

Append T04 to `docs/product/IMPLEMENTATION_LOG.md` with:
- completion status: CODE COMPLETE vs LIVE ACCEPTED;
- final commit SHA;
- speech-to-text provider chosen and why;
- provider costs/pricing reference captured at implementation time;
- live Meta setup status;
- live AI setup status;
- tested languages;
- pilot metrics implementation;
- consent/privacy implementation;
- commercial research fields;
- tests/results;
- exact live activation steps remaining;
- deviations;
- blockers;
- recommendation for first Dakar pilot day.

Do not call the Revenue MVP live-ready unless the real acceptance checklist has been exercised.
