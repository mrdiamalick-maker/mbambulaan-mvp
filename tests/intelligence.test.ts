import assert from "node:assert/strict";
import test from "node:test";
import { isValidImageAnalysis, isValidInterpretation, isValidTranscription } from "../src/intelligence/schemas";
import { analyseImageFixture, interpretTerrainMessageFixture, transcribeAudioFixture } from "../src/intelligence/fixture-adapter";
import { createDemoState } from "../src/data/demo-state";

const KNOWN_TERRITORIES = createDemoState().territories.map((t) => ({ id: t.id, name: t.name }));

// --- Schémas stricts (mandat §3/§12, "malformed intelligence output ------
// rejected by schema") ------------------------------------------------

test("isValidInterpretation — accepte une sortie conforme, rejette tout écart au schéma strict", () => {
  assert.equal(
    isValidInterpretation({ intent: "besoin", summary: "x", confidence: "moyenne", needsHumanReview: false }),
    true
  );
  assert.equal(isValidInterpretation({ intent: "invalide", summary: "x", confidence: "moyenne", needsHumanReview: false }), false, "intent hors énumération");
  assert.equal(isValidInterpretation({ intent: "besoin", summary: "", confidence: "moyenne", needsHumanReview: false }), false, "résumé vide");
  assert.equal(isValidInterpretation({ intent: "besoin", summary: "x", confidence: "extreme", needsHumanReview: false }), false, "confidence hors énumération");
  assert.equal(isValidInterpretation({ intent: "besoin", summary: "x", confidence: "moyenne" }), false, "needsHumanReview manquant");
  assert.equal(isValidInterpretation({ intent: "besoin", summary: "x", confidence: "moyenne", needsHumanReview: false, quantity: "deux" }), false, "quantity doit être numérique");
  assert.equal(isValidInterpretation(null), false);
  assert.equal(isValidInterpretation("besoin"), false);
  assert.equal(isValidInterpretation({}), false);
});

test("isValidTranscription / isValidImageAnalysis — mêmes garde-fous stricts", () => {
  assert.equal(isValidTranscription({ text: "allô", confidence: "haute" }), true);
  assert.equal(isValidTranscription({ text: "", confidence: "haute" }), false);
  assert.equal(isValidTranscription({ text: "allô", confidence: "extreme" }), false);
  assert.equal(isValidImageAnalysis({ description: "une photo", confidence: "faible" }), true);
  assert.equal(isValidImageAnalysis({ description: "", confidence: "faible" }), false);
  assert.equal(isValidImageAnalysis({ confidence: "faible" }), false);
});

// --- Fixture déterministe — texte (mandat §12 "Text intelligence" / -------
// §13 scénario A) ---------------------------------------------------------

test("interpretTerrainMessageFixture — NEED : « J'ai besoin de glace aujourd'hui à Mbour. »", async () => {
  const result = await interpretTerrainMessageFixture({ text: "J'ai besoin de glace aujourd'hui à Mbour.", knownTerritories: KNOWN_TERRITORIES });
  assert.ok(isValidInterpretation(result));
  assert.equal(result.intent, "besoin");
  assert.equal(result.subject, "glace");
  assert.equal(result.territoryId, "mbour");
  assert.equal(result.timeWindow, "aujourd'hui");
  assert.equal(result.needsHumanReview, false);
});

test("interpretTerrainMessageFixture — CAPACITY : « J'ai 2 tonnes de chambre froide disponibles à Mbour aujourd'hui. »", async () => {
  const result = await interpretTerrainMessageFixture({
    text: "J'ai 2 tonnes de chambre froide disponibles à Mbour aujourd'hui.",
    knownTerritories: KNOWN_TERRITORIES
  });
  assert.equal(result.intent, "capacite");
  assert.equal(result.subject, "froid");
  assert.equal(result.quantity, 2);
  assert.equal(result.unit, "tonnes");
  assert.equal(result.territoryId, "mbour");
  assert.equal(result.timeWindow, "aujourd'hui");
});

test("interpretTerrainMessageFixture — SIGNAL : « La machine à glace du quai est en panne. » (needsHumanReview=true, consequential)", async () => {
  const result = await interpretTerrainMessageFixture({ text: "La machine à glace du quai est en panne.", knownTerritories: KNOWN_TERRITORIES });
  assert.equal(result.intent, "signal");
  assert.equal(result.subject, "équipement (machine à glace)");
  assert.equal(result.needsHumanReview, true, "un signal reste consequential (mandat §7) même avec un sujet clair");
});

test("interpretTerrainMessageFixture — OBSERVATION : « Beaucoup de pirogues sont rentrées ce matin. »", async () => {
  const result = await interpretTerrainMessageFixture({ text: "Beaucoup de pirogues sont rentrées ce matin.", knownTerritories: KNOWN_TERRITORIES });
  assert.equal(result.intent, "observation");
  assert.equal(result.subject, "activité de pêche");
  assert.equal(result.timeWindow, "ce matin");
});

test("interpretTerrainMessageFixture — message ambigu/conversationnel → non_classifie, jamais forcé, needsHumanReview=true", async () => {
  const result = await interpretTerrainMessageFixture({ text: "Bonjour, comment allez-vous ?", knownTerritories: KNOWN_TERRITORIES });
  assert.equal(result.intent, "non_classifie");
  assert.equal(result.needsHumanReview, true);
  assert.equal(result.quantity, undefined, "jamais une quantité fabriquée en l'absence de mention explicite");
  assert.equal(result.territoryId, undefined, "jamais un territoire fabriqué en l'absence de mention explicite");
});

// --- Fixture déterministe — audio (mandat §12 "Audio") --------------------

test("transcribeAudioFixture — média connu renvoie une transcription déterministe", async () => {
  const result = await transcribeAudioFixture({ mediaId: "fixture-audio-besoin-glace" });
  assert.ok(isValidTranscription(result));
  assert.match(result.text, /glace/);
});

test("transcribeAudioFixture — média inconnu échoue explicitement, jamais une transcription fabriquée (préparation du test d'échec §12)", async () => {
  await assert.rejects(() => transcribeAudioFixture({ mediaId: "media-totalement-inconnu" }), /indisponible/);
});

// --- Fixture déterministe — image (mandat §12 "Image" / §13 scénario C) --

test("analyseImageFixture — média connu renvoie une analyse déterministe, jamais une certitude absolue", async () => {
  const result = await analyseImageFixture({ mediaId: "fixture-image-machine-glace-endommagee" });
  assert.ok(isValidImageAnalysis(result));
  assert.notEqual(result.confidence, undefined);
});

test("analyseImageFixture — média inconnu échoue explicitement (préparation du test d'échec §12)", async () => {
  await assert.rejects(() => analyseImageFixture({ mediaId: "media-totalement-inconnu" }), /indisponible/);
});
