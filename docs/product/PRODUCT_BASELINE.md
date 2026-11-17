# Mbàmbulaan — Product Baseline

_Last update: 2026-11-17_

## 1. Product thesis

Mbàmbulaan is a Senegalese company building a coordination ecosystem for the artisanal fisheries value chain.

The product must not become a collection of disconnected apps. The same business objects and the same operating reality must connect terrain actors, professional operators, public institutions and the public-facing information layer.

The current commercial priority is no longer to wait for an institutional deployment. Mbàmbulaan must prove that it can create useful coordination and recurring economic value directly with real actors on the ground.

## 2. Current product that must be preserved

The repository already contains a unified platform with:
- public site and public Atlas;
- professional workspace;
- operations;
- coordination;
- markets;
- professional community;
- traceability/durability;
- steering/reporting;
- initiatives/programs;
- organisation and administration;
- API routes, shared domain model, permissions and tests;
- optional PostgreSQL persistence;
- PWA capability and local terrain draft.

Current canonical deployment: https://mbambulaan-product.vercel.app

The existing product is demonstration-first. Data is simulated and non-official unless explicitly stated otherwise.

## 3. New field-entry doctrine

Mbàmbulaan Terrain becomes **WhatsApp-first and voice-first**.

Actors should not be forced to download an app, create a complex account or navigate a web interface to create value.

A terrain actor should be able to:
- send a text message;
- send a voice note;
- later send a photo;
- later call by phone;
- express a need, problem, observation or available capacity in natural language.

WhatsApp is a channel, not the product. The domain must remain channel-agnostic so SMS, phone, web, agents or other channels can be added later.

## 4. Core commercial loop

The first monetisable loop to prove is:

Actor expresses a need or capacity
→ Mbàmbulaan structures it
→ matching identifies a relevant counterpart
→ a coordination can be initiated
→ outcome is tracked
→ a professional actor can pay for qualified opportunities or coordination value.

Initial free side:
- fishermen;
- captains;
- mareyeuses/mareyeurs when acting as requesters;
- terrain actors submitting needs or signals.

Initial paying-side hypotheses to test:
- cold-chain operators;
- ice suppliers;
- transporters;
- structured buyers;
- processors;
- other professional service providers.

Pricing is not fixed. Early hypotheses may be tested manually before payment integration.

## 5. Core intent model

Terrain conversations must eventually classify into four primary intents:

### SIGNAL
A problem or incident.
Example: "The ice machine is down."

### NEED
A request for a resource, service or counterpart.
Example: "I need ice in Mbour today."

### OBSERVATION
Useful field information.
Example: "Many pirogues returned this morning."

### CAPACITY
A resource or service available.
Example: "I have 2 tonnes of cold storage available today."

These are business concepts, not WhatsApp-specific concepts.

## 6. Core actors

Minimum actor dimensions:
- phone/contact channel identifier;
- first name or chosen display name;
- role;
- main territory/site;
- organisation when relevant;
- preferred language when known.

Onboarding must be progressive and minimal.

## 7. Trust doctrine

AI may assist understanding but must not silently convert uncertain content into verified facts.

Evidence states remain meaningful:
- DECLARED: supplied by an actor;
- OBSERVED: supported by an observation, media, agent or corroborating element;
- VERIFIED: confirmed by an authorised human or trusted process.

Original content must remain traceable.

## 8. AI doctrine

AI is an enabling layer, not the product.

Target uses:
- speech-to-text;
- language detection;
- natural-language intent classification;
- structured extraction;
- image understanding;
- suggested responses;
- matching assistance.

Critical decisions and verification remain under human/business rules.

## 9. Revenue doctrine

Mbàmbulaan must become an operating business, not a project dependent on State sponsorship or grants.

Public institutions and development partners remain potential accelerators, clients, funders or partners, but commercial validation must also be pursued independently.

The first proof required is not user count alone. It is a complete value loop with at least one real coordination and, as soon as possible, one real paying customer.

## 10. Non-goals for the Revenue MVP

Do not build now:
- a marketplace;
- integrated payments;
- a new native mobile app;
- autonomous AI decision-making;
- a full redesign of the State space;
- a large new Public feature set;
- specialised Scalite/cold/connectivity engines;
- complex CRM;
- gamification.

## 11. Product invariant

The Revenue MVP is successful only if:

**an actor can express something naturally → Mbàmbulaan can structure it → the information becomes usable by the existing platform → a relevant actor can act on it → the outcome can be followed.**
