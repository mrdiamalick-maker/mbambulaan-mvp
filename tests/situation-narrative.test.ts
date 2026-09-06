import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { decisionTypeLabels, type Finding, type ProductState, type Situation } from "../src/domain/types";
import {
  buildValueTrail,
  collectSituationSignals,
  describeFindingTrust,
  findFocusSituation,
  findKnowledgeGapForSituation,
  relatedDecisionsForSituation,
  resolveFindingForSituation,
  resolveSourceRefDisplay
} from "../src/domain/situation-narrative";

// Fabriques minimales pour les tests synthétiques des 4 corrections
// Product Review (LOT 1, 2026-09-01) — seuls state.situations/state.findings
// sont lus par les fonctions testées ici, les autres tableaux restent vides
// à dessein (pas de jeu de données parallèle à entretenir).
function makeFinding(overrides: Partial<Finding> & Pick<Finding, "id">): Finding {
  return {
    type: "recurrence",
    title: "Constat de test",
    statement: "Énoncé de test.",
    territoryIds: ["joal"],
    sourceRefs: [{ objectType: "signal", objectId: "sig-test" }],
    explanation: "Explication de test.",
    trust: "observee",
    status: "confirmed",
    provenance: "human",
    nextStep: "Prochaine étape de test.",
    createdAt: "2026-07-29T08:30:00.000Z",
    ...overrides
  };
}

function makeSituation(overrides: Partial<Situation> & Pick<Situation, "id" | "territoryId" | "priority">): Situation {
  return {
    reference: `MBA-SIT-${overrides.id.toUpperCase()}`,
    signalIds: [],
    title: "Situation de test",
    description: "Situation de test.",
    status: "qualification",
    trust: "observee",
    visibility: "organisation",
    nextStep: "Prochaine étape de test.",
    history: [],
    ...overrides
  };
}

function makeState(situations: Situation[], findings: Finding[] = []): ProductState {
  return { situations, findings } as ProductState;
}

// LOT 1 (mandat "Vertical Slice Joal") — TEST A : Situation Joal → Finding →
// Signals → KnowledgeSourceRefs valides, bout en bout.
test("TEST A — la Situation Joal remonte à son Finding, ses Signals et des sourceRefs qui résolvent réellement", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence");
  assert.ok(situation);

  const finding = resolveFindingForSituation(state, situation!);
  assert.ok(finding, "la Situation Joal doit résoudre à un Finding réel");
  assert.equal(finding!.id, "fnd-joal-glace-recurrence");
  assert.equal(finding!.status, "confirmed");

  const signals = collectSituationSignals(state, situation!);
  assert.ok(signals.length >= 2, "au moins les 2 signaux sourcés par le Finding");
  signals.forEach((signal) => assert.equal(signal.territoryId, "joal"));

  assert.ok(finding!.sourceRefs.length > 0);
  finding!.sourceRefs.forEach((ref) => {
    const resolved = resolveSourceRefDisplay(state, ref);
    assert.ok(resolved, `${ref.objectType}:${ref.objectId} doit résoudre vers un objet réel`);
    assert.ok(resolved!.label.length > 0);
  });
});

// TEST B — une Situation ne suppose pas 1 Signal = 1 Situation : le dossier
// Joal doit exposer plusieurs Signals, pas seulement le premier.
test("TEST B — collectSituationSignals expose plusieurs Signals pour le dossier Joal", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  const signals = collectSituationSignals(state, situation);
  assert.ok(signals.length >= 2, "le dossier doit exposer au moins 2 signaux, pas uniquement le premier");
  assert.equal(new Set(signals.map((item) => item.id)).size, signals.length, "aucun doublon");
});

// TEST C — le texte de la signature « pourquoi Mbàmbulaan vous le signale »
// doit être entièrement dérivable du Finding réel, jamais un texte
// décoratif indépendant, et le niveau de confiance ne doit jamais afficher
// un score composite (doctrine anti-score).
test("TEST C — la signature « pourquoi » est entièrement dérivée du Finding réel, sans score composite", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  const finding = resolveFindingForSituation(state, situation)!;

  // Les 2 textes affichés ("ce que Mbàmbulaan a compris" / "pourquoi")
  // sont des lectures directes des champs du Finding, pas une reformulation.
  assert.equal(finding.statement, situation.description, "la description de la Situation reprend le statement du Finding, aucune divergence de récit");
  assert.ok(finding.explanation.length > 0);

  const trustText = describeFindingTrust(finding);
  assert.match(trustText, /^Observé —/);
  assert.doesNotMatch(trustText, /%/, "jamais de score composite en pourcentage");
  assert.doesNotMatch(trustText, /\d\/\d/, "jamais de score composite en fraction");
});

