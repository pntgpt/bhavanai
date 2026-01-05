-- Migration: Add affiliate commission tracking for service purchases
-- Date: 2026-01-05
-- Description: Adds tables for tracking affiliate commissions on service purchases

-- Create affiliate commission configuration table
CREATE TABLE IF NOT EXISTS affiliate_commission_config (
  id TEXT PRIMARY KEY,
  service_category TEXT NOT NULL CHECK(service_category IN ('ca', 'legal', 'other', 'default')),
  commission_type TEXT NOT NULL CHECK(commission_type IN ('percentage', 'fixed')),
  commission_value REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(service_category)
);

-- Create affiliate commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  service_request_id TEXT NOT NULL,
  commission_amount REAL NOT NULL,
  commission_currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'paid', 'cancelled')),
  service_amount REAL NOT NULL,
  service_currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_service_request ON affiliate_commissions(service_request_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_created ON affiliate_commissions(created_at);

-- Seed default commission configuration (10% for all services)
INSERT INTO affiliate_commission_config (id, service_category, commission_type, commission_value, currency, is_active, created_at, updated_at)
VALUES (
  'default-commission',
  'default',
  'percentage',
  10.0,
  'INR',
  1,
  unixepoch(),
  unixepoch()
)
ON CONFLICT(service_category) DO NOTHING;

-- Seed CA services commission (15%)
INSERT INTO affiliate_commission_config (id, service_category, commission_type, commission_value, currency, is_active, created_at, updated_at)
VALUES (
  'ca-commission',
  'ca',
  'percentage',
  15.0,
  'INR',
  1,
  unixepoch(),
  unixepoch()
)
ON CONFLICT(service_category) DO NOTHING;

-- Seed Legal services commission (12%)
INSERT INTO affiliate_commission_config (id, service_category, commission_type, commission_value, currency, is_active, created_at, updated_at)
VALUES (
  'legal-commission',
  'legal',
  'percentage',
  12.0,
  'INR',
  1,
  unixepoch(),
  unixepoch()
)
ON CONFLICT(service_category) DO NOTHING;
