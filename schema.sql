-- Bhavan.ai Database Schema for Cloudflare D1
-- This schema supports user authentication, property management, and session handling

-- Users table: stores all system users (admin, broker, CA, lawyer)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL, -- bcrypt hashed password
  role TEXT NOT NULL CHECK(role IN ('admin', 'broker', 'ca', 'lawyer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'inactive')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Properties table: stores property listings created by brokers
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price REAL NOT NULL,
  co_owner_count INTEGER NOT NULL CHECK(co_owner_count >= 2 AND co_owner_count <= 5),
  images TEXT NOT NULL, -- JSON array of R2 URLs
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  broker_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (broker_id) REFERENCES users(id)
);

-- Sessions table: stores authentication sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Affiliates table: stores affiliate partners for tracking
CREATE TABLE affiliates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Tracking events table: stores user actions attributed to affiliates
CREATE TABLE tracking_events (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('signup', 'property_contact', 'payment')),
  user_id TEXT,
  property_id TEXT,
  metadata TEXT, -- JSON field for extensibility
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Services table: stores available professional services (CA, Legal, etc.)
CREATE TABLE services (
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

-- Service tiers table: stores pricing tiers for services
CREATE TABLE service_tiers (
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

-- Service requests table: stores customer service purchase requests
CREATE TABLE service_requests (
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

-- Service request status history table: tracks status changes
CREATE TABLE service_request_status_history (
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

-- Payment gateway configuration table: stores payment provider settings
CREATE TABLE payment_gateway_config (
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

-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_properties_broker ON properties(broker_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_tracking_events_affiliate ON tracking_events(affiliate_id);
CREATE INDEX idx_tracking_events_type ON tracking_events(event_type);
CREATE INDEX idx_tracking_events_user ON tracking_events(user_id);
CREATE INDEX idx_tracking_events_created ON tracking_events(created_at);
CREATE INDEX idx_service_tiers_service ON service_tiers(service_id);
CREATE INDEX idx_service_requests_reference ON service_requests(reference_number);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_customer_email ON service_requests(customer_email);
CREATE INDEX idx_service_requests_affiliate ON service_requests(affiliate_id);
CREATE INDEX idx_service_requests_created ON service_requests(created_at);
CREATE INDEX idx_service_requests_payment_status ON service_requests(payment_status);
CREATE INDEX idx_service_requests_assigned_provider ON service_requests(assigned_provider_id);
CREATE INDEX idx_status_history_request ON service_request_status_history(service_request_id);
CREATE INDEX idx_status_history_created ON service_request_status_history(created_at);
