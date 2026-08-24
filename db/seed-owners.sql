-- ============================================================
-- NAWA-VAULT v2: Drizzle Schema Push Migration
-- Jalankan SETELAH migration.sql (hard reset)
-- Atau gunakan: npx drizzle-kit push
-- ============================================================

-- Verifikasi struktur setelah push:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Seed default owner instance jika belum ada
INSERT INTO owner_instances (code, name) VALUES ('TU', 'Tata Usaha') ON CONFLICT (code) DO NOTHING;
INSERT INTO owner_instances (code, name) VALUES ('PE', 'Pengurus Ekskul') ON CONFLICT (code) DO NOTHING;
INSERT INTO owner_instances (code, name) VALUES ('LIT', 'Literasi & Media') ON CONFLICT (code) DO NOTHING;
INSERT INTO owner_instances (code, name) VALUES ('TECH', 'Tim Teknisi') ON CONFLICT (code) DO NOTHING;
INSERT INTO owner_instances (code, name) VALUES ('LOG', 'Logistik') ON CONFLICT (code) DO NOTHING;
