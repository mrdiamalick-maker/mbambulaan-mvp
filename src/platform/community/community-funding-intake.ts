import type { CommunityContribution } from "./community-value-loop-runtime";

export type CommunityFundingEvent =
  | {
      type: "sale_settled";
      id: string;
      initiativeId: string;
      territoryId: string;
      sellerOrganizationId: string;
      settledAmountXof: number;
      communityShareBps: number;
      paymentReference: string;
      occurredAt: string;
    }
  | {
      type: "value_recovery_completed";
      id: string;
      initiativeId: string;
      territoryId: string;
      responsibleOrganizationId: string;
      communityContributionXof: number;
      completionReference: string;
      occurredAt: string;
    }
  | {
      type: "development_funds_disbursed";
      id: string;
      initiativeId: string;
      territoryId: string;
      programOrganizationId: string;
      disbursedAmountXof: number;
      transferReference: string;
      occurredAt: string;
    };

export function convertFundingEventToCommunityContribution(event: CommunityFundingEvent): CommunityContribution {
  switch (event.type) {
    case "sale_settled": {
      if (event.settledAmountXof <= 0) throw new Error("Le montant réglé doit être positif.");
      if (event.communityShareBps <= 0 || event.communityShareBps > 2_000) {
        throw new Error("La part communautaire doit être comprise entre 1 et 2 000 points de base.");
      }
      if (!event.paymentReference.trim()) throw new Error("La référence du règlement est obligatoire.");
      return {
        id: `community-contribution:${event.id}`,
        initiativeId: event.initiativeId,
        contributorActorId: event.sellerOrganizationId,
        contributorOrganizationId: event.sellerOrganizationId,
        sourceType: "transaction_share",
        amountXof: Math.round((event.settledAmountXof * event.communityShareBps) / 10_000),
        evidenceIds: [event.paymentReference],
        contributedAt: event.occurredAt,
      };
    }
    case "value_recovery_completed":
      if (event.communityContributionXof <= 0) throw new Error("La contribution issue de la valorisation doit être positive.");
      if (!event.completionReference.trim()) throw new Error("La référence de clôture du plan est obligatoire.");
      return {
        id: `community-contribution:${event.id}`,
        initiativeId: event.initiativeId,
        contributorActorId: event.responsibleOrganizationId,
        contributorOrganizationId: event.responsibleOrganizationId,
        sourceType: "cooperative",
        amountXof: event.communityContributionXof,
        evidenceIds: [event.completionReference],
        contributedAt: event.occurredAt,
      };
    case "development_funds_disbursed":
      if (event.disbursedAmountXof <= 0) throw new Error("Le montant décaissé doit être positif.");
      if (!event.transferReference.trim()) throw new Error("La référence du virement est obligatoire.");
      return {
        id: `community-contribution:${event.id}`,
        initiativeId: event.initiativeId,
        contributorActorId: event.programOrganizationId,
        contributorOrganizationId: event.programOrganizationId,
        sourceType: "public_program",
        amountXof: event.disbursedAmountXof,
        evidenceIds: [event.transferReference],
        contributedAt: event.occurredAt,
      };
  }
}
