BEGIN;

CREATE SCHEMA IF NOT EXISTS mbambulaan;

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_offers (
  id text PRIMARY KEY,
  seller_organization_id text NOT NULL,
  territory_id text NOT NULL,
  species_code text NOT NULL,
  quality_grade text NOT NULL,
  available_quantity_kg numeric(14,3) NOT NULL CHECK (available_quantity_kg >= 0),
  unit_price_xof bigint NOT NULL CHECK (unit_price_xof > 0),
  status text NOT NULL CHECK (status IN ('available','reserved','sold_out')),
  published_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_orders (
  id text PRIMARY KEY,
  offer_id text NOT NULL REFERENCES mbambulaan.commercial_offers(id),
  buyer_organization_id text NOT NULL,
  seller_organization_id text NOT NULL,
  territory_id text NOT NULL,
  quantity_kg numeric(14,3) NOT NULL CHECK (quantity_kg > 0),
  seafood_amount_xof bigint NOT NULL CHECK (seafood_amount_xof >= 0),
  logistics_amount_xof bigint NOT NULL CHECK (logistics_amount_xof >= 0),
  platform_commission_rate_bps integer NOT NULL CHECK (platform_commission_rate_bps BETWEEN 0 AND 10000),
  platform_commission_xof bigint NOT NULL CHECK (platform_commission_xof >= 0),
  buyer_total_xof bigint NOT NULL CHECK (buyer_total_xof >= 0),
  seller_net_xof bigint NOT NULL CHECK (seller_net_xof >= 0),
  logistics_net_xof bigint NOT NULL CHECK (logistics_net_xof >= 0),
  status text NOT NULL,
  delivery_proof_id text,
  payment_id text,
  created_at timestamptz NOT NULL,
  delivered_at timestamptz,
  reconciled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_payments (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES mbambulaan.commercial_orders(id),
  payer_organization_id text NOT NULL,
  amount_xof bigint NOT NULL CHECK (amount_xof > 0),
  provider text NOT NULL,
  provider_reference text,
  status text NOT NULL CHECK (status IN ('requested','confirmed')),
  requested_at timestamptz NOT NULL,
  confirmed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_commercial_payment_confirmed_reference
  ON mbambulaan.commercial_payments(provider, provider_reference)
  WHERE provider_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_ledger_entries (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES mbambulaan.commercial_orders(id),
  beneficiary_type text NOT NULL CHECK (beneficiary_type IN ('seller','logistics','platform')),
  beneficiary_id text NOT NULL,
  amount_xof bigint NOT NULL CHECK (amount_xof >= 0),
  status text NOT NULL CHECK (status IN ('payable','settled')),
  settled_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_commercial_ledger_beneficiary
  ON mbambulaan.commercial_ledger_entries(order_id, beneficiary_type, beneficiary_id);

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_disputes (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES mbambulaan.commercial_orders(id),
  opened_by_organization_id text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL CHECK (status IN ('open','resolved')),
  resolution text,
  opened_at timestamptz NOT NULL,
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS ix_commercial_orders_territory_status
  ON mbambulaan.commercial_orders(territory_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_commercial_payments_order
  ON mbambulaan.commercial_payments(order_id, status);
CREATE INDEX IF NOT EXISTS ix_commercial_disputes_open
  ON mbambulaan.commercial_disputes(order_id, opened_at DESC)
  WHERE status = 'open';

CREATE TABLE IF NOT EXISTS mbambulaan.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO mbambulaan.schema_migrations(version)
VALUES ('0011')
ON CONFLICT (version) DO NOTHING;

COMMIT;
