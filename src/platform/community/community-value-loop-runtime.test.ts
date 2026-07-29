import test from "node:test";
import assert from "node:assert/strict";
import { CommunityValueLoopRuntime } from "./community-value-loop-runtime";

const at = "2026-07-28T12:00:00.000Z";

function execute(runtime: CommunityValueLoopRuntime, commandId: string, command: Parameters<CommunityValueLoopRuntime["execute"]>[0]["command"]) {
  return runtime.execute({ commandId, actorId: "community-actor-01", activeTerritoryId: "territory-dakar", command });
}

test("une affectation ne peut pas dépasser les fonds disponibles", () => {
  const runtime = new CommunityValueLoopRuntime();
  execute(runtime, "need", { type: "report_need", need: { id: "need-01", territoryId: "territory-dakar", title: "Équipement collectif", description: "Besoin de froid", objective: "shared_equipment", affectedActorIds: ["actor-01"], evidenceIds: ["proof-need"], priorityScore: 90, status: "reported", reportedByActorId: "actor-01", reportedAt: at } });
  execute(runtime, "qualify", { type: "qualify_need", needId: "need-01" });
  execute(runtime, "initiative", { type: "create_initiative", initiative: { id: "initiative-01", needId: "need-01", territoryId: "territory-dakar", title: "Chambre froide communautaire", objective: "shared_equipment", governanceOrganizationId: "org-community", beneficiaryOrganizationIds: ["org-women"], targetBeneficiaryCount: 25, targetAmountXof: 10_000_000, platformFeeBps: 200, status: "draft", createdAt: at } });
  execute(runtime, "open-vote", { type: "open_vote", initiativeId: "initiative-01" });
  execute(runtime, "vote", { type: "cast_vote", vote: { id: "vote-01", initiativeId: "initiative-01", voterActorId: "actor-01", voterOrganizationId: "org-01", choice: "approve", evidenceIds: ["proof-vote"], votedAt: at } });
  execute(runtime, "close-vote", { type: "close_vote", initiativeId: "initiative-01", at });
  execute(runtime, "contribution", { type: "record_contribution", contribution: { id: "contribution-01", initiativeId: "initiative-01", contributorActorId: "partner-01", contributorOrganizationId: "org-partner", sourceType: "partner", amountXof: 10_000_000, evidenceIds: ["proof-fund"], contributedAt: at } });
  assert.throws(() => execute(runtime, "allocation", { type: "approve_allocation", allocation: { id: "allocation-01", initiativeId: "initiative-01", beneficiaryOrganizationId: "org-women", purpose: "Achat équipement", amountXof: 11_000_000, approvedByActorId: "actor-01", evidenceIds: ["proof-allocation"], status: "approved", approvedAt: at } }), /fonds disponibles/i);
});

test("la boucle communautaire mesure bénéficiaires, valeur et revenu plateforme", () => {
  const runtime = new CommunityValueLoopRuntime();
  execute(runtime, "need", { type: "report_need", need: { id: "need-01", territoryId: "territory-dakar", title: "Transformation locale", description: "Sécuriser les revenus des transformatrices", objective: "women_income", affectedActorIds: ["actor-women-01"], evidenceIds: ["proof-need"], priorityScore: 92, status: "reported", reportedByActorId: "actor-women-01", reportedAt: at } });
  execute(runtime, "qualify", { type: "qualify_need", needId: "need-01" });
  execute(runtime, "initiative", { type: "create_initiative", initiative: { id: "initiative-01", needId: "need-01", territoryId: "territory-dakar", title: "Atelier collectif de transformation", objective: "women_income", governanceOrganizationId: "org-community", beneficiaryOrganizationIds: ["org-women"], targetBeneficiaryCount: 30, targetAmountXof: 12_000_000, platformFeeBps: 250, status: "draft", createdAt: at } });
  execute(runtime, "open-vote", { type: "open_vote", initiativeId: "initiative-01" });
  execute(runtime, "vote", { type: "cast_vote", vote: { id: "vote-01", initiativeId: "initiative-01", voterActorId: "actor-01", voterOrganizationId: "org-01", choice: "approve", evidenceIds: ["proof-vote"], votedAt: at } });
  execute(runtime, "close-vote", { type: "close_vote", initiativeId: "initiative-01", at });
  execute(runtime, "contribution", { type: "record_contribution", contribution: { id: "contribution-01", initiativeId: "initiative-01", contributorActorId: "program-01", contributorOrganizationId: "org-program", sourceType: "public_program", amountXof: 12_000_000, evidenceIds: ["proof-fund"], contributedAt: at } });
  execute(runtime, "allocation", { type: "approve_allocation", allocation: { id: "allocation-01", initiativeId: "initiative-01", beneficiaryOrganizationId: "org-women", purpose: "Équipements et formation", amountXof: 10_000_000, approvedByActorId: "actor-01", evidenceIds: ["proof-allocation"], status: "approved", approvedAt: at } });
  execute(runtime, "delivery", { type: "record_delivery", proof: { id: "delivery-01", allocationId: "allocation-01", deliveredByActorId: "supplier-01", beneficiaryActorIds: ["actor-women-01", "actor-women-02"], description: "Équipements installés", monetaryValueXof: 10_000_000, evidenceIds: ["proof-delivery"], deliveredAt: at, acceptedAt: at } });
  const result = execute(runtime, "outcome", { type: "record_outcome", outcome: { id: "outcome-01", initiativeId: "initiative-01", beneficiaryCount: 30, womenBeneficiaryCount: 30, youthBeneficiaryCount: 8, jobsCreated: 6, incomeCreatedXof: 18_000_000, collectiveAssetValueXof: 10_000_000, valueProtectedXof: 7_500_000, platformRevenueXof: 300_000, evidenceIds: ["proof-impact"], confidenceScore: 82, measuredAt: at } }) as { snapshot: { metrics: { beneficiaryCount: number; incomeCreatedXof: number; platformRevenueXof: number } } };
  assert.equal(result.snapshot.metrics.beneficiaryCount, 30);
  assert.equal(result.snapshot.metrics.incomeCreatedXof, 18_000_000);
  assert.equal(result.snapshot.metrics.platformRevenueXof, 300_000);
});
