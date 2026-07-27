import fs from "node:fs";

function patch(path, replacements) {
  let content = fs.readFileSync(path, "utf8");
  for (const [from, to] of replacements) {
    if (!content.includes(from)) throw new Error(`Occurrence introuvable dans ${path}: ${from}`);
    content = content.replace(from, to);
  }
  fs.writeFileSync(path, content);
}

patch("src/domain/capabilities/end-to-end-ecosystem-identity-trust-governance-capability.ts", [
  ["if (!approved) {", "if (!input.approved) {"],
  ["`Identité suspendue ${identity.id} : ${reason}`", "`Identité suspendue ${identity.id} : ${input.reason}`"],
]);
patch("src/domain/capabilities/end-to-end-ethical-financing-risk-sharing-capability.ts", [
  ["this.touch(item, proposedAt);", "this.touch(item, input.proposedAt);"],
]);
patch("src/domain/capabilities/end-to-end-national-capacity-investment-planning-capability.ts", [
  ["this.touch(plan, proposedAt);", "this.touch(plan, input.proposedAt);"],
]);
patch("src/domain/capabilities/end-to-end-public-program-policy-impact-capability.ts", [
  ["this.touch(item, launchedAt);", "this.touch(item, input.launchedAt);"],
]);
patch("src/domain/capabilities/end-to-end-quality-compliance-certification-traceability-capability.ts", [
  ["this.touch(item, generatedAt);", "this.touch(item, input.generatedAt);"],
  ["blockers, warnings, generatedAt };", "blockers, warnings, generatedAt: input.generatedAt };"],
]);
patch("src/domain/capabilities/end-to-end-major-capabilities.test.ts", [
  ["interventionType: \"cold_chain_support\"", "interventionType: \"logistics_support\""],
]);
for (const path of [
  "src/domain/capabilities/end-to-end-national-capacity-investment-planning-capability.test.ts",
  "src/domain/capabilities/end-to-end-national-fisheries-registry-reference-data-capability.test.ts",
  "src/domain/capabilities/end-to-end-quality-compliance-certification-traceability-capability.test.ts",
]) {
  patch(path, [["from \"vitest\"", "from \"../../test/vitest-compat\""]]);
}
patch("src/domain/services.test.ts", [
  ["getCompatibleCapacitiesForServiceNeed", "getCompatibleCapacitiesForNeed"],
  ["const compatible = getCompatibleCapacitiesForNeed(", "assert.ok(coverage);\n  const compatible = getCompatibleCapacitiesForNeed("],
  ["coverage.remainingQuantity", "coverage.remainingToAllocate"],
  ["    \"2026-07-25T09:50:00Z\",\n    60,", "    \"2026-07-25T09:50:00Z\","],
]);
patch("src/features/service-coordination/createExpectedReturnAndNeeds.ts", [
  ["AnnounceExpectedReturnInput", "CreateExpectedReturnInput"],
]);

