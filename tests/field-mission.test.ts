import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

// LOT 3 (mandat "Terrain — observer, vérifier et fiabiliser la réalité")
// — tests fonctionnels obligatoires A-M (§25 du mandat). Même discipline
// que program-opportunity.test.ts (LOT 2) : state frais à chaque test,
// applyCommand direct (la couche de permission est testée ailleurs), aucun
// fixture pré-créée dans le Demo World pour ce qui est démontré ici
// (mandat §26).

const KAYAR_GAP_FINDING_ID = "fnd-kayar-motorisation-connaissance-manquante";
const KAYAR_COLLECTIVE_NEED_ID = "cn-kayar-motorisation";

function createKayarMission(state = createDemoState()) {
  const next = applyCommand(state, {
    type: "create_field_mission",
    actorId: "act-coordinateur",
    title: "Qualifier les causes des difficultés récurrentes de motorisation — Kayar/Fass Boye",
    objective: "Comprendre la cause dominante des pannes moteur récurrentes avant de concevoir une intervention",
    territoryIds: ["kayar", "fass-boye"],
    reason: "Connaissance manquante identifiée — cause dominante non établie (constat fnd-kayar-motorisation-connaissance-manquante)",
    responsibleActorId: "act-operateur",
    // "infrastructure" reflète réellement le sujet moteur/équipement de ce
    // dossier (même catégorie que les Signals Kayar existants du Demo
    // World) — choisi explicitement ici, jamais déduit par
    // record_observation (micro-correctif Product post-LOT 3).
    signalCategory: "infrastructure",
    observationPoints: [
      "État des moteurs",
      "Fréquence et nature des pannes",
      "Disponibilité des pièces",
      "Accès aux réparateurs",
      "Pratiques d'entretien",
      "Autres facteurs"
    ],
    knowledgeGapFindingId: KAYAR_GAP_FINDING_ID,
    collectiveNeedId: KAYAR_COLLECTIVE_NEED_ID
  });
  const mission = next.fieldMissions[0];
  return { state: next, mission };
}

// TEST A — le Knowledge Gap Kayar peut explicitement générer une Mission,
// jamais automatiquement : aucune mission n'existe au chargement, la
// commande crée bien une mission liée.
test("TEST A — le Knowledge Gap Kayar peut générer une mission terrain, jamais automatiquement", () => {
  const initial = createDemoState();
  assert.equal(initial.fieldMissions.length, 0, "aucune mission n'est pré-créée au chargement du Demo World");

  const { state, mission } = createKayarMission(initial);
  assert.ok(mission);
  assert.equal(state.fieldMissions.length, 1);
  assert.match(mission.title, /Kayar/);
});

// TEST B — la mission conserve sa référence au Knowledge Gap (et au
// CollectiveNeed), sans dupliquer localement la connaissance manquante.
test("TEST B — la mission garde sa référence au Knowledge Gap et au CollectiveNeed Kayar", () => {
  const { mission } = createKayarMission();
  assert.equal(mission.knowledgeGapFindingId, KAYAR_GAP_FINDING_ID);
  assert.equal(mission.collectiveNeedId, KAYAR_COLLECTIVE_NEED_ID);
  assert.deepEqual(mission.territoryIds, ["kayar", "fass-boye"]);
  assert.ok(mission.observationPoints.length >= 3, "les axes d'observation ne sont pas des conclusions préétablies figées à 1");
});

// TEST C — la mission est visible pour l'agent assigné (filtrage par
// responsibleActorId, base de "Aujourd'hui").
test("TEST C — la mission est retrouvable pour l'agent assigné", () => {
  const { state, mission } = createKayarMission();
  const todaysMissions = state.fieldMissions.filter((item) => item.responsibleActorId === "act-operateur");
  assert.ok(todaysMissions.some((item) => item.id === mission.id));
});

// TEST D — démarrer une mission change réellement son statut, et
// l'enregistrement d'une observation est refusé tant qu'elle n'est pas en
// cours (mandat §10 : l'agent démarre explicitement avant d'observer).
test("TEST D — démarrer une mission change son statut ; observer avant démarrage est refusé", () => {
  const { state, mission } = createKayarMission();
  assert.equal(mission.status, "planifiee");

  assert.throws(() =>
    applyCommand(state, {
      type: "record_observation",
      actorId: "act-operateur",
      missionId: mission.id,
      territoryId: mission.territoryIds[0],
      content: "Tentative avant démarrage",
      nature: "insuffisant",
      trust: "declaree"
    })
  );

  const started = applyCommand(state, { type: "update_field_mission_status", actorId: "act-operateur", missionId: mission.id, status: "en_cours" });
  assert.equal(started.fieldMissions.find((item) => item.id === mission.id)!.status, "en_cours");
});

