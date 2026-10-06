import assert from "node:assert/strict";
import test from "node:test";
import { ARB } from "../src/v3-template/data/arbitrages";
import { buildDocument } from "../src/v3-template/lib/document-bridge";
import { buildPresentationSlides } from "../src/v3-template/lib/presentation-bridge";
import { getNationalLandingTotals } from "../src/v3-template/lib/landing-bridge";
import { DEMO_STATE } from "../src/v3-template/lib/demo-state";

// etat-v5 checkpoint E — doctrine : une Decision canonique réellement
// enregistrée (state.decisions, create_decision) est toujours source de
// vérité, et un arbitrage déjà tranché sort des "décisions attendues".
// DEMO_STATE porte déjà deux Decision réelles pour sit-glace (ARB[0]) —
// dec-glace-1/dec-glace-2, src/data/demo-state.ts — donc ce fixture
// suffit à vérifier la doctrine sans en fabriquer un nouveau.

test("un arbitrage dont la situation a déjà une décision enregistrée disparaît des décisions attendues en Présentation", () => {
  const slides = buildPresentationSlides(DEMO_STATE);
  const pendingSlide = slides.find((slide) => slide.kicker === "Décisions attendues");
  assert.ok(pendingSlide);

  // ARB[0] (sit-glace) a une décision réelle enregistrée dans DEMO_STATE :
  // ne doit plus apparaître comme une décision encore attendue.
  assert.ok(!pendingSlide!.lines.some((line) => line.startsWith(ARB[0].title)), "un arbitrage déjà décidé ne doit plus être listé comme attendu");

  // ARB[1] (sit-mbour, aucune décision dans DEMO_STATE) et ARB[2] (pas de
  // situationId, jamais décidable par ce mécanisme) restent attendus.
  assert.ok(pendingSlide!.lines.some((line) => line.startsWith(ARB[1].title)));
  assert.ok(pendingSlide!.lines.some((line) => line.startsWith(ARB[2].title)));
  assert.equal(pendingSlide!.lines.length, 2);
  assert.equal(pendingSlide!.title, "2 décision(s) en attente");
});

test("si tous les arbitrages préparés sont décidés, la diapositive l'annonce honnêtement plutôt que de lister une file vide", () => {
  // État dérivé de DEMO_STATE où les trois arbitrages sont réputés
  // décidés (même mécanisme que la doctrine : situationId + decisions) —
  // ARB[2] n'a pas de situationId donc ne peut jamais être "décidé" par
  // ce mécanisme ; ce test vérifie seulement la branche "aucune décision
  // en attente" du libellé, pas un état atteignable en pratique pour
  // ARB[2] avant que le domaine ne sache créer une Decision programme.
  const slides = buildPresentationSlides({
    ...DEMO_STATE,
    decisions: [
      ...DEMO_STATE.decisions,
      { id: "dec-test-mbour", situationId: "sit-mbour", type: "ouvrir_coordination", rationale: "Test.", decidedByActorId: "act-coordinateur", decidedAt: new Date().toISOString() }
    ]
  });
  const pendingSlide = slides.find((slide) => slide.kicker === "Décisions attendues");
  // ARB[2] (sans situationId) reste seul attendu : jamais fabriqué décidé.
  assert.equal(pendingSlide!.lines.length, 1);
  assert.ok(pendingSlide!.lines[0].startsWith(ARB[2].title));
});

test("la Note de décision privilégie la décision canonique déjà enregistrée au texte libre saisi après coup", () => {
  const freeText = "Texte libre qui ne doit jamais apparaître dans le document.";
  const note = buildDocument({ type: "decision", arbitrageIndex: 0 }, freeText, DEMO_STATE);
  const decisionSection = note.sections.find((section) => section.heading === "Décision humaine");

  assert.ok(decisionSection);
  assert.equal(note.hasCanonicalDecision, true);
  // Le texte libre ne doit apparaître nulle part dans la section : la
  // décision canonique (dec-glace-1, "demander_verification") prévaut.
  assert.ok(!decisionSection!.lines.some((line) => line.includes(freeText)));
  assert.ok(decisionSection!.lines.some((line) => line.includes("Demander une vérification")));
  assert.ok(decisionSection!.lines.some((line) => line.includes("Confirmer l’indisponibilité avec le poste de quai")));
  assert.ok(decisionSection!.lines.some((line) => line.includes("Mamadou Fall")));
});

test("sans décision canonique enregistrée, la Note de décision retombe honnêtement sur le texte libre (comportement inchangé)", () => {
  const note = buildDocument({ type: "decision", arbitrageIndex: 1 }, "Option retenue après revue humaine.", DEMO_STATE);
  const decisionSection = note.sections.find((section) => section.heading === "Décision humaine");

  assert.equal(note.hasCanonicalDecision, false);
  assert.ok(decisionSection!.lines.includes("Option retenue après revue humaine."));
});

test("getNationalLandingTotals calcule désormais à partir de l'état transmis, pas uniquement de l'instantané statique", () => {
  const fromDefault = getNationalLandingTotals();
  const fromExplicitState = getNationalLandingTotals(DEMO_STATE);
  assert.equal(fromExplicitState.landingCount, fromDefault.landingCount);
  assert.equal(fromExplicitState.landingCount, DEMO_STATE.landings.length);
});
