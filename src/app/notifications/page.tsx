import { NotificationsCenter } from "@/components/notifications/NotificationsCenter";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeIntelligentAlerts } from "@/lib/alerts";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { createNotifications } from "@/lib/notifications";

export default function NotificationsPage() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const notifications = createNotifications(arrivages, besoins, opportunites, dashboardData);
  const alertes = computeIntelligentAlerts(arrivages, besoins, opportunites, [], notifications);

  return <NotificationsCenter alertes={alertes} notifications={notifications} opportunites={opportunites} />;
}
