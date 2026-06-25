import { WorkspacePage } from "@/components/workspace/WorkspacePage";
import { workspacePages } from "@/data/workspace";

export default function DashboardPage() {
  return <WorkspacePage page={workspacePages.dashboard} />;
}
