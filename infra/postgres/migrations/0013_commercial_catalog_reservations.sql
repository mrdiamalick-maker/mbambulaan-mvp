BEGIN;

CREATE SCHEMA IF NOT EXISTS mbambulaan;

CREATE TABLE IF NOT EXISTS mbambulaan.catalog_offers (
  id text PRIMARY KEY,
  seller_organization_id text NOT NULL,
  territory_id text NOT NULL,
  species_code text NOT NULL,
  quality_grade text NOT NULL,
  landing_site_id text NOT NULL,
  available_quantity_kg numeric(14,3) NOT NULL CHECK (available_quantity_kg >= 0),
  reserved_quantity_kg numeric(14,3) NOT NULL DEFAULT 0 CHECK (reserved_quantity_kg >= 0),
  unit_price_xof bigint NOT NULL CHECK (unit_price_xof > 0),
  minimum_order_kg numeric(14,3) NOT NULL CHECK (minimum_order_kg > 0),
  available_from timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('draft','published','suspended','sold_out','expired')),
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (reserved_quantity_kg <= available_quantity_kg),
  CHECK (expires_at > available_from)
);

CREATE TABLE IF NOT EXISTS mbambulaan.catalog_logistics_options (
  id text PRIMARY KEY,
  operator_organization_id text NOT NULL,
  territory_ids jsonb NOT NULL,
  price_per_kg_xof bigint NOT NULL CHECK (price_per_kg_xof >= 0),
  minimum_fee_xof bigint NOT NULL CHECK (minimum_fee_xof >= 0),
  estimated_hours integer NOT NULL CHECK (estimated_hours > 0),
  cold_chain boolean NOT NULL,
  active boolean NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.catalog_reservations (
  id text PRIMARY KEY,
  offer_id text NOT NULL REFERENCES mbambulaan.catalog_offers(id),
  buyer_organization_id text NOT NULL,
  quantity_kg numeric(14,3) NOT NULL CHECK (quantity_kg > 0),
  logistics_option_id text NOT NULL REFERENCES mbambulaan.catalog_logistics_options(id),
  seafood_amount_xof bigint NOT NULL CHECK (seafood_amount_xof >= 0),
  logistics_amount_xof bigint NOT NULL CHECK (logistics_amount_xof >= 0),
  platform_commission_xof bigint NOT NULL CHECK (platform_commission_xof >= 0),
  total_amount_xof bigint NOT NULL CHECK (total_amount_xof >= 0),
  status text NOT NULL CHECK (status IN ('active','confirmed','cancelled','expired')),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  confirmed_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS ix_catalog_offers_available
  ON mbambulaan.catalog_offers(territory_id, species_code, quality_grade, expires_at)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS ix_catalog_reservations_active
  ON mbambulaan.catalog_reservations(offer_id, expires_at)
  WHERE status = 'active';

INSERT INTO mbambulaan.schema_migrations(version, checksum_sha256, applied_by)
VALUES ('0013', '18303683dba5587003399c2103c2cbd8448bed6601514d9ea159a5af102e1310', 'mbambulaan-migration-runner')
ON CONFLICT (version) DO NOTHING;

COMMIT;