// TEST D — ni record_finding ni promote_finding_to_situation ne créent de
// Decision automatiquement : la recommandation reste distincte de la
// décision, qui exige un acte humain explicite (create_decision, hors
// périmètre testé ici puisqu'aucune commande de ce type n'existe côté
// promotion — seule promote_finding_to_situation crée une Situation).
test("TEST D — record_finding et promote_finding_to_situation ne créent jamais de Decision", () => {
  const state = createDemoState();
  const decisionsBefore = state.decisions.length;

  const signal = state.signals.find((item) => item.disposition === "nouveau")!;
  const afterRecord = applyCommand(state, {
    type: "record_finding",
    actorId: "act-coordinateur",
    findingType: "recurrence",
    title: "Constat de test TEST D",
    statement: "Énoncé de test.",
    territoryIds: [signal.territoryId!],
    sourceRefs: [{ objectType: "signal", objectId: signal.id }],
    explanation: "Explication de test.",
    trust: "observee",
    provenance: "human",
    nextStep: "Prochaine étape de test."
  });
  assert.equal(afterRecord.decisions.length, decisionsBefore, "record_finding ne doit créer aucune Decision");

  const confirmedUnpromoted = afterRecord.findings.find((item) => item.id === afterRecord.findings[0].id)!;
  const afterConfirm = applyCommand(afterRecord, { type: "update_finding_status", findingId: confirmedUnpromoted.id, actorId: "act-coordinateur", status: "confirmed" });
  const afterPromote = applyCommand(afterConfirm, { type: "promote_finding_to_situation", findingId: confirmedUnpromoted.id, actorId: "act-coordinateur" });
  assert.equal(afterPromote.decisions.length, decisionsBefore, "promote_finding_to_situation ne doit créer aucune Decision — seule une Situation en résulte");
});

// TEST E — le dossier Joal (Décision, Coordination, Engagements) référence
// des objets Core réellement reliés entre eux, pas des données parallèles.
test("TEST E — Décision, Coordination et Engagements du dossier Joal sont réellement reliés entre eux", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;

  const decisions = relatedDecisionsForSituation(state, situation);
  assert.equal(decisions.length, 1);
  assert.equal(decisions[0].coordinationId, situation.coordinationId);

  const coordination = state.coordinationSpaces.find((item) => item.id === situation.coordinationId);
  assert.ok(coordination);
  assert.equal(coordination!.situationId, situation.id);
  assert.ok(coordination!.commitments.length > 0);
  coordination!.commitments.forEach((commitment) => {
    assert.ok(state.actors.some((actor) => actor.id === commitment.actorId), `l'acteur ${commitment.actorId} de l'engagement doit exister réellement`);
  });
});

// TEST F — chaque étape affichée du Value Trail possède une vraie source ;
// une étape non encore atteinte (Résultat) reste honnêtement "à confirmer",
// jamais un impact fabriqué (§14 du mandat).
//
// Correction Product Review (LOT 1, 2026-09-01, "Commitment ≠ Action") :
// l'étape "action" est renommée "engagement" — un Commitment prouve un
// engagement pris, jamais une action réellement exécutée.
test("TEST F — buildValueTrail s'appuie sur de vrais objets et n'invente jamais de résultat", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  const trail = buildValueTrail(state, situation);
  // LOT 4 (mandat "de l'action à la valeur démontrable", §9) : la Value
  // Trail est prolongée de 5 à 8 étapes (Changement observé, Impact,
  // Apprentissage) — mise à jour attendue de cette assertion, pas une
  // régression.
  assert.equal(trail.map((step) => step.key).join(","), "signal,comprehension,decision,engagement,resultat,changement,impact,apprentissage");

  const signalStep = trail.find((step) => step.key === "signal")!;
  assert.equal(signalStep.proven, true);

  const decisionStep = trail.find((step) => step.key === "decision")!;
  assert.equal(decisionStep.proven, true);
  assert.match(decisionStep.detail, new RegExp(decisionTypeLabels.ouvrir_coordination));

  const resultStep = trail.find((step) => step.key === "resultat")!;
  assert.equal(resultStep.proven, false, "aucun résultat n'a encore été constaté pour ce dossier — ne doit jamais être présenté comme prouvé");
  assert.match(resultStep.detail, /à confirmer/i);
  assert.equal(situation.result, undefined, "non-fabrication : le Résultat ne doit pas exister tant qu'il n'est pas réellement constaté");

  // LOT 4 — sans Result, les 3 nouvelles étapes restent honnêtement non
  // prouvées, jamais un texte décoratif présenté comme donnée.
  const changementStep = trail.find((step) => step.key === "changement")!;
  assert.equal(changementStep.proven, false);
  const impactStep = trail.find((step) => step.key === "impact")!;
  assert.equal(impactStep.proven, false);
  assert.match(impactStep.detail, /non encore mesuré/i);
  const apprentissageStep = trail.find((step) => step.key === "apprentissage")!;
  assert.equal(apprentissageStep.proven, false);
});

