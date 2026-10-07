import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyDemoProgramOpportunities } from "../src/data/demo-program-opportunities";
import { applyCommand } from "../src/domain/rules";
import { getTerritorialCasebook } from "../src/v3-template/lib/territorial-casebook";
import { getTerritoryFiche } from "../src/v3-template/lib/territory-fiche-bridge";
import { getOpportunityDetail } from "../src/v3-template/lib/opportunity-bridge";
import { getArbitrageItems } from "../src/v3-template/lib/arbitrages-bridge";
import {
  getBriefSummary,
  getBriefHeroLine,
  getBriefTldrLine,
  getPendingBriefDecisions
} from "../src/v3-template/lib/brief-bridge";
import { TERR } from "../src/v3-template/data/territories";
import { TERRITORY_ID_BY_NAME } from "../src/v3-template/lib/landing-bridge";

// G2.4 — mandat "Territorial Casebook + Brief Data Alignment". Doctrine
// vérifiée ici : absence de données ≠ problème ; hypothèse ≠ fait ;
// opportunité ≠ décision ; objectif ≠ résultat observé.

const ALL_TERRITORY_IDS = TERR.map((row) => TERRITORY_ID_BY_NAME[row[0]]);

function liveState() {
  return applyDemoProgramOpportunities(createDemoState(), "act-coordinateur");
}

test("Casebook : au maximum 2 cas par territoire, sur les 18 territoires du Demo World", () => {
  const state = liveState();
  for (const territoryId of ALL_TERRITORY_IDS) {
    const cases = getTerritorialCasebook(territoryId, state);
    assert.ok(cases.length <= 2, `${territoryId} porte ${cases.length} cas (> 2)`);
  }
});

test("Casebook : Joal-Fadiouth et Kayar portent chacun 1 cas documenté + 1 cas à qualifier ; Mbour 1 seul cas à qualifier ; Saint-Louis aucun cas", () => {
  const state = liveState();

  const joal = getTerritorialCasebook("joal", state);
  assert.equal(joal.length, 2);
  assert.equal(joal.filter((c) => c.qualification === "documente").length, 1);
  assert.equal(joal.filter((c) => c.qualification === "a_qualifier").length, 1);

  const kayar = getTerritorialCasebook("kayar", state);
  assert.equal(kayar.length, 2);
  assert.equal(kayar.filter((c) => c.qualification === "documente").length, 1);
  assert.equal(kayar.filter((c) => c.qualification === "a_qualifier").length, 1);

  const mbour = getTerritorialCasebook("mbour", state);
  assert.equal(mbour.length, 1);
  assert.equal(mbour[0].qualification, "a_qualifier", "Mbour ne doit porter qu'une hypothèse, jamais un second cas quasi identique à Joal");

  const saintLouis = getTerritorialCasebook("saint-louis", state);
  assert.deepEqual(saintLouis, [], "Saint-Louis reste honnêtement « à documenter » au niveau du casebook");
});

test("Casebook : jamais une hypothèse affichée comme fait — les champs 'a_qualifier' et 'documente' ne se mélangent jamais", () => {
  const state = liveState();
  for (const territoryId of ALL_TERRITORY_IDS) {
    for (const c of getTerritorialCasebook(territoryId, state)) {
      if (c.qualification === "a_qualifier") {
        assert.ok(c.knowledgeGaps && c.knowledgeGaps.length > 0, `${c.id} (à qualifier) doit exposer ses knowledgeGaps réels`);
        assert.equal(c.linkedInitiativeId, undefined, "une opportunité à qualifier ne doit jamais porter une Initiative (opportunité ≠ programme)");
        assert.equal(c.linkedResultIds, undefined, "une hypothèse ne doit jamais citer un résultat observé réel (hypothèse ≠ fait)");
      }
      if (c.qualification === "documente") {
        assert.equal(c.knowledgeGaps, undefined, "un cas documenté ne porte jamais de knowledgeGaps (champ réservé à 'a_qualifier')");
        assert.equal(c.potentialValueHypothesis, undefined, "un cas documenté ne porte jamais de potentialValueHypothesis (réservé à 'a_qualifier')");
      }
      assert.equal(c.territoryId, territoryId, "chaque cas doit référencer son territoire réel");
    }
  }
});

test("Casebook : aucune donnée chiffrée inventée — le texte 'à qualifier' est exactement celui de la ProgramOpportunity réelle, jamais reformulé avec un chiffre", () => {
  const state = liveState();
  const joalCase = getTerritorialCasebook("joal", state).find((c) => c.qualification === "a_qualifier")!;
  const realDetail = getOpportunityDetail(joalCase.linkedOpportunityId!, state)!;
  assert.equal(joalCase.title, realDetail.problem);
  assert.equal(joalCase.summary, realDetail.justification);
  assert.deepEqual(joalCase.knowledgeGaps, realDetail.knowledgeGaps);
  assert.equal(joalCase.potentialValueHypothesis, realDetail.potentialValueHypothesis);
});

test("Casebook : Joal-Fadiouth est rattaché à la région de Thiès (correctif G2.1a), jamais Fatick", () => {
  const state = liveState();
  const territory = state.territories.find((t) => t.id === "joal")!;
  assert.equal(territory.region, "Thiès");
});

test("Fiche territoire : Saint-Louis conserve ses données réelles même sans cas casebook qualifié", () => {
  const state = liveState();
  const fiche = getTerritoryFiche("saint-louis", state)!;
  assert.equal(fiche.casebook.length, 0);
  assert.equal(fiche.territoryDataAvailable, true, "les données réelles (situations, acteurs...) restent affichées indépendamment du casebook");
  assert.equal(fiche.isPriorityCaseToDocument, true);
});

