import type { DemoIdentity } from "@/platform/access/demo-access-control";
import { getRuntimeSqlExecutor, hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { getCommercialCatalog } from "./commercial-catalog-registry";

export type CatalogCommand =
  | { type: "seed_demo"; at?: string }
  | { type: "reserve"; reservationId: string; offerId: string; quantityKg: number; logisticsOptionId: string; ttlMinutes?: number; at?: string }
  | { type: "confirm_reservation"; reservationId: string; at?: string }
  | { type: "cancel_reservation"; reservationId: string; at?: string };

export interface PersistedCatalogCommand {
  commandId: string;
  actorIdentityId: string;
  organizationId: string;
  territoryId: string;
  command: CatalogCommand;
  occurredAt: string;
}

export interface CatalogCommandJournal {
  append(entry: PersistedCatalogCommand): Promise<void>;
  list(): Promise<PersistedCatalogCommand[]>;
}

class VolatileCatalogCommandJournal implements CatalogCommandJournal {
  private readonly entries: PersistedCatalogCommand[] = [];
  async append(entry: PersistedCatalogCommand) {
    if (!this.entries.some((item) => item.commandId === entry.commandId)) this.entries.push(structuredClone(entry));
  }
  async list() { return structuredClone(this.entries); }
}

class PostgresCatalogCommandJournal implements CatalogCommandJournal {
  async append(entry: PersistedCatalogCommand) {
    await getRuntimeSqlExecutor().query(
      `INSERT INTO mbambulaan.catalog_command_journal
       (command_id,actor_identity_id,organization_id,territory_id,command_type,command_payload,occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)
       ON CONFLICT (command_id) DO NOTHING`,
      [entry.commandId, entry.actorIdentityId, entry.organizationId, entry.territoryId,
       entry.command.type, JSON.stringify(entry.command), entry.occurredAt],
    );
  }

  async list() {
    const result = await getRuntimeSqlExecutor().query<Record<string, unknown>>(
      `SELECT command_id,actor_identity_id,organization_id,territory_id,command_payload,occurred_at
       FROM mbambulaan.catalog_command_journal ORDER BY sequence_id ASC`,
    );
    return result.rows.map((row) => ({
      commandId: String(row.command_id),
      actorIdentityId: String(row.actor_identity_id),
      organizationId: String(row.organization_id),
      territoryId: String(row.territory_id),
      command: row.command_payload as CatalogCommand,
      occurredAt: new Date(String(row.occurred_at)).toISOString(),
    }));
  }
}

export class PersistentCommercialCatalog {
  private hydrated = false;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly journal: CatalogCommandJournal) {}

  async snapshot(at?: string) {
    await this.hydrate();
    return getCommercialCatalog().snapshot(at);
  }

  async execute(input: {
    commandId: string;
    identity: DemoIdentity;
    territoryId: string;
    command: CatalogCommand;
  }) {
    return this.serialized(async () => {
      await this.hydrate();
      validateCatalogCommand(input.identity, input.command);
      const result = applyCatalogCommand(input.identity, input.command);
      try {
        await this.journal.append({
          commandId: input.commandId,
          actorIdentityId: input.identity.id,
          organizationId: input.identity.organizationId,
          territoryId: input.territoryId,
          command: input.command,
          occurredAt: commandOccurredAt(input.command),
        });
      } catch (error) {
        this.hydrated = false;
        await this.hydrate();
        throw error;
      }
      return result;
    });
  }

  private async hydrate() {
    if (this.hydrated) return;
    const catalog = getCommercialCatalog();
    catalog.reset();
    const entries = await this.journal.list();
    for (const entry of entries) applyCatalogCommandForReplay(entry.organizationId, entry.command);
    this.hydrated = true;
  }

  private serialized<T>(operation: () => Promise<T>) {
    const next = this.queue.then(operation, operation);
    this.queue = next.then(() => undefined, () => undefined);
    return next;
  }
}

function validateCatalogCommand(identity: DemoIdentity, command: CatalogCommand) {
  if (command.type === "seed_demo" && !["cooperative_manager", "platform_admin"].includes(identity.roleCode)) {
    throw new Error("Seul un vendeur ou administrateur peut initialiser le catalogue.");
  }
  if (["reserve", "confirm_reservation", "cancel_reservation"].includes(command.type) && identity.roleCode !== "buyer_operator") {
    throw new Error("Seul un acheteur professionnel peut gérer une réservation.");
  }
}

function applyCatalogCommand(identity: DemoIdentity, command: CatalogCommand) {
  return applyCatalogCommandForReplay(identity.organizationId, command, identity.roleCode);
}

function applyCatalogCommandForReplay(organizationId: string, command: CatalogCommand, roleCode?: string) {
  const catalog = getCommercialCatalog();
  switch (command.type) {
    case "seed_demo": {
      catalog.reset();
      catalog.upsertLogisticsOption({
        id: "log-dakar-cold",
        operatorOrganizationId: "org-cold-chain-dakar",
        territoryIds: ["territory-dakar"],
        pricePerKgXof: 250,
        minimumFeeXof: 100_000,
        estimatedHours: 4,
        coldChain: true,
        active: true,
      });
      catalog.createOffer({
        id: "offer-thiof-01",
        sellerOrganizationId: roleCode === "cooperative_manager" ? organizationId : "org-cooperative-dakar",
        territoryId: "territory-dakar",
        speciesCode: "thiof",
        qualityGrade: "A",
        landingSiteId: "landing-dakar-01",
        availableQuantityKg: 1_000,
        unitPriceXof: 2_500,
        minimumOrderKg: 100,
        availableFrom: "2026-07-27T08:00:00.000Z",
        expiresAt: "2026-07-28T08:00:00.000Z",
      });
      return catalog.publishOffer("offer-thiof-01", command.at ?? "2026-07-27T08:00:00.000Z");
    }
    case "reserve":
      return catalog.reserve({
        id: command.reservationId,
        offerId: command.offerId,
        buyerOrganizationId: organizationId,
        quantityKg: command.quantityKg,
        logisticsOptionId: command.logisticsOptionId,
        ttlMinutes: command.ttlMinutes,
        at: command.at,
      });
    case "confirm_reservation":
      return catalog.confirmReservation(command.reservationId, command.at);
    case "cancel_reservation":
      return catalog.cancelReservation(command.reservationId, command.at);
  }
}

function commandOccurredAt(command: CatalogCommand) {
  return command.at ?? new Date().toISOString();
}

declare global {
  var __mbambulaanPersistentCommercialCatalog: PersistentCommercialCatalog | undefined;
}

export function getPersistentCommercialCatalog() {
  globalThis.__mbambulaanPersistentCommercialCatalog ??= new PersistentCommercialCatalog(
    hasRuntimeDatabase() ? new PostgresCatalogCommandJournal() : new VolatileCatalogCommandJournal(),
  );
  return globalThis.__mbambulaanPersistentCommercialCatalog;
}
