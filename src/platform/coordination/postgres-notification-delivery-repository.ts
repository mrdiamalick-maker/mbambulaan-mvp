import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { WorkNotification } from "./unified-work-orchestration-runtime";
import type { NotificationDeliveryAttempt } from "./notification-delivery-gateway";

export interface NotificationContactPoint {
  id: string;
  actorId?: string;
  organizationId: string;
  territoryId: string;
  channel: WorkNotification["channel"];
  recipientReference: string;
  verifiedAt?: string;
  status: "active" | "inactive";
}

export class PostgresNotificationDeliveryRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async upsertContact(contact: NotificationContactPoint) {
    await this.executor().query(
      `INSERT INTO mbambulaan.notification_contact_point (
        contact_point_id, actor_identity_id, organization_id, territory_id,
        channel, recipient_reference, verified_at, status, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      ON CONFLICT (contact_point_id) DO UPDATE SET
        actor_identity_id = EXCLUDED.actor_identity_id,
        organization_id = EXCLUDED.organization_id,
        territory_id = EXCLUDED.territory_id,
        channel = EXCLUDED.channel,
        recipient_reference = EXCLUDED.recipient_reference,
        verified_at = EXCLUDED.verified_at,
        status = EXCLUDED.status,
        updated_at = NOW()`,
      [contact.id, contact.actorId ?? null, contact.organizationId, contact.territoryId, contact.channel, contact.recipientReference, contact.verifiedAt ?? null, contact.status],
    );
    return structuredClone(contact);
  }

  async resolveContact(input: { actorId?: string; organizationId: string; territoryId: string; channel: WorkNotification["channel"] }) {
    const result = await this.executor().query<{
      contact_point_id: string; actor_identity_id: string | null; organization_id: string; territory_id: string;
      channel: WorkNotification["channel"]; recipient_reference: string; verified_at: Date | string | null; status: "active" | "inactive";
    }>(
      `SELECT contact_point_id, actor_identity_id, organization_id, territory_id, channel, recipient_reference, verified_at, status
       FROM mbambulaan.notification_contact_point
       WHERE status = 'active'
         AND organization_id = $1
         AND territory_id IN ($2, 'territory-national')
         AND channel = $3
         AND ($4::text IS NULL OR actor_identity_id = $4)
       ORDER BY actor_identity_id NULLS LAST, verified_at DESC NULLS LAST
       LIMIT 1`,
      [input.organizationId, input.territoryId, input.channel, input.actorId ?? null],
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      id: row.contact_point_id,
      actorId: row.actor_identity_id ?? undefined,
      organizationId: row.organization_id,
      territoryId: row.territory_id,
      channel: row.channel,
      recipientReference: row.recipient_reference,
      verifiedAt: row.verified_at ? new Date(row.verified_at).toISOString() : undefined,
      status: row.status,
    } satisfies NotificationContactPoint;
  }

  async saveAttempt(attempt: NotificationDeliveryAttempt) {
    await this.executor().query(
      `INSERT INTO mbambulaan.notification_delivery_attempt (
        attempt_id, notification_id, channel, recipient_reference, provider_reference, status,
        attempt_number, prepared_at, submitted_at, delivered_at, failed_at, next_retry_at, failure_reason, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
      ON CONFLICT (attempt_id) DO UPDATE SET
        provider_reference = EXCLUDED.provider_reference,
        status = EXCLUDED.status,
        attempt_number = EXCLUDED.attempt_number,
        submitted_at = EXCLUDED.submitted_at,
        delivered_at = EXCLUDED.delivered_at,
        failed_at = EXCLUDED.failed_at,
        next_retry_at = EXCLUDED.next_retry_at,
        failure_reason = EXCLUDED.failure_reason,
        updated_at = NOW()`,
      [attempt.id, attempt.notificationId, attempt.channel, attempt.recipientReference, attempt.providerReference ?? null, attempt.status,
        attempt.attemptNumber ?? 1, attempt.preparedAt, attempt.submittedAt ?? null, attempt.deliveredAt ?? null,
        attempt.failedAt ?? null, attempt.nextRetryAt ?? null, attempt.failureReason ?? null],
    );
  }

  async listAttempts() {
    const result = await this.executor().query<{
      attempt_id: string; notification_id: string; channel: WorkNotification["channel"]; recipient_reference: string;
      provider_reference: string | null; status: NotificationDeliveryAttempt["status"]; attempt_number: number;
      prepared_at: Date | string; submitted_at: Date | string | null; delivered_at: Date | string | null;
      failed_at: Date | string | null; next_retry_at: Date | string | null; failure_reason: string | null;
    }>(`SELECT * FROM mbambulaan.notification_delivery_attempt ORDER BY prepared_at ASC, attempt_id ASC`);
    return result.rows.map((row) => ({
      id: row.attempt_id,
      notificationId: row.notification_id,
      channel: row.channel,
      recipientReference: row.recipient_reference,
      providerReference: row.provider_reference ?? undefined,
      status: row.status,
      attemptNumber: row.attempt_number,
      preparedAt: new Date(row.prepared_at).toISOString(),
      submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : undefined,
      deliveredAt: row.delivered_at ? new Date(row.delivered_at).toISOString() : undefined,
      failedAt: row.failed_at ? new Date(row.failed_at).toISOString() : undefined,
      nextRetryAt: row.next_retry_at ? new Date(row.next_retry_at).toISOString() : undefined,
      failureReason: row.failure_reason ?? undefined,
    } satisfies NotificationDeliveryAttempt));
  }
}
