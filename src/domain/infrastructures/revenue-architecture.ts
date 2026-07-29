import type { EntityId, ISODateTime } from "./types";
import type { EcosystemActorKind, EcosystemCapabilityCode } from "./ecosystem";

export type RevenueModel =
  | "subscription"
  | "transaction_fee"
  | "commission"
  | "usage_fee"
  | "implementation_fee"
  | "integration_fee"
  | "data_service_fee"
  | "program_management_fee"
  | "impact_reporting_fee"
  | "success_fee"
  | "sponsorship"
  | "license";

export type BillingUnit =
  | "organization"
  | "active_user"
  | "site"
  | "vessel"
  | "transaction"
  | "kilogram"
  | "payment"
  | "beneficiary"
  | "program"
  | "integration"
  | "api_call"
  | "report"
  | "month"
  | "year";

export interface ActorValueProposition {
  id: EntityId;
  actorKind: EcosystemActorKind;
  problemCodes: string[];
  capabilityCodes: EcosystemCapabilityCode[];
  deliveredOutcomes: string[];
  payerKinds: EcosystemActorKind[];
  economicBuyerRole: string;
  paymentTriggers: string[];
  renewalDrivers: string[];
}

export interface CommercialOffer {
  id: EntityId;
  code: string;
  name: string;
  targetActorKinds: EcosystemActorKind[];
  includedCapabilities: EcosystemCapabilityCode[];
  revenueModels: RevenueModel[];
  billingUnit: BillingUnit;
  basePriceXof?: number;
  variableRatePercent?: number;
  minimumMonthlyXof?: number;
  setupFeeXof?: number;
  contractDurationMonths?: number;
  status: "draft" | "active" | "retired";
}

export interface CustomerContract {
  id: EntityId;
  customerOrganizationId: EntityId;
  payerOrganizationId: EntityId;
  offerId: EntityId;
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  status: "proposed" | "active" | "suspended" | "ended";
  negotiatedBasePriceXof?: number;
  negotiatedRatePercent?: number;
  commercialNotes?: string;
}

export interface BillableEvent {
  id: EntityId;
  contractId: EntityId;
  occurredAt: ISODateTime;
  eventType:
    | "subscription_period"
    | "transaction_completed"
    | "payment_reconciled"
    | "beneficiary_served"
    | "program_managed"
    | "integration_used"
    | "report_delivered"
    | "implementation_milestone";
  quantity: number;
  grossValueXof?: number;
  sourceEntityIds: EntityId[];
  status: "pending" | "rated" | "invoiced" | "cancelled";
}

export interface RevenueCharge {
  id: EntityId;
  contractId: EntityId;
  billableEventId: EntityId;
  revenueModel: RevenueModel;
  amountXof: number;
  calculatedAt: ISODateTime;
  status: "calculated" | "approved" | "invoiced" | "paid" | "cancelled";
}

export interface UnitEconomicsSnapshot {
  contractId: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  revenueXof: number;
  directCostXof: number;
  contributionMarginXof: number;
  contributionMarginPercent: number;
  activeOrganizations: number;
  activeUsers?: number;
  transactions?: number;
  beneficiariesServed?: number;
}

export interface RevenueArchitectureData {
  valuePropositions: ActorValueProposition[];
  offers: CommercialOffer[];
  contracts: CustomerContract[];
  billableEvents: BillableEvent[];
  charges: RevenueCharge[];
  unitEconomicsSnapshots: UnitEconomicsSnapshot[];
}

export interface OfferRecommendation {
  actorKind: EcosystemActorKind;
  recommendedRevenueModels: RevenueModel[];
  recommendedBillingUnits: BillingUnit[];
  rationale: string[];
}