function startMission(state: ReturnType<typeof createDemoState>, missionId: string) {
  return applyCommand(state, { type: "update_field_mission_status", actorId: "act-operateur", missionId, status: "en_cours" });
}

// TEST E — l'observation enregistrée reste reliée à sa mission.
test("TEST E — l'observation enregistrée est reliée à sa mission", () => {
  const { state, mission } = createKayarMission();
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: mission.territoryIds[0],
    content: "Les moteurs examinés à Kayar montrent une usure au-delà de l'attendu pour leur âge déclaré ; plusieurs capitaines mentionnent un carburant de qualité variable.",
    nature: "nuance",
    trust: "observee"
  });
  const observation = next.observations[0];
  assert.ok(observation);
  assert.equal(observation.missionId, mission.id);
});

// TEST F — l'observation produit systématiquement un Signal terrain
// canonique (mandat §12 : Observation → Signal terrain → qualification).
test("TEST F — l'observation produit un Signal terrain canonique", () => {
  const { state, mission } = createKayarMission();
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: mission.territoryIds[0],
    content: "Aucun réparateur agréé disponible à moins de 40 km, ce qui rallonge chaque immobilisation.",
    nature: "confirme",
    trust: "observee"
  });
  const observation = next.observations[0];
  const signal = next.signals.find((item) => item.id === observation.signalId);
  assert.ok(signal, "l'observation doit référencer un Signal réellement présent dans le Core");
  assert.equal(signal!.channel, "terrain");
});

// TEST G — une observation n'ouvre jamais automatiquement de Situation
// (mandat §12, distinction Observation ≠ Situation).
test("TEST G — enregistrer une observation ne crée aucune Situation automatique", () => {
  const { state, mission } = createKayarMission();
  const started = startMission(state, mission.id);
  const situationsBefore = started.situations.length;
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: mission.territoryIds[0],
    content: "Observation neutre, ne permet pas de conclure à ce stade.",
    nature: "insuffisant",
    trust: "declaree"
  });
  assert.equal(next.situations.length, situationsBefore, "aucune Situation ne doit apparaître suite à une Observation");
});

// TEST H — provenance complète (mission / agent / territoire) préservée,
// jamais perdue au passage Observation → Signal.
test("TEST H — la provenance (mission, agent, territoire) est intégralement préservée", () => {
  const { state, mission } = createKayarMission();
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: mission.territoryIds[0],
    content: "Les pratiques d'entretien varient fortement d'un capitaine à l'autre.",
    nature: "nuance",
    trust: "observee"
  });
  const observation = next.observations[0];
  const signal = next.signals.find((item) => item.id === observation.signalId)!;
  assert.equal(observation.authorActorId, "act-operateur");
  assert.equal(observation.territoryId, mission.territoryIds[0]);
  assert.match(signal.source, new RegExp(mission.id));
  assert.match(signal.source, new RegExp(observation.id));
});

// TEST I — une preuve (Evidence) jointe à l'observation est bien reliée,
// sans nouvel objet FieldEvidence (mandat §13, réutilisation d'Evidence).
test("TEST I — une preuve jointe à l'observation est reliée (Evidence réutilisé, pas de FieldEvidence)", () => {
  const { state, mission } = createKayarMission();
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: mission.territoryIds[0],
    content: "Trois moteurs présentent une corrosion visible sur le bloc.",
    nature: "confirme",
    trust: "observee",
    evidence: { evidenceType: "photo", label: "Corrosion moteur constatée", detail: "Photo prise sur le quai de Kayar lors de la mission, 3 moteurs concernés." }
  });
  const observation = next.observations[0];
  assert.ok(observation.evidenceId);
  const evidence = next.evidences.find((item) => item.id === observation.evidenceId)!;
  assert.ok(evidence);
  assert.equal(evidence.missionId, mission.id);
  assert.equal(evidence.observationId, observation.id);
});

