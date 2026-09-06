import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { findProgrammeCapabilityCandidates, engagementsForInitiative } from "../src/domain/programme-mobilization";
import { buildOrganizationNetworkProfile } from "../src/domain/actor-network";
import { projectStateForSession } from "../src/server/access-projection";
import { canRole } from "../src/server/permissions";
import type { Initiative, ProductState } from "../src/domain/types";

const CORD = "act-coordinateur";

// P2.5-B — "Ecosystem Mobilization Foundation". Principe fondateur du
// mandat (§1), rappelé dans chaque test qui le vérifie directement :
// CAPABLE ≠ CONSIDÉRÉ ≠ CONTACTÉ ≠ ENGAGÉ.

// Construit le Programme Kayar réel (même chaîne que P2.5-A : CollectiveNeed
// déjà qualifié dans le Demo World → ProgramOpportunity → Initiative en
// cadrage), avec un budget déjà validé pour rester focalisé sur la
// mobilisation elle-même plutôt que sur le cycle de vie déjà couvert par
// P2.5-A.
function buildKayarInitiative(state: ProductState): { state: ProductState; initiative: Initiative } {
  let next = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: CORD,
    collectiveNeedId: "cn-kayar-motorisation",
    problem: "Pannes moteur récurrentes à Kayar et Fass Boye",
    justification: "Plusieurs signaux et demandes de service convergent vers le même problème de motorisation.",
    territoryIds: ["kayar", "fass-boye"],
    potentialBeneficiaries: "Capitaines et mareyeurs de Kayar et Fass Boye",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Maintenance préventive du moteur"],
    desiredOutcomes: ["Réduire les immobilisations liées à la motorisation"],
    possibleIndicators: [],
    maturity: "moyenne"
  });
  const opportunity = next.programOpportunities[0];
  next = applyCommand(next, { type: "update_program_opportunity_status", actorId: CORD, programOpportunityId: opportunity.id, status: "qualified" });
  const qualified = next.programOpportunities.find((item) => item.id === opportunity.id)!;
  next = applyCommand(next, {
    type: "create_initiative",
    actorId: CORD,
    title: "Programme de fiabilisation de la motorisation — Kayar/Fass Boye",
    objective: "Réduire les immobilisations liées à la motorisation",
    budgetFcfa: 8000000,
    budgetStatus: "valide",
    programOpportunityId: qualified.id
  });
  return { state: next, initiative: next.initiatives[0] };
}

// TEST A — la projection de candidats retient exactement les organisations
// dont la capacité correspond ET dont le territoire recoupe le programme.
test("TEST A — candidate projection matches category + territory (Kayar/maintenance)", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const candidates = findProgrammeCapabilityCandidates(state, initiative, "maintenance");
  assert.ok(candidates.some((item) => item.organization.id === "org-froid" && item.partnerService.id === "service-maintenance-kayar"));
});

// TEST B — un mauvais territoire exclut le candidat.
test("TEST B — wrong territory excluded", () => {
  const state0 = createDemoState();
  const djifferOnly: Initiative = { ...state0.initiatives[0], id: "init-test-djiffer", territoryIds: ["djiffer"] };
  const state: ProductState = { ...state0, initiatives: [djifferOnly, ...state0.initiatives] };
  const candidates = findProgrammeCapabilityCandidates(state, djifferOnly, "maintenance");
  // service-maintenance-kayar ne couvre pas Djiffer — jamais candidat ici.
  assert.ok(!candidates.some((item) => item.partnerService.id === "service-maintenance-kayar"));
  // service-metrologie-djiffer, lui, couvre bien Djiffer.
  assert.ok(candidates.some((item) => item.partnerService.id === "service-metrologie-djiffer"));
});

// TEST C — une mauvaise catégorie exclut le candidat.
test("TEST C — wrong category excluded (Kayar/assurance)", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const candidates = findProgrammeCapabilityCandidates(state, initiative, "assurance");
  assert.equal(candidates.length, 0, "aucune capacité « assurance » ne couvre Kayar dans le Demo World");
});