export function recommendRevenueArchitecture(
  actorKind: EcosystemActorKind,
): OfferRecommendation {
  const matrix: Partial<Record<EcosystemActorKind, OfferRecommendation>> = {
    ministry: {
      actorKind,
      recommendedRevenueModels: ["license", "implementation_fee", "integration_fee", "data_service_fee"],
      recommendedBillingUnits: ["year", "site", "integration", "report"],
      rationale: [
        "La valeur repose sur le pilotage sectoriel, l'interopérabilité et la disponibilité de données fiables.",
        "Le contrat doit couvrir le socle national et les coûts de déploiement territorial.",
      ],
    },
    public_agency: {
      actorKind,
      recommendedRevenueModels: ["subscription", "implementation_fee", "data_service_fee"],
      recommendedBillingUnits: ["organization", "site", "report"],
      rationale: ["La facturation doit suivre le périmètre opérationnel réellement couvert."],
    },
    municipality: {
      actorKind,
      recommendedRevenueModels: ["subscription", "implementation_fee"],
      recommendedBillingUnits: ["site", "month"],
      rationale: ["Le prix doit rester corrélé au nombre de sites et aux services de coordination activés."],
    },
    ngo: {
      actorKind,
      recommendedRevenueModels: ["program_management_fee", "impact_reporting_fee", "implementation_fee"],
      recommendedBillingUnits: ["program", "beneficiary", "report"],
      rationale: [
        "La valeur réside dans l'exécution, la traçabilité des bénéficiaires et la preuve d'impact.",
      ],
    },
    donor: {
      actorKind,
      recommendedRevenueModels: ["program_management_fee", "impact_reporting_fee", "data_service_fee"],
      recommendedBillingUnits: ["program", "report", "beneficiary"],
      rationale: ["Le financement doit couvrir la visibilité, le contrôle et la mesure des résultats."],
    },
    development_partner: {
      actorKind,
      recommendedRevenueModels: ["program_management_fee", "impact_reporting_fee", "integration_fee"],
      recommendedBillingUnits: ["program", "integration", "report"],
      rationale: ["Le contrat peut combiner coordination de programme et interopérabilité."],
    },
    private_company: {
      actorKind,
      recommendedRevenueModels: ["subscription", "transaction_fee", "commission", "integration_fee"],
      recommendedBillingUnits: ["organization", "transaction", "kilogram", "integration"],
      rationale: ["La monétisation doit suivre le gain opérationnel et les volumes économiques sécurisés."],
    },
    buyer: {
      actorKind,
      recommendedRevenueModels: ["subscription", "transaction_fee", "commission"],
      recommendedBillingUnits: ["organization", "transaction", "kilogram"],
      rationale: ["Le paiement est justifié par l'accès à une offre fiable, traçable et coordonnée."],
    },
    processor: {
      actorKind,
      recommendedRevenueModels: ["subscription", "transaction_fee", "integration_fee"],
      recommendedBillingUnits: ["organization", "transaction", "integration"],
      rationale: ["La valeur vient de la sécurisation des approvisionnements et de la traçabilité."],
    },
    financial_institution: {
      actorKind,
      recommendedRevenueModels: ["subscription", "usage_fee", "data_service_fee", "success_fee"],
      recommendedBillingUnits: ["organization", "active_user", "api_call", "payment"],
      rationale: ["Le modèle doit valoriser l'accès au scoring, aux flux et aux opportunités financées."],
    },
    insurer: {
      actorKind,
      recommendedRevenueModels: ["subscription", "usage_fee", "success_fee"],
      recommendedBillingUnits: ["organization", "vessel", "payment"],
      rationale: ["La facturation suit le portefeuille assuré et la réduction du risque informationnel."],
    },
    telecom_operator: {
      actorKind,
      recommendedRevenueModels: ["integration_fee", "usage_fee", "sponsorship"],
      recommendedBillingUnits: ["integration", "active_user", "month"],
      rationale: ["Le partenariat peut combiner intégration, usage et acquisition de clients."],
    },
    technology_provider: {
      actorKind,
      recommendedRevenueModels: ["integration_fee", "license", "usage_fee"],
      recommendedBillingUnits: ["integration", "api_call", "year"],
      rationale: ["Le modèle doit préserver une marge sur l'interopérabilité et l'usage de la plateforme."],
    },
    association: {
      actorKind,
      recommendedRevenueModels: ["subscription", "program_management_fee", "sponsorship"],
      recommendedBillingUnits: ["organization", "program", "beneficiary"],
      rationale: [
        "L'association peut être utilisatrice sans être toujours payeuse ; le financement peut venir d'un programme, d'un bailleur ou d'un sponsor.",
      ],
    },
    cooperative: {
      actorKind,
      recommendedRevenueModels: ["subscription", "transaction_fee", "commission"],
      recommendedBillingUnits: ["organization", "transaction", "kilogram"],
      rationale: ["Le coût doit être aligné sur les gains collectifs, les ventes et les services sécurisés."],
    },
  };

  return (
    matrix[actorKind] ?? {
      actorKind,
      recommendedRevenueModels: ["subscription", "usage_fee", "implementation_fee"],
      recommendedBillingUnits: ["organization", "month", "transaction"],
      rationale: ["Le modèle doit combiner un revenu récurrent et une part variable liée à la valeur créée."],
    }
  );
}

export function calculateCharge(
  offer: CommercialOffer,
  contract: CustomerContract,
  event: BillableEvent,
  calculatedAt: ISODateTime,
): RevenueCharge {
  const basePrice = contract.negotiatedBasePriceXof ?? offer.basePriceXof ?? 0;
  const ratePercent = contract.negotiatedRatePercent ?? offer.variableRatePercent ?? 0;
  const variableAmount = event.grossValueXof
    ? (event.grossValueXof * ratePercent) / 100
    : event.quantity * basePrice;
  const minimum = offer.minimumMonthlyXof ?? 0;
  const amountXof = Math.max(variableAmount, minimum);

  return {
    id: `charge-${event.id}`,
    contractId: contract.id,
    billableEventId: event.id,
    revenueModel: offer.revenueModels[0] ?? "usage_fee",
    amountXof,
    calculatedAt,
    status: "calculated",
  };
}

export function calculateUnitEconomics(
  input: Omit<UnitEconomicsSnapshot, "contributionMarginXof" | "contributionMarginPercent">,
): UnitEconomicsSnapshot {
  const contributionMarginXof = input.revenueXof - input.directCostXof;
  const contributionMarginPercent = input.revenueXof === 0
    ? 0
    : (contributionMarginXof / input.revenueXof) * 100;

  return {
    ...input,
    contributionMarginXof,
    contributionMarginPercent,
  };
}
