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

Status: NOT STARTED
Branch: `product/whatsapp-revenue-mvp`

### Completion status
TBD

### Final commit SHA
TBD

### Files created / modified
TBD

### Intelligence/provider architecture
TBD

### Runtime provider(s)
TBD

### Environment variables
TBD

### Media retrieval/storage
TBD

### Structured AI schemas
TBD

### Tests executed
TBD

### Manual review routes / screenshots
TBD

### Demonstrated language support
TBD

### External blockers
TBD

### Deviations from CURRENT_SPRINT
TBD

### Known debt / T03 preparation
TBD
