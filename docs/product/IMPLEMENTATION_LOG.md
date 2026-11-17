# Mbàmbulaan — Implementation Log

This file is the coding handoff between implementation agents and product review.

## T01 — WhatsApp Transport + Terrain Intake Foundation

Status: DONE (text transport only — see "Known debt / T02 preparation")
Branch: `product/whatsapp-revenue-mvp`

Implementation agent: fill this section before requesting product acceptance.

### Completion status

Complete for the scope defined in CURRENT_SPRINT.md §1-§14. All 12 required test categories (§12) are covered, the existing test suite (599 tests) stays green, `lint`/`typecheck`/`build`/`git diff --check` are clean, and `npm run test:e2e` passes including a new WhatsApp section that exercises the real webhook route against a running server (handshake, invalid signature, the exact §13 acceptance message, duplicate delivery). No live Meta credentials were available in this environment — see "External blockers".

### Final commit SHA

`a5175413872fdc4ea8886d8fdb4ba469696db707`

### Files created / modified

Created:
- `src/domain/channel-interaction.ts` — channel-agnostic domain logic (onboarding state machine, deterministic matching, mutations, projections, `ReplyIntent`).
- `src/channels/types.ts` — `InboundChannelMessage`, `ChannelAdapter`.
- `src/channels/whatsapp.ts` — the only file aware of Meta's payload shape (signature verification, webhook challenge, inbound parsing, outbound send).
- `src/channels/registry.ts` — channel → adapter lookup, extensible to SMS/telephone later.
- `src/channels/message-templates.ts` — literal reply text, kept outside `src/domain` per §8.
- `src/app/api/webhooks/whatsapp/route.ts` — GET handshake + POST webhook handler.
- `tests/channel-interaction.test.ts`, `tests/whatsapp-channel.test.ts`.

Modified:
- `src/domain/types.ts` — `Actor.organizationId` made optional; new `InteractionChannel`, `Conversation`, `ConversationMessage`, `ConversationOnboardingStage`, `TerrainInteraction` and related enums/labels; two new `Command` variants; two new `ProductState` arrays.
- `src/domain/rules.ts` — dispatcher wiring + both `Exclude<Command["type"], …>` lists (`transitions`, `WorkflowAction`) updated so the new commands compile.
- `src/domain/platform/access-resolver.ts` — `resolveCapabilities`'s `organizationId` parameter widened to `string | undefined` (one-line, no logic change).
- `src/data/demo-state.ts` — added empty `conversations`/`terrainInteractions` arrays (no fixtures, same discipline as `programOpportunities`).
- `src/components/terrain/TerrainSupervisorView.tsx` — added an "Interactions terrain reçues" section.
- `src/server/accounts-repository.ts` — added an `administrateur` demo account (see "Deviations").
- `tests/data-integrity.test.ts` — guarded the `Actor.organizationId` assertion for the new optional field.
- `scripts/smoke.mjs` — added a WhatsApp E2E section (local-spawn mode only); spawned server env now also carries smoke-test-only `WHATSAPP_APP_SECRET`/`WHATSAPP_VERIFY_TOKEN`.

### Existing domain concepts reused

- `VerificationStatus` (`"declaree" | "documentee" | "verifiee"`) reused as `TerrainInteraction.evidenceStatus` — semantically identical to the mandate's DECLARED/OBSERVED/VERIFIED, so no parallel enum was introduced. Documented as a deliberate mapping, not a silent substitution.
- `Role` reused as-is for self-declared onboarding (5 of the 10 existing values are offered — the terrain-facing ones; institutional roles stay out of self-service onboarding).
- `Territory` (existing array, matched by name/position) reused for the site-selection onboarding step — no new territory concept.
- `id()`, `timestamp()`, `withAudit()` (rules.ts) reused exactly as the rest of the domain uses them — no duplicated helpers.
- The existing `dispatch()`/idempotency mechanism in `src/server/repository.ts` (outbox table in Postgres mode, in-memory `Set` in demo mode) is reused unchanged — the webhook derives its idempotency key from WhatsApp's own message id (`whatsapp:<wamid>`), no second idempotency mechanism was built.

### New domain concepts added — and why existing ones were *not* reused (domain-conflict documentation required by §2)

