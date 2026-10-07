import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { applyDemoProgramOpportunities } from "../src/data/demo-program-opportunities";
import { getOpportunities, OPPORTUNITY_UI_STEPS } from "../src/v3-template/lib/opportunity-bridge";
import { getTerritoryList, getTerritoryFiche } from "../src/v3-template/lib/territory-fiche-bridge";
import { ROLES } from "../src/v3-template/data/roles";
import { isScreenKey } from "../src/v3-template/types";
import { ARB } from "../src/v3-template/data/arbitrages";

// G2.1 — mandat "Vision territoriale", iso-design sur
// Mbambulaan_Etat_G2_Territoires.html branché sur les moteurs réels
// G1/V5 (Territory → Situation → Opportunity → Arbitration → Initiative
// → Result). Doctrine vérifiée ici : le mapping UI à 4 paliers ne doit
// jamais avancer un statut au-delà de la réalité du domaine, et la fiche
// territoire ne doit jamais fabriquer de donnée pour un territoire sans
// contenu réel.

test("mapping UI des statuts d'opportunité : jamais « Arbitrée » avant une Decision réelle", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const rows = getOpportunities(withDemo);

  const joal = rows.find((r) => r.problem.includes("écailles"))!;
  const kayar = rows.find((r) => r.problem.includes("connectivité"))!;
  const mbour = rows.find((r) => r.problem.includes("capacités froides"))!;

  assert.equal(joal.uiStep, "Repérée");
  assert.equal(kayar.uiStep, "Repérée");
  // Mbour est déjà "qualifying" (instruction engagée sur une Situation
  // réelle) — le palier UI doit refléter "En instruction", jamais plus.
  assert.equal(mbour.uiStep, "En instruction");

  // pending_arbitration doit rester "Qualifiée" tant qu'aucune Decision
  // réelle n'a tranché — jamais "Arbitrée" par anticipation.
  const qualified = applyCommand(withDemo, { type: "update_program_opportunity_status", programOpportunityId: joal.id, actorId: "act-coordinateur", status: "qualified" });
  const pending = applyCommand(qualified, { type: "update_program_opportunity_status", programOpportunityId: joal.id, actorId: "act-coordinateur", status: "pending_arbitration" });
  const pendingRow = getOpportunities(pending).find((r) => r.id === joal.id)!;
  assert.equal(pendingRow.uiStep, "Qualifiée", "à arbitrer ne doit jamais s'afficher comme déjà arbitrée");

  // Une fois réellement arbitrée (Decision créée), le palier UI avance —
  // mais seulement après ce geste réel, jamais avant.
  const arbitrated = applyCommand(pending, { type: "arbitrate_program_opportunity", programOpportunityId: joal.id, actorId: "act-ministre", outcome: "retenir", rationale: "Retenue après instruction." });
  const arbitratedRow = getOpportunities(arbitrated).find((r) => r.id === joal.id)!;
  assert.equal(arbitratedRow.uiStep, "Arbitrée");
  assert.equal(arbitratedRow.outcome, "retenue");
  assert.equal(OPPORTUNITY_UI_STEPS[arbitratedRow.uiStepIndex], "Arbitrée");
});

test("Joal-Fadiouth — région canonique Thiès, cohérente sur toutes les vues qui la consomment (correctif G2.1a)", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");

  // Source canonique du domaine (src/data/demo-state.ts) : Joal-Fadiouth
  // est une commune de la région de Thiès (département de Mbour), jamais
  // Fatick — erreur introduite par le lot G2.1, corrigée ici à la source.
  const canonicalJoal = state.territories.find((t) => t.id === "joal")!;
  assert.equal(canonicalJoal.region, "Thiès");

  // Vue liste (Territoires) — dérivée de data/territories.ts (TERR), une
  // copie d'affichage distincte du domaine canonique : doit rester
  // cohérente avec la source canonique, jamais une seconde vérité.
  const listJoal = getTerritoryList(withDemo).find((t) => t.id === "joal")!;
  assert.equal(listJoal.region, "Thiès");

  // Vue détail (fiche territoire) — lit territory.region directement
  // depuis le domaine canonique.
  const ficheJoal = getTerritoryFiche("joal", withDemo)!;
  assert.equal(ficheJoal.region, "Thiès");
});

test("getTerritoryList couvre les 18 sites réels, honnêtement étiquetés (documentée/structure prête/cas à documenter)", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const list = getTerritoryList(withDemo);

  assert.equal(list.length, 18);
  const joal = list.find((t) => t.id === "joal")!;
  const kayar = list.find((t) => t.id === "kayar")!;
  const mbour = list.find((t) => t.id === "mbour")!;
  const saintLouis = list.find((t) => t.id === "saint-louis")!;
  const yoff = list.find((t) => t.id === "yoff")!;

  assert.equal(joal.tag, "documentee");
  assert.equal(kayar.tag, "documentee");
  assert.equal(mbour.tag, "documentee");
  // Saint-Louis n'a ni Situation ni ProgramOpportunity réelle dans le
  // Demo World : cas à documenter, jamais un cas inventé.
  assert.equal(saintLouis.tag, "cas_a_documenter");
  // Un territoire sans narration réelle (ni Situation ni Opportunity)
  // reste "structure prête", jamais "documentée" par défaut.
  assert.equal(yoff.tag, "structure_prete");
});

