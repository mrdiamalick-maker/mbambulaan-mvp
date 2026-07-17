# CODEX V8 - UX AGENT NON TECHNIQUE PROMPT - Mbambulaan

## Decision

V7 fixed a system problem: actions now create state changes, registers, traces and follow-up items.

V8 must fix the interface problem: the screen still feels too flat and too difficult for a non-technical operational user.

Core principle:

> A system can be correctly modeled and still be unreadable on screen.

Mbambulaan must behave like an operational assistant, not like a dashboard with many possible buttons.

The selected entity panel must answer immediately:

- What am I looking at?
- What do we know?
- What has already been done?
- What is waiting?
- What is blocked?
- What is the one next action?
- Why this action?
- What will change after?

Do not add backend. Do not add real WhatsApp API. Do not create new major modules. Do not redesign the whole product.

Implement the smallest coherent V8 pass that makes the product easier to understand for a Senegalese public agent who is not comfortable with IT but knows the operational reality.

---

## Step 0 - Audit before editing

Inspect:

- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryOperationalRegisters.tsx`
- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/components/private-space/MinistryV4Components.tsx`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`

Identify:

- where selected entity state is computed;
- how actions are shown in `ContextPanel`;
- how verification tasks, signal records, zone reports, funding dossiers, partner relationships and decision records are stored;
- which actions remain visible after completion;
- which wording still feels technical or internal.

Then implement V8.

---

## Step 1 - Replace flat action lists with an assistant-style selected panel

The selected entity panel must no longer feel like a list of possible actions.

Implement a reusable guided structure, at least for the Atlas selected panel and, where low risk, for funding/decision cards.

The panel should show, in this order:

1. Identity: entity name and type.
2. What we know: 2 or 3 facts in simple operational language.
3. Trust level: Brute / Declaree / Verifiee / Consolidee with small helper.
4. Human business status: a full phrase, not an internal status code.
5. Already done: compact checked list.
6. Waiting for: if applicable.
7. Blocking point: if applicable.
8. One primary action only.
9. Why this action.
10. What will change after.
11. Secondary actions, max 2 or 3 visible.
12. Simple history, collapsed or compact.

Important:

- Keep only one visually dominant primary button.
- Do not show already-completed actions as primary.
- Do not overwhelm users with more than 2-3 secondary actions.
- Use operational language, not technical architecture language.

---

## Step 2 - Implement display state machines as source of truth

The UI must derive action visibility from business state, not from static lists.

### A. Field verification machine

States and UI behavior:

1. Non demandee
   - Primary: `Demander une verification terrain`
   - Secondary: `Voir le detail complet`
   - Wording: `Cette information n'a pas encore ete confirmee sur place.`
   - Visible change after action: verification status becomes `Demandee`.

2. Demandee
   - Primary: `Preparer le message WhatsApp`
   - Hide: `Demander une verification terrain`
   - Wording: `Verification demandee, en attente d'envoi au terrain.`
   - Visible change after action: WhatsApp message prepared.

3. Message WhatsApp prepare
   - Primary: `Suivre la verification`
   - Secondary: `Copier a nouveau le message`
   - Hide: `Demander une verification terrain`, `Preparer le message WhatsApp`
   - Wording: `Message pret a transmettre au referent.`

4. Assignee / En attente de constat
   - Primary: `Suivre la verification`
   - Secondary: `Relancer` only if due date exceeded, otherwise hidden.
   - Hide all request/preparation actions.
   - Wording: `En attente du constat du referent.`

5. Constat depose
   - Primary: `Valider le constat`
   - Secondary: `Consulter la preuve jointe`
   - Hide request actions.
   - Wording: `Un constat a ete transmis, a valider.`

6. Verifiee
   - Primary: `Generer un rapport de zone`
   - Secondary: `Voir le detail complet`
   - Hide all verification actions.
   - Wording: `Confirme sur place.`

7. Cloturee
   - Primary: `Voir le detail complet`
   - Hide all active verification actions.
   - Wording: `Verification terminee et archivee.`