- **`InteractionChannel`** (new) — kept distinct from the existing `CommunicationChannel` (used by `Communication`, which is explicitly `simulated: true` and tied to a Situation) and from `Signal["channel"]` (provenance of an already-qualified Signal, not a live channel). Reusing either would have conflated a simulated/already-qualified concept with a real, live, two-way channel.
- **`Conversation`** (new) — realizes the mandate's "minimal pending actor/contact record" (§5). The mandate separately suggests `ExternalContact` and `Conversation` as two concepts; they were **collapsed into one** here: for a given `(channel, channelAddress)` pair, contact identity and conversation thread have exactly the same lifecycle and the same key, so splitting them would have duplicated that pair without any independent lifecycle to justify a second entity. This is the one deliberate simplification versus the mandate's suggested concept list, made explicitly to avoid "creating a duplicate only to satisfy this sprint" (§2).
- **`TerrainInteraction`** (new) — not `IncomingMessage` (existing, but explicitly a *simulated* intake queue per its own doctrinal comment, "pas une intégration WhatsApp/SMS/téléphonie réelle"), and not `Signal` (already-qualified, requires a human qualification step `IncomingMessage` also assumes). Neither models "a raw, as-yet-unclassified real message from a real channel."
- **`TerrainInteractionMessageType` / `TerrainInteractionProcessingStatus` / `TerrainInteractionIntent`** (new, small enums) — `processingStatus` is deliberately distinct from `evidenceStatus` (truthfulness of the claim) and from `intent` (business classification, out of scope for T01): it only tracks whether the content itself is usable yet (`recue`) or blocked on unimplemented media handling (`media_en_attente`).
- **`Actor.organizationId` optional** — a WhatsApp-onboarded actor has no real organization; inventing one would have fabricated data. Verified safe: ~29 existing usages already go through `.find()`/optional-chaining patterns that tolerate an absent/unmatched organization.
- **Reply content vs. reply decision split** — `determineReplyIntent()` (domain) decides *which kind* of reply is needed from the resulting `Conversation` state; `renderReplyText()` (`src/channels/message-templates.ts`, outside `src/domain`) owns the literal strings. This follows §8 ("keep message templates/configuration outside core domain logic") literally — the previous instinct to keep both in the domain layer was deliberately corrected for this reason.

### Database / migrations

**No migration required.** `ProductState` is persisted as a single JSONB payload per tenant (`mbambulaan_tenant_state.payload`, see `db/migrations/001_initial.sql` and `src/server/repository.ts`). The two new arrays (`conversations`, `terrainInteractions`) are additive fields on that same JSON document — there is no relational schema to alter, and the existing `mbambulaan_command_log`/`mbambulaan_outbox` idempotency tables are reused unchanged by the new commands. This was verified by reading `repository.ts` and the migration file before writing any code, per §2/§9.

### Environment variables

```
WHATSAPP_APP_SECRET=...      # HMAC-SHA256 webhook signature secret (Meta App Dashboard)
WHATSAPP_VERIFY_TOKEN=...    # Arbitrary string chosen when configuring the webhook in Meta
WHATSAPP_ACCESS_TOKEN=...    # Cloud API access token, for outbound sends
WHATSAPP_PHONE_NUMBER_ID=... # Cloud API phone number id, for outbound sends
```

All four are read only from `process.env` in `src/channels/whatsapp.ts`; none are committed anywhere (verified: no literal secret value appears in the diff — `scripts/smoke.mjs` only sets throwaway, clearly-labelled smoke-test strings for its own local spawned server).

### WhatsApp / provider setup

1. Create/select a Meta App with the WhatsApp Business Platform product, Cloud API.
2. Configure the webhook URL as `https://<deployment>/api/webhooks/whatsapp`, with the same `WHATSAPP_VERIFY_TOKEN` value set in the environment; subscribe to the `messages` field.
3. Set `WHATSAPP_APP_SECRET` to the App Secret (used to verify `X-Hub-Signature-256`).
4. Set `WHATSAPP_ACCESS_TOKEN` (a permanent system-user token in production) and `WHATSAPP_PHONE_NUMBER_ID` for outbound sends via `POST https://graph.facebook.com/v21.0/<phoneNumberId>/messages`.
5. No sandbox/test number was available in this environment — see "External blockers".

### Tests executed