// TEST J — le dossier Kayar (CollectiveNeed) retrouve les nouveaux
// éléments terrain sans duplication locale : simple filtrage par
// collectiveNeedId, aucune donnée dupliquée dans CollectiveNeed lui-même.
test("TEST J — le dossier Kayar retrouve la mission terrain sans duplication locale des données", () => {
  const { state, mission } = createKayarMission();
  const need = state.collectiveNeeds.find((item) => item.id === KAYAR_COLLECTIVE_NEED_ID)!;
  const relatedMissions = state.fieldMissions.filter((item) => item.collectiveNeedId === need.id);
  assert.ok(relatedMissions.some((item) => item.id === mission.id));
  // Aucune propriété "missions" ou équivalente n'a été ajoutée directement
  // sur CollectiveNeed — la relation reste portée par FieldMission, lue à
  // la demande (même discipline que knowledgeGapFindingIds).
  assert.ok(!("fieldMissions" in need));
});

// TEST K — le Knowledge Gap reste ouvert après l'observation, sauf
// transition explicite (mandat §14/§15 : ne jamais fermer artificiellement
// pour un happy path).
test("TEST K — le Knowledge Gap reste ouvert après l'observation, sauf décision explicite", () => {
  const { state, mission } = createKayarMission();
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: mission.territoryIds[0],
    content: "Éléments nouveaux reçus, ne permettent pas encore de trancher entre les hypothèses.",
    nature: "nuance",
    trust: "observee"
  });
  const gap = next.findings.find((item) => item.id === KAYAR_GAP_FINDING_ID)!;
  assert.equal(gap.status, "confirmed", "le Knowledge Gap ne change pas de statut tant qu'une décision humaine explicite ne le fait pas (update_finding_status)");

  // La fermeture reste possible, mais uniquement via une commande
  // explicite distincte — jamais un effet de bord de record_observation.
  // (Un constat "confirmed" ne peut plus que devenir "superseded" par
  // update_finding_status — même garde-fou que le reste du pipeline de
  // connaissance, LOT 0.)
  const superseded = applyCommand(next, { type: "update_finding_status", actorId: "act-coordinateur", findingId: KAYAR_GAP_FINDING_ID, status: "superseded", note: "Éclairé par la mission terrain — remplacé par un constat plus précis sur la cause dominante" });
  assert.equal(superseded.findings.find((item) => item.id === KAYAR_GAP_FINDING_ID)!.status, "superseded");
});

// --- Micro-correctif Product (post-LOT 3) : territoire réel de
// l'observation + catégorie du signal terrain ---

// Mission mono-territoire dédiée aux tests ci-dessous — la mission Kayar
// standard (createKayarMission) est déjà multi-territoires (kayar +
// fass-boye), utile pour les tests multi-territoires, mais il faut aussi
// couvrir le cas mono-territoire explicitement (mandat : "mission
// mono-territoire → territoire correct").
function createMonoTerritoryMission(state = createDemoState()) {
  const next = applyCommand(state, {
    type: "create_field_mission",
    actorId: "act-coordinateur",
    title: "Vérification ciblée — Joal",
    objective: "Confirmer un point précis sur un seul territoire",
    territoryIds: ["joal"],
    reason: "Test dédié mono-territoire",
    signalCategory: "qualite",
    observationPoints: ["Point à vérifier"]
  });
  const mission = next.fieldMissions[0];
  return { state: next, mission };
}

test("Micro-correctif territoire — mission mono-territoire : l'observation porte le bon territoire", () => {
  const { state, mission } = createMonoTerritoryMission();
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: "joal",
    content: "Point vérifié sur place.",
    nature: "confirme",
    trust: "observee"
  });
  const observation = next.observations[0];
  const signal = next.signals.find((item) => item.id === observation.signalId)!;
  assert.equal(observation.territoryId, "joal");
  assert.equal(signal.territoryId, "joal");
});

test("Micro-correctif territoire — mission multi-territoires : l'observation sur le second territoire est correctement enregistrée", () => {
  const { state, mission } = createKayarMission();
  assert.deepEqual(mission.territoryIds, ["kayar", "fass-boye"]);
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: "fass-boye",
    content: "À Fass Boye spécifiquement, l'accès aux pièces est plus limité qu'à Kayar.",
    nature: "nuance",
    trust: "observee"
  });
  const observation = next.observations[0];
  const signal = next.signals.find((item) => item.id === observation.signalId)!;
  assert.equal(observation.territoryId, "fass-boye");
  assert.equal(signal.territoryId, "fass-boye");
  assert.notEqual(observation.territoryId, mission.territoryIds[0], "ne doit plus retomber implicitement sur territoryIds[0]");
});

