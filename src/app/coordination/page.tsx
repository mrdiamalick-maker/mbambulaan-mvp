import { CoordinationTimelinePanel } from "@/components/daySimulation/DaySimulationPanels";
import { CoordinationCenter } from "@/components/coordination/CoordinationCenter";
import { CoordinationInstitutionalPanel } from "@/components/executive/ExecutivePanels";
import { CoordinationQualityPanel } from "@/components/quality/QualityPanels";
import { CoordinationRoleRecommendationsPanel } from "@/components/roleRecommendations/RoleRecommendationPanels";
import { SliceDecisionStrip } from "@/components/slice/SliceDecisionStrip";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { computeDaySimulation, createDaySimulationNotifications } from "@/lib/daySimulation";
import { computeExecutiveSummary } from "@/lib/executive";
import { createNotifications } from "@/lib/notifications";
import { computeCoordinationEngine } from "@/lib/mvpSlice";
import { computeRoleRecommendations } from "@/lib/roleRecommendations";

export default function CoordinationPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const notifications = createNotifications(arrivages, besoins, opportunites, dashboardData);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);
  const executiveNotifications = [...notifications, ...createDaySimulationNotifications(daySimulation.events)];
  const roleRecommendations = computeRoleRecommendations({ arrivages, besoins, opportunites, transactions: daySimulation.transactions, notifications });
  const executive = computeExecutiveSummary({ arrivages, besoins, opportunites, transactions: daySimulation.transactions, notifications: executiveNotifications });
  const slice = computeCoordinationEngine();

  return (
    <>
      <SliceDecisionStrip active="action" slice={slice} />
      <CoordinationCenter arrivages={arrivages} besoins={besoins} opportunites={opportunites} notifications={notifications} />
      <CoordinationInstitutionalPanel executive={executive} />
      <CoordinationTimelinePanel events={daySimulation.events} />
      <CoordinationRoleRecommendationsPanel recommendations={roleRecommendations} />
      <CoordinationQualityPanel arrivages={arrivages} besoins={besoins} opportunites={opportunites} />
    </>
  );
}