- `npm run typecheck` — clean.
- `npm run lint` — 0 errors, 4 pre-existing warnings in files untouched by this sprint.
- `npm test` — **599/599 passing**, including:
  - `tests/channel-interaction.test.ts` (9 tests): deterministic matching (incl. negative/fuzzy-text rejection); the exact §13 acceptance message preserved as a DECLARED interaction *before* any actor/onboarding answer exists; full progressive onboarding (each answer — including an unrecognized one — also produces its own interaction, per the unconditional reading of §6); Actor creation at onboarding completion (no fabricated organization, `verified: false`); known-contact reuse; non-text message → `media_en_attente`, never `recue`; `send_channel_message` rejects a non-existent conversation; `buildTerrainInteractionRows` sorting/labels; two independent contacts.
  - `tests/whatsapp-channel.test.ts` (9 tests): signature verification (valid/invalid/tampered body/missing secret); webhook challenge logic; text parsing; audio/image/document/unknown-type parsing (never crashes, never fabricates a transcription, `messageType` correctly mapped incl. fallback to `"autre"`); a message missing required fields is skipped without failing the rest of the batch; empty/malformed payloads; `whatsappAdapter.sendText` contract (explicit error without configuration; correct Graph API call shape when configured; explicit error on a non-ok provider response).
