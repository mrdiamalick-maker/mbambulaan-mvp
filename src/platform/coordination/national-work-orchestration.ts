import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";

export type WorkPriority = "low" | "normal" | "high" | "urgent" | "critical";
export type WorkStatus = "open" | "assigned" | "acknowledged" | "in_progress" | "blocked" | "completed" | "cancelled" | "expired";
export type NotificationChannel = "in_app" | "sms" | "whatsapp" | "push" | "email";
export type DeliveryStatus = "pending" | "sending" | "delivered" | "failed" | "dead_lettered" | "cancelled";

export interface WorkItem {
  id: EntityId;
  workType: string;
  title: string;
  description: string;
  priority: WorkPriority;
  status: WorkStatus;
  territoryIds: EntityId[];
  organizationId?: EntityId;
  assignedIdentityId?: EntityId;
  assignedOrganizationId?: EntityId;
  sourceEventId?: EntityId;
  sourceEntityType: string;
  sourceEntityId: EntityId;
  dueAt: ISODateTime;
  acknowledgementDueAt?: ISODateTime;
  acknowledgedAt?: ISODateTime;
  completedAt?: ISODateTime;
  blockedReason?: string;
  escalationLevel: number;
  escalationPolicyCode: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  metadata: Record<string, string>;
}

export interface Commitment {
  id: EntityId;
  workItemId: EntityId;
  committedByIdentityId?: EntityId;
  committedByOrganizationId?: EntityId;
  commitmentText: string;
  dueAt: ISODateTime;
  status: "proposed" | "accepted" | "in_progress" | "fulfilled" | "missed" | "cancelled";
  acceptedAt?: ISODateTime;
  fulfilledAt?: ISODateTime;
  evidenceIds: EntityId[];
  createdAt: ISODateTime;
}

export interface EscalationPolicy {
  code: string;
  acknowledgementMinutes: number;
  resolutionMinutes: number;
  maximumLevel: number;
  levels: Array<{
    level: number;
    afterMinutes: number;
    targetRoleCodes: string[];
    targetOrganizationTypes?: string[];
    targetScope: "organization" | "territory" | "national";
    channels: NotificationChannel[];
  }>;
}

export interface NotificationPreference {
  identityId: EntityId;
  enabledChannels: NotificationChannel[];
  quietHours?: { startHour: number; endHour: number };
  criticalOverride: boolean;
  locale: "fr" | "wo";
}

export interface NotificationMessage {
  id: EntityId;
  workItemId?: EntityId;
  recipientIdentityId?: EntityId;
  recipientOrganizationId?: EntityId;
  channel: NotificationChannel;
  templateCode: string;
  locale: "fr" | "wo";
  subject?: string;
  payload: Record<string, string>;
  priority: WorkPriority;
  status: DeliveryStatus;
  attemptCount: number;
  nextAttemptAt: ISODateTime;
  providerMessageId?: string;
  deliveredAt?: ISODateTime;
  lastError?: string;
  createdAt: ISODateTime;
}

export interface DeliveryReceipt {
  id: EntityId;
  notificationId: EntityId;
  providerMessageId?: string;
  status: "accepted" | "delivered" | "read" | "failed";
  occurredAt: ISODateTime;
  rawCode?: string;
}

export interface WorkRepository {
  getWorkItem(id: EntityId): Promise<WorkItem | undefined>;
  saveWorkItem(item: WorkItem): Promise<void>;
  listDueWork(at: ISODateTime, limit: number): Promise<WorkItem[]>;
  saveCommitment(commitment: Commitment): Promise<void>;
  getPolicy(code: string): Promise<EscalationPolicy | undefined>;
  getPreference(identityId: EntityId): Promise<NotificationPreference | undefined>;
  saveNotification(message: NotificationMessage): Promise<void>;
  listPendingNotifications(at: ISODateTime, limit: number): Promise<NotificationMessage[]>;
  appendReceipt(receipt: DeliveryReceipt): Promise<void>;
}

