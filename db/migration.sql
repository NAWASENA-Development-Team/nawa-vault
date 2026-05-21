-- ============================================
-- NAWA-VAULT: Full Database Migration
-- Jalankan SQL ini di Neon Console (SQL Editor)
-- ============================================

-- 1. Tabel Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  prefix VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabel Assets
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_id VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  status VARCHAR(20) DEFAULT 'available',
  condition VARCHAR(20) DEFAULT 'good',
  quantity INTEGER DEFAULT 1,
  location VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'member',
  class VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabel Loans
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  loan_code VARCHAR(30) UNIQUE NOT NULL,
  asset_id INTEGER REFERENCES assets(id),
  borrower_name VARCHAR(100) NOT NULL,
  borrower_class VARCHAR(30),
  borrower_contact VARCHAR(50),
  operator_id INTEGER REFERENCES users(id),
  purpose TEXT,
  loan_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP NOT NULL,
  return_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  return_condition VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabel Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(30),
  entity_id INTEGER,
  actor_id INTEGER REFERENCES users(id),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
