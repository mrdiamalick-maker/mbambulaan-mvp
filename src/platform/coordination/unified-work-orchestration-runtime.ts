export type WorkPriority = "normal" | "high" | "critical";
export type WorkStatus = "open" | "acknowledged" | "in_progress" | "blocked" | "completed" | "cancelled";

export interface UnifiedWorkItem {
  id: string;
  sourceCapability: "commerce" | "contracts" | "documents" | "finance" | "crisis" | "identity" | "knowledge" | "government" | "system";
  workType: string;
  title: string;
  instructions: string;
  priority: WorkPriority;
  organizationId: string;
  actorId?: string;
  territoryId: string;
  relatedEntityType: string;
  relatedEntityId: string;
  dueAt: string;
  escalationPolicyId?: string;
  notificationChannels: Array<"in_app" | "email" | "sms" | "whatsapp">;
  status: WorkStatus;
  createdAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  firstReminderMinutesBeforeDue: number;
  overdueEscalationMinutes: number;
  maximumEscalationLevel: number;
  levelTargets: Array<{
    level: number;
    organizationId?: string;
    actorId?: string;
    roleCode?: string;
    channels: Array<"in_app" | "email" | "sms" | "whatsapp">;
  }>;
  active: boolean;
}

export interface WorkNotification {
  id: string;
  workItemId: string;
  recipientOrganizationId: string;
  recipientActorId?: string;
  channel: "in_app" | "email" | "sms" | "whatsapp";
  notificationType: "assignment" | "reminder" | "overdue" | "escalation" | "completion";
  message: string;
  escalationLevel: number;
  scheduledAt: string;
  sentAt?: string;
  status: "scheduled" | "sent" | "cancelled";
}

export type UnifiedWorkCommand =
  | { type: "register_work"; workItem: UnifiedWorkItem }
  | { type: "acknowledge_work"; workItemId: string; at: string }
  | { type: "start_work"; workItemId: string }
  | { type: "block_work"; workItemId: string; reason: string }
  | { type: "complete_work"; workItemId: string; at: string }
  | { type: "cancel_work"; workItemId: string; reason: string }
  | { type: "register_escalation_policy"; policy: EscalationPolicy }
  | { type: "mark_notification_sent"; notificationId: string; sentAt: string };

export class UnifiedWorkOrchestrationRuntime {
  private readonly workItems: UnifiedWorkItem[] = [];
  private readonly policies: EscalationPolicy[] = [];
  private readonly notifications: WorkNotification[] = [];
  private readonly processed = new Map<string, unknown>();

  execute(input: { commandId: string; command: UnifiedWorkCommand }) {
    const previous = this.processed.get(input.commandId);
    if (previous) return structuredClone(previous);
    const command = input.command;
    let result: unknown;

    if (command.type === "register_work") {
      const item = command.workItem;
      this.ensureUnique(item.id, this.workItems, "tâche");
      if (!item.title.trim() || !item.instructions.trim()) throw new Error("Le titre et les consignes de la tâche sont obligatoires.");
      if (!item.organizationId || !item.territoryId || !item.relatedEntityId) throw new Error("L'organisation, le territoire et l'objet métier sont obligatoires.");
      if (!item.notificationChannels.length) throw new Error("Au moins un canal de notification est obligatoire.");
      this.workItems.push(structuredClone(item));
      for (const channel of item.notificationChannels) {
        this.notifications.push({
          id: `notification-assignment-${item.id}-${channel}`,
          workItemId: item.id,
          recipientOrganizationId: item.organizationId,
          recipientActorId: item.actorId,
          channel,
          notificationType: "assignment",
          message: item.title,
          escalationLevel: 0,
          scheduledAt: item.createdAt,
          status: "scheduled",
        });
      }
      result = item;
    } else if (command.type === "register_escalation_policy") {
      this.ensureUnique(command.policy.id, this.policies, "politique d'escalade");
      if (!command.policy.name.trim() || command.policy.maximumEscalationLevel < 1) throw new Error("La politique d'escalade est invalide.");
      this.policies.push(structuredClone(command.policy));
      result = command.policy;
    } else if (command.type === "mark_notification_sent") {
      const notification = this.requireNotification(command.notificationId);
      notification.status = "sent";
      notification.sentAt = command.sentAt;
      result = notification;
    } else {
      const item = this.requireWorkItem(command.workItemId);
      if (command.type === "acknowledge_work") {
        item.status = "acknowledged";
        item.acknowledgedAt = command.at;
      } else if (command.type === "start_work") item.status = "in_progress";
      else if (command.type === "block_work") {
        if (!command.reason.trim()) throw new Error("Le motif de blocage est obligatoire.");
        item.status = "blocked";
      } else if (command.type === "complete_work") {
        item.status = "completed";
        item.completedAt = command.at;
        this.cancelPendingNotifications(item.id);
        this.notifications.push({
          id: `notification-completion-${item.id}-${command.at}`,
          workItemId: item.id,
          recipientOrganizationId: item.organizationId,
          recipientActorId: item.actorId,
          channel: "in_app",
          notificationType: "completion",
          message: `Tâche terminée : ${item.title}`,
          escalationLevel: 0,
          scheduledAt: command.at,
          status: "scheduled",
        });
      } else {
        if (!command.reason.trim()) throw new Error("Le motif d'annulation est obligatoire.");
        item.status = "cancelled";
        this.cancelPendingNotifications(item.id);
      }
      result = item;
    }

    const response = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processed.set(input.commandId, structuredClone(response));
    return response;
  }

