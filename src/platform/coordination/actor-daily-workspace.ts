import type { UnifiedWorkItem, WorkNotification } from "./unified-work-orchestration-runtime";

export interface ActorDailyWorkspaceInput {
  actorId: string;
  organizationId: string;
  territoryId: string;
  workItems: UnifiedWorkItem[];
  notifications: WorkNotification[];
  at: string;
}

export class ActorDailyWorkspace {
  project(input: ActorDailyWorkspaceInput) {
    const now = Date.parse(input.at);
    const visibleWork = input.workItems.filter((item) =>
      item.organizationId === input.organizationId
      && item.territoryId === input.territoryId
      && (!item.actorId || item.actorId === input.actorId),
    );
    const actionable = visibleWork
      .filter((item) => !["completed", "cancelled"].includes(item.status))
      .sort((left, right) => {
        const priority = { critical: 0, high: 1, normal: 2 };
        return priority[left.priority] - priority[right.priority] || Date.parse(left.dueAt) - Date.parse(right.dueAt);
      });
    const workIds = new Set(visibleWork.map((item) => item.id));
    const notifications = input.notifications.filter((item) =>
      workIds.has(item.workItemId)
      && item.recipientOrganizationId === input.organizationId
      && (!item.recipientActorId || item.recipientActorId === input.actorId),
    );

    return {
      actorId: input.actorId,
      organizationId: input.organizationId,
      territoryId: input.territoryId,
      generatedAt: input.at,
      sections: {
        overdue: actionable.filter((item) => Date.parse(item.dueAt) < now),
        dueToday: actionable.filter((item) => Date.parse(item.dueAt) >= now && Date.parse(item.dueAt) <= now + 24 * 60 * 60 * 1000),
        critical: actionable.filter((item) => item.priority === "critical"),
        blocked: actionable.filter((item) => item.status === "blocked"),
        upcoming: actionable.filter((item) => Date.parse(item.dueAt) > now + 24 * 60 * 60 * 1000),
      },
      notifications,
      metrics: {
        actionableCount: actionable.length,
        overdueCount: actionable.filter((item) => Date.parse(item.dueAt) < now).length,
        criticalCount: actionable.filter((item) => item.priority === "critical").length,
        blockedCount: actionable.filter((item) => item.status === "blocked").length,
        unreadNotificationCount: notifications.filter((item) => item.status === "scheduled").length,
      },
    };
  }
}
