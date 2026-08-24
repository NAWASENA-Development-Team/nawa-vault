-- ============================================================
-- NAWA-VAULT v2: Schema Migration (Hard Reset)
-- Jalankan di Neon Console / psql — DROP & RECREATE
-- ============================================================

-- Drop all tables (order matters for FK)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS owner_instances CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ── 1. Owner Instances (Divisi / Unit kepemilikan) ─────────────────────────
CREATE TABLE owner_instances (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,   -- ex: TU, PE, LIT
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Seed awal
INSERT INTO owner_instances (code, name) VALUES
  ('TU',   'Tata Usaha'),
  ('PE',   'Pengurus Ekskul'),
  ('LIT',  'Literasi & Media'),
  ('TECH', 'Tim Teknisi'),
  ('LOG',  'Logistik');

-- ── 2. Categories (3-level tree) ───────────────────────────────────────────
--  level 1 = TYPE         → single letter   (E, F, L)
--  level 2 = KATEGORI     → 2 letters       (EA, EP, FF, LL, LE)
--  level 3 = SUBKATEGORI  → 3 letters       (EAS, EAD, EAK, EPS, EPL, EPD, EPA, FFA, FFP, LLT, LLP, LED)
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(10)  NOT NULL UNIQUE,  -- prefix used in asset ID
  level       INTEGER      NOT NULL DEFAULT 1 CHECK (level IN (1,2,3)),
  parent_id   INTEGER REFERENCES categories(id),
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Seed hierarki kategori
-- LEVEL 1: Types
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Elektronik',              'E',  1, NULL, 'Semua perangkat elektronik dan perkabelan'),
  ('Furniture & Rak',         'F',  1, NULL, 'Furniture panggung dan pendukung stage'),
  ('Lapangan/Outdoor & Events','L', 1, NULL, 'Perlengkapan outdoor dan dekorasi events');

-- LEVEL 2: Kategori (parent = level 1)
-- Under E
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Alat Elektronik', 'EA', 2, (SELECT id FROM categories WHERE code='E'), 'Hardware elektronik aktif'),
  ('Perkabelan',      'EP', 2, (SELECT id FROM categories WHERE code='E'), 'Semua jenis kabel dan konverter');

-- Under F
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Furniture Stage', 'FF', 2, (SELECT id FROM categories WHERE code='F'), 'Furniture dan perlengkapan panggung');

-- Under L
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Lapangan',        'LL', 2, (SELECT id FROM categories WHERE code='L'), 'Peralatan outdoor/lapangan'),
  ('Events',          'LE', 2, (SELECT id FROM categories WHERE code='L'), 'Perlengkapan dekorasi events');

-- LEVEL 3: Subkategori (leaf nodes used in asset ID generation)
-- Under EA (Alat Elektronik)
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Soundsystem/Audio', 'EAS', 3, (SELECT id FROM categories WHERE code='EA'), 'Speaker, amplifier, mixer, mic'),
  ('Display/Visual',    'EAD', 3, (SELECT id FROM categories WHERE code='EA'), 'Proyektor, monitor, LED display'),
  ('Komputer',          'EAK', 3, (SELECT id FROM categories WHERE code='EA'), 'Laptop, PC, tablet, aksesoris komputer');

-- Under EP (Perkabelan)
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Kabel Soundsystem',     'EPS', 3, (SELECT id FROM categories WHERE code='EP'), 'XLR, TRS, TS, RCA, speakon'),
  ('Kabel Listrik/Power',   'EPL', 3, (SELECT id FROM categories WHERE code='EP'), 'Kabel power, extension, terminal'),
  ('Kabel Display/Data',    'EPD', 3, (SELECT id FROM categories WHERE code='EP'), 'HDMI, VGA, DisplayPort, USB'),
  ('Adapter/Converter',     'EPA', 3, (SELECT id FROM categories WHERE code='EP'), 'Converter, splitter, hub');

-- Under FF (Furniture Stage)
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Audio/Stage Stand',     'FFA', 3, (SELECT id FROM categories WHERE code='FF'), 'Stand mic, stand speaker, tripod'),
  ('Panggung/Logistik',     'FFP', 3, (SELECT id FROM categories WHERE code='FF'), 'Podium, kursi, meja stage, box');

-- Under LL (Lapangan)
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Tenda',    'LLT', 3, (SELECT id FROM categories WHERE code='LL'), 'Tenda event, tenda pameran'),
  ('Perkakas', 'LLP', 3, (SELECT id FROM categories WHERE code='LL'), 'Alat perkakas outdoor');

-- Under LE (Events)
INSERT INTO categories (name, code, level, parent_id, description) VALUES
  ('Dekorasi', 'LED', 3, (SELECT id FROM categories WHERE code='LE'), 'Dekorasi event, backdrop, banner');

-- ── 3. Users ───────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) DEFAULT 'member',   -- admin | operator | member
  class         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── 4. Assets ──────────────────────────────────────────────────────────────
CREATE TABLE assets (
  id                SERIAL PRIMARY KEY,
  asset_id          VARCHAR(40) UNIQUE NOT NULL,   -- format: [CODE][NNNN]/[OWNER]  e.g. EAS0001/TU
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  category_id       INTEGER REFERENCES categories(id),
  owner_instance_id INTEGER REFERENCES owner_instances(id),
  status            VARCHAR(20) DEFAULT 'available',   -- available | borrowed | maintenance | lost
  condition         VARCHAR(20) DEFAULT 'good',        -- good | fair | damaged
  quantity          INTEGER DEFAULT 1,
  location          VARCHAR(100),
  base_location     VARCHAR(100),
  image_url         TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ── 5. Loans ───────────────────────────────────────────────────────────────
CREATE TABLE loans (
  id               SERIAL PRIMARY KEY,
  loan_code        VARCHAR(30) UNIQUE NOT NULL,
  asset_id         INTEGER REFERENCES assets(id),
  borrower_name    VARCHAR(100) NOT NULL,
  borrower_class   VARCHAR(30),
  borrower_contact VARCHAR(50),
  operator_id      INTEGER REFERENCES users(id),
  purpose          TEXT,
  loan_date        TIMESTAMP DEFAULT NOW(),
  due_date         TIMESTAMP NOT NULL,
  return_date      TIMESTAMP,
  status           VARCHAR(20) DEFAULT 'active',   -- active | returned | overdue
  return_condition VARCHAR(20),
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ── 6. Audit Logs ──────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  action      VARCHAR(50) NOT NULL,
  entity_type VARCHAR(30),
  entity_id   INTEGER,
  actor_id    INTEGER REFERENCES users(id),
  details     JSONB,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Indexes for performance ────────────────────────────────────────────────
CREATE INDEX idx_assets_status        ON assets(status);
CREATE INDEX idx_assets_category_id   ON assets(category_id);
CREATE INDEX idx_assets_owner_id      ON assets(owner_instance_id);
CREATE INDEX idx_loans_asset_id       ON loans(asset_id);
CREATE INDEX idx_loans_status         ON loans(status);
CREATE INDEX idx_loans_due_date       ON loans(due_date);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level     ON categories(level);
CREATE INDEX idx_audit_entity         ON audit_logs(entity_type, entity_id);