// TEST D — l'explication du candidat reprend des faits réels de
// PartnerService, jamais des valeurs inventées.
test("TEST D — candidate explanation includes real PartnerService facts", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const candidate = findProgrammeCapabilityCandidates(state, initiative, "maintenance").find((item) => item.organization.id === "org-froid")!;
  const realService = state.partnerServices.find((item) => item.id === "service-maintenance-kayar")!;
  assert.equal(candidate.partnerService.trust, realService.trust);
  assert.equal(candidate.partnerService.status, realService.status);
  assert.equal(candidate.partnerService.activationConditions, realService.activationConditions);
  assert.deepEqual(candidate.matchingTerritoryIds.sort(), realService.territoryIds.filter((tid) => initiative.territoryIds.includes(tid)).sort());
});

// TEST E — l'absence de représentant documenté n'empêche pas l'organisation
// d'être candidate (mandat §4).
test("TEST E — no representative still allows candidate", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const candidate = findProgrammeCapabilityCandidates(state, initiative, "financement").find((item) => item.organization.id === "org-partner");
  assert.ok(candidate, "org-partner doit rester candidate malgré l'absence de représentant documenté");
  assert.equal(candidate!.representatives.length, 0);
});

// TEST F — un représentant vérifié se résout correctement.
test("TEST F — verified representative resolves correctly", () => {
  const state = createDemoState();
  const petiteCote: Initiative = { ...state.initiatives[0], id: "init-test-joal", territoryIds: ["joal", "mbour"] };
  const withInitiative: ProductState = { ...state, initiatives: [petiteCote, ...state.initiatives] };
  const candidate = findProgrammeCapabilityCandidates(withInitiative, petiteCote, "logistique").find((item) => item.organization.id === "org-mareyeurs")!;
  assert.ok(candidate);
  assert.equal(candidate.representatives.length, 1);
  assert.equal(candidate.representatives[0].actor?.id, "act-mareyeur-sud");
  assert.equal(candidate.representatives[0].relationship.verificationStatus, "verifiee");
});

// TEST G — la projection de candidats ne mute jamais ProductState.
test("TEST G — candidate projection creates no state", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const before = state.programmeOrganizationEngagements.length;
  findProgrammeCapabilityCandidates(state, initiative, "maintenance");
  assert.equal(state.programmeOrganizationEngagements.length, before);
});

// TEST H — "Considérer" crée exactement un engagement. Micro-correctif
// Product (post-P2.5-B) : org-froid a exactement UN représentant connu
// (relation-prestataire-froid-representant) — "un représentant connu de
// l'organisation" n'implique JAMAIS "le contact retenu pour CET
// engagement" (§6.A du micro-correctif) : sans choix explicite,
// representativeActorId doit rester undefined, même à un seul candidat.
test("TEST H — consider creates exactly one engagement (aucun représentant présumé, même un seul connu)", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  assert.equal(state.actorRelationships.filter((item) => item.organizationId === "org-froid" && item.kind === "representant").length, 1, "org-froid doit avoir exactement un représentant connu pour ce test");
  const next = applyCommand(state, {
    type: "create_programme_organization_engagement",
    actorId: CORD,
    initiativeId: initiative.id,
    organizationId: "org-froid",
    role: "implementer",
    capabilityCategory: "maintenance"
  });
  const engagements = engagementsForInitiative(next, initiative.id);
  assert.equal(engagements.length, 1);
  assert.equal(engagements[0].status, "considered");
  assert.equal(engagements[0].createdByActorId, CORD);
  assert.equal(engagements[0].representativeActorId, undefined, "jamais rempli automatiquement, même à un seul représentant connu");
});

// TEST I — doublon exact (même programme+organisation+rôle+capacité)
// REJETÉ (choix documenté, mandat §24.I) — même discipline que
// create_actor_relationship (P2.2-A) : jamais réutilisé silencieusement.
test("TEST I — duplicate initiative+organization+role+capability engagement rejected", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const withEngagement = applyCommand(state, {
    type: "create_programme_organization_engagement",
    actorId: CORD,
    initiativeId: initiative.id,
    organizationId: "org-froid",
    role: "implementer",
    capabilityCategory: "maintenance"
  });
  assert.throws(
    () => applyCommand(withEngagement, { type: "create_programme_organization_engagement", actorId: CORD, initiativeId: initiative.id, organizationId: "org-froid", role: "implementer", capabilityCategory: "maintenance" }),
    /déjà considérée/
  );
  // Un rôle OU une capacité différents restent des engagements distincts
  // légitimes — pas la même « chose » reconsidérée.
  const withFunderToo = applyCommand(withEngagement, { type: "create_programme_organization_engagement", actorId: CORD, initiativeId: initiative.id, organizationId: "org-froid", role: "funder", capabilityCategory: "maintenance" });
  assert.equal(engagementsForInitiative(withFunderToo, initiative.id).length, 2);
});

