import {
  communityNeeds,
  communityProjects,
  landings,
  pirogues,
  quays,
  trainingPrograms,
  type CommunityNeed,
  type Level,
  type Region,
} from "@/data/ministryControlTowerData";
import {
  fundingCoverageByOpportunity,
  quayTrends,
  type FundingOpportunity,
} from "@/data/ministryValueJourneyData";

export type PilotagePeriod = "today" | "7d" | "30d";

export type MinistryFilters = {
  region: "Toutes" | Region;
  quayId: string;
  species: string;
  period: PilotagePeriod;
};

type BadgeTone = "success" | "warning" | "info" | "danger" | "neutral";

const allPrograms = [...communityProjects, ...trainingPrograms];

const isAll = (value: string) => value === "Tous" || value === "Toutes";

export function needRelations(need: CommunityNeed, opportunities: FundingOpportunity[]) {
  const program = allPrograms.find(
    (item) => item.id === need.programId || item.needIds.includes(need.id),
  );
  const financing = opportunities.find((item) => item.needId === need.id);

  return { program, financing };
}

export function fundingMaturity(opportunity: FundingOpportunity): {
  label: string;
  tone: BadgeTone;
} {
  switch (opportunity.status) {
    case "Financé":
      return { label: "Financé", tone: "success" };
    case "Décliné":
      return { label: "Décliné", tone: "danger" };
    case "En négociation":
    case "Transmis":
      return { label: opportunity.status, tone: "warning" };
    case "Dossier constitué":
    case "En instruction":
    case "Éligible au financement":
      return { label: opportunity.status, tone: "info" };
    case "À qualifier":
    default:
      return { label: opportunity.status, tone: "neutral" };
  }
}

function seriesForPeriod(period: PilotagePeriod, quayIds: string[]) {
  const labels = period === "today"
    ? ["06h", "08h", "10h", "12h", "14h", "16h", "18h"]
    : period === "7d"
      ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
      : ["S1", "S2", "S3", "S4"];

  const source = quayIds
    .map((id) => quayTrends[id] ?? [])
    .filter((values) => values.length > 0);

  const daily = Array.from({ length: 7 }, (_, index) =>
    source.reduce((sum, values) => sum + (values[index] ?? 0), 0),
  );

  if (period === "30d") {
    const total = daily.reduce((sum, value) => sum + value, 0);
    return labels.map((label, index) => ({
      label,
      value: Math.round((total * [0.22, 0.25, 0.27, 0.26][index]) / 10),
    }));
  }

  return labels.map((label, index) => ({
    label,
    value: Math.round((daily[index] ?? 0) / 10),
  }));
}

export function selectMinistrySnapshot(
  filters: MinistryFilters,
  opportunities: FundingOpportunity[] = [],
) {
  const selectedQuays = quays.filter((quay) => {
    const regionMatches = isAll(filters.region) || quay.region === filters.region;
    const quayMatches = isAll(filters.quayId) || quay.id === filters.quayId;
    const speciesMatches = isAll(filters.species) || quay.species.includes(filters.species);
    return regionMatches && quayMatches && speciesMatches;
  });

  const quayIds = new Set(selectedQuays.map((quay) => quay.id));
  const selectedLandings = landings.filter(
    (landing) =>
      quayIds.has(landing.quayId) &&
      (isAll(filters.species) || landing.species.includes(filters.species)),
  );
  const selectedPirogues = pirogues.filter((pirogue) => quayIds.has(pirogue.quayId));
  const selectedNeeds = communityNeeds.filter((need) => quayIds.has(need.quayId));
  const selectedNeedIds = new Set(selectedNeeds.map((need) => need.id));
  const selectedOpportunities = opportunities.filter((item) => selectedNeedIds.has(item.needId));

  const selectedProgramIds = new Set(
    allPrograms
      .filter((program) => program.quayIds.some((id) => quayIds.has(id)))
      .map((program) => program.id),
  );

  const speciesVolumes = new Map<string, number>();
  selectedLandings.forEach((landing) => {
    const sharedVolume = landing.species.length
      ? landing.volumeTons / landing.species.length
      : 0;
    landing.species.forEach((name) => {
      speciesVolumes.set(name, (speciesVolumes.get(name) ?? 0) + sharedVolume);
    });
  });

  const levelOrder: Level[] = ["normal", "surveillance", "urgent"];
  const levelLabels: Record<Level, string> = {
    normal: "Normal",
    surveillance: "Vigilance",
    urgent: "Critique",
  };

  const remainingBudget = selectedOpportunities.reduce((sum, opportunity) => {
    const covered = fundingCoverageByOpportunity[opportunity.id]?.coveredAmount ?? 0;
    return sum + Math.max(opportunity.estimatedAmount - covered, 0);
  }, 0);

  const latestUpdate = selectedQuays
    .map((quay) => quay.lastUpdated)
    .sort((a, b) => b.localeCompare(a))[0] ?? "—";

  return {
    quays: selectedQuays,
    latestUpdate,
    activeQuays: selectedQuays.filter((quay) => quay.landingsToday > 0).length,
    activePirogues: selectedQuays.reduce((sum, quay) => sum + quay.activePirogues, 0),
    atSeaPirogues: selectedPirogues.filter((pirogue) =>
      ["atSea", "expectedReturn"].includes(pirogue.cycleStage),
    ).length,
    landingCount: filters.period === "today"
      ? selectedLandings.length
      : selectedQuays.reduce((sum, quay) => sum + quay.landingsToday, 0),
    totalVolume: filters.period === "today"
      ? selectedLandings.reduce((sum, landing) => sum + landing.volumeTons, 0)
      : selectedQuays.reduce((sum, quay) => sum + quay.volumeTons, 0),
    speciesCount: new Set(selectedLandings.flatMap((landing) => landing.species)).size,
    attentionCount: selectedQuays.filter((quay) => quay.level !== "normal").length,
    periodSeries: seriesForPeriod(filters.period, selectedQuays.map((quay) => quay.id)),
    situationLevels: levelOrder.map((level) => ({
      label: levelLabels[level],
      value: selectedQuays.filter((quay) => quay.level === level).length,
    })),
    quayVolumes: selectedQuays
      .map((quay) => ({ id: quay.id, name: quay.name, volume: quay.volumeTons }))
      .sort((a, b) => b.volume - a.volume),
    speciesVolumes: [...speciesVolumes.entries()]
      .map(([species, volume]) => ({ species, volume: Number(volume.toFixed(1)) }))
      .sort((a, b) => b.volume - a.volume),
    pirogueStatuses: [
      { label: "Préparation / départ", value: selectedPirogues.filter((item) => ["preparation", "departure"].includes(item.cycleStage)).length },
      { label: "En mer / retour", value: selectedPirogues.filter((item) => ["atSea", "expectedReturn"].includes(item.cycleStage)).length },
      { label: "Débarqué / déclaré", value: selectedPirogues.filter((item) => ["returned", "landing", "declared"].includes(item.cycleStage)).length },
      { label: "Vérifié", value: selectedPirogues.filter((item) => item.cycleStage === "verified").length },
    ],
    qualifiedNeeds: selectedNeeds.filter((need) => need.maturity === "Qualifié").length,
    activePrograms: allPrograms.filter(
      (program) => selectedProgramIds.has(program.id) && program.status === "Actif",
    ).length,
    remainingBudget,
  };
}