export interface RecipientResolver {
  resolve(input: {
    territoryIds: EntityId[];
    organizationId?: EntityId;
    roleCodes: string[];
    organizationTypes?: string[];
    scope: "organization" | "territory" | "national";
  }): Promise<Array<{ identityId?: EntityId; organizationId?: EntityId }>>;
}

export interface NotificationGateway {
  send(message: NotificationMessage): Promise<{ providerMessageId: string }>;
}

export interface CoordinationClock { now(): ISODateTime; }
export interface CoordinationIds { next(prefix: string): EntityId; }

export class NationalWorkOrchestrator {
  constructor(
    private readonly repository: WorkRepository,
    private readonly recipients: RecipientResolver,
    private readonly clock: CoordinationClock,
    private readonly ids: CoordinationIds,
  ) {}

  async createWork(input: {
    workType: string;
    title: string;
    description: string;
    priority: WorkPriority;
    territoryIds: EntityId[];
    organizationId?: EntityId;
    assignedIdentityId?: EntityId;
    assignedOrganizationId?: EntityId;
    sourceEventId?: EntityId;
    sourceEntityType: string;
    sourceEntityId: EntityId;
    dueAt: ISODateTime;
    escalationPolicyCode: string;
    metadata?: Record<string, string>;
  }) {
    if (!input.title.trim()) throw new Error("Le titre de la tâche est obligatoire.");
    if (!input.territoryIds.length) throw new Error("La tâche doit être territorialisée.");
    if (Date.parse(input.dueAt) <= Date.parse(this.clock.now())) throw new Error("L'échéance doit être future.");
    const policy = await this.repository.getPolicy(input.escalationPolicyCode);
    if (!policy) throw new Error("La politique d'escalade est inconnue.");
    const now = this.clock.now();
    const item: WorkItem = {
      id: this.ids.next("work"),
      ...input,
      territoryIds: [...new Set(input.territoryIds)],
      status: input.assignedIdentityId || input.assignedOrganizationId ? "assigned" : "open",
      acknowledgementDueAt: new Date(Date.parse(now) + policy.acknowledgementMinutes * 60_000).toISOString() as ISODateTime,
      escalationLevel: 0,
      createdAt: now,
      updatedAt: now,
      metadata: structuredClone(input.metadata ?? {}),
    };
    await this.repository.saveWorkItem(item);
    await this.notifyAssignment(item);
    return structuredClone(item);
  }

  async acknowledge(input: { workItemId: EntityId; identityId: EntityId }) {
    const item = await this.requireWork(input.workItemId);
    if (["completed", "cancelled", "expired"].includes(item.status)) throw new Error("La tâche ne peut plus être acquittée.");
    if (item.assignedIdentityId && item.assignedIdentityId !== input.identityId) throw new Error("La tâche est affectée à une autre identité.");
    item.assignedIdentityId ??= input.identityId;
    item.status = "acknowledged";
    item.acknowledgedAt = this.clock.now();
    item.updatedAt = this.clock.now();
    await this.repository.saveWorkItem(item);
    return structuredClone(item);
  }

  async complete(input: { workItemId: EntityId; identityId: EntityId; evidenceIds?: EntityId[] }) {
    const item = await this.requireWork(input.workItemId);
    if (item.status === "completed") return structuredClone(item);
    if (["cancelled", "expired"].includes(item.status)) throw new Error("La tâche ne peut plus être terminée.");
    item.status = "completed";
    item.completedAt = this.clock.now();
    item.updatedAt = this.clock.now();
    if (input.evidenceIds?.length) item.metadata.evidenceIds = input.evidenceIds.join(",");
    await this.repository.saveWorkItem(item);
    return structuredClone(item);
  }

  async registerCommitment(input: {
    workItemId: EntityId;
    committedByIdentityId?: EntityId;
    committedByOrganizationId?: EntityId;
    commitmentText: string;
    dueAt: ISODateTime;
  }) {
    await this.requireWork(input.workItemId);
    if (!input.committedByIdentityId && !input.committedByOrganizationId) throw new Error("Un engagement doit avoir un porteur.");
    if (Date.parse(input.dueAt) <= Date.parse(this.clock.now())) throw new Error("L'échéance de l'engagement doit être future.");
    const commitment: Commitment = {
      id: this.ids.next("commitment"),
      ...input,
      status: "proposed",
      evidenceIds: [],
      createdAt: this.clock.now(),
    };
    await this.repository.saveCommitment(commitment);
    return structuredClone(commitment);
  }