function considerOrgFroid(state: ProductState, initiative: Initiative) {
  const next = applyCommand(state, {
    type: "create_programme_organization_engagement",
    actorId: CORD,
    initiativeId: initiative.id,
    organizationId: "org-froid",
    role: "implementer",
    capabilityCategory: "maintenance"
  });
  return { state: next, engagement: next.programmeOrganizationEngagements[0] };
}

// TEST J — considered → contacted légal.
test("TEST J — considered → contacted légal", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const { state: withEngagement, engagement } = considerOrgFroid(state, initiative);
  const next = applyCommand(withEngagement, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" });
  assert.equal(next.programmeOrganizationEngagements.find((item) => item.id === engagement.id)!.status, "contacted");
});

// TEST K — contacted → engaged légal.
test("TEST K — contacted → engaged légal", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const { state: startState, engagement } = considerOrgFroid(state, initiative);
  let current = applyCommand(startState, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" });
  current = applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "engaged" });
  assert.equal(current.programmeOrganizationEngagements.find((item) => item.id === engagement.id)!.status, "engaged");
});

// TEST L — contacted → declined légal.
test("TEST L — contacted → declined légal", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const { state: startState, engagement } = considerOrgFroid(state, initiative);
  let current = applyCommand(startState, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" });
  current = applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "declined" });
  assert.equal(current.programmeOrganizationEngagements.find((item) => item.id === engagement.id)!.status, "declined");
});

// TEST M — considered → engaged REJETÉ (saut illégal).
test("TEST M — considered → engaged rejeté", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const { state: withEngagement, engagement } = considerOrgFroid(state, initiative);
  assert.throws(
    () => applyCommand(withEngagement, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "engaged" }),
    /Transition illégale/
  );
});

// TEST N — declined reste terminal.
test("TEST N — declined terminal", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const { state: startState, engagement } = considerOrgFroid(state, initiative);
  let current = applyCommand(startState, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" });
  current = applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "declined" });
  assert.throws(
    () => applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" }),
    /Transition illégale/
  );
});

// TEST O — un engagement « engaged » ne crée jamais de Funding (mandat §11
// : "no amount is created automatically").
test("TEST O — engaged does not create Funding", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const { state: startState, engagement } = considerOrgFroid(state, initiative);
  const fundingBefore = startState.initiatives.find((item) => item.id === initiative.id)!.funding.length;
  let current = applyCommand(startState, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" });
  current = applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "engaged" });
  assert.equal(current.initiatives.find((item) => item.id === initiative.id)!.funding.length, fundingBefore);
});

// TEST P — un engagement « engaged » ne crée jamais de Commitment/
// CoordinationSpace.
test("TEST P — engaged does not create Commitment", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  const { state: startState, engagement } = considerOrgFroid(state, initiative);
  const spacesBefore = startState.coordinationSpaces.length;
  let current = applyCommand(startState, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" });
  current = applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "engaged" });
  assert.equal(current.coordinationSpaces.length, spacesBefore);
});

