import type { DocumentWorkItem } from "@/platform/documents/document-work-queue-projector";
import type { UnifiedWorkItem } from "./unified-work-orchestration-runtime";

export type WorkSourceRecord =
  | { source: "documents"; item: DocumentWorkItem }
  | { source: "contracts" | "commerce" | "finance" | "crisis" | "identity" | "knowledge" | "government"; item: {
      id: string;
      workType: string;
      title: string;
      instructions: string;
      priority: "normal" | "high" | "critical";
      organizationId: string;
      actorId?: string;
      territoryId: string;
      relatedEntityType: string;
      relatedEntityId: string;
      dueAt: string;
    } };

export class UnifiedWorkSourceProjector {
  project(record: WorkSourceRecord, input?: { escalationPolicyId?: string; channels?: UnifiedWorkItem["notificationChannels"]; createdAt?: string }): UnifiedWorkItem {
    const item = record.item;
    return {
      id: `unified-${record.source}-${item.id}`,
      sourceCapability: record.source,
      workType: item.workType,
      title: item.title,
      instructions: item.instructions,
      priority: item.priority,
      organizationId: item.organizationId,
      actorId: item.actorId,
      territoryId: item.territoryId,
      relatedEntityType: item.relatedEntityType,
      relatedEntityId: item.relatedEntityId,
      dueAt: item.dueAt,
      escalationPolicyId: input?.escalationPolicyId,
      notificationChannels: input?.channels?.length ? input.channels : ["in_app"],
      status: "open",
      createdAt: input?.createdAt ?? new Date().toISOString(),
    };
  }
}