  async processEscalations(limit = 100) {
    const due = await this.repository.listDueWork(this.clock.now(), limit);
    const escalated: WorkItem[] = [];
    for (const item of due) {
      const policy = await this.repository.getPolicy(item.escalationPolicyCode);
      if (!policy || item.escalationLevel >= policy.maximumLevel || ["completed", "cancelled", "expired"].includes(item.status)) continue;
      const elapsedMinutes = Math.floor((Date.parse(this.clock.now()) - Date.parse(item.createdAt)) / 60_000);
      const next = policy.levels
        .filter((level) => level.level > item.escalationLevel && elapsedMinutes >= level.afterMinutes)
        .sort((a, b) => a.level - b.level)[0];
      if (!next) continue;
      item.escalationLevel = next.level;
      item.updatedAt = this.clock.now();
      if (item.status === "open" || item.status === "assigned") item.status = "blocked";
      item.blockedReason = `SLA dépassé, escalade niveau ${next.level}.`;
      await this.repository.saveWorkItem(item);
      const targets = await this.recipients.resolve({
        territoryIds: item.territoryIds,
        organizationId: item.organizationId,
        roleCodes: next.targetRoleCodes,
        organizationTypes: next.targetOrganizationTypes,
        scope: next.targetScope,
      });
      for (const target of targets) {
        for (const channel of next.channels) {
          await this.enqueueNotification({
            workItem: item,
            recipientIdentityId: target.identityId,
            recipientOrganizationId: target.organizationId,
            channel,
            templateCode: "work_escalated",
          });
        }
      }
      escalated.push(structuredClone(item));
    }
    return escalated;
  }

  private async notifyAssignment(item: WorkItem) {
    if (item.assignedIdentityId) {
      const preference = await this.repository.getPreference(item.assignedIdentityId);
      const channels = this.channelsFor(item.priority, preference);
      for (const channel of channels) {
        await this.enqueueNotification({ workItem: item, recipientIdentityId: item.assignedIdentityId, channel, templateCode: "work_assigned", locale: preference?.locale });
      }
    } else if (item.assignedOrganizationId) {
      await this.enqueueNotification({ workItem: item, recipientOrganizationId: item.assignedOrganizationId, channel: "in_app", templateCode: "work_assigned" });
    }
  }

  private channelsFor(priority: WorkPriority, preference?: NotificationPreference) {
    const enabled = preference?.enabledChannels?.length ? preference.enabledChannels : ["in_app"] as NotificationChannel[];
    if ((priority === "critical" || priority === "urgent") && preference?.criticalOverride) {
      return [...new Set<NotificationChannel>([...enabled, "sms", "whatsapp", "push"])];
    }
    return enabled;
  }

  private async enqueueNotification(input: {
    workItem: WorkItem;
    recipientIdentityId?: EntityId;
    recipientOrganizationId?: EntityId;
    channel: NotificationChannel;
    templateCode: string;
    locale?: "fr" | "wo";
  }) {
    const message: NotificationMessage = {
      id: this.ids.next("notification"),
      workItemId: input.workItem.id,
      recipientIdentityId: input.recipientIdentityId,
      recipientOrganizationId: input.recipientOrganizationId,
      channel: input.channel,
      templateCode: input.templateCode,
      locale: input.locale ?? "fr",
      subject: input.workItem.title,
      payload: {
        workItemId: input.workItem.id,
        title: input.workItem.title,
        priority: input.workItem.priority,
        dueAt: input.workItem.dueAt,
        territoryIds: input.workItem.territoryIds.join(","),
      },
      priority: input.workItem.priority,
      status: "pending",
      attemptCount: 0,
      nextAttemptAt: this.clock.now(),
      createdAt: this.clock.now(),
    };
    await this.repository.saveNotification(message);
  }