// Correction Product Review (LOT 1, 2026-09-01, "Commitment ≠ Action") —
// test explicitement demandé : une Coordination avec des Commitments encore
// "à faire", sans aucune preuve d'exécution, ne doit jamais déclarer une
// Action accomplie. sit-joal-glace-recurrence porte réellement 2
// Commitments "a_faire" et 0 Evidence — jeu de données réel, pas fabriqué
// pour ce test.
test("Commitment ≠ Action — 2 engagements « à faire » sans preuve d'exécution ne sont jamais présentés comme une Action accomplie", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  const coordination = state.coordinationSpaces.find((item) => item.id === situation.coordinationId)!;
  assert.ok(coordination.commitments.length >= 2);
  assert.ok(coordination.commitments.every((item) => item.status === "a_faire"), "jeu de données réel : aucun engagement encore honoré");
  assert.equal(state.evidences.filter((item) => item.situationId === situation.id).length, 0, "aucune preuve d'exécution enregistrée");

  const trail = buildValueTrail(state, situation);
  const engagementStep = trail.find((step) => step.key === "engagement")!;
  assert.equal(engagementStep.label, "Engagement", "jamais labellisé « Action »");
  assert.doesNotMatch(engagementStep.detail, /action accomplie|action réalisée|action exécutée/i, "un Commitment seul ne prouve jamais une Action");
  // proven=true reste honnête ici : l'étape affirme seulement qu'un
  // engagement a été PRIS, ce qui est réellement le cas — jamais qu'il a
  // été honoré.
  assert.equal(engagementStep.proven, true);
});

// TEST G — Correction Product Review (LOT 1, 2026-09-01, "priorité
// institutionnelle avant explicabilité") : la priorité métier prime
// toujours sur l'explicabilité. Sur Joal, 2 situations critiques sans
// Finding (sit-glace, sit-joal-veille) existent aux côtés de la situation
// haute priorité adossée à un Finding (sit-joal-glace-recurrence) — la
// sélection doit retenir une situation critique, jamais la situation haute
// priorité au prétexte qu'elle est explicable.
test("TEST G — findFocusSituation retient la priorité critique de Joal avant toute considération d'explicabilité", () => {
  const state = createDemoState();
  const focus = findFocusSituation(state, "joal");
  assert.ok(focus);
  assert.equal(focus!.priority, "critique");
  assert.equal(focus!.findingId, undefined, "les 2 situations critiques de Joal n'ont réellement aucun Finding — non masqué par la préférence d'explicabilité");
  assert.notEqual(focus!.id, "sit-joal-glace-recurrence", "la situation haute priorité explicable ne doit pas passer devant une situation critique");

  const dominant = state.territories.find((item) => item.activity === "critique");
  assert.equal(dominant?.id, "joal", "Joal doit rester l'unique territoire critique du jeu de démonstration");
});

// Correction Product Review (LOT 1, 2026-09-01) — test explicitement
// demandé : une Situation critique SANS Finding doit être sélectionnée
// avant une Situation de priorité inférieure AVEC Finding.
test("findFocusSituation — une Situation critique sans Finding passe devant une Situation moyenne avec Finding", () => {
  const critiqueSansFinding = makeSituation({ id: "sit-critique", territoryId: "zzz", priority: "critique" });
  const moyenneAvecFinding = makeSituation({ id: "sit-moyenne", territoryId: "zzz", priority: "moyenne", findingId: "fnd-moyenne" });
  const finding = makeFinding({ id: "fnd-moyenne" });
  const state = makeState([moyenneAvecFinding, critiqueSansFinding], [finding]);

  const focus = findFocusSituation(state, "zzz");
  assert.equal(focus?.id, "sit-critique", "la priorité métier prime toujours sur l'explicabilité");
});

