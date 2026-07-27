import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";
import type { SqlExecutor } from "../persistence/postgres-platform-adapters";
import type {
  IncomingExchange,
  IntegrationPartner,
  IntegrationReceipt,
  IntegrationRepository,
  OutgoingExchange,
} from "./national-integration-gateway";

export class PostgresIntegrationRepository implements IntegrationRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async getPartner(partnerId: EntityId) {
    const result = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.integration_partners WHERE id = $1`,
      [partnerId],
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      partnerType: row.partner_type,
      environment: row.environment,
      status: row.status,
      allowedEventTypes: row.allowed_event_types,
      allowedTerritoryIds: row.allowed_territory_ids,
      allowedIpHashes: row.allowed_ip_hashes,
      signingSecretVersion: row.signing_secret_version,
      requestsPerMinute: row.requests_per_minute,
      callbackUrl: row.callback_url ?? undefined,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    } as IntegrationPartner;
  }

  async findIncomingByIdempotencyKey(partnerId: EntityId, key: string) {
    const result = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.integration_incoming_exchanges WHERE partner_id = $1 AND idempotency_key = $2`,
      [partnerId, key],
    );
    const row = result.rows[0];
    return row ? this.mapIncoming(row) : undefined;
  }

  async saveIncoming(exchange: IncomingExchange) {
    await this.executor().query(
      `INSERT INTO mbambulaan.integration_incoming_exchanges
       (id, partner_id, event_type, event_version, idempotency_key, correlation_id,
        territory_ids, payload, payload_hash, signature, occurred_at, received_at, status, rejection_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (partner_id, idempotency_key) DO NOTHING`,
      [exchange.id, exchange.partnerId, exchange.eventType, exchange.eventVersion, exchange.idempotencyKey,
       exchange.correlationId, exchange.territoryIds, JSON.stringify(exchange.payload), exchange.payloadHash,
       exchange.signature, exchange.occurredAt, exchange.receivedAt, exchange.status, exchange.rejectionReason ?? null],
    );
  }

  async saveOutgoing(exchange: OutgoingExchange) {
    await this.executor().query(
      `INSERT INTO mbambulaan.integration_outgoing_exchanges
       (id, partner_id, event_type, event_version, aggregate_type, aggregate_id, correlation_id,
        territory_ids, payload, payload_hash, signature, status, attempt_count, next_attempt_at,
        delivered_at, last_error, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         attempt_count = EXCLUDED.attempt_count,
         next_attempt_at = EXCLUDED.next_attempt_at,
         delivered_at = EXCLUDED.delivered_at,
         last_error = EXCLUDED.last_error`,
      [exchange.id, exchange.partnerId, exchange.eventType, exchange.eventVersion, exchange.aggregateType,
       exchange.aggregateId, exchange.correlationId, exchange.territoryIds, JSON.stringify(exchange.payload),
       exchange.payloadHash, exchange.signature, exchange.status, exchange.attemptCount, exchange.nextAttemptAt,
       exchange.deliveredAt ?? null, exchange.lastError ?? null, exchange.createdAt],
    );
  }

  async listPendingOutgoing(at: ISODateTime, limit: number) {
    const result = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.integration_outgoing_exchanges
       WHERE status IN ('pending','failed') AND next_attempt_at <= $1
       ORDER BY created_at
       LIMIT $2
       FOR UPDATE SKIP LOCKED`,
      [at, limit],
    );
    return result.rows.map((row) => this.mapOutgoing(row));
  }

  async appendReceipt(receipt: IntegrationReceipt) {
    await this.executor().query(
      `INSERT INTO mbambulaan.integration_receipts
       (id, exchange_id, direction, partner_id, status, provider_reference, detail, occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [receipt.id, receipt.exchangeId, receipt.direction, receipt.partnerId, receipt.status,
       receipt.providerReference ?? null, receipt.detail ?? null, receipt.occurredAt],
    );
  }

  async consumeQuota(input: { partnerId: EntityId; windowStart: ISODateTime; limit: number }) {
    const result = await this.executor().query<{ request_count: number }>(
      `INSERT INTO mbambulaan.integration_quota_windows(partner_id, window_start, request_count)
       VALUES ($1,$2,1)
       ON CONFLICT (partner_id, window_start) DO UPDATE
       SET request_count = mbambulaan.integration_quota_windows.request_count + 1
       WHERE mbambulaan.integration_quota_windows.request_count < $3
       RETURNING request_count`,
      [input.partnerId, input.windowStart, input.limit],
    );
    return result.rowCount === 1;
  }

  private mapIncoming(row: any): IncomingExchange {
    return {
      id: row.id,
      partnerId: row.partner_id,
      eventType: row.event_type,
      eventVersion: row.event_version,
      idempotencyKey: row.idempotency_key,
      correlationId: row.correlation_id,
      territoryIds: row.territory_ids,
      payload: row.payload,
      payloadHash: row.payload_hash,
      signature: row.signature,
      occurredAt: row.occurred_at,
      receivedAt: row.received_at,
      status: row.status,
      rejectionReason: row.rejection_reason ?? undefined,
    };
  }

  private mapOutgoing(row: any): OutgoingExchange {
    return {
      id: row.id,
      partnerId: row.partner_id,
      eventType: row.event_type,
      eventVersion: row.event_version,
      aggregateType: row.aggregate_type,
      aggregateId: row.aggregate_id,
      correlationId: row.correlation_id,
      territoryIds: row.territory_ids,
      payload: row.payload,
      payloadHash: row.payload_hash,
      signature: row.signature,
      status: row.status,
      attemptCount: row.attempt_count,
      nextAttemptAt: row.next_attempt_at,
      deliveredAt: row.delivered_at ?? undefined,
      lastError: row.last_error ?? undefined,
      createdAt: row.created_at,
    };
  }
}