test("Casebook : un résultat n'est cité que s'il existe réellement dans state.results", () => {
  const state = liveState();
  for (const territoryId of ALL_TERRITORY_IDS) {
    for (const c of getTerritorialCasebook(territoryId, state)) {
      if (c.linkedResultIds) {
        for (const resultId of c.linkedResultIds) {
          assert.ok(state.results.some((r) => r.id === resultId), `${resultId} doit exister réellement dans state.results`);
        }
      }
    }
  }
  // Joal n'a aujourd'hui aucun Result réel rattaché (seul result-immatriculation-t1
  // existe, sur hann/soumbedioune/rufisque/mbour) : jamais fabriqué pour Joal.
  const joalDocumented = getTerritorialCasebook("joal", state).find((c) => c.qualification === "documente")!;
  assert.equal(joalDocumented.linkedResultIds, undefined);
});

test("Brief : getPendingBriefDecisions et getArbitrageItems restent la même source unique (correctif G2.4, Arbitrages ↔ Brief incohérents avant ce lot)", () => {
  const state = liveState();
  const briefDecisions = getPendingBriefDecisions(state);
  const arbitrageItems = getArbitrageItems(state);
  assert.equal(briefDecisions.length, arbitrageItems.length);
  assert.deepEqual(briefDecisions.map((d) => d.title).sort(), arbitrageItems.map((i) => i.title).sort());
});

test("Brief : une décision déjà rendue (sit-glace) n'apparaît jamais dans les décisions attendues", () => {
  const state = liveState();
  const titles = getPendingBriefDecisions(state).map((d) => d.title);
  assert.ok(!titles.includes("Mobiliser une capacité froide de remplacement à Joal"), "sit-glace porte déjà une décision réelle (dec-glace-1/2) dans le Demo World de base");
  assert.ok(titles.includes("Autoriser le délestage temporaire Mbour → Popenguine"), "sit-mbour reste réellement non décidé dans le Demo World de base");
});

test("Brief : le hero et la 'Lecture en 20 secondes' lisent le runtime, jamais un texte figé — ils changent quand l'état change", () => {
  const state = liveState();
  const before = getBriefSummary(state);
  const heroBefore = getBriefHeroLine(before);
  const tldrBefore = getBriefTldrLine(before);

  // Clôturer toutes les situations ouvertes critiques/hautes change
  // nécessairement le compte de territoires sous attention.
  let after = state;
  for (const situation of state.situations.filter((s) => s.priority === "critique" || s.priority === "haute")) {
    after = { ...after, situations: after.situations.map((s) => (s.id === situation.id ? { ...s, status: "reglee" as const } : s)) };
  }
  const afterSummary = getBriefSummary(after);
  assert.equal(afterSummary.attentionTerritoryIds.length, 0, "plus aucune Situation ouverte critique/haute après clôture");
  const heroAfter = getBriefHeroLine(afterSummary);
  const tldrAfter = getBriefTldrLine(afterSummary);
  assert.notEqual(heroBefore, heroAfter, "le hero doit refléter le changement réel d'état, jamais un texte figé par rôle");
  assert.notEqual(tldrBefore, tldrAfter, "la 'Lecture en 20 secondes' doit aussi refléter le changement réel d'état");
});

test("Brief : opportunité ≠ programme — une opportunité non convertie ne porte jamais d'Initiative fabriquée dans le résumé", () => {
  const state = liveState();
  const summary = getBriefSummary(state);
  if (summary.notableOpportunity) {
    const detail = getOpportunityDetail(
      state.programOpportunities.find((o) => o.problem === summary.notableOpportunity!.problem)!.id,
      state
    );
    assert.ok(detail);
    assert.notEqual(detail!.status, "converted_to_program", "une opportunité 'en instruction' ne doit jamais être déjà convertie en programme");
  }
});

test("Brief : résultat affiché uniquement s'il existe réellement — recentResultsCount égale exactement state.results.length", () => {
  const state = liveState();
  const summary = getBriefSummary(state);
  assert.equal(summary.recentResultsCount, state.results.length);
});

test("Brief : la synthèse 'Décisions attendues' ignore une arbitration déjà tranchée via arbitrate_program_opportunity", () => {
  const state = liveState();
  const joalOpp = state.programOpportunities.find((o) => o.problem.includes("écailles"))!;
  const qualifying = applyCommand(state, { type: "update_program_opportunity_status", programOpportunityId: joalOpp.id, actorId: "act-coordinateur", status: "qualifying" });
  const qualified = applyCommand(qualifying, { type: "update_program_opportunity_status", programOpportunityId: joalOpp.id, actorId: "act-coordinateur", status: "qualified" });
  const pending = applyCommand(qualified, { type: "update_program_opportunity_status", programOpportunityId: joalOpp.id, actorId: "act-coordinateur", status: "pending_arbitration" });
  const beforeDecision = getPendingBriefDecisions(pending);
  assert.ok(beforeDecision.some((d) => d.title === joalOpp.problem), "l'opportunité pending_arbitration doit apparaître comme décision attendue");

  const decided = applyCommand(pending, { type: "arbitrate_program_opportunity", programOpportunityId: joalOpp.id, actorId: "act-ministre", outcome: "retenir", rationale: "Retenue après instruction complète." });
  const afterDecision = getPendingBriefDecisions(decided);
  assert.ok(!afterDecision.some((d) => d.title === joalOpp.problem), "une fois arbitrée, l'opportunité ne doit plus apparaître dans les décisions attendues");
});
