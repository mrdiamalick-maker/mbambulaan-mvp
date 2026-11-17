# Mbàmbulaan — Decision Log

## 2026-11-17 — D001 — Terrain becomes WhatsApp-first
Decision: WhatsApp is the primary field interface for the first real-user MVP.

Why:
- no app download required;
- low behavioural friction;
- fits current user habits;
- supports text, voice and later images;
- lets Mbàmbulaan meet actors where they already are.

Constraint: the business domain must not depend directly on WhatsApp.

## 2026-11-17 — D002 — Voice-first is a product requirement
Decision: voice notes are a first-class interaction mode, not a later accessibility add-on.

Why:
- many future users may not prefer French;
- literacy and typing must not be prerequisites;
- natural oral usage is important in field conditions.

Implementation sequencing: text transport can ship first, but architecture must support media from Sprint T01 onward.

## 2026-11-17 — D003 — Images are planned, not in T01
Decision: image understanding is part of the target product but excluded from the first transport sprint.

Future uses:
- equipment issues;
- landing/product context;
- infrastructure state;
- supporting evidence.

AI image output never equals VERIFIED status automatically.

## 2026-11-17 — D004 — Revenue MVP focuses on need/capacity matching
Decision: the first commercial value loop is matching a terrain need with a professional capacity/service.

Initial examples:
- ice/cold;
- transport;
- buyer/outlet.

Why: this can generate immediate operational value and creates a plausible paying side.

## 2026-11-17 — D005 — State sponsorship is no longer a launch dependency
Decision: institutional partnerships remain strategic, but product adoption and revenue validation proceed independently.

## 2026-11-17 — D006 — Existing Mbàmbulaan platform is preserved
Decision: do not rebuild from scratch. The Revenue MVP must extend the current shared domain and interfaces.

## 2026-11-17 — D007 — Repository becomes the shared coordination layer between product lead and coding AI
Decision: product context, sprint scope and implementation state must be documented in-repo.

Canonical files:
- docs/product/PRODUCT_BASELINE.md
- docs/product/DECISION_LOG.md
- docs/product/CURRENT_SPRINT.md
- docs/product/IMPLEMENTATION_LOG.md

Important: decisions must not exist only in chat histories.


## 2026-11-17 — D008 — Onboarding messages are not operational terrain interactions
Decision: onboarding answers (name, role, site/territory) stay in conversation history but do not appear as operational TerrainInteractions.

The initial substantive message that triggered onboarding is preserved as an operational interaction.

Why: the terrain inbox must represent field information, not profile-completion chatter.

## 2026-11-17 — D009 — T02 adds multimodal intelligence behind a provider-agnostic boundary
Decision: voice transcription, language handling, image understanding and terrain-intent interpretation are implemented through an intelligence abstraction outside the core domain.

Why:
- runtime AI provider may change;
- Claude is the coding agent, not necessarily the runtime model;
- domain logic must survive provider replacement;
- field usage requires text, voice and image without forcing French.

## 2026-11-17 — D010 — AI interpretation never equals verification
Decision: AI can classify, extract and suggest, but cannot silently promote an interaction to VERIFIED.

Original content and provenance must remain available, and uncertain interpretations must be reviewable/correctable by a human.
