# CODEX V7 - FIN DES PARCOURS OPERATIONNELS PROMPT - Mbambulaan

## Decision

V5 made Mbambulaan operationally credible: data trust, referents, species, funding insights and operational model.

V7 must fix the most important remaining product weakness:

> The end of each journey is still too documentary. It must become operational.

A generated PDF is not enough. Any reporting tool can generate a PDF. Mbambulaan is a coordination infrastructure: every meaningful action must change the state of the system for someone else, immediately and visibly.

The key question after every workflow is:

> What is different elsewhere in the product one second after this action?

If the answer is "only a document was generated", the workflow is still too weak.

Do not build a CRM, BI tool, ERP or generic dashboard. Do not overbuild. Do not add a backend. Use client-side state and mock data only. Preserve V5 foundations.

---

## Step 0 - Audit before editing

Inspect:

- `src/components/private-space/MinistryValueWorkflows.tsx`
- `src/components/private-space/MinistryV4Components.tsx`
- `src/components/private-space/MinistryControlTower.tsx`
- `src/components/private-space/MinistryControlTowerParts.tsx`
- `src/components/private-space/MinistryCredibility.tsx`
- `src/components/private-space/InstitutionalDocuments.tsx`
- `src/data/ministryControlTowerData.ts`
- `src/data/ministryValueJourneyData.ts`
- `src/components/landing/InstitutionalLanding.tsx`
- `docs/MBAMBULAAN_OPERATIONAL_MODEL.md`

Identify:

- current workflow completion behavior;
- where generated artifacts are stored;
- how needs, funding opportunities and statuses are represented;
- current partner model;
- current decision/pilotage model;
- existing register/document list patterns;
- current WhatsApp wording, if any;
- current role/view assumptions.

Then implement the smallest coherent V7 pass.

---

## Step 1 - Add an explicit operational completion model

Add or extend data structures so each workflow can create a visible state change.

Introduce lightweight types where appropriate:

### Funding dossier lifecycle

A funding dossier is different from a need and different from a generated PDF.

Possible statuses:

- `Dossier constitue`
- `Transmission a confirmer`
- `Transmis`
- `En negociation`
- `Finance`
- `Decline`

Important rule:

> A dossier must never become `Transmis` automatically when a PDF is generated.

It can become `Dossier constitue` or `Transmission a confirmer` after the dossier is created.

To become `Transmis`, the user must perform an explicit human confirmation action, e.g.:

`J'ai transmis ce dossier le [date]`

This is a product honesty rule. The system must not imply that a real external transmission happened when it did not.

### Partner relationship lifecycle

Add a lightweight partner relationship model if absent.

Partner categories:

- Programme public
- Bailleur
- Partenaire technique
- ONG
- Collectivite
- Recherche / biodiversite
- Chaine du froid / equipement

Relationship statuses:

- `Non sollicite`
- `Candidat compatible`
- `Sollicite`
- `En negociation`
- `Partenaire actif`
- `Decline`

Include:

- partner name;
- category;
- interest domains/tags;
- compatibility reason;
- last interaction date;
- follow-up due date;
- owner/responsible person.

Keep it simple. Do not build a CRM.

### Minister note / decision lifecycle

A minister note is not only a PDF. It should create a decision-follow-up entry.

Decision recommendation statuses:

- `Recommandee`
- `A arbitrer`
- `Arbitree`
- `En execution`
- `Executee`

A note can create one or several decision recommendations. For MVP, it is enough to create 1-3 mock recommendations from the note workflow and show them in Pilotage.

### Reports register

A zone report does not necessarily change entity status. Its value is to freeze a situation at a time T and remain traceable.

Create a lightweight register of generated zone reports:

- id;
- title;
- zone;
- period;
- author;
- generatedAt;
- trust level;
- linked objects count;
- purpose.

Do not overcomplicate.

---

## Step 2 - Create visible registers

Create compact UI components for operational registers.

### Funding register

Add in `Filiere & Financement` a section such as:

`Registre de financement`

It should show dossiers with:

- dossier title;
- source need;
- amount requested;
- partner target;
- status;
- owner;
- last update;
- next action;
- data trust badge;
- transmission status.

It must include the distinction:

- `Dossier constitue — non encore transmis`
- `Transmission a confirmer`
- `Transmis le [date] par [responsable]`

Add a CTA on relevant dossier rows:

- `Confirmer la transmission`
- `Enregistrer une reponse`

For MVP, these can update local state only.

### Decision / note register

Add in `Pilotage institutionnel` a section such as:

`Registre notes & decisions`

It should show:

- generated note title;
- decision recommendation;
- status;
- priority;
- source;
- owner;
- created date;
- next action.

Ensure `Decisions a arbitrer` is fed by this state where possible, not only static mock text.

### Report register

Add a compact register for zone reports, possibly in Pilotage or Atlas context:

`Rapports de zone generes`

Show the generated report as traceable system object, not only as downloadable file.

---

## Step 3 - Make each journey completion update state visibly

Update workflow completion handlers to apply a meaningful local state change.

### Qualifier un besoin

Expected behavior:

- Initial: need is `Signale`, trust `raw` or `declared`.
- After validation: status becomes `Qualifie`.
- Trust becomes at least `declared`, not automatically `verified`.
- A qualification history entry is created.
- Need leaves the `Signale` list/filter and appears under `Qualifie`.
- Funding summary updates: qualified count/amount increases.
- Next CTA becomes `Verifier l'eligibilite` or `Constituer un dossier`.

Do not generate a big institutional document as the main output. Qualification is an operational state change, not a document moment.

### Constituer un dossier de financement

Expected behavior:

- Initial: need is `Eligible au financement` or equivalent.
- After validation: create funding dossier in `Registre de financement`.
- Need status becomes `Dossier constitue` or equivalent.
- Dossier status is `Dossier constitue` / `Transmission a confirmer`, never `Transmis` automatically.
- The funding register visibly updates.
- `Reste a financer` / funding funnel updates if current data model supports it.
- Next CTA: `Solliciter un partenaire` or `Confirmer la transmission`.
- Generated PDF must be labeled: `Dossier constitue — non encore transmis` until human confirmation.

Clarify wording:

`Dossier transmissible apres verification humaine` means:

> the dossier has been reviewed by an authorized human and can now be sent manually to a partner, funder or ministry unit. It does not mean that it has already been transmitted.

### Solliciter un partenaire

Expected behavior:

- User selects a partner category and target partner.
- Create/update a partner relationship entry.
- If the user only generates the note: status remains `Sollicitation preparee` or `Transmission a confirmer`.
- Only after explicit confirmation, dossier becomes `Transmis`.
- Partner relationship becomes `Sollicite`.
- Follow-up due date appears.
- Next action appears in `Que faire maintenant`: `Relancer le partenaire` or `Enregistrer une reponse`.

Do not simulate an actual external transmission.

Add a small confirmation step/button:

`Confirmer que le dossier a ete transmis manuellement`

The confirmation should require date/responsible person in the form or a simple local prompt/state.

### Demander une verification terrain

Expected behavior:

- Entity status changes to `Verification demandee`.
- Trust stays `declared` until return is received.
- A verification task appears in a local register/list:
  - target;
  - recipient: agent territorial or referent mandate;
  - channel: WhatsApp structure / application terrain;
  - status: Demandee / Assignee / Constat depose / Verifiee;
  - due date;
  - owner.
- Atlas situation counters update if feasible.
- Add next CTA: `Preparer un message WhatsApp`.

### Signaler une situation

Expected behavior:

- Create signal in a `Registre des signalements` or existing alert list.
- Status: `Signale`.
- Trust: `raw` or `declared` depending on sender.
- It does not reach ministry decision level until qualified.
- Next CTA: `Qualifier ce signalement`.

### Generer un rapport de zone

Expected behavior:

- Generate document.
- Add an entry to `Rapports de zone generes`.
- Do not pretend this changes operational entity statuses.
- Show value: frozen situation at time T, linked to zone and period.

### Voir le dossier complet

Expected behavior:

- This is consultation, not a workflow completion.
- Do not force a fake state change.
- Improve helper text: `Le dossier complet est une vue permanente de l'entite, pas une transmission.`

### Generer une note au Ministre

Expected behavior:

- Generate document.
- Add entry to `Registre notes & decisions`.
- Create 1-3 decision recommendation items with statuses `Recommandee` or `A arbitrer`.
- Pilotage should show these as visible follow-up items.
- Difference with report must be clear:
  - rapport de zone = constat;
  - note au Ministre = recommandations and arbitration follow-up.

---

## Step 4 - Add WhatsApp as credible MVP bridge, not fake integration

Add a visible but honest WhatsApp capability.

Create a compact component such as:

`RemonteesWhatsAppPanel`

or integrate into Atlas/verification workflow.

It should show:

- structured WhatsApp messages already received or prepared;
- sender: referent / agent;
- receiving cell: regional cell;
- linked quay/entity;
- message type;
- attachment hint: photo/audio/location;
- initial trust level;
- current status;
- CTA: `Qualifier`, `Demander verification`, `Copier le message WhatsApp`.

Add a button:

`Preparer un message WhatsApp`

This should open/copy a structured message template. Do not create real API integration.

Templates to include:

- `SIGNALEMENT · [quai] · [description] · [photo]`
- `VERIFICATION DEMANDEE · [entite] · Merci de confirmer sur place et repondre avec une photo.`
- `RETOUR VERIFICATION · [entite] · Constat : [texte] · [photo]`
- `DEBARQUEMENT · [quai] · Pirogue [id] · Especes : [liste] · Volume estime : [quantite]`
- `BESOIN · [categorie] · [description] · Acteurs concernes : [nombre]`
- `ALERTE ESPECE · [nom espece] · [quai] · [description]`

Visible wording must be honest:

`Canal pilote simule — envoi reel non connecte dans cette demo.`

This is important for ministry credibility.

---

## Step 5 - Add role/view framing without building 6 products

Do not create separate full applications.

Add a simple demo-level role selector if feasible:

`Vue actuelle: Ministere / Direction regionale / Partenaire-Bailleur`

Recommended behavior:

- Ministere: sees consolidated synthesis, decisions, funding arbitration, no raw community noise.
- Direction regionale: sees operational detail, signals, verifications, qualification actions.
- Partenaire-Bailleur: sees funding dossiers, impact evidence, species/biodiversity value, not raw ministry workflows.

Agent territorial and referent should not have full UI in MVP. They are represented through WhatsApp tasks and structured messages.

If implementing role adaptation is risky, at least add a visible explanatory panel:

`Cette demo montre une vue ministere enrichie. En pilote, la direction regionale dispose de la vue operationnelle quotidienne; referents et agents interagissent via WhatsApp structure.`

---

## Step 6 - Landing update

Update the landing only lightly.

In the section `Ce que le systeme produit`, add a message that documents are not isolated exports:

`Chaque document genere alimente un registre de suivi: financement, decision ou rapport de zone.`

In data/WhatsApp section if present, mention:

`WhatsApp structure permet de relier les remontées terrain aux registres de verification et de signalement sans promettre une integration API immediate.`

Do not redesign the landing again.

---

## Step 7 - Preserve V5 foundations

Do not break:

- `/`
- `/espace-prive`
- `/espace-prive/etat`
- landing readability fixes;
- Atlas pirogue cycle;
- DataTrustBadge;
- referents model;
- species directory;
- funding insights;
- print-ready document generation;
- funding dossier PDF generation;
- minister note generation.

No heavy dependencies.
No backend.
No real WhatsApp API.
No automatic external transmission.

---

## Acceptance criteria

- A generated funding dossier creates/updates a funding register entry.
- A funding dossier is not automatically marked `Transmis`.
- Manual confirmation is required before any `Transmis` status appears.
- Partner solicitation creates a visible partner relationship / follow-up state.
- Qualification of a need changes the need status and visible funding summary.
- Verification request creates a visible task/mission and keeps data trust below `verified` until return.
- Zone report appears in a report register.
- Minister note creates a decision follow-up entry.
- Pilotage shows decision follow-up, not only static notes.
- WhatsApp is visible as structured MVP bridge, not fake live integration.
- Role/view framing is visible without creating 6 separate products.
- The product no longer feels like a PDF generator.
- `npm run typecheck` passes.
- `npm run build` passes.

---

## Tests to run

Run:

```bash
npm run typecheck
npm run build
```

Manual demo checks:

1. Qualify a need: status and summary visibly change.
2. Constitute funding dossier: register entry appears, not transmitted automatically.
3. Confirm transmission manually: only then status becomes transmitted.
4. Solicit partner: partner follow-up appears with due date/owner.
5. Request field verification: task appears with WhatsApp structured channel.
6. Generate zone report: report register entry appears.
7. Generate minister note: decision recommendation appears in Pilotage.
8. WhatsApp panel shows structured messages and no fake live integration claim.
9. Landing remains readable and light.
10. Exports still open/print correctly.

---

## Final report expected from Codex

At the end, summarize:

- audit findings;
- files changed;
- journey completion state changes;
- funding register implementation;
- partner relationship/follow-up implementation;
- decision/note register implementation;
- report register implementation;
- WhatsApp MVP bridge implementation;
- role/view framing implementation;
- landing wording changes;
- document export regression status;
- typecheck result;
- build result;
- remaining limits.