test("Micro-correctif territoire — un territoire extérieur à la mission est refusé", () => {
  const { state, mission } = createKayarMission();
  const started = startMission(state, mission.id);
  assert.throws(() =>
    applyCommand(started, {
      type: "record_observation",
      actorId: "act-operateur",
      missionId: mission.id,
      territoryId: "joal",
      content: "Territoire hors mission.",
      nature: "insuffisant",
      trust: "declaree"
    })
  );
});

test("Micro-correctif catégorie — le Signal d'une mission « infrastructure » porte la catégorie infrastructure", () => {
  const { state, mission } = createKayarMission();
  assert.equal(mission.signalCategory, "infrastructure");
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: mission.territoryIds[0],
    content: "Observation catégorie infrastructure.",
    nature: "confirme",
    trust: "observee"
  });
  const observation = next.observations[0];
  const signal = next.signals.find((item) => item.id === observation.signalId)!;
  assert.equal(signal.category, "infrastructure");
});

test("Micro-correctif catégorie — une mission d'un autre sujet conserve réellement sa propre catégorie (pas de hardcode infrastructure)", () => {
  const { state, mission } = createMonoTerritoryMission();
  assert.equal(mission.signalCategory, "qualite");
  const started = startMission(state, mission.id);
  const next = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: "joal",
    content: "Observation catégorie qualité, pas infrastructure.",
    nature: "confirme",
    trust: "observee"
  });
  const observation = next.observations[0];
  const signal = next.signals.find((item) => item.id === observation.signalId)!;
  assert.equal(signal.category, "qualite");
  assert.notEqual(signal.category, "infrastructure");
});

test("Micro-correctif catégorie — aucun hardcode générique « infrastructure » dans applyRecordObservation", () => {
  const source = readFileSync(new URL("../src/domain/field-mission.ts", import.meta.url), "utf8");
  const start = source.indexOf("function applyRecordObservation");
  const end = source.indexOf("\nfunction applyFieldMissionCommand", start);
  const functionBody = source.slice(start, end === -1 ? undefined : end);
  assert.doesNotMatch(functionBody, /category:\s*"infrastructure"/, "la catégorie du Signal doit venir de mission.signalCategory, jamais d'un littéral codé en dur");
  assert.match(functionBody, /category:\s*mission\.signalCategory/);
});

// TEST L — le parcours générique capitaine "Signaler un problème" utilise
// désormais create_signal (pipeline normal), plus le wrapper couplé
// report_signal_and_open_situation (mandat §17).
test("TEST L — TerrainCaptainView.submitSignal utilise create_signal, plus le wrapper couplé", () => {
  const source = readFileSync(new URL("../src/components/terrain/TerrainCaptainView.tsx", import.meta.url), "utf8");
  const submitSignalBlock = source.slice(source.indexOf("const submitSignal"));
  assert.match(submitSignalBlock, /type:\s*"create_signal"/, "le signalement générique capitaine doit désormais utiliser create_signal");
  assert.doesNotMatch(submitSignalBlock.slice(0, submitSignalBlock.indexOf(")")), /report_signal_and_open_situation/);
});

// TEST M — non-régression Joal (LOT 1) et Kayar (LOT 2) : la suite
// complète reste verte (vérifié par ailleurs, `npm test`), et
// create_field_mission peut référencer une vraie Situation Joal (test
// d'architecture uniquement, mandat §16 — Joal reste secondaire, pas
// reconstruit).
test("TEST M — create_field_mission peut référencer la Situation Joal réelle (architecture, Joal non reconstruit)", () => {
  const state = createDemoState();
  const joalSituation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  assert.ok(joalSituation);
  const next = applyCommand(state, {
    type: "create_field_mission",
    actorId: "act-coordinateur",
    title: "Vérifier la tenue de la maintenance préventive — Joal",
    objective: "Confirmer que la maintenance programmée réduit bien la récurrence des pannes de glace",
    territoryIds: [joalSituation.territoryId],
    reason: "Suite à la décision de maintenance préventive, vérification de terrain possible plutôt qu'attendre une nouvelle panne",
    signalCategory: "infrastructure",
    observationPoints: ["État du dispositif de production de glace", "Respect du calendrier de maintenance"],
    situationId: joalSituation.id
  });
  const mission = next.fieldMissions[0];
  assert.equal(mission.situationId, joalSituation.id);
  // Non-régression : la Situation Joal elle-même n'est pas modifiée par la
  // seule création d'une mission qui la référence.
  assert.deepEqual(next.situations.find((item) => item.id === joalSituation.id), joalSituation);
});
