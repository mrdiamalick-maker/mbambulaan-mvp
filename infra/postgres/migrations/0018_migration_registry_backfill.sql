BEGIN;

INSERT INTO mbambulaan.schema_migrations(version, checksum_sha256, applied_by)
VALUES
  ('0001', 'c1b8a506da2266e766fd1d4de0a4b18c6f98ca86f78116c712e9c592abd84461', 'mbambulaan-legacy-backfill'),
  ('0002', '0591f0d783b18b87eda78c593bebea8ebb594e406133f120d66b8dafa51ad592', 'mbambulaan-legacy-backfill'),
  ('0003', '8d626596eb2e2924c7ef42873f897e2a2e4885364a876eb0403b851d66bf2edf', 'mbambulaan-legacy-backfill'),
  ('0004', '655bdba8ae58edd7c3cc59f2b386293bda4e52292aacf449d40725f492833ed3', 'mbambulaan-legacy-backfill'),
  ('0005', 'f2f9f285a140766432bca0854f2490b37b72aa08d51f17e654b19c7a01f19d5e', 'mbambulaan-legacy-backfill'),
  ('0006', '98a168fa3790e094552a722b2e55e5d5ad07dd6d85c7241d4f02e15a6dd2bd88', 'mbambulaan-legacy-backfill'),
  ('0008', '6c47f17605e65ef6c2621f8bdd1d547af71a0a1f6b4b6e0d2c2f42909ddf6620', 'mbambulaan-legacy-backfill'),
  ('0009', 'f992765f0b2638194c3a3c08154aa581499c6a91fb3d6d7f1e373d539edebfcd', 'mbambulaan-legacy-backfill'),
  ('0010', 'cb07bd9cf95c9ed18b53b40c5d1b7a8093228697855b200c684cf5ddc0a456d6', 'mbambulaan-legacy-backfill'),
  ('0018', 'a57edb86870b1f67de084c29e1a985cec4ec35b639298f553ecb91909ba83fc4', 'mbambulaan-migration-runner')
ON CONFLICT (version) DO NOTHING;

COMMIT;