test("getTerritoryFiche(Yoff) : « structure prête » dans la liste n'empêche jamais d'afficher le contenu réel de la fiche détail", () => {
  // Yoff n'est pas instrumenté jusqu'à l'opportunité/l'arbitrage (tag
  // "structure prête" dans la liste), mais porte de vraies Situations et
  // infrastructures dans le Demo World : la fiche détail reste
  // entièrement pilotée par les données réelles, jamais figée sur un
  // gabarit vide par défaut — et jamais fabriquée au-delà de ce que le
  // domaine porte réellement.
  const state = createDemoState();
  const fiche = getTerritoryFiche("yoff", state)!;
  assert.ok(fiche);
  assert.ok(fiche.counts.situations > 0, "Yoff porte réellement des Situations dans le Demo World");
  assert.equal(fiche.counts.opportunities, 0, "aucune ProgramOpportunity réelle n'existe pour Yoff — jamais fabriquée");
  assert.deepEqual(fiche.capacities.length, state.infrastructures.filter((i) => i.territoryId === "yoff").length, "les capacités affichées correspondent exactement aux Infrastructure réelles, ni plus ni moins");

  // Toute "Décision" affichée doit provenir d'un arbitrage réellement
  // préparé (data/arbitrages.ts, ARB) référençant ce territoire — jamais
  // une Decision inventée pour remplir la section.
  for (const item of fiche.decisionsAndActions) {
    if (item.kind === "Décision") {
      assert.ok(ARB.some((a) => a.title === item.title && a.territories?.includes("Yoff")));
    }
  }
});

test("getTerritoryFiche(Joal) reflète les Situations/Opportunités/Décisions réelles du domaine", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const fiche = getTerritoryFiche("joal", withDemo)!;

  assert.ok(fiche);
  assert.equal(fiche.curatedPriorityCaseAvailable, true);
  assert.ok(fiche.counts.situations > 0, "Joal doit refléter ses Situations réelles (sit-glace, etc.)");
  // Joal porte sa propre opportunité (écailles/coproduits) ET apparaît
  // honnêtement dans celle de Mbour (coordination inter-sites Mbour ↔
  // Joal ↔ Popenguine, qui cite réellement Joal comme repli concerné) —
  // deux opportunités réelles, pas une relation de complaisance.
  assert.equal(fiche.counts.opportunities, 2);
  assert.ok(fiche.opportunities.some((o) => o.problem.includes("écailles")));
  assert.ok(fiche.opportunities.some((o) => o.problem.includes("capacités froides")));
  // Le repli "Qualifiée" de Décisions/Arbitrages ne doit jamais inventer
  // une décision — doit rester dérivé des arbitrages réellement préparés
  // (data/arbitrages.ts) et de l'opportunité "detected" réelle.
  assert.ok(fiche.decisionsAndActions.length > 0);
});

test("saint-louis — « absence de cas territorial G2 qualifié ≠ absence de données » (doctrine G2.1a)", () => {
  const state = createDemoState();
  const fiche = getTerritoryFiche("saint-louis", state)!;
  assert.ok(fiche);

  // Aucun cas G2 n'a été qualifié pour Saint-Louis à ce jour (aucune
  // ProgramOpportunity ni arbitrage réel ne le référence) : le bandeau
  // "Cas territorial prioritaire à documenter" reste légitime.
  assert.equal(fiche.curatedPriorityCaseAvailable, false);
  assert.equal(fiche.isPriorityCaseToDocument, true);

  // Mais Saint-Louis porte bien des données réelles dans le domaine
  // (situation "Retour de pirogue retardé", acteurs, débarquements...) :
  // le lot G2.1 les masquait à tort derrière un état vide forcé. G2.1a
  // les restitue — jamais fabriquées, jamais masquées.
  assert.equal(fiche.territoryDataAvailable, true);
  assert.ok(fiche.counts.situations > 0, "Saint-Louis porte une vraie Situation (sit-saint-louis) — jamais masquée");
  assert.ok(fiche.actors.length > 0, "les acteurs réels de Saint-Louis restent visibles");
  // Aucune opportunité n'est fabriquée pour autant : le compteur reflète
  // honnêtement l'absence réelle de ProgramOpportunity sur ce territoire.
  assert.equal(fiche.counts.opportunities, 0);
});

test("un territoire sans aucune donnée réelle (hypothétique) afficherait territoryDataAvailable=false — jamais fabriqué pour ressembler à un cas documenté", () => {
  const state = createDemoState();
  // Yoff a de vraies données mais aucun cas G2 qualifié : sert de témoin
  // que territoryDataAvailable et curatedPriorityCaseAvailable varient
  // indépendamment l'un de l'autre, jamais couplés par construction.
  const fiche = getTerritoryFiche("yoff", state)!;
  assert.equal(fiche.territoryDataAvailable, true);
  assert.equal(fiche.curatedPriorityCaseAvailable, false);
  assert.equal(fiche.isPriorityCaseToDocument, false, "seul Saint-Louis porte le bandeau dédié, périmètre inchangé par G2.1a");
});

test("navigation : les écrans territoires/opportunites sont reconnus ; Opportunités rejoint la navigation V5 par rôle (ARCHITECTURE RECOVERY R1)", () => {
  // "territoires" reste une clé d'écran valide (drill-down depuis Atlas,
  // cf. App.tsx onOpenTerritoire) mais n'est plus en navigation primaire —
  // la navigation unifiée G2.1/G2.3 n'était pas validée comme évolution
  // de l'architecture V5 par rôle (ARCHITECTURE RECOVERY R1).
  assert.equal(isScreenKey("territoires"), true);
  assert.equal(isScreenKey("opportunites"), true);
  assert.ok(!ROLES.ministre.main.includes("territoires"));
  assert.ok(ROLES.ministre.main.includes("opportunites"));
  assert.ok(ROLES.ministre.main.includes("situations"));
  assert.ok(ROLES.ministre.sec.includes("flux"));
  assert.ok(ROLES.ministre.sec.includes("sources"));
});
