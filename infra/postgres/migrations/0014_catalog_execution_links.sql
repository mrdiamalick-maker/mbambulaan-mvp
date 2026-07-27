BEGIN;

CREATE SCHEMA IF NOT EXISTS mbambulaan;

CREATE TABLE IF NOT EXISTS mbambulaan.catalog_execution_links (
  reservation_id text PRIMARY KEY,
  catalog_offer_id text NOT NULL,
  execution_offer_id text NOT NULL UNIQUE,
  order_id text NOT NULL UNIQUE,
  seller_organization_id text NOT NULL,
  buyer_organization_id text NOT NULL,
  logistics_organization_id text NOT NULL,
  logistics_option_id text NOT NULL,
  territory_id text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_catalog_execution_links_logistics
  ON mbambulaan.catalog_execution_links(logistics_organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_catalog_execution_links_buyer
  ON mbambulaan.catalog_execution_links(buyer_organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS mbambulaan.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO mbambulaan.schema_migrations(version)
VALUES ('0014')
ON CONFLICT (version) DO NOTHING;

COMMIT;
