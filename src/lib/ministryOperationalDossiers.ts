import type { FundingDossierRecord, FundingOpportunity, DecisionRecord, SignalRecord, VerificationTask, ZoneReportRecord } from "@/data/ministryValueJourneyData";
import { communityNeeds, quays } from "@/data/ministryControlTowerData";
import { publicContributionSeeds } from "@/data/publicMobilizations";
import { findQuayIdForTerritory } from "@/lib/ministrySelectors";

export type DossierType = "Situation terrain" | "Besoin filière" | "Décision institutionnelle";
export type DossierWorkStatus = "Nouveau" |