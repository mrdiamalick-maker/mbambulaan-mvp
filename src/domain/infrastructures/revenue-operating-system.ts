import type { EntityId, ISODateTime } from "./types";
import type { EcosystemActorKind } from "./ecosystem";
import type {
  BillableEvent,
  CommercialOffer,
  CustomerContract,
  RevenueArchitectureData,
  RevenueCharge,
  RevenueModel,
  UnitEconomicsSnapshot,
} from "./revenue-architecture";
import {
  calculateCharge,
  calculateUnitEconomics,
  recommendRevenueArchitecture,
} from "./revenue-architecture";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertUniqueId<T extends { id: string }>(items: T[], id: string, label: string) {
  if (items.some((item) => item.id === id)) {
    throw new Error(`${label} ${id} existe déjà.`);
  }
}

export interface CapabilityEconomics {
  id: EntityId;
  capabilityCode: string;
  targetActorKinds: EcosystemActorKind[];
  deliveredValue: string[];
  reusableAcrossProducts: boolean;
  estimatedMonthlyDirectCostXof: number;
  estimatedMonthlySupportCostXof: number;
  minimumTargetMarginPercent: number;
  preferredRevenueModels: RevenueModel[];
  status: "hypothesis" | "validated" | "rejected";
}

export interface PricingDecision {
  offerId: EntityId;
  floorPriceXof: number;
  recommendedPriceXof: number;
  targetMarginPercent: number;
  viable: boolean;
  reasons: string[];
}

export interface ActorArchitectureRecommendation {
  actorKind: EcosystemActorKind;
  productArchitecture: string[];
  commercialArchitecture: string[];
  requiredCapabilities: string[];
  payerStrategy: string[];
  recommendedRevenueModels: RevenueModel[];
}

export interface RevenueOperatingSystemData extends RevenueArchitectureData {
  capabilityEconomics: CapabilityEconomics[];
}

export class RevenueOperatingSystem {
  private state: RevenueOperatingSystemData;

  constructor(initialState?: Partial<RevenueOperatingSystemData>) {
    this.state = {
      valuePropositions: initialState?.valuePropositions ?? [],
      offers: initialState?.offers ?? [],
      contracts: initialState?.contracts ?? [],
      billableEvents: initialState?.billableEvents ?? [],
      charges: initialState?.charges ?? [],
      unitEconomicsSnapshots: initialState?.unitEconomicsSnapshots ?? [],
      capabilityEconomics: initialState?.capabilityEconomics ?? [],
    };
  }

  snapshot(): RevenueOperatingSystemData {
    return clone(this.state);
  }

  registerCapabilityEconomics(capability: CapabilityEconomics) {
    assertUniqueId(this.state.capabilityEconomics, capability.id, "La capability économique");
    this.state.capabilityEconomics.push(clone(capability));
    return clone(capability);
  }

  registerOffer(offer: CommercialOffer) {
    assertUniqueId(this.state.offers, offer.id, "L'offre");
    if (offer.revenueModels.length === 0) {
      throw new Error("Une offre doit comporter au moins un modèle de revenu.");
    }
    this.state.offers.push(clone(offer));
    return clone(offer);
  }

  activateContract(contract: CustomerContract) {
    assertUniqueId(this.state.contracts, contract.id, "Le contrat");
    const offer = this.state.offers.find((item) => item.id === contract.offerId);
    if (!offer || offer.status !== "active") {
      throw new Error("Le contrat doit être rattaché à une offre active.");
    }
    if (contract.status !== "active") {
      throw new Error("Seuls les contrats actifs peuvent être enregistrés dans l'exploitation.");
    }
    this.state.contracts.push(clone(contract));
    return clone(contract);
  }

  recordBillableEvent(event: BillableEvent, calculatedAt: ISODateTime) {
    assertUniqueId(this.state.billableEvents, event.id, "L'événement facturable");
    const contract = this.state.contracts.find((item) => item.id === event.contractId);
    if (!contract || contract.status !== "active") {
      throw new Error("L'événement facturable doit être lié à un contrat actif.");
    }

    const offer = this.state.offers.find((item) => item.id === contract.offerId);
    if (!offer) throw new Error(`L'offre ${contract.offerId} est introuvable.`);

    this.state.billableEvents.push(clone(event));
    const charge = calculateCharge(offer, contract, event, calculatedAt);
    this.state.charges.push(charge);

    return { event: clone(event), charge: clone(charge) };
  }

  approveCharge(chargeId: string): RevenueCharge {
    const charge = this.state.charges.find((item) => item.id === chargeId);
    if (!charge) throw new Error(`La charge ${chargeId} est introuvable.`);
    if (charge.status !== "calculated") {
      throw new Error("Seule une charge calculée peut être approuvée.");
    }
    charge.status = "approved";
    return clone(charge);
  }

  recordUnitEconomics(
    snapshot: Omit<UnitEconomicsSnapshot, "contributionMarginXof" | "contributionMarginPercent">,
  ) {
    const calculated = calculateUnitEconomics(snapshot);
    this.state.unitEconomicsSnapshots.push(calculated);
    return clone(calculated);
  }