const seed = `import type { ISODateTime } from "./types";
import { UserExperienceCatalog, type ActorExperienceCatalogEntry, type CrossActorExperienceFlow, type ExperienceMoment, type ExperienceOutcome } from "./user-experience-catalog";

export interface MvpExperienceSeedResult {
  catalog: UserExperienceCatalog;
  summary: { actorExperienceCount: number; crossActorFlowCount: number; ministryValueMoments: number; atlasPremiumMoments: number };
}

const outcomes: ExperienceOutcome[] = [
  { id: "outcome-fisher-coordination", actorKind: "fisher", statement: "Annoncer son retour et accéder aux services préparés.", measurableBy: ["retours annoncés", "temps d'attente"], valueType: "coordination" },
  { id: "outcome-cooperative-visibility", actorKind: "cooperative", statement: "Coordonner les membres et prévenir les ruptures.", measurableBy: ["besoins couverts", "incidents résolus"], valueType: "visibility" },
  { id: "outcome-ministry-decision", actorKind: "ministry", statement: "Décider à partir de données nationales traçables.", measurableBy: ["territoires couverts", "décisions documentées"], valueType: "compliance" },
];

const moments: ExperienceMoment[] = [
  { id: "moment-fisher-return", code: "announce_expected_return", name: "Annonce du retour", actorKind: "fisher", productCode: "fisher", surface: "mobile", priority: "must_have", trigger: "Le retour devient prévisible.", userGoal: "Préparer le débarquement.", userActions: ["Déclarer l'heure et la capture estimée"], systemResponses: ["Alerter le site et les prestataires"], visibleData: ["heure prévue", "besoins"], emittedEvents: ["ExpectedReturnAnnounced"], workflowCodes: ["sea_to_landing"], capabilityCodes: ["operational_visibility", "service_coordination"], successCriteria: ["retour partagé"], failureRecovery: ["mode assisté et synchronisation différée"], offlineSupport: true, assistedMode: true, status: "ready" },
  { id: "moment-cooperative-coordinate", code: "coordinate_members", name: "Coordination des membres", actorKind: "cooperative", productCode: "cooperative", surface: "web", priority: "must_have", trigger: "Des retours ou besoins sont ouverts.", userGoal: "Affecter les capacités disponibles.", userActions: ["Consulter", "prioriser", "affecter"], systemResponses: ["Calculer la couverture et les tensions"], visibleData: ["retours", "besoins", "capacités"], emittedEvents: ["CapacityAllocated"], workflowCodes: ["territorial_coordination"], capabilityCodes: ["availability_allocation", "tension_coordination"], successCriteria: ["besoins couverts"], failureRecovery: ["escalade territoriale"], offlineSupport: false, assistedMode: true, status: "ready" },
  { id: "moment-ministry-steering", code: "national_steering", name: "Pilotage national", actorKind: "ministry", productCode: "government", surface: "command_center", priority: "must_have", trigger: "Une décision publique est requise.", userGoal: "Comparer les territoires et décider.", userActions: ["Analyser", "décider", "suivre"], systemResponses: ["Consolider les indicateurs et preuves"], visibleData: ["volumes", "tensions", "investissements", "résultats"], emittedEvents: ["PublicDecisionRecorded"], workflowCodes: ["national_governance"], capabilityCodes: ["sector_piloting", "public_programs"], successCriteria: ["décision traçable"], failureRecovery: ["revue humaine des données"], offlineSupport: false, assistedMode: false, status: "ready" },
];

const actorEntries: ActorExperienceCatalogEntry[] = [
  { id: "ux-fisher", actorKind: "fisher", productCodes: ["fisher"], promise: "Moins d'attente et plus de visibilité.", onboardingMoments: ["moment-fisher-return"], dailyMoments: ["moment-fisher-return"], coordinationMoments: ["moment-fisher-return"], exceptionMoments: ["moment-fisher-return"], decisionMoments: [], outcomeIds: ["outcome-fisher-coordination"], ministryDemonstrationValue: ["activité terrain visible"], atlasPremiumValue: ["prévision des retours"], completeForMvp: true },
  { id: "ux-cooperative", actorKind: "cooperative", productCodes: ["cooperative"], promise: "Piloter les besoins et capacités des membres.", onboardingMoments: ["moment-cooperative-coordinate"], dailyMoments: ["moment-cooperative-coordinate"], coordinationMoments: ["moment-cooperative-coordinate"], exceptionMoments: ["moment-cooperative-coordinate"], decisionMoments: ["moment-cooperative-coordinate"], outcomeIds: ["outcome-cooperative-visibility"], ministryDemonstrationValue: ["coordination locale mesurable"], atlasPremiumValue: ["anticipation des tensions"], completeForMvp: true },
  { id: "ux-ministry", actorKind: "ministry", productCodes: ["government"], promise: "Décider et suivre l'impact national.", onboardingMoments: ["moment-ministry-steering"], dailyMoments: ["moment-ministry-steering"], coordinationMoments: ["moment-ministry-steering"], exceptionMoments: ["moment-ministry-steering"], decisionMoments: ["moment-ministry-steering"], outcomeIds: ["outcome-ministry-decision"], ministryDemonstrationValue: ["pilotage national"], atlasPremiumValue: ["simulation et analyse"], completeForMvp: true },
];

const flows: CrossActorExperienceFlow[] = [
  { id: "flow-return-to-decision", code: "return_to_national_decision", name: "Du retour terrain à la décision", actorKinds: ["fisher", "cooperative", "ministry"], orderedMomentIds: ["moment-fisher-return", "moment-cooperative-coordinate", "moment-ministry-steering"], expectedSharedOutputs: ["flux coordonné et consolidé"], governmentOutputs: ["indicateurs territoriaux"], atlasOutputs: ["prévisions et signaux faibles"], successCriteria: ["donnée terrain transformée en décision"], mandatoryForMvp: true, status: "ready" },
];

export function seedMvpUserExperienceCatalog(createdAt: ISODateTime): MvpExperienceSeedResult {
  const catalog = new UserExperienceCatalog();
  outcomes.forEach((item) => catalog.registerOutcome(item));
  moments.forEach((item) => catalog.registerMoment(item));
  actorEntries.forEach((item) => catalog.registerActorEntry(item));
  flows.forEach((item) => catalog.registerFlow(item));
  actorEntries.forEach((item) => catalog.assessActor(item.actorKind, createdAt));
  flows.forEach((item) => catalog.assessFlow(item.id, createdAt));
  return { catalog, summary: { actorExperienceCount: actorEntries.length, crossActorFlowCount: flows.length, ministryValueMoments: moments.filter((item) => item.actorKind === "ministry").length, atlasPremiumMoments: actorEntries.filter((item) => item.atlasPremiumValue.length > 0).length } };
}
`;
fs.writeFileSync("src/domain/infrastructures/mvp-user-experience-seed.ts", seed);
console.log("Stabilisation industrielle appliquée.");
