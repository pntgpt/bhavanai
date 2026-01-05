-- Migration: Add service purchase flow tables
-- Date: 2026-01-05
-- Description: Adds tables for service purchase flow including services, service tiers,
--              service requests, status history, and payment gateway configuration

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('ca', 'legal', 'other')),
  base_price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  features TEXT NOT NULL, -- JSON array
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create service tiers table
CREATE TABLE IF NOT EXISTS service_tiers (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  features TEXT NOT NULL, -- JSON array
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Create service requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  service_tier_id TEXT,
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_requirements TEXT NOT NULL,
  
  -- Payment Information
  payment_transaction_id TEXT,
  payment_gateway TEXT NOT NULL,
  payment_amount REAL NOT NULL,
  payment_currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_completed_at INTEGER,
  
  -- Request Status
  status TEXT NOT NULL DEFAULT 'pending_contact' CHECK(status IN (
    'payment_confirmed',
    'pending_contact',
    'team_assigned',
    'in_progress',
    'completed',
    'cancelled'
  )),
  assigned_provider_id TEXT,
  
  -- Affiliate Tracking
  affiliate_code TEXT,
  affiliate_id TEXT,
  
  -- Metadata
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (service_tier_id) REFERENCES service_tiers(id),
  FOREIGN KEY (assigned_provider_id) REFERENCES users(id),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
);

-- Create service request status history table
CREATE TABLE IF NOT EXISTS service_request_status_history (
  id TEXT PRIMARY KEY,
  service_request_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

-- Create payment gateway configuration table
CREATE TABLE IF NOT EXISTS payment_gateway_config (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE CHECK(provider IN ('razorpay', 'stripe', 'paypal')),
  is_active INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER NOT NULL DEFAULT 0,
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  webhook_secret_encrypted TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'test' CHECK(mode IN ('test', 'live')),
  config_json TEXT, -- Additional provider-specific config
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_tiers_service ON service_tiers(service_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_reference ON service_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_email ON service_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_service_requests_affiliate ON service_requests(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_created ON service_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_service_requests_payment_status ON service_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_provider ON service_requests(assigned_provider_id);
CREATE INDEX IF NOT EXISTS idx_status_history_request ON service_request_status_history(service_request_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created ON service_request_status_history(created_at);