  evaluateOfferPricing(offerId: string): PricingDecision {
    const offer = this.state.offers.find((item) => item.id === offerId);
    if (!offer) throw new Error(`L'offre ${offerId} est introuvable.`);

    const capabilities = this.state.capabilityEconomics.filter((capability) =>
      offer.includedCapabilities.includes(capability.capabilityCode as never),
    );

    const monthlyCostXof = capabilities.reduce(
      (sum, item) =>
        sum + item.estimatedMonthlyDirectCostXof + item.estimatedMonthlySupportCostXof,
      0,
    );

    const targetMarginPercent = capabilities.length === 0
      ? 40
      : Math.max(...capabilities.map((item) => item.minimumTargetMarginPercent));

    const denominator = 1 - targetMarginPercent / 100;
    const floorPriceXof = denominator <= 0 ? monthlyCostXof : monthlyCostXof / denominator;
    const recommendedPriceXof = Math.ceil(floorPriceXof / 1_000) * 1_000;
    const configuredPrice = Math.max(
      offer.basePriceXof ?? 0,
      offer.minimumMonthlyXof ?? 0,
    );

    const reasons: string[] = [];
    if (capabilities.length === 0) reasons.push("Aucune donnée de coût capability n'est disponible.");
    if (configuredPrice < recommendedPriceXof) {
      reasons.push("Le prix configuré ne couvre pas la marge cible.");
    }
    if ((offer.setupFeeXof ?? 0) === 0) {
      reasons.push("Aucun frais d'implémentation n'est prévu alors que le déploiement peut générer un coût initial.");
    }

    return {
      offerId,
      floorPriceXof: Math.ceil(floorPriceXof),
      recommendedPriceXof,
      targetMarginPercent,
      viable: configuredPrice >= recommendedPriceXof,
      reasons,
    };
  }

  recommendActorArchitecture(actorKind: EcosystemActorKind): ActorArchitectureRecommendation {
    const revenue = recommendRevenueArchitecture(actorKind);
    const common = {
      actorKind,
      recommendedRevenueModels: revenue.recommendedRevenueModels,
    };

    switch (actorKind) {
      case "ministry":
      case "public_agency":
      case "municipality":
        return {
          ...common,
          productArchitecture: [
            "pilotage territorial et national",
            "gestion des programmes",
            "suivi des sites et infrastructures",
            "interopérabilité avec les systèmes publics",
          ],
          commercialArchitecture: [
            "licence annuelle",
            "frais de déploiement",
            "facturation des intégrations",
            "services de données et rapports",
          ],
          requiredCapabilities: [
            "identity_and_trust",
            "sector_steering",
            "program_management",
            "interoperability",
          ],
          payerStrategy: ["l'institution utilisatrice paie le socle et le périmètre déployé"],
        };

      case "ngo":
      case "donor":
      case "development_partner":
      case "association":
        return {
          ...common,
          productArchitecture: [
            "gestion des programmes et bénéficiaires",
            "suivi des engagements",
            "preuve de livraison",
            "mesure d'impact",
          ],
          commercialArchitecture: [
            "frais de gestion de programme",
            "prix par bénéficiaire servi",
            "rapports d'impact",
            "frais de mise en œuvre",
          ],
          requiredCapabilities: [
            "program_management",
            "beneficiary_registry",
            "commitment_tracking",
            "impact_measurement",
          ],
          payerStrategy: [
            "l'organisation paie directement ou le coût est intégré au budget du programme",
            "une association peut être utilisatrice tandis qu'un bailleur ou sponsor est payeur",
          ],
        };

      case "private_company":
      case "buyer":
      case "processor":
      case "transporter":
      case "cold_chain_operator":
        return {
          ...common,
          productArchitecture: [
            "sécurisation de l'approvisionnement",
            "réservation et exécution des services",
            "traçabilité",
            "intégration opérationnelle et financière",
          ],
          commercialArchitecture: [
            "abonnement organisation",
            "commission ou frais par transaction",
            "facturation au volume",
            "frais d'intégration",
          ],
          requiredCapabilities: [
            "availability_and_allocation",
            "traceability",
            "transaction_and_settlement",
            "interoperability",
          ],
          payerStrategy: ["l'entreprise paie en fonction des gains, volumes ou transactions sécurisés"],
        };

      case "financial_institution":
      case "insurer":
        return {
          ...common,
          productArchitecture: [
            "accès aux profils vérifiés",
            "données d'activité et scoring",
            "suivi des financements ou couvertures",
            "réconciliation des paiements",
          ],
          commercialArchitecture: [
            "abonnement institution",
            "facturation API et données",
            "success fee sur dossiers financés ou assurés",
          ],
          requiredCapabilities: [
            "identity_and_trust",
            "operational_scoring",
            "payment_reconciliation",
            "data_services",
          ],
          payerStrategy: ["l'institution financière paie pour réduire son coût et son risque d'acquisition"],
        };

      default:
        return {
          ...common,
          productArchitecture: [
            "identité et confiance",
            "coordination des activités",
            "accès aux services pertinents",
            "pilotage et reporting",
          ],
          commercialArchitecture: [
            "abonnement récurrent",
            "facturation à l'usage",
            "frais de mise en œuvre",
          ],
          requiredCapabilities: [
            "identity_and_trust",
            "coordination",
            "reporting",
          ],
          payerStrategy: ["identifier le bénéficiaire, le décideur économique et le payeur avant le déploiement"],
        };
    }
  }
}