  private async requireWork(id: EntityId) {
    const item = await this.repository.getWorkItem(id);
    if (!item) throw new Error("Tâche introuvable.");
    return item;
  }
}

export class NotificationDispatcher {
  constructor(
    private readonly repository: WorkRepository,
    private readonly gateways: Partial<Record<NotificationChannel, NotificationGateway>>,
    private readonly clock: CoordinationClock,
    private readonly ids: CoordinationIds,
    private readonly maxAttempts = 5,
  ) {}

  async dispatch(limit = 100) {
    const pending = await this.repository.listPendingNotifications(this.clock.now(), limit);
    const results: NotificationMessage[] = [];
    for (const message of pending) {
      const gateway = this.gateways[message.channel];
      if (!gateway) {
        await this.fail(message, `Aucun fournisseur configuré pour ${message.channel}.`);
        results.push(structuredClone(message));
        continue;
      }
      message.status = "sending";
      await this.repository.saveNotification(message);
      try {
        const result = await gateway.send(message);
        message.status = "delivered";
        message.providerMessageId = result.providerMessageId;
        message.deliveredAt = this.clock.now();
        message.lastError = undefined;
        await this.repository.saveNotification(message);
        await this.repository.appendReceipt({
          id: this.ids.next("delivery-receipt"),
          notificationId: message.id,
          providerMessageId: result.providerMessageId,
          status: "accepted",
          occurredAt: this.clock.now(),
        });
      } catch (error) {
        await this.fail(message, error instanceof Error ? error.message : "Erreur de livraison inconnue.");
      }
      results.push(structuredClone(message));
    }
    return results;
  }

  private async fail(message: NotificationMessage, error: string) {
    message.attemptCount += 1;
    message.lastError = error;
    if (message.attemptCount >= this.maxAttempts) {
      message.status = "dead_lettered";
    } else {
      message.status = "failed";
      const delayMinutes = Math.min(60, 2 ** message.attemptCount);
      message.nextAttemptAt = new Date(Date.parse(this.clock.now()) + delayMinutes * 60_000).toISOString() as ISODateTime;
    }
    await this.repository.saveNotification(message);
  }
}

export class InMemoryWorkRepository implements WorkRepository {
  readonly workItems = new Map<EntityId, WorkItem>();
  readonly commitments = new Map<EntityId, Commitment>();
  readonly policies = new Map<string, EscalationPolicy>();
  readonly preferences = new Map<EntityId, NotificationPreference>();
  readonly notifications = new Map<EntityId, NotificationMessage>();
  readonly receipts: DeliveryReceipt[] = [];

  async getWorkItem(id: EntityId) { const item = this.workItems.get(id); return item ? structuredClone(item) : undefined; }
  async saveWorkItem(item: WorkItem) { this.workItems.set(item.id, structuredClone(item)); }
  async listDueWork(at: ISODateTime, limit: number) { return structuredClone([...this.workItems.values()].filter((item) => Date.parse(item.dueAt) <= Date.parse(at) || (item.acknowledgementDueAt && Date.parse(item.acknowledgementDueAt) <= Date.parse(at))).slice(0, limit)); }
  async saveCommitment(commitment: Commitment) { this.commitments.set(commitment.id, structuredClone(commitment)); }
  async getPolicy(code: string) { const item = this.policies.get(code); return item ? structuredClone(item) : undefined; }
  async getPreference(identityId: EntityId) { const item = this.preferences.get(identityId); return item ? structuredClone(item) : undefined; }
  async saveNotification(message: NotificationMessage) { this.notifications.set(message.id, structuredClone(message)); }
  async listPendingNotifications(at: ISODateTime, limit: number) { return structuredClone([...this.notifications.values()].filter((item) => ["pending", "failed"].includes(item.status) && Date.parse(item.nextAttemptAt) <= Date.parse(at)).slice(0, limit)); }
  async appendReceipt(receipt: DeliveryReceipt) { this.receipts.push(structuredClone(receipt)); }
}
