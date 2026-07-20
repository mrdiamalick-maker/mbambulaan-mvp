import type { FundingDossierRecord, FundingOpportunity, DecisionRecord, SignalRecord, VerificationTask, ZoneReportRecord } from "@/data/ministryValueJourneyData";
import { communityNeeds, quays } from "@/data/ministryControlTowerData";
import { findQuayIdForTerritory } from "@/lib/ministrySelectors";
import { buildPublicContributionDossiers } from "@/lib/publicContributionOperationalDossiers";

export type DossierType = "Situation terrain" | "Besoin filière" | "Décision institutionnelle";
export type DossierWorkStatus = "Nouveau" | "À traiter" | "En attente" | "Bloqué" | "Terminé";