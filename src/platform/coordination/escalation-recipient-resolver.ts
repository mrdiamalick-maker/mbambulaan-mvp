import type { DemoIdentity } from "@/platform/access/demo-access-control";
import type { EscalationPolicy, UnifiedWorkItem } from "./unified-work-orchestration-runtime";

export interface ResolvedEscalationRecipient {
  level: number;
  organizationId: string;
  actorId?: string;
  channels: Array<"in_app" | "email" | "sms" | "whatsapp">;
  resolution: "explicit_actor" | "role_and_territory" | "organization_fallback";
}

export class EscalationRecipientResolver {
  resolve(input: {
    workItem: UnifiedWorkItem;
    policy: EscalationPolicy;
    level: number;
    identities: DemoIdentity[];
  }): ResolvedEscalationRecipient[] {
    const targets = input.policy.levelTargets.filter((target) => target.level === input.level);
    return targets.map((target) => {
      if (target.actorId) {
        const actor = input.identities.find((identity) => identity.id === target.actorId && identity.status === "active");
        if (!actor) throw new Error(`Destinataire d'escalade introuvable : ${target.actorId}.`);
        if (!actor.territoryIds.includes("territory-national") && !actor.territoryIds.includes(input.workItem.territoryId)) {
          throw new Error(`Le destinataire ${actor.id} n'est pas autorisé sur le territoire ${input.workItem.territoryId}.`);
        }
        return { level: input.level, organizationId: actor.organizationId, actorId: actor.id, channels: target.channels, resolution: "explicit_actor" };
      }

      if (target.roleCode) {
        const actor = input.identities.find((identity) =>
          identity.status === "active"
          && identity.roleCode === target.roleCode
          && (identity.territoryIds.includes("territory-national") || identity.territoryIds.includes(input.workItem.territoryId))
          && (!target.organizationId || identity.organizationId === target.organizationId),
        );
        if (actor) return { level: input.level, organizationId: actor.organizationId, actorId: actor.id, channels: target.channels, resolution: "role_and_territory" };
      }

      return {
        level: input.level,
        organizationId: target.organizationId ?? input.workItem.organizationId,
        channels: target.channels,
        resolution: "organization_fallback",
      };
    });
  }
}