// Correction Product Review (LOT 1, 2026-09-01) — test explicitement
// demandé : à priorité strictement égale, la Situation adossée à un
// Finding peut être préférée (départage, jamais un critère prioritaire).
test("findFocusSituation — à priorité égale, la Situation avec Finding peut être préférée", () => {
  const sansFinding = makeSituation({ id: "sit-sans-finding", territoryId: "zzz", priority: "haute" });
  const avecFinding = makeSituation({ id: "sit-avec-finding", territoryId: "zzz", priority: "haute", findingId: "fnd-avec" });
  const finding = makeFinding({ id: "fnd-avec" });
  const state = makeState([sansFinding, avecFinding], [finding]);

  const focus = findFocusSituation(state, "zzz");
  assert.equal(focus?.id, "sit-avec-finding", "à priorité égale, la situation explicable est préférée en départage");
});

// Non-régression légère : Kayar n'a aucune Situation (la chaîne s'arrête à
// CollectiveNeed, cf. LOT 0) — findKnowledgeGapForSituation ne doit pas
// planter pour un territoire sans Situation associée, et ne doit rien
// fabriquer pour Joal, qui n'a aucun Finding "knowledge_gap".
test("findKnowledgeGapForSituation reste honnête : aucun angle mort fabriqué pour Joal", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  assert.equal(findKnowledgeGapForSituation(state, situation), undefined);
});

// Correction Product Review (LOT 1, 2026-09-01, "ne pas surinterpréter les
// sources") : describeFindingTrust ne doit jamais affirmer une propriété
// (indépendance, concordance) que le modèle ne peut pas démontrer à partir
// du seul décompte de sourceRefs — y compris quand ces sourceRefs couvrent
// des objectType différents (un Signal et une Infrastructure référencés
// ensemble ne prouvent aucune indépendance entre eux).
test("describeFindingTrust — 4 sourceRefs de types différents ne sont jamais présentées comme « sources indépendantes »", () => {
  const finding = makeFinding({
    id: "fnd-4-sources",
    trust: "verifiee",
    sourceRefs: [
      { objectType: "signal", objectId: "sig-1" },
      { objectType: "infrastructure", objectId: "infra-1" },
      { objectType: "landing", objectId: "landing-1" },
      { objectType: "capacity", objectId: "capacity-1" }
    ]
  });
  const text = describeFindingTrust(finding);
  assert.doesNotMatch(text, /indépendant/i);
  assert.doesNotMatch(text, /concordent|concordance/i);
  assert.match(text, /^Vérifié —/);
  assert.match(text, /4 éléments référencés/);
});

test("describeFindingTrust — une seule source reste présentée comme telle, sans surinterprétation", () => {
  const finding = makeFinding({ id: "fnd-1-source", trust: "declaree", sourceRefs: [{ objectType: "signal", objectId: "sig-1" }] });
  const text = describeFindingTrust(finding);
  assert.equal(text, "Déclaré — un élément référencé à ce stade.");
});

// Correction Product Review (LOT 1, 2026-09-01, "Knowledge Gap : territoire
// seul insuffisant") : un Finding "knowledge_gap" du même territoire mais
// sans relation réelle au dossier (aucune sourceRef partagée, aucune
// référence directe au Finding de la Situation) ne doit plus être retourné.
test("findKnowledgeGapForSituation — même territoire mais aucune relation réelle au dossier → non retourné", () => {
  const situationFinding = makeFinding({ id: "fnd-glace", territoryIds: ["joal"], sourceRefs: [{ objectType: "signal", objectId: "sig-glace-1" }] });
  const situation = makeSituation({ id: "sit-glace-test", territoryId: "joal", priority: "haute", findingId: situationFinding.id });
  // Angle mort réel du jeu de démonstration (moteur, sourceRefs disjointes)
  // — même territoire, aucune relation avec le Finding "glace" ci-dessus.
  const unrelatedGap = makeFinding({ id: "fnd-gap-moteur", type: "knowledge_gap", territoryIds: ["joal"], sourceRefs: [{ objectType: "signal", objectId: "sig-moteur-1" }] });
  const state = makeState([situation], [situationFinding, unrelatedGap]);

  assert.equal(findKnowledgeGapForSituation(state, situation), undefined, "un Knowledge Gap du même territoire mais sans relation réelle ne doit jamais être rattaché");
});