  planNotifications(at: string) {
    const now = Date.parse(at);
    for (const item of this.workItems) {
      if (["completed", "cancelled"].includes(item.status)) continue;
      const policy = item.escalationPolicyId ? this.policies.find((entry) => entry.id === item.escalationPolicyId && entry.active) : undefined;
      if (!policy) continue;
      const due = Date.parse(item.dueAt);
      const reminderAt = due - policy.firstReminderMinutesBeforeDue * 60_000;
      if (now >= reminderAt && now < due) this.schedule(item, policy, "reminder", 0, at);
      if (now >= due) {
        const elapsedMinutes = Math.floor((now - due) / 60_000);
        const level = Math.min(policy.maximumEscalationLevel, Math.max(1, Math.floor(elapsedMinutes / policy.overdueEscalationMinutes) + 1));
        this.schedule(item, policy, level === 1 ? "overdue" : "escalation", level, at);
      }
    }
    return this.snapshot(at);
  }

  snapshot(at = new Date().toISOString()) {
    const now = Date.parse(at);
    return structuredClone({
      workItems: this.workItems,
      escalationPolicies: this.policies,
      notifications: this.notifications,
      metrics: {
        openCount: this.workItems.filter((item) => !["completed", "cancelled"].includes(item.status)).length,
        overdueCount: this.workItems.filter((item) => !["completed", "cancelled"].includes(item.status) && Date.parse(item.dueAt) < now).length,
        criticalCount: this.workItems.filter((item) => item.priority === "critical" && !["completed", "cancelled"].includes(item.status)).length,
        blockedCount: this.workItems.filter((item) => item.status === "blocked").length,
        scheduledNotificationCount: this.notifications.filter((item) => item.status === "scheduled").length,
      },
    });
  }

  private schedule(item: UnifiedWorkItem, policy: EscalationPolicy, type: WorkNotification["notificationType"], level: number, at: string) {
    const targets = level === 0
      ? [{ organizationId: item.organizationId, actorId: item.actorId, channels: item.notificationChannels }]
      : policy.levelTargets.filter((target) => target.level === level).map((target) => ({ organizationId: target.organizationId ?? item.organizationId, actorId: target.actorId, channels: target.channels }));
    for (const target of targets) {
      for (const channel of target.channels) {
        const id = `notification-${type}-${item.id}-${level}-${channel}`;
        if (this.notifications.some((entry) => entry.id === id)) continue;
        this.notifications.push({
          id,
          workItemId: item.id,
          recipientOrganizationId: target.organizationId,
          recipientActorId: target.actorId,
          channel,
          notificationType: type,
          message: `${type === "reminder" ? "Rappel" : type === "overdue" ? "Échéance dépassée" : "Escalade"} : ${item.title}`,
          escalationLevel: level,
          scheduledAt: at,
          status: "scheduled",
        });
      }
    }
  }

  private cancelPendingNotifications(workItemId: string) {
    for (const notification of this.notifications) {
      if (notification.workItemId === workItemId && notification.status === "scheduled") notification.status = "cancelled";
    }
  }

  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) {
    if (values.some((entry) => entry.id === id)) throw new Error(`${label} déjà existante : ${id}.`);
  }

  private requireWorkItem(id: string) {
    const value = this.workItems.find((entry) => entry.id === id);
    if (!value) throw new Error(`Tâche introuvable : ${id}.`);
    return value;
  }

  private requireNotification(id: string) {
    const value = this.notifications.find((entry) => entry.id === id);
    if (!value) throw new Error(`Notification introuvable : ${id}.`);
    return value;
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbUnifiedWorkRuntime?: UnifiedWorkOrchestrationRuntime };
export function getUnifiedWorkOrchestrationRuntime() {
  globalRuntime.__mbUnifiedWorkRuntime ??= new UnifiedWorkOrchestrationRuntime();
  return globalRuntime.__mbUnifiedWorkRuntime;
}
