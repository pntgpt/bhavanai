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