test("findKnowledgeGapForSituation — Knowledge Gap réellement relié (sourceRef partagée) → retourné", () => {
  const situationFinding = makeFinding({ id: "fnd-glace-2", territoryIds: ["joal"], sourceRefs: [{ objectType: "signal", objectId: "sig-glace-2" }] });
  const situation = makeSituation({ id: "sit-glace-test-2", territoryId: "joal", priority: "haute", findingId: situationFinding.id });
  const relatedGap = makeFinding({ id: "fnd-gap-relie", type: "knowledge_gap", territoryIds: ["joal"], sourceRefs: [{ objectType: "signal", objectId: "sig-glace-2" }] });
  const state = makeState([situation], [situationFinding, relatedGap]);

  assert.equal(findKnowledgeGapForSituation(state, situation)?.id, "fnd-gap-relie");
});

test("findKnowledgeGapForSituation — Knowledge Gap réellement relié (référence directe au Finding) → retourné, même reflet exact du rattachement Kayar", () => {
  const situationFinding = makeFinding({ id: "fnd-glace-3", territoryIds: ["joal"], sourceRefs: [{ objectType: "signal", objectId: "sig-glace-3" }] });
  const situation = makeSituation({ id: "sit-glace-test-3", territoryId: "joal", priority: "haute", findingId: situationFinding.id });
  const relatedGap = makeFinding({ id: "fnd-gap-direct", type: "knowledge_gap", territoryIds: ["joal"], sourceRefs: [{ objectType: "finding", objectId: situationFinding.id }] });
  const state = makeState([situation], [situationFinding, relatedGap]);

  assert.equal(findKnowledgeGapForSituation(state, situation)?.id, "fnd-gap-direct");
});

// Micro-correctif Product Review (post-LOT 2, 2026-09-01) : une sourceRef
// partagée de type "territory" ne doit PAS suffire — c'est la même
// faiblesse que "même territoire" (déjà corrigée ci-dessus) réintroduite
// par la bande via un sourceRef territory plutôt qu'une comparaison de
// territoryIds. Seule une sourceRef réellement discriminante (ici : un
// Signal, en plus du territory partagé) établit la relation.
test("findKnowledgeGapForSituation — une sourceRef territory partagée seule ne suffit jamais à relier un Knowledge Gap", () => {
  const situationFinding = makeFinding({ id: "fnd-kayar-glace", territoryIds: ["kayar"], sourceRefs: [{ objectType: "territory", objectId: "kayar" }, { objectType: "signal", objectId: "sig-glace-kayar" }] });
  const situation = makeSituation({ id: "sit-kayar-glace-test", territoryId: "kayar", priority: "haute", findingId: situationFinding.id });
  // Angle mort moteur, cite le même territoire "kayar" mais aucune autre
  // sourceRef en commun (pas le même Signal, pas de référence directe au
  // Finding "glace") — ne doit pas être rattaché malgré la sourceRef
  // territory partagée.
  const unrelatedGapSameTerritoryRef = makeFinding({ id: "fnd-gap-moteur-kayar", type: "knowledge_gap", territoryIds: ["kayar"], sourceRefs: [{ objectType: "territory", objectId: "kayar" }, { objectType: "signal", objectId: "sig-moteur-kayar" }] });
  const state = makeState([situation], [situationFinding, unrelatedGapSameTerritoryRef]);

  assert.equal(findKnowledgeGapForSituation(state, situation), undefined, "un territory partagé seul ne doit jamais relier un Knowledge Gap à un Finding");
});

test("findKnowledgeGapForSituation — sourceRef territory partagée + une vraie source métier commune → retourné", () => {
  const situationFinding = makeFinding({ id: "fnd-kayar-glace-2", territoryIds: ["kayar"], sourceRefs: [{ objectType: "territory", objectId: "kayar" }, { objectType: "signal", objectId: "sig-glace-kayar-2" }] });
  const situation = makeSituation({ id: "sit-kayar-glace-test-2", territoryId: "kayar", priority: "haute", findingId: situationFinding.id });
  const relatedGap = makeFinding({ id: "fnd-gap-relie-kayar", type: "knowledge_gap", territoryIds: ["kayar"], sourceRefs: [{ objectType: "territory", objectId: "kayar" }, { objectType: "signal", objectId: "sig-glace-kayar-2" }] });
  const state = makeState([situation], [situationFinding, relatedGap]);

  assert.equal(findKnowledgeGapForSituation(state, situation)?.id, "fnd-gap-relie-kayar", "une sourceRef signal réellement partagée, en plus du territory, doit relier les deux Findings");
});