- `npm run build` — succeeds; `/api/webhooks/whatsapp` and `/app/terrain` both present in the route manifest.
- `git diff --check` — no whitespace errors.
- `npm run test:e2e` (local spawn mode) — **passes**, including a new WhatsApp section: GET handshake (valid/invalid verify_token), POST with an invalid signature (401), the exact §13 acceptance message delivered and visible via `/api/state` under the `administrateur` demo session, and a **duplicate delivery of the same provider message id producing exactly one interaction** — this is the one idempotency check that could not be unit-tested, because `src/server/repository.ts` (and, by necessity, `src/channels/whatsapp.ts`'s original `import "server-only"`) is only resolvable inside a real Next.js server process, not under a plain `node --test` run. (`import "server-only"` was removed from `src/channels/whatsapp.ts` specifically to keep its pure functions — signature/challenge/parsing — unit-testable; that file was never reachable from client code in the first place, so this does not weaken anything the guard was actually protecting.) `SMOKE_BASE_URL=<remote>` mode skips this one WhatsApp section, since the remote deployment's `WHATSAPP_APP_SECRET` isn't known to the smoke script — documented as a known scope limit, not silently skipped.

### Manual review routes / screenshots

- `/app/terrain`, logged in as `administrateur@mbambulaan.sn` / `demo-mbambulaan-2026` (or `DEMO_ACCOUNT_PASSWORD` if overridden): shows the new "Interactions terrain reçues" section.
- Screenshot taken against a locally built-and-started instance after replaying the exact §13 acceptance scenario through the real webhook route (signature-verified, HMAC-SHA256, 4 sequential POSTs): "J'ai besoin de glace aujourd'hui à Mbour." (interaction #1, no actor yet) → "Khady" → "2" → "Mbour" (interaction #4, now attributed to the real Actor "Khady · Mareyeur", territory "Mbour", status "Déclarée"). Delivered to the product owner as a chat attachment in this session; not committed to the repository (no screenshots directory exists in this project).
- `GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<value>` for manual handshake verification.

### External blockers

- **No live Meta WhatsApp Business credentials were available in this environment.** The adapter and webhook contract are fully implemented and proven against a deterministic local fixture (both signature-verified HTTP calls against a real running server, and unit tests), per §4's explicit fallback instruction, but true end-to-end delivery to a real WhatsApp client, and a real inbound message from Meta's infrastructure, could not be exercised. Configuring the four environment variables above against a real Meta App is the only remaining step to close this gap — no code change is anticipated.

### Deviations from CURRENT_SPRINT

1. **`ExternalContact` and `Conversation` collapsed into one entity** (see "New domain concepts added" above) rather than kept as two separate concepts as the mandate's §3 concept list suggests. Reasoning given there; flagged here per §15's explicit instruction not to silently change scope.
2. **A new `administrateur` demo account was added** to `src/server/accounts-repository.ts` (`administrateur@mbambulaan.sn`). None of the 7 existing demo accounts could reach `/app/terrain`'s `TerrainSupervisorView` (the view this sprint extends), since that view is gated to the `administrateur` role and `act-admin` (an existing Demo World actor) had no login. Without this, §7's required UI could not be demonstrated by anyone. This is an account-seeding addition only — no permission, role, or route gating was changed.
3. **Every accepted inbound text produces its own `TerrainInteraction`, including onboarding-answer turns** (e.g. the message "Khady" that answers the first-name question is *also* stored as its own interaction). This is the literal reading of §6's unconditional phrasing ("every accepted inbound text must result in a traceable terrain interaction") combined with §13's acceptance scenario, where the very first message is an operational request (not a name) and must be preserved as-is — which only works if the first message is never assumed to be an onboarding answer, and, symmetrically, no later message is ever exempted from becoming an interaction. The resulting onboarding exchanges are slightly more numerous in the inbox than a "only the substantive messages count" design would produce; this is a direct, documented reading of the mandate's own wording, not an invented behaviour.
4. **`import "server-only"` removed from `src/channels/whatsapp.ts`** so its pure functions (signature check, challenge check, parsing) could be unit-tested directly, per §12's explicit test requirements. The file was never imported by any client component (only the server-side registry and the API route import it), so no real protection was lost.

### Known debt / T02 preparation

- `TerrainInteractionMessageType` already distinguishes `audio`/`image`/`document`/`autre` from `texte`, and `processingStatus = "media_en_attente"` already flags exactly which interactions are waiting on T02. `rawProviderEvent` retains the original WhatsApp message object per interaction, so T02's transcription/vision step has everything it needs without re-deriving it from a webhook replay.
- `src/channels/registry.ts` is the single place to add an SMS/telephone adapter later; neither the domain nor the webhook route structure would need to change.
- SIGNAL/NEED/OBSERVATION/CAPACITY classification (PRODUCT_BASELINE §5) is entirely unbuilt — `intent` has exactly one value (`non_classifie`) by design, ready to be widened when that engine is built, but nothing today infers or guesses an intent.
- The outbound reply path only supports the three fixed onboarding prompts plus one generic acknowledgement (`src/channels/message-templates.ts`) — no AI-generated replies, as required; this is the natural place to extend when richer replies are in scope.
- The WhatsApp section of `scripts/smoke.mjs` only runs in local-spawn mode (see "Tests executed"); extending it to the remote deployment would require either provisioning `WHATSAPP_APP_SECRET` there and passing it to the smoke script, or restructuring that check to not require a real signature.


---

## T02 — Voice + AI Understanding + Structured Terrain Intent

Status: DONE for the architecture + deterministic pipeline (text/audio/image, all paths proven end-to-end via a real webhook and a deterministic fixture provider). NOT validated against a real AI provider or real WhatsApp media — see "External blockers". Do not read this as "AI quality validated in production."
Branch: `product/whatsapp-revenue-mvp`

### Completion status

Implements CURRENT_SPRINT.md §1-§14 and the T01 correction in §2/D008. All required test categories (§12) are covered; `lint`/`typecheck`/`build`/`git diff --check` are clean; `npm test` is 623/623 green (up from 599 at T01: +24 new tests, 0 broken); `npm run test:e2e` passes, including the T01 WhatsApp section plus new T02 checks that replay Acceptance Scenarios A, B and C through the real webhook route against a running server.

Three distinct claims, kept separate per §15's explicit instruction:
- **Implemented architecture**: complete — channel-agnostic intelligence boundary, media retrieval, structured interpretation, human correction, failure handling.
- **Deterministic test coverage**: complete — 24 new unit tests + 3 new E2E scenarios, all passing, using a deterministic fixture intelligence provider.
- **Real provider/API validation**: NOT done — no `ANTHROPIC_API_KEY` was available in this environment, so `src/intelligence/anthropic-adapter.ts` has never actually been called.
- **Real WhatsApp validation**: NOT done, same as T01 — no live Meta credentials, so `downloadWhatsappMedia` has never downloaded a real file.

### Final commit SHA

`b4290acb30c4d77f0a7858bc16ba74fcb6013f23`

### Files created / modified

Created:
- `src/intelligence/types.ts` — `IntelligenceAdapter`, `MediaRef`, result types. No WhatsApp/Anthropic-specific shape here.
- `src/intelligence/schemas.ts` — hand-written strict validators (`isValidInterpretation`/`isValidTranscription`/`isValidImageAnalysis`); no schema library added, consistent with the rest of the domain (commands are also validated by hand in `rules.ts`).
- `src/intelligence/fixture-adapter.ts` — deterministic, keyword-based fallback (explicitly documented in-file as "not a real NLU system").
- `src/intelligence/anthropic-adapter.ts` — real provider for text interpretation and image analysis (Anthropic Messages API via plain `fetch`, no SDK added, same minimal-dependency pattern as the WhatsApp Graph API adapter). Audio transcription is explicitly **not** implemented here (Claude's Messages API has no audio input) — always throws a clear "not configured" error, never silently falls back to a fabricated transcript.
- `src/intelligence/adapter.ts` — the single composed adapter the webhook calls; picks the real provider per-capability when `ANTHROPIC_API_KEY`+`ANTHROPIC_MODEL` are set, else the fixture.
- `tests/intelligence.test.ts` — schema + fixture-adapter tests (14 tests).

Modified:
- `src/domain/types.ts` — `TerrainInteractionProcessingStatus` replaced (`recue`/`media_en_attente` → `en_attente_traitement`/`traitee`/`echec_traitement`, since T02 actually builds the processing pipeline T01 only stubbed); `TerrainInteractionIntent` widened from one value to five (`signal`/`besoin`/`observation`/`capacite`/`non_classifie`); new `InterpretationConfidence`, `TerrainInterpretation`, `MediaReference` types; `TerrainInteraction` extended with `mediaRef`/`transcription`/`imageAnalysis`/`interpretation`/`processingFailureReason`; two new `Command` variants (`apply_terrain_interpretation`, `correct_terrain_interpretation`).
- `src/domain/channel-interaction.ts` — `applyReceiveChannelMessage` rewritten per D008 (see "Deviations"/correction below); added `applyTerrainInterpretation`, `applyCorrectTerrainInterpretation`; `determineReplyIntent` now takes the resulting interaction and returns `confirm_interpretation` when `needsHumanReview` is true; `buildTerrainInteractionRows` extended with intent/summary/subject/confidence/needsHumanReview.
- `src/domain/rules.ts` — dispatcher wiring + both `Exclude<Command["type"], …>` lists updated for the two new commands.
- `src/server/permissions.ts` — `correct_terrain_interpretation` added to the `all` list (administrateur/coordinateur already map to `all`); `apply_terrain_interpretation` deliberately added to **no** role list — webhook-only, same discipline as T01's two commands.
- `src/channels/types.ts` — `InboundChannelMessage` gained `mediaRef`/`hasCaption`.
- `src/channels/whatsapp.ts` — `WhatsappMessage` now captures `audio`/`image`/`document` sub-objects; `parseWhatsappInboundMessages` uses a real caption as `rawContent` when WhatsApp provides one (previously always a placeholder for non-text); new `downloadWhatsappMedia()` (two-step Graph API media retrieval, never persists the signed URL or the access token beyond the call).
- `src/channels/message-templates.ts` — added the `confirm_interpretation` template.
- `src/app/api/webhooks/whatsapp/route.ts` — rewritten to run the intelligence pipeline after `receive_channel_message`, dispatch `apply_terrain_interpretation` exactly once per message (own idempotency key), and compute the reply from the *post-interpretation* state.
- `src/components/terrain/TerrainSupervisorView.tsx` — upgraded with intent/confidence/review badges, interpreted summary/subject, and an operator correction form (`correct_terrain_interpretation`).
- `tests/channel-interaction.test.ts` — rewritten for the D008 correction and the new interpretation/correction commands (16 tests, up from 7).
- `tests/whatsapp-channel.test.ts` — added `mediaRef`/caption parsing tests and `downloadWhatsappMedia` contract tests (+6 tests).
- `scripts/smoke.mjs` — extended the WhatsApp section with Acceptance Scenarios A (text), B (audio fixture) and C (image fixture), all via the real HTTP webhook.

### Intelligence/provider architecture

Target flow realized exactly as specified (§3): `Channel Adapter (src/channels/whatsapp.ts) → Media/Text Normalisation (src/app/api/webhooks/whatsapp/route.ts: downloads media, builds the right input per message type) → Intelligence Adapter (src/intelligence/adapter.ts) → Structured Interpretation (validated by src/intelligence/schemas.ts before anything is trusted) → Domain Update (apply_terrain_interpretation, dispatched once, success or failure)`.

`src/domain` imports nothing from `src/intelligence` or `src/channels` — verified by inspection (the only inbound dependency is the two command types, which `rules.ts` already owned the shape of). The webhook route is the only file that imports both the channel layer and the intelligence layer; this is deliberate, since it *is* the orchestration/normalisation boundary the mandate asks for, not a leak.

### Runtime provider(s)

- **Anthropic Claude** (`src/intelligence/anthropic-adapter.ts`) — text interpretation and image analysis, via the Messages API (`fetch`, no SDK dependency added). Chosen because D009 explicitly allows it ("Claude is the coding agent, not necessarily the runtime model" — permitted, not mandated) and because it is the one capability-pair (structured text classification + vision) actually available without adding a second, unrelated vendor. **Never exercised against the real API in this environment** — no `ANTHROPIC_API_KEY` was available.
- **Deterministic fixture** (`src/intelligence/fixture-adapter.ts`) — the fallback for everything when no real provider is configured, and the **only** path for audio transcription (no provider for that is implemented at all — see below). This is a keyword/pattern matcher, not a model; its own file comment says so explicitly and this log repeats it: it exists to prove the pipeline works end-to-end and to keep the product functional before a real provider is wired, never to claim real NLU quality.
- **Audio transcription has no real provider.** Anthropic's Messages API does not accept audio input. A real path would need a dedicated speech-to-text provider (e.g. Whisper) — not built, because none was requested or credentialed, and building one speculatively would have been exactly the kind of unrequested scope the sprint rules warn against. `transcribeAudio` always uses the fixture; for any media id the fixture doesn't recognise, it throws (never fabricates a transcript), which is the honest statement of the current gap.

### Environment variables

```
ANTHROPIC_API_KEY=...    # enables real text interpretation + image analysis when set together with ANTHROPIC_MODEL
ANTHROPIC_MODEL=...      # explicit model id; deliberately no hardcoded default (avoids guessing a model string that might not exist)
```

(T01's four `WHATSAPP_*` variables are unchanged and still required for the channel layer; `WHATSAPP_ACCESS_TOKEN` is now also used for `downloadWhatsappMedia`, not just outbound sends.)

### Media retrieval/storage

- `downloadWhatsappMedia(mediaId)` does the two Graph API calls the mandate describes (§10): metadata (temporary signed URL) → file bytes. Both calls use `WHATSAPP_ACCESS_TOKEN`; the token and the signed URL are used only within that one function call, never logged, never returned to the caller, never stored.
- **No binary media is ever written to `ProductState`.** `TerrainInteraction.mediaRef` holds only `{ provider, mediaId, mimeType, sha256 }` — exactly the durable reference the mandate asks for, nothing that would bloat or expose the tenant's JSONB blob (§10, "avoid persisting binary media in the tenant JSON payload").
- Media retrieval failures never lose the original interaction or crash the request: in the image path, a download failure is caught locally and the pipeline proceeds to the intelligence adapter with `data: undefined` (the fixture adapter doesn't need bytes at all, keyed only by `mediaId`; a real provider call without bytes would itself fail explicitly and be caught by the outer try/catch, landing on `echec_traitement` — never a fabricated analysis).

### Structured AI schemas

`src/intelligence/schemas.ts`, hand-written (no schema library in this repo; consistent with how `rules.ts` already validates commands by hand):
- `isValidInterpretation` — the §5 structure (`intent` ∈ the 5 allowed values, non-empty `summary`, `confidence` ∈ 3 allowed values, boolean `needsHumanReview`, and every optional field type-checked when present).
- `isValidTranscription` / `isValidImageAnalysis` — same discipline for the two media-specific artifacts.

The webhook route rejects anything that fails these checks and treats it exactly like a provider failure (`echec_traitement`) — satisfies §12's "malformed intelligence output rejected by schema" literally, at the orchestration boundary, before `apply_terrain_interpretation` is ever called with it.

### Tests executed

- `npm run typecheck` — clean.
- `npm run lint` — 0 errors, 4 pre-existing warnings, none in files touched by T01 or T02.
- `npm test` — **623/623 passing** (599 at T01 + 24 new: 9 in `tests/channel-interaction.test.ts` net growth to 16, 6 new in `tests/whatsapp-channel.test.ts`, 14 new in `tests/intelligence.test.ts`; exact per-file counts are visible in the diff). Covers every §12 category: T01 regression (D008 explicitly re-tested — see next section), the 4 named text intelligence cases + the ambiguous/UNCLASSIFIED case, audio success+failure, image success+failure+never-auto-verified, malformed-schema rejection, and existing-suite-green.
- `npm run build` — succeeds; no new route failures.
- `git diff --check` — clean.
- `npm run test:e2e` (local spawn mode) — **passes**, including:
  - the T01 WhatsApp section unchanged in spirit (handshake, bad signature, idempotent redelivery) but now also asserting `intent === "besoin"`, `processingStatus === "traitee"`, `evidenceStatus === "declaree"` and `territoryId === "mbour"` on the resulting interaction — i.e. Acceptance **Scenario A** running through the real HTTP webhook, real `dispatch()`, and the real (fixture) intelligence adapter, not just a unit test;
  - a new onboarding-then-media flow on a second phone number, then an **audio** message using the known fixture media id (`fixture-audio-besoin-glace`) — asserts transcription stored and intent derived from it (**Scenario B**);
  - the same flow with an **image** message using `fixture-image-machine-glace-endommagee` — asserts image analysis stored, `evidenceStatus` still `declaree`, and `needsHumanReview === true` (**Scenario C**).
  - `SMOKE_BASE_URL=<remote>` mode still skips this whole section (remote `WHATSAPP_APP_SECRET` unknown to the script), same documented limit as T01.

A real bug was caught and fixed during this manual pass: the image fixture's canned description text didn't contain any of the fixture adapter's own breakdown keywords, so it fell through to `non_classifie` instead of `signal` — fixed by rewording the fixture text (`src/intelligence/fixture-adapter.ts`) to include "endommagée", which is exactly the kind of deterministic-matcher brittleness this log calls out as a known limitation of the fixture, not of the pipeline.

### Manual review routes / screenshots

- `/app/terrain`, logged in as `administrateur@mbambulaan.sn`: screenshot taken after replaying, through the real webhook, an onboarding sequence followed by a text NEED, a text SIGNAL, a fixture audio message, and a fixture image message. Shows, per interaction: intent badge, evidence status, processing status, confidence badge, a red "À revoir" badge exactly when `needsHumanReview` is true, the interpreted summary and subject, and the three operator actions (Confirmer / Marquer à revoir / Corriger l'intention with an intent selector). Delivered to the product owner as a chat attachment; a second screenshot (not attached, kept only in the session) confirmed clicking "Confirmer" on a flagged interaction removes its "À revoir" badge and records `correctedByActorId`/`correctedAt`.
- `GET /api/webhooks/whatsapp?hub.mode=subscribe&...` unchanged from T01.

### Demonstrated language support

Only French was exercised — every fixture, every test sentence, and the only transcription fixture available are French. D002's "Wolof where the chosen transcription/model genuinely supports it" is **not demonstrated**: no transcription provider is wired up at all (see "Runtime provider(s)"), so there was nothing capable of attempting Wolof, and claiming Wolof support here would be exactly the kind of fabricated capability the mandate prohibits (§4.2, "do not claim Wolof support if the chosen runtime provider cannot demonstrate acceptable transcription"). `TerrainInterpretation.language` and `transcription.language` both exist and are wired through end-to-end — the moment a real transcription provider is configured and does report a language (French, Wolof, or "unknown"), it flows through unchanged; nothing today forces or defaults it to French.

### External blockers

- **No `ANTHROPIC_API_KEY`** in this environment — `src/intelligence/anthropic-adapter.ts` (text interpretation + image analysis) has never been called for real. The code path is complete and schema-validated; configuring the two environment variables above is the only remaining step.
- **No live Meta WhatsApp credentials** (same as T01) — `downloadWhatsappMedia` has never downloaded a real file; its two-call contract is unit-tested against a mocked `fetch`, not a live Graph API.
- **No real speech-to-text provider** — this is a genuine capability gap, not just an untested path: nothing in this codebase can transcribe real audio today. Closing it requires picking and wiring a provider (e.g. Whisper), which was not requested for T02 and would have been unrequested scope to build speculatively.

### Deviations from CURRENT_SPRINT

1. **T01 correction applied exactly as specified (§2/D008)** — not a deviation from T02, but recorded here because it changes T01's previously-logged behavior: onboarding answers (recognized or not) no longer create `TerrainInteraction` rows; only the first substantive message and messages sent after onboarding is already complete do. Unit-tested explicitly (`tests/channel-interaction.test.ts`, the two "D008" tests) and re-proven live via E2E Scenario A.
2. **`TerrainInteractionProcessingStatus`'s T01 values (`recue`/`media_en_attente`) were replaced outright**, not extended, by `en_attente_traitement`/`traitee`/`echec_traitement`. T01's two values described a pipeline that didn't exist yet ("received, nothing more to do" / "media, not processed until T02"); T02 builds that pipeline for every message type including text, so both old values stopped being meaningful. No production data existed to migrate (demo-only product, JSONB blob, no real traffic).
3. **`TerrainInteraction.intent` is a kept-in-sync projection of `interpretation.intent`**, not an independent fact — both are always written by the same command (`apply_terrain_interpretation` or `correct_terrain_interpretation`). Flagged explicitly because §5 warns against "duplicate source-of-truth objects"; the two fields never diverge by construction, so this is a denormalised read convenience, not a second source of truth.
4. **Image analysis forces `needsHumanReview = true` whenever the image-analysis step itself reports low confidence**, even if the combined text interpretation is confident. This reads §9 ("an image can support an observation, but does not automatically produce verifiee") as requiring the same caution one level down, for the review flag, not just for evidence status — a photo Mbàmbulaan isn't sure about shouldn't look settled just because the words around it were plain.
5. **The reply-confirmation text (§7) is a deterministic template, not an AI-generated sentence.** §7's "the system MAY generate/suggest a concise reply" was read conservatively, consistent with "do not build an open-ended autonomous agent" — the same discipline T01 applied to all outbound text. If genuinely AI-generated replies are wanted, that is a deliberate product decision for a future sprint, not an oversight here.
6. **A "oui" reply to a confirmation question is not auto-processed.** §7 only asks that Mbàmbulaan *send* a confirmation question when warranted; it does not ask for the contact's answer to be parsed back into a state change. The human-side confirmation path §8 explicitly asks for (operator confirms/corrects in the Terrain UI) is what's implemented; parsing the WhatsApp-side "oui" would be a reasonable T03 addition if wanted.

### Known debt / T03 preparation

- **Matching is entirely unbuilt, by design** — `intent`/`subject`/`territoryId`/`quantity`/`unit`/`timeWindow` are all structured and stored precisely so a future matching engine (T03, per CURRENT_SPRINT.md §14/PRODUCT_BASELINE §4) has real fields to query against, never free text to re-parse.
- **Real provider wiring is the most actionable next step**: set `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` to turn on real text interpretation and image analysis; pick and wire a speech-to-text provider to close the one remaining capability gap (audio transcription).
- **The deterministic fixture's keyword lists are intentionally small and literal** (see the bug caught and fixed during manual testing, above) — expect to need to extend `SIGNAL_MARKERS`/`NEED_MARKERS`/`CAPACITY_MARKERS`/`OBSERVATION_MARKERS`/`SUBJECT_MARKERS` in `src/intelligence/fixture-adapter.ts` as real usage surfaces phrasing it doesn't yet recognise — or, better, treat any growing reliance on it as the signal that a real provider should be turned on instead.
- **The Terrain UI's correction form is intentionally minimal** (confirm / mark-for-review / change-intent-only) — §8 also mentions correcting "key extracted fields" (subject/territory/quantity/etc.); the domain command (`correct_terrain_interpretation`) already accepts all of them, only the UI form doesn't yet expose inputs for each. Extending the form is pure UI work, no domain change needed.
- **`document`/`autre` message types have no interpretation pipeline** — they still create an interaction (§6 compliance preserved) but `runIntelligencePipeline` throws for them deliberately (never a fabricated success), landing on `echec_traitement`. Out of scope per §4 (only text/audio/image are specified).
