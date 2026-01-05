-- Migration: Seed initial services (CA and Legal)
-- Date: 2026-01-05
-- Description: Seeds the database with initial CA and Legal services

-- Insert CA Service
INSERT INTO services (
  id,
  name,
  description,
  short_description,
  category,
  base_price,
  currency,
  features,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'service_ca_001',
  'Chartered Accountant Services',
  'Professional CA services for property transactions, tax planning, and financial compliance. Our experienced chartered accountants provide comprehensive support for all your property-related financial needs, ensuring compliance with tax regulations and optimal financial structuring.',
  'Expert CA services for property transactions and tax planning',
  'ca',
  15000.00,
  'INR',
  '["Tax planning and compliance", "Property transaction support", "Financial structuring advice", "GST and stamp duty guidance", "Capital gains tax optimization", "Documentation review"]',
  1,
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO NOTHING;

-- Insert CA Service Tiers
INSERT INTO service_tiers (
  id,
  service_id,
  name,
  price,
  features,
  sort_order,
  is_active,
  created_at
)
VALUES 
(
  'tier_ca_basic',
  'service_ca_001',
  'Basic Consultation',
  15000.00,
  '["Initial consultation (1 hour)", "Tax planning overview", "Document review", "Email support for 7 days"]',
  1,
  1,
  unixepoch()
),
(
  'tier_ca_standard',
  'service_ca_001',
  'Standard Package',
  35000.00,
  '["Comprehensive consultation (3 hours)", "Detailed tax planning", "Complete documentation review", "GST and stamp duty calculation", "Email and phone support for 30 days", "One follow-up session"]',
  2,
  1,
  unixepoch()
),
(
  'tier_ca_premium',
  'service_ca_001',
  'Premium Package',
  75000.00,
  '["Unlimited consultations for 90 days", "End-to-end transaction support", "Tax optimization strategies", "Complete compliance management", "Priority phone and email support", "Quarterly review meetings", "Capital gains tax filing assistance"]',
  3,
  1,
  unixepoch()
)
ON CONFLICT(id) DO NOTHING;

-- Insert Legal Service
INSERT INTO services (
  id,
  name,
  description,
  short_description,
  category,
  base_price,
  currency,
  features,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'service_legal_001',
  'Legal Services for Property',
  'Comprehensive legal services for property co-ownership, including agreement drafting, title verification, and legal compliance. Our experienced property lawyers ensure your co-ownership arrangement is legally sound and protects all parties involved.',
  'Expert legal services for property co-ownership and transactions',
  'legal',
  25000.00,
  'INR',
  '["Co-ownership agreement drafting", "Title verification and due diligence", "Legal compliance review", "Contract negotiation support", "Dispute resolution guidance", "Registration assistance"]',
  1,
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO NOTHING;

-- Insert Legal Service Tiers
INSERT INTO service_tiers (
  id,
  service_id,
  name,
  price,
  features,
  sort_order,
  is_active,
  created_at
)
VALUES 
(
  'tier_legal_basic',
  'service_legal_001',
  'Basic Legal Review',
  25000.00,
  '["Document review (up to 10 pages)", "Basic title verification", "Legal consultation (1 hour)", "Email support for 7 days"]',
  1,
  1,
  unixepoch()
),
(
  'tier_legal_standard',
  'service_legal_001',
  'Standard Legal Package',
  50000.00,
  '["Co-ownership agreement drafting", "Comprehensive title verification", "Legal consultation (3 hours)", "Contract review and negotiation", "Email and phone support for 30 days", "Registration guidance"]',
  2,
  1,
  unixepoch()
),
(
  'tier_legal_premium',
  'service_legal_001',
  'Premium Legal Package',
  100000.00,
  '["Complete legal documentation", "Full due diligence and title search", "Unlimited consultations for 90 days", "End-to-end transaction support", "Dispute resolution assistance", "Priority support", "Court representation if needed", "Post-transaction support for 6 months"]',
  3,
  1,
  unixepoch()
)
ON CONFLICT(id) DO NOTHING;