// TEST Q — scénario vertical Kayar complet, de bout en bout, à travers de
// vraies commandes.
test("TEST Q — Kayar vertical slice complete", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  assert.equal(initiative.status, "cadrage");

  const candidates = findProgrammeCapabilityCandidates(state, initiative, "maintenance");
  const candidate = candidates.find((item) => item.organization.id === "org-froid")!;
  assert.ok(candidate);
  assert.equal(candidate.representatives.length, 1, "org-froid doit avoir exactement un représentant documenté (relation-prestataire-froid-representant)");

  let current = applyCommand(state, {
    type: "create_programme_organization_engagement",
    actorId: CORD,
    initiativeId: initiative.id,
    organizationId: candidate.organization.id,
    role: "implementer",
    capabilityCategory: "maintenance",
    representativeActorId: candidate.representatives[0].relationship.actorId
  });
  const engagement = current.programmeOrganizationEngagements[0];
  assert.equal(engagement.status, "considered");
  assert.equal(engagement.representativeActorId, "act-prestataire");

  current = applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "contacted" });
  current = applyCommand(current, { type: "update_programme_organization_engagement_status", actorId: CORD, engagementId: engagement.id, status: "engaged" });
  const final = current.programmeOrganizationEngagements.find((item) => item.id === engagement.id)!;
  assert.equal(final.status, "engaged");

  // Le programme lui-même reste en cadrage — la mobilisation de
  // l'écosystème n'entraîne aucune transition de cycle de vie automatique.
  assert.equal(current.initiatives.find((item) => item.id === initiative.id)!.status, "cadrage");
});

// TEST R — le froid/chaîne du froid à Joal fonctionne depuis les données
// déjà existantes du domaine, sans duplication spécifique à Kayar (preuve
// que la projection est réutilisable, mandat §19).
test("TEST R — Joal cold-chain candidate works from existing domain data", () => {
  const state = createDemoState();
  const joalInitiative: Initiative = { ...state.initiatives[0], id: "init-test-joal-froid", territoryIds: ["joal"] };
  const withInitiative: ProductState = { ...state, initiatives: [joalInitiative, ...state.initiatives] };
  const candidates = findProgrammeCapabilityCandidates(withInitiative, joalInitiative, "froid");
  const candidate = candidates.find((item) => item.organization.id === "org-froid" && item.partnerService.id === "service-froid");
  assert.ok(candidate, "service-froid (org-froid) doit résoudre comme candidat pour Joal, catégorie froid");
  assert.equal(candidate!.partnerService.trust, "verifiee");
});

// TEST S — représentant/privacy P2.2-A non régressés par ce lot.
test("TEST S — P2.2-A representative/privacy non régressés", () => {
  const state = createDemoState();
  const mareyeur = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });
  const otherOrgActor = mareyeur.actors.find((item) => item.id === "act-operateur");
  assert.equal(otherOrgActor?.phone, "", "le masquage de téléphone P2.2-A doit rester intact");

  const profile = buildOrganizationNetworkProfile(state, "org-froid")!;
  assert.ok(profile.relationships.some(({ relationship, actor }) => relationship.kind === "representant" && actor?.id === "act-prestataire"));
});

// TEST T — cycle de vie Initiative (P2.5-A) non régressé par ce lot.
test("TEST T — P2.5-A lifecycle non régressé", () => {
  const state0 = createDemoState();
  const fixture = state0.initiatives.find((item) => item.id === "init-petite-cote-xxl")!;
  assert.equal(fixture.status, "financee");
  const next = applyCommand(state0, { type: "update_initiative_status", actorId: CORD, initiativeId: fixture.id, status: "execution" });
  assert.equal(next.initiatives.find((item) => item.id === fixture.id)!.status, "execution");
  assert.equal(canRole("coordinateur", "update_initiative_status"), true);
});

// --- Compléments (validation référentielle du représentant, permissions) --

test("representativeActorId doit résoudre vers un Actor réel ET porter une relation « representant » pour cette organisation", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  assert.throws(
    () => applyCommand(state, { type: "create_programme_organization_engagement", actorId: CORD, initiativeId: initiative.id, organizationId: "org-froid", role: "implementer", capabilityCategory: "maintenance", representativeActorId: "act-inconnu" }),
    /Représentant introuvable/
  );
  // act-mareyeur-sud est représentante de org-mareyeurs, pas de org-froid —
  // jamais accepté pour une autre organisation (même garde-fou que P2.2-A).
  assert.throws(
    () => applyCommand(state, { type: "create_programme_organization_engagement", actorId: CORD, initiativeId: initiative.id, organizationId: "org-froid", role: "implementer", capabilityCategory: "maintenance", representativeActorId: "act-mareyeur-sud" }),
    /n'est pas enregistré comme représentant/
  );
});

