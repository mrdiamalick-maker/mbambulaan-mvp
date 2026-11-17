# CURRENT SPRINT — T01 — WhatsApp Transport + Terrain Intake Foundation

Status: READY FOR IMPLEMENTATION
Branch: `product/whatsapp-revenue-mvp`

## 1. Sprint objective

Connect a real or sandbox WhatsApp conversation to the existing Mbàmbulaan platform without coupling WhatsApp to the business domain.

At the end of T01:
1. a message can be received from WhatsApp;
2. Mbàmbulaan identifies or creates a minimal actor;
3. the message is persisted as a terrain interaction;
4. the platform can display the received interaction;
5. Mbàmbulaan can send a reply;
6. the conversation history remains traceable.

T01 is infrastructure + first user loop. It does **not** implement the Revenue matching engine yet.

## 2. Required repository analysis before coding

Before making changes, inspect:
- current domain objects in `src/domain`;
- current coordination objects and flows;
- existing terrain/local draft implementation;
- API command patterns;
- repository/persistence abstraction;
- outbox implementation;
- session/permissions architecture;
- existing actor/member/site/territory models.

Reuse existing concepts where semantically correct. Do not create duplicates only to satisfy this sprint.

Document any domain conflict in IMPLEMENTATION_LOG before introducing a new concept.

## 3. Channel architecture

Introduce a channel-agnostic conversation boundary.

Target conceptual separation:

`Channel Adapter → Conversation Intake → Domain Mapping → Existing Mbàmbulaan domain`

Do not let WhatsApp-specific payloads leak into core domain objects.

Recommended concepts, names may adapt to existing code:
- CommunicationChannel
- ExternalContact
- Conversation
- InboundMessage / Interaction
- ChannelAdapter
- WhatsAppAdapter

If equivalent concepts already exist, reuse them.

## 4. WhatsApp integration

Preferred target: Meta WhatsApp Business Platform / Cloud API.

Requirements:
- webhook verification endpoint;
- inbound text-message webhook handling;
- outbound text response capability;
- idempotent webhook processing;
- raw provider event retained for debugging/audit, with sensitive handling appropriate to current project patterns;
- environment-variable based configuration;
- no provider secret committed to repository.

If live Meta credentials are unavailable:
- implement the adapter and webhook contract;
- include a deterministic local/sandbox fixture;
- prove the complete flow using fixture/API tests;
- clearly mark what is still blocked by external credentials.

Do not replace the product architecture with a third-party inbox product.

## 5. Minimal actor onboarding

When an inbound WhatsApp number/contact is unknown, create a minimal pending actor/contact record.

Do not demand full registration before accepting a message.

Collect progressively:
1. preferred/display first name;
2. role;
3. main territory/site.

The actor may submit the original message before onboarding is complete. Preserve it.

Roles should reuse existing Mbàmbulaan role/domain vocabulary where possible. Do not invent ten new product personas.

## 6. Terrain interaction

Every accepted inbound text must result in a traceable terrain interaction.

Minimum fields or equivalent existing model mapping:
- id;
- external message/provider id;
- actor/contact reference;
- channel = whatsapp;
- conversation reference;
- original/raw text;
- receivedAt;
- territory/site when known;
- evidenceStatus = DECLARED by default;
- processingStatus;
- intent = UNCLASSIFIED for T01;
- source/provenance metadata.

Do not classify SIGNAL / NEED / OBSERVATION / CAPACITY yet.

## 7. Platform UI

Add or adapt a simple internal Terrain/inbox view inside the existing authenticated product.

The operator must be able to see:
- actor/contact;
- role when known;
- territory/site when known;
- message;
- timestamp;
- channel;
- evidence status;
- processing/onboarding status.

Use existing design system.

Do not build a new standalone application.

## 8. Outbound response

Support one basic response path from Mbàmbulaan to the WhatsApp contact.

At minimum:
- onboarding prompt when required;
- generic acknowledgement once intake is stored.

Keep message templates/configuration outside core domain logic.

Do not implement AI-generated replies in T01.

## 9. Persistence

The feature must work with the current repository abstraction.

Because the README states that production usage requires PostgreSQL:
- add persistence changes/migration if required;
- ensure deterministic demo mode still works;
- do not assume serverless in-memory state.

## 10. Media readiness

T01 only processes text content functionally.

However, inbound provider parsing must not crash on:
- audio;
- image;
- unsupported media.

Store enough metadata to support T02 media processing or mark the interaction as media-pending.

Do not implement transcription or vision yet.

## 11. Security / privacy minimum

- secrets only through environment variables;
- validate webhook authenticity/signature according to provider requirements;
- avoid logging full personal conversation payloads unnecessarily;
- preserve existing permission model;
- no public access to terrain inbox;
- phone/contact identifiers treated as personal data.

## 12. Tests required

At minimum:
- webhook verification;
- inbound text fixture creates exactly one interaction;
- duplicate provider event is idempotent;
- unknown contact creates/persists minimal actor/contact state;
- known contact reuses identity;
- demo mode compatibility;
- PostgreSQL repository path if schema changes;
- outbound adapter call contract;
- unsupported audio/image event does not crash;
- existing test suite remains green.

Run:
`npm run lint`
`npm run typecheck`
`npm test`
`npm run build`
`git diff --check`

Run E2E if the environment supports it.

## 13. Acceptance scenario

A successful demonstration must support this flow:

1. contact +221XXXXXXXXX sends: "J'ai besoin de glace aujourd'hui à Mbour."
2. webhook receives the event;
3. provider message is processed exactly once;
4. a conversation/contact exists;
5. raw message is persisted with DECLARED evidence;
6. interaction is visible in the Terrain/inbox view;
7. if actor profile is incomplete, Mbàmbulaan sends a minimal onboarding question;
8. operator can inspect the message inside the existing platform.

T01 does not yet interpret this as a NEED.

## 14. Explicit out of scope

Do not build:
- speech-to-text;
- language detection;
- image recognition;
- LLM intent classification;
- automated matching;
- provider search;
- payment;
- subscriptions;
- marketplace screens;
- State-space redesign;
- Public-space redesign.

These are future sprints.

## 15. Required completion handoff

Before marking T01 done, update `docs/product/IMPLEMENTATION_LOG.md` with:
- completion status;
- final commit SHA;
- files created/modified;
- domain concepts reused/added;
- database migration;
- environment variables required;
- provider setup steps;
- tests executed and results;
- screenshots/routes for manual review;
- external blockers;
- deviations from CURRENT_SPRINT and why;
- known debt to handle in T02.

Do not silently change product scope.