### B. Signal machine

- Signale / A qualifier: primary `Qualifier ce signalement`.
- Qualifie: primary `Decider du traitement` or `Escalader en alerte` if critical.
- Escalade en alerte: primary `Suivre l'alerte`.
- En traitement: primary `Suivre le traitement`.
- Cloture: primary `Voir le detail`, hide active actions.

### C. Zone report machine

- Non genere: primary `Generer un rapport de zone`.
- Genere: primary `Relire le rapport`, hide `Generer un rapport` as primary.
- A relire: primary `Marquer comme pret a transmettre`.
- Pret a transmettre: primary `Confirmer la transmission`.
- Transmis manuellement: primary `Consulter le rapport`, hide generation/transmission actions.
- Archive: primary `Consulter le rapport`.

### D. Funding dossier machine

- Besoin signale: primary `Qualifier ce besoin`.
- Besoin qualifie: primary `Verifier l'eligibilite`.
- Eligible: primary `Constituer un dossier de financement`.
- Dossier constitue: primary `Solliciter un partenaire`; hide `Constituer un dossier`.
- Transmission a confirmer: primary `Confirmer la transmission manuelle`; hide `Solliciter un partenaire` if already prepared.
- Transmis manuellement: primary `Suivre la reponse`.
- En negociation: primary `Noter la reponse du partenaire` or `Relancer`.
- Finance / Decline: primary `Voir le detail`; hide active workflow actions.

### E. Minister note machine

- Non preparee: primary `Preparer une note`.
- Brouillon: primary `Finaliser la note`.
- Generee: primary `Suivre l'arbitrage`; hide `Generer une note`.
- A arbitrer: primary `Arbitrer la decision`.
- Arbitree: primary `Suivre l'execution`.
- En execution: primary `Suivre l'execution`.
- Executee: primary `Voir le detail`; hide active actions.

---

## Step 3 - Make Kayar a fixed replayable demo journey

The Kayar journey must be reliable for a ministry demo. Do not make it depend on unpredictable real-time actions.

Add a guided Kayar demo scenario, using local state only.

Target scenario:

### Step 0 - Kayar selected, weighing discrepancy declared

Panel shows:

- Entity: Quai de Kayar.
- What we know: `Ecart de pesee signale sur le dernier debarquement.`
- Trust: Declaree.
- Business status: `Non verifiee` or `A confirmer sur place`.
- Primary action: `Demander une verification terrain`.
- Why: `Cette information n'a pas encore ete confirmee sur place.`
- What changes after: `Une demande sera creee et rattachee a Kayar.`

### Step 1 - Verification requested

After the action:

- Add to already done: `Verification demandee`.
- Hide `Demander une verification terrain` as primary.
- Primary becomes: `Preparer le message WhatsApp`.
- Verification task appears.

### Step 2 - WhatsApp message prepared

After preparing:

- Add to already done: `Message WhatsApp prepare`.
- Primary becomes: `Suivre la verification`.
- Secondary: `Copier a nouveau le message`.
- Show honest wording: `A envoyer manuellement via WhatsApp. Envoi reel non connecte dans cette demo.`

### Step 3 - Constat deposited

Provide a deterministic demo action such as:

- `Simuler le retour du constat` or better user-facing wording: `Deposer le constat recu`.

After this:

- Status: `Constat depose`.
- Trust remains `declared` until validation.
- Primary becomes: `Valider le constat`.

### Step 4 - Situation verified

After validation:

- Trust becomes `verified`.
- Already done includes `Constat valide`.
- Primary becomes: `Generer un rapport de zone`.
- Hide verification request actions.

### Step 5 - Report generated

After generating report:

- Add to report register.
- Hide `Generer un rapport` as primary.
- Primary becomes: `Relire le rapport` or `Consulter le rapport`.
- Secondary can include `Confirmer la transmission` if implemented honestly.

This scenario must be easy to run in 5-7 minutes.

---

## Step 4 - Anti-repetition rules

Apply these rules everywhere feasible:

- Verification requested -> hide `Demander une verification`; show next action.
- WhatsApp prepared -> make `Copier a nouveau le message` secondary; primary becomes follow-up.
- Constat deposited -> primary becomes `Valider le constat`.
- Report generated -> hide `Generer un rapport`; show `Relire/Consulter le rapport`.
- Dossier constituted -> hide `Constituer un dossier`; show `Solliciter un partenaire`.
- Transmission confirmed -> show `Suivre la reponse`; hide confirmation.
- Partner solicited -> show `Noter la reponse du partenaire` or `Relancer`.
- Note generated -> hide `Generer une note`; show `Suivre l'arbitrage`.
- Decision arbitrated -> show `Suivre l'execution`.

Do not silently remove actions. Replace them with the next logical step or consultation.

---

## Step 5 - Wording cleanup

Replace user-facing technical terms where safe:

- `Voir le dossier complet` -> `Voir le detail complet` in non-funding contexts.
- `Registre de financement` -> `Suivi des financements` for user-facing headings.
- `Pont terrain · WhatsApp structure` -> `Remontees WhatsApp` or `Messages WhatsApp terrain`.
- `Enregistrer une reponse` -> `Noter la reponse du partenaire`.

Keep but contextualize:

- `Demander une verification terrain`.
- `Signaler une situation`.
- `Generer un rapport de zone` for first use only.
- `Constituer un dossier de financement`.
- `Solliciter un partenaire`.
- `Generer une note au Ministre` for first use only.
- `Confirmer la transmission`.
- `Declaree / Verifiee / Consolidee`, but add short helper text near first display.

Important:

- Do not expose words like `pipeline`, `workflow`, `object`, `pont`, or `registre` to non-technical users unless the institutional meaning is deliberate.

---

## Step 6 - Keep V7 foundations

Do not break:

- state-changing workflow completion;
- funding register / funding follow-up;
- manual confirmation before `Transmis`;
- partner relationship follow-up;
- decision/note register;
- report register;
- WhatsApp structured bridge without fake API;
- role framing;
- print-ready document generation;
- routes `/`, `/espace-prive`, `/espace-prive/etat`;
- landing readability.

No backend. No real WhatsApp API. No new major modules. No heavy dependencies.

---

## Acceptance criteria

- Selecting Kayar gives an obvious primary next action.
- After requesting verification, the primary action is no longer request verification.
- After preparing WhatsApp, the primary action becomes follow-up, not preparation again.
- After depositing a constat, the primary action becomes validating the constat.
- After validation, trust becomes verified and the primary action becomes generating the zone report.
- After generating a report, the primary action becomes reading/consulting/following transmission, not generating again.
- Funding actions follow the same anti-repetition logic where feasible.
- Note/decision actions follow the same anti-repetition logic where feasible.
- User-facing wording is simpler and less technical.
- There is at most one dominant primary action per entity/card.
- Existing V7 state changes still work.
- `npm run typecheck` passes.
- `npm run build` passes.

---

## Tests to run

Run:

```bash
npm run typecheck
npm run build
```

Manual checks:

1. Kayar selected -> primary action is clear and justified.
2. Request verification -> button changes to next step.
3. Prepare WhatsApp -> button changes to follow-up.
4. Deposit constat -> button changes to validate constat.
5. Validate -> confidence changes to verified.
6. Generate report -> report register updates and generation is not shown as primary again.
7. Funding dossier creation -> primary action changes to solicitation/follow-up.
8. Transmission confirmation -> primary action changes to response tracking.
9. Minister note generation -> decision follow-up appears and generation is not shown as primary again.
10. Wording no longer exposes `Pont terrain` or non-funding `dossier complet`.

---

## Final report expected from Codex

Summarize:

- audit findings;
- files changed;
- selected entity UX changes;
- state machine implementation;
- Kayar replayable journey;
- anti-repetition rules implemented;
- wording cleanup;
- what remains local/session-only;
- typecheck result;
- build result;
- remaining UX limitations.