// §6.C (micro-correctif) — un membre ou un relais de la BONNE organisation
// reste refusé : seule une relation "representant" habilite, jamais
// "membre"/"relais" même pour la même organisation exacte.
test("un membre ou un relais (même bonne organisation) ne peut jamais être choisi comme représentant", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  // act-transform est "membre" de org-mareyeurs (relation-transform-gie-membre),
  // jamais "representant" — même organisation, mauvaise nature de relation.
  assert.throws(
    () => applyCommand(state, { type: "create_programme_organization_engagement", actorId: CORD, initiativeId: initiative.id, organizationId: "org-mareyeurs", role: "implementer", capabilityCategory: "logistique", representativeActorId: "act-transform" }),
    /n'est pas enregistré comme représentant/
  );
  // act-operateur est "relais" de org-site (relation-operateur-site-relais),
  // jamais "representant" non plus.
  assert.throws(
    () => applyCommand(state, { type: "create_programme_organization_engagement", actorId: CORD, initiativeId: initiative.id, organizationId: "org-site", role: "implementer", capabilityCategory: "logistique", representativeActorId: "act-operateur" }),
    /n'est pas enregistré comme représentant/
  );
});

// §6.D (micro-correctif) — un candidat SANS aucun représentant documenté
// reste considérable : representativeActorId absent ne bloque jamais
// create_programme_organization_engagement.
test("un candidat sans représentant documenté reste engageable sans representativeActorId", () => {
  const { state, initiative } = buildKayarInitiative(createDemoState());
  assert.equal(state.actorRelationships.filter((item) => item.organizationId === "org-partner" && item.kind === "representant").length, 0, "org-partner ne doit avoir aucun représentant documenté pour ce test");
  const next = applyCommand(state, { type: "create_programme_organization_engagement", actorId: CORD, initiativeId: initiative.id, organizationId: "org-partner", role: "funder", capabilityCategory: "financement" });
  const engagement = engagementsForInitiative(next, initiative.id)[0];
  assert.equal(engagement.status, "considered");
  assert.equal(engagement.representativeActorId, undefined);
});

test("create_programme_organization_engagement / update_programme_organization_engagement_status suivent exactement les rôles de create_actor_relationship", () => {
  const roleExpectations: Record<string, boolean> = {
    administrateur: true,
    operateur: false,
    capitaine: false,
    mareyeur: false,
    transformateur: false,
    prestataire: false,
    gestionnaire_organisation: true,
    coordinateur: true,
    institution: true,
    partenaire: false
  };
  for (const [role, expected] of Object.entries(roleExpectations)) {
    assert.equal(canRole(role as never, "create_programme_organization_engagement"), canRole(role as never, "create_actor_relationship"), `${role} : create_programme_organization_engagement doit suivre exactement create_actor_relationship`);
    assert.equal(canRole(role as never, "create_programme_organization_engagement"), expected, `${role} : permission inattendue`);
  }
});

test("Initiative/PartnerService/ActorRelationship/programmeOrganizationEngagements restent non filtrés par rôle (catégorie C)", () => {
  const state = createDemoState();
  const mareyeur = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });
  assert.equal(mareyeur.initiatives.length, state.initiatives.length);
  assert.equal(mareyeur.partnerServices.length, state.partnerServices.length);
  assert.equal(mareyeur.actorRelationships.length, state.actorRelationships.length);
  assert.equal(mareyeur.programmeOrganizationEngagements.length, state.programmeOrganizationEngagements.length);
});

// Non-régression Demo World — nouvelle capacité + relation ajoutées pour
// P2.5-B présentes et cohérentes (audit §17/§29).
test("Demo World — service-maintenance-kayar et le représentant de org-froid sont présents", () => {
  const state = createDemoState();
  const service = state.partnerServices.find((item) => item.id === "service-maintenance-kayar");
  assert.ok(service);
  assert.equal(service!.organizationId, "org-froid");
  assert.ok(service!.territoryIds.includes("kayar"));
  const representative = state.actorRelationships.find((item) => item.id === "relation-prestataire-froid-representant");
  assert.ok(representative);
  assert.equal(representative!.organizationId, "org-froid");
  assert.equal(representative!.kind, "representant");
});
