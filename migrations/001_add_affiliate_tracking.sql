-- Migration: Add affiliate tracking tables
-- Date: 2026-01-03
-- Description: Adds affiliates and tracking_events tables for affiliate tracking system

-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create tracking events table
CREATE TABLE IF NOT EXISTS tracking_events (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_tracking_events_affiliate ON tracking_events(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_type ON tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_user ON tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created ON tracking_events(created_at);

-- Seed NO_AFFILIATE_ID affiliate for tracking events without affiliate attribution
INSERT INTO affiliates (id, name, description, status, created_at, updated_at)
VALUES (
  'NO_AFFILIATE_ID',
  'No Affiliate',
  'Default affiliate for organic traffic and events without affiliate attribution',
  'active',
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO NOTHING;
